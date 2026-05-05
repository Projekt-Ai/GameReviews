import crypto from 'crypto';
import pool from '../db.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function adminRoutes(fastify) {
    let adminToken = null;

    fastify.addHook('preHandler', async (request, reply) => {
        const url = request.url.split('?')[0];
        if (url === '/admin/login' || url === '/admin' || url === '/admin/') return;

        const cookie = request.cookies['admin_token'];

        if (!cookie || cookie !== adminToken) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });

    fastify.get('/', async (_request, reply) => {
        reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        return reply.sendFile('admin.html');
    });

    fastify.post('/login', { config: { rateLimit: { max: 10, timeWindow: '15m' } } }, async (request, reply) => {
        const password = request.body?.password;

        if (password === process.env.ADMIN_PASS) {
            adminToken = crypto.randomBytes(32).toString('hex');
            reply.setCookie('admin_token', adminToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 60 // 1 hour
            });
            return reply.send({ success: true });
        } else {
            return reply.status(401).send({ error: 'Invalid password' });
        }
    });

    fastify.post('/logout', async (_request, reply) => {
        adminToken = null;
        reply.clearCookie('admin_token');
        return reply.send({ success: true });
    });

    fastify.get('/comments', async (request, reply) => {
        const { status } = request.query;
        let query, params;
        if (status === 'all') {
            query = `Select id, review_id, name, body, approved, is_author, contains_spoiler, created_at From comments Order By created_at Asc`;
            params = [];
        } else {
            query = `Select id, review_id, name, body, is_author, contains_spoiler, created_at From comments Where approved = $1 Order By created_at Asc`;
            params = [false];
        }
        const { rows } = await pool.query(query, params);
        reply.send(rows);
    });

    fastify.patch('/comments/:id/approve', async (request, reply) => {
        const { id } = request.params;
        const { rowCount } = await pool.query(
            `Update comments Set approved = $1 Where id = $2`,
            [true, id]
        );
        if (rowCount === 0) return reply.status(404).send({ error: 'Not found' });
        reply.send({ success: true });
    });

    fastify.patch('/comments/:id/spoiler', async (request, reply) => {
        const { id } = request.params;
        const { rows } = await pool.query(
            `Update comments Set contains_spoiler = Not contains_spoiler Where id = $1 Returning contains_spoiler`,
            [id]
        );
        if (rows.length === 0) return reply.status(404).send({ error: 'Not found' });
        reply.send({ success: true, contains_spoiler: rows[0].contains_spoiler });
    });

    fastify.patch('/comments/:id/author', async (request, reply) => {
        const { id } = request.params;
        const { rows } = await pool.query(
            `Update comments Set is_author = Not is_author Where id = $1 Returning is_author`,
            [id]
        );
        if (rows.length === 0) return reply.status(404).send({ error: 'Not found' });
        reply.send({ success: true, is_author: rows[0].is_author });
    });

    fastify.patch('/comments/:id', async (request, reply) => {
        const { id } = request.params;
        const { body } = request.body;
        if (!body || !body.trim()) return reply.status(400).send({ error: 'Body is required' });
        const { rowCount } = await pool.query(
            `Update comments Set body = $1 Where id = $2`,
            [body.trim(), id]
        );
        if (rowCount === 0) return reply.status(404).send({ error: 'Not found' });
        reply.send({ success: true });
    });

    fastify.post('/comments/approve-all', async (_request, reply) => {
        const { rowCount } = await pool.query(
            `Update comments Set approved = true Where approved = false`
        );
        reply.send({ success: true, count: rowCount });
    });

    fastify.delete('/comments/:id', async (request, reply) => {
        const { id } = request.params;
        await pool.query(
            `Delete From comments Where id = $1`,
            [id]
        );
        reply.send({ success: true });
    });

    fastify.post('/notify', async (request, reply) => {
        const { title, url, blurb } = request.body;
        if (!title || !url) return reply.status(400).send({ error: 'title and url are required' });

        const { rowCount: inserted } = await pool.query(
            `INSERT INTO notifications (url, title) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [url, title]
        );
        if (inserted === 0) return reply.status(409).send({ error: `Already notified for ${url}` });

        const { rows } = await pool.query(
            `SELECT email, token FROM subs WHERE confirmed = true AND unsubscribed = false`
        );
        if (rows.length === 0) return reply.send({ success: true, sent: 0 });

        const articleUrl = `${process.env.SITE_URL}${url}`;

        await Promise.all(rows.map(({ email, token }) => {
            const unsubLink = `${process.env.API_URL}/subscribe/unsubscribe?token=${token}`;
            return resend.emails.send({
                from: 'Kat Kronicles <kat@katkronicles.com>',
                to: email,
                subject: `New post: ${title}`,
                html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0820;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0820;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr>
          <td style="background:#120a2a;border:1px solid rgba(190,173,229,0.14);border-radius:2px;padding:40px 36px;">
            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#ff4fa3;">New from Kat's Kronicles</p>
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;font-weight:700;color:#e3dbf1;line-height:1.3;">${title}</h1>
            ${blurb ? `<p style="margin:0 0 24px;font-size:14px;color:rgba(226,217,243,0.65);line-height:1.7;">${blurb}</p>` : ''}
            <a href="${articleUrl}" style="display:inline-block;padding:12px 28px;background:#ff4fa3;color:#fff;font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;border-radius:2px;">Read Now</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(226,217,243,0.2);">katkronicles.com &middot; Personal game writing by Kat</p>
            <a href="${unsubLink}" style="font-size:10px;color:rgba(226,217,243,0.2);">Unsubscribe</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
            });
        }));

        reply.send({ success: true, sent: rows.length });
    });
}
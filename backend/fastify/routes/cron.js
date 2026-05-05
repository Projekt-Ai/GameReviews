import pool from '../db.js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function cronRoutes(fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        const auth = request.headers['authorization'];
        if (!auth || auth !== `Bearer ${process.env.CRON_SECRET}`) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });

    fastify.post('/send-pending', async (_request, reply) => {
        const res = await fetch(`${process.env.SITE_URL}/api/articles.json`);
        if (!res.ok) return reply.status(502).send({ error: 'Failed to fetch articles' });

        const articles = await res.json();

        const { rows: sent } = await pool.query(`SELECT url FROM notifications`);
        const sentUrls = new Set(sent.map(r => r.url));

        const pending = articles.filter(a => !sentUrls.has(a.url));
        if (pending.length === 0) return reply.send({ sent: 0 });

        const { rows: subscribers } = await pool.query(
            `SELECT email, token FROM subs WHERE confirmed = true AND unsubscribed = false`
        );

        // Log all pending articles to notifications regardless of subscriber count
        for (const article of pending) {
            await pool.query(
                `INSERT INTO notifications (url, title) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [article.url, article.title]
            );
        }

        if (subscribers.length === 0) return reply.send({ sent: 0 });

        // Build subject line
        const subject = pending.length === 1
            ? `New post: ${pending[0].title}`
            : `New post: ${pending[0].title} & ${pending.length - 1} other${pending.length > 2 ? 's' : ''}`;

        // Build article list HTML
        const articlesHtml = pending.map(article => {
            const articleUrl = `${process.env.SITE_URL}${article.url}`;
            return `
            <tr>
              <td style="padding:20px 0;border-bottom:1px solid rgba(190,173,229,0.1);">
                <h2 style="margin:0 0 4px;font-family:Georgia,serif;font-size:17px;font-weight:700;color:#e3dbf1;line-height:1.3;">
                  <a href="${articleUrl}" style="color:#e3dbf1;text-decoration:none;">${article.title}</a>
                </h2>
                ${article.headline ? `<p style="margin:0 0 8px;font-family:Georgia,serif;font-size:13px;font-style:italic;color:rgba(226,217,243,0.45);">${article.headline}</p>` : ''}
                ${article.blurb ? `<p style="margin:0 0 10px;font-size:13px;color:rgba(226,217,243,0.6);line-height:1.6;">${article.blurb}</p>` : ''}
                <a href="${articleUrl}" style="font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#ff4fa3;text-decoration:none;">Read &rarr;</a>
              </td>
            </tr>`;
        }).join('');

        await Promise.all(subscribers.map(({ email, token }) => {
            const unsubLink = `${process.env.API_URL}/subscribe/unsubscribe?token=${token}`;
            return resend.emails.send({
                from: 'Kat Kronicles <kat@katkronicles.com>',
                to: email,
                subject,
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
            <table width="100%" cellpadding="0" cellspacing="0">
              ${articlesHtml}
            </table>
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

        reply.send({ sent: subscribers.length, articles: pending.length });
    });
}

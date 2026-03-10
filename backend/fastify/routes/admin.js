import crypto from 'crypto';
import pool from '../db.js';

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

    fastify.get('/', async (request, reply) => {
        reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        return reply.sendFile('admin.html');
    });

    fastify.post('/login', async (request, reply) => {
        const password = request.body?.password;
        console.log('Login attempt - body:', JSON.stringify(request.body), 'pw:', password, 'env len:', process.env.ADMIN_PASS?.length);

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

    fastify.post('/logout', async (request, reply) => {
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

    fastify.post('/comments/approve-all', async (request, reply) => {
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
}
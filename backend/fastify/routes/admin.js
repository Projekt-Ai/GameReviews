import crypto from 'crypto';
import pool from '../db.js';

export default async function adminRoutes(fastify) {
    let adminToken = null;

    fastify.addHook('preHandler', async (request, reply) => {
        if (request.url === '/admin/login' || request.url === '/admin') return;

        const cookie = request.cookies['admin_token'];

        if (!cookie || cookie !== adminToken) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });

    fastify.get('/', async (request, reply) => {
        return reply.sendFile('admin.html');
    });

    fastify.post('/login', async (request, reply) => {
        const { password } = request.body;

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
            query = `Select id, review_id, name, body, approved, created_at From comments Order By created_at Asc`;
            params = [];
        } else {
            query = `Select id, review_id, name, body, created_at From comments Where approved = $1 Order By created_at Asc`;
            params = [false];
        }
        const { rows } = await pool.query(query, params);
        reply.send(rows);
    });

    fastify.patch('/comments/:id/approve', async (request, reply) => {
        const { id } = request.params;
        await pool.query(
            `Update comments Set approved = $1 Where id = $2`,
            [true, id]
        );
        reply.send({ success: true });
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
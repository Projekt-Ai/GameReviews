import pool from '../db.js';

export default async function statsRoutes(fastify) {
  fastify.get("/:slug", async (request, reply) => {
    const { slug } = request.params;
    const { rows } = await pool.query(
      `Select views, likes From stats Where slug = $1`,
      [slug]
    );
    reply.send(rows[0] || { views: 0, likes: 0 });
  });

  fastify.post("/:slug/view", { config: { rateLimit: { max: 30, timeWindow: 60000 } } }, async (request, reply) => {
    const { slug } = request.params;
    await pool.query(
      `Insert Into stats (slug, views, likes) Values ($1, 1, 0)
       On Conflict (slug) Do Update Set views = stats.views + 1`,
      [slug]
    );
    reply.send({ ok: true });
  });

  fastify.post("/:slug/like", { config: { rateLimit: { max: 5, timeWindow: 60000 } } }, async (request, reply) => {
    const { slug } = request.params;
    const { rows } = await pool.query(
      `Insert Into stats (slug, views, likes) Values ($1, 0, 1)
       On Conflict (slug) Do Update Set likes = stats.likes + 1
       Returning views, likes`,
      [slug]
    );
    reply.send(rows[0]);
  });

  fastify.post("/:slug/unlike", { config: { rateLimit: { max: 5, timeWindow: 60000 } } }, async (request, reply) => {
    const { slug } = request.params;
    await pool.query(
      `Update stats Set likes = Greatest(0, likes - 1) Where slug = $1`,
      [slug]
    );
    const { rows } = await pool.query(
      `Select views, likes From stats Where slug = $1`,
      [slug]
    );
    reply.send(rows[0] || { views: 0, likes: 0 });
  });
}

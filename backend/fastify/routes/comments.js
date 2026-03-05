import pool from '../db.js';

const commentBody = {
  type: 'object',
  required: ['name', 'body'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 50 },
    body: { type: 'string', minLength: 1, maxLength: 2000 },
  },
};

export default async function commentRoutes(fastify) {
  fastify.get("/:reviewId", async (request, reply) => {
    const { reviewId } = request.params;
    const { rows } = await pool.query(
      `Select * From comments Where review_id = $1 And approved = $2`,
      [reviewId, true]
    );
    reply.send(rows);
  });

  fastify.post("/:reviewId", { schema: { body: commentBody } }, async (request, reply) => {
    const { reviewId } = request.params;
    const { name, body } = request.body;

    await pool.query(
      `Insert Into comments (review_id, name, body)
      Values ($1, $2, $3)`,
      [reviewId, name.trim(), body.trim()]
    );
    reply.status(201).send();
  });

  fastify.post("/:reviewId/reply/:parentId", { schema: { body: commentBody } }, async (request, reply) => {
    const { reviewId, parentId } = request.params;
    const { name, body } = request.body;

    const { rows } = await pool.query(
      `Select id From comments Where id = $1 And parent_id Is Null`,
      [parentId]
    );
    if (rows.length === 0) {
      return reply.status(400).send({ error: 'Parent comment not found or is already a reply.' });
    }

    await pool.query(
      `Insert Into comments (review_id, parent_id, name, body)
      Values ($1, $2, $3, $4)`,
      [reviewId, parentId, name.trim(), body.trim()]
    );
    reply.status(201).send();
  });
}

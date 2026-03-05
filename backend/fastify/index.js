import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import commentRoutes from './routes/comments.js';

const app = Fastify();

app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:4321'
});

await app.register(commentRoutes, { prefix: '/comments' });

app.listen({ port: process.env.PORT || 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
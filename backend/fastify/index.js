import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import commentRoutes from './routes/comments.js';

import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import admin from './routes/admin.js';

import { fileURLToPath } from 'url';
import path from 'path';

const app = Fastify();

app.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:4321'
});

app.register(fastifyCookie);

app.get('/', async (request, reply) => {
  return reply.redirect('/admin');
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

await app.register(commentRoutes, { prefix: '/comments' });
await app.register(admin, { prefix: '/admin' });

app.listen({ port: process.env.PORT || 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});

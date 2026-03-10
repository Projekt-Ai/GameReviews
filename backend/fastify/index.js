import 'dotenv/config';
import Fastify from 'fastify';

process.on('unhandledRejection', (err) => {
  console.log('FATAL unhandledRejection:', err);
  process.exit(1);
});
import cors from '@fastify/cors';
import commentRoutes from './routes/comments.js';
import statsRoutes from './routes/stats.js';

import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import admin from './routes/admin.js';

import pool from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import rateLimit from '@fastify/rate-limit';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Run schema migrations on startup
console.log('Connecting to database...');
const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
await pool.query(schema);
console.log('Database ready.');

const app = Fastify();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4321').split(',').map(o => o.trim());
app.register(cors, {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
});

app.register(fastifyCookie);

app.get('/', async (request, reply) => {
  return reply.redirect('/admin');
});

app.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/public/',
});

await app.register(rateLimit, {
  max: 60,
  timeWindow: 60000
});

await app.register(commentRoutes, { prefix: '/comments' });
await app.register(statsRoutes, { prefix: '/stats' });
await app.register(admin, { prefix: '/admin' });

app.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});

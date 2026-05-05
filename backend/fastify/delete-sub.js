import 'dotenv/config';
import pool from './db.js';
await pool.query("DELETE FROM notifications");
console.log('notifications cleared');
process.exit();

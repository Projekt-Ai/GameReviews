import 'dotenv/config';

const url = `${process.env.API_URL}/cron/send-pending`;
const res = await fetch(url, {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
});
const body = await res.json();
console.log('cron result:', res.status, JSON.stringify(body));
process.exit(res.ok ? 0 : 1);

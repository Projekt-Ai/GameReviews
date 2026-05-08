import 'dotenv/config';

const apiUrl = process.env.API_URL;
const cronSecret = process.env.CRON_SECRET;

if (!apiUrl) { console.error('ERROR: API_URL is not set'); process.exit(1); }
if (!cronSecret) { console.error('ERROR: CRON_SECRET is not set'); process.exit(1); }

const url = `${apiUrl}/cron/send-pending`;
console.log('POST', url);

try {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cronSecret}` },
  });

  const text = await res.text();
  console.log('status:', res.status);
  console.log('body:', text);
  process.exit(res.ok ? 0 : 1);
} catch (err) {
  console.error('fetch error:', err.message);
  process.exit(1);
}

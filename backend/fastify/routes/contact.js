import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function contactRoutes(fastify) {
    fastify.post('/', { config: { rateLimit: { max: 3, timeWindow: '10m' } } }, async (request, reply) => {
        const { firstName, lastName, email, message, website } = request.body;
        const name = `${firstName?.trim() ?? ''} ${lastName?.trim() ?? ''}`.trim();

        if (website) return reply.send({ ok: true });

        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !message?.trim()) {
            return reply.status(400).send({ error: 'All fields are required' });
        }

        if (!email.includes('@')) {
            return reply.status(400).send({ error: 'Invalid email' });
        }

        await resend.emails.send({
            from: 'Kat Kronicles <kat@katkronicles.com>',
            to: 'kat@katkronicles.com',
            replyTo: email,
            subject: `Message from ${name}`,
            html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0d0820;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0820;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr>
          <td style="background:#120a2a;border:1px solid rgba(190,173,229,0.14);border-radius:2px;padding:40px 36px;">
            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#ff4fa3;">New Message</p>
            <h1 style="margin:0 0 4px;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#e3dbf1;">${name}</h1>
            <p style="margin:0 0 24px;font-size:12px;color:rgba(226,217,243,0.4);">${email}</p>
            <p style="margin:0;font-size:14px;color:rgba(226,217,243,0.75);line-height:1.8;white-space:pre-wrap;">${message}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
        });

        reply.send({ ok: true });
    });
}

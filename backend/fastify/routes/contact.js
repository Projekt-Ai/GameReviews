import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function contactRoutes(fastify) {
    fastify.post('/', { config: { rateLimit: { max: 3, timeWindow: '10m' } } }, async (request, reply) => {
        const { firstName, lastName, email, subject, message, website } = request.body;
        const name = `${firstName?.trim() ?? ''} ${lastName?.trim() ?? ''}`.trim();

        if (website) return reply.send({ ok: true });

        if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return reply.status(400).send({ error: 'All fields are required' });
        }

        if (!email.includes('@')) {
            return reply.status(400).send({ error: 'Invalid email' });
        }

        await resend.emails.send({
            from: 'Kat Kronicles <kat@katkronicles.com>',
            to: 'kat@katkronicles.com',
            replyTo: email,
            subject: subject,
            html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0718;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0718;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Header -->
        <tr>
          <td style="background:#ff4fa3;padding:18px 32px;border-radius:2px 2px 0 0;">
            <p style="margin:0;font-family:Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#fff;">Kat's Kronicles &mdash; New Message</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#150d2e;border:1px solid rgba(190,173,229,0.15);border-top:none;border-radius:0 0 2px 2px;padding:32px 32px 28px;">

            <!-- Sender -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="border-left:3px solid #ff4fa3;padding-left:14px;">
                  <p style="margin:0 0 2px;font-family:Georgia,serif;font-size:17px;font-weight:700;color:#e8e0f5;">${name}</p>
                  <p style="margin:0;font-size:12px;color:rgba(226,217,243,0.5);">${email}</p>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="border-top:1px solid rgba(190,173,229,0.12);font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>

            <!-- Message -->
            <p style="margin:0;font-size:15px;color:rgba(232,224,245,0.85);line-height:1.85;white-space:pre-wrap;">${message}</p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 0;text-align:center;">
            <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(226,217,243,0.2);">katkronicles.com &middot; Reply directly to respond to ${name}</p>
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

import pool from '../db.js';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function subscribeRoutes(fastify) {
    fastify.post("/", async (request, reply) => {
        const { email } = request.body;

        if (!email || !email.includes("@")) {
            return reply.status(400).send({ error: "Invalid email" });
        }

        const token = crypto.randomUUID();
        const { rowCount } = await pool.query(
            `Insert Into subs (email, token) Values ($1, $2) On Conflict Do Nothing`,
            [email, token]
        );

        if (rowCount === 0) {
            return reply.send({ ok: true });
        }

        const confirmLink = `${process.env.SITE_URL}/subscribe/confirm?token=${token}`;
        await resend.emails.send({
            from: "Kat Kronicles <kat@katkronicles.com>",
            to: email,
            subject: "Confirm your subscription to Kat's Kronicles",
            html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d0820;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0820;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr>
          <td style="background:#120a2a;border:1px solid rgba(190,173,229,0.14);border-radius:2px;padding:40px 36px;text-align:center;">
            <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#ff4fa3;">Kat's Kronicles</p>
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:24px;font-weight:700;color:#e3dbf1;line-height:1.2;">One click to confirm.</h1>
            <p style="margin:0 0 28px;font-size:14px;color:rgba(226,217,243,0.6);line-height:1.6;">You're almost in. Click the button below to confirm your subscription and start receiving new reviews and boss features.</p>
            <a href="${confirmLink}" style="display:inline-block;padding:12px 28px;background:#ff4fa3;color:#fff;font-family:Georgia,serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;border-radius:2px;">Confirm Subscription</a>
            <p style="margin:28px 0 0;font-size:11px;color:rgba(226,217,243,0.3);line-height:1.5;">If you didn't sign up for this, you can safely ignore this email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 0;text-align:center;">
            <p style="margin:0;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:rgba(226,217,243,0.2);">katkronicles.com &middot; Personal game writing by Kat</p>
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

    fastify.get("/confirm", async (request, reply) => {
        const { token } = request.query;
        const { rows } = await pool.query(
            `Update subs Set confirmed = true Where token = $1 Returning email`,
            [token]
        );

        if (rows.length === 0) {
            return reply.status(404).send({ error: "Token not found" });
        }
        reply.send({ ok: true });
    });

    fastify.get("/unsubscribe", async (request, reply) => {
        const { token } = request.query;

        const { rows } = await pool.query(
            `DELETE FROM subs WHERE token = $1 RETURNING email`,
            [token]
        );
        if (rows.length === 0) {
            return reply.status(404).send({ error: "Token not found" });
        }
        reply.send({ ok: true });
    });


}
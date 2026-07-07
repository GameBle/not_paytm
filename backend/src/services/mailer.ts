import { Resend } from "resend";
import { env } from "../config/env";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

async function sendEmail(
  kind: string,
  to: string,
  subject: string,
  html: string,
  devFallbackLink: string
): Promise<void> {
  const client = getResend();
  if (!client) {
    if (env.NODE_ENV === "production") {
      console.error(
        `[mailer] RESEND_API_KEY is not set — ${kind} email not sent to ${to}`
      );
    } else {
      console.log(`[DEV] ${kind} email for ${to}: ${devFallbackLink}`);
    }
    return;
  }

  const { data, error } = await client.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error(`[mailer] Failed to send ${kind} email to ${to}:`, {
      message: error.message,
      name: error.name,
      from: env.EMAIL_FROM,
    });
    return;
  }

  console.log(`[mailer] ${kind} email sent to ${to}`, { id: data?.id });
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail(
    "verification",
    email,
    "Verify your PayTM account",
    `<p>Click to verify your account:</p><p><a href="${link}">${link}</a></p>`,
    link
  );
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail(
    "password reset",
    email,
    "Reset your PayTM password",
    `<p>Click to reset your password:</p><p><a href="${link}">${link}</a></p>`,
    link
  );
}

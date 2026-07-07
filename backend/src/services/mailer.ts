import { Resend } from "resend";
import { env } from "../config/env";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const client = getResend();
  if (!client) {
    console.log(`[DEV] Verification email for ${email}: ${link}`);
    return;
  }
  await client.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Verify your PayTM account",
    html: `<p>Click to verify your account:</p><p><a href="${link}">${link}</a></p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const link = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const client = getResend();
  if (!client) {
    console.log(`[DEV] Password reset email for ${email}: ${link}`);
    return;
  }
  await client.emails.send({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Reset your PayTM password",
    html: `<p>Click to reset your password:</p><p><a href="${link}">${link}</a></p>`,
  });
}

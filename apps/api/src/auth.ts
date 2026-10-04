import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { createHash } from 'node:crypto';
import type { Pool } from 'pg';

export type AccountConfig = {
  origin: string; secret: string; productName: string;
  resendApiKey?: string; emailFrom?: string; supportEmail?: string;
  development?: boolean; beforeDelete?: (userId: string) => Promise<void>;
};
export type Mail = { to: string; subject: string; text: string; idempotencyKey: string };
export type MailSender = (mail: Mail) => Promise<void>;

/** No message URLs, tokens, recipient addresses or provider responses enter logs. */
export function resendSender(config: AccountConfig): MailSender {
  if (!config.resendApiKey || !config.emailFrom || !config.supportEmail) {
    throw new Error('Transactional email configuration is required');
  }
  return async (mail) => {
    const payload = JSON.stringify({ from: config.emailFrom, to: [mail.to],
      reply_to: config.supportEmail, subject: mail.subject, text: mail.text });
    for (let attempt = 0; attempt < 3; attempt++) {
      let retry = false;
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST', signal: AbortSignal.timeout(10000),
          headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json',
            'Idempotency-Key': mail.idempotencyKey }, body: payload
        });
        if (response.ok) return;
        retry = response.status === 429 || response.status >= 500;
      } catch { retry = true; }
      if (!retry || attempt === 2) throw new Error('Transactional email delivery failed');
      await new Promise(resolve => setTimeout(resolve, 300 * 2 ** attempt));
    }
  };
}

export function createAccountAuth(pool: Pool, config: AccountConfig, testSender?: MailSender) {
  const parsed = new URL(config.origin);
  if (parsed.origin !== config.origin || (parsed.protocol !== 'https:' && !config.development)) {
    throw new Error('APP_ORIGIN must be an exact HTTPS origin');
  }
  if (config.secret.length < 32) throw new Error('Auth secret must contain at least 32 characters');
  if (testSender && !config.development) throw new Error('Test mail sender is prohibited in production');
  const send = testSender ?? resendSender(config);
  const sendLink = async (email: string, url: string, kind: 'verify' | 'reset') => {
    if (new URL(url).origin !== config.origin) throw new Error('Invalid email link origin');
    await send({ to: email,
      subject: `${kind === 'verify' ? 'Verify your email' : 'Reset your password'} for ${config.productName}`,
      text: `${kind === 'verify' ? 'Confirm your email address' : 'Choose a new password'} using this link:\n${url}\n\nThis link expires in 30 minutes. If you did not request this, ignore this email. Contact ${config.supportEmail ?? 'support'} if you need help.`,
      idempotencyKey: createHash('sha256').update(`${kind}:${url}`).digest('hex') });
  };
  return betterAuth({
    database: pool, secret: config.secret, baseURL: config.origin, basePath: '/api/auth',
    trustedOrigins: [config.origin],
    logger: { disabled: true },
    disabledPaths: ['/is-username-available'],
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128,
      requireEmailVerification: true, autoSignIn: false,
      revokeSessionsOnPasswordReset: true, resetPasswordTokenExpiresIn: 1800,
      sendResetPassword: async ({ user, url }) => sendLink(user.email, url, 'reset') },
    emailVerification: { sendOnSignUp: true, sendOnSignIn: true, autoSignInAfterVerification: false,
      expiresIn: 1800, sendVerificationEmail: async ({ user, url }) => sendLink(user.email, url, 'verify') },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, freshAge: 300,
      cookieCache: { enabled: false } },
    user: { deleteUser: { enabled: true, beforeDelete: async user => { await config.beforeDelete?.(user.id); await pool.query('DELETE FROM verification WHERE value=$1 OR identifier=$2', [user.id, user.email]); } } },
    advanced: { useSecureCookies: !config.development,
      defaultCookieAttributes: { httpOnly: true, sameSite: 'lax', secure: !config.development },
      ipAddress: { ipAddressHeaders: ['x-account-client-ip'] } },
    rateLimit: { enabled: true, storage: 'database', window: 60, max: 60,
      customRules: { '/sign-in/email': { window: 60, max: 5 }, '/sign-in/username': { window: 60, max: 5 },
        '/sign-up/email': { window: 3600, max: 5 }, '/request-password-reset': { window: 3600, max: 3 },
        '/send-verification-email': { window: 3600, max: 3 } } },
    plugins: [username({ minUsernameLength: 3, maxUsernameLength: 30,
      usernameValidator: value => /^[a-zA-Z0-9_.]+$/.test(value) })]
  });
}
export type AccountAuth = ReturnType<typeof createAccountAuth>;

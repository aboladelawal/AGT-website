import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// This route must run on-demand (server) so it can read the request body
// and call Resend. Everything else on the site stays static.
export const prerender = false;

// Hosts allowed to POST this form. This is our replacement for Astro's
// built-in checkOrigin (disabled in astro.config.mjs because it false-rejects
// behind Vercel's proxy). Same-origin requests carry an Origin header whose
// host must be in this set; anything else is treated as cross-origin.
const STATIC_ALLOWED = new Set(['agtconsults.com', 'www.agtconsults.com']);

function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin');

  // Browsers send Origin on cross-origin (and modern same-origin) POSTs.
  // If it's genuinely absent (rare for a browser POST), we can't use it as a
  // CSRF signal — allow, since the honeypot + validation still apply.
  if (!origin) return true;

  let host: string;
  try {
    host = new URL(origin).hostname; // strips protocol + port
  } catch {
    return false; // malformed Origin → reject
  }

  if (STATIC_ALLOWED.has(host)) return true;
  if (host === 'localhost' || host === '127.0.0.1') return true; // local dev
  if (host.endsWith('.vercel.app')) return true; // Vercel preview deployments

  // Same-origin fallback: Origin host matches the host the proxy forwarded.
  const forwarded =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (forwarded && host === forwarded.split(':')[0]) return true;

  return false;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  // ── Origin check (CSRF) ───────────────────────────────────
  if (!originAllowed(request)) {
    return new Response('Cross-origin form submissions are not allowed.', {
      status: 403,
    });
  }

  // Progressive-enhancement fetch sends `Accept: application/json` and handles
  // the redirect itself; a plain no-JS form POST gets a 303 to the thank-you page.
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const succeed = () =>
    wantsJson
      ? new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      : redirect('/thank-you.html', 303);

  const form = await request.formData();

  // ── Honeypot ──────────────────────────────────────────────
  // Real users never see or fill "company". If it has a value, it's a bot.
  // Pretend success so we don't tip the bot off.
  const company = (form.get('company') ?? '').toString().trim();
  if (company) {
    return succeed();
  }

  // ── Read fields (each name matches an input in Contact.astro) ──
  const name = (form.get('name') ?? '').toString().trim();
  const email = (form.get('email') ?? '').toString().trim();
  const phone = (form.get('phone') ?? '').toString().trim();
  const project = (form.get('project') ?? '').toString().trim();

  // ── Required-field validation (phone is optional) ─────────
  if (!name || !email || !project) {
    return new Response(
      'Missing required fields. Name, email, and project are all required.',
      { status: 400 },
    );
  }

  // Key is read at runtime: locally from .env (import.meta.env),
  // on Vercel from the dashboard env var (process.env).
  const apiKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set.');
    return new Response(
      'Email is not configured on the server. Please email info@agtconsults.com directly.',
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: 'AGT Site <noreply@agtconsults.com>',
    to: 'info@agtconsults.com',
    replyTo: email,
    subject: `New enquiry from ${name}`,
    text: [
      'New enquiry from the agtconsults.com contact form.',
      '',
      `Name:    ${name}`,
      `Email:   ${email}`,
      `Phone:   ${phone || '—'}`,
      '',
      'Project:',
      project,
    ].join('\n'),
  });

  if (error) {
    console.error('Resend send error:', error);
    return new Response(
      'Sorry — your enquiry could not be sent. Please email info@agtconsults.com directly.',
      { status: 502 },
    );
  }

  // Success → JSON for fetch, or the same thank-you page the old form used.
  return succeed();
};

// A GET here (e.g. visiting the URL directly) shouldn't 500.
export const GET: APIRoute = () =>
  new Response('This endpoint accepts POST submissions from the contact form.', {
    status: 405,
    headers: { Allow: 'POST' },
  });

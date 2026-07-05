import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// This route must run on-demand (server) so it can read the request body
// and call Resend. Everything else on the site stays static.
export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();

  // ── Honeypot ──────────────────────────────────────────────
  // Real users never see or fill "company". If it has a value, it's a bot.
  // Pretend success so we don't tip the bot off.
  const company = (form.get('company') ?? '').toString().trim();
  if (company) {
    return redirect('/thank-you.html', 303);
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

  // Success → the same thank-you page the old form used.
  return redirect('/thank-you.html', 303);
};

// A GET here (e.g. visiting the URL directly) shouldn't 500.
export const GET: APIRoute = () =>
  new Response('This endpoint accepts POST submissions from the contact form.', {
    status: 405,
    headers: { Allow: 'POST' },
  });

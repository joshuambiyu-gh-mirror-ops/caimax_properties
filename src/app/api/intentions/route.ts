import { db } from '@/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { Session } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { Intention, Prisma } from '@prisma/client';

// Types for request/response shapes
interface IntentionPayload {
  listingId: string;
  listingName: string;
  listingImageUrl?: string;
  userEmail?: string;
  message?: string;
}

interface ResendResponse {
  id?: string;
  error?: unknown;
}

interface SessionWithRole extends Session {
  user: Session['user'] & {
    role?: string;
  };
}

const RESEND_API = 'https://api.resend.com/emails';
const AGENT_EMAIL = process.env.AGENT_EMAIL ?? 'joshuambiyu002@gmail.com';
const SEND_FROM = process.env.SEND_FROM ?? AGENT_EMAIL;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured — skipping send to', to);
    return;
  }

  const body = {
    from: SEND_FROM,
    to,
    subject,
    html
  };

  console.log('Resend: sending email', { to, subject, from: SEND_FROM });

  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '<no-text>');
    console.error('Resend send failed', { status: res.status, text });
    throw new Error(`Resend send failed: ${res.status} ${text}`);
  }
  const json = await res.json().catch(() => null);
  console.log('Resend send success', { to, status: res.status, resp: json });
  return json;
}

// GET: list intentions (protected — only agent can call)
export async function GET() {
  try {
    // Require a logged-in session and ADMIN role to view intentions.
    const session = await getServerSession(authOptions) as SessionWithRole;
    if (!session?.user?.email) {
      console.warn('Unauthorized Intentions GET attempt - no session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // server-side session should include role (attached in NextAuth session callback)
    if (session.user.role !== 'ADMIN') {
      console.warn('Unauthorized Intentions GET attempt - not admin', { email: session.user.email, role: session.user.role });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.log('Intentions GET authorized for admin', { email: session.user.email });
    const items = await db.intention.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ intentions: items });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET /api/intentions error:', error.message);
    } else {
      console.error('GET /api/intentions error:', error);
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST: create intention and send emails (prefer server session email)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions) as SessionWithRole;
    const json = await request.json();
    const payload = json as IntentionPayload;
    const { listingId, listingName, listingImageUrl, userEmail: clientEmail, message } = payload;

    if (!listingId) {
      return NextResponse.json({ error: 'listingId required' }, { status: 400 });
    }

    // Prefer server-derived email when available (more secure)
    const userEmail = session?.user?.email ?? clientEmail;
    if (!userEmail) {
      return NextResponse.json({ error: 'user email required' }, { status: 400 });
    }

    console.log('Intentions POST received', { listingId, listingName, userEmail, hasSession: !!session, message: message ? '[redacted]' : '' });

    // Persist intention (mark pending). If persistence fails, log and continue.
    let created: Intention | null = null;
    try {
      created = await db.intention.create({
        data: {
          listingId,
          userEmail,
          message: message ?? '',
          sendStatus: 'pending'
        }
      });
      console.log('Intention persisted', { id: created.id, listingId: created.listingId });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to persist intention:', error.message);
      } else {
        console.error('Failed to persist intention:', error);
      }
    }

    // Build email HTML
    const userHtml = `
      <p>Hi,</p>
      <p>Thanks for expressing interest in <strong>${listingName}</strong>.</p>
      ${listingImageUrl ? `<img src="${listingImageUrl}" alt="${listingName}" style="max-width:400px;border-radius:8px;" />` : ''}
      <p>We received your message: ${message ? `<em>${message}</em>` : '<em>(no message)</em>'}</p>
      <p>We will connect you with the agent shortly.</p>
    `;

    const agentHtml = `
      <p>Agent,</p>
      <p>A user expressed interest in <strong>${listingName}</strong> (ID: ${listingId}).</p>
      ${listingImageUrl ? `<img src="${listingImageUrl}" alt="${listingName}" style="max-width:400px;border-radius:8px;" />` : ''}
      <p>User email: <strong>${userEmail}</strong></p>
      <p>Message: ${message ? `<em>${message}</em>` : '<em>(no message)</em>'}</p>
    `;

    // Try sending emails. Record result and update the Intention with the
    // generated HTML and send status so devs can preview without a verified domain.
    let sendErr: string | null = null;
    let userSendResp: ResendResponse | null = null;
    let agentSendResp: ResendResponse | null = null;
    try {
      const results = await Promise.all([
        sendEmail({ to: userEmail, subject: `Thanks for your interest in ${listingName}`, html: userHtml }),
        sendEmail({ to: AGENT_EMAIL, subject: `New interest for ${listingName}`, html: agentHtml })
      ]);
      userSendResp = results[0] ?? null;
      agentSendResp = results[1] ?? null;
      console.log('Intention emails sent (or accepted) by Resend', { userSendResp, agentSendResp });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error sending intention emails:', msg);
      sendErr = msg;
    }

    // Update the Intention record with the email HTML and send status if we persisted it
    try {
      if (created?.id) {
        const updateData = {
          userEmailHtml: userHtml,
          agentEmailHtml: agentHtml,
          sendStatus: sendErr ? 'failed' : 'sent',
          sendError: sendErr,
          resendMessageId: userSendResp?.id,
          deliveryEvents: { 
            user: userSendResp, 
            agent: agentSendResp 
          }
        };

        await db.intention.update({ 
          where: { id: created.id }, 
          data: {
            userEmailHtml: updateData.userEmailHtml,
            agentEmailHtml: updateData.agentEmailHtml,
            sendStatus: updateData.sendStatus,
            sendError: updateData.sendError,
            resendMessageId: updateData.resendMessageId,
            deliveryEvents: updateData.deliveryEvents as Prisma.InputJsonValue
          }
        });
        console.log('Intention updated with email preview and status', { id: created.id, status: sendErr ? 'failed' : 'sent' });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to update Intention with email preview:', error.message);
      } else {
        console.error('Failed to update Intention with email preview:', error);
      }
    }

    return NextResponse.json({ ok: true, sendStatus: sendErr ? 'failed' : 'sent', error: sendErr ?? null });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('POST /api/intentions error:', error.message);
    } else {
      console.error('POST /api/intentions error:', error);
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

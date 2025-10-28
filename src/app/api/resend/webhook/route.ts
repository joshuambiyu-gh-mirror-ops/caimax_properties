import { NextResponse } from 'next/server';
import { db } from '@/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// Minimal webhook receiver for Resend. Stores events into the Intention.deliveryEvents array
// and updates deliveryStatus/deliveredAt when relevant.

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    console.log('Resend webhook received', { body });

    if (!body) return NextResponse.json({ ok: true });

    // Basic auth: only allow server-to-server calls when a secret header is present
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
    if (webhookSecret) {
      const provided = request.headers.get('x-resend-signature') || request.headers.get('x-resend-secret');
      if (!provided || provided !== webhookSecret) {
        console.warn('Resend webhook unauthorized: missing/invalid secret');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Resend events vary. We'll look for an `id` field and try to match Intention.resendMessageId
    const eventId = body.id || (body.message && body.message.id) || null;
    if (!eventId) {
      console.log('No event id found in webhook payload');
      return NextResponse.json({ ok: true });
    }

    // Find the intention by resendMessageId
    const intention = await (db as any).intention.findFirst({ where: { resendMessageId: eventId } });
    if (!intention) {
      console.log('No Intention found for resendMessageId', eventId);
      return NextResponse.json({ ok: true });
    }

    // Append the event to deliveryEvents (store array)
    const existing = intention.deliveryEvents ?? {};
    const updatedEvents = Array.isArray(existing) ? existing.concat([body]) : [existing, body].flat().filter(Boolean);

    const updateData: any = { deliveryEvents: updatedEvents };

    // Update deliveryStatus/deliveredAt for known event types
    const t = (body.type || body.event || '').toString().toLowerCase();
    if (t.includes('delivered')) {
      updateData.deliveryStatus = 'delivered';
      updateData.deliveredAt = new Date();
    } else if (t.includes('bounced') || t.includes('bounce') || t.includes('failed')) {
      updateData.deliveryStatus = 'bounced';
    }

    await (db as any).intention.update({ where: { id: intention.id }, data: updateData });
    console.log('Intention updated with webhook event', { id: intention.id, eventId });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Resend webhook handler error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

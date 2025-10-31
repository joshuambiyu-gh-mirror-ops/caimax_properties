import { NextResponse } from 'next/server';
import { db } from '@/db';
import { Prisma } from '@prisma/client';

// Minimal webhook receiver for Resend. Stores events into the Intention.deliveryEvents array
// and updates deliveryStatus/deliveredAt when relevant.

export async function POST(request: Request) {
  try {
  const body: unknown = await request.json().catch(() => null);
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
    const payload = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {} as Record<string, unknown>;
    const eventId = (payload['id'] as string) || ((payload['message'] as Record<string, unknown>)?.['id'] as string) || null;
    if (!eventId) {
      console.log('No event id found in webhook payload');
      return NextResponse.json({ ok: true });
    }

    // Find the intention by resendMessageId
    const intention = await db.intention.findFirst({ where: { resendMessageId: eventId } });
    if (!intention) {
      console.log('No Intention found for resendMessageId', eventId);
      return NextResponse.json({ ok: true });
    }

    // Append the event to deliveryEvents (store array)
    const existingRaw = intention.deliveryEvents ?? [];
    const existing: unknown[] = Array.isArray(existingRaw) ? (existingRaw as unknown[]) : [existingRaw].flat().filter(Boolean);
    const updatedEvents = existing.concat([payload]).filter(Boolean);

    // Build typed update payload using Prisma JSON type for deliveryEvents
    const updatePayload: {
      deliveryEvents?: Prisma.InputJsonValue;
      deliveryStatus?: string;
      deliveredAt?: Date;
    } = {
      deliveryEvents: updatedEvents as Prisma.InputJsonValue,
    };

    // Update deliveryStatus/deliveredAt for known event types
    const t = ((payload['type'] as string) || (payload['event'] as string) || '').toString().toLowerCase();
    if (t.includes('delivered')) {
      updatePayload.deliveryStatus = 'delivered';
      updatePayload.deliveredAt = new Date();
    } else if (t.includes('bounced') || t.includes('bounce') || t.includes('failed')) {
      updatePayload.deliveryStatus = 'bounced';
    }

    await db.intention.update({ where: { id: intention.id }, data: updatePayload });
    console.log('Intention updated with webhook event', { id: intention.id, eventId });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('Resend webhook handler error', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

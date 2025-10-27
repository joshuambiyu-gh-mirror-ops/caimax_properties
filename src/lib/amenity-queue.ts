import { fetchAndStoreAmenities } from '@/lib/fetch-amenities';

// Simple in-memory queue for amenity refresh jobs.
// NOTE: This is suitable for single-server or short-lived development
// environments. For production you should use a durable queue (Redis/Sidekiq/BullMQ).

type Job = { listingId: string };

const CONCURRENCY = Number(process.env.AMENITY_QUEUE_CONCURRENCY || 2);
const POLL_INTERVAL_MS = 1000;

const queue: Job[] = [];
let running = 0;

const enqueued = new Set<string>();

async function processNext() {
  if (running >= CONCURRENCY) return;
  const job = queue.shift();
  if (!job) return;
  running++;
  enqueued.delete(job.listingId);

  try {
    // call the existing refresh function
    await fetchAndStoreAmenities(job.listingId);
    console.log(`Amenity refresh succeeded for ${job.listingId}`);
  } catch (err) {
    console.error(`Amenity refresh failed for ${job.listingId}:`, err);
  } finally {
    running--;
  }
}

// Periodically attempt to process queue
setInterval(() => {
  // try to start as many as allowed
  for (let i = running; i < CONCURRENCY; i++) {
    processNext().catch(err => console.error('Queue worker error:', err));
  }
}, POLL_INTERVAL_MS);

export function enqueueAmenityRefresh(listingId: string): { queued: boolean; position: number } {
  if (enqueued.has(listingId)) {
    // already queued or running
    const pos = queue.findIndex(j => j.listingId === listingId);
    return { queued: true, position: pos >= 0 ? pos + 1 : 0 };
  }

  queue.push({ listingId });
  enqueued.add(listingId);
  return { queued: true, position: queue.length };
}

export function getQueueStatus() {
  return {
    pending: queue.map(j => j.listingId),
    running,
    concurrency: CONCURRENCY,
  };
}

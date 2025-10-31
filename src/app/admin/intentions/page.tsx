import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { db } from '@/db';
import { Intention, Role } from '@prisma/client';

type SessionWithRole = {
  user?: {
    role?: Role;
  } | null;
}

export default async function Page() {
  const session = await getServerSession(authOptions) as SessionWithRole;
  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  const items = await db.intention.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Intentions</h1>
      <div className="space-y-6">
        {items.map((intention: Intention) => (
          <div key={intention.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600">ID: {intention.id}</div>
                <div className="font-semibold">Listing: {intention.listingId}</div>
                <div className="text-sm">User: {intention.userEmail}</div>
                <div className="text-sm">Message: {intention.message}</div>
                <div className="text-sm">Status: {intention.sendStatus} {intention.deliveryStatus ? ` / ${intention.deliveryStatus}` : ''}</div>
                <div className="text-xs text-gray-500">Created: {new Date(intention.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">User Email Preview</h3>
                <div className="mt-2 p-2 border rounded bg-white text-sm" dangerouslySetInnerHTML={{ __html: intention.userEmailHtml ?? '<i>(none)</i>' }} />
              </div>
              <div>
                <h3 className="font-medium">Agent Email Preview</h3>
                <div className="mt-2 p-2 border rounded bg-white text-sm" dangerouslySetInnerHTML={{ __html: intention.agentEmailHtml ?? '<i>(none)</i>' }} />
              </div>
            </div>

            {intention.deliveryEvents && (
              <div className="mt-4">
                <h4 className="font-medium">Delivery Events</h4>
                <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">{JSON.stringify(intention.deliveryEvents, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

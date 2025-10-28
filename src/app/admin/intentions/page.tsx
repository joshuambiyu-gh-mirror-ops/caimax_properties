import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { db } from '@/db';

export default async function Page() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Unauthorized</h1>
        <p>You must be an admin to view this page.</p>
      </div>
    );
  }

  const items = await (db as any).intention.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Intentions</h1>
      <div className="space-y-6">
        {items.map((it: any) => (
          <div key={it.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600">ID: {it.id}</div>
                <div className="font-semibold">Listing: {it.listingId}</div>
                <div className="text-sm">User: {it.userEmail}</div>
                <div className="text-sm">Message: {it.message}</div>
                <div className="text-sm">Status: {it.sendStatus} {it.deliveryStatus ? ` / ${it.deliveryStatus}` : ''}</div>
                <div className="text-xs text-gray-500">Created: {new Date(it.createdAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">User Email Preview</h3>
                <div className="mt-2 p-2 border rounded bg-white text-sm" dangerouslySetInnerHTML={{ __html: it.userEmailHtml ?? '<i>(none)</i>' }} />
              </div>
              <div>
                <h3 className="font-medium">Agent Email Preview</h3>
                <div className="mt-2 p-2 border rounded bg-white text-sm" dangerouslySetInnerHTML={{ __html: it.agentEmailHtml ?? '<i>(none)</i>' }} />
              </div>
            </div>

            {it.deliveryEvents && (
              <div className="mt-4">
                <h4 className="font-medium">Delivery Events</h4>
                <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto">{JSON.stringify(it.deliveryEvents, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

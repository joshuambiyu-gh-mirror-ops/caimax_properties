"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface Props {
  listingId: string;
  listingName?: string;
  listingImageUrl?: string | null;
}

export default function IntentionForm({ listingId, listingName, listingImageUrl }: Props) {
  const { data: session } = useSession();
  const [email, setEmail] = useState<string>(session?.user?.email ?? '');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError('Please provide an email so we can reach you.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/intentions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, listingName, listingImageUrl, userEmail: email, message })
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json && json.error) || 'Failed to submit');
      }
      setSuccess('Thanks — your interest has been sent to the agent.');
      setMessage('');
    } catch (err: any) {
      console.error('Intention submit error:', err);
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold mb-3">Express Interest</h4>

        <label className="text-sm text-gray-600">Your email</label>
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />

        <label className="mt-3 text-sm text-gray-600">Message (optional)</label>
        <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Any details or questions for the agent" />

        <div className="flex items-center gap-2 mt-4">
          <Button type="submit" variant="default" disabled={loading}>{loading ? 'Sending…' : 'Send Intent'}</Button>
          <Button type="button" variant="outline" onClick={() => { setMessage(''); setSuccess(null); setError(null); }}>Clear</Button>
        </div>

        {success && <p className="text-sm text-green-600 mt-3">{success}</p>}
        {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      </form>

      {/* Communication buttons: WhatsApp, Email (mailto), Call */}
      <div className="p-4 bg-white rounded-lg shadow-sm space-y-3">
        <h4 className="text-lg font-semibold">Contact Agent</h4>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-green-600 text-white text-sm"
            href={`https://wa.me/254748820660?text=${encodeURIComponent('I am interested in ' + (listingName || listingId))}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

          <a
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
            href={`mailto:${process.env.NEXT_PUBLIC_AGENT_EMAIL ?? 'joshuambiyu002@gmail.com'}?subject=${encodeURIComponent('Interest in ' + (listingName || listingId))}`}
          >
            Email Agent
          </a>

          <a
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-gray-800 text-white text-sm"
            href={`tel:+254748820660`}
          >
            Call Agent
          </a>
        </div>
      </div>
    </div>
  );
}

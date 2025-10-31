import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = body || {};
    if (!url) {
      return NextResponse.json({ error: 'missing url' }, { status: 400 });
    }

    // Follow redirects server-side to get the final destination URL.
    // Add a User-Agent to avoid being blocked by some providers.
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      }
    });

    const finalUrl = res.url || url;
    // Grab a snippet of the response body so the client can try to extract coordinates
    // when the redirect is done client-side (JS) or via app-intent links.
    let bodySnippet = '';
    try {
      const text = await res.text();
      bodySnippet = text.slice(0, 20000); // limit size
    } catch {
      // ignore errors reading the response body
    }

    return NextResponse.json({ finalUrl, bodySnippet });
  } catch (err) {
    console.error('resolve-url error', err);
    return NextResponse.json({ error: 'failed to resolve url' }, { status: 500 });
  }
}

// GET /api/yt-search?q=… → up to 8 embeddable music videos from YouTube.
// Runs on Vercel so the API key (YOUTUBE_API_KEY, set in the Vercel project's
// environment variables) never reaches the browser. Results are cached at the
// edge for a day to keep within YouTube's free quota (100 searches a day).

interface Req {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  status(code: number): Res;
  setHeader(name: string, value: string): void;
  json(body: unknown): void;
}

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

export default async function handler(req: Req, res: Res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  // only answer the site itself, so nobody else spends the quota
  const site = req.headers['sec-fetch-site'];
  if (site && site !== 'same-origin') return res.status(403).json({ error: 'not allowed' });

  const raw = req.query.q;
  const q = (Array.isArray(raw) ? raw[0] : raw ?? '').trim().slice(0, 80);
  if (q.length < 2) return res.status(400).json({ error: 'type at least two letters' });

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return res.status(503).json({ error: 'search is not set up on this site yet' });

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.search = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoEmbeddable: 'true',
    videoCategoryId: '10',
    safeSearch: 'moderate',
    maxResults: '8',
    q,
    key,
  }).toString();

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: r.status === 403 ? 'search is resting for today (quota)' : 'search failed' });
    const data = (await r.json()) as { items?: { id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string } }[] };
    const results = (data.items ?? [])
      .filter((i) => i.id?.videoId)
      .map((i) => ({ id: i.id!.videoId!, title: decode(i.snippet?.title ?? ''), channel: decode(i.snippet?.channelTitle ?? '') }));
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({ results });
  } catch {
    return res.status(502).json({ error: 'search failed' });
  }
}

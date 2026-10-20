import type { APIRoute } from 'astro';

// Served at /.well-known/security.txt (RFC 9116). Lives here rather than in
// public/ because the static build skips dot-folders there.
export const GET: APIRoute = ({ site }) => {
  const canonical = new URL('/.well-known/security.txt', site);
  const body = [
    'Contact: mailto:harshitchhabi@gmail.com',
    'Expires: 2027-10-20T00:00:00.000Z',
    'Preferred-Languages: en',
    `Canonical: ${canonical}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

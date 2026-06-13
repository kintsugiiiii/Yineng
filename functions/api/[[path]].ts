export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const search = url.search;
  const targetUrl = `https://yineng-kohl.vercel.app${path}${search}`;

  const req = context.request;
  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

  const resp = await fetch(targetUrl, {
    method: req.method,
    headers: {
      'Content-Type': req.headers.get('Content-Type') || 'application/json',
      'Accept': 'application/json',
      'apikey': req.headers.get('apikey') || '',
      'Authorization': req.headers.get('Authorization') || '',
      'Prefer': 'return=representation',
    },
    body,
  });

  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: { 'Content-Type': resp.headers.get('Content-Type') || 'application/json' },
  });
}

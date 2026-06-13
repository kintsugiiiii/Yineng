export async function onRequest(context: any) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname; // e.g. /api/skills
  const search = url.search; // e.g. ?page=1

  // 代理到 Vercel 后端
  const targetUrl = `https://yineng-kohl.vercel.app${path}${search}`;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers: {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
      'apikey': request.headers.get('apikey') || '',
      'Authorization': request.headers.get('Authorization') || '',
      'Accept': 'application/json',
      'Prefer': request.headers.get('Prefer') || 'return=representation',
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  });

  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

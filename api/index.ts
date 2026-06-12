const app = (req: any, res: any) => {
  // 简易路由
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  res.setHeader('Content-Type', 'application/json');

  try {
    if (path === '/api/ping') {
      return res.end(JSON.stringify({ ok: true, env: !!process.env.SUPABASE_URL }));
    }
    res.end(JSON.stringify({ error: 'not found', path }));
  } catch (e: any) {
    res.end(JSON.stringify({ error: e.message }));
  }
};

export default app;

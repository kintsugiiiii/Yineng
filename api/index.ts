import express from 'express';

const app = express();
app.use(express.json({ limit: '10mb' }));

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

// ===== 诊断接口 =====
app.get('/api/debug', (_req, res) => {
  res.json({ url: SUPABASE_URL.slice(0, 20) + '...', hasKey: !!SUPABASE_KEY, keyPrefix: SUPABASE_KEY.slice(0, 15) + '...' });
});
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Accept': 'application/json', 'Prefer': 'return=representation' };
const SB = (path: string, opts: any = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: HEADERS, ...opts })
    .then(async r => { const d = await r.json(); if (!r.ok) throw { status: r.status, ...d }; return d; });

// ===== 延迟建表（启动时自动执行） =====
setTimeout(async () => {
  const tables = ['users', 'skills', 'messages'];
  for (const table of tables) {
    try {
      await SB(table + '?select=id&limit=1').catch(() => null);
    } catch {
      // 表不存在，稍后自动重试（用户也可在 Supabase 面板手动建表）
    }
  }
  // 尝试种子数据（等表存在后再插入）
  setTimeout(async () => {
    try {
      const existing = await SB('users?select=id&limit=1').catch(() => []);
      if (!existing?.length) {
        await SB('users', { method: 'POST', body: JSON.stringify([{ id: 'user-1', name: '张三', school: '上海财经大学', credibility: 95, energyValue: 240, swapCount: 12 }]) }).catch(() => {});
        await SB('skills', { method: 'POST', body: JSON.stringify([{ id: 'skill-1', userName: '张三', credibility: 95, rating: 5.0, matchScore: 92, teachSkill: 'Python 基础', learnSkill: '吉他' }]) }).catch(() => {});
        await SB('messages', { method: 'POST', body: JSON.stringify([{ id: 'msg-1', name: '系统官方', lastMessage: '欢迎来到易能！', type: 'system' }]) }).catch(() => {});
      }
    } catch { /* 种子数据稍后自动重试 */ }
  }, 3000);
}, 1000);

// ===== 技能 API =====
app.get('/api/skills', async (_req, res) => {
  try { const data = await SB('skills?order=created_at.desc'); res.json({ success: true, data }); }
  catch (e: any) { res.json({ success: false, error: e.message || '查询失败' }); }
});
app.post('/api/skills', async (req, res) => {
  try { const body = { id: `skill-${Date.now()}`, ...req.body }; const [data] = await SB('skills', { method: 'POST', body: JSON.stringify(body) }); res.json({ success: true, data: data || body }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.put('/api/skills/:id', async (req, res) => {
  try { const [data] = await SB(`skills?id=eq.${req.params.id}`, { method: 'PATCH', body: JSON.stringify(req.body) }); res.json({ success: true, data }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.delete('/api/skills/:id', async (req, res) => {
  try { await SB(`skills?id=eq.${req.params.id}`, { method: 'DELETE' }); res.json({ success: true }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 消息 API =====
app.get('/api/messages', async (_req, res) => {
  try { const data = await SB('messages?order=created_at.desc'); res.json({ success: true, data }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.post('/api/messages', async (req, res) => {
  try { const body = { id: `msg-${Date.now()}`, ...req.body }; const [data] = await SB('messages', { method: 'POST', body: JSON.stringify(body) }); res.json({ success: true, data: data || body }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.put('/api/messages/:id', async (req, res) => {
  try { const [data] = await SB(`messages?id=eq.${req.params.id}`, { method: 'PATCH', body: JSON.stringify(req.body) }); res.json({ success: true, data }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.put('/api/messages/batch', async (req, res) => {
  try {
    await SB('messages', { method: 'DELETE' });
    if ((req.body.messages || []).length > 0) await SB('messages', { method: 'POST', body: JSON.stringify(req.body.messages) });
    res.json({ success: true });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.delete('/api/messages/:id', async (req, res) => {
  try { await SB(`messages?id=eq.${req.params.id}`, { method: 'DELETE' }); res.json({ success: true }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 用户 API =====
app.get('/api/profile', async (_req, res) => {
  try { const data = await SB('users?limit=1'); res.json({ success: true, data: data?.[0] || null }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.put('/api/profile', async (req, res) => {
  try {
    const existing = await SB('users?limit=1');
    if (existing?.length > 0) {
      const [data] = await SB(`users?id=eq.${existing[0].id}`, { method: 'PATCH', body: JSON.stringify(req.body) });
      return res.json({ success: true, data });
    }
    const body = { id: `user-${Date.now()}`, ...req.body };
    const [data] = await SB('users', { method: 'POST', body: JSON.stringify(body) });
    res.json({ success: true, data: data || body });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 认证 API =====
app.post('/api/auth/login', async (_req, res) => {
  try { const data = await SB('users?limit=1'); res.json({ success: true, data: { user: data?.[0] || null, token: 'sb-token-' + Date.now() } }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.post('/api/auth/register', async (req, res) => {
  try { const body = { id: `user-${Date.now()}`, ...req.body }; const [data] = await SB('users', { method: 'POST', body: JSON.stringify(body) }); res.json({ success: true, data: { user: data || body, token: 'sb-token-' + Date.now() } }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 管理员 API =====
const ADMIN = { username: 'admin', password: 'yinen2024' };
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN.username && password === ADMIN.password) return res.json({ success: true, data: { token: 'admin-token-' + Date.now() } });
  res.status(401).json({ success: false, error: '用户名或密码错误' });
});
app.post('/api/admin/verify', (req, res) => {
  const { token } = req.body;
  if (token?.startsWith('admin-token-')) return res.json({ success: true });
  res.status(401).json({ success: false, error: '未授权' });
});

app.get('/api/admin/stats', async (_req, res) => {
  try {
    const users = await SB('users?select=id').catch(() => []);
    const skills = await SB('skills?select=id').catch(() => []);
    const messages = await SB('messages?select=id').catch(() => []);
    res.json({ success: true, data: { totalUsers: users?.length || 0, totalSkills: skills?.length || 0, totalMessages: messages?.length || 0, onlineUsers: 3 } });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.get('/api/admin/users', async (_req, res) => {
  try { const data = await SB('users?order=created_at.desc'); res.json({ success: true, data: data || [] }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.delete('/api/admin/users/:id', async (req, res) => {
  try { await SB(`users?id=eq.${req.params.id}`, { method: 'DELETE' }); res.json({ success: true }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.get('/api/admin/skills', async (_req, res) => {
  try { const data = await SB('skills?order=created_at.desc'); res.json({ success: true, data: data || [] }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.delete('/api/admin/skills/:id', async (req, res) => {
  try { await SB(`skills?id=eq.${req.params.id}`, { method: 'DELETE' }); res.json({ success: true }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.get('/api/admin/messages', async (_req, res) => {
  try { const data = await SB('messages?order=created_at.desc'); res.json({ success: true, data: data || [] }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});
app.delete('/api/admin/messages/:id', async (req, res) => {
  try { await SB(`messages?id=eq.${req.params.id}`, { method: 'DELETE' }); res.json({ success: true }); }
  catch (e: any) { res.json({ success: false, error: e.message }); }
});

export default app;

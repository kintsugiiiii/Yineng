import express from 'express';

const app = express();
app.use(express.json({ limit: '10mb' }));

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const HEADERS = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Accept': 'application/json', 'Prefer': 'return=representation' };
const SB = (path: string, opts: any = {}) =>
  fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: HEADERS, ...opts })
    .then(async r => { const d = await r.json(); if (!r.ok) throw { status: r.status, ...d }; return d; });

// ===== 自动建表 & 种子数据 =====
async function ensureTables() {
  // 用 SQL 编辑器 API 尝试建表
  const sql = `
CREATE TABLE IF NOT EXISTS public.users (id text PRIMARY KEY, name text NOT NULL DEFAULT '', avatar text DEFAULT '', title text DEFAULT '', school text DEFAULT '', credibility int8 DEFAULT 90, "energyValue" int8 DEFAULT 100, "swapCount" int8 DEFAULT 0, gender text DEFAULT '男', age int8 DEFAULT 20, occupation text DEFAULT '', major text DEFAULT '', membership text DEFAULT 'free', created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.skills (id text PRIMARY KEY, "userName" text NOT NULL DEFAULT '', "userAvatar" text DEFAULT '', credibility int8 DEFAULT 90, rating float4 DEFAULT 4.5, "matchScore" int8 DEFAULT 85, "teachSkill" text DEFAULT '', "learnSkill" text DEFAULT '', proficiency text DEFAULT 'beginner', time text DEFAULT '', method text DEFAULT 'online', school text DEFAULT '', "isUserCreated" bool DEFAULT false, created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS public.messages (id text PRIMARY KEY, name text NOT NULL DEFAULT '', avatar text DEFAULT '', "lastMessage" text DEFAULT '', time text DEFAULT '', "isUnread" bool DEFAULT false, type text DEFAULT 'chat', "matchedSkillName" text DEFAULT '', "invitationStatus" text DEFAULT '', credibility int8 DEFAULT 0, created_at timestamptz DEFAULT now());
  `.trim();
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ query: sql }) });
    console.log('[DB] Table creation attempted via RPC');
  } catch { /* RPC not available */ }
  // 尝试插入种子数据
  try {
    const users = await SB('users?select=id&limit=1').catch(() => []);
    if (!users || users.length === 0) {
      await SB('users', { method: 'POST', body: JSON.stringify([{ id: 'user-1', name: '张三', school: '上海财经大学', credibility: 95, energyValue: 240, swapCount: 12, gender: '男', age: 21, occupation: '大学生', major: '数据科学与金融科技' }]) }).catch(() => {});
    }
    const skills = await SB('skills?select=id&limit=1').catch(() => []);
    if (!skills || skills.length === 0) {
      await SB('skills', { method: 'POST', body: JSON.stringify([{ id: 'skill-1', userName: '张三', credibility: 95, rating: 5.0, matchScore: 92, teachSkill: 'Python 基础', learnSkill: '吉他', proficiency: 'beginner', time: '周末晚上8点后', method: 'both', school: '清华大学' }]) }).catch(() => {});
    }
  } catch { /* seed may fail if tables don't exist */ }
}
ensureTables();

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

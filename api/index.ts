import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json({ limit: '10mb' }));

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function handleDbError(res: any, err: any) {
  console.error('[DB Error]', err);
  res.status(500).json({ success: false, error: err?.message || '操作失败', code: err?.code });
}

// ===== 技能 API =====
app.get('/api/skills', async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('skills').select('*');
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.post('/api/skills', async (req: any, res: any) => {
  try {
    const newSkill = { id: `skill-${Date.now()}`, ...req.body };
    const { data, error } = await supabase.from('skills').insert(newSkill).select().single();
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || newSkill });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.put('/api/skills/:id', async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('skills').update(req.body).eq('id', req.params.id).select().single();
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.delete('/api/skills/:id', async (req: any, res: any) => {
  try {
    const { error } = await supabase.from('skills').delete().eq('id', req.params.id);
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 消息 API =====
app.get('/api/messages', async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.post('/api/messages', async (req: any, res: any) => {
  try {
    const newMsg = { id: `msg-${Date.now()}`, ...req.body };
    const { data, error } = await supabase.from('messages').insert(newMsg).select().single();
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || newMsg });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.put('/api/messages/:id', async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('messages').update(req.body).eq('id', req.params.id).select().single();
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.put('/api/messages/batch', async (req: any, res: any) => {
  try {
    const { messages: newMessages } = req.body;
    if (!Array.isArray(newMessages)) return res.status(400).json({ success: false, error: '格式错误' });
    const { error: delErr } = await supabase.from('messages').delete().neq('id', '_nonexistent_');
    if (delErr) return res.json({ success: false, error: delErr.message });
    if (newMessages.length > 0) {
      const { error: insErr } = await supabase.from('messages').insert(newMessages);
      if (insErr) return res.json({ success: false, error: insErr.message });
    }
    res.json({ success: true });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.delete('/api/messages/:id', async (req: any, res: any) => {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 用户 API =====
app.get('/api/profile', async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1).single();
    if (error && error.code !== 'PGRST116') return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || null });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.put('/api/profile', async (req: any, res: any) => {
  try {
    const { data: existing } = await supabase.from('users').select('id').limit(1).single();
    if (existing) {
      const { data, error } = await supabase.from('users').update(req.body).eq('id', existing.id).select().single();
      if (error) return res.json({ success: false, error: error.message });
      return res.json({ success: true, data });
    }
    const newUser = { id: `user-${Date.now()}`, ...req.body };
    const { data, error } = await supabase.from('users').insert(newUser).select().single();
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || newUser });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 认证 API =====
app.post('/api/auth/login', async (req: any, res: any) => {
  const { data } = await supabase.from('users').select('*').limit(1).single();
  res.json({ success: true, data: { user: data, token: 'sb-token-' + Date.now() } });
});

app.post('/api/auth/register', async (req: any, res: any) => {
  try {
    const newUser = { id: `user-${Date.now()}`, ...req.body };
    const { data, error } = await supabase.from('users').insert(newUser).select().single();
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: { user: data || newUser, token: 'sb-token-' + Date.now() } });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

// ===== 管理员 API =====
const ADMIN_CREDENTIALS = { username: 'admin', password: 'yinen2024' };

app.post('/api/admin/login', (req: any, res: any) => {
  const { username, password } = req.body;
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return res.json({ success: true, data: { token: 'admin-token-' + Date.now() } });
  }
  res.status(401).json({ success: false, error: '用户名或密码错误' });
});

app.post('/api/admin/verify', (req: any, res: any) => {
  const { token } = req.body;
  if (token && token.startsWith('admin-token-')) return res.json({ success: true });
  res.status(401).json({ success: false, error: '未授权' });
});

app.get('/api/admin/stats', async (_req: any, res: any) => {
  try {
    const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: skills } = await supabase.from('skills').select('*', { count: 'exact', head: true });
    const { count: messages } = await supabase.from('messages').select('*', { count: 'exact', head: true });
    res.json({ success: true, data: { totalUsers: users || 0, totalSkills: skills || 0, totalMessages: messages || 0, onlineUsers: 3 } });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.get('/api/admin/users', async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.delete('/api/admin/users/:id', async (req: any, res: any) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.get('/api/admin/skills', async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('skills').select('*');
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.delete('/api/admin/skills/:id', async (req: any, res: any) => {
  try {
    const { error } = await supabase.from('skills').delete().eq('id', req.params.id);
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.get('/api/admin/messages', async (_req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true, data: data || [] });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

app.delete('/api/admin/messages/:id', async (req: any, res: any) => {
  try {
    const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
    if (error) return res.json({ success: false, error: error.message });
    res.json({ success: true });
  } catch (e: any) { res.json({ success: false, error: e.message }); }
});

export default app;

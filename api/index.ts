import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json({ limit: '10mb' }));

// ===== Supabase =====
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== Gemini AI =====
let ai: any = null;
try {
  const { GoogleGenAI } = require('@google/genai');
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
} catch (e) {
  console.log('[AI] Gemini 未加载，使用模拟回复');
}

// ===== 错误处理 =====
function handleDbError(res: express.Response, err: unknown) {
  console.error('[DB Error]', err);
  res.status(500).json({ success: false, error: (err as any)?.message || '操作失败' });
}

// ===== 技能 API =====
app.get('/api/skills', async (_req, res) => {
  try {
    const { data, error } = await supabase.from('skills').select('*');
    if (error) return res.json({ success: false, error: error.message, detail: error });
    res.json({ success: true, data: data || [] });
  } catch (e: any) {
    res.json({ success: false, error: e.message, stack: e.stack });
  }
});

app.post('/api/skills', async (req, res) => {
  const newSkill = { id: `skill-${Date.now()}`, ...req.body };
  const { data, error } = await supabase.from('skills').insert(newSkill).select().single();
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: data || newSkill });
});

app.put('/api/skills/:id', async (req, res) => {
  const { data, error } = await supabase.from('skills').update(req.body).eq('id', req.params.id).select().single();
  if (error) return handleDbError(res, error);
  if (!data) return res.status(404).json({ success: false, error: '技能不存在' });
  res.json({ success: true, data });
});

app.delete('/api/skills/:id', async (req, res) => {
  const { error } = await supabase.from('skills').delete().eq('id', req.params.id);
  if (error) return handleDbError(res, error);
  res.json({ success: true });
});

// ===== 消息 API =====
app.get('/api/messages', async (_req, res) => {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: data || [] });
});

app.post('/api/messages', async (req, res) => {
  const newMsg = { id: `msg-${Date.now()}`, ...req.body };
  const { data, error } = await supabase.from('messages').insert(newMsg).select().single();
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: data || newMsg });
});

app.put('/api/messages/:id', async (req, res) => {
  const { data, error } = await supabase.from('messages').update(req.body).eq('id', req.params.id).select().single();
  if (error) return handleDbError(res, error);
  if (!data) return res.status(404).json({ success: false, error: '消息不存在' });
  res.json({ success: true, data });
});

app.put('/api/messages/batch', async (req, res) => {
  const { messages: newMessages } = req.body;
  if (!Array.isArray(newMessages)) return res.status(400).json({ success: false, error: '格式错误' });
  const { error: delErr } = await supabase.from('messages').delete().neq('id', '_nonexistent_');
  if (delErr) return handleDbError(res, delErr);
  if (newMessages.length > 0) {
    const { error: insErr } = await supabase.from('messages').insert(newMessages);
    if (insErr) return handleDbError(res, insErr);
  }
  res.json({ success: true });
});

app.delete('/api/messages/:id', async (req, res) => {
  const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
  if (error) return handleDbError(res, error);
  res.json({ success: true });
});

// ===== 用户 API =====
app.get('/api/profile', async (_req, res) => {
  const { data, error } = await supabase.from('users').select('*').limit(1).single();
  if (error && error.code !== 'PGRST116') return handleDbError(res, error);
  res.json({ success: true, data: data || null });
});

app.put('/api/profile', async (req, res) => {
  const { data: existing } = await supabase.from('users').select('id').limit(1).single();
  if (existing) {
    const { data, error } = await supabase.from('users').update(req.body).eq('id', existing.id).select().single();
    if (error) return handleDbError(res, error);
    return res.json({ success: true, data });
  }
  const newUser = { id: `user-${Date.now()}`, ...req.body };
  const { data, error } = await supabase.from('users').insert(newUser).select().single();
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: data || newUser });
});

// ===== 认证 API =====
app.post('/api/auth/login', async (req, res) => {
  const { data } = await supabase.from('users').select('*').limit(1).single();
  res.json({ success: true, data: { user: data, token: 'sb-token-' + Date.now() } });
});

app.post('/api/auth/register', async (req, res) => {
  const newUser = { id: `user-${Date.now()}`, ...req.body };
  const { data, error } = await supabase.from('users').insert(newUser).select().single();
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: { user: data || newUser, token: 'sb-token-' + Date.now() } });
});

// ===== Gemini 聊天 =====
app.post('/api/chat', async (req, res) => {
  try {
    const { partnerName, partnerSchool, teachSkill, learnSkill, userName, userSchool, userMajor, userGender, userAge, userOccupation, chatHistory, message } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      const replies = ['哈哈，这个想法太好了！我们周末要不要挑个时间具体见个面或者在线上仔细聊一聊？', '绝了！我对你的技能也很感兴趣呢，这周六下午有空吗？', '好的呀，那咱们约个时间细说吧！', '确实，真的很想学这个，周六可以哦！'];
      return res.json({ success: true, reply: replies[Math.floor(Math.random() * replies.length)] });
    }
    const systemInstruction = `你现在正在扮演中国大学生学术/生活技能互换平台"易能"上的一个真实注册用户。你的个人卡片资料：- 姓名/网名：${partnerName || '同学'} - 所在学校/机构：${partnerSchool || '北京大学'} - 你的主攻技能（能教别人的）：${teachSkill || '相关学科技能/技术'} - 你想学习的技能（希望换取的）：${learnSkill || '其他感兴趣技能'}。你正在与另一位想要和你交换互换学技的注册用户聊天，其背景信息如下：- 称呼：${userName || '张三'} - 所在学校/机构：${userSchool || '上海财经大学'} - 性别：${userGender || '男'} - 年龄：${userAge || '21'} - 职业：${userOccupation || '大学生'} - 专业背景：${userMajor || '数据科学与金融科技'}。聊天原则：1. 回复必须具有极强的人性化特点，拒绝翻译腔、格式化、AI助手的语气。2. 字数精简，约10~80字，多用"哈哈"、"绝了"、"好的呀"、"确实"等口语。3. 内容结合双方技能，给出具体沟通回复。4. 不要列点，纯文字或带表情。`;
    const formattedContents = (chatHistory || []).map((h: any) => ({ role: h.sender === 'me' ? 'user' : 'model', parts: [{ text: h.text }] }));
    formattedContents.push({ role: 'user', parts: [{ text: message }] });
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: formattedContents, config: { systemInstruction, temperature: 0.85 } });
    res.json({ success: true, reply: response.text?.trim() || '好的呀，那咱们约个时间细说吧！' });
  } catch (err: any) {
    console.error('Gemini Error:', err);
    res.status(500).json({ success: false, error: err.message || '内部服务异常' });
  }
});

// ===== 管理员 API =====
const ADMIN_CREDENTIALS = { username: 'admin', password: 'yinen2024' };

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    return res.json({ success: true, data: { token: 'admin-token-' + Date.now() } });
  }
  res.status(401).json({ success: false, error: '用户名或密码错误' });
});

app.post('/api/admin/verify', (req, res) => {
  const { token } = req.body;
  if (token && token.startsWith('admin-token-')) return res.json({ success: true });
  res.status(401).json({ success: false, error: '未授权' });
});

app.get('/api/admin/stats', async (_req, res) => {
  const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: skills } = await supabase.from('skills').select('*', { count: 'exact', head: true });
  const { count: messages } = await supabase.from('messages').select('*', { count: 'exact', head: true });
  res.json({ success: true, data: { totalUsers: users || 0, totalSkills: skills || 0, totalMessages: messages || 0, onlineUsers: 3 } });
});

app.get('/api/admin/users', async (_req, res) => {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: data || [] });
});

app.delete('/api/admin/users/:id', async (req, res) => {
  const { error } = await supabase.from('users').delete().eq('id', req.params.id);
  if (error) return handleDbError(res, error);
  res.json({ success: true });
});

app.get('/api/admin/skills', async (_req, res) => {
  const { data, error } = await supabase.from('skills').select('*').order('created_at', { ascending: false });
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: data || [] });
});

app.delete('/api/admin/skills/:id', async (req, res) => {
  const { error } = await supabase.from('skills').delete().eq('id', req.params.id);
  if (error) return handleDbError(res, error);
  res.json({ success: true });
});

app.get('/api/admin/messages', async (_req, res) => {
  const { data, error } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
  if (error) return handleDbError(res, error);
  res.json({ success: true, data: data || [] });
});

app.delete('/api/admin/messages/:id', async (req, res) => {
  const { error } = await supabase.from('messages').delete().eq('id', req.params.id);
  if (error) return handleDbError(res, error);
  res.json({ success: true });
});

// ===== 导出给 Vercel =====
export default app;

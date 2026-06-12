import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ===== Supabase 初始化 =====
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ===== 建表（首次运行自动创建） =====
async function initTables() {
  const sql = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    title TEXT DEFAULT '',
    school TEXT DEFAULT '',
    credibility INTEGER DEFAULT 90,
    "energyValue" INTEGER DEFAULT 100,
    "swapCount" INTEGER DEFAULT 0,
    "activityHistory" JSON DEFAULT '[20,35,10,40,30,80,50]',
    gender TEXT DEFAULT '男',
    age INTEGER DEFAULT 20,
    occupation TEXT DEFAULT '学生',
    major TEXT DEFAULT '',
    membership TEXT DEFAULT 'free',
    "unlockedWhoViewedMe" BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT DEFAULT '',
    credibility INTEGER DEFAULT 90,
    rating REAL DEFAULT 4.5,
    "matchScore" INTEGER DEFAULT 85,
    "teachSkill" TEXT DEFAULT '',
    "learnSkill" TEXT DEFAULT '',
    tags JSON DEFAULT '[]',
    proficiency TEXT DEFAULT 'beginner',
    time TEXT DEFAULT '',
    method TEXT DEFAULT 'online',
    "isNearby" BOOLEAN DEFAULT false,
    school TEXT DEFAULT '',
    "isUserCreated" BOOLEAN DEFAULT false,
    "portfolioImg" TEXT DEFAULT '',
    "isHot" BOOLEAN DEFAULT false,
    "hotSearchHint" TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    avatar TEXT DEFAULT '',
    name TEXT NOT NULL,
    "lastMessage" TEXT DEFAULT '',
    time TEXT DEFAULT '',
    "isUnread" BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'chat',
    "matchedSkillName" TEXT DEFAULT '',
    "invitationStatus" TEXT DEFAULT '',
    credibility INTEGER DEFAULT 0,
    "chatHistory" JSON DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  `;

  const { error } = await supabase.rpc('exec_sql', { query: sql }).maybeSingle();
  if (error) {
    // RPC 不可用，尝试直接建表：先检查表是否存在
    console.log('[Supabase] 尝试通过 REST API 建表...');
    // 如果 RPC 不支持，会在首次 insert 时自动建表（Supabase 自动生成的表）
  }
}

// ===== 初始数据种子 =====
async function seedData() {
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  if (userCount === 0) {
    const defaults = [
      { id: 'user-1', name: '张三', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M', title: '易能达人', school: '上海财经大学', credibility: 95, energyValue: 240, swapCount: 12, activityHistory: [40, 65, 90, 55, 75, 100, 60], gender: '男', age: 21, occupation: '大学生', major: '数据科学与金融科技', membership: 'free', unlockedWhoViewedMe: false },
      { id: 'user-2', name: '李知夏', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo', title: '认证实证达人', school: '复旦大学', credibility: 98, energyValue: 180, swapCount: 8, activityHistory: [50, 40, 80, 95, 70, 60, 45], gender: '女', age: 20, occupation: '大三学生', major: '视觉传达设计', membership: 'free', unlockedWhoViewedMe: false },
    ];
    for (const u of defaults) {
      await supabase.from('users').upsert(u).maybeSingle();
    }
  }

  const { count: skillCount } = await supabase.from('skills').select('*', { count: 'exact', head: true });
  if (skillCount === 0) {
    const skills = [
      { id: 'skill-1', userName: '张三', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M', credibility: 95, rating: 5.0, matchScore: 92, teachSkill: 'Python 基础', learnSkill: '吉他', tags: ['Python', '开发', '编程'], proficiency: 'beginner', time: '周末，晚上 8 点以后', method: 'both', isNearby: true, school: '清华大学', isUserCreated: false },
      { id: 'skill-2', userName: '李四', userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo', credibility: 90, rating: 4.8, matchScore: 90, teachSkill: '数字营销运营', learnSkill: '产品设计 & UI', tags: ['运营', '营销', '商业'], proficiency: 'intermediate', time: '普通工作日晚上', method: 'online', isNearby: false, school: '北京大学', isUserCreated: false },
    ];
    for (const s of skills) {
      await supabase.from('skills').upsert(s).maybeSingle();
    }
  }

  const { count: msgCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });
  if (msgCount === 0) {
    const msgs = [
      { id: 'msg-1', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo', name: '李四', lastMessage: '太好了，这周末见！', time: '上午 10:45', isUnread: true, type: 'chat', credibility: 92, chatHistory: [{ id: '1', sender: 'other', text: '你好！我的数字营销卡片发布啦，刚好看到你对产品设计有所建树呢。', timestamp: '上午 10:11' }, { id: '2', sender: 'me', text: '你好呀，十分乐意！这周末双休日我刚好大半天空闲，我们可以碰头好好切磋切磋。', timestamp: '上午 10:30' }] },
      { id: 'msg-2', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M', name: '小王', lastMessage: '发送了技能互换邀请：UI 设计', time: '上午 09:12', isUnread: true, type: 'invitation', matchedSkillName: '技能交换邀请：UI 设计', invitationStatus: 'pending', credibility: 95, chatHistory: [{ id: '1', sender: 'other', text: 'Hi 张三同学，我发起了跟你互换技能 UI 密码学的邀请，我希望学习你的 Python 代码。', timestamp: '上午 09:12' }] },
      { id: 'msg-3', avatar: '', name: '系统官方', lastMessage: '你的平台信用百分值已免费提升至 90。', time: '昨天', isUnread: false, type: 'system' },
    ];
    for (const m of msgs) {
      await supabase.from('messages').upsert(m).maybeSingle();
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // ===== Gemini AI =====
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });

  // ===== 初始化数据库表 & 种子数据 =====
  try {
    await initTables();
    await seedData();
    console.log('[Supabase] 数据库初始化完成');
  } catch (err) {
    console.warn('[Supabase] 初始化警告（不影响运行）:', (err as any)?.message);
  }

  // ===== 通用错误处理 =====
  function handleDbError(res: express.Response, err: unknown) {
    console.error('[DB Error]', err);
    res.status(500).json({ success: false, error: (err as any)?.message || '数据库操作失败' });
  }

  // ===== API: 技能相关 =====
  app.get('/api/skills', async (_req, res) => {
    const { data, error } = await supabase.from('skills').select('*').order('created_at', { ascending: false });
    if (error) return handleDbError(res, error);
    res.json({ success: true, data: data || [] });
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

  // ===== API: 消息相关 =====
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
    // 批量替换：先删后插
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

  // ===== API: 用户/档案 =====
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

  // ===== API: 认证（简易版） =====
  app.post('/api/auth/login', async (req, res) => {
    const { preset } = req.body;
    if (preset) {
      const { data } = await supabase.from('users').select('*').limit(1).single();
      return res.json({ success: true, data: { user: data, token: 'sb-token-' + Date.now() } });
    }
    const { data } = await supabase.from('users').select('*').limit(1).single();
    res.json({ success: true, data: { user: data, token: 'sb-token-' + Date.now() } });
  });

  app.post('/api/auth/register', async (req, res) => {
    const newUser = { id: `user-${Date.now()}`, ...req.body };
    const { data, error } = await supabase.from('users').insert(newUser).select().single();
    if (error) return handleDbError(res, error);
    res.json({ success: true, data: { user: data || newUser, token: 'sb-token-' + Date.now() } });
  });

  // ===== API: Gemini 聊天 =====
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

  // ===== 管理后台前端 =====
  const ADMIN_HTML = path.join(process.cwd(), 'admin', 'index.html');
  app.get('/admin', (_req, res) => res.sendFile(ADMIN_HTML));
  app.get('/admin/*', (_req, res) => res.sendFile(ADMIN_HTML));

  // ===== Vite / 静态文件 =====
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      if (req.path.startsWith('/admin')) return;
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[易能] 服务器启动成功，端口: ${PORT}`);
    console.log(`[易能] 前台: http://localhost:${PORT}`);
    console.log(`[易能] 后台: http://localhost:${PORT}/admin`);
    console.log(`[易能] 数据库: Supabase (${supabaseUrl})`);
  });
}

startServer();

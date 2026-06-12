/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './components/Header';
import HomeSection from './components/HomeSection';
import PublishSection from './components/PublishSection';
import MessagesSection from './components/MessagesSection';
import MineSection from './components/MineSection';
import LoginSection from './components/LoginSection';
import { SkillItem, MessageItem, UserProfile, ChatHistoryMessage } from './types';

// ===== API 数据同步层 =====
const API_BASE = '';

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || '请求失败');
  return data;
}

// Default mock initializations for LocalStorage
const DEFAULT_SKILLS: SkillItem[] = [
  {
    id: 'skill-1',
    userName: '张三',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmSz8-eNXmeqw2CcuSrU_oUqiCYWrhP1eWlKHmYOy2n18fWCGxO24QyWEdeQ_0KoHOcUQyoT0niqBXmNxvwP4eRKrYnoIhihrMuQujYUI-RvuysummYLC2ICPbSSu9_MwEOw_B9vvo2tJkHqVOJDSf0BsgV4lXNmxBBgYWVCNIVlPdu9IjMoaxRmq0unPCwhZd_WAyUGfCMIQyvXczFjH6x3MQnTzcCk0r0t_6TczF9DCDXvVo_Xl2WTVwOT2C5v3Qu6s4hhzcg6o',
    credibility: 95,
    rating: 5.0,
    matchScore: 92,
    teachSkill: 'Python 基础',
    learnSkill: '吉他',
    tags: ['Python', '开发', '编程'],
    proficiency: 'beginner',
    time: '周末，晚上 8 点以后',
    method: 'both',
    isNearby: true,
    school: '清华大学',
    isUserCreated: false,
  },
  {
    id: 'skill-2',
    userName: '李四',
    userAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo',
    credibility: 90,
    rating: 4.8,
    matchScore: 90,
    teachSkill: '数字营销运营',
    learnSkill: '产品设计 & UI',
    tags: ['运营', '营销', '商业'],
    proficiency: 'intermediate',
    time: '普通工作日晚上',
    method: 'online',
    isNearby: false,
    school: '北京大学',
    isUserCreated: false,
  }
];

const DEFAULT_MESSAGES: MessageItem[] = [
  {
    id: 'msg-1',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvvdNpOiNa1RwZcAVYRzqoKSVUmUMtzPYVTwdTXh4Wji38jHz6Onn7mgU-6c8hGAzKybUEwPJMRvR2EDmgU3EyyTJXdOfVxzj5LXInMxgF2deJWjyg8vagkJHQseGzcwI9xBEQcMvfWCI7gEOthVi1pWOm7gyxXnARpN0ivwp-1gkKCyiv7hyWGiLeiECJbLvBFTqplhVkWRpCS86gS6iiCXztvWVLIl9fqIaXtdnQv3KBEzmwErryAozeDFOccHM6OXOfX6I2Zdc',
    name: '李四',
    lastMessage: '太好了，这周末见！',
    time: '上午 10:45',
    isUnread: true,
    type: 'chat',
    credibility: 92,
    chatHistory: [
      { id: '1', sender: 'other', text: '你好！我的数字营销卡片发布啦，刚好看到你对产品设计有所建树呢。', timestamp: '上午 10:11' },
      { id: '2', sender: 'me', text: '你好呀，十分乐意！这周末双休日我刚好大半天空闲，我们可以碰头好好切磋切磋。', timestamp: '上午 10:30' },
      { id: '3', sender: 'other', text: '太好了，这周末见！', timestamp: '上午 10:45' }
    ]
  },
  {
    id: 'msg-2',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4qVbe-kcFOIToD0mIMxXwuI-KaPaFp8PL6WxL9bOZ9PsXWlQReiwFhIpkBzjwAjb9pajlGODvqyQynB_9OIuzs7A8lrOgLMFFv0zUIEY0xYV-i6aQ1q2QmPpcUm-uQa4v_7bcmdBmW-PWIn0WiAHVbMlItxPWa5qYKFLJJqL7geCBaCcA94gsDLzGt35mp8ikwe_7SkTM2oEIq32sQeVcoh8O4QW1Vzn2U-MKeTZsvwBtAvCrP6E2_5TqtigUkGMbOfPEepYyU4',
    name: '小王',
    lastMessage: '发送了技能互换邀请：UI 设计',
    time: '上午 09:12',
    isUnread: true,
    type: 'invitation',
    matchedSkillName: '技能交换邀请：UI 设计',
    invitationStatus: 'pending',
    credibility: 95,
    chatHistory: [
      { id: '1', sender: 'other', text: 'Hi 张三同学，我发起了跟你互换技能 UI 密码学的邀请，我希望学习你的 Python 代码。我能提供精细的产品交互和 Figma 知识。', timestamp: '上午 09:12' }
    ]
  },
  {
    id: 'msg-3',
    avatar: '',
    name: '系统官方',
    lastMessage: '你的平台信用百分值已免费提升至 90。',
    time: '昨天',
    isUnread: false,
    type: 'system'
  },
  {
    id: 'msg-4',
    avatar: '',
    name: '全栈学习小组 (4人)',
    lastMessage: '张三：有人有 React 模板吗？',
    time: '周三',
    isUnread: false,
    type: 'group',
    chatHistory: [
      { id: '1', sender: 'other', text: '哈喽大家，今天全栈共研进度如何了呀？', timestamp: '周三 15:00' },
      { id: '2', sender: 'me', text: '有人有 React 模板吗？急需一个起手脚架。', timestamp: '周三 15:40' }
    ]
  }
];

const DEFAULT_PROFILE: UserProfile = {
  name: '张三',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M',
  title: '易能达人',
  school: '上海财经大学',
  credibility: 95,
  energyValue: 240,
  swapCount: 12,
  activityHistory: [40, 65, 90, 55, 75, 100, 60],
  gender: '男',
  age: 21,
  occupation: '大学生',
  major: '数据科学与金融科技',
  membership: 'free',
  unlockedWhoViewedMe: false,
};

const BOT_RESPONSES: Record<string, string[]> = {
  '李四': [
    '太好了！我觉得这个时间很合适，咱们这周六下午在北京大学附近的知之咖啡馆见面吧？☕️',
    '没问题，我带上了我的平板和两个UI设计作品集，你可以当场帮我把把脉噢。',
    '太棒啦，那我就当你同意啦，周六不见不散！✨'
  ],
  '小王': [
    '哇，收到！谢谢你的热情赞赏！那咱们定线上 Zoom/腾讯会议 吧，我可以共享屏幕给你展示 UI 交互大厂流程噢。💻',
    '收到啦，这周末我时间比较充足，周日下午两点你看可以吗？',
    '嗯啊，十分期待接下来的精进共学！'
  ],
  'default': [
    '哈哈，收到啦！那我们要不要约个时间周末见面或者线上细聊呀？😀',
    '这个主意太酷啦！正好我对你的交换技能也特别感兴趣呢。',
    '赞，常来常往，期待合作共赢！🚀'
  ]
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'publish' | 'messages' | 'mine'>('home');
  const [skillsList, setSkillsList] = useState<SkillItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => localStorage.getItem('y_is_logged_in') !== 'false');
  
  // Custom alerts triggers
  const [popMessage, setPopMessage] = useState<string | null>(null);

  const handleLogin = (userProfile: UserProfile) => {
    setProfile(userProfile);
    localStorage.setItem('y_profile', JSON.stringify(userProfile));
    setIsLoggedIn(true);
    localStorage.setItem('y_is_logged_in', 'true');
    // Sync user profile to server
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(userProfile) }).catch(() => {});
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ preset: userProfile.name }) }).catch(() => {});
    triggerNotification(`🎉 欢迎回来，${userProfile.name}！登录成功`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('y_is_logged_in', 'false');
    triggerNotification('👋 您已安全退出当前账号登录');
  };

  // Synchronize localStorage and server on startup
  useEffect(() => {
    const savedSkills = localStorage.getItem('y_skills');
    const savedMessages = localStorage.getItem('y_messages');
    const savedProfile = localStorage.getItem('y_profile');

    // Load from server API first, fallback to localStorage
    Promise.all([
      apiFetch('/api/skills').catch(() => null),
      apiFetch('/api/messages').catch(() => null),
      apiFetch('/api/profile').catch(() => null),
    ]).then(([skillsRes, messagesRes, profileRes]) => {
      if (skillsRes?.data) {
        setSkillsList(skillsRes.data);
        localStorage.setItem('y_skills', JSON.stringify(skillsRes.data));
      } else if (savedSkills) {
        setSkillsList(JSON.parse(savedSkills));
      } else {
        setSkillsList(DEFAULT_SKILLS);
        localStorage.setItem('y_skills', JSON.stringify(DEFAULT_SKILLS));
      }

      if (messagesRes?.data) {
        setMessages(messagesRes.data);
        localStorage.setItem('y_messages', JSON.stringify(messagesRes.data));
      } else if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages(DEFAULT_MESSAGES);
        localStorage.setItem('y_messages', JSON.stringify(DEFAULT_MESSAGES));
      }

      if (profileRes?.data) {
        setProfile(profileRes.data);
        localStorage.setItem('y_profile', JSON.stringify(profileRes.data));
      } else if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile(DEFAULT_PROFILE);
        localStorage.setItem('y_profile', JSON.stringify(DEFAULT_PROFILE));
      }
    });
  }, []);

  // Update lists values with storage backups
  const handleUpdateSkillsList = (updated: SkillItem[]) => {
    setSkillsList(updated);
    localStorage.setItem('y_skills', JSON.stringify(updated));
  };

  const handleUpdateMessagesList = (updated: MessageItem[]) => {
    setMessages(updated);
    localStorage.setItem('y_messages', JSON.stringify(updated));
    // Sync to server (async)
    apiFetch('/api/messages/batch', { method: 'PUT', body: JSON.stringify({ messages: updated }) }).catch(() => {});
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem('y_profile', JSON.stringify(updated));
    // Sync to server (async)
    apiFetch('/api/profile', { method: 'PUT', body: JSON.stringify(updated) }).catch(() => {});
  };

  // Callback whenever publishing is achieved
  const handlePublishSuccess = (newSkillMeta: Omit<SkillItem, 'id' | 'userName' | 'userAvatar' | 'credibility' | 'rating' | 'matchScore'>) => {
    const freshSkillItem: SkillItem = {
      ...newSkillMeta,
      id: `created-${Date.now()}`,
      userName: profile.name,
      userAvatar: profile.avatar,
      credibility: profile.credibility,
      rating: 4.9,
      matchScore: 98,
      isNearby: true,
      school: profile.school,
      isUserCreated: true, // Tag identifying it easily inside mine
    };

    const nextSkills = [freshSkillItem, ...skillsList];
    handleUpdateSkillsList(nextSkills);
    // Sync new skill to server
    apiFetch('/api/skills', { method: 'POST', body: JSON.stringify(freshSkillItem) }).catch(() => {});

    // Increase user energy levels and heat activity value
    const nextActivity = [...profile.activityHistory];
    nextActivity[5] = Math.min(nextActivity[5] + 5, 100); // Highlight Sat activity column!

    handleUpdateProfile({
      ...profile,
      energyValue: profile.energyValue + 20, // Add 20 score!
      activityHistory: nextActivity,
    });

    // Automatically navigate back to home screen
    setTimeout(() => {
      setActiveTab('home');
    }, 500);
  };

  // Immediate Swap invitation submission callback
  const handleInitiateSwap = (targetSkill: SkillItem) => {
    // 1. Check if we already sent invitation or opened message thread
    const exists = messages.some((m) => m.name === targetSkill.userName && m.type === 'invitation');
    if (exists) {
      triggerNotification(`你已于近期向“${targetSkill.userName}”发送过了技能交换申请！`);
      return;
    }

    // 2. Append mock exchange card to the message system
    const nextInviteMsg: MessageItem = {
      id: `invite-${Date.now()}`,
      avatar: targetSkill.userAvatar,
      name: targetSkill.userName,
      lastMessage: `您向对方申请了技能互换: "${targetSkill.teachSkill}"`,
      time: '刚刚',
      isUnread: true,
      type: 'invitation',
      matchedSkillName: `技能交换邀请：${targetSkill.teachSkill}`,
      invitationStatus: 'pending',
      credibility: targetSkill.credibility,
      chatHistory: [
        {
          id: '1',
          sender: 'me',
          text: `你好，我是${profile.school || '上海财经大学'}的${profile.name}。我非常想学习你的“${targetSkill.teachSkill}”！我可以向你提供我的专业知识，咱们开始交流互换学技吧！`,
          timestamp: '刚刚',
        },
      ],
    };

    const nextMessages = [nextInviteMsg, ...messages];
    handleUpdateMessagesList(nextMessages);

    // Increase swap stats counter
    handleUpdateProfile({
      ...profile,
      swapCount: profile.swapCount + 1,
    });

    triggerNotification(`💡 申请发送成功！已同步学艺邀请至“消息”栏`);
  };

  // Click on direct Chat "私聊" widget logic
  const handleStartChat = (partnerName: string, initialMessage?: string) => {
    let existingChat = messages.find((m) => m.name === partnerName);

    if (!existingChat) {
      // Find matching avatar link
      const targetUser = skillsList.find((s) => s.userName === partnerName);
      const userImg = targetUser?.userAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAvvdNpOiNa1RwZcAVYRzqoKSVUmUMtzPYVTwdTXh4Wji38jHz6Onn7mgU-6c8hGAzKybUEwPJMRvR2EDmgU3EyyTJXdOfVxzj5LXInMxgF2deJWjyg8vagkJHQseGzcwI9xBEQcMvfWCI7gEOthVi1pWOm7gyxXnARpN0ivwp-1gkKCyiv7hyWGiLeiECJbLvBFTqplhVkWRpCS86gS6iiCXztvWVLIl9fqIaXtdnQv3KBEzmwErryAozeDFOccHM6OXOfX6I2Zdc';

      existingChat = {
        id: `chat-${Date.now()}`,
        avatar: userImg,
        name: partnerName,
        lastMessage: initialMessage || '你好，很高兴认识你！',
        time: '刚刚',
        isUnread: false,
        type: 'chat',
        credibility: targetUser?.credibility || 90,
        chatHistory: initialMessage
          ? [{ id: '1', sender: 'me', text: initialMessage, timestamp: '刚刚' }]
          : [],
      };

      const updatedMsgs = [existingChat, ...messages];
      handleUpdateMessagesList(updatedMsgs);
    }

    // Toggle Tab view instantly to messages segment
    setActiveTab('messages');
  };

  // Update single message item state (from Accept/Decline details inside chat modal)
  const handleUpdateMessage = (updated: MessageItem) => {
    const nextMsgs = messages.map((m) => (m.id === updated.id ? updated : m));
    handleUpdateMessagesList(nextMsgs);
  };

  // Simulated live message and BOT Auto-response system inside dialogue sheets
  // Simulated live message and natural AI interactive dialogue
  const handleSendMessage = async (chatId: string, text: string) => {
    const targetChat = messages.find((m) => m.id === chatId);
    if (!targetChat) return;

    const myNewMessage: ChatHistoryMessage = {
      id: `me-${Date.now()}`,
      sender: 'me',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextLogs = [...(targetChat.chatHistory || []), myNewMessage];
    const updatedChat: MessageItem = {
      ...targetChat,
      lastMessage: text,
      time: '刚刚',
      isUnread: false,
      chatHistory: nextLogs,
    };

    // Update state instantly so client typing sending is highly responsive with no latency!
    let latestMsgsList = messages.map((m) => (m.id === chatId ? updatedChat : m));
    handleUpdateMessagesList(latestMsgsList);

    // Find custom/partner skill info to feed into Gemini persona
    const targetUser = skillsList.find((s) => s.userName === targetChat.name);

    try {
      // Async API fetch from live Gemini backend proxy
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partnerName: targetChat.name,
          partnerSchool: targetUser?.school || (targetChat.name === '李四' ? '北京大学' : (targetChat.name === '小王' ? '清华大学' : '上海财经大学')),
          teachSkill: targetUser?.teachSkill || (targetChat.name === '李四' ? '数字营销运营' : (targetChat.name === '小王' ? 'UI 设计' : '开发技能')),
          learnSkill: targetUser?.learnSkill || (targetChat.name === '李四' ? '产品设计 & UI' : (targetChat.name === '小王' ? 'Python 代码' : '其他技能')),
          userName: profile.name,
          userSchool: profile.school,
          userMajor: profile.major,
          userGender: profile.gender,
          userAge: profile.age,
          userOccupation: profile.occupation,
          chatHistory: nextLogs,
          message: text,
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botReply: ChatHistoryMessage = {
          id: `bot-${Date.now()}`,
          sender: 'other',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const freshMessagesList = JSON.parse(localStorage.getItem('y_messages') || '[]');
        const currentTargetChat = freshMessagesList.find((m: MessageItem) => m.id === chatId) || updatedChat;
        const finalLogs = [...(currentTargetChat.chatHistory || []), botReply];
        const finalChat: MessageItem = {
          ...currentTargetChat,
          lastMessage: data.reply,
          time: '刚刚',
          isUnread: true,
          chatHistory: finalLogs,
        };

        const nextFinalMsgsList = freshMessagesList.map((m: MessageItem) =>
          m.id === chatId ? finalChat : m
        );
        handleUpdateMessagesList(nextFinalMsgsList);
      }
    } catch (err) {
      console.error('Failed to fetch Gemini dialogue reply:', err);
    }
  };

  // Callback to instantly remove/delete custom skill card from the catalog
  const handleRemoveSkill = (id: string) => {
    const nextSkills = skillsList.filter((s) => s.id !== id);
    handleUpdateSkillsList(nextSkills);
    // Sync delete to server
    apiFetch('/api/skills/' + id, { method: 'DELETE' }).catch(() => {});
    triggerNotification('❌ 您已成功下架该技能交换卡片');
  };

  // Callback to instantly delete chat/notification logs
  const handleDeleteChat = (chatId: string) => {
    const nextMessages = messages.filter((m) => m.id !== chatId);
    handleUpdateMessagesList(nextMessages);
    // Sync delete to server
    apiFetch('/api/messages/' + chatId, { method: 'DELETE' }).catch(() => {});
    triggerNotification('🗑️ 您已成功删除了该聊天记录');
  };

  // Setup visual notification banner timeouts
  const triggerNotification = (alertMsg: string) => {
    setPopMessage(alertMsg);
    setTimeout(() => {
      setPopMessage(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen pb-24 relative bg-[#f7fafd] flex flex-col font-sans antialiased">
      {/* Universal Brand AppBar */}
      {isLoggedIn && <Header title="易能" />}

      {/* Main Container Views with subtle fade animations */}
      <main className={`flex-1 px-4 max-w-screen-md mx-auto w-full ${isLoggedIn ? 'pt-20' : 'pt-4'}`}>
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="auth-login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LoginSection onLogin={handleLogin} />
            </motion.div>
          ) : (
            <>
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <HomeSection
                    skillsList={skillsList}
                    nearbyOnly={nearbyOnly}
                    setNearbyOnly={setNearbyOnly}
                    onInitiateSwap={handleInitiateSwap}
                    onStartChat={handleStartChat}
                    onDeleteSkill={handleRemoveSkill}
                  />
                </motion.div>
              )}

              {activeTab === 'publish' && (
                <motion.div
                  key="publish"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PublishSection onPublishSuccess={handlePublishSuccess} />
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessagesSection
                    messages={messages}
                    onUpdateMessage={handleUpdateMessage}
                    onSendMessage={handleSendMessage}
                    onDeleteChat={handleDeleteChat}
                  />
                </motion.div>
              )}

              {activeTab === 'mine' && (
                <motion.div
                  key="mine"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MineSection
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                    skillsList={skillsList}
                    onRemoveSkill={handleRemoveSkill}
                    onLogout={handleLogout}
                  />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button - Action Launcher that quickly triggers Publish */}
      {isLoggedIn && activeTab !== 'publish' && (
        <motion.button
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setActiveTab('publish')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-[#e7eb00] text-[#1c1d00] rounded-2xl shadow-lg shadow-[#606200]/15 flex items-center justify-center cursor-pointer transition-transform z-40 hover:brightness-105 border border-[#606200]/20"
        >
          <span className="material-symbols-outlined text-[32px] font-bold">add</span>
        </motion.button>
      )}

      {/* Safe bottom navigation bar identical to mockup visual details */}
      {isLoggedIn && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-between items-center px-3 py-2 bg-white/95 backdrop-blur-md shadow-[0px_-4px_20px_rgba(0,0,0,0.04)] z-50 rounded-t-2xl border-t border-[#e5e8eb] max-w-screen-md select-none pb-safe">
          {/* Tab 1: Home page */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#003ec7] bg-[#003ec7]/5'
                : 'text-[#434656] hover:bg-[#ebeef1]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}>
              auto_awesome
            </span>
            <span className="text-[11px] font-bold font-headline mt-0.5">首页</span>
          </button>

          {/* Tab 2: Publish screen */}
          <button
            onClick={() => setActiveTab('publish')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              activeTab === 'publish'
                ? 'text-[#003ec7] bg-[#003ec7]/5'
                : 'text-[#434656] hover:bg-[#ebeef1]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'publish' ? "'FILL' 1" : "'FILL' 0" }}>
              add_circle
            </span>
            <span className="text-[11px] font-bold font-headline mt-0.5">发布</span>
          </button>

          {/* Tab 3: Messages dashboard */}
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer relative ${
              activeTab === 'messages'
                ? 'text-[#003ec7] bg-[#003ec7]/5'
                : 'text-[#434656] hover:bg-[#ebeef1]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'messages' ? "'FILL' 1" : "'FILL' 0" }}>
              chat_bubble
            </span>
            <span className="text-[11px] font-bold font-headline mt-0.5">消息</span>
            {messages.some((m) => m.isUnread) && (
              <span className="absolute top-2 right-1/2 translate-x-4 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </button>

          {/* Tab 4: Mine Personal Space */}
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              activeTab === 'mine'
                ? 'text-[#003ec7] bg-[#003ec7]/5'
                : 'text-[#434656] hover:bg-[#ebeef1]/50'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'mine' ? "'FILL' 1" : "'FILL' 0" }}>
              person
            </span>
            <span className="text-[11px] font-bold font-headline mt-0.5">我的</span>
          </button>
        </nav>
      )}

      {/* Pop up system notifications banners */}
      <AnimatePresence>
        {popMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-4 bottom-28 bg-[#181c1e] text-white py-3.5 px-6 rounded-2xl shadow-xl z-50 text-xs font-bold leading-normal text-center max-w-sm mx-auto"
          >
            {popMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

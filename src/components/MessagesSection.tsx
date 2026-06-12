/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageItem, ChatHistoryMessage } from '../types';

interface MessagesSectionProps {
  messages: MessageItem[];
  onUpdateMessage: (updated: MessageItem) => void;
  onSendMessage: (chatId: string, text: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function MessagesSection({
  messages,
  onUpdateMessage,
  onSendMessage,
  onDeleteChat,
}: MessagesSectionProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'noti' | 'invite'>('all');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const activeChat = activeChatId ? messages.find((m) => m.id === activeChatId) || null : null;
  const [inputText, setInputText] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    id: string;
    name: string;
    clearAll: boolean;
  } | null>(null);

  // Filtering messages according to sub-tabs
  const filteredMessages = messages.filter((msg) => {
    if (activeTab === 'noti') return msg.type === 'system';
    if (activeTab === 'invite') return msg.type === 'invitation';
    return true; // 'all'
  });

  const handleOpenChat = (msg: MessageItem) => {
    // Clear unread status
    if (msg.isUnread) {
      onUpdateMessage({ ...msg, isUnread: false });
    }
    setActiveChatId(msg.id);
  };

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId) return;

    onSendMessage(activeChatId, inputText.trim());
    setInputText('');
  };

  const handleInvitationAction = (msg: MessageItem, status: 'accepted' | 'declined') => {
    const statusText = status === 'accepted' ? '已同意邀请' : '已拒绝邀请';
    
    // Create companion chat logs
    const helperMsg: ChatHistoryMessage = {
      id: `sys-${Date.now()}`,
      sender: 'me',
      text: status === 'accepted' 
        ? '💡 我已同意了你的技能交换申请！期待接下来与你的深度交流学技。' 
        : '抱歉，当前时间安排不便，下次有机会再交流。',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated: MessageItem = {
      ...msg,
      invitationStatus: status,
      lastMessage: status === 'accepted' ? '我们已达成技能交换！' : '已拒绝交换申请',
      chatHistory: [...(msg.chatHistory || []), helperMsg],
    };

    onUpdateMessage(updated);
  };

  return (
    <div className="space-y-4 pb-12 relative font-sans">
      {/* Messages Header Title & Sub Tabs */}
      <h2 className="text-2xl font-bold text-[#181c1e] font-headline select-none">
        我的通知
      </h2>

      {/* Filter Tabs matching mockup with underlines exact style */}
      <div className="flex items-center gap-8 border-b border-[#ebeef1] mb-2 select-none">
        <button
          onClick={() => setActiveTab('all')}
          className="relative pb-3 font-bold text-base transition-colors shrink-0"
        >
          <span className={activeTab === 'all' ? 'text-[#003ec7]' : 'text-[#434656]'}>
            消息
          </span>
          {activeTab === 'all' && (
            <motion.div
              layoutId="messageTabLine"
              className="absolute bottom-[-1px] left-0 right-0 h-1 bg-[#003ec7] rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('noti')}
          className="relative pb-3 font-bold text-base transition-colors shrink-0"
        >
          <span className={activeTab === 'noti' ? 'text-[#003ec7]' : 'text-[#434656]'}>
            通知
          </span>
          {activeTab === 'noti' && (
            <motion.div
              layoutId="messageTabLine"
              className="absolute bottom-[-1px] left-0 right-0 h-1 bg-[#003ec7] rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('invite')}
          className="relative pb-3 font-bold text-base transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span className={activeTab === 'invite' ? 'text-[#003ec7]' : 'text-[#434656]'}>
            邀请
          </span>
          <span className="w-2 h-2 bg-[#606200] rounded-full animate-bounce" />
          {activeTab === 'invite' && (
            <motion.div
              layoutId="messageTabLine"
              className="absolute bottom-[-1px] left-0 right-0 h-1 bg-[#003ec7] rounded-full"
            />
          )}
        </button>
      </div>

      {/* Chat Lists container */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredMessages.map((msg) => {
            const isInvitation = msg.type === 'invitation';
            return (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={() => handleOpenChat(msg)}
                className={`message-card group bg-white rounded-xl p-4 flex items-center gap-4 cursor-pointer relative overflow-hidden border ${
                  msg.isUnread ? 'border-[#003ec7]/20 bg-[#003ec7]/5' : 'border-transparent'
                }`}
              >
                {/* Invitation Green Indicator strip on Left border */}
                {isInvitation && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#e7eb00]" />
                )}

                {/* Avatar layout */}
                {msg.type === 'group' ? (
                  /* Group avatars bento grid layout exact */
                  <div className="grid grid-cols-2 gap-0.5 w-14 h-14 rounded-full overflow-hidden bg-[#ebeef1] p-0.5 shrink-0">
                    <img
                      className="w-full h-full object-cover rounded-tl-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKq-iqKq732Rfurl2-jdejmJw8Ro3XN6VY3zCcCU3mMB6VLmiUzWvJJ0CF-Lzd8OOj0rb3Qj_rLOfzh5nFcHmhgu3t2bdET78dEGiEuI4juHnTZlGqq0sP1hAhCBCqm6CewssRqi-fHcYWWX3DtGJTWwyo2L3nyCjYjBkPEFloEMUbY_n5J4MvaZ60XzCt50ZENXIBNjdRQ_idnbfDk3hYm_RSgcXtI9CR0t8gu5Q4kE38zurwhL-0XH_NGypRglDPE2PsMYxTT00"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      className="w-full h-full object-cover rounded-tr-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbbV0mbsT2ufGxIneR3jwibF7340kGlZO8N7Gy0mxoLcBBX0DGKO4-ZQlamOI2-f-QxuQ6vqnkE3WdPoIA6nD2bcSzcC-qG-ue8W3PtXMf448M5vYFOP-y7dx4pgzGD5VofaDt3kK-rOmVYXF1Ge-tMgGpxtsKp0snTfDZuK5kB_r-dshFQYbD74znw64oup7HrlHtHPVcrKU-0DcZht0VPJBww-Eehlmylv6NgThckc2WSOWRb4jF4M4JioCbLGt90lvrNCr9n0w"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      className="w-full h-full object-cover rounded-bl-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAiXEJma7pjbBIEr25Z2fZ8eAHM5f5Y8Kw-vZO6JignSvqbQqAQGLNWTJEQUtlkqmfx2cLxScgqNejHilz6z28hlLxhulCR6b5r2eRHAiutxE3_n2pCc2xDZTpIApyYMYzeXR7cZQOEHvu5dZucOUT5-jLL03hqfjIEBHY6AJSidsCsGBu6MjVLwIu9YoC5r2xSTa-uJlu-w1VEHU_TS9nbhhnm8Qst3H9RiByUy9p9zpfD79uP6gDNkv2kKZ9w09pGkt56KVZ3Q-M"
                      referrerPolicy="no-referrer"
                    />
                    <img
                      className="w-full h-full object-cover rounded-br-full"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYnxkE2obTrX8g4Ix4_EUuNpmxvwlkpFcfWiCiMsK0Bu2O_PlZpxevnu8k2WE56BXpoXQ5qH6KeiP-anqgoiaEw7ZEGefTEK5gsR7d9BptyDtZQsVon-7zMjerRit-NiZR0WQChzZ2adB0OzmvCGZYqSbHi-w2YgCvBGXcM9Y_Ji06Dx_Sg9zuGzBn7ujlMkOVVgf2w9BeW3_tkxd7-_IYN_gRvXaYuy6nDRKFiH_xvSXQHlXFgcMnWj8Hv1wixJnSA8ASMVXKfyU"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : msg.type === 'system' ? (
                  <div className="w-14 h-14 rounded-full bg-[#003ec7]/10 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[#003ec7] text-2xl font-bold">
                      security
                    </span>
                  </div>
                ) : (
                  <div className="relative shrink-0">
                    <img
                      className="w-14 h-14 rounded-full object-cover bg-[#ebeef1]"
                      src={msg.avatar}
                      referrerPolicy="no-referrer"
                    />
                    {msg.credibility && msg.credibility > 90 && (
                      <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-[#e7eb00] rounded-full border-2 border-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[9px] text-[#1c1d00] font-bold">
                          check
                        </span>
                      </div>
                    )}
                    {isInvitation && (
                      <div className="absolute -top-1 -right-1 bg-[#e7eb00] text-[#1c1d00] text-[9px] font-bold px-1 py-0.5 rounded-full border border-white shadow-xs">
                        新
                      </div>
                    )}
                  </div>
                )}

                {/* Content body info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-bold text-base text-[#181c1e] truncate flex items-center gap-1.5 flex-1 pr-1.5">
                      {msg.name}
                      {msg.type === 'invitation' && (
                        <span className="bg-[#dde1ff] text-[#0038b6] text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                          信用分 {msg.credibility}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[11px] text-[#737688] font-medium">
                        {msg.time}
                      </span>
                      <button
                        title="删除记录"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setDeleteConfirmation({
                            id: msg.id,
                            name: msg.name,
                            clearAll: false,
                          });
                        }}
                        className="w-11 h-11 rounded-full bg-[#f1f4f7] hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#737688]/80 transition-all cursor-pointer shrink-0 relative z-20"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Invitation special text styling */}
                  {isInvitation ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[#003ec7] text-[18px]">
                          swap_calls
                        </span>
                        <p className="text-[13px] text-[#003ec7] font-bold truncate">
                          {msg.matchedSkillName || '技能交换邀请'}
                        </p>
                      </div>
                      <p className="text-xs text-[#737688] truncate">{msg.lastMessage}</p>
                    </div>
                  ) : msg.type === 'system' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-[#e7eb00] rounded-full shrink-0 animate-pulse" />
                      <p className="text-sm text-[#434656] truncate">{msg.lastMessage}</p>
                    </div>
                  ) : (
                    <p className={`text-sm truncate ${msg.isUnread ? 'text-[#181c1e] font-semibold' : 'text-[#737688]'}`}>
                      {msg.lastMessage}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Interactive Chat Panel Sheet */}
      <AnimatePresence>
        {activeChat && (
          <>
            {/* Backdrop layer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveChatId(null)}
              className="fixed inset-0 bg-black z-[120]"
            />

            {/* Simulated Chat Dialogue Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 180 }}
              className="fixed bottom-0 left-0 w-full bg-[#f7fafd] rounded-t-[28px] z-[121] flex flex-col h-[85vh] shadow-2xl overflow-hidden max-w-xl mx-auto right-0"
            >
              {/* Top Handle and Avatar branding bar */}
              <div className="bg-white px-5 py-4 border-b border-[#e5e8eb] flex items-center justify-between shrink-0 shadow-sm relative">
                <div className="w-12 h-1 bg-[#e0e3e6] rounded-full absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => setActiveChatId(null)} />
                
                <div className="flex items-center gap-3 pt-2">
                  <img
                    alt="Chat Partner"
                    className="w-10 h-10 rounded-full object-cover border border-[#e5e8eb]"
                    src={activeChat.avatar}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="font-bold text-base text-[#181c1e]">
                      {activeChat.name}
                    </h3>
                    <p className="text-[10px] text-[#606200] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#e7eb00] rounded-full animate-ping" />
                      在线安全保障中
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-2 shrink-0">
                  <button
                    title="清空聊天记录并删除"
                    onClick={() => {
                      setDeleteConfirmation({
                        id: activeChat.id,
                        name: activeChat.name,
                        clearAll: true,
                      });
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-50 text-[#737688] hover:text-red-500 active:scale-90 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      delete
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveChatId(null)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#f1f4f7] active:scale-90 transition-all"
                  >
                    <span className="material-symbols-outlined text-[#181c1e] text-2xl font-bold">
                      close
                    </span>
                  </button>
                </div>
              </div>

              {/* Chat scrolling main log container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {/* General Invitation Box widgets inside active dialogue */}
                {activeChat.type === 'invitation' && (
                  <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#003ec7]/10 space-y-3">
                    <div className="flex gap-2 items-center">
                      <span className="material-symbols-outlined text-[#003ec7] text-[20px]">
                        verified_user
                      </span>
                      <p className="text-xs text-[#434656] font-bold">
                        易能官方安全技能互换邀约
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#181c1e]">
                        {activeChat.matchedSkillName}
                      </h4>
                      <p className="text-xs text-[#737688] mt-1">
                        对方发起人 <b>{activeChat.name}</b> 信用分较高，历史已被平台多轮双证核实。
                      </p>
                    </div>

                    {/* Pending Actions widgets */}
                    {(!activeChat.invitationStatus || activeChat.invitationStatus === 'pending') ? (
                      <div className="flex gap-2.5 pt-1">
                        <button
                          onClick={() => handleInvitationAction(activeChat, 'accepted')}
                          className="flex-1 bg-[#003ec7] text-white py-2.5 rounded-lg text-xs font-bold active:scale-95 duration-100 transition-transform"
                        >
                          同意交换
                        </button>
                        <button
                          onClick={() => handleInvitationAction(activeChat, 'declined')}
                          className="px-4 border border-[#c3c5d9] text-[#434656] py-2.5 rounded-lg text-xs font-semibold"
                        >
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <div className={`p-2 rounded-lg text-center font-bold text-xs ${
                        activeChat.invitationStatus === 'accepted'
                          ? 'bg-[#e4e800]/10 text-[#606200]'
                          : 'bg-[#f1f4f7] text-[#737688]'
                      }`}>
                        {activeChat.invitationStatus === 'accepted' ? '✓ 您已同意了此技能交换邀请' : '已拒绝此邀请'}
                      </div>
                    )}
                  </div>
                )}

                {/* Speech bubbles dialogue layout */}
                {activeChat.chatHistory && activeChat.chatHistory.map((bubble) => {
                  const isMe = bubble.sender === 'me';
                  return (
                    <div
                      key={bubble.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-[18px] px-4 py-2.5 shadow-xs text-sm ${
                          isMe
                            ? 'bg-[#003ec7] text-white rounded-tr-xs'
                            : 'bg-white text-[#181c1e] rounded-tl-xs border border-[#e5e8eb]'
                        }`}
                      >
                        <p className="leading-relaxed">{bubble.text}</p>
                        <p className={`text-[9px] text-right mt-1 opacity-60 font-mono`}>
                          {bubble.timestamp}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat input keyboard widget bar on bottom */}
              <form
                onSubmit={handleSend}
                className="bg-white border-t border-[#e5e8eb] p-3 flex items-center gap-2 shrink-0 pb-safe shadow-md"
              >
                <input
                  type="text"
                  className="flex-1 bg-[#f1f4f7] outline-none border-none rounded-xl h-11 px-4 text-sm font-sans placeholder:text-[#c3c5d9]"
                  placeholder="发送消息..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-11 h-11 bg-[#003ec7] text-white rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 duration-75 transition-all disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-lg">
                    send
                  </span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom styled dialog for message deletion to prevent iframe blocks */}
      <AnimatePresence>
        {deleteConfirmation && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmation(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[140]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-[35%] max-w-sm mx-auto bg-white p-6 rounded-2xl z-[141] shadow-2xl space-y-4 text-center border border-[#e5e8eb]"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <span className="material-symbols-outlined text-[32px]">delete_sweep</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-[#181c1e] font-headline">
                  {deleteConfirmation.clearAll ? '确认清空聊天并删除？' : '确认删除此会话记录？'}
                </h3>
                <p className="text-xs text-[#737688] leading-relaxed px-2">
                  {deleteConfirmation.clearAll 
                    ? `您确定要清空与 "${deleteConfirmation.name}" 的所有聊天记录，并删除该会话吗？`
                    : `您确定要从列表中彻底删除与 "${deleteConfirmation.name}" 的消息和通知记录吗？`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmation(null)}
                  className="bg-[#f1f4f7] hover:bg-[#e5e8eb] active:scale-95 text-[#434656] py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteConfirmation.clearAll) {
                      setActiveChatId(null);
                    }
                    onDeleteChat(deleteConfirmation.id);
                    setDeleteConfirmation(null);
                  }}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-red-200 transition-all cursor-pointer"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

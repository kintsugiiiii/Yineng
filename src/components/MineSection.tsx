/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, SkillItem } from '../types';

interface MineSectionProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  skillsList: SkillItem[];
  onRemoveSkill: (id: string) => void;
  onLogout: () => void;
}

export default function MineSection({
  profile,
  onUpdateProfile,
  skillsList,
  onRemoveSkill,
  onLogout,
}: MineSectionProps) {
  const [showEditNameModal, setShowEditNameModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Member Center interactive states
  const [showMemberCenter, setShowMemberCenter] = useState(false);
  const [showCheckoutForLevel, setShowCheckoutForLevel] = useState<'monthly' | 'yearly' | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [showWhoViewedMe, setShowWhoViewedMe] = useState(false);
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [payingState, setPayingState] = useState(false);
  
  // Custom edit states
  const [editName, setEditName] = useState(profile.name);
  const [editSchool, setEditSchool] = useState(profile.school);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editGender, setEditGender] = useState(profile.gender || '男');
  const [editAge, setEditAge] = useState(profile.age || 21);
  const [editOccupation, setEditOccupation] = useState(profile.occupation || '大学生');
  const [editMajor, setEditMajor] = useState(profile.major || '数据科学与金融科技');

  // User created skills count check
  const myCreatedSkills = skillsList.filter((s) => s.isUserCreated);

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: editName,
      school: editSchool,
      avatar: editAvatar,
      gender: editGender,
      age: Number(editAge),
      occupation: editOccupation,
      major: editMajor,
    });
    setShowEditNameModal(false);
  };

  const handleLocalImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB 噢！');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareSystem = () => {
    alert(`【易能】🎉 技能交换邀请！快来看看我的技能档案：我在“${profile.school}”分享，信用分高达 ${profile.credibility}，期待与你互换技能！`);
  };

  return (
    <div className="space-y-6 pb-12 font-sans relative">
      {/* Hero Profile Card Segment */}
      <section className={`relative bg-[#ffffff] p-5 rounded-xl border transition-all duration-500 custom-shadow overflow-hidden ${
        profile.membership === 'yearly'
          ? 'border-indigo-400/40 bg-gradient-to-br from-white via-white to-purple-50/20'
          : profile.membership === 'monthly'
            ? 'border-amber-300/40 bg-gradient-to-br from-white via-white to-amber-50/10'
            : 'border-[#c3c5d9]/30'
      }`}>
        {/* Decorative premium ambient gradients */}
        {profile.membership === 'yearly' ? (
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-400/10 rounded-full blur-3xl opacity-70 animate-pulse"></div>
        ) : profile.membership === 'monthly' ? (
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl opacity-50"></div>
        ) : (
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#dde1ff] rounded-full blur-3xl opacity-40"></div>
        )}

        <div className="relative flex items-center sm:items-start gap-4">
          <div className="relative shrink-0">
            <img
              alt="Avatar Profile"
              className={`w-20 h-20 rounded-full border-4 shadow-sm bg-[#dde1ff] object-cover transition-all duration-500 ${
                profile.membership === 'yearly'
                  ? 'border-purple-300 ring-4 ring-amber-400/60'
                  : profile.membership === 'monthly'
                    ? 'border-amber-200 ring-4 ring-amber-300/40'
                    : 'border-white'
              }`}
              src={profile.avatar}
              referrerPolicy="no-referrer"
            />
            <div className={`absolute bottom-0 right-0 rounded-full p-1 border-2 border-white flex items-center justify-center ${
              profile.membership === 'yearly'
                ? 'bg-gradient-to-r from-purple-600 to-amber-500'
                : profile.membership === 'monthly'
                  ? 'bg-amber-500'
                  : 'bg-[#003ec7]'
            }`}>
              <span className="material-symbols-outlined text-[14px] text-white font-bold leading-none">
                {profile.membership !== 'free' ? 'workspace_premium' : 'check_circle'}
              </span>
            </div>
          </div>
          <div className="flex-1 pt-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-[#181c1e] font-headline flex items-center gap-1">
                {profile.name}
              </h2>
              
              {/* Responsive VIP Labels and Badge structures */}
              {profile.membership === 'yearly' ? (
                <span className="bg-gradient-to-r from-purple-700 to-amber-500 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider flex items-center gap-1 shadow-xs border border-purple-400 animate-bounce">
                  <span className="material-symbols-outlined text-[10px] text-amber-300 font-black">workspace_premium</span>
                  尊享年员
                </span>
              ) : profile.membership === 'monthly' ? (
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider flex items-center gap-1 shadow-xs border border-amber-300">
                  <span className="material-symbols-outlined text-[10px] text-yellow-100 font-bold">star</span>
                  易能会员
                </span>
              ) : (
                <span className="bg-[#e7eb00] text-[#1c1d00] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {profile.title}
                </span>
              )}
            </div>
            
            <p className="text-sm text-[#434656] flex items-center gap-1 mt-1 font-medium">
              <span className="material-symbols-outlined text-[16px]">school</span>
              {profile.school}
            </p>

            {/* Extra User Details Row */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="bg-[#f1f4f7] text-[#434656] text-[11px] px-2.5 py-1 rounded-lg font-medium">
                {profile.gender || '男'}
              </span>
              <span className="bg-[#f1f4f7] text-[#434656] text-[11px] px-2.5 py-1 rounded-lg font-medium">
                {profile.age || 21}岁
              </span>
              <span className="bg-[#f1f4f7] text-[#434656] text-[11px] px-2.5 py-1 rounded-lg font-medium">
                {profile.occupation || '大学生'}
              </span>
              <span className="bg-[#f1f4f7] text-[#434656] text-[11px] px-2.5 py-1 rounded-lg font-medium">
                专业：{profile.major || '数据科学与金融科技'}
              </span>
              
              {/* Display Annual Medal Badge if upgraded to Year Plan */}
              {profile.membership === 'yearly' && (
                <span className="bg-gradient-to-r from-amber-50 to-purple-50 text-purple-700 text-[11px] px-2.5 py-1 rounded-lg font-bold border border-purple-200/50 flex items-center gap-1 shadow-xs">
                  🏅 专属年度勋章
                </span>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setEditName(profile.name);
                  setEditSchool(profile.school);
                  setEditAvatar(profile.avatar);
                  setEditGender(profile.gender || '男');
                  setEditAge(profile.age || 21);
                  setEditOccupation(profile.occupation || '大学生');
                  setEditMajor(profile.major || '数据科学与金融科技');
                  setShowEditNameModal(true);
                }}
                className="bg-[#003ec7] text-white text-xs px-5 py-2.5 rounded-full active:scale-95 duration-150 transition-all font-semibold shadow-xs"
              >
                编辑资料
              </button>
              <button
                onClick={handleShareSystem}
                className="bg-[#e4e800] text-[#1c1d00] text-xs px-5 py-2.5 rounded-full active:scale-95 duration-150 transition-all font-semibold"
              >
                分享
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Row matches mockup exact numbers */}
      <section className="grid grid-cols-3 gap-3">
        <div
          onClick={() => setShowCreditModal(true)}
          className="bg-white p-4 rounded-xl border border-transparent hover:border-[#dde1ff] transition-all custom-shadow flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <span className="text-[24px] font-extrabold text-[#003ec7] font-headline">
            {profile.credibility}
          </span>
          <span className="text-[11px] text-[#434656] mt-0.5 font-medium">
            信用分
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-b-2 border-b-[#e7eb00] custom-shadow flex flex-col items-center justify-center text-center">
          <span className="text-[24px] font-extrabold text-[#003ec7] font-headline">
            {profile.energyValue}
          </span>
          <span className="text-[11px] text-[#434656] mt-0.5 font-medium">
            易能值
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-transparent custom-shadow flex flex-col items-center justify-center text-center">
          <span className="text-[24px] font-extrabold text-[#003ec7] font-headline">
            {profile.swapCount}
          </span>
          <span className="text-[11px] text-[#434656] mt-0.5 font-medium">
            互换次数
          </span>
        </div>
      </section>

      {/* Core Lists of action directories with toggle and count disclosures */}
      <section className="space-y-3">
        <div className="bg-white rounded-xl border border-[#c3c5d9]/20 custom-shadow overflow-hidden">
          {/* Skills archives toggle item */}
          <div
            onClick={() => setShowArchive(!showArchive)}
            className="p-4 flex items-center justify-between hover:bg-[#ebeef1]/40 active:bg-[#ebeef1]/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#dde1ff] flex items-center justify-center text-[#003ec7]">
                <span className="material-symbols-outlined text-[20px] font-bold">
                  inventory_2
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#181c1e]">
                  我的技能档案
                </p>
                <p className="text-[11px] text-[#737688]">
                  已发布技能 {myCreatedSkills.length}
                </p>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-[#737688] transition-transform ${
                showArchive ? 'rotate-90' : 'group-hover:translate-x-1'
              }`}
            >
              chevron_right
            </span>
          </div>

          <AnimatePresence>
            {showArchive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-[#f1f4f7]/40 border-t border-[#e5e8eb] px-4 py-2 division-y shrink-0"
              >
                {myCreatedSkills.length === 0 ? (
                  <p className="text-xs text-[#737688] py-4 text-center">
                    目前尚未发布任何技能，点击导航栏中间 “+” 按钮即刻发布吧！
                  </p>
                ) : (
                  myCreatedSkills.map((s) => (
                    <div
                      key={s.id}
                      className="py-3 flex items-center justify-between border-b last:border-0 border-[#e5e8eb]"
                    >
                      <div>
                        <span className="bg-[#003ec7]/10 text-[#003ec7] text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {s.proficiency === 'beginner' ? '初学' : s.proficiency === 'intermediate' ? '中级' : '专业'}
                        </span>
                        <h4 className="font-bold text-sm text-[#181c1e] mt-1">
                          {s.teachSkill !== '根据您的定制要求' ? s.teachSkill : s.learnSkill}
                        </h4>
                        <p className="text-[10px] text-[#737688] mt-0.5">
                          时间方式: {s.time} / {s.method === 'online' ? '线上' : '线下'}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveSkill(s.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 bg-[#ffdad6] rounded-md"
                      >
                        删除
                      </button>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-[1px] bg-[#ebeef1] mx-4"></div>

          {/* Credit Record safeguard metrics */}
          <div
            onClick={() => setShowCreditModal(true)}
            className="p-4 flex items-center justify-between hover:bg-[#ebeef1]/40 active:bg-[#ebeef1]/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e4e800]/10 flex items-center justify-center text-[#606200]">
                <span className="material-symbols-outlined text-[20px] font-bold">
                  verified
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#181c1e]">
                  信用记录
                </p>
                <p className="text-[11px] text-[#737688]">
                  5 级安全核实保障
                </p>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#737688] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          <div className="h-[1px] bg-[#ebeef1] mx-4"></div>

          {/* Who Viewed Me (谁看过我) sub-directory */}
          <div
            onClick={() => {
              if (profile.membership && profile.membership !== 'free') {
                setShowWhoViewedMe(true);
              } else {
                setShowMemberCenter(true);
              }
            }}
            className="p-4 flex items-center justify-between hover:bg-[#ebeef1]/40 active:bg-[#ebeef1]/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                <span className="material-symbols-outlined text-[20px] font-bold">
                  visibility
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#181c1e] flex items-center gap-1.5">
                  谁看过我
                  {(!profile.membership || profile.membership === 'free') && (
                    <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5 pointer-events-none">
                      <span className="material-symbols-outlined text-[10px] font-black">lock</span>
                      VIP 专属
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-[#737688]">
                  {(!profile.membership || profile.membership === 'free')
                    ? '升级会员后即可解锁最近名片访客'
                    : '本月有 3 位同校/附近技能达人访问过您'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {(!profile.membership || profile.membership === 'free') ? (
                <span className="text-[11px] text-amber-600 font-extrabold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/55 shadow-2xs">立即解锁</span>
              ) : (
                <div className="flex -space-x-2 mr-1">
                  <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKq-iqKq732Rfurl2-jdejmJw8Ro3XN6VY3zCcCU3mMB6VLmiUzWvJJ0CF-Lzd8OOj0rb3Qj_rLOfzh5nFcHmhgu3t2bdET78dEGiEuI4juHnTZlGqq0sP1hAhCBCqm6CewssRqi-fHcYWWX3DtGJTWwyo2L3nyCjYjBkPEFloEMUbY_n5J4MvaZ60XzCt50ZENXIBNjdRQ_idnbfDk3hYm_RSgcXtI9CR0t8gu5Q4kE38zurwhL-0XH_NGypRglDPE2PsMYxTT00" referrerPolicy="no-referrer" />
                  <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbbV0mbsT2ufGxIneR3jwibF7340kGlZO8N7Gy0mxoLcBBX0DGKO4-ZQlamOI2-f-QxuQ6vqnkE3WdPoIA6nD2bcSzcC-qG-ue8W3PtXMf448M5vYFOP-y7dx4pgzGD5VofaDt3kK-rOmVYXF1Ge-tMgGpxtsKp0snTfDZuK5kB_r-dshFQYbD74znw64oup7HrlHtHPVcrKU-0DcZht0VPJBww-Eehlmylv6NgThckc2WSOWRb4jF4M4JioCbLGt90lvrNCr9n0w" referrerPolicy="no-referrer" />
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-pink-100 flex items-center justify-center text-[8px] text-pink-600 font-bold font-mono font-black">+3</div>
                </div>
              )}
              <span className="material-symbols-outlined text-[#737688] group-hover:translate-x-1 transition-transform">
                chevron_right
              </span>
            </div>
          </div>
        </div>

        {/* Member Center Promotion Banner card matches mockup nicely */}
        <div className={`relative p-5 rounded-2xl text-white overflow-hidden shadow-md transition-all duration-500 bg-gradient-to-r ${
          profile.membership === 'yearly'
            ? 'from-purple-800 to-indigo-700 border border-purple-500/40'
            : profile.membership === 'monthly'
              ? 'from-amber-600 to-amber-500 border border-amber-400/40'
              : 'from-[#003ec7] to-[#0052ff]'
        }`}>
          {/* Oblique glass flare */}
          <div className="absolute top-0 right-0 w-32 h-full bg-white/10 skew-x-12 shrink-0"></div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-1.5">
              <span className={`px-3 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest leading-none block w-max shadow-sm ${
                profile.membership === 'yearly'
                  ? 'bg-amber-400 text-purple-950 animate-pulse'
                  : profile.membership === 'monthly'
                    ? 'bg-amber-100 text-amber-950'
                    : 'bg-[#e7eb00] text-[#1c1d00]'
              }`}>
                {profile.membership === 'yearly' ? '尊贵年会员' : profile.membership === 'monthly' ? '易能专享会员' : '高级会员'}
              </span>
              
              {profile.membership !== 'free' && (
                <span className="text-[10px] text-yellow-200 font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  权益生效中
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold font-headline flex items-center gap-1.5">
                  会员中心
                  {profile.membership === 'yearly' && <span className="text-sm">👑</span>}
                </h3>
                <p className="text-[11px] text-white/80 mt-1 font-medium">
                  {profile.membership !== 'free' 
                    ? '已为您解锁无限发起、优先匹配、访客雷达等全部高阶权益' 
                    : '解锁专属技能资源、优先匹配与“谁看过我”高阶特权通道'}
                </p>
              </div>
              <button
                onClick={() => setShowMemberCenter(true)}
                className={`px-5 py-2.5 rounded-full text-xs font-black active:scale-95 duration-100 transition-all shadow-md shrink-0 block hover:opacity-95 ${
                  profile.membership === 'yearly'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-purple-950 border border-amber-300'
                    : profile.membership === 'monthly'
                      ? 'bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-950 border border-amber-200'
                      : 'bg-[#606200] text-white'
                }`}
              >
                {profile.membership !== 'free' ? '查看权益' : '立即探索'}
              </button>
            </div>
          </div>
        </div>

        {/* Settings directory log line */}
        <div className="bg-white rounded-xl border border-[#c3c5d9]/10 custom-shadow overflow-hidden">
          <div
            onClick={() => {
              const res = confirm('确定要重置当前易能学艺系统的模拟状态，恢复默认最初数据吗？');
              if (res) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="p-4 flex items-center justify-between hover:bg-[#ebeef1]/40 active:bg-[#ebeef1]/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f1f4f7] flex items-center justify-center text-[#434656]">
                <span className="material-symbols-outlined text-[20px]">
                  settings
                </span>
              </div>
              <p className="text-sm font-bold text-[#181c1e]">重置并清理易能缓存</p>
            </div>
            <span className="material-symbols-outlined text-[#737688] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          <div className="h-[1px] bg-[#ebeef1] mx-4"></div>

          {/* Help & manual document link */}
          <div
            onClick={() => setShowHelpModal(true)}
            className="p-4 flex items-center justify-between hover:bg-[#ebeef1]/40 active:bg-[#ebeef1]/80 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f1f4f7] flex items-center justify-center text-[#434656]">
                <span className="material-symbols-outlined text-[20px]">
                  help
                </span>
              </div>
              <p className="text-sm font-bold text-[#181c1e]">帮助与支持 FAQ</p>
            </div>
            <span className="material-symbols-outlined text-[#737688] group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>

          <div className="h-[1px] bg-[#ebeef1] mx-4"></div>

          {/* Logout button */}
          <div
            onClick={() => setShowLogoutConfirm(true)}
            className="p-4 flex items-center justify-between hover:bg-red-50/60 active:bg-red-100 transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100/40 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
              </div>
              <p className="text-sm font-bold text-red-600">退出登录</p>
            </div>
            <span className="material-symbols-outlined text-red-600 group-hover:translate-x-1 transition-transform">
              chevron_right
            </span>
          </div>
        </div>
      </section>

      {/* Activity Bar Chart Heatmap exact look */}
      <section className="bg-white p-5 rounded-2xl custom-shadow border border-[#c3c5d9]/15 select-none space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#181c1e] font-headline">
            本周学艺活跃度
          </h3>
          <span className="text-xs text-[#003ec7] flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#003ec7] animate-ping"></span>
            当前在线
          </span>
        </div>

        {/* Dynamic bar charts heights matching active list perfectly */}
        <div className="flex justify-between items-end h-28 gap-2 px-1">
          {profile.activityHistory.map((height, idx) => {
            const isHighlighted = idx === 2 || idx === 4 || idx === 5; // Matches highlighted bars
            const daysNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            return (
              <div key={idx} className="flex-1 flex flex-col items-center group">
                <div className="w-full bg-[#f1f4f7] rounded-t-md h-24 flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                    className={`w-full rounded-t-md cursor-pointer transition-all duration-300 group-hover:brightness-105 ${
                      isHighlighted
                        ? 'bg-gradient-to-t from-[#cbce00] to-[#e4e800] shadow-[0_-3px_8px_rgba(228,232,0,0.3)]'
                        : 'bg-[#e5e8eb] group-hover:bg-[#c3c5d9]'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between px-1 text-[10px] text-[#737688] font-bold font-mono">
          <span>周一</span>
          <span>周二</span>
          <span>周三</span>
          <span>周四</span>
          <span>周五</span>
          <span>周六</span>
          <span>周日</span>
        </div>
      </section>

      {/* High Fidelity Edit profile Form Sheet popup */}
      <AnimatePresence>
        {showEditNameModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditNameModal(false)}
              className="fixed inset-0 bg-black z-[130]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white rounded-t-[28px] p-6 z-[131] shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto pb-10"
            >
              <h3 className="text-lg font-bold text-[#181c1e] font-headline">
                修改个人学艺档案
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#434656] font-bold">
                    学艺昵称
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#f1f4f7] py-3 px-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#003ec7]/25 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#434656] font-bold">
                    所属机构 / 院校
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-[#f1f4f7] py-3 px-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#003ec7]/25 text-sm"
                    value={editSchool}
                    onChange={(e) => setEditSchool(e.target.value)}
                  />
                </div>

                {/* Additional UGC Profile Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold">
                      性别设置
                    </label>
                    <select
                      className="w-full bg-[#f1f4f7] py-3 px-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#003ec7]/25 text-sm cursor-pointer"
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="保密">保密</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold">
                      年龄
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      className="w-full bg-[#f1f4f7] py-3 px-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#003ec7]/25 text-sm"
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold">
                      职业名称
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#f1f4f7] py-3 px-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#003ec7]/25 text-sm"
                      placeholder="例如：大学生 / 设计师"
                      value={editOccupation}
                      onChange={(e) => setEditOccupation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold">
                      专业设置
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-[#f1f4f7] py-3 px-4 rounded-xl border-none outline-none focus:ring-2 focus:ring-[#003ec7]/25 text-sm"
                      placeholder="例如：计算机科学"
                      value={editMajor}
                      onChange={(e) => setEditMajor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-[#434656] font-bold block">
                    更换系统头像样式 / 自定义头像
                  </label>
                  
                  {/* Preset Avatars Row */}
                  <div className="space-y-1 bg-[#f8fafc] p-3 rounded-xl border border-[#c3c5d9]/25">
                    <span className="text-[10px] text-[#737688] font-bold block mb-1">
                      选择系统默认预设头像：
                    </span>
                    <div className="flex gap-4 overflow-x-auto py-1">
                      {[
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M',
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4qVbe-kcFOIToD0mIMxXwuI-KaPaFp8PL6WxL9bOZ9PsXWlQReiwFhIpkBzjwAjb9pajlGODvqyQynB_9OIuzs7A8lrOgLMFFv0zUIEY0xYV-i6aQ1q2QmPpcUm-uQa4v_7bcmdBmW-PWIn0WiAHVbMlItxPWa5qYKFLJJqL7geCBaCcA94gsDLzGt35mp8ikwe_7SkTM2oEIq32sQeVcoh8O4QW1Vzn2U-MKeTZsvwBtAvCrP6E2_5TqtigUkGMbOfPEepYyU4',
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmSz8-eNXmeqw2CcuSrU_oUqiCYWrhP1eWlKHmYOy2n18fWCGxO24QyWEdeQ_0KoHOcUQyoT0niqBXmNxvwP4eRKrYnoIhihrMuQujYUI-RvuysummYLC2ICPbSSu9_MwEOw_B9vvo2tJkHqVOJDSf0BsgV4lXNmxBBgYWVCNIVlPdu9IjMoaxRmq0unPCwhZd_WAyUGfCMIQyvXczFjH6x3MQnTzcCk0r0t_6TczF9DCDXvVo_Xl2WTVwOT2C5v3Qu6s4hhzcg6o',
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo',
                      ].map((imgUrl, idx) => (
                        <img
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(imgUrl)}
                          className={`w-12 h-12 rounded-full cursor-pointer border-2 object-cover ${
                            editAvatar === imgUrl
                              ? 'border-[#003ec7] ring-2 ring-[#003ec7]/15 scale-105'
                              : 'border-transparent hover:scale-105'
                          }`}
                          src={imgUrl}
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Custom Upload & Custom URL Section */}
                  <div className="bg-[#f8fafc] p-3 rounded-xl border border-[#c3c5d9]/25 space-y-3">
                    <span className="text-[10px] text-[#737688] font-bold block">
                      自定义头像选项：
                    </span>
                    
                    <div className="flex items-center gap-3">
                      {/* Current Custom Preview (only if it doesn't match predefined system images) */}
                      {editAvatar && ![
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M',
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4qVbe-kcFOIToD0mIMxXwuI-KaPaFp8PL6WxL9bOZ9PsXWlQReiwFhIpkBzjwAjb9pajlGODvqyQynB_9OIuzs7A8lrOgLMFFv0zUIEY0xYV-i6aQ1q2QmPpcUm-uQa4v_7bcmdBmW-PWIn0WiAHVbMlItxPWa5qYKFLJJqL7geCBaCcA94gsDLzGt35mp8ikwe_7SkTM2oEIq32sQeVcoh8O4QW1Vzn2U-MKeTZsvwBtAvCrP6E2_5TqtigUkGMbOfPEepYyU4',
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCmSz8-eNXmeqw2CcuSrU_oUqiCYWrhP1eWlKHmYOy2n18fWCGxO24QyWEdeQ_0KoHOcUQyoT0niqBXmNxvwP4eRKrYnoIhihrMuQujYUI-RvuysummYLC2ICPbSSu9_MwEOw_B9vvo2tJkHqVOJDSf0BsgV4lXNmxBBgYWVCNIVlPdu9IjMoaxRmq0unPCwhZd_WAyUGfCMIQyvXczFjH6x3MQnTzcCk0r0t_6TczF9DCDXvVo_Xl2WTVwOT2C5v3Qu6s4hhzcg6o',
                        'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo',
                      ].includes(editAvatar) && (
                        <div className="relative">
                          <img
                            src={editAvatar}
                            className="w-12 h-12 rounded-full border-2 border-[#003ec7] ring-2 ring-[#003ec7]/15 object-cover"
                            alt="Custom Preview"
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -bottom-1 -right-1 bg-[#003ec7] text-white rounded-full p-0.5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                          </span>
                        </div>
                      )}

                      {/* File Uploader Target */}
                      <label 
                        htmlFor="custom-avatar-file"
                        className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#c3c5d9] rounded-xl p-3 bg-white hover:bg-[#003ec7]/5 hover:border-[#003ec7] cursor-pointer transition-colors text-center"
                      >
                        <span className="material-symbols-outlined text-[#003ec7] text-xl">upload_file</span>
                        <span className="text-[11px] font-medium text-[#434656] mt-1">本地图片上传</span>
                        <span className="text-[9px] text-[#737688]">支持 PNG/JPG 等</span>
                        <input
                          id="custom-avatar-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLocalImageUpload}
                        />
                      </label>
                    </div>

                    {/* Image URL Paste Field */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#737688] font-bold block">或者输入/粘贴网络图片链接：</span>
                      <input
                        type="url"
                        placeholder="http://... 或 base64 data"
                        className="w-full bg-white py-2 px-3 rounded-lg border border-[#c3c5d9]/40 outline-none focus:border-[#003ec7] text-xs font-mono"
                        value={editAvatar.startsWith('data:') ? '' : editAvatar}
                        onChange={(e) => {
                          if (e.target.value.trim()) {
                            setEditAvatar(e.target.value.trim());
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-[#003ec7] text-white py-3 rounded-xl text-sm font-bold active:scale-95 transition-all"
                  >
                    保存更新
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditNameModal(false)}
                    className="px-5 bg-[#f1f4f7] text-[#434656] hover:bg-[#e5e8eb] py-3 rounded-xl text-sm font-bold"
                  >
                    取消
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Credit System safeguard Details popup info */}
      <AnimatePresence>
        {showCreditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreditModal(false)}
              className="fixed inset-0 bg-black z-[130]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-sm mx-auto bg-white rounded-[24px] p-6 z-[131] shadow-2xl space-y-4"
            >
              <div className="flex gap-2.5 items-center text-[#606200]">
                <span className="material-symbols-outlined text-[32px]">
                  security
                </span>
                <h3 className="text-lg font-bold font-headline text-[#181c1e]">
                  易能信用保障详情
                </h3>
              </div>
              <p className="text-xs text-[#434656] leading-relaxed">
                当前信用分：<b>{profile.credibility} 分 (极佳)</b>。
              </p>
              <div className="space-y-2.5">
                {[
                  '实名实证：绑定高校邮箱/教育身份核实认证 (+50分)',
                  '历史评价：社区零学术学术投诉或爽约记录 (+30分)',
                  '分享互助：多次完成同校/附近技能交换 (+15分)',
                  '5级护航体系：保证在线私信交流、预约线下无纠纷。',
                ].map((l, i) => (
                  <p key={i} className="text-xs text-[#737688]">
                    {l}
                  </p>
                ))}
              </div>
              <button
                onClick={() => setShowCreditModal(false)}
                className="w-full bg-[#003ec7] text-white py-3 rounded-xl text-xs font-bold mt-4"
              >
                我知道了
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Guide FAQ sheet */}
      <AnimatePresence>
        {showHelpModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="fixed inset-0 bg-black z-[130]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-white rounded-t-[28px] p-6 z-[131] shadow-2xl space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-[#181c1e] font-headline">
                常见问题与指南 FAQ
              </h3>
              <div className="space-y-4 text-xs text-[#434656] leading-relaxed select-text">
                <div>
                  <h4 className="font-bold text-sm text-[#003ec7] mb-1">
                    什么是“易能”技能学艺系统？
                  </h4>
                  <p>
                    易能（YiNeng）是一个完全基于青年信用评分打造的去金钱化、纯技能价值流转互换平台。支持发布自己所拥有的专长，或者发布我想学的兴趣，寻找附近的达人即刻1对1发起交换。
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#003ec7] mb-1">
                    “易能值”是如何流动的？
                  </h4>
                  <p>
                    每次您成功发起并且完成一期技能交换、或者新发布了优质技能、信用维持极佳，易能值均会自动奖励提升。累积充足的易能值可以优先对接清华北大等金牌学长达人老师哦！
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#003ec7] mb-1">
                    在线聊天安全如何保障？
                  </h4>
                  <p>
                    平台集成官方信用双证，每次在消息栏确认交换前，可要求对方亮出对应的5级信用体系凭证，杜绝不良广告与欺诈纠纷。
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-[#f1f4f7] py-3 text-xs text-[#434656] font-bold rounded-xl mt-4"
              >
                关闭
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Styled React Logout Confirmation Dialog (Avoids blocked native confirm() in sandboxed iframe) */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="fixed inset-0 bg-black z-[140]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="fixed inset-x-4 top-[35%] max-w-sm mx-auto bg-white p-6 rounded-2xl z-[141] shadow-2xl space-y-4 text-center border border-[#e5e8eb]"
            >
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                <span className="material-symbols-outlined text-[32px]">logout</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-[#181c1e] font-headline">
                  确认要退出当前账号吗？
                </h3>
                <p className="text-xs text-[#737688] leading-relaxed px-2">
                  退出后，您需要重新在登录页输入手机号或选择免注册Preset角色继续流转学艺。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="bg-[#f1f4f7] hover:bg-[#e5e8eb] active:scale-95 text-[#434656] py-3 rounded-xl text-xs font-bold transition-all"
                >
                  取消 / 先不退
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    onLogout();
                  }}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-red-200 transition-all"
                >
                  确认退出
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 1. MEMBERSHIP LEVEL CENTER MODAL SHEET */}
      <AnimatePresence>
        {showMemberCenter && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMemberCenter(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-subtle z-[130]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#f7fafd] rounded-t-[28px] z-[131] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Header section */}
              <div className="bg-white px-5 py-4 border-b border-[#e5e8eb] flex items-center justify-between shrink-0 shadow-xs relative">
                <div 
                  className="w-12 h-1 bg-[#e0e3e6] rounded-full absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer" 
                  onClick={() => setShowMemberCenter(false)} 
                />
                <div className="flex items-center gap-2.5 pt-2">
                  <span className="material-symbols-outlined text-[#003ec7] text-[26px] font-black">workspace_premium</span>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#181c1e] font-headline">
                      会员特权中心 & 等级说明
                    </h3>
                    <p className="text-[10px] text-[#737688]">
                      加入易能 VIP，尊享金牌学长推荐权重
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMemberCenter(false)}
                  className="w-8 h-8 rounded-full bg-[#f1f4f7] flex items-center justify-center text-[#434656] font-bold text-lg pt-2 mt-2"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Scrolling comparison grid list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar pb-6 select-none">
                
                {/* Active user state warning card */}
                <div className="bg-[#003ec7]/5 rounded-2xl p-4 border border-[#003ec7]/10 flex items-center gap-3">
                  <img
                    alt="Active Avatar"
                    className="w-12 h-12 rounded-full border-2 border-white object-cover"
                    src={profile.avatar}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-xs text-[#737688]">当前登录账户</p>
                    <p className="text-sm font-bold text-[#181c1e] flex items-center gap-1.5 mt-0.5">
                      {profile.name}
                      <span className="bg-[#f0f2f5] text-[#434656] text-[9px] px-2 py-0.5 rounded-full font-bold">
                        {profile.membership === 'yearly' ? '👑 年度会员' : profile.membership === 'monthly' ? '🌟 易能会员' : '⏳ 普通用户'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* TIER COMPARISON LISTING */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-[#434656] tracking-wider uppercase">
                    可升级会员等级说明
                  </h4>
                  
                  {/* TIER 1: Ordinary User */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 bg-white ${
                    !profile.membership || profile.membership === 'free'
                      ? 'border-emerald-500 shadow-sm bg-emerald-50/5 ring-2 ring-emerald-500/15'
                      : 'border-[#c3c5d9]/35'
                  }`}>
                    <div className="flex items-start gap-1 justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-[#181c1e] text-base">普通用户 (Free)</h4>
                        {(!profile.membership || profile.membership === 'free') && (
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                            当前会籍
                          </span>
                        )}
                      </div>
                      <span className="text-base font-black text-[#1c1d00] shrink-0">免费</span>
                    </div>
                    <p className="text-[10px] text-[#737688] -mt-1 mb-3">专享基础交换服务</p>
                    <div className="space-y-2.5 pt-2 border-t border-[#e5e8eb]/80">
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-emerald-600 text-base font-bold">check_circle</span>
                        <span>每月可发起 <b>15 次</b> 技能交换请求</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-emerald-600 text-base font-bold">check_circle</span>
                        <span>每日最多查看 <b>50 个</b> 技能用户名片</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-emerald-600 text-base font-bold">check_circle</span>
                        <span>基础匹配排序规则</span>
                      </div>
                    </div>
                  </div>

                  {/* TIER 2: Monthly VIP User */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 bg-white overflow-hidden ${
                    profile.membership === 'monthly'
                      ? 'border-amber-400 shadow-md bg-amber-50/5 ring-2 ring-amber-400/20'
                      : 'border-amber-200 hover:border-amber-400/60'
                  }`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                    <div className="flex items-start gap-1 justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-amber-950 text-base flex items-center gap-1">
                          易能会员 (VIP)
                          <span className="material-symbols-outlined text-amber-500 text-sm font-bold">star</span>
                        </h4>
                        {profile.membership === 'monthly' && (
                          <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                            当前会籍
                          </span>
                        )}
                      </div>
                      <span className="text-base font-black text-amber-600 font-headline shrink-0">¥ 19.9/月</span>
                    </div>
                    <p className="text-[10px] text-amber-700/80 -mt-1 mb-3">解锁无限交流，专属闪靓金色高标</p>
                    <div className="space-y-2.5 pt-2 border-t border-amber-100">
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-amber-500 text-base font-bold animate-pulse">workspace_premium</span>
                        <span><b>无限次</b> 发起技能交换请求特权</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-amber-500 text-base font-bold">workspace_premium</span>
                        <span>优先匹配建议，系统名片<b>排名靠前</b></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-amber-500 text-base font-bold">workspace_premium</span>
                        <span className="flex items-center gap-1">
                          专属<b>金色标识</b>外显
                          <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">VIP</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-amber-500 text-base font-bold">workspace_premium</span>
                        <span>全站<b>免除任何内置广告</b>烦恼</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-amber-500 text-base font-bold">workspace_premium</span>
                        <span className="font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                          新增：可解锁查看“谁看过我”名单
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      {profile.membership === 'monthly' ? (
                        <button className="w-full bg-[#f1f4f7] text-[#737688] text-xs font-bold py-2.5 rounded-xl cursor-default" disabled>
                          您当前已是此等级
                        </button>
                      ) : profile.membership === 'yearly' ? (
                        <button className="w-full bg-[#f1f4f7] text-[#737688] text-xs font-bold py-2.5 rounded-xl cursor-default" disabled>
                          您已拥有更高级别年会员特权
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowCheckoutForLevel('monthly')}
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-black py-2.5 rounded-xl shadow-md border border-amber-400 shadow-amber-200 active:scale-95 duration-100 transition-all cursor-pointer"
                        >
                          立即开通 · 19.9 元/月
                        </button>
                      )}
                    </div>
                  </div>

                  {/* TIER 3: Yearly VIP User (Extra certification) */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 bg-white overflow-hidden ${
                    profile.membership === 'yearly'
                      ? 'border-purple-500 shadow-md bg-purple-50/5 ring-2 ring-purple-500/20'
                      : 'border-purple-200 hover:border-purple-500/60'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl pointer-events-none animate-pulse" />
                    <div className="flex items-start gap-1 justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-purple-700 to-amber-500 text-white text-[8px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow-xs shrink-0">
                          超值年度尊享
                        </div>
                        <h4 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-800 to-amber-600 text-base flex items-center gap-1">
                          年度会员 (LIFETIME)
                        </h4>
                        {profile.membership === 'yearly' && (
                          <span className="bg-purple-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shrink-0">
                            当前会籍
                          </span>
                        )}
                      </div>
                      <span className="text-base font-black text-purple-700 font-headline flex flex-col text-right shrink-0">
                        <span>¥ 199/年</span>
                        <span className="text-[8px] text-amber-600 line-through font-normal">原价 ¥238.8</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-700 -mt-1 mb-3 font-medium">额外赠送免费技能核验认证与年度奖章</p>
                    <div className="space-y-2.5 pt-2 border-t border-purple-100">
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-purple-600 text-base font-bold animate-pulse">workspace_premium</span>
                        <span>同上拥有<b>无限次交换 + 优先匹配 + 免广告</b>特权</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-purple-600 text-base font-bold animate-pulse">workspace_premium</span>
                        <span>拥有年员<b>专属访客分析系统</b>（谁看过我功能）</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-purple-600 text-base font-bold animate-pulse">workspace_premium</span>
                        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-amber-600">
                          额外赠送 1 次免费官方技能认证 (价值 9.9 元)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#434656]">
                        <span className="material-symbols-outlined text-purple-600 text-base font-bold animate-pulse">workspace_premium</span>
                        <span className="font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/50 flex items-center gap-1">
                          🏅 个人名片附带专属年度勋章！
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      {profile.membership === 'yearly' ? (
                        <button className="w-full bg-[#f1f4f7] text-[#737688] text-xs font-bold py-2.5 rounded-xl cursor-default" disabled>
                          您当前已是此等级
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowCheckoutForLevel('yearly')}
                          className="w-full bg-gradient-to-r from-purple-700 to-amber-500 text-white text-xs font-black py-2.5 rounded-xl shadow-lg border border-purple-400 active:scale-95 duration-100 transition-all cursor-pointer"
                        >
                          立即开通 · 199 元/年 (立省 ¥39)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Bottom footer bar description */}
              <div className="bg-white border-t border-[#e5e8eb] p-4 text-center shrink-0">
                <p className="text-[10px] text-[#737688]">订阅即代表同意《易能学技安全守信服务及会员协议与保障制度》</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. REALTIME SIMULATED SECURE PAY CHECKOUT DIALOG */}
      <AnimatePresence>
        {showCheckoutForLevel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!payingState) {
                  setShowCheckoutForLevel(null);
                  setCheckoutSuccess(false);
                }
              }}
              className="fixed inset-0 bg-black z-[140]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="fixed inset-x-4 top-[20%] max-w-sm mx-auto bg-white p-6 rounded-2xl z-[141] shadow-2xl space-y-4 border border-[#e5e8eb]"
            >
              {!checkoutSuccess ? (
                <>
                  <div className="text-center space-y-1">
                    <span className="material-symbols-outlined text-[36px] text-[#003ec7] font-bold">payments</span>
                    <h3 className="text-base font-black text-[#181c1e] font-headline">
                      易能校友信用支付中心
                    </h3>
                    <p className="text-xs text-[#737688]">
                      您正在订购: <b>{showCheckoutForLevel === 'yearly' ? '易能校友尊享年度会员 (1 年)' : '易能月度会员 (30 天)'}</b>
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-[#c3c5d9]/25 text-center mt-2.5">
                    <span className="text-[10px] text-[#737688] block">结算应付总额:</span>
                    <span className={`text-2xl font-black font-headline block mt-0.5 ${
                      showCheckoutForLevel === 'yearly' ? 'text-purple-700' : 'text-amber-500'
                    }`}>
                      ¥ {showCheckoutForLevel === 'yearly' ? '199.00' : '19.90'}
                    </span>
                  </div>

                  {/* Payment Methods selector */}
                  <div className="space-y-2 pt-2 select-none">
                    <span className="text-[10px] text-[#434656] font-bold block">选择支付接口:</span>
                    
                    {/* WeChat Pay */}
                    <div
                      onClick={() => !payingState && setPayMethod('wechat')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        payMethod === 'wechat'
                          ? 'border-emerald-500 bg-emerald-50/5'
                          : 'border-[#c3c5d9]/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-emerald-600 font-bold">wallet</span>
                        <span className="text-xs font-bold text-[#181c1e]">微信扫码支付 (WeChat Pay)</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        payMethod === 'wechat' ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-[#c3c5d9]'
                      }`}>
                        {payMethod === 'wechat' && <span className="material-symbols-outlined text-[10px]">check</span>}
                      </div>
                    </div>

                    {/* Alipay */}
                    <div
                      onClick={() => !payingState && setPayMethod('alipay')}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                        payMethod === 'alipay'
                          ? 'border-blue-500 bg-blue-50/5'
                          : 'border-[#c3c5d9]/30'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-blue-600 font-bold">account_balance_wallet</span>
                        <span className="text-xs font-bold text-[#181c1e]">支付宝付款码 (Alipay Online)</span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        payMethod === 'alipay' ? 'border-blue-500 bg-blue-600 text-white' : 'border-[#c3c5d9]'
                      }`}>
                        {payMethod === 'alipay' && <span className="material-symbols-outlined text-[10px]">check</span>}
                      </div>
                    </div>
                  </div>

                  {/* CTA Checkout payment submission buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      type="button"
                      disabled={payingState}
                      onClick={() => setShowCheckoutForLevel(null)}
                      className="bg-[#f1f4f7] hover:bg-[#e5e8eb] text-[#434656] py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
                    >
                      取消支付
                    </button>
                    
                    <button
                      type="button"
                      disabled={payingState}
                      onClick={() => {
                        setPayingState(true);
                        setTimeout(() => {
                          setPayingState(false);
                          setCheckoutSuccess(true);
                          onUpdateProfile({
                            ...profile,
                            membership: showCheckoutForLevel,
                            title: showCheckoutForLevel === 'yearly' ? '👑 年度勋章会员' : '🌟 易能会员'
                          });
                        }, 1300);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-1 transition-all ${
                        payingState
                          ? 'bg-gray-400 cursor-wait'
                          : payMethod === 'wechat'
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                      }`}
                    >
                      {payingState ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          安全对账中...
                        </>
                      ) : (
                        '确认模拟支付'
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                    <span className="material-symbols-outlined text-[38px] font-black">done_outline</span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-extrabold text-[#181c1e] font-headline">
                      🎉 恭喜开通会籍成功！
                    </h3>
                    <p className="text-xs text-[#434656] leading-relaxed px-2">
                      安全对账核实完美无误！系统已向您的名片下发专属<b>{showCheckoutForLevel === 'yearly' ? '年度勋章会员 (专属年度勋章已激活)' : '易能月度会员'}</b>特权资格。无限次发起、排名优先及访客雷达功能现在全部已解锁就绪。
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowCheckoutForLevel(null);
                      setCheckoutSuccess(false);
                      setShowMemberCenter(false);
                    }}
                    className="w-full bg-[#003ec7] text-white py-3 rounded-xl text-xs font-bold shadow-md shadow-[#003ec7]/15 transition-all active:scale-95 cursor-pointer"
                  >
                    我知道了，即刻返回我的主页
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. "WHO VIEWED ME" VISITOR RADAR SHEET MODAL */}
      <AnimatePresence>
        {showWhoViewedMe && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWhoViewedMe(false)}
              className="fixed inset-0 bg-black/50 z-[130]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-[#f7fafd] rounded-t-[28px] z-[131] shadow-2xl flex flex-col h-[75vh] overflow-hidden"
            >
              {/* Header section */}
              <div className="bg-white px-5 py-4 border-b border-[#e5e8eb] flex items-center justify-between shrink-0 shadow-xs relative">
                <div 
                  className="w-12 h-1 bg-[#e0e3e6] rounded-full absolute top-2 left-1/2 -translate-x-1/2 cursor-pointer" 
                  onClick={() => setShowWhoViewedMe(false)} 
                />
                <div className="flex items-center gap-2.5 pt-2">
                  <span className="material-symbols-outlined text-pink-600 text-[26px]">visibility</span>
                  <div>
                    <h3 className="font-extrabold text-lg text-[#181c1e] font-headline flex items-center gap-1.5">
                      谁看过我 访客雷达
                      <span className="bg-pink-100 text-pink-700 text-[9px] px-2 py-0.5 rounded-full font-bold">LIVE</span>
                    </h3>
                    <p className="text-[10px] text-[#737688]">近期同校/附近浏览关注您技能主页的同学档案</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWhoViewedMe(false)}
                  className="w-8 h-8 rounded-full bg-[#f1f4f7] flex items-center justify-center text-[#434656]"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* Visitors scrolling stream list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar pb-10">
                {[
                  {
                    name: '顾清流',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKq-iqKq732Rfurl2-jdejmJw8Ro3XN6VY3zCcCU3mMB6VLmiUzWvJJ0CF-Lzd8OOj0rb3Qj_rLOfzh5nFcHmhgu3t2bdET78dEGiEuI4juHnTZlGqq0sP1hAhCBCqm6CewssRqi-fHcYWWX3DtGJTWwyo2L3nyCjYjBkPEFloEMUbY_n5J4MvaZ60XzCt50ZENXIBNjdRQ_idnbfDk3hYm_RSgcXtI9CR0t8gu5Q4kE38zurwhL-0XH_NGypRglDPE2PsMYxTT00',
                    school: '北京大学 · 应用经济学 · 本科',
                    swapTag: '擅长：Python量化分析 / 想学：创意油画',
                    time: '今天 14:32',
                    credibility: 98,
                  },
                  {
                    name: '叶知秋',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbbV0mbsT2ufGxIneR3jwibF7340kGlZO8N7Gy0mxoLcBBX0DGKO4-ZQlamOI2-f-QxuQ6vqnkE3WdPoIA6nD2bcSzcC-qG-ue8W3PtXMf448M5vYFOP-y7dx4pgzGD5VofaDt3kK-rOmVYXF1Ge-tMgGpxtsKp0snTfDZuK5kB_r-dshFQYbD74znw64oup7HrlHtHPVcrKU-0DcZht0VPJBww-Eehlmylv6NgThckc2WSOWRb4jF4M4JioCbLGt90lvrNCr9n0w',
                    school: '复旦大学 · 软件工程 · 硕士',
                    swapTag: '擅长：React & Node开发 / 想学：雅思口语',
                    time: '今天 10:15',
                    credibility: 96,
                  },
                  {
                    name: '林筱筱',
                    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiXEJma7pjbBIEr25Z2fZ8eAHM5f5Y8Kw-vZO6JignSvqbQqAQGLNWTJEQUtlkqmfx2cLxScgqNejHilz6z28hlLxhulCR6b5r2eRHAiutxE3_n2pCc2xDZTpIApyYMYzeXR7cZQOEHvu5dZucOUT5-jLL03hqfjIEBHY6AJSidsCsGBu6MjVLwIu9YoC5r2xSTa-uJlu-w1VEHU_TS9nbhhnm8Qst3H9RiByUy9p9zpfD79uP6gDNkv2kKZ9w09pGkt56KVZ3Q-M',
                    school: '上海交通大学 · 创意设计 · 本科',
                    swapTag: '擅长：UI/UX & Figma / 想学：初级日语',
                    time: '昨天 19:40',
                    credibility: 99,
                  }
                ].map((vis, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-[#c3c5d9]/25 flex items-start gap-3.5 relative overflow-hidden shadow-xs hover:border-[#003ec7]/30 transition-all">
                    <img
                      src={vis.avatar}
                      className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#e5e8eb]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-extrabold text-sm text-[#181c1e] truncate">{vis.name}</h4>
                          <span className="bg-emerald-50 text-emerald-700 text-[8px] font-black px-1 rounded-sm border border-emerald-200">
                            信 {vis.credibility}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#737688] shrink-0 font-medium">{vis.time}</span>
                      </div>
                      
                      <p className="text-[11px] text-[#434656] truncate font-medium">{vis.school}</p>
                      
                      <p className="text-[10px] text-pink-600 font-bold truncate bg-pink-50/40 p-1.5 rounded-lg border border-pink-100/30">
                        {vis.swapTag}
                      </p>
                    </div>

                    {/* Instant Action CTA button inside Visitors Row */}
                    <button
                      onClick={() => {
                        setShowWhoViewedMe(false);
                        alert(`已模拟通过系统5级保证，为您的账户下发主动与 "${vis.name}" 私下对接特权通知！你可以即刻前往【消息】版块与对方开展流转沟通啦。`);
                      }}
                      className="absolute bottom-2.5 right-3 px-3 py-1.5 bg-[#003ec7]/5 hover:bg-[#003ec7] hover:text-white text-[#003ec7] text-[10px] font-extrabold rounded-md shadow-2xs transition-colors duration-150 cursor-pointer"
                    >
                      即刻私聊
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface LoginSectionProps {
  onLogin: (profile: UserProfile) => void;
}

const PRESET_USERS: UserProfile[] = [
  {
    name: '张三',
    title: '易能之星',
    school: '上海财经大学',
    major: '数据科学与金融科技',
    occupation: '大学生',
    gender: '男',
    age: 21,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M',
    credibility: 95,
    energyValue: 240,
    swapCount: 12,
    activityHistory: [40, 65, 90, 55, 75, 100, 60],
  },
  {
    name: '李知夏',
    title: '认证实证达人',
    school: '复旦大学',
    major: '视觉传达设计',
    occupation: '大三学生',
    gender: '女',
    age: 20,
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo',
    credibility: 98,
    energyValue: 180,
    swapCount: 8,
    activityHistory: [50, 40, 80, 95, 70, 60, 45],
  }
];

export default function LoginSection({ onLogin }: LoginSectionProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Custom sign up register state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('上海财经大学');
  const [regMajor, setRegMajor] = useState('计算机科学与技术');
  const [regGender, setRegGender] = useState('男');
  const [regAge, setRegAge] = useState(21);
  const [regOccupation, setRegOccupation] = useState('大学生');
  const [regAvatar, setRegAvatar] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setErrorMessage('请输入正确的11位手机号码');
      return;
    }
    setErrorMessage(null);
    setIsSendingCode(true);
    setCountdown(60);

    // Simulated verification code timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSendingCode(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Pre-fill a realistic mock verification code
    setTimeout(() => {
      setCode('1234');
    }, 1000);
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setErrorMessage('请输入合法的11位手机号码');
      return;
    }
    if (code !== '1234') {
      setErrorMessage('验证码无效 (请输入正确的验证码 1234)');
      return;
    }

    // Login successfully with defaults or temporary custom details
    const targetProfile: UserProfile = {
      name: '学艺达人',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M',
      title: '易能之星',
      school: '上海财经大学',
      credibility: 90,
      energyValue: 100,
      swapCount: 0,
      activityHistory: [10, 20, 30, 40, 50, 60, 70],
      gender: '男',
      age: 20,
      occupation: '学生',
      major: '金融科技',
    };

    onLogin(targetProfile);
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setErrorMessage('昵称必填噢！');
      return;
    }

    const customProfile: UserProfile = {
      name: regName.trim(),
      avatar: regAvatar,
      title: '认证萌新',
      school: regSchool.trim() || '上海财经大学',
      credibility: 90,
      energyValue: 120,
      swapCount: 0,
      activityHistory: [20, 35, 10, 40, 30, 80, 50],
      gender: regGender,
      age: regAge,
      occupation: regOccupation,
      major: regMajor.trim() || '通用学识',
    };

    onLogin(customProfile);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex flex-col justify-between py-4 font-sans antialiased text-[#181c1e] max-w-screen-md mx-auto relative select-none">
      {/* Decorative colored visual blob elements */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-[#003ec7]/5 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute bottom-20 right-10 w-60 h-60 bg-[#e7eb00]/10 rounded-full blur-3xl opacity-50"></div>

      {/* Header and Branding Title bar */}
      <header className="flex items-center gap-2 pt-6 shrink-0 justify-center">
        <div className="w-9 h-9 rounded-xl bg-[#003ec7] flex items-center justify-center shadow-md">
          <span className="material-symbols-outlined text-white text-xl font-bold">verified_user</span>
        </div>
        <h1 className="text-2xl font-black text-[#003ec7] italic font-headline tracking-wider">
          易能 <span className="text-xs not-italic font-sans text-[#737688] font-bold">YiNeng Platform</span>
        </h1>
      </header>

      {/* Primary Card View block */}
      <main className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-8">
        <AnimatePresence mode="wait">
          {!isRegisterMode ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold font-headline tracking-tight text-[#181c1e]">
                  欢迎来到技能互换社区
                </h2>
                <p className="text-xs text-[#737688] font-medium leading-relaxed">
                  中国高校达人私享的学术与生活专长交换系统。纯粹、无摩擦、更靠谱。
                </p>
              </div>

              {/* Login Options / Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#434656] font-bold">手机号码</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#737688] font-bold">
                      +86
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="请输入11位手机号"
                      maxLength={11}
                      className="w-full bg-white border border-[#c3c5d9]/40 py-3.5 pl-14 pr-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003ec7]/25 focus:border-[#003ec7] transition-all"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#434656] font-bold">短信验证码</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="输入4位验证码"
                      className="flex-1 bg-white border border-[#c3c5d9]/40 py-3.5 px-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#003ec7]/25 focus:border-[#003ec7] transition-all font-mono tracking-wider"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    />
                    <button
                      type="button"
                      disabled={isSendingCode || !phone}
                      onClick={handleSendCode}
                      className="whitespace-nowrap px-4 bg-[#dde1ff] hover:bg-[#003ec7]/10 text-[#003ec7] disabled:opacity-60 disabled:pointer-events-none rounded-xl text-xs font-bold transition-all active:scale-95"
                    >
                      {isSendingCode ? `${countdown}s 后重新发送` : '获取验证码'}
                    </button>
                  </div>
                  <span className="text-[10px] text-[#737688] block pt-0.5 leading-tight">
                    💡 内部沙箱环境输入手机号点击获取，即可自动填入默认验证码 <b className="text-[#003ec7]">1234</b> 完成登录。
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#003ec7] hover:bg-[#0035a8] text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md active:scale-98 transition-all duration-150"
                >
                  验证并登录
                </button>
              </form>

              {/* Multi Preset quick login options */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="h-[1px] bg-[#c3c5d9]/30 flex-1"></div>
                  <span className="text-[10px] text-[#737688] font-bold uppercase tracking-widest">
                    免注册快速体验通道
                  </span>
                  <div className="h-[1px] bg-[#c3c5d9]/30 flex-1"></div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {PRESET_USERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onLogin(preset)}
                      className="flex items-center gap-2.5 bg-white border border-[#c3c5d9]/30 hover:border-[#003ec7] p-2.5 rounded-xl active:scale-95 transition-all text-left shadow-xs"
                    >
                      <img
                        src={preset.avatar}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full bg-[#dde1ff] border border-white shrink-0 object-cover"
                        alt={preset.name}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#181c1e] truncate">{preset.name}</p>
                        <p className="text-[10px] text-[#737688] truncate">{preset.school}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom footer buttons */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setIsRegisterMode(true);
                  }}
                  className="text-xs text-[#003ec7] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">person_add</span>
                  创建新我的个人名片 / 注册加入 ➜
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-xl font-bold font-headline tracking-tight text-[#181c1e]">
                  建立您的易能学艺档案
                </h2>
                <p className="text-xs text-[#737688] font-medium leading-relaxed">
                  填写您真实的个人情况，立获 54分 高校初始信用分！
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1.5 pb-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#434656] font-bold block">学艺昵称 / 姓名</label>
                  <input
                    type="text"
                    required
                    placeholder="如：白敬亭 / 小艾同学"
                    maxLength={10}
                    className="w-full bg-white border border-[#c3c5d9]/40 py-3 px-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#003ec7] transition-all"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold block">目标学校</label>
                    <input
                      type="text"
                      required
                      placeholder="例如：上海财经大学"
                      className="w-full bg-white border border-[#c3c5d9]/40 py-3 px-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#003ec7]"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold block">专业设置</label>
                    <input
                      type="text"
                      required
                      placeholder="例如：数据科学"
                      className="w-full bg-white border border-[#c3c5d9]/40 py-3 px-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#003ec7]"
                      value={regMajor}
                      onChange={(e) => setRegMajor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold block">性别</label>
                    <select
                      className="w-full bg-white border border-[#c3c5d9]/40 py-3 px-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#003ec7] cursor-pointer"
                      value={regGender}
                      onChange={(e) => setRegGender(e.target.value)}
                    >
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="保密">保密</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-[#434656] font-bold block">身份/职业</label>
                    <input
                      type="text"
                      required
                      placeholder="例如：大学本科生"
                      className="w-full bg-white border border-[#c3c5d9]/40 py-3 px-4 rounded-xl text-sm"
                      value={regOccupation}
                      onChange={(e) => setRegOccupation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#434656] font-bold block">挑选默认头像款式</label>
                  <div className="flex gap-4 overflow-x-auto py-1 bg-white p-2 border border-[#c3c5d9]/20 rounded-xl">
                    {[
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuB5F_k4dxVckhakTKWSvNPIYBxj1Qd6Kei5JRxGjuxvF_sYhEa3jU-Aqo4chHU8Qe_Wc57Sqbo5qQFtolOd3tN-jcT4kA6vpNcG2dwqgktCZO8Wt9de-YWB2rRglhC46FeyDNaC2w641RxLDuGBOKJzYvlGji49O4Iew_ndtvLZeK8dz0l2jtjQGZgWlXp8B-Fo3fCQgp634SBgCW1zjBSzQlvQBgT7Xxg7MbMSQ-e7uWzjIlu2Wj3_jyYbDUtRg1IUgh7TMOcpC4M',
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJ4qVbe-kcFOIToD0mIMxXwuI-KaPaFp8PL6WxL9bOZ9PsXWlQReiwFhIpkBzjwAjb9pajlGODvqyQynB_9OIuzs7A8lrOgLMFFv0zUIEY0xYV-i6aQ1q2QmPpcUm-uQa4v_7bcmdBmW-PWIn0WiAHVbMlItxPWa5qYKFLJJqL7geCBaCcA94gsDLzGt35mp8ikwe_7SkTM2oEIq32sQeVcoh8O4QW1Vzn2U-MKeTZsvwBtAvCrP6E2_5TqtigUkGMbOfPEepYyU4',
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCmSz8-eNXmeqw2CcuSrU_oUqiCYWrhP1eWlKHmYOy2n18fWCGxO24QyWEdeQ_0KoHOcUQyoT0niqBXmNxvwP4eRKrYnoIhihrMuQujYUI-RvuysummYLC2ICPbSSu9_MwEOw_B9vvo2tJkHqVOJDSf0BsgV4lXNmxBBgYWVCNIVlPdu9IjMoaxRmq0unPCwhZd_WAyUGfCMIQyvXczFjH6x3MQnTzcCk0r0t_6TczF9DCDXvVo_Xl2WTVwOT2C5v3Qu6s4hhzcg6o',
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPZOJRXhlW75-TmcOcUeT5i2fsjUDW3blJ8bCgmsinTyPNjWR6IZmyOB2cUj7RZNFqGOvoORxKQqmEgWNtsjtrIdDgSgqmNZisNrDC-gU_C4Mua2CREhcwYGBOB_FAKmI1pgr_r7qnoApaj5zej3UY44SngKgwJMjodJNODJmgWaRymfjdsvJYAj0274rz4wWH7tjUS8nmvoC1rHJpmuvjAIer7pvdnsmAjZmT1g5foGGwDE3_DdC2Cy3kGynmnn3-RX1o1Aq-kuo',
                    ].map((avatarUrl, idx) => (
                      <img
                        key={idx}
                        type="button"
                        onClick={() => setRegAvatar(avatarUrl)}
                        className={`w-11 h-11 rounded-full cursor-pointer object-cover border-2 shrink-0 ${
                          regAvatar === avatarUrl ? 'border-[#003ec7] scale-105' : 'border-transparent hover:scale-105'
                        }`}
                        src={avatarUrl}
                        referrerPolicy="no-referrer"
                        alt={`Avatar ${idx}`}
                      />
                    ))}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-100">
                    ⚠️ {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#181c1e] hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md active:scale-98 transition-all"
                >
                  创建并进入体验
                </button>
              </form>

              <div className="text-center pt-1">
                <button
                  onClick={() => {
                    setErrorMessage(null);
                    setIsRegisterMode(false);
                  }}
                  className="text-xs text-[#737688] font-bold hover:underline inline-flex items-center gap-1"
                >
                  ← 返回手机号验证码登录
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Safety Compliance Statement */}
      <footer className="shrink-0 text-center text-[10px] text-[#737688] px-4 space-y-1 select-none">
        <p>🛡️ 本系统已经过教育部“高校技能学艺”安全委员会官方双重校验认证</p>
        <p className="text-[9px] opacity-80">
          登入即代表您已同意 《易能高校交换服务条款》 及 《数据隐私权安全承诺书》
        </p>
        <p className="text-[8px] mt-1 font-mono text-[#dde1ff] select-all">App ID: 34aa8ce1-f1b5-4939-9b72-6e15bad632cf</p>
      </footer>
    </div>
  );
}

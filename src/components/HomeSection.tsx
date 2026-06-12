/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SkillItem } from '../types';

interface HomeSectionProps {
  skillsList: SkillItem[];
  nearbyOnly: boolean;
  setNearbyOnly: (val: boolean) => void;
  onInitiateSwap: (item: SkillItem) => void;
  onStartChat: (userName: string, initialMessage?: string) => void;
  onDeleteSkill: (id: string) => void;
}

export default function HomeSection({
  skillsList,
  nearbyOnly,
  setNearbyOnly,
  onInitiateSwap,
  onStartChat,
  onDeleteSkill,
}: HomeSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Dynamic skill item filtering
  const filteredSkills = skillsList.filter((item) => {
    // Nearby filter check
    if (nearbyOnly && !item.isNearby) {
      return false;
    }
    // Query filter check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTeach = item.teachSkill.toLowerCase().includes(q);
      const matchLearn = item.learnSkill.toLowerCase().includes(q);
      const matchUser = item.userName.toLowerCase().includes(q);
      const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTeach || matchLearn || matchUser || matchTags;
    }
    return true;
  });

  // Hot skills details block clicks
  const handleHotSkillClick = (skillName: string) => {
    setSearchQuery(skillName);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Filter Area */}
      <section className="space-y-4">
        <div
          className={`relative transition-all duration-300 ${
            searchFocused ? 'scale-[1.02]' : 'scale-100'
          }`}
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-[#737688]">search</span>
          </div>
          <input
            type="text"
            className="w-full h-12 pl-12 pr-10 bg-[#f1f4f7] border-none rounded-xl focus:ring-2 focus:ring-[#003ec7]/20 focus:bg-[#ffffff] transition-all font-sans text-[#181c1e] text-base placeholder:text-[#c3c5d9] outline-none"
            placeholder="搜索技能或用户..."
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 w-6 h-6 rounded-full bg-[#ebeef1] flex items-center justify-center text-[#434656]"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#434656] font-sans">
              附近
            </span>
            <button
              id="nearbyToggle"
              onClick={() => setNearbyOnly(!nearbyOnly)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors relative duration-300 ${
                nearbyOnly ? 'bg-[#e7eb00]' : 'bg-[#e0e3e6]'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  nearbyOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            <span
              onClick={() => {
                setNearbyOnly(false);
                setSearchQuery('');
              }}
              className="bg-[#e7eb00] text-[#1c1d00] text-[12px] font-semibold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer hover:opacity-90 active:scale-95 transition-all"
            >
              信用分 90+
            </span>
            <span
              onClick={() => handleHotSkillClick('UI')}
              className="bg-[#e5e8eb] text-[#434656] text-[12px] font-semibold px-3 py-1 rounded-full whitespace-nowrap cursor-pointer hover:bg-[#ebeef1] active:scale-95 transition-all"
            >
              快速匹配
            </span>
          </div>
        </div>
      </section>

      {/* Today's Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#181c1e] font-headline">
            今日推荐
          </h2>
          <span
            onClick={() => {
              setSearchQuery('');
              setNearbyOnly(false);
            }}
            className="text-xs font-semibold text-[#003ec7] cursor-pointer hover:underline"
          >
            查看全部
          </span>
        </div>

        {/* Primary Recommendation Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                key={item.id}
                className="bg-white rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative border border-transparent hover:border-[#003ec7]/10 transition-all message-card"
              >
                {/* Beautiful custom in-card delete action confirmation overlay */}
                <AnimatePresence>
                  {confirmDeleteId === item.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-red-50/95 backdrop-blur-xs z-10 flex flex-col items-center justify-center p-6 text-center"
                    >
                      <span className="material-symbols-outlined text-red-600 text-[36px] mb-2 animate-bounce">
                        delete_forever
                      </span>
                      <h4 className="text-sm font-black text-red-700">确认删除或下架该技能帖子？</h4>
                      <p className="text-[11px] text-red-600/80 mt-1 max-w-[240px]">
                        该操作将在此列表中隐藏该卡片。若是您发布的技能，它同样会被同步下架。
                      </p>
                      <div className="flex gap-3 mt-4 w-full max-w-[240px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-white text-[#434656] text-xs font-bold border border-[#c3c5d9]/35 active:scale-95 transition-all cursor-pointer"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteId(null);
                            onDeleteSkill(item.id);
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md shadow-red-200 active:scale-95 transition-all cursor-pointer"
                        >
                          确认删除
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="p-6 space-y-4">
                  {/* Header Info */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          className="w-14 h-14 rounded-full bg-[#ebeef1] object-cover"
                          alt={item.userName}
                          src={item.userAvatar}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-0 right-0 bg-[#003ec7] rounded-full p-0.5 border-2 border-white flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white font-bold leading-none">
                            check
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#181c1e] font-headline">
                          {item.userName}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="bg-[#dde1ff] text-[#0038b6] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                            <span className="material-symbols-outlined text-[12px] text-[#0038b6]">
                              shield
                            </span>
                            信用分 {item.credibility}
                          </span>
                          <div className="flex items-center text-[#606200] font-mono font-bold text-xs">
                            <span className="material-symbols-outlined text-[13px] text-[#606200] select-none">
                              star
                            </span>
                            <span className="ml-0.5">{item.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="flex flex-col items-end">
                        <span className="text-[#003ec7] text-[24px] font-extrabold tracking-tight font-headline leading-tight">
                          {item.matchScore}%
                        </span>
                        <span className="text-[10px] text-[#434656] font-semibold tracking-wide uppercase">
                          匹配度
                        </span>
                      </div>
                      
                      <button
                        title="删除该贴"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setConfirmDeleteId(item.id);
                        }}
                        className="w-11 h-11 rounded-full bg-[#f1f4f7] hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-[#737688] transition-all cursor-pointer active:scale-90 shrink-0 relative z-20"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Swap Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#f1f4f7] p-3 rounded-xl hover:bg-[#e5e8eb] transition-colors">
                      <span className="text-[11px] text-[#434656] block mb-1 font-sans">
                        我能教
                      </span>
                      <span className="text-[15px] font-bold text-[#181c1e] font-headline">
                        {item.teachSkill}
                      </span>
                    </div>
                    <div className="bg-[#e4e800]/15 p-3 rounded-xl border-l-4 border-[#e7eb00]">
                      <span className="text-[11px] text-[#606200] block mb-1 font-sans font-semibold">
                        我想学
                      </span>
                      <span className="text-[15px] font-bold text-[#656600] font-headline">
                        {item.learnSkill}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => onInitiateSwap(item)}
                      className="flex-1 bg-[#003ec7] text-white py-3 rounded-xl font-bold active:scale-95 transition-all shadow-md hover:opacity-90 shadow-[#003ec7]/15 font-sans"
                    >
                      立即互换
                    </button>
                    <button
                      onClick={() =>
                        onStartChat(
                          item.userName,
                          `你好 ${item.userName}，我对你的技能“${item.teachSkill}”非常感兴趣！我们能进行交换吗？`
                        )
                      }
                      className="flex items-center justify-center px-6 border-2 border-[#003ec7] text-[#003ec7] hover:bg-[#003ec7]/5 rounded-xl font-bold active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined mr-2">
                        chat_bubble
                      </span>
                      私聊
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredSkills.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 text-center bg-white rounded-[24px] p-6 border border-dashed border-[#c3c5d9]"
              >
                <span className="material-symbols-outlined text-[48px] text-[#737688]/40 mb-2">
                  search_off
                </span>
                <p className="text-[#434656] text-sm">
                  没有找到符合条件的技能推荐
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setNearbyOnly(false);
                  }}
                  className="mt-4 text-xs font-bold text-[#003ec7] hover:underline"
                >
                  重置筛选条件
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Hot Skills Bento-style Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-[#181c1e] font-headline">
            热门技能
          </h2>
          <span className="text-[11px] font-semibold text-[#434656] uppercase tracking-wider">
            当前热门
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Skill Card 1 */}
          <div
            onClick={() => handleHotSkillClick('UI')}
            className="bg-white p-5 rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] space-y-3 cursor-pointer hover:border-[#003ec7]/10 border border-transparent transition-all hover:shadow-[#003ec7]/5 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#e4e800]/20 flex items-center justify-center text-[#606200] group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined">brush</span>
            </div>
            <div>
              <h4 className="font-bold text-base leading-tight text-[#181c1e] font-headline">
                UI设计
              </h4>
              <p className="text-[12px] text-[#434656] mt-1">1.2k 人正在搜索</p>
            </div>
            <div className="flex -space-x-1.5 pt-1">
              <img
                className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 object-cover"
                alt="Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbnB-RAPfZg2kSwvSLCqxiRXkslz8POQmy1BPhsKoE93qX1xaPRVU2NiJ4EfdXRVhH-ItqZ78RWUTG16yLFI467HgOb-Lq_mmOTP1X1aX2cbfYsFrQW4CuRoNGJhCt2EQaNp5rQiJK4ol1R2Tnv9arIrcjovph2QEcJYfbpy4Ye1AUCpb4Yz8SRHTH7e3udVlCgT-AAtogs2Oo3G6oNSlyZsVSv2Jw-kUwiL10F0xG-XwhZlysAts9kJe6wi90iOT51tlb55G0h-k"
                referrerPolicy="no-referrer"
              />
              <img
                className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 object-cover"
                alt="Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGuOz04z2pMRaWtchGi_tDvhMSrpbTTuT2BaMyjveJ-B2mWpUx2J47XPkwcs_O8VJrtpmKWYI7ti-U0OmJ1PCnDrtj4n_4j0_qY6PLhwDFY1tl3opSs__c5LpxFMj-k7fa3Y6zuGmzTnMyief2oNhTvqrHEqyWmw7pz7WarLyUWTLwzTfwgJr3SrSz7QAFBwEPHx-ratLaAOEzaJbamMgvMlKBC0872SgdJRylfeO0d2XQGWdMR7Rye2yjZVdDRjC8GV5VKWkHaWk"
                referrerPolicy="no-referrer"
              />
              <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e5e8eb] flex items-center justify-center text-[8px] font-bold text-[#434656] font-mono">
                +5
              </div>
            </div>
          </div>

          {/* Skill Card 2 */}
          <div
            onClick={() => handleHotSkillClick('日语')}
            className="bg-white p-5 rounded-[24px] shadow-[0px_4px_20px_rgba(0,0,0,0.02)] space-y-3 cursor-pointer hover:border-[#003ec7]/10 border border-transparent transition-all hover:shadow-[#003ec7]/5 group"
          >
            <div className="w-10 h-10 rounded-full bg-[#dde1ff] flex items-center justify-center text-[#003ec7] group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined">translate</span>
            </div>
            <div>
              <h4 className="font-bold text-base leading-tight text-[#181c1e] font-headline">
                日语
              </h4>
              <p className="text-[12px] text-[#434656] mt-1">800+ 可选达人</p>
            </div>
            <div className="flex -space-x-1.5 pt-1">
              <img
                className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 object-cover"
                alt="Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBONyuZbu2GG_XiOttEKgALa4o3g9FryIJLOqqRVCoH-mv-V4LBJMbOprken9OopQLBuIK2XUYfW39g1-9V6uO9X_PiRKyXL58m10YhaANkqO_xLVMFo6SG5U_MBMNLOmpvukmUC6cUlMLi_zIkwyjYUPKpnTUnq3c25B0RzA6w5xDExvMuqKaYqYsoprzzY3tfOqt5M80rTqZTFIPQcECh5tzNkF8H9RMqOvr697odkk6q6oZr-J-GoMyD5FKTC5DSOg1yejB5mNk"
                referrerPolicy="no-referrer"
              />
              <img
                className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 object-cover"
                alt="Avatar"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJQCtO2JMVraJqs2qaGujODsiPE5tVPydKZzRyWHcbP6nQVhEeqszUANmjBDHre8mW7w6ejrFjEVC7zISmcNUWSswdATSbGeUdJoe50XZVj-1gvDo93ONLpzOEOgFho5eRy5shyFrP6qd3fwyZ9nm64AlgEebPExLPtJOxE0aIrubNwllVhrKq2SSOW5NPh0seuE2RKA_pgE09oALa_GfXHdq_puUadVmQqFhHJBQDCwN-ZHgwKHtE3mdz88vofYynOzVzwi0fxT4"
                referrerPolicy="no-referrer"
              />
              <div className="w-6 h-6 rounded-full border-2 border-white bg-[#e5e8eb] flex items-center justify-center text-[8px] font-bold text-[#434656] font-mono">
                +12
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty State Hint */}
      <div className="pt-2 text-center">
        <p className="text-xs text-[#737688]/70 select-none">没有更多消息了</p>
      </div>
    </div>
  );
}

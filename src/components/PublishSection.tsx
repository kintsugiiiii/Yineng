/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProficiencyLevel, TeachingMethod, SkillItem } from '../types';

interface PublishSectionProps {
  onPublishSuccess: (newSkill: Omit<SkillItem, 'id' | 'userName' | 'userAvatar' | 'credibility' | 'rating' | 'matchScore'>) => void;
}

const COMMON_TAGS = ['设计', '编程', '语言', '美妆', '摄影', '健身'];

export default function PublishSection({ onPublishSuccess }: PublishSectionProps) {
  const [isTeachMode, setIsTeachMode] = useState(true);
  const [skillName, setSkillName] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>(COMMON_TAGS);
  const [selectedTags, setSelectedTags] = useState<string[]>(['设计']);
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('beginner');
  const [timeText, setTimeText] = useState('时间自由，随约随聊');
  const [teachingMethod, setTeachingMethod] = useState<TeachingMethod>('online');
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [portfolioAttached, setPortfolioAttached] = useState(true);
  const [portfolioImg, setPortfolioImg] = useState<string | undefined>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDj6sjmeqDTPurlc5P0z3zQ3GUOasTt7rpdpjMvOL7YWS6Kf019N_cgMnZy6DuA9rWc2mzCYlPVFzKkbKu2ro-v_1MAtSsbZRaUXKAJ4fHq4iVBn2hq4ajil5AeoRJmdkolewRZ57n6NEjRZH1rGDjE1IKJaIGxsz84KKRHkcdRKw3_nKcPIeYlf7OkjmCh2XfcPvH2sJJ8QpcVtD9pmXXFLGSJarEZEvTutdYx40WIKgvh-4AOddGsBnRuJ9Umhwg0PLpJlQwHeaI'
  );
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomTagBox, setShowCustomTagBox] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Quick tag selection toggler
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: FormEvent) => {
    e.preventDefault();
    const tag = customTagInput.trim();
    if (tag) {
      if (!availableTags.includes(tag)) {
        setAvailableTags([...availableTags, tag]);
      }
      if (!selectedTags.includes(tag)) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
    setCustomTagInput('');
    setShowCustomTagBox(false);
  };

  const handlePortfolioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('文件大小不能超过 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPortfolioImg(event.target.result as string);
          setPortfolioAttached(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Main Publish Form handler
  const handlePublishSubmit = () => {
    if (!skillName.trim()) {
      alert('请输入技能名称！');
      return;
    }

    // Success dispatch
    onPublishSuccess({
      teachSkill: isTeachMode ? skillName : '根据您的定制要求',
      learnSkill: isTeachMode ? '根据对方需求交换' : skillName,
      tags: selectedTags.length > 0 ? selectedTags : ['通用'],
      proficiency,
      time: timeText,
      method: teachingMethod,
      portfolioImg: portfolioAttached ? portfolioImg : undefined,
    });

    // Display high fidelity temporary feedback
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      // Reset state for new card design
      setSkillName('');
    }, 2500);
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header Info */}
      <section className="mb-2">
        <h2 className="text-2xl font-bold text-[#181c1e] font-headline">
          创建技能卡片
        </h2>
        <p className="text-sm text-[#434656] mt-1">
          分享你的专长或申请你想学习的新技能。
        </p>
      </section>

      {/* Mode Switch Tab Grid Toggle */}
      <div className="bg-[#f1f4f7] p-1 rounded-xl flex">
        <button
          onClick={() => setIsTeachMode(true)}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            isTeachMode
              ? 'bg-[#003ec7] text-white shadow-sm'
              : 'text-[#434656] hover:bg-[#e5e8eb]/50'
          }`}
        >
          我能教
        </button>
        <button
          onClick={() => setIsTeachMode(false)}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
            !isTeachMode
              ? 'bg-[#003ec7] text-white shadow-sm'
              : 'text-[#434656] hover:bg-[#e5e8eb]/50'
          }`}
        >
          我想要学
        </button>
      </div>

      {/* Form Card Layout Container */}
      <div className="bg-[#ffffff] rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-[#c3c5d9]/30 space-y-6">
        {/* Skill Name */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#434656] block">
            技能名称
          </label>
          <input
            type="text"
            className="w-full bg-[#f1f4f7] border-none rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-[#003ec7]/20 focus:bg-[#ffffff] transition-all outline-none font-sans text-[#181c1e] text-base placeholder:text-[#c3c5d9]"
            placeholder={
              isTeachMode
                ? '例如：UI设计, Python, 吉他...'
                : '例如：雅思口语, 烘焙基础, 视频剪辑...'
            }
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 pt-2">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <span
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs cursor-pointer select-none transition-all border font-medium ${
                    active
                      ? 'bg-[#003ec7] text-white border-[#003ec7] scale-105 shadow-xs'
                      : 'bg-[#f1f4f7] text-[#434656] border-transparent hover:bg-[#e5e8eb]'
                  }`}
                >
                  #{tag}
                </span>
              );
            })}
            <span
              onClick={() => setShowCustomTagBox(true)}
              className="bg-[#ebeef1] text-[#434656] px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer hover:bg-[#e0e3e6] transition-colors border border-transparent"
            >
              + 添加自定义
            </span>
          </div>

          {skillName.trim() && !selectedTags.includes(skillName.trim()) && (
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => {
                  const cleaned = skillName.trim();
                  if (!availableTags.includes(cleaned)) {
                    setAvailableTags([...availableTags, cleaned]);
                  }
                  if (!selectedTags.includes(cleaned)) {
                    setSelectedTags([...selectedTags, cleaned]);
                  }
                }}
                className="text-xs text-[#003ec7] font-bold bg-[#003ec7]/5 py-1.5 px-3 rounded-lg hover:bg-[#003ec7]/10 transition-all inline-flex items-center gap-1 active:scale-95 border border-[#003ec7]/20"
              >
                <span className="material-symbols-outlined text-[13px]">add</span>
                将 “#{skillName.trim()}” 设为话题/标签
              </button>
            </div>
          )}

          {/* Custom tag modal popup bar */}
          <AnimatePresence>
            {showCustomTagBox && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleAddCustomTag}
                className="flex items-center gap-2 mt-2 bg-[#f1f4f7] p-2 rounded-xl"
              >
                <input
                  type="text"
                  maxLength={10}
                  className="flex-1 bg-white border-none py-1.5 px-3 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#003ec7]"
                  placeholder="标签名 / 话题名 (最多10字)"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-[#003ec7] text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                >
                  确定
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomTagBox(false)}
                  className="text-xs text-[#737688] px-1"
                >
                  取消
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Proficiency */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#434656] block">
            熟练程度
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setProficiency('beginner')}
              className={`text-center py-3 rounded-xl text-sm font-bold transition-all border ${
                proficiency === 'beginner'
                  ? 'bg-[#e4e800] text-[#1c1d00] border-[#606200]'
                  : 'bg-[#f1f4f7] text-[#434656] border-transparent hover:bg-[#e5e8eb]'
              }`}
            >
              初学者
            </button>
            <button
              onClick={() => setProficiency('intermediate')}
              className={`text-center py-3 rounded-xl text-sm font-bold transition-all border ${
                proficiency === 'intermediate'
                  ? 'bg-[#e4e800] text-[#1c1d00] border-[#606200]'
                  : 'bg-[#f1f4f7] text-[#434656] border-transparent hover:bg-[#e5e8eb]'
              }`}
            >
              中级
            </button>
            <button
              onClick={() => setProficiency('expert')}
              className={`text-center py-3 rounded-xl text-sm font-bold transition-all border ${
                proficiency === 'expert'
                  ? 'bg-[#e4e800] text-[#1c1d00] border-[#606200]'
                  : 'bg-[#f1f4f7] text-[#434656] border-transparent hover:bg-[#e5e8eb]'
              }`}
            >
              专业
            </button>
          </div>
        </div>

        {/* Available swapping time */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#434656] block">
            可交换时间
          </label>
          <div
            onClick={() => setShowTimeModal(true)}
            className="flex items-center bg-[#f1f4f7] rounded-xl px-4 py-3.5 cursor-pointer hover:bg-[#e5e8eb] active:bg-[#e0e3e6] transition-all"
          >
            <span className="material-symbols-outlined text-[#003ec7] mr-3">
              calendar_month
            </span>
            <span className="text-sm font-sans text-[#181c1e] font-medium">
              {timeText}
            </span>
            <span className="material-symbols-outlined text-[#434656]/50 ml-auto">
              chevron_right
            </span>
          </div>
        </div>

        {/* Teaching method */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#434656] block">
            教学方式
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setTeachingMethod('online')}
              className={`flex-1 border-2 rounded-xl py-3.5 flex flex-col items-center gap-1.5 transition-all group active:scale-95 ${
                teachingMethod === 'online'
                  ? 'bg-[#003ec7]/5 border-[#003ec7]'
                  : 'bg-white border-[#c3c5d9]/60 hover:bg-[#f1f4f7]'
              }`}
            >
              <span
                className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 ${
                  teachingMethod === 'online' ? 'text-[#003ec7]' : 'text-[#737688]'
                }`}
              >
                language
              </span>
              <span
                className={`text-xs font-bold ${
                  teachingMethod === 'online' ? 'text-[#003ec7]' : 'text-[#434656]'
                }`}
              >
                线上
              </span>
            </button>
            <button
              onClick={() => setTeachingMethod('offline')}
              className={`flex-1 border-2 rounded-xl py-3.5 flex flex-col items-center gap-1.5 transition-all group active:scale-95 ${
                teachingMethod === 'offline'
                  ? 'bg-[#003ec7]/5 border-[#003ec7]'
                  : 'bg-white border-[#c3c5d9]/60 hover:bg-[#f1f4f7]'
              }`}
            >
              <span
                className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 ${
                  teachingMethod === 'offline' ? 'text-[#003ec7]' : 'text-[#737688]'
                }`}
              >
                location_on
              </span>
              <span
                className={`text-xs font-bold ${
                  teachingMethod === 'offline' ? 'text-[#003ec7]' : 'text-[#434656]'
                }`}
              >
                线下
              </span>
            </button>
          </div>
        </div>

        {/* Upload portfolio widget */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#434656] block">
            作品展示 (图片/视频)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label
              htmlFor="publish-portfolio-file"
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                portfolioAttached
                  ? 'bg-white border-[#c3c5d9]'
                  : 'bg-[#f1f4f7] border-[#003ec7] text-[#003ec7] hover:border-[#003ec7] hover:bg-[#003ec7]/5'
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {portfolioAttached ? 'add_photo_alternate' : 'image'}
              </span>
              <span className="text-[10px] mt-1 font-bold text-[#434656]">
                {portfolioAttached ? '更换/新增' : '本地上传'}
              </span>
              <input
                id="publish-portfolio-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePortfolioUpload}
              />
            </label>

            {portfolioAttached && portfolioImg && (
              <div className="aspect-square rounded-xl overflow-hidden relative group shadow-sm border border-[#e5e8eb]">
                <img
                  alt="Sample Work"
                  className="w-full h-full object-cover"
                  src={portfolioImg}
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPortfolioAttached(false);
                    setPortfolioImg(undefined);
                  }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-90 hover:bg-black/80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary Submit Button */}
      <div className="pt-2">
        <button
          onClick={handlePublishSubmit}
          className="w-full bg-[#e4e800] text-[#1c1d00] py-4.5 rounded-2xl text-lg font-bold shadow-xl shadow-[#606200]/10 hover:opacity-90 active:scale-[0.98] transition-all duration-200 border-b-4 border-[#606200]/30"
        >
          预览并发布
        </button>
        <p className="text-center text-xs text-[#434656] mt-4 opacity-70">
          点击发布即表示你同意易能社区指南。
        </p>
      </div>

      {/* Time Picker Modal Sheet Simulation */}
      <AnimatePresence>
        {showTimeModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTimeModal(false)}
              className="fixed inset-0 bg-black z-[100]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-white rounded-t-[28px] p-6 z-[101] shadow-2xl max-w-xl mx-auto right-0 max-h-[85vh] overflow-y-auto pb-10"
            >
              <div className="w-12 h-1.5 bg-[#e0e3e6] rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-bold text-[#181c1e] mb-4 font-headline">
                选择可交换时间
              </h3>
              <div className="space-y-3">
                {[
                  '周末，工作日晚上 8 点以后',
                  '仅周末双休日全天',
                  '工作周任意工作日白天',
                  '时间自由，随约随聊',
                ].map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setTimeText(option);
                      setShowTimeModal(false);
                    }}
                    className={`p-4 rounded-xl cursor-pointer flex items-center justify-between border-2 transition-all ${
                      timeText === option
                        ? 'border-[#003ec7] bg-[#003ec7]/5 font-bold text-[#003ec7]'
                        : 'border-[#f1f4f7] bg-[#f1f4f7]/40 text-[#434656] hover:bg-[#f1f4f7]'
                    }`}
                  >
                    <span>{option}</span>
                    {timeText === option && (
                      <span className="material-symbols-outlined text-[#003ec7]">
                        check_circle
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTimeModal(false)}
                className="w-full mt-6 bg-[#f1f4f7] text-[#434656] py-3.5 rounded-xl font-bold"
              >
                取消
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Success Toast Modal Feedback */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-x-4 bottom-24 bg-gradient-to-r from-[#003ec7] to-[#0052ff] text-white px-6 py-4 rounded-2xl shadow-xl z-50 flex items-center gap-3 max-w-md mx-auto"
          >
            <span className="material-symbols-outlined text-white text-[28px]">
              task_alt
            </span>
            <div>
              <p className="font-bold text-sm">恭喜！卡片发布成功</p>
              <p className="text-[11px] opacity-90 mt-0.5">
                您的技能卡片已被推荐至首页及个人档案
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

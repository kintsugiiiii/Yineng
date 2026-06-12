/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'expert';
export type TeachingMethod = 'online' | 'offline' | 'both';

export interface SkillItem {
  id: string;
  userName: string;
  userAvatar: string;
  credibility: number;
  rating: number;
  matchScore: number;
  teachSkill: string;
  learnSkill: string;
  tags: string[];
  isHot?: boolean;
  hotSearchHint?: string; // e.g. "1.2k 人正在搜索"
  proficiency: ProficiencyLevel;
  time: string;
  method: TeachingMethod;
  portfolioImg?: string;
  isNearby?: boolean;
  school?: string;
  isUserCreated?: boolean;
}

export interface ChatHistoryMessage {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
}

export interface MessageItem {
  id: string;
  avatar: string;
  name: string;
  lastMessage: string;
  time: string;
  isUnread: boolean;
  type: 'chat' | 'invitation' | 'system' | 'group';
  matchedSkillName?: string; // used for invitations
  invitationStatus?: 'pending' | 'accepted' | 'declined';
  chatHistory?: ChatHistoryMessage[];
  credibility?: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  title: string;
  school: string;
  credibility: number;
  energyValue: number;
  swapCount: number;
  activityHistory: number[]; // represents heights of the active heatmap
  gender?: string;
  age?: number;
  occupation?: string;
  major?: string;
  membership?: 'free' | 'monthly' | 'yearly';
  unlockedWhoViewedMe?: boolean;
}

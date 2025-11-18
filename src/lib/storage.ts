/**
 * 本地存储管理模块
 */

import type { QuizStats, LearningProgress } from '../types';

/** 存储键名 */
const STORAGE_KEYS = {
  STATS: 'uflag_stats',
  LEARNING_PROGRESS: 'uflag_learning_progress',
  PREFERRED_LANGUAGE: 'preferredLanguage',
  QUIZ_SETTINGS: 'uflag_quiz_settings',
} as const;

/**
 * 获取测验统计数据
 */
export function getStats(): QuizStats {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
  }

  // 返回默认值
  return {
    totalTests: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    averageTime: 0,
    bestScore: 0,
  };
}

/**
 * 保存测验统计数据
 */
export function saveStats(stats: QuizStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to save stats:', error);
  }
}

/**
 * 重置测验统计数据
 */
export function resetStats(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.STATS);
  } catch (error) {
    console.error('Failed to reset stats:', error);
  }
}

/**
 * 获取学习进度
 */
export function getLearningProgress(): LearningProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LEARNING_PROGRESS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load learning progress:', error);
  }

  return {};
}

/**
 * 保存学习进度
 */
export function saveLearningProgress(progress: LearningProgress): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEARNING_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save learning progress:', error);
  }
}

/**
 * 标记国家为已学习
 */
export function markCountryLearned(countryCode: string): void {
  const progress = getLearningProgress();
  progress[countryCode] = {
    learned: true,
    lastStudied: Date.now(),
    reviewCount: (progress[countryCode]?.reviewCount || 0) + 1,
  };
  saveLearningProgress(progress);
}

/**
 * 获取已学习的国家数量
 */
export function getLearnedCount(): number {
  const progress = getLearningProgress();
  return Object.values(progress).filter((p) => p.learned).length;
}

/**
 * 重置学习进度
 */
export function resetLearningProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.LEARNING_PROGRESS);
  } catch (error) {
    console.error('Failed to reset learning progress:', error);
  }
}

/**
 * 获取首选语言
 */
export function getPreferredLanguage(): string {
  return localStorage.getItem(STORAGE_KEYS.PREFERRED_LANGUAGE) || 'zh';
}

/**
 * 保存首选语言
 */
export function setPreferredLanguage(lang: string): void {
  localStorage.setItem(STORAGE_KEYS.PREFERRED_LANGUAGE, lang);
}

/**
 * 获取测验设置
 */
export function getQuizSettings(): any {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load quiz settings:', error);
  }

  return {
    difficulty: 'easy',
    questionCount: 10,
  };
}

/**
 * 保存测验设置
 */
export function saveQuizSettings(settings: any): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save quiz settings:', error);
  }
}

/**
 * 清除所有存储数据
 */
export function clearAllStorage(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * 导出所有数据（用于备份）
 */
export function exportAllData(): Record<string, any> {
  const data: Record<string, any> = {};
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        data[name] = JSON.parse(value);
      }
    } catch (error) {
      console.error(`Failed to export ${name}:`, error);
    }
  });
  return data;
}

/**
 * 导入数据（从备份恢复）
 */
export function importAllData(data: Record<string, any>): void {
  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    try {
      if (data[name]) {
        localStorage.setItem(key, JSON.stringify(data[name]));
      }
    } catch (error) {
      console.error(`Failed to import ${name}:`, error);
    }
  });
}

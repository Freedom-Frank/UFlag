/**
 * 统计分析模块
 * 负责显示测验统计、学习进度等数据
 */

import type { QuizStats, LearningProgress } from '../types';
import { getStats } from '../lib/storage';
import { i18n } from '../lib/i18n-core';
import { safeSetText } from '../lib/utils';

/**
 * 统计模块类
 */
class StatsModule {
  /**
   * 显示统计页面
   */
  showStats(): void {
    this.updateQuizStats();
    this.updateLearningProgress();
  }

  /**
   * 更新测验统计显示
   */
  updateQuizStats(): void {
    const stats = getStats();

    // 显示基本统计
    safeSetText('stats-total-tests', stats.totalTests.toString());
    safeSetText('stats-total-questions', stats.totalQuestions.toString());
    safeSetText('stats-correct-answers', stats.correctAnswers.toString());
    safeSetText('stats-best-score', stats.bestScore.toString());

    // 计算准确率
    const accuracy =
      stats.totalQuestions > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
        : 0;
    safeSetText('stats-accuracy', `${accuracy}%`);

    // 显示准确率等级
    const accuracyGrade = this.getAccuracyGrade(accuracy);
    safeSetText('stats-accuracy-grade', accuracyGrade);

    // 更新进度条
    const progressBar = document.getElementById('stats-accuracy-bar') as HTMLElement;
    if (progressBar) {
      progressBar.style.width = `${accuracy}%`;
      progressBar.style.backgroundColor = this.getAccuracyColor(accuracy);
    }
  }

  /**
   * 更新学习进度显示
   */
  updateLearningProgress(): void {
    try {
      const progress: LearningProgress = JSON.parse(
        localStorage.getItem('learningProgress') || '{}'
      );

      const learnedCountries = Object.values(progress).filter((p) => p.learned).length;
      const totalCountries = Object.keys(progress).length || 200; // 默认200个国家

      safeSetText('stats-learned-countries', learnedCountries.toString());
      safeSetText('stats-total-countries', totalCountries.toString());

      // 计算学习进度百分比
      const learnedPercentage =
        totalCountries > 0 ? Math.round((learnedCountries / totalCountries) * 100) : 0;
      safeSetText('stats-learned-percentage', `${learnedPercentage}%`);

      // 更新进度条
      const learnedProgressBar = document.getElementById('stats-learned-bar') as HTMLElement;
      if (learnedProgressBar) {
        learnedProgressBar.style.width = `${learnedPercentage}%`;
      }

      // 显示复习次数
      const totalReviews = Object.values(progress).reduce(
        (sum, p) => sum + (p.reviewCount || 0),
        0
      );
      safeSetText('stats-total-reviews', totalReviews.toString());
    } catch (error) {
      console.error('更新学习进度失败:', error);
    }
  }

  /**
   * 获取准确率等级
   */
  private getAccuracyGrade(accuracy: number): string {
    if (accuracy >= 90) return i18n.t('stats.grade.excellent') || '优秀';
    if (accuracy >= 80) return i18n.t('stats.grade.good') || '良好';
    if (accuracy >= 70) return i18n.t('stats.grade.average') || '中等';
    if (accuracy >= 60) return i18n.t('stats.grade.fair') || '及格';
    return i18n.t('stats.grade.needImprovement') || '需加强';
  }

  /**
   * 获取准确率对应的颜色
   */
  private getAccuracyColor(accuracy: number): string {
    if (accuracy >= 90) return '#22c55e'; // 绿色
    if (accuracy >= 80) return '#3b82f6'; // 蓝色
    if (accuracy >= 70) return '#eab308'; // 黄色
    if (accuracy >= 60) return '#f59e0b'; // 橙色
    return '#ef4444'; // 红色
  }

  /**
   * 重置统计数据
   */
  resetStats(): void {
    const confirmed = confirm(
      i18n.getCurrentLanguage() === 'en'
        ? 'Are you sure you want to reset all statistics? This action cannot be undone.'
        : '确定要重置所有统计数据吗？此操作无法撤销。'
    );

    if (!confirmed) return;

    const emptyStats: QuizStats = {
      totalTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      averageTime: 0,
      bestScore: 0,
    };

    localStorage.setItem('quizStats', JSON.stringify(emptyStats));
    this.updateQuizStats();

    alert(
      i18n.getCurrentLanguage() === 'en'
        ? 'Statistics have been reset successfully!'
        : '统计数据已重置成功！'
    );
  }

  /**
   * 导出统计数据
   */
  exportStats(): void {
    try {
      const stats = getStats();
      const progress: LearningProgress = JSON.parse(
        localStorage.getItem('learningProgress') || '{}'
      );

      const exportData = {
        quizStats: stats,
        learningProgress: progress,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `uflag-stats-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);

      console.log('✅ 统计数据导出成功');
    } catch (error) {
      console.error('导出统计数据失败:', error);
      alert(
        i18n.getCurrentLanguage() === 'en' ? 'Failed to export statistics!' : '导出统计数据失败！'
      );
    }
  }

  /**
   * 导入统计数据
   */
  importStats(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.quizStats) {
          localStorage.setItem('quizStats', JSON.stringify(data.quizStats));
        }

        if (data.learningProgress) {
          localStorage.setItem('learningProgress', JSON.stringify(data.learningProgress));
        }

        this.updateQuizStats();
        this.updateLearningProgress();

        alert(
          i18n.getCurrentLanguage() === 'en'
            ? 'Statistics imported successfully!'
            : '统计数据导入成功！'
        );

        console.log('✅ 统计数据导入成功');
      } catch (error) {
        console.error('导入统计数据失败:', error);
        alert(
          i18n.getCurrentLanguage() === 'en'
            ? 'Failed to import statistics! Invalid file format.'
            : '导入统计数据失败！文件格式无效。'
        );
      }
    };

    reader.readAsText(file);
  }

  /**
   * 获取成就徽章
   */
  getAchievements(): {
    id: string;
    name: string;
    description: string;
    unlocked: boolean;
    icon: string;
  }[] {
    const stats = getStats();
    const progress: LearningProgress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
    const learnedCount = Object.values(progress).filter((p) => p.learned).length;

    return [
      {
        id: 'first_test',
        name: i18n.t('achievements.firstTest.name') || '初次尝试',
        description: i18n.t('achievements.firstTest.desc') || '完成第一次测验',
        unlocked: stats.totalTests >= 1,
        icon: '🎯',
      },
      {
        id: 'ten_tests',
        name: i18n.t('achievements.tenTests.name') || '勤学苦练',
        description: i18n.t('achievements.tenTests.desc') || '完成10次测验',
        unlocked: stats.totalTests >= 10,
        icon: '📚',
      },
      {
        id: 'perfect_score',
        name: i18n.t('achievements.perfectScore.name') || '满分大师',
        description: i18n.t('achievements.perfectScore.desc') || '获得一次满分',
        unlocked: stats.bestScore >= 100,
        icon: '🏆',
      },
      {
        id: 'fifty_countries',
        name: i18n.t('achievements.fiftyCountries.name') || '半程马拉松',
        description: i18n.t('achievements.fiftyCountries.desc') || '学习50个国家',
        unlocked: learnedCount >= 50,
        icon: '🌍',
      },
      {
        id: 'hundred_countries',
        name: i18n.t('achievements.hundredCountries.name') || '环球旅行家',
        description: i18n.t('achievements.hundredCountries.desc') || '学习100个国家',
        unlocked: learnedCount >= 100,
        icon: '🌏',
      },
      {
        id: 'all_countries',
        name: i18n.t('achievements.allCountries.name') || '国旗专家',
        description: i18n.t('achievements.allCountries.desc') || '学习所有国家',
        unlocked: learnedCount >= 193,
        icon: '👑',
      },
    ];
  }

  /**
   * 显示成就徽章
   */
  displayAchievements(): void {
    const achievements = this.getAchievements();
    const container = document.getElementById('achievements-container');

    if (!container) return;

    container.innerHTML = '';

    achievements.forEach((achievement) => {
      const card = document.createElement('div');
      card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
      card.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-info">
          <h4 class="achievement-name">${achievement.name}</h4>
          <p class="achievement-desc">${achievement.description}</p>
        </div>
        ${achievement.unlocked ? '<div class="achievement-badge">✓</div>' : ''}
      `;
      container.appendChild(card);
    });
  }
}

// 创建单例实例
export const statsModule = new StatsModule();

// 初始化标志
let statsModuleInitialized = false;

/**
 * 初始化统计模块
 */
export function initStatsModule(): void {
  // 防止重复初始化
  if (statsModuleInitialized) {
    return;
  }

  // 重置按钮
  const resetBtn = document.getElementById('reset-stats-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => statsModule.resetStats());
  }

  // 导出按钮
  const exportBtn = document.getElementById('export-stats-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => statsModule.exportStats());
  }

  // 导入按钮
  const importBtn = document.getElementById('import-stats-btn');
  const importInput = document.getElementById('import-stats-input') as HTMLInputElement;

  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        statsModule.importStats(file);
      }
    });
  }

  statsModuleInitialized = true;
  console.log('✅ Stats module initialized');
}

// 导出到全局（向后兼容）
if (typeof window !== 'undefined') {
  (window as any).statsModule = statsModule;
}

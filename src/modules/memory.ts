/**
 * 记忆训练模块
 * 负责国旗记忆训练、分类管理和学习进度跟踪
 */

import type { Country } from '../types';
import { appState } from '../lib/state';
import { i18n } from '../lib/i18n-core';
import { getFlagImageUrl } from '../lib/data-loader';

/**
 * 记忆进度数据
 */
interface MemoryProgress {
  learned: boolean;
  firstLearnedAt: string;
  lastLearnedAt: string;
  learnCount: number;
}

/**
 * 分类数据
 */
interface CategoryData {
  originalContinent: string;
  groupNumber: number | null;
  continentKey: string;
  description: string;
  countries: string[];
  tips: string;
  totalGroups: number;
}

/**
 * 分类进度
 */
interface CategoryProgress {
  status: 'completed' | 'in_progress';
  learnedCount: number;
  totalCount: number;
  lastStudied: string | null;
  studyCount: number;
}

/**
 * 学习会话
 */
interface LearningSession {
  startTime: number | null;
  flagsStudied: number;
  sessionType: string | null;
}

/**
 * 学习状态
 */
interface LearningState {
  currentCategory: string | null;
  lastStudiedCategory: string | null;
  sessionHistory: Array<{
    category: string;
    startTime: string;
    sessionType: string;
  }>;
}

/**
 * 记忆训练模块类
 */
class MemoryModule {
  // 分类数据
  private categories: Record<string, CategoryData> = {};

  // 用户进度
  private progress: Record<string, MemoryProgress> = {};

  // 分类进度
  private categoryProgress: Record<string, CategoryProgress> = {};

  // 当前学习会话
  private currentSession: LearningSession = {
    startTime: null,
    flagsStudied: 0,
    sessionType: null,
  };

  // 学习状态
  private learningState: LearningState = {
    currentCategory: null,
    lastStudiedCategory: null,
    sessionHistory: [],
  };

  // 当前学习的国旗列表
  private currentFlags: string[] = [];

  // 当前索引
  private currentIndex = 0;

  // 当前分类
  private currentCategory: string | null = null;

  /**
   * 初始化记忆训练模块
   */
  init(): void {
    console.log('🚀 增强版记忆系统开始初始化');

    // 加载进度数据
    this.loadProgress();

    // 检查每日进度
    this.checkDailyProgress();

    // 初始化分类
    console.log('📂 开始初始化分类数据...');
    this.initContinentCategories();
    console.log('📂 初始化完成，当前分类数量:', Object.keys(this.categories).length);
  }

  /**
   * 加载进度数据
   */
  private loadProgress(): void {
    try {
      this.progress = JSON.parse(localStorage.getItem('enhancedMemoryProgress') || '{}');
      this.categoryProgress = JSON.parse(localStorage.getItem('categoryProgress') || '{}');
      this.learningState = JSON.parse(
        localStorage.getItem('learningState') ||
          JSON.stringify({
            currentCategory: null,
            lastStudiedCategory: null,
            sessionHistory: [],
          })
      );
    } catch (error) {
      console.warn('加载进度数据失败:', error);
    }
  }

  /**
   * 初始化按大洲分类（自动分组，每组最多12个国家）
   */
  private initContinentCategories(): void {
    const allCountries = appState.getState().allCountries;

    // 检查国家数据是否已加载
    if (!allCountries || allCountries.length === 0) {
      console.warn('⚠️ 国家数据未加载，延迟初始化分类');
      setTimeout(() => this.initContinentCategories(), 500);
      return;
    }

    // 清空分类
    this.categories = {};

    console.log('🌍 开始初始化分类，国家数量:', allCountries.length);

    // 简化的大洲到键的映射
    const continentKeyMap: Record<string, string> = {
      亚洲: 'asia',
      欧洲: 'europe',
      非洲: 'africa',
      北美洲: 'northAmerica',
      南美洲: 'southAmerica',
      大洋洲: 'oceania',
    };

    // 按大洲分组国家
    const continentGroups: Record<string, Country[]> = {};
    allCountries.forEach((country) => {
      const continent = country.continent;
      if (continent === '南极洲') return; // 跳过南极洲

      if (!continentGroups[continent]) {
        continentGroups[continent] = [];
      }
      continentGroups[continent].push(country);
    });

    console.log('🗂️ 大洲分组:', Object.keys(continentGroups));

    // 为每个大洲创建分组
    Object.entries(continentGroups).forEach(([continent, countries]) => {
      const continentKey = continentKeyMap[continent] || continent.toLowerCase();
      const totalCountries = countries.length;
      const groupCount = Math.ceil(totalCountries / 12);

      console.log(
        `📍 处理大洲 ${continent} (${continentKey}), 国家数量: ${totalCountries}, 分组数: ${groupCount}`
      );

      for (let i = 0; i < groupCount; i++) {
        const startIndex = i * 12;
        const endIndex = Math.min(startIndex + 12, totalCountries);
        const groupCountries = countries.slice(startIndex, endIndex);

        // 生成分类键
        let categoryKey: string;
        if (groupCount === 1) {
          categoryKey = continentKey;
        } else {
          categoryKey = `${continentKey}.${i + 1}`;
        }

        // 创建分类数据
        this.categories[categoryKey] = {
          originalContinent: continentKey,
          groupNumber: groupCount > 1 ? i + 1 : null,
          continentKey: continentKey,
          description: `Flags of ${continentKey.charAt(0).toUpperCase() + continentKey.slice(1)} countries`,
          countries: groupCountries.map((c) => c.code),
          tips: 'Study tips for this region',
          totalGroups: groupCount,
        };

        console.log(`✅ 创建分类 ${categoryKey}，包含 ${groupCountries.length} 个国家`);
      }
    });

    console.log('🎉 大洲分类初始化完成，分类数量:', Object.keys(this.categories).length);
  }

  /**
   * 显示记忆训练主界面
   */
  showMemory(): void {
    console.log('🧠 showMemory() 开始执行');
    const container = document.getElementById('simpleMemoryContainer');
    if (!container) {
      console.error('❌ simpleMemoryContainer 未找到');
      return;
    }
    console.log('✅ 找到 simpleMemoryContainer');
    console.log('📊 当前分类数据:', Object.keys(this.categories).length, '个分类');

    // 使用记忆训练主界面模板
    const mainTemplate = document.getElementById('memory-main-template') as HTMLTemplateElement;
    if (mainTemplate) {
      console.log('✅ 找到 memory-main-template');
      container.innerHTML = '';
      const templateContent = mainTemplate.content.cloneNode(true);
      container.appendChild(templateContent);
      console.log('✅ 模板已插入到DOM，容器内容长度:', container.innerHTML.length);

      // 立即翻译模板内容
      setTimeout(() => {
        i18n.updateDOM();
      }, 50);
    } else {
      console.error('❌ memory-main-template 未找到');
    }

    // 更新统计数据
    console.log('📊 开始更新统计数据...');
    this.updateMemoryStats();
    console.log('📊 开始渲染分类...');
    this.renderCategories();
    console.log('📊 开始设置事件监听器...');
    this.setupMemoryEventListeners();

    // 更新开始学习按钮状态
    this.updateStartLearningButton();
  }

  /**
   * 更新记忆训练统计
   */
  private updateMemoryStats(): void {
    const allFlags = Object.values(this.categories).flatMap((cat) => cat.countries);
    const learned = allFlags.filter((code) => this.progress[code]?.learned);
    const overallProgress = Math.round((learned.length / allFlags.length) * 100);
    const todayStudied = this.getTodayStudiedCount();

    // 更新头部统计
    const learnedCount = document.querySelector('.learned-count');
    if (learnedCount) learnedCount.textContent = learned.length.toString();

    const totalCount = document.querySelector('.total-count');
    if (totalCount) totalCount.textContent = allFlags.length.toString();

    const progressPercent = document.querySelector('.progress-percent');
    if (progressPercent) progressPercent.textContent = `${overallProgress}%`;

    const todayCount = document.querySelector('.today-count');
    if (todayCount) todayCount.textContent = todayStudied.toString();

    // 更新总体进度条
    const totalProgressText = document.querySelector('.total-progress-text');
    if (totalProgressText) totalProgressText.textContent = `${learned.length}/${allFlags.length}`;

    const totalProgressFill = document.querySelector('.total-progress-fill') as HTMLElement;
    if (totalProgressFill) totalProgressFill.style.width = `${overallProgress}%`;

    const overallComplete = document.querySelector('.overall-complete') as HTMLElement;
    if (overallComplete) {
      if (overallProgress === 100) {
        overallComplete.style.display = 'block';
      } else {
        overallComplete.style.display = 'none';
      }
    }
  }

  /**
   * 渲染分类卡片
   */
  private renderCategories(): void {
    console.log('🔍 开始查找 categories-container...');
    let categoriesContainer = document.querySelector('.categories-container') as HTMLElement;

    // 如果没有找到，尝试多种选择器
    if (!categoriesContainer) {
      console.log('🔍 尝试其他选择器...');
      categoriesContainer = document.querySelector(
        '#simpleMemoryContainer .categories-container'
      ) as HTMLElement;
    }

    if (!categoriesContainer) {
      console.log('🔍 尝试通过class查找...');
      const allContainers = document.getElementsByClassName('categories-container');
      if (allContainers.length > 0) {
        categoriesContainer = allContainers[0] as HTMLElement;
        console.log('✅ 通过getElementsByClassName找到容器');
      }
    }

    if (!categoriesContainer) {
      console.error('❌ 所有方法都无法找到 categories-container');
      return;
    }

    console.log('✅ 找到 categories-container:', categoriesContainer);

    categoriesContainer.innerHTML = '';

    console.log('🔍 renderCategories: 分类数据数量:', Object.keys(this.categories).length);

    if (Object.keys(this.categories).length === 0) {
      console.warn('⚠️ 没有分类数据可渲染');
      categoriesContainer.innerHTML =
        '<p style="text-align: center; color: #666;">正在加载分类数据...</p>';
      return;
    }

    // 开始渲染真实的分类卡片
    console.log('🎯 开始渲染真实的分类卡片...');

    Object.entries(this.categories).forEach(([categoryName, data]) => {
      console.log('🏷️ 渲染分类:', categoryName, '国家数量:', data.countries?.length);
      const categoryLearned = data.countries.filter((code) => this.progress[code]?.learned).length;
      const progress = Math.round((categoryLearned / data.countries.length) * 100);
      const categoryProgress = this.getCategoryProgress(categoryName);

      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';

      // 添加悬停效果
      categoryCard.onmouseenter = () => {
        categoryCard.style.transform = 'translateY(-2px)';
        categoryCard.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      };

      categoryCard.onmouseleave = () => {
        categoryCard.style.transform = 'translateY(0)';
        categoryCard.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      };

      // 根据进度状态添加不同的视觉样式
      let statusIcon = '';
      let statusClass = '';
      if (progress === 100) {
        statusIcon = '✅';
        statusClass = 'completed';
      } else if (progress > 0) {
        statusIcon = '📖';
        statusClass = 'in-progress';
      } else {
        statusIcon = '🕹️';
        statusClass = 'new';
      }

      // 使用新的统一翻译系统获取翻译文本
      const learnedText = i18n.t('memory.learned');
      const studyTipsTitle = i18n.t('memory.tipsTitle');
      const lastStudiedText = i18n.t('memory.lastStudied');

      // 使用正确的i18n翻译系统获取大洲描述和学习提示
      const displayName = this.getLocalizedCategoryName(categoryName, data);
      const continentKey = data.originalContinent || data.continentKey;
      const descriptionKey = `memory.continentDescriptions.${continentKey}`;
      const tipsKey = `memory.continentTips.${continentKey}`;

      // 获取本地化的大洲描述和学习提示
      const displayDescription = i18n.t(descriptionKey);
      const displayTips = i18n.t(tipsKey);

      categoryCard.innerHTML = `
                <div class="category-header">
                    <div class="category-title-wrapper">
                        <span class="category-status ${statusClass}">${statusIcon}</span>
                        <h4 class="category-title">${displayName}</h4>
                    </div>
                </div>
                <p class="category-description">${displayDescription}</p>
                <div class="category-progress">
                    <div class="category-progress-fill" style="width: ${progress}%;"></div>
                </div>
                <div class="category-stats">
                    <span class="stats-learned">${categoryLearned}/${data.countries.length} ${learnedText}</span>
                    <span class="stats-percent">${progress}%</span>
                </div>
                ${
                  displayTips
                    ? `
                    <div class="category-tips" style="background: #fefce8; border-left: 3px solid #fde047; border-radius: 6px; padding: 10px;">
                        <div class="tips-title" style="text-align: left; margin-bottom: 6px; font-weight: 600;">${studyTipsTitle}</div>
                        <div class="tips-content">${displayTips}</div>
                    </div>
                `
                    : ''
                }
                ${
                  categoryProgress.lastStudied
                    ? `
                    <div class="last-studied">
                        ${lastStudiedText}${this.formatLastStudied(categoryProgress.lastStudied)}
                    </div>
                `
                    : ''
                }
            `;

      // 添加点击事件
      categoryCard.onclick = () => {
        // 添加点击动画效果
        categoryCard.style.transform = 'scale(0.98)';
        setTimeout(() => {
          categoryCard.style.transform = '';
          this.startCategoryStudy(categoryName);
        }, 150);
      };

      categoriesContainer.appendChild(categoryCard);
    });

    // 所有分类卡片渲染完成后，触发一次翻译确保内容正确
    setTimeout(() => {
      i18n.updateDOM();
    }, 100);
  }

  /**
   * 格式化上次学习时间
   */
  private formatLastStudied(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 7) return `${diffDays}天前`;

    return date.toLocaleDateString('zh-CN');
  }

  /**
   * 获取本地化的分类名称
   */
  private getLocalizedCategoryName(name: string, data: CategoryData): string {
    const currentLang = i18n.getCurrentLanguage();

    if (data.groupNumber && data.totalGroups && data.totalGroups > 1) {
      // 如果是分组的情况，需要重新生成本地化名称
      const continentName = this.getLocalizedContinentName(data.originalContinent);
      // 使用当前语言的括号格式
      const bracketFormat = currentLang === 'zh' ? '（' : '(';
      const bracketFormatEnd = currentLang === 'zh' ? '）' : ')';
      return `${continentName}${bracketFormat}${data.groupNumber}${bracketFormatEnd}`;
    }
    return this.getLocalizedContinentName(data.originalContinent) || name;
  }

  /**
   * 获取本地化的大洲名称
   */
  private getLocalizedContinentName(continent: string): string {
    const continentKey = this.getContinentKey(continent);
    const currentLang = i18n.getCurrentLanguage();

    // 尝试从i18n获取翻译
    const translationKey = `memory.continents.${continentKey}`;
    const translated = i18n.t(translationKey);

    if (translated !== translationKey) {
      return translated;
    }

    // 备选方案
    const fallbackKey = `continents.${continentKey}`;
    const fallback = i18n.t(fallbackKey);
    if (fallback !== fallbackKey) {
      return fallback;
    }

    console.warn(`⚠️ 未找到大洲翻译: ${continentKey} (${currentLang})`);
    return continent;
  }

  /**
   * 获取大洲的键名
   */
  private getContinentKey(continent: string): string {
    const continentMap: Record<string, string> = {
      // 中文到键的映射
      亚洲: 'asia',
      欧洲: 'europe',
      非洲: 'africa',
      北美洲: 'northAmerica',
      南美洲: 'southAmerica',
      大洋洲: 'oceania',
      // 英文到键的映射
      Asia: 'asia',
      Europe: 'europe',
      Africa: 'africa',
      'North America': 'northAmerica',
      'South America': 'southAmerica',
      Oceania: 'oceania',
    };
    return continentMap[continent] || continent;
  }

  /**
   * 设置记忆训练事件监听
   */
  private setupMemoryEventListeners(): void {
    // 开始学习按钮
    const startLearningBtn = document.getElementById('startLearningBtn');
    if (startLearningBtn) {
      startLearningBtn.addEventListener('click', () => {
        this.startSmartLearning();
      });
    }

    // 清除学习进度按钮
    const clearMemoryProgressBtn = document.getElementById('clearMemoryProgressBtn');
    if (clearMemoryProgressBtn) {
      clearMemoryProgressBtn.addEventListener('click', (e) => {
        console.log('🔍 Clear memory progress button clicked');
        e.preventDefault();
        e.stopPropagation();
        this.clearMemoryProgress();
      });
    }
  }

  /**
   * 开始分类学习
   */
  private startCategoryStudy(categoryName: string): void {
    const category = this.categories[categoryName];
    if (!category) return;

    // 一次学习完整个分类：未学习的优先，然后是已学习的（均打乱顺序）
    const unlearned = category.countries.filter((code) => !this.progress[code]?.learned);
    const learned = category.countries.filter((code) => this.progress[code]?.learned);
    const orderedAll = this.shuffle(unlearned).concat(this.shuffle(learned));

    this.currentFlags = orderedAll;
    this.currentIndex = 0;
    this.currentCategory = categoryName;
    const categoryLearningText = i18n.t('memory.categoryLearning');
    this.currentSession.sessionType = categoryLearningText + categoryName;

    // 先展示预览页，用户点击"开始测试"后再开始会话
    this.showPreviewPage();
  }

  /**
   * 显示预览页面
   */
  private showPreviewPage(): void {
    // 搭建学习页容器
    this.showStudyPage();

    const studyContent = document.getElementById('studyContent');
    if (!studyContent) return;

    const categoryName = this.currentCategory!;
    const cat = this.categories[categoryName];
    const previewList = Array.isArray(cat?.countries) ? [...cat.countries] : [];
    const total = previewList.length;
    const learnedCount = previewList.filter((code) => this.progress[code]?.learned).length;
    const unlearnedCount = total - learnedCount;

    const allCountries = appState.getState().allCountries;

    // 平铺网格
    const gridItems = previewList
      .map((code) => {
        const country = allCountries.find((c) => c.code === code);
        const titleCN = country?.nameCN || code.toUpperCase();
        const titleEN = country?.nameEN || '';
        return `
                <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <div style="width:100%;height:90px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                        <img src="${getFlagImageUrl(code)}" alt="${titleCN}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.src='https://via.placeholder.com/160x100/f0f0f0/999?text=${code.toUpperCase()}'" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:13px;color:#1f2937;font-weight:600;">${titleCN}</div>
                        <div style="font-size:11px;color:#6b7280;">${titleEN}</div>
                    </div>
                </div>
            `;
      })
      .join('');

    // 获取翻译文本
    const prepareText = i18n.t('memory.prepareStudy');
    const studyHintTitle = i18n.t('memory.studyHintTitle');
    const totalCountText = i18n.t('memory.totalCount');
    const unlearnedText = i18n.t('memory.unlearned');
    const learnedText = i18n.t('memory.learned');
    const beginTestText = i18n.t('memory.beginTest');
    const startSessionHint = i18n.t('memory.startSessionHint');

    // 翻译分类名称
    const translatedCategoryName = this.getLocalizedContinentName(categoryName);

    studyContent.innerHTML = `
            <div style="display:grid; grid-template-columns: 1.6fr 1fr; gap: 20px; align-items: start;">
                <div>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;">
                        ${gridItems}
                    </div>
                </div>
                <div style="background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;padding:18px;position:sticky; top:10px;">
                    <h3 style="margin:0 0 10px 0;color:#1f2937;">${prepareText}${translatedCategoryName}</h3>
                    <div style="color:#6b7280;font-size:14px;line-height:1.5;margin-bottom:12px;">${cat?.description || ''}</div>
                    ${
                      cat?.tips
                        ? `<div style="background:#fef3c7;border-left:3px solid #f59e0b;border-radius:6px;padding:10px;margin-bottom:12px;color:#92400e;font-size:13px;">
                        <div style="font-weight:600;margin-bottom:4px;">${studyHintTitle}</div>
                        <div>${cat.tips}</div>
                    </div>`
                        : ''
                    }
                    <div style="display:flex;gap:10px;margin:12px 0 16px 0;">
                        <div style="flex:1;background:#f3f4f6;border-radius:8px;padding:10px;text-align:center;">
                            <div style="font-size:20px;font-weight:700;color:#111827;">${total}</div>
                            <div style="font-size:12px;color:#6b7280;">${totalCountText}</div>
                        </div>
                        <div style="flex:1;background:#ecfeff;border-radius:8px;padding:10px;text-align:center;border:1px solid #cffafe;">
                            <div style="font-size:20px;font-weight:700;color:#0e7490;">${unlearnedCount}</div>
                            <div style="font-size:12px;color:#0e7490;">${unlearnedText}</div>
                        </div>
                        <div style="flex:1;background:#ecfdf5;border-radius:8px;padding:10px;text-align:center;border:1px solid #d1fae5;">
                            <div style="font-size:20px;font-weight:700;color:#065f46;">${learnedCount}</div>
                            <div style="font-size:12px;color:#065f46;">${learnedText}</div>
                        </div>
                    </div>
                    <button id="beginStudyBtn" class="start-learning-btn" style="width:100%;background:linear-gradient(135deg,#10b981 0%, #059669 100%);color:#fff;border:none;padding:12px 20px;border-radius:10px;cursor:pointer;font-size:16px;font-weight:700;">${beginTestText}</button>
                    <div style="font-size:12px;color:#6b7280;margin-top:8px;">${startSessionHint}</div>
                </div>
            </div>
        `;

    const btn = document.getElementById('beginStudyBtn');
    if (btn) {
      btn.onclick = () => {
        // 真正开始会话与单卡学习
        this.startSession();
        this.currentIndex = 0;
        this.showFlag();
      };
    }
  }

  /**
   * 显示学习页面容器
   */
  private showStudyPage(): void {
    // 隐藏记忆训练主界面
    const memorySection = document.getElementById('memory-section');
    if (memorySection) (memorySection as HTMLElement).style.display = 'none';

    // 创建学习页面
    let studySection = document.getElementById('study-section');
    if (!studySection) {
      studySection = document.createElement('div');
      studySection.id = 'study-section';
      studySection.style.display = 'none';
      const contentDiv = document.querySelector('.content');
      if (contentDiv) contentDiv.appendChild(studySection);
    }

    // 获取返回按钮翻译文本
    const returnToMemoryText = i18n.t('memory.returnToMemory');

    studySection.style.display = 'block';
    studySection.innerHTML = `
            <div style="max-width: 1100px; margin: 0 auto; padding: 20px;">
                <!-- 返回按钮 -->
                <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                    <button id="returnToMemoryBtn"
                            style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                        ${returnToMemoryText}
                    </button>
                    <div id="studyHeaderRight" style="display: none;"></div>
                </div>

                <div id="studyContent" style="min-height: 400px;"></div>
            </div>
        `;

    // 绑定返回按钮事件
    const returnBtn = document.getElementById('returnToMemoryBtn');
    if (returnBtn) {
      returnBtn.onclick = () => {
        this.returnToMemory();
      };
    }
  }

  /**
   * 开始学习会话
   */
  private startSession(): void {
    this.currentSession.startTime = Date.now();
    this.currentSession.flagsStudied = 0;
  }

  /**
   * 显示国旗学习卡片
   */
  private showFlag(): void {
    if (this.currentIndex >= this.currentFlags.length) {
      this.showComplete();
      return;
    }

    const flagCode = this.currentFlags[this.currentIndex];

    const allCountries = appState.getState().allCountries;
    const countryInfo = allCountries.find((c) => c.code === flagCode);
    const flagProgress = this.progress[flagCode] || {};

    const studyContent = document.getElementById('studyContent');
    if (!studyContent) return;

    // 使用学习国旗模板
    const studyTemplate = document.getElementById('study-flag-template') as HTMLTemplateElement;
    if (studyTemplate) {
      const templateContent = studyTemplate.content.cloneNode(true) as DocumentFragment;

      // 设置会话信息
      const sessionType = templateContent.querySelector('.session-type');
      if (sessionType) sessionType.textContent = this.currentSession.sessionType || '';

      const progressText = templateContent.querySelector('.progress-text');
      if (progressText)
        progressText.textContent = `${this.currentIndex + 1}/${this.currentFlags.length}`;

      const sessionTime = templateContent.querySelector('.session-time');
      if (sessionTime) sessionTime.textContent = this.getSessionTime();

      const progressFill = templateContent.querySelector('.progress-fill') as HTMLElement;
      if (progressFill)
        progressFill.style.width = `${((this.currentIndex + 1) / this.currentFlags.length) * 100}%`;

      // 设置国旗图片
      const flagImg = templateContent.querySelector('.study-flag-img') as HTMLImageElement;
      if (flagImg) {
        flagImg.src = getFlagImageUrl(flagCode);
        flagImg.alt = countryInfo?.nameCN || flagCode.toUpperCase();
        flagImg.onerror = function () {
          (this as HTMLImageElement).src =
            `https://via.placeholder.com/300x200/f0f0f0/999?text=${flagCode.toUpperCase()}`;
        };
      }

      // 已学习标识
      const learnedIndicator = templateContent.querySelector('.learned-indicator');
      if (learnedIndicator && flagProgress.learned) {
        learnedIndicator.classList.add('show');
      }

      // 国家名称
      const countryNameCN = templateContent.querySelector('.country-name-cn') as HTMLElement;
      if (countryNameCN) {
        if (countryInfo) {
          countryNameCN.textContent = countryInfo.nameCN;
        } else {
          countryNameCN.textContent = flagCode.toUpperCase();
          console.warn(`未找到国家信息: ${flagCode}`);
        }
        // 初始隐藏国家中文名
        countryNameCN.style.display = 'none';
        // 占位灰色框
        const placeholderCN = document.createElement('div');
        placeholderCN.className = 'name-placeholder-cn';
        placeholderCN.style.cssText =
          'background:#e5e7eb; border-radius:6px; margin: 4px 0; margin-left:auto; margin-right:auto;';
        if (countryNameCN.parentNode)
          countryNameCN.parentNode.insertBefore(placeholderCN, countryNameCN.nextSibling);
      }

      const countryNameEN = templateContent.querySelector('.country-name-en') as HTMLElement;
      if (countryNameEN) {
        if (countryInfo) {
          countryNameEN.textContent = countryInfo.nameEN;
        } else {
          countryNameEN.textContent = '';
        }
        // 初始隐藏国家英文名
        countryNameEN.style.display = 'none';
        // 占位灰色框（英文）
        const placeholderEN = document.createElement('div');
        placeholderEN.className = 'name-placeholder-en';
        placeholderEN.style.cssText =
          'background:#f3f4f6; border-radius:6px; margin: 2px 0 6px; margin-left:auto; margin-right:auto;';
        if (countryNameEN.parentNode)
          countryNameEN.parentNode.insertBefore(placeholderEN, countryNameEN.nextSibling);
      }

      // 固定名称区域高度
      const namesContainer = countryNameCN ? countryNameCN.parentNode : null;
      if (namesContainer && (namesContainer as HTMLElement).style) {
        (namesContainer as HTMLElement).style.minHeight = '64px';
      }

      // 大洲标签
      const countryContinent = templateContent.querySelector('.country-continent');
      if (countryContinent) {
        if (countryInfo) {
          countryContinent.textContent = this.getLocalizedContinentName(countryInfo.continent);
        } else {
          countryContinent.textContent = '';
        }
      }

      // 绑定按钮事件
      const prevBtn = templateContent.querySelector('.study-btn-prev') as HTMLButtonElement;
      const nextBtn = templateContent.querySelector('.study-btn-next') as HTMLButtonElement;

      const dontKnowText = i18n.t('memory.dontKnow');
      const knowText = i18n.t('memory.know');

      if (prevBtn) prevBtn.textContent = dontKnowText;
      if (nextBtn) nextBtn.textContent = knowText;

      const revealAndAdvance = (recognized: boolean) => {
        // 防止重复点击
        if (prevBtn) prevBtn.disabled = true;

        // 显示名称
        if (countryNameCN) {
          countryNameCN.style.display = '';
          const plc = countryNameCN.parentNode?.querySelector(
            '.name-placeholder-cn'
          ) as HTMLElement;
          if (plc) plc.style.display = 'none';
        }
        if (countryNameEN) {
          countryNameEN.style.display = '';
          const ple = countryNameEN.parentNode?.querySelector(
            '.name-placeholder-en'
          ) as HTMLElement;
          if (ple) ple.style.display = 'none';
        }

        // 仅当认识时记录为已学习，并隐藏"不认识"按钮
        if (recognized) {
          if (prevBtn) prevBtn.style.display = 'none';
          this.markCurrentFlagLearned();
        }

        // 跳转逻辑：改为手动点击"下一个"
        if (nextBtn) {
          nextBtn.disabled = false;
          const nextText = i18n.t('memory.next');
          nextBtn.textContent = nextText;
          nextBtn.onclick = () => {
            nextBtn.disabled = true;
            this.currentIndex++;
            this.showFlag();
          };
        }
      };

      if (prevBtn) {
        prevBtn.onclick = () => {
          revealAndAdvance(false);
          prevBtn.style.display = 'none';
        };
      }
      if (nextBtn) nextBtn.onclick = () => revealAndAdvance(true);

      // 插入到页面
      studyContent.innerHTML = '';
      studyContent.appendChild(templateContent);

      // 调整占位条的尺寸
      const adjustPlaceholder = (nameEl: HTMLElement | null, placeholderSelector: string) => {
        if (!nameEl) return;
        const placeholder = nameEl.parentNode?.querySelector(placeholderSelector) as HTMLElement;
        if (!placeholder) return;

        const prevDisplay = nameEl.style.display;
        const prevVisibility = nameEl.style.visibility;
        nameEl.style.visibility = 'hidden';
        nameEl.style.display = 'block';

        void nameEl.offsetWidth;
        const cs = window.getComputedStyle(nameEl);
        const widthPx = nameEl.offsetWidth || nameEl.scrollWidth || 0;
        const fontSize = cs.fontSize || '16px';

        nameEl.style.display = prevDisplay || 'none';
        nameEl.style.visibility = prevVisibility || '';

        placeholder.style.height = fontSize;
        if (widthPx > 0) {
          const shortened = Math.max(40, Math.round(widthPx * 0.6));
          placeholder.style.width = shortened + 'px';
        } else {
          placeholder.style.width = '60%';
        }
      };

      adjustPlaceholder(countryNameCN, '.name-placeholder-cn');
      adjustPlaceholder(countryNameEN, '.name-placeholder-en');
    }
  }

  /**
   * 标记当前国旗为已学习
   */
  private markCurrentFlagLearned(): void {
    if (this.currentIndex < 0 || this.currentIndex >= this.currentFlags.length) return;

    const code = this.currentFlags[this.currentIndex];
    const now = new Date().toISOString();

    const existing = this.progress[code] || ({} as MemoryProgress);
    const wasLearned = !!existing.learned;

    this.progress[code] = {
      learned: true,
      firstLearnedAt: existing.firstLearnedAt || now,
      lastLearnedAt: now,
      learnCount: (existing.learnCount || 0) + 1,
    };

    // 会话内统计仅在首次学会时+1
    if (!wasLearned) {
      this.currentSession.flagsStudied = (this.currentSession.flagsStudied || 0) + 1;
    }

    // 保存并更新概览/分类进度
    this.saveProgress();
    if (this.currentCategory) {
      this.updateCategoryProgress(this.currentCategory);
    }
    this.updateMemoryStats();
  }

  /**
   * 显示完成页面
   */
  private showComplete(): void {
    const studyContent = document.getElementById('studyContent');
    if (!studyContent) return;

    // 在结束前对最后一张进行学习标记
    this.markCurrentFlagLearned();

    const sessionTime = this.getSessionTime();
    const studiedCount = this.currentSession.flagsStudied;

    // 更新分类进度
    if (this.currentCategory) {
      this.updateCategoryProgress(this.currentCategory);
    }

    // 使用学习完成模板
    const completeTemplate = document.getElementById(
      'study-complete-template'
    ) as HTMLTemplateElement;
    if (completeTemplate) {
      const templateContent = completeTemplate.content.cloneNode(true) as DocumentFragment;

      const totalLearned = templateContent.querySelector('.total-learned');
      if (totalLearned) totalLearned.textContent = this.currentFlags.length.toString();

      const newLearned = templateContent.querySelector('.new-learned');
      if (newLearned) newLearned.textContent = studiedCount.toString();

      const sessionTimeEl = templateContent.querySelector('.session-time');
      if (sessionTimeEl) sessionTimeEl.textContent = sessionTime;

      // 绑定按钮事件
      const returnHomeBtn = templateContent.querySelector('.return-home-btn') as HTMLButtonElement;
      const continueStudyBtn = templateContent.querySelector(
        '.continue-study-btn'
      ) as HTMLButtonElement;

      if (returnHomeBtn) returnHomeBtn.onclick = () => this.returnToMemory();
      if (continueStudyBtn) continueStudyBtn.onclick = () => this.continueToNextCategory();

      // 插入到页面
      studyContent.innerHTML = '';
      studyContent.appendChild(templateContent);
    }
  }

  /**
   * 返回记忆训练主界面
   */
  private returnToMemory(): void {
    // 隐藏学习页面
    const studySection = document.getElementById('study-section');
    if (studySection) studySection.style.display = 'none';

    // 显示记忆训练主界面
    const memorySection = document.getElementById('memory-section');
    if (memorySection) memorySection.style.display = 'block';

    // 重新显示记忆训练内容
    this.showMemory();
  }

  /**
   * 继续到下一个分类
   */
  private continueToNextCategory(): void {
    const current = this.currentCategory;
    const categories = Object.entries(this.categories);

    // 未完成的分类，排除当前
    const incomplete = categories.filter(([name]) => {
      if (name === current) return false;
      const progress = this.getCategoryProgress(name);
      return progress.status !== 'completed';
    });

    if (incomplete.length > 0) {
      // 按进度排序
      incomplete.sort((a, b) => {
        const aProgress = this.getCategoryProgress(a[0]);
        const bProgress = this.getCategoryProgress(b[0]);
        const aPercent = aProgress.learnedCount / a[1].countries.length;
        const bPercent = bProgress.learnedCount / b[1].countries.length;
        return aPercent - bPercent;
      });

      const nextCategory = incomplete[0][0];
      this.startCategoryStudy(nextCategory);
      return;
    }

    // 都完成了，选择需要复习的
    const review = categories.filter(([name]) => {
      if (name === current) return false;
      const days = this.getDaysSinceLastStudy(name);
      return days > 7;
    });

    if (review.length > 0) {
      review.sort((a, b) => {
        const aDays = this.getDaysSinceLastStudy(a[0]);
        const bDays = this.getDaysSinceLastStudy(b[0]);
        return bDays - aDays;
      });
      const nextCategory = review[0][0];
      this.startCategoryStudy(nextCategory);
      return;
    }

    // 没有下一个分类
    this.showMessage('🎉 所有分类均已完成，暂无需要继续的分类');
    this.returnToMemory();
  }

  /**
   * 获取会话时间
   */
  private getSessionTime(): string {
    if (!this.currentSession.startTime) return '00:00';
    const elapsed = Math.floor((Date.now() - this.currentSession.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 获取今日学习数量
   */
  private getTodayStudiedCount(): number {
    const today = new Date().toDateString();
    return Object.values(this.progress).filter(
      (p) => p.learned && p.firstLearnedAt && new Date(p.firstLearnedAt).toDateString() === today
    ).length;
  }

  /**
   * 智能学习 - 选择最佳分类
   */
  private startSmartLearning(): void {
    const selectedCategory = this.selectBestCategory();
    if (!selectedCategory) {
      this.showMessage('🎉 恭喜！您已经完成了所有分类的学习！');
      return;
    }

    this.currentCategory = selectedCategory;
    this.learningState.currentCategory = selectedCategory;
    this.learningState.lastStudiedCategory = selectedCategory;

    // 记录学习历史
    this.recordLearningSession(selectedCategory);

    // 开始学习
    this.startCategoryStudy(selectedCategory);
  }

  /**
   * 选择最佳学习分类
   */
  private selectBestCategory(): string | null {
    const categories = Object.entries(this.categories);

    // 1. 优先选择未完成的分类
    const incompleteCategories = categories.filter(([name, _data]) => {
      const progress = this.getCategoryProgress(name);
      return progress.status !== 'completed';
    });

    if (incompleteCategories.length > 0) {
      // 按进度排序
      incompleteCategories.sort((a, b) => {
        const aProgress = this.getCategoryProgress(a[0]);
        const bProgress = this.getCategoryProgress(b[0]);
        const aProgressPercent = aProgress.learnedCount / a[1].countries.length;
        const bProgressPercent = bProgress.learnedCount / b[1].countries.length;
        return aProgressPercent - bProgressPercent;
      });

      return incompleteCategories[0][0];
    }

    // 2. 选择需要复习的分类
    const reviewCategories = categories.filter(([name, _data]) => {
      const daysSinceLastStudy = this.getDaysSinceLastStudy(name);
      return daysSinceLastStudy > 7;
    });

    if (reviewCategories.length > 0) {
      reviewCategories.sort((a, b) => {
        const aDays = this.getDaysSinceLastStudy(a[0]);
        const bDays = this.getDaysSinceLastStudy(b[0]);
        return bDays - aDays;
      });

      return reviewCategories[0][0];
    }

    return null;
  }

  /**
   * 获取分类进度
   */
  private getCategoryProgress(categoryName: string): CategoryProgress {
    if (!this.categoryProgress[categoryName]) {
      const category = this.categories[categoryName];
      const learnedCount = category.countries.filter((code) => this.progress[code]?.learned).length;

      this.categoryProgress[categoryName] = {
        status: learnedCount === category.countries.length ? 'completed' : 'in_progress',
        learnedCount: learnedCount,
        totalCount: category.countries.length,
        lastStudied: null,
        studyCount: 0,
      };
    }

    return this.categoryProgress[categoryName];
  }

  /**
   * 获取距离上次学习的天数
   */
  private getDaysSinceLastStudy(categoryName: string): number {
    const progress = this.getCategoryProgress(categoryName);
    if (!progress.lastStudied) return 999;

    const lastStudy = new Date(progress.lastStudied);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastStudy.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * 记录学习会话
   */
  private recordLearningSession(categoryName: string): void {
    const now = new Date().toISOString();

    // 更新分类进度
    const progress = this.getCategoryProgress(categoryName);
    progress.lastStudied = now;
    progress.studyCount = (progress.studyCount || 0) + 1;

    // 保存分类进度
    this.saveCategoryProgress();

    // 添加到学习历史
    this.learningState.sessionHistory.push({
      category: categoryName,
      startTime: now,
      sessionType: '智能学习',
    });

    // 只保留最近50条历史记录
    if (this.learningState.sessionHistory.length > 50) {
      this.learningState.sessionHistory = this.learningState.sessionHistory.slice(-50);
    }

    // 保存学习状态
    this.saveLearningState();
  }

  /**
   * 更新分类进度
   */
  private updateCategoryProgress(categoryName: string): void {
    const category = this.categories[categoryName];
    const learnedCount = category.countries.filter((code) => this.progress[code]?.learned).length;

    const progress = this.getCategoryProgress(categoryName);
    progress.learnedCount = learnedCount;
    progress.status = learnedCount === category.countries.length ? 'completed' : 'in_progress';

    this.saveCategoryProgress();
  }

  /**
   * 保存进度数据
   */
  private saveProgress(): void {
    try {
      localStorage.setItem('enhancedMemoryProgress', JSON.stringify(this.progress));
    } catch {
      console.warn('记忆进度保存失败');
    }
  }

  /**
   * 保存分类进度
   */
  private saveCategoryProgress(): void {
    try {
      localStorage.setItem('categoryProgress', JSON.stringify(this.categoryProgress));
    } catch {
      console.warn('分类进度保存失败');
    }
  }

  /**
   * 保存学习状态
   */
  private saveLearningState(): void {
    try {
      localStorage.setItem('learningState', JSON.stringify(this.learningState));
    } catch {
      console.warn('学习状态保存失败');
    }
  }

  /**
   * 更新开始学习按钮状态
   */
  private updateStartLearningButton(): void {
    const startBtn = document.getElementById('startLearningBtn');
    if (!startBtn) return;

    const selectedCategory = this.selectBestCategory();
    const btnIcon = startBtn.querySelector('.btn-icon');
    const btnText = startBtn.querySelector('.btn-text');
    const learningHint = document.querySelector('.learning-hint');

    if (!selectedCategory) {
      // 所有分类都已完成
      startBtn.className = 'start-learning-btn review-mode';
      if (btnIcon) btnIcon.textContent = '🎉';
      if (btnText) btnText.textContent = i18n.t('memory.reviewMode');
      if (learningHint) learningHint.textContent = i18n.t('memory.allCompletedReview');
    } else {
      const progress = this.getCategoryProgress(selectedCategory);

      if (progress.status === 'in_progress' && progress.learnedCount > 0) {
        // 有未完成的学习进度
        startBtn.className = 'start-learning-btn continue-mode';
        if (btnIcon) btnIcon.textContent = '📚';
        if (btnText) btnText.textContent = i18n.t('memory.continueMode');
        const localizedCategory = this.getLocalizedCategoryName(
          selectedCategory,
          this.categories[selectedCategory]
        );
        if (learningHint)
          learningHint.textContent = i18n.t('memory.continueCategory', {
            category: localizedCategory,
            learned: progress.learnedCount.toString(),
            total: progress.totalCount.toString(),
          });
      } else {
        // 开始新的学习
        startBtn.className = 'start-learning-btn';
        if (btnIcon) btnIcon.textContent = '🚀';
        if (btnText) btnText.textContent = i18n.t('memory.startButton');
        const localizedCategory = this.getLocalizedCategoryName(
          selectedCategory,
          this.categories[selectedCategory]
        );
        if (learningHint)
          learningHint.textContent = i18n.t('memory.systemRecommendation', {
            category: localizedCategory,
          });
      }
    }
  }

  /**
   * 检查每日进度
   */
  private checkDailyProgress(): void {
    const today = new Date().toDateString();
    const todayProgress = this.learningState.sessionHistory.filter(
      (session) => new Date(session.startTime).toDateString() === today
    );

    if (todayProgress.length === 0) {
      console.log('今天还没有开始学习，加油！');
    }
  }

  /**
   * 显示消息提示
   */
  private showMessage(message: string): void {
    const messageEl = document.createElement('div');
    messageEl.className = 'message-popup';
    messageEl.textContent = message;

    document.body.appendChild(messageEl);

    setTimeout(() => {
      messageEl.classList.add('reverse');
      setTimeout(() => {
        document.body.removeChild(messageEl);
      }, 300);
    }, 3000);
  }

  /**
   * 清除学习进度
   */
  private clearMemoryProgress(): void {
    console.log('🗑️ clearMemoryProgress called');

    // 创建自定义确认对话框
    const confirmDialog = document.createElement('div');
    confirmDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: inherit;
        `;

    const confirmTitle = i18n.t('memory.confirmClearProgress');
    const confirmDetails = i18n.t('memory.clearDialogDetails');
    const confirmClearText = i18n.t('memory.confirmClear');
    const cancelText = i18n.t('memory.cancel');

    confirmDialog.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 15px;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            ">
                <div style="font-size: 3rem; margin-bottom: 15px;">⚠️</div>
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 1.3rem;">${confirmTitle}</h3>
                <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.5;">
                    ${confirmDetails}
                </p>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="confirmClearBtn" style="
                        background: #ef4444;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">${confirmClearText}</button>
                    <button id="cancelClearBtn" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">${cancelText}</button>
                </div>
            </div>
        `;

    document.body.appendChild(confirmDialog);

    const confirmBtn = document.getElementById('confirmClearBtn');
    const cancelBtn = document.getElementById('cancelClearBtn');

    const handleConfirm = () => {
      try {
        // 清除所有localStorage中的记忆训练相关数据
        localStorage.removeItem('enhancedMemoryProgress');
        localStorage.removeItem('categoryProgress');
        localStorage.removeItem('learningState');
        localStorage.removeItem('sessionHistory');
        localStorage.removeItem('memoryAchievements');

        // 重置内存中的数据
        this.progress = {};
        this.categoryProgress = {};
        this.learningState = {
          currentCategory: null,
          lastStudiedCategory: null,
          sessionHistory: [],
        };

        // 显示成功消息
        this.showMessage(i18n.t('memory.progressClearedSuccess'));

        // 重新显示记忆训练界面以更新UI
        setTimeout(() => {
          this.showMemory();
        }, 1000);
      } catch (error) {
        console.error('清除学习进度时出错:', error);
        this.showMessage(i18n.t('memory.clearFailed'));
      }

      document.body.removeChild(confirmDialog);
    };

    const handleCancel = () => {
      document.body.removeChild(confirmDialog);
    };

    if (confirmBtn) confirmBtn.onclick = handleConfirm;
    if (cancelBtn) cancelBtn.onclick = handleCancel;

    confirmDialog.onclick = (e) => {
      if (e.target === confirmDialog) {
        handleCancel();
      }
    };

    // ESC键关闭
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancel();
        document.removeEventListener('keydown', handleEscKey);
      }
    };
    document.addEventListener('keydown', handleEscKey);
  }

  /**
   * 打乱数组
   */
  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// 创建单例实例
export const memoryModule = new MemoryModule();

/**
 * 初始化记忆训练模块
 */
export function initMemoryModule(): void {
  memoryModule.init();
  console.log('✅ Memory module initialized');
}

// 导出到全局（向后兼容）
if (typeof window !== 'undefined') {
  (window as any).EnhancedMemorySystem = memoryModule;
  (window as any).memoryModule = memoryModule;
}

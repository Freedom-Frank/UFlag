/**
 * 主应用协调器
 * 负责初始化所有模块、管理导航和协调模块间交互
 */

import { i18n } from './lib/i18n-core';
import { loadCountries, loadTranslations } from './lib/data-loader';
import { appState, getAllCountries } from './lib/state';
import { initBrowseModule, displayFlags, rerenderBrowseCards } from './modules/browse';
import { initQuizModule } from './modules/quiz';
import { initCountryDetailModule } from './modules/country-detail';
import { initStatsModule, statsModule } from './modules/stats';
import { initMemoryModule, memoryModule } from './modules/memory';
import { globeModule } from './modules/globe';
import { safeSetDisplay } from './lib/utils';

/**
 * 当前显示的区域
 */
type Section = 'browse' | 'quiz' | 'memory' | 'globe' | 'stats';

/**
 * 应用类
 */
class App {
  private currentSection: Section = 'browse';
  private initialized = false;

  /**
   * 初始化应用
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️ App already initialized');
      return;
    }

    try {
      console.log('🚀 Starting UFlag application...');

      // 1. 加载数据
      console.log('🌍 Loading countries data...');
      const countries = await loadCountries();
      appState.setAllCountries(countries);
      console.log(`✅ Loaded ${countries.length} countries`);

      // 2. 加载翻译数据
      console.log('🌐 Loading translations...');
      const translations = await loadTranslations();
      i18n.setTranslations(translations);

      // 设置用户首选语言
      const preferredLanguage = localStorage.getItem('preferredLanguage') || 'zh';
      i18n.setLanguage(preferredLanguage as 'zh' | 'en');
      this.updateLanguageButtons(preferredLanguage);
      console.log(`✅ Language set to: ${preferredLanguage}`);

      // 3. 初始化模块
      console.log('🔧 Initializing modules...');
      this.initModules();

      // 4. 设置事件监听
      console.log('🔗 Setting up event listeners...');
      this.setupEventListeners();

      // 5. 显示默认页面
      console.log('📂 Showing default section (browse)...');
      this.showSection('browse');
      displayFlags();

      console.log('🎉 Application initialized successfully!');
      this.initialized = true;

      // 清理可能的UI问题
      setTimeout(() => this.cleanupUI(), 1000);
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.handleInitError(error);
    }
  }

  /**
   * 初始化所有模块
   */
  private initModules(): void {
    initBrowseModule();
    initQuizModule();
    initCountryDetailModule();
    initStatsModule();
    initMemoryModule();
    // Globe模块延迟初始化，当用户切换到globe页面时才初始化

    // 订阅语言变化
    i18n.subscribe(() => {
      this.handleLanguageChange();
    });

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      globeModule.handleResize();
    });

    console.log('✅ All modules initialized');
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    // 导航按钮
    this.setupNavigationListeners();

    // 语言切换按钮
    this.setupLanguageListeners();

    // 键盘快捷键
    this.setupKeyboardShortcuts();

    console.log('✅ Event listeners set up');
  }

  /**
   * 设置导航监听
   */
  private setupNavigationListeners(): void {
    const navButtons = {
      browse: document.getElementById('nav-browse'),
      quiz: document.getElementById('nav-quiz'),
      memory: document.getElementById('nav-memory'),
      globe: document.getElementById('nav-globe'),
      stats: document.getElementById('nav-stats'),
    };

    Object.entries(navButtons).forEach(([section, button]) => {
      if (button) {
        button.addEventListener('click', () => {
          this.showSection(section as Section);
        });
      }
    });
  }

  /**
   * 设置语言切换监听
   */
  private setupLanguageListeners(): void {
    const langButtons = document.querySelectorAll('.lang-btn');

    langButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang') as 'zh' | 'en';
        if (lang) {
          i18n.setLanguage(lang);
          localStorage.setItem('preferredLanguage', lang);
          this.updateLanguageButtons(lang);
        }
      });
    });
  }

  /**
   * 设置键盘快捷键
   */
  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + 数字键切换页面
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const sections: Section[] = ['browse', 'quiz', 'memory', 'globe', 'stats'];
        const index = parseInt(e.key) - 1;
        if (sections[index]) {
          this.showSection(sections[index]);
        }
      }
    });
  }

  /**
   * 显示指定区域
   */
  showSection(section: Section): void {
    // 隐藏所有区域
    const sections = ['browse', 'quiz', 'memory', 'globe', 'stats'];
    sections.forEach((s) => {
      safeSetDisplay(`${s}-section`, 'none');
    });

    // 显示目标区域
    safeSetDisplay(`${section}-section`, 'block');

    // 更新导航按钮状态
    this.updateNavigationButtons(section);

    // 更新当前区域
    this.currentSection = section;

    // 触发区域特定的初始化
    this.onSectionShow(section);

    console.log(`📍 Switched to section: ${section}`);
  }

  /**
   * 当区域显示时触发
   */
  private onSectionShow(section: Section): void {
    switch (section) {
      case 'browse':
        // 浏览模式：刷新国旗显示
        displayFlags();
        break;

      case 'stats':
        // 统计模式：更新统计数据
        statsModule.showStats();
        statsModule.displayAchievements();
        break;

      case 'memory':
        // 记忆训练：显示记忆训练界面
        memoryModule.showMemory();
        break;

      case 'globe':
        // 3D地球仪：初始化地球仪
        globeModule.init(getAllCountries()).catch((error) => {
          console.error('Failed to initialize globe module:', error);
        });
        break;

      case 'quiz':
        // 测验模式：无需特殊处理
        break;
    }
  }

  /**
   * 更新导航按钮状态
   */
  private updateNavigationButtons(activeSection: Section): void {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn) => {
      btn.classList.remove('active');
      if (btn.id === `nav-${activeSection}`) {
        btn.classList.add('active');
      }
    });
  }

  /**
   * 更新语言按钮状态
   */
  private updateLanguageButtons(lang: string): void {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach((btn) => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      }
    });
  }

  /**
   * 处理语言变化
   */
  private handleLanguageChange(): void {
    console.log('🌐 Language changed, updating UI...');

    // 更新DOM
    i18n.updateDOM();

    // 重新渲染浏览卡片
    if (this.currentSection === 'browse') {
      rerenderBrowseCards();
    }

    // 重新渲染记忆训练分类
    if (this.currentSection === 'memory') {
      memoryModule.showMemory();
    }
  }

  /**
   * 清理UI问题
   */
  private cleanupUI(): void {
    // 清空记忆训练容器的异常内容
    const simpleMemoryContainer = document.getElementById('simpleMemoryContainer');
    if (simpleMemoryContainer && simpleMemoryContainer.children.length > 0) {
      console.warn('🚨 Detected content in memory container, cleaning up...');
      simpleMemoryContainer.innerHTML = '';
    }

    // 移除可能错误添加的对话框
    const possibleDialogs = document.body.querySelectorAll(
      '.message-popup, [style*="position"], [style*="fixed"]'
    );
    possibleDialogs.forEach((el) => {
      const text = el.textContent || '';
      if (
        text.includes('清除') ||
        text.includes('clear') ||
        text.includes('progress') ||
        text.includes('学习记录')
      ) {
        console.warn('🚨 Removing erroneous dialog:', el);
        el.parentNode?.removeChild(el);
      }
    });

    // 移除高z-index元素
    const fixedElements = document.body.querySelectorAll(
      '[style*="position: fixed"], [style*="position:fixed"]'
    );
    fixedElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.style.zIndex && parseInt(htmlEl.style.zIndex) > 1000) {
        console.warn('🚨 Removing high z-index element:', el);
        el.parentNode?.removeChild(el);
      }
    });

    console.log('✅ UI cleanup completed');
  }

  /**
   * 处理初始化错误
   */
  private handleInitError(error: unknown): void {
    const errorMessage =
      i18n.getCurrentLanguage() === 'en'
        ? 'Failed to initialize the application. Please refresh the page.'
        : '应用初始化失败，请刷新页面。';

    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fee;
      color: #c00;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      z-index: 9999;
    `;
    errorDiv.innerHTML = `
      <h3>❌ ${errorMessage}</h3>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <button onclick="location.reload()" style="
        margin-top: 10px;
        padding: 8px 16px;
        background: #c00;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      ">
        ${i18n.getCurrentLanguage() === 'en' ? 'Reload' : '刷新页面'}
      </button>
    `;
    document.body.appendChild(errorDiv);
  }

  /**
   * 获取当前区域
   */
  getCurrentSection(): Section {
    return this.currentSection;
  }

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// 创建应用实例
export const app = new App();

// 导出到全局（向后兼容）
if (typeof window !== 'undefined') {
  (window as any).app = app;
  (window as any).showSection = (section: Section) => app.showSection(section);
}

// 当DOM加载完成时自动初始化
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      app.init();
    });
  } else {
    // DOM已经加载完成
    app.init();
  }
}

export default app;

/**
 * 统一国际化翻译核心模块 (TypeScript 版本)
 * 整合了原来的 UnifiedTranslationManager 和 ModernI18n 功能
 * 提供统一的翻译 API 和智能 DOM 更新功能
 */

import type {
  Language,
  TranslationParams,
  TranslationData,
  Translations,
  LanguageChangeCallback,
  Country,
  ContinentKey,
  FeatureKey,
} from '../types';

export class UnifiedI18n {
  private currentLanguage: Language = 'zh';
  private translations: Translations = { zh: {}, en: {} };
  private observers: Set<LanguageChangeCallback> = new Set();
  private fallbackLanguage: Language = 'zh';
  private loaded = false;

  /** 设置翻译数据 */
  setTranslations(translations: Translations): void {
    this.translations = translations;
    this.loaded = true;
    this.notifyObservers();
  }

  /** 获取当前语言 */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /** 设置语言 */
  setLanguage(lang: Language): boolean {
    if (this.currentLanguage !== lang && this.translations[lang]) {
      this.currentLanguage = lang;
      localStorage.setItem('preferredLanguage', lang);
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-US';
      this.notifyObservers();
      return true;
    }
    return false;
  }

  /** 核心翻译函数 */
  t(key: string, params: TranslationParams = {}): string {
    if (!this.loaded) {
      console.warn('i18n not loaded yet, returning key:', key);
      return key;
    }

    let translation = this.getNestedTranslation(this.translations[this.currentLanguage], key);

    // 回退机制
    if (!translation && this.currentLanguage !== this.fallbackLanguage) {
      translation = this.getNestedTranslation(this.translations[this.fallbackLanguage], key);
    }

    // 如果仍然没有翻译，返回 key
    if (!translation) {
      console.warn(
        `Translation not found for key: "${key}" in language: "${this.currentLanguage}"`
      );
      return key;
    }

    // 参数替换
    return this.interpolateParams(translation, params);
  }

  /** 获取嵌套翻译 */
  private getNestedTranslation(obj: TranslationData, path: string): string | undefined {
    const result = path
      .split('.')
      .reduce<
        TranslationData | string | undefined
      >((current, key) => (current && typeof current === 'object' ? current[key] : undefined), obj);
    return typeof result === 'string' ? result : undefined;
  }

  /** 参数插值 */
  private interpolateParams(text: string, params: TranslationParams): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /** 订阅语言变化 */
  subscribe(callback: LanguageChangeCallback): () => void {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  /** 通知观察者 */
  private notifyObservers(): void {
    this.observers.forEach((callback) => callback(this.currentLanguage));
  }

  /** 获取记忆训练分类键 */
  getMemoryCategoryKey(continent: string, groupNumber: number | null = null): string {
    const continentKeyMap: Record<string, string> = {
      亚洲: 'asia',
      欧洲: 'europe',
      非洲: 'africa',
      北美洲: 'northAmerica',
      南美洲: 'southAmerica',
      大洋洲: 'oceania',
      Asia: 'asia',
      Europe: 'europe',
      Africa: 'africa',
      'North America': 'northAmerica',
      'South America': 'southAmerica',
      Oceania: 'oceania',
    };

    const normalizedContinent = continentKeyMap[continent] || continent;
    const noGroupContinents = ['southAmerica', 'antarctica'];

    if (noGroupContinents.includes(normalizedContinent) || !groupNumber) {
      return `memory.category.${normalizedContinent}`;
    }

    return `memory.category.${normalizedContinent}.${groupNumber}`;
  }

  /** 获取记忆训练描述键 */
  getMemoryDescriptionKey(continent: string): string {
    const continentKeyMap: Record<string, ContinentKey> = {
      亚洲: 'asia',
      欧洲: 'europe',
      非洲: 'africa',
      北美洲: 'northAmerica',
      南美洲: 'southAmerica',
      大洋洲: 'oceania',
      Asia: 'asia',
      Europe: 'europe',
      Africa: 'africa',
      'North America': 'northAmerica',
      'South America': 'southAmerica',
      Oceania: 'oceania',
    };

    const normalizedContinent = continentKeyMap[continent] || continent;
    return `memory.continentDescriptions.${normalizedContinent}`;
  }

  /** 获取记忆训练技巧键 */
  getMemoryTipsKey(continent: string): string {
    const continentKeyMap: Record<string, ContinentKey> = {
      亚洲: 'asia',
      欧洲: 'europe',
      非洲: 'africa',
      北美洲: 'northAmerica',
      南美洲: 'southAmerica',
      大洋洲: 'oceania',
      Asia: 'asia',
      Europe: 'europe',
      Africa: 'africa',
      'North America': 'northAmerica',
      'South America': 'southAmerica',
      Oceania: 'oceania',
    };

    const normalizedContinent = continentKeyMap[continent] || continent;
    return `memory.continentTips.${normalizedContinent}`;
  }

  /** 智能文本翻译（兼容原 UnifiedTranslationManager 的功能） */
  translateText(text: string): string {
    const isZhMode = this.currentLanguage === 'zh';

    // 首先检查是否是翻译键格式
    if (text.startsWith('memory.')) {
      const translation = this.t(text);
      if (translation !== text) {
        return translation;
      }
    }

    // 分类标题模式匹配
    if (isZhMode) {
      // 英文到中文的分类标题
      text = text.replace(/Europe\((\d+)\)/g, '欧洲（$1）');
      text = text.replace(/Africa\((\d+)\)/g, '非洲（$1）');
      text = text.replace(/Asia\((\d+)\)/g, '亚洲（$1）');
      text = text.replace(/North America\((\d+)\)/g, '北美洲（$1）');
      text = text.replace(/\bSouth America\b/g, '南美洲');
      text = text.replace(/Oceania\((\d+)\)/g, '大洋洲（$1）');

      // 特征标签翻译
      const featureTranslations: Record<string, string> = {
        Stars: '星星',
        Cross: '十字',
        Crescent: '月牙',
        Sun: '太阳',
        Animals: '动物',
        Plants: '植物',
        Geometric: '几何图形',
        'Horizontal Stripes': '水平条纹',
        'Vertical Stripes': '垂直条纹',
        'Diagonal Stripes': '对角条纹',
        'Union Jack': '联合杰克',
        'Pan-African': '泛非色彩',
        'Pan-Arab': '泛阿拉伯色彩',
        'Nordic Cross': '北欧十字',
        Solid: '纯色',
        'Complex Emblem': '复杂徽章',
      };

      // 大洲标签翻译
      const continentTranslations: Record<string, string> = {
        Asia: '亚洲',
        Europe: '欧洲',
        Africa: '非洲',
        'North America': '北美洲',
        'South America': '南美洲',
        Oceania: '大洋洲',
        Antarctica: '南极洲',
      };

      Object.entries(featureTranslations).forEach(([en, zh]) => {
        if (text === en) text = zh;
      });

      Object.entries(continentTranslations).forEach(([en, zh]) => {
        if (text === en) text = zh;
      });
    } else {
      // 中文到英文的分类标题
      text = text.replace(/欧洲（(\d+)）/g, 'Europe($1)');
      text = text.replace(/非洲（(\d+)）/g, 'Africa($1)');
      text = text.replace(/亚洲（(\d+)）/g, 'Asia($1)');
      text = text.replace(/北美洲（(\d+)）/g, 'North America($1)');
      text = text.replace(/\b南美洲\b/g, 'South America');
      text = text.replace(/大洋洲（(\d+)）/g, 'Oceania($1)');

      // 特征标签翻译
      const featureTranslations: Record<string, string> = {
        星星: 'Stars',
        十字: 'Cross',
        月牙: 'Crescent',
        太阳: 'Sun',
        动物: 'Animals',
        植物: 'Plants',
        几何图形: 'Geometric',
        水平条纹: 'Horizontal Stripes',
        垂直条纹: 'Vertical Stripes',
        对角条纹: 'Diagonal Stripes',
        联合杰克: 'Union Jack',
        泛非色彩: 'Pan-African',
        泛阿拉伯色彩: 'Pan-Arab',
        北欧十字: 'Nordic Cross',
        纯色: 'Solid',
        复杂徽章: 'Complex Emblem',
      };

      // 大洲标签翻译
      const continentTranslations: Record<string, string> = {
        亚洲: 'Asia',
        欧洲: 'Europe',
        非洲: 'Africa',
        北美洲: 'North America',
        南美洲: 'South America',
        大洋洲: 'Oceania',
        南极洲: 'Antarctica',
      };

      Object.entries(featureTranslations).forEach(([zh, en]) => {
        if (text === zh) text = en;
      });

      Object.entries(continentTranslations).forEach(([zh, en]) => {
        if (text === zh) text = en;
      });
    }

    return text;
  }

  /** 智能扫描并翻译 DOM 元素 */
  scanAndTranslate(element: HTMLElement): void {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    let textNode: Node | null;
    const textNodes: Node[] = [];

    // 收集所有文本节点，但跳过动态内容
    while ((textNode = walker.nextNode())) {
      if (textNode.textContent?.trim()) {
        const parent = (textNode as Text).parentElement;
        if (
          parent &&
          (parent.classList.contains('flag-name-cn') ||
            parent.classList.contains('flag-name-en') ||
            parent.classList.contains('continent-tag') ||
            parent.classList.contains('style-tag') ||
            parent.classList.contains('country-name') ||
            parent.classList.contains('answer-text') ||
            parent.classList.contains('option-text') ||
            parent.id === 'flags-container')
        ) {
          continue;
        }
        textNodes.push(textNode);
      }
    }

    // 翻译每个文本节点
    textNodes.forEach((node) => {
      const originalText = node.textContent?.trim() || '';
      const translatedText = this.translateText(originalText);
      if (translatedText !== originalText && node.textContent) {
        node.textContent = translatedText;
      }
    });
  }

  /** 批量更新 DOM 元素 */
  updateDOM(): void {
    // 更新带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (!key) return;

      const translation = this.t(key);
      if (translation && translation !== key) {
        // 检查是否是需要HTML渲染的理念阐释内容
        if (
          key.startsWith('welcome.philosophy.') ||
          element.classList.contains('philosophy-paragraph') ||
          element.classList.contains('philosophy-title')
        ) {
          element.innerHTML = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // 更新带有 data-i18n-placeholder 属性的输入框
    document.querySelectorAll<HTMLInputElement>('[data-i18n-placeholder]').forEach((input) => {
      const key = input.getAttribute('data-i18n-placeholder');
      if (!key) return;

      const translation = this.t(key);
      if (translation && translation !== key) {
        input.placeholder = translation;
      }
    });

    // 更新带有 data-i18n-title 属性的元素
    document.querySelectorAll('[data-i18n-title]').forEach((element) => {
      const key = element.getAttribute('data-i18n-title');
      if (!key) return;

      const translation = this.t(key);
      if (translation && translation !== key) {
        element.setAttribute('title', translation);
      }
    });
  }

  /** 获取本地化的国家名称 */
  getCountryName(country: Country | null): string {
    if (!country) return '';
    return this.currentLanguage === 'zh' ? country.nameCN : country.nameEN;
  }

  /** 获取本地化的大洲名称 */
  getContinentName(continent: string): string {
    const continentKeyMap: Record<string, ContinentKey> = {
      亚洲: 'asia',
      欧洲: 'europe',
      非洲: 'africa',
      北美洲: 'northAmerica',
      南美洲: 'southAmerica',
      大洋洲: 'oceania',
      南极洲: 'antarctica',
      Asia: 'asia',
      Europe: 'europe',
      Africa: 'africa',
      'North America': 'northAmerica',
      'South America': 'southAmerica',
      Oceania: 'oceania',
      Antarctica: 'antarctica',
    };

    const key = continentKeyMap[continent] || continent;
    const translation = this.t(`continents.${key}`);
    return translation || continent;
  }

  /** 获取本地化的特征名称 */
  getFeatureName(feature: string): string {
    const featureKeyMap: Record<string, FeatureKey> = {
      星星: 'stars',
      十字: 'cross',
      月牙: 'crescent',
      太阳: 'sun',
      动物: 'animals',
      植物: 'plants',
      几何图形: 'geometric',
      水平条纹: 'horizontalStripes',
      垂直条纹: 'verticalStripes',
      对角条纹: 'diagonalStripes',
      联合杰克: 'unionJack',
      泛非色彩: 'panAfrican',
      泛阿拉伯色彩: 'panArab',
      北欧十字: 'nordicCross',
      纯色: 'solid',
      复杂徽章: 'complexEmblem',
      Stars: 'stars',
      Cross: 'cross',
      Crescent: 'crescent',
      Sun: 'sun',
      Animals: 'animals',
      Plants: 'plants',
      Geometric: 'geometric',
      'Horizontal Stripes': 'horizontalStripes',
      'Vertical Stripes': 'verticalStripes',
      'Diagonal Stripes': 'diagonalStripes',
      'Union Jack': 'unionJack',
      'Pan-African': 'panAfrican',
      'Pan-Arab': 'panArab',
      'Nordic Cross': 'nordicCross',
      Solid: 'solid',
      'Complex Emblem': 'complexEmblem',
    };

    const key = featureKeyMap[feature] || feature;
    const translation = this.t(`features.${key}`);
    return translation || feature;
  }

  /** 翻译整个页面 */
  translatePage(): void {
    console.log('🔄 translatePage called, current language:', this.currentLanguage);

    // 翻译记忆训练模块
    const memorySection = document.getElementById('memory-section');
    if (memorySection && (memorySection as HTMLElement).style.display !== 'none') {
      this.scanAndTranslate(memorySection as HTMLElement);
    }

    // 翻译浏览模块
    const browseSection = document.getElementById('browse-section');
    if (browseSection && (browseSection as HTMLElement).style.display !== 'none') {
      this.scanAndTranslate(browseSection as HTMLElement);
      this.translateFeatureTags();
    }

    // 翻译测验模块
    const quizSection = document.getElementById('quiz-section');
    if (quizSection) {
      this.scanAndTranslate(quizSection as HTMLElement);
    }
  }

  /** 专门翻译特征标签 */
  translateFeatureTags(): void {
    const featureTags = document.querySelectorAll('.style-tag, .feature-tag');
    featureTags.forEach((tag) => {
      const feature = tag.getAttribute('data-feature');
      if (feature) {
        tag.textContent = this.getFeatureName(feature);
      }
    });
  }

  /** 一键语言切换 */
  switchLanguage(lang: Language): void {
    this.setLanguage(lang);

    // 翻译静态内容
    this.updateDOM();
    this.translatePage();

    // 重新渲染动态内容
    this.rerenderMemoryModule();
    this.rerenderBrowseCards();

    // 延迟再次翻译以确保动态内容完全更新
    setTimeout(() => {
      this.translatePage();
      this.translateQuizWrongAnswers();
      this.translateMemoryModuleButtons();
    }, 50);

    console.log(`🔄 Unified translation system switched to: ${lang}`);
  }

  /** 重新渲染记忆训练模块 */
  private rerenderMemoryModule(): void {
    if (window.enhancedMemorySystem && window.enhancedMemorySystem.renderCategories) {
      window.enhancedMemorySystem.renderCategories();
      setTimeout(() => {
        this.translatePage();
      }, 10);
    }
  }

  /** 重新渲染浏览模块的国家卡片 */
  private rerenderBrowseCards(): void {
    const flagsContainer = document.getElementById('flags-container');
    if (!flagsContainer) return;

    if (!window.filteredCountries || window.filteredCountries.length === 0) {
      return;
    }

    const flagCards = flagsContainer.querySelectorAll('.flag-card');
    const isEnglishMode = this.currentLanguage === 'en';

    flagCards.forEach((card, index) => {
      if (index < window.filteredCountries!.length) {
        const country = window.filteredCountries![index];
        const nameCN = card.querySelector('.flag-name-cn');
        const nameEN = card.querySelector('.flag-name-en');

        if (isEnglishMode) {
          if (nameCN) nameCN.textContent = country.nameEN;
          if (nameEN) nameEN.textContent = country.nameCN;
        } else {
          if (nameCN) nameCN.textContent = country.nameCN;
          if (nameEN) nameEN.textContent = country.nameEN;
        }

        // 更新大洲标签
        const continentTag = card.querySelector('.continent-tag');
        if (continentTag) {
          continentTag.textContent = this.getContinentName(country.continent);
        }

        // 更新特征标签
        const styleTag = card.querySelector('.style-tag');
        if (styleTag && country.styles && country.styles.length > 0) {
          styleTag.textContent = this.getFeatureName(country.styles[0]);
        }
      }
    });
  }

  /** 翻译测验错题卡片 */
  private translateQuizWrongAnswers(): void {
    const wrongAnswersSection = document.getElementById('wrong-answers-section');
    if (!wrongAnswersSection || (wrongAnswersSection as HTMLElement).style.display === 'none')
      return;

    const allAnswerLabels = wrongAnswersSection.querySelectorAll('.answer-label');
    allAnswerLabels.forEach((label) => {
      const currentText = label.textContent?.trim() || '';
      if (this.currentLanguage === 'zh') {
        if (currentText.includes('Correct Answer:') || currentText.includes('correctAnswer')) {
          label.textContent = '正确答案：';
        } else if (currentText.includes('Your Answer:') || currentText.includes('yourAnswer')) {
          label.textContent = '你的答案：';
        }
      } else {
        if (currentText.includes('正确答案：')) {
          label.textContent = 'Correct Answer: ';
        } else if (currentText.includes('你的答案：')) {
          label.textContent = 'Your Answer: ';
        }
      }
    });

    // 翻译题目类型
    const questionTypes = wrongAnswersSection.querySelectorAll(
      '.wrong-question-type, .question-type'
    );
    questionTypes.forEach((label) => {
      const currentText = label.textContent?.trim() || '';
      if (this.currentLanguage === 'zh') {
        if (currentText.includes('Flag to Country')) {
          label.textContent = '看国旗选国家';
        } else if (currentText.includes('Country to Flag')) {
          label.textContent = '看国家选国旗';
        }
      } else {
        if (currentText.includes('看国旗选国家')) {
          label.textContent = 'Flag to Country';
        } else if (currentText.includes('看国家选国旗')) {
          label.textContent = 'Country to Flag';
        }
      }
    });
  }

  /** 翻译记忆训练模块按钮 */
  private translateMemoryModuleButtons(): void {
    const memorySection =
      document.querySelector('.memory-section') || document.querySelector('#memory-section');
    if (!memorySection) return;

    // 翻译开始学习按钮
    const startButtons = memorySection.querySelectorAll('button');
    startButtons.forEach((btn) => {
      const btnText = btn.textContent?.trim() || '';
      if (this.currentLanguage === 'zh') {
        if (btnText.includes('Start Learning')) {
          btn.textContent = btnText.replace('Start Learning', '开始学习');
        }
      } else {
        if (btnText.includes('开始学习')) {
          btn.textContent = btnText.replace('开始学习', 'Start Learning');
        }
      }
    });

    // 翻译系统推荐信息
    const hintElements = memorySection.querySelectorAll(
      '.study-hint, .hint-text, .system-recommendation'
    );
    hintElements.forEach((hint) => {
      const hintText = hint.textContent?.trim() || '';
      if (this.currentLanguage === 'zh') {
        if (hintText.includes('System recommends learning')) {
          const match = hintText.match(/"([^"]+)"/);
          if (match) {
            const category = match[1];
            const translatedCategory = this.translateText(category);
            hint.textContent = `💡 系统推荐学习"${translatedCategory}"，每次专注一个关卡`;
          }
        }
      } else {
        if (hintText.includes('系统推荐学习')) {
          const match = hintText.match(/"([^"]+)"/);
          if (match) {
            const category = match[1];
            const translatedCategory = this.translateText(category);
            hint.textContent = `💡 System recommends learning "${translatedCategory}", focus on one level at a time`;
          }
        }
      }
    });
  }
}

// 创建全局翻译实例
export const i18n = new UnifiedI18n();

// 全局翻译函数，方便使用
export const t = (key: string, params?: TranslationParams): string => i18n.t(key, params);

// 导出到全局作用域（为了兼容现有的 JS 代码）
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  window.t = t;
}

console.log('✅ 统一翻译核心模块已加载 (TypeScript 版本)');

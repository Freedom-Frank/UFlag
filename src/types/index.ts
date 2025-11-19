/**
 * FlagStar 国旗之星 - 项目类型定义
 * Developed by UFlag team
 */

// ========== 国家相关类型 ==========

/** 国家数据接口 */
export interface Country {
  /** 国家代码（如：cn, us） */
  code: string;
  /** 中文名称 */
  nameCN: string;
  /** 英文名称 */
  nameEN: string;
  /** 所属大洲 */
  continent: string;
  /** 国旗特征标签 */
  styles?: string[];
  /** 首都 */
  capital?: string;
  /** 人口 */
  population?: string;
  /** 面积 */
  area?: string;
  /** 货币 */
  currency?: string;
  /** 语言 */
  language?: string;
  /** GDP */
  gdp?: string;
  /** 国家简介 */
  description?: string;
  /** 有趣的事实 */
  funFacts?: string[];
}

// ========== 国际化相关类型 ==========

/** 支持的语言 */
export type Language = 'zh' | 'en';

/** 翻译参数 */
export interface TranslationParams {
  [key: string]: string | number;
}

/** 翻译数据结构（嵌套对象） */
export interface TranslationData {
  [key: string]: string | TranslationData;
}

/** 完整的翻译集合 */
export interface Translations {
  zh: TranslationData;
  en: TranslationData;
}

/** 语言变化回调函数 */
export type LanguageChangeCallback = (language: Language) => void;

/** 记忆训练分类键映射 */
export interface MemoryKeyMap {
  [key: string]: {
    category: string;
    description: string;
    tips: string;
  };
}

/** 大洲键映射 */
export type ContinentKey =
  | 'asia'
  | 'europe'
  | 'africa'
  | 'northAmerica'
  | 'southAmerica'
  | 'oceania'
  | 'antarctica';

/** 特征键映射 */
export type FeatureKey =
  | 'stars'
  | 'cross'
  | 'crescent'
  | 'sun'
  | 'animals'
  | 'plants'
  | 'geometric'
  | 'horizontalStripes'
  | 'verticalStripes'
  | 'diagonalStripes'
  | 'unionJack'
  | 'panAfrican'
  | 'panArab'
  | 'nordicCross'
  | 'solid'
  | 'complexEmblem';

// ========== 记忆训练相关类型 ==========

/** 学习进度数据 */
export interface LearningProgress {
  [countryCode: string]: {
    learned: boolean;
    lastStudied: number; // 时间戳
    reviewCount: number;
  };
}

/** 记忆训练分类 */
export interface MemoryCategory {
  id: string;
  name: string;
  continent: string;
  groupNumber?: number;
  countries: Country[];
  learned: number;
  total: number;
}

// ========== 测验相关类型 ==========

/** 测验模式 */
export type QuizMode = 'flag-to-country' | 'country-to-flag' | 'mixed';

/** 测验难度 */
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

/** 测验题目 */
export interface QuizQuestion {
  country: Country;
  options: Country[];
  mode: QuizMode;
  correctAnswer: Country;
}

/** 测验结果 */
export interface QuizResult {
  score: number;
  total: number;
  correct: number;
  wrong: number;
  wrongAnswers: WrongAnswer[];
  timeSpent: number;
}

/** 错题记录 */
export interface WrongAnswer {
  question: QuizQuestion;
  userAnswer: Country;
  correctAnswer: Country;
}

// ========== 数据源相关类型 ==========

/** 数据源类型 */
export type DataSource = 'un' | 'g20' | 'euu' | 'auu' | 'china_diplomatic' | 'asiasim';

/** 数据源配置 */
export interface DataSourceConfig {
  id: DataSource;
  name: string;
  listFile: string;
  description: string;
}

// ========== 筛选和排序相关类型 ==========

/** 排序方式 */
export type SortOrder = 'name-asc' | 'name-desc' | 'continent' | 'random';

/** 筛选条件 */
export interface FilterOptions {
  continent?: string;
  feature?: string;
  search?: string;
}

// ========== 统计相关类型 ==========

/** 测验统计 */
export interface QuizStats {
  totalTests: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  bestScore: number;
  bestAccuracy: number; // 单次测验最高准确率
}

// ========== 全局窗口对象扩展 ==========

// ========== 国旗特征相关类型 ==========

/** 国旗颜色特征 */
export interface ColorFeature {
  /** 主要颜色 */
  dominant: string[];
  /** 颜色分布 */
  distribution: number[];
  /** 布局类型 */
  layout: 'horizontal' | 'vertical' | 'complex' | 'unknown';
}

/** 国旗特征数据 */
export interface FlagFeature {
  /** 颜色特征 */
  dominant: string[];
  /** 颜色分布 */
  distribution: number[];
  /** 布局类型 */
  layout: string;
  /** 国家信息 */
  country: {
    code: string;
    nameCN: string;
    nameEN: string;
  };
}

/** 特征数据文件结构 */
export interface FlagFeaturesData {
  metadata: {
    generatedAt: string;
    totalCountries: number;
    processedCount: number;
    errorCount: number;
    version: string;
  };
  features: Record<string, FlagFeature>;
}

declare global {
  interface Window {
    i18n?: any; // 将在迁移后改为具体类型
    t?: (key: string, params?: TranslationParams) => string;
    filteredCountries?: Country[];
    enhancedMemorySystem?: any;
  }
}

// ========== 导出座位排位相关类型 ==========
export type {
  SeatingRule,
  SeatingConfig,
  SeatingArrangement,
  LayoutType,
  ExportOptions,
  DiplomaticRelations,
  SeatingTemplate,
} from './seating';

/**
 * 座位排位相关类型定义
 */

import type { Country } from './index';

/** 排序规则类型 */
export type SeatingRule =
  | 'alphabetical-en' // 英文字母顺序
  | 'alphabetical-cn' // 中文拼音顺序
  | 'alphabetical-fr' // 法文字母顺序
  | 'host-first' // 主办国优先
  | 'olympic' // 奥运会模式（希腊第一，东道主最后）
  | 'diplomatic-time' // 按建交时间排序
  | 'continent-group' // 按大洲分组
  | 'organization-priority' // 按国际组织成员优先
  | 'custom'; // 自定义规则

/** 布局类型 */
export type LayoutType =
  | 'linear' // 线性排列
  | 'double-column' // 双列对称
  | 'circular' // 圆桌环形
  | 'u-shape' // U型布局
  | 'grid'; // 网格布局

/** 排序配置 */
export interface SeatingConfig {
  /** 选择的排序规则 */
  rule: SeatingRule;
  /** 主办国代码（用于host-first和olympic规则） */
  hostCountry?: string;
  /** 置顶国家代码列表（用于custom规则） */
  pinnedCountries?: string[];
  /** 建交基准国家（用于diplomatic-time规则） */
  baseCountry?: string;
  /** 优先组织成员（用于organization-priority规则） */
  priorityOrg?: string[];
}

/** 座位排位结果 */
export interface SeatingArrangement {
  /** 排序后的国家列表 */
  countries: Country[];
  /** 使用的规则 */
  rule: SeatingRule;
  /** 规则描述 */
  ruleDescription: string;
  /** 生成时间 */
  generatedAt: Date;
}

/** 导出选项 */
export interface ExportOptions {
  /** 导出格式 */
  format: 'text' | 'image' | 'pdf';
  /** 是否包含国旗图片 */
  includeFlags: boolean;
  /** 是否包含序号 */
  includeNumbers: boolean;
  /** 布局类型 */
  layout: LayoutType;
}

/** 建交时间数据（国家代码 -> 建交日期） */
export interface DiplomaticRelations {
  [countryCode: string]: string; // 格式：'YYYY.MM.DD'
}

/** 配置模板 */
export interface SeatingTemplate {
  /** 模板ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 图标 */
  icon: string;
  /** 数据源 */
  dataSource: string;
  /** 排序规则 */
  rule: SeatingRule;
  /** 主办国（可选） */
  hostCountry?: string;
  /** 推荐布局 */
  recommendedLayout: LayoutType;
}

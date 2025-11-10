# 模块独立性与隔离最佳实践

本文档记录了 FlagStar（国旗之星）项目中确保各模块相互独立、防止干扰的工程化实践。

**开发团队**: UFlag team

## 目录

- [核心原则](#核心原则)
- [模块初始化](#模块初始化)
- [模块清理](#模块清理)
- [事件监听器管理](#事件监听器管理)
- [动态元素管理](#动态元素管理)
- [CSS 隔离](#css-隔离)
- [检查清单](#检查清单)

---

## 核心原则

### 1. 单一职责原则
- 每个模块只负责自己的功能
- 不应该影响其他模块的状态或显示

### 2. 生命周期管理
- **初始化阶段**：只执行一次，防止重复绑定
- **激活阶段**：模块显示时执行
- **清理阶段**：模块隐藏时清理资源

### 3. 资源清理
- 隐藏模块时必须清理所有动态创建的元素
- 暂停不必要的动画和渲染循环
- 移除临时的事件监听器

---

## 模块初始化

### 防止重复初始化模式

每个模块都应该有初始化标志，防止事件监听器重复绑定。

```typescript
// 初始化标志
let moduleInitialized = false;

/**
 * 初始化模块
 */
export function initModule(): void {
  // 防止重复初始化
  if (moduleInitialized) {
    return;
  }

  // 绑定事件监听器
  const button = document.getElementById('some-button');
  if (button) {
    button.addEventListener('click', handleClick);
  }

  moduleInitialized = true;
  console.log('✅ Module initialized');
}
```

### 已实现的模块

- ✅ `src/modules/browse.ts:220` - 浏览模块
- ✅ `src/modules/quiz.ts:570` - 测验模块
- ✅ `src/modules/memory.ts:1523` - 记忆训练模块
- ✅ `src/modules/stats.ts:318` - 统计模块
- ✅ `src/modules/country-detail.ts:368` - 国家详情模块

---

## 模块清理

### 清理方法模式

每个可能创建动态元素的模块都应该有 `cleanup()` 方法。

```typescript
class MyModule {
  /**
   * 清理模块（切换到其他模块时调用）
   */
  cleanup(): void {
    // 1. 清理弹窗和覆盖层
    const popup = document.querySelector('.my-popup');
    if (popup) popup.remove();

    // 2. 清理消息提示
    const messages = document.querySelectorAll('.message-popup');
    messages.forEach((msg) => msg.remove());

    // 3. 隐藏动态创建的页面
    const dynamicSection = document.getElementById('dynamic-section');
    if (dynamicSection) {
      dynamicSection.style.display = 'none';
    }

    // 4. 停止动画或定时器
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
```

### 已实现的清理方法

#### Globe 模块 (`src/modules/globe.ts`)

```typescript
pause(): void {
  this.isAnimating = false;

  // 清理弹窗
  const popup = document.querySelector('.globe-flag-popup');
  const overlay = document.querySelector('.popup-overlay');
  if (popup) popup.remove();
  if (overlay) overlay.remove();

  console.log('⏸️ Globe渲染已暂停');
}

resume(): void {
  if (!this.initialized) return;
  this.isAnimating = true;
  this.animate();
  console.log('▶️ Globe渲染已恢复');
}
```

#### Memory 模块 (`src/modules/memory.ts`)

```typescript
cleanup(): void {
  // 清理消息提示
  const messages = document.querySelectorAll('.message-popup');
  messages.forEach((msg) => msg.remove());

  // 清理确认对话框
  const dialogs = document.querySelectorAll('[style*="z-index: 10000"]');
  dialogs.forEach((dialog) => {
    if (dialog.textContent?.includes('确认') || dialog.textContent?.includes('取消')) {
      dialog.remove();
    }
  });

  // 隐藏学习页面
  const studySection = document.getElementById('study-section');
  if (studySection) {
    studySection.style.display = 'none';
  }
}
```

---

## 事件监听器管理

### 规则

1. **只在初始化时绑定一次**
2. **使用初始化标志防止重复**
3. **避免在每次显示时重新绑定**

### 正确示例

```typescript
// ✅ 正确：只初始化一次
let initialized = false;

export function initModule(): void {
  if (initialized) return;

  document.getElementById('btn')?.addEventListener('click', handler);

  initialized = true;
}
```

### 错误示例

```typescript
// ❌ 错误：每次显示都绑定，导致重复
export function showModule(): void {
  // 这会导致事件监听器累积
  document.getElementById('btn')?.addEventListener('click', handler);
}
```

---

## 动态元素管理

### 创建位置规则

1. **优先在模块 section 内创建**
   ```typescript
   // ✅ 好：在模块内部创建
   const container = document.getElementById('my-module-section');
   const element = document.createElement('div');
   container?.appendChild(element);
   ```

2. **避免直接添加到 body 或 .content**
   ```typescript
   // ⚠️ 需要清理：添加到 body
   const popup = document.createElement('div');
   document.body.appendChild(popup);
   // 必须在 cleanup() 中清理！
   ```

### 常见动态元素

| 元素类型 | 创建位置 | 清理要求 |
|---------|---------|---------|
| 模块内容 | `#module-section` 内 | 自动隐藏 |
| 弹窗 | `document.body` | **必须清理** |
| 消息提示 | `document.body` | **必须清理** |
| 确认对话框 | `document.body` | **必须清理** |
| 动态页面 | `.content` 容器 | **必须隐藏** |

### 实际案例

#### 问题案例：Memory 模块的 study-section

```typescript
// 问题：添加到 .content，而不是 #memory-section
const contentDiv = document.querySelector('.content');
if (contentDiv) contentDiv.appendChild(studySection);
```

**影响**：切换到其他模块时，`study-section` 仍然可见

**解决**：在 `cleanup()` 中隐藏它

```typescript
cleanup(): void {
  const studySection = document.getElementById('study-section');
  if (studySection) {
    studySection.style.display = 'none';
  }
}
```

---

## CSS 隔离

### 容器样式

```css
/* Content Area - 添加溢出控制 */
.content {
  background: var(--pure-white);
  border-radius: var(--border-radius-large);
  min-height: 600px;
  padding: 32px;
  position: relative;
  overflow: hidden; /* 防止内容溢出 */
}

/* 确保各个模块 section 完全独立 */
#browse-section,
#memory-section,
#quiz-section,
#globe-section,
#stats-section {
  width: 100%;
  position: relative;
  min-height: 400px;
}
```

### 关键 CSS 属性

- `position: relative` - 为子元素提供定位上下文
- `overflow: hidden` - 防止内容溢出到其他模块
- `min-height` - 确保模块有足够的空间

---

## App 模块管理

### 模块切换流程

`src/app.ts` 中的模块切换逻辑：

```typescript
showSection(section: Section): void {
  // 1. 清理当前模块
  this.onSectionHide(this.currentSection);

  // 2. 隐藏所有区域
  const sections = ['browse', 'quiz', 'memory', 'globe', 'stats'];
  sections.forEach((s) => {
    safeSetDisplay(`${s}-section`, 'none');
  });

  // 3. 显示目标区域
  safeSetDisplay(`${section}-section`, 'block');

  // 4. 更新状态
  this.updateNavigationButtons(section);
  this.currentSection = section;

  // 5. 初始化新模块
  this.onSectionShow(section);
}

private onSectionHide(section: Section): void {
  switch (section) {
    case 'globe':
      globeModule.pause();
      break;
    case 'memory':
      memoryModule.cleanup();
      break;
    // 添加其他需要清理的模块
  }
}
```

---

## 检查清单

### 创建新模块时

- [ ] 添加初始化标志，防止重复初始化
- [ ] 在 `initModule()` 中绑定事件监听器
- [ ] 确保动态元素在模块 section 内创建
- [ ] 如果必须添加到 body，实现 `cleanup()` 方法
- [ ] 在 CSS 中为模块 section 添加样式规则

### 修改现有模块时

- [ ] 检查是否有动态创建的元素
- [ ] 确认这些元素是否会在模块切换时残留
- [ ] 实现或更新 `cleanup()` 方法
- [ ] 在 `app.ts` 的 `onSectionHide()` 中调用清理方法

### 测试步骤

1. [ ] 进入模块 A
2. [ ] 触发模块 A 的各种功能（弹窗、消息等）
3. [ ] 切换到模块 B
4. [ ] 检查模块 A 的内容是否完全消失
5. [ ] 切换回模块 A
6. [ ] 确认模块 A 功能正常
7. [ ] 重复多次切换，检查内存泄漏

---

## 常见问题排查

### 问题：模块切换后，上一个模块仍然显示

**可能原因**：
1. 元素被添加到 `document.body` 或 `.content`，而不是模块 section 内
2. 没有实现 `cleanup()` 方法
3. `cleanup()` 没有被调用

**解决步骤**：
1. 搜索模块代码中的 `appendChild(` 和 `document.body`
2. 为每个动态元素添加清理逻辑
3. 在 `app.ts` 的 `onSectionHide()` 中调用 `cleanup()`

### 问题：事件监听器被多次绑定

**症状**：点击按钮后，处理函数执行多次

**原因**：每次显示模块时重新绑定事件

**解决**：
```typescript
// 添加初始化标志
let initialized = false;

export function initModule(): void {
  if (initialized) return;
  // 绑定事件...
  initialized = true;
}
```

### 问题：动画或渲染循环浪费资源

**症状**：切换到其他模块后，CPU/GPU 使用率仍然很高

**原因**：渲染循环（如 Globe 模块）没有停止

**解决**：
```typescript
private isAnimating = false;

pause(): void {
  this.isAnimating = false;
}

private animate = (): void => {
  if (!this.isAnimating) return; // 检查标志
  requestAnimationFrame(this.animate);
  // 渲染逻辑...
};
```

---

## 工具和辅助函数

### 通用清理函数

```typescript
/**
 * 清理指定类名的所有元素
 */
export function cleanupByClassName(className: string): void {
  const elements = document.querySelectorAll(`.${className}`);
  elements.forEach((el) => el.remove());
}

/**
 * 清理指定 ID 的元素（如果存在）
 */
export function cleanupById(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

/**
 * 隐藏指定 ID 的元素
 */
export function hideById(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    (element as HTMLElement).style.display = 'none';
  }
}
```

---

## 版本历史

### v1.0.0 (2025-11-10)
- ✅ 实现所有模块的防重复初始化
- ✅ 为 Globe 和 Memory 模块添加清理方法
- ✅ 修复模块切换显示问题
- ✅ 添加 CSS 容器隔离

---

## 参考资料

- 相关提交：
  - `a54ff93` - 确保各模块相互独立，防止干扰
  - `60e1a8a` - 修复模块切换后上一个模块仍显示的问题
  - `9e9959b` - 修复记忆训练的学习页面出现在其他模块下方的问题

- 相关文件：
  - `src/app.ts` - 主应用协调器
  - `src/modules/*.ts` - 各个功能模块
  - `src/css/styles.css` - 样式隔离

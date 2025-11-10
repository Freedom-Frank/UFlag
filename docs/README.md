# FlagStar 开发文档

欢迎来到 FlagStar（国旗之星）项目的开发文档！

**开发团队**: UFlag team

## 📚 文档索引

### 核心文档

1. **[模块独立性与隔离最佳实践](MODULE_ISOLATION.md)** ⭐ **必读**
   - 防止重复初始化模式
   - 模块清理方法实现
   - 事件监听器管理
   - 动态元素管理规范
   - 常见问题排查

### 快速开始

如果你是第一次参与开发，请按以下顺序阅读：

1. 阅读根目录的 `CLAUDE.md` - 了解项目概览
2. 阅读 `MODULE_ISOLATION.md` - 学习模块开发规范
3. 查看现有模块代码作为参考

## 🎯 开发工作流

### 创建新模块

```typescript
// 1. 创建模块文件 src/modules/my-module.ts

// 2. 添加初始化标志
let myModuleInitialized = false;

// 3. 实现初始化函数
export function initMyModule(): void {
  if (myModuleInitialized) return;

  // 绑定事件监听器
  const button = document.getElementById('my-button');
  if (button) {
    button.addEventListener('click', handleClick);
  }

  myModuleInitialized = true;
  console.log('✅ My module initialized');
}

// 4. 如果有动态元素，实现清理方法
export class MyModule {
  cleanup(): void {
    // 清理动态创建的元素
    const popup = document.querySelector('.my-popup');
    if (popup) popup.remove();
  }
}

export const myModule = new MyModule();
```

```typescript
// 5. 在 src/app.ts 中注册

// 导入模块
import { initMyModule, myModule } from './modules/my-module';

// 在 initModules() 中初始化
private initModules(): void {
  // ...其他模块
  initMyModule();
}

// 在 onSectionHide() 中清理
private onSectionHide(section: Section): void {
  switch (section) {
    // ...其他模块
    case 'my-module':
      myModule.cleanup();
      break;
  }
}
```

### 修改现有模块

在修改现有模块前，请确认：

- [ ] 模块是否已有初始化标志？如果没有，先添加
- [ ] 是否会创建新的动态元素？如果是，更新 `cleanup()` 方法
- [ ] 事件监听器是否会重复绑定？确保只在 `init` 中绑定一次

### 测试清单

每次修改模块后，请进行以下测试：

1. [ ] 刷新页面，进入目标模块
2. [ ] 测试模块的各种功能
3. [ ] 切换到其他模块
4. [ ] **关键**：检查上一个模块的内容是否完全消失
5. [ ] 切换回目标模块，确认功能正常
6. [ ] 重复步骤 3-5 多次
7. [ ] 打开开发者工具，检查是否有控制台错误
8. [ ] 检查网络面板，确认没有重复加载资源

## 🚨 常见错误

### ❌ 错误 1：每次显示时绑定事件

```typescript
// ❌ 错误：会导致事件监听器累积
export function showModule(): void {
  const button = document.getElementById('my-button');
  button?.addEventListener('click', handleClick); // 每次显示都绑定！
}
```

**修复**：使用初始化标志

```typescript
// ✅ 正确
let initialized = false;

export function initModule(): void {
  if (initialized) return;

  const button = document.getElementById('my-button');
  button?.addEventListener('click', handleClick);

  initialized = true;
}
```

### ❌ 错误 2：动态元素未清理

```typescript
// ❌ 错误：添加到 body，但不清理
function showPopup(): void {
  const popup = document.createElement('div');
  popup.className = 'my-popup';
  document.body.appendChild(popup); // 切换模块后仍然存在！
}
```

**修复**：实现清理方法

```typescript
// ✅ 正确
class MyModule {
  showPopup(): void {
    const popup = document.createElement('div');
    popup.className = 'my-popup';
    document.body.appendChild(popup);
  }

  cleanup(): void {
    const popup = document.querySelector('.my-popup');
    if (popup) popup.remove();
  }
}
```

### ❌ 错误 3：忘记停止动画循环

```typescript
// ❌ 错误：切换模块后仍在渲染
private animate(): void {
  requestAnimationFrame(this.animate);
  // 渲染逻辑...
}
```

**修复**：添加控制标志

```typescript
// ✅ 正确
private isAnimating = false;

private animate = (): void => {
  if (!this.isAnimating) return; // 检查标志
  requestAnimationFrame(this.animate);
  // 渲染逻辑...
};

pause(): void {
  this.isAnimating = false;
}

resume(): void {
  this.isAnimating = true;
  this.animate();
}
```

## 🛠️ 调试技巧

### 检查重复初始化

在控制台中运行：

```javascript
// 检查是否有重复的事件监听器
getEventListeners(document.getElementById('my-button'))
```

### 检查残留元素

切换模块后，在控制台中运行：

```javascript
// 检查是否有模块的残留元素
document.querySelectorAll('.my-module-element')
```

### 监控内存泄漏

1. 打开 Chrome DevTools
2. 切换到 Performance 或 Memory 标签
3. 录制一段时间的模块切换操作
4. 查看内存是否持续增长

## 📋 代码审查清单

在提交 PR 前，请确认：

### 模块初始化
- [ ] 有初始化标志，防止重复初始化
- [ ] 事件监听器只绑定一次
- [ ] 初始化函数已在 `app.ts` 中调用

### 模块清理
- [ ] 动态创建的元素都被清理
- [ ] `cleanup()` 方法已在 `app.ts` 中注册
- [ ] 动画/定时器已停止

### 测试
- [ ] 模块切换测试通过
- [ ] 无控制台错误
- [ ] 无内存泄漏
- [ ] 功能正常

### 代码质量
- [ ] TypeScript 编译通过
- [ ] ESLint 检查通过
- [ ] 代码有适当的注释
- [ ] 遵循项目代码风格

## 🔗 相关资源

- [项目概览 (CLAUDE.md)](../CLAUDE.md)
- [模块独立性最佳实践 (MODULE_ISOLATION.md)](MODULE_ISOLATION.md)
- [提交记录](https://github.com/Freedom-Frank/FlagStar/commits)

## 📞 获取帮助

如果遇到问题：

1. 先查看 `MODULE_ISOLATION.md` 的"常见问题排查"章节
2. 查看类似模块的实现作为参考
3. 检查相关的提交记录和注释

---

**记住**：良好的模块隔离是保证应用稳定性的关键！

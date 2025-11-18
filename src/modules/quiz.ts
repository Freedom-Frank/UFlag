/**
 * 测验模块
 * 负责知识测验功能，包括题目生成、答案检查、结果显示等
 */

import type { Country } from '../types';
import { i18n } from '../lib/i18n-core';
import { getAllCountries } from '../lib/state';
import { getStats, saveStats } from '../lib/storage';
import { safeSetText, safeSetDisplay, formatTime } from '../lib/utils';
import { getFlagImageUrl } from '../lib/data-loader';

/**
 * 测验类型（别名）
 */
export type QuizType = 'flag-to-country' | 'country-to-flag';

/**
 * 难度级别
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * 内部题目格式（用于向后兼容）
 */
interface InternalQuestion {
  correct: Country;
  options: Country[];
}

/**
 * 内部错题格式（用于向后兼容）
 */
interface InternalWrongAnswer {
  questionIndex: number;
  questionType: QuizType;
  correctCountry: Country;
  selectedCountry: Country;
  options: Country[];
}

/**
 * 测验状态
 */
interface QuizState {
  /** 测验类型 */
  quizType: QuizType | '';
  /** 难度级别 */
  difficulty: Difficulty;
  /** 题目列表 */
  questions: InternalQuestion[];
  /** 当前题目索引 */
  currentQuestion: number;
  /** 得分 */
  score: number;
  /** 开始时间 */
  startTime: number | null;
  /** 计时器ID */
  timerInterval: number | null;
  /** 错题列表 */
  wrongAnswers: InternalWrongAnswer[];
}

/**
 * 测验模块类
 */
class QuizModule {
  private state: QuizState;

  constructor() {
    this.state = {
      quizType: '',
      difficulty: 'medium',
      questions: [],
      currentQuestion: 0,
      score: 0,
      startTime: null,
      timerInterval: null,
      wrongAnswers: [],
    };
  }

  /**
   * 设置测验类型
   */
  setQuizType(type: QuizType): void {
    this.state.quizType = type;
  }

  /**
   * 设置难度级别
   */
  setDifficulty(difficulty: Difficulty): void {
    this.state.difficulty = difficulty;
  }

  /**
   * 开始测验
   */
  startQuiz(): void {
    if (!this.state.quizType) {
      alert(i18n.t('alerts.selectTestType'));
      return;
    }

    // 确保i18n数据已加载
    // 简单的延迟，确保翻译数据已加载
    if (!i18n.t('quiz.question')) {
      console.warn('i18n data not loaded, waiting...');
      setTimeout(() => this.startQuiz(), 100);
      return;
    }

    const questionCount =
      {
        easy: 5,
        medium: 10,
        hard: 20,
      }[this.state.difficulty] || 5;

    this.state.questions = this.generateQuestions(questionCount);
    this.state.currentQuestion = 0;
    this.state.score = 0;
    this.state.startTime = Date.now();
    this.state.wrongAnswers = [];

    safeSetDisplay('quiz-start', 'none');
    safeSetDisplay('quiz-game', 'block');
    safeSetDisplay('quiz-result', 'none');

    this.startTimer();
    this.showQuestion();
  }

  /**
   * 生成题目
   */
  private generateQuestions(count: number): InternalQuestion[] {
    const questionsArray: InternalQuestion[] = [];
    const allCountries = getAllCountries();
    const availableCountries = [...allCountries];

    for (let i = 0; i < Math.min(count, availableCountries.length); i++) {
      const correctIndex = Math.floor(Math.random() * availableCountries.length);
      const correct = availableCountries[correctIndex];
      availableCountries.splice(correctIndex, 1);

      const options = [correct];
      const tempCountries = allCountries.filter((c) => c.code !== correct.code);

      // 添加3个错误选项
      for (let j = 0; j < 3 && j < tempCountries.length; j++) {
        const wrongIndex = Math.floor(Math.random() * tempCountries.length);
        options.push(tempCountries[wrongIndex]);
        tempCountries.splice(wrongIndex, 1);
      }

      // 打乱选项顺序
      options.sort(() => Math.random() - 0.5);

      questionsArray.push({
        correct: correct,
        options: options,
      });
    }

    return questionsArray;
  }

  /**
   * 显示当前题目
   */
  private showQuestion(): void {
    const q = this.state.questions[this.state.currentQuestion];
    const total = this.state.questions.length;

    // 更新进度条
    const progressFill = document.getElementById('progressFill') as HTMLElement;
    if (progressFill) {
      progressFill.style.width = `${((this.state.currentQuestion + 1) / total) * 100}%`;
    }

    // 更新题号
    const questionTemplate = i18n.t('quiz.question', {
      current: this.state.currentQuestion + 1,
      total: total,
    });
    safeSetText('questionNumber', questionTemplate);

    const questionContent = document.getElementById('questionContent');
    const optionsContainer = document.getElementById('optionsContainer');

    if (!questionContent || !optionsContainer) return;

    if (this.state.quizType === 'flag-to-country') {
      this.showFlagToCountryQuestion(q, questionContent, optionsContainer);
    } else {
      this.showCountryToFlagQuestion(q, questionContent, optionsContainer);
    }
  }

  /**
   * 显示"国旗到国家"题目
   */
  private showFlagToCountryQuestion(
    q: InternalQuestion,
    questionContent: HTMLElement,
    optionsContainer: HTMLElement
  ): void {
    // 使用国旗到国家模板
    const flagTemplate = document.getElementById('question-flag-template') as HTMLTemplateElement;
    if (flagTemplate) {
      questionContent.innerHTML = '';
      const templateContent = flagTemplate.content.cloneNode(true) as DocumentFragment;
      const img = templateContent.querySelector('.question-flag') as HTMLImageElement;
      if (img) {
        img.src = getFlagImageUrl(q.correct.code);
        img.alt = '国旗';
        img.onerror = function (this: HTMLImageElement) {
          this.src = `https://via.placeholder.com/360x240/f0f0f0/999?text=${q.correct.code.toUpperCase()}`;
        };
      }
      questionContent.appendChild(templateContent);

      // 更新问题文本
      setTimeout(() => {
        const questionText = questionContent.querySelector('.question-text');
        if (questionText) {
          questionText.textContent = i18n.t('quiz.flagQuestion');
        }
      }, 10);
    }

    // 使用选项按钮模板
    const buttonTemplate = document.getElementById('option-button-template') as HTMLTemplateElement;
    if (buttonTemplate) {
      optionsContainer.innerHTML = '';
      q.options.forEach((opt) => {
        const buttonContent = buttonTemplate.content.cloneNode(true) as DocumentFragment;
        const button = buttonContent.querySelector('.option-btn') as HTMLButtonElement;
        const textSpan = buttonContent.querySelector('.option-text');

        if (button && textSpan) {
          button.onclick = () => this.checkAnswer(opt.code, q.correct.code);
          button.dataset.code = opt.code;
          textSpan.textContent = i18n.getCountryName(opt);
          optionsContainer.appendChild(buttonContent);
        }
      });
    }
  }

  /**
   * 显示"国家到国旗"题目
   */
  private showCountryToFlagQuestion(
    q: InternalQuestion,
    questionContent: HTMLElement,
    optionsContainer: HTMLElement
  ): void {
    // 使用国家到国旗模板
    const countryTemplate = document.getElementById(
      'question-country-template'
    ) as HTMLTemplateElement;
    if (countryTemplate) {
      questionContent.innerHTML = '';
      const templateContent = countryTemplate.content.cloneNode(true) as DocumentFragment;
      const countryName = templateContent.querySelector('.country-name');
      if (countryName) {
        countryName.textContent = i18n.getCountryName(q.correct);
      }

      // 更新问题文本
      const questionText = templateContent.querySelector('.question-text');
      if (questionText) {
        const template = i18n.t('quiz.countryQuestion');
        questionText.textContent = template.replace('{country}', i18n.getCountryName(q.correct));
      }
      questionContent.appendChild(templateContent);
    }

    // 使用国旗选项模板
    const flagTemplate = document.getElementById('option-flag-template') as HTMLTemplateElement;
    if (flagTemplate) {
      optionsContainer.innerHTML = '';
      q.options.forEach((opt) => {
        const templateContent = flagTemplate.content.cloneNode(true) as DocumentFragment;
        const button = templateContent.querySelector('.option-btn') as HTMLButtonElement;
        const img = templateContent.querySelector('.option-flag') as HTMLImageElement;

        if (button && img) {
          button.onclick = () => this.checkAnswer(opt.code, q.correct.code);
          button.dataset.code = opt.code;
          img.src = getFlagImageUrl(opt.code);
          img.alt = opt.nameCN;
          img.onerror = function (this: HTMLImageElement) {
            this.src = `https://via.placeholder.com/200x120/f0f0f0/999?text=${opt.code.toUpperCase()}`;
          };
          optionsContainer.appendChild(templateContent);
        }
      });
    }
  }

  /**
   * 检查答案
   */
  private checkAnswer(selected: string, correct: string): void {
    const buttons = document.querySelectorAll('.option-btn') as NodeListOf<HTMLButtonElement>;

    buttons.forEach((btn) => {
      btn.disabled = true;
      const btnCode = btn.dataset.code;

      if (btnCode === correct) {
        btn.classList.add('correct');
      } else if (btnCode === selected) {
        btn.classList.add('wrong');
      }
    });

    if (selected === correct) {
      this.state.score++;
    } else {
      const currentQ = this.state.questions[this.state.currentQuestion];
      const selectedCountry = currentQ.options.find((opt) => opt.code === selected);

      this.state.wrongAnswers.push({
        questionIndex: this.state.currentQuestion + 1,
        questionType: this.state.quizType as QuizType,
        correctCountry: currentQ.correct,
        selectedCountry: selectedCountry || currentQ.correct,
        options: currentQ.options,
      });
    }

    setTimeout(() => {
      this.state.currentQuestion++;
      if (this.state.currentQuestion < this.state.questions.length) {
        this.showQuestion();
      } else {
        this.endQuiz();
      }
    }, 1500);
  }

  /**
   * 结束测验
   */
  private endQuiz(): void {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }

    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - (this.state.startTime || endTime)) / 1000);

    // 更新统计数据
    const stats = getStats();
    stats.totalTests++;
    stats.totalQuestions += this.state.questions.length;
    stats.correctAnswers += this.state.score;
    if (this.state.score > stats.bestScore) {
      stats.bestScore = this.state.score;
    }
    saveStats(stats);

    safeSetDisplay('quiz-game', 'none');
    safeSetDisplay('quiz-result', 'block');

    const accuracy = Math.round((this.state.score / this.state.questions.length) * 100);

    safeSetText('scoreDisplay', `${this.state.score}/${this.state.questions.length}`);
    safeSetText('correctCount', this.state.score.toString());
    safeSetText('wrongCount', (this.state.questions.length - this.state.score).toString());
    safeSetText('accuracyRate', `${accuracy}%`);
    safeSetText('timeSpent', formatTime(timeSpent));

    // 根据准确率显示不同的消息
    let message = '';
    if (accuracy === 100) {
      message = i18n.t('quiz.messages.perfect') || '完美！你是真正的国旗专家！🏆';
    } else if (accuracy >= 80) {
      message = i18n.t('quiz.messages.excellent') || '优秀！你的国旗知识非常丰富！⭐';
    } else if (accuracy >= 60) {
      message = i18n.t('quiz.messages.good') || '不错！继续努力，你会更棒的！💪';
    } else if (accuracy >= 40) {
      message = i18n.t('quiz.messages.keepTrying') || '加油！多练习就能进步！📚';
    } else {
      message = i18n.t('quiz.messages.keepLearning') || '没关系，学习需要时间，继续努力！🌟';
    }

    safeSetText('resultMessage', message);

    this.displayWrongAnswers();
  }

  /**
   * 开始计时器
   */
  private startTimer(): void {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;

    this.state.timerInterval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - (this.state.startTime || Date.now())) / 1000);
      timerEl.textContent = `⏱️ ${formatTime(elapsed)}`;
    }, 1000);
  }

  /**
   * 显示错题详情
   */
  private displayWrongAnswers(): void {
    const wrongSection = document.getElementById('wrong-answers-section');
    const container = document.getElementById('wrong-answers-container');

    if (!wrongSection || !container) return;

    if (this.state.wrongAnswers.length === 0) {
      wrongSection.style.display = 'none';
      return;
    }

    wrongSection.style.display = 'block';
    container.innerHTML = '';

    this.state.wrongAnswers.forEach((wrong) => {
      if (wrong.questionType === 'flag-to-country') {
        this.displayFlagToCountryWrongAnswer(wrong, container);
      } else {
        this.displayCountryToFlagWrongAnswer(wrong, container);
      }
    });
  }

  /**
   * 显示"国旗到国家"错题
   */
  private displayFlagToCountryWrongAnswer(
    wrong: InternalWrongAnswer,
    container: HTMLElement
  ): void {
    const flagTemplate = document.getElementById(
      'wrong-answer-flag-template'
    ) as HTMLTemplateElement;
    if (!flagTemplate) return;

    const templateContent = flagTemplate.content.cloneNode(true) as DocumentFragment;

    // 设置题号
    const questionNumber = templateContent.querySelector('.wrong-question-number');
    const questionTemplate = i18n.t('quiz.questionNumber', { index: wrong.questionIndex });
    if (questionNumber) {
      questionNumber.textContent = questionTemplate.replace(
        '{index}',
        wrong.questionIndex.toString()
      );
    }

    // 设置国旗图片
    const flagImg = templateContent.querySelector('.wrong-flag') as HTMLImageElement;
    if (flagImg) {
      flagImg.src = getFlagImageUrl(wrong.correctCountry.code);
      flagImg.alt = '国旗';
      flagImg.onerror = function (this: HTMLImageElement) {
        this.src = `https://via.placeholder.com/200x120/f0f0f0/999?text=${wrong.correctCountry.code.toUpperCase()}`;
      };
    }

    // 设置正确答案
    const correctAnswer = templateContent.querySelector('.correct-answer-text');
    if (correctAnswer) {
      correctAnswer.textContent = i18n.getCountryName(wrong.correctCountry);
    }

    // 设置用户答案
    const yourAnswer = templateContent.querySelector('.your-answer-text');
    if (yourAnswer && wrong.selectedCountry) {
      yourAnswer.textContent = i18n.getCountryName(wrong.selectedCountry);
    }

    container.appendChild(templateContent);
  }

  /**
   * 显示"国家到国旗"错题
   */
  private displayCountryToFlagWrongAnswer(
    wrong: InternalWrongAnswer,
    container: HTMLElement
  ): void {
    const countryTemplate = document.getElementById(
      'wrong-answer-country-template'
    ) as HTMLTemplateElement;
    if (!countryTemplate) return;

    const templateContent = countryTemplate.content.cloneNode(true) as DocumentFragment;

    // 设置题号和国家名称
    const questionNumber = templateContent.querySelector('.wrong-question-number');
    if (questionNumber) {
      questionNumber.textContent = i18n.t('quiz.questionNumber', { index: wrong.questionIndex });
    }

    const countryName = templateContent.querySelector('.wrong-country-name');
    if (countryName) {
      countryName.textContent = i18n.getCountryName(wrong.correctCountry);
    }

    // 设置正确国旗
    const correctFlag = templateContent.querySelector('.correct-flag-img') as HTMLImageElement;
    if (correctFlag) {
      correctFlag.src = getFlagImageUrl(wrong.correctCountry.code);
      correctFlag.alt = i18n.getCountryName(wrong.correctCountry);
    }

    // 设置用户选择的国旗
    const yourFlag = templateContent.querySelector('.your-flag-img') as HTMLImageElement;
    if (yourFlag && wrong.selectedCountry) {
      yourFlag.src = getFlagImageUrl(wrong.selectedCountry.code);
      yourFlag.alt = i18n.getCountryName(wrong.selectedCountry);
    }

    container.appendChild(templateContent);
  }

  /**
   * 返回测验选择页面
   */
  backToQuiz(): void {
    this.resetQuizState();
    safeSetDisplay('quiz-start', 'block');
    safeSetDisplay('quiz-game', 'none');
    safeSetDisplay('quiz-result', 'none');
  }

  /**
   * 重置测验状态
   */
  private resetQuizState(): void {
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }
    this.state = {
      quizType: '',
      difficulty: 'medium',
      questions: [],
      currentQuestion: 0,
      score: 0,
      startTime: null,
      timerInterval: null,
      wrongAnswers: [],
    };
  }

  /**
   * 获取当前状态
   */
  getState(): Readonly<QuizState> {
    return { ...this.state };
  }
}

// 创建单例实例
export const quizModule = new QuizModule();

// 初始化标志
let quizModuleInitialized = false;

/**
 * 初始化测验模块的事件监听
 */
export function initQuizModule(): void {
  // 防止重复初始化
  if (quizModuleInitialized) {
    return;
  }

  // 测验类型选择
  const quizTypeCards = document.querySelectorAll('.quiz-type-card[data-type]');
  const startQuizBtn = document.getElementById('startQuizBtn');

  quizTypeCards.forEach((card) => {
    card.addEventListener('click', () => {
      const type = (card as HTMLElement).dataset.type as QuizType;
      quizModule.setQuizType(type);

      // 更新卡片选中状态
      quizTypeCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');

      // 显示开始测验按钮
      if (startQuizBtn) {
        (startQuizBtn as HTMLElement).style.display = 'inline-block';
      }
    });
  });

  // 难度选择
  const difficultyButtons = document.querySelectorAll('[data-difficulty]');
  difficultyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const difficulty = (btn as HTMLElement).dataset.difficulty as Difficulty;
      quizModule.setDifficulty(difficulty);

      // 更新按钮状态
      difficultyButtons.forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // 开始测验按钮
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', () => {
      quizModule.startQuiz();
    });
  }

  // 测验进行中的返回按钮
  const backToQuizBtn = document.getElementById('backToQuizBtn');
  if (backToQuizBtn) {
    backToQuizBtn.addEventListener('click', () => {
      quizModule.backToQuiz();
    });
  }

  // 结果页面的"再测一次"按钮
  const retryBtn = document.getElementById('retryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      quizModule.startQuiz();
    });
  }

  // 结果页面的"返回"按钮
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      quizModule.backToQuiz();
    });
  }

  quizModuleInitialized = true;
  console.log('✅ Quiz module initialized');
}

// 导出到全局（向后兼容）
if (typeof window !== 'undefined') {
  (window as any).quizModule = quizModule;
  (window as any).checkAnswer = () => {
    // 向后兼容的包装器
    console.warn('Using deprecated global checkAnswer function');
  };
}

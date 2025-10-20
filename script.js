// 全局变量
let allCountries = [];
let filteredCountries = [];
let currentSection = 'browse';
let selectedContinent = 'all';
let selectedStyles = new Set();
let sortMethod = 'name';
let searchTerm = '';
let selectedDataSource = 'all';

// ===== 引入统一翻译核心模块 =====
// 注意：UnifiedTranslationManager 和 ModernI18n 类已移至 i18n-core.js
// 现在使用统一的 i18n 实例

// 重新渲染浏览模块的国家卡片
function rerenderBrowseCards() {
    const flagsContainer = document.getElementById('flags-container');
    if (!flagsContainer) {
        console.warn('rerenderBrowseCards: flags-container not found');
        return;
    }

    // 紧急修复：简单检查，不要递归调用
    if (typeof filteredCountries === 'undefined' || filteredCountries.length === 0) {
        console.warn('rerenderBrowseCards: filteredCountries is empty or undefined, skipping render');
        return;
    }

    const flagCards = flagsContainer.querySelectorAll('.flag-card');
    console.log(`rerenderBrowseCards: found ${flagCards.length} cards, ${filteredCountries.length} countries`);

    flagCards.forEach((card, index) => {
        if (index < filteredCountries.length) {  // 修复：使用filteredCountries而不是allCountries
            const country = filteredCountries[index];
            const nameCN = card.querySelector('.flag-name-cn'); // 主要名称
            const nameEN = card.querySelector('.flag-name-en'); // 次要名称
            const isEnglishMode = i18n.currentLanguage === 'en';

            if (isEnglishMode) {
                // 英文模式：主要显示英文，次要显示中文
                if (nameCN) nameCN.textContent = country.nameEN;
                if (nameEN) nameEN.textContent = country.nameCN;
            } else {
                // 中文模式：主要显示中文，次要显示英文
                if (nameCN) nameCN.textContent = country.nameCN;
                if (nameEN) nameEN.textContent = country.nameEN;
            }

            // 更新大洲标签
            const continentTag = card.querySelector('.continent-tag');
            if (continentTag) {
                continentTag.textContent = i18n.getContinentName(country.continent);
            }

            // 更新特征标签
            const styleTag = card.querySelector('.style-tag');
            if (styleTag && country.styles && country.styles.length > 0) {
                styleTag.textContent = i18n.getFeatureName(country.styles[0]);
            }
        }
    });
}

// ===== 兼容性函数 =====
// 注意：测试函数已移至 i18n-core.js 中作为统一翻译系统的一部分

// ===== 全局翻译系统 =====
// 注意：ModernI18n 类已移至 i18n-core.js
// 现在使用统一的 i18n 实例，该实例在 i18n-core.js 中定义并导出到全局作用域

// 兼容性变量（逐步移除）
let currentLang = 'zh';
let i18nData = {};

// 数据来源配置
const dataSources = {
    all: { 
        name: '全部国家和国际组织', 
    countries: [
        "al", "dz", "af", "ar", "ae", "sy", "om", "az", "eg", "et", 
        "ie", "ee", "ad", "ao", "ag", "at", "au", "bb", "pg", "bs", 
        "pk", "py", "bh", "pa", "br", "by", "bg", "mk", "bj", "be", 
        "pe", "is", "pl", "ba", "bz", "bw", "bt", "bf", "bi", "kp", 
        "gq", "gb", "kr", "dk", "de", "tl", "tg", "do", "dm", "bo", 
        "ru", "ec", "er", "fr", "ph", "fj", "fi", "cv", "gm", "cg", 
        "cd", "co", "cr", "gd", "ge", "cu", "gy", "kz", "ht", "nl", 
        "me", "hn", "ki", "dj", "kg", "gn", "gw", "ca", "gh", "ga", 
        "kh", "cz", "zw", "cm", "qa", "km", "ci", "kw", "hr", "ke", 
        "lv", "ls", "la", "lb", "lt", "lr", "ly", "li", "lu", "rw", 
        "ro", "mg", "mv", "mt", "mw", "my", "ml", "mh", "mu", "mr", 
        "us", "mn", "bd", "fm", "mm", "md", "ma", "mc", "mz", "mx", 
        "na", "za", "ss", "nr", "np", "ni", "ne", "ng", "no", "pw", 
        "pt", "jp", "se", "ch", "sv", "ws", "rs", "sl", "sn", "cy", 
        "sc", "sa", "st", "kn", "lc", "sm", "vc", "lk", "sk", "si", 
        "sz", "sd", "sr", "sb", "so", "tj", "th", "tz", "to", "tt", 
        "tn", "tv", "tr", "tm", "vu", "gt", "ve", "bn", "ug", "ua", 
        "uy", "uz", "es", "gr", "sg", "nz", "hu", "jm", "am", "ye", 
        "iq", "ir", "il", "it", "in", "id", "jo", "vn", "zm", "td", 
        "cl", "cf", "cn", //un_countries
        "ck", "nu", "ps", //Have diplomatic relations with china but not UN members
        "euu", "auu" //oganiations
        ]
    },
    un: { 
    name: '联合国成员国', 
    countries: [
        "al", "dz", "af", "ar", "ae", "sy", "om", "az", "eg", "et", 
        "ie", "ee", "ad", "ao", "ag", "at", "au", "bb", "pg", "bs", 
        "pk", "py", "bh", "pa", "br", "by", "bg", "mk", "bj", "be", 
        "pe", "is", "pl", "ba", "bz", "bw", "bt", "bf", "bi", "kp", 
        "gq", "gb", "kr", "dk", "de", "tl", "tg", "do", "dm", "bo", 
        "ru", "ec", "er", "fr", "ph", "fj", "fi", "cv", "gm", "cg", 
        "cd", "co", "cr", "gd", "ge", "cu", "gy", "kz", "ht", "nl", 
        "me", "hn", "ki", "dj", "kg", "gn", "gw", "ca", "gh", "ga", 
        "kh", "cz", "zw", "cm", "qa", "km", "ci", "kw", "hr", "ke", 
        "lv", "ls", "la", "lb", "lt", "lr", "ly", "li", "lu", "rw", 
        "ro", "mg", "mv", "mt", "mw", "my", "ml", "mh", "mu", "mr", 
        "us", "mn", "bd", "fm", "mm", "md", "ma", "mc", "mz", "mx", 
        "na", "za", "ss", "nr", "np", "ni", "ne", "ng", "no", "pw", 
        "pt", "jp", "se", "ch", "sv", "ws", "rs", "sl", "sn", "cy", 
        "sc", "sa", "st", "kn", "lc", "sm", "vc", "lk", "sk", "si", 
        "sz", "sd", "sr", "sb", "so", "tj", "th", "tz", "to", "tt", 
        "tn", "tv", "tr", "tm", "vu", "gt", "ve", "bn", "ug", "ua", 
        "uy", "uz", "es", "gr", "sg", "nz", "hu", "jm", "am", "ye", 
        "iq", "ir", "il", "it", "in", "id", "jo", "vn", "zm", "td", 
        "cl", "cf", "cn"
        ]
    },
    g20: {
        name: 'G20',
        countries: [
            "cn", // 1. 中国
            "ar", // 2. 阿根廷
            "au", // 3. 澳大利亚
            "br", // 4. 巴西
            "ca", // 5. 加拿大
            "fr", // 6. 法国
            "de", // 7. 德国
            "in", // 8. 印度
            "id", // 9. 印度尼西亚
            "it", // 10. 意大利
            "jp", // 11. 日本
            "kr", // 12. 韩国
            "mx", // 13. 墨西哥
            "ru", // 14. 俄罗斯
            "sa", // 15. 沙特阿拉伯
            "za", // 16. 南非
            "tr", // 17. 土耳其
            "gb", // 18. 英国
            "us", // 19. 美国
            // 注：欧盟和非洲联盟作为区域组织不使用国家代码
            "euu", // 20. 欧盟（European Union）
            "auu"  // 21. 非洲联盟（African Union）
        ]
    },
    euu: {
        name: '欧洲联盟',
        countries: [
            "at", // 奥地利
            "be", // 比利时
            "bg", // 保加利亚
            "cy", // 塞浦路斯
            "cz", // 捷克
            "hr", // 克罗地亚
            "dk", // 丹麦
            "ee", // 爱沙尼亚
            "fi", // 芬兰
            "fr", // 法国
            "de", // 德国
            "gr", // 希腊
            "hu", // 匈牙利
            "ie", // 爱尔兰
            "it", // 意大利
            "lv", // 拉脱维亚
            "lt", // 立陶宛
            "lu", // 卢森堡
            "mt", // 马耳他
            "nl", // 荷兰
            "pl", // 波兰
            "pt", // 葡萄牙
            "ro", // 罗马尼亚
            "sk", // 斯洛伐克
            "si", // 斯洛文尼亚
            "es", // 西班牙
            "se"  // 瑞典
        ]
    },
    auu: {
        name: '非洲联盟',
        countries: [
            "dz", // 1. 阿尔及利亚
            "eg", // 2. 埃及
            "et", // 3. 埃塞俄比亚
            "ao", // 4. 安哥拉
            "bj", // 5. 贝宁
            "bw", // 6. 博茨瓦纳
            "bf", // 7. 布基纳法索
            "bi", // 8. 布隆迪
            "gq", // 9. 赤道几内亚
            "tg", // 10. 多哥
            "er", // 11. 厄立特里亚
            "cv", // 12. 佛得角
            "gm", // 13. 冈比亚
            "cg", // 14. 刚果（布）
            "cd", // 15. 刚果（金）
            "dj", // 16. 吉布提
            "gn", // 17. 几内亚
            "gw", // 18. 几内亚比绍
            "gh", // 19. 加纳
            "ga", // 20. 加蓬
            "zw", // 21. 津巴布韦
            "cm", // 22. 喀麦隆
            "km", // 23. 科摩罗
            "ci", // 24. 科特迪瓦
            "ke", // 25. 肯尼亚
            "ls", // 26. 莱索托
            "lr", // 27. 利比里亚
            "ly", // 28. 利比亚
            "rw", // 29. 卢旺达
            "mg", // 30. 马达加斯加
            "mw", // 31. 马拉维
            "ml", // 32. 马里
            "mu", // 33. 毛里求斯
            "mr", // 34. 毛里塔尼亚
            "mz", // 35. 莫桑比克
            "na", // 36. 纳米比亚
            "za", // 37. 南非
            "ne", // 38. 尼日尔
            "ng", // 39. 尼日利亚
            "sl", // 40. 塞拉利昂
            "sn", // 41. 塞内加尔
            "sc", // 42. 塞舌尔
            "st", // 43. 圣多美和普林西比
            "sz", // 44. 斯威士兰
            "sd", // 45. 苏丹
            "so", // 46. 索马里
            "tz", // 47. 坦桑尼亚
            "tn", // 48. 突尼斯
            "ug", // 49. 乌干达
            "zm", // 50. 赞比亚
            "td", // 51. 乍得
            "cf", // 52. 中非
            "eh", // 53. 阿拉伯撒哈拉民主共和国（西撒哈拉）非盟中唯一不是联合国会员国的国家
            "ss", // 54. 南苏丹
            "ma"  // 55. 摩洛哥
        ]
    },
    china_diplomatic: {
        name: '与中华人民共和国建交国家',
        countries: [
            // 亚洲 (45个国家)
            "af", // 阿富汗
            "am", // 亚美尼亚
            "az", // 阿塞拜疆
            "bh", // 巴林
            "bd", // 孟加拉国
            "bn", // 文莱
            "kh", // 柬埔寨
            "kp", // 朝鲜
            "tl", // 东帝汶
            "ge", // 格鲁吉亚
            "in", // 印度
            "id", // 印度尼西亚
            "ir", // 伊朗
            "iq", // 伊拉克
            "il", // 以色列
            "jp", // 日本
            "jo", // 约旦
            "kz", // 哈萨克斯坦
            "kw", // 科威特
            "kg", // 吉尔吉斯斯坦
            "la", // 老挝
            "lb", // 黎巴嫩
            "my", // 马来西亚
            "mv", // 马尔代夫
            "mn", // 蒙古
            "mm", // 缅甸
            "np", // 尼泊尔
            "om", // 阿曼
            "pk", // 巴基斯坦
            "ps", // 巴勒斯坦
            "ph", // 菲律宾
            "qa", // 卡塔尔
            "kr", // 韩国
            "sa", // 沙特阿拉伯
            "sg", // 新加坡
            "lk", // 斯里兰卡
            "sy", // 叙利亚
            "tj", // 塔吉克斯坦
            "th", // 泰国
            "tr", // 土耳其
            "tm", // 土库曼斯坦
            "ae", // 阿拉伯联合酋长国
            "uz", // 乌兹别克斯坦
            "vn", // 越南
            "ye", // 也门
            
            // 非洲 (53个国家)
            "dz", // 阿尔及利亚
            "ao", // 安哥拉
            "bj", // 贝宁
            "bw", // 博茨瓦纳
            "bf", // 布基纳法索
            "bi", // 布隆迪
            "cm", // 喀麦隆
            "cv", // 佛得角
            "cf", // 中非
            "td", // 乍得
            "km", // 科摩罗
            "cd", // 刚果（金）
            "cg", // 刚果（布）
            "ci", // 科特迪瓦
            "dj", // 吉布提
            "eg", // 埃及
            "gq", // 赤道几内亚
            "er", // 厄立特里亚
            "et", // 埃塞俄比亚
            "ga", // 加蓬
            "gm", // 冈比亚
            "gh", // 加纳
            "gn", // 几内亚
            "gw", // 几内亚比绍
            "ke", // 肯尼亚
            "ls", // 莱索托
            "lr", // 利比里亚
            "ly", // 利比亚
            "mg", // 马达加斯加
            "mw", // 马拉维
            "ml", // 马里
            "mr", // 毛里塔尼亚
            "mu", // 毛里求斯
            "ma", // 摩洛哥
            "mz", // 莫桑比克
            "na", // 纳米比亚
            "za", // 南非
            "ne", // 尼日尔
            "ng", // 尼日利亚
            "rw", // 卢旺达
            "st", // 圣多美和普林西比
            "sn", // 塞内加尔
            "sc", // 塞舌尔
            "sl", // 塞拉利昂
            "so", // 索马里
            "ss", // 南苏丹
            "sd", // 苏丹
            "tz", // 坦桑尼亚
            "tg", // 多哥
            "tn", // 突尼斯
            "ug", // 乌干达
            "zm", // 赞比亚
            "zw", // 津巴布韦
            
            // 欧洲 (45个国家)
            "al", // 阿尔巴尼亚
            "ad", // 安道尔
            "at", // 奥地利
            "by", // 白俄罗斯
            "be", // 比利时
            "ba", // 波斯尼亚和黑塞哥维那
            "bg", // 保加利亚
            "hr", // 克罗地亚
            "cy", // 塞浦路斯
            "cz", // 捷克
            "dk", // 丹麦
            "ee", // 爱沙尼亚
            "fi", // 芬兰
            "fr", // 法国
            "de", // 德国
            "gr", // 希腊
            "hu", // 匈牙利
            "is", // 冰岛
            "ie", // 爱尔兰
            "it", // 意大利
            "lv", // 拉脱维亚
            "li", // 列支敦士登
            "lt", // 立陶宛
            "lu", // 卢森堡
            "mt", // 马耳他
            "md", // 摩尔多瓦
            "mc", // 摩纳哥
            "me", // 黑山
            "nl", // 荷兰
            "mk", // 北马其顿
            "no", // 挪威
            "pl", // 波兰
            "pt", // 葡萄牙
            "ro", // 罗马尼亚
            "ru", // 俄罗斯
            "sm", // 圣马力诺
            "rs", // 塞尔维亚
            "sk", // 斯洛伐克
            "si", // 斯洛文尼亚
            "es", // 西班牙
            "se", // 瑞典
            "ch", // 瑞士
            "ua", // 乌克兰
            "gb", // 英国
            
            // 美洲 (24个国家)
            "ag", // 安提瓜和巴布达
            "ar", // 阿根廷
            "bs", // 巴哈马
            "bb", // 巴巴多斯
            "bo", // 玻利维亚
            "br", // 巴西
            "ca", // 加拿大
            "cl", // 智利
            "co", // 哥伦比亚
            "cr", // 哥斯达黎加
            "cu", // 古巴
            "dm", // 多米尼克
            "do", // 多米尼加
            "ec", // 厄瓜多尔
            "sv", // 萨尔瓦多
            "gd", // 格林纳达
            "gy", // 圭亚那
            "hn", // 洪都拉斯
            "jm", // 牙买加
            "mx", // 墨西哥
            "ni", // 尼加拉瓜
            "pa", // 巴拿马
            "pe", // 秘鲁
            "sr", // 苏里南
            "tt", // 特立尼达和多巴哥
            "us", // 美国
            "uy", // 乌拉圭
            "ve", // 委内瑞拉
            
            // 大洋洲 (13个国家)
            "au", // 澳大利亚
            "ck", // 库克群岛
            "fj", // 斐济
            "ki", // 基里巴斯
            "fm", // 密克罗尼西亚
            "nr", // 瑙鲁
            "nz", // 新西兰
            "nu", // 纽埃
            "pg", // 巴布亚新几内亚
            "ws", // 萨摩亚
            "sb", // 所罗门群岛
            "to", // 汤加
            "vu"  // 瓦努阿图
        ]
    },
    asiasim: {
        name: '亚洲仿真联盟',
        countries: ["cn","jp","kr","sg","my"]
    }
};

// 测试相关变量
let quizType = '';
let difficulty = 'easy';
let questions = [];
let currentQuestion = 0;
let score = 0;
let startTime = null;
let timerInterval = null;
let wrongAnswers = [];

// 统计数据
let stats = {
    totalTests: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    bestScore: 0
};

// 设计风格列表
const stylesList = [
    '星星', '十字', '月牙', '太阳', '动物', '植物', '几何图形',
    '水平条纹', '垂直条纹', '对角条纹', '联合杰克', '泛非色彩',
    '泛阿拉伯色彩', '北欧十字', '纯色', '复杂徽章'
];

// 初始化应用
async function init() {
    console.log('📦 加载统计数据...');
    loadStats();

    console.log('🌍 加载国家数据...');
    await loadCountriesData();
    console.log(`✅ 已加载 ${allCountries.length} 个国家`);

    console.log('🌐 加载翻译数据...');
    await loadTranslations();

    console.log('🧠 初始化增强记忆系统...');
    if (typeof EnhancedMemorySystem !== 'undefined') {
        EnhancedMemorySystem.init();
    } else {
        console.warn('⚠️ EnhancedMemorySystem 未定义');
    }

    console.log('🔗 设置事件监听器...');
    setupEventListeners();

    console.log('📂 显示默认区域（浏览模式）...');
    showSection('browse');

    console.log('🏳️ 显示国旗卡片...');
    displayFlags();

    console.log('🎉 初始化完成');

    // 紧急修复：强制清空所有可能的记忆训练内容泄漏
    setTimeout(() => {
        // 清空记忆训练容器
        const simpleMemoryContainer = document.getElementById('simpleMemoryContainer');
        if (simpleMemoryContainer && simpleMemoryContainer.children.length > 0) {
            console.warn('🚨 检测到记忆训练容器有内容，正在清空...');
            simpleMemoryContainer.innerHTML = '';
        }

        // 移除任何可能错误添加到body的对话框或内容
        const possibleDialogs = document.body.querySelectorAll('.message-popup, [style*="position"], [style*="fixed"]');
        possibleDialogs.forEach(el => {
            const text = el.textContent || '';
            if (text.includes('清除') || text.includes('clear') || text.includes('progress') || text.includes('学习记录') || text.includes('learning records')) {
                console.warn('🚨 移除错误的对话框:', el, 'Text:', text);
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }
        });

        // 强制移除任何全屏覆盖元素
        const fixedElements = document.body.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
        fixedElements.forEach(el => {
            if (el.style.zIndex && parseInt(el.style.zIndex) > 1000) {
                console.warn('🚨 移除高z-index元素:', el);
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }
        });

        // 调试：检查页面状态
        console.group('🔍 页面状态调试');

        const browseSection = document.getElementById('browse-section');
        const memorySection = document.getElementById('memory-section');

        console.log('Browse section:', {
            exists: !!browseSection,
            display: browseSection ? window.getComputedStyle(browseSection).display : 'N/A',
            visible: browseSection ? browseSection.offsetParent !== null : false
        });

        console.log('Memory section:', {
            exists: !!memorySection,
            display: memorySection ? window.getComputedStyle(memorySection).display : 'N/A',
            visible: memorySection ? memorySection.offsetParent !== null : false
        });

        console.log('Simple memory container:', {
            exists: !!simpleMemoryContainer,
            innerHTML: simpleMemoryContainer ? simpleMemoryContainer.innerHTML : 'N/A',
            children: simpleMemoryContainer ? simpleMemoryContainer.children.length : 0
        });

        console.log('Current section:', currentSection);

        console.groupEnd();
    }, 1000);
}

// 加载翻译数据
async function loadTranslations() {
    try {
        const response = await fetch('i18n.json');
        if (response.ok) {
            const data = await response.json();
            i18n.setTranslations(data);
            console.log('✅ 翻译数据加载成功');

            // 设置用户首选语言
            const preferredLanguage = localStorage.getItem('preferredLanguage') || 'zh';
            i18n.setLanguage(preferredLanguage);

            // 更新语言按钮状态
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-lang') === preferredLanguage) {
                    btn.classList.add('active');
                }
            });

            console.log(`✅ 语言设置为: ${preferredLanguage}`);
        } else {
            throw new Error('无法加载i18n.json');
        }
    } catch (error) {
        console.warn('翻译数据加载失败:', error.message);
        // 使用默认语言继续运行
        i18n.setLanguage('zh');
    }

    // 翻译数据加载完成后，触发记忆系统渲染
    setTimeout(() => {
        if (window.EnhancedMemorySystem && window.EnhancedMemorySystem.renderCategories) {
            console.log('🔄 翻译数据加载完成，重新渲染记忆训练分类...');
            window.EnhancedMemorySystem.renderCategories();
        }
    }, 200);
}

// 加载统计数据
function loadStats() {
    const saved = localStorage.getItem('flagQuizStats');
    if (saved) {
        try {
            stats = JSON.parse(saved);
        } catch (error) {
            console.warn('统计数据解析失败，使用默认值');
        }
    }
}

// 保存统计数据
function saveStats() {
    try {
        localStorage.setItem('flagQuizStats', JSON.stringify(stats));
    } catch (error) {
        console.warn('统计数据保存失败');
    }
}

// 加载国家数据
async function loadCountriesData() {
    try {
        const response = await fetch('countries_un.json');
        if (response.ok) {
            const data = await response.json();
            allCountries = data.countries;
            console.log(`成功加载 ${allCountries.length} 个国家数据`);
        } else {
            throw new Error('无法加载countries_un.json');
        }
    } catch (error) {
        console.log('使用示例数据:', error.message);
        allCountries = generateSampleData();
    }
    filteredCountries = [...allCountries];
    updateStats();
}

// 生成示例数据
function generateSampleData() {
    return [
        { code: "cn", nameCN: "中国", nameEN: "China", continent: "亚洲", styles: ["星星", "纯色"] },
        { code: "us", nameCN: "美国", nameEN: "United States", continent: "北美洲", styles: ["星星", "水平条纹"] },
        { code: "gb", nameCN: "英国", nameEN: "United Kingdom", continent: "欧洲", styles: ["联合杰克", "十字"] },
        { code: "jp", nameCN: "日本", nameEN: "Japan", continent: "亚洲", styles: ["太阳", "纯色"] },
        { code: "de", nameCN: "德国", nameEN: "Germany", continent: "欧洲", styles: ["水平条纹", "纯色"] },
        { code: "fr", nameCN: "法国", nameEN: "France", continent: "欧洲", styles: ["垂直条纹", "纯色"] },
        { code: "br", nameCN: "巴西", nameEN: "Brazil", continent: "南美洲", styles: ["星星", "几何图形", "复杂徽章"] },
        { code: "au", nameCN: "澳大利亚", nameEN: "Australia", continent: "大洋洲", styles: ["联合杰克", "星星"] },
        { code: "za", nameCN: "南非", nameEN: "South Africa", continent: "非洲", styles: ["水平条纹", "几何图形", "泛非色彩"] },
        { code: "eg", nameCN: "埃及", nameEN: "Egypt", continent: "非洲", styles: ["水平条纹", "复杂徽章", "泛阿拉伯色彩"] },
        { code: "in", nameCN: "印度", nameEN: "India", continent: "亚洲", styles: ["水平条纹", "纯色"] },
        { code: "ca", nameCN: "加拿大", nameEN: "Canada", continent: "北美洲", styles: ["植物", "垂直条纹"] },
        { code: "mx", nameCN: "墨西哥", nameEN: "Mexico", continent: "北美洲", styles: ["垂直条纹", "复杂徽章", "动物", "植物"] },
        { code: "ar", nameCN: "阿根廷", nameEN: "Argentina", continent: "南美洲", styles: ["水平条纹", "太阳"] },
        { code: "it", nameCN: "意大利", nameEN: "Italy", continent: "欧洲", styles: ["垂直条纹", "纯色"] },
        { code: "es", nameCN: "西班牙", nameEN: "Spain", continent: "欧洲", styles: ["水平条纹", "复杂徽章"] },
        { code: "ru", nameCN: "俄罗斯", nameEN: "Russia", continent: "欧洲", styles: ["水平条纹", "纯色"] },
        { code: "kr", nameCN: "韩国", nameEN: "South Korea", continent: "亚洲", styles: ["水平条纹"] },
        { code: "sa", nameCN: "沙特阿拉伯", nameEN: "Saudi Arabia", continent: "亚洲", styles: ["水平条纹", "泛阿拉伯色彩"] },
        { code: "nz", nameCN: "新西兰", nameEN: "New Zealand", continent: "大洋洲", styles: ["联合杰克", "星星"] }
    ];
}

// 设置事件监听
function setupEventListeners() {
    // 导航按钮
    safeAddEventListener('browseBtn', 'click', () => showSection('browse'));
    safeAddEventListener('quizBtn', 'click', () => showSection('quiz'));
    safeAddEventListener('memoryBtn', 'click', () => showSection('memory'));
    safeAddEventListener('globeBtn', 'click', () => showSection('globe'));
    safeAddEventListener('statsBtn', 'click', () => showSection('stats'));

    // 语言切换按钮 - 使用统一翻译系统
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            console.log(`Language button clicked: ${lang}`);

            // 更新按钮状态
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // 使用新的统一翻译系统进行切换
            i18n.switchLanguage(lang);

            // 强化修复：确保页面内容正常显示
            setTimeout(() => {
                // 检查并恢复国旗显示
                const flagsContainer = document.getElementById('flags-container');
                if (flagsContainer && flagsContainer.children.length === 0) {
                    console.warn('Emergency recovery: flags container is empty, forcing displayFlags()');
                    displayFlags();
                } else if (flagsContainer) {
                    const flagCards = flagsContainer.querySelectorAll('.flag-card');
                    if (flagCards.length === 0 && filteredCountries.length > 0) {
                        console.warn('Emergency recovery: no flag cards found but data exists, forcing displayFlags()');
                        displayFlags();
                    } else if (flagCards.length > 0) {
                        // 强制重新渲染国旗卡片以更新语言
                        rerenderBrowseCards();
                    }
                }

                // 确保当前section正确显示
                if (currentSection) {
                    showSection(currentSection);
                }
            }, 150);

            console.log(`✅ Language switched to: ${lang} using unified translation system`);
        });
    });

    // 搜索框
    safeAddEventListener('searchInput', 'input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        applyFilters();
    });

    // 大洲筛选
    safeAddEventListener('continentSelect', 'change', (e) => {
        selectedContinent = e.target.value;
        applyFilters();
    });

    // 排序方式
    document.querySelectorAll('[data-sort]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sortMethod = btn.dataset.sort;
            applyFilters();
        });
    });

    // 设计风格筛选
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const style = btn.dataset.style;
            if (selectedStyles.has(style)) {
                selectedStyles.delete(style);
                btn.classList.remove('selected');
            } else {
                selectedStyles.add(style);
                btn.classList.add('selected');
            }
            applyFilters();
        });
    });

    // 数据来源筛选
    safeAddEventListener('dataSourceSelect', 'change', (e) => {
        selectedDataSource = e.target.value;
        applyFilters();
    });

    // 测试类型选择
    document.querySelectorAll('.quiz-type-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.quiz-type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            quizType = card.dataset.type;
            const startBtn = document.getElementById('startQuizBtn');
            if (startBtn) startBtn.style.display = 'block';
        });
    });

    // 难度选择
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            difficulty = btn.dataset.difficulty;
        });
    });

    // 开始测试
    safeAddEventListener('startQuizBtn', 'click', startQuiz);
    safeAddEventListener('retryBtn', 'click', startQuiz);
    safeAddEventListener('backBtn', 'click', () => showSection('quiz'));
    safeAddEventListener('backToQuizBtn', 'click', backToQuiz);

    // 清除统计
    safeAddEventListener('clearStatsBtn', 'click', () => {
        if (confirm(i18n.t('alerts.confirmClearStats'))) {
            stats = { totalTests: 0, totalQuestions: 0, correctAnswers: 0, bestScore: 0 };
            saveStats();
            updateStatsDisplay();
        }
    });
}

// 安全添加事件监听器
function safeAddEventListener(id, event, handler) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener(event, handler);
    }
}

// 切换显示区域
function showSection(section) {
    console.log(`🔄 showSection called with: ${section}`);
    currentSection = section;

    // 更新导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (section === 'browse') safeSetClass('browseBtn', 'active');
    if (section === 'quiz') safeSetClass('quizBtn', 'active');
    if (section === 'memory') safeSetClass('memoryBtn', 'active');
    if (section === 'globe') safeSetClass('globeBtn', 'active');
    if (section === 'stats') {
        safeSetClass('statsBtn', 'active');
        updateStatsDisplay();
    }

    // 显示对应区域
    console.log(`📂 Setting display for sections: browse=${section === 'browse'}, quiz=${section === 'quiz'}, memory=${section === 'memory'}, stats=${section === 'stats'}`);
    safeSetDisplay('browse-section', section === 'browse' ? 'block' : 'none');
    safeSetDisplay('quiz-section', section === 'quiz' ? 'block' : 'none');
    safeSetDisplay('memory-section', section === 'memory' ? 'block' : 'none');
    safeSetDisplay('globe-section', section === 'globe' ? 'block' : 'none');
    safeSetDisplay('stats-section', section === 'stats' ? 'block' : 'none');

    // 紧急修复：确保浏览模式的容器可见
    if (section === 'browse') {
        const browseSection = document.getElementById('browse-section');
        if (browseSection) {
            browseSection.style.display = 'block';
            console.log('✅ Browse section forced to visible');
        }
    }
    
    // 重置测试状态
    if (section === 'quiz') {
        resetQuizState();
    }
    
    // 处理记忆训练区域
    if (section === 'memory') {
        if (typeof EnhancedMemorySystem !== 'undefined') {
            EnhancedMemorySystem.showMemory();
        } else {
            console.warn('EnhancedMemorySystem not available');
        }
    }

    // 处理3D地球仪
    if (section === 'globe') {
        setTimeout(() => {
            initGlobe();
        }, 100); // 延迟初始化，确保DOM元素可见
    }
}

// 安全设置类名
function safeSetClass(id, className) {
    const element = document.getElementById(id);
    if (element) element.classList.add(className);
}

// 安全设置显示状态
function safeSetDisplay(id, display) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = display;
        console.log(`📱 safeSetDisplay: ${id} -> ${display}`);
    } else {
        console.warn(`⚠️ safeSetDisplay: element with id '${id}' not found`);
    }
}

// 重置测试状态
function resetQuizState() {
    safeSetDisplay('quiz-start', 'block');
    safeSetDisplay('quiz-game', 'none');
    safeSetDisplay('quiz-result', 'none');
    
    quizType = '';
    difficulty = 'easy';
    questions = [];
    currentQuestion = 0;
    score = 0;
    wrongAnswers = [];
    
    document.querySelectorAll('.quiz-type-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    const easyBtn = document.querySelector('.difficulty-btn[data-difficulty="easy"]');
    if (easyBtn) easyBtn.classList.add('selected');
    
    safeSetDisplay('startQuizBtn', 'none');
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 应用筛选
function applyFilters() {
    filteredCountries = [...allCountries];
    
    // 数据来源筛选
    if (selectedDataSource !== 'all') {
        const sourceCountries = dataSources[selectedDataSource]?.countries;
        if (sourceCountries) {
            filteredCountries = filteredCountries.filter(c => 
                sourceCountries.includes(c.code)
            );
        }
    }
    
    // 搜索筛选
    if (searchTerm) {
        filteredCountries = filteredCountries.filter(c => 
            c.nameCN.toLowerCase().includes(searchTerm) ||
            c.nameEN.toLowerCase().includes(searchTerm)
        );
    }
    
    // 大洲筛选
    if (selectedContinent !== 'all') {
        filteredCountries = filteredCountries.filter(c => c.continent === selectedContinent);
    }
    
    // 风格筛选
    if (selectedStyles.size > 0) {
        filteredCountries = filteredCountries.filter(c => 
            c.styles && c.styles.some(s => selectedStyles.has(s))
        );
    }
    
    sortCountries();
    updateStats();
    displayFlags();
}

// 排序国家
function sortCountries() {
    switch (sortMethod) {
        case 'name':
            filteredCountries.sort((a, b) => a.nameEN.localeCompare(b.nameEN));
            break;
        case 'continent':
            filteredCountries.sort((a, b) => {
                if (a.continent === b.continent) {
                    return a.nameCN.localeCompare(b.nameCN);
                }
                return a.continent.localeCompare(b.continent);
            });
            break;
        case 'random':
            filteredCountries.sort(() => Math.random() - 0.5);
            break;
    }
}

// 更新统计
function updateStats() {
    let totalCount = allCountries.length;
    if (selectedDataSource !== 'all') {
        const sourceCountries = dataSources[selectedDataSource]?.countries;
        if (sourceCountries) {
            totalCount = allCountries.filter(c => 
                sourceCountries.includes(c.code)
            ).length;
        }
    }
    
    safeSetText('totalCount', totalCount.toString());
    safeSetText('filteredCount', filteredCountries.length.toString());
}

// 安全设置文本内容
function safeSetText(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
}

// 显示国旗
function displayFlags() {
    const container = document.getElementById('flags-container');
    if (!container) return;
    
    if (filteredCountries.length === 0) {
        const emptyTemplate = document.getElementById('empty-state-template');
        if (emptyTemplate) {
            container.innerHTML = '';
            container.appendChild(emptyTemplate.content.cloneNode(true));
        }
        return;
    }
    
    const flagTemplate = document.getElementById('flag-card-template');
    if (!flagTemplate) return;
    
    container.innerHTML = '';
    
    filteredCountries.forEach(country => {
        const flagCard = flagTemplate.content.cloneNode(true);
        
        // 设置图片
        const img = flagCard.querySelector('.flag-img');
        if (img) {
            img.src = `pics/${country.code}.png`;
            img.alt = i18n.getCountryName(country);
            img.onerror = function() {
                this.src = `https://via.placeholder.com/200x140/f0f0f0/999?text=${country.code.toUpperCase()}`;
            };
        }

        // 设置国家名称 - 根据当前语言动态显示
        const nameCN = flagCard.querySelector('.flag-name-cn'); // 主要名称（大字体）
        const nameEN = flagCard.querySelector('.flag-name-en'); // 次要名称（小字体）
        const isEnglishMode = i18n.currentLanguage === 'en';

        if (isEnglishMode) {
            // 英文模式：主要显示英文名称，中文名称为副标题
            if (nameCN) nameCN.textContent = country.nameEN;  // 主要显示英文
            if (nameEN) nameEN.textContent = country.nameCN;  // 副标题显示中文
        } else {
            // 中文模式：主要显示中文名称，英文名称为副标题
            if (nameCN) nameCN.textContent = country.nameCN;  // 主要显示中文
            if (nameEN) nameEN.textContent = country.nameEN;  // 副标题显示英文
        }

        // 设置标签 - 使用本地化的名称，并添加数据属性避免重复更新
        const continentTag = flagCard.querySelector('.continent-tag');
        if (continentTag) {
            continentTag.setAttribute('data-continent', country.continent);
            continentTag.textContent = i18n.getContinentName(country.continent);
        }

        // 设置风格标签 - 使用本地化的名称，并添加数据属性避免重复更新
        const styleTag = flagCard.querySelector('.style-tag');
        if (styleTag && country.styles && country.styles.length > 0) {
            styleTag.setAttribute('data-feature', country.styles[0]);
            styleTag.textContent = i18n.getFeatureName(country.styles[0]);
            // 添加更多风格标签
            for (let i = 1; i < Math.min(country.styles.length, 3); i++) {
                const newStyleTag = styleTag.cloneNode();
                newStyleTag.setAttribute('data-feature', country.styles[i]);
                newStyleTag.textContent = i18n.getFeatureName(country.styles[i]);
                styleTag.parentNode.appendChild(newStyleTag);
            }
        } else if (styleTag) {
            styleTag.style.display = 'none';
        }
        
        container.appendChild(flagCard);
    });
}

// 停止计时器
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 返回知识测试选择页面
function backToQuiz() {
    // 停止计时器
    stopTimer();

    // 使用showSection函数返回测试选择页面，这会自动处理重置逻辑
    showSection('quiz');
}

// 开始测试
function startQuiz() {
    if (!quizType) {
        alert(i18n.t('alerts.selectTestType'));
        return;
    }

    // 确保i18n数据已加载
    if (!i18n.loaded || !i18n.translations[i18n.currentLanguage]?.quiz) {
        console.warn('i18n data not loaded, waiting...');
        setTimeout(startQuiz, 100);
        return;
    }
    
    const questionCount = {
        easy: 5,
        medium: 10,
        hard: 20
    }[difficulty] || 5;
    
    questions = generateQuestions(questionCount);
    currentQuestion = 0;
    score = 0;
    startTime = Date.now();
    wrongAnswers = [];
    
    safeSetDisplay('quiz-start', 'none');
    safeSetDisplay('quiz-game', 'block');
    safeSetDisplay('quiz-result', 'none');
    
    startTimer();
    showQuestion();
}

// 生成题目
function generateQuestions(count) {
    const questionsArray = [];
    const availableCountries = [...allCountries];
    
    for (let i = 0; i < Math.min(count, availableCountries.length); i++) {
        const correctIndex = Math.floor(Math.random() * availableCountries.length);
        const correct = availableCountries[correctIndex];
        availableCountries.splice(correctIndex, 1);
        
        const options = [correct];
        const tempCountries = allCountries.filter(c => c.code !== correct.code);
        
        for (let j = 0; j < 3 && j < tempCountries.length; j++) {
            const wrongIndex = Math.floor(Math.random() * tempCountries.length);
            options.push(tempCountries[wrongIndex]);
            tempCountries.splice(wrongIndex, 1);
        }
        
        options.sort(() => Math.random() - 0.5);
        
        questionsArray.push({
            correct: correct,
            options: options
        });
    }
    
    return questionsArray;
}

// 显示题目
function showQuestion() {
    const q = questions[currentQuestion];
    const total = questions.length;
    
    const progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = `${((currentQuestion + 1) / total) * 100}%`;
    
    const questionTemplate = i18n.t('quiz.question', {current: currentQuestion + 1, total: total});
    safeSetText('questionNumber', questionTemplate);
    
    const questionContent = document.getElementById('questionContent');
    const optionsContainer = document.getElementById('optionsContainer');
    
    if (!questionContent || !optionsContainer) return;
    
    if (quizType === 'flag-to-country') {
        // 使用国旗到国家模板
        const flagTemplate = document.getElementById('question-flag-template');
        if (flagTemplate) {
            questionContent.innerHTML = '';
            const templateContent = flagTemplate.content.cloneNode(true);
            const img = templateContent.querySelector('.question-flag');
            if (img) {
                img.src = `pics/${q.correct.code}.png`;
                img.alt = '国旗';
                img.onerror = function() {
                    this.src = `https://via.placeholder.com/360x240/f0f0f0/999?text=${q.correct.code.toUpperCase()}`;
                };
            }
            questionContent.appendChild(templateContent);

            // 在模板添加到DOM后直接更新文本
            setTimeout(() => {
                const questionText = questionContent.querySelector('.question-text');
                if (questionText) {
                    const flagQuestionText = i18n.t('quiz.flagQuestion');
                    questionText.textContent = flagQuestionText;
                    console.log('Flag question text updated to:', flagQuestionText);
                }
            }, 10);
        }
        
        // 使用选项按钮模板
        const buttonTemplate = document.getElementById('option-button-template');
        if (buttonTemplate) {
            optionsContainer.innerHTML = '';
            q.options.forEach(opt => {
                const buttonContent = buttonTemplate.content.cloneNode(true);
                const button = buttonContent.querySelector('.option-btn');
                const textSpan = buttonContent.querySelector('.option-text');
                
                if (button && textSpan) {
                    button.onclick = () => checkAnswer(opt.code, q.correct.code);
                    // 记录选项代码，便于统一判题上色
                    button.dataset.code = opt.code;
                    textSpan.textContent = i18n.getCountryName(opt);
                    optionsContainer.appendChild(buttonContent);
                }
            });
        }
    } else {
        // 使用国家到国旗模板
        const countryTemplate = document.getElementById('question-country-template');
        if (countryTemplate) {
            questionContent.innerHTML = '';
            const templateContent = countryTemplate.content.cloneNode(true);
            const countryName = templateContent.querySelector('.country-name');
            if (countryName) {
                countryName.textContent = i18n.getCountryName(q.correct);
            }

            // 更新国家选择国旗的问题文本
            const questionText = templateContent.querySelector('.question-text');
            if (questionText) {
                const template = i18n.t('quiz.countryQuestion');
                questionText.textContent = template.replace('{country}', i18n.getCountryName(q.correct));
            }
            questionContent.appendChild(templateContent);
        }
        
        // 使用国旗选项模板
        const flagTemplate = document.getElementById('option-flag-template');
        if (flagTemplate) {
            optionsContainer.innerHTML = '';
            q.options.forEach(opt => {
                const templateContent = flagTemplate.content.cloneNode(true);
                const button = templateContent.querySelector('.option-btn');
                const img = templateContent.querySelector('.option-flag');
                
                if (button && img) {
                    button.onclick = () => checkAnswer(opt.code, q.correct.code);
                    // 记录选项代码，便于统一判题上色
                    button.dataset.code = opt.code;
                    img.src = `pics/${opt.code}.png`;
                    img.alt = opt.nameCN;
                    img.onerror = function() {
                        this.src = `https://via.placeholder.com/200x120/f0f0f0/999?text=${opt.code.toUpperCase()}`;
                    };
                    optionsContainer.appendChild(templateContent);
                }
            });
        }
    }
}

// 检查答案
function checkAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => {
        btn.disabled = true;
        const btnCode = btn.dataset && btn.dataset.code ? btn.dataset.code : null;
        
        if (btnCode === correct) {
            btn.classList.add('correct');
        } else if (btnCode === selected) {
            btn.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        score++;
    } else {
        const currentQ = questions[currentQuestion];
        const selectedCountry = currentQ.options.find(opt => opt.code === selected);
        
        wrongAnswers.push({
            questionIndex: currentQuestion + 1,
            questionType: quizType,
            correctCountry: currentQ.correct,
            selectedCountry: selectedCountry,
            options: currentQ.options
        });
    }
    
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

// 从onclick中提取代码
function extractCodeFromOnclick(onclickFn) {
    if (!onclickFn) return null;
    const str = onclickFn.toString();
    const match = str.match(/checkAnswer\('([^']+)'/);
    return match ? match[1] : null;
}

// 结束测试
function endQuiz() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    stats.totalTests++;
    stats.totalQuestions += questions.length;
    stats.correctAnswers += score;
    if (score > stats.bestScore) {
        stats.bestScore = score;
    }
    saveStats();
    
    safeSetDisplay('quiz-game', 'none');
    safeSetDisplay('quiz-result', 'block');
    
    const accuracy = Math.round((score / questions.length) * 100);
    
    safeSetText('scoreDisplay', `${score}/${questions.length}`);
    safeSetText('correctCount', score.toString());
    safeSetText('wrongCount', (questions.length - score).toString());
    safeSetText('accuracyRate', `${accuracy}%`);
    safeSetText('timeSpent', formatTime(timeSpent));
    
    const messages = i18n.translations[i18n.currentLanguage]?.quiz?.messages || {};
    let message = '';
    if (accuracy === 100) {
        message = messages.perfect || '完美！你是真正的国旗专家！🏆';
    } else if (accuracy >= 80) {
        message = messages.excellent || '优秀！你的国旗知识非常丰富！⭐';
    } else if (accuracy >= 60) {
        message = messages.good || '不错！继续努力，你会更棒的！💪';
    } else if (accuracy >= 40) {
        message = messages.keepTrying || '加油！多练习就能进步！📚';
    } else {
        message = messages.keepLearning || '没关系，学习需要时间，继续努力！🌟';
    }
    
    safeSetText('resultMessage', message);
    
    displayWrongAnswers();
}

// 计时器
function startTimer() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timerEl.textContent = `⏱️ ${formatTime(elapsed)}`;
    }, 1000);
}

// 格式化时间
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 更新统计显示
function updateStatsDisplay() {
    safeSetText('totalTests', stats.totalTests.toString());
    safeSetText('totalQuestions', stats.totalQuestions.toString());
    
    const accuracy = stats.totalQuestions > 0 
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) 
        : 0;
    safeSetText('overallAccuracy', `${accuracy}%`);
    safeSetText('bestScore', stats.bestScore.toString());
}

// 显示错题详情
function displayWrongAnswers() {
    const wrongSection = document.getElementById('wrong-answers-section');
    const container = document.getElementById('wrong-answers-container');
    
    if (!wrongSection || !container) return;
    
    if (wrongAnswers.length === 0) {
        wrongSection.style.display = 'none';
        return;
    }
    
    wrongSection.style.display = 'block';
    container.innerHTML = '';

    console.log('🔍 displayWrongAnswers - current language:', i18n.currentLanguage);
    console.log('🔍 displayWrongAnswers - i18n loaded:', i18n.loaded);
    console.log('🔍 displayWrongAnswers - translations available:', !!i18n.translations[i18n.currentLanguage]);
    console.log('🔍 displayWrongAnswers - correctAnswer key:', i18n.t('quiz.wrongAnswers.correctAnswer'));
    console.log('🔍 displayWrongAnswers - yourAnswer key:', i18n.t('quiz.wrongAnswers.yourAnswer'));

    // 检查翻译路径
    if (i18n.translations[i18n.currentLanguage]) {
        const quizSection = i18n.translations[i18n.currentLanguage].quiz;
        if (quizSection && quizSection.wrongAnswers) {
            console.log('🔍 Available wrongAnswers keys:', Object.keys(quizSection.wrongAnswers));
        } else {
            console.log('🔍 quiz.wrongAnswers section not found');
        }
    }

    // 在显示错题后立即更新标签
    setTimeout(() => {
        updateWrongAnswersContent();
    }, 100);
    
    wrongAnswers.forEach(wrong => {
        if (wrong.questionType === 'flag-to-country') {
            // 使用国旗到国家错题模板
            const flagTemplate = document.getElementById('wrong-answer-flag-template');
            if (flagTemplate) {
                const templateContent = flagTemplate.content.cloneNode(true);
                
                // 设置题号
                const questionNumber = templateContent.querySelector('.wrong-question-number');
                const questionTemplate = i18n.t('quiz.questionNumber', {index: wrong.questionIndex});
                if (questionNumber) questionNumber.textContent = questionTemplate.replace('{index}', wrong.questionIndex);
                
                // 设置国旗图片
                const flagImg = templateContent.querySelector('.wrong-flag');
                if (flagImg) {
                    flagImg.src = `pics/${wrong.correctCountry.code}.png`;
                    flagImg.alt = '国旗';
                    flagImg.onerror = function() {
                        this.src = `https://via.placeholder.com/200x120/f0f0f0/999?text=${wrong.correctCountry.code.toUpperCase()}`;
                    };
                }
                
                // 设置正确答案
                const correctText = templateContent.querySelector('.answer-text.correct');
                if (correctText) {
                    correctText.textContent = i18n.getCountryName(wrong.correctCountry);
                    correctText.setAttribute('data-country-code', wrong.correctCountry.code);
                }

                // 设置错误答案
                const wrongText = templateContent.querySelector('.answer-text.wrong');
                if (wrongText) {
                    wrongText.textContent = i18n.getCountryName(wrong.selectedCountry);
                    wrongText.setAttribute('data-country-code', wrong.selectedCountry.code);
                }

                // 更新错题详情模板中的国际化文本
                const questionType = templateContent.querySelector('.wrong-question-type');
                if (questionType) {
                    questionType.textContent = i18n.t('quiz.wrongAnswers.flagToCountry');
                }

                // 注意：不直接设置answer-label的textContent，因为它们有data-i18n属性
                // 让updateWrongAnswersContent()函数处理这些翻译

                container.appendChild(templateContent);
            }
        } else {
            // 使用国家到国旗错题模板
            const countryTemplate = document.getElementById('wrong-answer-country-template');
            if (countryTemplate) {
                const templateContent = countryTemplate.content.cloneNode(true);
                
                // 设置题号
                const questionNumber = templateContent.querySelector('.wrong-question-number');
                const questionTemplate = i18n.t('quiz.questionNumber', {index: wrong.questionIndex});
                if (questionNumber) questionNumber.textContent = questionTemplate.replace('{index}', wrong.questionIndex);
                
                // 设置国家名称
                const countryName = templateContent.querySelector('.country-name');
                if (countryName) {
                    countryName.textContent = i18n.getCountryName(wrong.correctCountry);
                    countryName.setAttribute('data-country-code', wrong.correctCountry.code);
                }
                
                // 设置正确国旗
                const correctFlag = templateContent.querySelector('.flag-option.correct .comparison-flag');
                if (correctFlag) {
                    correctFlag.src = `pics/${wrong.correctCountry.code}.png`;
                    correctFlag.alt = '正确国旗';
                    correctFlag.onerror = function() {
                        this.src = `https://via.placeholder.com/150x100/f0f0f0/999?text=${wrong.correctCountry.code.toUpperCase()}`;
                    };
                }
                
                // 设置错误国旗
                const wrongFlag = templateContent.querySelector('.flag-option.wrong .comparison-flag');
                if (wrongFlag) {
                    wrongFlag.src = `pics/${wrong.selectedCountry.code}.png`;
                    wrongFlag.alt = '错误国旗';
                    wrongFlag.onerror = function() {
                        this.src = `https://via.placeholder.com/150x100/f0f0f0/999?text=${wrong.selectedCountry.code.toUpperCase()}`;
                    };
                }

                // 更新错题详情模板中的国际化文本
                const questionType = templateContent.querySelector('.wrong-question-type');
                if (questionType) {
                    questionType.textContent = i18n.t('quiz.wrongAnswers.countryToFlag');
                }

                const correctLabel = templateContent.querySelector('.flag-option.correct .flag-label');
                if (correctLabel) {
                    const correctText = i18n.t('quiz.wrongAnswers.correctAnswer');
                    correctLabel.textContent = correctText;
                    console.log('Setting correct label to:', correctText, 'Current lang:', currentLang);
                }

                const wrongLabel = templateContent.querySelector('.flag-option.wrong .flag-label');
                if (wrongLabel) {
                    const wrongText = i18n.t('quiz.wrongAnswers.yourAnswer');
                    wrongLabel.textContent = wrongText;
                    console.log('Setting wrong label to:', wrongText, 'Current lang:', currentLang);
                }

                container.appendChild(templateContent);

                // 确保在DOM中再次更新文本
                setTimeout(() => {
                    const addedCorrectLabel = container.querySelector('.flag-option.correct .flag-label');
                    const addedWrongLabel = container.querySelector('.flag-option.wrong .flag-label');

                    if (addedCorrectLabel) {
                        const correctText = i18n.t('quiz.wrongAnswers.correctAnswer');
                        addedCorrectLabel.textContent = correctText;
                        console.log('DOM update - Setting correct label to:', correctText);
                    }

                    if (addedWrongLabel) {
                        const wrongText = i18n.t('quiz.wrongAnswers.yourAnswer');
                        addedWrongLabel.textContent = wrongText;
                        console.log('DOM update - Setting wrong label to:', wrongText);
                    }
                }, 50);
            }
        }
    });
}

// 增强版记忆训练系统
const EnhancedMemorySystem = {
    // 按大洲分类数据（自动分组，每组最多12个国家）
    categories: {},

    // 用户数据
    progress: JSON.parse(localStorage.getItem('enhancedMemoryProgress') || '{}'),
    achievements: JSON.parse(localStorage.getItem('memoryAchievements') || '[]'),
    
    // 分类进度数据
    categoryProgress: JSON.parse(localStorage.getItem('categoryProgress') || '{}'),
    
    // 当前学习会话
    currentSession: {
        startTime: null,
        flagsStudied: 0,
        sessionType: null
    },
    
    // 学习状态管理
    learningState: {
        currentCategory: null,
        lastStudiedCategory: null,
        sessionHistory: JSON.parse(localStorage.getItem('sessionHistory') || '[]')
    },

    init() {
        console.log('🚀 增强版记忆系统开始初始化');
        this.checkDailyProgress();
        console.log('📂 开始初始化分类数据...');
        this.initContinentCategories();
        console.log('📂 初始化完成，当前分类数量:', Object.keys(this.categories).length);

        // 注意：renderCategories() 在 showMemory() 时调用，不是在 init() 时调用
        // 这里只需要确保分类数据已准备好
    },

    // 初始化按大洲分类（自动分组，每组最多12个国家）
    initContinentCategories() {
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
        const continentKeyMap = {
            '亚洲': 'asia',
            '欧洲': 'europe',
            '非洲': 'africa',
            '北美洲': 'northAmerica',
            '南美洲': 'southAmerica',
            '大洋洲': 'oceania'
        };

        // 按大洲分组国家
        const continentGroups = {};
        allCountries.forEach(country => {
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

            console.log(`📍 处理大洲 ${continent} (${continentKey}), 国家数量: ${totalCountries}, 分组数: ${groupCount}`);

            for (let i = 0; i < groupCount; i++) {
                const startIndex = i * 12;
                const endIndex = Math.min(startIndex + 12, totalCountries);
                const groupCountries = countries.slice(startIndex, endIndex);

                // 生成分类键
                let categoryKey;
                if (groupCount === 1) {
                    categoryKey = continentKey;
                } else {
                    categoryKey = `${continentKey}.${i + 1}`;
                }

                // 创建分类数据 - 使用最简化的方式
                this.categories[categoryKey] = {
                    originalContinent: continentKey,
                    groupNumber: groupCount > 1 ? i + 1 : null,
                    continentKey: continentKey,
                    description: `Flags of ${continentKey.charAt(0).toUpperCase() + continentKey.slice(1)} countries`,
                    countries: groupCountries.map(c => c.code),
                    tips: 'Study tips for this region',
                    totalGroups: groupCount
                };

                console.log(`✅ 创建分类 ${categoryKey}，包含 ${groupCountries.length} 个国家`);
            }
        });

        console.log('🎉 大洲分类初始化完成，分类数量:', Object.keys(this.categories).length);
    },

    // 获取大洲描述
    getContinentDescription(continent, groupNumber, totalGroups) {
        const continentKey = this.getContinentKey(continent);
        // 使用新的翻译API获取描述
        const descriptionKey = `memory.continentDescriptions.${continentKey}`;
        const description = i18n.t(descriptionKey);
        return description !== descriptionKey ? description : `${this.getLocalizedContinentName(continent)} ${i18n.t('memory.flagsOfRegion')}`;
    },

    // 获取大洲学习技巧
    getContinentTips(continent) {
        const continentKey = this.getContinentKey(continent);
        // 使用新的翻译API获取技巧
        const tipsKey = `memory.continentTips.${continentKey}`;
        const tips = i18n.t(tipsKey);
        return tips !== tipsKey ? tips : i18n.t('memory.defaultTip');
    },

    // 获取本地化的大洲名称
    getLocalizedContinentName(continent) {
        const continentKey = this.getContinentKey(continent);
        // 确保使用当前正确的语言状态
        const currentLang = i18n.currentLanguage || 'zh';

        // 首先尝试从memory.continents获取翻译（记忆训练模块的大洲翻译）
        if (i18n.translations[currentLang] &&
            i18n.translations[currentLang].memory &&
            i18n.translations[currentLang].memory.continents &&
            i18n.translations[currentLang].memory.continents[continentKey]) {
            const translatedName = i18n.translations[currentLang].memory.continents[continentKey];
            return translatedName;
        }

        // 备选方案：从全局continents获取翻译
        if (i18n.translations[currentLang] &&
            i18n.translations[currentLang].continents &&
            i18n.translations[currentLang].continents[continentKey]) {
            const translatedName = i18n.translations[currentLang].continents[continentKey];
            return translatedName;
        }

        console.warn(`⚠️ 未找到大洲翻译: ${continentKey} (${currentLang})`);
        return continent;
    },

    // 获取本地化的分类名称
    getLocalizedCategoryName(categoryName) {
        // 如果是硬编码的中文名称，先尝试转换为键名
        let categoryKey = categoryName;

        // 处理硬编码的中文分类名称
        const chineseToKeyMap = {
            '欧洲（1）': 'europe.1',
            '欧洲（2）': 'europe.2',
            '欧洲（3）': 'europe.3',
            '欧洲（4）': 'europe.4',
            '非洲（1）': 'africa.1',
            '非洲（2）': 'africa.2',
            '非洲（3）': 'africa.3',
            '非洲（4）': 'africa.4',
            '非洲（5）': 'africa.5',
            '亚洲（1）': 'asia.1',
            '亚洲（2）': 'asia.2',
            '亚洲（3）': 'asia.3',
            '亚洲（4）': 'asia.4',
            '南美洲': 'southAmerica',
            '北美洲（1）': 'northAmerica.1',
            '北美洲（2）': 'northAmerica.2',
            '大洋洲（1）': 'oceania.1',
            '大洋洲（2）': 'oceania.2'
        };

        // 处理硬编码的英文分类名称
        const englishToKeyMap = {
            'Europe (1)': 'europe.1',
            'Europe (2)': 'europe.2',
            'Europe (3)': 'europe.3',
            'Europe (4)': 'europe.4',
            'Africa (1)': 'africa.1',
            'Africa (2)': 'africa.2',
            'Africa (3)': 'africa.3',
            'Africa (4)': 'africa.4',
            'Africa (5)': 'africa.5',
            'Asia (1)': 'asia.1',
            'Asia (2)': 'asia.2',
            'Asia (3)': 'asia.3',
            'Asia (4)': 'asia.4',
            'South America': 'southAmerica',
            'North America (1)': 'northAmerica.1',
            'North America (2)': 'northAmerica.2',
            'Oceania (1)': 'oceania.1',
            'Oceania (2)': 'oceania.2'
        };

        // 转换硬编码名称为标准键名
        if (chineseToKeyMap[categoryName]) {
            categoryKey = chineseToKeyMap[categoryName];
        } else if (englishToKeyMap[categoryName]) {
            categoryKey = englishToKeyMap[categoryName];
        }

        // 尝试翻译分类键名
        const translation = i18n.t(`memory.category.${categoryKey}`);
        if (translation !== `memory.category.${categoryKey}`) {
            return translation;
        }

        // 如果没有找到翻译，返回原始名称
        return categoryName;
    },

    // 获取大洲的键名
    getContinentKey(continent) {
        const continentMap = {
            // 中文到键的映射
            '亚洲': 'asia',
            '欧洲': 'europe',
            '非洲': 'africa',
            '北美洲': 'northAmerica',
            '南美洲': 'southAmerica',
            '大洋洲': 'oceania',
            // 英文到键的映射
            'Asia': 'asia',
            'Europe': 'europe',
            'Africa': 'africa',
            'North America': 'northAmerica',
            'South America': 'southAmerica',
            'Oceania': 'oceania'
        };
        return continentMap[continent] || continent;
    },

    // 获取本地化的分类名称
    getLocalizedCategoryName(name, data) {
        // 确保获取最新的语言状态
        const currentLang = i18n.currentLanguage || 'zh';

        if (data.groupNumber && data.totalGroups && data.totalGroups > 1) {
            // 如果是分组的情况，需要重新生成本地化名称
            const continentName = this.getLocalizedContinentName(data.originalContinent);
            // 使用当前语言的括号格式
            const bracketFormat = currentLang === 'zh' ? '（' : '(';
            const bracketFormatEnd = currentLang === 'zh' ? '）' : ')';
            return `${continentName}${bracketFormat}${data.groupNumber}${bracketFormatEnd}`;
        }
        return this.getLocalizedContinentName(data.originalContinent) || name;
    },

    // 获取本地化的分类描述
    getLocalizedCategoryDescription(data) {
        return this.getContinentDescription(data.originalContinent, data.groupNumber, data.totalGroups);
    },

    // 获取本地化的分类技巧
    getLocalizedCategoryTips(data) {
        return this.getContinentTips(data.originalContinent);
    },

    showMemory() {
        console.log('🧠 showMemory() 开始执行');
        const container = document.getElementById('simpleMemoryContainer');
        if (!container) {
            console.error('❌ simpleMemoryContainer 未找到');
            return;
        }
        console.log('✅ 找到 simpleMemoryContainer');
        console.log('📊 当前分类数据:', Object.keys(this.categories).length, '个分类');

        const allFlags = Object.values(this.categories).flatMap(cat => cat.countries);
        const learned = allFlags.filter(code => this.progress[code]?.learned);
        const overallProgress = Math.round((learned.length / allFlags.length) * 100);
        const todayStudied = this.getTodayStudiedCount();

        // 使用记忆训练主界面模板
        const mainTemplate = document.getElementById('memory-main-template');
        if (mainTemplate) {
            console.log('✅ 找到 memory-main-template');
            container.innerHTML = '';
            const templateContent = mainTemplate.content.cloneNode(true);
            container.appendChild(templateContent);
            console.log('✅ 模板已插入到DOM，容器内容长度:', container.innerHTML.length);

            // 立即翻译模板内容
            setTimeout(() => {
                if (window.i18n && window.i18n.updateDOM) {
                    // 确保使用正确的语言设置
                    const currentLang = i18n.currentLanguage || 'zh';
                    console.log('🌐 翻译模板内容，当前语言:', currentLang);
                    i18n.updateDOM();

                    // 额外调用记忆训练模块的翻译函数
                    if (typeof updateLanguage === 'function') {
                        updateLanguage(currentLang);
                    }
                }
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
    },

    updateMemoryStats() {
        const allFlags = Object.values(this.categories).flatMap(cat => cat.countries);
        const learned = allFlags.filter(code => this.progress[code]?.learned);
        const overallProgress = Math.round((learned.length / allFlags.length) * 100);
        const todayStudied = this.getTodayStudiedCount();

        // 更新头部统计
        const learnedCount = document.querySelector('.learned-count');
        if (learnedCount) learnedCount.textContent = learned.length;

        const totalCount = document.querySelector('.total-count');
        if (totalCount) totalCount.textContent = allFlags.length;

        const progressPercent = document.querySelector('.progress-percent');
        if (progressPercent) progressPercent.textContent = `${overallProgress}%`;

        const todayCount = document.querySelector('.today-count');
        if (todayCount) todayCount.textContent = todayStudied;

        // 更新总体进度条
        const totalProgressText = document.querySelector('.total-progress-text');
        if (totalProgressText) totalProgressText.textContent = `${learned.length}/${allFlags.length}`;

        const totalProgressFill = document.querySelector('.total-progress-fill');
        if (totalProgressFill) totalProgressFill.style.width = `${overallProgress}%`;

        const overallComplete = document.querySelector('.overall-complete');
        if (overallComplete) {
            if (overallProgress === 100) {
                overallComplete.style.display = 'block';
            } else {
                overallComplete.style.display = 'none';
            }
        }
    },

    renderCategories() {
        console.log('🔍 开始查找 categories-container...');
        let categoriesContainer = document.querySelector('.categories-container');

        // 如果没有找到，尝试多种选择器
        if (!categoriesContainer) {
            console.log('🔍 尝试其他选择器...');
            categoriesContainer = document.querySelector('#simpleMemoryContainer .categories-container');
        }

        if (!categoriesContainer) {
            console.log('🔍 尝试通过class查找...');
            const allContainers = document.getElementsByClassName('categories-container');
            if (allContainers.length > 0) {
                categoriesContainer = allContainers[0];
                console.log('✅ 通过getElementsByClassName找到容器');
            }
        }

        if (!categoriesContainer) {
            console.error('❌ 所有方法都无法找到 categories-container');
            console.log('📋 页面中所有相关元素:', document.querySelectorAll('[class*="categories"], [id*="memory"]'));
            return;
        }

        console.log('✅ 找到 categories-container:', categoriesContainer);
        console.log('🔍 容器可见性:', window.getComputedStyle(categoriesContainer).display);
        console.log('🔍 容器父元素:', categoriesContainer.parentElement);

        categoriesContainer.innerHTML = '';

        console.log('🔍 renderCategories: 分类数据数量:', Object.keys(this.categories).length);
        console.log('🔍 容器位置:', categoriesContainer.getBoundingClientRect());

        if (Object.keys(this.categories).length === 0) {
            console.warn('⚠️ 没有分类数据可渲染');
            categoriesContainer.innerHTML = '<p style="text-align: center; color: #666;">正在加载分类数据...</p>';
            return;
        }

        // 开始渲染真实的分类卡片
        console.log('🎯 开始渲染真实的分类卡片...');

        Object.entries(this.categories).forEach(([categoryName, data]) => {
            console.log('🏷️ 渲染分类:', categoryName, '国家数量:', data.countries?.length);
            const categoryLearned = data.countries.filter(code => this.progress[code]?.learned).length;
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
                ${displayTips ? `
                    <div class="category-tips" style="background: #fefce8; border-left: 3px solid #fde047; border-radius: 6px; padding: 10px;">
                        <div class="tips-title" style="text-align: left; margin-bottom: 6px; font-weight: 600;">${studyTipsTitle}</div>
                        <div class="tips-content">${displayTips}</div>
                    </div>
                ` : ''}
                ${categoryProgress.lastStudied ? `
                    <div class="last-studied">
                        ${lastStudiedText}${this.formatLastStudied(categoryProgress.lastStudied)}
                    </div>
                ` : ''}
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
            if (window.i18n && window.i18n.updateDOM) {
                console.log('🔄 renderCategories完成，触发DOM翻译');
                i18n.updateDOM();
            }
        }, 100);
    },

    // 格式化上次学习时间
    formatLastStudied(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return '刚刚';
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffHours < 24) return `${diffHours}小时前`;
        if (diffDays < 7) return `${diffDays}天前`;
        
        return date.toLocaleDateString('zh-CN');
    },

    setupMemoryEventListeners() {
        // 快捷学习按钮
        document.querySelectorAll('.quick-study-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.quickStudy(btn.dataset.mode);
            });
        });

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
    },


    startCategoryStudy(categoryName) {
        const category = this.categories[categoryName];
        if (!category) return;

        // 一次学习完整个分类：未学习的优先，然后是已学习的（均打乱顺序），不再截取数量
        const unlearned = category.countries.filter(code => !this.progress[code]?.learned);
        const learned = category.countries.filter(code => this.progress[code]?.learned);
        const orderedAll = this.shuffle(unlearned).concat(this.shuffle(learned));

        this.currentFlags = orderedAll;
        this.currentIndex = 0;
        this.currentCategory = categoryName;
        const categoryLearningText = i18n.t('memory.categoryLearning');
        this.currentSession.sessionType = categoryLearningText + categoryName;
        // 先展示预览页，用户点击"开始测试"后再开始会话
        this.showPreviewPage();
    },

    startSession() {
        this.currentSession.startTime = Date.now();
        this.currentSession.flagsStudied = 0;
    },

    showStudyPage() {
        // 隐藏记忆训练主界面
        const memorySection = document.getElementById('memory-section');
        if (memorySection) memorySection.style.display = 'none';

        // 创建学习页面
        let studySection = document.getElementById('study-section');
        if (!studySection) {
            studySection = document.createElement('div');
            studySection.id = 'study-section';
            studySection.style.display = 'none';
            document.querySelector('.content').appendChild(studySection);
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

        // 更新当前区域状态
        currentSection = 'study';
        
        // 绑定返回按钮事件
        const returnBtn = document.getElementById('returnToMemoryBtn');
        if (returnBtn) {
            returnBtn.onclick = () => {
                this.returnToMemory();
            };
        }
        
        // 默认进入预览页由上游控制，这里仅在需要时渲染单卡界面
        this.showFlag();
    },

    // 预览页：平铺展示该分类所有国旗 + 学习提示 + 开始测试按钮
    showPreviewPage() {
        // 搭建学习页容器
        this.showStudyPage();

        const studyContent = document.getElementById('studyContent');
        if (!studyContent) return;

        const categoryName = this.currentCategory;
        const cat = this.categories[categoryName];
        // 预览按分类定义的原始顺序展示
        const previewList = Array.isArray(cat?.countries) ? [...cat.countries] : [];
        const total = previewList.length;
        const learnedCount = previewList.filter(code => this.progress[code]?.learned).length;
        const unlearnedCount = total - learnedCount;

        // 平铺网格
        const gridItems = previewList.map(code => {
            const country = allCountries.find(c => c.code === code);
            const titleCN = country?.nameCN || code.toUpperCase();
            const titleEN = country?.nameEN || '';
            return `
                <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px;display:flex;flex-direction:column;align-items:center;gap:6px;">
                    <div style="width:100%;height:90px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:6px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                        <img src="pics/${code}.png" alt="${titleCN}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.src='https://via.placeholder.com/160x100/f0f0f0/999?text=${code.toUpperCase()}'" />
                    </div>
                    <div style="text-align:center;">
                        <div style="font-size:13px;color:#1f2937;font-weight:600;">${titleCN}</div>
                        <div style="font-size:11px;color:#6b7280;">${titleEN}</div>
                    </div>
                </div>
            `;
        }).join('');

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
                    ${cat?.tips ? `<div style="background:#fef3c7;border-left:3px solid #f59e0b;border-radius:6px;padding:10px;margin-bottom:12px;color:#92400e;font-size:13px;">
                        <div style="font-weight:600;margin-bottom:4px;">${studyHintTitle}</div>
                        <div>${cat.tips}</div>
                    </div>` : ''}
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

        // 在创建DOM后立即调用翻译更新
        setTimeout(() => {
            updateMemoryModuleText();
        }, 50);

        const btn = document.getElementById('beginStudyBtn');
        if (btn) {
            btn.onclick = () => {
                // 真正开始会话与单卡学习
                this.startSession();
                this.currentIndex = 0;
                this.showFlag();
            };
        }
    },

    // 添加返回记忆训练的方法
    returnToMemory() {
        // 隐藏学习页面
        const studySection = document.getElementById('study-section');
        if (studySection) studySection.style.display = 'none';

        // 显示记忆训练主界面
        const memorySection = document.getElementById('memory-section');
        if (memorySection) memorySection.style.display = 'block';

        // 更新当前区域状态
        currentSection = 'memory';

        // 更新导航按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const memoryBtn = document.getElementById('memoryBtn');
        if (memoryBtn) memoryBtn.classList.add('active');

        // 重新显示记忆训练内容
        this.showMemory();
    },

    showFlag() {
        if (this.currentIndex >= this.currentFlags.length) {
            this.showComplete();
            return;
        }

        const flagCode = this.currentFlags[this.currentIndex];
        
        // 确保allCountries已加载
        if (!allCountries || allCountries.length === 0) {
            console.warn('国家数据未加载，尝试重新加载...');
            // 重新加载国家数据
            this.loadCountriesData().then(() => {
                this.showFlag(); // 重新尝试显示
            });
            return;
        }
        
        const countryInfo = allCountries.find(c => c.code === flagCode);
        const flagProgress = this.progress[flagCode] || {};

        const studyContent = document.getElementById('studyContent');
        if (!studyContent) return;

        // 使用学习国旗模板
        const studyTemplate = document.getElementById('study-flag-template');
        if (studyTemplate) {
            const templateContent = studyTemplate.content.cloneNode(true);

            // 先设置模板内容，再插入 DOM（避免DocumentFragment被清空后无法查询）
            const sessionType = templateContent.querySelector('.session-type');
            if (sessionType) sessionType.textContent = this.currentSession.sessionType;

            const progressText = templateContent.querySelector('.progress-text');
            if (progressText) progressText.textContent = `${this.currentIndex + 1}/${this.currentFlags.length}`;

            const sessionTime = templateContent.querySelector('.session-time');
            if (sessionTime) sessionTime.textContent = this.getSessionTime();

            const progressFill = templateContent.querySelector('.progress-fill');
            if (progressFill) progressFill.style.width = `${((this.currentIndex + 1) / this.currentFlags.length) * 100}%`;

            const flagImg = templateContent.querySelector('.study-flag-img');
            if (flagImg) {
                flagImg.src = `pics/${flagCode}.png`;
                flagImg.alt = countryInfo?.nameCN || flagCode.toUpperCase();
                flagImg.onerror = function() {
                    this.src = `https://via.placeholder.com/300x200/f0f0f0/999?text=${flagCode.toUpperCase()}`;
                };
            }

            const learnedIndicator = templateContent.querySelector('.learned-indicator');
            if (learnedIndicator && flagProgress.learned) {
                learnedIndicator.classList.add('show');
            }

            const countryNameCN = templateContent.querySelector('.country-name-cn');
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
                placeholderCN.style.cssText = 'background:#e5e7eb; border-radius:6px; margin: 4px 0; margin-left:auto; margin-right:auto;';
                countryNameCN.parentNode.insertBefore(placeholderCN, countryNameCN.nextSibling);
            }

            const countryNameEN = templateContent.querySelector('.country-name-en');
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
                placeholderEN.style.cssText = 'background:#f3f4f6; border-radius:6px; margin: 2px 0 6px; margin-left:auto; margin-right:auto;';
                countryNameEN.parentNode.insertBefore(placeholderEN, countryNameEN.nextSibling);
            }

            // 固定名称区域高度，避免显示/隐藏时按钮位置跳动
            const namesContainer = countryNameCN ? countryNameCN.parentNode : null;
            if (namesContainer && namesContainer.style) {
                // 保留足够空间容纳两行文字
                namesContainer.style.minHeight = '64px';
            }

            const countryContinent = templateContent.querySelector('.country-continent');
            if (countryContinent) {
                if (countryInfo) {
                    // 翻译大洲名称
                    countryContinent.textContent = this.getLocalizedContinentName(countryInfo.continent);
                } else {
                    countryContinent.textContent = '';
                }
            }

            // 绑定按钮事件（不认识 / 认识）
            const prevBtn = templateContent.querySelector('.study-btn-prev');
            const nextBtn = templateContent.querySelector('.study-btn-next');

            // 修改按钮文本
            const dontKnowText = i18n.t('memory.dontKnow');
            const knowText = i18n.t('memory.know');

            if (prevBtn) prevBtn.textContent = dontKnowText;
            if (nextBtn) nextBtn.textContent = knowText;

            const revealAndAdvance = (recognized) => {
                // 防止重复点击
                if (prevBtn) prevBtn.disabled = true;
                // 显示名称
                if (countryNameCN) {
                    countryNameCN.style.display = '';
                    const plc = countryNameCN.parentNode.querySelector('.name-placeholder-cn');
                    if (plc) plc.style.display = 'none';
                }
                if (countryNameEN) {
                    countryNameEN.style.display = '';
                    const ple = countryNameEN.parentNode.querySelector('.name-placeholder-en');
                    if (ple) ple.style.display = 'none';
                }
                // 仅当认识时记录为已学习，并隐藏“不认识”按钮
                if (recognized) {
                    if (prevBtn) prevBtn.style.display = 'none';
                    this.markCurrentFlagLearned();
                }
                // 跳转逻辑：两种情况都改为手动点击“下一个”
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

            if (prevBtn) prevBtn.onclick = () => revealAndAdvance(false);
            if (nextBtn) nextBtn.onclick = () => revealAndAdvance(true);

            // 在“不认识”后只保留“下一个 →”按钮的样式处理
            const hideDontKnowButton = () => {
                if (prevBtn) {
                    prevBtn.style.display = 'none';
                }
            };
            // 当用户点击“不认识”后隐藏左侧按钮
            if (prevBtn) {
                const originalHandler = prevBtn.onclick;
                prevBtn.onclick = () => {
                    originalHandler && originalHandler();
                    hideDontKnowButton();
                };
            }

            // 最后插入到页面
            studyContent.innerHTML = '';
            studyContent.appendChild(templateContent);

            // 调整占位条的尺寸以匹配名称的字体大小和宽度
            const adjustPlaceholder = (nameEl, placeholderSelector) => {
                if (!nameEl) return;
                const placeholder = nameEl.parentNode.querySelector(placeholderSelector);
                if (!placeholder) return;
                // 暂时显示但不可见以测量宽度
                const prevDisplay = nameEl.style.display;
                const prevVisibility = nameEl.style.visibility;
                nameEl.style.visibility = 'hidden';
                nameEl.style.display = 'block';
                // 强制回流
                void nameEl.offsetWidth;
                const cs = window.getComputedStyle(nameEl);
                const widthPx = nameEl.offsetWidth || nameEl.scrollWidth || 0;
                const fontSize = cs.fontSize || '16px';
                // 还原
                nameEl.style.display = prevDisplay || 'none';
                nameEl.style.visibility = prevVisibility || '';
                // 应用到占位条
                placeholder.style.height = fontSize;
                if (widthPx > 0) {
                    const shortened = Math.max(40, Math.round(widthPx * 0.6));
                    placeholder.style.width = shortened + 'px';
                } else {
                    // 回退宽度
                    placeholder.style.width = '60%';
                }
            };
            adjustPlaceholder(countryNameCN, '.name-placeholder-cn');
            adjustPlaceholder(countryNameEN, '.name-placeholder-en');
        }
    },

    // 添加加载国家数据的方法
    async loadCountriesData() {
        try {
            const response = await fetch('countries_un.json');
            if (response.ok) {
                const data = await response.json();
                allCountries = data.countries;
                console.log(`成功加载 ${allCountries.length} 个国家数据`);
                return true;
            } else {
                throw new Error('无法加载countries_un.json');
            }
        } catch (error) {
            console.log('使用示例数据:', error.message);
            allCountries = this.generateSampleData();
            return true;
        }
    },

    // 生成示例数据的方法
    generateSampleData() {
        return [
            { code: "cn", nameCN: "中国", nameEN: "China", continent: "亚洲", styles: ["星星", "纯色"] },
            { code: "us", nameCN: "美国", nameEN: "United States", continent: "北美洲", styles: ["星星", "水平条纹"] },
            { code: "gb", nameCN: "英国", nameEN: "United Kingdom", continent: "欧洲", styles: ["联合杰克", "十字"] },
            { code: "jp", nameCN: "日本", nameEN: "Japan", continent: "亚洲", styles: ["太阳", "纯色"] },
            { code: "de", nameCN: "德国", nameEN: "Germany", continent: "欧洲", styles: ["水平条纹", "纯色"] },
            { code: "fr", nameCN: "法国", nameEN: "France", continent: "欧洲", styles: ["垂直条纹", "纯色"] },
            { code: "br", nameCN: "巴西", nameEN: "Brazil", continent: "南美洲", styles: ["星星", "几何图形", "复杂徽章"] },
            { code: "au", nameCN: "澳大利亚", nameEN: "Australia", continent: "大洋洲", styles: ["联合杰克", "星星"] },
            { code: "za", nameCN: "南非", nameEN: "South Africa", continent: "非洲", styles: ["水平条纹", "几何图形", "泛非色彩"] },
            { code: "eg", nameCN: "埃及", nameEN: "Egypt", continent: "非洲", styles: ["水平条纹", "复杂徽章", "泛阿拉伯色彩"] },
            { code: "in", nameCN: "印度", nameEN: "India", continent: "亚洲", styles: ["水平条纹", "纯色"] },
            { code: "ca", nameCN: "加拿大", nameEN: "Canada", continent: "北美洲", styles: ["植物", "垂直条纹"] },
            { code: "mx", nameCN: "墨西哥", nameEN: "Mexico", continent: "北美洲", styles: ["垂直条纹", "复杂徽章", "动物", "植物"] },
            { code: "ar", nameCN: "阿根廷", nameEN: "Argentina", continent: "南美洲", styles: ["水平条纹", "太阳"] },
            { code: "it", nameCN: "意大利", nameEN: "Italy", continent: "欧洲", styles: ["垂直条纹", "纯色"] },
            { code: "es", nameCN: "西班牙", nameEN: "Spain", continent: "欧洲", styles: ["水平条纹", "复杂徽章"] },
            { code: "ru", nameCN: "俄罗斯", nameEN: "Russia", continent: "欧洲", styles: ["水平条纹", "纯色"] },
            { code: "kr", nameCN: "韩国", nameEN: "South Korea", continent: "亚洲", styles: ["水平条纹"] },
            { code: "sa", nameCN: "沙特阿拉伯", nameEN: "Saudi Arabia", continent: "亚洲", styles: ["水平条纹", "泛阿拉伯色彩"] },
            { code: "nz", nameCN: "新西兰", nameEN: "New Zealand", continent: "大洋洲", styles: ["联合杰克", "星星"] }
        ];
    },



    nextFlag() {
        // 在切到下一张之前，记录当前国旗为已学习
        this.markCurrentFlagLearned();
        this.currentIndex++;
        this.showFlag();
    },

    previousFlag() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = 0;
        }
        this.showFlag();
    },

    // 标记当前展示的国旗为“已学习”，并更新概览
    markCurrentFlagLearned() {
        if (!this.currentFlags || this.currentIndex < 0 || this.currentIndex >= this.currentFlags.length) return;
        const code = this.currentFlags[this.currentIndex];
        const now = new Date().toISOString();

        const existing = this.progress[code] || {};
        const wasLearned = !!existing.learned;

        this.progress[code] = {
            learned: true,
            firstLearnedAt: existing.firstLearnedAt || now,
            lastLearnedAt: now,
            learnCount: (existing.learnCount || 0) + 1
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
    },

    showComplete() {
        const studyContent = document.getElementById('studyContent');
        if (!studyContent) return;
        
        // 在结束前对最后一张进行学习标记（若用户停在最后一张直接结束）
        this.markCurrentFlagLearned();

        const sessionTime = this.getSessionTime();
        const studiedCount = this.currentSession.flagsStudied;

        // 更新分类进度
        if (this.currentCategory) {
            this.updateCategoryProgress(this.currentCategory);
        }

        // 使用学习完成模板
        const completeTemplate = document.getElementById('study-complete-template');
        if (completeTemplate) {
            const templateContent = completeTemplate.content.cloneNode(true);

            // 先设置模板内容，再插入 DOM

            const totalLearned = templateContent.querySelector('.total-learned');
            if (totalLearned) totalLearned.textContent = this.currentFlags.length;

            const newLearned = templateContent.querySelector('.new-learned');
            if (newLearned) newLearned.textContent = studiedCount;

            const sessionTimeEl = templateContent.querySelector('.session-time');
            if (sessionTimeEl) sessionTimeEl.textContent = sessionTime;

            // 绑定按钮事件
            const returnHomeBtn = templateContent.querySelector('.return-home-btn');
            const continueStudyBtn = templateContent.querySelector('.continue-study-btn');

            if (returnHomeBtn) returnHomeBtn.onclick = () => this.returnToMemory();
            if (continueStudyBtn) continueStudyBtn.onclick = () => this.continueToNextCategory();

            // 最后插入
            studyContent.innerHTML = '';
            studyContent.appendChild(templateContent);

            // 调用翻译更新
            setTimeout(() => {
                updateMemoryModuleText();
                updateLanguage(currentLang);
            }, 50);
        }

        // 移除自动返回，等待用户操作
    },

    getSessionTime() {
        if (!this.currentSession.startTime) return '00:00';
        const elapsed = Math.floor((Date.now() - this.currentSession.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    getTodayStudiedCount() {
        const today = new Date().toDateString();
        return Object.values(this.progress).filter(p => 
            p.learned && p.firstLearnedAt && 
            new Date(p.firstLearnedAt).toDateString() === today
        ).length;
    },

    // 智能学习系统
    startSmartLearning() {
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
    },

    // 智能选择最佳分类
    selectBestCategory() {
        const categories = Object.entries(this.categories);
        
        // 1. 优先选择未完成的分类
        const incompleteCategories = categories.filter(([name, data]) => {
            const progress = this.getCategoryProgress(name);
            return progress.status !== 'completed';
        });

        if (incompleteCategories.length > 0) {
            // 按进度排序，优先选择进度较低的分类
            incompleteCategories.sort((a, b) => {
                const aProgress = this.getCategoryProgress(a[0]);
                const bProgress = this.getCategoryProgress(b[0]);

                // 选择进度较低的
                const aProgressPercent = aProgress.learnedCount / a[1].countries.length;
                const bProgressPercent = bProgress.learnedCount / b[1].countries.length;
                return aProgressPercent - bProgressPercent;
            });
            
            return incompleteCategories[0][0];
        }

        // 2. 所有分类都已完成，选择需要复习的分类
        const reviewCategories = categories.filter(([name, data]) => {
            const progress = this.getCategoryProgress(name);
            const daysSinceLastStudy = this.getDaysSinceLastStudy(name);
            return daysSinceLastStudy > 7; // 超过7天未学习需要复习
        });

        if (reviewCategories.length > 0) {
            // 选择最久未学习的分类
            reviewCategories.sort((a, b) => {
                const aDays = this.getDaysSinceLastStudy(a[0]);
                const bDays = this.getDaysSinceLastStudy(b[0]);
                return bDays - aDays;
            });
            
            return reviewCategories[0][0];
        }

        // 3. 所有分类都已完成且无需复习，返回null
        return null;
    },

    // 继续到下一个推荐分类（排除当前分类）
    continueToNextCategory() {
        const current = this.currentCategory;
        const categories = Object.entries(this.categories);

        // 1) 未完成的分类，排除当前
        const incomplete = categories.filter(([name]) => {
            if (name === current) return false;
            const progress = this.getCategoryProgress(name);
            return progress.status !== 'completed';
        });

        if (incomplete.length > 0) {
            // 按进度排序，优先选择进度较低的分类
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

        // 2) 都完成了，则挑需要复习的（>7天未学习），排除当前
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

        // 3) 没有下一个分类
        this.showMessage('🎉 所有分类均已完成，暂无需要继续的分类');
        this.returnToMemory();
    },

    // 获取分类进度
    getCategoryProgress(categoryName) {
        if (!this.categoryProgress[categoryName]) {
            const category = this.categories[categoryName];
            const learnedCount = category.countries.filter(code => this.progress[code]?.learned).length;
            
            this.categoryProgress[categoryName] = {
                status: learnedCount === category.countries.length ? 'completed' : 'in_progress',
                learnedCount: learnedCount,
                totalCount: category.countries.length,
                lastStudied: null,
                studyCount: 0
            };
        }
        
        return this.categoryProgress[categoryName];
    },

    // 获取距离上次学习的天数
    getDaysSinceLastStudy(categoryName) {
        const progress = this.getCategoryProgress(categoryName);
        if (!progress.lastStudied) return 999;
        
        const lastStudy = new Date(progress.lastStudied);
        const now = new Date();
        const diffTime = Math.abs(now - lastStudy);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    },

    // 记录学习会话
    recordLearningSession(categoryName) {
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
            sessionType: '智能学习'
        });
        
        // 只保留最近50条历史记录
        if (this.learningState.sessionHistory.length > 50) {
            this.learningState.sessionHistory = this.learningState.sessionHistory.slice(-50);
        }
        
        // 保存学习状态
        this.saveLearningState();
    },

    // 更新分类进度（在学习完成后调用）
    updateCategoryProgress(categoryName) {
        const category = this.categories[categoryName];
        const learnedCount = category.countries.filter(code => this.progress[code]?.learned).length;
        
        const progress = this.getCategoryProgress(categoryName);
        progress.learnedCount = learnedCount;
        progress.status = learnedCount === category.countries.length ? 'completed' : 'in_progress';
        
        this.saveCategoryProgress();
    },

    // 保存分类进度
    saveCategoryProgress() {
        try {
            localStorage.setItem('categoryProgress', JSON.stringify(this.categoryProgress));
        } catch (error) {
            console.warn('分类进度保存失败');
        }
    },

    // 保存学习状态
    saveLearningState() {
        try {
            localStorage.setItem('learningState', JSON.stringify(this.learningState));
        } catch (error) {
            console.warn('学习状态保存失败');
        }
    },

    // 更新开始学习按钮状态
    updateStartLearningButton() {
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
                // 获取本地化的分类名称
                const localizedCategory = this.getLocalizedCategoryName(selectedCategory, this.categories[selectedCategory]);
                if (learningHint) learningHint.textContent = i18n.t('memory.continueCategory', {category: localizedCategory, learned: progress.learnedCount, total: progress.totalCount});
            } else {
                // 开始新的学习
                startBtn.className = 'start-learning-btn';
                if (btnIcon) btnIcon.textContent = '🚀';
                if (btnText) btnText.textContent = i18n.t('memory.startButton');
                // 获取本地化的分类名称
                const localizedCategory = this.getLocalizedCategoryName(selectedCategory, this.categories[selectedCategory]);
                if (learningHint) learningHint.textContent = i18n.t('memory.systemRecommendation', {category: localizedCategory});
            }
        }
    },

    // 检查每日进度
    checkDailyProgress() {
        // 可以在这里添加每日学习目标的检查
        const today = new Date().toDateString();
        const todayProgress = this.learningState.sessionHistory.filter(
            session => new Date(session.startTime).toDateString() === today
        );

        // 如果今天还没有学习，可以显示提示
        if (todayProgress.length === 0) {
            console.log('今天还没有开始学习，加油！');
        }
    },

    showMessage(message) {
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
    },

    saveProgress() {
        try {
            localStorage.setItem('enhancedMemoryProgress', JSON.stringify(this.progress));
        } catch (error) {
            console.warn('记忆进度保存失败');
        }
    },

    shuffle(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // 清除学习进度功能
    clearMemoryProgress() {
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

        // 使用 i18n 获取翻译文本
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

        // 绑定确认按钮事件
        const confirmBtn = document.getElementById('confirmClearBtn');
        const cancelBtn = document.getElementById('cancelClearBtn');

        const handleConfirm = () => {
            // 执行清除操作
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
                    sessionHistory: []
                };
                this.achievements = [];

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

            // 移除确认对话框
            document.body.removeChild(confirmDialog);
        };

        const handleCancel = () => {
            // 移除确认对话框
            document.body.removeChild(confirmDialog);
        };

        confirmBtn.onclick = handleConfirm;
        cancelBtn.onclick = handleCancel;

        // 点击背景也可以关闭
        confirmDialog.onclick = (e) => {
            if (e.target === confirmDialog) {
                handleCancel();
            }
        };

        // ESC键关闭
        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscKey);
            }
        };
        document.addEventListener('keydown', handleEscKey);
    },

    // 获取当前学习状态
    getCurrentState() {
        return {
            currentCategory: this.learningState.currentCategory,
            lastStudiedCategory: this.learningState.lastStudiedCategory,
            sessionHistory: this.learningState.sessionHistory,
            currentSection: typeof currentSection !== 'undefined' ? currentSection : 'memory'
        };
    },

    // 获取分类数据
    getCategoryData(categoryName) {
        return this.categories[categoryName] || null;
    },

    // 显示分类学习页面（如果需要的话）
    showCategoryLearning(categoryName) {
        // 直接显示预览页面，不开始学习会话
        this.currentCategory = categoryName;
        this.showPreviewPage();
    }
};

// 暴露全局函数
window.checkAnswer = checkAnswer;
window.EnhancedMemorySystem = EnhancedMemorySystem;

// 暴露 i18n 系统用于测试和调试
window.i18n = i18n;
window.t = t;

// 简单的国际化系统测试函数
window.testI18n = function() {
    console.group('🌐 现代化国际化系统测试');

    // 测试基本翻译功能
    console.log('当前语言:', i18n.getCurrentLanguage());
    console.log('站点名称:', t('siteName'));
    console.log('欢迎标题:', t('welcome.title'));
    console.log('测验问题模板:', t('quiz.question', {current: 1, total: 10}));

    // 测试国家名称本地化
    const testCountry = allCountries.find(c => c.code === 'cn');
    if (testCountry) {
        console.log('测试国家名称 (中文):', i18n.getCountryName(testCountry));
    }

    // 测试大洲名称本地化
    console.log('亚洲:', i18n.getContinentName('asia'));
    console.log('欧洲:', i18n.getContinentName('europe'));

    // 测试特征名称本地化
    console.log('星星特征:', i18n.getFeatureName('星星'));
    console.log('十字特征:', i18n.getFeatureName('十字'));

    // 测试语言切换
    console.log('切换到英文...');
    i18n.setLanguage('en');
    console.log('Site name (EN):', t('siteName'));
    console.log('Welcome title (EN):', t('welcome.title'));

    if (testCountry) {
        console.log('Test country name (EN):', i18n.getCountryName(testCountry));
    }

    console.log('Asia (EN):', i18n.getContinentName('asia'));
    console.log('Stars feature (EN):', i18n.getFeatureName('星星'));

    // 切换回中文
    console.log('切换回中文...');
    i18n.setLanguage('zh');
    console.log('站点名称 (ZH):', t('siteName'));

    console.groupEnd();
    console.log('✅ 国际化系统测试完成！可在控制台查看详细结果。');

    // 返回测试结果
    return {
        currentLanguage: i18n.getCurrentLanguage(),
        isLoaded: i18n.loaded,
        availableLanguages: Object.keys(i18n.translations),
        sampleTranslations: {
            siteName: t('siteName'),
            welcomeTitle: t('welcome.title'),
            quizQuestion: t('quiz.question', {current: 1, total: 10})
        }
    };
};

// 国际化演示功能 - 显示国旗卡片更新
window.demoI18nFlags = function() {
    if (!allCountries || allCountries.length === 0) {
        console.warn('国家数据尚未加载，请稍后再试');
        return;
    }

    console.group('🏳️ 国旗卡片国际化演示');

    // 获取前几个国家作为演示
    const demoCountries = allCountries.slice(0, 3);

    console.log('当前语言:', i18n.getCurrentLanguage());
    demoCountries.forEach((country, index) => {
        console.log(`国家 ${index + 1}:`, {
            code: country.code,
            name: i18n.getCountryName(country),
            continent: i18n.getContinentName(country.continent),
            features: country.styles.slice(0, 2).map(style => i18n.getFeatureName(style))
        });
    });

    // 演示语言切换对国旗信息的影响
    console.log('切换到英文后...');
    i18n.setLanguage('en');
    demoCountries.forEach((country, index) => {
        console.log(`Country ${index + 1}:`, {
            code: country.code,
            name: i18n.getCountryName(country),
            continent: i18n.getContinentName(country.continent),
            features: country.styles.slice(0, 2).map(style => i18n.getFeatureName(style))
        });
    });

    // 切换回中文
    i18n.setLanguage('zh');
    console.log('已切换回中文');

    console.groupEnd();
    console.log('🎯 国旗卡片国际化演示完成！界面上的所有国旗信息都应该已更新。');

    return {
        currentLanguage: i18n.getCurrentLanguage(),
        demoCountries: demoCountries.map(country => ({
            code: country.code,
            name: i18n.getCountryName(country),
            continent: i18n.getContinentName(country.continent),
            features: country.styles.slice(0, 2).map(style => i18n.getFeatureName(style))
        }))
    };
};

// 添加快速语言切换功能
window.quickLanguageSwitch = function(lang) {
    if (lang === 'zh' || lang === 'en') {
        const success = i18n.setLanguage(lang);
        if (success) {
            console.log(`✅ 已切换到${lang === 'zh' ? '中文' : '英文'}`);

            // 如果在浏览模式，刷新国旗显示
            if (currentSection === 'browse' && filteredCountries.length > 0) {
                displayFlags();
                console.log('🔄 国旗显示已刷新');
            }

            // 如果在记忆训练模式，重新渲染分类卡片
            if (currentSection === 'memory' && window.EnhancedMemorySystem) {
                setTimeout(() => {
                    console.log('🔄 重新渲染记忆训练分类卡片');
                    window.EnhancedMemorySystem.renderCategories();
                    window.EnhancedMemorySystem.updateStartLearningButton();

                    // 额外翻译记忆训练模板内容
                    if (window.i18n && window.i18n.updateDOM) {
                        window.i18n.updateDOM();
                    }

                    // 如果有记忆训练模块的翻译函数，也调用它
                    if (typeof updateLanguage === 'function') {
                        updateLanguage(lang);
                    }
                }, 100);
            }

            // 强制更新所有动态内容
            setTimeout(() => {
                updateDynamicContent();
                console.log('🔄 动态内容已更新');
            }, 100);
        } else {
            console.error('❌ 语言切换失败');
        }
    } else {
        console.error('❌ 不支持的语言代码，请使用 "zh" 或 "en"');
    }
};

// 测试国际化的修复效果
window.testI18nFixes = function() {
    console.group('🔧 测试国际化修复效果');

    console.log('📋 当前状态:');
    console.log('- 当前语言:', i18n.getCurrentLanguage());
    console.log('- i18n 加载状态:', i18n.loaded);
    console.log('- 当前页面区域:', currentSection);

    // 测试基本翻译功能
    console.log('\n🌐 测试基本翻译:');
    console.log('- 站点名称:', i18n.t('siteName'));
    console.log('- 测验问题:', i18n.t('quiz.flagQuestion'));
    console.log('- 记忆训练标题:', i18n.t('memory.overviewTitle'));

    // 测试语言切换
    console.log('\n🔄 测试语言切换:');
    console.log('切换到英文...');
    i18n.setLanguage('en');

    // 检查DOM更新
    setTimeout(() => {
        console.log('检查DOM更新效果:');
        const title = document.querySelector('title');
        if (title) console.log('- 页面标题:', title.textContent);

        const quizQuestion = document.querySelector('#quiz-game .question-text');
        if (quizQuestion) console.log('- 测验问题:', quizQuestion.textContent);

        const memoryTitle = document.querySelector('#memory-section h2');
        if (memoryTitle) console.log('- 记忆训练标题:', memoryTitle.textContent);

        console.log('切换回中文...');
        i18n.setLanguage('zh');

        setTimeout(() => {
            const titleAfter = document.querySelector('title');
            if (titleAfter) console.log('- 页面标题 (中文):', titleAfter.textContent);

            console.log('\n✅ 国际化修复测试完成！');
            console.log('💡 如果所有文本都正确更新，说明修复成功');

            console.groupEnd();
        }, 200);
    }, 200);

    return {
        currentLanguage: i18n.getCurrentLanguage(),
        isLoaded: i18n.loaded,
        currentSection: currentSection,
        translations: {
            siteName: i18n.t('siteName'),
            quizQuestion: i18n.t('quiz.flagQuestion'),
            memoryTitle: i18n.t('memory.overviewTitle')
        }
    };
};

// 测试记忆训练页面的语言切换
window.testMemoryI18n = function() {
    console.group('🧠 测试记忆训练页面语言切换');

    // 确保在记忆训练页面
    if (currentSection !== 'memory') {
        console.log('📝 切换到记忆训练页面...');
        showSection('memory');

        // 等待页面加载完成
        setTimeout(() => {
            performMemoryI18nTest();
        }, 500);
    } else {
        performMemoryI18nTest();
    }

    function performMemoryI18nTest() {
        console.log('📋 当前状态:');
        console.log('- 当前语言:', i18n.getCurrentLanguage());
        console.log('- i18n 加载状态:', i18n.loaded);

        // 测试记忆训练相关的翻译
        console.log('\n🧠 测试记忆训练翻译:');
        console.log('- 概览标题:', i18n.t('memory.overviewTitle'));
        console.log('- 开始按钮:', i18n.t('memory.startButton'));
        console.log('- 清除进度:', i18n.t('memory.clearProgress'));
        console.log('- 系统提示:', i18n.t('memory.systemSmartHint'));

        // 检查当前页面的元素
        console.log('\n🔍 检查当前页面元素:');
        const startBtn = document.getElementById('beginStudyBtn');
        if (startBtn) {
            console.log('- 开始学习按钮:', startBtn.textContent);
        }

        const clearBtn = document.querySelector('button[onclick*="clearProgress"]');
        if (clearBtn) {
            console.log('- 清除进度按钮:', clearBtn.textContent);
        }

        const hints = document.querySelectorAll('.learning-hint, .hint');
        console.log('- 提示文本数量:', hints.length);
        hints.forEach((hint, index) => {
            if (index < 2) {
                console.log(`  提示 ${index + 1}: ${hint.textContent}`);
            }
        });

        const categoryCards = document.querySelectorAll('.category-card');
        console.log('- 分类卡片数量:', categoryCards.length);
        categoryCards.forEach((card, index) => {
            if (index < 3) {
                const title = card.querySelector('.category-title');
                if (title) {
                    console.log(`  卡片 ${index + 1} 标题: ${title.textContent}`);
                }
            }
        });

        // 测试语言切换
        console.log('\n🔄 测试语言切换到英文...');
        i18n.setLanguage('en');

        setTimeout(() => {
            console.log('英文模式下的元素:');
            if (startBtn) console.log('- 开始学习按钮:', startBtn.textContent);
            if (clearBtn) console.log('- 清除进度按钮:', clearBtn.textContent);

            categoryCards.forEach((card, index) => {
                if (index < 2) {
                    const title = card.querySelector('.category-title');
                    if (title) {
                        console.log(`  卡片 ${index + 1} 标题: ${title.textContent}`);
                    }
                }
            });

            // 切换回中文
            console.log('\n🔄 切换回中文...');
            i18n.setLanguage('zh');

            setTimeout(() => {
                console.log('中文模式下的元素:');
                if (startBtn) console.log('- 开始学习按钮:', startBtn.textContent);
                if (clearBtn) console.log('- 清除进度按钮:', clearBtn.textContent);

                categoryCards.forEach((card, index) => {
                    if (index < 2) {
                        const title = card.querySelector('.category-title');
                        if (title) {
                            console.log(`  卡片 ${index + 1} 标题: ${title.textContent}`);
                        }
                    }
                });

                console.log('\n✅ 记忆训练页面语言切换测试完成！');
                console.log('💡 如果所有元素都正确更新了中英文，说明修复成功');
                console.groupEnd();
            }, 300);
        }, 300);
    }

    return {
        currentLanguage: i18n.getCurrentLanguage(),
        currentSection: currentSection,
        isLoaded: i18n.loaded,
        memoryTranslations: {
            overviewTitle: i18n.t('memory.overviewTitle'),
            startButton: i18n.t('memory.startButton'),
            clearProgress: i18n.t('memory.clearProgress'),
            systemHint: i18n.t('memory.systemSmartHint')
        }
    };
};

// 测试国旗卡片标签显示
window.testFlagCardLabels = function() {
    console.group('🏳️ 测试国旗卡片标签显示');

    // 检查国旗卡片中的标签
    const flagCards = document.querySelectorAll('.flag-card');
    console.log(`找到 ${flagCards.length} 个国旗卡片`);

    if (flagCards.length === 0) {
        console.log('⚠️ 没有找到国旗卡片，请先进入浏览模式并加载国旗数据');
        console.groupEnd();
        return { cardCount: 0, currentLanguage: i18n.getCurrentLanguage() };
    }

    flagCards.forEach((card, index) => {
        if (index >= 3) return; // 只显示前3个卡片

        console.log(`\n国旗卡片 ${index + 1}:`);

        const continentTag = card.querySelector('.continent-tag');
        if (continentTag) {
            console.log(`  大洲标签: "${continentTag.textContent}"`);
            console.log(`  数据属性: ${continentTag.getAttribute('data-continent')}`);
        }

        const styleTags = card.querySelectorAll('.style-tag');
        console.log(`  特征标签数量: ${styleTags.length}`);
        styleTags.forEach((tag, tagIndex) => {
            if (tagIndex < 3) { // 只显示前3个特征
                console.log(`    特征 ${tagIndex + 1}: "${tag.textContent}" (数据属性: ${tag.getAttribute('data-feature')})`);
            }
        });
    });

    console.log('\n🔄 测试翻译函数...');

    // 测试翻译函数
    console.log('大洲翻译测试:');
    console.log(`  "欧洲" -> "${i18n.getContinentName('欧洲')}"`);
    console.log(`  "Europe" -> "${i18n.getContinentName('Europe')}"`);
    console.log(`  "asia" -> "${i18n.getContinentName('asia')}"`);

    console.log('特征翻译测试:');
    console.log(`  "纯色" -> "${i18n.getFeatureName('纯色')}"`);
    console.log(`  "Solid" -> "${i18n.getFeatureName('Solid')}"`);
    console.log(`  "stars" -> "${i18n.getFeatureName('stars')}"`);

    console.log('\n🔄 测试语言切换对标签的影响...');

    // 切换到英文
    i18n.setLanguage('en');
    setTimeout(() => {
        console.log('英文模式下的标签:');
        flagCards.forEach((card, index) => {
            if (index >= 3) return;
            const continentTag = card.querySelector('.continent-tag');
            if (continentTag) {
                console.log(`  卡片 ${index + 1} 大洲: "${continentTag.textContent}"`);
            }
        });

        // 切换回中文
        i18n.setLanguage('zh');
        setTimeout(() => {
            console.log('中文模式下的标签:');
            flagCards.forEach((card, index) => {
                if (index >= 3) return;
                const continentTag = card.querySelector('.continent-tag');
                if (continentTag) {
                    console.log(`  卡片 ${index + 1} 大洲: "${continentTag.textContent}"`);
                }
            });

            console.log('\n✅ 国旗卡片标签测试完成！');
            console.log('💡 如果标签显示正常且没有显示 "continents." 或 "features." 前缀，说明修复成功');
            console.groupEnd();
        }, 300);
    }, 300);

    return {
        cardCount: flagCards.length,
        currentLanguage: i18n.getCurrentLanguage(),
        sampleCards: Array.from(flagCards.slice(0, 3)).map(card => ({
            continent: card.querySelector('.continent-tag')?.textContent,
            continentData: card.querySelector('.continent-tag')?.getAttribute('data-continent'),
            features: Array.from(card.querySelectorAll('.style-tag')).slice(0, 3).map(tag => tag.textContent)
        }))
    };
};

// 国际化功能
async function loadI18nData() {
    try {
        console.log('Loading i18n data...');
        // 添加缓存破坏参数
        const response = await fetch('i18n.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const translations = await response.json();
        console.log('i18n data loaded successfully:', translations);

        // 设置翻译数据到新的 i18n 系统
        i18n.setTranslations(translations);

        // 恢复语言偏好
        const savedLang = localStorage.getItem('preferredLanguage') ||
                        sessionStorage.getItem('currentLanguage') ||
                        'zh';
        console.log(`Setting language to: ${savedLang}`);
        i18n.setLanguage(savedLang);

        // 订阅语言变化，自动更新界面
        i18n.subscribe((newLang) => {
            console.log(`Language changed to: ${newLang}`);

            // 更新兼容性变量
            currentLang = newLang;
            i18nData = translations;

            // 自动更新所有 DOM 元素
            i18n.updateDOM();

            // 更新页面标题
            const title = document.querySelector('title');
            if (title) {
                title.textContent = i18n.t('siteName');
            }

            // 更新动态内容
            updateDynamicContent();
        });

        // 立即执行一次更新
        i18n.updateDOM();

        // 更新页面标题
        const title = document.querySelector('title');
        if (title) {
            title.textContent = i18n.t('siteName');
        }

        // 更新兼容性变量
        currentLang = savedLang;
        i18nData = translations;

        console.log('Modern i18n system initialized successfully');
    } catch (error) {
        console.error('Failed to load i18n data:', error);
    }
}

// 更新动态内容的函数
function updateDynamicContent() {
    if (!i18n.loaded) {
        console.warn('i18n not loaded, skipping dynamic content update');
        return;
    }

    console.log('Updating dynamic content with new i18n system...');

    // 更新国旗显示中的国家名称
    document.querySelectorAll('.country-name').forEach(element => {
        const countryCode = element.getAttribute('data-country-code');
        if (countryCode && allCountries) {
            const country = allCountries.find(c => c.code === countryCode);
            if (country) {
                element.textContent = i18n.getCountryName(country);
            }
        }
    });

    // 更新国旗显示中的大洲标签 - 使用新的翻译映射
    document.querySelectorAll('.continent-tag').forEach(element => {
        const continent = element.getAttribute('data-continent');
        if (continent) {
            // 优先使用数据属性中的原始数据
            element.textContent = i18n.getContinentName(continent);
        } else {
            // 如果没有数据属性，尝试从当前文本翻译
            const currentText = element.textContent.trim();
            if (currentText && currentText.length > 0) {
                element.textContent = i18n.getContinentName(currentText);
            }
        }
    });

    // 更新国旗显示中的特征标签 - 使用新的翻译映射
    document.querySelectorAll('.style-tag').forEach(element => {
        const feature = element.getAttribute('data-feature');
        if (feature) {
            // 优先使用数据属性中的原始数据
            element.textContent = i18n.getFeatureName(feature);
        } else {
            // 如果没有数据属性，尝试从当前文本翻译
            const currentText = element.textContent.trim();
            if (currentText && currentText.length > 0) {
                element.textContent = i18n.getFeatureName(currentText);
            }
        }
    });

    // 如果正在运行quiz，更新问题文本
    const quizQuestionText = document.querySelector('#quiz-game .question-text');
    if (quizQuestionText) {
        quizQuestionText.textContent = i18n.t('quiz.flagQuestion');
    }

    // 更新错题显示中的标签
    const wrongAnswersSection = document.getElementById('wrong-answers-section');
    if (wrongAnswersSection && wrongAnswersSection.style.display !== 'none') {
        updateWrongAnswersContent();
    }

    // 更新测验选项中的国家名称
    document.querySelectorAll('#quiz-game .option-text').forEach(element => {
        const countryCode = element.getAttribute('data-country-code');
        if (countryCode && allCountries) {
            const country = allCountries.find(c => c.code === countryCode);
            if (country) {
                element.textContent = i18n.getCountryName(country);
            }
        }
    });

    // 更新记忆训练中的动态内容
    updateMemoryModuleText();

    // 更新所有带有数据属性的动态文本
    document.querySelectorAll('[data-i18n-dynamic]').forEach(element => {
        const key = element.getAttribute('data-i18n-dynamic');
        if (key) {
            element.textContent = i18n.t(key);
        }
    });

    console.log('Dynamic content update completed');
}

// 更新错题内容的函数
function updateWrongAnswersContent() {
    // 更新错题详情中的国家名称
    document.querySelectorAll('.wrong-answer-section .country-name').forEach(element => {
        const countryCode = element.getAttribute('data-country-code');
        if (countryCode && allCountries) {
            const country = allCountries.find(c => c.code === countryCode);
            if (country) {
                element.textContent = i18n.getCountryName(country);
            }
        }
    });

    // 更新错题详情中的答案文本（正确答案和错误答案）
    document.querySelectorAll('.wrong-answers-container .answer-text').forEach(element => {
        const countryCode = element.getAttribute('data-country-code');
        if (countryCode && allCountries) {
            const country = allCountries.find(c => c.code === countryCode);
            if (country) {
                element.textContent = i18n.getCountryName(country);
            }
        } else if (element.classList.contains('correct') || element.classList.contains('wrong')) {
            // 如果没有data-country-code属性，通过其他方式查找对应的国家
            // 首先尝试从相邻的元素中获取信息
            const wrongAnswerItem = element.closest('.wrong-answer-item');
            if (wrongAnswerItem) {
                // 查找相关的国家代码信息
                const flagImg = wrongAnswerItem.querySelector('img[src*="pics/"]');
                if (flagImg) {
                    const src = flagImg.getAttribute('src');
                    const match = src.match(/pics\/([a-z]{2})\.png/);
                    if (match) {
                        const country = allCountries.find(c => c.code === match[1]);
                        if (country) {
                            element.textContent = i18n.getCountryName(country);
                            element.setAttribute('data-country-code', country.code);
                        }
                    }
                }
            }
        }
    });

    // 更新各种标签文本
    const questionTypes = document.querySelectorAll('.wrong-question-type');
    questionTypes.forEach(element => {
        if (element.textContent.includes('看国旗选国家') || element.textContent.includes('Flag to Country')) {
            element.textContent = i18n.t('quiz.wrongAnswers.flagToCountry');
        } else if (element.textContent.includes('看国家选国旗') || element.textContent.includes('Country to Flag')) {
            element.textContent = i18n.t('quiz.wrongAnswers.countryToFlag');
        }
    });

    // 更新答案标签 - 优先处理data-i18n属性
    console.log('🔍 updateWrongAnswersContent - current language:', i18n.currentLanguage);
    console.log('🔍 updateWrongAnswersContent - correctAnswer translation:', i18n.t('quiz.wrongAnswers.correctAnswer'));
    console.log('🔍 updateWrongAnswersContent - yourAnswer translation:', i18n.t('quiz.wrongAnswers.yourAnswer'));

    // 首先处理所有带有data-i18n属性的元素
    const wrongAnswersContainer = document.getElementById('wrong-answers-container');
    if (wrongAnswersContainer) {
        const dataI18nElements = wrongAnswersContainer.querySelectorAll('[data-i18n]');
        console.log('🔍 Found data-i18n elements in wrong answers:', dataI18nElements.length);

        dataI18nElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = i18n.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
                console.log(`🔍 Updated ${key} to:`, translation);
            }
        });
    }

    // 备用方案：如果没有data-i18n属性或翻译失败，直接设置
    const correctLabels = document.querySelectorAll('.answer-label.correct');
    correctLabels.forEach(element => {
        if (!element.hasAttribute('data-i18n') || element.textContent.includes('正确答案')) {
            element.textContent = i18n.t('quiz.wrongAnswers.correctAnswer');
            console.log('🔍 Updated correct label to:', element.textContent);
        }
    });

    const wrongLabels = document.querySelectorAll('.answer-label.wrong');
    wrongLabels.forEach(element => {
        if (!element.hasAttribute('data-i18n') || element.textContent.includes('你的答案')) {
            element.textContent = i18n.t('quiz.wrongAnswers.yourAnswer');
            console.log('🔍 Updated wrong label to:', element.textContent);
        }
    });
}

// 更新页面语言 (已弃用，由新 i18n 系统接管)
function updateLanguage(lang) {
    console.warn('updateLanguage() is deprecated, using new i18n system instead');

    // 更新兼容性变量
    currentLang = lang;

    // 使用新的 i18n 系统进行更新
    if (i18n.loaded && i18n.translations[lang]) {
        i18n.setLanguage(lang);
        i18n.updateDOM();
        updateDynamicContent();

        // 更新动态生成的内容
        updateMemoryModuleText();
        updateWrongAnswersContent();
        updateQuizContent();
    }
}

// 更新quiz问题文本 (已弃用，使用新的 updateQuizContent)
function updateQuizQuestionText() {
    console.warn('updateQuizQuestionText is deprecated, using updateQuizContent instead');
    updateQuizContent();
}

// 更新测验内容的国际化
function updateQuizContent() {
    if (!i18n.loaded) {
        console.warn('i18n not loaded, skipping quiz content update');
        return;
    }

    // 更新测验问题文本
    const quizQuestionText = document.querySelector('#quiz-game .question-text');
    if (quizQuestionText) {
        quizQuestionText.textContent = i18n.t('quiz.flagQuestion');
    }

    // 更新测验选项中的国家名称
    document.querySelectorAll('#quiz-game .option-text').forEach(element => {
        const countryCode = element.getAttribute('data-country-code');
        if (countryCode && allCountries) {
            const country = allCountries.find(c => c.code === countryCode);
            if (country) {
                element.textContent = i18n.getCountryName(country);
            }
        }
    });
}

// 更新错题显示中的标签文本 (已弃用，使用新的 updateWrongAnswersContent)
function updateWrongAnswersLabels() {
    console.warn('updateWrongAnswersLabels is deprecated, using updateWrongAnswersContent instead');
    updateWrongAnswersContent();
}

// 修复翻译键显示问题的函数 - 双向翻译增强版本
function fixTranslationKeyElements() {
    console.log('开始修复所有翻译键问题...');

    // 获取当前语言
    const currentLang = i18n.currentLanguage;
    const isChineseMode = currentLang === 'zh';

    // 修复静态data-i18n属性
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && !element.textContent.includes('.')) {
            const translation = i18n.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        }
    });

    // 修复动态生成的翻译键
    const patterns = [
        { pattern: /continents\.\w+/g, type: 'continent' },
        { pattern: /features\.\w+/g, type: 'feature' },
        { pattern: /dataSources\.\w+/g, type: 'dataSource' },
        { pattern: /continents\.\w+\.\w+\.\w+/g, type: 'continentNested' },
        { pattern: /features\.\w+\.\w+\.\w+/g, type: 'featureNested' },
        { pattern: /memory\.\w+/g, type: 'memory' }
    ];

    // 查找所有包含翻译键的文本节点
    const textNodes = [];
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    let node;
    while (node = walker.nextNode()) {
        if (node.nodeValue && (node.nodeValue.includes('.') || node.nodeValue.includes('memory.'))) {
            textNodes.push(node);
        }
    }

    textNodes.forEach(textNode => {
        let text = textNode.nodeValue;
        const originalText = text;

        // 修复翻译键
        patterns.forEach(({ pattern, type }) => {
            if (pattern.test(text)) {
                const matches = text.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        try {
                            let translation = '';
                            const cleanKey = match.replace(/^(\.+)|(\.+)$/g, '');

                            if (type === 'continentNested') {
                                const parts = cleanKey.split('.');
                                const actualKey = parts[parts.length - 1];
                                translation = i18n.t(`continents.${actualKey}`);
                            } else if (type === 'featureNested') {
                                const parts = cleanKey.split('.');
                                const actualKey = parts[parts.length - 1];
                                translation = i18n.t(`features.${actualKey}`);
                            } else {
                                translation = i18n.t(cleanKey);
                            }

                            if (translation && translation !== cleanKey) {
                                text = text.replace(match, translation);
                                console.log(`修复翻译键: ${cleanKey} -> ${translation}`);
                            }
                        } catch (e) {
                            console.warn(`无法修复翻译键: ${match}`, e);
                        }
                    });
                }
            }
        });

        // 根据当前语言处理硬编码文本
        if (isChineseMode) {
            // 英文到中文翻译映射
            const englishToChineseMap = {
                'Start Learning': '开始学习',
                'Study Tips': '💡 学习技巧',
                '💡 Study Tips': '💡 学习技巧',
                'Last studied:': '上次学习: ',
                'Last studied': '上次学习:',
                'Today': '今日',
                'Learned': '已学习',
                'Total': '总数量',
                'Progress': '完成度',
                'Continue Learning': '继续学习',
                'Review & Reinforce': '复习巩固',
                'Previous': '← 上一个',
                'Next': '下一个 →',
                'Return Home': '返回首页',
                'Clear Progress': '🗑️ 清除学习进度',
                'Learning Overview': '📚 学习概览',
                'Continent Learning': '📂 大洲分类学习',
                'Smart Learning': '智能学习',
                'All categories completed': '🎉 所有分类均已完成',
                'time to review': '开始复习巩固记忆吧！',
                'Study Complete': '🎊 学习完成！',
                'All flags mastered': '🎉 太棒了！你已掌握所有国旗',
                'Prepare to study:': '准备学习: ',
                'Total in Category': '分类总数',
                'Begin Study': '开始学习',
                'Category Learning': '📂 大洲分类学习',
                'This will clear all learning records and progress, cannot be restored': '⚠️ 此操作将清除所有学习记录和进度，无法恢复',
                'This will clear all learning records and progress': '⚠️ 此操作将清除所有学习记录和进度，无法恢复',
                'Unlearned': '未学习',
                'Begin Study': '开始学习',
                'Don\'t Know': '不知道',
                'Know': '知道',
                'Return to Memory Training': '← 返回记忆训练',
                'Category Learning': '📂 大洲分类学习',
                'Learning Progress': '学习进度',
                'System recommends': '系统推荐'
            };

            Object.entries(englishToChineseMap).forEach(([english, chinese]) => {
                if (text.includes(english)) {
                    text = text.replace(new RegExp(english, 'g'), chinese);
                    console.log(`英文转中文: ${english} -> ${chinese}`);
                }
            });
        } else {
            // 中文到英文翻译映射
            const chineseToEnglishMap = {
                '开始学习': 'Start Learning',
                '学习技巧': 'Study Tips',
                '💡 学习技巧': '💡 Study Tips',
                '上次学习:': 'Last studied:',
                '上次学习': 'Last studied',
                '今日': 'Today',
                '已学习': 'Learned',
                '总数量': 'Total',
                '完成度': 'Progress',
                '继续学习': 'Continue Learning',
                '复习巩固': 'Review & Reinforce',
                '上一个': 'Previous',
                '下一个': 'Next',
                '返回首页': 'Return Home',
                '清除学习进度': 'Clear Progress',
                '学习概览': 'Learning Overview',
                '大洲分类学习': 'Continent Learning',
                '智能学习': 'Smart Learning',
                '学习进度': 'Learning Progress',
                '系统推荐': 'System recommends',
                '📚 学习概览': '📚 Learning Overview',
                '💡 学习技巧': '💡 Study Tips',
                '🗑️ 清除学习进度': '🗑️ Clear Progress',
                '🚀 开始学习': '🚀 Start Learning',
                '开始测试': 'Begin Test',
                '未学习': 'Unlearned',
                '不知道': 'Don\'t Know',
                '知道': 'Know',
                '⚠️ 此操作将清除所有学习记录和进度，无法恢复': '⚠️ This will clear all learning records and progress, cannot be restored',
                '此操作将清除所有学习记录和进度，无法恢复': 'This will clear all learning records and progress, cannot be restored',
                '📂 大洲分类学习': '📂 Continent Learning',
                '🎉 所有分类均已完成': '🎉 All categories completed',
                '🎊 学习完成': '🎊 Study Complete',
                '← 返回记忆训练': '← Return to Memory Training'
            };

            Object.entries(chineseToEnglishMap).forEach(([chinese, english]) => {
                if (text.includes(chinese)) {
                    text = text.replace(new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
                    console.log(`中文转英文: ${chinese} -> ${english}`);
                }
            });
        }

        // 更新文本节点
        if (text !== originalText) {
            textNode.nodeValue = text;
        }
    });

    // 处理按钮元素
    document.querySelectorAll('button, .btn, [role="button"]').forEach(button => {
        const buttonText = button.textContent.trim();

        if (isChineseMode) {
            const buttonEnToZh = {
                'Start Learning': '🚀 开始学习',
                'Continue Learning': '继续学习',
                'Clear Progress': '🗑️ 清除学习进度',
                'Previous': '← 上一个',
                'Next': '下一个 →',
                'Return Home': '返回首页',
                'Begin Study': '开始学习',
                'Don\'t Know': '不知道',
                'Know': '知道',
                'Return to Memory Training': '← 返回记忆训练'
            };

            if (buttonEnToZh[buttonText]) {
                button.textContent = buttonEnToZh[buttonText];
                console.log(`按钮英文转中文: ${buttonText} -> ${buttonEnToZh[buttonText]}`);
            }
        } else {
            const buttonZhToEn = {
                '🚀 开始学习': '🚀 Start Learning',
                '继续学习': 'Continue Learning',
                '🗑️ 清除学习进度': '🗑️ Clear Progress',
                '← 上一个': '← Previous',
                '下一个 →': 'Next →',
                '返回首页': 'Return Home',
                '开始学习': 'Begin Study',
                '不知道': 'Don\'t Know',
                '知道': 'Know',
                '← 返回记忆训练': '← Return to Memory Training'
            };

            if (buttonZhToEn[buttonText]) {
                button.textContent = buttonZhToEn[buttonText];
                console.log(`按钮中文转英文: ${buttonText} -> ${buttonZhToEn[buttonText]}`);
            }
        }
    });

    // 处理统计标签和提示信息
    document.querySelectorAll('.stat-item, .progress-info, .hint, .tip, .overview-title').forEach(element => {
        let text = element.textContent;
        let changed = false;

        if (isChineseMode) {
            const statEnToZh = {
                'Last studied:': '上次学习: ',
                'Last studied': '上次学习',
                'Today:': '今日: ',
                'Today': '今日',
                'Learned:': '已学习: ',
                'Learned': '已学习',
                'Total:': '总数量: ',
                'Total': '总数量',
                'Progress:': '完成度: ',
                'Progress': '完成度',
                'Learning Overview': '📚 学习概览',
                'Study Tips': '💡 学习技巧',
                'This will clear all learning records and progress, cannot be restored': '⚠️ 此操作将清除所有学习记录和进度，无法恢复'
            };

            Object.entries(statEnToZh).forEach(([english, chinese]) => {
                if (text.includes(english)) {
                    text = text.replace(new RegExp(english, 'g'), chinese);
                    changed = true;
                }
            });
        } else {
            const statZhToEn = {
                '上次学习:': 'Last studied: ',
                '上次学习': 'Last studied',
                '今日:': 'Today: ',
                '今日': 'Today',
                '已学习:': 'Learned: ',
                '已学习': 'Learned',
                '总数量:': 'Total: ',
                '总数量': 'Total',
                '完成度:': 'Progress: ',
                '完成度': 'Progress',
                '📚 学习概览': '📚 Learning Overview',
                '💡 学习技巧': '💡 Study Tips',
                '⚠️ 此操作将清除所有学习记录和进度，无法恢复': '⚠️ This will clear all learning records and progress, cannot be restored'
            };

            Object.entries(statZhToEn).forEach(([chinese, english]) => {
                if (text.includes(chinese)) {
                    text = text.replace(new RegExp(chinese.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), english);
                    changed = true;
                }
            });
        }

        if (changed) {
            element.textContent = text;
            console.log(`修复统计/提示文本: ${element.className || element.tagName}`);
        }
    });

    // 处理分类卡片描述
    document.querySelectorAll('.category-description, .continent-description').forEach(element => {
        let text = element.textContent;
        let changed = false;

        if (!isChineseMode) {
            // 特定的中文描述转英文
            const descriptionMap = {
                '欧洲地区国家的国旗，多为三色旗和十字设计': 'Flags of European countries, mostly tricolor flags and cross designs',
                '欧洲国旗以简洁的三色条和十字图案为主，容易识别': 'European flags are mainly simple tricolor stripes and cross patterns, easy to recognize',
                '亚洲地区国家的国旗，包括东亚、东南亚、南亚、西亚和中亚': 'Flags of Asian countries, including East Asia, Southeast Asia, South Asia, West Asia and Central Asia',
                '非洲地区国家的国旗，多采用泛非色彩': 'Flags of African countries, mostly using Pan-African colors',
                '南美洲地区国家的国旗，多为蓝白红配色': 'Flags of South American countries, mostly blue, white and red colors',
                '北美洲地区国家的国旗': 'Flags of North American countries',
                '大洋洲地区国家的国旗，多含南十字星': 'Flags of Oceanian countries, mostly containing the Southern Cross',
                // 处理混合文本
                'South America地区国家的国旗，多为蓝白红配色': 'Flags of South American countries, mostly blue, white and red colors',
                'Europe地区国家的国旗，多为三色旗和十字设计': 'Flags of European countries, mostly tricolor flags and cross designs',
                'Africa地区国家的国旗，多采用泛非色彩': 'Flags of African countries, mostly using Pan-African colors',
                'Asia地区国家的国旗，包括东亚、东南亚、南亚、西亚和中亚': 'Flags of Asian countries, including East Asia, Southeast Asia, South Asia, West Asia and Central Asia'
            };

            Object.entries(descriptionMap).forEach(([chinese, english]) => {
                if (text.includes(chinese)) {
                    text = text.replace(chinese, english);
                    changed = true;
                }
            });
        }

        if (changed) {
            element.textContent = text;
            console.log(`修复分类描述: ${element.className}`);
        }
    });

    console.log('翻译键修复完成');
}

// 更新记忆训练模块的所有文本和动态内容
function updateMemoryModuleText() {
    if (!i18n.loaded) {
        console.warn('i18n not loaded, skipping memory module text update');
        return;
    }

    console.log('🔄🔄🔄 updateMemoryModuleText 开始执行');
    console.log('🔍 当前语言:', i18n.currentLanguage);
    console.log('🔍 i18n 对象状态:', {
        loaded: i18n.loaded,
        currentLanguage: i18n.currentLanguage,
        translations: i18n.translations ? '存在' : '不存在'
    });

    // 检查记忆训练模块是否已经显示
    const memorySection = document.getElementById('memory-section');
    const studySection = document.getElementById('study-section');
    // 也要检查通过 class 查找的元素
    const memorySectionByClass = document.querySelector('.memory-section');
    const studySectionByClass = document.querySelector('.study-section');

    const isMemoryVisible = memorySection && memorySection.style.display !== 'none';
    const isStudyVisible = studySection && studySection.style.display !== 'none';
    const isMemoryVisibleByClass = memorySectionByClass && !memorySectionByClass.classList.contains('hidden');
    const isStudyVisibleByClass = studySectionByClass && !studySectionByClass.classList.contains('hidden');

    console.log('🔍 DOM 元素检查结果:', {
        memorySection: !!memorySection,
        studySection: !!studySection,
        memorySectionByClass: !!memorySectionByClass,
        studySectionByClass: !!studySectionByClass,
        memorySectionDisplay: memorySection ? memorySection.style.display : 'N/A',
        studySectionDisplay: studySection ? studySection.style.display : 'N/A',
        isMemoryVisible,
        isStudyVisible,
        isMemoryVisibleByClass,
        isStudyVisibleByClass
    });

    if (isMemoryVisible || isMemoryVisibleByClass) {
        console.log('📚 记忆训练主界面可见，开始全面更新...');

        // 首先修复显示翻译键的元素
        console.log('🔧 第1步：修复翻译键元素');
        fixTranslationKeyElements();

        // 强制重新生成整个记忆训练界面以确保所有动态内容都更新
        if (window.enhancedMemorySystem) {
            console.log('🔧 第2步：重新生成记忆训练界面');

            // 保存当前的学习状态
            const currentState = window.enhancedMemorySystem.getCurrentState();
            console.log('🔧 保存的当前状态:', currentState);

            // 重新显示记忆训练界面以刷新所有内容
            window.enhancedMemorySystem.showMemory();

            // 如果之前在某个分类学习界面，恢复该界面
            if (currentState.currentCategory) {
                console.log('🔧 第3步：恢复分类学习界面:', currentState.currentCategory);
                setTimeout(() => {
                    const categoryData = window.enhancedMemorySystem.getCategoryData(currentState.currentCategory);
                    if (categoryData) {
                        window.enhancedMemorySystem.showCategoryLearning(currentState.currentCategory);
                    } else {
                        console.warn('⚠️ 无法找到分类数据:', currentState.currentCategory);
                    }
                }, 100);
            }
        } else {
            console.warn('⚠️ enhancedMemorySystem 不存在');
        }

        // 手动更新一些可能没有被重新生成的静态元素
        console.log('🔧 第4步：更新静态元素');
        updateStaticMemoryElements();

        // 强制翻译页面元素作为兜底
        console.log('🔧 第5步：强制翻译页面元素');
        forceTranslateAllMemoryElements();

        console.log('✅ 记忆训练模块全面更新完成');
    } else if (isStudyVisible || isStudyVisibleByClass) {
        console.log('📖 学习界面可见，开始更新学习界面...');

        // 如果在学习页面，重新生成学习界面
        if (window.enhancedMemorySystem) {
            console.log('🔧 学习界面：重新生成学习内容');
            const currentState = window.enhancedMemorySystem.getCurrentState();

            if (currentState.currentCategory) {
                console.log('🔧 重新生成学习界面，分类:', currentState.currentCategory);

                // 重新生成学习预览页面
                window.enhancedMemorySystem.showPreviewPage();
            } else {
                console.warn('⚠️ 学习界面：没有当前分类信息');
            }
        } else {
            console.warn('⚠️ 学习界面：enhancedMemorySystem 不存在');
        }

        // 修复可能存在的翻译键问题
        console.log('🔧 学习界面：修复翻译键问题');
        fixTranslationKeyElements();

        // 强制翻译学习界面元素
        console.log('🔧 学习界面：强制翻译元素');
        forceTranslateStudyElements();

        console.log('✅ 学习界面更新完成');
    } else {
        console.log('ℹ️ 记忆训练模块不可见，跳过更新');
    }

    // 额外检查：如果还有硬编码的中文/英文文本没有更新，进行强制翻译
    setTimeout(() => {
        console.log('🔧 延迟检查：强制翻译所有记忆训练元素');
        debugMemoryModuleDOMState(); // 添加调试检查
        forceTranslateAllMemoryElements();

        // 调用专门的记忆训练模块翻译器
        translateMemoryTrainingModule();
    }, 20);

    console.log('🔄🔄🔄 updateMemoryModuleText 执行完成');
}

// 强制翻译所有记忆训练元素
function forceTranslateAllMemoryElements() {
    console.log('🚨🚨🚨 forceTranslateAllMemoryElements 开始执行');
    console.log('🔍 当前语言:', i18n.currentLanguage);
    console.log('🔍 i18n 对象状态:', {
        loaded: i18n.loaded,
        currentLanguage: i18n.currentLanguage,
        hasTranslations: !!i18n.translations
    });

    const currentLang = i18n.currentLanguage;
    const isChineseMode = currentLang === 'zh';
    console.log('🔍 中文模式判断:', isChineseMode);

    // 处理学习页面中的所有硬编码文本
    const studySection = document.getElementById('study-section');
    console.log('🔍 Study section found:', !!studySection);

    if (studySection) {
        console.log('📖 处理学习页面元素');

        // 强制翻译按钮文本
        const beginBtn = studySection.querySelector('#beginStudyBtn');
        console.log('🔍 Begin button found:', !!beginBtn);
        console.log('🔍 Begin button text:', beginBtn ? beginBtn.textContent : 'N/A');

        if (beginBtn) {
            const btnText = beginBtn.textContent.trim();
            if (isChineseMode && (btnText.includes('Begin Study') || btnText === 'Begin Study')) {
                const newText = i18n.t('memory.beginTest');
                beginBtn.textContent = newText;
                console.log('✅ Force translated Begin Study button:', btnText, '->', newText);
            } else {
                console.log('ℹ️ Begin Study button text is correct:', btnText);
            }
        }

        // 检查学习页面中是否也有推荐系统文字
        const studyLearningHint = studySection.querySelector('.learning-hint');
        console.log('🔍 Study learning hint found:', !!studyLearningHint);
        if (studyLearningHint) {
            const hintText = studyLearningHint.textContent.trim();
            console.log('🔍 Study learning hint text:', hintText);
            if (isChineseMode && hintText.includes('System recommends learning')) {
                console.log('✅ Force translated system recommendation in study section');
                studyLearningHint.textContent = i18n.t('memory.systemRecommendation', {category: window.enhancedMemorySystem?.currentCategory || 'Unknown'});
            } else if (!isChineseMode && hintText.includes('系统推荐学习')) {
                console.log('✅ Force translated system recommendation to English in study section');
                studyLearningHint.textContent = i18n.t('memory.systemRecommendation', {category: window.enhancedMemorySystem?.currentCategory || 'Unknown'});
            } else {
                console.log('ℹ️ Study system recommendation text is correct:', hintText);
            }
        }

        // 强制翻译分类描述 - 针对记忆训练模块
        const memorySection = document.querySelector('.memory-section');
        if (memorySection) {
            const descriptions = memorySection.querySelectorAll('.category-description');
            console.log('🔍 Memory category descriptions found:', descriptions.length);
            descriptions.forEach((desc, index) => {
                const text = desc.textContent.trim();
                console.log(`🔍 Memory description ${index} text:`, text);

                // 根据当前分类获取对应的描述
                const categoryCard = desc.closest('.category-card');
                if (categoryCard) {
                    const categoryTitleElement = categoryCard.querySelector('.category-title');
                    if (categoryTitleElement) {
                        const categoryTitle = categoryTitleElement.textContent.trim();
                        // 从分类标题中提取大洲名称
                        let continentKey = null;
                        if (categoryTitle.includes('欧洲') || categoryTitle.includes('Europe')) continentKey = 'europe';
                        else if (categoryTitle.includes('亚洲') || categoryTitle.includes('Asia')) continentKey = 'asia';
                        else if (categoryTitle.includes('非洲') || categoryTitle.includes('Africa')) continentKey = 'africa';
                        else if (categoryTitle.includes('北美洲') || categoryTitle.includes('North America')) continentKey = 'northAmerica';
                        else if (categoryTitle.includes('南美洲') || categoryTitle.includes('South America')) continentKey = 'southAmerica';
                        else if (categoryTitle.includes('大洋洲') || categoryTitle.includes('Oceania')) continentKey = 'oceania';

                        if (continentKey) {
                            const localizedDesc = i18n.t(`memory.continentDescriptions.${continentKey}`);
                            if (localizedDesc !== `memory.continentDescriptions.${continentKey}`) {
                                if (text !== localizedDesc) {
                                    console.log('✅ Force translated memory category description:', text, '->', localizedDesc);
                                    desc.textContent = localizedDesc;
                                } else {
                                    console.log(`ℹ️ Memory description ${index} text is correct:`, text);
                                }
                            }
                        }
                    }
                }
            });
        }

        // 强制翻译学习技巧 - 针对记忆训练模块
        if (memorySection) {
            const tips = memorySection.querySelectorAll('.tips-content');
            console.log('🔍 Memory tips found:', tips.length);
            tips.forEach((tip, index) => {
                const text = tip.textContent.trim();
                console.log(`🔍 Memory tip ${index} text:`, text);

                // 根据当前分类获取对应的提示
                const categoryCard = tip.closest('.category-card');
                if (categoryCard) {
                    const categoryTitleElement = categoryCard.querySelector('.category-title');
                    if (categoryTitleElement) {
                        const categoryTitle = categoryTitleElement.textContent.trim();
                        // 从分类标题中提取大洲名称
                        let continentKey = null;
                        if (categoryTitle.includes('欧洲') || categoryTitle.includes('Europe')) continentKey = 'europe';
                        else if (categoryTitle.includes('亚洲') || categoryTitle.includes('Asia')) continentKey = 'asia';
                        else if (categoryTitle.includes('非洲') || categoryTitle.includes('Africa')) continentKey = 'africa';
                        else if (categoryTitle.includes('北美洲') || categoryTitle.includes('North America')) continentKey = 'northAmerica';
                        else if (categoryTitle.includes('南美洲') || categoryTitle.includes('South America')) continentKey = 'southAmerica';
                        else if (categoryTitle.includes('大洋洲') || categoryTitle.includes('Oceania')) continentKey = 'oceania';

                        if (continentKey) {
                            const localizedTip = i18n.t(`memory.continentTips.${continentKey}`);
                            if (localizedTip !== `memory.continentTips.${continentKey}`) {
                                if (text !== localizedTip) {
                                    console.log('✅ Force translated memory category tip:', text, '->', localizedTip);
                                    tip.textContent = localizedTip;
                                } else {
                                    console.log(`ℹ️ Memory tip ${index} text is correct:`, text);
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // 处理记忆训练主页中的元素
    const memorySection = document.getElementById('memory-section') || document.querySelector('.memory-section');
    console.log('🔍 Memory section found:', !!memorySection);
    console.log('🔍 Memory section by ID:', !!document.getElementById('memory-section'));
    console.log('🔍 Memory section by class:', !!document.querySelector('.memory-section'));

    if (memorySection) {
        console.log('📚 处理记忆训练主页面元素');

        // 强制翻译系统推荐信息
        const learningHint = memorySection.querySelector('.learning-hint');
        console.log('🔍 Learning hint found:', !!learningHint);
        console.log('🔍 Learning hint text:', learningHint ? learningHint.textContent.trim() : 'N/A');

        if (learningHint) {
            const text = learningHint.textContent.trim();
            console.log('🔍 Current learning hint text:', text);
            if (isChineseMode && text.includes('System recommends learning')) {
                // 如果是中文模式但显示英文推荐，重新生成
                console.log('🔧 需要翻译为中文，当前文本:', text);
                if (window.enhancedMemorySystem) {
                    window.enhancedMemorySystem.updateStartLearningButton();
                    console.log('✅ 调用了 updateStartLearningButton');
                    // 立即检查是否更新成功
                    setTimeout(() => {
                        const newText = learningHint.textContent.trim();
                        console.log('🔍 更新后的文本:', newText);
                    }, 100);
                } else {
                    console.warn('⚠️ enhancedMemorySystem 不存在');
                }
            } else if (!isChineseMode && text.includes('系统推荐学习')) {
                // 如果是英文模式但显示中文推荐，重新生成
                console.log('🔧 需要翻译为英文，当前文本:', text);
                if (window.enhancedMemorySystem) {
                    window.enhancedMemorySystem.updateStartLearningButton();
                    console.log('✅ 调用了 updateStartLearningButton');
                    // 立即检查是否更新成功
                    setTimeout(() => {
                        const newText = learningHint.textContent.trim();
                        console.log('🔍 更新后的文本:', newText);
                    }, 100);
                } else {
                    console.warn('⚠️ enhancedMemorySystem 不存在');
                }
            } else {
                console.log('ℹ️ System recommendation text is correct:', text);
                // 但仍然可以尝试直接翻译作为备用方案
                if (isChineseMode && text.includes('System recommends learning')) {
                    // 直接翻译
                    // 移除硬编码翻译，使用统一的翻译系统
                this.updateMemorySystemHint();
                }
            }
        } else {
            console.warn('⚠️ Learning hint element not found! 尝试其他选择器...');
            // 尝试其他可能的选择器
            const altLearningHint = document.querySelector('[class*="learning"], [class*="hint"], [class*="recommend"]');
            console.log('🔍 Alternative learning hint found:', !!altLearningHint);
            if (altLearningHint) {
                console.log('🔍 Alternative element text:', altLearningHint.textContent.trim());
            }
        }

        // 查找并翻译警告信息
        const warningElements = memorySection.querySelectorAll('.warning, .alert, [data-i18n*="warning"], [data-i18n*="clear"]');
        console.log('🔍 Warning elements found:', warningElements.length);
        warningElements.forEach((warning, index) => {
            const text = warning.textContent.trim();
            console.log(`🔍 Warning ${index} text:`, text);
            if (isChineseMode && text.includes('此操作将清除所有学习记录和进度')) {
                // 看起来是正确的中文，不需要改变
                console.log(`ℹ️ Warning ${index} is correct Chinese`);
            } else if (!isChineseMode && text.includes('此操作将清除所有学习记录和进度')) {
                // 需要翻译成英文
                warning.textContent = i18n.t('memory.clearProgressWarning');
                console.log(`✅ Translated warning ${index} to English`);
            } else if (isChineseMode && text.includes('This operation will clear all learning records')) {
                // 需要翻译成中文
                warning.textContent = i18n.t('memory.clearProgressWarning');
                console.log(`✅ Translated warning ${index} to Chinese`);
            }
        });

        // 查找并翻译分类学习标题
        const categoryTitles = memorySection.querySelectorAll('h3, .category-title, [data-i18n*="category"]');
        console.log('🔍 Category titles found:', categoryTitles.length);
        categoryTitles.forEach((title, index) => {
            const text = title.textContent.trim();
            console.log(`🔍 Category title ${index} text:`, text);

            // 翻译主标题
            if (isChineseMode && text.includes('Category Learning')) {
                title.textContent = i18n.t('memory.categoryLearning');
                console.log(`✅ Translated category title ${index} to Chinese`);
            } else if (!isChineseMode && (text.includes('大洲分类学习') || text.includes('分类学习'))) {
                title.textContent = i18n.t('memory.categoryLearning');
                console.log(`✅ Translated category title ${index} to English`);
            }

            // 翻译具体分类名称（如Europe(1), Africa(1)等）
            if (isChineseMode) {
                // 检查是否是英文分类名称需要翻译为中文
                const englishCategoryPatterns = [
                    /Europe\((\d+)\)/g,
                    /Africa\((\d+)\)/g,
                    /Asia\((\d+)\)/g,
                    /North America\((\d+)\)/g,
                    /South America/g,
                    /Oceania\((\d+)\)/g
                ];

                let translated = false;
                for (const pattern of englishCategoryPatterns) {
                    if (pattern.test(text)) {
                        // 使用EnhancedMemorySystem的翻译函数
                        if (window.EnhancedMemorySystem && typeof window.EnhancedMemorySystem.getLocalizedCategoryName === 'function') {
                            // 从分类名称中提取原始键名
                            const categoryKey = text.replace(/Europe\((\d+)\)/, 'europe.$1')
                                                   .replace(/Africa\((\d+)\)/, 'africa.$1')
                                                   .replace(/Asia\((\d+)\)/, 'asia.$1')
                                                   .replace(/North America\((\d+)\)/, 'northAmerica.$1')
                                                   .replace(/South America/, 'southAmerica')
                                                   .replace(/Oceania\((\d+)\)/, 'oceania.$1');

                            const categoryData = window.EnhancedMemorySystem.categories[categoryKey];
                            if (categoryData) {
                                const localizedCategory = window.EnhancedMemorySystem.getLocalizedCategoryName(categoryKey, categoryData);
                                title.textContent = localizedCategory;
                                console.log(`✅ Translated category title ${index}: ${text} -> ${localizedCategory}`);
                                translated = true;
                                break;
                            }
                        }

                        // 如果EnhancedMemorySystem不可用，使用i18n直接翻译
                        if (!translated) {
                            const categoryKey = text.replace(/Europe\((\d+)\)/, 'europe.$1')
                                                   .replace(/Africa\((\d+)\)/, 'africa.$1')
                                                   .replace(/Asia\((\d+)\)/, 'asia.$1')
                                                   .replace(/North America\((\d+)\)/, 'northAmerica.$1')
                                                   .replace(/South America/, 'southAmerica')
                                                   .replace(/Oceania\((\d+)\)/, 'oceania.$1');

                            const translation = i18n.t(`memory.category.${categoryKey}`);
                            if (translation !== `memory.category.${categoryKey}`) {
                                title.textContent = translation;
                                console.log(`✅ Translated category title ${index}: ${text} -> ${translation}`);
                            }
                        }
                        break;
                    }
                }
            } else {
                // 英文模式下，检查是否是中文分类名称需要翻译为英文
                const chineseCategoryPatterns = [
                    /欧洲（(\d+)）/g,
                    /非洲（(\d+)）/g,
                    /亚洲（(\d+)）/g,
                    /北美洲（(\d+)）/g,
                    /南美洲/g,
                    /大洋洲（(\d+)）/g
                ];

                let translated = false;
                for (const pattern of chineseCategoryPatterns) {
                    if (pattern.test(text)) {
                        // 使用EnhancedMemorySystem的翻译函数
                        if (window.EnhancedMemorySystem && typeof window.EnhancedMemorySystem.getLocalizedCategoryName === 'function') {
                            // 从分类名称中提取原始键名
                            const categoryKey = text.replace(/欧洲（(\d+)）/g, 'europe.$1')
                                                   .replace(/非洲（(\d+)）/g, 'africa.$1')
                                                   .replace(/亚洲（(\d+)）/g, 'asia.$1')
                                                   .replace(/北美洲（(\d+)）/g, 'northAmerica.$1')
                                                   .replace(/南美洲/g, 'southAmerica')
                                                   .replace(/大洋洲（(\d+)）/g, 'oceania.$1');

                            const categoryData = window.EnhancedMemorySystem.categories[categoryKey];
                            if (categoryData) {
                                const localizedCategory = window.EnhancedMemorySystem.getLocalizedCategoryName(categoryKey, categoryData);
                                title.textContent = localizedCategory;
                                console.log(`✅ Translated category title ${index}: ${text} -> ${localizedCategory}`);
                                translated = true;
                                break;
                            }
                        }

                        // 如果EnhancedMemorySystem不可用，使用i18n直接翻译
                        if (!translated) {
                            const categoryKey = text.replace(/欧洲（(\d+)）/g, 'europe.$1')
                                                   .replace(/非洲（(\d+)）/g, 'africa.$1')
                                                   .replace(/亚洲（(\d+)）/g, 'asia.$1')
                                                   .replace(/北美洲（(\d+)）/g, 'northAmerica.$1')
                                                   .replace(/南美洲/g, 'southAmerica')
                                                   .replace(/大洋洲（(\d+)）/g, 'oceania.$1');

                            const translation = i18n.t(`memory.category.${categoryKey}`);
                            if (translation !== `memory.category.${categoryKey}`) {
                                title.textContent = translation;
                                console.log(`✅ Translated category title ${index}: ${text} -> ${translation}`);
                            }
                        }
                        break;
                    }
                }
            }
        });

        // 查找并翻译学习进度相关文本
        const progressElements = memorySection.querySelectorAll('.progress, .learning-progress, [data-i18n*="progress"]');
        console.log('🔍 Progress elements found:', progressElements.length);
        progressElements.forEach((progress, index) => {
            const text = progress.textContent.trim();
            console.log(`🔍 Progress element ${index} text:`, text);
            // 检查是否包含需要翻译的进度文本
            if (isChineseMode && (text.includes('Progress') || text.includes('Learned'))) {
                // 重新生成整个进度区域
                if (window.enhancedMemorySystem) {
                    window.enhancedMemorySystem.displayOverview();
                    console.log(`✅ Refreshed progress display to Chinese`);
                }
            } else if (!isChineseMode && (text.includes('进度') || text.includes('已学习'))) {
                // 重新生成整个进度区域
                if (window.enhancedMemorySystem) {
                    window.enhancedMemorySystem.displayOverview();
                    console.log(`✅ Refreshed progress display to English`);
                }
            }
        });
    }

    // 最后兜底：查找所有可能包含硬编码文本的元素并强制翻译
    console.log('🔧 最终兜底：查找并翻译所有硬编码文本');
    forceTranslateHardcodedText();

    // 专门处理记忆训练模块的翻译
    console.log('🔧 记忆训练模块专用翻译器');
    translateMemoryTrainingModule();

    // 添加通用键值翻译器作为最后兜底
    console.log('🔧 通用键值翻译器：处理所有未翻译的键值');
    const memSection = document.getElementById('memory-section');
    if (memSection) {
        const allElements = memSection.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.children.length === 0 && element.textContent) {
                const text = element.textContent.trim();
                // 检查是否是未翻译的键值
                if (text.startsWith('memory.') || text.includes('memory.')) {
                    const translatedText = i18n.t(text);
                    if (translatedText !== text) {
                        element.textContent = translatedText;
                        console.log('✅ 通用翻译器处理:', text, '->', translatedText);
                    }
                }
            }
        });
    }

    // 再次调用 fixTranslationKeyElements 作为兜底
    console.log('🔧 最后兜底：调用 fixTranslationKeyElements');
    fixTranslationKeyElements();

    console.log('🚨🚨🚨 forceTranslateAllMemoryElements 执行完成');
}

// 强制翻译硬编码文本的兜底函数
function forceTranslateHardcodedText() {
    console.log('🔥🔥🔥 forceTranslateHardcodedText 开始执行');

    const isChineseMode = i18n.currentLanguage === 'zh';
    console.log('🔥 当前语言模式:', isChineseMode ? '中文' : '英文');

    // 查找所有可能包含硬编码文本的元素
    const allElements = document.querySelectorAll('*');
    console.log('🔥 检查所有DOM元素，总数:', allElements.length);

    let translatedCount = 0;

    allElements.forEach((element) => {
        if (element.children.length === 0) { // 只检查叶子节点
            const text = element.textContent.trim();

            // 系统推荐信息翻译 - 使用智能翻译
            if (isChineseMode && text.includes('System recommends learning')) {
                // 提取推荐分类并翻译
                const match = text.match(/"([^"]+)"/);
                if (match) {
                    const category = match[1];
                    let localizedCategory = category; // 默认使用原始分类名

                    // 如果有EnhancedMemorySystem实例，使用它的翻译函数
                    if (window.EnhancedMemorySystem && typeof window.EnhancedMemorySystem.getLocalizedCategoryName === 'function') {
                        // 尝试从categories获取数据
                        const categoryData = window.EnhancedMemorySystem.categories[category];
                        if (categoryData) {
                            localizedCategory = window.EnhancedMemorySystem.getLocalizedCategoryName(category, categoryData);
                        }
                    } else {
                        // 备选方案：直接使用i18n翻译键
                        const translation = i18n.t(`memory.category.${category}`);
                        if (translation !== `memory.category.${category}`) {
                            localizedCategory = translation;
                        }
                    }
                    element.textContent = i18n.t('memory.systemRecommendation', {category: localizedCategory});
                    translatedCount++;
                    console.log('🔥 翻译了系统推荐信息为中文:', text);
                }
            } else if (!isChineseMode && text.includes('系统推荐学习')) {
                // 提取推荐分类并翻译
                const match = text.match(/"([^"]+)"/);
                if (match) {
                    const category = match[1];
                    let localizedCategory = category; // 默认使用原始分类名

                    // 如果有EnhancedMemorySystem实例，使用它的翻译函数
                    if (window.EnhancedMemorySystem && typeof window.EnhancedMemorySystem.getLocalizedCategoryName === 'function') {
                        // 尝试从categories获取数据
                        const categoryData = window.EnhancedMemorySystem.categories[category];
                        if (categoryData) {
                            localizedCategory = window.EnhancedMemorySystem.getLocalizedCategoryName(category, categoryData);
                        }
                    } else {
                        // 备选方案：直接使用i18n翻译键
                        const translation = i18n.t(`memory.category.${category}`);
                        if (translation !== `memory.category.${category}`) {
                            localizedCategory = translation;
                        }
                    }
                    element.textContent = i18n.t('memory.systemRecommendation', {category: localizedCategory});
                    translatedCount++;
                    console.log('🔥 翻译了系统推荐信息为英文:', text);
                }
            }

            // 警告信息翻译
            if (isChineseMode && text.includes('This operation will clear all learning records')) {
                element.textContent = i18n.t('memory.clearWarning');
                translatedCount++;
                console.log('🔥 翻译了警告信息为中文:', text);
            } else if (!isChineseMode && text.includes('此操作将清除所有学习记录和进度')) {
                element.textContent = i18n.t('memory.clearWarning');
                translatedCount++;
                console.log('🔥 翻译了警告信息为英文:', text);
            }

            // 分类学习标题翻译
            if (isChineseMode && text.includes('Category Learning')) {
                element.textContent = i18n.t('memory.categoryLearning');
                translatedCount++;
                console.log('🔥 翻译了分类学习标题为中文:', text);
            } else if (!isChineseMode && (text.includes('大洲分类学习') || text.includes('分类学习'))) {
                element.textContent = i18n.t('memory.categoryLearning');
                translatedCount++;
                console.log('🔥 翻译了分类学习标题为英文:', text);
            }

            // 分类描述和学习技巧翻译现在由统一的i18n系统处理
            // 这些硬编码翻译已移除，因为i18n.json已包含相应翻译键

            // 进度显示翻译
            if (isChineseMode && text.includes('Learned') && !text.includes('已学习')) {
                element.textContent = text.replace('Learned', '已学习');
                translatedCount++;
                console.log('🔥 翻译了进度显示为中文:', text);
            } else if (!isChineseMode && text.includes('已学习') && !text.includes('Learned')) {
                element.textContent = text.replace('已学习', 'Learned');
                translatedCount++;
                console.log('🔥 翻译了进度显示为英文:', text);
            }

            // "个" 单位翻译
            if (isChineseMode && text.match(/\d+\s+Learned/)) {
                element.textContent = text.replace(/(\d+)\s+Learned/, '$1 已学习');
                translatedCount++;
                console.log('🔥 翻译了"个"单位为中文:', text);
            } else if (!isChineseMode && text.match(/\d+\s+已学习/)) {
                element.textContent = text.replace(/(\d+)\s+已学习/, '$1 Learned');
                translatedCount++;
                console.log('🔥 翻译了"个"单位为英文:', text);
            }
        }
    });

    console.log(`🔥🔥🔥 forceTranslateHardcodedText 完成，共翻译了 ${translatedCount} 个元素`);
}

// 调试函数：检查当前记忆训练模块DOM状态
function debugMemoryModuleDOMState() {
    console.log('🔍🔍🔍 debugMemoryModuleDOMState 开始检查');

    const memorySection = document.getElementById('memory-section');
    const studySection = document.getElementById('study-section');

    console.log('🔍 DOM 状态检查:', {
        memorySection: !!memorySection,
        studySection: !!studySection,
        memorySectionDisplay: memorySection ? memorySection.style.display : 'N/A',
        studySectionDisplay: studySection ? studySection.style.display : 'N/A',
        memorySectionVisible: memorySection ? memorySection.style.display !== 'none' : false,
        studySectionVisible: studySection ? studySection.style.display !== 'none' : false
    });

    // 检查记忆训练主页面元素
    if (memorySection) {
        const learningHint = memorySection.querySelector('.learning-hint');
        const continueBtn = memorySection.querySelector('#continueBtn');
        const clearBtn = memorySection.querySelector('#clearBtn');

        console.log('📚 记忆训练主页面元素:', {
            learningHint: !!learningHint,
            learningHintText: learningHint ? learningHint.textContent.trim() : 'N/A',
            continueBtn: !!continueBtn,
            continueBtnText: continueBtn ? continueBtn.textContent.trim() : 'N/A',
            clearBtn: !!clearBtn,
            clearBtnText: clearBtn ? clearBtn.textContent.trim() : 'N/A'
        });
    }

    // 检查学习页面元素
    if (studySection) {
        const beginBtn = studySection.querySelector('#beginStudyBtn');
        const studyLearningHint = studySection.querySelector('.learning-hint');
        const categoryDesc = studySection.querySelector('.category-description');
        const tipsContent = studySection.querySelector('.tips-content');

        console.log('📖 学习页面元素:', {
            beginBtn: !!beginBtn,
            beginBtnText: beginBtn ? beginBtn.textContent.trim() : 'N/A',
            studyLearningHint: !!studyLearningHint,
            studyLearningHintText: studyLearningHint ? studyLearningHint.textContent.trim() : 'N/A',
            categoryDesc: !!categoryDesc,
            categoryDescText: categoryDesc ? categoryDesc.textContent.trim() : 'N/A',
            tipsContent: !!tipsContent,
            tipsContentText: tipsContent ? tipsContent.textContent.trim() : 'N/A'
        });
    }

    console.log('🔍🔍🔍 debugMemoryModuleDOMState 检查完成');
}

// 更新静态记忆训练元素
function updateStaticMemoryElements() {
    // 更新学习概览标题
    const overviewTitles = document.querySelectorAll('h2');
    overviewTitles.forEach(title => {
        if (title.textContent.includes('学习概览') || title.textContent.includes('Learning Overview')) {
            title.textContent = i18n.t('memory.overviewTitle');
        }
    });

    // 更新分类学习标题
    const categoryLearningTitles = document.querySelectorAll('h3');
    categoryLearningTitles.forEach(title => {
        if (title.textContent.includes('分类学习') || title.textContent.includes('Category Learning') ||
            title.textContent.includes('大洲分类学习') || title.textContent.includes('Continent Learning')) {
            title.textContent = i18n.t('memory.categoryLearning');
        }
    });

    // 更新所有按钮文本
    document.querySelectorAll('button').forEach(button => {
        const btnText = button.textContent.trim();

        // 开始学习按钮
        if (btnText.includes('开始学习') || btnText.includes('Start Learning')) {
            button.textContent = i18n.t('memory.startButton');
        }

        // 清除进度按钮
        if (btnText.includes('清除学习进度') || btnText.includes('Clear Progress')) {
            button.textContent = i18n.t('memory.clearProgress');
        }

        // 返回按钮
        if (btnText.includes('返回首页') || btnText.includes('Return Home')) {
            button.textContent = i18n.t('memory.returnHome');
        }

        // 继续学习按钮
        if (btnText.includes('继续学习') || btnText.includes('Continue Learning')) {
            button.textContent = i18n.t('memory.continueStudy');
        }
    });

    // 更新统计文本（包括内联样式的统计文本）
    const statLabels = document.querySelectorAll('.stat-label, div[style*="font-size: 0.9rem; opacity: 0.9;"]');
    statLabels.forEach(label => {
            const text = label.textContent.trim();
            switch(text) {
                case '已学习':
                case 'Learned':
                    label.textContent = i18n.t('memory.statsLearned');
                    break;
                case '总数量':
                case 'Total':
                    label.textContent = i18n.t('memory.statsTotal');
                    break;
                case '完成度':
                case 'Progress':
                    label.textContent = i18n.t('memory.statsProgress');
                    break;
                case '今日学习':
                case 'Today':
                    label.textContent = i18n.t('memory.statsToday');
                    break;
                case '学习数量':
                    label.textContent = i18n.t('memory.statsLearned');
                    break;
                case '新掌握':
                case 'New':
                    label.textContent = i18n.t('memory.statsNew');
                    break;
                case '用时':
                case 'Time':
                    label.textContent = i18n.t('memory.statsTime');
                    break;
            }
        });

    // 更新学习进度文本
    const progressContainers = document.querySelectorAll('div[style*="background: rgba(255,255,255,0.2)"]');
    progressContainers.forEach(container => {
        const spans = container.querySelectorAll('span');
        spans.forEach(span => {
            if (span.textContent.includes('学习进度') || span.textContent.includes('Learning Progress')) {
                span.textContent = i18n.t('memory.learningProgress');
            }
        });
    });

    // 更新系统提示和提示文字
    const hints = document.querySelectorAll('.learning-hint, .hint');
    hints.forEach(hint => {
        const hintText = hint.textContent.trim();
        if (hintText.includes('系统会智能选择最适合的学习分类') ||
            hintText.includes('The system will intelligently select')) {
            hint.innerHTML = i18n.t('memory.systemSmartHint');
        } else if (hintText.includes('💡 系统会智能选择最适合的学习分类')) {
            hint.innerHTML = i18n.t('memory.systemSmartHint');
        }
    });

    // 更新完成提示
    const completeMessages = document.querySelectorAll('.overall-complete, .complete-message');
    completeMessages.forEach(msg => {
        const msgText = msg.textContent.trim();
        if (msgText.includes('太棒了！你已掌握所有国旗') ||
            msgText.includes('Great! You have mastered all flags')) {
            msg.textContent = i18n.t('memory.allFlagsMastered');
        }
    });

    // 更新分类卡片文本
    updateCategoryCardsText();

    // 更新学习完成提示
    const sessionMessages = document.querySelectorAll('.session-type-text');
    sessionMessages.forEach(msg => {
        const msgText = msg.textContent.trim();
        if (msgText.includes('太棒了！你完成了学习') ||
            msgText.includes('Excellent! You have completed')) {
            msg.textContent = i18n.t('memory.studyCompleteMessage');
        }
    });
}

// 更新分类卡片文本的函数
function updateCategoryCardsText() {
    if (!i18n.loaded) return;

    console.log('Updating category cards text...');

    // 更新分类卡片中的文本
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        // 更新分类标题
        const categoryTitle = card.querySelector('.category-title');
        if (categoryTitle) {
            // 这里需要根据实际的数据结构来更新
            // 如果有data属性，使用data属性；否则保持原样
        }

        // 更新分类描述
        const categoryDesc = card.querySelector('.category-description');
        if (categoryDesc) {
            const currentDesc = categoryDesc.textContent.trim();
            if (currentDesc.includes('个国家的国旗') || currentDesc.includes('countries\' flags')) {
                // 需要重新生成描述
                const categoryName = card.getAttribute('data-category');
                if (categoryName) {
                    const countryCount = card.getAttribute('data-count') || 0;
                    categoryDesc.textContent = i18n.t('memory.categoryDescription', {count: countryCount});
                }
            }
        }

        // 更新按钮文本
        const startBtn = card.querySelector('.start-category-btn');
        if (startBtn && startBtn.textContent.includes('开始学习')) {
            startBtn.textContent = i18n.t('memory.startButton');
        }
    });

    // 更新返回按钮
    const returnButtons = document.querySelectorAll('.return-memory-btn, button[onclick*="returnToMemory"]');
    returnButtons.forEach(btn => {
        if (btn.textContent.includes('返回') || btn.textContent.includes('Return')) {
            btn.textContent = i18n.t('memory.returnToMemory');
        }
    });

    // 更新各种提示文本
    updateAllHintsText();
}

// 更新所有提示文本
function updateAllHintsText() {
    // 更新学习提示
    const hints = document.querySelectorAll('.hint, .tip, .learning-hint');
    hints.forEach(hint => {
        const hintText = hint.textContent.trim();
        if (hintText.includes('💡 系统会智能选择最适合的学习分类') ||
            hintText.includes('💡 The system will intelligently select')) {
            hint.innerHTML = i18n.t('memory.systemSmartHint');
        } else if (hintText.includes('点击开始按钮将进入该分类的学习模式') ||
                   hintText.includes('Click the start button to enter learning mode')) {
            hint.textContent = i18n.t('memory.clickStartToLearn');
        }
    });
}

// 清理所有学习完成的提示文本
function updateCompleteMessages() {
    const completeTitle = document.querySelectorAll('h3');
    completeTitle.forEach(title => {
        if (title.textContent.includes('学习完成！') || title.textContent.includes('Study Complete!')) {
            title.textContent = i18n.t('memory.studyComplete');
        }
    });
}

// 获取嵌套对象值
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

// 更新数据源选项
function updateDataSourceOptions(lang) {
    const dataSourceSelect = document.getElementById('dataSourceSelect');
    if (!dataSourceSelect) return;

    const options = dataSourceSelect.querySelectorAll('option[data-i18n]');
    options.forEach(option => {
        const key = option.getAttribute('data-i18n');
        const translation = getNestedValue(i18nData[lang], key);
        if (translation) {
            option.textContent = translation;
        }
    });
}

// 更新大洲选项
function updateContinentOptions(lang) {
    const continentSelect = document.getElementById('continentSelect');
    if (!continentSelect) return;

    const options = continentSelect.querySelectorAll('option[data-i18n]');
    options.forEach(option => {
        const key = option.getAttribute('data-i18n');
        const translation = getNestedValue(i18nData[lang], key);
        if (translation) {
            option.textContent = translation;
        }
    });
}

// 更新特征按钮
function updateStyleButtons(lang) {
    const styleButtons = document.querySelectorAll('.style-btn[data-i18n]');
    styleButtons.forEach(button => {
        const key = button.getAttribute('data-i18n');
        const translation = getNestedValue(i18nData[lang], key);
        if (translation) {
            button.textContent = translation;
        }
    });
}

// 更新排序按钮
function updateSortButtons(lang) {
    const sortButtons = document.querySelectorAll('.filter-btn[data-i18n]');
    sortButtons.forEach(button => {
        const key = button.getAttribute('data-i18n');
        const translation = getNestedValue(i18nData[lang], key);
        if (translation) {
            button.textContent = translation;
        }
    });
}

// 专门处理记忆训练模块的翻译函数
function translateMemoryTrainingModule() {
    console.log('🧠 专门翻译记忆训练模块...');
    const isChineseMode = i18n.currentLanguage === 'zh';

    // 处理分类标题 - 专门针对分类卡片
    const categoryTitles = document.querySelectorAll('.category-title, h4');
    categoryTitles.forEach(element => {
        const text = element.textContent.trim();
        // 处理分类名称，如 Europe(1) -> 欧洲（1）
        if (isChineseMode) {
            // 英文到中文的分类名称翻译
            const categoryEnToZh = {
                'Europe': '欧洲',
                'Africa': '非洲',
                'Asia': '亚洲',
                'North America': '北美洲',
                'South America': '南美洲',
                'Oceania': '大洋洲'
            };

            let newText = text;
            Object.entries(categoryEnToZh).forEach(([en, zh]) => {
                // 匹配 Europe(1) 格式并转换为 欧洲（1）
                newText = newText.replace(new RegExp(`${en}\\((\\d+)\\)`, 'g'), `${zh}（$1）`);
                // 匹配 Europe 格式并转换为 欧洲
                newText = newText.replace(new RegExp(en, 'g'), zh);
            });

            if (newText !== text) {
                element.textContent = newText;
                console.log('✅ 翻译分类标题:', text, '->', newText);
            }
        }
    });

    // 处理学习技巧标题
    const tipsElements = document.querySelectorAll('.tips-title, [class*="tip"]');
    tipsElements.forEach(element => {
        const text = element.textContent.trim();
        if (isChineseMode && (text === 'Study Tips' || text === '💡 Study Tips')) {
            element.textContent = '💡 学习技巧';
            console.log('✅ 翻译学习技巧标题:', text, '->', '💡 学习技巧');
        } else if (!isChineseMode && (text === '💡 学习技巧' || text === '学习技巧')) {
            element.textContent = '💡 Study Tips';
            console.log('✅ 翻译学习技巧标题:', text, '->', '💡 Study Tips');
        }
    });

    // 处理最后学习时间
    const lastStudiedElements = document.querySelectorAll('.last-studied, [class*="studied"]');
    lastStudiedElements.forEach(element => {
        let text = element.textContent.trim();
        if (isChineseMode && text.startsWith('Last studied:')) {
            text = text.replace('Last studied:', '上次学习:');
            element.textContent = text;
            console.log('✅ 翻译最后学习时间:', text);
        } else if (!isChineseMode && text.startsWith('上次学习:')) {
            text = text.replace('上次学习:', 'Last studied:');
            element.textContent = text;
            console.log('✅ 翻译最后学习时间:', text);
        }
    });

    // 处理警告信息
    const warningElements = document.querySelectorAll('.warning, .alert, [class*="warning"], [class*="clear"]');
    warningElements.forEach(element => {
        const text = element.textContent.trim();
        if (isChineseMode && text.includes('This will clear all learning records and progress')) {
            element.textContent = '⚠️ 此操作将清除所有学习记录和进度，无法恢复';
            console.log('✅ 翻译警告信息:', text);
        } else if (!isChineseMode && text.includes('此操作将清除所有学习记录和进度')) {
            element.textContent = '⚠️ This will clear all learning records and progress, cannot be restored';
            console.log('✅ 翻译警告信息:', text);
        }
    });

    console.log('✅ 记忆训练模块翻译完成');
}

// 最终兜底翻译验证函数
function finalTranslationValidation() {
    console.log('🔍 最终兜底翻译验证...');
    const isChineseMode = i18n.currentLanguage === 'zh';

    // 检查所有可能遗漏的英文文本
    const memorySection = document.getElementById('memory-section');
    if (!memorySection) return;

    const allTextElements = memorySection.querySelectorAll('*');
    let fixedCount = 0;

    allTextElements.forEach(element => {
        if (element.children.length === 0 && element.textContent) {
            const text = element.textContent.trim();

            // 检查英文文本在中文模式下
            if (isChineseMode) {
                // 检查常见的英文文本模式
                const englishPatterns = [
                    /^Europe\(\d+\)/,  // Europe(1), Europe(2) 等
                    /^Africa\(\d+\)/,  // Africa(1), Africa(2) 等
                    /^Asia\(\d+\)/,    // Asia(1), Asia(2) 等
                    /^Study Tips$/,
                    /^💡 Study Tips$/,
                    /^Last studied:/,
                    /This will clear all learning records and progress/
                ];

                englishPatterns.forEach(pattern => {
                    if (pattern.test(text)) {
                        // 重新调用专门翻译器
                        translateMemoryTrainingModule();
                        fixedCount++;
                        console.log('🔧 兜底修复英文文本:', text);
                        return;
                    }
                });
            } else {
                // 检查中文文本在英文模式下
                const chinesePatterns = [
                    /^欧洲（\d+）/,  // 欧洲（1）, 欧洲（2） 等
                    /^非洲（\d+）/,  // 非洲（1）, 非洲（2） 等
                    /^亚洲（\d+）/,  // 亚洲（1）, 亚洲（2） 等
                    /^💡 学习技巧$/,
                    /^学习技巧$/,
                    /^上次学习:/,
                    /此操作将清除所有学习记录和进度/
                ];

                chinesePatterns.forEach(pattern => {
                    if (pattern.test(text)) {
                        // 重新调用专门翻译器
                        translateMemoryTrainingModule();
                        fixedCount++;
                        console.log('🔧 兜底修复中文文本:', text);
                        return;
                    }
                });
            }
        }
    });

    if (fixedCount > 0) {
        console.log(`✅ 兜底机制修复了 ${fixedCount} 个文本`);
    } else {
        console.log('✅ 所有文本都已正确翻译');
    }
}

// 语言切换事件监听已移至 setupEventListeners() 函数中

// 测试记忆训练页面翻译修复
window.testMemoryTranslationFix = function() {
    console.group('🧠 测试记忆训练页面翻译修复');

    // 确保在记忆训练页面
    if (currentSection !== 'memory') {
        console.log('📝 切换到记忆训练页面...');
        showSection('memory');

        // 等待页面加载完成
        setTimeout(() => {
            performMemoryTranslationTest();
        }, 1000);
    } else {
        performMemoryTranslationTest();
    }

    function performMemoryTranslationTest() {
        console.log('📋 当前状态:');
        console.log(`- 当前语言: ${i18n.getCurrentLanguage()}`);
        console.log(`- i18n 加载状态: ${i18n.loaded}`);

        // 检查当前页面元素
        console.log('\n🔍 检查页面元素:');

        const elements = [
            { selector: 'h2', name: '概览标题' },
            { selector: 'h3', name: '分类标题' },
            { selector: 'button', name: '按钮' },
            { selector: '.stat-label', name: '统计标签' },
            { selector: '.hint, .learning-hint', name: '提示文本' },
            { selector: '.category-title', name: '分类卡片标题' }
        ];

        elements.forEach(({ selector, name }) => {
            const elems = document.querySelectorAll(selector);
            console.log(`- ${name} 数量: ${elems.length}`);
            elems.forEach((elem, index) => {
                if (index < 3) {
                    const text = elem.textContent.trim();
                    // 检查是否包含翻译键
                    if (text.includes('.') || text.startsWith('memory.') || text.startsWith('quiz.')) {
                        console.log(`  ${name} ${index + 1}: "${text}" ⚠️ 发现翻译键`);
                    } else {
                        console.log(`  ${name} ${index + 1}: "${text}"`);
                    }
                }
            });
        });

        console.log('\n🔄 测试语言切换...');

        // 切换到英文
        console.log('切换到英文...');
        i18n.setLanguage('en');

        setTimeout(() => {
            console.log('英文模式检查:');
            elements.forEach(({ selector, name }) => {
                const elems = document.querySelectorAll(selector);
                elems.forEach((elem, index) => {
                    if (index < 2) {
                        const text = elem.textContent.trim();
                        if (text.includes('.') || text.startsWith('memory.') || text.startsWith('quiz.')) {
                            console.log(`  ❌ ${name} ${index + 1}: "${text}" (未修复)`);
                        } else {
                            console.log(`  ✅ ${name} ${index + 1}: "${text}"`);
                        }
                    }
                });
            });

            // 切换回中文
            console.log('\n切换回中文...');
            i18n.setLanguage('zh');

            setTimeout(() => {
                console.log('中文模式检查:');
                elements.forEach(({ selector, name }) => {
                    const elems = document.querySelectorAll(selector);
                    elems.forEach((elem, index) => {
                        if (index < 2) {
                            const text = elem.textContent.trim();
                            if (text.includes('.') || text.startsWith('memory.') || text.startsWith('quiz.')) {
                                console.log(`  ❌ ${name} ${index + 1}: "${text}" (未修复)`);
                            } else {
                                console.log(`  ✅ ${name} ${index + 1}: "${text}"`);
                            }
                        }
                    });
                });

                console.log('\n✅ 记忆训练页面翻译测试完成！');
                console.log('💡 如果所有元素都正确显示中英文，说明修复成功');
                console.groupEnd();
            }, 500);
        }, 500);
    }

    return {
        currentLanguage: i18n.getCurrentLanguage(),
        currentSection: currentSection,
        isLoaded: i18n.loaded
    };
};

// 测试国旗卡片名称显示修复
window.testFlagCardNames = function() {
    console.group('🏳️ 测试国旗卡片名称显示修复');

    // 确保在浏览模式
    if (currentSection !== 'browse') {
        console.log('📝 切换到浏览模式...');
        showSection('browse');

        // 等待页面加载完成
        setTimeout(() => {
            performNameTest();
        }, 1000);
    } else {
        performNameTest();
    }

    function performNameTest() {
        const flagCards = document.querySelectorAll('.flag-card');
        console.log(`找到 ${flagCards.length} 个国旗卡片`);

        if (flagCards.length === 0) {
            console.log('⚠️ 没有找到国旗卡片，正在生成...');
            displayFlags();
            setTimeout(() => {
                performNameTest();
            }, 1000);
            return;
        }

        console.log('\n📋 检查名称显示是否正确:');
        let hasIssues = false;

        flagCards.forEach((card, index) => {
            if (index >= 5) return; // 只检查前5个卡片

            const nameCN = card.querySelector('.flag-name-cn');
            const nameEN = card.querySelector('.flag-name-en');

            const cnText = nameCN?.textContent || '无';
            const enText = nameEN?.textContent || '无';

            console.log(`\n卡片 ${index + 1}:`);
            console.log(`  中文名称: "${cnText}"`);
            console.log(`  英文名称: "${enText}"`);

            // 检查是否两个名称相同（这是问题所在）
            if (cnText === enText && cnText !== '无') {
                console.log(`  ⚠️ 问题：中英文名称相同 "${cnText}"`);
                hasIssues = true;
            } else {
                console.log(`  ✅ 正确：中英文名称不同`);
            }

            // 检查是否包含中文字符但英文名显示也是中文
            if (/[\u4e00-\u9fa5]/.test(cnText) && /[\u4e00-\u9fa5]/.test(enText)) {
                console.log(`  ⚠️ 问题：英文名显示为中文`);
                hasIssues = true;
            }
        });

        if (!hasIssues) {
            console.log('\n✅ 所有国旗卡片的名称显示都正确！');
            console.log('中文和英文名称分别正确显示');
        } else {
            console.log('\n❌ 发现名称显示问题，请检查修复效果');
        }

        console.groupEnd();
    }

    return {
        currentLanguage: i18n.getCurrentLanguage(),
        currentSection: currentSection,
        cardCount: document.querySelectorAll('.flag-card').length
    };
};

// 3D地球仪相关变量
let globeScene, globeCamera, globeRenderer, globeControls;
let earth, worldGeometry, countryMeshes = [];
let globeMousePosition = new THREE.Vector2();
let globeRaycaster = new THREE.Raycaster();
let hoveredCountry = null;
let worldData = null;
let globeInitialized = false;
let applyGlobeInertia = null; // 惯性旋转函数
let starField = null; // 星空对象
let starOpacities = null; // 星星透明度数组（用于闪烁）
let starTwinkleSpeed = null; // 星星闪烁速度数组
let autoRotateEnabled = true; // 地球自动旋转开关
let isDraggingGlobe = false; // 是否正在拖拽地球

// Canvas纹理相关变量
let worldCanvas = null;
let worldCanvasCtx = null;
let worldTexture = null;
let countryColorMap = {}; // 国家代码 -> 颜色映射
let countryPixelMap = {}; // 像素坐标 -> 国家代码映射

// ID Canvas用于精确检测国家（每个国家用唯一ID颜色）
let idCanvas = null;
let idCanvasCtx = null;
let countryIdMap = {}; // ID颜色 -> 国家代码映射
let idCounter = 1; // ID计数器

// 世界地图配色方案 - 参考世界地图，每个国家使用单一鲜艳颜色
const worldMapColorPalette = [
    // 鲜艳的红色系
    0xFF6B6B, 0xFF5252, 0xE74C3C, 0xF44336, 0xD32F2F,
    // 橙色系
    0xFFA726, 0xFF9800, 0xFB8C00, 0xF57C00, 0xFF7043,
    // 黄色系
    0xFFEB3B, 0xFFD54F, 0xFFC107, 0xFFB300, 0xFDD835,
    // 绿色系
    0x66BB6A, 0x4CAF50, 0x43A047, 0x2E7D32, 0x1B5E20,
    0x81C784, 0x66BB6A, 0x4CAF50, 0x388E3C, 0x2E7D32,
    // 青色系
    0x26C6DA, 0x00BCD4, 0x00ACC1, 0x0097A7, 0x00838F,
    // 蓝色系
    0x42A5F5, 0x2196F3, 0x1E88E5, 0x1976D2, 0x1565C0,
    0x5C6BC0, 0x3F51B5, 0x3949AB, 0x303F9F, 0x283593,
    // 紫色系
    0xAB47BC, 0x9C27B0, 0x8E24AA, 0x7B1FA2, 0x6A1B9A,
    0xBA68C8, 0xAB47BC, 0x9C27B0, 0x8E24AA, 0x7B1FA2,
    // 粉色系
    0xEC407A, 0xE91E63, 0xD81B60, 0xC2185B, 0xAD1457,
    // 深粉色
    0xF06292, 0xEC407A, 0xE91E63, 0xD81B60, 0xC2185B,
    // 玫瑰红
    0xEF5350, 0xE57373, 0xEF5350, 0xF44336, 0xE53935,
    // 靛青色
    0x5C6BC0, 0x7986CB, 0x9FA8DA, 0xC5CAE9, 0x3F51B5,
    // 深绿色
    0x66BB6A, 0x81C784, 0xA5D6A7, 0xC8E6C9, 0x4CAF50,
    // 棕色系
    0xA1887F, 0x8D6E63, 0x795548, 0x6D4C41, 0x5D4037,
    // 深橙色
    0xFF7043, 0xFF5722, 0xF4511E, 0xE64A19, 0xD84315,
    // 浅蓝色
    0x81D4FA, 0x4FC3F7, 0x29B6F6, 0x03A9F4, 0x039BE5,
    // 浅绿色
    0xAED581, 0x9CCC65, 0x8BC34A, 0x7CB342, 0x689F38,
    // 黄绿色
    0xDCE775, 0xD4E157, 0xCDDC39, 0xC0CA33, 0xAFB42B,
    // 青柠色
    0xAED581, 0x9CCC65, 0x8BC34A, 0x7CB342, 0x689F38
];

// 生成独特的国家颜色 - 全球统一调色板
function getCountryColor(continent, countryCode, index) {
    // 使用国家代码生成一个稳定的哈希值
    let hash = 0;
    const code = countryCode || `country_${index}`;
    for (let i = 0; i < code.length; i++) {
        hash = ((hash << 5) - hash + code.charCodeAt(i)) & 0xffffffff;
    }

    // 确保哈希值为正数
    hash = Math.abs(hash);

    // 直接从调色板中选择颜色，不做额外变化
    const colorIndex = hash % worldMapColorPalette.length;
    return worldMapColorPalette[colorIndex];
}

// 悬停高亮颜色
function getHoverColor(originalColor) {
    const color = new THREE.Color(originalColor);
    const hsl = {};
    color.getHSL(hsl);

    // 增加亮度和饱和度来创建高亮效果
    color.setHSL(hsl.h, Math.min(1.0, hsl.s + 0.3), Math.min(0.9, hsl.l + 0.2));
    return color.getHex();
}

// 初始化3D地球仪
async function initGlobe() {
    if (globeInitialized) return;

    console.log('🌍 开始初始化3D地球仪...');

    try {
        const container = document.getElementById('globe-canvas-container');
        if (!container) {
            console.error('❌ 找不到地球仪容器元素');
            return;
        }

        // 检查Three.js是否加载
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js库未加载');
            return;
        }

        // 设置场景
        globeScene = new THREE.Scene();
        globeScene.background = new THREE.Color(0x000000); // 纯黑背景，突出星空

        // 设置相机
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 600;
        globeCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        globeCamera.position.z = 5;

        // 设置渲染器
        globeRenderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        globeRenderer.setSize(width, height);
        globeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比例以提高性能
        container.appendChild(globeRenderer.domElement);

        // 创建星空背景
        createStarfield();

        // 创建地球
        await createEarth();

        // 加载世界地图数据
        await loadWorldData();

        // 添加控制器并保存惯性函数
        applyGlobeInertia = addGlobeControls();

        // 添加事件监听
        addGlobeEventListeners();

        // 开始渲染循环
        animateGlobe();

        // 隐藏加载状态
        const loading = document.getElementById('globe-loading');
        if (loading) loading.style.display = 'none';

        globeInitialized = true;
        console.log('🌍 3D地球仪初始化完成');
    } catch (error) {
        console.error('❌ 3D地球仪初始化失败:', error);

        // 显示错误信息
        const loading = document.getElementById('globe-loading');
        if (loading) {
            loading.innerHTML = `
                <div class="error-message">
                    <h3>❌ 3D地球仪加载失败</h3>
                    <p>您的浏览器可能不支持WebGL或Three.js库加载失败</p>
                    <p>请尝试使用现代浏览器或刷新页面</p>
                </div>
            `;
        }
    }
}

// 创建星星纹理（圆形带光晕）
function createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // 创建径向渐变（中心亮，边缘暗）
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');    // 中心：亮白色
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)'); // 内圈：半透明白色
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)'); // 中圈：光晕
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)'); // 外圈：微弱光晕
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');     // 边缘：完全透明

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// 创建星空背景
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 15000; // 增加星星数量

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // 初始化闪烁数据
    starOpacities = new Float32Array(starCount);
    starTwinkleSpeed = new Float32Array(starCount);

    // 生成随机星星
    for (let i = 0; i < starCount; i++) {
        // 随机位置（球形分布）
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 50 + Math.random() * 50; // 距离范围：50-100

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        // 星星颜色（更多样化）
        const starType = Math.random();
        if (starType < 0.7) {
            // 70% 白色星星
            const brightness = 0.8 + Math.random() * 0.2;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = 1.0;
        } else if (starType < 0.85) {
            // 15% 蓝色星星
            colors[i * 3] = 0.6 + Math.random() * 0.2;
            colors[i * 3 + 1] = 0.7 + Math.random() * 0.2;
            colors[i * 3 + 2] = 1.0;
        } else {
            // 15% 黄色/橙色星星
            colors[i * 3] = 1.0;
            colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i * 3 + 2] = 0.6 + Math.random() * 0.2;
        }

        // 星星大小（更大范围的变化）
        const sizeRandom = Math.random();
        if (sizeRandom < 0.8) {
            // 80% 小星星
            sizes[i] = 0.5 + Math.random() * 1.5;
        } else if (sizeRandom < 0.95) {
            // 15% 中等星星
            sizes[i] = 2 + Math.random() * 2;
        } else {
            // 5% 大星星（明亮的恒星）
            sizes[i] = 4 + Math.random() * 3;
        }

        // 初始化闪烁参数
        starOpacities[i] = 0.5 + Math.random() * 0.5; // 初始透明度 0.5-1.0
        starTwinkleSpeed[i] = 0.0005 + Math.random() * 0.002; // 闪烁速度
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('alpha', new THREE.BufferAttribute(starOpacities, 1));

    // 创建星星纹理
    const starTexture = createStarTexture();

    // 使用ShaderMaterial实现独立的星星透明度
    const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            pointTexture: { value: starTexture }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            attribute float alpha;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vColor = color;
                vAlpha = alpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            varying vec3 vColor;
            varying float vAlpha;

            void main() {
                vec4 texColor = texture2D(pointTexture, gl_PointCoord);
                gl_FragColor = vec4(vColor, 1.0) * texColor * vAlpha;
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    starField = new THREE.Points(starsGeometry, starsMaterial);
    globeScene.add(starField);

    console.log('✨ 星空背景已创建（包含光晕和闪烁效果）');
}

// 创建地球（使用Canvas纹理）
async function createEarth() {
    const geometry = new THREE.SphereGeometry(2, 64, 64);

    // 创建显示用的Canvas
    worldCanvas = document.createElement('canvas');
    worldCanvas.width = 2048;  // 高分辨率纹理
    worldCanvas.height = 1024; // 2:1比例（等距圆柱投影）
    worldCanvasCtx = worldCanvas.getContext('2d', { willReadFrequently: true });

    // 初始化为海洋颜色
    worldCanvasCtx.fillStyle = '#4488BB';
    worldCanvasCtx.fillRect(0, 0, worldCanvas.width, worldCanvas.height);

    // 创建ID检测用的隐藏Canvas（关闭抗锯齿）
    idCanvas = document.createElement('canvas');
    idCanvas.width = 2048;
    idCanvas.height = 1024;
    idCanvasCtx = idCanvas.getContext('2d', {
        willReadFrequently: true,
        alpha: false
    });
    // 关闭抗锯齿以获得精确的颜色
    idCanvasCtx.imageSmoothingEnabled = false;

    // 初始化为海洋颜色
    idCanvasCtx.fillStyle = '#4488BB';
    idCanvasCtx.fillRect(0, 0, idCanvas.width, idCanvas.height);

    // 创建纹理
    worldTexture = new THREE.CanvasTexture(worldCanvas);
    worldTexture.needsUpdate = true;

    // 使用纹理的材质
    const material = new THREE.MeshBasicMaterial({
        map: worldTexture,
        side: THREE.FrontSide,
        depthTest: true,
        depthWrite: true
    });

    earth = new THREE.Mesh(geometry, material);
    earth.renderOrder = 0;
    globeScene.add(earth);

    console.log('🌍 地球球体已创建（使用Canvas纹理 + ID Canvas）');
}

// 加载世界地图数据
async function loadWorldData() {
    try {
        // 优先尝试加载详细地图数据
        let response;
        try {
            response = await fetch('./world_detailed.geojson');
            if (!response.ok) throw new Error('详细地图数据不存在');
        } catch (e) {
            console.log('📍 使用简化地图数据...');
            response = await fetch('./world_simple.geojson');
        }

        worldData = await response.json();
        console.log('🗺️ 世界地图数据加载完成:', worldData.features.length, '个国家/地区');

        // 创建国家填充
        createCountryMeshes();
    } catch (error) {
        console.error('❌ 加载世界地图数据失败:', error);
    }
}

// 创建国家填充（在Canvas上绘制）
function createCountryMeshes() {
    if (!worldData || !worldData.features) {
        console.error('❌ worldData 未加载或无效');
        return;
    }

    console.log('🎨 开始在Canvas上绘制国家...');

    // 清除显示Canvas
    worldCanvasCtx.fillStyle = '#4488BB';
    worldCanvasCtx.fillRect(0, 0, worldCanvas.width, worldCanvas.height);

    // 清除ID Canvas
    idCanvasCtx.fillStyle = '#4488BB';
    idCanvasCtx.fillRect(0, 0, idCanvas.width, idCanvas.height);

    // 重置映射
    countryColorMap = {};
    countryIdMap = {};
    idCounter = 1;

    const canvasWidth = worldCanvas.width;
    const canvasHeight = worldCanvas.height;

    // 坐标转换函数
    const coordsToCanvas = (lon, lat) => {
        const x = ((lon + 180) / 360) * canvasWidth;
        const y = ((90 - lat) / 180) * canvasHeight;
        return [x, y];
    };

    worldData.features.forEach((feature, featureIndex) => {
        if (!feature.geometry || !feature.geometry.coordinates) return;

        // 标准化国家属性
        const countryProps = {
            name: feature.properties.name || feature.properties.NAME || feature.properties.NAME_EN,
            code: (feature.id || feature.properties.ISO_A2 || feature.properties.iso_a2 || feature.properties.code || '').toLowerCase(),
            name_cn: feature.properties.cname || feature.properties.NAME_CN || feature.properties.name_cn,
            name_en: feature.properties.name || feature.properties.NAME_EN || feature.properties.name_en || feature.properties.NAME,
            continent: feature.properties.region || feature.properties.continent
        };

        if (!countryProps.code) return;

        // 为每个国家生成显示颜色和ID颜色
        let displayColor, idColor;

        if (countryColorMap[countryProps.code]) {
            displayColor = countryColorMap[countryProps.code].hex;
            idColor = countryColorMap[countryProps.code].idColor;
        } else {
            // 显示颜色（鲜艳的地图颜色）
            const continent = countryProps.continent || 'default';
            const colorHex = getCountryColor(continent, countryProps.code, featureIndex);
            displayColor = '#' + colorHex.toString(16).padStart(6, '0');

            // ID颜色（唯一的RGB值用于检测）
            const id = idCounter++;
            const r = (id & 0xFF);
            const g = ((id >> 8) & 0xFF);
            const b = ((id >> 16) & 0xFF);
            idColor = `rgb(${r},${g},${b})`;

            // 存储映射
            countryColorMap[countryProps.code] = {
                hex: displayColor,
                idColor: idColor,
                country: countryProps
            };
            countryIdMap[idColor] = countryProps.code;
        }

        // 绘制多边形到显示Canvas
        const drawPolygonDisplay = (coordinates) => {
            worldCanvasCtx.fillStyle = displayColor;
            worldCanvasCtx.strokeStyle = '#333333';
            worldCanvasCtx.lineWidth = 0.5;

            coordinates.forEach((ring, ringIndex) => {
                worldCanvasCtx.beginPath();
                ring.forEach((coord, i) => {
                    const [x, y] = coordsToCanvas(coord[0], coord[1]);
                    if (i === 0) worldCanvasCtx.moveTo(x, y);
                    else worldCanvasCtx.lineTo(x, y);
                });
                worldCanvasCtx.closePath();
                if (ringIndex === 0) worldCanvasCtx.fill();
                worldCanvasCtx.stroke();
            });
        };

        // 绘制多边形到ID Canvas（无抗锯齿，无边框）
        const drawPolygonId = (coordinates) => {
            idCanvasCtx.fillStyle = idColor;

            coordinates.forEach((ring, ringIndex) => {
                idCanvasCtx.beginPath();
                ring.forEach((coord, i) => {
                    const [x, y] = coordsToCanvas(coord[0], coord[1]);
                    if (i === 0) idCanvasCtx.moveTo(x, y);
                    else idCanvasCtx.lineTo(x, y);
                });
                idCanvasCtx.closePath();
                if (ringIndex === 0) idCanvasCtx.fill();
            });
        };

        // 处理不同的几何类型
        if (feature.geometry.type === 'Polygon') {
            drawPolygonDisplay(feature.geometry.coordinates);
            drawPolygonId(feature.geometry.coordinates);
        } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygon => {
                drawPolygonDisplay(polygon);
                drawPolygonId(polygon);
            });
        }
    });

    // 更新显示纹理
    worldTexture.needsUpdate = true;

    console.log('🌍 Canvas绘制完成，国家数量:', Object.keys(countryColorMap).length);
}

// 将经纬度转换为3D向量
function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
}

// 添加地球仪控制器（带惯性效果）
function addGlobeControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const damping = 0.92; // 惯性阻尼系数（0-1，越小衰减越快）
    const sensitivity = 0.006; // 旋转灵敏度

    const canvas = globeRenderer.domElement;

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        isDraggingGlobe = true; // 标记正在拖拽
        autoRotateEnabled = false; // 停止自动旋转
        rotationVelocity = { x: 0, y: 0 }; // 停止惯性
        previousMousePosition = { x: event.clientX, y: event.clientY };
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            // 计算旋转速度
            rotationVelocity.x = deltaMove.y * sensitivity;
            rotationVelocity.y = deltaMove.x * sensitivity;

            // 应用旋转（纹理会自动跟随地球旋转）
            earth.rotation.y += rotationVelocity.y;
            earth.rotation.x += rotationVelocity.x;

            // 限制X轴旋转范围，防止翻转过度
            earth.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, earth.rotation.x));

            previousMousePosition = { x: event.clientX, y: event.clientY };
        }

        // 更新鼠标位置用于射线检测
        const rect = canvas.getBoundingClientRect();
        globeMousePosition.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        globeMousePosition.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        isDraggingGlobe = false;
        canvas.style.cursor = 'grab';

        // 5秒后重新启用自动旋转
        setTimeout(() => {
            if (!isDraggingGlobe) {
                autoRotateEnabled = true;
            }
        }, 5000);
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        isDraggingGlobe = false;
        canvas.style.cursor = 'default';

        // 5秒后重新启用自动旋转
        setTimeout(() => {
            if (!isDraggingGlobe) {
                autoRotateEnabled = true;
            }
        }, 5000);
    });

    // 平滑滚轮缩放
    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        const zoomSpeed = 0.05; // 降低缩放速度
        const zoom = event.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;

        globeCamera.position.z *= zoom;
        globeCamera.position.z = Math.max(3, Math.min(10, globeCamera.position.z));
    });

    // 惯性旋转函数（在渲染循环中调用）
    return function applyInertia() {
        if (!isDragging && (Math.abs(rotationVelocity.x) > 0.0001 || Math.abs(rotationVelocity.y) > 0.0001)) {
            earth.rotation.y += rotationVelocity.y;
            earth.rotation.x += rotationVelocity.x;

            // 限制X轴旋转
            earth.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, earth.rotation.x));

            // 应用阻尼
            rotationVelocity.x *= damping;
            rotationVelocity.y *= damping;
        }
    };
}

// 添加地球仪事件监听（基于UV坐标检测）
function addGlobeEventListeners() {
    const canvas = globeRenderer.domElement;
    let lastHoveredCountryCode = null;

    // 从UV坐标获取国家信息（使用ID Canvas进行精确检测）
    const getCountryFromUV = (uv) => {
        if (!uv || !idCanvas) return null;

        // UV坐标转换为Canvas像素坐标
        const x = Math.floor(uv.x * idCanvas.width);
        const y = Math.floor((1 - uv.y) * idCanvas.height); // 翻转Y轴

        // 确保坐标在范围内
        if (x < 0 || x >= idCanvas.width || y < 0 || y >= idCanvas.height) {
            return null;
        }

        // 从ID Canvas读取像素颜色
        const imageData = idCanvasCtx.getImageData(x, y, 1, 1);
        const r = imageData.data[0];
        const g = imageData.data[1];
        const b = imageData.data[2];

        // 转换为rgb字符串
        const idColor = `rgb(${r},${g},${b})`;

        // 在ID映射中查找对应的国家代码
        const countryCode = countryIdMap[idColor];
        if (countryCode && countryColorMap[countryCode]) {
            return countryColorMap[countryCode].country;
        }

        return null;
    };

    // 鼠标移动事件 - 悬停效果
    canvas.addEventListener('mousemove', (event) => {
        // 射线检测地球表面
        globeRaycaster.setFromCamera(globeMousePosition, globeCamera);
        const intersects = globeRaycaster.intersectObject(earth);

        let hoveredCountryCode = null;

        if (intersects.length > 0) {
            const uv = intersects[0].uv;
            const countryData = getCountryFromUV(uv);

            if (countryData && countryData.code) {
                hoveredCountryCode = countryData.code;

                // 如果是新的国家，重绘Canvas高亮
                if (hoveredCountryCode !== lastHoveredCountryCode) {
                    redrawCanvasWithHighlight(hoveredCountryCode);
                    lastHoveredCountryCode = hoveredCountryCode;
                    canvas.style.cursor = 'pointer';
                }
            } else {
                // 鼠标在海洋上
                if (lastHoveredCountryCode !== null) {
                    redrawCanvasWithHighlight(null);
                    lastHoveredCountryCode = null;
                    canvas.style.cursor = 'grab';
                }
            }
        } else {
            // 鼠标离开地球
            if (lastHoveredCountryCode !== null) {
                redrawCanvasWithHighlight(null);
                lastHoveredCountryCode = null;
                canvas.style.cursor = 'grab';
            }
        }
    });

    // 鼠标点击事件
    canvas.addEventListener('click', (event) => {
        // 射线检测地球表面
        globeRaycaster.setFromCamera(globeMousePosition, globeCamera);
        const intersects = globeRaycaster.intersectObject(earth);

        if (intersects.length > 0) {
            const uv = intersects[0].uv;
            const countryData = getCountryFromUV(uv);

            if (countryData) {
                showCountryFlag(countryData);
            }
        }
    });

    // 鼠标离开画布时清除悬停效果
    canvas.addEventListener('mouseleave', () => {
        if (lastHoveredCountryCode !== null) {
            redrawCanvasWithHighlight(null);
            lastHoveredCountryCode = null;
        }
        canvas.style.cursor = 'default';
    });
}

// 重绘Canvas并高亮指定国家
function redrawCanvasWithHighlight(highlightCountryCode) {
    if (!worldData || !worldCanvas) return;

    // 清除Canvas
    worldCanvasCtx.fillStyle = '#4488BB';
    worldCanvasCtx.fillRect(0, 0, worldCanvas.width, worldCanvas.height);

    const canvasWidth = worldCanvas.width;
    const canvasHeight = worldCanvas.height;

    // 坐标转换函数
    const coordsToCanvas = (lon, lat) => {
        const x = ((lon + 180) / 360) * canvasWidth;
        const y = ((90 - lat) / 180) * canvasHeight;
        return [x, y];
    };

    // 绘制所有国家
    worldData.features.forEach((feature) => {
        if (!feature.geometry || !feature.geometry.coordinates) return;

        const countryCode = (feature.id || feature.properties.ISO_A2 || feature.properties.iso_a2 || feature.properties.code || '').toLowerCase();
        const colorData = countryColorMap[countryCode];
        if (!colorData) return;

        const isHighlighted = countryCode === highlightCountryCode;
        const fillColor = colorData.hex;

        // 绘制多边形
        const drawPolygon = (coordinates) => {
            worldCanvasCtx.fillStyle = fillColor;

            // 如果是高亮国家，使用黄色边框
            if (isHighlighted) {
                worldCanvasCtx.strokeStyle = '#FFFF00';
                worldCanvasCtx.lineWidth = 2;
            } else {
                worldCanvasCtx.strokeStyle = '#333333';
                worldCanvasCtx.lineWidth = 0.5;
            }

            coordinates.forEach((ring, ringIndex) => {
                worldCanvasCtx.beginPath();
                ring.forEach((coord, i) => {
                    const [x, y] = coordsToCanvas(coord[0], coord[1]);
                    if (i === 0) {
                        worldCanvasCtx.moveTo(x, y);
                    } else {
                        worldCanvasCtx.lineTo(x, y);
                    }
                });
                worldCanvasCtx.closePath();

                if (ringIndex === 0) {
                    worldCanvasCtx.fill();
                }
                worldCanvasCtx.stroke();
            });
        };

        if (feature.geometry.type === 'Polygon') {
            drawPolygon(feature.geometry.coordinates);
        } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach(polygon => {
                drawPolygon(polygon);
            });
        }
    });

    // 更新纹理
    worldTexture.needsUpdate = true;
}

// 显示国家国旗弹窗
function showCountryFlag(countryData) {
    console.log('🏁 点击国家:', countryData);

    // 改进的国家匹配逻辑
    let country = allCountries.find(c => c.code === countryData.code);

    // 如果通过代码找不到，尝试通过名称匹配
    if (!country) {
        country = allCountries.find(c =>
            c.nameCN === countryData.name_cn ||
            c.nameEN === countryData.name_en ||
            c.nameEN === countryData.name ||
            c.nameCN === countryData.name
        );
    }

    // 如果还是找不到，创建默认数据
    if (!country) {
        console.warn('未找到国家数据:', countryData);
        country = {
            code: countryData.code || 'unknown',
            nameCN: countryData.name_cn || countryData.name || '未知国家',
            nameEN: countryData.name_en || countryData.name || 'Unknown Country',
            continent: '未知大洲'
        };
    }

    // 创建弹窗
    const template = document.getElementById('globe-flag-popup-template');
    const popup = template.content.cloneNode(true);

    // 填充数据
    const flagImg = popup.querySelector('.popup-flag-img');
    const countryNameCn = popup.querySelector('.popup-country-name-cn');
    const countryNameEn = popup.querySelector('.popup-country-name-en');
    const countryContinent = popup.querySelector('.popup-country-continent');

    flagImg.src = `pics/${country.code}.png`;
    flagImg.alt = `${country.nameCN}国旗`;
    countryNameCn.textContent = country.nameCN;
    countryNameEn.textContent = country.nameEN;
    countryContinent.textContent = country.continent;

    // 添加到页面
    document.body.appendChild(popup);

    // 添加关闭事件
    const closeBtn = document.querySelector('.close-popup-btn');
    const overlay = document.querySelector('.popup-overlay');

    const closePopup = () => {
        const popupElement = document.querySelector('.globe-flag-popup');
        const overlayElement = document.querySelector('.popup-overlay');
        if (popupElement) popupElement.remove();
        if (overlayElement) overlayElement.remove();
    };

    if (closeBtn) closeBtn.addEventListener('click', closePopup);
    if (overlay) overlay.addEventListener('click', closePopup);

    // ESC键关闭
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closePopup();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// 地球仪渲染循环
function animateGlobe() {
    if (!globeRenderer || !globeScene || !globeCamera) return;

    requestAnimationFrame(animateGlobe);

    // 星空缓慢旋转
    if (starField) {
        starField.rotation.y += 0.0001;
        starField.rotation.x += 0.00005;

        // 星星闪烁效果
        if (starOpacities && starTwinkleSpeed) {
            const alphaAttribute = starField.geometry.attributes.alpha;
            for (let i = 0; i < starOpacities.length; i++) {
                // 正弦波闪烁
                starOpacities[i] += starTwinkleSpeed[i];
                const opacity = 0.3 + Math.abs(Math.sin(starOpacities[i])) * 0.7;
                alphaAttribute.array[i] = opacity;
            }
            alphaAttribute.needsUpdate = true;
        }
    }

    // 地球自动旋转（当未拖拽且启用自动旋转时）
    if (earth && autoRotateEnabled && !isDraggingGlobe) {
        earth.rotation.y += 0.001; // 缓慢自转
    }

    // 应用惯性旋转效果
    if (applyGlobeInertia) {
        applyGlobeInertia();
    }

    // 仅在地球仪section可见时渲染
    if (currentSection === 'globe') {
        globeRenderer.render(globeScene, globeCamera);
    }
}

// 处理窗口大小变化
function handleGlobeResize() {
    if (!globeRenderer || !globeCamera) return;

    const container = document.getElementById('globe-canvas-container');
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    globeCamera.aspect = width / height;
    globeCamera.updateProjectionMatrix();
    globeRenderer.setSize(width, height);
}

// 窗口大小变化事件监听
window.addEventListener('resize', () => {
    handleGlobeResize();
});

// 初始化应用
window.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 开始初始化应用...');

        // 首先加载国际化数据
        await loadI18nData();
        console.log('✅ i18n 数据加载完成');

        // 初始化应用功能
        await init();
        console.log('✅ 应用初始化完成');

        console.log('🏳️ 国旗系统已完全初始化');
    } catch (error) {
        console.error('❌ 初始化失败:', error);
    }
});

// 紧急恢复函数 - 如果页面显示异常，可在控制台调用此函数
window.emergencyRecovery = function() {
    console.log('🚨 执行紧急恢复...');

    try {
        // 强制显示浏览模式
        showSection('browse');

        // 强制重新显示国旗
        if (typeof displayFlags === 'function') {
            displayFlags();
        }

        // 强制更新导航按钮状态
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const browseBtn = document.getElementById('browseBtn');
        if (browseBtn) {
            browseBtn.classList.add('active');
        }

        console.log('✅ 紧急恢复完成');
        return true;
    } catch (error) {
        console.error('❌ 紧急恢复失败:', error);
        return false;
    }
};

console.log('💡 如果页面显示异常，请在控制台输入: emergencyRecovery()');

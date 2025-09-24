// 全局变量
let allCountries = [];
let filteredCountries = [];
let currentSection = 'browse';
let selectedContinent = 'all';
let selectedStyles = new Set();
let sortMethod = 'name';
let searchTerm = '';
let selectedDataSource = 'all';

// 国际化相关变量
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
    loadStats();
    await loadCountriesData();
    setupEventListeners();
    displayFlags();

    // 初始化增强记忆系统
    if (typeof EnhancedMemorySystem !== 'undefined') {
        EnhancedMemorySystem.init();
    }
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
    safeAddEventListener('statsBtn', 'click', () => showSection('stats'));

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
        if (confirm('确定要清除所有统计数据吗？')) {
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
    currentSection = section;
    
    // 更新导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (section === 'browse') safeSetClass('browseBtn', 'active');
    if (section === 'quiz') safeSetClass('quizBtn', 'active');
    if (section === 'memory') safeSetClass('memoryBtn', 'active');
    if (section === 'stats') {
        safeSetClass('statsBtn', 'active');
        updateStatsDisplay();
    }
    
    // 显示对应区域
    safeSetDisplay('browse-section', section === 'browse' ? 'block' : 'none');
    safeSetDisplay('quiz-section', section === 'quiz' ? 'block' : 'none');
    safeSetDisplay('memory-section', section === 'memory' ? 'block' : 'none');
    safeSetDisplay('stats-section', section === 'stats' ? 'block' : 'none');
    
    // 重置测试状态
    if (section === 'quiz') {
        resetQuizState();
    }
    
    // 处理记忆训练区域
    if (section === 'memory') {
        EnhancedMemorySystem.showMemory();
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
    if (element) element.style.display = display;
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
            img.alt = country.nameCN;
            img.onerror = function() {
                this.src = `https://via.placeholder.com/200x140/f0f0f0/999?text=${country.code.toUpperCase()}`;
            };
        }
        
        // 设置国家名称
        const nameCN = flagCard.querySelector('.flag-name-cn');
        if (nameCN) nameCN.textContent = country.nameCN;
        
        const nameEN = flagCard.querySelector('.flag-name-en');
        if (nameEN) nameEN.textContent = country.nameEN;
        
        // 设置标签
        const continentTag = flagCard.querySelector('.continent-tag');
        if (continentTag) {
            continentTag.textContent = country.continent;
        }
        
        // 设置风格标签
        const styleTag = flagCard.querySelector('.style-tag');
        if (styleTag && country.styles && country.styles.length > 0) {
            styleTag.textContent = country.styles[0];
            // 添加更多风格标签
            for (let i = 1; i < Math.min(country.styles.length, 3); i++) {
                const newStyleTag = styleTag.cloneNode();
                newStyleTag.textContent = country.styles[i];
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
        alert('请先选择测试类型！');
        return;
    }

    // 确保i18n数据已加载
    if (!i18nData[currentLang] || !i18nData[currentLang].quiz) {
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
    
    const questionTemplate = i18nData[currentLang]?.quiz?.question || '第 {current} / {total} 题';
    safeSetText('questionNumber', questionTemplate.replace('{current}', currentQuestion + 1).replace('{total}', total));
    
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
                    const flagQuestionText = i18nData[currentLang]?.quiz?.flagQuestion || '这是哪个国家的国旗？';
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
                    textSpan.textContent = currentLang === 'zh' ? opt.nameCN : opt.nameEN;
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
                countryName.textContent = currentLang === 'zh' ? q.correct.nameCN : q.correct.nameEN;
            }

            // 更新国家选择国旗的问题文本
            const questionText = templateContent.querySelector('.question-text');
            if (questionText) {
                const template = i18nData[currentLang]?.quiz?.countryQuestion || '请选择 {country} 的国旗';
                questionText.textContent = template.replace('{country}', currentLang === 'zh' ? q.correct.nameCN : q.correct.nameEN);
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
    
    const messages = i18nData[currentLang]?.quiz?.messages || {};
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

    // 在显示错题后立即更新标签
    setTimeout(() => {
        updateWrongAnswersLabels(currentLang);
    }, 100);
    
    wrongAnswers.forEach(wrong => {
        if (wrong.questionType === 'flag-to-country') {
            // 使用国旗到国家错题模板
            const flagTemplate = document.getElementById('wrong-answer-flag-template');
            if (flagTemplate) {
                const templateContent = flagTemplate.content.cloneNode(true);
                
                // 设置题号
                const questionNumber = templateContent.querySelector('.wrong-question-number');
                const questionTemplate = i18nData[currentLang]?.quiz?.questionNumber || '第 {index} 题';
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
                if (correctText) correctText.textContent = currentLang === 'zh' ? wrong.correctCountry.nameCN : wrong.correctCountry.nameEN;

                // 设置错误答案
                const wrongText = templateContent.querySelector('.answer-text.wrong');
                if (wrongText) wrongText.textContent = currentLang === 'zh' ? wrong.selectedCountry.nameCN : wrong.selectedCountry.nameEN;

                // 更新错题详情模板中的国际化文本
                const questionType = templateContent.querySelector('.wrong-question-type');
                if (questionType) {
                    questionType.textContent = i18nData[currentLang]?.quiz?.wrongAnswers?.flagToCountry || '看国旗选国家';
                }

                const correctLabel = templateContent.querySelector('.answer-label.correct');
                if (correctLabel) {
                    correctLabel.textContent = i18nData[currentLang]?.quiz?.wrongAnswers?.correctAnswer || '正确答案：';
                }

                const wrongLabel = templateContent.querySelector('.answer-label.wrong');
                if (wrongLabel) {
                    wrongLabel.textContent = i18nData[currentLang]?.quiz?.wrongAnswers?.yourAnswer || '你的答案：';
                }

                container.appendChild(templateContent);
            }
        } else {
            // 使用国家到国旗错题模板
            const countryTemplate = document.getElementById('wrong-answer-country-template');
            if (countryTemplate) {
                const templateContent = countryTemplate.content.cloneNode(true);
                
                // 设置题号
                const questionNumber = templateContent.querySelector('.wrong-question-number');
                const questionTemplate = i18nData[currentLang]?.quiz?.questionNumber || '第 {index} 题';
                if (questionNumber) questionNumber.textContent = questionTemplate.replace('{index}', wrong.questionIndex);
                
                // 设置国家名称
                const countryName = templateContent.querySelector('.country-name');
                if (countryName) countryName.textContent = currentLang === 'zh' ? wrong.correctCountry.nameCN : wrong.correctCountry.nameEN;
                
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
                    questionType.textContent = i18nData[currentLang]?.quiz?.wrongAnswers?.countryToFlag || '看国家选国旗';
                }

                const correctLabel = templateContent.querySelector('.flag-option.correct .flag-label');
                if (correctLabel) {
                    const correctText = i18nData[currentLang]?.quiz?.wrongAnswers?.correctAnswer || '正确答案：';
                    correctLabel.textContent = correctText;
                    console.log('Setting correct label to:', correctText, 'Current lang:', currentLang);
                }

                const wrongLabel = templateContent.querySelector('.flag-option.wrong .flag-label');
                if (wrongLabel) {
                    const wrongText = i18nData[currentLang]?.quiz?.wrongAnswers?.yourAnswer || '你的答案：';
                    wrongLabel.textContent = wrongText;
                    console.log('Setting wrong label to:', wrongText, 'Current lang:', currentLang);
                }

                container.appendChild(templateContent);

                // 确保在DOM中再次更新文本
                setTimeout(() => {
                    const addedCorrectLabel = container.querySelector('.flag-option.correct .flag-label');
                    const addedWrongLabel = container.querySelector('.flag-option.wrong .flag-label');

                    if (addedCorrectLabel) {
                        const correctText = i18nData[currentLang]?.quiz?.wrongAnswers?.correctAnswer || '正确答案：';
                        addedCorrectLabel.textContent = correctText;
                        console.log('DOM update - Setting correct label to:', correctText);
                    }

                    if (addedWrongLabel) {
                        const wrongText = i18nData[currentLang]?.quiz?.wrongAnswers?.yourAnswer || '你的答案：';
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
    // 按大洲分类数据（自动分组，每组最多15个国家）
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
        console.log('增强版记忆系统已初始化');
        this.checkDailyProgress();
        this.initContinentCategories();
    },

    // 初始化按大洲分类（自动分组，每组最多15个国家）
    initContinentCategories() {
        // 清空分类
        this.categories = {};

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

        // 为每个大洲创建分组（每组最多12个国家）
        Object.entries(continentGroups).forEach(([continent, countries]) => {
            const totalCountries = countries.length;
            const groupCount = Math.ceil(totalCountries / 12);

            for (let i = 0; i < groupCount; i++) {
                const startIndex = i * 12;
                const endIndex = Math.min(startIndex + 12, totalCountries);
                const groupCountries = countries.slice(startIndex, endIndex);

                let categoryName;
                if (groupCount === 1) {
                    categoryName = this.getLocalizedContinentName(continent);
                } else {
                    categoryName = `${this.getLocalizedContinentName(continent)}（${i + 1}）`;
                }

                this.categories[categoryName] = {
                    description: this.getContinentDescription(continent, i + 1, groupCount),
                    countries: groupCountries.map(c => c.code),
                    tips: this.getContinentTips(continent),
                    groupNumber: i + 1,
                    totalGroups: groupCount,
                    originalContinent: continent
                };
            }
        });

        console.log('大洲分类初始化完成:', this.categories);
    },

    // 获取大洲描述
    getContinentDescription(continent, groupNumber, totalGroups) {
        const continentKey = this.getContinentKey(continent);
        const descriptions = i18nData[currentLang]?.memory?.continentDescriptions || {};
        return descriptions[continentKey] || `${this.getLocalizedContinentName(continent)}地区国家的国旗`;
    },

    
    // 获取大洲学习技巧
    getContinentTips(continent) {
        const continentKey = this.getContinentKey(continent);
        const tips = i18nData[currentLang]?.memory?.continentTips || {};
        return tips[continentKey] || (i18nData[currentLang]?.memory?.defaultTip || '认真学习这些国旗的特征和含义');
    },

    // 获取本地化的大洲名称
    getLocalizedContinentName(continent) {
        const continentKey = this.getContinentKey(continent);
        return i18nData[currentLang]?.continents?.[continentKey] || continent;
    },

    // 获取大洲的键名
    getContinentKey(continent) {
        const continentMap = {
            '亚洲': 'asia',
            '欧洲': 'europe',
            '非洲': 'africa',
            '北美洲': 'northAmerica',
            '南美洲': 'southAmerica',
            '大洋洲': 'oceania'
        };
        return continentMap[continent] || continent;
    },

    showMemory() {
        const container = document.getElementById('simpleMemoryContainer');
        if (!container) return;

        const allFlags = Object.values(this.categories).flatMap(cat => cat.countries);
        const learned = allFlags.filter(code => this.progress[code]?.learned);
        const overallProgress = Math.round((learned.length / allFlags.length) * 100);
        const todayStudied = this.getTodayStudiedCount();

        // 使用记忆训练主界面模板
        const mainTemplate = document.getElementById('memory-main-template');
        if (mainTemplate) {
            container.innerHTML = '';
            const templateContent = mainTemplate.content.cloneNode(true);
            container.appendChild(templateContent);
        }

        // 更新统计数据
        this.updateMemoryStats();
        this.renderCategories();
        this.setupMemoryEventListeners();
        
        // 应用当前语言设置到动态生成的内容
        if (typeof updateLanguage === 'function') {
            setTimeout(() => {
                updateLanguage(currentLang);
            }, 100);
        }
        
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
        const categoriesContainer = document.querySelector('.categories-container');
        if (!categoriesContainer) return;

        categoriesContainer.innerHTML = '';

        Object.entries(this.categories).forEach(([name, data]) => {
            const categoryLearned = data.countries.filter(code => this.progress[code]?.learned).length;
            const progress = Math.round((categoryLearned / data.countries.length) * 100);
            const categoryProgress = this.getCategoryProgress(name);

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

            // 获取当前语言的翻译文本
            const learnedText = i18nData[currentLang]?.memory?.statsLearned || 'Learned';
            const studyTipsTitle = i18nData[currentLang]?.memory?.tipsTitle || '💡 Study Tips';
            const lastStudiedText = i18nData[currentLang]?.memory?.lastStudied || 'Last studied: ';
            
            categoryCard.innerHTML = `
                <div class="category-header">
                    <div class="category-title-wrapper">
                        <span class="category-status ${statusClass}">${statusIcon}</span>
                        <h4 class="category-title">${name}</h4>
                    </div>
                </div>
                <p class="category-description">${data.description}</p>
                <div class="category-progress">
                    <div class="category-progress-fill" style="width: ${progress}%;"></div>
                </div>
                <div class="category-stats">
                    <span class="stats-learned">${categoryLearned}/${data.countries.length} ${learnedText}</span>
                    <span class="stats-percent">${progress}%</span>
                </div>
                ${data.tips ? `
                    <div class="category-tips" style="background: #fefce8; border-left: 3px solid #fde047; border-radius: 6px; padding: 10px;">
                        <div class="tips-title" style="text-align: left; margin-bottom: 6px; font-weight: 600;">${studyTipsTitle}</div>
                        <div class="tips-content">${data.tips}</div>
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
                    this.startCategoryStudy(name);
                }, 150);
            };

            categoriesContainer.appendChild(categoryCard);
        });
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
            clearMemoryProgressBtn.addEventListener('click', () => {
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
        const categoryLearningText = i18nData[currentLang]?.memory?.categoryLearning || 'Category Learning: ';
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
        const returnToMemoryText = i18nData[currentLang]?.memory?.returnToMemory || '← Return to Memory Training';

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
        const prepareText = i18nData[currentLang]?.memory?.prepareStudy || 'Prepare to study: ';
        const studyHintTitle = i18nData[currentLang]?.memory?.studyHintTitle || 'Study Tips';
        const totalCountText = i18nData[currentLang]?.memory?.totalCount || 'Total in Category';
        const unlearnedText = i18nData[currentLang]?.memory?.unlearned || 'Unlearned';
        const learnedText = i18nData[currentLang]?.memory?.learned || 'Learned';
        const beginTestText = i18nData[currentLang]?.memory?.beginTest || 'Begin Study';
        const startSessionHint = i18nData[currentLang]?.memory?.startSessionHint || 'Click start and flags will be displayed in sequence';

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
            updateMemoryModuleText(currentLang);
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
            const dontKnowText = i18nData[currentLang]?.memory?.dontKnow || "Don't Know";
            const knowText = i18nData[currentLang]?.memory?.know || 'Know';

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
                    const nextText = i18nData[currentLang]?.memory?.next || 'Next →';
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
                updateMemoryModuleText(currentLang);
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
            if (btnText) btnText.textContent = '复习巩固';
            if (learningHint) learningHint.textContent = '💡 所有分类都已完成，开始复习巩固记忆吧！';
        } else {
            const progress = this.getCategoryProgress(selectedCategory);
            
            if (progress.status === 'in_progress' && progress.learnedCount > 0) {
                // 有未完成的学习进度
                startBtn.className = 'start-learning-btn continue-mode';
                if (btnIcon) btnIcon.textContent = '📚';
                if (btnText) btnText.textContent = '继续学习';
                if (learningHint) learningHint.textContent = `💡 继续学习"${selectedCategory}"，已完成 ${progress.learnedCount}/${progress.totalCount}`;
            } else {
                // 开始新的学习
                startBtn.className = 'start-learning-btn';
                if (btnIcon) btnIcon.textContent = '🚀';
                if (btnText) btnText.textContent = '开始学习';
                if (learningHint) learningHint.textContent = `💡 系统推荐学习"${selectedCategory}"，每次专注一个关卡`;
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
                <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 1.3rem;">确认清除学习进度？</h3>
                <p style="margin: 0 0 20px 0; color: #6b7280; line-height: 1.5;">
                    此操作将清除以下所有数据，无法恢复：<br>
                    • 所有国旗学习记录<br>
                    • 分类学习进度<br>
                    • 学习历史和统计<br>
                    • 难度标记和复习记录
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
                    ">确认清除</button>
                    <button id="cancelClearBtn" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                    ">取消</button>
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
                this.showMessage('🗑️ 学习进度已成功清除');

                // 重新显示记忆训练界面以更新UI
                setTimeout(() => {
                    this.showMemory();
                }, 1000);

            } catch (error) {
                console.error('清除学习进度时出错:', error);
                this.showMessage('❌ 清除失败，请重试');
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
    }
};

// 暴露全局函数
window.checkAnswer = checkAnswer;
window.EnhancedMemorySystem = EnhancedMemorySystem;

// 国际化功能
async function loadI18nData() {
    try {
        console.log('Loading i18n data...');
        // 添加缓存破坏参数
        const response = await fetch('i18n.json?t=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        i18nData = await response.json();
        console.log('i18n data loaded successfully:', i18nData);

        // 恢复语言偏好或从会话存储获取
        const savedLang = localStorage.getItem('preferredLanguage') ||
                        sessionStorage.getItem('currentLanguage') ||
                        'zh';
        console.log(`Setting language to: ${savedLang}`);
        updateLanguage(savedLang);

        // 如果正在运行quiz，确保问题文本也更新
        setTimeout(() => {
            if (document.getElementById('quiz-game')?.style.display !== 'none') {
                console.log('Quiz is running, updating question text after i18n load');
                updateQuizQuestionText(savedLang);
            }

            // 更新错题显示中的标签
            if (document.getElementById('wrong-answers-section')?.style.display !== 'none') {
                console.log('Wrong answers section is visible, updating labels');
                updateWrongAnswersLabels(savedLang);
            }
        }, 500);
    } catch (error) {
        console.error('Failed to load i18n data:', error);
    }
}

// 更新页面语言
function updateLanguage(lang) {
    currentLang = lang;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en-US';

    // 更新页面标题
    const title = document.querySelector('title');
    if (title && i18nData[lang]?.siteName) {
        title.textContent = i18nData[lang].siteName;
    }

    // 更新所有带有 data-i18n 属性的元素
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`Updating ${elements.length} elements to ${lang}`);
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = getNestedValue(i18nData[lang], key);
        if (translation) {
            console.log(`Updating "${key}" from "${element.textContent}" to "${translation}"`);
            element.textContent = translation;
        } else {
            console.warn(`No translation found for key: "${key}" in language: "${lang}"`);
        }
    });

    // 更新记忆训练模块的硬编码文本
    updateMemoryModuleText(lang);

    // 更新所有带有 data-i18n-placeholder 属性的输入框
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.getAttribute('data-i18n-placeholder');
        const translation = getNestedValue(i18nData[lang], key);
        if (translation) {
            input.placeholder = translation;
        }
    });

    // 更新所有带有 data-i18n-title 属性的元素
    const titledElements = document.querySelectorAll('[data-i18n-title]');
    titledElements.forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const translation = getNestedValue(i18nData[lang], key);
        if (translation) {
            element.title = translation;
        }
    });

    // 更新语言按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // 更新数据源和选项
    updateDataSourceOptions(lang);
    updateContinentOptions(lang);
    updateStyleButtons(lang);
    updateSortButtons(lang);

    // 保存语言偏好
    localStorage.setItem('preferredLanguage', lang);

    // 特殊处理：更新quiz问题文本
    updateQuizQuestionText(lang);

    // 强制立即更新quiz中的问题文本（如果正在显示）
    setTimeout(() => {
        const quizQuestionText = document.querySelector('#quiz-game .question-text');
        if (quizQuestionText) {
            const flagQuestionText = i18nData[lang]?.quiz?.flagQuestion || '这是哪个国家的国旗？';
            quizQuestionText.textContent = flagQuestionText;
            console.log('Force updated quiz question text to:', flagQuestionText);
        }
    }, 100);
}

// 更新quiz问题文本
function updateQuizQuestionText(lang) {
    const quizQuestionText = document.querySelector('#quiz-game .question-text');
    if (quizQuestionText) {
        const flagQuestionText = i18nData[lang]?.quiz?.flagQuestion || '这是哪个国家的国旗？';
        console.log('updateQuizQuestionText: Updating from', quizQuestionText.textContent, 'to', flagQuestionText);
        quizQuestionText.textContent = flagQuestionText;

        // 确保设置成功
        setTimeout(() => {
            if (quizQuestionText.textContent !== flagQuestionText) {
                console.log('updateQuizQuestionText: Re-applying text');
                quizQuestionText.textContent = flagQuestionText;
            }
        }, 50);
    } else {
        console.log('updateQuizQuestionText: No quiz question text element found');
    }
}

// 更新错题显示中的标签文本
function updateWrongAnswersLabels(lang) {
    console.log('updateWrongAnswersLabels: Updating labels for language:', lang);

    // 调试：查看整个错题容器的内容
    const container = document.getElementById('wrong-answers-container');
    if (container) {
        console.log('Wrong answers container full HTML:');
        console.log(container.innerHTML);
    }

    // 更新国旗到国家类型的错题标签
    const flagCorrectLabels = document.querySelectorAll('#wrong-answers-container .correct-answer .answer-label');
    const flagWrongLabels = document.querySelectorAll('#wrong-answers-container .wrong-answer .answer-label');

    console.log('Found flag correct labels:', flagCorrectLabels.length);
    console.log('Found flag wrong labels:', flagWrongLabels.length);

    flagCorrectLabels.forEach((label, index) => {
        const correctText = i18nData[lang]?.quiz?.wrongAnswers?.correctAnswer || '正确答案：';
        console.log(`Flag correct label ${index}: before="${label.textContent}", after="${correctText}"`);
        label.textContent = correctText;
    });

    flagWrongLabels.forEach((label, index) => {
        const wrongText = i18nData[lang]?.quiz?.wrongAnswers?.yourAnswer || '你的答案：';
        console.log(`Flag wrong label ${index}: before="${label.textContent}", after="${wrongText}"`);
        label.textContent = wrongText;
    });

    // 更新国家到国旗类型的错题标签
    const countryCorrectLabels = document.querySelectorAll('#wrong-answers-container .flag-option.correct .flag-label');
    const countryWrongLabels = document.querySelectorAll('#wrong-answers-container .flag-option.wrong .flag-label');

    console.log('Found country correct labels:', countryCorrectLabels.length);
    console.log('Found country wrong labels:', countryWrongLabels.length);

    countryCorrectLabels.forEach((label, index) => {
        const correctText = i18nData[lang]?.quiz?.wrongAnswers?.correctAnswer || '正确答案：';
        console.log(`Country correct label ${index}: before="${label.textContent}", after="${correctText}"`);
        label.textContent = correctText;
    });

    countryWrongLabels.forEach((label, index) => {
        const wrongText = i18nData[lang]?.quiz?.wrongAnswers?.yourAnswer || '你的答案：';
        console.log(`Country wrong label ${index}: before="${label.textContent}", after="${wrongText}"`);
        label.textContent = wrongText;
    });
}

// 更新记忆训练模块的硬编码文本
function updateMemoryModuleText(lang) {
    console.log('Updating memory module text...');
    
    // 检查记忆训练模块是否已经显示
    const memorySection = document.getElementById('memory-section');
    const isMemoryVisible = memorySection && memorySection.style.display !== 'none';
    
    if (isMemoryVisible) {
        console.log('Memory section is visible, updating all dynamic content...');
        
        // 更新学习概览标题
        const overviewTitles = document.querySelectorAll('h2');
        overviewTitles.forEach(title => {
            if (title.textContent.includes('学习概览') || title.textContent.includes('Learning Overview')) {
                title.textContent = i18nData[lang]?.memory?.overviewTitle || '📚 Learning Overview';
            }
        });

        // 更新分类学习标题
        const categoryLearningTitles = document.querySelectorAll('h3');
        categoryLearningTitles.forEach(title => {
            if (title.textContent.includes('分类学习') || title.textContent.includes('Category Learning')) {
                title.textContent = i18nData[lang]?.memory?.categoryLearning || '📂 Category Learning';
            }
        });

        // 更新统计文本（包括内联样式的统计文本）
        const statLabels = document.querySelectorAll('.stat-label, div[style*="font-size: 0.9rem; opacity: 0.9;"]');
        statLabels.forEach(label => {
            const text = label.textContent.trim();
            switch(text) {
                case '已学习':
                case 'Learned':
                    label.textContent = i18nData[lang]?.memory?.statsLearned || 'Learned';
                    break;
                case '总数量':
                case 'Total':
                    label.textContent = i18nData[lang]?.memory?.statsTotal || 'Total';
                    break;
                case '完成度':
                case 'Progress':
                    label.textContent = i18nData[lang]?.memory?.statsProgress || 'Progress';
                    break;
                case '今日学习':
                case 'Today':
                    label.textContent = i18nData[lang]?.memory?.statsToday || 'Today';
                    break;
                case '学习数量':
                    label.textContent = i18nData[lang]?.memory?.statsLearned || 'Learned';
                    break;
                case '新掌握':
                case 'New':
                    label.textContent = i18nData[lang]?.memory?.statsNew || 'New';
                    break;
                case '用时':
                case 'Time':
                    label.textContent = i18nData[lang]?.memory?.statsTime || 'Time';
                    break;
            }
        });

        // 更新学习进度文本
        const progressContainers = document.querySelectorAll('div[style*="background: rgba(255,255,255,0.2)"]');
        progressContainers.forEach(container => {
            const spans = container.querySelectorAll('span');
            spans.forEach(span => {
                if (span.textContent.includes('学习进度') || span.textContent.includes('Learning Progress')) {
                    span.textContent = i18nData[lang]?.memory?.learningProgress || 'Learning Progress';
                }
            });
        });

        // 更新特定进度文本（模板中硬编码的）
        const progressLabels = document.querySelectorAll('div[style*="background: rgba(255,255,255,0.2)"] span:first-child');
        progressLabels.forEach(label => {
            if (label.textContent.includes('学习进度') || label.textContent.includes('Learning Progress')) {
                label.textContent = i18nData[lang]?.memory?.learningProgress || 'Learning Progress';
            }
        });

        // 更新系统提示
        const hints = document.querySelectorAll('.learning-hint');
        hints.forEach(hint => {
            if (hint.textContent.includes('系统会智能选择最适合的学习分类') || 
                hint.textContent.includes('The system will intelligently select')) {
                hint.innerHTML = i18nData[lang]?.memory?.systemSmartHint || '💡 The system will intelligently select the most suitable learning category, focusing on one level at a time';
            }
        });

        // 更新完成提示
        const completeMessages = document.querySelectorAll('.overall-complete');
        completeMessages.forEach(msg => {
            if (msg.textContent.includes('太棒了！你已掌握所有国旗') || 
                msg.textContent.includes('Great! You have mastered all flags')) {
                msg.textContent = i18nData[lang]?.memory?.allFlagsMastered || '🎉 Great! You have mastered all flags';
            }
        });

        // 更新学习完成提示
        const sessionMessages = document.querySelectorAll('.session-type-text');
        sessionMessages.forEach(msg => {
            if (msg.textContent.includes('太棒了！你完成了学习') ||
                msg.textContent.includes('Excellent! You have completed')) {
                msg.textContent = i18nData[lang]?.memory?.studyCompleteMessage || 'Excellent! You have completed the learning session';
            }
        });

        // 更新学习完成页面的标题和统计标签
        const completeTitle = document.querySelectorAll('h3');
        completeTitle.forEach(title => {
            if (title.textContent.includes('学习完成！') || title.textContent.includes('Study Complete!')) {
                title.textContent = i18nData[lang]?.memory?.studyComplete || '🎊 Study Complete!';
            }
        });

        // 更新学习完成页面的统计标签
        const statsLabels = document.querySelectorAll('div[style*="background: rgba(255,255,255,0.2)"] div:last-child');
        statsLabels.forEach(label => {
            if (label.textContent.includes('学习数量')) {
                label.textContent = i18nData[lang]?.memory?.statsLearned || 'Learned';
            } else if (label.textContent.includes('新掌握')) {
                label.textContent = i18nData[lang]?.memory?.statsNew || 'New';
            } else if (label.textContent.includes('用时')) {
                label.textContent = i18nData[lang]?.memory?.statsTime || 'Time';
            }
        });

        // 更新学习完成页面的按钮
        const returnHomeBtns = document.querySelectorAll('.return-home-btn');
        returnHomeBtns.forEach(btn => {
            if (btn.textContent.includes('🏠 返回首页')) {
                btn.innerHTML = '🏠 ' + (i18nData[lang]?.memory?.returnHome || 'Return Home');
            }
        });

        const continueStudyBtns = document.querySelectorAll('.continue-study-btn');
        continueStudyBtns.forEach(btn => {
            if (btn.textContent.includes('🎲 继续学习')) {
                btn.innerHTML = '🎲 ' + (i18nData[lang]?.memory?.continueStudy || 'Continue Learning');
            }
        });

        // 更新开始学习按钮
        const startButtons = document.querySelectorAll('.btn-text');
        startButtons.forEach(btn => {
            if (btn.textContent.includes('开始学习') || btn.textContent.includes('Start Learning')) {
                btn.textContent = i18nData[lang]?.memory?.startButton || 'Start Learning';
            }
        });

        // 更新清除进度按钮
        const clearButtons = document.querySelectorAll('.clear-memory-btn');
        clearButtons.forEach(btn => {
            if (btn.textContent.includes('清除学习进度') || btn.textContent.includes('Clear Progress')) {
                btn.innerHTML = '🗑️ ' + (i18nData[lang]?.memory?.clearProgress || 'Clear Progress');
            }
        });

        console.log('Memory module text updated successfully');
    } else {
        console.log('Memory section is not visible, skipping dynamic content update');
    }
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

// 语言切换事件监听
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('lang-btn')) {
        const lang = e.target.getAttribute('data-lang');
        updateLanguage(lang);
    }
});

// 初始化应用
window.addEventListener('DOMContentLoaded', async () => {
    await loadI18nData();
    init();

    console.log('🏳️ 国旗系统已完全初始化');
});

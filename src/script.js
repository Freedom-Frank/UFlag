// 全局变量
let allCountries = [];
let filteredCountries = [];
let currentSection = 'browse';
let selectedContinent = 'all';
let selectedStyles = new Set();
let sortMethod = 'name';
let searchTerm = '';

// 测试相关变量
let quizType = '';
let difficulty = 'easy';
let questions = [];
let currentQuestion = 0;
let score = 0;
let startTime = null;
let timerInterval = null;

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
    generateStyleFilters();
    displayFlags();
}

// 加载统计数据
function loadStats() {
    const saved = localStorage.getItem('flagQuizStats');
    if (saved) {
        stats = JSON.parse(saved);
    }
}

// 保存统计数据
function saveStats() {
    localStorage.setItem('flagQuizStats', JSON.stringify(stats));
}

// 加载国家数据
async function loadCountriesData() {
    try {
        const response = await fetch('countries.json');
        if (response.ok) {
            const data = await response.json();
            allCountries = data.countries;
            console.log(`成功加载 ${allCountries.length} 个国家数据`);
        } else {
            throw new Error('无法加载countries.json');
        }
    } catch (error) {
        console.log('使用示例数据:', error.message);
        // 使用完整的示例数据
        allCountries = generateSampleData();
    }
    filteredCountries = [...allCountries];
    updateStats();
}

// 生成示例数据
function generateSampleData() {
    // 这里返回更完整的示例数据
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

// 生成风格筛选器
function generateStyleFilters() {
    const container = document.getElementById('styleFilters');
    if (!container) return;
    
    container.innerHTML = stylesList.map(style => `
        <button class="style-tag-btn" data-style="${style}">${style}</button>
    `).join('');
}

// 设置事件监听
function setupEventListeners() {
    // 导航按钮
    document.getElementById('browseBtn').addEventListener('click', () => showSection('browse'));
    document.getElementById('quizBtn').addEventListener('click', () => showSection('quiz'));
    document.getElementById('statsBtn').addEventListener('click', () => showSection('stats'));

    // 搜索框
    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        applyFilters();
    });

    // 大洲筛选
    document.querySelectorAll('[data-continent]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-continent]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedContinent = btn.dataset.continent;
            applyFilters();
        });
    });

    // 排序方式
    document.querySelectorAll('[data-sort]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-sort]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            sortMethod = btn.dataset.sort;
            
            // 显示/隐藏风格筛选
            const styleGroup = document.getElementById('styleFilterGroup');
            if (sortMethod === 'style') {
                styleGroup.style.display = 'block';
            } else {
                styleGroup.style.display = 'none';
            }
            
            applyFilters();
        });
    });

    // 风格筛选（事件委托）
    document.getElementById('styleFilters')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('style-tag-btn')) {
            const style = e.target.dataset.style;
            e.target.classList.toggle('active');
            
            if (selectedStyles.has(style)) {
                selectedStyles.delete(style);
            } else {
                selectedStyles.add(style);
            }
            applyFilters();
        }
    });

    // 测试类型选择
    document.querySelectorAll('.quiz-type-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.quiz-type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            quizType = card.dataset.type;
            document.getElementById('startQuizBtn').style.display = 'block';
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
    document.getElementById('startQuizBtn')?.addEventListener('click', startQuiz);
    document.getElementById('retryBtn')?.addEventListener('click', startQuiz);
    document.getElementById('backBtn')?.addEventListener('click', () => showSection('browse'));

    // 清除统计
    document.getElementById('clearStatsBtn')?.addEventListener('click', () => {
        if (confirm('确定要清除所有统计数据吗？')) {
            stats = { totalTests: 0, totalQuestions: 0, correctAnswers: 0, bestScore: 0 };
            saveStats();
            updateStatsDisplay();
        }
    });
}

// 切换显示区域
function showSection(section) {
    currentSection = section;
    
    // 更新导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (section === 'browse') document.getElementById('browseBtn').classList.add('active');
    if (section === 'quiz') document.getElementById('quizBtn').classList.add('active');
    if (section === 'stats') {
        document.getElementById('statsBtn').classList.add('active');
        updateStatsDisplay();
    }
    
    // 显示对应区域
    document.getElementById('browse-section').style.display = section === 'browse' ? 'block' : 'none';
    document.getElementById('quiz-section').style.display = section === 'quiz' ? 'block' : 'none';
    document.getElementById('stats-section').style.display = section === 'stats' ? 'block' : 'none';
}

// 应用筛选
function applyFilters() {
    filteredCountries = [...allCountries];
    
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
    
    // 排序
    sortCountries();
    
    // 更新显示
    updateStats();
    displayFlags();
}

// 排序国家
function sortCountries() {
    switch (sortMethod) {
        case 'name':
            filteredCountries.sort((a, b) => a.nameCN.localeCompare(b.nameCN));
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
    document.getElementById('totalCount').textContent = allCountries.length;
    document.getElementById('filteredCount').textContent = filteredCountries.length;
}

// 显示国旗
function displayFlags() {
    const container = document.getElementById('flags-container');
    
    if (filteredCountries.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <div class="empty-icon">🔍</div>
                <h3>没有找到匹配的国旗</h3>
                <p>请尝试调整筛选条件</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredCountries.map(country => {
        const styleTags = country.styles ? country.styles.slice(0, 3).map(s => 
            `<span class="flag-tag">${s}</span>`
        ).join('') : '';
        
        return `
            <div class="flag-card">
                <img src="../pics/${country.code}.png" 
                        alt="${country.nameCN}" 
                        class="flag-img"
                        onerror="this.src='https://via.placeholder.com/200x140/f0f0f0/999?text= ${country.code.toUpperCase()}'">
                <div class="flag-info">
                    <div class="flag-name-cn">${country.nameCN}</div>
                    <div class="flag-name-en">${country.nameEN}</div>
                    <div class="flag-tags">
                        <span class="flag-tag">${country.continent}</span>
                        ${styleTags}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 开始测试
function startQuiz() {
    if (!quizType) {
        alert('请先选择测试类型！');
        return;
    }
    
    // 根据难度设置题目数量
    const questionCount = {
        easy: 5,
        medium: 10,
        hard: 20
    }[difficulty];
    
    // 生成题目
    questions = generateQuestions(questionCount);
    currentQuestion = 0;
    score = 0;
    startTime = Date.now();
    
    // 显示游戏界面
    document.getElementById('quiz-start').style.display = 'none';
    document.getElementById('quiz-game').style.display = 'block';
    document.getElementById('quiz-result').style.display = 'none';
    
    // 开始计时
    startTimer();
    
    // 显示第一题
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
        
        // 生成选项
        const options = [correct];
        const tempCountries = allCountries.filter(c => c.code !== correct.code);
        
        for (let j = 0; j < 3 && j < tempCountries.length; j++) {
            const wrongIndex = Math.floor(Math.random() * tempCountries.length);
            options.push(tempCountries[wrongIndex]);
            tempCountries.splice(wrongIndex, 1);
        }
        
        // 打乱选项
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
    
    // 更新进度
    document.getElementById('progressFill').style.width = `${((currentQuestion + 1) / total) * 100}%`;
    document.getElementById('questionNumber').textContent = `第 ${currentQuestion + 1} / ${total} 题`;
    
    const questionContent = document.getElementById('questionContent');
    const optionsContainer = document.getElementById('optionsContainer');
    
    if (quizType === 'flag-to-country') {
        // 显示国旗，选择国家
        questionContent.innerHTML = `
            <img src="../pics/${q.correct.code}.png" 
                    class="question-flag"
                    alt="国旗"
                    onerror="this.src='https://via.placeholder.com/360x240/f0f0f0/999?text= ${q.correct.code.toUpperCase()}'">
            <p class="question-text">这是哪个国家的国旗？</p>
        `;
        
        optionsContainer.innerHTML = q.options.map(opt => `
            <button class="option-btn" onclick="checkAnswer('${opt.code}', '${q.correct.code}')">
                ${opt.nameCN}
            </button>
        `).join('');
    } else {
        // 显示国家，选择国旗
        questionContent.innerHTML = `
            <p class="question-text">请选择 ${q.correct.nameCN} 的国旗</p>
        `;
        
        optionsContainer.innerHTML = q.options.map(opt => `
            <button class="option-btn" onclick="checkAnswer('${opt.code}', '${q.correct.code}')">
                <img src="../pics/${opt.code}.png" 
                        class="option-flag"
                        alt="${opt.nameCN}"
                        onerror="this.src='https://via.placeholder.com/200x80/f0f0f0/999?text= ${opt.code.toUpperCase()}'">
            </button>
        `).join('');
    }
}

// 检查答案
function checkAnswer(selected, correct) {
    const buttons = document.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => {
        btn.disabled = true;
        
        // 获取按钮对应的国家代码
        const btnCode = btn.onclick.toString().match(/checkAnswer\('([^']+)'/)[1];
        
        if (btnCode === correct) {
            btn.classList.add('correct');
        } else if (btnCode === selected) {
            btn.classList.add('wrong');
        }
    });
    
    if (selected === correct) {
        score++;
    }
    
    // 1.5秒后显示下一题
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

// 结束测试
function endQuiz() {
    clearInterval(timerInterval);
    const endTime = Date.now();
    const timeSpent = Math.floor((endTime - startTime) / 1000);
    
    // 更新统计
    stats.totalTests++;
    stats.totalQuestions += questions.length;
    stats.correctAnswers += score;
    if (score > stats.bestScore) {
        stats.bestScore = score;
    }
    saveStats();
    
    // 显示结果
    document.getElementById('quiz-game').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'block';
    
    const accuracy = Math.round((score / questions.length) * 100);
    document.getElementById('scoreDisplay').textContent = `${score}/${questions.length}`;
    document.getElementById('correctCount').textContent = score;
    document.getElementById('wrongCount').textContent = questions.length - score;
    document.getElementById('accuracyRate').textContent = `${accuracy}%`;
    document.getElementById('timeSpent').textContent = formatTime(timeSpent);
    
    // 结果评语
    let message = '';
    if (accuracy === 100) {
        message = '完美！你是真正的国旗专家！🏆';
    } else if (accuracy >= 80) {
        message = '优秀！你的国旗知识非常丰富！⭐';
    } else if (accuracy >= 60) {
        message = '不错！继续努力，你会更棒的！💪';
    } else if (accuracy >= 40) {
        message = '加油！多练习就能进步！📚';
    } else {
        message = '没关系，学习需要时间，继续努力！🌟';
    }
    document.getElementById('resultMessage').textContent = message;
}

// 计时器
function startTimer() {
    const timerEl = document.getElementById('timer');
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
    document.getElementById('totalTests').textContent = stats.totalTests;
    document.getElementById('totalQuestions').textContent = stats.totalQuestions;
    const accuracy = stats.totalQuestions > 0 
        ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) 
        : 0;
    document.getElementById('overallAccuracy').textContent = `${accuracy}%`;
    document.getElementById('bestScore').textContent = stats.bestScore;
}

// 将checkAnswer暴露到全局
window.checkAnswer = checkAnswer;

// 初始化应用
window.addEventListener('DOMContentLoaded', init);
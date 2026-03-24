let currentEventInterval = 40000;
let eventTimeRemaining = 40000;
let eventTickId = null;
let bossEventToggle = false;

function startEventSystem() {
    currentEventInterval = 40000;
    eventTimeRemaining = currentEventInterval;
    if (eventTickId) clearInterval(eventTickId);
    eventTickId = setInterval(tickEventSystem, 100);
    if (typeof updateEventTimerUI === 'function') updateEventTimerUI(eventTimeRemaining);
}

function stopEventSystem() {
    if (eventTickId) {
        clearInterval(eventTickId);
        eventTickId = null;
    }
}

function tickEventSystem() {
    if (gameState !== 'PLAYING') return;
    
    // 如果进入 Boss 战，事件间隔被固定覆盖为 10 秒
    if (typeof activeBoss !== 'undefined' && activeBoss !== null) {
        let limit = window.bossPhase2 ? 5000 : 10000;
        if (eventTimeRemaining > limit) eventTimeRemaining = limit;
    }
    
    eventTimeRemaining -= 100;
    if (typeof updateEventTimerUI === 'function') updateEventTimerUI(eventTimeRemaining);
    if (eventTimeRemaining <= 0) {
        if (typeof activeBoss !== 'undefined' && activeBoss !== null) {
            if (bossEventToggle) {
                if (typeof showAnnouncement === 'function') showAnnouncement('BOSS：左侧代码注入！');
                triggerEventD(); // 左侧狙击
            } else {
                if (typeof showAnnouncement === 'function') showAnnouncement('BOSS：右侧代码注入！');
                triggerEventC(); // 右侧狙击
            }
            bossEventToggle = !bossEventToggle;
            eventTimeRemaining = window.bossPhase2 ? 3000 : 10000;
        } else {
            triggerRandomEvent();
            currentEventInterval = Math.max(12000, currentEventInterval * 0.95);
            eventTimeRemaining = currentEventInterval;
        }
    }
}

function triggerRandomEvent() {
    if (gameState !== 'PLAYING') return;
    const events = [triggerEventA, triggerEventB, triggerEventC, triggerEventD, triggerEventE, triggerEventF];
    const ev = events[Math.floor(Math.random() * events.length)];
    ev();
}

// a:持续20秒内，持续不断地生成快速普通怪（每秒4次）
function triggerEventA() {
    if (typeof showAnnouncement === 'function') showAnnouncement('警告：高频快速请求爆发！');
    let count = 0;
    let intv = setInterval(() => {
        if (gameState !== 'PLAYING') {
            clearInterval(intv);
            return;
        }
        codeBlocks.push(new CodeBlock(container, playerStats.level, 'fast'));
        count++;
        if (count >= 80) clearInterval(intv);
    }, 250);
}

// b:直接一次性在页面中部生成一排不会动的厚血普通怪
function triggerEventB() {
    if (typeof showAnnouncement === 'function') showAnnouncement('警告：检测到大体积阻塞块！');
    const y = window.innerHeight / 2;
    let startX = 10;
    
    let first = new CodeBlock(container, playerStats.level, 'tank');
    let w = first.width + 10;
    first.x = startX; 
    first.y = y; 
    first.baseSpeedY = 0; 
    first.element.style.transform = `translate3d(${first.x}px, ${first.y}px, 0)`;
    codeBlocks.push(first);
    
    startX += w;
    while (startX + w < window.innerWidth) {
        let m = new CodeBlock(container, playerStats.level, 'tank');
        m.x = startX;
        m.y = y;
        m.baseSpeedY = 0;
        m.element.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
        codeBlocks.push(m);
        startX += w;
    }
}

// 导出事件供开发者工具调用
const gameEventsList = [
    { id: 'A', name: '高频快冲 (Fast Rush)', fn: triggerEventA },
    { id: 'B', name: '阻塞防线 (Tank Wall)', fn: triggerEventB },
    { id: 'C', name: '右侧狙击 (Right Sniper)', fn: triggerEventC },
    { id: 'D', name: '左侧狙击 (Left Sniper)', fn: triggerEventD },
    { id: 'E', name: '内存坠落 (Tanks Fall)', fn: triggerEventE },
    { id: 'F', name: '生成工厂 (Spawners)', fn: triggerEventF }
];

// c:在右侧从上到下依次生成侧向的发射子弹的怪
function triggerEventC() {
    if (typeof showAnnouncement === 'function') showAnnouncement('警告：右侧检测到侧信道攻击！');
    let count = 0;
    const maxCount = Math.floor((window.innerHeight - 100) / 60);
    let intv = setInterval(() => {
        if (gameState !== 'PLAYING') {
            clearInterval(intv);
            return;
        }
        let m = new CodeBlock(container, playerStats.level, 'side_sniper');
        m.dirX = -1;
        m.x = window.innerWidth;
        m.y = 50 + count * 60;
        m.baseSpeedX = -Math.abs(m.baseSpeedX);
        m.element.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
        codeBlocks.push(m);
        
        count++;
        if (count >= maxCount) clearInterval(intv);
    }, 500);
}

// d:c事件在左侧的版本
function triggerEventD() {
    if (typeof showAnnouncement === 'function') showAnnouncement('警告：左侧检测到侧信道攻击！');
    let count = 0;
    const maxCount = Math.floor((window.innerHeight - 100) / 60);
    let intv = setInterval(() => {
        if (gameState !== 'PLAYING') {
            clearInterval(intv);
            return;
        }
        let m = new CodeBlock(container, playerStats.level, 'side_sniper');
        m.dirX = 1;
        m.x = -m.width;
        m.y = 50 + count * 60;
        m.baseSpeedX = Math.abs(m.baseSpeedX);
        m.element.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
        codeBlocks.push(m);
        
        count++;
        if (count >= maxCount) clearInterval(intv);
    }, 500);
}

// e:在每个在场怪物的正下方生成一个厚血怪
function triggerEventE() {
    if (typeof showAnnouncement === 'function') showAnnouncement('警告：底层内存泄漏加剧！');
    const currentBlocks = codeBlocks.slice();
    currentBlocks.forEach(c => {
        let m = new CodeBlock(container, playerStats.level, 'tank');
        m.x = c.x;
        m.y = c.y + c.height + 10;
        m.element.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
        codeBlocks.push(m);
    });
}

// f:跟b一样，不过这一次是生成spawner，生成位置在顶上
function triggerEventF() {
    if (typeof showAnnouncement === 'function') showAnnouncement('警告：异常生成工厂降临！');
    const y = 130;
    let startX = 10;
    
    let first = new CodeBlock(container, playerStats.level, 'spawner');
    let w = first.width + 10;
    first.x = startX; 
    first.y = y; 
    first.baseSpeedY = 0; 
    first.element.style.transform = `translate3d(${first.x}px, ${first.y}px, 0)`;
    codeBlocks.push(first);
    
    startX += w;
    while (startX + w < window.innerWidth) {
        let m = new CodeBlock(container, playerStats.level, 'spawner');
        m.x = startX;
        m.y = y;
        m.baseSpeedY = 0;
        m.element.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`;
        codeBlocks.push(m);
        startX += w;
    }
}

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
        if (eventTimeRemaining > 10000) eventTimeRemaining = 10000;
    }
    
    eventTimeRemaining -= 100;
    if (typeof updateEventTimerUI === 'function') updateEventTimerUI(eventTimeRemaining);
    if (eventTimeRemaining <= 0) {
        if (typeof activeBoss !== 'undefined' && activeBoss !== null) {
            if (bossEventToggle) triggerEventD(); // 左侧狙击
            else triggerEventC(); // 右侧狙击
            bossEventToggle = !bossEventToggle;
            eventTimeRemaining = 10000; // 恒定 10 秒
        } else {
            triggerRandomEvent();
            currentEventInterval = Math.max(10000, currentEventInterval * 0.9);
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

// c:在右侧从上到下依次生成侧向的发射子弹的怪
function triggerEventC() {
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
    const y = 50;
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
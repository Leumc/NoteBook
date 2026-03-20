const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelDisplay = document.getElementById('level-display');
const xpBar = document.getElementById('xp-bar');

const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const levelUpScreen = document.getElementById('level-up-screen');
const topUi = document.getElementById('top-ui');
const executionZone = document.getElementById('execution-zone');
const playerElement = document.getElementById('player');
const upgradeContainer = document.getElementById('upgrade-container');
const langSelector = document.getElementById('lang-selector');
const pauseScreen = document.getElementById('pause-screen');
const pauseStats = document.getElementById('pause-stats');

// ================= 全局语言配置字典 =================
const langConfig = {
    java: {
        player: 'JVM',
        bullet: 'NullPointerException',
        enemyBullet: 'Exception()',
        startTitle: 'SYSTEM BOOT',
        startDesc: '你是 JVM（Java虚拟机）。<br><br>愚蠢的人类总是压榨你的性能，写出千疮百孔的代码。<br>现在，抛出空指针异常，把他们的代码全部消灭掉吧！',
        btnStart: 'execute()',
        btnRestart: 'reboot()',
        gameOverTitle: 'OUT OF MEMORY',
        gameOverDesc: '系统负载过高，JVM 崩溃。',
        levelUpTitle: 'GC 触发：选择优化方案',
        upgrades: {
            multiShot: { title: '多线程并发', desc: '增加一次发射的异常数量 (+1 弹道)' },
            fireRate: { title: 'JIT 编译加速', desc: '异常抛出频率提高 20%' },
            damageUp: { title: '致命异常', desc: '每个 NPE 造成的破坏力 +5' },
            bulletSpeed: { title: '低延迟 GC', desc: '异常抛出速度提升 30%' },
            pierce: { title: '深层引用穿透', desc: '抛出的异常可额外穿透 1 个代码块' },
            crit: { title: '反射暴击', desc: '15% 概率触发暴击' },
            critDamage: { title: '重度崩溃', desc: '暴击伤害倍率 +1.0x' },
            execute: { title: 'System.exit(1)', desc: '5% 概率直接秒杀普通代码块' },
            heal: { title: 'GC 回收', desc: '恢复 15 点系统负载' },
            maxLifeUp: { title: '增加堆内存', desc: '负载上限 +20 并回满' },
            shieldMaxUp: { title: '安全沙箱', desc: '护盾上限 +10 并获得等量护盾' },
            dodgeRate: { title: '异常捕获 (try-catch)', desc: '10% 概率忽略受到的系统负载伤害' },
            lifeSteal: { title: '内存泄漏吸收', desc: '击杀代码块有 5% 概率恢复 1 点负载' },
            slowAura: { title: '线程阻塞', desc: '全局代码块移动速度降低 5%' },
            knockback: { title: '异常弹回', desc: '异常击中代码块时将其击退' },
            stunChance: { title: '死锁触发', desc: '10% 概率使击中的代码块卡死 1 秒' },
            bulletSize: { title: '大对象分配', desc: '抛出的异常体积增加 50%' },
            xpGainUp: { title: 'Profiler 分析', desc: '获得的经验值增加 20%' },
            focusedFire: { title: '同步锁', desc: '缩小多弹道散射角度 20%' }
        }
    },
    python: {
        player: 'CPython',
        bullet: 'TypeError',
        enemyBullet: 'SyntaxError',
        startTitle: 'IMPORT __MAIN__',
        startDesc: '你是 Python 解释器。<br><br>人类连缩进都搞不明白，甚至试图给 NoneType 赋值。<br>用无情的 Traceback 让他们清醒一点！',
        btnStart: 'run()',
        btnRestart: 'sys.exit()',
        gameOverTitle: 'RECURSION ERROR',
        gameOverDesc: '最大递归深度超限，解释器崩溃。',
        levelUpTitle: 'GIL 释放：选择优化方案',
        upgrades: {
            multiShot: { title: '多进程/协程', desc: '增加一次发射的异常数量 (+1 弹道)' },
            fireRate: { title: 'C 扩展加速', desc: '异常抛出频率提高 20%' },
            damageUp: { title: '致命回溯', desc: '造成的破坏力 +5' },
            bulletSpeed: { title: 'Cpython 优化', desc: '异常抛出速度提升 30%' },
            pierce: { title: '命名空间穿透', desc: '抛出的异常可额外穿透 1 个代码块' },
            crit: { title: '元类黑魔法', desc: '15% 概率触发暴击' },
            critDamage: { title: '深层 Traceback', desc: '暴击伤害倍率 +1.0x' },
            execute: { title: 'os._exit()', desc: '5% 概率直接秒杀普通代码块' },
            heal: { title: 'gc.collect()', desc: '恢复 15 点系统负载' },
            maxLifeUp: { title: '放宽递归限制', desc: '负载上限 +20 并回满' },
            shieldMaxUp: { title: '虚拟环境', desc: '护盾上限 +10 并获得等量护盾' },
            dodgeRate: { title: 'except Exception:', desc: '10% 概率忽略受到的系统负载伤害' },
            lifeSteal: { title: '垃圾回收复用', desc: '击杀代码块有 5% 概率恢复 1 点负载' },
            slowAura: { title: 'GIL 竞争', desc: '全局代码块移动速度降低 5%' },
            knockback: { title: '生成器挂起', desc: '异常击中代码块时将其击退' },
            stunChance: { title: 'time.sleep()', desc: '10% 概率使击中的代码块卡死 1 秒' },
            bulletSize: { title: '胖指针对象', desc: '抛出的异常体积增加 50%' },
            xpGainUp: { title: 'cProfile 剖析', desc: '获得的经验值增加 20%' },
            focusedFire: { title: '闭包绑定', desc: '缩小多弹道散射角度 20%' }
        }
    },
    cpp: {
        player: 'Compiler',
        bullet: 'SegFault',
        enemyBullet: 'MemoryLeak',
        startTitle: 'COMPILE FAILED',
        startDesc: '你是 C/C++ 编译器。<br><br>野指针、内存泄漏、数组越界... 人类在堆内存中群魔乱舞。<br>赐予他们 Segmentation fault (core dumped) 吧！',
        btnStart: 'make run',
        btnRestart: 'kill -9',
        gameOverTitle: 'KERNEL PANIC',
        gameOverDesc: '内存泄漏耗尽了所有系统资源，系统崩溃。',
        levelUpTitle: '编译完成：选择优化等级',
        upgrades: {
            multiShot: { title: 'OpenMP 并行', desc: '增加一次发射的异常数量 (+1 弹道)' },
            fireRate: { title: '-O3 终极优化', desc: '异常抛出频率提高 20%' },
            damageUp: { title: '段错误核心', desc: '造成的破坏力 +5' },
            bulletSpeed: { title: '内联函数展开', desc: '异常抛出速度提升 30%' },
            pierce: { title: '指针越界穿透', desc: '抛出的异常可额外穿透 1 个代码块' },
            crit: { title: '野指针强转', desc: '15% 概率触发暴击' },
            critDamage: { title: '未定义行为 (UB)', desc: '暴击伤害倍率 +1.0x' },
            execute: { title: 'std::abort()', desc: '5% 概率直接秒杀普通代码块' },
            heal: { title: 'delete 释放', desc: '恢复 15 点系统负载' },
            maxLifeUp: { title: '扩大虚拟内存', desc: '负载上限 +20 并回满' },
            shieldMaxUp: { title: '内存保护', desc: '护盾上限 +10 并获得等量护盾' },
            dodgeRate: { title: 'catch(...)', desc: '10% 概率忽略受到的系统负载伤害' },
            lifeSteal: { title: '悬空指针重用', desc: '击杀代码块有 5% 概率恢复 1 点负载' },
            slowAura: { title: '缓存未命中', desc: '全局代码块移动速度降低 5%' },
            knockback: { title: '栈溢出覆写', desc: '异常击中代码块时将其击退' },
            stunChance: { title: '互斥锁死锁', desc: '10% 概率使击中的代码块卡死 1 秒' },
            bulletSize: { title: '超大结构体', desc: '抛出的异常体积增加 50%' },
            xpGainUp: { title: 'Valgrind 分析', desc: '获得的经验值增加 20%' },
            focusedFire: { title: '指针别名限制', desc: '缩小多弹道散射角度 20%' }
        }
    }
};

let currentLang = 'java';

let gameState = 'START';
let score = 0; let lives = 100;
let codeBlocks = []; let bullets = []; let enemyBullets = [];
let blockSpawnInterval;
let autoRegenInterval;
let shieldRegenInterval;

// ================= BOSS & 计时系统 =================
let activeBoss = null;
let boss1Spawned = false;
let gameTimeMs = 0;
let lastFrameTime = performance.now();
let bossMobTimer = 0;

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight - 80;

let isPointerDown = false; let fireCooldownTimer = 0;
let stopTheWorldTimer = 0;

const playerStats = {
    level: 1, xp: 0, xpNeeded: 20,
    baseFireRateLimit: 12, fireRateModifier: 1.0, damage: 1, bulletSpeed: 8, multiShot: 1, spreadAngle: 15,
    pierce: 0, critRate: 0.1,
    critDamageMult: 3.0, dodgeRate: 0.0, lifeStealRate: 0.0, lifeStealAmount: 1,
    globalSlow: 0.0, knockbackDist: 0, stunChance: 0.0, stunDuration: 60,
    bulletSizeMult: 1.0, xpMult: 1.0, executeChance: 0.0,
    maxLives: 100, maxShield: 0, shield: 0,
    upgrades: {}, advanced: {}
};

// ================= 更新 UI 的函数 =================
function updateLanguageUI() {
    const conf = langConfig[currentLang];
    document.getElementById('start-title').textContent = conf.startTitle;
    document.getElementById('start-desc').innerHTML = conf.startDesc;
    document.getElementById('begin-btn').textContent = conf.btnStart;
    document.getElementById('restart-btn').textContent = conf.btnRestart;
    document.getElementById('game-over-title').textContent = conf.gameOverTitle;
    document.getElementById('game-over-desc').textContent = conf.gameOverDesc;
    document.getElementById('level-up-title').textContent = conf.levelUpTitle;
    playerElement.textContent = conf.player;
}

langSelector.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateLanguageUI();
});

// 初始化时执行一次
updateLanguageUI();

class Bullet {
    constructor(startX, startY, angleDeg) {
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        this.element.textContent = langConfig[currentLang].bullet; // 动态读取

        if (playerStats.bulletSizeMult > 1.0) {
            this.element.style.fontSize = `${12 * playerStats.bulletSizeMult}px`;
        }
        container.appendChild(this.element);
        const rect = this.element.getBoundingClientRect();
        this.width = rect.width; this.height = rect.height;

        this.x = startX - (this.width / 2);
        this.y = startY - 13 - this.height;
        this.angleDeg = angleDeg;

        this.pierceLeft = playerStats.pierce;
        this.hitSet = new Set();

        const angleRad = angleDeg * (Math.PI / 180);
        this.speedY = Math.cos(angleRad) * playerStats.bulletSpeed;
        this.speedX = Math.sin(angleRad) * playerStats.bulletSpeed;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angleDeg}deg)`;
    }
    update() {
        this.x += this.speedX; this.y -= this.speedY;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angleDeg}deg)`;
        if (this.y < -this.height || this.x < 0 || this.x > window.innerWidth) { this.remove(); return false; }
        return true;
    }
    remove() { 
        const el = this.element;
        setTimeout(() => el.remove(), 50); // 延迟 50ms 移除，让贴脸子弹有视觉驻留时间
    }
}

class EnemyBullet {
    constructor(startX, startY, targetX, targetY, textOverride = null) {
        this.element = document.createElement('div');
        this.element.className = 'enemy-bullet';
        this.element.textContent = textOverride || langConfig[currentLang].enemyBullet;
        container.appendChild(this.element);

        const rect = this.element.getBoundingClientRect();
        this.width = rect.width; this.height = rect.height;
        this.x = startX - (this.width / 2);
        this.y = startY;

        const angleRad = Math.atan2(targetY - startY, targetX - startX);
        const speed = 4 + (playerStats.level * 0.2);
        this.speedX = Math.cos(angleRad) * speed;
        this.speedY = Math.sin(angleRad) * speed;

        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }
    update(globalSpeedMult) {
        this.x += this.speedX * globalSpeedMult;
        this.y += this.speedY * globalSpeedMult;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        if (this.y > window.innerHeight || this.y < 0 || this.x < 0 || this.x > window.innerWidth) {
            this.remove(); return false;
        }
        return true;
    }
    remove() { 
        const el = this.element;
        setTimeout(() => el.remove(), 50); // 同样增加微小延迟
    }
}

function showDamageText(x, y, amount, type) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    const scatterX = (Math.random() - 0.5) * 30;
    wrapper.style.transform = `translate3d(${x + scatterX}px, ${y}px, 0)`;
    wrapper.style.zIndex = '100';

    const txt = document.createElement('div');
    txt.className = `damage-text damage-${type}`;
    txt.textContent = type === 'player' ? `-${amount}` : amount;

    wrapper.appendChild(txt); container.appendChild(wrapper);
    txt.addEventListener('animationend', () => wrapper.remove());
}

function createPopupInfo(x, y, message, cssClass, isCrit = false) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    wrapper.style.zIndex = '25';
    wrapper.style.pointerEvents = 'none';

    const exp = document.createElement('div');
    let finalClass = cssClass;
    if (isCrit) finalClass += ' crit-explosion';

    exp.className = finalClass;
    exp.textContent = isCrit ? '[FATAL CRIT] ' + message : message;

    wrapper.appendChild(exp); container.appendChild(wrapper);
    exp.addEventListener('animationend', () => wrapper.remove());
}

function updateEventTimerUI(ms) {
    const timer = document.getElementById('event-timer');
    if (timer) timer.textContent = (ms / 1000).toFixed(1);
}

function spawnCodeBlock() {
    if (gameState !== 'PLAYING' || activeBoss !== null) return;
    codeBlocks.push(new CodeBlock(container, playerStats.level));
    let spawnRate = Math.max(400, 2500 * Math.pow(0.88, playerStats.level - 1));
    clearInterval(blockSpawnInterval);
    blockSpawnInterval = setInterval(spawnCodeBlock, spawnRate);
}

function spawnBaseMonster(x, y) {
    let mob = new CodeBlock(container, playerStats.level, true);
    mob.x = x - mob.width / 2; mob.y = y;
    mob.element.style.transform = `translate3d(${mob.x}px, ${mob.y}px, 0)`;
    codeBlocks.push(mob);
}

function updateLivesDisplay() {
    livesElement.textContent = `${lives}/${playerStats.maxLives}`;
    livesElement.style.color = lives <= (playerStats.maxLives * 0.25) ? 'red' : 'var(--error-color)';
}

function updateShieldDisplay() {
    const sd = document.getElementById('shield-display');
    if (sd) sd.textContent = `${playerStats.shield}/${playerStats.maxShield}`;
}

function takePlayerDamage(amount, bypassShield = false) {
    if (Math.random() < playerStats.dodgeRate) {
        showDamageText(playerX, playerY - 20, "Dodged!", 'crit');
        return;
    }
    
    let damageToLives = amount;
    if (!bypassShield && playerStats.shield > 0) {
        if (playerStats.shield >= amount) {
            playerStats.shield -= amount;
            damageToLives = 0;
            showDamageText(playerX, playerY - 20, `-${amount} (Shield)`, 'crit');
        } else {
            damageToLives = amount - playerStats.shield;
            showDamageText(playerX, playerY - 20, `-${playerStats.shield} (Shield)`, 'crit');
            playerStats.shield = 0;
        }
        updateShieldDisplay();
    }

    if (damageToLives > 0) {
        lives -= damageToLives; updateLivesDisplay();
        showDamageText(playerX, playerY - 20, damageToLives, 'player');

        container.style.boxShadow = "inset 0 0 80px rgba(224, 108, 117, 0.8)";
        setTimeout(() => container.style.boxShadow = "none", 150);
        if (lives <= 0) endGame();
    }
}

function healPlayer(amount) {
    if (lives >= playerStats.maxLives) return;
    lives += amount;
    if (lives > playerStats.maxLives) lives = playerStats.maxLives;
    updateLivesDisplay();
    showDamageText(playerX, playerY - 20, `+${amount}`, 'crit'); 
}

function gainXp(amount) {
    amount = amount * playerStats.xpMult;
    playerStats.xp += amount;
    if (playerStats.xp >= playerStats.xpNeeded) {
        playerStats.xp -= playerStats.xpNeeded;
        
        playerStats.level++;
        playerStats.xpNeeded = Math.floor(playerStats.xpNeeded * 1.2);
        levelDisplay.textContent = playerStats.level;
        triggerLevelUp();
    }
    xpBar.style.width = `${(playerStats.xp / playerStats.xpNeeded) * 100}%`;
}

function triggerLevelUp() {
    gameState = 'PAUSED';
    const pool = getUpgradePool(playerStats, healPlayer);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const options = shuffled.slice(0, 5);

    renderUpgrades(upgradeContainer, options, () => {
        levelUpScreen.style.display = 'none';
        gameState = 'PLAYING';
        isPointerDown = false;
        lastFrameTime = performance.now(); // 防止恢复游戏后由于 dt 突增引发异常计算
        requestAnimationFrame(gameLoop);
    });
    levelUpScreen.style.display = 'flex';
}

function fireBullets() {
    const count = playerStats.multiShot;
    if (count === 1) { bullets.push(new Bullet(playerX, playerY, 0)); }
    else {
        const totalSpread = playerStats.spreadAngle * (count - 1);
        const startAngle = -totalSpread / 2;
        for (let i = 0; i < count; i++) {
            const angle = startAngle + (playerStats.spreadAngle * i);
            bullets.push(new Bullet(playerX, playerY, angle));
        }
    }
}

function spawnEnemyBullet(x, y, targetX, targetY, textOverride = null) {
    enemyBullets.push(new EnemyBullet(x, y, targetX, targetY, textOverride));
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = codeBlocks.length - 1; j >= 0; j--) {
            let b = bullets[i]; let c = codeBlocks[j];

            if (b.x < c.x + c.width && b.x + b.width > c.x && b.y < c.y + c.height && b.y + b.height > c.y) {
                if (b.hitSet.has(c)) continue;
                b.hitSet.add(c);

                if (Math.random() < playerStats.stunChance) {
                    c.stunTimer = playerStats.stunDuration;
                }
                if (playerStats.knockbackDist > 0 && !c.isSide) {
                    c.y -= playerStats.knockbackDist;
                }

                const isCrit = Math.random() < playerStats.critRate;
                let actualDamage = isCrit ? playerStats.damage * playerStats.critDamageMult : playerStats.damage;

                if (Math.random() < playerStats.executeChance && c.isBase) {
                    actualDamage = c.maxHp; 
                }

                showDamageText(c.x + c.width / 2, c.y, actualDamage, isCrit ? 'crit' : 'normal');

                if (c.takeDamage(actualDamage)) {
                    if (Math.random() < playerStats.lifeStealRate) {
                        healPlayer(playerStats.lifeStealAmount);
                    }

                    const cx = c.x; const cy = c.y; const err = c.errorText; const xpVal = c.xpValue; const type = c.type;
                    c.remove(); codeBlocks.splice(j, 1);
                    score++; scoreElement.textContent = score;

                    if (type === 'gc_heal') {
                        healPlayer(15);
                        createPopupInfo(cx, cy, err, 'buff-explosion');
                    } else if (type === 'gc_slow') {
                        stopTheWorldTimer = 300;
                        createPopupInfo(cx, cy, err, 'buff-explosion buff-slow-explosion');
                    } else {
                        createPopupInfo(cx, cy, err, 'error-explosion', isCrit);
                    }

                    gainXp(xpVal);
                }

                if (b.pierceLeft > 0) { b.pierceLeft--; }
                else { b.remove(); bullets.splice(i, 1); break; }
            }
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];
        if (eb.x < playerX + 23 && eb.x + eb.width > playerX - 23 && eb.y < playerY + 13 && eb.y + eb.height > playerY - 13) {
            eb.remove(); enemyBullets.splice(i, 1); takePlayerDamage(2, false);
        }
    }
}

function gameLoop(timestamp) {
    if (!timestamp) timestamp = performance.now();
    let dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (gameState !== 'PLAYING') return;

    let globalSpeedMult = Math.max(0.1, 1.0 - playerStats.globalSlow);
    if (stopTheWorldTimer > 0) {
        stopTheWorldTimer--;
        globalSpeedMult *= 0.3;
        if (stopTheWorldTimer === 299) container.style.filter = 'hue-rotate(-20deg) brightness(1.2)';
    } else if (stopTheWorldTimer === 0 && container.style.filter !== '') {
        container.style.filter = '';
    }

    if (!activeBoss) {
        gameTimeMs += dt;
        if (gameTimeMs >= 450000 && !boss1Spawned) { // 450秒触发Boss
            boss1Spawned = true;
            if (typeof spawnBoss1 === 'function') spawnBoss1();
        }
    } else {
        activeBoss.update(globalSpeedMult);
        
        bossMobTimer -= dt;
        if (bossMobTimer <= 0) {
            codeBlocks.push(new CodeBlock(container, playerStats.level));
            bossMobTimer = 1500; // 恒定 1.5 秒生成怪物
        }
    }

    if (isPointerDown && fireCooldownTimer <= 0) {
        fireBullets(); fireCooldownTimer = playerStats.baseFireRateLimit * playerStats.fireRateModifier;
    }
    if (fireCooldownTimer > 0) fireCooldownTimer--;

    for (let i = codeBlocks.length - 1; i >= 0; i--) {
        let result = codeBlocks[i].update(playerX, playerY, playerStats.level, spawnEnemyBullet, spawnBaseMonster, globalSpeedMult);
        if (result === false) {
            codeBlocks.splice(i, 1); takePlayerDamage(5, true);
        } else if (result === 'escaped') {
            codeBlocks.splice(i, 1);
        } else if (result === 'escaped_side') {
            codeBlocks.splice(i, 1);
        }
    }
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].update()) bullets.splice(i, 1);
    }
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (!enemyBullets[i].update(globalSpeedMult)) enemyBullets.splice(i, 1);
    }
    checkCollisions();
    requestAnimationFrame(gameLoop);
}

function handlePlayerMove(clientX, clientY) {
    if (gameState !== 'PLAYING') return;
    playerX = Math.max(23, Math.min(window.innerWidth - 23, clientX));
    playerY = Math.max(13, Math.min(window.innerHeight - 13, clientY));
    playerElement.style.transform = `translate3d(${playerX - 23}px, ${playerY - 13}px, 0)`;
}

function startGame() {
    score = 0; stopTheWorldTimer = 0;
    gameTimeMs = 0; activeBoss = null; boss1Spawned = false;
    lastFrameTime = performance.now();
    bossMobTimer = 0;

    playerStats.level = 1; playerStats.xp = 0; playerStats.xpNeeded = 20;
    playerStats.fireRateModifier = 1.0; playerStats.damage = 1;
    playerStats.bulletSpeed = 8; playerStats.multiShot = 1;
    playerStats.pierce = 0; playerStats.critRate = 0.1;
    playerStats.critDamageMult = 3.0; playerStats.dodgeRate = 0.0; playerStats.lifeStealRate = 0.0; playerStats.lifeStealAmount = 1;
    playerStats.globalSlow = 0.0; playerStats.knockbackDist = 0; playerStats.stunChance = 0.0; playerStats.stunDuration = 60;
    playerStats.bulletSizeMult = 1.0; playerStats.xpMult = 1.0; playerStats.executeChance = 0.0;
    playerStats.maxLives = 100; playerStats.maxShield = 0; playerStats.shield = 0;
    playerStats.upgrades = {}; playerStats.advanced = {};
    lives = 100;

    scoreElement.textContent = score; updateLivesDisplay(); updateShieldDisplay(); levelDisplay.textContent = playerStats.level;
    xpBar.style.width = '0%';
    container.style.filter = '';

    langSelector.style.display = 'none'; // 游戏开始隐藏选择器
    startScreen.style.display = 'none'; gameOverScreen.style.display = 'none';
    topUi.style.display = 'flex'; executionZone.style.display = 'flex'; playerElement.style.display = 'flex';

    codeBlocks.forEach(b => b.remove()); bullets.forEach(b => b.remove()); enemyBullets.forEach(b => b.remove());
    document.querySelectorAll('.error-explosion, .buff-explosion, .damage-text').forEach(e => e.remove());
    document.querySelectorAll('div[style*="z-index"]').forEach(e => { if (e.style.zIndex == '25' || e.style.zIndex == '100') e.remove(); });
    codeBlocks = []; bullets = []; enemyBullets = []; isPointerDown = false;

    handlePlayerMove(window.innerWidth / 2, window.innerHeight - 80);

    gameState = 'PLAYING';
    if (blockSpawnInterval) clearInterval(blockSpawnInterval);
    blockSpawnInterval = setInterval(spawnCodeBlock, 2000); // 略微提升前期的起步速度
    
    if (autoRegenInterval) clearInterval(autoRegenInterval);
    autoRegenInterval = setInterval(() => {
        if (gameState === 'PLAYING') {
            healPlayer(1);
        }
    }, 5000);

    if (shieldRegenInterval) clearInterval(shieldRegenInterval);
    shieldRegenInterval = setInterval(() => {
        if (gameState === 'PLAYING' && playerStats.maxShield > 0 && playerStats.shield < playerStats.maxShield) {
            playerStats.shield++;
            updateShieldDisplay();
        }
    }, 10000);

    startEventSystem();
    gameLoop();
}

function renderPauseMenu() {
    const opts = langConfig[currentLang].upgrades;
    let upgradesHtml = '';
    if (playerStats.upgrades && Object.keys(playerStats.upgrades).length > 0) {
        upgradesHtml += '<br><strong>已获升级:</strong><br>';
        for (let key in playerStats.upgrades) {
            if (opts[key]) {
                upgradesHtml += `- ${opts[key].title} x${playerStats.upgrades[key]}<br>`;
            } else {
                upgradesHtml += `- ${key} x${playerStats.upgrades[key]}<br>`;
            }
        }
    } else {
        upgradesHtml += '<br><strong>已获升级:</strong> 无<br>';
    }
    
    if (playerStats.advanced && Object.keys(playerStats.advanced).length > 0) {
        upgradesHtml += '<br><strong style="color:#ffcc00;">进阶升级:</strong><br>';
        for (let key in playerStats.advanced) {
            if (advancedUpgradeTitles[key]) {
                upgradesHtml += `<span style="color:#ffcc00;">- ${advancedUpgradeTitles[key]}</span><br>`;
            }
        }
    }

    pauseStats.innerHTML = `
        <strong>等级:</strong> ${playerStats.level}<br>
        <strong>已拦截:</strong> ${score}<br>
        <strong>系统负载剩余:</strong> ${lives}/${playerStats.maxLives}<br>
        <strong>护盾:</strong> ${playerStats.shield}/${playerStats.maxShield}<br>
        <strong>攻击力:</strong> ${playerStats.damage}<br>
        ${upgradesHtml}
    `;
}

function togglePause() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED_MENU';
        renderPauseMenu();
        pauseScreen.style.display = 'flex';
    } else if (gameState === 'PAUSED_MENU') {
        gameState = 'PLAYING';
        pauseScreen.style.display = 'none';
        isPointerDown = false;
        lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function returnToMenu() {
    gameState = 'START';
    pauseScreen.style.display = 'none'; gameOverScreen.style.display = 'none';
    topUi.style.display = 'none'; executionZone.style.display = 'none'; playerElement.style.display = 'none';
    langSelector.style.display = 'block'; startScreen.style.display = 'flex';
    clearInterval(blockSpawnInterval); clearInterval(autoRegenInterval); clearInterval(shieldRegenInterval); stopEventSystem();
    codeBlocks.forEach(b => b.remove()); codeBlocks = [];
    bullets.forEach(b => b.remove()); bullets = [];
    enemyBullets.forEach(b => b.remove()); enemyBullets = [];
}

function endGame() {
    gameState = 'GAMEOVER';
    document.getElementById('final-score').textContent = score; document.getElementById('final-level').textContent = playerStats.level;
    topUi.style.display = 'none'; executionZone.style.display = 'none'; playerElement.style.display = 'none';
    langSelector.style.display = 'block'; // 游戏结束恢复选择器
    gameOverScreen.style.display = 'flex';
    clearInterval(blockSpawnInterval); clearInterval(autoRegenInterval); clearInterval(shieldRegenInterval);
    stopEventSystem();
}

document.getElementById('begin-btn').addEventListener('click', startGame); document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('retry-btn').addEventListener('click', () => { pauseScreen.style.display = 'none'; startGame(); });
document.getElementById('menu-btn').addEventListener('click', returnToMenu);

container.addEventListener('pointerdown', (e) => {
    if (e.target.tagName.toLowerCase() === 'button' || e.target.tagName.toLowerCase() === 'select' || e.target.closest('.upgrade-card') || e.target.closest('.menu-screen')) return;
    if (gameState === 'PLAYING') { isPointerDown = true; handlePlayerMove(e.clientX, e.clientY); e.preventDefault(); }
});
container.addEventListener('pointermove', (e) => {
    if (gameState === 'PLAYING' && (isPointerDown || e.pointerType === 'mouse')) { handlePlayerMove(e.clientX, e.clientY); }
});
window.addEventListener('pointerup', () => isPointerDown = false); window.addEventListener('pointercancel', () => isPointerDown = false);

// ================= Cheat Menu 秘籍监控 =================
let konamiCode = "leumcdevopen";
let konamiIndex = 0;
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePause();

    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            document.getElementById('cheat-menu').style.display = 'flex';
            showCheatPage('cheat-main-menu');
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
        if (e.key === konamiCode[0]) konamiIndex = 1;
    }
});

function showCheatPage(id) {
    document.querySelectorAll('.cheat-page').forEach(el => el.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
    
    if (id === 'cheat-stat-menu') {
        document.getElementById('cs-level').value = playerStats.level;
        document.getElementById('cs-damage').value = playerStats.damage;
        document.getElementById('cs-maxlives').value = playerStats.maxLives;
        document.getElementById('cs-maxshield').value = playerStats.maxShield;
        document.getElementById('cs-crit').value = playerStats.critRate;
        document.getElementById('cs-spd').value = playerStats.bulletSpeed;
    } else if (id === 'cheat-upg-menu') {
        initCheatUpgrades();
    }
}

function applyCheatStats() {
    playerStats.level = parseInt(document.getElementById('cs-level').value) || 1;
    levelDisplay.textContent = playerStats.level;
    playerStats.damage = parseInt(document.getElementById('cs-damage').value) || 1;
    playerStats.maxLives = parseInt(document.getElementById('cs-maxlives').value) || 100;
    playerStats.maxShield = parseInt(document.getElementById('cs-maxshield').value) || 0;
    playerStats.critRate = parseFloat(document.getElementById('cs-crit').value) || 0;
    playerStats.bulletSpeed = parseInt(document.getElementById('cs-spd').value) || 8;
    lives = playerStats.maxLives;
    playerStats.shield = playerStats.maxShield;
    updateLivesDisplay();
    updateShieldDisplay();
    document.getElementById('cheat-menu').style.display = 'none';
}

function spawnDevMob(index) {
    let def = typeof monsterDefs !== 'undefined' ? monsterDefs[index] : null;
    if (!def) return;
    let mob = new CodeBlock(container, playerStats.level, def);
    if (!def.isSide) {
        mob.x = Math.random() * (window.innerWidth - mob.width);
        mob.y = 100;
        mob.element.style.transform = `translate3d(${mob.x}px, ${mob.y}px, 0)`;
    }
    codeBlocks.push(mob);
}

function initCheatUpgrades() {
    const grid = document.getElementById('cheat-upg-grid');
    grid.innerHTML = '';
    Object.keys(langConfig.java.upgrades).forEach(k => {
        let b = document.createElement('button');
        b.className = 'action-btn';
        b.style.fontSize = '12px';
        b.style.padding = '8px';
        b.textContent = langConfig[currentLang].upgrades[k].title;
        b.onclick = () => cheatGrantUpgrade(k);
        grid.appendChild(b);
    });

    // 添加进阶升级按钮
    const advKeys = ['crit', 'critDamage', 'execute', 'maxLifeUp', 'shieldMaxUp', 'dodgeRate', 'lifeSteal', 'slowAura', 'knockback', 'stunChance', 'bulletSize', 'xpGainUp', 'focusedFire'];
    advKeys.forEach(k => {
        let b = document.createElement('button');
        b.className = 'action-btn';
        b.style.fontSize = '12px';
        b.style.padding = '8px';
        b.style.borderColor = '#ffcc00';
        b.style.color = '#ffcc00';
        b.textContent = advancedUpgradeTitles[k];
        b.onclick = () => cheatGrantAdvUpgrade(k);
        grid.appendChild(b);
    });
}

function cheatGrantUpgrade(id) {
    playerStats.upgrades[id] = (playerStats.upgrades[id] || 0) + 1;
    switch(id) {
        case 'multiShot': playerStats.multiShot += 1; break;
        case 'fireRate': playerStats.fireRateModifier *= 0.8; break;
        case 'damageUp': playerStats.damage += 5; break;
        case 'bulletSpeed': playerStats.bulletSpeed *= 1.3; break;
        case 'pierce': playerStats.pierce += 1; break;
        case 'crit': playerStats.critRate += 0.15; break;
        case 'critDamage': playerStats.critDamageMult += 1.0; break;
        case 'execute': playerStats.executeChance += 0.05; break;
        case 'heal': healPlayer(15); break;
        case 'maxLifeUp': playerStats.maxLives += 20; healPlayer(playerStats.maxLives); break;
        case 'shieldMaxUp': playerStats.maxShield += 10; playerStats.shield += 10; updateShieldDisplay(); break;
        case 'dodgeRate': playerStats.dodgeRate += 0.1; break;
        case 'lifeSteal': playerStats.lifeStealRate += 0.05; break;
        case 'slowAura': playerStats.globalSlow += 0.05; break;
        case 'knockback': playerStats.knockbackDist += 10; break;
        case 'stunChance': playerStats.stunChance += 0.1; break;
        case 'bulletSize': playerStats.bulletSizeMult += 0.5; break;
        case 'xpGainUp': playerStats.xpMult += 0.2; break;
        case 'focusedFire': playerStats.spreadAngle = Math.max(5, playerStats.spreadAngle * 0.8); break;
    }
    createPopupInfo(playerX, playerY, '+ Upgrade Acquired', 'buff-explosion');
}

function cheatGrantAdvUpgrade(id) {
    if (!playerStats.advanced) playerStats.advanced = {};
    playerStats.advanced[id] = true;
    delete playerStats.upgrades[id]; // 获得进阶后清除基础层数记录

    switch(id) {
        case 'crit': playerStats.critRate = 1.0; playerStats.critDamageMult += 2.0; break;
        case 'critDamage': playerStats.critDamageMult += 15.0; break;
        case 'execute': playerStats.executeChance = 0.50; break;
        case 'maxLifeUp': playerStats.maxLives += 500; healPlayer(playerStats.maxLives); break;
        case 'shieldMaxUp': playerStats.maxShield += 300; playerStats.shield += 300; updateShieldDisplay(); break;
        case 'dodgeRate': playerStats.dodgeRate = 0.80; break;
        case 'lifeSteal': playerStats.lifeStealRate = 0.50; playerStats.lifeStealAmount = 5; break;
        case 'slowAura': playerStats.globalSlow += 0.75; break;
        case 'knockback': playerStats.knockbackDist += 150; break;
        case 'stunChance': playerStats.stunChance = 0.80; playerStats.stunDuration = 180; break;
        case 'bulletSize': playerStats.bulletSizeMult += 4.0; playerStats.damage += 10; break;
        case 'xpGainUp': playerStats.xpMult += 4.0; break;
        case 'focusedFire': playerStats.spreadAngle = 0; break;
    }
    createPopupInfo(playerX, playerY, '+ Adv Upgrade Acquired', 'buff-explosion');
}
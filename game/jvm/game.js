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

let gameState = 'START';
let score = 0; let lives = 20;
let codeBlocks = []; let bullets = []; let enemyBullets = [];
let blockSpawnInterval;

let playerX = window.innerWidth / 2;
let playerY = window.innerHeight - 80;

let isPointerDown = false; let fireCooldownTimer = 0;

const playerStats = {
    level: 1, xp: 0, xpNeeded: 10,
    baseFireRateLimit: 12, fireRateModifier: 1.0, damage: 1, bulletSpeed: 8, multiShot: 1, spreadAngle: 15
};

const baseSnippets = [
    { code: `String data = null;\ndata.length();`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot invoke "String.length()" because "data" is null\n\tat com.app.DataParser.process(DataParser.java:15)` },
    { code: `List items = null;\nitems.clear();`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot invoke "java.util.List.clear()" because "items" is null\n\tat com.app.MemoryManager.flush(MemoryManager.java:118)` },
    { code: `User u = null;\nu.getName();`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot read field "name" because "u" is null\n\tat com.app.UserDao.fetchName(UserDao.java:88)` },
    { code: `int[] arr = null;\narr[0] = 1;`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot store to null array\n\tat com.app.ArrayHelper.mutate(ArrayHelper.java:102)` }
];

const monsterDefs = [
    { type: 'normal', isBase: true, hp: 3, speedY: 1.2, color: '#d19a66', xp: 1 },
    { type: 'tank', isBase: true, hp: 12, speedY: 0.6, color: '#e06c75', xp: 3 },
    { type: 'fast', isBase: true, hp: 2, speedY: 2.2, color: '#56b6c2', xp: 2 },
    {
        type: 'tracker', isBase: false, hp: 20, speedY: 0.8, color: '#c678dd', xp: 6,
        code: `public void trackTarget(Player p) {\n  Vector targetPos = p.getPosition();\n  float dirX = targetPos.x - this.x;\n  this.x += dirX * speed;\n}`,
        err: `Exception in thread "main" java.lang.NullPointerException:\nCannot read field "x" because "targetPos" is null\n\tat com.app.AI.trackTarget(AI.java:42)`
    },
    {
        type: 'shooter', isBase: false, hp: 30, speedY: 0.4, color: '#ff4d4d', xp: 10,
        code: `public void fireAt(Player target) {\n  Bullet b = bulletPool.acquire();\n  b.setDirection(target.getCoords());\n  b.launch();\n}`,
        err: `Exception in thread "main" java.lang.NullPointerException:\nCannot invoke "Player.getCoords()" because "target" is null\n\tat com.app.Turret.fireAt(Turret.java:88)`
    },
    {
        type: 'dasher', isBase: false, hp: 18, speedY: 1.5, color: '#e5c07b', xp: 8,
        code: `public void executeDash() {\n  Point nextNode = pathManager.getWaypoint();\n  this.x = nextNode.x;\n  this.y = nextNode.y;\n}`,
        err: `Exception in thread "main" java.lang.NullPointerException:\nCannot read field "x" because "nextNode" is null\n\tat com.app.Movement.executeDash(Movement.java:112)`
    }
];

const upgradePool = [
    { id: 'multi_shot', title: '多线程并发', desc: '增加一次发射的异常数量 (+1 弹道)', apply: () => playerStats.multiShot += 1 },
    { id: 'fire_rate', title: 'JIT 编译加速', desc: '异常抛出频率提高 20%', apply: () => playerStats.fireRateModifier *= 0.8 },
    { id: 'damage_up', title: '致命异常', desc: '每个 NPE 造成的破坏力 +2', apply: () => playerStats.damage += 2 },
    { id: 'heal', title: '堆内存扩容', desc: '恢复 10 点系统负载', apply: () => { lives += 10; updateLivesDisplay(); } },
    { id: 'bullet_speed', title: '低延迟 GC', desc: '异常抛出速度提升 30%', apply: () => playerStats.bulletSpeed *= 1.3 }
];

class CodeBlock {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'code-block';

        let rand = Math.random();
        let def;
        if (playerStats.level >= 5 && rand < 0.15) def = monsterDefs[4];
        else if (playerStats.level >= 4 && rand < 0.30) def = monsterDefs[5];
        else if (playerStats.level >= 3 && rand < 0.45) def = monsterDefs[3];
        else if (rand < 0.65) def = monsterDefs[1];
        else if (rand < 0.80) def = monsterDefs[2];
        else def = monsterDefs[0];

        this.type = def.type;
        this.maxHp = Math.floor(def.hp * Math.pow(1.25, playerStats.level - 1));
        this.hp = this.maxHp;
        this.speedY = def.speedY * (1 + playerStats.level * 0.05);
        this.speedX = 0;
        this.xpValue = def.xp;

        let displayCode = "";
        if (def.isBase) {
            const snippet = baseSnippets[Math.floor(Math.random() * baseSnippets.length)];
            displayCode = snippet.code; this.errorText = snippet.err;
        } else {
            displayCode = def.code; this.errorText = def.err;
        }

        this.dashTimer = 0;
        this.fireCooldown = Math.max(80, 200 - playerStats.level * 5);

        this.element.innerHTML = `<div class="hp-bar-bg"><div class="hp-bar" style="background-color: ${def.color}"></div></div><span style="color: ${def.color}">${displayCode}</span>`;
        this.element.style.border = `1px solid ${def.color}`;

        container.appendChild(this.element);

        const rect = this.element.getBoundingClientRect();
        this.width = rect.width; this.height = rect.height;
        this.x = Math.random() * (window.innerWidth - this.width);
        this.y = -this.height;

        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }

    takeDamage(amount) {
        this.hp -= amount;
        const hpBar = this.element.querySelector('.hp-bar');
        if (hpBar) hpBar.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
        return this.hp <= 0;
    }

    update() {
        this.y += this.speedY;

        switch (this.type) {
            case 'tracker':
                const centerX = this.x + this.width / 2;
                if (Math.abs(centerX - playerX) > 5) {
                    this.x += (centerX < playerX) ? 1.5 : -1.5;
                }
                break;
            case 'shooter':
                this.fireCooldown--;
                if (this.fireCooldown <= 0) {
                    enemyBullets.push(new EnemyBullet(this.x + this.width / 2, this.y + this.height, playerX, playerY));
                    this.fireCooldown = Math.max(80, 200 - playerStats.level * 5);
                }
                break;
            case 'dasher':
                this.dashTimer--;
                if (this.dashTimer <= 0) {
                    this.speedX = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15);
                    this.dashTimer = 80;
                }
                this.x += this.speedX;
                this.speedX *= 0.85;
                if (this.x < 0) this.x = 0;
                if (this.x + this.width > window.innerWidth) this.x = window.innerWidth - this.width;
                break;
        }

        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        if (this.y + this.height > window.innerHeight - 60) { this.remove(); return false; }
        return true;
    }
    remove() { this.element.remove(); }
}

class Bullet {
    constructor(startX, startY, angleDeg) {
        this.element = document.createElement('div');
        this.element.className = 'bullet';
        this.element.textContent = 'NullPointerException';
        container.appendChild(this.element);
        const rect = this.element.getBoundingClientRect();
        this.width = rect.width; this.height = rect.height;

        this.x = startX - (this.width / 2);
        this.y = startY - 13 - this.height;
        this.angleDeg = angleDeg;

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
    remove() { this.element.remove(); }
}

class EnemyBullet {
    constructor(startX, startY, targetX, targetY) {
        this.element = document.createElement('div');
        this.element.className = 'enemy-bullet';
        this.element.textContent = 'Exception()';
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
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        if (this.y > window.innerHeight || this.y < 0 || this.x < 0 || this.x > window.innerWidth) {
            this.remove(); return false;
        }
        return true;
    }
    remove() { this.element.remove(); }
}

function createErrorExplosion(x, y, message) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    wrapper.style.zIndex = '25';
    wrapper.style.pointerEvents = 'none';

    const exp = document.createElement('div');
    exp.className = 'error-explosion'; exp.textContent = message;

    wrapper.appendChild(exp); container.appendChild(wrapper);
    exp.addEventListener('animationend', () => wrapper.remove());
}

function spawnCodeBlock() {
    if (gameState !== 'PLAYING') return;
    codeBlocks.push(new CodeBlock());
    let spawnRate = Math.max(200, 1500 * Math.pow(0.85, playerStats.level - 1));
    clearInterval(blockSpawnInterval);
    blockSpawnInterval = setInterval(spawnCodeBlock, spawnRate);
}

function updateLivesDisplay() {
    livesElement.textContent = lives;
    livesElement.style.color = lives <= 5 ? 'red' : 'var(--error-color)';
}

function takePlayerDamage(amount) {
    lives -= amount; updateLivesDisplay();
    container.style.boxShadow = "inset 0 0 80px rgba(224, 108, 117, 0.8)";
    setTimeout(() => container.style.boxShadow = "none", 150);
    if (lives <= 0) endGame();
}

function gainXp(amount) {
    playerStats.xp += amount;
    if (playerStats.xp >= playerStats.xpNeeded) {
        playerStats.xp -= playerStats.xpNeeded;
        playerStats.level++;
        playerStats.xpNeeded = Math.floor(playerStats.xpNeeded * 1.5);
        levelDisplay.textContent = playerStats.level;
        triggerLevelUp();
    }
    xpBar.style.width = `${(playerStats.xp / playerStats.xpNeeded) * 100}%`;
}

function triggerLevelUp() {
    gameState = 'PAUSED';
    const shuffled = [...upgradePool].sort(() => 0.5 - Math.random());
    const options = shuffled.slice(0, 3);
    upgradeContainer.innerHTML = '';
    options.forEach(opt => {
        const card = document.createElement('div'); card.className = 'upgrade-card';
        card.innerHTML = `<div class="upgrade-title">${opt.title}</div><div class="upgrade-desc">${opt.desc}</div>`;
        card.onclick = () => { opt.apply(); resumeGame(); };
        upgradeContainer.appendChild(card);
    });
    levelUpScreen.style.display = 'flex';
}

function resumeGame() {
    levelUpScreen.style.display = 'none'; gameState = 'PLAYING';
    isPointerDown = false; requestAnimationFrame(gameLoop);
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

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = codeBlocks.length - 1; j >= 0; j--) {
            let b = bullets[i]; let c = codeBlocks[j];
            if (b.x < c.x + c.width && b.x + b.width > c.x && b.y < c.y + c.height && b.y + b.height > c.y) {
                b.remove(); bullets.splice(i, 1);
                if (c.takeDamage(playerStats.damage)) {
                    const cx = c.x; const cy = c.y; const err = c.errorText; const xpVal = c.xpValue;
                    c.remove(); codeBlocks.splice(j, 1);
                    score++; scoreElement.textContent = score;
                    createErrorExplosion(cx, cy, err);
                    gainXp(xpVal);
                }
                break;
            }
        }
    }

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        let eb = enemyBullets[i];
        if (eb.x < playerX + 23 && eb.x + eb.width > playerX - 23 && eb.y < playerY + 13 && eb.y + eb.height > playerY - 13) {
            eb.remove(); enemyBullets.splice(i, 1); takePlayerDamage(2);
        }
    }
}

function gameLoop() {
    if (gameState !== 'PLAYING') return;
    if (isPointerDown && fireCooldownTimer <= 0) {
        fireBullets(); fireCooldownTimer = playerStats.baseFireRateLimit * playerStats.fireRateModifier;
    }
    if (fireCooldownTimer > 0) fireCooldownTimer--;
    for (let i = codeBlocks.length - 1; i >= 0; i--) {
        if (!codeBlocks[i].update()) { codeBlocks.splice(i, 1); takePlayerDamage(5); }
    }
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (!bullets[i].update()) bullets.splice(i, 1);
    }
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (!enemyBullets[i].update()) enemyBullets.splice(i, 1);
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
    score = 0; lives = 20;
    playerStats.level = 1; playerStats.xp = 0; playerStats.xpNeeded = 10;
    playerStats.fireRateModifier = 1.0; playerStats.damage = 1;
    playerStats.bulletSpeed = 8; playerStats.multiShot = 1;

    scoreElement.textContent = score; updateLivesDisplay(); levelDisplay.textContent = playerStats.level;
    xpBar.style.width = '0%';

    startScreen.style.display = 'none'; gameOverScreen.style.display = 'none';
    topUi.style.display = 'flex'; executionZone.style.display = 'flex'; playerElement.style.display = 'flex';

    codeBlocks.forEach(b => b.remove()); bullets.forEach(b => b.remove()); enemyBullets.forEach(b => b.remove());
    document.querySelectorAll('.error-explosion').forEach(e => e.remove()); document.querySelectorAll('div[style*="z-index"]').forEach(e => { if (e.style.zIndex == '25') e.remove(); });
    codeBlocks = []; bullets = []; enemyBullets = []; isPointerDown = false;

    handlePlayerMove(window.innerWidth / 2, window.innerHeight - 80);

    gameState = 'PLAYING';
    if (blockSpawnInterval) clearInterval(blockSpawnInterval);
    blockSpawnInterval = setInterval(spawnCodeBlock, 1000);
    gameLoop();
}

function endGame() {
    gameState = 'GAMEOVER';
    document.getElementById('final-score').textContent = score; document.getElementById('final-level').textContent = playerStats.level;
    topUi.style.display = 'none'; executionZone.style.display = 'none'; playerElement.style.display = 'none';
    gameOverScreen.style.display = 'flex';
    clearInterval(blockSpawnInterval);
}

document.getElementById('begin-btn').addEventListener('click', startGame); document.getElementById('restart-btn').addEventListener('click', startGame);
container.addEventListener('pointerdown', (e) => {
    if (e.target.tagName.toLowerCase() === 'button' || e.target.closest('.upgrade-card')) return;
    if (gameState === 'PLAYING') { isPointerDown = true; handlePlayerMove(e.clientX, e.clientY); e.preventDefault(); }
});
container.addEventListener('pointermove', (e) => {
    if (gameState === 'PLAYING' && (isPointerDown || e.pointerType === 'mouse')) { handlePlayerMove(e.clientX, e.clientY); }
});
window.addEventListener('pointerup', () => isPointerDown = false); window.addEventListener('pointercancel', () => isPointerDown = false);
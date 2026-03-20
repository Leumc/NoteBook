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
// 【新增】Stop-The-World 减速计时器
let stopTheWorldTimer = 0;

const playerStats = {
    level: 1, xp: 0, xpNeeded: 10,
    baseFireRateLimit: 12, fireRateModifier: 1.0, damage: 1, bulletSpeed: 8, multiShot: 1, spreadAngle: 15,
    pierce: 0, critRate: 0.0
};

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
    // 敌方弹幕也会受到全局减速影响
    update(globalSpeedMult) {
        this.x += this.speedX * globalSpeedMult;
        this.y += this.speedY * globalSpeedMult;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        if (this.y > window.innerHeight || this.y < 0 || this.x < 0 || this.x > window.innerWidth) {
            this.remove(); return false;
        }
        return true;
    }
    remove() { this.element.remove(); }
}

// 【新增：漂浮伤害数字系统】
function showDamageText(x, y, amount, type) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    // 加入一点随机偏移，防止数字重叠
    const scatterX = (Math.random() - 0.5) * 30;
    wrapper.style.transform = `translate3d(${x + scatterX}px, ${y}px, 0)`;
    wrapper.style.zIndex = '100';

    const txt = document.createElement('div');
    txt.className = `damage-text damage-${type}`;
    txt.textContent = type === 'player' ? `-${amount}` : amount;

    wrapper.appendChild(txt); container.appendChild(wrapper);
    txt.addEventListener('animationend', () => wrapper.remove());
}

// 统一的弹窗生成器，支持传入不同的 CSS 类名
function createPopupInfo(x, y, message, cssClass, isCrit = false) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    wrapper.style.zIndex = '25';
    wrapper.style.pointerEvents = 'none';

    const exp = document.createElement('div');
    // 如果触发了暴击，在原有的样式类基础上附加 crit-explosion 覆盖样式
    let finalClass = cssClass;
    if (isCrit) finalClass += ' crit-explosion';

    exp.className = finalClass;
    exp.textContent = isCrit ? '[FATAL CRIT] ' + message : message;

    wrapper.appendChild(exp); container.appendChild(wrapper);
    exp.addEventListener('animationend', () => wrapper.remove());
}

function spawnCodeBlock() {
    if (gameState !== 'PLAYING') return;
    codeBlocks.push(new CodeBlock(container, playerStats.level));
    let spawnRate = Math.max(200, 1500 * Math.pow(0.85, playerStats.level - 1));
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
    livesElement.textContent = lives;
    livesElement.style.color = lives <= 5 ? 'red' : 'var(--error-color)';
}

function takePlayerDamage(amount) {
    lives -= amount; updateLivesDisplay();
    // 玩家受伤飘字
    showDamageText(playerX, playerY - 20, amount, 'player');

    container.style.boxShadow = "inset 0 0 80px rgba(224, 108, 117, 0.8)";
    setTimeout(() => container.style.boxShadow = "none", 150);
    if (lives <= 0) endGame();
}

function healPlayer(amount) {
    lives += amount;
    updateLivesDisplay();
    showDamageText(playerX, playerY - 20, `+${amount}`, 'crit'); // 借用暴击特效显示绿字回血
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
    const pool = getUpgradePool(playerStats, healPlayer);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const options = shuffled.slice(0, 3);

    renderUpgrades(upgradeContainer, options, () => {
        levelUpScreen.style.display = 'none';
        gameState = 'PLAYING';
        isPointerDown = false;
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

function spawnEnemyBullet(x, y, targetX, targetY) {
    enemyBullets.push(new EnemyBullet(x, y, targetX, targetY));
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = codeBlocks.length - 1; j >= 0; j--) {
            let b = bullets[i]; let c = codeBlocks[j];

            if (b.x < c.x + c.width && b.x + b.width > c.x && b.y < c.y + c.height && b.y + b.height > c.y) {
                if (b.hitSet.has(c)) continue;
                b.hitSet.add(c);

                const isCrit = Math.random() < playerStats.critRate;
                const actualDamage = isCrit ? playerStats.damage * 3 : playerStats.damage;

                showDamageText(c.x + c.width / 2, c.y, actualDamage, isCrit ? 'crit' : 'normal');

                if (c.takeDamage(actualDamage)) {
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
                        // 【修复 2：将 isCrit 传回生成器，触发专属暴击样式】
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
            eb.remove(); enemyBullets.splice(i, 1); takePlayerDamage(2);
        }
    }
}

function gameLoop() {
    if (gameState !== 'PLAYING') return;

    let globalSpeedMult = 1.0;
    if (stopTheWorldTimer > 0) {
        stopTheWorldTimer--;
        globalSpeedMult = 0.3;
        if (stopTheWorldTimer === 299) container.style.filter = 'hue-rotate(-20deg) brightness(1.2)';
    } else if (stopTheWorldTimer === 0 && container.style.filter !== '') {
        container.style.filter = '';
    }

    if (isPointerDown && fireCooldownTimer <= 0) {
        fireBullets(); fireCooldownTimer = playerStats.baseFireRateLimit * playerStats.fireRateModifier;
    }
    if (fireCooldownTimer > 0) fireCooldownTimer--;

    for (let i = codeBlocks.length - 1; i >= 0; i--) {
        let result = codeBlocks[i].update(playerX, playerY, playerStats.level, spawnEnemyBullet, spawnBaseMonster, globalSpeedMult);
        if (result === false) {
            codeBlocks.splice(i, 1); takePlayerDamage(5);
        } else if (result === 'escaped') {
            codeBlocks.splice(i, 1);
        } else if (result === 'escaped_side') {
            // 【新增：侧面怪物逃跑判定，仅扣 2 血以示惩戒】
            codeBlocks.splice(i, 1); takePlayerDamage(2);
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
    score = 0; lives = 20; stopTheWorldTimer = 0;
    playerStats.level = 1; playerStats.xp = 0; playerStats.xpNeeded = 10;
    playerStats.fireRateModifier = 1.0; playerStats.damage = 1;
    playerStats.bulletSpeed = 8; playerStats.multiShot = 1;
    playerStats.pierce = 0; playerStats.critRate = 0.0;

    scoreElement.textContent = score; updateLivesDisplay(); levelDisplay.textContent = playerStats.level;
    xpBar.style.width = '0%';
    container.style.filter = '';

    startScreen.style.display = 'none'; gameOverScreen.style.display = 'none';
    topUi.style.display = 'flex'; executionZone.style.display = 'flex'; playerElement.style.display = 'flex';

    codeBlocks.forEach(b => b.remove()); bullets.forEach(b => b.remove()); enemyBullets.forEach(b => b.remove());
    document.querySelectorAll('.error-explosion, .buff-explosion, .damage-text').forEach(e => e.remove());
    document.querySelectorAll('div[style*="z-index"]').forEach(e => { if (e.style.zIndex == '25' || e.style.zIndex == '100') e.remove(); });
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
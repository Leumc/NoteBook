const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelDisplay = document.getElementById('level-display');
const xpBar = document.getElementById('xp-bar');
const xpText = document.getElementById('xp-text');

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

// ================= 背景特效 (代码雨) =================
const bgCanvas = document.getElementById('bg-canvas');
const bgCtx = bgCanvas.getContext('2d');
let bgDrops = [];
const bgFontSize = 14;
let bgColumns = 0;
const bgChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+{}|:"<>?\\[];./,';

function resizeBgCanvas() {
    if (!bgCanvas) return;
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    bgColumns = Math.floor(bgCanvas.width / bgFontSize);
    bgDrops = [];
    for (let i = 0; i < bgColumns; i++) {
        bgDrops[i] = Math.random() * -100; // 随机初始高度，形成错落有致的效果
    }
}
window.addEventListener('resize', resizeBgCanvas);
resizeBgCanvas();

function drawBg() {
    if (!bgCanvas) return;
    bgCtx.fillStyle = 'rgba(12, 14, 20, 0.1)';
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    bgCtx.font = bgFontSize + 'px monospace';
    
    for (let i = 0; i < bgDrops.length; i++) {
        if (bgDrops[i] * bgFontSize > 0) {
            const char = bgChars[Math.floor(Math.random() * bgChars.length)];
            let r = Math.random();
            // 随机不同颜色提升层次感
            if (r > 0.95) bgCtx.fillStyle = '#ffcc00';
            else if (r > 0.8) bgCtx.fillStyle = '#98c379';
            else bgCtx.fillStyle = '#61afef';

            bgCtx.fillText(char, i * bgFontSize, bgDrops[i] * bgFontSize);
        }
        
        if (bgDrops[i] * bgFontSize > bgCanvas.height && Math.random() > 0.975) {
            bgDrops[i] = 0;
        }
        bgDrops[i]++;
    }
    requestAnimationFrame(drawBg);
}
drawBg();

// ================= 音频系统 =================
const sounds = {
    apply: new Audio('sound/apply.mp3'),
    bullet: new Audio('sound/bullet.mp3'),
    death: new Audio('sound/death.mp3'),
    level_up: new Audio('sound/level_up.mp3'),
    explode: new Audio('sound/explode.mp3'),
    hurt: new Audio('sound/hurt.mp3'),
    shield: new Audio('sound/shield.mp3')
};
// 降低频繁触发音效的音量，防止破音
sounds.bullet.volume = 0.3;
sounds.explode.volume = 0.4;
sounds.apply.volume = 0.3;

// ================= 新版 BGM 系统 =================
const bgmSystem = {
    currentPhase: 1,
    currentBoss: 1,
    bgmAudio: new Audio(),
    lastPlayedPhaseTrack: null,
    isPlayingBoss: false,
    isBossLooping: false,
    isMainMenu: false,
    npTimeout: null,
    
    init: function() {
        this.bgmAudio.volume = 0.8;

        this.bgmAudio.addEventListener('ended', () => {
            if (this.isMainMenu) return; // 主界面单曲循环，防意外截断
            if (this.isPlayingBoss) {
                if (!this.isBossLooping) {
                    // Boss intro 播放完毕，切入 loop 循环阶段
                    this.isBossLooping = true;
                    this.bgmAudio.src = `bgm/boss/boss${this.currentBoss}/loop.mp3`;
                    this.bgmAudio.loop = true;
                    this.bgmAudio.play().catch(e => {});
                }
            } else {
                // 常规阶段一首播完，自动随机下一首
                this.playPhaseBGM(this.currentPhase);
            }
        });
    },

    updateNowPlayingUI: function(srcPath) {
        const npUI = document.getElementById('now-playing-ui');
        const npTrackName = document.getElementById('np-track-name');
        if (!npUI || !npTrackName) return;
        
        if (this.npTimeout) {
            clearTimeout(this.npTimeout);
            this.npTimeout = null;
        }

        if (!srcPath) {
            npUI.style.opacity = '0';
            this.npTimeout = setTimeout(() => { npUI.style.display = 'none'; }, 500);
            return;
        }

        let title = "未知曲目";
        if (typeof bgmConfig !== 'undefined' && bgmConfig.playerTracks) {
            for (let track of bgmConfig.playerTracks) {
                if (srcPath.includes('boss/boss1') && track.path.includes('boss1')) { title = track.title; break; }
                if (srcPath.includes('boss/boss2') && track.path.includes('boss2')) { title = track.title; break; }
                let parts = srcPath.split('/');
                let filename = parts[parts.length - 1];
                if (track.path.endsWith(filename)) { title = track.title; break; }
            }
        }
        npTrackName.textContent = title;
        npUI.style.display = 'flex';
        void npUI.offsetWidth; // 触发重绘
        npUI.style.opacity = '0.9';
    },

    playMainMenuBGM: function() {
        this.isPlayingBoss = false;
        this.isBossLooping = false;
        this.isMainMenu = true;
        this.stop();

        let track = (typeof bgmConfig !== 'undefined' && bgmConfig.mainMenuTrack) ? bgmConfig.mainMenuTrack : 'bgm/menu.mp3';
        this.bgmAudio.src = track;
        this.bgmAudio.loop = true;
        this.bgmAudio.play().catch(e => {});
        this.updateNowPlayingUI(track);
    },

    playPhaseBGM: function(phase) {
        this.isPlayingBoss = false;
        this.isBossLooping = false;
        this.isMainMenu = false;
        this.currentPhase = phase;
        this.stop();

        // 从独立配置中读取，如果找不到配置，兜底使用 phase1 的列表或默认 1.mp3
        let phaseTracks = typeof bgmConfig !== 'undefined' ? bgmConfig.phaseTracks : {};
        let tracks = phaseTracks[phase] || phaseTracks[1] || ['1.mp3']; 
        let trackToPlay = tracks[0];

        if (tracks.length > 1) {
            // 保证下一首不与上一首重复
            let availableTracks = tracks.filter(t => t !== this.lastPlayedPhaseTrack);
            if (availableTracks.length === 0) availableTracks = tracks; // 异常保底
            trackToPlay = availableTracks[Math.floor(Math.random() * availableTracks.length)];
        }

        this.lastPlayedPhaseTrack = trackToPlay;
        let path = `bgm/phase/phase${phase}/${trackToPlay}`;
        this.bgmAudio.src = path;
        this.bgmAudio.loop = false;
        this.bgmAudio.play().catch(e => {});
        this.updateNowPlayingUI(path);
    },

    playBossBGM: function(bossIndex) {
        this.isPlayingBoss = true;
        this.isBossLooping = false;
        this.isMainMenu = false;
        this.currentBoss = bossIndex;
        this.stop();

        let path = `bgm/boss/boss${bossIndex}/intro.mp3`;
        this.bgmAudio.src = path;
        this.bgmAudio.loop = false;

        this.bgmAudio.play().catch(e => {});
        this.updateNowPlayingUI(path);
    },

    stop: function() {
        this.bgmAudio.pause();
        // 使用 try-catch 防止某些浏览器在未加载资源时设置 currentTime 抛出 InvalidStateError
        try { this.bgmAudio.currentTime = 0; } catch (e) {}
        this.updateNowPlayingUI(null);
    }
};
bgmSystem.init();
bgmSystem.playMainMenuBGM();

function playSound(name) {
    if (sounds[name]) {
        let snd = sounds[name].cloneNode(); // 允许音效叠加播放
        snd.volume = sounds[name].volume;
        snd.play().catch(e => {});
    }
}

// 全局监听点击事件，播放 apply 音效
document.addEventListener('click', (e) => {
    const mpScreen = document.getElementById('music-player-screen');
    if (gameState === 'START' && bgmSystem.isMainMenu && bgmSystem.bgmAudio.paused && (!mpScreen || mpScreen.style.display === 'none')) {
        bgmSystem.bgmAudio.play().catch(e => {});
    }
    if (e.target.closest('#start-screen')) return; // 主界面的按钮不播放音效
    if (e.target.closest('button') || 
        e.target.closest('.action-btn') || 
        e.target.closest('.board-btn') || 
        e.target.closest('.upgrade-card')) {
        playSound('apply');
    }
});

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
            homing: { title: 'CompletableFuture 异步', desc: '增加每2秒发射的自动追踪异步异常 (+1)' },
            aoe: { title: 'Parallel GC 回收', desc: '扩大周期性释放的垃圾回收冲击波范围' },
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
            focusedFire: { title: '同步锁', desc: '缩小多弹道散射角度 20%' },
            ammoCapUp: { title: '增大缓冲池', desc: '弹夹容量 +10' },
            reloadSpeedUp: { title: '类加载加速', desc: '换弹时间减少 15%' },
            pickupRangeUp: { title: '磁性垃圾回收', desc: '碎片拾取范围增加 (+50)' }
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
            homing: { title: 'asyncio 协程', desc: '增加每2秒发射的自动追踪异步任务 (+1)' },
            aoe: { title: 'ob_refcnt 归零脉冲', desc: '扩大周期性释放的引用计数清零冲击波范围' },
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
            focusedFire: { title: '闭包绑定', desc: '缩小多弹道散射角度 20%' },
            ammoCapUp: { title: '增加生成器容量', desc: '弹夹容量 +10' },
            reloadSpeedUp: { title: '热重载加速', desc: '换弹时间减少 15%' },
            pickupRangeUp: { title: '引用计数牵引', desc: '碎片拾取范围增加 (+50)' }
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
            homing: { title: '智能指针', desc: '增加每2秒发射的自动追踪智能指针数量 (+1)' },
            aoe: { title: '内存池刷新', desc: '扩大周期性释放的内存刷新波范围' },
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
            focusedFire: { title: '指针别名限制', desc: '缩小多弹道散射角度 20%' },
            ammoCapUp: { title: '对象池扩容', desc: '弹夹容量 +10' },
            reloadSpeedUp: { title: '内存预分配', desc: '换弹时间减少 15%' },
            pickupRangeUp: { title: '智能指针探测', desc: '碎片拾取范围增加 (+50)' }
        }
    }
};

let currentLang = 'java';

let gameState = 'START';
let score = 0; let lives = 200;
let codeBlocks = []; let bullets = []; let enemyBullets = []; let drops = [];
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
let currentAmmo = 30; let isReloading = false; let reloadTimer = 0;
let maxReloadTimer = 0; let announcementTimeout = null;

const playerStats = {
    level: 1, xp: 0, xpNeeded: 20,
    baseFireRateLimit: 12, fireRateModifier: 1.0, damage: 1, bulletSpeed: 8, multiShot: 1, spreadAngle: 15,
    pierce: 0, critRate: 0.1,
    critDamageMult: 3.0, dodgeRate: 0.0, lifeStealRate: 0.0, lifeStealAmount: 1,
    globalSlow: 0.0, knockbackDist: 0, stunChance: 0.0, stunDuration: 60,
    bulletSizeMult: 1.0, xpMult: 1.0, executeChance: 0.0,
    maxLives: 200, maxShield: 0, shield: 0,
    maxAmmo: 30, reloadSpeedModifier: 1.0,
    pickupRange: 150,
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
    const pName = document.getElementById('player-name');
    if (pName) pName.textContent = conf.player;
}

langSelector.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateLanguageUI();
});

// 初始化时执行一次
updateLanguageUI();

function selectInitLang(lang) {
    currentLang = lang;
    document.getElementById('lang-selector').value = lang;
    updateLanguageUI();
    document.getElementById('init-lang-screen').style.display = 'none';
}

// ================= DOM 对象池 (优化渲染与垃圾回收) =================
const ElementPool = {
    pools: {},
    get(type, createFunc) {
        if (!this.pools[type]) this.pools[type] = [];
        let el = this.pools[type].length > 0 ? this.pools[type].pop() : createFunc();
        el.style.display = '';
        return el;
    },
    release(type, el) {
        el.style.display = 'none';
        if (!this.pools[type]) this.pools[type] = [];
        this.pools[type].push(el);
    }
};
let bulletSizeCache = null;
let enemyBulletSizeCache = null;

class Bullet {
    constructor(startX, startY, angleDeg) {
        this.element = ElementPool.get('bullet', () => {
            let el = document.createElement('div');
            el.className = 'bullet';
            container.appendChild(el);
            return el;
        });
        this.element.textContent = langConfig[currentLang].bullet;

        if (playerStats.bulletSizeMult > 1.0) {
            this.element.style.fontSize = `${12 * playerStats.bulletSizeMult}px`;
        } else {
            this.element.style.fontSize = ''; // 重置字体大小
        }

        // 缓存以消除强制重排 (Reflow) 带来的严重性能开销
        if (!bulletSizeCache || bulletSizeCache.mult !== playerStats.bulletSizeMult || bulletSizeCache.lang !== currentLang) {
            const rect = this.element.getBoundingClientRect();
            bulletSizeCache = { w: rect.width, h: rect.height, mult: playerStats.bulletSizeMult, lang: currentLang };
        }
        this.width = bulletSizeCache.w; this.height = bulletSizeCache.h;

        this.x = startX - (this.width / 2);
        this.y = startY - 13 - this.height;
        this.angleDeg = angleDeg;

        this.pierceLeft = playerStats.pierce;
        // 清理复用时的历史记录
        if (!this.hitSet) this.hitSet = new Set();
        else this.hitSet.clear();

        const angleRad = angleDeg * (Math.PI / 180);
        this.speedY = Math.cos(angleRad) * playerStats.bulletSpeed;
        this.speedX = Math.sin(angleRad) * playerStats.bulletSpeed;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angleDeg}deg)`;
    }
    update() {
        this.x += this.speedX; this.y -= this.speedY;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angleDeg}deg)`;
        if (this.y < 120 || this.x < 0 || this.x > window.innerWidth) { this.remove(); return false; }
        return true;
    }
    remove() { 
        const el = this.element;
        setTimeout(() => ElementPool.release('bullet', el), 50); 
    }
}

class HomingBullet {
    constructor(startX, startY, initialAngle) {
        this.element = ElementPool.get('homingBullet', () => {
            let el = document.createElement('div');
            el.className = 'bullet homing-bullet';
            container.appendChild(el);
            return el;
        });
        this.element.textContent = '=>';
        
        this.width = 15 * playerStats.bulletSizeMult; 
        this.height = 15 * playerStats.bulletSizeMult;
        if (playerStats.bulletSizeMult > 1.0) {
            this.element.style.fontSize = `${14 * playerStats.bulletSizeMult}px`;
        } else {
            this.element.style.fontSize = ''; 
        }
        
        // 【修复】加入随机位置偏移，打乱完全重合的初始生成坐标
        this.x = startX - (this.width / 2) + (Math.random() - 0.5) * 30; 
        this.y = startY - 13 - this.height + (Math.random() - 0.5) * 15;
        
        // 【修复】随机化各子弹的初速度和空气动力学转向率，打散飞行同步制导
        this.speed = playerStats.bulletSpeed * (0.6 + Math.random() * 0.4);
        this.turnSpeed = 0.02 + Math.random() * 0.05; 
        let angleRad = initialAngle * (Math.PI / 180);
        this.speedX = Math.sin(angleRad) * this.speed;
        this.speedY = Math.cos(angleRad) * this.speed; // 正数代表向上
        
        this.pierceLeft = (playerStats.homingPierce || 0) + playerStats.pierce; // 继承系统穿透力
        if (!this.hitSet) this.hitSet = new Set(); else this.hitSet.clear();
        this.angleDeg = initialAngle;
        this.lifespan = 300; // 5秒存活时间 (假设 60fps)
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angleDeg - 90}deg)`;
    }
    update() {
        this.lifespan--;
        if (this.lifespan <= 0) { this.remove(); return false; }

        if (codeBlocks.length > 0) {
            let nearest = null; let minDist = Infinity;
            for(let c of codeBlocks) {
                if (c.y < 120 || c.isSide || this.hitSet.has(c)) continue; // 核心修复：排除已穿透/击中的怪
                let d = Math.hypot((c.x+c.width/2)-this.x, (c.y+c.height/2)-this.y);
                if(d < minDist) { minDist = d; nearest = c; }
            }
            if (!nearest) nearest = codeBlocks.find(c => !c.isSide && !this.hitSet.has(c));
            if (nearest) {
                let dx = (nearest.x+nearest.width/2) - this.x; let dy = (nearest.y+nearest.height/2) - this.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    let desiredX = (dx / dist) * this.speed;
                    let desiredY = -(dy / dist) * this.speed;
                    // 【修复】使用乱序后的独立转弯率，形成漫天飞舞的流星弧线
                    this.speedX += (desiredX - this.speedX) * this.turnSpeed; 
                    this.speedY += (desiredY - this.speedY) * this.turnSpeed;
                    this.angleDeg = Math.atan2(this.speedX, this.speedY) * (180/Math.PI);
                }
            }
        }
        this.x += this.speedX; this.y -= this.speedY;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) rotate(${this.angleDeg - 90}deg)`;
        if (this.y < 0 || this.y > window.innerHeight || this.x < 0 || this.x > window.innerWidth) { this.remove(); return false; }
        return true;
    }
    remove() { const el = this.element; setTimeout(() => ElementPool.release('homingBullet', el), 50); }
}

class EnemyBullet {
    constructor(startX, startY, targetX, targetY, textOverride = null) {
        this.element = ElementPool.get('enemyBullet', () => {
            let el = document.createElement('div');
            el.className = 'enemy-bullet';
            container.appendChild(el);
            return el;
        });
        this.element.textContent = textOverride || langConfig[currentLang].enemyBullet;

        if (!textOverride && (!enemyBulletSizeCache || enemyBulletSizeCache.lang !== currentLang)) {
            const rect = this.element.getBoundingClientRect();
            enemyBulletSizeCache = { w: rect.width, h: rect.height, lang: currentLang };
        }

        if (textOverride) {
            const rect = this.element.getBoundingClientRect();
            this.width = rect.width; this.height = rect.height;
        } else {
            this.width = enemyBulletSizeCache.w; this.height = enemyBulletSizeCache.h;
        }

        this.x = startX - (this.width / 2);
        this.y = startY;

        const angleRad = Math.atan2(targetY - startY, targetX - startX);
        // 降低敌方子弹的初始速度与成长速度
        const speed = 2.5 + (playerStats.level * 0.1);
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
        setTimeout(() => ElementPool.release('enemyBullet', el), 50); 
    }
}

class ExpDrop {
    constructor(x, y, value) {
        this.x = x; this.y = y; this.value = value;
        this.element = ElementPool.get('expDrop', () => {
            let el = document.createElement('div');
            el.className = 'exp-drop';
            container.appendChild(el);
            return el;
        });
        this.element.textContent = Math.random() < 0.5 ? '0' : '1';
        this.x += (Math.random() - 0.5) * 40;
        this.y += (Math.random() - 0.5) * 40;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }
    update(globalSpeedMult) {
        let dx = playerX - this.x;
        let dy = playerY - this.y;
        let dist = Math.hypot(dx, dy);
        if (dist < playerStats.pickupRange) {
            let speed = 15 * globalSpeedMult;
            if (dist < speed) {
                this.remove(); gainXp(this.value); return false;
            }
            this.x += (dx / dist) * speed; this.y += (dy / dist) * speed;
        } else {
            this.y += 0.5 * globalSpeedMult; 
            if (this.y > window.innerHeight) { this.remove(); return false; }
        }
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        return true;
    }
    remove() { ElementPool.release('expDrop', this.element); }
}

class BossExpDrop {
    constructor(x, y, value) {
        this.x = x; this.y = y; this.value = value;
        this.element = ElementPool.get('bossExpDrop', () => {
            let el = document.createElement('div');
            el.className = 'boss-exp-drop';
            let inner = document.createElement('div');
            inner.className = 'boss-exp-inner';
            inner.textContent = '[ CORE_DUMP ]';
            el.appendChild(inner);
            container.appendChild(el);
            return el;
        });
        this.x += (Math.random() - 0.5) * 40;
        this.y += (Math.random() - 0.5) * 40;
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }
    update(globalSpeedMult) {
        let dx = playerX - (this.x + 18);
        let dy = playerY - (this.y + 18);
        let dist = Math.hypot(dx, dy);
        if (dist < playerStats.pickupRange) {
            let speed = 15 * globalSpeedMult;
            if (dist < speed) {
                this.remove(); 
                showDamageText(playerX, playerY - 40, `+${this.value} XP`, 'crit');
                gainXp(this.value); 
                return false;
            }
            this.x += (dx / dist) * speed; this.y += (dy / dist) * speed;
        } else {
            this.y += 0.3 * globalSpeedMult; 
            if (this.y > window.innerHeight) { this.remove(); return false; }
        }
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        return true;
    }
    remove() { ElementPool.release('bossExpDrop', this.element); }
}

function showDamageText(x, y, amount, type) {
    const wrapper = ElementPool.get('damageText', () => {
        let el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.zIndex = '100';
        let txt = document.createElement('div');
        el.appendChild(txt);
        container.appendChild(el);
        txt.addEventListener('animationend', () => ElementPool.release('damageText', el));
        return el;
    });

    const txt = wrapper.firstChild;
    txt.className = `damage-text damage-${type}`;
    txt.textContent = type === 'player' ? `-${amount}` : amount;
    
    // 重置动画使其重新播放
    txt.style.animation = 'none';
    void txt.offsetWidth;
    txt.style.animation = null;

    const scatterX = (Math.random() - 0.5) * 30;
    wrapper.style.transform = `translate3d(${x + scatterX}px, ${y}px, 0)`;
}

function createPopupInfo(x, y, message, cssClass, isCrit = false) {
    const wrapper = ElementPool.get('popupInfo', () => {
        let el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.zIndex = '25';
        el.style.pointerEvents = 'none';
        let exp = document.createElement('div');
        el.appendChild(exp);
        container.appendChild(el);
        exp.addEventListener('animationend', () => ElementPool.release('popupInfo', el));
        return el;
    });

    const exp = wrapper.firstChild;
    let finalClass = cssClass;
    if (isCrit) finalClass += ' crit-explosion';

    exp.className = finalClass;
    exp.textContent = isCrit ? '[FATAL CRIT] ' + message : message;

    // 重置动画使其重新播放
    exp.style.animation = 'none';
    void exp.offsetWidth;
    exp.style.animation = null;

    wrapper.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function updateEventTimerUI(ms) {
    const timer = document.getElementById('event-timer');
    if (timer) timer.textContent = (ms / 1000).toFixed(1);
}

function spawnCodeBlock() {
    if (gameState !== 'PLAYING' || activeBoss !== null) return;
    codeBlocks.push(new CodeBlock(container, playerStats.level));
    let spawnRate = Math.max(400, 1500 * Math.pow(0.9, playerStats.level - 1));
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

function updateAmmoDisplay() {
    const ammoEl = document.getElementById('ammo-display');
    const playerAmmoText = document.getElementById('player-ammo-text');
    const playerReloadBg = document.getElementById('player-reload-bar-bg');
    
    if (isReloading) {
        if (ammoEl) { ammoEl.textContent = 'RELOADING...'; ammoEl.style.color = 'var(--warning-color)'; }
        if (playerAmmoText) { playerAmmoText.textContent = 'RELOADING'; playerAmmoText.style.color = 'var(--warning-color)'; }
        if (playerReloadBg) playerReloadBg.style.display = 'block';
    } else {
        let color = currentAmmo <= playerStats.maxAmmo * 0.25 ? 'var(--error-color)' : 'var(--primary-color)';
        if (ammoEl) { ammoEl.textContent = `${currentAmmo}/${playerStats.maxAmmo}`; ammoEl.style.color = color; }
        if (playerAmmoText) { playerAmmoText.textContent = `${currentAmmo}/${playerStats.maxAmmo}`; playerAmmoText.style.color = color; }
        if (playerReloadBg) playerReloadBg.style.display = 'none';
    }
}

function showAnnouncement(text) {
    const banner = document.getElementById('announcement-banner');
    if (!banner) return;
    banner.innerHTML = text;
    banner.classList.add('announcement-show');
    clearTimeout(announcementTimeout);
    announcementTimeout = setTimeout(() => {
        banner.classList.remove('announcement-show');
    }, 3000);
}

function takePlayerDamage(amount, bypassShield = false) {
    if (Math.random() < playerStats.dodgeRate) {
        showDamageText(playerX, playerY - 20, "Dodged!", 'crit');
        return;
    }
    
    let damageToLives = amount;
    if (!bypassShield && playerStats.shield > 0) {
        playSound('shield');
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
        playSound('hurt');
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
    if (isNaN(amount) || amount <= 0) return; // 致命错误拦截，防止系统经验池被 NaN 污染
    amount = amount * playerStats.xpMult;
    playerStats.xp += amount;
    let levelUps = 0;
    while (playerStats.xp >= playerStats.xpNeeded) {
        playerStats.xp -= playerStats.xpNeeded;
        playerStats.level++;
        playerStats.xpNeeded = Math.floor(playerStats.xpNeeded * 1.2);
        levelUps++;
    }
    if (levelUps > 0) {
        levelDisplay.textContent = playerStats.level;
        pendingLevelUps += levelUps;
        if (gameState === 'PLAYING') {
            triggerLevelUp();
        }
    }
    xpBar.style.width = `${(playerStats.xp / playerStats.xpNeeded) * 100}%`;
    if (xpText) xpText.textContent = `${Math.floor(playerStats.xp)} / ${playerStats.xpNeeded}`;
}

let pendingFp = 0;
let pendingAlloc = {};
let selectedUpgOpt = null;
let currentRefreshCost = 5;
let currentHealCost = 10;
let pendingLevelUps = 0; // 升级队列计数器

const fpCosts = {
    multiShot: 8,
    fireRate: 4,
    damageUp: 3,
    bulletSpeed: 2,
    pierce: 6
};

function triggerLevelUp() {
    container.classList.remove('hide-cursor');
    playSound('level_up');
    gameState = 'PAUSED';
    
    playerStats.firepowerPoints = (playerStats.firepowerPoints || 0) + 4; // 每次弹窗只发4点当前层级的FP
    pendingFp = playerStats.firepowerPoints;
    pendingAlloc = { multiShot: 0, fireRate: 0, damageUp: 0, bulletSpeed: 0, pierce: 0 };
    selectedUpgOpt = null;
    currentRefreshCost = 5;
    currentHealCost = 10;

    const pool = getUpgradePool(playerStats, healPlayer);
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const options = shuffled.slice(0, 4);

    const baseTitle = langConfig[currentLang].levelUpTitle;
    let remainingText = pendingLevelUps > 1 ? `<br><span style="font-size:18px; color:var(--warning-color);">[ 连续跃升！剩余 ${pendingLevelUps - 1} 次优化待选择 ]</span>` : '';
    document.getElementById('level-up-title').innerHTML = baseTitle + remainingText;

    renderLevelUpUI(options);
    levelUpScreen.style.display = 'flex';
}

function renderLevelUpUI(options) {
    const confirmBtn = document.getElementById('confirm-upg-btn');
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = '1';
    
    confirmBtn.onclick = () => {
        if (!selectedUpgOpt) {
            playerStats.firepowerPoints = pendingFp + 4; // 跳过给额外点数
        } else {
            playerStats.firepowerPoints = pendingFp;
        }
        
        for (let k in pendingAlloc) {
            for (let i = 0; i < pendingAlloc[k]; i++) {
                if (k === 'multiShot') playerStats.multiShot += 1;
                if (k === 'fireRate') playerStats.fireRateModifier *= 0.8;
                if (k === 'damageUp') playerStats.damage += 5;
                if (k === 'bulletSpeed') playerStats.bulletSpeed *= 1.3;
                if (k === 'pierce') playerStats.pierce += 1;
                playerStats.upgrades[k] = (playerStats.upgrades[k] || 0) + 1;
            }
        }
        
        if (selectedUpgOpt) {
            selectedUpgOpt.apply();
        }
        
        pendingLevelUps--;
        if (pendingLevelUps > 0) {
            triggerLevelUp(); // 消耗一次后，如果还有排队的升级，马上再弹下一次
        } else {
            levelUpScreen.style.display = 'none';
            gameState = 'PLAYING';
            container.classList.add('hide-cursor');
            isPointerDown = false;
            lastFrameTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    };

    const btnRefresh = document.getElementById('btn-refresh');
    btnRefresh.onclick = () => {
        const cost = Math.floor(currentRefreshCost);
        if (pendingFp >= cost) {
            pendingFp -= cost;
            currentRefreshCost = Math.floor(currentRefreshCost * 1.5);
            const pool = getUpgradePool(playerStats, healPlayer);
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            renderUpgCards(shuffled.slice(0, 4));
            updateFpPanel();
        }
    };

    const btnHeal = document.getElementById('btn-heal');
    btnHeal.onclick = () => {
        const cost = Math.floor(currentHealCost);
        if (pendingFp >= cost) {
            if (lives >= playerStats.maxLives) {
                btnHeal.textContent = "负载已满！";
                setTimeout(() => { 
                    if (btnHeal) {
                        btnHeal.textContent = `回复负载 (消耗: ${Math.floor(currentHealCost)})`;
                        updateFpPanel();
                    }
                }, 1000);
                return;
            }
            pendingFp -= cost;
            currentHealCost = Math.floor(currentHealCost * 1.5);
            healPlayer(500);
            updateFpPanel();
        }
    };

    renderUpgCards(options);
    updateFpPanel();
}

function renderUpgCards(options) {
    const confirmBtn = document.getElementById('confirm-upg-btn');
    upgradeContainer.innerHTML = '';
    selectedUpgOpt = null;
    updateConfirmBtnText();
    
    options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        if (opt.isAdvanced) { card.classList.add('advanced-card'); }
        
        let progressHtml = '';
        if (opt.isAdvanced) {
            progressHtml = `<div class="upgrade-progress" style="color: #ffcc00; text-shadow: 0 0 5px #ffcc00;">[ 突破极限 ]</div>`;
        } else if (opt.cap) {
            const count = playerStats.upgrades[opt.id] || 0;
            let dots = '';
            for (let i = 0; i < opt.cap; i++) {
                dots += i < count ? '■' : '□';
            }
            progressHtml = `<div class="upgrade-progress">${dots}</div>`;
        } else {
            const count = playerStats.upgrades[opt.id] || 0;
            progressHtml = `<div class="upgrade-progress">已获取: ${count}</div>`;
        }

        card.innerHTML = `<div class="upgrade-title">${opt.isAdvanced ? '【进阶】' : ''}${opt.title}</div><div class="upgrade-desc">${opt.desc}</div>${progressHtml}`;
        card.onclick = () => {
            if (selectedUpgOpt === opt) {
                card.classList.remove('selected-card');
                selectedUpgOpt = null;
            } else {
                document.querySelectorAll('.upgrade-card').forEach(c => c.classList.remove('selected-card'));
                card.classList.add('selected-card');
                selectedUpgOpt = opt;
            }
            updateConfirmBtnText();
        };
        upgradeContainer.appendChild(card);
    });
}

function updateConfirmBtnText() {
    const confirmBtn = document.getElementById('confirm-upg-btn');
    if (!selectedUpgOpt) {
        confirmBtn.textContent = '跳过升级 (+4 点数) / 确认';
    } else {
        confirmBtn.textContent = '确认 (Confirm)';
    }
}

function getStatCap(stat, level) {
    let interval = 20;
    if (stat === 'multiShot') interval = 20;
    else if (stat === 'damageUp') interval = 10;
    else if (stat === 'pierce') interval = 15;
    else if (stat === 'bulletSpeed') interval = 8;
    else if (stat === 'fireRate') interval = 12;
    
    let cap = 3 + Math.floor(level / interval);
    let nextLevel = (Math.floor(level / interval) + 1) * interval;
    return { cap, nextLevel };
}

function updateFpPanel() {
    let currentTotalCoreLevel = 0;
    const stats = ['multiShot', 'fireRate', 'damageUp', 'bulletSpeed', 'pierce'];
    stats.forEach(k => {
        currentTotalCoreLevel += (playerStats.upgrades[k] || 0) + pendingAlloc[k];
    });
    
    document.getElementById('fp-available').textContent = pendingFp;
    
    const list = document.getElementById('fp-stats-list');
    list.innerHTML = '';
    
    const opts = langConfig[currentLang].upgrades;
    
    stats.forEach(k => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.marginBottom = '10px';
        row.style.paddingBottom = '10px';
        row.style.borderBottom = '1px dashed rgba(255, 255, 255, 0.1)';
        row.style.fontSize = '14px';
        
        const title = opts[k] ? opts[k].title : k;
        const desc = opts[k] ? opts[k].desc : '';
        const cost = fpCosts[k];
        const currentLvl = (playerStats.upgrades[k] || 0) + pendingAlloc[k];
        const { cap, nextLevel } = getStatCap(k, playerStats.level);
        
        const canAfford = pendingFp >= cost && currentLvl < cap;
        const canRefund = pendingAlloc[k] > 0;
        
        row.innerHTML = `
            <div style="flex: 2; display: flex; flex-direction: column;">
                <div style="color: var(--primary-color); font-weight: bold;">${title} <span style="color: var(--text-color); font-weight: normal;">(${currentLvl}/${cap})</span></div>
                <div style="color: var(--text-color); font-size: 11px; margin-top: 4px;">${desc} <span style="color: var(--warning-color); margin-left: 5px;">(Lv.${nextLevel} 上限提升)</span></div>
            </div>
            <div style="flex: 1; text-align: center; color: var(--warning-color);">消耗: ${cost}</div>
            <div style="flex: 1; display: flex; justify-content: flex-end; gap: 5px;">
                <button class="fp-btn" ${!canRefund ? 'disabled style="opacity:0.3"' : ''}>-</button>
                <button class="fp-btn" ${!canAfford ? 'disabled style="opacity:0.3"' : ''}>+</button>
            </div>
        `;
        
        const btns = row.querySelectorAll('button');
        btns[0].onclick = () => {
            if (canRefund) {
                pendingAlloc[k]--;
                pendingFp += cost;
                updateFpPanel();
            }
        };
        btns[1].onclick = () => {
            if (canAfford) {
                pendingAlloc[k]++;
                pendingFp -= cost;
                updateFpPanel();
            }
        };
        
        list.appendChild(row);
    });

    const btnRefresh = document.getElementById('btn-refresh');
    const btnHeal = document.getElementById('btn-heal');
    
    const rc = Math.floor(currentRefreshCost);
    btnRefresh.textContent = `刷新升级 (消耗: ${rc})`;
    if (pendingFp >= rc) {
        btnRefresh.disabled = false;
        btnRefresh.style.opacity = '1';
    } else {
        btnRefresh.disabled = true;
        btnRefresh.style.opacity = '0.3';
    }
    
    const hc = Math.floor(currentHealCost);
    if (btnHeal.textContent !== "负载已满！") {
        btnHeal.textContent = `回复负载 (消耗: ${hc})`;
    }
    if (pendingFp >= hc) {
        btnHeal.disabled = false;
        btnHeal.style.opacity = '1';
    } else {
        btnHeal.disabled = true;
        btnHeal.style.opacity = '0.3';
    }
}

function fireBullets() {
    if (isReloading || currentAmmo <= 0) return;
    playSound('bullet');
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

    currentAmmo--;
    if (currentAmmo <= 0) {
        isReloading = true;
        maxReloadTimer = Math.max(30, 120 * playerStats.reloadSpeedModifier);
        reloadTimer = maxReloadTimer;
    }
    updateAmmoDisplay();
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
                    let prevY = c.y;
                    c.y -= playerStats.knockbackDist;
                    if (prevY >= 120 && c.y < 120) {
                        c.y = 120; // 限制从屏蔽区出来的怪物无法被再次击退回屏蔽区
                    }
                }

                const isCrit = Math.random() < playerStats.critRate;
                let actualDamage = isCrit ? playerStats.damage * playerStats.critDamageMult : playerStats.damage;

                if (Math.random() < playerStats.executeChance && c.isBase) {
                    actualDamage = c.maxHp; 
                }

                showDamageText(c.x + c.width / 2, c.y, actualDamage, isCrit ? 'crit' : 'normal');

                if (c.takeDamage(actualDamage)) {
                    playSound('explode');
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

                    drops.push(new ExpDrop(cx, cy, xpVal));
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

function triggerAoEBurst() {
    playSound('explode');
    let actualRadius = playerStats.aoeRadius * playerStats.bulletSizeMult;
    const wave = document.createElement('div');
    wave.className = 'aoe-wave';
    wave.style.width = (actualRadius * 2) + 'px';
    wave.style.height = (actualRadius * 2) + 'px';
    wave.style.left = (playerX - actualRadius) + 'px';
    wave.style.top = (playerY - actualRadius) + 'px';
    container.appendChild(wave);
    setTimeout(() => wave.remove(), 600);

    for (let i = codeBlocks.length - 1; i >= 0; i--) {
        let c = codeBlocks[i];
        let d = Math.hypot((c.x+c.width/2)-playerX, (c.y+c.height/2)-playerY);
        if (d <= actualRadius + c.width / 2) { // 增加包围盒冗余判定
            let isCrit = Math.random() < playerStats.critRate;
            let dmg = playerStats.damage * playerStats.aoeDamageMult;
            if (isCrit) dmg *= playerStats.critDamageMult;
            if (Math.random() < playerStats.executeChance && c.isBase) dmg = c.maxHp; 
            
            showDamageText(c.x + c.width / 2, c.y, Math.floor(dmg), isCrit ? 'crit' : 'normal');
            
            if (c.takeDamage(dmg)) {
                const cx = c.x; const cy = c.y; const err = c.errorText; const xpVal = c.xpValue; const type = c.type;
                score++; scoreElement.textContent = score;
                c.remove(); codeBlocks.splice(i, 1);
                
                if (Math.random() < playerStats.lifeStealRate) healPlayer(playerStats.lifeStealAmount);
                if (type === 'gc_heal') { healPlayer(15); createPopupInfo(cx, cy, err, 'buff-explosion'); } 
                else if (type === 'gc_slow') { stopTheWorldTimer = 300; createPopupInfo(cx, cy, err, 'buff-explosion buff-slow-explosion'); } 
                else { createPopupInfo(cx, cy, err, 'error-explosion', isCrit); }
                drops.push(new ExpDrop(cx, cy, xpVal));
            } else {
                // 未死亡则附带特效
                if (Math.random() < playerStats.stunChance) c.stunTimer = playerStats.stunDuration;
                if (playerStats.knockbackDist > 0 && !c.isSide) {
                    let prevY = c.y; c.y -= playerStats.knockbackDist; if (prevY >= 120 && c.y < 120) c.y = 120;
                }
            }
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
        let bossTimerEl = document.getElementById('boss-timer');
        if (bossTimerEl) {
            let rMs = Math.max(0, 180000 - gameTimeMs);
            let m = Math.floor(rMs / 60000).toString().padStart(2, '0');
            let s = Math.floor((rMs % 60000) / 1000).toString().padStart(2, '0');
            bossTimerEl.textContent = `${m}:${s}`;
        }
        if (gameTimeMs >= 180000 && !boss1Spawned) { // Boss 出场提前到 180 秒 (第 3 分钟)
            boss1Spawned = true;
            if (bossTimerEl) bossTimerEl.parentElement.style.display = 'none';
            if (typeof spawnBoss1 === 'function') spawnBoss1();
        }
    } else {
        activeBoss.update(globalSpeedMult);
        
        bossMobTimer -= dt;
        if (bossMobTimer <= 0) {
            let forceType = null;
            let r = Math.random();
            if (r < 0.20) forceType = 'gc_heal';
            else if (r < 0.40) forceType = 'gc_slow';
            codeBlocks.push(new CodeBlock(container, playerStats.level, forceType));
            bossMobTimer = 1500; // 恒定 1.5 秒生成怪物
        }
    }

    // 新增：自动攻击与脉冲逻辑判定
    if (playerStats.homingCount > 0) {
        if (window.homingTimer === undefined) window.homingTimer = 0;
        window.homingTimer -= dt;
        if (window.homingTimer <= 0) {
            window.homingTimer = (playerStats.homingPierce > 0 ? 1000 : 2000) * playerStats.fireRateModifier; 
            let totalHoming = playerStats.homingCount * playerStats.multiShot; // 继承多重射击
            let baseSpread = 35; // 加大初始抛射的扇形散布角度
            let startAngle = -baseSpread * (totalHoming - 1) / 2;
            for(let i = 0; i < totalHoming; i++) {
                // 抛射时加入轻微的角度扰动
                let angle = startAngle + (baseSpread * i) + (Math.random() - 0.5) * 15;
                bullets.push(new HomingBullet(playerX, playerY, angle));
            }
        }
    }
    if (playerStats.aoeRadius > 0) {
        if (window.aoeTimer === undefined) window.aoeTimer = 0;
        window.aoeTimer -= dt;
        if (window.aoeTimer <= 0) {
            window.aoeTimer = 3000 * playerStats.fireRateModifier; // 继承射击频率
            triggerAoEBurst();
        }
    }

    if (isReloading) {
        reloadTimer -= 1;
        const bar = document.getElementById('player-reload-bar');
        if (bar && maxReloadTimer > 0) {
            bar.style.width = `${((maxReloadTimer - reloadTimer) / maxReloadTimer) * 100}%`;
        }
        if (reloadTimer <= 0) {
            isReloading = false;
            currentAmmo = playerStats.maxAmmo;
            updateAmmoDisplay();
        }
    } else {
        if (isPointerDown && fireCooldownTimer <= 0) {
            fireBullets(); fireCooldownTimer = playerStats.baseFireRateLimit * playerStats.fireRateModifier;
        }
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
    for (let i = drops.length - 1; i >= 0; i--) {
        if (!drops[i].update(globalSpeedMult)) drops.splice(i, 1);
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
    container.classList.add('hide-cursor');
    bgmSystem.currentPhase = 1;
    bgmSystem.lastPlayedPhaseTrack = null;
    bgmSystem.playPhaseBGM(1);
    score = 0; stopTheWorldTimer = 0;
    gameTimeMs = 0; activeBoss = null; boss1Spawned = false;
    lastFrameTime = performance.now();
    bossMobTimer = 0;
    window.bossPhase2 = false;
    
    playerStats.homingCount = 0;
    playerStats.aoeRadius = 0;
    playerStats.homingPierce = 0;
    playerStats.aoeDamageMult = 3.0;
    window.homingTimer = 0; window.aoeTimer = 0;

    playerStats.level = 1; playerStats.xp = 0; playerStats.xpNeeded = 20;
    playerStats.fireRateModifier = 1.0; playerStats.damage = 1;
    playerStats.bulletSpeed = 8; playerStats.multiShot = 1;
    playerStats.pierce = 0; playerStats.critRate = 0.1;
    playerStats.critDamageMult = 3.0; playerStats.dodgeRate = 0.0; playerStats.lifeStealRate = 0.0; playerStats.lifeStealAmount = 1;
    playerStats.globalSlow = 0.0; playerStats.knockbackDist = 0; playerStats.stunChance = 0.0; playerStats.stunDuration = 60;
    playerStats.bulletSizeMult = 1.0; playerStats.xpMult = 1.0; playerStats.executeChance = 0.0;
    playerStats.maxLives = 200; playerStats.maxShield = 0; playerStats.shield = 0;
    playerStats.pickupRange = 150;
    playerStats.maxAmmo = 30; playerStats.reloadSpeedModifier = 1.0;
    playerStats.upgrades = {}; playerStats.advanced = {};
    playerStats.firepowerPoints = 0;
    pendingLevelUps = 0;
    lives = 200;
    currentAmmo = 30; isReloading = false; reloadTimer = 0; maxReloadTimer = 0;
    
    const banner = document.getElementById('announcement-banner');
    if (banner) banner.classList.remove('announcement-show');

    scoreElement.textContent = score; updateLivesDisplay(); updateShieldDisplay(); levelDisplay.textContent = playerStats.level;
    xpBar.style.width = '0%';
    if (xpText) xpText.textContent = `0 / ${playerStats.xpNeeded}`;
    container.style.filter = '';

    langSelector.style.display = 'none'; // 游戏开始隐藏选择器
    startScreen.style.display = 'none'; gameOverScreen.style.display = 'none';
    if (bgCanvas) bgCanvas.style.display = 'none'; // 游戏期间彻底隐藏代码雨
    topUi.style.display = 'flex'; executionZone.style.display = 'flex'; playerElement.style.display = 'flex';
    document.getElementById('top-exclusion-zone').style.display = 'flex';
    
    let bossTimerEl = document.getElementById('boss-timer');
    if (bossTimerEl) bossTimerEl.parentElement.style.display = 'block';

    codeBlocks.forEach(b => b.remove()); bullets.forEach(b => b.remove()); enemyBullets.forEach(b => b.remove());
    drops.forEach(d => d.remove()); drops = [];
    document.querySelectorAll('.damage-text, .error-explosion, .buff-explosion').forEach(e => {
        if (e.parentElement && e.parentElement.style.zIndex) {
            if (e.parentElement.style.zIndex == '100') ElementPool.release('damageText', e.parentElement);
            if (e.parentElement.style.zIndex == '25') ElementPool.release('popupInfo', e.parentElement);
        }
    });
    codeBlocks = []; bullets = []; enemyBullets = []; isPointerDown = false;

    handlePlayerMove(window.innerWidth / 2, window.innerHeight - 80);
    updateAmmoDisplay();

    gameState = 'PLAYING';
    if (blockSpawnInterval) clearInterval(blockSpawnInterval);
    blockSpawnInterval = setInterval(spawnCodeBlock, 1500); // 加快初始生成速度
    
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
        container.classList.remove('hide-cursor');
        renderPauseMenu();
        pauseScreen.style.display = 'flex';
    } else if (gameState === 'PAUSED_MENU') {
        gameState = 'PLAYING';
        container.classList.add('hide-cursor');
        pauseScreen.style.display = 'none';
        isPointerDown = false;
        lastFrameTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function returnToMenu() {
    container.classList.remove('hide-cursor');
    bgmSystem.playMainMenuBGM();
    gameState = 'START';
    document.getElementById('top-exclusion-zone').style.display = 'none';
    pauseScreen.style.display = 'none'; gameOverScreen.style.display = 'none';
    topUi.style.display = 'none'; executionZone.style.display = 'none'; playerElement.style.display = 'none';
    langSelector.style.display = 'block'; startScreen.style.display = 'flex';
    if (bgCanvas) bgCanvas.style.display = 'block'; // 回到主菜单恢复代码雨
    clearInterval(blockSpawnInterval); clearInterval(autoRegenInterval); clearInterval(shieldRegenInterval); stopEventSystem();
    codeBlocks.forEach(b => b.remove()); codeBlocks = [];
    bullets.forEach(b => b.remove()); bullets = [];
    enemyBullets.forEach(b => b.remove()); enemyBullets = [];
    drops.forEach(d => d.remove()); drops = [];
    document.querySelectorAll('.damage-text, .error-explosion, .buff-explosion').forEach(e => {
        if (e.parentElement && e.parentElement.style.zIndex) {
            if (e.parentElement.style.zIndex == '100') ElementPool.release('damageText', e.parentElement);
            if (e.parentElement.style.zIndex == '25') ElementPool.release('popupInfo', e.parentElement);
        }
    });
}

function endGame() {
    container.classList.remove('hide-cursor');
    playSound('death');
    bgmSystem.stop();
    gameState = 'GAMEOVER';
    document.getElementById('final-score').textContent = score; document.getElementById('final-level').textContent = playerStats.level;
    document.getElementById('top-exclusion-zone').style.display = 'none';
    topUi.style.display = 'none'; executionZone.style.display = 'none'; playerElement.style.display = 'none';
    langSelector.style.display = 'block'; // 游戏结束恢复选择器
    if (bgCanvas) bgCanvas.style.display = 'block'; // 游戏结束恢复代码雨
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

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') togglePause();
});

// ================= 音乐播放器逻辑 =================
const musicPlayerUI = document.getElementById('music-player-screen');
let mpAudio = new Audio();
let currentTrackIndex = 0;
let isMpPlaying = false;
let mpTracks = [];

function initMusicPlayer() {
    const btnMusicPlayer = document.getElementById('btn-music-player');
    if (btnMusicPlayer) btnMusicPlayer.addEventListener('click', openMusicPlayer);
    
    const mpTrackSelect = document.getElementById('mp-track-select');

    if (typeof bgmConfig !== 'undefined' && bgmConfig.playerTracks) {
        mpTracks = bgmConfig.playerTracks;
        if (mpTrackSelect) {
            mpTrackSelect.innerHTML = '';
            mpTracks.forEach((track, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = `${idx + 1}. ${track.title}`;
                mpTrackSelect.appendChild(opt);
            });
            mpTrackSelect.addEventListener('change', (e) => {
                const selectedIdx = parseInt(e.target.value);
                if (!isNaN(selectedIdx)) {
                    currentTrackIndex = selectedIdx;
                    if (!isMpPlaying) {
                        isMpPlaying = true;
                        document.getElementById('mp-play').textContent = '⏸';
                    }
                    loadMpTrack(currentTrackIndex);
                }
            });
        }
    }

    const mpPlayBtn = document.getElementById('mp-play');
    const mpPrevBtn = document.getElementById('mp-prev');
    const mpNextBtn = document.getElementById('mp-next');
    const mpProgress = document.getElementById('mp-progress');
    const mpVolume = document.getElementById('mp-volume');

    if (!mpPlayBtn) return;

    if (mpVolume) mpVolume.style.setProperty('--progress', `${mpVolume.value}%`);
    if (mpProgress) mpProgress.style.setProperty('--progress', `${mpProgress.value}%`);

    mpPlayBtn.addEventListener('click', toggleMpPlay);
    mpPrevBtn.addEventListener('click', () => changeMpTrack(-1));
    mpNextBtn.addEventListener('click', () => changeMpTrack(1));
    
    mpAudio.addEventListener('timeupdate', () => {
        if (!isNaN(mpAudio.duration) && mpAudio.duration > 0) {
            const progress = (mpAudio.currentTime / mpAudio.duration) * 100;
            mpProgress.value = progress;
            mpProgress.style.setProperty('--progress', `${progress}%`);
            document.getElementById('mp-time-current').textContent = formatMpTime(mpAudio.currentTime);
            document.getElementById('mp-time-total').textContent = formatMpTime(mpAudio.duration);
        }
    });

    mpAudio.addEventListener('loadedmetadata', () => {
        document.getElementById('mp-time-total').textContent = formatMpTime(mpAudio.duration);
        mpProgress.value = 0;
        mpProgress.style.setProperty('--progress', `0%`);
    });

    mpAudio.addEventListener('ended', () => {
        changeMpTrack(1); // 自动播放下一首
    });

    mpProgress.addEventListener('input', (e) => {
        if (!isNaN(mpAudio.duration)) {
            mpAudio.currentTime = (e.target.value / 100) * mpAudio.duration;
            e.target.style.setProperty('--progress', `${e.target.value}%`);
        }
    });

    mpVolume.addEventListener('input', (e) => {
        mpAudio.volume = e.target.value / 100;
        e.target.style.setProperty('--progress', `${e.target.value}%`);
    });
}

function openMusicPlayer() {
    if(musicPlayerUI) musicPlayerUI.style.display = 'flex';
    bgmSystem.stop(); // 打开时停止主界面音乐
    if (mpTracks.length > 0) {
        loadMpTrack(currentTrackIndex);
    }
}

window.closeMusicPlayer = function() {
    if(musicPlayerUI) musicPlayerUI.style.display = 'none';
    mpAudio.pause();
    isMpPlaying = false;
    document.getElementById('mp-play').textContent = '▶';
    if (gameState === 'START') {
        bgmSystem.playMainMenuBGM(); // 关闭时恢复主界面音乐
    }
};

function loadMpTrack(index) {
    if (index < 0 || index >= mpTracks.length) return;
    const track = mpTracks[index];
    document.getElementById('mp-title').textContent = track.title;
    document.getElementById('mp-usage').textContent = track.usage;
    document.getElementById('mp-desc').textContent = track.desc;
    
    const mpTrackSelect = document.getElementById('mp-track-select');
    if (mpTrackSelect) mpTrackSelect.value = index;

    if(mpAudio.src.endsWith(track.path) && isMpPlaying) return;

    mpAudio.src = track.path;
    mpAudio.volume = document.getElementById('mp-volume').value / 100;
    
    if (isMpPlaying) {
        mpAudio.play().catch(e => {});
    }
}

function toggleMpPlay() {
    const mpPlayBtn = document.getElementById('mp-play');
    if (isMpPlaying) {
        mpAudio.pause();
        isMpPlaying = false;
        mpPlayBtn.textContent = '▶';
    } else {
        mpAudio.play().catch(e => {});
        isMpPlaying = true;
        mpPlayBtn.textContent = '⏸';
    }
}

function changeMpTrack(dir) {
    if (mpTracks.length === 0) return;
    currentTrackIndex += dir;
    if (currentTrackIndex < 0) currentTrackIndex = mpTracks.length - 1;
    if (currentTrackIndex >= mpTracks.length) currentTrackIndex = 0;
    
    if (!isMpPlaying) {
        isMpPlaying = true;
        document.getElementById('mp-play').textContent = '⏸';
    }
    loadMpTrack(currentTrackIndex);
}

function formatMpTime(seconds) {
    if(isNaN(seconds)) return "00:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

initMusicPlayer();
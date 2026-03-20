const baseSnippets = [
    { code: `String data = null;\ndata.length();`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot invoke "String.length()" because "data" is null\n\tat com.app.DataParser.process(DataParser.java:15)` },
    { code: `List items = null;\nitems.clear();`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot invoke "java.util.List.clear()" because "items" is null\n\tat com.app.MemoryManager.flush(MemoryManager.java:118)` },
    { code: `User u = null;\nu.getName();`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot read field "name" because "u" is null\n\tat com.app.UserDao.fetchName(UserDao.java:88)` },
    { code: `int[] arr = null;\narr[0] = 1;`, err: `Exception in thread "main" java.lang.NullPointerException:\nCannot store to null array\n\tat com.app.ArrayHelper.mutate(ArrayHelper.java:102)` }
];

const sideSnippets = [
    { code: `File f = null;\nf.delete();`, err: `Exception: Cannot invoke "File.delete()" because "f" is null` },
    { code: `Socket s = null;\ns.close();`, err: `Exception: Cannot invoke "Socket.close()" because "s" is null` }
];

const monsterDefs = [
    { type: 'normal', isBase: true, hp: 3, speedY: 1.2, color: '#d19a66', xp: 1 },
    { type: 'tank', isBase: true, hp: 12, speedY: 0.6, color: '#e06c75', xp: 3 },
    { type: 'fast', isBase: true, hp: 2, speedY: 2.2, color: '#56b6c2', xp: 2 },
    
    // 敌对精英怪 (从上落下)
    { type: 'tracker', isBase: false, hp: 20, speedY: 0.8, color: '#c678dd', xp: 6, code: `public void trackTarget(Player p) {\n  Vector targetPos = p.getPosition();\n  this.x += (targetPos.x - this.x) * speed;\n}`, err: `Exception: Cannot read field "x" because "targetPos" is null` },
    { type: 'shooter', isBase: false, hp: 30, speedY: 0.4, color: '#ff4d4d', xp: 10, code: `public void fireAt(Player target) {\n  Bullet b = bulletPool.acquire();\n  b.setDirection(target.getCoords());\n}`, err: `Exception: Cannot invoke "Player.getCoords()" because "target" is null` },
    { type: 'dasher', isBase: false, hp: 18, speedY: 1.5, color: '#e5c07b', xp: 8, code: `public void executeDash() {\n  Point nextNode = pathManager.getWaypoint();\n  this.x = nextNode.x;\n}`, err: `Exception: Cannot read field "x" because "nextNode" is null` },
    { type: 'spawner', isBase: false, hp: 25, speedY: 0.3, color: '#98c379', xp: 12, code: `public void buildNode() {\n  Factory f = getFactory();\n  f.createMob(this.x, this.y);\n}`, err: `Exception: Cannot invoke "Factory.createMob()" because "f" is null` },
    { type: 'wobbler', isBase: false, hp: 15, speedY: 1.0, color: '#61afef', xp: 7, code: `public void calcWave() {\n  Data d = queue.poll();\n  float v = Math.sin(d.val);\n}`, err: `Exception: Cannot read field "val" because "d" is null` },
    
    // 【新增：侧面怪物】
    { type: 'side_basic', isBase: true, isSide: true, hp: 4, speedX: 2.5, color: '#d19a66', xp: 2 },
    { type: 'side_sniper', isBase: false, isSide: true, hp: 15, speedX: 1.2, color: '#ff4d4d', xp: 8, code: `public void asyncPing(Player p) {\n  Thread t = null;\n  // Side Thread Injecting\n  t.start();\n}`, err: `Exception: Cannot invoke "Thread.start()" because "t" is null` },

    // 有益怪
    { type: 'gc_heal', isBase: false, hp: 15, speedY: 1.5, color: '#98c379', xp: 2, code: `System.gc();\n// [GC Daemon] Minor GC triggered`, err: `[Minor GC] Unreachable objects collected.\nHeap memory recovered: +15` },
    { type: 'gc_slow', isBase: false, hp: 25, speedY: 1.8, color: '#56b6c2', xp: 5, code: `Thread.sleep(5000);\n// [JVM] Force Stop-The-World`, err: `[Full GC] Stop-The-World pause initiated.\nAll execution threads suspended.` }
];

class CodeBlock {
    constructor(container, currentLevel, forceBase = false) {
        this.element = document.createElement('div');
        this.element.className = 'code-block';
        
        let def;
        if (forceBase) {
            def = monsterDefs[Math.floor(Math.random() * 3)];
        } else {
            let rand = Math.random();
            // 重新分配生成概率，加入侧面怪
            if (currentLevel >= 4 && rand < 0.10) def = monsterDefs[9]; // side_sniper
            else if (currentLevel >= 2 && rand < 0.20) def = monsterDefs[8]; // side_basic
            else if (currentLevel >= 2 && rand < 0.24) def = monsterDefs[10]; // gc_heal
            else if (currentLevel >= 3 && rand < 0.28) def = monsterDefs[11]; // gc_slow
            else if (currentLevel >= 6 && rand < 0.35) def = monsterDefs[6]; // Spawner
            else if (currentLevel >= 5 && rand < 0.42) def = monsterDefs[7]; // Wobbler
            else if (currentLevel >= 4 && rand < 0.50) def = monsterDefs[4]; // Shooter
            else if (currentLevel >= 3 && rand < 0.58) def = monsterDefs[5]; // Dasher
            else if (currentLevel >= 2 && rand < 0.65) def = monsterDefs[3]; // Tracker
            else if (rand < 0.75) def = monsterDefs[1]; // Tank
            else if (rand < 0.85) def = monsterDefs[2]; // Fast
            else def = monsterDefs[0]; // Normal
        }

        this.type = def.type;
        this.isSide = def.isSide || false; // 标记是否为侧面怪
        this.maxHp = Math.floor(def.hp * Math.pow(1.25, currentLevel - 1));
        this.hp = this.maxHp;
        this.xpValue = def.xp;

        let displayCode = "";
        if (def.isBase) {
            const snippet = this.isSide ? sideSnippets[Math.floor(Math.random() * sideSnippets.length)] : baseSnippets[Math.floor(Math.random() * baseSnippets.length)];
            displayCode = snippet.code; this.errorText = snippet.err;
        } else {
            displayCode = def.code; this.errorText = def.err;
        }

        this.dashTimer = 0;
        this.fireCooldown = Math.max(80, 200 - currentLevel * 5); 
        this.spawnCooldown = 120; 

        // 【应用新的 IDE 窗口布局】
        this.element.innerHTML = `
            <div class="code-header">
                <div class="code-header-dot"></div><div class="code-header-dot"></div><div class="code-header-dot"></div>
            </div>
            <div class="hp-bar-bg"><div class="hp-bar" style="background-color: ${def.color}"></div></div>
            <div class="code-content"><span style="color: ${def.color}">${displayCode}</span></div>
        `;
        this.element.style.border = `1px solid ${def.color}`;
        
        container.appendChild(this.element);

        const rect = this.element.getBoundingClientRect();
        this.width = rect.width; this.height = rect.height;
        
        // 【核心修改：区分顶部生成与侧面生成】
        if (this.isSide) {
            this.dirX = Math.random() > 0.5 ? 1 : -1; // 1代表从左向右，-1代表从右向左
            this.baseSpeedX = def.speedX * this.dirX * (1 + currentLevel * 0.05);
            this.baseSpeedY = 0;
            // Y 轴随机出现在屏幕上半部分
            this.y = 50 + Math.random() * (window.innerHeight / 2);
            // X 轴起点在屏幕外侧
            this.x = this.dirX === 1 ? -this.width : window.innerWidth;
        } else {
            this.baseSpeedX = 0;
            this.baseSpeedY = def.speedY * (1 + currentLevel * 0.05);
            this.x = Math.random() * (window.innerWidth - this.width);
            this.y = -this.height;
        }
        
        this.startX = this.x; 
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    }

    takeDamage(amount) {
        this.hp -= amount;
        const hpBar = this.element.querySelector('.hp-bar');
        if(hpBar) hpBar.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
        return this.hp <= 0;
    }

    update(playerX, playerY, currentLevel, spawnEnemyBulletCallback, spawnMobCallback, globalSpeedMult) {
        // 根据类型更新物理位置
        if (this.isSide) {
            this.x += this.baseSpeedX * globalSpeedMult;
        } else {
            this.y += this.baseSpeedY * globalSpeedMult;
        }

        switch(this.type) {
            case 'tracker':
                const centerX = this.x + this.width / 2;
                if (Math.abs(centerX - playerX) > 5) { this.x += ((centerX < playerX) ? 1.5 : -1.5) * globalSpeedMult; }
                break;
            case 'shooter':
            case 'side_sniper': // 侧面狙击手共用开火逻辑
                this.fireCooldown -= globalSpeedMult;
                if (this.fireCooldown <= 0) {
                    spawnEnemyBulletCallback(this.x + this.width/2, this.y + this.height/2, playerX, playerY);
                    this.fireCooldown = Math.max(80, 200 - currentLevel * 5);
                }
                break;
            case 'dasher':
                this.dashTimer -= globalSpeedMult;
                if (this.dashTimer <= 0) {
                    this.speedX = (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 15);
                    this.dashTimer = 80;
                }
                this.x += this.speedX * globalSpeedMult;
                this.speedX *= 0.85; 
                if(this.x < 0) this.x = 0;
                if(this.x + this.width > window.innerWidth) this.x = window.innerWidth - this.width;
                break;
            case 'spawner':
                this.spawnCooldown -= globalSpeedMult;
                if (this.spawnCooldown <= 0) {
                    spawnMobCallback(this.x + this.width/2, this.y + this.height);
                    this.spawnCooldown = 120;
                }
                break;
            case 'wobbler':
                this.x = this.startX + Math.sin(this.y * 0.03) * 80;
                break;
        }

        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        
        // 边界处理：侧面怪物跑出另一侧就算越界
        if (this.isSide) {
            if ((this.dirX === 1 && this.x > window.innerWidth) || (this.dirX === -1 && this.x < -this.width)) {
                this.remove(); return 'escaped_side'; 
            }
        } else {
            if (this.y + this.height > window.innerHeight - 60) { 
                this.remove(); 
                return (this.type === 'gc_heal' || this.type === 'gc_slow') ? 'escaped' : false; 
            }
        }
        return true;
    }

    remove() { this.element.remove(); }
}
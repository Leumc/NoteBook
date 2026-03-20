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

class CodeBlock {
    constructor(container, currentLevel) {
        this.element = document.createElement('div');
        this.element.className = 'code-block';
        
        let rand = Math.random();
        let def;
        if (currentLevel >= 5 && rand < 0.15) def = monsterDefs[4]; 
        else if (currentLevel >= 4 && rand < 0.30) def = monsterDefs[5]; 
        else if (currentLevel >= 3 && rand < 0.45) def = monsterDefs[3]; 
        else if (rand < 0.65) def = monsterDefs[1]; 
        else if (rand < 0.80) def = monsterDefs[2]; 
        else def = monsterDefs[0]; 

        this.type = def.type;
        this.maxHp = Math.floor(def.hp * Math.pow(1.25, currentLevel - 1));
        this.hp = this.maxHp;
        this.speedY = def.speedY * (1 + currentLevel * 0.05); 
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
        this.fireCooldown = Math.max(80, 200 - currentLevel * 5); 

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
        if(hpBar) hpBar.style.width = `${Math.max(0, (this.hp / this.maxHp) * 100)}%`;
        return this.hp <= 0;
    }

    update(playerX, playerY, currentLevel, spawnEnemyBulletCallback) {
        this.y += this.speedY;

        switch(this.type) {
            case 'tracker':
                const centerX = this.x + this.width / 2;
                if (Math.abs(centerX - playerX) > 5) {
                    this.x += (centerX < playerX) ? 1.5 : -1.5;
                }
                break;
            case 'shooter':
                this.fireCooldown--;
                if (this.fireCooldown <= 0) {
                    spawnEnemyBulletCallback(this.x + this.width/2, this.y + this.height, playerX, playerY);
                    this.fireCooldown = Math.max(80, 200 - currentLevel * 5);
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
                if(this.x < 0) this.x = 0;
                if(this.x + this.width > window.innerWidth) this.x = window.innerWidth - this.width;
                break;
        }

        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
        if (this.y + this.height > window.innerHeight - 60) { this.remove(); return false; }
        return true;
    }

    remove() { this.element.remove(); }
}
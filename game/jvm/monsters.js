// 多语言怪物文本字典
const monsterTexts = {
    java: {
        base: [
            { code: `String data = null;\ndata.length();`, err: `Exception in thread "main"\njava.lang.NullPointerException` },
            { code: `List items = null;\nitems.clear();`, err: `Exception: Cannot invoke\n"java.util.List.clear()"` },
            { code: `User u = null;\nu.getName();`, err: `Exception: Cannot read field\n"name" because "u" is null` },
            { code: `int[] arr = null;\narr[0] = 1;`, err: `Exception: Cannot store\nto null array` }
        ],
        side: [
            { code: `File f = null;\nf.delete();`, err: `Exception: "File.delete()" on null` },
            { code: `Socket s = null;\ns.close();`, err: `Exception: "Socket.close()" on null` }
        ],
        tracker: { code: `public void track(Player p) {\n  Vector pos = p.getPos();\n  this.x += pos.x;\n}`, err: `Exception: "pos" is null` },
        shooter: { code: `public void fireAt(Player t) {\n  Bullet b = pool.get();\n  b.dir(t.getCoords());\n}`, err: `Exception: "t" is null` },
        dasher: { code: `public void dash() {\n  Point n = path.get();\n  this.x = n.x;\n}`, err: `Exception: "n" is null` },
        spawner: { code: `public void build() {\n  Factory f = get();\n  f.create(x, y);\n}`, err: `Exception: "f" is null` },
        wobbler: { code: `public void wave() {\n  Data d = q.poll();\n  float v = sin(d.val);\n}`, err: `Exception: "d" is null` },
        side_sniper: { code: `public void async(Player p) {\n  Thread t = null;\n  t.start();\n}`, err: `Exception: "t" is null` },
        gc_heal: { code: `System.gc();\n// Minor GC triggered`, err: `[Minor GC] Memory recovered: +15` },
        gc_slow: { code: `Thread.sleep(5000);\n// Force Stop-The-World`, err: `[Full GC] Stop-The-World pause.` }
    },
    python: {
        base: [
            { code: `def foo():\n  pass\nfoo(1)`, err: `TypeError: foo() takes 0\npositional arguments` },
            { code: `my_list = []\nmy_list[0]`, err: `IndexError: list index\nout of range` },
            { code: `x = None\nx.append(1)`, err: `AttributeError: 'NoneType'\nhas no attribute` },
            { code: `print(unknown_var)`, err: `NameError: name 'unknown_var'\nis not defined` }
        ],
        side: [
            { code: `import not_exist`, err: `ModuleNotFoundError: No module` },
            { code: `int('xyz')`, err: `ValueError: invalid literal` }
        ],
        tracker: { code: `def track(p):\n  pos = p.get_pos()\n  self.x += pos['x']`, err: `KeyError: 'x'` },
        shooter: { code: `def fire(t):\n  b = pool.get()\n  b.dir(t.coords)`, err: `AttributeError: 'NoneType'` },
        dasher: { code: `def dash():\n  n = path.get()\n  self.x = n.x`, err: `AttributeError: 'NoneType'` },
        spawner: { code: `def build():\n  f = get_factory()\n  f.create(x, y)`, err: `TypeError: 'NoneType' object` },
        wobbler: { code: `def wave():\n  d = q.poll()\n  v = math.sin(d.val)`, err: `AttributeError: 'val'` },
        side_sniper: { code: `def async_ping(p):\n  t = None\n  t.start()`, err: `AttributeError: 'NoneType'` },
        gc_heal: { code: `import gc\ngc.collect()`, err: `[GC] Unreachable objects collected: +15` },
        gc_slow: { code: `import time\ntime.sleep(5)\n# GIL Lock`, err: `[GIL] Global Interpreter Lock acquired.` }
    },
    cpp: {
        base: [
            { code: `int* ptr = nullptr;\n*ptr = 10;`, err: `Segmentation fault (core dumped)` },
            { code: `std::vector<int> v;\nv.at(1);`, err: `terminate called after throwing\n'std::out_of_range'` },
            { code: `char buf[2];\nstrcpy(buf, "boom");`, err: `*** stack smashing detected ***` },
            { code: `int x = 1 / 0;`, err: `Floating point exception\n(core dumped)` }
        ],
        side: [
            { code: `free(ptr);\nfree(ptr);`, err: `double free or corruption (fasttop)` },
            { code: `assert(false);`, err: `Assertion 'false' failed.` }
        ],
        tracker: { code: `void track(Player* p) {\n  auto pos = p->getPos();\n  this->x += pos.x;\n}`, err: `SegFault: Dereferencing null pointer` },
        shooter: { code: `void fire(Player* t) {\n  Bullet* b = new Bullet();\n  b->dir(t->coords);\n}`, err: `SegFault: Access violation` },
        dasher: { code: `void dash() {\n  Point* n = path->get();\n  this->x = n->x;\n}`, err: `SegFault: Invalid read of size 4` },
        spawner: { code: `void build() {\n  Factory* f = nullptr;\n  f->create(x, y);\n}`, err: `SegFault: Null pointer exception` },
        wobbler: { code: `void wave() {\n  Data* d = q.poll();\n  float v = sin(d->val);\n}`, err: `SegFault: Memory not mapped` },
        side_sniper: { code: `void async(Player* p) {\n  std::thread t;\n  t.detach();\n}`, err: `terminate called without an active exception` },
        gc_heal: { code: `delete ptr;\nptr = nullptr;`, err: `[Memory] Leak prevented. Recovered: +15` },
        gc_slow: { code: `std::this_thread::sleep_for(5s);\n// Thread blocked`, err: `[Thread] Process suspended.` }
    }
};

// 物理属性定义 (与语言无关)
const monsterDefs = [
    { type: 'normal', isBase: true, hp: 3, speedY: 1.2, color: '#d19a66', xp: 1 },
    { type: 'tank', isBase: true, hp: 12, speedY: 0.6, color: '#e06c75', xp: 3 },
    { type: 'fast', isBase: true, hp: 2, speedY: 2.2, color: '#56b6c2', xp: 2 },
    { type: 'tracker', isBase: false, hp: 20, speedY: 0.8, color: '#c678dd', xp: 6 },
    { type: 'shooter', isBase: false, hp: 30, speedY: 0.4, color: '#ff4d4d', xp: 10 },
    { type: 'dasher', isBase: false, hp: 18, speedY: 1.5, color: '#e5c07b', xp: 8 },
    { type: 'spawner', isBase: false, hp: 25, speedY: 0.3, color: '#98c379', xp: 12 },
    { type: 'wobbler', isBase: false, hp: 15, speedY: 1.0, color: '#61afef', xp: 7 },
    { type: 'side_basic', isBase: true, isSide: true, hp: 4, speedX: 2.5, color: '#d19a66', xp: 2 },
    { type: 'side_sniper', isBase: false, isSide: true, hp: 15, speedX: 1.2, color: '#ff4d4d', xp: 8 },
    { type: 'gc_heal', isBase: false, hp: 15, speedY: 1.5, color: '#98c379', xp: 2 },
    { type: 'gc_slow', isBase: false, hp: 25, speedY: 1.8, color: '#56b6c2', xp: 5 }
];

class CodeBlock {
    constructor(container, currentLevel, forceType = null) {
        this.element = document.createElement('div');
        this.element.className = 'code-block';
        
        let def;
        if (typeof forceType === 'object' && forceType !== null) {
            def = forceType;
        } else if (forceType === true) {
            def = monsterDefs[Math.floor(Math.random() * 3)];
        } else if (typeof forceType === 'string') {
            def = monsterDefs.find(d => d.type === forceType) || monsterDefs[0];
        } else {
            let rand = Math.random();
            if (currentLevel >= 4 && rand < 0.10) def = monsterDefs[9]; 
            else if (currentLevel >= 2 && rand < 0.20) def = monsterDefs[8]; 
            else if (currentLevel >= 2 && rand < 0.24) def = monsterDefs[10]; 
            else if (currentLevel >= 3 && rand < 0.28) def = monsterDefs[11]; 
            else if (currentLevel >= 6 && rand < 0.35) def = monsterDefs[6]; 
            else if (currentLevel >= 5 && rand < 0.42) def = monsterDefs[7]; 
            else if (currentLevel >= 4 && rand < 0.50) def = monsterDefs[4]; 
            else if (currentLevel >= 3 && rand < 0.58) def = monsterDefs[5]; 
            else if (currentLevel >= 2 && rand < 0.65) def = monsterDefs[3]; 
            else if (rand < 0.75) def = monsterDefs[1]; 
            else if (rand < 0.85) def = monsterDefs[2]; 
            else def = monsterDefs[0]; 
        }

        this.type = def.type;
        this.isSide = def.isSide || false;
        this.maxHp = (typeof forceType === 'object' && forceType !== null) ? Math.floor(def.hp) : Math.floor(def.hp * Math.pow(1.25, currentLevel - 1));
        this.hp = this.maxHp;
        this.xpValue = def.xp;

        // 核心修改：动态获取当前语言的代码和错误文本
        const texts = monsterTexts[currentLang];
        let displayCode = "";
        
        if (def.code && def.err) {
            displayCode = def.code;
            this.errorText = def.err;
        } else if (def.isBase) {
            const pool = this.isSide ? texts.side : texts.base;
            const snippet = pool[Math.floor(Math.random() * pool.length)];
            displayCode = snippet.code; this.errorText = snippet.err;
        } else {
            // 对于精英怪，映射字典中的具体 type
            let specificText = texts[this.type];
            if (specificText) {
                displayCode = specificText.code;
                this.errorText = specificText.err;
            } else {
                // 如果字典没有对应的（例如 side_basic），退化处理
                displayCode = "// Loading logic...";
                this.errorText = "Unknown Error";
            }
        }

        this.isBossPart = def.isBossPart || false;
        this.customRoleObj = def;

        this.dashTimer = 0;
        this.fireCooldown = Math.max(80, 200 - currentLevel * 5); 
        this.spawnCooldown = 120; 
        this.stunTimer = 0;

        this.element.innerHTML = `
            <div class="code-header">
                <div class="code-header-dot"></div><div class="code-header-dot"></div><div class="code-header-dot"></div>
                <div class="hp-text">${this.hp}/${this.maxHp}</div>
            </div>
            <div class="hp-bar-bg"><div class="hp-bar" style="background-color: ${def.color}"></div></div>
            <div class="code-content"><span style="color: ${def.color}">${displayCode}</span></div>
        `;
        this.element.style.border = `1px solid ${def.color}`;
        
        container.appendChild(this.element);

        const rect = this.element.getBoundingClientRect();
        this.width = rect.width; this.height = rect.height;
        
        if (this.isSide) {
            this.dirX = Math.random() > 0.5 ? 1 : -1;
            this.baseSpeedX = def.speedX * this.dirX * (1 + currentLevel * 0.05);
            this.baseSpeedY = 0;
            this.y = 50 + Math.random() * (window.innerHeight / 2);
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
        const hpText = this.element.querySelector('.hp-text');
        if(hpText) hpText.textContent = `${Math.max(0, this.hp)}/${this.maxHp}`;
        return this.hp <= 0;
    }

    update(playerX, playerY, currentLevel, spawnEnemyBulletCallback, spawnMobCallback, globalSpeedMult) {
        if (this.stunTimer > 0) {
            this.stunTimer -= globalSpeedMult;
            return true;
        }

        if (this.isBossPart) {
            this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
            return true;
        }

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
            case 'side_sniper':
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

    remove() { this.destroyed = true; this.element.remove(); }
}
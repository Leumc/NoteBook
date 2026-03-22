// 多语言怪物文本字典
const monsterTexts = {
    java: {
        base: [
            { code: `String data = null;\ndata.length();`, err: `Exception in thread "main"\njava.lang.NullPointerException`, exp: `试图调用 null 对象的实例方法。在 Java 中，当引用变量没有指向任何实际对象时，对其进行方法调用会抛出 NullPointerException。` },
            { code: `List items = null;\nitems.clear();`, err: `Exception: Cannot invoke\n"java.util.List.clear()"`, exp: `试图清空一个尚未初始化（或被置为 null）的集合。必须先进行实例化（如 new ArrayList<>()）。` },
            { code: `User u = null;\nu.getName();`, err: `Exception: Cannot read field\n"name" because "u" is null`, exp: `在对象实例未被正确分配内存（为 null）时，尝试读取它的内部字段属性。` },
            { code: `int[] arr = null;\narr[0] = 1;`, err: `Exception: Cannot store\nto null array`, exp: `试图向未初始化的数组分配元素。数组必须先分配大小（例如 new int[10]）才能通过索引进行操作。` }
        ],
        side: [
            { code: `File f = null;\nf.delete();`, err: `Exception: "File.delete()" on null`, exp: `尝试在空引用上调用文件操作方法，引发不可预料的空指针崩溃。` },
            { code: `Socket s = null;\ns.close();`, err: `Exception: "Socket.close()" on null`, exp: `网络套接字引用未实例化或已丢失，无法执行关闭操作。` }
        ],
        tracker: { code: `public void track(Player p) {\n  Vector pos = p.getPos();\n  this.x += pos.x;\n}`, err: `Exception: "pos" is null`, exp: `目标玩家未能正确返回其坐标位置，导致后续读取 x 分量时遇到空指针。` },
        shooter: { code: `public void fireAt(Player t) {\n  Bullet b = pool.get();\n  b.dir(t.getCoords());\n}`, err: `Exception: "t" is null`, exp: `传入的目标对象 t 为空，无法获取其坐标来设定子弹方向。` },
        dasher: { code: `public void dash() {\n  Point n = path.get();\n  this.x = n.x;\n}`, err: `Exception: "n" is null`, exp: `寻路系统未能提供有效的下一个节点（返回了 null），导致直接读取节点坐标时崩溃。` },
        spawner: { code: `public void build() {\n  Factory f = get();\n  f.create(x, y);\n}`, err: `Exception: "f" is null`, exp: `获取工厂实例失败。可能是工厂尚未初始化或已被垃圾回收机制清理。` },
        wobbler: { code: `public void wave() {\n  Data d = q.poll();\n  float v = sin(d.val);\n}`, err: `Exception: "d" is null`, exp: `从队列中取出的数据对象为 null（队列可能为空），进而读取其 val 属性导致异常。` },
        side_sniper: { code: `public void async(Player p) {\n  Thread t = null;\n  t.start();\n}`, err: `Exception: "t" is null`, exp: `线程对象尚未通过 new Thread() 实例化便被调用 start() 方法。` },
        gc_heal: { code: `System.gc();\n// Minor GC triggered`, err: `[Minor GC] Memory recovered: +15`, exp: `[系统增益] 主动调用 System.gc() 提示 JVM 运行垃圾回收，释放了不再使用的内存对象，从而降低了系统负载。` },
        gc_slow: { code: `Thread.sleep(5000);\n// Force Stop-The-World`, err: `[Full GC] Stop-The-World pause.`, exp: `[环境负面] 模拟了 Full GC 时的 Stop-The-World (STW) 现象，此时 JVM 会暂停所有应用线程，导致系统陷入卡顿。` }
    },
    python: {
        base: [
            { code: `def foo():\n  pass\nfoo(1)`, err: `TypeError: foo() takes 0\npositional arguments`, exp: `函数 foo 被定义为不接收任何参数，但调用时传入了 1 个参数，导致参数数量不匹配的类型错误。` },
            { code: `my_list = []\nmy_list[0]`, err: `IndexError: list index\nout of range`, exp: `尝试访问一个空列表的第一个元素。在 Python 中，访问超出列表范围的索引会抛出 IndexError。` },
            { code: `x = None\nx.append(1)`, err: `AttributeError: 'NoneType'\nhas no attribute`, exp: `变量 x 被赋值为 None，但试图调用其 append 方法。NoneType 对象没有任何方法或属性。` },
            { code: `print(unknown_var)`, err: `NameError: name 'unknown_var'\nis not defined`, exp: `使用了未经声明或赋值的变量。Python 解释器找不到该名称对应的对象，抛出 NameError。` }
        ],
        side: [
            { code: `import not_exist`, err: `ModuleNotFoundError: No module`, exp: `尝试导入一个系统中不存在或未安装的第三方库模块。` },
            { code: `int('xyz')`, err: `ValueError: invalid literal`, exp: `尝试将非数字格式的字符串转换为整数，无法完成解析而抛出 ValueError。` }
        ],
        tracker: { code: `def track(p):\n  pos = p.get_pos()\n  self.x += pos['x']`, err: `KeyError: 'x'`, exp: `字典 pos 中不存在键 'x'。可能返回的是不同格式的数据结构或确实缺少该键。` },
        shooter: { code: `def fire(t):\n  b = pool.get()\n  b.dir(t.coords)`, err: `AttributeError: 'NoneType'`, exp: `传入的对象 t 是 None，因此无法访问其 coords 属性。` },
        dasher: { code: `def dash():\n  n = path.get()\n  self.x = n.x`, err: `AttributeError: 'NoneType'`, exp: `寻路节点 n 为 None，试图读取其属性 x 时引发 AttributeError。` },
        spawner: { code: `def build():\n  f = get_factory()\n  f.create(x, y)`, err: `TypeError: 'NoneType' object`, exp: `get_factory() 返回了 None，尝试调用其方法（当做对象使用）时导致类型错误。` },
        wobbler: { code: `def wave():\n  d = q.poll()\n  v = math.sin(d.val)`, err: `AttributeError: 'val'`, exp: `对象 d 中缺少 val 属性，或者对象 d 根本就是 None。` },
        side_sniper: { code: `def async_ping(p):\n  t = None\n  t.start()`, err: `AttributeError: 'NoneType'`, exp: `线程变量 t 被赋值为 None，不存在 start 方法。` },
        gc_heal: { code: `import gc\ngc.collect()`, err: `[GC] Unreachable objects collected: +15`, exp: `[系统增益] 通过调用 gc.collect() 强制进行垃圾回收，回收了循环引用的孤岛对象，恢复了系统负载。` },
        gc_slow: { code: `import time\ntime.sleep(5)\n# GIL Lock`, err: `[GIL] Global Interpreter Lock acquired.`, exp: `[环境负面] 调用 time.sleep 导致当前线程挂起，并模拟了全局解释器锁 (GIL) 被长时间占用的卡顿阻塞情况。` }
    },
    cpp: {
        base: [
            { code: `int* ptr = nullptr;\n*ptr = 10;`, err: `Segmentation fault (core dumped)`, exp: `对空指针进行了解引用并尝试写入数据。操作系统检测到非法内存访问，触发了段错误（Segmentation fault）。` },
            { code: `std::vector<int> v;\nv.at(1);`, err: `terminate called after throwing\n'std::out_of_range'`, exp: `使用 at() 方法访问 vector 中不存在的索引，C++ 标准库抛出了 std::out_of_range 异常导致程序被 terminate。` },
            { code: `char buf[2];\nstrcpy(buf, "boom");`, err: `*** stack smashing detected ***`, exp: `将过长的字符串复制到了过小的缓冲区中，导致栈溢出。现代编译器检测到栈破坏后主动中止了程序。` },
            { code: `int x = 1 / 0;`, err: `Floating point exception\n(core dumped)`, exp: `发生了除以零的未定义行为，触发了 CPU 的硬件异常指令，导致核心转储。` }
        ],
        side: [
            { code: `free(ptr);\nfree(ptr);`, err: `double free or corruption (fasttop)`, exp: `对同一块内存地址连续释放了两次。这破坏了内存分配器的内部结构，引发严重错误。` },
            { code: `assert(false);`, err: `Assertion 'false' failed.`, exp: `断言失败，程序遇到不应发生的逻辑状态，主动调用 abort() 退出程序。` }
        ],
        tracker: { code: `void track(Player* p) {\n  auto pos = p->getPos();\n  this->x += pos.x;\n}`, err: `SegFault: Dereferencing null pointer`, exp: `指针 p 为空，调用 p->getPos() 时发生了非法的内存访问导致段错误。` },
        shooter: { code: `void fire(Player* t) {\n  Bullet* b = new Bullet();\n  b->dir(t->coords);\n}`, err: `SegFault: Access violation`, exp: `目标指针 t 指向非法内存或为空，访问其 coords 成员导致访问冲突。` },
        dasher: { code: `void dash() {\n  Point* n = path->get();\n  this->x = n->x;\n}`, err: `SegFault: Invalid read of size 4`, exp: `n 是一个悬空指针或空指针，尝试读取 4 字节的坐标数据时引发段错误。` },
        spawner: { code: `void build() {\n  Factory* f = nullptr;\n  f->create(x, y);\n}`, err: `SegFault: Null pointer exception`, exp: `直接通过值为 nullptr 的工厂指针调用其成员函数，造成进程崩溃。` },
        wobbler: { code: `void wave() {\n  Data* d = q.poll();\n  float v = sin(d->val);\n}`, err: `SegFault: Memory not mapped`, exp: `队列返回的指针 d 为空或指向未映射的内存地址，读取 val 时触发了段错误。` },
        side_sniper: { code: `void async(Player* p) {\n  std::thread t;\n  t.detach();\n}`, err: `terminate called without an active exception`, exp: `创建了空的线程对象但试图调用其 detach()，这是非法的行为。` },
        gc_heal: { code: `delete ptr;\nptr = nullptr;`, err: `[Memory] Leak prevented. Recovered: +15`, exp: `[系统增益] 正确使用了 delete 释放堆内存，并将指针置空，防止了内存泄漏和野指针的产生。` },
        gc_slow: { code: `std::this_thread::sleep_for(5s);\n// Thread blocked`, err: `[Thread] Process suspended.`, exp: `[环境负面] 主线程或关键线程被强制休眠，导致整个程序的响应循环停滞，表现为全局卡顿减速。` }
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
        this.maxHp = (typeof forceType === 'object' && forceType !== null) ? Math.floor(def.hp) : Math.floor(def.hp * Math.pow(1.20, currentLevel - 1));
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
        this.fireCooldown = Math.max(120, 300 - currentLevel * 5); 
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
            this.baseSpeedX = def.speedX * this.dirX * (1 + currentLevel * 0.03);
            this.baseSpeedY = 0;
            this.y = 50 + Math.random() * (window.innerHeight / 2);
            this.x = this.dirX === 1 ? -this.width : window.innerWidth;
        } else {
            this.baseSpeedX = 0;
            this.baseSpeedY = def.speedY * (1 + currentLevel * 0.03);
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
                    this.fireCooldown = Math.max(120, 300 - currentLevel * 5);
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
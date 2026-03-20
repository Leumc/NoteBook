function spawnBoss1() {
    activeBoss = new Boss1(playerStats.level);
}

const bossTexts = {
    java: {
        core: { code: `public class BossCore implements Runnable {\n  private List<Module> modules;\n  public void run() {\n    while(!Thread.interrupted()) {\n      checkHealth(modules);\n      syncState();\n    }\n  }\n}`, err: `FATAL ERROR: System Core NullPointerException\nKernel panic: attempt to kill init!` },
        healer: { code: `public void restore() {\n  for(Node n : adjNodes) {\n    if(n.hp < n.max) {\n      Memory.allocate(n, 500);\n    }\n  }\n}`, err: `OutOfMemoryError: Java heap space\nHealer daemon terminated.` },
        cannon: { code: `public void fireBarrage() {\n  Stream.generate(Exception::new)\n        .limit(50)\n        .forEach(e -> e.throwIt());\n}`, err: `StackOverflowError: deeply nested method call.` },
        shielder: { code: `public void deployWall() {\n  if(wall == null || wall.isBroken()) {\n    wall = new ShieldWall(10000);\n    SecurityManager.checkPermission(wall);\n  }\n}`, err: `SecurityException: Permission denied.` },
        shield_wall: { code: `/* Encrypted Payload:\n * [0x4F, 0x2A, 0x11, 0x9C]\n * DO NOT MODIFY\n * Signature: VALID */`, err: `Shield Decryption Failed.` }
    },
    python: {
        core: { code: `class BossCore:\n  def __init__(self):\n    self.modules = []\n  def run(self):\n    while True:\n      self.check_health()\n      asyncio.sleep(0)`, err: `RuntimeError: maximum recursion depth exceeded` },
        healer: { code: `def restore(nodes):\n  for n in nodes:\n    if n.hp < n.max_hp:\n      gc.disable()\n      n.hp += 500`, err: `MemoryError: Memory allocation failed in Healer.` },
        cannon: { code: `def fire_barrage():\n  for _ in range(50):\n    sys.stderr.write("Err\\n")\n    yield Exception("Boom")`, err: `GeneratorExit: Cannon generator closed unexpectedly.` },
        shielder: { code: `def deploy_wall():\n  if not getattr(self, 'wall'):\n    self.wall = ShieldWall()\n    os.chmod(self.wall, 0o777)`, err: `PermissionError: [Errno 13] Permission denied.` },
        shield_wall: { code: `# Encrypted Payload\n# \\x4f\\x2a\\x11\\x9c\n# DO NOT MODIFY\n# Signature: VALID`, err: `Shield Decryption Failed.` }
    },
    cpp: {
        core: { code: `int main() {\n  std::vector<Module*> mods;\n  while(true) {\n    for(auto m : mods) m->sync();\n    std::this_thread::yield();\n  }\n  return 0;\n}`, err: `Segmentation fault (core dumped)\nCore state unrecoverable.` },
        healer: { code: `void restore() {\n  for(auto& n : adj) {\n    if(n->hp < n->max) {\n      void* ptr = malloc(500);\n      n->patch(ptr);\n    }\n  }\n}`, err: `double free or corruption (out)\nHealer thread aborted.` },
        cannon: { code: `void fireBarrage() {\n  while(ammo--) {\n    throw std::runtime_error("ERR");\n  }\n}`, err: `terminate called after throwing an instance of 'std::runtime_error'` },
        shielder: { code: `void deployWall() {\n  if(!wall || wall->broken) {\n    wall = std::make_unique<Shield>();\n    mprotect(wall.get(), 10k, PROT_READ);\n  }\n}`, err: `Bus error (core dumped)\nShielder protection faulted.` },
        shield_wall: { code: `// Encrypted Payload\n// 0x4F, 0x2A, 0x11, 0x9C\n// DO NOT MODIFY\n// Signature: VALID`, err: `Shield Decryption Failed.` }
    }
};

class Boss1 {
    constructor(level) {
        this.parts = [];
        this.centerX = window.innerWidth / 2;
        this.centerY = -200; // 从屏幕上方入场
        this.targetX = window.innerWidth / 2;
        this.targetY = window.innerHeight / 3;
        this.angle = 0;
        this.moveTimer = 200;
        
        this.shieldTimer = 0;
        this.healTimer = 0;
        this.fireTimer = 0;

        // 基于玩家等级增强 Boss 属性
        const hpMult = Math.max(1, Math.pow(1.15, level - 1));
        const txt = bossTexts[currentLang] || bossTexts.java;

        // 1. 主逻辑块 (核心)
        this.core = this.createPart({
            type: 'boss_core', color: '#ff00ff', hp: 8000 * hpMult,
            code: txt.core.code, err: txt.core.err,
            isBossPart: true, customRole: 'core'
        });

        // 2. 治疗逻辑块 x3
        this.healers = [];
        for(let i = 0; i < 3; i++) {
            this.healers.push(this.createPart({
                type: 'boss_healer', color: '#00ff00', hp: 2000 * hpMult,
                code: txt.healer.code, err: txt.healer.err,
                isBossPart: true, customRole: 'healer', angleOffset: i * (Math.PI * 2 / 3), radius: 100
            }));
        }

        // 3. 主炮逻辑块 x3
        this.cannons = [];
        for(let i = 0; i < 3; i++) {
            this.cannons.push(this.createPart({
                type: 'boss_cannon', color: '#ff0000', hp: 3000 * hpMult,
                code: txt.cannon.code, err: txt.cannon.err,
                isBossPart: true, customRole: 'cannon', angleOffset: i * (Math.PI * 2 / 3), radius: 200
            }));
        }

        // 4. 护盾逻辑块 x3
        this.shielders = [];
        for(let i = 0; i < 3; i++) {
            this.shielders.push(this.createPart({
                type: 'boss_shielder', color: '#00ffff', hp: 2500 * hpMult,
                code: txt.shielder.code, err: txt.shielder.err,
                isBossPart: true, customRole: 'shielder', angleOffset: i * (Math.PI * 2 / 3) + Math.PI / 3, radius: 200
            }));
        }

        this.allParts = [this.core, ...this.healers, ...this.cannons, ...this.shielders];
        this.staticShields = []; 
    }

    createPart(def) {
        def.xp = 50; 
        let part = new CodeBlock(container, playerStats.level, def);
        part.element.style.boxShadow = `0 0 15px ${def.color}`;
        codeBlocks.push(part);
        return part;
    }

    update(globalSpeedMult) {
        if (this.core.destroyed) {
            this.die();
            return;
        }

        // 缓动移动逻辑与圆周运动
        this.centerX += (this.targetX - this.centerX) * 0.02 * globalSpeedMult;
        this.centerY += (this.targetY - this.centerY) * 0.02 * globalSpeedMult;
        this.angle += 0.005 * globalSpeedMult;

        this.moveTimer -= globalSpeedMult;
        if (this.moveTimer <= 0) {
            this.targetX = 200 + Math.random() * (window.innerWidth - 400);
            this.targetY = 100 + Math.random() * (window.innerHeight / 2.5);
            this.moveTimer = 200 + Math.random() * 200;
        }

        // 刷新所有逻辑块坐标
        if (!this.core.destroyed) {
            this.core.x = this.centerX - this.core.width / 2;
            this.core.y = this.centerY - this.core.height / 2;
        }
        const updateGroup = (arr) => {
            for(let part of arr) {
                if (part.destroyed) continue;
                let a = this.angle + part.customRoleObj.angleOffset;
                let r = part.customRoleObj.radius;
                part.x = this.centerX + Math.cos(a) * r - part.width / 2;
                part.y = this.centerY + Math.sin(a) * r - part.height / 2;
            }
        };
        updateGroup(this.healers); updateGroup(this.cannons); updateGroup(this.shielders);

        this.shieldTimer -= globalSpeedMult; this.healTimer -= globalSpeedMult; this.fireTimer -= globalSpeedMult;
        if (this.shieldTimer <= 0) { this.shieldTimer = 600; this.trySpawnShields(); }
        if (this.healTimer <= 0) { this.healTimer = 600; this.doHeal(); }
        if (this.fireTimer <= 0) { this.fireTimer = 20; this.doFire(); } // 主炮射速大幅加快

        for (let i = this.staticShields.length - 1; i >= 0; i--) {
            let s = this.staticShields[i];
            if (!s.destroyed) {
                s.lifespan -= globalSpeedMult;
                if (s.lifespan <= 0) {
                    s.takeDamage(999999);
                    s.remove();
                    let idx = codeBlocks.indexOf(s);
                    if (idx !== -1) codeBlocks.splice(idx, 1);
                    createPopupInfo(s.x, s.y, s.errorText, 'error-explosion');
                }
            } else {
                this.staticShields.splice(i, 1);
            }
        }
    }

    trySpawnShields() {
        const txt = bossTexts[currentLang] || bossTexts.java;
        for (let sh of this.shielders) {
            if (sh.destroyed) continue;
            let a = this.angle + sh.customRoleObj.angleOffset;
            let r = sh.customRoleObj.radius + 100;
            let sx = this.centerX + Math.cos(a) * r; let sy = this.centerY + Math.sin(a) * r;
            
            let tooClose = this.staticShields.some(s => !s.destroyed && Math.hypot(s.x + s.width/2 - sx, s.y + s.height/2 - sy) < 120);
            if (!tooClose) {
                let sb = new CodeBlock(container, playerStats.level, {
                    type: 'boss_shield_wall', color: '#aaaaaa', hp: 10000 * Math.pow(1.15, playerStats.level - 1),
                    code: txt.shield_wall.code, err: txt.shield_wall.err, isBossPart: true, customRole: 'shield_wall'
                });
                sb.x = sx - sb.width / 2; sb.y = sy - sb.height / 2;
                sb.lifespan = 480; // 护盾块存活时长 8 秒 (以60fps计为 480 帧)
                codeBlocks.push(sb); this.staticShields.push(sb);
            }
        }
    }

    doHeal() {
        for (let healer of this.healers) {
            if (healer.destroyed) continue;
            for (let p of [...this.cannons, ...this.shielders]) {
                if (!p.destroyed) {
                    p.hp = Math.min(p.maxHp, p.hp + 500);
                    const hpBar = p.element.querySelector('.hp-bar'); if(hpBar) hpBar.style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
                    const hpText = p.element.querySelector('.hp-text'); if(hpText) hpText.textContent = `${Math.max(0, p.hp)}/${p.maxHp}`;
                    createPopupInfo(p.x, p.y, '+500 HP', 'buff-explosion');
                }
            }
        }
    }

    doFire() {
        for (let cannon of this.cannons) {
            if (cannon.destroyed) continue;
            let a = this.angle + cannon.customRoleObj.angleOffset;
            let tx = cannon.x + cannon.width/2 + Math.cos(a) * 100; let ty = cannon.y + cannon.height/2 + Math.sin(a) * 100;
            let text = Array(5).fill(0).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 90))).join('');
            spawnEnemyBullet(cannon.x + cannon.width/2, cannon.y + cannon.height/2, tx, ty, text);
        }
    }

    die() {
        for (let part of this.allParts) { if (!part.destroyed) { part.takeDamage(999999); part.remove(); let idx = codeBlocks.indexOf(part); if(idx !== -1) codeBlocks.splice(idx, 1); } }
        for (let s of this.staticShields) { if (!s.destroyed) { s.remove(); let idx = codeBlocks.indexOf(s); if(idx !== -1) codeBlocks.splice(idx, 1); } }
        activeBoss = null;
        createPopupInfo(this.centerX, this.centerY, 'BOSS DEFEATED', 'buff-explosion');
        gainXp(1000);
    }
}
function initManual() {
    const manualHTML = `
    <div id="manual-screen" class="menu-screen" style="display: none; z-index: 500; background: rgba(12, 14, 20, 0.98);">
        <h1 style="color: var(--primary-color); text-shadow: 0 0 15px var(--primary-color); margin-bottom: 20px;">CODE DESTROYER - 手册</h1>
        
        <div id="manual-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center;">
            <button class="action-btn manual-tab-btn" id="tab-mechanics">系统机制</button>
            <button class="action-btn manual-tab-btn" id="tab-upgrades">升级列表</button>
            <button class="action-btn manual-tab-btn" id="tab-monsters">异常代码块 (怪物)</button>
            <button class="action-btn manual-tab-btn" id="tab-bosses">致命错误 (Boss)</button>
        </div>
        
        <div id="manual-content" style="width: 85%; max-width: 900px; height: 60vh; overflow-y: auto; background: rgba(0,0,0,0.6); border: 2px solid var(--primary-color); padding: 25px; text-align: left; color: var(--text-color); font-size: 14px; border-radius: 8px; line-height: 1.6;">
        </div>
        
        <button class="action-btn" style="margin-top: 25px; border-color: var(--error-color); color: var(--error-color);" onclick="closeManual()">关闭 (Close)</button>
    </div>

    <div id="preview-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 2500; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
        <h2 style="color: var(--primary-color); margin-bottom: 15px; text-shadow: 0 0 10px var(--primary-color);">行为模式追踪 / Behavior Preview</h2>
        <div id="preview-arena" style="position: relative; width: 320px; height: 400px; border: 2px dashed var(--primary-color); background: #0c0e14; overflow: hidden; box-shadow: 0 0 30px rgba(97, 175, 239, 0.2); border-radius: 8px;"></div>
        <button class="action-btn" style="margin-top: 25px; border-color: var(--error-color); color: var(--error-color);" onclick="closePreview()">终止捕获 (Close Preview)</button>
    </div>

    <div id="code-analysis-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.92); z-index: 2500; flex-direction: column; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
        <h2 style="color: var(--success-color); margin-bottom: 15px; text-shadow: 0 0 10px var(--success-color);">异常漏洞解析 / Code Analysis</h2>
        <div id="code-analysis-content" style="width: 80%; max-width: 800px; max-height: 70vh; overflow-y: auto; background: #0c0e14; border: 2px dashed var(--success-color); border-radius: 8px; padding: 20px; text-align: left; display: flex; flex-direction: column; gap: 20px;"></div>
        <button class="action-btn" style="margin-top: 25px; border-color: var(--error-color); color: var(--error-color);" onclick="closeCodeAnalysis()">关闭 (Close)</button>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', manualHTML);

    document.getElementById('tab-mechanics').onclick = (e) => switchManualTab('mechanics', e.target);
    document.getElementById('tab-upgrades').onclick = (e) => switchManualTab('upgrades', e.target);
    document.getElementById('tab-monsters').onclick = (e) => switchManualTab('monsters', e.target);
    document.getElementById('tab-bosses').onclick = (e) => switchManualTab('bosses', e.target);

    document.getElementById('btn-manual-main')?.addEventListener('click', showManual);
    document.getElementById('btn-manual-pause')?.addEventListener('click', showManual);
}

function showManual() {
    document.getElementById('manual-screen').style.display = 'flex';
    switchManualTab('mechanics', document.getElementById('tab-mechanics'));
}

function closeManual() {
    document.getElementById('manual-screen').style.display = 'none';
}

function switchManualTab(tabName, btnElement) {
    const contentDiv = document.getElementById('manual-content');
    contentDiv.innerHTML = '';
    const lang = currentLang || 'java';
    
    if (tabName === 'mechanics') {
        contentDiv.innerHTML = `
            <h2 style="color: var(--warning-color); border-bottom: 1px solid var(--warning-color); padding-bottom: 5px;">[ 系统机制 / System Mechanics ]</h2>
            <p><strong style="color: var(--primary-color)">基础控制：</strong> 鼠标或触控拖拽来移动解释器/编译器核心。系统会自动瞄准靠近底部的异常并抛出子弹。</p>
            <p><strong style="color: var(--primary-color)">弹夹与重载 (Ammo)：</strong> 每次抛出异常会消耗缓冲池中的 Ammo。Ammo 耗尽时会触发 Reload 阶段，期间将无法抛出异常，此时最容易被趁虚而入。</p>
            <p><strong style="color: var(--primary-color)">系统负载 (Lives)：</strong> 允许代码块（怪物）逃逸越过屏蔽区（屏幕底部），或直接触碰敌方子弹会导致系统负载增加。当负载到达上限时，引发 OOM 或 Kernel Panic，游戏结束。</p>
            <p><strong style="color: var(--primary-color)">安全沙箱 (Shield)：</strong> 一层可以缓慢自动恢复的临时保护膜，受击时优先消耗。如果伤害超过护盾值，溢出部分仍会增加系统负载。</p>
            <p><strong style="color: var(--primary-color)">火力点 (FP) 与 升级：</strong> 击杀异常代码块掉落 <code>0</code> 或 <code>1</code> 经验碎片。吸取足够经验可升级，每升一级获得 4 FP，并且升级选择界面可以保留未加点数。你可以随时在升级期间消耗 FP 强化指定核心属性，或者获取强力特殊能力。</p>
            <p><strong style="color: var(--primary-color)">事件系统：</strong> 界面右上角会有“下一次事件”倒计时。当倒计时归零时，系统底层将突发恶性代码注入（比如：大体积阻塞墙、密集的高频访问流等）。</p>
        `;
    } else if (tabName === 'upgrades') {
        let html = `<h2 style="color: var(--success-color); border-bottom: 1px solid var(--success-color); padding-bottom: 5px;">[ 优化方案 / Upgrades ]</h2>`;
        const upgs = langConfig[lang].upgrades;
        const coreKeys = ['multiShot', 'fireRate', 'damageUp', 'bulletSpeed', 'pierce'];
        
        // 进阶升级的具体描述映射
        const advDesc = {
            crit: '暴击率变为 100%，额外暴击倍率大幅提升', critDamage: '暴击伤害倍率极大幅度飙升', execute: '秒杀概率升至 50%',
            maxLifeUp: '负载上限大幅提升并瞬间回满', shieldMaxUp: '护盾上限极大增加，并获得等量护盾', dodgeRate: '获得极高的绝对闪避概率 (80%)',
            lifeSteal: '吸血概率及吸血量巨幅增加', slowAura: '全局代码块移动速度极速降低 (减速 75%)', knockback: '异常击中代码块时发生强制极远击退',
            stunChance: '死锁概率极大提升，时长巨幅延长', xpGainUp: '经验获取倍率提升至 500%',
            focusedFire: '多弹道不再散射，变为完全同向的收束激光', ammoCapUp: '弹夹容量极大提升 (+100)', reloadSpeedUp: '换弹时间极度压缩 (-60%)',
            pickupRangeUp: '代码碎片拾取范围变为全屏无限', homing: '数量与总伤翻倍，射速加快，获得1次专属穿透(穿透后减半)',
            aoe: '全域内存湮灭波，范围激增至全屏级别，伤害倍率激增'
        };

        const renderUpgradeCard = (k) => {
            const isAdv = advancedUpgradeTitles[k] !== undefined;
            return `
            <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 4px; border-left: 4px solid var(--primary-color);">
                <strong style="color: var(--jvm-color); font-size: 16px;">${upgs[k].title}</strong><br>
                <span style="font-size: 12px; color: var(--text-color)">${upgs[k].desc}</span>
                ${isAdv ? `
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.2);">
                    <strong style="color: #ffcc00; font-size: 14px;">[进阶突破] ${advancedUpgradeTitles[k]}</strong><br>
                    <span style="font-size: 12px; color: #ffcc00; opacity: 0.9;">${advDesc[k] || '全方位覆盖升级，性能极大突破。'}</span>
                </div>
                ` : ''}
            </div>`;
        };
        
        html += `<h3 style="color: #ff4d4d; margin-top: 10px;">[ 核心火力体系 / Core Firepower ]</h3>`;
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
        for (let k of coreKeys) { if (upgs[k]) html += renderUpgradeCard(k); }
        html += `</div>`;

        html += `<h3 style="color: var(--primary-color); margin-top: 25px;">[ 通用与生存拓展 / General Expansion ]</h3>`;
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">`;
        for (let k in upgs) { if (!coreKeys.includes(k)) html += renderUpgradeCard(k); }
        
        html += `</div>`;
        contentDiv.innerHTML = html;
    } else if (tabName === 'monsters') {
        let html = `<h2 style="color: var(--error-color); border-bottom: 1px solid var(--error-color); padding-bottom: 5px;">[ 异常代码块 / Exceptions ]</h2>`;
        html += `<div style="display: flex; flex-direction: column; gap: 10px;">`;
        
        const monsterDetails = {
            normal: "标准下落：匀速垂直降落，基础测试单元。", tank: "重型装甲：移速缓慢，但血量极高，需要集中火力击破。", fast: "极速突入：移速极快，考验反应速度和输出频率。",
            tracker: "坐标追踪：会不断调整横向位置，试图死死咬住目标坐标。", shooter: "火力压制：在下落过程中周期性向目标投射致命错误弹幕。", dasher: "不可预测：周期性触发高速横向冲刺，极难被持续瞄准。",
            spawner: "异常感染源：移动极慢，但会在原地不断向场上投放基础异常体。", wobbler: "正弦震荡：沿S型波浪轨迹左右摇摆移动，干扰弹道预测。", side_basic: "侧信道入侵：从屏幕两侧水平切入，打破你的常规防线。",
            side_sniper: "侧向狙击：从侧边切入并在移动中向目标发出狙击弹幕。", gc_heal: "守护线程：无害单元。击毁后触发 GC，恢复大量系统负载。", gc_slow: "STW陷阱：无害单元。击毁后强行触发 Stop-The-World 全局减速。"
        };

        monsterDefs.forEach(def => {
            let name = def.type.toUpperCase();
            html += `
            <div style="border-left: 4px solid ${def.color}; padding-left: 10px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
                <div style="margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                    <strong style="color: ${def.color}; font-size: 16px; text-shadow: 0 0 5px ${def.color};">[ ${name} ]</strong> 
                    <div style="display: flex; gap: 10px;">
                        <span style="color: var(--primary-color); font-size: 12px; border: 1px solid var(--primary-color); border-radius: 4px; padding: 4px 8px; cursor: pointer; transition: all 0.2s;" onclick="showPreview('${def.type}')" onmouseover="this.style.background='var(--primary-color)'; this.style.color='#0c0e14';" onmouseout="this.style.background='transparent'; this.style.color='var(--primary-color)';">▶ 行为演示</span>
                        <span style="color: var(--success-color); font-size: 12px; border: 1px solid var(--success-color); border-radius: 4px; padding: 4px 8px; cursor: pointer; transition: all 0.2s;" onclick="showCodeAnalysis('${def.type}')" onmouseover="this.style.background='var(--success-color)'; this.style.color='#0c0e14';" onmouseout="this.style.background='transparent'; this.style.color='var(--success-color)';">▶ 代码解析</span>
                    </div>
                </div>
                <div style="font-size: 13px; color: #ddd; margin-bottom: 5px;">${monsterDetails[def.type] || '特殊异常体'}</div>
                <div style="font-size: 12px; color: #888;">基础耐久: ${def.hp} | 核心经验: ${def.xp}</div>
            </div>`;
        });
        html += `</div>`;
        contentDiv.innerHTML = html;
    } else if (tabName === 'bosses') {
        let html = `<h2 style="color: #ff00ff; border-bottom: 1px solid #ff00ff; padding-bottom: 5px;">[ 致命系统错误 / Fatal Errors ]</h2>`;
        html += `
            <div style="border: 4px dashed #ff00ff; padding: 20px; background: #1a0505; box-shadow: 8px 8px 0px rgba(0,0,0,0.8);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: #fff; margin: 0; font-size: 24px;">OOM-Reaper (第 3 分钟降临)</h3>
                    <div style="display: flex; gap: 10px;">
                        <span style="color: #ff00ff; font-size: 13px; border: 1px solid #ff00ff; border-radius: 4px; padding: 4px 8px; font-weight: bold; background: rgba(255,0,255,0.1); cursor: pointer; transition: all 0.2s;" onclick="showPreview('boss')" onmouseover="this.style.background='#ff00ff'; this.style.color='#fff';" onmouseout="this.style.background='rgba(255,0,255,0.1)'; this.style.color='#ff00ff';">▶ 系统阵列演示</span>
                        <span style="color: var(--success-color); font-size: 13px; border: 1px solid var(--success-color); border-radius: 4px; padding: 4px 8px; font-weight: bold; background: rgba(152,195,121,0.1); cursor: pointer; transition: all 0.2s;" onclick="showCodeAnalysis('boss')" onmouseover="this.style.background='var(--success-color)'; this.style.color='#fff';" onmouseout="this.style.background='rgba(152,195,121,0.1)'; this.style.color='var(--success-color)';">▶ 核心漏洞解析</span>
                    </div>
                </div>
                <p style="color: #ddd;">底层的系统收割者。由核心 (Core)、治疗模块 (Healer)、主炮模块 (Cannon) 和护盾发生器 (Shielder) 组成四方阵列。</p>
                <ul style="color: #ccc; line-height: 1.8;">
                    <li><strong style="color: #ff00ff">绝对防御机制：</strong> 在所有附属外围模块被彻底销毁前，<span style="color:#fff;">核心免疫一切伤害</span>。</li>
                    <li><strong style="color: #00ff00">Healer：</strong> 高频率为整个阵列的其他模块恢复 500 点血量，不尽早击毁会导致 Boss 长久存活。</li>
                    <li><strong style="color: #ff0000">Cannon：</strong> 周期性向周围无死角发射高危致命弹幕。</li>
                    <li><strong style="color: #00ffff">Shielder：</strong> 定期在 Boss 周边生成极高血量的坚硬实体防弹壁垒，阻挡你的火力。</li>
                    <li><strong style="color: #ff4d4d">狂暴二阶段：</strong> 如果你成功敲掉了所有的防卫模块（独剩核心），底层事件系统将进入失控暴走——场外事件触发间隔强制缩短至极短的 <span style="color:#ffcc00; font-weight:bold;">3秒</span>！</li>
                </ul>
            </div>
        `;
        contentDiv.innerHTML = html;
    }
    
    // 更新选中按钮的样式
    document.querySelectorAll('.manual-tab-btn').forEach(btn => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--primary-color)';
    });
    if (btnElement) {
        btnElement.style.backgroundColor = 'var(--primary-color)';
        btnElement.style.color = 'var(--bg-color)';
    }
}

// ================== 独立模拟演示沙盒 (Preview Sandbox) ==================
window.previewAnimId = null;
window.showPreview = function(type) {
    document.getElementById('preview-modal').style.display = 'flex';
    const arena = document.getElementById('preview-arena');
    arena.innerHTML = '';
    let w = arena.clientWidth; let h = arena.clientHeight;
    
    let playerTargetX = w / 2;
    let playerTargetY = h - 20;

    // 让靶子跟随鼠标/触摸位置移动
    arena.addEventListener('pointermove', (e) => {
        const rect = arena.getBoundingClientRect();
        playerTargetX = Math.max(15, Math.min(w - 15, e.clientX - rect.left));
        playerTargetY = Math.max(10, Math.min(h - 10, e.clientY - rect.top));
    });

    // 1. 生成沙盒靶子目标
    let p = document.createElement('div');
    p.style.cssText = 'position:absolute; width:30px; height:20px; background:var(--jvm-color); box-shadow:0 0 10px var(--jvm-color); border-radius:4px; pointer-events:none; transform:translate(-50%, -50%); z-index:20;';
    p.style.left = playerTargetX + 'px';
    p.style.top = playerTargetY + 'px';
    arena.appendChild(p);

    let entities = []; let particles = [];
    
    // 2. Boss 阵列运转模拟
    if (type === 'boss') {
        let isPhase2 = false;
        
        let toggleBtn = document.createElement('button');
        toggleBtn.textContent = '切换至二阶段 (Phase 2)';
        toggleBtn.style.cssText = 'position:absolute; top:10px; right:10px; z-index:100; font-size:10px; padding:4px 8px; background:#1a0505; color:#ff00ff; border:1px solid #ff00ff; cursor:pointer; border-radius:4px;';
        arena.appendChild(toggleBtn);

        let core = document.createElement('div');
        core.style.cssText = 'position:absolute; width:40px; height:40px; border:3px dashed #ff00ff; background:#1a0505; left:50%; top:50%; transform:translate(-50%, -50%); z-index:30; transition:all 0.3s;';
        arena.appendChild(core);
        
        let initPhase1 = () => {
            entities.forEach(en => en.el.remove());
            entities = [];
            for(let i=0; i<9; i++) {
                let sat = document.createElement('div');
                let color = i<3 ? '#00ff00' : (i<6 ? '#ff0000' : '#00ffff');
                sat.style.cssText = `position:absolute; width:20px; height:20px; border:2px solid ${color}; background:#1a0505; z-index:25;`;
                arena.appendChild(sat);
                entities.push({el: sat, angleOffset: i*(Math.PI*2/3) + (i>=6?Math.PI/3:0), radius: i<3?40:80, type: i<3?'healer':(i<6?'cannon':'shielder') });
            }
        };
        initPhase1();

        let staticShields = [];
        let bullets = [];
        let eventWarnings = [];
        let sideSnipers = [];
        let activeBossEvent = null;

        toggleBtn.onclick = () => {
            isPhase2 = !isPhase2;
            if (isPhase2) {
                toggleBtn.textContent = '切换至一阶段 (Phase 1)';
                entities.forEach(en => en.el.remove());
                entities = [];
                staticShields.forEach(s => s.el.remove());
                staticShields = [];
                sideSnipers.forEach(s => s.el.remove());
                sideSnipers = [];
                activeBossEvent = null;
                core.style.borderColor = '#ffcc00';
                core.style.boxShadow = '0 0 15px rgba(255,204,0,0.8)';
            } else {
                toggleBtn.textContent = '切换至二阶段 (Phase 2)';
                core.style.borderColor = '#ff00ff';
                core.style.boxShadow = 'none';
                initPhase1();
                sideSnipers.forEach(s => s.el.remove());
                sideSnipers = [];
                activeBossEvent = null;
            }
        };

        let angle = 0;
        let fireTimer = 60;
        let shieldTimer = 120;
        let eventTimer = 60; // 打开窗口时较快触发第一次事件演示
        let bossEventToggle = false;
        
        function bossLoop() {
            p.style.left = playerTargetX + 'px';
            p.style.top = playerTargetY + 'px';
            angle += 0.02;
            
            entities.forEach(en => {
                let a = angle + en.angleOffset;
                en.x = w/2 + Math.cos(a)*en.radius;
                en.y = h/2 + Math.sin(a)*en.radius;
                en.el.style.left = (en.x - 10) + 'px';
                en.el.style.top = (en.y - 10) + 'px';
            });
            
            if (!isPhase2) {
                fireTimer--;
                if (fireTimer <= 0) {
                    entities.filter(e => e.type === 'cannon').forEach(cannon => {
                        let b = document.createElement('div');
                        b.style.cssText = `position:absolute; width:6px; height:6px; background:#ff0000; border-radius:50%; z-index:20; box-shadow:0 0 5px #ff0000;`;
                        arena.appendChild(b);
                        let a = angle + cannon.angleOffset;
                        let tx = cannon.x + Math.cos(a)*50;
                        let ty = cannon.y + Math.sin(a)*50;
                        let bAngle = Math.atan2(ty - cannon.y, tx - cannon.x);
                        bullets.push({el: b, x: cannon.x, y: cannon.y, vx: Math.cos(bAngle)*3, vy: Math.sin(bAngle)*3});
                    });
                    fireTimer = 90;
                }

                shieldTimer--;
                if (shieldTimer <= 0) {
                    entities.filter(e => e.type === 'shielder').forEach(sh => {
                        let a = angle + sh.angleOffset;
                        let r = sh.radius + 30;
                        let sx = w/2 + Math.cos(a) * r;
                        let sy = h/2 + Math.sin(a) * r;
                        let sb = document.createElement('div');
                        sb.style.cssText = `position:absolute; width:30px; height:20px; border:2px dashed #aaaaaa; background:#1a0505; z-index:15;`;
                        sb.style.left = (sx - 15) + 'px';
                        sb.style.top = (sy - 10) + 'px';
                        arena.appendChild(sb);
                        staticShields.push({el: sb, x: sx, y: sy, life: 180});
                    });
                    shieldTimer = 180;
                }
            }

            eventTimer--;
            let eventLimit = isPhase2 ? 180 : 360; // 精确模拟：二阶段3秒(180帧)，一阶段为方便演示定为6秒(360帧)
            if (eventTimer <= 0) {
                let warnText = bossEventToggle ? 'BOSS：左侧代码注入！' : 'BOSS：右侧代码注入！';
                if (isPhase2) warnText = '【暴走】' + warnText;

                let warn = document.createElement('div');
                warn.textContent = warnText;
                warn.style.cssText = `position:absolute; left:50%; top:40px; transform:translateX(-50%); color:${isPhase2?'#ffcc00':'#ff4d4d'}; font-size:12px; font-weight:bold; z-index:100; text-shadow:0 0 5px currentColor; border:1px solid currentColor; padding:2px 6px; background:rgba(0,0,0,0.8); white-space:nowrap;`;
                arena.appendChild(warn);
                eventWarnings.push({el: warn, life: 60});
                
                activeBossEvent = {
                    isLeft: bossEventToggle,
                    count: 0,
                    maxCount: Math.floor((h - 100) / 60), // 严格对应 events.js 的最大数量计算
                    timer: 0
                };
                
                bossEventToggle = !bossEventToggle;
                eventTimer = eventLimit;
            }
            
            // 异步列队生成狙击怪 (完美还原 setInterval 每 500ms 生成机制)
            if (activeBossEvent) {
                if (activeBossEvent.timer <= 0) {
                    let sideX = activeBossEvent.isLeft ? -20 : w + 20;
                    let dirX = activeBossEvent.isLeft ? 1 : -1;
                    let sy = 50 + activeBossEvent.count * 60; // 对应 events.js 的 50 + count * 60
                    
                    let sMob = document.createElement('div');
                    sMob.style.cssText = `position:absolute; width:24px; height:16px; border:2px solid #ff4d4d; background:#21252b; z-index:10; display:flex; justify-content:center; align-items:center; color:#ff4d4d; font-size:8px; font-weight:bold;`;
                    sMob.style.left = sideX + 'px';
                    sMob.style.top = sy + 'px';
                    sMob.textContent = 'SNP';
                    arena.appendChild(sMob);
                    sideSnipers.push({el: sMob, x: sideX, y: sy, vx: dirX * 1.5, timer: 30});
                    
                    activeBossEvent.count++;
                    if (activeBossEvent.count >= activeBossEvent.maxCount) {
                        activeBossEvent = null;
                    } else {
                        activeBossEvent.timer = 30; // 30帧 = 500ms
                    }
                } else {
                    activeBossEvent.timer--;
                }
            }

            for(let i=bullets.length-1; i>=0; i--) {
                let b = bullets[i];
                b.x += b.vx; b.y += b.vy;
                b.el.style.left = b.x + 'px'; b.el.style.top = b.y + 'px';
                if(b.x < -10 || b.x > w+10 || b.y < -10 || b.y > h+10) {
                    b.el.remove();
                    bullets.splice(i, 1);
                }
            }

            for(let i=staticShields.length-1; i>=0; i--) {
                let s = staticShields[i];
                s.life--;
                if(s.life <= 0) {
                    s.el.remove();
                    staticShields.splice(i, 1);
                }
            }

            for(let i=eventWarnings.length-1; i>=0; i--) {
                let ew = eventWarnings[i];
                ew.life--;
                ew.el.style.opacity = ew.life / 60;
                ew.el.style.top = (40 - (60 - ew.life)*0.5) + 'px'; 
                if(ew.life <= 0) {
                    ew.el.remove();
                    eventWarnings.splice(i, 1);
                }
            }
            
            for(let i=sideSnipers.length-1; i>=0; i--) {
                let sn = sideSnipers[i];
                sn.x += sn.vx;
                sn.el.style.left = sn.x + 'px';
                
                sn.timer--;
                if (sn.timer <= 0) {
                    let b = document.createElement('div');
                    b.style.cssText = `position:absolute; width:6px; height:6px; background:#e5c07b; border-radius:50%; z-index:20; box-shadow:0 0 5px #e5c07b;`;
                    arena.appendChild(b);
                    let a = Math.atan2(playerTargetY - (sn.y + 8), playerTargetX - (sn.x + 12));
                    bullets.push({el: b, x: sn.x + 12, y: sn.y + 8, vx: Math.cos(a)*3, vy: Math.sin(a)*3});
                    sn.timer = 60;
                }

                if(sn.x < -40 || sn.x > w + 40) {
                    sn.el.remove();
                    sideSnipers.splice(i, 1);
                }
            }
            
            previewAnimId = requestAnimationFrame(bossLoop);
        }
        previewAnimId = requestAnimationFrame(bossLoop);
        return;
    }

    // 3. 怪物行为模拟
    let def = monsterDefs.find(d => d.type === type);
    let color = def ? def.color : '#fff';
    let mob = document.createElement('div');
    mob.style.cssText = `position:absolute; width:40px; height:30px; border:2px solid ${color}; background:#21252b; border-radius:4px; display:flex; justify-content:center; align-items:center; color:${color}; font-size:10px; font-weight:bold; z-index:10;`;
    mob.textContent = type.substring(0,4).toUpperCase();
    arena.appendChild(mob);

    let isSide = type.startsWith('side');
    let mx = isSide ? -40 : w/2 - 20; let my = isSide ? h/2 - 25 : -30;
    let startX = mx; let timer = 0; let speedX = 0;
    let vx = isSide ? 2 : 0;
    // 下调 spawner 在演示框里的移动速度，让掉落的小怪能“落”下来
    let vy = isSide ? 0 : (type === 'fast' ? 2.5 : (type === 'tank' ? 0.5 : (type === 'spawner' ? 0.3 : 1)));

    function mobLoop() {
        p.style.left = playerTargetX + 'px';
        p.style.top = playerTargetY + 'px';
        
        mx += vx; my += vy;
        if (type === 'tracker') {
            if (mx + 20 < playerTargetX) mx += 1.5; if (mx + 20 > playerTargetX) mx -= 1.5;
        } else if (type === 'dasher') {
            if (--timer <= 0) { speedX = (Math.random()>0.5?1:-1)*15; timer = 80; }
            mx += speedX; speedX *= 0.85; if(mx < 0) mx = 0; if(mx > w-40) mx = w-40;
        } else if (type === 'wobbler') {
            mx = startX + Math.sin(my * 0.05) * 60;
        } else if (type === 'shooter' || type === 'side_sniper') {
            if (--timer <= 0) {
                let b = document.createElement('div');
                b.style.cssText = `position:absolute; width:8px; height:8px; background:#e5c07b; border-radius:50%; z-index:5;`;
                arena.appendChild(b);
                let angle = Math.atan2(playerTargetY - (my + 15), playerTargetX - (mx + 20));
                particles.push({el:b, x:mx+16, y:my+15, vx:Math.cos(angle)*3, vy:Math.sin(angle)*3});
                timer = 60;
            }
        } else if (type === 'spawner') {
            if (--timer <= 0) {
                let b = document.createElement('div');
                b.style.cssText = `position:absolute; width:20px; height:15px; border:1px solid #d19a66; background:#21252b; z-index:5;`;
                arena.appendChild(b);
                particles.push({el:b, x:mx+10, y:my+30, vx:0, vy:1});
                timer = 80;
            }
        }
        // 重置位置，循环动画
        if (isSide) { if (mx > w + 40) mx = -40; } else { if (my > h + 30) { my = -30; startX = w/2-20; mx = startX; } }
        mob.style.left = mx + 'px'; mob.style.top = my + 'px';
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i]; p.x += p.vx; p.y += p.vy; p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px';
            if(p.y > h || p.x < 0 || p.x > w) { p.el.remove(); particles.splice(i,1); }
        }
        previewAnimId = requestAnimationFrame(mobLoop);
    }
    previewAnimId = requestAnimationFrame(mobLoop);
}

window.closePreview = function() {
    document.getElementById('preview-modal').style.display = 'none';
    if (previewAnimId) { cancelAnimationFrame(previewAnimId); previewAnimId = null; }
}

window.showCodeAnalysis = function(type) {
    document.getElementById('code-analysis-modal').style.display = 'flex';
    const content = document.getElementById('code-analysis-content');
    content.innerHTML = '';
    
    const langs = ['java', 'python', 'cpp'];
    const langNames = { java: 'Java (JVM)', python: 'Python (Interpreter)', cpp: 'C/C++ (Compiler)' };
    
    let html = `<h3 style="color: #fff; border-bottom: 1px solid #fff; padding-bottom: 10px; margin-top: 0;">实体标识: ${type.toUpperCase()}</h3>`;
    
    langs.forEach(lang => {
        let entriesToRender = [];
        if (type === 'boss') {
            let bText = bossTexts[lang];
            if (bText) {
                entriesToRender = [
                    { label: '[ Core / 核心模块 ]', ...bText.core },
                    { label: '[ Healer / 恢复模块 ]', ...bText.healer },
                    { label: '[ Cannon / 炮台模块 ]', ...bText.cannon },
                    { label: '[ Shielder / 护盾发生器 ]', ...bText.shielder },
                    { label: '[ Shield Wall / 实体壁垒 ]', ...bText.shield_wall }
                ];
            }
        } else {
            let def = monsterDefs.find(d => d.type === type);
            if (!def) return;
            if (def.isBase) {
                let pool = def.isSide ? monsterTexts[lang].side : monsterTexts[lang].base;
                entriesToRender = pool.map((item, idx) => ({ label: `[ 变体 Variant ${idx + 1} ]`, ...item }));
            } else {
                entriesToRender = [ { label: null, ...monsterTexts[lang][type] } ];
            }
        }
        
        if (entriesToRender.length > 0) {
            html += `
            <div style="background: rgba(255,255,255,0.05); border-left: 4px solid var(--success-color); padding: 15px; border-radius: 4px;">
                <h4 style="color: var(--primary-color); margin-top: 0; margin-bottom: 10px;">► ${langNames[lang]}</h4>`;
                
            entriesToRender.forEach((entry, idx) => {
                if (entry.label) {
                    html += `<div style="color: #ffcc00; font-size: 13px; font-weight: bold; margin-bottom: 5px; margin-top: ${idx === 0 ? '0' : '20px'};">${entry.label}</div>`;
                }
                html += `
                <div style="background: #181a1f; padding: 10px; font-family: monospace; font-size: 12px; color: #d19a66; border-radius: 4px; white-space: pre-wrap; margin-bottom: 10px;">${entry.code}</div>
                <div style="background: rgba(224, 108, 117, 0.1); padding: 10px; font-family: monospace; font-size: 12px; color: #e06c75; border-radius: 4px; white-space: pre-wrap; margin-bottom: 10px; border: 1px solid rgba(224, 108, 117, 0.3);">[Error Output]\n${entry.err}</div>
                <div style="color: #abb2bf; font-size: 13px; line-height: 1.5; background: rgba(152, 195, 121, 0.1); padding: 10px; border-radius: 4px; border: 1px dashed var(--success-color);">
                    <strong style="color: var(--success-color);">[漏洞解析]</strong><br>${entry.exp || '系统底层出现致命异常，无法解析具体原因。'}
                </div>`;
            });
            
            html += `</div>`;
        }
    });
    
    content.innerHTML = html;
};

window.closeCodeAnalysis = function() {
    document.getElementById('code-analysis-modal').style.display = 'none';
};

window.addEventListener('DOMContentLoaded', initManual);
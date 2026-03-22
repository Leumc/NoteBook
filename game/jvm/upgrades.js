const advancedUpgradeTitles = {
    crit: '绝对真理',
    critDamage: '维度打击',
    execute: 'SIGKILL (秒杀)',
    maxLifeUp: '分布式冗余',
    shieldMaxUp: '绝对沙箱',
    dodgeRate: '薛定谔的代码',
    lifeSteal: '内存吸血鬼',
    slowAura: '绝对零度',
    knockback: '引力斥力',
    stunChance: '无限死锁',
    bulletSize: '黑洞对象',
    xpGainUp: '全知全能',
    focusedFire: '同调射线',
    ammoCapUp: '海量吞吐',
    reloadSpeedUp: '光速重载',
    pickupRangeUp: '全域内存统御'
};

function getUpgradePool(playerStats, healCallback) {
    // 动态获取当前选中语言的配置项
    const opts = langConfig[currentLang].upgrades;
    if (!playerStats.upgrades) playerStats.upgrades = {};
    if (!playerStats.advanced) playerStats.advanced = {};

    const track = (id) => { playerStats.upgrades[id] = (playerStats.upgrades[id] || 0) + 1; };
    const trackAdv = (id) => { playerStats.advanced[id] = true; delete playerStats.upgrades[id]; };
    
    const basePool = [
        // ============ 1. 核心火力体系 ============

        // ============ 2. 暴击爆发体系 ============
        { id: 'crit', cap: 5, title: opts.crit.title, desc: opts.crit.desc, apply: () => { playerStats.critRate += 0.15; track('crit'); } },
        { id: 'critDamage', cap: 5, title: opts.critDamage.title, desc: opts.critDamage.desc, apply: () => { playerStats.critDamageMult += 1.0; track('critDamage'); } },
        { id: 'execute', cap: 3, title: opts.execute.title, desc: opts.execute.desc, apply: () => { playerStats.executeChance += 0.05; track('execute'); } },

        { id: 'maxLifeUp', cap: 5, title: opts.maxLifeUp.title, desc: opts.maxLifeUp.desc, apply: () => { playerStats.maxLives += 20; healCallback(playerStats.maxLives); track('maxLifeUp'); } },
        { id: 'shieldMaxUp', cap: 5, title: opts.shieldMaxUp.title, desc: opts.shieldMaxUp.desc, apply: () => { playerStats.maxShield += 10; playerStats.shield += 10; if (typeof updateShieldDisplay === 'function') updateShieldDisplay(); track('shieldMaxUp'); } },
        { id: 'dodgeRate', cap: 5, title: opts.dodgeRate.title, desc: opts.dodgeRate.desc, apply: () => { playerStats.dodgeRate += 0.10; track('dodgeRate'); } },
        { id: 'lifeSteal', cap: 5, title: opts.lifeSteal.title, desc: opts.lifeSteal.desc, apply: () => { playerStats.lifeStealRate += 0.05; track('lifeSteal'); } },

        // ============ 4. 控制减速体系 ============
        { id: 'slowAura', cap: 5, title: opts.slowAura.title, desc: opts.slowAura.desc, apply: () => { playerStats.globalSlow += 0.05; track('slowAura'); } },
        { id: 'knockback', cap: 5, title: opts.knockback.title, desc: opts.knockback.desc, apply: () => { playerStats.knockbackDist += 10; track('knockback'); } },
        { id: 'stunChance', cap: 5, title: opts.stunChance.title, desc: opts.stunChance.desc, apply: () => { playerStats.stunChance += 0.10; track('stunChance'); } },

        // ============ 5. 范围与效能体系 ============
        { id: 'bulletSize', cap: 3, title: opts.bulletSize.title, desc: opts.bulletSize.desc, apply: () => { playerStats.bulletSizeMult += 0.5; track('bulletSize'); } },
        { id: 'xpGainUp', cap: 5, title: opts.xpGainUp.title, desc: opts.xpGainUp.desc, apply: () => { playerStats.xpMult += 0.2; track('xpGainUp'); } },
        { id: 'focusedFire', cap: 4, title: opts.focusedFire.title, desc: opts.focusedFire.desc, apply: () => { playerStats.spreadAngle = Math.max(5, playerStats.spreadAngle * 0.8); track('focusedFire'); } },
        
        // ============ 6. 弹夹管理体系 ============
        { id: 'ammoCapUp', cap: 5, title: opts.ammoCapUp.title, desc: opts.ammoCapUp.desc, apply: () => { playerStats.maxAmmo += 10; if(typeof updateAmmoDisplay==='function') updateAmmoDisplay(); track('ammoCapUp'); } },
        { id: 'reloadSpeedUp', cap: 5, title: opts.reloadSpeedUp.title, desc: opts.reloadSpeedUp.desc, apply: () => { playerStats.reloadSpeedModifier *= 0.85; track('reloadSpeedUp'); } },
        { id: 'pickupRangeUp', cap: 5, title: opts.pickupRangeUp.title, desc: opts.pickupRangeUp.desc, apply: () => { playerStats.pickupRange += 50; track('pickupRangeUp'); } }
    ];

    const advDefs = {
        crit: { title: advancedUpgradeTitles.crit, desc: '暴击率变为 100%，额外暴击倍率 +2.0x', apply: () => { playerStats.critRate -= 0.15 * 5; playerStats.critRate = 1.0; playerStats.critDamageMult += 2.0; trackAdv('crit'); } },
        critDamage: { title: advancedUpgradeTitles.critDamage, desc: '暴击伤害倍率极大幅度提升 (+15.0x)', apply: () => { playerStats.critDamageMult -= 1.0 * 5; playerStats.critDamageMult += 15.0; trackAdv('critDamage'); } },
        execute: { title: advancedUpgradeTitles.execute, desc: '秒杀概率升至 50%', apply: () => { playerStats.executeChance -= 0.05 * 3; playerStats.executeChance += 0.50; trackAdv('execute'); } },
        maxLifeUp: { title: advancedUpgradeTitles.maxLifeUp, desc: '负载上限提升 400 点并瞬间回满', apply: () => { playerStats.maxLives -= 20 * 5; playerStats.maxLives += 400; healCallback(playerStats.maxLives); trackAdv('maxLifeUp'); } },
        shieldMaxUp: { title: advancedUpgradeTitles.shieldMaxUp, desc: '护盾上限增加 300，并获得等量护盾', apply: () => { playerStats.maxShield -= 10 * 5; playerStats.maxShield += 300; playerStats.shield += 300; if (typeof updateShieldDisplay === 'function') updateShieldDisplay(); trackAdv('shieldMaxUp'); } },
        dodgeRate: { title: advancedUpgradeTitles.dodgeRate, desc: '获得 80% 的绝对闪避概率', apply: () => { playerStats.dodgeRate -= 0.10 * 5; playerStats.dodgeRate += 0.80; trackAdv('dodgeRate'); } },
        lifeSteal: { title: advancedUpgradeTitles.lifeSteal, desc: '吸血概率变为 50%，吸血量大幅增至 5', apply: () => { playerStats.lifeStealRate -= 0.05 * 5; playerStats.lifeStealRate += 0.50; playerStats.lifeStealAmount = 5; trackAdv('lifeSteal'); } },
        slowAura: { title: advancedUpgradeTitles.slowAura, desc: '全局代码块移动速度极速降低 75%', apply: () => { playerStats.globalSlow -= 0.05 * 5; playerStats.globalSlow += 0.75; trackAdv('slowAura'); } },
        knockback: { title: advancedUpgradeTitles.knockback, desc: '异常击中代码块时击退距离变为 150', apply: () => { playerStats.knockbackDist -= 10 * 5; playerStats.knockbackDist += 150; trackAdv('knockback'); } },
        stunChance: { title: advancedUpgradeTitles.stunChance, desc: '死锁概率提升至 80%，时长延长至 3 秒', apply: () => { playerStats.stunChance -= 0.10 * 5; playerStats.stunChance += 0.80; playerStats.stunDuration = 180; trackAdv('stunChance'); } },
        bulletSize: { title: advancedUpgradeTitles.bulletSize, desc: '抛出的异常体积超级巨大化，且伤害 +10', apply: () => { playerStats.bulletSizeMult -= 0.5 * 3; playerStats.bulletSizeMult += 4.0; playerStats.damage += 10; trackAdv('bulletSize'); } },
        xpGainUp: { title: advancedUpgradeTitles.xpGainUp, desc: '经验获取倍率变为 500%', apply: () => { playerStats.xpMult -= 0.2 * 5; playerStats.xpMult += 4.0; trackAdv('xpGainUp'); } },
        focusedFire: { title: advancedUpgradeTitles.focusedFire, desc: '多弹道不再散射，变为完全同向的收束攻击', apply: () => { playerStats.spreadAngle = 0; trackAdv('focusedFire'); } },
        ammoCapUp: { title: advancedUpgradeTitles.ammoCapUp, desc: '弹夹容量极大提升 (+100)', apply: () => { playerStats.maxAmmo -= 10 * 5; playerStats.maxAmmo += 100; if(typeof updateAmmoDisplay==='function') updateAmmoDisplay(); trackAdv('ammoCapUp'); } },
        reloadSpeedUp: { title: advancedUpgradeTitles.reloadSpeedUp, desc: '换弹时间极度压缩 (-60%)', apply: () => { playerStats.reloadSpeedModifier /= Math.pow(0.85, 5); playerStats.reloadSpeedModifier *= 0.4; trackAdv('reloadSpeedUp'); } },
        pickupRangeUp: { title: advancedUpgradeTitles.pickupRangeUp, desc: '代码碎片拾取范围变为无限', apply: () => { playerStats.pickupRange = 9999; trackAdv('pickupRangeUp'); } }
    };

    let finalPool = [];
    for (let opt of basePool) {
        if (playerStats.advanced[opt.id]) continue; // 屏蔽已获得进阶的升级

        const count = playerStats.upgrades[opt.id] || 0;
        if (opt.cap) {
            if (count < opt.cap) {
                finalPool.push(opt);
            } else if (!playerStats.advanced[opt.id]) {
                if (Math.random() < 0.3) {
                    let adv = advDefs[opt.id];
                    adv.id = opt.id;
                    adv.isAdvanced = true;
                    finalPool.push(adv);
                }
            }
        } else {
            finalPool.push(opt);
        }
    }
    return finalPool;
}

function renderUpgrades(containerElement, options, onSelectCallback) {
    containerElement.innerHTML = '';
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
            opt.apply();
            onSelectCallback(); 
        };
        containerElement.appendChild(card);
    });
}
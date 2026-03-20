function getUpgradePool(playerStats, healCallback) {
    return [
        { id: 'multi_shot', title: '多线程并发', desc: '增加一次发射的异常数量 (+1 弹道)', apply: () => playerStats.multiShot += 1 },
        { id: 'fire_rate', title: 'JIT 编译加速', desc: '异常抛出频率提高 20%', apply: () => playerStats.fireRateModifier *= 0.8 },
        { id: 'damage_up', title: '致命异常', desc: '每个 NPE 造成的破坏力 +2', apply: () => playerStats.damage += 2 },
        { id: 'heal', title: 'GC 回收', desc: '恢复 15 点系统负载', apply: () => healCallback(15) },
        { id: 'bullet_speed', title: '低延迟 GC', desc: '异常抛出速度提升 30%', apply: () => playerStats.bulletSpeed *= 1.3 },
        // 【新增 1：穿透属性】
        { id: 'pierce', title: '深层引用穿透', desc: '抛出的异常可额外穿透 1 个代码块', apply: () => playerStats.pierce += 1 },
        // 【新增 2：暴击属性】
        { id: 'crit', title: '反射暴击', desc: '15% 概率触发，造成 3 倍真实伤害', apply: () => playerStats.critRate += 0.15 }
    ];
}

function renderUpgrades(containerElement, options, onSelectCallback) {
    containerElement.innerHTML = '';
    options.forEach(opt => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `<div class="upgrade-title">${opt.title}</div><div class="upgrade-desc">${opt.desc}</div>`;
        card.onclick = () => {
            opt.apply();
            onSelectCallback(); 
        };
        containerElement.appendChild(card);
    });
}
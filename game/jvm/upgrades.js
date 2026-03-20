function getUpgradePool(playerStats, healCallback) {
    return [
        { id: 'multi_shot', title: '多线程并发', desc: '增加一次发射的异常数量 (+1 弹道)', apply: () => playerStats.multiShot += 1 },
        { id: 'fire_rate', title: 'JIT 编译加速', desc: '异常抛出频率提高 20%', apply: () => playerStats.fireRateModifier *= 0.8 },
        { id: 'damage_up', title: '致命异常', desc: '每个 NPE 造成的破坏力 +2', apply: () => playerStats.damage += 2 },
        { id: 'heal', title: '堆内存扩容', desc: '恢复 10 点系统负载', apply: () => healCallback(10) },
        { id: 'bullet_speed', title: '低延迟 GC', desc: '异常抛出速度提升 30%', apply: () => playerStats.bulletSpeed *= 1.3 }
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
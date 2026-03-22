// ================= Cheat Menu 秘籍监控 =================
let konamiCode = "leumcdevopen";
let konamiIndex = 0;
let debugCode = "debugon";
let debugIndex = 0;
window.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            openCheatMenu();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
        if (e.key === konamiCode[0]) konamiIndex = 1;
    }

    if (e.key === debugCode[debugIndex]) {
        debugIndex++;
        if (debugIndex === debugCode.length) {
            playerStats.maxLives = 99999999;
            lives = playerStats.maxLives;
            if (typeof updateLivesDisplay === 'function') updateLivesDisplay();
            if (typeof createPopupInfo === 'function') createPopupInfo(playerX, playerY, 'DEBUG MODE ON', 'buff-explosion');
            debugIndex = 0;
        }
    } else {
        debugIndex = 0;
        if (e.key === debugCode[0]) debugIndex = 1;
    }
});

function openCheatMenu() {
    document.getElementById('cheat-menu').style.display = 'flex';
    container.classList.remove('hide-cursor');
    showCheatPage('cheat-main-menu');
}

function closeCheatMenu() {
    document.getElementById('cheat-menu').style.display = 'none';
    if (typeof gameState !== 'undefined' && gameState === 'PLAYING') {
        container.classList.add('hide-cursor');
    }
}

function showCheatPage(id) {
    document.querySelectorAll('.cheat-page').forEach(el => el.style.display = 'none');
    document.getElementById(id).style.display = 'flex';
    
    if (id === 'cheat-stat-menu') {
        document.getElementById('cs-level').value = playerStats.level;
        document.getElementById('cs-damage').value = playerStats.damage;
        document.getElementById('cs-maxlives').value = playerStats.maxLives;
        document.getElementById('cs-maxshield').value = playerStats.maxShield;
        document.getElementById('cs-crit').value = playerStats.critRate;
        document.getElementById('cs-spd').value = playerStats.bulletSpeed;
        document.getElementById('cs-multishot').value = playerStats.multiShot;
        document.getElementById('cs-firerate').value = playerStats.fireRateModifier;
        document.getElementById('cs-pierce').value = playerStats.pierce;
        document.getElementById('cs-fp').value = playerStats.firepowerPoints || 0;
        document.getElementById('cs-ammo').value = playerStats.maxAmmo;
    } else if (id === 'cheat-upg-menu') {
        initCheatUpgrades();
    } else if (id === 'cheat-mob-menu') {
        initCheatMobs();
    } else if (id === 'cheat-event-menu') {
        initCheatEvents();
    }
}

function applyCheatStats() {
    playerStats.level = parseInt(document.getElementById('cs-level').value) || 1;
    levelDisplay.textContent = playerStats.level;
    playerStats.damage = parseInt(document.getElementById('cs-damage').value) || 1;
    playerStats.maxLives = parseInt(document.getElementById('cs-maxlives').value) || 200;
    playerStats.maxShield = parseInt(document.getElementById('cs-maxshield').value) || 0;
    playerStats.critRate = parseFloat(document.getElementById('cs-crit').value) || 0;
    playerStats.bulletSpeed = parseInt(document.getElementById('cs-spd').value) || 8;
    playerStats.multiShot = parseInt(document.getElementById('cs-multishot').value) || 1;
    playerStats.fireRateModifier = parseFloat(document.getElementById('cs-firerate').value) || 1.0;
    playerStats.pierce = parseInt(document.getElementById('cs-pierce').value) || 0;
    playerStats.firepowerPoints = parseInt(document.getElementById('cs-fp').value) || 0;
    playerStats.maxAmmo = parseInt(document.getElementById('cs-ammo').value) || 30;
    lives = playerStats.maxLives;
    playerStats.shield = playerStats.maxShield;
    updateLivesDisplay();
    updateShieldDisplay();
    closeCheatMenu();
}

function spawnDevMob(index) {
    let def = typeof monsterDefs !== 'undefined' ? monsterDefs[index] : null;
    if (!def) return;
    let mob = new CodeBlock(container, playerStats.level, def);
    if (!def.isSide) {
        mob.x = Math.random() * (window.innerWidth - mob.width);
        mob.y = 100;
        mob.element.style.transform = `translate3d(${mob.x}px, ${mob.y}px, 0)`;
    }
    codeBlocks.push(mob);
}

function initCheatMobs() {
    const grid = document.querySelector('#cheat-mob-menu .cheat-grid');
    grid.innerHTML = '';
    if (typeof monsterDefs !== 'undefined') {
        monsterDefs.forEach((def, index) => {
            let b = document.createElement('button');
            b.className = 'action-btn';
            b.textContent = def.type;
            b.onclick = () => spawnDevMob(index);
            grid.appendChild(b);
        });
    }
}

function initCheatEvents() {
    const grid = document.querySelector('#cheat-event-menu .cheat-grid');
    grid.innerHTML = '';
    if (typeof gameEventsList !== 'undefined') {
        gameEventsList.forEach(ev => {
            let b = document.createElement('button');
            b.className = 'action-btn';
            b.textContent = `Event ${ev.id} (${ev.name})`;
            b.onclick = () => { ev.fn(); closeCheatMenu(); };
            grid.appendChild(b);
        });
    }
}

function initCheatUpgrades() {
    const grid = document.getElementById('cheat-upg-grid');
    grid.innerHTML = '';
    Object.keys(langConfig.java.upgrades).forEach(k => {
        let b = document.createElement('button');
        b.className = 'action-btn';
        b.style.fontSize = '12px'; b.style.padding = '8px';
        b.textContent = langConfig[currentLang].upgrades[k].title;
        b.onclick = () => cheatGrantUpgrade(k);
        grid.appendChild(b);
    });

    const advKeys = Object.keys(advancedUpgradeTitles);
    advKeys.forEach(k => {
        let b = document.createElement('button');
        b.className = 'action-btn';
        b.style.fontSize = '12px'; b.style.padding = '8px'; b.style.borderColor = '#ffcc00'; b.style.color = '#ffcc00';
        b.textContent = advancedUpgradeTitles[k];
        b.onclick = () => cheatGrantAdvUpgrade(k);
        grid.appendChild(b);
    });
}

function cheatGrantUpgrade(id) {
    playerStats.upgrades[id] = (playerStats.upgrades[id] || 0) + 1;
    switch(id) {
        case 'multiShot': playerStats.multiShot += 1; break;
        case 'fireRate': playerStats.fireRateModifier *= 0.8; break;
        case 'damageUp': playerStats.damage += 5; break;
        case 'bulletSpeed': playerStats.bulletSpeed *= 1.3; break;
        case 'pierce': playerStats.pierce += 1; break;
        case 'crit': playerStats.critRate += 0.15; break;
        case 'critDamage': playerStats.critDamageMult += 1.0; break;
        case 'execute': playerStats.executeChance += 0.05; break;
        case 'homing': playerStats.homingCount = (playerStats.homingCount||0) + 1; break;
        case 'aoe': playerStats.aoeRadius = playerStats.aoeRadius ? playerStats.aoeRadius + 40 : 120; break;
        case 'heal': healPlayer(15); break;
        case 'maxLifeUp': playerStats.maxLives += 20; healPlayer(playerStats.maxLives); break;
        case 'shieldMaxUp': playerStats.maxShield += 10; playerStats.shield += 10; updateShieldDisplay(); break;
        case 'dodgeRate': playerStats.dodgeRate += 0.1; break;
        case 'lifeSteal': playerStats.lifeStealRate += 0.05; break;
        case 'slowAura': playerStats.globalSlow += 0.05; break;
        case 'knockback': playerStats.knockbackDist += 10; break;
        case 'stunChance': playerStats.stunChance += 0.1; break;
        case 'bulletSize': playerStats.bulletSizeMult += 0.5; break;
        case 'xpGainUp': playerStats.xpMult += 0.2; break;
        case 'focusedFire': playerStats.spreadAngle = Math.max(5, playerStats.spreadAngle * 0.8); break;
        case 'ammoCapUp': playerStats.maxAmmo += 10; updateAmmoDisplay(); break;
        case 'reloadSpeedUp': playerStats.reloadSpeedModifier *= 0.85; break;
        case 'pickupRangeUp': playerStats.pickupRange += 50; break;
    }
    createPopupInfo(playerX, playerY, '+ Upgrade Acquired', 'buff-explosion');
}

function cheatGrantAdvUpgrade(id) {
    if (!playerStats.advanced) playerStats.advanced = {};
    playerStats.advanced[id] = true;
    delete playerStats.upgrades[id]; // 获得进阶后清除基础层数记录

    switch(id) {
        case 'crit': playerStats.critRate = 1.0; playerStats.critDamageMult += 2.0; break;
        case 'critDamage': playerStats.critDamageMult += 15.0; break;
        case 'execute': playerStats.executeChance = 0.50; break;
        case 'homing': playerStats.homingCount *= 2; playerStats.homingPierce = 3; break;
        case 'aoe': playerStats.aoeRadius = 1500; playerStats.aoeDamageMult *= 2; break;
        case 'maxLifeUp': playerStats.maxLives += 400; healPlayer(playerStats.maxLives); break;
        case 'shieldMaxUp': playerStats.maxShield += 300; playerStats.shield += 300; updateShieldDisplay(); break;
        case 'dodgeRate': playerStats.dodgeRate = 0.80; break;
        case 'lifeSteal': playerStats.lifeStealRate = 0.50; playerStats.lifeStealAmount = 5; break;
        case 'slowAura': playerStats.globalSlow += 0.75; break;
        case 'knockback': playerStats.knockbackDist += 150; break;
        case 'stunChance': playerStats.stunChance = 0.80; playerStats.stunDuration = 180; break;
        case 'bulletSize': playerStats.bulletSizeMult += 4.0; playerStats.damage += 10; break;
        case 'xpGainUp': playerStats.xpMult += 4.0; break;
        case 'focusedFire': playerStats.spreadAngle = 0; break;
        case 'ammoCapUp': playerStats.maxAmmo += 100; updateAmmoDisplay(); break;
        case 'reloadSpeedUp': playerStats.reloadSpeedModifier *= 0.4; break;
        case 'pickupRangeUp': playerStats.pickupRange = 9999; break;
    }
    createPopupInfo(playerX, playerY, '+ Adv Upgrade Acquired', 'buff-explosion');
}
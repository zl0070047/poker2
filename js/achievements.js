// 成就系统
class Achievements {
    constructor() {
        this.achievements = {
            firstWin: {
                id: 'firstWin',
                title: '初次胜利',
                description: '赢得第一场游戏',
                icon: '🏆',
                unlocked: false
            },
            bigWinner: {
                id: 'bigWinner',
                title: '大赢家',
                description: '单局获得超过1000筹码',
                icon: '💰',
                unlocked: false
            },
            pokerFace: {
                id: 'pokerFace',
                title: '扑克脸',
                description: '成功完成一次诈唬',
                icon: '😐',
                unlocked: false
            },
            royalFlush: {
                id: 'royalFlush',
                title: '皇家同花顺',
                description: '获得一次皇家同花顺',
                icon: '👑',
                unlocked: false
            },
            marathon: {
                id: 'marathon',
                title: '马拉松选手',
                description: '连续玩满10局游戏',
                icon: '🏃',
                unlocked: false
            }
        };

        this.playerAchievements = this.loadAchievements();
        this.initializeUI();
    }

    // 加载玩家成就
    loadAchievements() {
        const saved = localStorage.getItem('pokerAchievements');
        return saved ? JSON.parse(saved) : {};
    }

    // 保存玩家成就
    saveAchievements() {
        localStorage.setItem('pokerAchievements', JSON.stringify(this.playerAchievements));
    }

    // 解锁成就
    unlock(achievementId, playerName) {
        if (!this.playerAchievements[playerName]) {
            this.playerAchievements[playerName] = [];
        }

        if (!this.playerAchievements[playerName].includes(achievementId)) {
            this.playerAchievements[playerName].push(achievementId);
            this.saveAchievements();
            this.showUnlockNotification(achievementId);
            this.updateUI();
        }
    }

    // 显示成就解锁通知
    showUnlockNotification(achievementId) {
        const achievement = this.achievements[achievementId];
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-title">解锁成就：${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 100);
    }

    // 初始化成就UI
    initializeUI() {
        const achievementsContainer = document.createElement('div');
        achievementsContainer.id = 'achievements-container';
        achievementsContainer.className = 'achievements-container';

        const header = document.createElement('h2');
        header.textContent = '成就';
        header.className = 'achievements-header';

        const achievementsList = document.createElement('div');
        achievementsList.id = 'achievements-list';
        achievementsList.className = 'achievements-list';

        achievementsContainer.appendChild(header);
        achievementsContainer.appendChild(achievementsList);

        document.body.appendChild(achievementsContainer);

        this.updateUI();
    }

    // 更新成就显示
    updateUI() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;

        achievementsList.innerHTML = '';

        Object.values(this.achievements).forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}`;

            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            `;

            achievementsList.appendChild(achievementElement);
        });
    }

    // 检查游戏状态并更新成就
    checkAchievements(gameState, playerName) {
        if (gameState.isWinner) {
            this.unlock('firstWin', playerName);
        }

        if (gameState.currentPot > 1000) {
            this.unlock('bigWinner', playerName);
        }

        if (gameState.consecutiveGames >= 10) {
            this.unlock('marathon', playerName);
        }

        if (gameState.handRank === 'Royal Flush') {
            this.unlock('royalFlush', playerName);
        }

        if (gameState.successfulBluff) {
            this.unlock('pokerFace', playerName);
        }
    }
}

// 导出成就系统
export const achievements = new Achievements(); 
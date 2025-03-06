// 排行榜系统
class Leaderboard {
    constructor() {
        this.leaderboardData = this.loadLeaderboardData();
        this.initializeUI();
    }

    // 加载排行榜数据
    loadLeaderboardData() {
        const data = localStorage.getItem('pokerLeaderboard');
        return data ? JSON.parse(data) : [];
    }

    // 保存排行榜数据
    saveLeaderboardData() {
        localStorage.setItem('pokerLeaderboard', JSON.stringify(this.leaderboardData));
    }

    // 更新玩家分数
    updateScore(playerName, score, gameStats) {
        const playerIndex = this.leaderboardData.findIndex(p => p.name === playerName);
        const newStats = {
            name: playerName,
            score: score,
            gamesPlayed: gameStats.gamesPlayed || 1,
            wins: gameStats.wins || 0,
            biggestPot: gameStats.biggestPot || score,
            lastPlayed: new Date().toISOString(),
        };

        if (playerIndex === -1) {
            this.leaderboardData.push(newStats);
        } else {
            this.leaderboardData[playerIndex] = {
                ...this.leaderboardData[playerIndex],
                ...newStats,
                score: Math.max(this.leaderboardData[playerIndex].score, score),
                gamesPlayed: (this.leaderboardData[playerIndex].gamesPlayed || 0) + 1,
            };
        }

        this.leaderboardData.sort((a, b) => b.score - a.score);
        this.saveLeaderboardData();
        this.updateUI();
    }

    // 初始化排行榜UI
    initializeUI() {
        const leaderboardContainer = document.createElement('div');
        leaderboardContainer.id = 'leaderboard-container';
        leaderboardContainer.className = 'leaderboard-container';
        
        const header = document.createElement('h2');
        header.textContent = '排行榜';
        header.className = 'leaderboard-header';
        
        const leaderboardList = document.createElement('div');
        leaderboardList.id = 'leaderboard-list';
        leaderboardList.className = 'leaderboard-list';
        
        leaderboardContainer.appendChild(header);
        leaderboardContainer.appendChild(leaderboardList);
        
        // 添加到游戏界面
        document.body.appendChild(leaderboardContainer);
        
        this.updateUI();
    }

    // 更新排行榜显示
    updateUI() {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        leaderboardList.innerHTML = '';
        
        this.leaderboardData.slice(0, 10).forEach((player, index) => {
            const playerEntry = document.createElement('div');
            playerEntry.className = 'leaderboard-entry';
            
            playerEntry.innerHTML = `
                <div class="rank">${index + 1}</div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-score">${player.score.toLocaleString()}</div>
                </div>
                <div class="player-stats">
                    <span>胜场: ${player.wins}</span>
                    <span>场次: ${player.gamesPlayed}</span>
                </div>
            `;
            
            leaderboardList.appendChild(playerEntry);
        });
    }
}

// 导出排行榜类
export const leaderboard = new Leaderboard(); 
/**
 * 德州扑克 - 主应用脚本
 * 负责初始化应用和基本设置
 */

// 导入模块
import { leaderboard } from './leaderboard.js';
import { achievements } from './achievements.js';
import { touchHandler } from './touch.js';
import { PokerUI } from './ui.js';

// 全局变量
let currentPlayer = {
    name: '',
    wins: 0
};

// 应用主类
class PokerApp {
    constructor() {
        this.player = {
            name: '',
            avatar: '',
            chips: 0,
            position: -1,
            isHost: false
        };
        this.room = {
            id: '',
            name: '',
            maxPlayers: 6,
            smallBlind: 5,
            bigBlind: 10,
            initialChips: 1000,
            allInFlips: 3,
            players: [],
            observers: [],
            gameStarted: false,
            hostId: ''
        };
        this.gameState = {
            currentScreen: 'welcome-screen',
            selectedAvatar: null,
            isWinner: false,
            currentPot: 0,
            consecutiveGames: 0,
            handRank: '',
            successfulBluff: false
        };
        
        // 初始化UI
        this.ui = new PokerUI(this);
        
        // 绑定事件
        this.bindEvents();
        
        // 加载玩家数据
        this.loadPlayerData();
        
        console.log('德州扑克应用已初始化');
    }
    
    /**
     * 绑定界面事件
     */
    bindEvents() {
        // 欢迎页面
        document.getElementById('create-room').addEventListener('click', () => this.navigateTo('create-room-screen'));
        document.getElementById('join-room').addEventListener('click', () => this.navigateTo('join-room-screen'));
        document.getElementById('show-tutorial').addEventListener('click', () => this.navigateTo('tutorial-screen'));
        
        // 创建房间页面
        document.getElementById('player-count').addEventListener('input', (e) => {
            document.getElementById('player-count-value').textContent = `${e.target.value}人`;
        });
        document.getElementById('back-from-create').addEventListener('click', () => this.navigateTo('welcome-screen'));
        document.getElementById('confirm-create').addEventListener('click', () => this.createRoom());
        
        // 加入房间页面
        document.getElementById('back-from-join').addEventListener('click', () => this.navigateTo('welcome-screen'));
        document.getElementById('confirm-join').addEventListener('click', () => this.joinRoom());
        document.getElementById('paste-room-code').addEventListener('click', () => this.pasteRoomCode());
        
        // 教程页面
        document.getElementById('back-from-tutorial').addEventListener('click', () => this.navigateTo('welcome-screen'));
        document.querySelectorAll('.tutorial-nav').forEach(nav => {
            nav.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-target');
                this.showTutorialSection(target);
            });
        });
        
        // 等待房间页面
        document.getElementById('leave-room').addEventListener('click', () => this.leaveRoom());
        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('copy-room-code').addEventListener('click', () => this.copyRoomCode());
        
        // 模态框
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        
        // 移动端菜单按钮
        const menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>';
        document.body.appendChild(menuToggle);
        
        menuToggle.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('active');
        });
    }
    
    /**
     * 页面导航
     * @param {string} screenId - 目标页面ID
     */
    navigateTo(screenId) {
        // 隐藏当前页面
        document.querySelector('.main-screen.active').classList.remove('active');
        
        // 显示目标页面
        document.getElementById(screenId).classList.add('active');
        
        // 更新当前页面状态
        this.gameState.currentScreen = screenId;
        
        // 执行页面特定初始化
        switch(screenId) {
            case 'welcome-screen':
                this.initWelcomeScreen();
                break;
            case 'create-room-screen':
                // 确保创建房间前已设置玩家信息
                if (!this.validatePlayerInfo()) {
                    return;
                }
                break;
            case 'join-room-screen':
                // 确保加入房间前已设置玩家信息
                if (!this.validatePlayerInfo()) {
                    return;
                }
                this.loadActiveRooms();
                break;
            case 'tutorial-screen':
                // 教程页面初始化 - 默认显示基础规则
                this.showTutorialSection('basics');
                break;
            case 'waiting-room-screen':
                // 等待房间初始化
                this.updateWaitingRoom();
                break;
        }
        
        // 如果是移动端，关闭侧边栏
        if (window.innerWidth <= 1024) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    }
    
    /**
     * 初始化欢迎页面
     */
    initWelcomeScreen() {
        // 加载保存的玩家信息
        const savedName = localStorage.getItem('player_name');
        if (savedName) {
            document.getElementById('player-name').value = savedName;
            document.getElementById('player-name-display').textContent = savedName;
        }
        
        // 加载头像选项
        this.loadAvatars();
    }
    
    /**
     * 加载玩家头像列表
     */
    loadAvatars() {
        const avatarGrid = document.getElementById('avatar-grid');
        avatarGrid.innerHTML = '';
        
        const avatars = [
            { id: 'mickey', name: '米奇' },
            { id: 'donald', name: '唐老鸭' },
            { id: 'woody', name: '胡迪' },
            { id: 'buzz', name: '巴斯光年' },
            { id: 'stitch', name: '史迪奇' },
            { id: 'elsa', name: '艾莎' },
            { id: 'baymax', name: '大白' },
            { id: 'simba', name: '辛巴' }
        ];
        
        avatars.forEach(avatar => {
            const item = document.createElement('div');
            item.className = 'avatar-item';
            item.dataset.avatar = avatar.id;
            item.innerHTML = `
                <img src="assets/images/avatars/${avatar.id}.svg" alt="${avatar.name}">
                <span class="avatar-name">${avatar.name}</span>
            `;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                document.getElementById('current-avatar').src = `assets/images/avatars/${avatar.id}.svg`;
            });
            
            avatarGrid.appendChild(item);
        });
    }
    
    /**
     * 验证玩家信息
     * @returns {boolean} - 验证结果
     */
    validatePlayerInfo() {
        const playerName = document.getElementById('player-name').value.trim();
        
        if (!playerName) {
            this.ui.showToast('请输入玩家名称');
            return false;
        }
        
        if (!this.gameState.selectedAvatar) {
            this.ui.showToast('请选择头像');
            return false;
        }
        
        // 更新玩家信息
        this.player.name = playerName;
        
        // 保存玩家名称到本地存储
        localStorage.setItem('player_name', playerName);
        
        return true;
    }
    
    /**
     * 加载已保存的玩家数据
     */
    loadPlayerData() {
        // 如果本地有存储的数据，则加载
        const savedName = localStorage.getItem('player_name');
        const savedAvatar = localStorage.getItem('poker_player_avatar');
        
        if (savedName) {
            this.player.name = savedName;
            document.getElementById('player-name').value = savedName;
        }
        
        if (savedAvatar) {
            this.player.avatar = savedAvatar;
            this.gameState.selectedAvatar = savedAvatar;
        }
    }
    
    /**
     * 创建房间
     */
    createRoom() {
        // 验证玩家信息
        if (!this.validatePlayerInfo()) {
            return;
        }
        
        this.ui.showLoading();
        
        // 模拟创建房间
        setTimeout(() => {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            document.getElementById('display-room-code').textContent = roomCode;
            this.ui.hideLoading();
            this.navigateTo('waiting-room-screen');
        }, 1000);
    }
    
    /**
     * 加载活跃房间列表
     */
    loadActiveRooms() {
        // 模拟加载活跃房间
        const activeRooms = document.getElementById('active-rooms');
        
        // 清空现有列表
        activeRooms.innerHTML = '';
        
        // 仅保留示例房间（实际应从服务器获取）
        const roomItem1 = document.createElement('div');
        roomItem1.className = 'room-item';
        roomItem1.innerHTML = `
            <div class="room-info">
                <h4>欢乐德州</h4>
                <p>6/8人 • 小盲5/大盲10</p>
            </div>
            <button class="btn-small" data-room-id="ABC123">加入</button>
        `;
        
        const roomItem2 = document.createElement('div');
        roomItem2.className = 'room-item';
        roomItem2.innerHTML = `
            <div class="room-info">
                <h4>高手对决</h4>
                <p>4/4人 • 小盲10/大盲20</p>
            </div>
            <button class="btn-small" data-room-id="DEF456">观战</button>
        `;
        
        activeRooms.appendChild(roomItem1);
        activeRooms.appendChild(roomItem2);
        
        // 添加点击事件
        activeRooms.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomId = e.target.getAttribute('data-room-id');
                document.getElementById('room-code').value = roomId;
                
                if (e.target.textContent === '观战') {
                    document.getElementById('join-as-observer').checked = true;
                } else {
                    document.getElementById('join-as-observer').checked = false;
                }
            });
        });
    }
    
    /**
     * 粘贴房间号
     */
    async pasteRoomCode() {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById('room-code').value = text;
        } catch (error) {
            console.error('无法读取剪贴板:', error);
        }
    }
    
    /**
     * 加入房间
     */
    joinRoom() {
        // 验证玩家信息
        if (!this.validatePlayerInfo()) {
            return;
        }
        
        const roomCode = document.getElementById('room-code-input').value.trim();
        if (!roomCode) {
            this.ui.showToast('请输入房间号');
            return;
        }
        
        this.ui.showLoading();
        
        // 模拟加入房间
        setTimeout(() => {
            this.ui.hideLoading();
            this.navigateTo('waiting-room-screen');
        }, 1000);
    }
    
    /**
     * 更新等待房间页面
     */
    updateWaitingRoom() {
        // 显示房间号
        document.getElementById('display-room-code').textContent = this.room.id;
        
        // 显示房间设置
        document.getElementById('small-blind-display').textContent = this.room.smallBlind;
        document.getElementById('big-blind-display').textContent = this.room.bigBlind;
        document.getElementById('initial-chips-display').textContent = this.room.initialChips;
        
        // 显示玩家数量
        document.getElementById('player-count-display').textContent = this.room.players.length;
        document.getElementById('max-player-display').textContent = this.room.maxPlayers;
        
        // 渲染玩家列表
        this.renderPlayerList();
        
        // 启用/禁用开始游戏按钮
        const startGameBtn = document.getElementById('start-game');
        
        if (this.player.isHost) {
            startGameBtn.classList.remove('disabled');
            startGameBtn.disabled = this.room.players.length < 4;
            
            if (this.room.players.length < 4) {
                startGameBtn.title = '至少需要4名玩家才能开始游戏';
            } else {
                startGameBtn.title = '点击开始游戏';
            }
        } else {
            startGameBtn.classList.add('disabled');
            startGameBtn.disabled = true;
            startGameBtn.title = '只有房主可以开始游戏';
        }
    }
    
    /**
     * 渲染玩家列表
     */
    renderPlayerList() {
        const playerListContainer = document.getElementById('waiting-player-list');
        playerListContainer.innerHTML = '';
        
        // 渲染已加入的玩家
        this.room.players.forEach(player => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            playerItem.innerHTML = `
                <div class="player-avatar">
                    <img src="${this.getAvatarUrl(player.avatar)}" alt="${player.name}的头像">
                </div>
                <div class="player-name">${player.name}</div>
                ${player.isHost ? '<div class="player-role">房主</div>' : ''}
            `;
            
            playerListContainer.appendChild(playerItem);
        });
        
        // 渲染空位
        for (let i = this.room.players.length; i < this.room.maxPlayers; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'player-item';
            emptySlot.style.opacity = '0.5';
            
            emptySlot.innerHTML = `
                <div class="player-avatar">
                    <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="25" cy="25" r="24" stroke="#d2d2d7" stroke-width="2" fill="none" stroke-dasharray="4 4"/>
                        <path d="M25 20 L25 30 M20 25 L30 25" stroke="#d2d2d7" stroke-width="2"/>
                    </svg>
                </div>
                <div class="player-name">等待加入...</div>
            `;
            
            playerListContainer.appendChild(emptySlot);
        }
    }
    
    /**
     * 获取头像URL
     * @param {string} avatarId - 头像ID
     * @returns {string} - 头像URL
     */
    getAvatarUrl(avatarId) {
        // 预设的头像映射
        const avatarMap = {
            'avatar1': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%234CAF50"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E',
            'avatar2': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%232196F3"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E',
            'avatar3': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23FFC107"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E',
            'avatar4': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23F44336"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E',
            'avatar5': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%239C27B0"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E',
            'avatar6': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23FF9800"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E',
            'avatar7': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23607D8B"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E',
            'avatar8': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23009688"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E'
        };
        
        return avatarMap[avatarId] || avatarMap['avatar1'];
    }
    
    /**
     * 复制房间号
     */
    copyRoomCode() {
        const roomCode = document.getElementById('display-room-code').textContent;
        
        try {
            navigator.clipboard.writeText(roomCode);
            // 显示复制成功提示
            this.ui.showToast('房间号已复制到剪贴板');
        } catch (error) {
            console.error('无法复制房间号:', error);
            this.ui.showToast('复制失败，请手动复制');
        }
    }
    
    /**
     * 离开房间
     */
    leaveRoom() {
        this.ui.showModal('确认离开', '确定要离开当前房间吗？', [
            { text: '取消', isPrimary: false },
            { text: '确定', isPrimary: true, action: () => this.navigateTo('welcome-screen') }
        ]);
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        // 检查是否有足够的玩家
        if (this.room.players.length < 4) {
            this.ui.showToast('至少需要4名玩家才能开始游戏');
            return;
        }
        
        // 检查是否是房主
        if (!this.player.isHost) {
            this.ui.showToast('只有房主才能开始游戏');
            return;
        }
        
        this.ui.showLoading();
        
        // 模拟游戏加载
        setTimeout(() => {
            this.ui.hideLoading();
            this.navigateTo('game-screen');
        }, 1500);
    }
    
    /**
     * 显示教程内容
     * @param {string} sectionId - 教程部分ID
     */
    showTutorialSection(sectionId) {
        // 移除所有激活状态
        document.querySelectorAll('.tutorial-nav').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelectorAll('.tutorial-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 激活选中的标签和内容
        document.querySelector(`.tutorial-nav[data-target="${sectionId}"]`).classList.add('active');
        document.getElementById(`tutorial-${sectionId}`).classList.add('active');
    }
    
    /**
     * 显示模态框
     * @param {string} title - 标题
     * @param {string} message - 消息内容
     * @param {Array} buttons - 按钮配置数组 [{text, action, isPrimary}]
     */
    showModal(title, message, buttons = []) {
        // 设置标题和消息
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = `<p>${message}</p>`;
        
        // 清空并添加按钮
        const footer = document.getElementById('modal-footer');
        footer.innerHTML = '';
        
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.textContent = button.text;
            btn.className = button.isPrimary ? 'btn-primary' : 'btn-secondary';
            btn.style.width = 'auto';
            btn.addEventListener('click', () => {
                this.closeModal();
                if (typeof button.action === 'function') {
                    button.action();
                }
            });
            footer.appendChild(btn);
        });
        
        // 显示模态框
        document.getElementById('modal').classList.add('active');
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    /**
     * 显示指定页面
     * @param {string} screenId - 目标页面ID
     */
    showScreen(screenId) {
        this.navigateTo(screenId);
    }
}

// 页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', () => {
    window.pokerApp = new PokerApp();
});

// 导出应用实例
export const app = window.pokerApp;

// 更新游戏状态
function updateGameState(newState) {
    Object.assign(currentPlayer, newState);
    
    // 检查成就
    achievements.checkAchievements(currentPlayer, currentPlayer.name);
    
    // 更新排行榜
    if (currentPlayer.isWinner) {
        leaderboard.updateScore(currentPlayer.name, currentPlayer.currentPot, {
            gamesPlayed: currentPlayer.consecutiveGames,
            wins: currentPlayer.wins,
            biggestPot: currentPlayer.currentPot
        });
    }
}

// 添加移动端手势控制
document.addEventListener('swipeLeft', () => {
    // 处理向左滑动
    showPreviousAction();
});

document.addEventListener('swipeRight', () => {
    // 处理向右滑动
    showNextAction();
});

// 显示手势提示
function showGestureHint(message) {
    const hint = document.createElement('div');
    hint.className = 'gesture-hint';
    hint.textContent = message;
    document.body.appendChild(hint);
    
    setTimeout(() => hint.classList.add('show'), 100);
    setTimeout(() => {
        hint.classList.remove('show');
        setTimeout(() => hint.remove(), 300);
    }, 2000);
}

// 首次加载时显示手势提示
window.addEventListener('load', () => {
    if (window.innerWidth <= 768) {
        showGestureHint('左右滑动切换操作，上下滑动调整筹码');
    }
});

// 添加触摸反馈效果
function addTouchFeedback(event) {
    const feedback = document.createElement('div');
    feedback.className = 'touch-feedback';
    feedback.style.left = `${event.touches[0].clientX - 20}px`;
    feedback.style.top = `${event.touches[0].clientY - 20}px`;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 400);
}

document.addEventListener('touchstart', addTouchFeedback); 
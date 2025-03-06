/**
 * 德州扑克 - 主应用脚本
 * 负责初始化应用和基本设置
 */

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
            selectedAvatar: null
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
    }
    
    /**
     * 初始化欢迎页面
     */
    initWelcomeScreen() {
        // 加载默认头像列表
        this.loadAvatars();
        
        // 从本地存储中恢复之前的名称（如果有）
        const savedName = localStorage.getItem('poker_player_name');
        if (savedName) {
            document.getElementById('player-name').value = savedName;
            this.player.name = savedName;
        }
        
        // 恢复之前选择的头像（如果有）
        const savedAvatar = localStorage.getItem('poker_player_avatar');
        if (savedAvatar) {
            this.player.avatar = savedAvatar;
            setTimeout(() => {
                const avatarItems = document.querySelectorAll('.avatar-item');
                avatarItems.forEach(item => {
                    if (item.dataset.avatar === savedAvatar) {
                        item.classList.add('selected');
                        this.gameState.selectedAvatar = savedAvatar;
                    }
                });
            }, 100);
        }
    }
    
    /**
     * 加载玩家头像列表
     */
    loadAvatars() {
        const avatarGrid = document.getElementById('avatar-grid');
        avatarGrid.innerHTML = '';
        
        // 预设8个大富翁风格的头像
        const avatars = [
            { id: 'avatar1', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%234CAF50"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '绿色' },
            { id: 'avatar2', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%232196F3"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '蓝色' },
            { id: 'avatar3', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23FFC107"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '黄色' },
            { id: 'avatar4', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23F44336"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '红色' },
            { id: 'avatar5', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%239C27B0"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '紫色' },
            { id: 'avatar6', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23FF9800"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '橙色' },
            { id: 'avatar7', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23607D8B"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '灰色' },
            { id: 'avatar8', url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"%3E%3Ccircle cx="30" cy="30" r="30" fill="%23009688"/%3E%3Ccircle cx="30" cy="24" r="12" fill="%23FFF"/%3E%3Cpath d="M30 36c-8.28 0-15 3.75-15 12h30c0-8.25-6.72-12-15-12z" fill="%23FFF"/%3E%3C/svg%3E', name: '青色' }
        ];
        
        avatars.forEach(avatar => {
            const item = document.createElement('div');
            item.className = 'avatar-item';
            item.dataset.avatar = avatar.id;
            item.innerHTML = `<img src="${avatar.url}" alt="${avatar.name}头像">`;
            
            item.addEventListener('click', () => {
                // 移除其他头像的选中状态
                document.querySelectorAll('.avatar-item').forEach(el => el.classList.remove('selected'));
                
                // 添加选中状态
                item.classList.add('selected');
                
                // 更新选中的头像
                this.gameState.selectedAvatar = avatar.id;
                this.player.avatar = avatar.id;
                
                // 保存选择
                localStorage.setItem('poker_player_avatar', avatar.id);
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
            this.showModal('请输入玩家名称', '请输入您的玩家名称才能继续。', [
                { text: '确定', action: () => this.navigateTo('welcome-screen') }
            ]);
            return false;
        }
        
        if (!this.gameState.selectedAvatar) {
            this.showModal('请选择头像', '请选择一个头像才能继续。', [
                { text: '确定', action: () => this.navigateTo('welcome-screen') }
            ]);
            return false;
        }
        
        // 更新玩家信息
        this.player.name = playerName;
        
        // 保存玩家名称到本地存储
        localStorage.setItem('poker_player_name', playerName);
        
        return true;
    }
    
    /**
     * 加载已保存的玩家数据
     */
    loadPlayerData() {
        // 如果本地有存储的数据，则加载
        const savedName = localStorage.getItem('poker_player_name');
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
        
        // 获取房间设置
        const roomName = document.getElementById('room-name').value.trim() || `${this.player.name}的房间`;
        const maxPlayers = parseInt(document.getElementById('player-count').value);
        const smallBlind = parseInt(document.getElementById('small-blind').value);
        const bigBlind = parseInt(document.getElementById('big-blind').value);
        const initialChips = parseInt(document.getElementById('initial-chips').value);
        const allInFlips = parseInt(document.getElementById('all-in-flips').value);
        
        // 验证房间设置
        if (bigBlind < smallBlind * 2) {
            this.showModal('设置错误', '大盲注应该至少是小盲注的两倍。', [
                { text: '确定', action: () => {} }
            ]);
            return;
        }
        
        // 显示加载
        this.ui.showLoading();
        
        // 模拟网络请求创建房间
        setTimeout(() => {
            // 生成6位随机房间号
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            // 更新房间信息
            this.room = {
                id: roomId,
                name: roomName,
                maxPlayers: maxPlayers,
                smallBlind: smallBlind,
                bigBlind: bigBlind,
                initialChips: initialChips,
                allInFlips: allInFlips,
                players: [{
                    id: 'p1', // 实际中应该是唯一ID
                    name: this.player.name,
                    avatar: this.player.avatar,
                    chips: initialChips,
                    isHost: true
                }],
                observers: [],
                gameStarted: false,
                hostId: 'p1' // 实际中应该是唯一ID
            };
            
            // 更新玩家信息
            this.player.isHost = true;
            this.player.chips = initialChips;
            this.player.position = 0;
            
            // 隐藏加载
            this.ui.hideLoading();
            
            // 显示等待页面
            this.navigateTo('waiting-room-screen');
            
            console.log('房间已创建', this.room);
        }, 800);
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
        
        // 获取房间号
        const roomCode = document.getElementById('room-code').value.trim().toUpperCase();
        const joinAsObserver = document.getElementById('join-as-observer').checked;
        
        // 验证房间号
        if (!roomCode || roomCode.length < 4) {
            this.showModal('请输入有效的房间号', '请输入至少4位的房间号。', [
                { text: '确定', action: () => {} }
            ]);
            return;
        }
        
        // 显示加载
        this.ui.showLoading();
        
        // 模拟网络请求加入房间
        setTimeout(() => {
            // 模拟加入成功
            // 实际应从服务器获取房间信息
            
            // 模拟房间数据
            this.room = {
                id: roomCode,
                name: '测试房间',
                maxPlayers: 6,
                smallBlind: 5,
                bigBlind: 10,
                initialChips: 1000,
                allInFlips: 3,
                players: [
                    {
                        id: 'host123',
                        name: '房主',
                        avatar: 'avatar1',
                        chips: 1000,
                        isHost: true
                    }
                ],
                observers: [],
                gameStarted: false,
                hostId: 'host123'
            };
            
            if (joinAsObserver) {
                // 作为观察者加入
                this.room.observers.push({
                    id: 'obs1', // 实际中应该是唯一ID
                    name: this.player.name,
                    avatar: this.player.avatar
                });
                
                this.player.isHost = false;
                this.player.position = -1;
            } else {
                // 作为玩家加入
                this.player.chips = this.room.initialChips;
                this.player.isHost = false;
                this.player.position = this.room.players.length;
                
                this.room.players.push({
                    id: 'p' + (this.room.players.length + 1), // 实际中应该是唯一ID
                    name: this.player.name,
                    avatar: this.player.avatar,
                    chips: this.room.initialChips,
                    isHost: false
                });
            }
            
            // 隐藏加载
            this.ui.hideLoading();
            
            // 显示等待页面
            this.navigateTo('waiting-room-screen');
            
            console.log('成功加入房间', this.room);
        }, 800);
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
        this.showModal('确认离开房间', '您确定要离开当前房间吗？', [
            { text: '取消', action: () => {}, isPrimary: false },
            { text: '确认', action: () => {
                // 重置房间信息
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
                
                // 重置玩家房间相关信息
                this.player.isHost = false;
                this.player.position = -1;
                
                // 返回首页
                this.navigateTo('welcome-screen');
            }, isPrimary: true }
        ]);
    }
    
    /**
     * 开始游戏
     */
    startGame() {
        // 检查是否有足够的玩家
        if (this.room.players.length < 4) {
            this.showModal('无法开始游戏', '至少需要4名玩家才能开始游戏。', [
                { text: '确定', action: () => {} }
            ]);
            return;
        }
        
        // 检查是否是房主
        if (!this.player.isHost) {
            this.showModal('权限不足', '只有房主才能开始游戏。', [
                { text: '确定', action: () => {} }
            ]);
            return;
        }
        
        // 显示加载
        this.ui.showLoading();
        
        // 模拟游戏加载过程
        setTimeout(() => {
            // 更新房间状态
            this.room.gameStarted = true;
            
            // 隐藏加载
            this.ui.hideLoading();
            
            // 显示游戏页面
            document.querySelector('.main-screen.active').classList.remove('active');
            document.getElementById('game-screen').classList.add('active');
            
            // 初始化游戏
            if (window.pokerGame) {
                window.pokerGame.initGame(this.room, this.player);
            } else {
                console.error('游戏引擎未加载');
            }
            
            console.log('游戏已开始', this.room);
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
}

// 页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', () => {
    window.pokerApp = new PokerApp();
}); 
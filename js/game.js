/**
 * 德州扑克 - 游戏界面脚本
 * 处理游戏界面渲染和玩家交互
 */

class PokerGame {
    constructor() {
        this.gameScreen = document.getElementById('game-screen');
        this.ui = window.pokerApp.ui;
        this.engine = window.pokerEngine;
        
        // 游戏状态
        this.gameState = {
            isActive: false,
            currentPlayer: null,
            players: [],
            communityCards: [],
            pot: 0,
            currentBet: 0,
            gameStage: 'idle', // idle, preflop, flop, turn, river, showdown
            activePlayerId: null,
            dealerPosition: -1,
            smallBlindPosition: -1,
            bigBlindPosition: -1
        };
        
        // 玩家位置配置
        this.playerPositions = [
            { x: 50, y: 50, angle: 225 },  // 左上
            { x: 50, y: 40, angle: 270 },  // 上
            { x: 50, y: 30, angle: 315 },  // 右上
            { x: 60, y: 25, angle: 0 },    // 右
            { x: 70, y: 30, angle: 45 },   // 右下
            { x: 70, y: 40, angle: 90 },   // 下
            { x: 70, y: 50, angle: 135 },  // 左下
            { x: 60, y: 55, angle: 180 },  // 左
        ];
        
        // 动画定时器
        this.animationTimers = [];
        
        // 绑定事件处理器
        this.bindEventHandlers();
        
        console.log('扑克游戏界面已初始化');
    }
    
    /**
     * 初始化游戏
     * @param {Object} roomData - 房间数据
     * @param {Object} playerData - 玩家数据
     */
    initGame(roomData, playerData) {
        // 清空游戏屏幕
        this.gameScreen.innerHTML = '';
        
        // 创建游戏界面基本结构
        this.createGameLayout();
        
        // 更新游戏状态
        this.gameState.isActive = true;
        this.gameState.players = roomData.players;
        this.gameState.currentPlayer = playerData;
        
        // 初始化扑克引擎
        this.engine.initGame(roomData.players, {
            smallBlind: roomData.smallBlind,
            bigBlind: roomData.bigBlind
        });
        
        // 渲染玩家
        this.renderPlayers();
        
        // 开始新一轮游戏
        this.startNewRound();
        
        console.log('游戏已初始化', roomData);
    }
    
    /**
     * 创建游戏界面布局
     */
    createGameLayout() {
        // 创建主要游戏区域
        const gameTable = document.createElement('div');
        gameTable.className = 'game-table';
        
        // 创建公共牌区域
        const communityCardsArea = document.createElement('div');
        communityCardsArea.className = 'community-cards';
        communityCardsArea.id = 'community-cards';
        gameTable.appendChild(communityCardsArea);
        
        // 创建底池区域
        const potArea = document.createElement('div');
        potArea.className = 'pot-area';
        potArea.innerHTML = `
            <div class="pot-label">底池</div>
            <div class="pot-amount" id="pot-amount">0</div>
        `;
        gameTable.appendChild(potArea);
        
        // 创建玩家操作区域
        const actionArea = document.createElement('div');
        actionArea.className = 'action-area';
        actionArea.id = 'action-area';
        actionArea.innerHTML = `
            <div class="action-buttons">
                <button class="btn-fold" id="btn-fold">弃牌</button>
                <button class="btn-call" id="btn-call">跟注</button>
                <button class="btn-raise" id="btn-raise">加注</button>
                <button class="btn-all-in" id="btn-all-in">全押</button>
            </div>
            <div class="bet-controls">
                <input type="range" id="bet-slider" min="0" max="100" value="0">
                <div class="bet-amount">
                    <span id="bet-amount">0</span>
                    <button class="btn-confirm-bet" id="btn-confirm-bet">确认</button>
                </div>
            </div>
        `;
        this.gameScreen.appendChild(actionArea);
        
        // 创建游戏信息区域
        const infoArea = document.createElement('div');
        infoArea.className = 'game-info';
        infoArea.innerHTML = `
            <div class="blind-info">
                小盲/大盲: <span id="blind-value">5/10</span>
            </div>
            <div class="stage-info">
                阶段: <span id="game-stage">等待开始</span>
            </div>
        `;
        this.gameScreen.appendChild(infoArea);
        
        // 创建聊天区域
        const chatArea = document.createElement('div');
        chatArea.className = 'chat-area';
        chatArea.innerHTML = `
            <div class="chat-messages" id="chat-messages"></div>
            <div class="chat-input">
                <input type="text" id="chat-input" placeholder="输入消息...">
                <button id="send-chat">发送</button>
            </div>
        `;
        this.gameScreen.appendChild(chatArea);
        
        // 添加到游戏屏幕
        this.gameScreen.appendChild(gameTable);
        
        // 添加样式
        this.addGameStyles();
    }
    
    /**
     * 添加游戏相关的样式
     */
    addGameStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .game-table {
                width: 100%;
                height: 100%;
                background-color: var(--table-green);
                border-radius: 100px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 0 50px rgba(0, 0, 0, 0.5) inset;
            }
            
            .community-cards {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                display: flex;
                gap: 10px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
            }
            
            .pot-area {
                position: absolute;
                top: 35%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }
            
            .pot-label {
                font-size: 14px;
                opacity: 0.8;
            }
            
            .pot-amount {
                font-size: 24px;
                font-weight: bold;
            }
            
            .action-area {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 15px;
                backdrop-filter: blur(10px);
            }
            
            .action-buttons {
                display: flex;
                gap: 10px;
            }
            
            .action-buttons button {
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .btn-fold {
                background-color: var(--warning-color);
                color: white;
            }
            
            .btn-call {
                background-color: var(--primary-color);
                color: white;
            }
            
            .btn-raise {
                background-color: var(--success-color);
                color: white;
            }
            
            .btn-all-in {
                background-color: var(--accent-color);
                color: white;
            }
            
            .bet-controls {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            #bet-slider {
                flex: 1;
                height: 4px;
                -webkit-appearance: none;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }
            
            #bet-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }
            
            .bet-amount {
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
                font-size: 18px;
                font-weight: 600;
            }
            
            .btn-confirm-bet {
                padding: 8px 16px;
                background-color: var(--success-color);
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .game-info {
                position: fixed;
                top: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.8);
                padding: 15px;
                border-radius: 10px;
                color: white;
                backdrop-filter: blur(10px);
            }
            
            .chat-area {
                position: fixed;
                right: 20px;
                bottom: 20px;
                width: 300px;
                background: rgba(0, 0, 0, 0.8);
                border-radius: 15px;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            
            .chat-messages {
                height: 200px;
                overflow-y: auto;
                padding: 15px;
                color: white;
            }
            
            .chat-input {
                display: flex;
                padding: 10px;
                gap: 10px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .chat-input input {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }
            
            .chat-input button {
                padding: 8px 16px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
            }
            
            .player-seat {
                position: absolute;
                width: 120px;
                height: 160px;
                display: flex;
                flex-direction: column;
                align-items: center;
                transform-origin: center;
            }
            
            .player-avatar {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: white;
                overflow: hidden;
                border: 3px solid var(--primary-color);
            }
            
            .player-info {
                margin-top: 10px;
                text-align: center;
                color: white;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            }
            
            .player-name {
                font-weight: 600;
                font-size: 14px;
            }
            
            .player-chips {
                font-size: 12px;
                opacity: 0.8;
            }
            
            .player-cards {
                position: absolute;
                top: 70px;
                display: flex;
                gap: 5px;
            }
            
            .player-bet {
                position: absolute;
                bottom: -40px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 绑定事件处理器
     */
    bindEventHandlers() {
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.updateLayout());
        
        // 绑定玩家操作按钮
        document.addEventListener('DOMContentLoaded', () => {
            const actionArea = document.getElementById('action-area');
            if (actionArea) {
                // 弃牌按钮
                document.getElementById('btn-fold')?.addEventListener('click', () => this.handleFold());
                
                // 跟注按钮
                document.getElementById('btn-call')?.addEventListener('click', () => this.handleCall());
                
                // 加注按钮
                document.getElementById('btn-raise')?.addEventListener('click', () => this.handleRaise());
                
                // 全押按钮
                document.getElementById('btn-all-in')?.addEventListener('click', () => this.handleAllIn());
                
                // 加注滑块
                document.getElementById('bet-slider')?.addEventListener('input', (e) => {
                    document.getElementById('bet-amount').textContent = e.target.value;
                });
                
                // 确认加注按钮
                document.getElementById('btn-confirm-bet')?.addEventListener('click', () => {
                    const amount = parseInt(document.getElementById('bet-amount').textContent);
                    this.handleRaise(amount);
                });
            }
            
            // 绑定聊天功能
            const chatInput = document.getElementById('chat-input');
            const sendButton = document.getElementById('send-chat');
            
            if (chatInput && sendButton) {
                // 发送按钮点击
                sendButton.addEventListener('click', () => this.handleChatSend());
                
                // 回车发送
                chatInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleChatSend();
                    }
                });
            }
        });
    }
    
    /**
     * 渲染玩家
     */
    renderPlayers() {
        const gameTable = document.querySelector('.game-table');
        if (!gameTable) return;

        // 清除现有的玩家座位
        const existingSeats = gameTable.querySelectorAll('.player-seat');
        existingSeats.forEach(seat => seat.remove());

        // 计算玩家位置
        const centerX = gameTable.offsetWidth / 2;
        const centerY = gameTable.offsetHeight / 2;
        const radius = Math.min(centerX, centerY) * 0.8;

        // 渲染每个玩家
        this.gameState.players.forEach((player, index) => {
            const seat = document.createElement('div');
            seat.className = 'player-seat';
            seat.id = `player-${player.id}`;

            // 计算位置
            const position = this.playerPositions[index];
            const x = centerX + radius * Math.cos(position.angle * Math.PI / 180);
            const y = centerY + radius * Math.sin(position.angle * Math.PI / 180);

            // 设置位置和旋转
            seat.style.left = `${x}px`;
            seat.style.top = `${y}px`;
            seat.style.transform = `translate(-50%, -50%) rotate(${position.angle}deg)`;

            // 创建玩家内容
            seat.innerHTML = `
                <div class="player-avatar">
                    <img src="${this.ui.getAvatarUrl(player.avatar)}" alt="${player.name}">
                </div>
                <div class="player-info">
                    <div class="player-name">${player.name}</div>
                    <div class="player-chips">${player.chips}</div>
                </div>
                <div class="player-cards"></div>
                <div class="player-bet"></div>
            `;

            // 添加到游戏桌
            gameTable.appendChild(seat);

            // 如果是当前玩家，添加标识
            if (player.id === this.gameState.currentPlayer.id) {
                seat.classList.add('current-player');
            }
        });

        // 更新玩家状态标识
        this.updatePlayerStatus();
    }

    /**
     * 更新玩家状态标识（庄家、小盲、大盲等）
     */
    updatePlayerStatus() {
        // 移除现有标识
        document.querySelectorAll('.player-status').forEach(el => el.remove());

        // 添加庄家标识
        if (this.gameState.dealerPosition >= 0) {
            const dealerSeat = document.querySelector(`#player-${this.gameState.players[this.gameState.dealerPosition].id}`);
            if (dealerSeat) {
                const dealerButton = document.createElement('div');
                dealerButton.className = 'player-status dealer';
                dealerButton.textContent = 'D';
                dealerSeat.appendChild(dealerButton);
            }
        }

        // 添加小盲标识
        if (this.gameState.smallBlindPosition >= 0) {
            const sbSeat = document.querySelector(`#player-${this.gameState.players[this.gameState.smallBlindPosition].id}`);
            if (sbSeat) {
                const sbButton = document.createElement('div');
                sbButton.className = 'player-status small-blind';
                sbButton.textContent = 'SB';
                sbSeat.appendChild(sbButton);
            }
        }

        // 添加大盲标识
        if (this.gameState.bigBlindPosition >= 0) {
            const bbSeat = document.querySelector(`#player-${this.gameState.players[this.gameState.bigBlindPosition].id}`);
            if (bbSeat) {
                const bbButton = document.createElement('div');
                bbButton.className = 'player-status big-blind';
                bbButton.textContent = 'BB';
                bbSeat.appendChild(bbButton);
            }
        }

        // 添加当前行动玩家标识
        if (this.gameState.activePlayerId) {
            const activeSeat = document.querySelector(`#player-${this.gameState.activePlayerId}`);
            if (activeSeat) {
                activeSeat.classList.add('active-player');
                
                // 添加计时器
                const timer = this.ui.createTimer(30, () => this.handleTimeOut());
                const existingTimer = activeSeat.querySelector('.game-timer');
                if (existingTimer) {
                    existingTimer.remove();
                }
                activeSeat.appendChild(timer.element);
                timer.start();
            }
        }
    }

    /**
     * 发放底牌
     */
    dealHoleCards() {
        const dealerSeat = document.querySelector(`#player-${this.gameState.players[this.gameState.dealerPosition].id}`);
        if (!dealerSeat) return;

        // 获取庄家位置
        const dealerRect = dealerSeat.getBoundingClientRect();
        const dealerX = dealerRect.left + dealerRect.width / 2;
        const dealerY = dealerRect.top + dealerRect.height / 2;

        // 为每个玩家发两张牌
        this.gameState.players.forEach((player, index) => {
            const playerSeat = document.querySelector(`#player-${player.id}`);
            if (!playerSeat) return;

            const cardsContainer = playerSeat.querySelector('.player-cards');
            if (!cardsContainer) return;

            // 清空现有的牌
            cardsContainer.innerHTML = '';

            // 发两张牌
            for (let i = 0; i < 2; i++) {
                setTimeout(() => {
                    const card = this.ui.createCardElement(
                        player.id === this.gameState.currentPlayer.id ? player.hand[i] : 'back',
                        player.id !== this.gameState.currentPlayer.id
                    );
                    card.style.position = 'absolute';
                    card.style.left = `${dealerX}px`;
                    card.style.top = `${dealerY}px`;
                    card.style.transform = 'scale(0.5)';
                    card.style.opacity = '0';
                    
                    document.body.appendChild(card);

                    // 获取目标位置
                    const targetRect = cardsContainer.getBoundingClientRect();
                    const targetX = targetRect.left + i * 30;
                    const targetY = targetRect.top;

                    // 添加发牌动画类
                    card.classList.add('deal-card');
                    card.style.transition = 'all 0.5s ease';
                    
                    // 触发重排
                    void card.offsetWidth;

                    // 移动到目标位置
                    card.style.left = `${targetX}px`;
                    card.style.top = `${targetY}px`;
                    card.style.transform = 'scale(1)';
                    card.style.opacity = '1';

                    // 动画结束后固定到位
                    card.addEventListener('transitionend', () => {
                        cardsContainer.appendChild(card);
                        card.style.position = 'relative';
                        card.style.left = '';
                        card.style.top = '';
                    }, { once: true });
                }, 200 * (index * 2 + i));
            }
        });
    }

    /**
     * 发放公共牌
     * @param {Array} cards - 要发的牌
     */
    dealCommunityCards(cards) {
        const communityCardsArea = document.getElementById('community-cards');
        if (!communityCardsArea) return;

        // 获取庄家位置
        const dealerSeat = document.querySelector(`#player-${this.gameState.players[this.gameState.dealerPosition].id}`);
        if (!dealerSeat) return;

        const dealerRect = dealerSeat.getBoundingClientRect();
        const dealerX = dealerRect.left + dealerRect.width / 2;
        const dealerY = dealerRect.top + dealerRect.height / 2;

        // 发牌
        cards.forEach((card, index) => {
            setTimeout(() => {
                const cardElement = this.ui.createCardElement(card, false);
                cardElement.style.position = 'absolute';
                cardElement.style.left = `${dealerX}px`;
                cardElement.style.top = `${dealerY}px`;
                cardElement.style.transform = 'scale(0.5)';
                cardElement.style.opacity = '0';
                
                document.body.appendChild(cardElement);

                // 获取目标位置
                const targetRect = communityCardsArea.getBoundingClientRect();
                const targetX = targetRect.left + (this.gameState.communityCards.length + index) * 80;
                const targetY = targetRect.top;

                // 添加发牌动画类
                cardElement.classList.add('deal-card');
                cardElement.style.transition = 'all 0.5s ease';
                
                // 触发重排
                void cardElement.offsetWidth;

                // 移动到目标位置
                cardElement.style.left = `${targetX}px`;
                cardElement.style.top = `${targetY}px`;
                cardElement.style.transform = 'scale(1)';
                cardElement.style.opacity = '1';

                // 动画结束后固定到位
                cardElement.addEventListener('transitionend', () => {
                    communityCardsArea.appendChild(cardElement);
                    cardElement.style.position = 'relative';
                    cardElement.style.left = '';
                    cardElement.style.top = '';
                }, { once: true });
            }, 200 * index);
        });

        // 更新游戏状态
        this.gameState.communityCards = [...this.gameState.communityCards, ...cards];
    }

    /**
     * 更新玩家下注显示
     * @param {string} playerId - 玩家ID
     * @param {number} amount - 下注金额
     */
    updatePlayerBet(playerId, amount) {
        const playerSeat = document.querySelector(`#player-${playerId}`);
        if (!playerSeat) return;

        const betArea = playerSeat.querySelector('.player-bet');
        if (!betArea) return;

        // 如果已有筹码，先移除
        const existingChips = betArea.querySelector('.chip-stack');
        if (existingChips) {
            existingChips.classList.add('fade-out');
            setTimeout(() => existingChips.remove(), 300);
        }

        // 创建新的筹码堆
        if (amount > 0) {
            const chips = this.ui.createChipStack(amount);
            chips.classList.add('fade-in');
            betArea.appendChild(chips);
        }

        // 更新玩家筹码显示
        const player = this.gameState.players.find(p => p.id === playerId);
        if (player) {
            const chipsDisplay = playerSeat.querySelector('.player-chips');
            if (chipsDisplay) {
                chipsDisplay.textContent = player.chips;
            }
        }
    }

    /**
     * 更新底池显示
     */
    updatePot() {
        const potAmount = document.getElementById('pot-amount');
        if (potAmount) {
            potAmount.textContent = this.gameState.pot;
        }
    }

    /**
     * 处理玩家操作：弃牌
     */
    handleFold() {
        if (!this.isCurrentPlayersTurn()) return;

        // 调用游戏引擎的弃牌方法
        const success = this.engine.fold(this.getCurrentPlayerIndex());
        if (success) {
            // 播放弃牌动画
            this.animateFold();
            
            // 更新游戏状态
            this.updateGameState();
        }
    }

    /**
     * 处理玩家操作：跟注
     */
    handleCall() {
        if (!this.isCurrentPlayersTurn()) return;

        // 调用游戏引擎的跟注方法
        const success = this.engine.call(this.getCurrentPlayerIndex());
        if (success) {
            // 播放筹码移动动画
            this.animateChipMove();
            
            // 更新游戏状态
            this.updateGameState();
        }
    }

    /**
     * 处理玩家操作：加注
     * @param {number} amount - 加注金额
     */
    handleRaise(amount) {
        if (!this.isCurrentPlayersTurn()) return;

        // 调用游戏引擎的加注方法
        const success = this.engine.raise(this.getCurrentPlayerIndex(), amount);
        if (success) {
            // 播放筹码移动动画
            this.animateChipMove();
            
            // 更新游戏状态
            this.updateGameState();
        }
    }

    /**
     * 处理玩家操作：全押
     */
    handleAllIn() {
        if (!this.isCurrentPlayersTurn()) return;

        // 调用游戏引擎的全押方法
        const success = this.engine.allIn(this.getCurrentPlayerIndex());
        if (success) {
            // 播放筹码移动动画
            this.animateChipMove();
            
            // 更新游戏状态
            this.updateGameState();
        }
    }

    /**
     * 处理超时
     */
    handleTimeOut() {
        if (this.isCurrentPlayersTurn()) {
            // 默认选择弃牌
            this.handleFold();
        }
    }

    /**
     * 处理聊天发送
     */
    handleChatSend() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput || !chatInput.value.trim()) return;

        const message = chatInput.value.trim();
        chatInput.value = '';

        // 添加消息到聊天区域
        this.addChatMessage(this.gameState.currentPlayer.name, message);
    }

    /**
     * 添加聊天消息
     * @param {string} sender - 发送者名称
     * @param {string} message - 消息内容
     */
    addChatMessage(sender, message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.innerHTML = `
            <span class="chat-sender">${sender}:</span>
            <span class="chat-text">${message}</span>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    /**
     * 检查是否是当前玩家的回合
     * @returns {boolean}
     */
    isCurrentPlayersTurn() {
        return this.gameState.activePlayerId === this.gameState.currentPlayer.id;
    }

    /**
     * 获取当前玩家在玩家列表中的索引
     * @returns {number}
     */
    getCurrentPlayerIndex() {
        return this.gameState.players.findIndex(p => p.id === this.gameState.currentPlayer.id);
    }

    /**
     * 更新游戏状态
     */
    updateGameState() {
        // 更新阶段显示
        const gameStage = document.getElementById('game-stage');
        if (gameStage) {
            const stageText = {
                'idle': '等待开始',
                'preflop': '翻牌前',
                'flop': '翻牌',
                'turn': '转牌',
                'river': '河牌',
                'showdown': '摊牌'
            }[this.gameState.gameStage];
            gameStage.textContent = stageText;
        }

        // 更新盲注显示
        const blindValue = document.getElementById('blind-value');
        if (blindValue) {
            blindValue.textContent = `${this.engine.smallBlind}/${this.engine.bigBlind}`;
        }

        // 更新玩家状态
        this.updatePlayerStatus();

        // 更新底池
        this.updatePot();

        // 更新玩家操作按钮状态
        this.updateActionButtons();
    }

    /**
     * 更新玩家操作按钮状态
     */
    updateActionButtons() {
        const actionArea = document.getElementById('action-area');
        if (!actionArea) return;

        const isPlayersTurn = this.isCurrentPlayersTurn();
        const currentPlayer = this.gameState.players[this.getCurrentPlayerIndex()];

        // 更新按钮状态
        document.getElementById('btn-fold')?.classList.toggle('disabled', !isPlayersTurn);
        document.getElementById('btn-call')?.classList.toggle('disabled', !isPlayersTurn || currentPlayer.bet === this.gameState.currentBet);
        document.getElementById('btn-raise')?.classList.toggle('disabled', !isPlayersTurn || currentPlayer.chips <= this.gameState.currentBet);
        document.getElementById('btn-all-in')?.classList.toggle('disabled', !isPlayersTurn || currentPlayer.chips === 0);

        // 更新加注滑块范围
        const betSlider = document.getElementById('bet-slider');
        if (betSlider && isPlayersTurn) {
            const minRaise = this.gameState.currentBet * 2;
            const maxRaise = currentPlayer.chips;
            betSlider.min = minRaise;
            betSlider.max = maxRaise;
            betSlider.value = minRaise;
            document.getElementById('bet-amount').textContent = minRaise;
        }
    }

    /**
     * 播放弃牌动画
     */
    animateFold() {
        const playerSeat = document.querySelector(`#player-${this.gameState.currentPlayer.id}`);
        if (!playerSeat) return;

        const cards = playerSeat.querySelectorAll('.card');
        cards.forEach(card => {
            card.classList.add('fold-card');
            card.addEventListener('animationend', () => card.remove(), { once: true });
        });
    }

    /**
     * 播放筹码移动动画
     */
    animateChipMove() {
        const playerSeat = document.querySelector(`#player-${this.gameState.currentPlayer.id}`);
        if (!playerSeat) return;

        const betArea = playerSeat.querySelector('.player-bet');
        if (!betArea) return;

        const chips = betArea.querySelector('.chip-stack');
        if (chips) {
            chips.classList.add('move-chip');
        }
    }

    /**
     * 开始新一轮游戏
     */
    startNewRound() {
        // 重置游戏状态
        this.gameState.communityCards = [];
        this.gameState.pot = 0;
        this.gameState.currentBet = 0;
        this.gameState.gameStage = 'preflop';

        // 清理桌面
        document.getElementById('community-cards').innerHTML = '';
        document.querySelectorAll('.player-bet').forEach(bet => bet.innerHTML = '');

        // 开始新一轮
        const success = this.engine.startNewRound();
        if (success) {
            // 更新庄家和盲注位置
            this.gameState.dealerPosition = this.engine.currentDealer;
            this.gameState.smallBlindPosition = this.engine.smallBlindPosition;
            this.gameState.bigBlindPosition = this.engine.bigBlindPosition;

            // 更新玩家状态
            this.updatePlayerStatus();

            // 发底牌
            this.dealHoleCards();

            // 更新游戏状态
            this.updateGameState();
        }
    }
}

// 创建全局游戏实例
window.pokerGame = new PokerGame(); 
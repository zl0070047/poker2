/**
 * 德州扑克 - 扑克游戏逻辑
 * 处理牌局逻辑、发牌、手牌评估等核心游戏功能
 */

class Poker {
    constructor() {
        // 扑克牌数据
        this.suits = ['S', 'H', 'C', 'D']; // 黑桃(Spade)、红心(Heart)、梅花(Club)、方块(Diamond)
        this.values = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
        this.deck = [];
        
        // 游戏状态
        this.players = [];
        this.communityCards = [];
        this.currentDealer = -1;
        this.smallBlindPosition = -1;
        this.bigBlindPosition = -1;
        this.currentPlayerTurn = -1;
        this.pot = 0;
        this.currentBet = 0;
        
        // 游戏配置
        this.smallBlind = 5;
        this.bigBlind = 10;
        
        // 游戏阶段
        this.gameStage = 'idle'; // idle, preflop, flop, turn, river, showdown
    }
    
    /**
     * 初始化牌局
     * @param {Array} players - 玩家列表
     * @param {Object} config - 游戏配置
     */
    initGame(players, config = {}) {
        this.players = players.map(player => ({
            ...player,
            hand: [],
            bet: 0,
            totalBet: 0,
            folded: false,
            allIn: false
        }));
        
        this.communityCards = [];
        this.pot = 0;
        this.gameStage = 'idle';
        
        // 应用配置
        if (config.smallBlind) this.smallBlind = config.smallBlind;
        if (config.bigBlind) this.bigBlind = config.bigBlind;
        
        // 洗牌
        this.shuffleDeck();
        
        console.log('扑克游戏初始化完成');
    }
    
    /**
     * 开始新一轮游戏
     */
    startNewRound() {
        // 重置游戏状态
        this.communityCards = [];
        this.pot = 0;
        this.currentBet = 0;
        
        // 重置玩家状态
        this.players.forEach(player => {
            player.hand = [];
            player.bet = 0;
            player.totalBet = 0;
            player.folded = false;
            player.allIn = false;
        });
        
        // 确定庄家位置（轮换）
        if (this.currentDealer === -1 || this.currentDealer >= this.players.length - 1) {
            this.currentDealer = 0;
        } else {
            this.currentDealer++;
        }
        
        // 确定小盲和大盲位置
        this.smallBlindPosition = (this.currentDealer + 1) % this.players.length;
        this.bigBlindPosition = (this.currentDealer + 2) % this.players.length;
        
        // 洗牌
        this.shuffleDeck();
        
        // 发底牌
        this.dealHoleCards();
        
        // 收取盲注
        this.collectBlinds();
        
        // 设置第一个行动的玩家（大盲注后的玩家）
        this.currentPlayerTurn = (this.bigBlindPosition + 1) % this.players.length;
        
        // 设置游戏阶段为"翻牌前"
        this.gameStage = 'preflop';
        
        console.log('新一轮游戏开始');
        return true;
    }
    
    /**
     * 创建并洗牌
     */
    shuffleDeck() {
        // 创建一副新牌
        this.deck = [];
        for (const suit of this.suits) {
            for (const value of this.values) {
                this.deck.push(value + suit);
            }
        }
        
        // 洗牌 (Fisher-Yates算法)
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    
    /**
     * 发放底牌给所有玩家
     */
    dealHoleCards() {
        // 每个玩家发两张牌
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < this.players.length; j++) {
                // 从庄家位置开始按顺序发牌
                const playerIndex = (this.currentDealer + 1 + j) % this.players.length;
                if (this.deck.length > 0) {
                    this.players[playerIndex].hand.push(this.deck.pop());
                }
            }
        }
    }
    
    /**
     * 收取小盲注和大盲注
     */
    collectBlinds() {
        // 收取小盲注
        const smallBlindPlayer = this.players[this.smallBlindPosition];
        if (smallBlindPlayer.chips <= this.smallBlind) {
            // 全押
            smallBlindPlayer.bet = smallBlindPlayer.chips;
            smallBlindPlayer.totalBet = smallBlindPlayer.chips;
            smallBlindPlayer.chips = 0;
            smallBlindPlayer.allIn = true;
        } else {
            smallBlindPlayer.bet = this.smallBlind;
            smallBlindPlayer.totalBet = this.smallBlind;
            smallBlindPlayer.chips -= this.smallBlind;
        }
        
        // 收取大盲注
        const bigBlindPlayer = this.players[this.bigBlindPosition];
        if (bigBlindPlayer.chips <= this.bigBlind) {
            // 全押
            bigBlindPlayer.bet = bigBlindPlayer.chips;
            bigBlindPlayer.totalBet = bigBlindPlayer.chips;
            bigBlindPlayer.chips = 0;
            bigBlindPlayer.allIn = true;
        } else {
            bigBlindPlayer.bet = this.bigBlind;
            bigBlindPlayer.totalBet = this.bigBlind;
            bigBlindPlayer.chips -= this.bigBlind;
        }
        
        // 设置当前下注额
        this.currentBet = Math.max(smallBlindPlayer.bet, bigBlindPlayer.bet);
    }
    
    /**
     * 玩家操作：跟注
     * @param {number} playerIndex - 玩家索引
     * @returns {boolean} - 操作是否成功
     */
    call(playerIndex) {
        if (playerIndex !== this.currentPlayerTurn) return false;
        
        const player = this.players[playerIndex];
        const amountToCall = this.currentBet - player.bet;
        
        // 检查玩家是否有足够的筹码
        if (player.chips < amountToCall) {
            // 全押
            player.bet += player.chips;
            player.totalBet += player.chips;
            this.pot += player.chips;
            player.chips = 0;
            player.allIn = true;
        } else {
            player.bet = this.currentBet;
            player.totalBet += amountToCall;
            this.pot += amountToCall;
            player.chips -= amountToCall;
        }
        
        // 移至下一个玩家
        this.nextPlayer();
        
        // 检查当前回合是否结束
        if (this.isRoundComplete()) {
            this.endBettingRound();
        }
        
        return true;
    }
    
    /**
     * 玩家操作：加注
     * @param {number} playerIndex - 玩家索引
     * @param {number} amount - 加注金额
     * @returns {boolean} - 操作是否成功
     */
    raise(playerIndex, amount) {
        if (playerIndex !== this.currentPlayerTurn) return false;
        
        const player = this.players[playerIndex];
        const minRaise = this.currentBet * 2;
        
        // 验证加注金额
        if (amount < minRaise) {
            return false; // 加注金额必须至少是当前下注的两倍
        }
        
        if (player.chips < amount) {
            return false; // 筹码不足
        }
        
        // 更新下注金额
        const addAmount = amount - player.bet;
        player.bet = amount;
        player.totalBet += addAmount;
        this.pot += addAmount;
        player.chips -= addAmount;
        
        // 更新当前最高下注
        this.currentBet = amount;
        
        // 移至下一个玩家
        this.nextPlayer();
        
        return true;
    }
    
    /**
     * 玩家操作：全押
     * @param {number} playerIndex - 玩家索引
     * @returns {boolean} - 操作是否成功
     */
    allIn(playerIndex) {
        if (playerIndex !== this.currentPlayerTurn) return false;
        
        const player = this.players[playerIndex];
        
        if (player.chips === 0) {
            return false; // 已经没有筹码了
        }
        
        // 全押
        const allInAmount = player.chips + player.bet;
        player.bet = allInAmount;
        player.totalBet += player.chips;
        this.pot += player.chips;
        player.chips = 0;
        player.allIn = true;
        
        // 如果全押金额大于当前下注，更新当前下注
        if (allInAmount > this.currentBet) {
            this.currentBet = allInAmount;
        }
        
        // 移至下一个玩家
        this.nextPlayer();
        
        // 检查当前回合是否结束
        if (this.isRoundComplete()) {
            this.endBettingRound();
        }
        
        return true;
    }
    
    /**
     * 玩家操作：让牌
     * @param {number} playerIndex - 玩家索引
     * @returns {boolean} - 操作是否成功
     */
    check(playerIndex) {
        if (playerIndex !== this.currentPlayerTurn) return false;
        
        const player = this.players[playerIndex];
        
        // 只有当玩家的当前下注等于当前最高下注时才能让牌
        if (player.bet !== this.currentBet) {
            return false;
        }
        
        // 移至下一个玩家
        this.nextPlayer();
        
        // 检查当前回合是否结束
        if (this.isRoundComplete()) {
            this.endBettingRound();
        }
        
        return true;
    }
    
    /**
     * 玩家操作：弃牌
     * @param {number} playerIndex - 玩家索引
     * @returns {boolean} - 操作是否成功
     */
    fold(playerIndex) {
        if (playerIndex !== this.currentPlayerTurn) return false;
        
        const player = this.players[playerIndex];
        player.folded = true;
        
        // 移至下一个玩家
        this.nextPlayer();
        
        // 检查游戏是否结束（只剩一名玩家未弃牌）
        const activePlayers = this.players.filter(p => !p.folded);
        if (activePlayers.length === 1) {
            // 游戏结束，剩余玩家获胜
            this.endGame([activePlayers[0].id]);
            return true;
        }
        
        // 检查当前回合是否结束
        if (this.isRoundComplete()) {
            this.endBettingRound();
        }
        
        return true;
    }
    
    /**
     * 移至下一个玩家
     */
    nextPlayer() {
        // 找到下一个未弃牌且未全押的玩家
        let nextPlayerIndex = (this.currentPlayerTurn + 1) % this.players.length;
        
        // 如果所有玩家都全押或弃牌，结束当前回合
        if (this.players.every(p => p.folded || p.allIn)) {
            this.endBettingRound();
            return;
        }
        
        // 找到下一个可以行动的玩家
        while (this.players[nextPlayerIndex].folded || this.players[nextPlayerIndex].allIn) {
            nextPlayerIndex = (nextPlayerIndex + 1) % this.players.length;
        }
        
        this.currentPlayerTurn = nextPlayerIndex;
    }
    
    /**
     * 检查当前下注回合是否结束
     * @returns {boolean} - 回合是否结束
     */
    isRoundComplete() {
        // 获取未弃牌的玩家
        const activePlayers = this.players.filter(p => !p.folded);
        
        // 如果只剩一个玩家，回合结束
        if (activePlayers.length <= 1) {
            return true;
        }
        
        // 检查所有未弃牌玩家是否都已经下注相同金额或全押
        const notAllInPlayers = activePlayers.filter(p => !p.allIn);
        if (notAllInPlayers.length === 0) {
            return true; // 所有人都全押了
        }
        
        const targetBet = notAllInPlayers[0].bet;
        return notAllInPlayers.every(p => p.bet === targetBet);
    }
    
    /**
     * 结束当前下注回合，进入下一阶段
     */
    endBettingRound() {
        // 根据当前游戏阶段决定下一步操作
        switch (this.gameStage) {
            case 'preflop':
                this.dealFlop();
                break;
            case 'flop':
                this.dealTurn();
                break;
            case 'turn':
                this.dealRiver();
                break;
            case 'river':
                this.showdown();
                break;
        }
    }
    
    /**
     * 发放三张公共牌（翻牌）
     */
    dealFlop() {
        // 检查是否只剩一名玩家
        const activePlayers = this.players.filter(p => !p.folded);
        if (activePlayers.length <= 1) {
            this.endGame([activePlayers[0].id]);
            return;
        }
        
        // 烧一张牌
        this.deck.pop();
        
        // 发三张公共牌
        for (let i = 0; i < 3; i++) {
            if (this.deck.length > 0) {
                this.communityCards.push(this.deck.pop());
            }
        }
        
        // 重置玩家下注
        this.resetBets();
        
        // 更新游戏阶段
        this.gameStage = 'flop';
        
        // 设置行动玩家为庄家后的第一个未弃牌玩家
        this.setFirstActivePlayer();
    }
    
    /**
     * 发放第四张公共牌（转牌）
     */
    dealTurn() {
        // 检查是否只剩一名玩家
        const activePlayers = this.players.filter(p => !p.folded);
        if (activePlayers.length <= 1) {
            this.endGame([activePlayers[0].id]);
            return;
        }
        
        // 烧一张牌
        this.deck.pop();
        
        // 发第四张公共牌
        if (this.deck.length > 0) {
            this.communityCards.push(this.deck.pop());
        }
        
        // 重置玩家下注
        this.resetBets();
        
        // 更新游戏阶段
        this.gameStage = 'turn';
        
        // 设置行动玩家为庄家后的第一个未弃牌玩家
        this.setFirstActivePlayer();
    }
    
    /**
     * 发放第五张公共牌（河牌）
     */
    dealRiver() {
        // 检查是否只剩一名玩家
        const activePlayers = this.players.filter(p => !p.folded);
        if (activePlayers.length <= 1) {
            this.endGame([activePlayers[0].id]);
            return;
        }
        
        // 烧一张牌
        this.deck.pop();
        
        // 发第五张公共牌
        if (this.deck.length > 0) {
            this.communityCards.push(this.deck.pop());
        }
        
        // 重置玩家下注
        this.resetBets();
        
        // 更新游戏阶段
        this.gameStage = 'river';
        
        // 设置行动玩家为庄家后的第一个未弃牌玩家
        this.setFirstActivePlayer();
    }
    
    /**
     * 设置第一个行动的玩家（庄家后的第一个未弃牌玩家）
     */
    setFirstActivePlayer() {
        let nextPlayer = (this.currentDealer + 1) % this.players.length;
        
        // 找到第一个未弃牌的玩家
        while (this.players[nextPlayer].folded || this.players[nextPlayer].allIn) {
            nextPlayer = (nextPlayer + 1) % this.players.length;
            
            // 如果所有玩家都全押或弃牌，直接进入下一阶段
            if (this.players.every(p => p.folded || p.allIn)) {
                this.autoCompleteBoard();
                return;
            }
        }
        
        this.currentPlayerTurn = nextPlayer;
    }
    
    /**
     * 如果所有剩余玩家都全押，自动完成发牌并进入摊牌阶段
     */
    autoCompleteBoard() {
        // 根据当前游戏阶段，完成剩余的公共牌
        switch (this.gameStage) {
            case 'preflop':
                // 烧一张牌并发三张翻牌
                this.deck.pop();
                for (let i = 0; i < 3; i++) {
                    if (this.deck.length > 0) {
                        this.communityCards.push(this.deck.pop());
                    }
                }
                // 继续转牌
                this.deck.pop();
                if (this.deck.length > 0) {
                    this.communityCards.push(this.deck.pop());
                }
                // 继续河牌
                this.deck.pop();
                if (this.deck.length > 0) {
                    this.communityCards.push(this.deck.pop());
                }
                break;
            case 'flop':
                // 烧一张牌并发转牌
                this.deck.pop();
                if (this.deck.length > 0) {
                    this.communityCards.push(this.deck.pop());
                }
                // 继续河牌
                this.deck.pop();
                if (this.deck.length > 0) {
                    this.communityCards.push(this.deck.pop());
                }
                break;
            case 'turn':
                // 烧一张牌并发河牌
                this.deck.pop();
                if (this.deck.length > 0) {
                    this.communityCards.push(this.deck.pop());
                }
                break;
        }
        
        // 进入摊牌阶段
        this.showdown();
    }
    
    /**
     * 重置玩家下注
     */
    resetBets() {
        this.players.forEach(player => {
            player.bet = 0;
        });
        this.currentBet = 0;
    }
    
    /**
     * 摊牌阶段，确定获胜者
     */
    showdown() {
        // 获取所有未弃牌的玩家
        const activePlayers = this.players.filter(p => !p.folded);
        
        if (activePlayers.length <= 1) {
            // 只有一个玩家剩余，直接获胜
            this.endGame([activePlayers[0].id]);
            return;
        }
        
        // 计算每个玩家的最佳手牌
        const playerHands = activePlayers.map(player => {
            const allCards = [...player.hand, ...this.communityCards];
            const bestHand = this.findBestHand(allCards);
            return { 
                playerId: player.id, 
                hand: bestHand.hand, 
                rank: bestHand.rank,
                value: bestHand.value
            };
        });
        
        // 按手牌强度排序
        playerHands.sort((a, b) => {
            // 先比较牌型
            if (a.rank !== b.rank) {
                return b.rank - a.rank;
            }
            
            // 牌型相同，比较牌值
            for (let i = 0; i < a.value.length; i++) {
                if (a.value[i] !== b.value[i]) {
                    return b.value[i] - a.value[i];
                }
            }
            
            // 完全相同的牌，平局
            return 0;
        });
        
        // 找出赢家（可能有多个）
        const winners = [playerHands[0].playerId];
        for (let i = 1; i < playerHands.length; i++) {
            // 检查是否与第一名牌型相同
            if (playerHands[i].rank === playerHands[0].rank) {
                // 检查牌值是否相同
                let isTie = true;
                for (let j = 0; j < playerHands[i].value.length; j++) {
                    if (playerHands[i].value[j] !== playerHands[0].value[j]) {
                        isTie = false;
                        break;
                    }
                }
                
                if (isTie) {
                    winners.push(playerHands[i].playerId);
                }
            }
        }
        
        // 结束游戏，分配奖池
        this.endGame(winners);
    }
    
    /**
     * 结束游戏，分配奖池
     * @param {Array} winnerIds - 获胜者ID列表
     */
    endGame(winnerIds) {
        // 计算每个赢家应得的奖池金额
        const winAmount = Math.floor(this.pot / winnerIds.length);
        const remainder = this.pot % winnerIds.length;
        
        // 分配奖池
        for (let i = 0; i < winnerIds.length; i++) {
            const winnerId = winnerIds[i];
            const winnerIndex = this.players.findIndex(player => player.id === winnerId);
            
            if (winnerIndex !== -1) {
                // 第一个赢家获得额外的零头
                this.players[winnerIndex].chips += winAmount + (i === 0 ? remainder : 0);
            }
        }
        
        // 重置游戏状态
        this.gameStage = 'idle';
        
        console.log('游戏结束，获胜者：', winnerIds);
        return winnerIds;
    }
    
    /**
     * 找出一组牌中的最佳手牌
     * @param {Array} cards - 所有可用的牌
     * @returns {Object} - 最佳手牌信息 { hand: [], rank: number, value: [] }
     */
    findBestHand(cards) {
        if (cards.length < 5) {
            throw new Error('需要至少5张牌');
        }
        
        // 找出所有可能的5张牌组合
        const combinations = this.getCombinations(cards, 5);
        
        // 评估每种组合的牌型
        const evaluatedHands = combinations.map(hand => {
            const evaluation = this.evaluateHand(hand);
            return { hand, ...evaluation };
        });
        
        // 按牌型强度排序
        evaluatedHands.sort((a, b) => {
            // 先比较牌型
            if (a.rank !== b.rank) {
                return b.rank - a.rank;
            }
            
            // 牌型相同，比较牌值
            for (let i = 0; i < a.value.length; i++) {
                if (a.value[i] !== b.value[i]) {
                    return b.value[i] - a.value[i];
                }
            }
            
            return 0;
        });
        
        // 返回最强的手牌
        return evaluatedHands[0];
    }
    
    /**
     * 获取数组的所有组合
     * @param {Array} arr - 原始数组
     * @param {number} k - 组合长度
     * @returns {Array} - 所有可能的组合
     */
    getCombinations(arr, k) {
        const result = [];
        
        // 组合生成函数
        function backtrack(start, current) {
            if (current.length === k) {
                result.push([...current]);
                return;
            }
            
            for (let i = start; i < arr.length; i++) {
                current.push(arr[i]);
                backtrack(i + 1, current);
                current.pop();
            }
        }
        
        backtrack(0, []);
        return result;
    }
    
    /**
     * 评估一手牌的类型和大小
     * @param {Array} hand - 5张牌的数组
     * @returns {Object} - 评估结果 { rank: number, value: [] }
     */
    evaluateHand(hand) {
        if (hand.length !== 5) {
            throw new Error('必须是5张牌');
        }
        
        // 提取花色和点数
        const suits = hand.map(card => card.charAt(1));
        const values = hand.map(card => card.charAt(0))
            .map(val => {
                if (val === 'T') return 10;
                if (val === 'J') return 11;
                if (val === 'Q') return 12;
                if (val === 'K') return 13;
                if (val === 'A') return 14;
                return parseInt(val);
            })
            .sort((a, b) => b - a); // 从大到小排序
        
        // 检查是否同花
        const isFlush = suits.every(suit => suit === suits[0]);
        
        // 检查是否顺子
        let isStraight = true;
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] !== values[i] + 1) {
                isStraight = false;
                break;
            }
        }
        
        // 特殊情况：A2345顺子
        if (!isStraight && values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
            isStraight = true;
            // 调整A的值为1，使其成为最小的牌
            values.shift();
            values.push(1);
        }
        
        // 统计点数出现的次数
        const valueCounts = {};
        for (const val of values) {
            valueCounts[val] = (valueCounts[val] || 0) + 1;
        }
        
        // 按出现次数和点数大小排序
        const countEntries = Object.entries(valueCounts)
            .map(([val, count]) => [parseInt(val), count])
            .sort((a, b) => {
                if (a[1] !== b[1]) return b[1] - a[1]; // 先按次数降序
                return b[0] - a[0]; // 再按点数降序
            });
        
        // 重新构建按组合优先级排序的点数数组
        const valuesByCounts = countEntries.flatMap(([val, count]) => Array(count).fill(val));
        
        // 判断牌型
        // 1. 皇家同花顺
        if (isFlush && isStraight && values[0] === 14 && values[1] === 13) {
            return { rank: 9, value: values }; // 皇家同花顺
        }
        
        // 2. 同花顺
        if (isFlush && isStraight) {
            return { rank: 8, value: values }; // 同花顺
        }
        
        // 3. 四条
        if (countEntries[0][1] === 4) {
            return { rank: 7, value: valuesByCounts }; // 四条
        }
        
        // 4. 葫芦（三条+一对）
        if (countEntries[0][1] === 3 && countEntries[1][1] === 2) {
            return { rank: 6, value: valuesByCounts }; // 葫芦
        }
        
        // 5. 同花
        if (isFlush) {
            return { rank: 5, value: values }; // 同花
        }
        
        // 6. 顺子
        if (isStraight) {
            return { rank: 4, value: values }; // 顺子
        }
        
        // 7. 三条
        if (countEntries[0][1] === 3) {
            return { rank: 3, value: valuesByCounts }; // 三条
        }
        
        // 8. 两对
        if (countEntries[0][1] === 2 && countEntries[1][1] === 2) {
            return { rank: 2, value: valuesByCounts }; // 两对
        }
        
        // 9. 一对
        if (countEntries[0][1] === 2) {
            return { rank: 1, value: valuesByCounts }; // 一对
        }
        
        // 10. 高牌
        return { rank: 0, value: values }; // 高牌
    }
    
    /**
     * 计算胜率
     * @param {Array} holeCards - 玩家底牌
     * @param {Array} communityCards - 已知的公共牌
     * @param {number} numOpponents - 对手数量
     * @param {number} numSimulations - 模拟次数
     * @returns {number} - 胜率（0-1之间的小数）
     */
    calculateEquity(holeCards, communityCards = [], numOpponents = 1, numSimulations = 1000) {
        let wins = 0;
        
        for (let i = 0; i < numSimulations; i++) {
            // 创建一副新牌
            const deck = [];
            for (const suit of this.suits) {
                for (const value of this.values) {
                    const card = value + suit;
                    // 排除已知的牌
                    if (!holeCards.includes(card) && !communityCards.includes(card)) {
                        deck.push(card);
                    }
                }
            }
            
            // 洗牌
            for (let j = deck.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [deck[j], deck[k]] = [deck[k], deck[j]];
            }
            
            // 模拟对手的底牌
            const opponentHoleCards = [];
            for (let j = 0; j < numOpponents; j++) {
                opponentHoleCards.push([deck.pop(), deck.pop()]);
            }
            
            // 模拟剩余的公共牌
            const remainingCommunityCards = [];
            for (let j = communityCards.length; j < 5; j++) {
                remainingCommunityCards.push(deck.pop());
            }
            
            // 所有公共牌
            const allCommunityCards = [...communityCards, ...remainingCommunityCards];
            
            // 评估玩家的最佳手牌
            const playerCards = [...holeCards, ...allCommunityCards];
            const playerBestHand = this.findBestHand(playerCards);
            
            // 评估对手的最佳手牌
            let playerWins = true;
            for (const opponentHole of opponentHoleCards) {
                const opponentCards = [...opponentHole, ...allCommunityCards];
                const opponentBestHand = this.findBestHand(opponentCards);
                
                // 比较手牌大小
                if (opponentBestHand.rank > playerBestHand.rank) {
                    playerWins = false;
                    break;
                } else if (opponentBestHand.rank === playerBestHand.rank) {
                    // 相同牌型，比较牌值
                    for (let k = 0; k < opponentBestHand.value.length; k++) {
                        if (opponentBestHand.value[k] > playerBestHand.value[k]) {
                            playerWins = false;
                            break;
                        } else if (opponentBestHand.value[k] < playerBestHand.value[k]) {
                            break; // 玩家赢
                        }
                    }
                    
                    if (!playerWins) break;
                }
            }
            
            if (playerWins) wins++;
        }
        
        return wins / numSimulations;
    }
    
    /**
     * 获取手牌的文本描述
     * @param {Object} handEvaluation - 手牌评估结果
     * @returns {string} - 手牌描述
     */
    getHandDescription(handEvaluation) {
        const { rank, value } = handEvaluation;
        
        // 转换数字为牌面
        const valueToString = (val) => {
            if (val === 14 || val === 1) return 'A';
            if (val === 13) return 'K';
            if (val === 12) return 'Q';
            if (val === 11) return 'J';
            if (val === 10) return 'T';
            return val.toString();
        };
        
        switch (rank) {
            case 9:
                return '皇家同花顺';
            case 8:
                return `同花顺，${valueToString(value[0])}高`;
            case 7:
                return `四条${valueToString(value[0])}`;
            case 6:
                return `葫芦，${valueToString(value[0])}上${valueToString(value[3])}`;
            case 5:
                return `同花，${valueToString(value[0])}高`;
            case 4:
                return `顺子，${valueToString(value[0])}高`;
            case 3:
                return `三条${valueToString(value[0])}`;
            case 2:
                return `两对，${valueToString(value[0])}和${valueToString(value[2])}`;
            case 1:
                return `一对${valueToString(value[0])}`;
            case 0:
                return `高牌${valueToString(value[0])}`;
            default:
                return '未知牌型';
        }
    }
}

// 创建全局扑克实例
window.pokerEngine = new Poker(); 
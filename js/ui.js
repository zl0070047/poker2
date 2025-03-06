/**
 * 德州扑克 - UI脚本
 * 处理用户界面交互和UI组件
 */

class PokerUI {
    constructor(app) {
        this.app = app;
        this.toastQueue = [];
        this.isShowingToast = false;
        
        // 初始化波纹效果
        this.initRippleEffect();
        
        // 创建提示框元素
        this.createToastElement();
    }
    
    /**
     * 初始化按钮点击波纹效果
     */
    initRippleEffect() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // 判断是否是按钮
            if (target.tagName === 'BUTTON' || target.classList.contains('btn-primary') || 
                target.classList.contains('btn-secondary') || target.classList.contains('btn-small')) {
                
                // 已禁用的按钮不显示波纹
                if (target.classList.contains('disabled') || target.disabled) {
                    return;
                }
                
                // 创建波纹元素
                const ripple = document.createElement('span');
                ripple.className = 'ripple';
                target.appendChild(ripple);
                
                // 设置波纹位置和大小
                const rect = target.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                
                ripple.style.width = ripple.style.height = `${size}px`;
                ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
                ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
                
                // 动画结束后移除波纹元素
                ripple.addEventListener('animationend', () => {
                    ripple.remove();
                });
            }
        });
    }
    
    /**
     * 创建提示框元素
     */
    createToastElement() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.className = 'toast-container';
        document.body.appendChild(this.toastContainer);
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
            }
            
            .toast {
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 8px;
                margin-top: 10px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.3s, transform 0.3s;
            }
            
            .toast.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * 显示提示框
     * @param {string} message - 提示消息
     * @param {number} duration - 显示时长，默认2000ms
     */
    showToast(message, duration = 2000) {
        // 将消息添加到队列
        this.toastQueue.push({ message, duration });
        
        // 如果当前没有显示中的提示，则显示队列中的第一个
        if (!this.isShowingToast) {
            this.processToastQueue();
        }
    }
    
    /**
     * 处理提示框队列
     */
    processToastQueue() {
        if (this.toastQueue.length === 0) {
            this.isShowingToast = false;
            return;
        }
        
        this.isShowingToast = true;
        const { message, duration } = this.toastQueue.shift();
        
        // 创建提示元素
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        this.toastContainer.appendChild(toast);
        
        // 触发重排，确保过渡效果生效
        void toast.offsetWidth;
        
        // 显示提示
        toast.classList.add('show');
        
        // 设置定时器，在指定时间后隐藏并移除提示
        setTimeout(() => {
            toast.classList.remove('show');
            
            // 监听过渡结束事件，移除元素并处理下一个提示
            toast.addEventListener('transitionend', () => {
                toast.remove();
                this.processToastQueue();
            }, { once: true });
            
            // 如果过渡事件没触发，确保在一定时间后移除元素
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                    this.processToastQueue();
                }
            }, 300);
        }, duration);
    }
    
    /**
     * 显示加载动画
     */
    showLoading() {
        document.getElementById('loading-overlay').classList.add('active');
    }
    
    /**
     * 隐藏加载动画
     */
    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('active');
    }
    
    /**
     * 创建教程内容
     * @param {string} targetId - 目标容器ID
     */
    createTutorialContent(targetId) {
        const container = document.getElementById(targetId);
        if (!container) return;
        
        // 添加教程内容
        // 游戏流程
        if (targetId === 'tutorial-gameplay') {
            container.innerHTML = `
                <h3>游戏流程</h3>
                <p>德州扑克的一局游戏分为以下几个阶段：</p>
                
                <h4>1. 发两张底牌</h4>
                <p>每位玩家获得两张只有自己可见的底牌。</p>
                
                <h4>2. 第一轮下注 (Pre-Flop)</h4>
                <p>小盲注和大盲注强制下注，之后其他玩家可以选择跟注、加注或弃牌。</p>
                
                <h4>3. 发三张公共牌 (Flop)</h4>
                <p>发三张公共牌，所有玩家可见。</p>
                
                <h4>4. 第二轮下注</h4>
                <p>玩家可以选择下注、跟注、加注、让牌或弃牌。</p>
                
                <h4>5. 发第四张公共牌 (Turn)</h4>
                <p>发第四张公共牌，所有玩家可见。</p>
                
                <h4>6. 第三轮下注</h4>
                <p>同样可以选择下注、跟注、加注、让牌或弃牌。</p>
                
                <h4>7. 发第五张公共牌 (River)</h4>
                <p>发第五张也是最后一张公共牌。</p>
                
                <h4>8. 最后一轮下注</h4>
                <p>最后一轮下注。</p>
                
                <h4>9. 亮牌</h4>
                <p>剩余的玩家亮出底牌，由系统自动判定获胜者。</p>
                
                <div class="tutorial-image">
                    <img src="assets/images/tutorial-gameplay.svg" alt="德州扑克游戏流程图解">
                </div>
            `;
        }
        
        // 牌型大小
        if (targetId === 'tutorial-hands') {
            container.innerHTML = `
                <h3>牌型大小（从大到小）</h3>
                
                <h4>1. 皇家同花顺 (Royal Flush)</h4>
                <p>同花色的10、J、Q、K、A。</p>
                
                <h4>2. 同花顺 (Straight Flush)</h4>
                <p>同花色的连续五张牌。</p>
                
                <h4>3. 四条 (Four of a Kind)</h4>
                <p>四张相同点数的牌。</p>
                
                <h4>4. 葫芦 (Full House)</h4>
                <p>三张相同点数的牌加一对。</p>
                
                <h4>5. 同花 (Flush)</h4>
                <p>五张同花色的牌。</p>
                
                <h4>6. 顺子 (Straight)</h4>
                <p>五张连续点数的牌。</p>
                
                <h4>7. 三条 (Three of a Kind)</h4>
                <p>三张相同点数的牌。</p>
                
                <h4>8. 两对 (Two Pairs)</h4>
                <p>两个对子。</p>
                
                <h4>9. 一对 (One Pair)</h4>
                <p>一个对子。</p>
                
                <h4>10. 高牌 (High Card)</h4>
                <p>不符合以上任何牌型，以最高点数的牌比较大小。</p>
                
                <div class="tutorial-image">
                    <img src="assets/images/tutorial-hands.svg" alt="德州扑克牌型大小图解">
                </div>
            `;
        }
        
        // 术语解释
        if (targetId === 'tutorial-terms') {
            container.innerHTML = `
                <h3>德州扑克术语</h3>
                
                <h4>底牌 (Hole Cards)</h4>
                <p>每位玩家私有的两张牌，只有自己可见。</p>
                
                <h4>公共牌 (Community Cards)</h4>
                <p>桌面上所有玩家共享的五张牌。</p>
                
                <h4>翻牌 (Flop)</h4>
                <p>发出的前三张公共牌。</p>
                
                <h4>转牌 (Turn)</h4>
                <p>发出的第四张公共牌。</p>
                
                <h4>河牌 (River)</h4>
                <p>发出的第五张公共牌。</p>
                
                <h4>盲注 (Blinds)</h4>
                <p>强制下注，分为小盲(Small Blind)和大盲(Big Blind)。</p>
                
                <h4>跟注 (Call)</h4>
                <p>跟随前面玩家的下注金额。</p>
                
                <h4>加注 (Raise)</h4>
                <p>下注比前面玩家更多的筹码。</p>
                
                <h4>让牌 (Check)</h4>
                <p>不下注但保留继续游戏的权利，仅当没有人下注时可用。</p>
                
                <h4>弃牌 (Fold)</h4>
                <p>放弃当前手牌，退出本轮游戏。</p>
                
                <h4>All-In (全押)</h4>
                <p>将所有筹码押上。</p>
                
                <h4>底池 (Pot)</h4>
                <p>所有玩家下注的筹码总和。</p>
            `;
        }
    }
    
    /**
     * 创建玩家头像
     * @param {string} avatarId - 头像ID
     * @returns {HTMLElement} - 头像元素
     */
    createPlayerAvatar(avatarId) {
        const avatarUrl = this.app.getAvatarUrl(avatarId);
        
        const avatar = document.createElement('div');
        avatar.className = 'game-player-avatar';
        
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = '玩家头像';
        
        avatar.appendChild(img);
        
        return avatar;
    }
    
    /**
     * 创建扑克牌元素
     * @param {string} card - 牌面值，例如 'AS'（黑桃A）
     * @param {boolean} faceDown - 是否背面朝上
     * @returns {HTMLElement} - 牌元素
     */
    createCardElement(card, faceDown = false) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        
        if (faceDown) {
            cardElement.classList.add('face-down');
            cardElement.innerHTML = `
                <div class="card-back">
                    <div class="card-pattern"></div>
                </div>
            `;
        } else {
            const suit = card.charAt(1);
            const value = card.charAt(0);
            
            let suitClass = '';
            let suitSymbol = '';
            
            switch (suit) {
                case 'S': // 黑桃
                    suitClass = 'spade';
                    suitSymbol = '♠';
                    break;
                case 'H': // 红心
                    suitClass = 'heart';
                    suitSymbol = '♥';
                    break;
                case 'C': // 梅花
                    suitClass = 'club';
                    suitSymbol = '♣';
                    break;
                case 'D': // 方块
                    suitClass = 'diamond';
                    suitSymbol = '♦';
                    break;
            }
            
            let valueDisplay = value;
            if (value === 'T') valueDisplay = '10';
            if (value === 'J') valueDisplay = 'J';
            if (value === 'Q') valueDisplay = 'Q';
            if (value === 'K') valueDisplay = 'K';
            if (value === 'A') valueDisplay = 'A';
            
            cardElement.classList.add(suitClass);
            cardElement.innerHTML = `
                <div class="card-corner top-left">
                    <div class="card-value">${valueDisplay}</div>
                    <div class="card-suit">${suitSymbol}</div>
                </div>
                <div class="card-center">
                    <div class="card-suit-large">${suitSymbol}</div>
                </div>
                <div class="card-corner bottom-right">
                    <div class="card-value">${valueDisplay}</div>
                    <div class="card-suit">${suitSymbol}</div>
                </div>
            `;
        }
        
        return cardElement;
    }
    
    /**
     * 创建筹码元素
     * @param {number} amount - 筹码金额
     * @param {string} color - 筹码颜色，可选 'red', 'blue', 'green', 'black', 'gold'
     * @returns {HTMLElement} - 筹码元素
     */
    createChipElement(amount, color = 'blue') {
        const chip = document.createElement('div');
        chip.className = `chip chip-${color}`;
        chip.setAttribute('data-amount', amount);
        
        // 筹码内部图案
        chip.innerHTML = `
            <div class="chip-inner">
                <span class="chip-amount">${amount}</span>
            </div>
        `;
        
        return chip;
    }
    
    /**
     * 创建筹码堆
     * @param {number} amount - 筹码总金额
     * @returns {HTMLElement} - 筹码堆元素
     */
    createChipStack(amount) {
        const chipStack = document.createElement('div');
        chipStack.className = 'chip-stack';
        
        // 根据金额创建不同面值和颜色的筹码
        let remainingAmount = amount;
        
        // 金色筹码 (1000)
        if (remainingAmount >= 1000) {
            const count = Math.floor(remainingAmount / 1000);
            for (let i = 0; i < Math.min(count, 5); i++) {
                const chip = this.createChipElement(i === 0 ? 1000 * Math.min(count, 5) : '', 'gold');
                chip.style.transform = `translateY(${-2 * i}px)`;
                chipStack.appendChild(chip);
            }
            remainingAmount %= 1000;
        }
        
        // 黑色筹码 (100)
        if (remainingAmount >= 100) {
            const count = Math.floor(remainingAmount / 100);
            for (let i = 0; i < Math.min(count, 5); i++) {
                const chip = this.createChipElement(i === 0 ? 100 * Math.min(count, 5) : '', 'black');
                chip.style.transform = `translateY(${-2 * i - (chipStack.children.length > 0 ? 4 : 0)}px)`;
                chipStack.appendChild(chip);
            }
            remainingAmount %= 100;
        }
        
        // 绿色筹码 (25)
        if (remainingAmount >= 25) {
            const count = Math.floor(remainingAmount / 25);
            for (let i = 0; i < Math.min(count, 4); i++) {
                const chip = this.createChipElement(i === 0 ? 25 * Math.min(count, 4) : '', 'green');
                chip.style.transform = `translateY(${-2 * i - (chipStack.children.length > 0 ? 4 : 0)}px)`;
                chipStack.appendChild(chip);
            }
            remainingAmount %= 25;
        }
        
        // 蓝色筹码 (10)
        if (remainingAmount >= 10) {
            const count = Math.floor(remainingAmount / 10);
            for (let i = 0; i < Math.min(count, 5); i++) {
                const chip = this.createChipElement(i === 0 ? 10 * Math.min(count, 5) : '', 'blue');
                chip.style.transform = `translateY(${-2 * i - (chipStack.children.length > 0 ? 4 : 0)}px)`;
                chipStack.appendChild(chip);
            }
            remainingAmount %= 10;
        }
        
        // 红色筹码 (5)
        if (remainingAmount >= 5) {
            const count = Math.floor(remainingAmount / 5);
            for (let i = 0; i < count; i++) {
                const chip = this.createChipElement(i === 0 ? 5 * count : '', 'red');
                chip.style.transform = `translateY(${-2 * i - (chipStack.children.length > 0 ? 4 : 0)}px)`;
                chipStack.appendChild(chip);
            }
            remainingAmount %= 5;
        }
        
        // 白色筹码 (1)
        if (remainingAmount > 0) {
            for (let i = 0; i < remainingAmount; i++) {
                const chip = this.createChipElement(i === 0 ? remainingAmount : '', 'white');
                chip.style.transform = `translateY(${-2 * i - (chipStack.children.length > 0 ? 4 : 0)}px)`;
                chipStack.appendChild(chip);
            }
        }
        
        // 如果没有筹码（金额为0），添加一个空指示器
        if (chipStack.children.length === 0) {
            const zeroChip = document.createElement('div');
            zeroChip.className = 'zero-chip';
            zeroChip.textContent = '0';
            chipStack.appendChild(zeroChip);
        }
        
        // 添加筹码总额标签
        const amountLabel = document.createElement('div');
        amountLabel.className = 'chip-amount-label';
        amountLabel.textContent = amount;
        chipStack.appendChild(amountLabel);
        
        return chipStack;
    }
    
    /**
     * 创建计时器
     * @param {number} duration - 时长（秒）
     * @param {Function} onTimeout - 超时回调
     * @returns {Object} - 计时器对象和元素
     */
    createTimer(duration, onTimeout) {
        const timerElement = document.createElement('div');
        timerElement.className = 'game-timer';
        
        const circleElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        circleElement.setAttribute('width', '40');
        circleElement.setAttribute('height', '40');
        circleElement.setAttribute('viewBox', '0 0 100 100');
        
        const circleBackground = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circleBackground.setAttribute('cx', '50');
        circleBackground.setAttribute('cy', '50');
        circleBackground.setAttribute('r', '45');
        circleBackground.setAttribute('fill', 'none');
        circleBackground.setAttribute('stroke', 'rgba(255, 255, 255, 0.2)');
        circleBackground.setAttribute('stroke-width', '10');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '50');
        circle.setAttribute('cy', '50');
        circle.setAttribute('r', '45');
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', '#007aff');
        circle.setAttribute('stroke-width', '10');
        circle.setAttribute('stroke-dasharray', '283');
        circle.setAttribute('stroke-dashoffset', '0');
        circle.setAttribute('transform', 'rotate(-90 50 50)');
        circle.classList.add('countdown-circle');
        
        const timeText = document.createElement('div');
        timeText.className = 'timer-text';
        timeText.textContent = duration;
        
        circleElement.appendChild(circleBackground);
        circleElement.appendChild(circle);
        timerElement.appendChild(circleElement);
        timerElement.appendChild(timeText);
        
        let timeLeft = duration;
        let timerId = null;
        
        // 设置倒计时动画
        circle.style.animationDuration = `${duration}s`;
        
        const startTimer = () => {
            if (timerId !== null) {
                clearInterval(timerId);
            }
            
            timeLeft = duration;
            timeText.textContent = timeLeft;
            
            // 重置并开始动画
            circle.style.animation = 'none';
            void circle.offsetWidth; // 触发重绘
            circle.style.animation = `countdown ${duration}s linear forwards`;
            
            // 开始倒计时
            timerId = setInterval(() => {
                timeLeft--;
                timeText.textContent = timeLeft;
                
                // 修改颜色根据剩余时间
                if (timeLeft <= 5) {
                    circle.setAttribute('stroke', timeLeft <= 3 ? '#ff3b30' : '#ff9500');
                    if (timeLeft <= 3) {
                        timeText.classList.add('blink');
                    }
                }
                
                if (timeLeft <= 0) {
                    stopTimer();
                    if (typeof onTimeout === 'function') {
                        onTimeout();
                    }
                }
            }, 1000);
        };
        
        const stopTimer = () => {
            if (timerId !== null) {
                clearInterval(timerId);
                timerId = null;
            }
            timeText.classList.remove('blink');
        };
        
        const resetTimer = () => {
            stopTimer();
            circle.style.animation = 'none';
            circle.setAttribute('stroke', '#007aff');
            timeText.textContent = duration;
            timeText.classList.remove('blink');
        };
        
        return {
            element: timerElement,
            start: startTimer,
            stop: stopTimer,
            reset: resetTimer
        };
    }
    
    /**
     * 创建聊天气泡
     * @param {string} message - 聊天消息
     * @param {string} sender - 发送者名称
     * @returns {HTMLElement} - 聊天气泡元素
     */
    createChatBubble(message, sender) {
        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble pop-in';
        
        bubble.innerHTML = `
            <div class="chat-sender">${sender}</div>
            <div class="chat-message">${message}</div>
        `;
        
        // 设置自动消失
        setTimeout(() => {
            bubble.classList.add('fade-out');
            bubble.addEventListener('animationend', () => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
            });
        }, 5000);
        
        return bubble;
    }
    
    /**
     * 创建表情元素
     * @param {string} emoji - 表情符号
     * @returns {HTMLElement} - 表情元素
     */
    createEmoji(emoji) {
        const emojiElement = document.createElement('div');
        emojiElement.className = 'emoji emoji-bounce';
        emojiElement.textContent = emoji;
        
        // 设置自动消失
        setTimeout(() => {
            emojiElement.classList.add('fade-out');
            emojiElement.addEventListener('animationend', () => {
                if (emojiElement.parentNode) {
                    emojiElement.parentNode.removeChild(emojiElement);
                }
            });
        }, 3000);
        
        return emojiElement;
    }
}

// 初始化教程内容
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保PokerUI实例已创建
    setTimeout(() => {
        if (window.pokerApp && window.pokerApp.ui) {
            window.pokerApp.ui.createTutorialContent('tutorial-gameplay');
            window.pokerApp.ui.createTutorialContent('tutorial-hands');
            window.pokerApp.ui.createTutorialContent('tutorial-terms');
        }
    }, 100);
}); 
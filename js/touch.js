// 移动端触摸支持
class TouchHandler {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTap = 0;
        this.initializeTouchEvents();
    }

    // 初始化触摸事件
    initializeTouchEvents() {
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), false);
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
        document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
    }

    // 处理触摸开始事件
    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;

        // 检测双击
        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTap;
        
        if (tapLength < 500 && tapLength > 0) {
            event.preventDefault();
            this.handleDoubleTap(event);
        }
        
        this.lastTap = currentTime;
    }

    // 处理触摸移动事件
    handleTouchMove(event) {
        if (!this.touchStartX || !this.touchStartY) {
            return;
        }

        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;

        const deltaX = touchEndX - this.touchStartX;
        const deltaY = touchEndY - this.touchStartY;

        // 检测滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0) {
                this.handleSwipeRight(event);
            } else {
                this.handleSwipeLeft(event);
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                this.handleSwipeDown(event);
            } else {
                this.handleSwipeUp(event);
            }
        }
    }

    // 处理触摸结束事件
    handleTouchEnd(event) {
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    // 处理双击事件
    handleDoubleTap(event) {
        const target = event.target;
        
        // 检查是否双击了牌
        if (target.classList.contains('card')) {
            // 触发查看牌的动作
            this.triggerCardView(target);
        }
        
        // 检查是否双击了筹码区域
        if (target.classList.contains('chips-area')) {
            // 触发加注动作
            this.triggerBetAction(target);
        }
    }

    // 处理向左滑动
    handleSwipeLeft(event) {
        // 实现向左滑动的逻辑
        // 例如：切换到上一个操作选项
        const gameActions = document.querySelector('.game-actions');
        if (gameActions) {
            gameActions.dispatchEvent(new CustomEvent('swipeLeft'));
        }
    }

    // 处理向右滑动
    handleSwipeRight(event) {
        // 实现向右滑动的逻辑
        // 例如：切换到下一个操作选项
        const gameActions = document.querySelector('.game-actions');
        if (gameActions) {
            gameActions.dispatchEvent(new CustomEvent('swipeRight'));
        }
    }

    // 处理向上滑动
    handleSwipeUp(event) {
        // 实现向上滑动的逻辑
        // 例如：增加下注金额
        const betInput = document.querySelector('.bet-input');
        if (betInput) {
            const currentBet = parseInt(betInput.value) || 0;
            betInput.value = currentBet + 100;
            betInput.dispatchEvent(new Event('change'));
        }
    }

    // 处理向下滑动
    handleSwipeDown(event) {
        // 实现向下滑动的逻辑
        // 例如：减少下注金额
        const betInput = document.querySelector('.bet-input');
        if (betInput) {
            const currentBet = parseInt(betInput.value) || 0;
            betInput.value = Math.max(0, currentBet - 100);
            betInput.dispatchEvent(new Event('change'));
        }
    }

    // 触发查看牌的动作
    triggerCardView(cardElement) {
        // 放大显示卡牌
        const cardRect = cardElement.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.className = 'card-overlay';
        
        const enlargedCard = cardElement.cloneNode(true);
        enlargedCard.style.transform = 'scale(2)';
        overlay.appendChild(enlargedCard);
        
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', () => {
            overlay.remove();
        });
    }

    // 触发下注动作
    triggerBetAction(chipsElement) {
        // 显示快速下注选项
        const betOptions = document.createElement('div');
        betOptions.className = 'quick-bet-options';
        
        const options = [100, 500, 1000, 5000];
        options.forEach(amount => {
            const option = document.createElement('button');
            option.textContent = amount;
            option.onclick = () => {
                const betInput = document.querySelector('.bet-input');
                if (betInput) {
                    betInput.value = amount;
                    betInput.dispatchEvent(new Event('change'));
                }
                betOptions.remove();
            };
            betOptions.appendChild(option);
        });
        
        document.body.appendChild(betOptions);
        
        // 点击其他区域关闭
        const closeHandler = (e) => {
            if (!betOptions.contains(e.target)) {
                betOptions.remove();
                document.removeEventListener('click', closeHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeHandler);
        }, 0);
    }
}

// 导出触摸处理器
export const touchHandler = new TouchHandler(); 
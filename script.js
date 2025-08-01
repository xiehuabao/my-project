// 声明DOM元素变量
let canvas, ctx, scoreElement, finalScoreElement, levelElement;
let startBtn, restartBtn, gameOverElement, playAgainBtn;
let helpBtn, helpModal, closeBtn;

// 在DOMContentLoaded事件中初始化所有DOM元素
document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    scoreElement = document.getElementById('score');
    finalScoreElement = document.getElementById('final-score');
    startBtn = document.getElementById('start-btn');
    restartBtn = document.getElementById('restart-btn');
    gameOverElement = document.getElementById('game-over');
    playAgainBtn = document.getElementById('play-again-btn');
    helpBtn = document.getElementById('help-btn');
    helpModal = document.getElementById('help-modal');
    closeBtn = document.querySelector('.close-btn');
    
    // 创建级别显示元素
    const levelDisplay = document.createElement('div');
    levelDisplay.className = 'level-display';
    levelDisplay.innerHTML = '<span>级别: </span><span id="level">1</span>';
    document.querySelector('.score-container').after(levelDisplay);
    levelElement = document.getElementById('level');
    
    // 初始化游戏配置
    tileCount = canvas.width / gridSize;
    
    // 设置事件监听器
    setupEventListeners();
    
    // 初始化游戏
    initGame();
    
    // 绘制初始状态
    clearCanvas();
    drawFood();
    drawSnake();
    console.log('初始化完成，蛇位置:', snake, '食物位置:', foodX, foodY);
});

// 级别显示元素将在DOMContentLoaded事件中创建

// 游戏配置
let gridSize = 20;
let tileCount;
let speed = 7;

// 游戏状态
let gameRunning = false;
let score = 0;
let level = 1;
let foodValue = 10; // 食物基础分值
let specialFood = false; // 是否是特殊食物
let obstacleCount = 0; // 障碍物数量
let obstacles = []; // 障碍物位置数组

// 蛇的初始位置和速度
let snake = [
    { x: 10, y: 10 }
];
let velocityX = 0;
let velocityY = 0;

// 食物位置
let foodX;
let foodY;

// 上一次按键方向
let lastDirection = '';

// 初始化游戏
function initGame() {
    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    level = 1;
    foodValue = 10;
    specialFood = false;
    obstacleCount = 0;
    obstacles = [];
    scoreElement.textContent = score;
    if (levelElement) {
        levelElement.textContent = level;
    }
    lastDirection = '';
    placeFood();
    gameOverElement.classList.add('hidden');
}

// 随机放置食物
function placeFood() {
    // 生成随机位置
    foodX = Math.floor(Math.random() * tileCount);
    foodY = Math.floor(Math.random() * tileCount);

    // 确保食物不会出现在蛇身上或障碍物上
    let invalidPosition = false;
    
    // 检查蛇身
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            invalidPosition = true;
            break;
        }
    }
    
    // 检查障碍物
    for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i].x === foodX && obstacles[i].y === foodY) {
            invalidPosition = true;
            break;
        }
    }
    
    if (invalidPosition) {
        placeFood(); // 如果位置无效，重新放置
        return;
    }
    
    // 有10%的几率生成特殊食物（分值翻倍）
    specialFood = Math.random() < 0.1;
}

// 游戏主循环
function gameLoop() {
    if (!gameRunning) return;

    setTimeout(function() {
        clearCanvas();
        moveSnake();
        checkCollision();
        drawObstacles();
        drawFood();
        drawSnake();
        
        console.log('游戏循环中，蛇位置:', snake, '食物位置:', foodX, foodY);
        requestAnimationFrame(gameLoop);
    }, 1000 / speed);
}

// 清空画布
function clearCanvas() {
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 移动蛇
function moveSnake() {
    // 创建新的头部
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    snake.unshift(head); // 添加到蛇的前面

    // 检查是否吃到食物
    if (head.x === foodX && head.y === foodY) {
        // 特殊食物分值翻倍
        const points = specialFood ? foodValue * 2 : foodValue;
        score += points;
        scoreElement.textContent = score;
        
        // 检查是否升级
        checkLevelUp();
        
        // 放置新食物
        placeFood();
        
        // 根据级别可能添加障碍物
        if (level > 1 && Math.random() < 0.2) {
            addObstacle();
        }
    } else {
        snake.pop(); // 如果没有吃到食物，移除尾部
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];

    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // 检查障碍物碰撞
    for (let i = 0; i < obstacles.length; i++) {
        if (head.x === obstacles[i].x && head.y === obstacles[i].y) {
            gameOver();
            return;
        }
    }
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

// 绘制食物
function drawFood() {
    // 特殊食物为金色，普通食物为红色
    ctx.fillStyle = specialFood ? 'gold' : 'red';
    ctx.fillRect(foodX * gridSize, foodY * gridSize, gridSize, gridSize);
    
    // 为特殊食物添加闪烁效果
    if (specialFood) {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 2;
        ctx.strokeRect(foodX * gridSize + 2, foodY * gridSize + 2, gridSize - 4, gridSize - 4);
    }
}

// 绘制蛇
function drawSnake() {
    // 绘制蛇身
    ctx.fillStyle = 'green';
    for (let i = 0; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }

    // 绘制蛇头
    ctx.fillStyle = 'darkgreen';
    ctx.fillRect(snake[0].x * gridSize, snake[0].y * gridSize, gridSize, gridSize);

    // 绘制蛇身边框
    ctx.strokeStyle = 'black';
    for (let i = 0; i < snake.length; i++) {
        ctx.strokeRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
}

// 开始游戏
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gameLoop();
    }
}

// 重新开始游戏
function restartGame() {
    gameRunning = false;
    initGame();
}

// 键盘控制已移至setupEventListeners函数中

// 设置所有事件监听器
function setupEventListeners() {
    // 按钮事件监听
    startBtn.addEventListener('click', function() {
        if (!gameRunning) {
            startGame();
        }
    });

    restartBtn.addEventListener('click', restartGame);
    
    playAgainBtn.addEventListener('click', function() {
        restartGame();
        startGame();
    });

    // 帮助按钮事件
    helpBtn.addEventListener('click', function() {
        helpModal.classList.remove('hidden');
        // 暂停游戏
        if (gameRunning) {
            gameRunning = false;
        }
    });
    
    // 关闭帮助模态框 - X按钮
    closeBtn.addEventListener('click', function() {
        helpModal.classList.add('hidden');
    });
    
    // 关闭帮助模态框 - 关闭按钮
    document.getElementById('close-modal-btn').addEventListener('click', function() {
        helpModal.classList.add('hidden');
    });
    
    // 点击模态框外部关闭
    helpModal.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.classList.add('hidden');
        }
    });
    
    // 按ESC键关闭模态框
    document.addEventListener('keydown', function(event) {
        // 关闭模态框
        if (event.key === 'Escape' && !helpModal.classList.contains('hidden')) {
            helpModal.classList.add('hidden');
            return;
        }
        
        // 游戏控制
        if (!gameRunning && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
                            event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
            startGame();
        }

        // 防止蛇反向移动
        switch (event.key) {
            case 'ArrowUp':
                if (lastDirection !== 'down') {
                    velocityX = 0;
                    velocityY = -1;
                    lastDirection = 'up';
                }
                break;
            case 'ArrowDown':
                if (lastDirection !== 'up') {
                    velocityX = 0;
                    velocityY = 1;
                    lastDirection = 'down';
                }
                break;
            case 'ArrowLeft':
                if (lastDirection !== 'right') {
                    velocityX = -1;
                    velocityY = 0;
                    lastDirection = 'left';
                }
                break;
            case 'ArrowRight':
                if (lastDirection !== 'left') {
                    velocityX = 1;
                    velocityY = 0;
                    lastDirection = 'right';
                }
                break;
        }
    });
}

// 初始化游戏已移至DOMContentLoaded事件中

// 添加新函数

// 检查级别提升
function checkLevelUp() {
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
        level = newLevel;
        if (levelElement) {
            levelElement.textContent = level;
        }
        
        // 每升一级增加速度和食物价值
        speed += 1;
        foodValue += 5;
        
        // 显示级别提升消息
        showLevelUpMessage();
    }
}

// 显示级别提升消息
function showLevelUpMessage() {
    const message = document.createElement('div');
    message.className = 'level-up-message';
    message.textContent = `升级到 ${level} 级！`;
    document.querySelector('.game-container').appendChild(message);
    
    // 添加CSS样式
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    message.style.color = 'white';
    message.style.padding = '10px 20px';
    message.style.borderRadius = '5px';
    message.style.fontSize = '24px';
    message.style.fontWeight = 'bold';
    message.style.zIndex = '100';
    
    // 2秒后移除消息
    setTimeout(() => {
        message.remove();
    }, 2000);
}

// 添加障碍物
function addObstacle() {
    if (obstacleCount >= level * 2) return; // 限制障碍物数量
    
    let obstacleX, obstacleY;
    let validPosition = false;
    
    // 尝试找到有效位置
    while (!validPosition) {
        obstacleX = Math.floor(Math.random() * tileCount);
        obstacleY = Math.floor(Math.random() * tileCount);
        validPosition = true;
        
        // 检查是否与蛇重叠
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === obstacleX && snake[i].y === obstacleY) {
                validPosition = false;
                break;
            }
        }
        
        // 检查是否与食物重叠
        if (obstacleX === foodX && obstacleY === foodY) {
            validPosition = false;
        }
        
        // 检查是否与其他障碍物重叠
        for (let i = 0; i < obstacles.length; i++) {
            if (obstacles[i].x === obstacleX && obstacles[i].y === obstacleY) {
                validPosition = false;
                break;
            }
        }
        
        // 确保障碍物不会太靠近蛇头
        const head = snake[0];
        const distance = Math.abs(head.x - obstacleX) + Math.abs(head.y - obstacleY);
        if (distance < 5) {
            validPosition = false;
        }
    }
    
    obstacles.push({ x: obstacleX, y: obstacleY });
    obstacleCount++;
}

// 绘制障碍物
function drawObstacles() {
    ctx.fillStyle = '#555';
    for (let i = 0; i < obstacles.length; i++) {
        ctx.fillRect(obstacles[i].x * gridSize, obstacles[i].y * gridSize, gridSize, gridSize);
        
        // 添加纹理
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(obstacles[i].x * gridSize, obstacles[i].y * gridSize, gridSize, gridSize);
        
        // 绘制X形状
        ctx.beginPath();
        ctx.moveTo(obstacles[i].x * gridSize, obstacles[i].y * gridSize);
        ctx.lineTo(obstacles[i].x * gridSize + gridSize, obstacles[i].y * gridSize + gridSize);
        ctx.moveTo(obstacles[i].x * gridSize + gridSize, obstacles[i].y * gridSize);
        ctx.lineTo(obstacles[i].x * gridSize, obstacles[i].y * gridSize + gridSize);
        ctx.stroke();
    }
}

// 初始绘制已移至DOMContentLoaded事件中
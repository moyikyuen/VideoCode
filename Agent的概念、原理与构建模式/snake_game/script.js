const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let gameRunning = false;
let gameLoop;

// 初始化游戏
function initGame() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    scoreSpan.textContent = '0';
    generateFood();
    gameRunning = true;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(gameTick, 150);
    draw();
}

// 生成食物
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    food = newFood;
}

// 游戏主循环
function gameTick() {
    if (!gameRunning) return;
    
    // 更新方向
    direction = { ...nextDirection };
    
    // 计算蛇头新位置
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // 检测墙壁碰撞（穿墙模式）
    if (head.x < 0) head.x = tileCount - 1;
    if (head.x >= tileCount) head.x = 0;
    if (head.y < 0) head.y = tileCount - 1;
    if (head.y >= tileCount) head.y = 0;
    
    // 检测自身碰撞
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // 蛇头加入数组
    snake.unshift(head);
    
    // 检测是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreSpan.textContent = score;
        generateFood();
    } else {
        // 没吃到食物就移除尾部
        snake.pop();
    }
    
    draw();
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格线（细线）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const padding = 1;
        
        // 蛇头颜色不同
        if (index === 0) {
            ctx.fillStyle = '#e94560';
        } else {
            const gradient = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(76, 201, 240, ${gradient})`;
        }
        
        ctx.fillRect(x + padding, y + padding, gridSize - padding * 2, gridSize - padding * 2);
        
        // 蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = '#fff';
            const eyeSize = 3;
            const eyeOffset = 5;
            if (direction.x === 1) {
                ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 12, y + 12, eyeSize, eyeSize);
            } else if (direction.x === -1) {
                ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 5, y + 12, eyeSize, eyeSize);
            } else if (direction.y === 1) {
                ctx.fillRect(x + 5, y + 12, eyeSize, eyeSize);
                ctx.fillRect(x + 12, y + 12, eyeSize, eyeSize);
            } else if (direction.y === -1) {
                ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + 12, y + 5, eyeSize, eyeSize);
            }
        }
    });
    
    // 绘制食物
    const fx = food.x * gridSize;
    const fy = food.y * gridSize;
    ctx.fillStyle = '#ff6b6b';
    ctx.beginPath();
    ctx.arc(fx + gridSize / 2, fy + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 食物高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(fx + gridSize / 2 - 3, fy + gridSize / 2 - 3, 3, 0, Math.PI * 2);
    ctx.fill();
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', canvas.width / 2, canvas.height / 2 - 20);
    
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('最终得分: ' + score, canvas.width / 2, canvas.height / 2 + 30);
}

// 键盘事件
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) {
                nextDirection = { x: 0, y: -1 };
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) {
                nextDirection = { x: 0, y: 1 };
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) {
                nextDirection = { x: -1, y: 0 };
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) {
                nextDirection = { x: 1, y: 0 };
            }
            break;
    }
});

// 重新开始按钮
restartBtn.addEventListener('click', initGame);

// 禁止页面方向键滚动
window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

// 启动游戏
initGame();
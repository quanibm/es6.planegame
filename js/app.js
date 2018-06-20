/*
 * @Author: nikolas.zengchunhui 
 * @Date: 2018-06-15 18:00:46 
 * @Last Modified by: nikolas.zengchunhui
 * @Last Modified time: 2018-06-20 10:23:59
 */



var container = document.getElementById('game');
var score = document.querySelector('.score');
var gameNextLevel = document.querySelector('.game-next-level');
var canvas = document.querySelector('#canvas');
var context = canvas.getContext('2d');


/**
* 游戏相关配置
* @type {Object}
*/
var CONFIG = {
    status: 'start', // 游戏开始默认为开始中
    level: 1, // 游戏默认等级
    totalLevel: 6, // 总共6关
    numPerLine: 6, // 游戏默认每行多少个怪兽
    canvasPadding: 30, // 默认画布的间隔
    bulletSize: 10, // 默认子弹长度
    bulletSpeed: 10, // 默认子弹的移动速度
    enemySpeed: 2, // 默认敌人移动距离
    enemySize: 50, // 默认敌人的尺寸
    enemyGap: 10,  // 默认敌人之间的间距
    enemyIcon: './img/enemy.png', // 怪兽的图像
    enemyBoomIcon: './img/boom.png', // 怪兽死亡的图像
    enemyDirection: 'right', // 默认敌人一开始往右移动
    planeSpeed: 5, // 默认飞机每一步移动的距离
    planeSize: {
        width: 60,
        height: 100
    }, // 默认飞机的尺寸,
    planeIcon: './img/plane.png',
};



/**
 * 整个游戏对象
 * @type {Object}
 */
var GAME = {
    scores: 0,
    /**
     * 初始化函数,这个函数只执行一次
     * @param  {object} opts 
     * @return {[type]}      [description]
     */
    init: function (opts) {
        this.status = 'start';
        this.bindEvent();
    },
    bindEvent: function () {
        var playBtn = document.querySelector('.js-play');
        let replayBtn = document.querySelectorAll('.js-replay')[0];
        let restartBtn = document.querySelectorAll('.js-replay')[1];
        let continueBtn = document.querySelector('.js-next');
        // 开始游戏按钮绑定
        playBtn.onclick = () => {
            this.play();
        };
        // 重新开始按钮绑定
        replayBtn.onclick = () => {
            this.play();
        };
        // 继续游戏按钮绑定
        continueBtn.onclick = () => {
            this.play();
        };
        // 重新开始按钮绑定
        restartBtn.onclick = () => {
            this.play();
        };

    },
    /**
     * 更新游戏状态，分别有以下几种状态：
     * start  游戏前
     * playing 游戏中
     * failed 游戏失败
     * success 游戏成功
     * all-success 游戏通过
     * stop 游戏暂停（可选）
     */
    setStatus: function (status) {
        this.status = status;
        container.setAttribute("data-status", status);
    },
    play: function () {
        this.setStatus('playing');
        if (imgLoader.loaded) {
            playGame();
        }
    },
    failed() {
        this.setStatus('failed')
        score.innerHTML = '' + this.scores;
        this.scores = 0;
        CONFIG.level = 1;
    },
    success() {
        this.setStatus('success');
    },
    allSuccess() {
        this.setStatus('all-success');
        this.scores = 0;
        CONFIG.level = 1;
    },
    stop() {
        this.setStatus('stop')

    }
};

/**
 * 图片加载对象
 */
var imgLoader = {
    loaded: true,
    loadImgs: 0,
    totalImgs: 0,
    /**
     *图片路径
     * @param {*} url
     */
    load(url) {
        this.totalImgs++;
        this.loaded = false;
        let img = new Image();
        img.src = url;
        img.onload = () => {
            imgLoader.loadImgs++;
            if (imgLoader.loadImgs === imgLoader.totalImgs) {
                imgLoader.loaded = true;
            }
        }
        return img;
    }
}

/**
 * 图片对象
 * @type {Object}
 */
const ICONS = {
    plane: imgLoader.load(CONFIG.planeIcon),
    enemy: imgLoader.load(CONFIG.enemyIcon),
    boom: imgLoader.load(CONFIG.enemyBoomIcon)
}



/**
 * 飞机对象
 * @type {object}
 */
let plane = {
    x: 320,
    y: 470,
    width: CONFIG.planeSize.width,
    height: CONFIG.planeSize.height,
    speed: CONFIG.planeSpeed,
    bullets: [],
    move(direction) {
        switch (direction) {
            case "left":
                if (plane.x - plane.speed >= CONFIG.canvasPadding) {
                    plane.x -= plane.speed;
                } else if (plane.x > CONFIG.canvasPadding) {
                    plane.x = CONFIG.canvasPadding;
                }
                break;
            case "right":
                if (plane.x + plane.speed <= 700 - CONFIG.canvasPadding - plane.width) {
                    plane.x += plane.speed;
                } else if (plane.x <= 700 - CONFIG.canvasPadding - plane.width) {
                    plane.x = 700 - CONFIG.canvasPadding - plane.width
                }
                break;
        }
    },
    shoot() {
        let newBullet = new Bullet(this.x + this.width / 2, this.y);
        this.bullets.unshift(newBullet);
    },
    draw() {
        context.drawImage(ICONS.plane, plane.x, plane.y, plane.width, plane.height);
    }
}



/**
 *飞机子弹类
 *
 * @class Bullet
 */
class Bullet {
    /**
     *Creates an instance of Bullet.
     * @param {*} x
     * @param {*} y
     * @memberof Bullet
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 1;
        this.height = CONFIG.bulletSize;
        this.speed = CONFIG.bulletSpeed;
    }

}
/**
 * 子弹类的方法
 */
Object.assign(Bullet.prototype, {
    move() {
        this.y -= this.speed;
    },
    draw() {
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x, this.y - this.height);
        context.strokeStyle = '#fff';
        context.lineWidth = 1;
        context.stroke();
        context.closePath();
    }
})


/**
 *怪兽类
 *
 * @class Monster
 */
class Monster {
    /**
     *Creates an instance of Monster.
     * @param {*} x
     * @param {*} y
     * @memberof Monster
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.isDied = false;
        this.boomingTime = 0;
        this.width = CONFIG.enemySize;
        this.height = CONFIG.enemySize;
        this.speed = CONFIG.enemySpeed;
        this.step = 50;
        this.moveDirection = CONFIG.enemyDirection;
    }
}
/**
 * 怪兽类的方法
 */
Object.assign(Monster.prototype, {
    /**
     *垂直移动
     *
     */
    moveVertical() {
        this.y += this.step;
    },
    /**
     *水平移动
     *
     * @param {*} direction
     */
    moveHorizontal(direction) {
        if (direction === 'right') {
            this.x += this.speed;
        } else {
            this.x -= this.speed;
        }
    },
    /**
     *
     *
     */
    booming() {
        if (this.isDied) {
            this.boomingTime++;
        }
    },
    /**
     *画出怪兽
     *
     * @param {*} isDied
     * @param {*} x
     * @param {*} y
     * @param {*} width
     * @param {*} height
     */
    draw(isDied, x, y, width, height) {
        if (!isDied) {
            context.drawImage(ICONS.enemy, x, y, width, height);
        } else {
            context.drawImage(ICONS.boom, x, y, width, height);
        }
    }
});

/**
 *创造怪兽
 *
 */
var monsters = [];
function createMonsters() {
    for (let j = 0; j < CONFIG.level; j++) {
        for (let i = 0; i < CONFIG.numPerLine; i++) {
            let monster = new Monster(CONFIG.canvasPadding + (50 + CONFIG.enemyGap) * i, -20 + j * 50);
            monsters.push(monster);
        }
    }
}


/**
 * 绑定事件
 */
const pressingStatus = {};//按键状态对象
/**
 *
 *键盘按下触发
 * @param {*} e事件对象
 */
var timer = '';
function keyDownEvent(e) {
    let key = e.keyCode || e.which || e.charCode;
    switch (key) {
        case 32:
            clearTimeout(timer)
            timer = setTimeout(() => {
                plane.shoot();
            }, 100)
        case 37:
            pressingStatus[key] = true;
            break;
        case 39:
            pressingStatus[key] = true;
            break;
    }
}

/**
 *键盘弹起触发
 * @param {*} e事件对象
 */
function keyUpEvent(e) {
    let key = e.keyCode || e.width || charCode;
    pressingStatus[key] = false;
}

/**
 *控制飞机移动
 *
 */
function moveAction() {
    if (pressingStatus[37]) {
        plane.move('left');
    }
    if (pressingStatus[39]) {
        plane.move('right');
    }
}
/**
 * 动画执行函数
 */
var animateId = null;
function animate() {
    //清除画布
    context.clearRect(0, 0, canvas.width, canvas.height);
    //碰撞检测
    collisionDetection(monsters, plane.bullets);
    //绘制子弹
    if (plane.bullets) {
        for (let i = 0, len = plane.bullets.length; i < len; i++) {
            plane.bullets[i].move();
            if (plane.bullets[i].y <= 0) {
                plane.bullets.splice(i, len);
                break;
            }
            plane.bullets[i].draw();
        }
    }
    //绘制飞机；
    plane.draw();
    //绘制怪兽
    if (monsters.length > 0) {
        let mlen = monsters.length;
        if (monsters.some(item =>/**右换行 */
            item.x === 620
        )) {
            monsters.forEach(item => {
                item.moveVertical();
                item.moveDirection = 'left';
            });
        } else if (monsters.some(item =>/**左换行 */
            item.x === 30
        )) {
            monsters.forEach(item => {
                item.moveVertical();
                item.moveDirection = 'right';
            })
        } else if (monsters[mlen - 1].y === 480) {/**到达底部游戏结束 */
            GAME.failed();
        }
        for (let j = monsters.length - 1; j >= 0; j--) {
            monsters[j].booming();
            monsters[j].moveHorizontal(monsters[j].moveDirection);
            monsters[j].draw(monsters[j].isDied, monsters[j].x, monsters[j].y, monsters[j].width, monsters[j].height);
            if (monsters[j].boomingTime === 3) {
                monsters.splice(j, 1);
                GAME.scores++;
            }
        }
        //绘制分数
        context.font = '18px sans-serif';
        context.fillStyle = '#fff';
        let text = `分数： ${GAME.scores}`;
        context.fillText(text, 20, 20);
        // 判断游戏通关
        if (monsters.length === 0) {
            if (CONFIG.level < CONFIG.totalLevel) {
                GAME.success();
            } else {
                GAME.allSuccess();
            }
        }
    }
    //飞机移动
    moveAction();
    animateId = requestAnimationFrame(animate);
    if (GAME.status === 'failed' || GAME.status === 'success' || GAME.status === 'all-success') {
        stopGame();
        if (GAME.status === 'success') {
            CONFIG.level++;
            gameNextLevel.innerHTML = `下一个Level： ${CONFIG.level};`
        }
    }
}

/**
 *
 *碰撞检测
 * @param {*} monsters数组
 * @param {*} bullets数组
 */
function collisionDetection(monsters, bullets) {
    if (monsters.length > 0 && bullets.length > 0) {
        for (let i = monsters.length - 1; i >= 0; i--) {
            for (let j = bullets.length - 1; j >= 0; j--) {
                if (monsters[i].x <= bullets[j].x &&
                    monsters[i].x + monsters[i].width >= bullets[j].x &&
                    monsters[i].y <= bullets[j].y + bullets[j].height &&
                    monsters[i].y + monsters[i].height >= bullets[j].y + bullets[j].height
                ) {
                    monsters[i].isDied = true;
                    bullets.splice(j, 1);
                }

            }
        }

    }

}

function playGame() {
    document.addEventListener('keydown', keyDownEvent);
    document.addEventListener('keyup', keyUpEvent);
    resetGame();
    animate();
}

function stopGame() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    window.cancelAnimationFrame(animateId);
    document.removeEventListener('keydown', keyDownEvent)
    document.removeEventListener('keyup', keyUpEvent)
}


function resetGame() {
    monsters = [];
    plane.bullets = [];
    createMonsters();
    plane.x = 320;
    plane.y = 470;
    pressingStatus[37] = false;
    pressingStatus[39] = false;
}
// 初始化
GAME.init();
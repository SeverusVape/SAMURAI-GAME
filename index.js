const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const gravity = 0.7;
const keys = {
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
    ArrowLeft: {
        pressed: false,
    },
    ArrowRight: {
        pressed: false,
    },
};

canvas.width = 1024;
canvas.height = 576;

context.fillRect(0, 0, canvas.width, canvas.height);

// background
const background = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: "./img/background.png",
});

const shop = new Sprite({
    position: {
        x: 640,
        y: 161,
    },
    imageSrc: "./img/shop.png",
    scale: 2.5,
    framesMax: 6,
});

// player
const player = new Fighter({
    position: {
        x: 0,
        y: 0,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: {
        x: 0,
        y: 0,
    },
    imageSrc: "./img/samuraiMack/Idle.png",
    scale: 2.5,
    framesMax: 8,
    offset: {
        x: 215,
        y: 157,
    },
    sprites: {
        idle: {
            imageSrc: "./img/samuraiMack/Idle.png",
            framesMax: 8,
        },
        run: {
            imageSrc: "./img/samuraiMack/Run.png",
            framesMax: 8,
        },
        jump: {
            imageSrc: "./img/samuraiMack/Jump.png",
            framesMax: 2,
        },
        fall: {
            imageSrc: "./img/samuraiMack/Fall.png",
            framesMax: 2,
        },
        attack1: {
            imageSrc: "./img/samuraiMack/Attack1.png",
            framesMax: 6,
        },
        takeHit: {
            imageSrc: "./img/samuraiMack/Take_hit-2.png",
            framesMax: 4,
        },
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50,
        },
        width: 158,
        height: 50,
    },
});

// enemy
const enemy = new Fighter({
    position: {
        x: 400,
        y: 100,
    },
    velocity: {
        x: 0,
        y: 0,
    },
    offset: {
        x: -50,
        y: 0,
    },
    imageSrc: "./img/kenji/Idle.png",
    scale: 2.5,
    framesMax: 4,
    offset: {
        x: 215,
        y: 167,
    },
    sprites: {
        idle: {
            imageSrc: "./img/kenji/Idle.png",
            framesMax: 4,
        },
        run: {
            imageSrc: "./img/kenji/Run.png",
            framesMax: 8,
        },
        jump: {
            imageSrc: "./img/kenji/Jump.png",
            framesMax: 2,
        },
        fall: {
            imageSrc: "./img/kenji/Fall.png",
            framesMax: 2,
        },
        attack1: {
            imageSrc: "./img/kenji/Attack1.png",
            framesMax: 4,
        },
        takeHit: {
            imageSrc: "./img/kenji/Take hit.png",
            framesMax: 3,
        },
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50,
        },
        width: 170,
        height: 50,
    },
});

decreaseTimer();

// loop for animation
const animate = function () {
    window.requestAnimationFrame(animate);
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    background.update();
    shop.update();
    player.update();
    enemy.update();

    player.velocity.x = 0;
    enemy.velocity.x = 0;

    // player movement
    if (keys.a.pressed && player.lastKey === "a") {
        player.velocity.x = -5;
        player.switchSprites("run");
    } else if (keys.d.pressed && player.lastKey === "d") {
        player.velocity.x = 5;
        player.switchSprites("run");
    } else {
        player.switchSprites("idle");
    }

    if (player.velocity.y < 0) {
        player.switchSprites("jump");
    } else if (player.velocity.y > 0) {
        player.switchSprites("fall");
    }

    //enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === "ArrowLeft") {
        enemy.velocity.x = -5;
        enemy.switchSprites("run");
    } else if (keys.ArrowRight.pressed && enemy.lastKey === "ArrowRight") {
        enemy.velocity.x = 5;
        enemy.switchSprites("run");
    } else {
        enemy.switchSprites("idle");
    }

    if (enemy.velocity.y < 0) {
        enemy.switchSprites("jump");
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprites("fall");
    }

    // collision detect
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy,
        }) &&
        player.isAttacking &&
        player.framesCurrent === 4
    ) {
        enemy.takeHit();
        player.isAttacking = false;
        document.querySelector("#enemyBar").style.width = `${enemy.health}%`;
    }

    // player hit miss
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false;
    }

    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player,
        }) &&
        enemy.isAttacking &&
        enemy.framesCurrent === 2
    ) {
        player.takeHit();
        enemy.isAttacking = false;
        document.querySelector("#playerBar").style.width = `${player.health}%`;
    }
    // enemy hit miss
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false;
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerID });
    }
};

animate();

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "d":
            keys.d.pressed = true;
            player.lastKey = "d";
            break;
        case "a":
            keys.a.pressed = true;
            player.lastKey = "a";
            break;
        case "w":
            player.velocity.y = -20;
            break;
        case " ":
            player.attack();
            break;
    }
    // enemy
    switch (e.key) {
        case "ArrowRight":
            keys.ArrowRight.pressed = true;
            enemy.lastKey = "ArrowRight";
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = true;
            enemy.lastKey = "ArrowLeft";
            break;
        case "ArrowUp":
            enemy.velocity.y = -20;
            break;
        case "ArrowDown":
            enemy.attack();
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "d":
            keys.d.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
    }
    // enemy
    switch (e.key) {
        case "ArrowRight":
            keys.ArrowRight.pressed = false;
            break;
        case "ArrowLeft":
            keys.ArrowLeft.pressed = false;
            break;
    }
});

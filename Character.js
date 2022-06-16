export class Character { //All npcs, parent class for player //todo: move action listener to player class
    keyup = (e) => {
        if (e.code === "KeyW") {
            this.w = false;
        }
        if (e.code === "KeyS") {
            this.s = false;
        }
        if (e.code === "KeyA") {
            this.a = false;
        }
        if (e.code === "KeyD") {
            this.d = false;
        }
    };
    keydown = (e) => {
        if (e.code === "KeyW") {
            this.w = true;
        }
        if (e.code === "KeyS") {
            this.s = true;
        }
        if (e.code === "KeyA") {
            this.a = true;
        }
        if (e.code === "KeyD") {
            this.d = true;
        }
    };


    constructor({position, velocity, height, width, health, ctx, isPlayer}) {
        this.width = width;
        this.height = height;
        this.position = position;
        this.velocity = velocity;
        this.health = health;
        this.ctx = ctx;
        this.isPlayer = isPlayer;
        this.isDead = false;
        this.enemySprite = document.getElementById("ENEMY");
        this.w = false;
        this.a = false;
        this.s = false;
        this.d = false;
        document.addEventListener("keydown", this.keydown);
        document.addEventListener("keyup", this.keyup);
    }

    draw() {
        this.ctx.drawImage(this.enemySprite, this.position.x, this.position.y, this.width, this.height);
    }


    update(playerX, playerY) {//update cycle, moves character, draws updated sprite
        this.move(playerX, playerY)
        this.draw();
    }

    getPosition() {
        return this.position;
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getHealth() {
        return this.health;
    }

    removeHealth() {
        this.health--;
    }

    move(playerX, playerY) { //follows the player, might add more interesting movement patterns in the future
        if (this.position.x > playerX) {
            this.position.x -= this.velocity;
        }
        if (this.position.x < playerX) {
            this.position.x += this.velocity;
        }
        if (this.position.y > playerY) {
            this.position.y -= this.velocity;
        }
        if (this.position.y < playerY) {
            this.position.y += this.velocity;
        }
    }

    kill() {
        this.height = 0;
        this.width = 0;
        this.isDead = true;
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }
}
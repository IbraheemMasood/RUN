import {Character} from "./Character.js";


export class Player extends Character {
    mousePosX = 0;
    mousePosY = 0;
    isMouseClicked = false;
    dashDelay = 30;
    isDashing = false;//tracks whether character is dashing or not, used for hitboxes
    dodgeSound = new Audio("dodgeSound.wav")//todo: add a better dash sound
    walkSound = new Audio("walkSound.wav")//todo: add a better walk-sound
    spriteA = document.getElementById("PlayerA");//Animation cycle, there is likely a more efficient way to execute this and probably a better animation I could implement
    spriteB = document.getElementById("PlayerB");
    spriteC = document.getElementById("PlayerC");
    spriteD = document.getElementById("PlayerD");
    currentSprite;
    spriteCounter = 0;

    draw() {

        if (this.spriteCounter <= 20) {
            this.currentSprite = this.spriteA
        } else if (this.spriteCounter <= 40) {
            this.currentSprite = this.spriteB
        } else if (this.spriteCounter <= 60) {
            this.currentSprite = this.spriteC
        } else if (this.spriteCounter <= 80) {
            this.currentSprite = this.spriteD
        }
        this.ctx.drawImage(this.currentSprite, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.move();
        this.draw();
    }

    updateMouse(x, y, isMouseClicked) {
        this.mousePosX = x - this.width / 2;
        this.mousePosY = y - this.height / 2;
        this.isMouseClicked = isMouseClicked
    }

    move() {//update player position
        // this.walkSound.play(); (when i have a good walk sound effect)

        this.dashDelay--; //lower the cool-down for the dash
        if (this.dashTime > 0 && this.velocity === 20) { //movement while dashing
            console.log(this.isDashing);
            this.dashTime -= 1;
            if (this.dashTargetX > this.position.x) {
                this.position.x += this.velocity;
            }
            if (this.dashTargetX < this.position.x) {
                this.position.x -= this.velocity;
            }
            if (this.dashTargetY > this.position.y) {
                this.position.y += this.velocity;
            }
            if (this.dashTargetY < this.position.y) {
                this.position.y -= this.velocity;
            }
        } else {
            this.isDashing = false; //update dash flag
            this.velocity = 7;//reset velocity
            let temp = this.width; //un-squash
            this.width = Math.min(this.width, this.height);
            this.height = Math.max(this.height, temp);
            if (this.isMouseClicked && this.dashDelay <= 0) { //dash towards cursor when mouse is pressed and dash is off cool down, sets dash on cool down
                this.dodgeSound.play()
                this.width = this.height;//flip height and width (a pseudo animation)
                this.height = temp;
                this.velocity = 20;
                this.dashTime = 7; //dashes for 4 update cycles
                this.dashDelay = 40; //cant redash for 40 update cycles
                this.dashTargetX = this.mousePosX; //sets a fixed target at the place the click was registered
                this.dashTargetY = this.mousePosY;
                this.isDashing = true;
            }  //follow cursor, countdown dash delay
            if (this.d && this.position.x + this.velocity <= 1280) {
                if (this.spriteCounter < 80) {
                    this.spriteCounter++
                } else {
                    this.spriteCounter = 0;
                }
                this.position.x += this.velocity;
            }
            if (this.a && this.position.x + this.velocity >= 0) {
                this.position.x -= this.velocity;
                if (this.spriteCounter < 80) {
                    this.spriteCounter++
                } else {
                    this.spriteCounter = 0;
                }
            }
            if (this.s && this.position.y + this.velocity <= 1280) {
                this.position.y += this.velocity;
                if (this.spriteCounter < 80) {
                    this.spriteCounter++
                } else {
                    this.spriteCounter = 0;
                }
            }
            if (this.w && this.position.y + this.velocity >= 0) {
                this.position.y -= this.velocity;
                if (this.spriteCounter < 40) {
                    this.spriteCounter++
                } else {
                    this.spriteCounter = 0;
                }
            }
        }


    }

    removeHealth() {
        if (!this.isDashing) {//Could change this to be if (dashTime === 0 || dashTime > some value) to add more commitment to individual dashes
            this.health--;
        }
    }

    setVelocity(num) {
        this.velocity = num
    }
}
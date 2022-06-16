import {Character} from "./Character.js";
import {Player} from "./Player.js"
import {Room} from "./Room.js"

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


canvas.width = 1280;//height
canvas.height = 768;//width
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, 1280, 768);

let enemies = [];
let rooms = [];
let activeHitboxes = [];
let isMouseClicked = false;
let mousePosX = 640;
let mousePosY = 360;
let currentRoom = -1;
let player;
let intervalCode = 0;
let highscores = [];//a list that holds scores
let timer = 60;//start timer

document.body.onkeydown = function (e) {
    if (e.key === "R" ||
        e.key === "r"
    ) {
        if (intervalCode !== 0) {
            clearInterval(intervalCode);//clear initial game(if you don't do this the speed of the game will keep increasing when you reset)
        }
        startGame();//start a new game
    }
}

canvas.onmousedown = (event) => { //update mouseclick status
    const {
        mousePress = true,
        clientX, clientY
    } = event;

    isMouseClicked = mousePress;
    mousePosX = clientX - event.currentTarget.getBoundingClientRect().left
    mousePosY = clientY - event.currentTarget.getBoundingClientRect().top
}

canvas.onmouseup = (event) => {
    const {
        mousePress = false
    } = event;
    isMouseClicked = mousePress;
}

function animate() { //gameplay loop
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 1280, 768);

    if (timer < 0) {

        rooms[currentRoom].draw();//draw current room

        for (let i = 0; i < rooms[currentRoom].getHCells(); i++) {
            for (let j = 0; j < rooms[currentRoom].getVCells(); j++) {

                if (rooms[currentRoom].tiles[i][j].type === 2) {//push pit hitboxes
                    activeHitboxes.push({
                        width: 64,
                        height: 64,
                        x: rooms[currentRoom].tiles[i][j].location.x,
                        y: rooms[currentRoom].tiles[i][j].location.y,
                        isSourcePlayer: false,
                        isDoor: false
                    })

                } else if (rooms[currentRoom].tiles[i][j].type === 4) {//push door hitbox
                    activeHitboxes.push({
                        width: 64,
                        height: 64,
                        x: rooms[currentRoom].tiles[i][j].location.x,
                        y: rooms[currentRoom].tiles[i][j].location.y,
                        isSourcePlayer: false,
                        isDoor: true,

                    })
                }
            }

        }


        player.updateMouse(mousePosX, mousePosY, isMouseClicked);
        checkHits(player);

        if (player.getHealth() > 0) {//if the player's health is positive
            player.update();//update the player sprite
        } else {

            if (!player.isDead) {//this way it's only the first tick the player dies on
                if (localStorage.getItem("storedScores") !== null) {//check if there are scores on local storage
                    highscores = JSON.parse(localStorage.getItem("storedScores"));
                }
                highscores.push(currentRoom);//push current score to list
                localStorage.setItem("storedScores", JSON.stringify(highscores));
            }

            player.kill();//kill the player

            //render death screen
            ctx.fillStyle = "#fff"
            ctx.font = "48px AvalanchenoBitma";
            ctx.fillText("YOU DIED, PRESS R TO RETRY", canvas.width / 2 - 300, canvas.height-200);
            ctx.strokeText("YOU DIED, PRESS R TO RETRY", canvas.width / 2 - 300, canvas.height-200);
            ctx.fillText("HIGHSCORES: ", canvas.width / 2 - 500, 100);
            ctx.strokeText("HIGHSCORES: ", canvas.width / 2 - 500, 100);
            highscores = JSON.parse(localStorage.getItem("storedScores"))
            highscores.sort();
            highscores.reverse();//set scores list to highest value first
            for (let i = 0; i < Math.min(6, highscores.length); i++) {//draw either the entire score list or the top 5 scores
                ctx.fillText(highscores[i], canvas.width / 2 - 220, 100 + 50 * i);
                ctx.strokeText(highscores[i], canvas.width / 2 - 220, 100 + 50 * i);
            }
        }
        for (let i = 0; i < enemies.length; i++) {//push the ghost hitboxes
            activeHitboxes.push({
                width: enemies[i].width,
                height: enemies[i].height,
                x: enemies[i].getPosition().x,
                y: enemies[i].getPosition().y,
                isSourcePlayer: false,
                isDoor: false
            })
            enemies[i].update(player.getPosition().x, player.getPosition().y);//update ghost sprite
        }
        checkHits(player);
        activeHitboxes = [];


    } else {
        let num = Math.ceil(timer / 3)
        ctx.font = "48px AvalanchenoBitma";
        timer--;
        rooms[currentRoom].draw();
        player.draw();
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].draw();
        }
        ctx.strokeStyle = "#fff";
        ctx.strokeText(num.toString(), 1280 / 2, 768 / 2);
        ctx.fillText(num.toString(), 1280 / 2, 768 / 2);

    }
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.font = "12 AvalanchenoBitma";
    ctx.fillText("Current Level: " + (currentRoom + 1).toString(), 0, 30);
    ctx.strokeText("Current Level: " + (currentRoom + 1).toString(), 0, 30);
}

function generateRoom(x, y, ctx) {
    let room = new Room(768, 1280, x, y, ctx);//create a new "blank" room
    room.fillRoom();//fill it with walls
    room.addFloor(x, y);//generate a path
    room.addDoor();//add a door
    rooms.push(room);//push it to the list
    currentRoom += 1;//update current room variable(for score, could allow for the player to go back a room in the future)
    if (currentRoom % 5 === 0 && currentRoom !== 0) {//every five rooms, add a new ghost
        let newEnemy = new Character({
            position: {x: Math.random() * 1000, y: 400 + Math.random() * 1000},
            velocity: 8,
            height: 32,
            width: 32,
            health: 1,
            ctx: ctx,
            isPlayer: false,

        });
        enemies.push(newEnemy);
    }
}

function checkHits(target) { //check active hitboxes against a target
    for (let i = 0; i < activeHitboxes.length; i++) {//loop through all active hitboxes, checking them
        checkHit(target, activeHitboxes[i].x, activeHitboxes[i].y, activeHitboxes[i].width, activeHitboxes[i].height, activeHitboxes[i].isSourcePlayer, activeHitboxes[i].isDoor)
    }
}

function checkHit(target, hitboxX, hitboxY, hitboxWidth, hitboxHeight, isSourcePlayer, isDoor) { //judge if a hitbox connected with a target
    if (hitboxX < target.getPosition().x + target.getWidth() && //if hit connects, and they're on opposite teams, remove 1 health from target;
        hitboxX + hitboxWidth > target.getPosition().x &&
        hitboxY < target.getPosition().y + target.getHeight() &&
        hitboxY + hitboxHeight > target.getPosition().y &&
        (target.isPlayer && !isSourcePlayer || !target.isPlayer && isSourcePlayer)) { //isPlayer and isSourcePlayer unused currently, may be useful in future
        if (isDoor) {//if a door
            generateRoom(0, 0, ctx);//make a new room
            player.setPosition(32, 32);//reset player position
            player.setVelocity(0);//reset player velocity(was a problem when dashing through door)
            if (currentRoom < 6) {//reset timer, if room is not the 6th one from a run
                timer = 60 - Math.floor(10 * currentRoom);
            }
            for (let i = 0; i < enemies.length; i++) {//reset enemy positions
                enemies[i].setPosition(700, 400 + Math.random() * 100);
            }
        } else {//if it's not a door, deal damage
            target.removeHealth();

        }
    }
}

function startGame() {
    timer = 60;//sets timer
    enemies = [];//clear enemy list
    rooms = [];//clear room list
    activeHitboxes = [];//clear active hitboxes
    currentRoom = -1;//reset room-tracker

    player = new Player({
        position: {x: 32, y: 32},
        height: 28,
        width: 16,
        health: 1,
        ctx: ctx,
        isPlayer: true,
    });


    const enemy = new Character({
        position: {x: Math.random() * 1000, y: 400 + Math.random() * 10},
        velocity: 7,
        height: 32,
        width: 32,
        health: 1,
        ctx: ctx,
        isPlayer: false,

    });

    generateRoom(0, 0, ctx);
    enemies.push(enemy);
    player.draw();
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].draw();
    }
    intervalCode = setInterval(animate, 1000 / 60);//updates the game 60 times/second("physics" is tied to the tickrate, for a harder difficulty you can increase the tickrate)
}

//render the "tutorial"
ctx.font = "48px AvalanchenoBitma";
ctx.fillStyle = '#9F1D1F'
ctx.fillText("PRESS R TO START", 10, 320)
ctx.fillStyle = '#555'
ctx.fillRect(900, 200, 64, 64);
ctx.fillStyle = '#9F1D1F'
ctx.fillText("GROUND", 974, 254)

ctx.fillStyle = '#000'
ctx.fillRect(900, 300, 64, 64);

ctx.fillStyle = '#9F1D1F'
ctx.fillText("PIT", 974, 354)

ctx.fillStyle = '#00F'
ctx.fillRect(900, 400, 64, 64);
ctx.fillStyle = '#9F1D1F'
ctx.fillText("WATER", 974, 454)

ctx.drawImage(document.getElementById("W"), 600, 200)
ctx.fillText("UP", 674, 254)

ctx.drawImage(document.getElementById("A"), 600, 300)
ctx.fillText("LEFT", 674, 354)

ctx.drawImage(document.getElementById("S"), 600, 400)
ctx.fillText("RIGHT", 674, 454)

ctx.drawImage(document.getElementById("D"), 600, 500)
ctx.fillText("DOWN", 674, 554)

ctx.drawImage(document.getElementById("R"), 600, 600)
ctx.fillText("RESTART", 674, 654)

ctx.drawImage(document.getElementById("M1"), 600, 700)
ctx.fillText("JUMP/DODGE", 674, 754)

ctx.drawImage(document.getElementById("RUN"), 0, 0)


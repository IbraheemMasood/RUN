import {Tiles} from "./Tiles.js";

export class Room {
    vCells;//Number of vertical tiles, 11
    hCells;//number of horizontal tiles, 19
    height;//Pixel height (1024px)
    width;//Pixel width (768px)
    tiles = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []];//array that holds our tiles

    constructor(height, width, x, y, ctx) {
        this.height = height;
        this.width = width;
        this.ctx = ctx;
        this.vCells = height / 64;
        this.hCells = width / 64;
    }

    fillRoom() { //fills the rooms with walls
        for (let i = 0; i < this.width / 64; i++) {
            for (let j = 0; j < this.height / 64; j++) {
                this.tiles[i][j] = (new Tiles(i * 64, j * 64, 2));
            }
        }
    }

    addFloor(x, y) {//modified version of prim's algorithm, used to place walkable floor

        let startTile = this.tiles[x][y]; //get start tile
        startTile.setType(3);//set start tile to floor


        //compute a frontier list, all wall tiles that are 2 "steps" away from our starting tile in the 4 cardinal directions
        let frontier = []
        this.getNeighbours(x, y, frontier, 2);//push them to frontier list
        //while this frontier list is not empty, pick an arbitrary tile from this list
        while (frontier.length > 0) {
            let idx = this.getRandomInt(0, frontier.length);
            let frontierNeighbours = [];
            let pickedFrontier = frontier[idx];
            if (this.getNeighbours(pickedFrontier.location.x / 64, pickedFrontier.location.y / 64, frontierNeighbours, 3)) {//make a list of all neighbours to that frontier tile (tiles 2 distance away that are floors)
                let neighbourIDX = this.getRandomInt(0, frontierNeighbours.length);
                let neighbourX = frontierNeighbours[neighbourIDX].location.x / 64;
                let neighbourY = frontierNeighbours[neighbourIDX].location.y / 64;

                let x = pickedFrontier.location.x / 64;
                let y = pickedFrontier.location.y / 64;
                let xDiff = x - neighbourX;
                let yDiff = y - neighbourY;
                let connectorX = 0;
                let connectorY = 0;

                if (xDiff > 0) {
                    connectorX = neighbourX + 1;
                } else if (xDiff < 0) {
                    connectorX = neighbourX - 1;
                } else {
                    connectorX = neighbourX;
                }
                if (yDiff > 0) {
                    connectorY = neighbourY + 1;
                } else if (connectorY < 0) {
                    connectorY = neighbourY - 1;
                } else {
                    connectorY = neighbourY
                }
                this.getNeighbours(connectorX, connectorY, frontier, 2); //get the neighbours from the connector, continuing the loop

                if (this.isValid(connectorX, connectorY)) {
                    this.tiles[connectorX][connectorY].setType(3);
                }
            }
            frontier.splice(idx, 1);//remove original frontier tile
        }

        for (let i = 0; i <= 3; i++) { //set start area tiles to walkable
            for (let j = 0; j <= 3; j++) {
                this.tiles[i][j].setType(3);
            }
        }

    }


    getNeighbours(x, y, arr, type) { //Get tiles 2 blocks away

        let hasNeighbour = false; //checks whether a tile has any valid neighbours

        for (let i = -2; i <= 2; i += 2) {//loop through the list to find neighbours
            for (let j = -2; j <= 2; j += 2) {
                if (this.isValid(x + i, y + j) && this.tiles[x + i][y + j].getType() === type && ((Math.abs(x - x + i) >= 2 || Math.abs(y - y + j) >= 2) && ((Math.abs(x - x + i) + Math.abs(y - y + j)) !== 4))) {
                    if (!arr.includes(this.tiles[x + i][y + j])) {
                        hasNeighbour = true;
                        arr.push(this.tiles[x + i][y + j]);
                    }
                }
            }
        }
        return hasNeighbour;
    }

    canAccess(x, y) {//checks if any given tile can be reached by the player
        for (let i = -1; i <= 0; i++) {
            for (let j = -1; j <= 0; j++) {
                if (this.isValid(x + i, y + j) && Math.abs(j + i) !== 2) {
                    if (this.tiles[x + i][y + j].getType() === 3) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isValid(x, y) {//helper function, checks if a given location exists
        if (x >= this.hCells) {
            return false;
        }
        if (y >= this.vCells) {
            return false;
        }
        if (x < 0) {
            return false;
        }
        return y >= 0;

    }


    addDoor() {//places the exit door at an accessible spot
        let int = this.getRandomInt(0, this.vCells);
        while (this.tiles[this.hCells - 1][int].getType() !== 4) {
            if (this.canAccess(this.hCells - 1, int)) {
                this.tiles[this.hCells - 1][int].setType(4)
            } else {
                int = this.getRandomInt(0, this.vCells);
            }
        }
    }

    getRandomInt(min, max) { //helper function, gets a random integer between min and max
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //maximum is exclusive and minimum is inclusive
    }

    draw() {//draw tiles. pick sprite depending on tile type
        for (let i = 0; i < this.hCells; i++) {
            for (let j = 0; j < this.vCells; j++) {


                if (this.tiles[i][j].getType() === 2) {
                    this.ctx.fillStyle = '#000'
                    this.ctx.fillRect(this.tiles[i][j].location.x, this.tiles[i][j].location.y, this.tiles[i][j].size, this.tiles[i][j].size);
                }
                if (this.tiles[i][j].getType() === 3) {
                    this.ctx.drawImage(document.getElementById("GROUND"), this.tiles[i][j].location.x, this.tiles[i][j].location.y, this.tiles[i][j].size, this.tiles[i][j].size);
                }
                if (this.tiles[i][j].getType() === 4) {
                    this.ctx.drawImage(document.getElementById("WATER"), this.tiles[i][j].location.x, this.tiles[i][j].location.y, this.tiles[i][j].size, this.tiles[i][j].size);
                }

                this.ctx.strokeRect(this.tiles[i][j].location.x, this.tiles[i][j].location.y, this.tiles[i][j].size, this.tiles[i][j].size);

            }
        }
    }

    getHCells() {
        return this.hCells;
    }

    getVCells() {
        return this.vCells;
    }
}
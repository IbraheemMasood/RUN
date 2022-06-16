export class Tiles {

    size;
    location = {};
    type; //2 = wall, 3 = floor, 4 = door (0/1 still available for future expansion(gold? health-pickups maybe?)

    constructor(x, y, type) {
        this.location.x = x;
        this.location.y = y;
        this.size = 64;
        this.type = type;
    }

    setType(type) {
        this.type = type;
    }

    getType() {
        return this.type;
    }
}


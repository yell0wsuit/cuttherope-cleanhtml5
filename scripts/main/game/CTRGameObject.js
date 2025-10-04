define("game/CTRGameObject", [
    "visual/GameObject",
    "game/CTRMover",
    "resolution",
    "utils/Mover",
], function (GameObject, CTRMover, resolution, Mover) {
    var CTRGameObject = GameObject.extend({
        init: function () {
            this._super();
        },
        parseMover: function (item) {
            this.rotation = item.angle || 0;

            var path = item.path,
                MOVER_SCALE = resolution.MOVER_SCALE;
            if (path) {
                var moverCapacity = Mover.MAX_CAPACITY;
                if (path[0] === "R") {
                    // Don't scale the radius when used for capacity
                    // calculation. We want same number of path points
                    // even if the actual radius is smaller
                    var rad = parseInt(path.substr(2), 10);
                    moverCapacity = Math.round((rad * 3) / 2 + 1);
                }
                var v = item.moveSpeed,
                    rotateSpeed = item.rotateSpeed,
                    mover = new CTRMover(moverCapacity, v * MOVER_SCALE, rotateSpeed);

                mover.angle = this.rotation;
                mover.setPathAndStart(path, this.x, this.y);
                this.setMover(mover);
                mover.start();
            }
        },
    });

    return CTRGameObject;
});

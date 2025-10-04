define("game/CTRMover", ["resolution", "utils/Mover", "core/Vector"], function (
    resolution,
    Mover,
    Vector
) {
    var CTRMover = Mover.extend({
        init: function (pathCapacity, moveSpeed, rotateSpeed) {
            this._super(pathCapacity, moveSpeed, rotateSpeed);
        },
        setPathAndStart: function (path, startX, startY) {
            var i,
                nx,
                ny,
                xs,
                ys,
                MOVER_SCALE = resolution.MOVER_SCALE;

            if (path[0] === "R") {
                var clockwise = path[1] === "C",
                    rad = parseInt(path.substr(2), 10),
                    pointsCount = Math.round((rad * 3) / 2),
                    k_increment = (2 * Math.PI) / pointsCount,
                    theta = 0;

                // now that the number of points have been calculated we
                // can scale the radius to match the current resolution
                rad *= MOVER_SCALE;

                if (!clockwise) k_increment = -k_increment;

                for (i = 0; i < pointsCount; i++) {
                    nx = startX + rad * Math.cos(theta);
                    ny = startY + rad * Math.sin(theta);

                    this.addPathPoint(new Vector(nx, ny));
                    theta += k_increment;
                }
            } else {
                this.addPathPoint(new Vector(startX, startY));
                if (path[path.length - 1] === ",") {
                    path = path.substr(0, path.length - 1);
                }
                var parts = path.split(","),
                    numParts = parts.length;
                for (i = 0; i < numParts; i += 2) {
                    xs = parts[i];
                    ys = parts[i + 1];

                    this.addPathPoint(
                        new Vector(startX + xs * MOVER_SCALE, startY + ys * MOVER_SCALE)
                    );
                }
            }
        },
    });

    return CTRMover;
});

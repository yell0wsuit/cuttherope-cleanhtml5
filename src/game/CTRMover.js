import resolution from "@/resolution";
import Mover from "@/utils/Mover";
import Vector from "@/core/Vector";
const CTRMover = Mover.extend({
    init: function (pathCapacity, moveSpeed, rotateSpeed) {
        this._super(pathCapacity, moveSpeed, rotateSpeed);
    },
    setPathAndStart: function (path, startX, startY) {
        let i, nx, ny, xs, ys;
        const MOVER_SCALE = resolution.MOVER_SCALE;

        if (path[0] === "R") {
            let rad = parseInt(path.slice(2), 10);
            const pointsCount = Math.round((rad * 3) / 2);
            let k_increment = (2 * Math.PI) / pointsCount;
            let theta = 0;
            const clockwise = path[1] === "C";

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
                path = path.slice(0, path.length - 1);
            }
            const parts = path.split(","),
                numParts = parts.length;
            for (i = 0; i < numParts; i += 2) {
                xs = parts[i];
                ys = parts[i + 1];

                this.addPathPoint(new Vector(startX + xs * MOVER_SCALE, startY + ys * MOVER_SCALE));
            }
        }
    },
});

export default CTRMover;

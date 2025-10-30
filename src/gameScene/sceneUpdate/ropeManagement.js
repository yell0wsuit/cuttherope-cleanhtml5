import Constants from "@/utils/Constants";

const GameSceneRopeManagement = (Base) =>
    class extends Base {
    /**
     * @param {boolean} left
     */
    releaseAllRopes(left) {
        for (let l = 0, len = this.bungees.length; l < len; l++) {
            const g = this.bungees[l];
            const b = g.rope;

            if (
                b &&
                (b.tail === this.star ||
                    (b.tail === this.starL && left) ||
                    (b.tail === this.starR && !left))
            ) {
                if (b.cut === Constants.UNDEFINED) {
                    b.setCut(b.parts.length - 2);
                    this.detachCandy();
                } else {
                    b.hideTailParts = true;
                }

                if (g.hasSpider && g.spiderActive) {
                    this.spiderBusted(g);
                }
            }
        }
    }

    attachCandy() {
        this.attachCount += 1;
    }

    detachCandy() {
        this.attachCount -= 1;
        this.juggleTimer = 0;
    }
    };

export default GameSceneRopeManagement;

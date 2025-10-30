import Vector from "@/core/Vector";
import resolution from "@/resolution";
import Radians from "@/utils/Radians";

const GameSceneTeleport = (Base) =>
    class extends Base {
    teleport() {
        if (!this.targetSock) {
            return;
        }

        this.targetSock.light.playTimeline(0);
        this.targetSock.light.visible = true;

        const off = new Vector(0, resolution.SOCK_TELEPORT_Y);
        off.rotate(Radians.fromDegrees(this.targetSock.rotation));

        this.star.pos.x = this.targetSock.x;
        this.star.pos.y = this.targetSock.y;
        this.star.pos.add(off);

        this.star.prevPos.copyFrom(this.star.pos);

        this.star.v.x = 0;
        this.star.v.y = -1;
        this.star.v.rotate(Radians.fromDegrees(this.targetSock.rotation));
        this.star.v.multiply(this.savedSockSpeed);

        this.star.posDelta.copyFrom(this.star.v);
        this.star.posDelta.divide(60);
        this.star.prevPos.copyFrom(this.star.pos);
        this.star.prevPos.subtract(this.star.posDelta);
        /**
         * @type {Sock | null}
         */
        this.targetSock = null;

        //Achievements.increment(AchievementId.MAGICIAN);
    }
    };

export default GameSceneTeleport;

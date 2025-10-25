import ResourceId from "@/resources/ResourceId";
import SoundMgr from "@/game/CTRSoundMgr";
import Vector from "@/core/Vector";
import resolution from "@/resolution";

export const GameSceneBounceUtils = {
    handleBounce(bouncer, star, delta) {
        if (bouncer.skip) {
            return;
        }

        const v = Vector.subtract(star.prevPos, star.pos);
        const spos = star.prevPos.copy();

        const angle = bouncer.angle;
        const x = bouncer.x;
        const y = bouncer.y;

        spos.rotateAround(-angle, x, y);

        const fromTop = spos.y < bouncer.y;
        const dir = fromTop ? -1 : 1;
        const a = v.getLength() * 40;
        const b = resolution.BOUNCER_MAX_MOVEMENT;
        const m = (a > b ? a : b) * dir;
        const v2 = Vector.forAngle(bouncer.angle);
        const impulse = Vector.perpendicular(v2);

        impulse.multiply(m);

        star.pos.rotateAround(-angle, x, y);
        star.prevPos.rotateAround(-angle, x, y);
        star.prevPos.y = star.pos.y;
        star.pos.rotateAround(angle, x, y);
        star.prevPos.rotateAround(angle, x, y);

        star.applyImpulse(impulse, delta);
        bouncer.playTimeline(0);

        SoundMgr.playSound(ResourceId.SND_BOUNCER);
    },
};

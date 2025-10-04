define("game/Sock", [
    "game/CTRGameObject",
    "visual/Animation",
    "resources/ResourceId",
    "core/Alignment",
    "visual/Timeline",
    "resolution",
    "core/Vector",
    "utils/Mover",
    "utils/Radians",
    "utils/Canvas",
], function (
    CTRGameObject,
    Animation,
    ResourceId,
    Alignment,
    Timeline,
    resolution,
    Vector,
    Mover,
    Radians,
    Canvas
) {
    var Sock = CTRGameObject.extend({
        init: function () {
            this._super();

            this.group = 0;
            this.angle = 0;
            this.t1 = new Vector(0, 0);
            this.t2 = new Vector(0, 0);
            this.b1 = new Vector(0, 0);
            this.b2 = new Vector(0, 0);

            this.idleTimeout = 0;
        },
        createAnimations: function () {
            this.light = new Animation();
            this.light.initTextureWithId(ResourceId.IMG_OBJ_SOCKS);
            this.light.anchor = Alignment.BOTTOM | Alignment.HCENTER;
            this.light.parentAnchor = Alignment.TOP | Alignment.HCENTER;

            this.light.y = resolution.SOCK_LIGHT_Y;
            this.light.x = 0;
            this.light.addAnimationSequence(0, 0.05, Timeline.LoopType.NO_LOOP, 4, [
                Sock.Quads.IMG_OBJ_SOCKS_glow_start,
                Sock.Quads.IMG_OBJ_SOCKS_glow_start + 1,
                Sock.Quads.IMG_OBJ_SOCKS_glow_start + 2,
                Sock.Quads.IMG_OBJ_SOCKS_glow_start + 2,
            ]);
            this.light.doRestoreCutTransparency();
            this.light.visible = false;
            this.addChild(this.light);
        },
        updateRotation: function () {
            this.t1.x = this.x - resolution.SOCK_WIDTH / 2;
            this.t2.x = this.x + resolution.SOCK_WIDTH / 2;
            this.t1.y = this.t2.y = this.y;

            this.b1.x = this.t1.x;
            this.b2.x = this.t2.x;
            this.b1.y = this.b2.y = this.y + resolution.SOCK_ROTATION_Y_OFFSET;

            this.angle = Radians.fromDegrees(this.rotation);

            this.t1.rotateAround(this.angle, this.x, this.y);
            this.t2.rotateAround(this.angle, this.x, this.y);
            this.b1.rotateAround(this.angle, this.x, this.y);
            this.b2.rotateAround(this.angle, this.x, this.y);
        },
        draw: function () {
            var tl = this.light.currentTimeline;
            if (tl && tl.state === Timeline.StateType.STOPPED) {
                this.light.visible = false;
            }
            this._super();
        },
        drawBB: function () {
            // DEBUG: draw bounding lines for transport area
            if (false) {
                var ctx = Canvas.context;
                ctx.lineWidth = 3;

                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.moveTo(this.t1.x, this.t1.y);
                ctx.lineTo(this.t2.x, this.t2.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = "blue";
                ctx.moveTo(this.b1.x, this.b1.y);
                ctx.lineTo(this.b2.x, this.b2.y);
                ctx.stroke();
            }
        },
        update: function (delta) {
            this._super(delta);
            if (this.mover) {
                this.updateRotation();
            }
        },
    });

    /**
     * @enum {number}
     */
    Sock.Quads = {
        IMG_OBJ_SOCKS_hat_01: 0,
        IMG_OBJ_SOCKS_hat_02: 1,
        IMG_OBJ_SOCKS_glow_start: 2,
        IMG_OBJ_SOCKS_level: 3,
        IMG_OBJ_SOCKS_glow_end: 4,
    };

    /**
     * @enum {number}
     */
    Sock.StateType = {
        RECEIVING: 0,
        THROWING: 1,
        IDLE: 2,
    };

    /**
     * @const {number}
     */
    Sock.IDLE_TIMEOUT = 0.8;

    return Sock;
});

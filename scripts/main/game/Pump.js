define("game/Pump", ["visual/GameObject", "core/Vector", "utils/Radians"], function (
    GameObject,
    Vector,
    Radians
) {
    var Pump = GameObject.extend({
        init: function () {
            this._super();
            this.angle = 0;
            this.t1 = Vector.newZero();
            this.t2 = Vector.newZero();
            this.touchTimer = 0;
            this.touch = 0;
        },
        updateRotation: function () {
            var bbHalfWidth = this.bb.w / 2;

            this.t1.x = this.x - bbHalfWidth;
            this.t2.x = this.x + bbHalfWidth;
            this.t1.y = this.t2.y = this.y;

            this.angle = Radians.fromDegrees(this.rotation);

            this.t1.rotateAround(this.angle, this.x, this.y);
            this.t2.rotateAround(this.angle, this.x, this.y);
        },
    });

    return Pump;
});

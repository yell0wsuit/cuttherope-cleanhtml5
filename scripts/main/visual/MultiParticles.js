define("visual/MultiParticles", [
    "visual/Particles",
    "core/Rectangle",
    "utils/MathHelper",
    "visual/ImageMultiDrawer",
    "resolution",
], function (Particles, Rectangle, MathHelper, ImageMultiDrawer, resolution) {
    var MultiParticles = Particles.extend({
        init: function (numParticles, texture) {
            this._super(numParticles);

            this.imageGrid = texture;
            this.drawer = new ImageMultiDrawer(texture);
            this.width = resolution.CANVAS_WIDTH;
            this.height = resolution.CANVAS_HEIGHT;
        },
        initParticle: function (particle) {
            var texture = this.imageGrid,
                n = MathHelper.randomRange(0, texture.rects.length - 1),
                tquad = texture.rects[n],
                vquad = new Rectangle(0, 0, 0, 0); // don't draw initially

            this.drawer.setTextureQuad(this.particles.length, tquad, vquad, 1);

            this._super(particle);

            particle.width = tquad.w * particle.size;
            particle.height = tquad.h * particle.size;
        },
        updateParticle: function (particle, index) {
            // update the current position
            this.drawer.vertices[index] = new Rectangle(
                particle.pos.x - particle.width / 2,
                particle.pos.y - particle.height / 2,
                particle.width,
                particle.height
            );

            // update the alpha in the drawer
            this.drawer.alphas[index] = particle.color.a;

            // update the color in the particle system
            this.colors[index] = particle.color;
        },
        removeParticle: function (index) {
            this.drawer.removeQuads(index);
            this._super(index);
        },
        draw: function () {
            this.preDraw();

            /* for debugging rotation: draw a line from origin at 0 degrees
                 var ctx = Canvas.context;
                 ctx.save();
                 ctx.lineWidth = 5;
                 ctx.strokeStyle = "blue";
                 ctx.beginPath();
                 ctx.moveTo(this.drawX, this.drawY);
                 ctx.lineTo(this.drawX, this.drawY - 100);
                 ctx.closePath();
                 ctx.stroke();
                 ctx.restore();
                 */

            this.drawer.draw();
            this.postDraw();
        },
    });

    return MultiParticles;
});

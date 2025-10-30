import Canvas from "@/utils/Canvas";
import Constants from "@/utils/Constants";
import * as GameSceneConstants from "@/gameScene/constants";
import RGBAColor from "@/core/RGBAColor";
import Vector from "@/core/Vector";
import resolution from "@/resolution";

class GameSceneDraw {
    draw() {
        // reset any canvas transformations and clear everything
        const ctx = Canvas.context;
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, resolution.CANVAS_WIDTH, resolution.CANVAS_HEIGHT);

        this.preDraw();
        this.camera.applyCameraTransformation();
        this.back.updateWithCameraPos(this.camera.pos);
        this.back.draw();

        // Scale overlayCut based on resolution to prevent visible seams at HD resolutions
        const overlayCut = Math.ceil((2 * resolution.CANVAS_SCALE) / 0.1875);
        let q;
        let overlayRect;
        let off;
        if (this.mapHeight > resolution.CANVAS_HEIGHT) {
            q = GameSceneConstants.IMG_BGR_01_P2_vert_transition;
            off = this.overlayTexture.offsets[q].y;
            overlayRect = this.overlayTexture.rects[q];

            ctx.drawImage(
                this.overlayTexture.image,
                overlayRect.x,
                overlayRect.y + overlayCut,
                overlayRect.w,
                overlayRect.h - overlayCut * 2,
                0,
                off + overlayCut,
                overlayRect.w,
                overlayRect.h - overlayCut * 2
            );
        }

        for (let i = 0, len = this.drawings.length; i < len; i++) {
            this.drawings[i].draw();
        }

        for (let i = 0, len = this.earthAnims.length; i < len; i++) {
            this.earthAnims[i].draw();
        }

        if (this.pollenDrawer) {
            this.pollenDrawer.draw();
        }
        if (this.gravityButton) {
            this.gravityButton.draw();
        }

        this.support.draw();
        this.target.draw();

        // tutorial text
        for (let i = 0, len = this.tutorials.length; i < len; i++) {
            this.tutorials[i].draw();
        }

        // tutorial images
        for (let i = 0, len = this.tutorialImages.length; i < len; i++) {
            const ti = this.tutorialImages[i];

            // don't draw the level1 arrow now - it needs to be on top
            if (ti.special !== GameSceneConstants.LEVEL1_ARROW_SPECIAL_ID) {
                ti.draw();
            }
        }

        for (let i = 0, len = this.razors.length; i < len; i++) {
            this.razors[i].draw();
        }

        for (let i = 0, len = this.rotatedCircles.length; i < len; i++) {
            this.rotatedCircles[i].draw();
        }

        for (let i = 0, len = this.bubbles.length; i < len; i++) {
            this.bubbles[i].draw();
        }

        for (let i = 0, len = this.pumps.length; i < len; i++) {
            this.pumps[i].draw();
        }

        for (let i = 0, len = this.spikes.length; i < len; i++) {
            this.spikes[i].draw();
        }

        for (let i = 0, len = this.bouncers.length; i < len; i++) {
            this.bouncers[i].draw();
        }

        for (let i = 0, len = this.socks.length; i < len; i++) {
            const sock = this.socks[i];
            sock.y -= GameSceneConstants.SOCK_COLLISION_Y_OFFSET;
            sock.draw();
            sock.y += GameSceneConstants.SOCK_COLLISION_Y_OFFSET;
        }

        const bungees = this.bungees;
        for (let i = 0, len = bungees.length; i < len; i++) {
            bungees[i].drawBack();
        }
        for (let i = 0, len = bungees.length; i < len; i++) {
            bungees[i].draw();
        }

        for (let i = 0, len = this.stars.length; i < len; i++) {
            this.stars[i] && this.stars[i].draw();
        }

        if (!this.noCandy && !this.targetSock) {
            this.candy.x = this.star.pos.x;
            this.candy.y = this.star.pos.y;
            this.candy.draw();

            if (this.candyBlink.currentTimeline != null) {
                this.candyBlink.draw();
            }
        }

        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            if (!this.noCandyL) {
                this.candyL.x = this.starL.pos.x;
                this.candyL.y = this.starL.pos.y;
                this.candyL.draw();
            }

            if (!this.noCandyR) {
                this.candyR.x = this.starR.pos.x;
                this.candyR.y = this.starR.pos.y;
                this.candyR.draw();
            }
        }

        for (let i = 0, len = bungees.length; i < len; i++) {
            const g = bungees[i];
            if (g.hasSpider) {
                g.drawSpider();
            }
        }

        this.aniPool.draw();
        this.drawCuts();
        this.camera.cancelCameraTransformation();
        this.staticAniPool.draw();

        // draw the level1 arrow last so it's on top
        for (let i = 0, len = this.tutorialImages.length; i < len; i++) {
            const ti = this.tutorialImages[i];
            if (ti.special === GameSceneConstants.LEVEL1_ARROW_SPECIAL_ID) {
                ti.draw();
            }
        }

        this.postDraw();
    }
    drawCuts() {
        const maxSize = resolution.CUT_MAX_SIZE;
        for (let i = 0; i < Constants.MAX_TOUCHES; i++) {
            const cuts = this.fingerCuts[i];
            const count = cuts.length;
            if (count > 0) {
                let perpSize = 1;
                let fc = null;
                let pc = 0;
                const v = 0;
                const pts = [];

                for (let k = 0; k < count; k++) {
                    fc = cuts[k];
                    if (k === 0) {
                        pts[pc++] = fc.start;
                    }
                    pts[pc++] = fc.end;
                }

                let p = null;
                const points = 2;
                const numVertices = count * points;
                const vertices = [];
                const bstep = 1 / numVertices;
                let a = 0;

                while (true) {
                    if (a > 1) {
                        a = 1;
                    }

                    p = Vector.calcPathBezier(pts, a);
                    vertices.push(p);

                    if (a === 1) {
                        break;
                    }

                    a += bstep;
                }

                const step = maxSize / numVertices;
                const verts = [];
                for (let k = 0, lenMinusOne = numVertices - 1; k < lenMinusOne; k++) {
                    const startSize = perpSize;
                    const endSize = k === numVertices - 1 ? 1 : perpSize + step;
                    const start = vertices[k];
                    const end = vertices[k + 1];

                    // n is the normalized arrow
                    const n = Vector.subtract(end, start);
                    n.normalize();

                    const rp = Vector.rPerpendicular(n);
                    const lp = Vector.perpendicular(n);

                    if (v === 0) {
                        const srp = Vector.add(start, Vector.multiply(rp, startSize));
                        const slp = Vector.add(start, Vector.multiply(lp, startSize));

                        verts.push(slp);
                        verts.push(srp);
                    }

                    const erp = Vector.add(end, Vector.multiply(rp, endSize));
                    const elp = Vector.add(end, Vector.multiply(lp, endSize));

                    verts.push(elp);
                    verts.push(erp);

                    perpSize += step;
                }

                // draw triangle strip
                Canvas.fillTriangleStrip(verts, RGBAColor.styles.SOLID_OPAQUE);
            }
        }
    }
}

export default GameSceneDraw;

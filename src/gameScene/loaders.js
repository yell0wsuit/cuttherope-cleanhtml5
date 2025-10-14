import MapItem from "@/utils/MapItem";
import resolution from "@/resolution";
import edition from "@/edition";
import LevelState from "@/game/LevelState";
import EarthImage from "@/game/EarthImage";
import Constants from "@/utils/Constants";
import PollenDrawer from "@/game/PollenDrawer";
import Grab from "@/game/Grab";
import Bungee from "@/game/Bungee";
import Bubble from "@/game/Bubble";
import Pump from "@/game/Pump";
import Sock from "@/game/Sock";
import Spikes from "@/game/Spikes";
import RotatedCircle from "@/game/RotatedCircle";
import Bouncer from "@/game/Bouncer";
import GameObject from "@/visual/GameObject";
import CTRGameObject from "@/game/CTRGameObject";
import TutorialText from "@/game/TutorialText";
import Star from "@/game/Star";
import GravityButton from "@/game/GravityButton";
import Drawing from "@/game/Drawing";
import Animation from "@/visual/Animation";
import Timeline from "@/visual/Timeline";
import RGBAColor from "@/core/RGBAColor";
import KeyFrame from "@/visual/KeyFrame";
import Alignment from "@/core/Alignment";
import ResourceId from "@/resources/ResourceId";
import MathHelper from "@/utils/MathHelper";
import ImageElement from "@/visual/ImageElement";
import Rectangle from "@/core/Rectangle";
import Vector from "@/core/Vector";
import Radians from "@/utils/Radians";
import ActionType from "@/visual/ActionType";
import settings from "@/game/CTRSettings";

import {
    PartsType,
    LEVEL1_ARROW_SPECIAL_ID,
    SOCK_COLLISION_Y_OFFSET,
    IMG_OBJ_CANDY_01_part_1,
    IMG_OBJ_CANDY_01_part_2,
    IMG_OBJ_STAR_DISAPPEAR_Frame_1,
    IMG_OBJ_STAR_DISAPPEAR_Frame_13,
    IMG_OBJ_BUBBLE_ATTACHED_bubble,
    IMG_OBJ_BUBBLE_ATTACHED_stain_01,
    IMG_OBJ_BUBBLE_ATTACHED_stain_03,
    CharAnimation,
    BLINK_SKIP,
    IMG_CHAR_ANIMATIONS_idle_start,
    IMG_CHAR_ANIMATIONS_idle_end,
    IMG_CHAR_ANIMATIONS_idle2_start,
    IMG_CHAR_ANIMATIONS_idle2_end,
    IMG_CHAR_ANIMATIONS_idle3_start,
    IMG_CHAR_ANIMATIONS_idle3_end,
    IMG_CHAR_ANIMATIONS2_excited_start,
    IMG_CHAR_ANIMATIONS2_excited_end,
    IMG_CHAR_ANIMATIONS2_puzzled_start,
    IMG_CHAR_ANIMATIONS2_puzzled_end,
    IMG_CHAR_ANIMATIONS2_greeting_start,
    IMG_CHAR_ANIMATIONS2_greeting_end,
    IMG_CHAR_ANIMATIONS3_fail_start,
    IMG_CHAR_ANIMATIONS3_fail_end,
    IMG_CHAR_ANIMATIONS_mouth_close_start,
    IMG_CHAR_ANIMATIONS_mouth_close_end,
    IMG_CHAR_ANIMATIONS_mouth_open_start,
    IMG_CHAR_ANIMATIONS_mouth_open_end,
    IMG_CHAR_ANIMATIONS_chew_start,
    IMG_CHAR_ANIMATIONS_chew_end,
    IMG_CHAR_ANIMATIONS_blink_start,
    IMG_CHAR_ANIMATIONS_blink_end,
} from "./constants";
import { sharedState } from "./sharedState";

const loaderMethods = {
    loadMap(map) {
        const layers = [];

        // get all the layers for this map
        for (const layerName in map) {
            if (map.hasOwnProperty(layerName)) {
                layers.push(map[layerName]);
            }
        }

        // first pass handles basic settings and candy
        for (let i = 0, numLayers = layers.length; i < numLayers; i++) {
            const children = layers[i];
            const numChildren = children.length;
            for (let j = 0; j < numChildren; j++) {
                const child = children[j];
                switch (child.name) {
                    case MapItem.MAP:
                        this.loadMapSettings(child);
                        break;
                    case MapItem.GAME_DESIGN:
                        this.loadGameDesign(child);
                        break;
                    case MapItem.CANDY_L:
                        this.loadCandyL(child);
                        break;
                    case MapItem.CANDY_R:
                        this.loadCandyR(child);
                        break;
                    case MapItem.CANDY:
                        this.loadCandy(child);
                        break;
                }
            }
        }

        // second pass handles the rest of the game elements
        for (let i = 0, numLayers = layers.length; i < numLayers; i++) {
            const children = layers[i];
            const numChildren = children.length;
            for (let j = 0; j < numChildren; j++) {
                const child = children[j];
                switch (child.name) {
                    case MapItem.GRAVITY_SWITCH:
                        this.loadGravitySwitch(child);
                        break;
                    case MapItem.STAR:
                        this.loadStar(child);
                        break;
                    case MapItem.TUTORIAL_TEXT:
                        this.loadTutorialText(child);
                        break;
                    case MapItem.TUTORIAL_01:
                    case MapItem.TUTORIAL_02:
                    case MapItem.TUTORIAL_03:
                    case MapItem.TUTORIAL_04:
                    case MapItem.TUTORIAL_05:
                    case MapItem.TUTORIAL_06:
                    case MapItem.TUTORIAL_07:
                    case MapItem.TUTORIAL_08:
                    case MapItem.TUTORIAL_09:
                    case MapItem.TUTORIAL_10:
                    case MapItem.TUTORIAL_11:
                    case MapItem.TUTORIAL_12:
                    case MapItem.TUTORIAL_13:
                    case MapItem.TUTORIAL_14:
                        this.loadTutorialImage(child);
                        break;
                    case MapItem.BUBBLE:
                        this.loadBubble(child);
                        break;
                    case MapItem.PUMP:
                        this.loadPump(child);
                        break;
                    case MapItem.SOCK:
                        this.loadSock(child);
                        break;
                    case MapItem.SPIKE_1:
                    case MapItem.SPIKE_2:
                    case MapItem.SPIKE_3:
                    case MapItem.SPIKE_4:
                    case MapItem.ELECTRO:
                        this.loadSpike(child);
                        break;
                    case MapItem.ROTATED_CIRCLE:
                        this.loadRotatedCircle(child);
                        break;
                    case MapItem.BOUNCER1:
                    case MapItem.BOUNCER2:
                        this.loadBouncer(child);
                        break;
                    case MapItem.GRAB:
                        this.loadGrab(child);
                        break;
                    case MapItem.TARGET:
                        this.loadTarget(child);
                        break;
                    case MapItem.HIDDEN_01:
                    case MapItem.HIDDEN_02:
                    case MapItem.HIDDEN_03:
                        this.loadHidden(child);
                        break;
                }
            }
        }
    },

    loadMapSettings(item) {
        this.mapWidth = item.width;
        this.mapHeight = item.height;
        this.PMX = (resolution.CANVAS_WIDTH - this.mapWidth * this.PM) / 2;
        this.mapWidth *= this.PM;
        this.mapHeight *= this.PM;

        if (edition.showEarth[LevelState.pack]) {
            if (this.mapWidth > resolution.CANVAS_WIDTH) {
                this.earthAnims.push(new EarthImage(resolution.CANVAS_WIDTH, 0));
            }
            if (this.mapHeight > resolution.CANVAS_HEIGHT) {
                this.earthAnims.push(new EarthImage(0, resolution.CANVAS_HEIGHT));
            }
            this.earthAnims.push(new EarthImage(0, 0));
        }
    },

    loadGameDesign(item) {
        this.special = item.special || 0;
        this.ropePhysicsSpeed = item.ropePhysicsSpeed;
        this.nightLevel = item.nightLevel;
        this.twoParts = item.twoParts ? PartsType.SEPARATE : PartsType.NONE;
        this.ropePhysicsSpeed *= resolution.PHYSICS_SPEED_MULTIPLIER;
    },

    loadGrab(item) {
        const gx = item.x * this.PM + this.PMX;
        const gy = item.y * this.PM + this.PMY;
        const l = item.length * this.PM;
        let r = item.radius;
        const wheel = item.wheel;
        const kickable = item.kickable;
        const invisible = item.invisible;
        const ml = item.moveLength * this.PM || -1;
        const v = item.moveVertical;
        const o = item.moveOffset * this.PM || 0;
        const spider = item.spider;
        const left = item.part === "L";
        const hidePath = item.hidePath;
        const gun = item.gun;
        const g = new Grab();

        g.x = gx;
        g.y = gy;
        g.wheel = wheel;
        g.gun = gun;
        g.kickable = kickable;
        g.invisible = invisible;
        g.setSpider(spider);
        g.parseMover(item);

        if (g.mover) {
            g.setBee();

            if (!hidePath) {
                const d = 3;
                const isCircle = item.path[0] === "R";

                // create pollen drawer if needed
                if (!this.pollenDrawer) {
                    this.pollenDrawer = new PollenDrawer();
                }

                for (let i = 0, len = g.mover.path.length - 1; i < len; i++) {
                    if (!isCircle || i % d === 0) {
                        this.pollenDrawer.fillWithPollenFromPath(i, i + 1, g);
                    }
                }

                if (g.mover.path.length > 2) {
                    this.pollenDrawer.fillWithPollenFromPath(0, g.mover.path.length - 1, g);
                }
            }
        }

        if (r !== Constants.UNDEFINED) r *= this.PM;

        if (r === Constants.UNDEFINED && !gun) {
            let tail = this.star;
            if (this.twoParts !== PartsType.NONE) {
                tail = left ? this.starL : this.starR;
            }

            const b = new Bungee(null, gx, gy, tail, tail.pos.x, tail.pos.y, l);
            b.bungeeAnchor.pin.copyFrom(b.bungeeAnchor.pos);
            g.setRope(b);
            this.attachCandy();
        }

        g.setRadius(r);
        g.setMoveLength(ml, v, o);

        this.bungees.push(g);
    },

    loadCandyL(item) {
        this.starL.pos.x = item.x * this.PM + this.PMX;
        this.starL.pos.y = item.y * this.PM + this.PMY;

        this.candyL = new GameObject();
        this.candyL.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candyL.setTextureQuad(IMG_OBJ_CANDY_01_part_1);
        this.candyL.scaleX = this.candyL.scaleY = 0.71;
        this.candyL.passTransformationsToChilds = false;
        this.candyL.doRestoreCutTransparency();
        this.candyL.anchor = Alignment.CENTER;
        this.candyL.x = this.starL.pos.x;
        this.candyL.y = this.starL.pos.y;
        this.candyL.bb = Rectangle.copy(resolution.CANDY_LR_BB);
    },

    loadCandyR(item) {
        this.starR.pos.x = item.x * this.PM + this.PMX;
        this.starR.pos.y = item.y * this.PM + this.PMY;

        this.candyR = new GameObject();
        this.candyR.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candyR.setTextureQuad(IMG_OBJ_CANDY_01_part_2);
        this.candyR.scaleX = this.candyR.scaleY = 0.71;
        this.candyR.passTransformationsToChilds = false;
        this.candyR.doRestoreCutTransparency();
        this.candyR.anchor = Alignment.CENTER;
        this.candyR.x = this.starR.pos.x;
        this.candyR.y = this.starR.pos.y;
        this.candyR.bb = Rectangle.copy(resolution.CANDY_LR_BB);
    },

    loadCandy(item) {
        this.star.pos.x = item.x * this.PM + this.PMX;
        this.star.pos.y = item.y * this.PM + this.PMY;
    },

    loadGravitySwitch(item) {
        this.gravityButton = new GravityButton();
        this.gravityButton.onButtonPressed = this.onButtonPressed.bind(this);
        this.gravityButton.visible = false;
        this.gravityButton.touchable = false;
        this.addChild(this.gravityButton);
        this.gravityButton.x = item.x * this.PM + this.PMX;
        this.gravityButton.y = item.y * this.PM + this.PMY;
        this.gravityButton.anchor = Alignment.CENTER;
    },

    loadStar(item) {
        const s = new Star();
        s.initTextureWithId(ResourceId.IMG_OBJ_STAR_IDLE);
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.timeout = item.timeout;
        s.createAnimations();

        s.bb = Rectangle.copy(resolution.STAR_BB);
        s.parseMover(item);

        // let stars move the starting position of mover
        s.update(0);

        const l = this.stars.push(s);

        // init the star disappear animations
        const starDisappear = (sharedState.starDisappearPool[l - 1] = new Animation());
        starDisappear.initTextureWithId(ResourceId.IMG_OBJ_STAR_DISAPPEAR);
        starDisappear.doRestoreCutTransparency();
        starDisappear.anchor = Alignment.CENTER;

        starDisappear.addAnimationDelay(
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_OBJ_STAR_DISAPPEAR_Frame_1,
            IMG_OBJ_STAR_DISAPPEAR_Frame_13
        );
    },

    loadTutorialText(item) {
        if (this.shouldSkipTutorialElement(item)) {
            return;
        }

        if (item.text == null || item.text === "") {
            return;
        }

        const t = new TutorialText();
        t.x = item.x * this.PM + this.PMX;
        t.y = item.y * this.PM + this.PMY;
        t.special = item.special || 0;
        t.align = Alignment.HCENTER;

        const text = item.text;
        const textWidth = Math.ceil(item.width * this.PM);
        t.setText(ResourceId.FNT_SMALL_FONT, text, textWidth, Alignment.HCENTER);
        t.color = RGBAColor.transparent.copy();

        const tl = new Timeline();
        const isFirstLevel = LevelState.pack === 0 && LevelState.level === 0;
        tl.addKeyFrame(KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0));
        tl.addKeyFrame(KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1));
        tl.addKeyFrame(
            KeyFrame.makeColor(
                RGBAColor.solidOpaque.copy(),
                KeyFrame.TransitionType.LINEAR,
                isFirstLevel ? 10 : 5
            )
        );
        tl.addKeyFrame(KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5));
        t.addTimelineWithID(tl, 0);

        if (t.special === 0) {
            t.playTimeline(0);
        }

        this.tutorials.push(t);
    },

    loadTutorialImage(item) {
        if (this.shouldSkipTutorialElement(item)) {
            return;
        }

        const v = item.name - MapItem.TUTORIAL_01; // gets the tutorial number
        const s = new CTRGameObject();

        s.initTextureWithId(ResourceId.IMG_TUTORIAL_SIGNS);
        s.setTextureQuad(v);
        s.color = RGBAColor.transparent.copy();
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.rotation = item.angle || 0;
        s.special = item.special || 0;
        s.parseMover(item);

        const tl = new Timeline();
        tl.addKeyFrame(KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0));
        tl.addKeyFrame(KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1));

        if (LevelState.pack === 0 && LevelState.level === 0) {
            tl.addKeyFrame(KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 10));
        } else {
            tl.addKeyFrame(
                KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 5.2)
            );
        }

        tl.addKeyFrame(KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5));
        s.addTimelineWithID(tl, 0);

        if (s.special === 0) {
            s.playTimeline(0);
        } else if (s.special === LEVEL1_ARROW_SPECIAL_ID) {
            const tl2 = new Timeline();
            tl2.addKeyFrame(KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0));
            tl2.addKeyFrame(KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0.5));
            tl2.addKeyFrame(KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1));
            tl2.addKeyFrame(KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1.1));
            tl2.addKeyFrame(KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5));

            tl2.addKeyFrame(KeyFrame.makePos(s.x, s.y, KeyFrame.TransitionType.LINEAR, 0));
            tl2.addKeyFrame(KeyFrame.makePos(s.x, s.y, KeyFrame.TransitionType.LINEAR, 0.5));
            tl2.addKeyFrame(KeyFrame.makePos(s.x, s.y, KeyFrame.TransitionType.LINEAR, 1));
            tl2.addKeyFrame(
                KeyFrame.makePos(
                    s.x + resolution.TUTORIAL_HAND_TARGET_X_1,
                    s.y,
                    KeyFrame.TransitionType.LINEAR,
                    0.5
                )
            );
            tl2.addKeyFrame(
                KeyFrame.makePos(
                    s.x + resolution.TUTORIAL_HAND_TARGET_X_2,
                    s.y,
                    KeyFrame.TransitionType.LINEAR,
                    0.5
                )
            );

            tl2.loopsLimit = 2;
            tl2.loopType = Timeline.LoopType.REPLAY;

            s.addTimelineWithID(tl2, 1);
            s.playTimeline(1);
        }

        this.tutorialImages.push(s);
    },

    loadHidden(item) {
        const v = item.name - MapItem.HIDDEN_01;
        const drawingId = item.drawing - 1;

        const alreadyUnlocked = false;
        if (!alreadyUnlocked && !edition.disableHiddenDrawings) {
            const s = new Drawing(v, drawingId);
            s.x = item.x * this.PM + this.PMX;
            s.y = item.y * this.PM + this.PMY;
            s.rotation = item.angle || 0;
            this.drawings.push(s);
        }
    },

    loadBubble(item) {
        const at = MathHelper.randomRange(
            IMG_OBJ_BUBBLE_ATTACHED_stain_01,
            IMG_OBJ_BUBBLE_ATTACHED_stain_03
        );
        const s = new Bubble();
        s.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
        s.setTextureQuad(at);
        s.doRestoreCutTransparency();

        s.bb = Rectangle.copy(resolution.BUBBLE_BB);
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.anchor = Alignment.CENTER;
        s.popped = false;

        const bubble = new ImageElement();
        bubble.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_ATTACHED);
        bubble.setTextureQuad(IMG_OBJ_BUBBLE_ATTACHED_bubble);
        bubble.doRestoreCutTransparency();
        bubble.parentAnchor = bubble.anchor = Alignment.CENTER;
        s.addChild(bubble);
        this.bubbles.push(s);
    },

    loadPump(item) {
        const s = new Pump();
        s.initTextureWithId(ResourceId.IMG_OBJ_PUMP);
        s.doRestoreCutTransparency();
        s.addAnimationWithDelay(0.05, Timeline.LoopType.NO_LOOP, 4, [1, 2, 3, 0]);

        s.bb = Rectangle.copy(resolution.PUMP_BB);
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.rotation = item.angle + 90;
        s.updateRotation();
        s.anchor = Alignment.CENTER;
        this.pumps.push(s);
    },

    loadSock(item) {
        const s = new Sock();
        s.initTextureWithId(ResourceId.IMG_OBJ_SOCKS);
        s.scaleX = s.scaleY = 0.7;
        s.createAnimations();
        s.doRestoreCutTransparency();

        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.group = item.group;

        s.anchor = Alignment.TOP | Alignment.HCENTER;
        s.rotationCenterY -= s.height / 2 - SOCK_COLLISION_Y_OFFSET;

        s.setTextureQuad(
            s.group === 0 ? Sock.Quads.IMG_OBJ_SOCKS_hat_01 : Sock.Quads.IMG_OBJ_SOCKS_hat_02
        );

        s.state = Sock.StateType.IDLE;
        s.parseMover(item);
        s.rotation += 90;
        if (s.mover) {
            s.mover.angle += 90;
        }

        s.updateRotation();
        this.socks.push(s);
    },

    loadSpike(item) {
        const px = item.x * this.PM + this.PMX;
        const py = item.y * this.PM + this.PMY;
        const w = item.size;
        const a = parseFloat(item.angle) || 0;
        const tg = item.toggled === false ? Constants.UNDEFINED : item.toggled || Constants.UNDEFINED;
        const s = new Spikes(px, py, w, a, tg);
        s.parseMover(item);

        if (tg) {
            s.onRotateButtonPressed = this.rotateAllSpikesWithId.bind(this);
        }

        if (item.name === MapItem.ELECTRO) {
            s.electro = true;
            s.initialDelay = item.initialDelay;
            s.onTime = item.onTime;
            s.offTime = item.offTime;
            s.electroTimer = 0;

            s.turnElectroOff();
            s.electroTimer += s.initialDelay;
            s.updateRotation();
        } else {
            s.electro = false;
        }
        this.spikes.push(s);
    },

    loadRotatedCircle(item) {
        const px = item.x * this.PM + this.PMX;
        const py = item.y * this.PM + this.PMY;
        const size = item.size;
        const handleAngle = parseFloat(item.handleAngle) || 0;
        const handleRadians = Radians.fromDegrees(handleAngle);
        const oneHandle = item.oneHandle;
        const l = new RotatedCircle();

        l.anchor = Alignment.CENTER;
        l.x = px;
        l.y = py;
        l.rotation = handleAngle;
        l.handle1 = new Vector(l.x - size * this.PM, l.y);
        l.handle2 = new Vector(l.x + size * this.PM, l.y);

        l.handle1.rotateAround(handleRadians, l.x, l.y);
        l.handle2.rotateAround(handleRadians, l.x, l.y);

        l.setSize(size);
        l.setHasOneHandle(oneHandle);

        this.rotatedCircles.push(l);
    },

    loadBouncer(item) {
        const px = item.x * this.PM + this.PMX;
        const py = item.y * this.PM + this.PMY;
        const w = item.size;
        const a = item.angle;
        const bouncer = new Bouncer(px, py, w, a);
        bouncer.parseMover(item);
        this.bouncers.push(bouncer);
    },

    loadTarget(item) {
        const target = new GameObject();
        this.target = target;

        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS);
        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS2);
        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS3);

        target.doRestoreCutTransparency();

        target.bb = Rectangle.copy(resolution.TARGET_BB);
        target.bbOverride = Rectangle.copy(resolution.TARGET_BB);
        const originalPlayTimeline = target.playTimeline;
        target.playTimeline = function (index) {
            originalPlayTimeline.call(this, index);
            if (this.bbOverride) {
                this.bb = Rectangle.copy(this.bbOverride);
                if (this.rbb) {
                    this.rbb = new this.rbb.constructor(this.bb.x, this.bb.y, this.bb.w, this.bb.h);
                }
            }
        };
        target.drawPosIncrement = 0.0001;

        target.addAnimationEndpoints(
            CharAnimation.GREETING,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS2_greeting_start,
            IMG_CHAR_ANIMATIONS2_greeting_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS2
        );
        target.addAnimationEndpoints(
            CharAnimation.IDLE,
            0.05,
            Timeline.LoopType.REPLAY,
            IMG_CHAR_ANIMATIONS_idle_start,
            IMG_CHAR_ANIMATIONS_idle_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            CharAnimation.IDLE2,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS_idle2_start,
            IMG_CHAR_ANIMATIONS_idle2_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        const idle3Sequence = [];
        for (let frame = IMG_CHAR_ANIMATIONS_idle3_start; frame <= IMG_CHAR_ANIMATIONS_idle3_end; frame++) {
            idle3Sequence.push(frame);
        }
        for (let frame = IMG_CHAR_ANIMATIONS_idle3_start; frame <= IMG_CHAR_ANIMATIONS_idle3_end; frame++) {
            idle3Sequence.push(frame);
        }
        target.addAnimationSequence(
            CharAnimation.IDLE3,
            0.05,
            Timeline.LoopType.NO_LOOP,
            idle3Sequence.length,
            idle3Sequence,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            CharAnimation.EXCITED,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS2_excited_start,
            IMG_CHAR_ANIMATIONS2_excited_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS2
        );
        target.addAnimationEndpoints(
            CharAnimation.PUZZLED,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS2_puzzled_start,
            IMG_CHAR_ANIMATIONS2_puzzled_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS2
        );
        target.addAnimationEndpoints(
            CharAnimation.FAIL,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS3_fail_start,
            IMG_CHAR_ANIMATIONS3_fail_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS3
        );
        target.addAnimationEndpoints(
            CharAnimation.WIN,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS_mouth_close_start,
            IMG_CHAR_ANIMATIONS_mouth_close_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            CharAnimation.MOUTH_OPEN,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS_mouth_open_start,
            IMG_CHAR_ANIMATIONS_mouth_open_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            CharAnimation.MOUTH_CLOSE,
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_CHAR_ANIMATIONS_mouth_close_start,
            IMG_CHAR_ANIMATIONS_mouth_close_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            CharAnimation.CHEW,
            0.05,
            Timeline.LoopType.REPLAY,
            IMG_CHAR_ANIMATIONS_chew_start,
            IMG_CHAR_ANIMATIONS_chew_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.switchToAnimation(CharAnimation.CHEW, CharAnimation.WIN, 0.05);
        target.switchToAnimation(CharAnimation.PUZZLED, CharAnimation.MOUTH_CLOSE, 0.05);
        target.switchToAnimation(CharAnimation.IDLE, CharAnimation.GREETING, 0.05);
        target.switchToAnimation(CharAnimation.IDLE, CharAnimation.IDLE2, 0.05);
        target.switchToAnimation(CharAnimation.IDLE, CharAnimation.IDLE3, 0.05);
        target.switchToAnimation(CharAnimation.IDLE, CharAnimation.EXCITED, 0.05);
        target.switchToAnimation(CharAnimation.IDLE, CharAnimation.PUZZLED, 0.05);

        if (settings.showGreeting) {
            this.dd.callObject(this, this.showGreeting, null, 2);
            settings.showGreeting = false;
        }

        target.playTimeline(CharAnimation.IDLE);

        const idle = target.getTimeline(CharAnimation.IDLE);
        idle.onKeyFrame = this.onIdleOmNomKeyFrame.bind(this);

        target.setPause(
            IMG_CHAR_ANIMATIONS_mouth_open_end - IMG_CHAR_ANIMATIONS_mouth_open_start,
            CharAnimation.MOUTH_OPEN
        );
        this.blink = new Animation();
        this.blink.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS);
        this.blink.parentAnchor = Alignment.TOP | Alignment.LEFT;

        this.blink.visible = false;
        this.blink.addAnimationSequence(0, 0.05, Timeline.LoopType.NO_LOOP, 4, [
            IMG_CHAR_ANIMATIONS_blink_start,
            IMG_CHAR_ANIMATIONS_blink_end,
            IMG_CHAR_ANIMATIONS_blink_end,
            IMG_CHAR_ANIMATIONS_blink_end,
        ]);
        this.blink.setAction(ActionType.SET_VISIBLE, this.blink, 0, 0, 2, 0);
        this.blinkTimer = BLINK_SKIP;

        this.blink.doRestoreCutTransparency();
        target.addChild(this.blink);

        const supportQuadID = edition.supports[LevelState.pack];
        this.support = ImageElement.create(ResourceId.IMG_CHAR_SUPPORTS, supportQuadID);
        this.support.doRestoreCutTransparency();
        this.support.anchor = Alignment.CENTER;

        const sx = item.x;
        const sy = item.y;

        this.target.x = this.support.x = (sx * this.PM + this.PMX) | 0;
        this.target.y = this.support.y = (sy * this.PM + this.PMY) | 0;

        this.idlesTimer = MathHelper.randomRange(5, 20);
    },
};

export default loaderMethods;

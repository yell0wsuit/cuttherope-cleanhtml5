import Animation from "@/visual/Animation";
import Alignment from "@/core/Alignment";
import Bouncer from "@/game/Bouncer";
import Bubble from "@/game/Bubble";
import CTRGameObject from "@/game/CTRGameObject";
import Drawing from "@/game/Drawing";
import EarthImage from "@/game/EarthImage";
import GameObject from "@/visual/GameObject";
import Grab from "@/game/Grab";
import GravityButton from "@/game/GravityButton";
import ImageElement from "@/visual/ImageElement";
import Log from "@/utils/Log";
import MapItem, { getMapItemDefinitionById } from "@/utils/MapItem";
import type { MapItemDefinition } from "@/utils/MapItem";
import MathHelper from "@/utils/MathHelper";
import Pump from "@/game/Pump";
import Rectangle from "@/core/Rectangle";
import Quad2D from "@/core/Quad2D";
import ResourceId from "@/resources/ResourceId";
import Radians from "@/utils/Radians";
import RotatedCircle from "@/game/RotatedCircle";
import Sock from "@/game/Sock";
import Spikes from "@/game/Spikes";
import Star from "@/game/Star";
import Timeline from "@/visual/Timeline";
import TutorialText from "@/game/TutorialText";
import Vector from "@/core/Vector";
import RGBAColor from "@/core/RGBAColor";
import * as GameSceneConstants from "@/gameScene/constants";
import Constants from "@/utils/Constants";
import resolution from "@/resolution";
import LevelState from "@/game/LevelState";
import edition from "@/config/editions/net-edition";
import { IS_XMAS, IS_JANUARY } from "@/resources/ResData";
import Bungee from "@/game/Bungee";
import PollenDrawer from "@/game/PollenDrawer";
import settings from "@/game/CTRSettings";
import KeyFrame from "@/visual/KeyFrame";
import ActionType from "@/visual/ActionType";
import BoxType from "@/ui/BoxType";
import GameSceneInit from "./init";
import type { TimelineKeyFrameListener } from "@/visual/TimelineTypes";

type MapLayerItem = Record<string, any>;
type MapData = Record<string, MapLayerItem[]>;

class GameSceneLoaders extends GameSceneInit {
    protected onIdleOmNomKeyFrame(..._args: Parameters<TimelineKeyFrameListener>): void {}

    protected onPaddingtonIdleKeyFrame(..._args: Parameters<TimelineKeyFrameListener>): void {}

    loadMap(map: MapData | null | undefined): void {
        if (!map) {
            return;
        }

        const layers: MapLayerItem[][] = [];

        for (const layerName of Object.keys(map)) {
            const layer = map[layerName];
            if (Array.isArray(layer)) {
                layers.push(layer as MapLayerItem[]);
            }
        }

        const queue: Array<{ item: MapLayerItem; definition: MapItemDefinition; order: number }> = [];
        let order = 0;

        for (const children of layers) {
            for (const child of children) {
                const resolvedId = typeof child.name === "number" ? child.name : Number(child.name);
                const definition = getMapItemDefinitionById(resolvedId);

                if (!definition) {
                    Log.alert(`Unknown map item id: ${child.name}`);
                    continue;
                }

                queue.push({
                    item: child,
                    definition,
                    order: order++,
                });
            }
        }

        queue
            .sort((a, b) => {
                const priorityA = a.definition.priority ?? 1;
                const priorityB = b.definition.priority ?? 1;

                if (priorityA === priorityB) {
                    return a.order - b.order;
                }

                return priorityA - priorityB;
            })
            .forEach(({ item, definition }) => {
                const loaderRef = definition.loader;

                if (typeof loaderRef !== "string") {
                    Log.alert(`Loader not implemented for map item: ${definition.key}`);
                    return;
                }

                const loadFn = (this as Record<string, unknown>)[loaderRef];

                if (typeof loadFn !== "function") {
                    Log.alert(`Loader not implemented for map item: ${definition.key}`);
                    return;
                }

                (loadFn as (item: MapLayerItem, definition: MapItemDefinition) => void).call(
                    this,
                    item,
                    definition
                );
            });
    }
    /**
     * Loads the map settings for the map node (inside settings layer)
     */
    loadMapSettings(item: MapLayerItem): void {
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
    }
    loadGameDesign(item: MapLayerItem): void {
        this.special = item.special || 0;
        this.ropePhysicsSpeed = item.ropePhysicsSpeed;
        this.nightLevel = item.nightLevel;
        this.twoParts = item.twoParts
            ? GameSceneConstants.PartsType.SEPARATE
            : GameSceneConstants.PartsType.NONE;
        this.ropePhysicsSpeed *= resolution.PHYSICS_SPEED_MULTIPLIER;
    }
    loadGrab(item: MapLayerItem): void {
        const gx = item.x * this.PM + this.PMX;
        const gy = item.y * this.PM + this.PMY;
        const l = item.length * this.PM;
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
        let r = item.radius;

        g.x = gx;
        g.y = gy;
        g.wheel = wheel;
        g.gun = gun;
        g.kickable = kickable;
        g.invisible = invisible;
        g.setSpider(spider);
        g.parseMover(item as Parameters<typeof g.parseMover>[0]);

        if (g.mover) {
            g.setBee();

            if (!hidePath) {
                const d = 3,
                    isCircle = item.path[0] === "R";

                // create pollen drawer if needed
                if (!this.pollenDrawer) {
                    this.pollenDrawer = new PollenDrawer();
                }

                for (let i = 0, len = g.mover.path.length - 1; i < len; i++) {
                    if (!isCircle || i % d === 0) {
                        this.pollenDrawer.fillWithPollenFromPath(
                            i,
                            i + 1,
                            g as Grab & { mover: { path: Vector[] } }
                        );
                    }
                }

                if (g.mover.path.length > 2) {
                    this.pollenDrawer.fillWithPollenFromPath(
                        0,
                        g.mover.path.length - 1,
                        g as Grab & { mover: { path: Vector[] } }
                    );
                }
            }
        }

        if (r !== Constants.UNDEFINED) r *= this.PM;

        if (r === Constants.UNDEFINED && !gun) {
            let tail = this.star;
            if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
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
    }
    loadCandyL(item: MapLayerItem): void {
        this.starL.pos.x = item.x * this.PM + this.PMX;
        this.starL.pos.y = item.y * this.PM + this.PMY;

        this.candyL = new GameObject();
        this.candyL.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candyL.setTextureQuad(GameSceneConstants.IMG_OBJ_CANDY_01_part_1);
        this.candyL.scaleX = this.candyL.scaleY = 0.71;
        this.candyL.passTransformationsToChilds = false;
        this.candyL.doRestoreCutTransparency();
        this.candyL.anchor = Alignment.CENTER;
        this.candyL.x = this.starL.pos.x;
        this.candyL.y = this.starL.pos.y;
        this.candyL.bb = Rectangle.copy(resolution.CANDY_LR_BB);
    }
    loadCandyR(item: MapLayerItem): void {
        this.starR.pos.x = item.x * this.PM + this.PMX;
        this.starR.pos.y = item.y * this.PM + this.PMY;

        this.candyR = new GameObject();
        this.candyR.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candyR.setTextureQuad(GameSceneConstants.IMG_OBJ_CANDY_01_part_2);
        this.candyR.scaleX = this.candyR.scaleY = 0.71;
        this.candyR.passTransformationsToChilds = false;
        this.candyR.doRestoreCutTransparency();
        this.candyR.anchor = Alignment.CENTER;
        this.candyR.x = this.starR.pos.x;
        this.candyR.y = this.starR.pos.y;
        this.candyR.bb = Rectangle.copy(resolution.CANDY_LR_BB);
    }
    loadCandy(item: MapLayerItem): void {
        this.star.pos.x = item.x * this.PM + this.PMX;
        this.star.pos.y = item.y * this.PM + this.PMY;
    }
    loadGravitySwitch(item: MapLayerItem): void {
        this.gravityButton = new GravityButton();
        this.gravityButton.onButtonPressed = this.onButtonPressed.bind(this);
        this.gravityButton.visible = false;
        this.gravityButton.touchable = false;
        this.addChild(this.gravityButton);
        this.gravityButton.x = item.x * this.PM + this.PMX;
        this.gravityButton.y = item.y * this.PM + this.PMY;
        this.gravityButton.anchor = Alignment.CENTER;
    }
    loadStar(item: MapLayerItem): void {
        const s = new Star();
        s.initTextureWithId(ResourceId.IMG_OBJ_STAR_IDLE);
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.timeout = item.timeout;
        s.createAnimations();

        s.bb = Rectangle.copy(resolution.STAR_BB);
        s.parseMover(item as Parameters<typeof s.parseMover>[0]);

        // let stars move the starting position of mover
        s.update(0);

        const l = this.stars.push(s);

        //init the star disappear animations
        const sd = (this.starDisappearPool[l - 1] = new Animation());
        sd.initTextureWithId(ResourceId.IMG_OBJ_STAR_DISAPPEAR);
        sd.doRestoreCutTransparency();
        sd.anchor = Alignment.CENTER;

        sd.addAnimationDelay(
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_OBJ_STAR_DISAPPEAR_Frame_1,
            GameSceneConstants.IMG_OBJ_STAR_DISAPPEAR_Frame_13
        );
    }
    loadTutorialText(item: MapLayerItem): void {
        if (this.shouldSkipTutorialElement(item as { locale: string })) {
            return;
        }

        if (item.text == null || item.text === "") {
            Log.debug("Missing tutorial text");
            return;
        }

        const t = new TutorialText();
        t.x = item.x * this.PM + this.PMX;
        t.y = item.y * this.PM + this.PMY;
        t.special = item.special || 0;
        (t as TutorialText & { align?: Alignment }).align = Alignment.HCENTER;
        //t.scaleX = 1.3;
        //t.scaleY = 1.3;

        const text = item.text,
            textWidth = Math.ceil(item.width * this.PM);
        t.setText(ResourceId.FNT_SMALL_FONT, text, textWidth, Alignment.HCENTER);
        t.color = RGBAColor.transparent.copy();

        const tl = new Timeline(),
            isFirstLevel = LevelState.pack === 0 && LevelState.level === 0;
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(
                RGBAColor.solidOpaque.copy(),
                KeyFrame.TransitionType.LINEAR,
                isFirstLevel ? 10 : 5
            )
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5)
        );
        t.addTimelineWithID(tl, 0);

        if (t.special === 0) {
            t.playTimeline(0);
        }

        this.tutorials.push(t);
    }
    loadTutorialImage(item: MapLayerItem): void {
        if (this.shouldSkipTutorialElement(item as { locale: string })) {
            return;
        }

        const v = item.name - MapItem.TUTORIAL_01.id, // gets the tutorial number
            s = new CTRGameObject() as CTRGameObject & { special: number };

        s.initTextureWithId(ResourceId.IMG_TUTORIAL_SIGNS);
        s.setTextureQuad(v);
        s.color = RGBAColor.transparent.copy();
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.rotation = item.angle || 0;
        s.special = item.special || 0;
        s.parseMover(item as Parameters<typeof s.parseMover>[0]);

        const tl = new Timeline();
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1)
        );

        if (LevelState.pack === 0 && LevelState.level === 0) {
            tl.addKeyFrame(
                KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 10)
            );
        } else {
            tl.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.solidOpaque.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    5.2
                )
            );
        }

        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5)
        );
        s.addTimelineWithID(tl, 0);

        if (s.special === 0) {
            s.playTimeline(0);
        } else if (s.special === GameSceneConstants.LEVEL1_ARROW_SPECIAL_ID) {
            const tl2 = new Timeline();
            tl2.addKeyFrame(
                KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0)
            );
            tl2.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.solidOpaque.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    0.5
                )
            );
            tl2.addKeyFrame(
                KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1)
            );
            tl2.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.solidOpaque.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    1.1
                )
            );
            tl2.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.transparent.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    0.5
                )
            );

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
    }
    loadHidden(item: MapLayerItem): void {
        // get the hidden image index
        const v = item.name - MapItem.HIDDEN_01.id,
            drawingId = item.drawing - 1;

        const alreadyUnlocked = false;
        if (!alreadyUnlocked && !edition.disableHiddenDrawings) {
            const s = new Drawing(v, drawingId);
            s.x = item.x * this.PM + this.PMX;
            s.y = item.y * this.PM + this.PMY;
            s.rotation = item.angle || 0;
            this.drawings.push(s);
        }
    }
    loadBubble(item: MapLayerItem): void {
        const at = MathHelper.randomRange(
                GameSceneConstants.IMG_OBJ_BUBBLE_ATTACHED_stain_01,
                GameSceneConstants.IMG_OBJ_BUBBLE_ATTACHED_stain_03
            ),
            s = new Bubble();
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
        bubble.setTextureQuad(GameSceneConstants.IMG_OBJ_BUBBLE_ATTACHED_bubble);
        bubble.doRestoreCutTransparency();
        bubble.parentAnchor = bubble.anchor = Alignment.CENTER;
        s.addChild(bubble);
        this.bubbles.push(s);
    }
    loadPump(item: MapLayerItem): void {
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
    }
    loadSock(item: MapLayerItem): void {
        const hatOrSock = IS_XMAS ? ResourceId.IMG_OBJ_SOCKS_XMAS : ResourceId.IMG_OBJ_SOCKS;
        const s = new Sock() as Sock & { state: number };
        s.initTextureWithId(hatOrSock);
        s.scaleX = s.scaleY = 0.7;
        s.createAnimations();
        s.doRestoreCutTransparency();

        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.group = item.group;

        s.anchor = Alignment.TOP | Alignment.HCENTER;
        s.rotationCenterY -= s.height / 2 - GameSceneConstants.SOCK_COLLISION_Y_OFFSET;

        s.setTextureQuad(
            s.group === 0 ? Sock.Quads.IMG_OBJ_SOCKS_hat_01 : Sock.Quads.IMG_OBJ_SOCKS_hat_02
        );

        s.state = Sock.StateType.IDLE;
        s.parseMover(item as Parameters<typeof s.parseMover>[0]);
        s.rotation += 90;
        if (s.mover) {
            s.mover.angle += 90;
        }

        s.updateRotation();
        this.socks.push(s);
    }
    loadSpike(item: MapLayerItem): void {
        const px = item.x * this.PM + this.PMX,
            py = item.y * this.PM + this.PMY,
            w = item.size,
            a = parseFloat(item.angle) || 0,
            tg = item.toggled === false ? Constants.UNDEFINED : item.toggled || Constants.UNDEFINED,
            s = new Spikes(px, py, w, a, tg);
        s.parseMover(item as Parameters<typeof s.parseMover>[0]);

        if (tg) {
            s.onButtonPressed = this.rotateAllSpikesWithId.bind(this);
        }

        if (item.name === MapItem.ELECTRO.id) {
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
    }
    loadRotatedCircle(item: MapLayerItem): void {
        const px = item.x * this.PM + this.PMX,
            py = item.y * this.PM + this.PMY,
            size = item.size,
            handleAngle = parseFloat(item.handleAngle) || 0,
            handleRadians = Radians.fromDegrees(handleAngle),
            oneHandle = item.oneHandle,
            l = new RotatedCircle();

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
    }
    loadBouncer(item: MapLayerItem): void {
        const px = item.x * this.PM + this.PMX,
            py = item.y * this.PM + this.PMY,
            w = item.size,
            a = item.angle,
            bouncer = new Bouncer(px, py, w, a);
        bouncer.parseMover(item as Parameters<typeof bouncer.parseMover>[0]);
        this.bouncers.push(bouncer);
    }
    loadTarget(item: MapLayerItem): void {
        const target = new GameObject();
        const targetWithOverride = target as GameObject & {
            bbOverride?: Rectangle;
            rbb?: { constructor: new (x: number, y: number, w: number, h: number) => typeof target.rbb };
        };
        this.target = target;

        const boxType = edition.boxTypes?.[LevelState.pack];
        const isHolidayBox = boxType === BoxType.HOLIDAY;

        const isJanuary = IS_JANUARY;
        this.pendingPaddingtonIdleTransition = false;

        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS);
        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS2);
        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS3);

        if (isJanuary) {
            target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATION_PADDINGTON);
        }

        if (IS_XMAS) {
            target.initTextureWithId(ResourceId.IMG_CHAR_GREETINGS_XMAS);
            target.initTextureWithId(ResourceId.IMG_CHAR_IDLE_XMAS);
        }

        targetWithOverride.doRestoreCutTransparency();

        targetWithOverride.bb = Rectangle.copy(resolution.TARGET_BB);
        targetWithOverride.bbOverride = Rectangle.copy(resolution.TARGET_BB);
        const originalPlayTimeline = targetWithOverride.playTimeline;
        targetWithOverride.playTimeline = function (index: number) {
            originalPlayTimeline.call(this, index);
            const element = this as GameObject & { bbOverride?: Rectangle; rbb?: Quad2D | undefined };
            if (element.bbOverride) {
                element.bb = Rectangle.copy(element.bbOverride);
                if (element.rbb) {
                    element.rbb = new Quad2D(element.bb.x, element.bb.y, element.bb.w, element.bb.h);
                }
            }
        };
        targetWithOverride.drawPosIncrement = 0.0001;

        targetWithOverride.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.GREETING,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS2_greeting_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS2_greeting_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS2
        );

        targetWithOverride.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.GREETINGXMAS,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_GREETINGS_XMAS_start,
            GameSceneConstants.IMG_CHAR_GREETINGS_XMAS_end,
            undefined,
            ResourceId.IMG_CHAR_GREETINGS_XMAS
        );

        targetWithOverride.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.IDLE,
            0.05,
            Timeline.LoopType.REPLAY,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_idle_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_idle_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );

        targetWithOverride.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.IDLE2,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_idle2_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_idle2_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );

        targetWithOverride.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.IDLEXMAS,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_IDLE_XMAS_idle_start,
            GameSceneConstants.IMG_CHAR_IDLE_XMAS_idle_end,
            undefined,
            ResourceId.IMG_CHAR_IDLE_XMAS
        );

        targetWithOverride.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.IDLE2XMAS,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_IDLE_XMAS_idle2_start,
            GameSceneConstants.IMG_CHAR_IDLE_XMAS_idle2_end,
            undefined,
            ResourceId.IMG_CHAR_IDLE_XMAS
        );

        let frame;
        const idle3Sequence = [];
        for (
            frame = GameSceneConstants.IMG_CHAR_ANIMATIONS_idle3_start;
            frame <= GameSceneConstants.IMG_CHAR_ANIMATIONS_idle3_end;
            frame++
        ) {
            idle3Sequence.push(frame);
        }

        for (
            frame = GameSceneConstants.IMG_CHAR_ANIMATIONS_idle3_start;
            frame <= GameSceneConstants.IMG_CHAR_ANIMATIONS_idle3_end;
            frame++
        ) {
            idle3Sequence.push(frame);
        }

        target.addAnimationSequence(
            GameSceneConstants.CharAnimation.IDLE3,
            0.05,
            Timeline.LoopType.NO_LOOP,
            idle3Sequence.length,
            idle3Sequence,
            ResourceId.IMG_CHAR_ANIMATIONS
        );

        if (isJanuary && isHolidayBox) {
            target.addAnimationEndpoints(
                GameSceneConstants.CharAnimation.IDLEPADDINGTON,
                0.05,
                Timeline.LoopType.NO_LOOP,
                GameSceneConstants.IMG_CHAR_ANIMATION_PADDINGTON_start,
                GameSceneConstants.IMG_CHAR_ANIMATION_PADDINGTON_end,
                undefined,
                ResourceId.IMG_CHAR_ANIMATION_PADDINGTON
            );
            const paddingtonTimeline = target.getTimeline(
                GameSceneConstants.CharAnimation.IDLEPADDINGTON
            );
            if (paddingtonTimeline) {
                paddingtonTimeline.onKeyFrame = this.onPaddingtonIdleKeyFrame.bind(this);
            }
            target.setDelay(0.75, 1, GameSceneConstants.CharAnimation.IDLEPADDINGTON);
            target.setDelay(0.75, 2, GameSceneConstants.CharAnimation.IDLEPADDINGTON);

            this.paddingtonFinalFrame = ImageElement.create(
                ResourceId.IMG_CHAR_ANIMATION_PADDINGTON,
                GameSceneConstants.IMG_CHAR_ANIMATION_PADDINGTON_hat
            );
            this.paddingtonFinalFrame.doRestoreCutTransparency();
            this.paddingtonFinalFrame.anchor = Alignment.CENTER;
            this.paddingtonFinalFrame.parentAnchor = Alignment.CENTER;
            this.paddingtonFinalFrame.visible = false;
            target.addChild(this.paddingtonFinalFrame);
        } else {
            this.paddingtonFinalFrame = null;
        }

        target.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.EXCITED,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS2_excited_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS2_excited_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS2
        );
        target.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.PUZZLED,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS2_puzzled_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS2_puzzled_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS2
        );
        target.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.FAIL,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS3_fail_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS3_fail_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS3
        );
        target.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.WIN,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_close_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_close_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.MOUTH_OPEN,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_open_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_open_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.MOUTH_CLOSE,
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_close_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_close_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.addAnimationEndpoints(
            GameSceneConstants.CharAnimation.CHEW,
            0.05,
            Timeline.LoopType.REPLAY,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_chew_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_chew_end,
            undefined,
            ResourceId.IMG_CHAR_ANIMATIONS
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.CHEW,
            GameSceneConstants.CharAnimation.WIN,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.PUZZLED,
            GameSceneConstants.CharAnimation.MOUTH_CLOSE,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.GREETING,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.GREETINGXMAS,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.IDLE2,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.IDLE3,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.IDLEXMAS,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.IDLE2XMAS,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.EXCITED,
            0.05
        );
        target.switchToAnimation(
            GameSceneConstants.CharAnimation.IDLE,
            GameSceneConstants.CharAnimation.PUZZLED,
            0.05
        );

        // delay greeting by Om-nom when not using January Paddington intro
        if (settings.showGreeting) {
            if (!(isJanuary && isHolidayBox)) {
                this.dd.callObject(this, this.showGreeting, null, 2);
            }
            settings.showGreeting = false;
        }

        if (isJanuary && isHolidayBox) {
            this.playPaddingtonIntro();
        } else {
            target.playTimeline(GameSceneConstants.CharAnimation.IDLE);
        }

        const idle = target.getTimeline(GameSceneConstants.CharAnimation.IDLE);
        if (idle) {
            idle.onKeyFrame = this.onIdleOmNomKeyFrame.bind(this);
        }

        target.setPause(
            GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_open_end -
                GameSceneConstants.IMG_CHAR_ANIMATIONS_mouth_open_start,
            GameSceneConstants.CharAnimation.MOUTH_OPEN
        );
        this.blink = new Animation();
        this.blink.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS);
        this.blink.parentAnchor = Alignment.TOP | Alignment.LEFT;

        this.blink.visible = false;
        this.blink.addAnimationSequence(0, 0.05, Timeline.LoopType.NO_LOOP, 4, [
            GameSceneConstants.IMG_CHAR_ANIMATIONS_blink_start,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_blink_end,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_blink_end,
            GameSceneConstants.IMG_CHAR_ANIMATIONS_blink_end,
        ]);
        this.blink.setAction(ActionType.SET_VISIBLE, this.blink, 0, 0, 2, 0);
        this.blinkTimer = GameSceneConstants.BLINK_SKIP;

        this.blink.doRestoreCutTransparency();
        target.addChild(this.blink);

        const supportQuadIndex = edition.supports?.[LevelState.pack] ?? null;
        const supportResourceId = isHolidayBox
            ? ResourceId.IMG_CHAR_SUPPORTS_XMAS
            : ResourceId.IMG_CHAR_SUPPORTS;
        const supportQuadID = isHolidayBox ? (isJanuary ? 1 : 0) : supportQuadIndex;
        this.support = ImageElement.create(supportResourceId, supportQuadID);
        this.support.doRestoreCutTransparency();
        this.support.anchor = Alignment.CENTER;

        const sx = item.x,
            sy = item.y;

        const posX = (sx * this.PM + this.PMX) | 0;
        const posY = (sy * this.PM + this.PMY) | 0;
        // Slight downward shift for the taller Paddington chair (January).
        const paddingtonSupportYOffset = isHolidayBox && isJanuary ? 75 : 0;

        this.target.x = posX;
        this.target.y = posY;
        this.support.x = posX;
        this.support.y = posY + paddingtonSupportYOffset;

        this.idlesTimer = MathHelper.randomRange(5, 20);
    }
}

export default GameSceneLoaders;

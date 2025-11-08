import Vector from "@/core/Vector";
import Rectangle from "@/core/Rectangle";
import AnimationPool from "@/visual/AnimationPool";
import Animation from "@/visual/Animation";
import ImageElement from "@/visual/ImageElement";
import GameObject from "@/visual/GameObject";
import BaseElement from "@/visual/BaseElement";
import Rope from "@/game/Bungee";
import Sock from "@/game/Sock";
import RotatedCircle from "@/game/RotatedCircle";
import Bubble from "@/game/Bubble";
import Grab from "@/game/Grab";
import Bouncer from "@/game/Bouncer";
import EarthImage from "@/game/EarthImage";
import FingerCut from "@/game/FingerCut";
import GravityButton from "@/game/GravityButton";
import PollenDrawer from "@/game/PollenDrawer";
import Pump from "@/game/Pump";
import Spikes from "@/game/Spikes";
import Star from "@/game/Star";
import DelayedDispatcher from "@/utils/DelayedDispatcher";
import GameController from "@/game/GameController";
import ConstrainedPoint from "@/physics/ConstrainedPoint";
import CTRGameObject from "@/game/CTRGameObject";
import RGBAColor from "@/core/RGBAColor";
import type Camera2D from "@/visual/Camera2D";

export interface FingerCutSegment {
    start: Vector;
    end: Vector;
    startSize: number;
    endSize: number;
    color: RGBAColor;
}

export type FingerCutTrail = FingerCutSegment[];

export interface GameSceneCamera {
    pos: Vector;
    type: Camera2D["type"];
    applyCameraTransformation(): void;
    cancelCameraTransformation(): void;
}

export interface GameSceneTextureAtlas {
    image: CanvasImageSource;
    offsets: Record<string, { x: number; y: number }>;
    rects: Rectangle[];
}

export interface Drawable {
    draw(): void;
}

export interface PositionedDrawable extends Drawable {
    x: number;
    y: number;
}

export interface TutorialElement extends Drawable {
    special?: number;
    update(delta: number): void;
    playTimeline(start: number): void;
}

export interface StarLike extends PositionedDrawable {
    pos: Vector;
    prevPos: Vector;
    v: Vector;
    posDelta: Vector;
    addTimelineWithID(timeline: Timeline, id: number): void;
    playTimeline(id: number): void;
    addChild(child: Drawable): void;
    removeChild(child: Drawable): void;
    anchor: unknown;
    parentAnchor: unknown;
    passTransformationsToChilds?: boolean;
    visible: boolean;
}

export interface SceneStar extends ConstrainedPoint, StarLike {}

export interface SceneCandy extends CTRGameObject, StarLike {}

export type UpdatableDrawable = Drawable & { update(delta: number): void };

export interface GameScene extends Record<string, unknown> {
    preDraw(): void;
    postDraw(): void;
    calculateScore(): void;
    releaseAllRopes(left: boolean): void;
    gameLost(): void;
    popBubble(x: number, y: number): void;
    attachCandy(): void;
    detachCandy(): void;
    popCandyBubble(isLeft: boolean): void;
    spiderBusted(grab: Grab): void;
    handlePumpFlow(
        pump: BaseElement,
        star: ConstrainedPoint,
        candy: GameObject,
        delta: number
    ): void;
    camera: GameSceneCamera;
    back: { updateWithCameraPos(pos: Vector): void; draw(): void };
    overlayTexture: GameSceneTextureAtlas;
    mapHeight: number;
    mapWidth: number;
    drawings: UpdatableDrawable[];
    earthAnims: UpdatableDrawable[];
    pollenDrawer: UpdatableDrawable | null;
    gravityButton: (Drawable & { isOn?: boolean; isInTouchZone?: () => boolean }) | null;
    gravityNormal: boolean;
    support: Drawable;
    target: BaseElement & Drawable;
    tutorials: TutorialElement[];
    tutorialImages: TutorialElement[];
    razors: Drawable[];
    rotatedCircles: Array<RotatedCircle & Drawable>;
    bubbles: Bubble[];
    pumps: Pump[];
    spikes: Spikes[];
    bouncers: Bouncer[];
    socks: Sock[];
    bungees: Array<
        Grab & { rope: Rope | null; spider?: Drawable; hasSpider?: boolean; spiderActive?: boolean }
    >;
    stars: Array<Star | null>;
    candy: GameObject;
    candyL: GameObject;
    candyR: GameObject;
    star: ConstrainedPoint;
    starL: ConstrainedPoint;
    starR: ConstrainedPoint;
    twoParts: number;
    noCandy: boolean;
    noCandyL: boolean;
    noCandyR: boolean;
    targetSock: Sock | null;
    special: number;
    savedSockSpeed: number;
    fingerCuts: FingerCut[][];
    aniPool: AnimationPool & {
        addChild(child: Drawable): void;
        timelineFinishedDelegate(): () => void;
        particlesFinishedDelegate(): () => void;
    };
    staticAniPool: AnimationPool;
    candyBlink: Animation;
    candyBubble: Bubble | null;
    candyBubbleL: Bubble | null;
    candyBubbleR: Bubble | null;
    candyBubbleAnimation: Animation;
    candyBubbleAnimationL: Animation;
    candyBubbleAnimationR: Animation;
    bubbleDisappear: Animation;
    candyMain: ImageElement;
    candyTop: ImageElement;
    dd: DelayedDispatcher;
    gameController: GameController & { avgDelta: number; onLevelWon(): void; onLevelLost(): void };
    restartState: number;
    dimTime: number;
    timeBonus: number;
    time: number;
    starBonus: number;
    starsCollected: number;
    score: number;
    attachCount: number;
    juggleTimer: number;
    ropePhysicsSpeed: number;
    ignoreTouches: boolean;
    lastCandyRotateDelta: number;
    lastCandyRotateDeltaL: number;
    lastCandyRotateDeltaR: number;
    ropesAtOnceTimer: number;
    spiderTookCandy: boolean;
    spiderWon(grab: Grab): void;
}

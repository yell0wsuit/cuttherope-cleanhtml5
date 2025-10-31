import Vector from "@/core/Vector";
import AnimationPool from "@/visual/AnimationPool";
import Animation from "@/visual/Animation";
import ImageElement from "@/visual/ImageElement";
import BaseElement from "@/visual/BaseElement";
import Rope from "@/game/Bungee";
import Sock from "@/game/Sock";
import RotatedCircle from "@/game/RotatedCircle";
import Bubble from "@/game/Bubble";
import Grab from "@/game/Grab";
import DelayedDispatcher from "@/utils/DelayedDispatcher";
import GameController from "@/game/GameController";
import Timeline from "@/visual/Timeline";
import ConstrainedPoint from "@/physics/ConstrainedPoint";
import CTRGameObject from "@/game/CTRGameObject";
import Rectangle from "@/core/Rectangle";

export interface FingerCutSegment {
    start: Vector;
    end: Vector;
}

export type FingerCutTrail = FingerCutSegment[];

export interface GameSceneCamera {
    pos: Vector;
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
        candy: CTRGameObject,
        delta: number
    ): void;
    camera: GameSceneCamera;
    back: { updateWithCameraPos(pos: Vector): void; draw(): void };
    overlayTexture: GameSceneTextureAtlas;
    mapHeight: number;
    mapWidth: number;
    drawings: Drawable[];
    earthAnims: Drawable[];
    pollenDrawer: Drawable | null;
    gravityButton: (Drawable & { isOn?: boolean; isInTouchZone?: () => boolean }) | null;
    gravityNormal: boolean;
    support: Drawable;
    target: BaseElement & Drawable;
    tutorials: Drawable[];
    tutorialImages: Array<Drawable & { special?: number }>;
    razors: Drawable[];
    rotatedCircles: Array<RotatedCircle & Drawable>;
    bubbles: Drawable[];
    pumps: Drawable[];
    spikes: Drawable[];
    bouncers: Drawable[];
    socks: Array<PositionedDrawable>;
    bungees: Array<
        Grab & { rope: Rope | null; spider?: Drawable; hasSpider?: boolean; spiderActive?: boolean }
    >;
    stars: Array<SceneStar | null>;
    candy: SceneCandy;
    candyL: SceneCandy;
    candyR: SceneCandy;
    star: SceneStar;
    starL: SceneStar;
    starR: SceneStar;
    twoParts: number;
    noCandy: boolean;
    noCandyL: boolean;
    noCandyR: boolean;
    targetSock: Sock | null;
    savedSockSpeed: number;
    fingerCuts: FingerCutTrail[];
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
    spiderTookCandy: boolean;
}

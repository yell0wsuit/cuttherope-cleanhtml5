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

export type FingerCutTrail = FingerCut[];

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
    drawings: Drawable[];
    earthAnims: EarthImage[];
    pollenDrawer: PollenDrawer | null;
    gravityButton: GravityButton | null;
    gravityNormal: boolean;
    support: ImageElement;
    target: GameObject;
    tutorials: Drawable[];
    tutorialImages: Array<Drawable & { special?: number }>;
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
    spiderTookCandy: boolean;
}

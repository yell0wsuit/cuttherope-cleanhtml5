import Bouncer from "@/game/Bouncer";
import Bubble from "@/game/Bubble";
import CandyBreak from "@/game/CandyBreak";
import Drawing from "@/game/Drawing";
import FingerCut from "@/game/FingerCut";
import Grab from "@/game/Grab";
import Ghost from "@/game/Ghost";
import GhostState from "@/game/GhostState";
import Pump from "@/game/Pump";
import PumpDirt from "@/game/PumpDirt";
import Sock from "@/game/Sock";
import Spikes from "@/game/Spikes";
import Star from "@/game/Star";
import TutorialText from "@/game/TutorialText";
import MathHelper from "@/utils/MathHelper";
import Mover from "@/utils/Mover";
import Camera2D from "@/visual/Camera2D";
import DelayedDispatcher from "@/utils/DelayedDispatcher";
import MapItem from "@/utils/MapItem";
import AnimationPool from "@/visual/AnimationPool";
import BaseElement from "@/visual/BaseElement";
import BackgroundTileMap from "@/visual/BackgroundTileMap";
import ResourceMgr from "@/resources/ResourceMgr";
import settings from "@/game/CTRSettings";
import SoundMgr from "@/game/CTRSoundMgr";
import ResourceId from "@/resources/ResourceId";
import Constants from "@/utils/Constants";
import Animation from "@/visual/Animation";
import Timeline from "@/visual/Timeline";
import Vector from "@/core/Vector";
import RGBAColor from "@/core/RGBAColor";
import KeyFrame from "@/visual/KeyFrame";
import resolution from "@/resolution";
import PubSub from "@/utils/PubSub";
import LevelState from "@/game/LevelState";
import edition from "@/edition";
import Alignment from "@/core/Alignment";
import TileMap from "@/visual/TileMap";
import ConstrainedPoint from "@/physics/ConstrainedPoint";
import GameObject from "@/visual/GameObject";
import CTRGameObject from "@/game/CTRGameObject";
import TextImage from "@/visual/TextImage";
import Bungee from "@/game/Bungee";
import Radians from "@/utils/Radians";
import Rectangle from "@/core/Rectangle";
import Canvas from "@/utils/Canvas";
import ImageElement from "@/visual/ImageElement";
import ConstraintType from "@/physics/ConstraintType";
import ActionType from "@/visual/ActionType";
import GravityButton from "@/game/GravityButton";
import Gravity from "@/physics/Gravity";
import EarthImage from "@/game/EarthImage";
import LangId from "@/resources/LangId";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import PollenDrawer from "@/game/PollenDrawer";
import Log from "@/utils/Log";
import RotatedCircle from "@/game/RotatedCircle";
import AchievementId from "@/achievements/AchievementId";
import Achievements from "@/Achievements";
/**
 * Tutorial elements can have a special id specified in the level xml
 * @const
 * @type {number}
 */
const LEVEL1_ARROW_SPECIAL_ID = 2;

/**
 * @enum {number}
 */
const RestartState = {
    FADE_IN: 0,
    FADE_OUT: 1,
};

/**
 * @enum {number}
 */
const CameraMove = {
    TO_CANDY_PART: 0,
    TO_CANDY: 1,
};

/**
 * @enum {number}
 */
const ButtonMode = {
    GRAVITY: 0,
    SPIKES: 1,
};

/**
 * @enum {number}
 */
const PartsType = {
    SEPARATE: 0,
    DISTANCE: 1,
    NONE: 2,
};

/**
 * @const
 * @type {number}
 */
const SCOMBO_TIMEOUT = 0.2;

/**
 * @const
 * @type {number}
 */
const SCUT_SCORE = 10;

/**
 * @const
 * @type {number}
 */
const MAX_LOST_CANDIES = 3;

/**
 * @const
 * @type {number}
 */
const ROPE_CUT_AT_ONCE_TIMEOUT = 0.1;

// Candy Juggler: keep candy without ropes or bubbles for 30 secs
const CANDY_JUGGLER_TIME = 30;

/**
 * @const
 * @type {number}
 */
const BLINK_SKIP = 3;

/**
 * @const
 * @type {number}
 */
const MOUTH_OPEN_TIME = 1;

/**
 * @const
 * @type {number}
 */
const PUMP_TIMEOUT = 0.05;

/**
 * @const
 * @type {number}
 */
const SOCK_SPEED_K = 0.9;

/**
 * @const
 * @type {number}
 */
const SOCK_COLLISION_Y_OFFSET = 25;

/**
 * @enum {number}
 */
const CandyBlink = {
    INITIAL: 0,
    STAR: 1,
};

/**
 * @enum {number}
 */
const TutorialAnimation = {
    SHOW: 0,
    HIDE: 1,
};

/**
 * @enum {number}
 */
const EarthAnimation = {
    NORMAL: 0,
    UPSIDE_DOWN: 1,
};

/**
 * Animations for Om-nom character
 * @enum {number}
 */
const CharAnimation = {
    IDLE: 0,
    IDLE2: 1,
    IDLE3: 2,
    EXCITED: 3,
    PUZZLED: 4,
    FAIL: 5,
    WIN: 6,
    MOUTH_OPEN: 7,
    MOUTH_CLOSE: 8,
    CHEW: 9,
    GREETING: 10,
};

/**
 * @const
 * @type {number}
 */
const HUD_STARS_COUNT = 3;

/**
 * @const
 * @type {number}
 */
const HUD_CANDIES_COUNT = 3;

/**
 * @const
 * @type {number}
 */
const IMG_BGR_01_bgr = 0;
/**
 * @const
 * @type {number}
 */
const IMG_BGR_01_P2_vert_transition = 0;
const IMG_BGR_02_vert_transition = 1;

let starDisappearPool = [];
let bubbleDisappear;

function applyStarImpulse(star, rd, yImpulse, delta) {
    star.applyImpulse(new Vector(-star.v.x / rd, -star.v.y / rd + yImpulse), delta);
}

function isCandyHit(bouncer, star, bouncer_radius) {
    const bouncer_radius_double = bouncer_radius * 2;
    return (
        Rectangle.lineInRect(
            bouncer.t1.x,
            bouncer.t1.y,
            bouncer.t2.x,
            bouncer.t2.y,
            star.pos.x - bouncer_radius,
            star.pos.y - bouncer_radius,
            bouncer_radius_double,
            bouncer_radius_double
        ) ||
        Rectangle.lineInRect(
            bouncer.b1.x,
            bouncer.b1.y,
            bouncer.b2.x,
            bouncer.b2.y,
            star.pos.x - bouncer_radius,
            star.pos.y - bouncer_radius,
            bouncer_radius_double,
            bouncer_radius_double
        )
    );
}

let currentPack = -1;

const GameScene = BaseElement.extend({
    init: function () {
        this._super();

        this.dd = DelayedDispatcher;

        this.initialCameraToStarDistance = Constants.UNDEFINED;
        this.restartState = Constants.UNDEFINED;

        // create animation pools
        this.aniPool = new AnimationPool();
        this.aniPool.visible = false;
        this.addChild(this.aniPool);

        this.staticAniPool = new AnimationPool();
        this.staticAniPool.visible = false;
        this.addChild(this.staticAniPool);

        this.camera = new Camera2D(resolution.CAMERA_SPEED, Camera2D.SpeedType.DELAY);

        this.starsCollected = 0;
        this.hudStars = [];
        starDisappearPool = [];

        for (var i = 0; i < HUD_STARS_COUNT; i++) {
            const hs = (this.hudStars[i] = new Animation());
            hs.initTextureWithId(ResourceId.IMG_HUD_STAR);
            hs.doRestoreCutTransparency();
            hs.addAnimationDelay(
                0.05,
                Timeline.LoopType.NO_LOOP,
                IMG_HUD_STAR_Frame_1,
                IMG_HUD_STAR_Frame_10
            );
            hs.setPause(IMG_HUD_STAR_Frame_10 - IMG_HUD_STAR_Frame_1, 0);
            //TODO: + canvas.xOffsetScaled on next line?
            hs.x = 10 + (hs.width + 5) * i;
            hs.y = 8;
            this.addChild(hs);
        }

        this.slastTouch = Vector.newZero();
        this.fingerCuts = [];
        for (i = 0; i < Constants.MAX_TOUCHES; i++) {
            this.fingerCuts[i] = [];
        }

        this.clickToCut = settings.getClickToCut();

        this.PM = resolution.PM;
        this.PMY = resolution.PMY;
        this.PMX = 0;

        this.earthAnims = [];

        this.lastCandyRotateDelta = 0;
        this.lastCandyRotateDeltaL = 0;
        this.lastCandyRotateDeltaR = 0;

        this.attachCount = 0;
        this.juggleTimer = 0;

        this.dragging = new Array(Constants.MAX_TOUCHES);
        this.startPos = new Array(Constants.MAX_TOUCHES);
        this.prevStartPos = new Array(Constants.MAX_TOUCHES);
        for (i = 0; i < Constants.MAX_TOUCHES; i++) {
            this.dragging[i] = false;
            this.startPos[i] = Vector.newZero();
            this.prevStartPos[i] = Vector.newZero();
        }
    },
    /**
     * @param p {ConstrainedPoint}
     * @return {boolean}
     */
    pointOutOfScreen: function (p) {
        const bottomY = this.mapHeight + resolution.OUT_OF_SCREEN_ADJUSTMENT_BOTTOM,
            topY = resolution.OUT_OF_SCREEN_ADJUSTMENT_TOP,
            outOfScreen = p.pos.y > bottomY || p.pos.y < topY;
        return outOfScreen;
    },
    restart: function () {
        this.hide();
        this.show();
    },
    showGreeting: function () {
        this.target.playTimeline(CharAnimation.GREETING);
    },
    shouldSkipTutorialElement: function (element) {
        const langId = settings.getLangId(),
            tl = element.locale;

        if (LangId.fromString(tl) !== langId) {
            return true;
        }

        return false;
    },
    show: function () {
        starDisappearPool = [];

        //create bubble animation
        bubbleDisappear = new Animation();
        bubbleDisappear.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_POP);
        bubbleDisappear.doRestoreCutTransparency();
        bubbleDisappear.anchor = Alignment.CENTER;

        const a = bubbleDisappear.addAnimationDelay(
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_OBJ_BUBBLE_POP_Frame_1,
            IMG_OBJ_BUBBLE_POP_Frame_12
        );
        bubbleDisappear.getTimeline(a).onFinished = this.aniPool.timelineFinishedDelegate();

        this.aniPool.removeAllChildren();
        this.staticAniPool.removeAllChildren();
        this.dd.cancelAllDispatches();

        this.attachCount = 0;
        this.juggleTimer = 0;

        // load the background image and overlay
        const bgrID = edition.levelBackgroundIds[LevelState.pack],
            overlayId = edition.levelOverlayIds[LevelState.pack];

        if (currentPack != LevelState.pack) {
            this.bgTexture = ResourceMgr.getTexture(bgrID);
            const canvasBackground = document.getElementById("c");
            canvasBackground.style.background = "url('" + this.bgTexture.image.src + "')";
            canvasBackground.style.display = "block";

            currentPack = LevelState.pack;
        } else if (!this.bgTexture) {
            // Make sure bgTexture is initialized even if pack hasn't changed
            this.bgTexture = ResourceMgr.getTexture(bgrID);
        }

        this.overlayTexture = overlayId ? ResourceMgr.getTexture(overlayId) : this.bgTexture;

        this.back = new BackgroundTileMap(1, 1);
        this.back.setRepeatHorizontally(TileMap.RepeatType.NONE);
        this.back.setRepeatVertically(TileMap.RepeatType.ALL);
        this.back.addTile(this.bgTexture, IMG_BGR_01_bgr);
        this.back.fill(0, 0, 1, 1, 0);

        this.gravityButton = null;
        this.gravityTouchDown = Constants.UNDEFINED;

        this.twoParts = PartsType.NONE;
        this.partsDist = 0;

        this.targetSock = null;

        SoundMgr.stopSound(ResourceId.SND_ELECTRIC);

        this.bungees = [];
        this.razors = [];
        this.spikes = [];
        this.stars = [];
        this.bubbles = [];
        this.pumps = [];
        this.rockets = [];
        this.socks = [];
        this.tutorialImages = [];
        this.tutorials = [];
        this.drawings = [];
        this.bouncers = [];
        this.ghosts = [];
        this.rotatedCircles = [];
        this.pollenDrawer = null;

        this.isCandyInGhostBubbleAnimationLoaded = false;
        this.isCandyInGhostBubbleAnimationLeftLoaded = false;
        this.isCandyInGhostBubbleAnimationRightLoaded = false;
        this.candyGhostBubbleAnimation = null;
        this.candyGhostBubbleAnimationL = null;
        this.candyGhostBubbleAnimationR = null;

        this.star = new ConstrainedPoint();
        this.star.setWeight(1);
        this.starL = new ConstrainedPoint();
        this.starL.setWeight(1);
        this.starR = new ConstrainedPoint();
        this.starR.setWeight(1);

        // candy
        this.candy = new GameObject();
        this.candy.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candy.setTextureQuad(IMG_OBJ_CANDY_01_candy_bottom);
        this.candy.doRestoreCutTransparency();
        this.candy.anchor = Alignment.CENTER;
        this.candy.bb = Rectangle.copy(resolution.CANDY_BB);
        this.candy.passTransformationsToChilds = false;
        this.candy.scaleX = this.candy.scaleY = 0.71;
        this.candy.drawPosIncrement = 0.0001;

        // candy main
        this.candyMain = new GameObject();
        this.candyMain.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candyMain.setTextureQuad(IMG_OBJ_CANDY_01_candy_main);
        this.candyMain.doRestoreCutTransparency();
        this.candyMain.anchor = this.candyMain.parentAnchor = Alignment.CENTER;
        this.candy.addChild(this.candyMain);
        this.candyMain.scaleX = this.candyMain.scaleY = 0.71;
        this.candyMain.drawPosIncrement = 0.0001;

        // candy top
        this.candyTop = new GameObject();
        this.candyTop.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candyTop.setTextureQuad(IMG_OBJ_CANDY_01_candy_top);
        this.candyTop.doRestoreCutTransparency();
        this.candyTop.anchor = this.candyTop.parentAnchor = Alignment.CENTER;
        this.candy.addChild(this.candyTop);
        this.candyTop.scaleX = this.candyTop.scaleY = 0.71;
        this.candyTop.drawPosIncrement = 0.0001;

        // candy blink
        this.candyBlink = new Animation();
        this.candyBlink.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
        this.candyBlink.doRestoreCutTransparency();
        this.candyBlink.addAnimationEndpoints(
            CandyBlink.INITIAL,
            0.07,
            Timeline.LoopType.NO_LOOP,
            IMG_OBJ_CANDY_01_highlight_start,
            IMG_OBJ_CANDY_01_highlight_end
        );
        this.candyBlink.addAnimationSequence(
            CandyBlink.STAR,
            0.3, // delay
            Timeline.LoopType.NO_LOOP,
            2, // count
            [IMG_OBJ_CANDY_01_glow, IMG_OBJ_CANDY_01_glow]
        );
        const gt = this.candyBlink.getTimeline(CandyBlink.STAR);
        gt.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0)
        );
        gt.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.2)
        );
        this.candyBlink.visible = false;
        this.candyBlink.anchor = this.candyBlink.parentAnchor = Alignment.CENTER;
        this.candyBlink.scaleX = this.candyBlink.scaleY = 0.71;
        this.candy.addChild(this.candyBlink);
        this.candyBlink.drawPosIncrement = 0.0001;

        // candy bubble
        this.candyBubbleAnimation = new Animation();
        this.candyBubbleAnimation.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_FLIGHT);
        this.candyBubbleAnimation.x = this.candy.x;
        this.candyBubbleAnimation.y = this.candy.y;
        this.candyBubbleAnimation.parentAnchor = this.candyBubbleAnimation.anchor =
            Alignment.CENTER;
        this.candyBubbleAnimation.addAnimationDelay(
            0.05,
            Timeline.LoopType.REPLAY,
            IMG_OBJ_BUBBLE_FLIGHT_Frame_1,
            IMG_OBJ_BUBBLE_FLIGHT_Frame_13
        );
        this.candyBubbleAnimation.playTimeline(0);
        this.candy.addChild(this.candyBubbleAnimation);
        this.candyBubbleAnimation.visible = false;
        this.candyBubbleAnimation.drawPosIncrement = 0.0001;

        for (var i = 0; i < HUD_STARS_COUNT; i++) {
            const hs = this.hudStars[i];
            if (hs.currentTimeline) {
                hs.currentTimeline.stop();
            }
            hs.setTextureQuad(IMG_HUD_STAR_Frame_1);
        }

        const map = LevelState.loadedMap;
        this.loadMap(map);

        // add the animations for the bubbles
        if (this.twoParts !== PartsType.NONE) {
            this.candyBubbleAnimationL = new Animation();
            this.candyBubbleAnimationL.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_FLIGHT);
            this.candyBubbleAnimationL.parentAnchor = this.candyBubbleAnimationL.anchor =
                Alignment.CENTER;
            this.candyBubbleAnimationL.addAnimationDelay(
                0.05,
                Timeline.LoopType.REPLAY,
                IMG_OBJ_BUBBLE_FLIGHT_Frame_1,
                IMG_OBJ_BUBBLE_FLIGHT_Frame_13
            );
            this.candyBubbleAnimationL.playTimeline(0);
            this.candyL.addChild(this.candyBubbleAnimationL);
            this.candyBubbleAnimationL.visible = false;
            this.candyBubbleAnimationL.drawPosIncrement = 0.0001;

            this.candyBubbleAnimationR = new Animation();
            this.candyBubbleAnimationR.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_FLIGHT);
            this.candyBubbleAnimationR.parentAnchor = this.candyBubbleAnimationR.anchor =
                Alignment.CENTER;
            this.candyBubbleAnimationR.addAnimationDelay(
                0.05,
                Timeline.LoopType.REPLAY,
                IMG_OBJ_BUBBLE_FLIGHT_Frame_1,
                IMG_OBJ_BUBBLE_FLIGHT_Frame_13
            );
            this.candyBubbleAnimationR.playTimeline(0);
            this.candyR.addChild(this.candyBubbleAnimationR);
            this.candyBubbleAnimationR.visible = false;
            this.candyBubbleAnimationR.drawPosIncrement = 0.0001;
        }

        let len = this.rotatedCircles.length,
            r;
        for (i = 0; i < len; i++) {
            r = this.rotatedCircles[i];
            r.operating = Constants.UNDEFINED;
            r.circles = this.rotatedCircles;
        }

        this.startCamera();

        this.tummyTeasers = 0;

        this.starsCollected = 0;
        this.candyBubble = null;
        this.candyBubbleL = null;
        this.candyBubbleR = null;

        this.mouthOpen = false;
        this.noCandy = this.twoParts !== PartsType.NONE;
        this.noCandyL = false;
        this.noCandyR = false;
        this.blink.playTimeline(0);
        this.spiderTookCandy = false;
        this.time = 0;
        this.score = 0;

        this.gravityNormal = true;
        Gravity.reset();

        this.dimTime = 0;

        this.ropesCutAtOnce = 0;
        this.ropesAtOnceTimer = 0;

        // delay start candy blink
        this.dd.callObject(this, this.doCandyBlink, null, 1);

        const levelLabel = new TextImage(),
            levelText = LevelState.pack + 1 + " - " + (LevelState.level + 1);
        levelLabel.setText(ResourceId.FNT_BIG_FONT, levelText);
        levelLabel.anchor = Alignment.BOTTOM | Alignment.LEFT;
        levelLabel.x = 37 * resolution.CANVAS_SCALE;
        levelLabel.y = resolution.CANVAS_HEIGHT - 5 * resolution.CANVAS_SCALE;

        const levelLabelTitle = new TextImage();
        levelLabelTitle.setText(ResourceId.FNT_BIG_FONT, Lang.menuText(MenuStringId.LEVEL));
        levelLabelTitle.anchor = Alignment.BOTTOM | Alignment.LEFT;
        levelLabelTitle.parentAnchor = Alignment.TOP | Alignment.LEFT;
        levelLabelTitle.y = 60 * resolution.CANVAS_SCALE;
        levelLabelTitle.rotationCenterX -= levelLabelTitle.width / 2;
        levelLabelTitle.scaleX = levelLabelTitle.scaleY = 0.7;
        levelLabel.addChild(levelLabelTitle);

        const tl = new Timeline();
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0.5)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5)
        );
        levelLabel.addTimelineWithID(tl, 0);
        levelLabel.playTimeline(0);
        tl.onFinished = this.staticAniPool.timelineFinishedDelegate();
        this.staticAniPool.addChild(levelLabel);

        if (this.clickToCut) {
            this.resetBungeeHighlight();
        }
    },
    startCamera: function () {
        const SCREEN_WIDTH = resolution.CANVAS_WIDTH,
            SCREEN_HEIGHT = resolution.CANVAS_HEIGHT;

        if (this.mapWidth > SCREEN_WIDTH || this.mapHeight > SCREEN_HEIGHT) {
            this.ignoreTouches = true;
            this.fastenCamera = false;
            this.camera.type = Camera2D.SpeedType.PIXELS;
            this.camera.speed = 10;
            this.cameraMoveMode = CameraMove.TO_CANDY_PART;

            let startX,
                startY,
                cameraTarget = this.twoParts !== PartsType.NONE ? this.starL : this.star;

            if (this.mapWidth > SCREEN_WIDTH) {
                if (cameraTarget.pos.x > this.mapWidth / 2) {
                    startX = 0;
                    startY = 0;
                } else {
                    startX = this.mapWidth - SCREEN_WIDTH;
                    startY = 0;
                }
            } else {
                if (cameraTarget.pos.y > this.mapHeight / 2) {
                    startX = 0;
                    startY = 0;
                } else {
                    startX = 0;
                    startY = this.mapHeight - SCREEN_HEIGHT;
                }
            }

            const xScroll = cameraTarget.pos.x - SCREEN_WIDTH / 2,
                yScroll = cameraTarget.pos.y - SCREEN_HEIGHT / 2,
                targetX = MathHelper.fitToBoundaries(xScroll, 0, this.mapWidth - SCREEN_WIDTH),
                targetY = MathHelper.fitToBoundaries(yScroll, 0, this.mapHeight - SCREEN_HEIGHT);

            this.camera.moveTo(startX, startY, true);

            this.initialCameraToStarDistance = this.camera.pos.distance(
                new Vector(targetX, targetY)
            );
        } else {
            this.ignoreTouches = false;
            this.camera.moveTo(0, 0, true);
        }
    },
    doCandyBlink: function () {
        this.candyBlink.playTimeline(CandyBlink.INITIAL);
    },

    /**
     * Loads the map object
     * @param map {Object}
     */
    loadMap: function (map) {
        const layers = [],
            self = this;

        // get all the layers for this map
        for (const layerName in map) {
            if (map.hasOwnProperty(layerName)) {
                layers.push(map[layerName]);
            }
        }

        // var enumLayerChildren = function (layers, childCallback) {
        //     for (var i = 0, numLayers = layers.length; i < numLayers; i++) {
        //         // parse the children
        //         var children = layers[i],
        //             numChildren = children.length;
        //         for (var j = 0; j < numChildren; j++) {
        //             //console.log("CALLBAC", i, j)
        //             childCallback.call(self, children[j]);
        //         }
        //     }
        // };

        // first pass handles basic settings and candy
        for (var i = 0, numLayers = layers.length; i < numLayers; i++) {
            // parse the children
            var children = layers[i],
                numChildren = children.length;
            for (var j = 0; j < numChildren; j++) {
                var child = children[j];
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
        for (var i = 0, numLayers = layers.length; i < numLayers; i++) {
            // parse the children
            var children = layers[i],
                numChildren = children.length;
            for (var j = 0; j < numChildren; j++) {
                var child = children[j];
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
                    case MapItem.GHOST:
                        this.loadGhost(child);
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
    /**
     * Loads the map settings for the map node (inside settings layer)
     * @param item
     */
    loadMapSettings: function (item) {
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
    loadGameDesign: function (item) {
        this.special = item.special || 0;
        this.ropePhysicsSpeed = item.ropePhysicsSpeed;
        this.nightLevel = item.nightLevel;
        this.twoParts = item.twoParts ? PartsType.SEPARATE : PartsType.NONE;
        this.ropePhysicsSpeed *= resolution.PHYSICS_SPEED_MULTIPLIER;
    },
    loadGrab: function (item) {
        let gx = item.x * this.PM + this.PMX,
            gy = item.y * this.PM + this.PMY,
            l = item.length * this.PM,
            r = item.radius,
            wheel = item.wheel,
            kickable = item.kickable,
            invisible = item.invisible,
            ml = item.moveLength * this.PM || -1,
            v = item.moveVertical,
            o = item.moveOffset * this.PM || 0,
            spider = item.spider,
            left = item.part === "L",
            hidePath = item.hidePath,
            gun = item.gun,
            g = new Grab();

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
                const d = 3,
                    isCircle = item.path[0] === "R";

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
    loadCandyL: function (item) {
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
    loadCandyR: function (item) {
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
    loadCandy: function (item) {
        this.star.pos.x = item.x * this.PM + this.PMX;
        this.star.pos.y = item.y * this.PM + this.PMY;
    },
    loadGravitySwitch: function (item) {
        this.gravityButton = new GravityButton();
        this.gravityButton.onButtonPressed = this.onButtonPressed.bind(this);
        this.gravityButton.visible = false;
        this.gravityButton.touchable = false;
        this.addChild(this.gravityButton);
        this.gravityButton.x = item.x * this.PM + this.PMX;
        this.gravityButton.y = item.y * this.PM + this.PMY;
        this.gravityButton.anchor = Alignment.CENTER;
    },
    loadStar: function (item) {
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

        //init the star disappear animations
        const sd = (starDisappearPool[l - 1] = new Animation());
        sd.initTextureWithId(ResourceId.IMG_OBJ_STAR_DISAPPEAR);
        sd.doRestoreCutTransparency();
        sd.anchor = Alignment.CENTER;

        sd.addAnimationDelay(
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_OBJ_STAR_DISAPPEAR_Frame_1,
            IMG_OBJ_STAR_DISAPPEAR_Frame_13
        );
    },
    loadTutorialText: function (item) {
        if (this.shouldSkipTutorialElement(item)) {
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
        t.align = Alignment.HCENTER;
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
    },
    loadTutorialImage: function (item) {
        if (this.shouldSkipTutorialElement(item)) {
            return;
        }

        const v = item.name - MapItem.TUTORIAL_01, // gets the tutorial number
            s = new CTRGameObject();

        s.initTextureWithId(ResourceId.IMG_TUTORIAL_SIGNS);
        s.setTextureQuad(v);
        s.color = RGBAColor.transparent.copy();
        s.x = item.x * this.PM + this.PMX;
        s.y = item.y * this.PM + this.PMY;
        s.rotation = item.angle || 0;
        s.special = item.special || 0;
        s.parseMover(item);

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
        } else if (s.special === LEVEL1_ARROW_SPECIAL_ID) {
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
    },
    loadHidden: function (item) {
        // get the hidden image index
        const v = item.name - MapItem.HIDDEN_01,
            drawingId = item.drawing - 1;

        const alreadyUnlocked = false;
        if (!alreadyUnlocked && !edition.disableHiddenDrawings) {
            const s = new Drawing(v, drawingId);
            s.x = item.x * this.PM + this.PMX;
            s.y = item.y * this.PM + this.PMY;
            s.rotation = item.angle || 0;
            this.drawings.push(s);
        }
    },
    loadBubble: function (item) {
        const at = MathHelper.randomRange(
                IMG_OBJ_BUBBLE_ATTACHED_stain_01,
                IMG_OBJ_BUBBLE_ATTACHED_stain_03
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
        bubble.setTextureQuad(IMG_OBJ_BUBBLE_ATTACHED_bubble);
        bubble.doRestoreCutTransparency();
        bubble.parentAnchor = bubble.anchor = Alignment.CENTER;
        s.addChild(bubble);
        this.bubbles.push(s);
    },
    loadPump: function (item) {
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
    loadSock: function (item) {
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
    loadSpike: function (item) {
        const px = item.x * this.PM + this.PMX,
            py = item.y * this.PM + this.PMY,
            w = item.size,
            a = parseFloat(item.angle) || 0,
            tg = item.toggled === false ? Constants.UNDEFINED : item.toggled || Constants.UNDEFINED,
            s = new Spikes(px, py, w, a, tg);
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
    loadRotatedCircle: function (item) {
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
    },
    loadBouncer: function (item) {
        const px = item.x * this.PM + this.PMX,
            py = item.y * this.PM + this.PMY,
            w = item.size,
            a = item.angle,
            bouncer = new Bouncer(px, py, w, a);
        bouncer.parseMover(item);
        this.bouncers.push(bouncer);
    },
    loadGhost: function (item) {
        const px = item.x * this.PM + this.PMX,
            py = item.y * this.PM + this.PMY,
            grabRadius = item.radius || 0,
            bouncerAngle = item.angle || 0;

        let possibleStatesMask = 0;
        if (item.bubble) {
            possibleStatesMask |= GhostState.BUBBLE;
        }
        if (item.grab) {
            possibleStatesMask |= GhostState.GRAB;
        }
        if (item.bouncer) {
            possibleStatesMask |= GhostState.BOUNCER;
        }

        const ghost = new Ghost(
            new Vector(px, py),
            possibleStatesMask,
            grabRadius,
            bouncerAngle,
            this.bubbles,
            this.bungees,
            this.bouncers
        );

        this.ghosts.push(ghost);
    },
    loadTarget: function (item) {
        const target = new GameObject();
        this.target = target;

        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS);
        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS2);
        target.initTextureWithId(ResourceId.IMG_CHAR_ANIMATIONS3);

        target.doRestoreCutTransparency();

        target.bb = Rectangle.copy(resolution.TARGET_BB);
        target.bbOverride = Rectangle.copy(resolution.TARGET_BB);
        var originalPlayTimeline = target.playTimeline;
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
        var frame;
        var idle3Sequence = [];
        for (
            frame = IMG_CHAR_ANIMATIONS_idle3_start;
            frame <= IMG_CHAR_ANIMATIONS_idle3_end;
            frame++
        ) {
            idle3Sequence.push(frame);
        }
        for (
            frame = IMG_CHAR_ANIMATIONS_idle3_start;
            frame <= IMG_CHAR_ANIMATIONS_idle3_end;
            frame++
        ) {
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

        // delay greeting by Om-nom
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

        const sx = item.x,
            sy = item.y;

        this.target.x = this.support.x = (sx * this.PM + this.PMX) | 0;
        this.target.y = this.support.y = (sy * this.PM + this.PMY) | 0;

        this.idlesTimer = MathHelper.randomRange(5, 20);
    },
    onIdleOmNomKeyFrame: function (timeline, keyFrame, index) {
        if (index === 1) {
            // om-nom blink
            this.blinkTimer--;
            if (this.blinkTimer === 0) {
                this.blink.visible = true;
                this.blink.playTimeline(0);
                this.blinkTimer = BLINK_SKIP;
            }

            // om-nom idle action
            this.idlesTimer--;
            if (this.idlesTimer === 0) {
                if (MathHelper.randomRange(0, 1) === 1) {
                    this.target.playTimeline(CharAnimation.IDLE2);
                } else {
                    this.target.playTimeline(CharAnimation.IDLE3);
                }
                this.idlesTimer = MathHelper.randomRange(5, 20);
            }
        }
    },
    onRotatedCircleTimelineFinished: function (t) {
        const circleToRemove = t.element;
        circleToRemove.removeOnNextUpdate = true;
    },
    update: function (delta) {
        var i, len, moveResult;
        for (i = 0, len = this.drawings.length; i < len; i++) {
            this.drawings[i].update(delta);
        }

        this._super(delta);
        this.dd.update(delta);

        if (this.pollenDrawer) {
            this.pollenDrawer.update(delta);
        }

        for (i = 0; i < Constants.MAX_TOUCHES; i++) {
            let cuts = this.fingerCuts[i],
                numCuts = cuts.length,
                k = 0;

            while (k < numCuts) {
                const fc = cuts[k];
                moveResult = Mover.moveToTargetWithStatus(fc.color.a, 0, 10, delta);
                fc.color.a = moveResult.value;
                if (moveResult.reachedZero) {
                    cuts.splice(k, 1);
                    numCuts--;
                } else {
                    k++;
                }
            }
        }

        for (i = 0, len = this.earthAnims.length; i < len; i++) {
            this.earthAnims[i].update(delta);
        }

        this.ropesAtOnceTimer = Mover.moveToTarget(this.ropesAtOnceTimer, 0, 1, delta);

        if (this.attachCount === 0) {
            this.juggleTimer += delta;

            // has it been 30 secs since the candy was attached?
            if (this.juggleTimer > CANDY_JUGGLER_TIME) {
                //Achievements.increment(AchievementId.CANDY_JUGGLER);

                // reset the timer
                this.juggleTimer = 0;
            }
        }

        const SCREEN_WIDTH = resolution.CANVAS_WIDTH,
            SCREEN_HEIGHT = resolution.CANVAS_HEIGHT,
            cameraTarget = this.twoParts != PartsType.NONE ? this.starL : this.star,
            xScroll = cameraTarget.pos.x - SCREEN_WIDTH / 2,
            yScroll = cameraTarget.pos.y - SCREEN_HEIGHT / 2,
            targetX = MathHelper.fitToBoundaries(xScroll, 0, this.mapWidth - SCREEN_WIDTH),
            targetY = MathHelper.fitToBoundaries(yScroll, 0, this.mapHeight - SCREEN_HEIGHT);

        this.camera.moveTo(targetX, targetY, false);

        // NOTE: mac sources indicate this is temporary?
        if (!(this.freezeCamera && this.camera.type === Camera2D.SpeedType.DELAY)) {
            this.camera.update(delta);
        }

        if (this.camera.type === Camera2D.SpeedType.PIXELS) {
            const IGNORE_TOUCHES_DISTANCE = resolution.IGNORE_TOUCHES_DISTANCE,
                PREVIEW_CAMERA_SPEED = resolution.PREVIEW_CAMERA_SPEED,
                PREVIEW_CAMERA_SPEED2 = resolution.PREVIEW_CAMERA_SPEED2,
                MAX_PREVIEW_CAMERA_SPEED = resolution.MAX_PREVIEW_CAMERA_SPEED,
                MIN_PREVIEW_CAMERA_SPEED = resolution.MIN_PREVIEW_CAMERA_SPEED;

            const starDistance = this.camera.pos.distance(new Vector(targetX, targetY));
            if (starDistance < IGNORE_TOUCHES_DISTANCE) {
                this.ignoreTouches = false;
            }

            if (this.fastenCamera) {
                if (this.camera.speed < resolution.CAMERA_SPEED_THRESHOLD) {
                    this.camera.speed *= 1.5;
                }
            } else {
                if (starDistance > this.initialCameraToStarDistance / 2.0) {
                    this.camera.speed += delta * PREVIEW_CAMERA_SPEED;
                    this.camera.speed = Math.min(MAX_PREVIEW_CAMERA_SPEED, this.camera.speed);
                } else {
                    this.camera.speed -= delta * PREVIEW_CAMERA_SPEED2;
                    this.camera.speed = Math.max(MIN_PREVIEW_CAMERA_SPEED, this.camera.speed);
                }
            }

            if (
                Math.abs(this.camera.pos.x - targetX) < 1 &&
                Math.abs(this.camera.pos.y - targetY) < 1
            ) {
                this.camera.type = Camera2D.SpeedType.DELAY;
                this.camera.speed = resolution.CAMERA_SPEED;
            }
        } else {
            this.time += delta;
        }

        const numGrabs = this.bungees.length;
        if (numGrabs > 0) {
            let handledRotation = false,
                handledRotationL = false,
                handledRotationR = false;

            for (i = 0; i < numGrabs; i++) {
                // yes, its a little confusing that the bungees array
                // actually holds grabs
                var g = this.bungees[i];
                g.update(delta);

                var b = g.rope;

                if (g.mover) {
                    if (b) {
                        b.bungeeAnchor.pos.x = g.x;
                        b.bungeeAnchor.pos.y = g.y;
                        b.bungeeAnchor.pin.copyFrom(b.bungeeAnchor.pos);
                    }
                }

                if (b) {
                    if (b.cut !== Constants.UNDEFINED && b.cutTime === 0) {
                        g.destroyRope();
                        continue;
                    }

                    b.update(delta * this.ropePhysicsSpeed);

                    if (g.hasSpider) {
                        if (this.camera.type != Camera2D.SpeedType.PIXELS || !this.ignoreTouches) {
                            g.updateSpider(delta);
                        }

                        if (g.spiderPos === Constants.UNDEFINED) {
                            this.spiderWon(g);
                            break;
                        }
                    }
                }

                if (g.radius !== Constants.UNDEFINED && !g.rope) {
                    // shared code for creating a rope with a star
                    var STAR_RADIUS = resolution.STAR_RADIUS,
                        createRope = function (star) {
                            const l = new Vector(g.x, g.y).distance(star.pos);
                            if (l <= g.radius + STAR_RADIUS) {
                                const b = new Bungee(
                                    null,
                                    g.x,
                                    g.y, // head
                                    star,
                                    star.pos.x,
                                    star.pos.y, // tail
                                    g.radius + STAR_RADIUS
                                );
                                b.bungeeAnchor.pin.copyFrom(b.bungeeAnchor.pos);
                                g.hideRadius = true;
                                g.setRope(b);

                                this.attachCandy();

                                SoundMgr.playSound(ResourceId.SND_ROPE_GET);
                                if (g.mover) {
                                    SoundMgr.playSound(ResourceId.SND_BUZZ);
                                }
                            }
                        }.bind(this);

                    if (this.twoParts !== PartsType.NONE) {
                        if (!this.noCandyL) {
                            createRope(this.starL);
                        }
                        if (!this.noCandyR && g.rope == null) {
                            createRope(this.starR);
                        }
                    } else {
                        createRope(this.star);
                    }
                }

                if (b) {
                    var prev = b.bungeeAnchor,
                        tail = b.parts[b.parts.length - 1],
                        v = Vector.subtract(prev.pos, tail.pos),
                        hasCandy = false;

                    if (!handledRotation) {
                        if (this.twoParts !== PartsType.NONE) {
                            if (tail === this.starL && !this.noCandyL && !handledRotationL) {
                                hasCandy = true;
                            } else if (tail === this.starR && !this.noCandyR && !handledRotationR) {
                                hasCandy = true;
                            }
                        } else if (!this.noCandy && !handledRotation) {
                            hasCandy = true;
                        }
                    }

                    if (b.relaxed !== 0 && b.cut === Constants.UNDEFINED && hasCandy) {
                        var a = Radians.toDegrees(v.normalizedAngle());
                        if (this.twoParts !== PartsType.NONE) {
                            const candyPart = tail === this.starL ? this.candyL : this.candyR;
                            if (!b.chosenOne) {
                                b.initialCandleAngle = candyPart.rotation - a;
                            }

                            if (tail === this.starL) {
                                this.lastCandyRotateDeltaL =
                                    a + b.initialCandleAngle - candyPart.rotation;
                                handledRotationL = true;
                            } else {
                                this.lastCandyRotateDeltaR =
                                    a + b.initialCandleAngle - candyPart.rotation;
                                handledRotationR = true;
                            }
                            candyPart.rotation = a + b.initialCandleAngle;
                        } else {
                            if (!b.chosenOne) {
                                b.initialCandleAngle = this.candyMain.rotation - a;
                            }
                            this.lastCandyRotateDelta =
                                a + b.initialCandleAngle - this.candyMain.rotation;
                            this.candyMain.rotation = a + b.initialCandleAngle;
                            handledRotation = true;
                        }

                        b.chosenOne = true;
                    } else {
                        b.chosenOne = false;
                    }
                }
            }

            if (this.twoParts !== PartsType.NONE) {
                if (!handledRotationL && !this.noCandyL) {
                    this.candyL.rotation += Math.min(5, this.lastCandyRotateDeltaL);
                    this.lastCandyRotateDeltaL *= 0.98;
                }
                if (!handledRotationR && !this.noCandyR) {
                    this.candyR.rotation += Math.min(5, this.lastCandyRotateDeltaR);
                    this.lastCandyRotateDeltaR *= 0.98;
                }
            } else {
                if (!handledRotation && !this.noCandy) {
                    this.candyMain.rotation += Math.min(5, this.lastCandyRotateDelta);
                    this.lastCandyRotateDelta *= 0.98;
                }
            }
        }

        if (!this.noCandy) {
            this.candy.update(delta);
            this.star.update(delta * this.ropePhysicsSpeed);
        }

        if (this.twoParts !== PartsType.NONE) {
            const ropeDelta = delta * this.ropePhysicsSpeed;
            this.candyL.update(delta);
            this.starL.update(ropeDelta);
            this.candyR.update(delta);
            this.starR.update(ropeDelta);
            if (this.twoParts === PartsType.DISTANCE) {
                for (i = 0; i < Bungee.BUNGEE_RELAXION_TIMES; i++) {
                    this.starL.satisfyConstraints();
                    this.starR.satisfyConstraints();
                }
            }
            if (this.partsDist > 0) {
                moveResult = Mover.moveToTargetWithStatus(this.partsDist, 0, 200, delta);
                this.partsDist = moveResult.value;
                if (moveResult.reachedZero) {
                    SoundMgr.playSound(ResourceId.SND_CANDY_LINK);
                    this.twoParts = PartsType.NONE;
                    this.noCandy = false;
                    this.noCandyL = true;
                    this.noCandyR = true;

                    //Achievements.increment(AchievementId.ROMANTIC_SOUL);

                    if (this.candyBubbleL || this.candyBubbleR) {
                        this.candyBubble = this.candyBubbleL
                            ? this.candyBubbleL
                            : this.candyBubbleR;
                        this.candyBubbleAnimation.visible = true;
                    }

                    this.lastCandyRotateDelta = 0;
                    this.lastCandyRotateDeltaL = 0;
                    this.lastCandyRotateDeltaR = 0;

                    this.star.pos.x = this.starL.pos.x;
                    this.star.pos.y = this.starL.pos.y;
                    this.candy.x = this.star.pos.x;
                    this.candy.y = this.star.pos.y;
                    this.candy.calculateTopLeft();

                    const lv = Vector.subtract(this.starL.pos, this.starL.prevPos),
                        rv = Vector.subtract(this.starR.pos, this.starR.prevPos),
                        sv = new Vector((lv.x + rv.x) / 2, (lv.y + rv.y) / 2);
                    this.star.prevPos.copyFrom(this.star.pos);
                    this.star.prevPos.subtract(sv);

                    for (var i = 0, count = this.bungees.length; i < count; i++) {
                        var g = this.bungees[i],
                            b = g.rope;
                        if (
                            b &&
                            b.cut !== b.parts.length - 3 &&
                            (b.tail === this.starL || b.tail === this.starR)
                        ) {
                            var prev = b.parts[b.parts.length - 2],
                                heroRestLen = b.tail.restLength(prev);
                            this.star.addConstraint(prev, heroRestLen, ConstraintType.DISTANCE);
                            b.tail = this.star;
                            b.parts[b.parts.length - 1] = this.star;
                            b.initialCandleAngle = 0;
                            b.chosenOne = false;
                        }
                    }

                    const transform = new Animation();
                    transform.initTextureWithId(ResourceId.IMG_OBJ_CANDY_01);
                    transform.doRestoreCutTransparency();
                    transform.x = this.candy.x;
                    transform.y = this.candy.y;
                    transform.anchor = Alignment.CENTER;
                    var a = transform.addAnimationDelay(
                        0.05,
                        Timeline.LoopType.NO_LOOP,
                        IMG_OBJ_CANDY_01_part_fx_start,
                        IMG_OBJ_CANDY_01_part_fx_end
                    );
                    transform.getTimeline(a).onFinished = this.aniPool.timelineFinishedDelegate();
                    transform.playTimeline(0);
                    this.aniPool.addChild(transform);
                } else {
                    this.starL.changeRestLength(this.starR, this.partsDist);
                    this.starR.changeRestLength(this.starL, this.partsDist);
                }
            }

            if (
                !this.noCandyL &&
                !this.noCandyR &&
                this.twoParts === PartsType.SEPARATE &&
                GameObject.intersect(this.candyL, this.candyR)
            ) {
                this.twoParts = PartsType.DISTANCE;
                this.partsDist = this.starL.pos.distance(this.starR.pos);
                this.starL.addConstraint(this.starR, this.partsDist, ConstraintType.NOT_MORE_THAN);
                this.starR.addConstraint(this.starL, this.partsDist, ConstraintType.NOT_MORE_THAN);
            }
        }

        this.target.update(delta);

        if (this.camera.type !== Camera2D.SpeedType.PIXELS || !this.ignoreTouches) {
            for (i = 0, len = this.stars.length; i < len; i++) {
                var s = this.stars[i];
                if (!s) continue;
                s.update(delta);

                if (s.timeout > 0 && s.time === 0) {
                    s.getTimeline(1).onFinished = this.aniPool.timelineFinishedDelegate();
                    this.aniPool.addChild(s);
                    this.stars.splice(i, 1);
                    s.timedAnim.playTimeline(1);
                    s.playTimeline(1);
                    break;
                } else {
                    let hits = false;
                    if (this.twoParts !== PartsType.NONE) {
                        hits =
                            (GameObject.intersect(this.candyL, s) && !this.noCandyL) ||
                            (GameObject.intersect(this.candyR, s) && !this.noCandyR);
                    } else {
                        hits = GameObject.intersect(this.candy, s) && !this.noCandy;
                    }

                    if (hits) {
                        this.candyBlink.playTimeline(CandyBlink.STAR);
                        this.starsCollected++;
                        this.hudStars[this.starsCollected - 1].playTimeline(0);

                        const starDisappear = starDisappearPool[i];
                        starDisappear.x = s.x;
                        starDisappear.y = s.y;

                        starDisappear.playTimeline(0);
                        this.aniPool.addChild(starDisappear);

                        this.stars[i] = null;
                        SoundMgr.playSound(ResourceId.SND_STAR_1 + this.starsCollected - 1);

                        if (this.target.currentTimelineIndex === CharAnimation.IDLE) {
                            this.target.playTimeline(CharAnimation.EXCITED);
                        }

                        break;
                    }
                }
            }
        }

        for (i = 0, len = this.bubbles.length; i < len; i++) {
            b = this.bubbles[i];
            b.update(delta);

            if (!b.popped) {
                if (this.twoParts != PartsType.NONE) {
                    if (
                        !this.noCandyL &&
                        this.isBubbleCapture(
                            b,
                            this.candyL,
                            this.candyBubbleL,
                            this.candyBubbleAnimationL
                        )
                    ) {
                        this.candyBubbleL = b;
                        break;
                    }

                    if (
                        !this.noCandyR &&
                        this.isBubbleCapture(
                            b,
                            this.candyR,
                            this.candyBubbleR,
                            this.candyBubbleAnimationR
                        )
                    ) {
                        this.candyBubbleR = b;
                        break;
                    }
                } else {
                    if (
                        !this.noCandy &&
                        this.isBubbleCapture(
                            b,
                            this.candy,
                            this.candyBubble,
                            this.candyBubbleAnimation
                        )
                    ) {
                        this.candyBubble = b;
                        break;
                    }
                }
            }

            if (!b.withoutShadow) {
                const numRotatedCircles = this.rotatedCircles.length;
                for (j = 0; j < numRotatedCircles; j++) {
                    var rc = this.rotatedCircles[j],
                        distanceToCircle = Vector.distance(b.x, b.y, rc.x, rc.y);
                    if (distanceToCircle < rc.sizeInPixels) {
                        b.withoutShadow = true;
                    }
                }
            }
        }

        // tutorial text
        for (i = 0, len = this.tutorials.length; i < len; i++) {
            var t = this.tutorials[i];
            t.update(delta);
        }

        // tutorial images
        for (i = 0, len = this.tutorialImages.length; i < len; i++) {
            t = this.tutorialImages[i];
            t.update(delta);
        }

        let removeCircleIndex = -1;
        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            rc = this.rotatedCircles[i];

            for (j = 0; j < numGrabs; j++) {
                var g = this.bungees[j],
                    gIndex = rc.containedObjects.indexOf(g),
                    distance = Vector.distance(g.x, g.y, rc.x, rc.y);

                if (distance <= rc.sizeInPixels + 5 * this.PM) {
                    if (gIndex < 0) {
                        rc.containedObjects.push(g);
                    }
                } else if (gIndex >= 0) {
                    rc.containedObjects.splice(g, 1);
                }
            }

            const numBubbles = this.bubbles.length;
            for (j = 0; j < numBubbles; j++) {
                var b = this.bubbles[j],
                    distance = Vector.distance(b.x, b.y, rc.x, rc.y),
                    bIndex = rc.containedObjects.indexOf(b);

                if (distance <= rc.sizeInPixels + 10 * this.PM) {
                    if (bIndex < 0) {
                        rc.containedObjects.push(b);
                    }
                } else if (bIndex >= 0) {
                    rc.containedObjects.splice(b, 1);
                }
            }

            if (rc.removeOnNextUpdate) {
                removeCircleIndex = i;
            }

            rc.update(delta);
        }

        if (removeCircleIndex >= 0) {
            this.rotatedCircles.splice(removeCircleIndex, 1);
        }

        // rockets
        for (i = 0, len = this.rockets.length; i < len; i++) {
            r = this.rockets[i];
            r.update(delta);
            // TODO: finish
        }

        // socks
        for (i = 0, len = this.socks.length; i < len; i++) {
            s = this.socks[i];
            s.update(delta);
            var moveStatus = Mover.moveToTargetWithStatus(s.idleTimeout, 0, 1, delta);
            s.idleTimeout = moveStatus.value;
            if (moveStatus.reachedZero) {
                s.state = Sock.StateType.IDLE;
            }

            const savedRotation = s.rotation;
            s.rotation = 0;
            s.updateRotation();
            const rs = this.star.posDelta.copy();
            rs.rotate(Radians.fromDegrees(-savedRotation));
            s.rotation = savedRotation;
            s.updateRotation();

            const bbX = this.star.pos.x - resolution.STAR_SOCK_RADIUS,
                bbY = this.star.pos.y - resolution.STAR_SOCK_RADIUS,
                bbW = resolution.STAR_SOCK_RADIUS * 2,
                bbH = bbW;

            /*
                 // DEBUG: draw the star bounding box
                 var ctx = Canvas.context;
                 ctx.lineWidth = 1;
                 ctx.strokeStyle = 'red';
                 ctx.strokeRect(bbX, bbY, bbW, bbH);
                 */

            if (
                rs.y >= 0 &&
                (Rectangle.lineInRect(s.t1.x, s.t1.y, s.t2.x, s.t2.y, bbX, bbY, bbW, bbH) ||
                    Rectangle.lineInRect(s.b1.x, s.b1.y, s.b2.x, s.b2.y, bbX, bbY, bbW, bbH))
            ) {
                if (s.state === Sock.StateType.IDLE) {
                    // look for a recieving sock
                    for (var j = 0; j < len; j++) {
                        const n = this.socks[j];
                        if (n !== s && n.group === s.group) {
                            s.state = Sock.StateType.RECEIVING;
                            n.state = Sock.StateType.THROWING;
                            this.releaseAllRopes(false);

                            this.savedSockSpeed =
                                SOCK_SPEED_K *
                                this.star.v.getLength() *
                                resolution.PHYSICS_SPEED_MULTIPLIER;
                            this.targetSock = n;

                            s.light.playTimeline(0);
                            s.light.visible = true;
                            SoundMgr.playSound(ResourceId.SND_TELEPORT);
                            this.dd.callObject(this, this.teleport, null, 0.1);
                            break;
                        }
                    }
                    break;
                }
            } else {
                if (s.state !== Sock.StateType.IDLE && s.idleTimeout === 0) {
                    s.idleTimeout = Sock.IDLE_TIMEOUT;
                }
            }
        }

        // pumps
        for (i = 0, len = this.pumps.length; i < len; i++) {
            const p = this.pumps[i];
            p.update(delta);

            var moveStatus = Mover.moveToTargetWithStatus(p.touchTimer, 0, 1, delta);
            p.touchTimer = moveStatus.value;
            if (moveStatus.reachedZero) {
                this.operatePump(p, delta);
            }
        }

        // razors
        for (i = 0, len = this.razors.length; i < len; i++) {
            var r = this.razors[i];
            r.update(delta);
            this.cut(r, null, null, false);
        }

        // spikes
        const star_spike_radius = resolution.STAR_SPIKE_RADIUS,
            star_spike_radius_double = star_spike_radius * 2;
        // isCandyHit = function (spike, star) {
        //     return (
        //         Rectangle.lineInRect(
        //             spike.t1.x, spike.t1.y,
        //             spike.t2.x, spike.t2.y,
        //             star.pos.x - star_spike_radius, star.pos.y - star_spike_radius,
        //             star_spike_radius_double, star_spike_radius_double) ||
        //             Rectangle.lineInRect(
        //                 spike.b1.x, spike.b1.y,
        //                 spike.b2.x, spike.b2.y,
        //                 star.pos.x - star_spike_radius, star.pos.y - star_spike_radius,
        //                 star_spike_radius_double, star_spike_radius_double));
        // };

        for (i = 0, len = this.spikes.length; i < len; i++) {
            s = this.spikes[i];

            //only update if something happens
            if (s.mover || s.shouldUpdateRotation || s.electro) {
                s.update(delta);
            }

            if (!s.electro || s.electroOn) {
                var candyHits = false,
                    left = false;
                if (this.twoParts !== PartsType.NONE) {
                    candyHits = !this.noCandyL && isCandyHit(s, this.starL, star_spike_radius);
                    if (candyHits) {
                        left = true;
                    } else {
                        candyHits = !this.noCandyR && isCandyHit(s, this.starR, star_spike_radius);
                    }
                } else {
                    candyHits = !this.noCandy && isCandyHit(s, this.star, star_spike_radius);
                }

                if (candyHits) {
                    if (this.twoParts !== PartsType.NONE) {
                        if (left) {
                            if (this.candyBubbleL) {
                                this.popCandyBubble(true);
                            }
                        } else {
                            if (this.candyBubbleR) {
                                this.popCandyBubble(false);
                            }
                        }
                    } else if (this.candyBubble) {
                        this.popCandyBubble(false);
                    }

                    var candyTexture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_CANDY_01),
                        b = new CandyBreak(5, candyTexture);
                    if (this.gravityButton && !this.gravityNormal) {
                        b.gravity.y = -500;
                        b.angle = 90;
                    }

                    b.onFinished = this.aniPool.particlesFinishedDelegate();

                    if (this.twoParts != PartsType.NONE) {
                        if (left) {
                            b.x = this.candyL.x;
                            b.y = this.candyL.y;
                            this.noCandyL = true;
                        } else {
                            b.x = this.candyR.x;
                            b.y = this.candyR.y;
                            this.noCandyR = true;
                        }
                    } else {
                        b.x = this.candy.x;
                        b.y = this.candy.y;
                        this.noCandy = true;
                    }

                    b.startSystem(5);
                    this.aniPool.addChild(b);
                    SoundMgr.playSound(ResourceId.SND_CANDY_BREAK);
                    this.releaseAllRopes(left);

                    if (this.restartState !== RestartState.FADE_IN) {
                        this.dd.callObject(this, this.gameLost, null, 0.3);
                    }

                    return;
                }
            }
        }

        // bouncers
        const bouncer_radius = resolution.BOUNCER_RADIUS,
            bouncer_radius_double = bouncer_radius * 2;

        for (i = 0, len = this.bouncers.length; i < len; i++) {
            const bouncer = this.bouncers[i];
            //if (bouncer.mover) {
            bouncer.update(delta);
            //}

            candyHits = false;
            left = false;
            if (this.twoParts !== PartsType.NONE) {
                candyHits = !this.noCandyL && isCandyHit(bouncer, this.starL, bouncer_radius);
                if (candyHits) {
                    left = true;
                } else {
                    candyHits = !this.noCandyR && isCandyHit(bouncer, this.starR, bouncer_radius);
                }
            } else {
                candyHits = !this.noCandy && isCandyHit(bouncer, this.star, bouncer_radius);
            }

            if (candyHits) {
                if (this.twoParts !== PartsType.NONE) {
                    if (left) {
                        this.handleBounce(bouncer, this.starL, delta);
                    } else {
                        this.handleBounce(bouncer, this.starR, delta);
                    }
                } else {
                    this.handleBounce(bouncer, this.star, delta);
                }

                break; //stop after hit
            } else {
                bouncer.skip = false;
            }
        }

        // apply force to bubbles
        const gravityMultiplier = this.gravityButton && !this.gravityNormal ? -1 : 1,
            yImpulse = resolution.BUBBLE_IMPULSE_Y * gravityMultiplier,
            rd = resolution.BUBBLE_IMPULSE_RD;

        // apply candy impulse
        if (this.twoParts === PartsType.SEPARATE) {
            if (this.candyBubbleL) {
                applyStarImpulse(this.starL, rd, yImpulse, delta);
            }
            if (this.candyBubbleR) {
                applyStarImpulse(this.starR, rd, yImpulse, delta);
            }
        }
        if (this.twoParts === PartsType.DISTANCE) {
            if (this.candyBubbleL || this.candyBubbleR) {
                applyStarImpulse(this.starL, rd, yImpulse, delta);
                applyStarImpulse(this.starR, rd, yImpulse, delta);
            }
        } else {
            if (this.candyBubble) {
                applyStarImpulse(this.star, rd, yImpulse, delta);
            }
        }

        let targetVector;
        if (!this.noCandy) {
            const MOUTH_OPEN_RADIUS = resolution.MOUTH_OPEN_RADIUS;
            if (!this.mouthOpen) {
                targetVector = new Vector(this.target.x, this.target.y);
                if (this.star.pos.distance(targetVector) < MOUTH_OPEN_RADIUS) {
                    this.mouthOpen = true;
                    this.target.playTimeline(CharAnimation.MOUTH_OPEN);
                    SoundMgr.playSound(ResourceId.SND_MONSTER_OPEN);
                    this.mouthCloseTimer = MOUTH_OPEN_TIME;
                }
            } else {
                if (this.mouthCloseTimer > 0) {
                    this.mouthCloseTimer = Mover.moveToTarget(this.mouthCloseTimer, 0, 1, delta);

                    if (this.mouthCloseTimer <= 0) {
                        targetVector = new Vector(this.target.x, this.target.y);
                        if (this.star.pos.distance(targetVector) > MOUTH_OPEN_RADIUS) {
                            this.mouthOpen = false;
                            this.target.playTimeline(CharAnimation.MOUTH_CLOSE);
                            SoundMgr.playSound(ResourceId.SND_MONSTER_CLOSE);

                            // this.tummyTeasers++;
                            // if (this.tummyTeasers === 10) {
                            //     Achievements.increment(AchievementId.TUMMY_TEASER);
                            // }
                        } else {
                            this.mouthCloseTimer = MOUTH_OPEN_TIME;
                        }
                    }
                }
            }

            if (this.restartState !== RestartState.FADE_IN) {
                if (GameObject.intersect(this.candy, this.target)) {
                    this.gameWon();
                    return;
                }
            }
        }

        const outOfScreen =
                this.twoParts === PartsType.NONE &&
                this.pointOutOfScreen(this.star) &&
                !this.noCandy,
            outOfScreenL =
                this.twoParts !== PartsType.NONE &&
                this.pointOutOfScreen(this.starL) &&
                !this.noCandyL,
            outOfScreenR =
                this.twoParts !== PartsType.NONE &&
                this.pointOutOfScreen(this.starR) &&
                !this.noCandyR;

        if (outOfScreen || outOfScreenL || outOfScreenR) {
            if (outOfScreen) {
                this.noCandy = true;
            }
            if (outOfScreenL) {
                this.noCandyL = true;
            }
            if (outOfScreenR) {
                this.noCandyR = true;
            }

            if (this.restartState !== RestartState.FADE_IN) {
                // lost candy achievements
                // Achievements.increment(AchievementId.WEIGHT_LOSER);
                // Achievements.increment(AchievementId.CALORIE_MINIMIZER);

                if (this.twoParts != PartsType.NONE && this.noCandyL && this.noCandyR) {
                    return;
                }
                this.gameLost();
                return;
            }
        }

        if (this.special !== 0) {
            if (this.special === 1) {
                if (
                    !this.noCandy &&
                    this.candyBubble != null &&
                    this.candy.y < resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_Y &&
                    this.candy.x > resolution.CANDY_BUBBLE_TUTORIAL_LIMIT_X
                ) {
                    this.special = 0;

                    // tutorial text
                    for (i = 0, len = this.tutorials.length; i < len; i++) {
                        t = this.tutorials[i];
                        if (t.special === 1) {
                            t.playTimeline(0);
                        }
                    }

                    // tutorial images
                    for (i = 0, len = this.tutorialImages.length; i < len; i++) {
                        t = this.tutorialImages[i];
                        if (t.special === 1) {
                            t.playTimeline(0);
                        }
                    }
                }
            }
        }

        if (this.clickToCut && !this.ignoreTouches) {
            this.resetBungeeHighlight();

            // first see if there is a nearby bungee
            const cv = new Vector(0, 0),
                pos = Vector.add(this.slastTouch, this.camera.pos),
                grab = this.getNearestBungeeGrabByBezierPoints(cv, pos.x, pos.y);
            b = grab ? grab.rope : null;
            if (b) {
                // now see if there is an active element that would override
                // bungee selection
                let activeElement = false;
                if (this.gravityButton) {
                    const c = this.gravityButton.getChild(this.gravityButton.isOn() ? 1 : 0);
                    if (c.isInTouchZone(pos.x, pos.y, true)) {
                        activeElement = true;
                    }
                }

                if (
                    this.candyBubble ||
                    (this.twoParts != PartsType.NONE && (this.candyBubbleL || this.candyBubbleR))
                ) {
                    for (i = 0, len = this.bubbles.length; i < len; i++) {
                        var s = this.bubbles[i],
                            BUBBLE_RADIUS = resolution.BUBBLE_RADIUS,
                            BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
                        if (this.candyBubble) {
                            if (
                                Rectangle.pointInRect(
                                    pos.x,
                                    pos.y,
                                    this.star.pos.x - BUBBLE_RADIUS,
                                    this.star.pos.y - BUBBLE_RADIUS,
                                    BUBBLE_DIAMETER,
                                    BUBBLE_DIAMETER
                                )
                            ) {
                                activeElement = true;
                                break;
                            }
                        }

                        if (this.candyBubbleL) {
                            if (
                                Rectangle.pointInRect(
                                    pos.x,
                                    pos.y,
                                    this.starL.pos.x - BUBBLE_RADIUS,
                                    this.starL.pos.y - BUBBLE_RADIUS,
                                    BUBBLE_DIAMETER,
                                    BUBBLE_DIAMETER
                                )
                            ) {
                                activeElement = true;
                                break;
                            }
                        }

                        if (this.candyBubbleR) {
                            if (
                                Rectangle.pointInRect(
                                    pos.x,
                                    pos.y,
                                    this.starR.pos.x - BUBBLE_RADIUS,
                                    this.starR.pos.y - BUBBLE_RADIUS,
                                    BUBBLE_DIAMETER,
                                    BUBBLE_DIAMETER
                                )
                            ) {
                                activeElement = true;
                                break;
                            }
                        }
                    }
                }

                for (i = 0, len = this.spikes.length; i < len; i++) {
                    var s = this.spikes[i];
                    if (s.rotateButton && s.rotateButton.isInTouchZone(pos.x, pos.y, true)) {
                        activeElement = true;
                    }
                }

                for (i = 0, len = this.pumps.length; i < len; i++) {
                    if (this.pumps[i].pointInObject(pos.x, pos.y)) {
                        activeElement = true;
                        break;
                    }
                }

                for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
                    var rc = this.rotatedCircles[i];
                    if (rc.isLeftControllerActive() || rc.isRightControllerActive()) {
                        activeElement = true;
                        break;
                    }

                    if (
                        Vector.distance(pos.x, pos.y, rc.handle2.x, rc.handle2.y) <=
                            resolution.RC_CONTROLLER_RADIUS ||
                        Vector.distance(pos.x, pos.y, rc.handle2.x, rc.handle2.y) <=
                            resolution.RC_CONTROLLER_RADIUS
                    ) {
                        activeElement = true;
                        break;
                    }
                }

                for (i = 0, len = this.bungees.length; i < len; i++) {
                    var g = this.bungees[i];
                    if (g.wheel) {
                        if (
                            Rectangle.pointInRect(
                                pos.x,
                                pos.y,
                                g.x - resolution.GRAB_WHEEL_RADIUS,
                                g.y - resolution.GRAB_WHEEL_RADIUS,
                                resolution.GRAB_WHEEL_RADIUS * 2,
                                resolution.GRAB_WHEEL_RADIUS * 2
                            )
                        ) {
                            activeElement = true;
                            break;
                        }
                    }

                    if (g.moveLength > 0) {
                        if (
                            Rectangle.pointInRect(
                                pos.x,
                                pos.y,
                                g.x - resolution.GRAB_MOVE_RADIUS,
                                g.y - resolution.GRAB_MOVE_RADIUS,
                                resolution.GRAB_MOVE_RADIUS * 2,
                                resolution.GRAB_MOVE_RADIUS * 2
                            ) ||
                            g.moverDragging !== Constants.UNDEFINED
                        ) {
                            activeElement = true;
                            break;
                        }
                    }
                }

                if (!activeElement) {
                    b.highlighted = true;
                }
            }
        }

        moveResult = Mover.moveToTargetWithStatus(this.dimTime, 0, 1, delta);
        this.dimTime = moveResult.value;
        if (moveResult.reachedZero) {
            if (this.restartState === RestartState.FADE_IN) {
                this.restartState = RestartState.FADE_OUT;
                this.hide();
                this.show();
                this.dimTime = Constants.DIM_TIMEOUT;
            } else {
                this.restartState = Constants.UNDEFINED;
            }
        }
    },

    isBubbleCapture: function (b, candy, candyBubble, candyBubbleAnimation) {
        const bubbleSize = resolution.BUBBLE_SIZE,
            bubbleSizeDouble = bubbleSize * 2;

        if (
            Rectangle.pointInRect(
                candy.x,
                candy.y,
                b.x - bubbleSize,
                b.y - bubbleSize,
                bubbleSizeDouble,
                bubbleSizeDouble
            )
        ) {
            if (candyBubble) {
                this.popBubble(b.x, b.y);
            }
            candyBubbleAnimation.visible = true;

            SoundMgr.playSound(ResourceId.SND_BUBBLE);

            b.popped = true;
            b.removeChildWithID(0);

            this.attachCandy();

            return true;
        }
        return false;
    },
    teleport: function () {
        if (!this.targetSock) {
            return;
        }

        this.targetSock.light.playTimeline(0);
        this.targetSock.light.visible = true;

        const off = new Vector(0, resolution.SOCK_TELEPORT_Y);
        off.rotate(Radians.fromDegrees(this.targetSock.rotation));

        this.star.pos.x = this.targetSock.x;
        this.star.pos.y = this.targetSock.y;
        this.star.pos.add(off);

        this.star.prevPos.copyFrom(this.star.pos);

        this.star.v.x = 0;
        this.star.v.y = -1;
        this.star.v.rotate(Radians.fromDegrees(this.targetSock.rotation));
        this.star.v.multiply(this.savedSockSpeed);

        this.star.posDelta.copyFrom(this.star.v);
        this.star.posDelta.divide(60);
        this.star.prevPos.copyFrom(this.star.pos);
        this.star.prevPos.subtract(this.star.posDelta);
        this.targetSock = null;

        //Achievements.increment(AchievementId.MAGICIAN);
    },
    animateLevelRestart: function () {
        this.restartState = RestartState.FADE_IN;
        this.dimTime = Constants.DIM_TIMEOUT;
    },
    isFadingIn: function () {
        return this.restartState === RestartState.FADE_IN;
    },
    releaseAllRopes: function (left) {
        for (let l = 0, len = this.bungees.length; l < len; l++) {
            const g = this.bungees[l],
                b = g.rope;

            if (
                b &&
                (b.tail === this.star ||
                    (b.tail === this.starL && left) ||
                    (b.tail === this.starR && !left))
            ) {
                if (b.cut === Constants.UNDEFINED) {
                    b.setCut(b.parts.length - 2);
                    this.detachCandy();
                } else {
                    b.hideTailParts = true;
                }

                if (g.hasSpider && g.spiderActive) {
                    this.spiderBusted(g);
                }
            }
        }
    },
    attachCandy: function () {
        this.attachCount += 1;
        //console.log('candy attached. count: ' + this.attachCount);
    },
    detachCandy: function () {
        this.attachCount -= 1;
        this.juggleTimer = 0;
        //console.log('candy detached. count: ' + this.attachCount);
    },
    calculateScore: function () {
        this.timeBonus = Math.max(0, 30 - this.time) * 100;
        this.timeBonus /= 10;
        this.timeBonus *= 10;
        this.starBonus = 1000 * this.starsCollected;
        this.score = Math.ceil(this.timeBonus + this.starBonus);
    },
    gameWon: function () {
        this.dd.cancelAllDispatches();

        this.target.playTimeline(CharAnimation.WIN);
        SoundMgr.playSound(ResourceId.SND_MONSTER_CHEWING);

        if (this.candyBubble) {
            this.popCandyBubble(false);
        }

        this.noCandy = true;

        this.candy.passTransformationsToChilds = true;
        this.candyMain.scaleX = this.candyMain.scaleY = 1;
        this.candyTop.scaleX = this.candyTop.scaleY = 1;

        const tl = new Timeline();
        tl.addKeyFrame(
            KeyFrame.makePos(this.candy.x, this.candy.y, KeyFrame.TransitionType.LINEAR, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makePos(this.target.x, this.target.y + 10, KeyFrame.TransitionType.LINEAR, 0.1)
        );
        tl.addKeyFrame(KeyFrame.makeScale(0.71, 0.71, KeyFrame.TransitionType.LINEAR, 0));
        tl.addKeyFrame(KeyFrame.makeScale(0, 0, KeyFrame.TransitionType.LINEAR, 0.1));
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0)
        );
        tl.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.1)
        );
        this.candy.addTimelineWithID(tl, 0);
        this.candy.playTimeline(0);
        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(this.candy);

        this.calculateScore();
        this.releaseAllRopes(false);

        const self = this,
            onLevelWonAppCallback = function () {
                PubSub.publish(PubSub.ChannelId.LevelWon, {
                    stars: self.starsCollected,
                    time: self.time,
                    score: self.score,
                    fps: 1 / self.gameController.avgDelta,
                });
            };

        // the closing doors animation takes 850ms so we want it to
        // finish before the game level deactivates (and freezes)
        if (settings.showMenu) {
            this.dd.callObject(this, onLevelWonAppCallback, null, 1);
        }

        // stop the electro after 1.5 seconds
        this.dd.callObject(
            this,
            function () {
                // stop the electro spikes sound from looping
                SoundMgr.stopSound(ResourceId.SND_ELECTRIC);
            },
            null,
            1.5
        );

        // fire level won callback after 2 secs
        const onLevelWon = function () {
            this.gameController.onLevelWon.call(this.gameController);
        };
        this.dd.callObject(this, onLevelWon, null, 1.8);
    },
    gameLost: function () {
        this.dd.cancelAllDispatches();
        this.target.playTimeline(CharAnimation.FAIL);
        SoundMgr.playSound(ResourceId.SND_MONSTER_SAD);

        // fire level lost callback after 1 sec
        const onLevelLost = function () {
            this.gameController.onLevelLost.call(this.gameController);
            PubSub.publish(PubSub.ChannelId.LevelLost, { time: this.time });
        };
        this.dd.callObject(this, onLevelLost, null, 1);
    },
    draw: function () {
        // reset any canvas transformations and clear everything
        const ctx = Canvas.context;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, resolution.CANVAS_WIDTH, resolution.CANVAS_HEIGHT);

        this.preDraw();
        this.camera.applyCameraTransformation();
        this.back.updateWithCameraPos(this.camera.pos);
        //console.log('back x:' + this.back.x + ' y:' + this.back.y);
        this.back.draw();

        // Scale overlayCut based on resolution to prevent visible seams at HD resolutions
        let overlayCut = Math.ceil((2 * resolution.CANVAS_SCALE) / 0.1875),
            q,
            overlayRect,
            off;
        if (this.mapHeight > resolution.CANVAS_HEIGHT) {
            q = IMG_BGR_01_P2_vert_transition;
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

        let i, len;
        for (i = 0, len = this.drawings.length; i < len; i++) {
            this.drawings[i].draw();
        }

        for (i = 0, len = this.earthAnims.length; i < len; i++) {
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
        for (i = 0, len = this.tutorials.length; i < len; i++) {
            this.tutorials[i].draw();
        }

        // tutorial images
        for (i = 0, len = this.tutorialImages.length; i < len; i++) {
            var ti = this.tutorialImages[i];

            // don't draw the level1 arrow now - it needs to be on top
            if (ti.special !== LEVEL1_ARROW_SPECIAL_ID) {
                ti.draw();
            }
        }

        for (i = 0, len = this.razors.length; i < len; i++) {
            this.razors[i].draw();
        }

        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            this.rotatedCircles[i].draw();
        }

        for (i = 0, len = this.bubbles.length; i < len; i++) {
            this.bubbles[i].draw();
        }

        for (i = 0, len = this.pumps.length; i < len; i++) {
            this.pumps[i].draw();
        }

        for (i = 0, len = this.spikes.length; i < len; i++) {
            this.spikes[i].draw();
        }

        for (i = 0, len = this.bouncers.length; i < len; i++) {
            this.bouncers[i].draw();
        }

        for (i = 0, len = this.socks.length; i < len; i++) {
            const sock = this.socks[i];
            sock.y -= SOCK_COLLISION_Y_OFFSET;
            sock.draw();
            sock.y += SOCK_COLLISION_Y_OFFSET;
        }

        const bungees = this.bungees;
        for (i = 0, len = bungees.length; i < len; i++) {
            bungees[i].drawBack();
        }
        for (i = 0; i < len; i++) {
            bungees[i].draw();
        }

        for (i = 0, len = this.stars.length; i < len; i++) {
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

        if (this.twoParts !== PartsType.NONE) {
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

        for (i = 0, len = bungees.length; i < len; i++) {
            const g = bungees[i];
            if (g.hasSpider) {
                g.drawSpider();
            }
        }

        this.aniPool.draw();
        this.drawCuts();
        this.camera.cancelCameraTransformation();
        this.staticAniPool.draw();

        // draw the level1 arrow last so its on top
        for (i = 0, len = this.tutorialImages.length; i < len; i++) {
            ti = this.tutorialImages[i];
            if (ti.special === LEVEL1_ARROW_SPECIAL_ID) {
                ti.draw();
            }
        }

        this.postDraw();
    },
    drawCuts: function () {
        const maxSize = resolution.CUT_MAX_SIZE;
        for (let i = 0; i < Constants.MAX_TOUCHES; i++) {
            const cuts = this.fingerCuts[i],
                count = cuts.length;
            if (count > 0) {
                let perpSize = 1,
                    v = 0,
                    fc = null,
                    pts = [],
                    pc = 0;

                for (var k = 0; k < count; k++) {
                    fc = cuts[k];
                    if (k === 0) {
                        pts[pc++] = fc.start;
                    }
                    pts[pc++] = fc.end;
                }

                let p = null,
                    points = 2,
                    numVertices = count * points,
                    vertices = [],
                    bstep = 1 / numVertices,
                    a = 0;

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

                const step = maxSize / numVertices,
                    verts = [];
                for (var k = 0, lenMinusOne = numVertices - 1; k < lenMinusOne; k++) {
                    const startSize = perpSize,
                        endSize = k === numVertices - 1 ? 1 : perpSize + step,
                        start = vertices[k],
                        end = vertices[k + 1];

                    // n is the normalized arrow
                    const n = Vector.subtract(end, start);
                    n.normalize();

                    const rp = Vector.rPerpendicular(n),
                        lp = Vector.perpendicular(n);

                    if (v === 0) {
                        const srp = Vector.add(start, Vector.multiply(rp, startSize)),
                            slp = Vector.add(start, Vector.multiply(lp, startSize));

                        verts.push(slp);
                        verts.push(srp);
                    }

                    const erp = Vector.add(end, Vector.multiply(rp, endSize)),
                        elp = Vector.add(end, Vector.multiply(lp, endSize));

                    verts.push(elp);
                    verts.push(erp);

                    perpSize += step;
                }

                // draw triangle strip
                Canvas.fillTriangleStrip(verts, RGBAColor.styles.SOLID_OPAQUE);
            }
        }
    },
    handlePumpFlow: function (p, s, c, delta) {
        const powerRadius = resolution.PUMP_POWER_RADIUS;
        if (
            c.rectInObject(
                p.x - powerRadius,
                p.y - powerRadius,
                p.x + powerRadius,
                p.y + powerRadius
            )
        ) {
            const tn1 = new Vector(0, 0),
                tn2 = new Vector(0, 0),
                h = new Vector(c.x, c.y);

            tn1.x = p.x - p.bb.w / 2.0;
            tn2.x = p.x + p.bb.w / 2.0;
            tn1.y = tn2.y = p.y;

            if (p.angle != 0) {
                h.rotateAround(-p.angle, p.x, p.y);
            }

            if (
                h.y < tn1.y &&
                Rectangle.rectInRect(
                    h.x - c.bb.w / 2.0,
                    h.y - c.bb.h / 2.0,
                    h.x + c.bb.w / 2.0,
                    h.y + c.bb.h / 2.0,
                    tn1.x,
                    tn1.y - powerRadius,
                    tn2.x,
                    tn2.y
                )
            ) {
                const maxPower = powerRadius * 2.0,
                    power = (maxPower * (powerRadius - (tn1.y - h.y))) / powerRadius,
                    pumpForce = new Vector(0, -power);

                pumpForce.rotate(p.angle);
                s.applyImpulse(pumpForce, delta);
            }
        }
    },
    handleBounce: function (bouncer, star, delta) {
        if (bouncer.skip) {
            return;
        }

        const v = Vector.subtract(star.prevPos, star.pos),
            spos = star.prevPos.copy();

        const angle = bouncer.angle,
            x = bouncer.x,
            y = bouncer.y;

        spos.rotateAround(-angle, x, y);

        const fromTop = spos.y < bouncer.y,
            dir = fromTop ? -1 : 1,
            a = v.getLength() * 40,
            b = resolution.BOUNCER_MAX_MOVEMENT,
            m = (a > b ? a : b) * dir,
            v2 = Vector.forAngle(bouncer.angle),
            impulse = Vector.perpendicular(v2);

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
    operatePump: function (pump, delta) {
        pump.playTimeline(0);
        const soundId = MathHelper.randomRange(ResourceId.SND_PUMP_1, ResourceId.SND_PUMP_4);
        SoundMgr.playSound(soundId);

        const dirtTexture = ResourceMgr.getTexture(ResourceId.IMG_OBJ_PUMP);
        const b = new PumpDirt(5, dirtTexture, Radians.toDegrees(pump.angle) - 90);
        b.onFinished = this.aniPool.particlesFinishedDelegate();

        const v = new Vector(pump.x + resolution.PUMP_DIRT_OFFSET, pump.y);
        v.rotateAround(pump.angle - Math.PI / 2, pump.x, pump.y);
        b.x = v.x;
        b.y = v.y;

        b.startSystem(5);
        this.aniPool.addChild(b);

        if (!this.noCandy) {
            this.handlePumpFlow(pump, this.star, this.candy, delta);
        }

        if (this.twoParts !== PartsType.NONE) {
            if (!this.noCandyL) {
                this.handlePumpFlow(pump, this.starL, this.candyL, delta);
            }

            if (!this.noCandyR) {
                this.handlePumpFlow(pump, this.starR, this.candyR, delta);
            }
        }
    },
    cut: function (razor, v1, v2, immediate) {
        let cutCount = 0;
        for (let l = 0, len = this.bungees.length; l < len; l++) {
            const g = this.bungees[l],
                b = g.rope;

            if (!b || b.cut !== Constants.UNDEFINED) {
                continue;
            }

            const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS,
                GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
            for (let i = 0, iLimit = b.parts.length - 1; i < iLimit; i++) {
                let p1 = b.parts[i],
                    p2 = b.parts[i + 1],
                    cut = false;

                if (razor) {
                    if (p1.prevPos.x !== Constants.INT_MAX) {
                        const minX = MathHelper.minOf4(
                                p1.pos.x,
                                p1.prevPos.x,
                                p2.pos.x,
                                p2.prevPos.x
                            ),
                            minY = MathHelper.minOf4(
                                p1.pos.y,
                                p1.prevPos.y,
                                p2.pos.y,
                                p2.prevPos.y
                            ),
                            maxX = MathHelper.maxOf4(
                                p1.pos.x,
                                p1.prevPos.x,
                                p2.pos.x,
                                p2.prevPos.x
                            ),
                            maxY = MathHelper.maxOf4(
                                p1.pos.y,
                                p1.prevPos.y,
                                p2.pos.y,
                                p2.prevPos.y
                            );

                        cut = Rectangle.rectInRect(
                            minX,
                            minY,
                            maxX,
                            maxY,
                            razor.drawX,
                            razor.drawY,
                            razor.drawX + razor.width,
                            razor.drawY + razor.height
                        );
                    }
                } else {
                    if (
                        g.wheel &&
                        Rectangle.lineInRect(
                            v1.x,
                            v1.y,
                            v2.x,
                            v2.y,
                            g.x - GRAB_WHEEL_RADIUS,
                            g.y - GRAB_WHEEL_RADIUS,
                            GRAB_WHEEL_DIAMETER,
                            GRAB_WHEEL_DIAMETER
                        )
                    ) {
                        cut = false;
                    } else {
                        cut = MathHelper.lineInLine(
                            v1.x,
                            v1.y,
                            v2.x,
                            v2.y,
                            p1.pos.x,
                            p1.pos.y,
                            p2.pos.x,
                            p2.pos.y
                        );
                    }
                }

                if (cut) {
                    cutCount++;

                    if (g.hasSpider && g.spiderActive) {
                        this.spiderBusted(g);
                    }

                    SoundMgr.playSound(ResourceId.SND_ROPE_BLEAK_1 + b.relaxed);

                    b.setCut(i);
                    this.detachCandy();

                    if (immediate) {
                        b.cutTime = 0;
                        b.removePart(i);
                    }

                    return cutCount;
                }
            }
        }

        return cutCount;
    },
    spiderBusted: function (g) {
        SoundMgr.playSound(ResourceId.SND_SPIDER_FALL);
        g.hasSpider = false;
        const s = ImageElement.create(ResourceId.IMG_OBJ_SPIDER, IMG_OBJ_SPIDER_busted);
        s.doRestoreCutTransparency();
        const tl = new Timeline();
        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y + 50, KeyFrame.TransitionType.EASE_OUT, 0.3)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    g.spider.x,
                    g.spider.y - resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        } else {
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(g.spider.x, g.spider.y - 50, KeyFrame.TransitionType.EASE_OUT, 0.3)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    g.spider.x,
                    g.spider.y + resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        }

        tl.addKeyFrame(KeyFrame.makeRotation(0, 0, 0));
        tl.addKeyFrame(KeyFrame.makeRotation(MathHelper.randomRange(-120, 120), 0, 1));
        s.addTimelineWithID(tl, 0);
        s.playTimeline(0);
        s.x = g.spider.x;
        s.y = g.spider.y;
        s.anchor = Alignment.CENTER;

        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(s);

        // spider achievements
        // Achievements.increment(AchievementId.SPIDER_BUSTER);
        // Achievements.increment(AchievementId.SPIDER_TAMER);
    },
    spiderWon: function (sg) {
        SoundMgr.playSound(ResourceId.SND_SPIDER_WIN);

        for (let i = 0, count = this.bungees.length; i < count; i++) {
            const g = this.bungees[i],
                b = g.rope;
            if (b && b.tail === this.star) {
                if (b.cut !== Constants.UNDEFINED) {
                    g.destroyRope();
                } else {
                    b.setCut(b.parts.length - 2);
                    this.detachCandy();
                    b.forceWhite = false;
                }

                if (g.hasSpider && g.spiderActive && sg !== g) {
                    this.spiderBusted(g);
                }
            }
        }

        sg.hasSpider = false;
        this.spiderTookCandy = true;
        this.noCandy = true;

        const s = ImageElement.create(ResourceId.IMG_OBJ_SPIDER, IMG_OBJ_SPIDER_stealing);
        s.doRestoreCutTransparency();
        this.candy.anchor = this.candy.parentAnchor = Alignment.CENTER;
        this.candy.x = 0;
        this.candy.y = -5;

        s.addChild(this.candy);
        const tl = new Timeline();
        if (this.gravityButton && !this.gravityNormal) {
            tl.addKeyFrame(
                KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y + 70,
                    KeyFrame.TransitionType.EASE_OUT,
                    0.3
                )
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y - resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        } else {
            tl.addKeyFrame(
                KeyFrame.makePos(sg.spider.x, sg.spider.y - 10, KeyFrame.TransitionType.EASE_OUT, 0)
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y - 70,
                    KeyFrame.TransitionType.EASE_OUT,
                    0.3
                )
            );
            tl.addKeyFrame(
                KeyFrame.makePos(
                    sg.spider.x,
                    sg.spider.y + resolution.CANVAS_HEIGHT,
                    KeyFrame.TransitionType.EASE_IN,
                    1
                )
            );
        }

        s.addTimelineWithID(tl, 0);
        s.playTimeline(0);
        s.x = sg.spider.x;
        s.y = sg.spider.y - 10;
        s.anchor = Alignment.CENTER;

        tl.onFinished = this.aniPool.timelineFinishedDelegate();
        this.aniPool.addChild(s);

        if (this.restartState !== RestartState.FADE_IN) {
            this.dd.callObject(this, this.gameLost, null, 2);
        }

        // Achievements.increment(AchievementId.SPIDER_LOVER);
    },
    popCandyBubble: function (isLeft) {
        if (this.twoParts !== PartsType.NONE) {
            if (isLeft) {
                this.candyBubbleL = null;
                this.candyBubbleAnimationL.visible = false;
                this.popBubble(this.candyL.x, this.candyL.y);
            } else {
                this.candyBubbleR = null;
                this.candyBubbleAnimationR.visible = false;
                this.popBubble(this.candyR.x, this.candyR.y);
            }
        } else {
            this.candyBubble = null;
            this.candyBubbleAnimation.visible = false;
            this.popBubble(this.candy.x, this.candy.y);
        }
    },
    popBubble: function (x, y) {
        this.detachCandy();

        SoundMgr.playSound(ResourceId.SND_BUBBLE_BREAK);

        bubbleDisappear.x = x;
        bubbleDisappear.y = y;

        bubbleDisappear.playTimeline(0);
        this.aniPool.addChild(bubbleDisappear);
    },
    handleBubbleTouch: function (s, tx, ty) {
        if (
            Rectangle.pointInRect(
                tx + this.camera.pos.x,
                ty + this.camera.pos.y,
                s.pos.x - resolution.BUBBLE_TOUCH_OFFSET,
                s.pos.y - resolution.BUBBLE_TOUCH_OFFSET,
                resolution.BUBBLE_TOUCH_SIZE,
                resolution.BUBBLE_TOUCH_SIZE
            )
        ) {
            this.popCandyBubble(s === this.starL);

            // Achievements.increment(AchievementId.BUBBLE_POPPER);
            // Achievements.increment(AchievementId.BUBBLE_MASTER);

            return true;
        }
        return false;
    },
    resetBungeeHighlight: function () {
        for (let i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i],
                bungee = grab.rope;
            if (!bungee || bungee.cut !== Constants.UNDEFINED) {
                continue;
            }
            bungee.highlighted = false;
        }
    },
    getNearestBungeeGrabByBezierPoints: function (s, tx, ty) {
        let SEARCH_RADIUS = resolution.CLICK_TO_CUT_SEARCH_RADIUS,
            grab = null,
            md = SEARCH_RADIUS,
            tv = new Vector(tx, ty);

        for (let l = 0, numBungees = this.bungees.length; l < numBungees; l++) {
            const g = this.bungees[l],
                b = g.rope;

            if (b) {
                for (let i = 0, numParts = b.drawPts.length; i < numParts; i++) {
                    const c1 = b.drawPts[i],
                        d = c1.distance(tv);
                    if (d < SEARCH_RADIUS && d < md) {
                        md = d;
                        grab = g;
                        s.copyFrom(c1);
                    }
                }
            }
        }

        return grab;
    },
    getNearestBungeeSegmentByConstraints: function (s, g) {
        let SEARCH_RADIUS = Number.MAX_VALUE,
            nb = null,
            md = SEARCH_RADIUS,
            sOrig = s.copy(),
            b = g.rope;

        if (!b || b.cut !== Constants.UNDEFINED) {
            return null;
        }

        const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS,
            GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2;
        for (let i = 0, numParts = b.parts.length - 1; i < numParts; i++) {
            const p1 = b.parts[i],
                d = p1.pos.distance(sOrig);
            if (d < md) {
                if (
                    !g.wheel ||
                    Rectangle.pointInRect(
                        p1.pos.x,
                        p1.pos.y,
                        g.x - GRAB_WHEEL_RADIUS,
                        g.y - GRAB_WHEEL_RADIUS,
                        GRAB_WHEEL_DIAMETER,
                        GRAB_WHEEL_DIAMETER
                    )
                ) {
                    md = d;
                    nb = b;
                    s.copyFrom(p1.pos);
                }
            }
        }

        return nb;
    },
    touchDown: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            if (this.camera.type === Camera2D.SpeedType.PIXELS) {
                this.fastenCamera = true;
            }
            return true;
        }

        if (touchIndex >= Constants.MAX_TOUCHES) {
            return true;
        }

        this.overOmNom = false;

        if (this.gravityButton) {
            var childIndex = this.gravityButton.isOn() ? 1 : 0,
                child = this.gravityButton.getChild(childIndex);
            if (child.isInTouchZone(x + this.camera.pos.x, y + this.camera.pos.y, true)) {
                this.gravityTouchDown = touchIndex;
                return true;
            }
        }

        if (this.candyBubble) {
            if (this.handleBubbleTouch(this.star, x, y)) {
                return true;
            }
        }

        if (this.twoParts !== PartsType.NONE) {
            if (this.candyBubbleL) {
                if (this.handleBubbleTouch(this.starL, x, y)) {
                    return true;
                }
            }
            if (this.candyBubbleR) {
                if (this.handleBubbleTouch(this.starR, x, y)) {
                    return true;
                }
            }
        }

        const touch = new Vector(x, y);
        if (!this.dragging[touchIndex]) {
            this.dragging[touchIndex] = true;
            this.startPos[touchIndex].copyFrom(touch);
            this.prevStartPos[touchIndex].copyFrom(touch);
        }

        let i,
            len,
            cameraPos = this.camera.pos,
            cameraAdjustedX = x + cameraPos.x,
            cameraAdjustedY = y + cameraPos.y;

        // handle rotating spikes
        for (i = 0, len = this.spikes.length; i < len; i++) {
            const spike = this.spikes[i];
            if (
                spike.rotateButton &&
                spike.touchIndex === Constants.UNDEFINED &&
                spike.rotateButton.onTouchDown(cameraAdjustedX, cameraAdjustedY)
            ) {
                spike.touchIndex = touchIndex;
                return true;
            }
        }

        // handle pump touches
        for (i = 0, len = this.pumps.length; i < len; i++) {
            const pump = this.pumps[i];
            if (pump.pointInObject(cameraAdjustedX, cameraAdjustedY)) {
                pump.touchTimer = PUMP_TIMEOUT;
                pump.touch = touchIndex;
                return true;
            }
        }

        let activeCircle = null,
            hasCircleInside = false,
            intersectsAnotherCircle = false;
        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            const r = this.rotatedCircles[i],
                d1 = Vector.distance(cameraAdjustedX, cameraAdjustedY, r.handle1.x, r.handle1.y),
                d2 = Vector.distance(cameraAdjustedX, cameraAdjustedY, r.handle2.x, r.handle2.y);
            if (
                (d1 < resolution.RC_CONTROLLER_RADIUS && !r.hasOneHandle()) ||
                d2 < resolution.RC_CONTROLLER_RADIUS
            ) {
                //check for overlapping
                for (let j = i + 1; j < len; j++) {
                    const r2 = this.rotatedCircles[j],
                        d3 = Vector.distance(r2.x, r2.y, r.x, r.y);

                    if (d3 + r2.sizeInPixels <= r.sizeInPixels) {
                        hasCircleInside = true;
                    }

                    if (d3 <= r.sizeInPixels + r2.sizeInPixels) intersectsAnotherCircle = true;
                }

                r.lastTouch.x = cameraAdjustedX;
                r.lastTouch.y = cameraAdjustedY;
                r.operating = touchIndex;

                if (d1 < resolution.RC_CONTROLLER_RADIUS) {
                    r.setIsLeftControllerActive(true);
                }
                if (d2 < resolution.RC_CONTROLLER_RADIUS) {
                    r.setIsRightControllerActive(true);
                }

                activeCircle = r;

                break;
            }
        }

        // circle fading
        const activeCircleIndex = this.rotatedCircles.indexOf(activeCircle);
        if (
            activeCircleIndex != this.rotatedCircles.length - 1 &&
            intersectsAnotherCircle &&
            !hasCircleInside
        ) {
            const fadeIn = new Timeline();
            fadeIn.addKeyFrame(
                KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0)
            );
            fadeIn.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.solidOpaque.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    0.2
                )
            );

            const fadeOut = new Timeline();
            fadeOut.addKeyFrame(
                KeyFrame.makeColor(
                    RGBAColor.solidOpaque.copy(),
                    KeyFrame.TransitionType.LINEAR,
                    0.2
                )
            );
            fadeOut.onFinished = this.onRotatedCircleTimelineFinished.bind(this);

            const fadingOutCircle = activeCircle.copy();
            fadingOutCircle.addTimeline(fadeOut);
            fadingOutCircle.playTimeline(0);

            activeCircle.addTimeline(fadeIn);
            activeCircle.playTimeline(0);

            this.rotatedCircles[activeCircleIndex] = fadingOutCircle;
            this.rotatedCircles.push(activeCircle);
            activeCircle = null;
        }

        const GRAB_WHEEL_RADIUS = resolution.GRAB_WHEEL_RADIUS,
            GRAB_WHEEL_DIAMETER = GRAB_WHEEL_RADIUS * 2,
            GRAB_MOVE_RADIUS = resolution.GRAB_MOVE_RADIUS,
            GRAB_MOVE_DIAMETER = GRAB_MOVE_RADIUS * 2;
        for (i = 0, len = this.bungees.length; i < len; i++) {
            var grab = this.bungees[i];
            if (grab.wheel) {
                if (
                    Rectangle.pointInRect(
                        cameraAdjustedX,
                        cameraAdjustedY,
                        grab.x - GRAB_WHEEL_RADIUS,
                        grab.y - GRAB_WHEEL_RADIUS,
                        GRAB_WHEEL_DIAMETER,
                        GRAB_WHEEL_DIAMETER
                    )
                ) {
                    grab.handleWheelTouch(cameraAdjustedX, cameraAdjustedY);
                    grab.wheelOperating = touchIndex;
                }
            }

            if (grab.moveLength > 0) {
                if (
                    Rectangle.pointInRect(
                        cameraAdjustedX,
                        cameraAdjustedY,
                        grab.x - GRAB_MOVE_RADIUS,
                        grab.y - GRAB_MOVE_RADIUS,
                        GRAB_MOVE_DIAMETER,
                        GRAB_MOVE_DIAMETER
                    )
                ) {
                    grab.moverDragging = touchIndex;
                    return true;
                }
            }
        }

        if (this.clickToCut) {
            var cutPos = Vector.newZero(),
                grab = this.getNearestBungeeGrabByBezierPoints(
                    cutPos,
                    cameraAdjustedX,
                    cameraAdjustedY
                ),
                bungee = grab ? grab.rope : null;
            if (bungee && bungee.highlighted) {
                if (this.getNearestBungeeSegmentByConstraints(cutPos, grab)) {
                    this.cut(null, cutPos, cutPos, false);
                }
            }
        }

        // easter egg check must be last to avoid affecting other elements
        if (this.target.pointInDrawQuad(x, y)) {
            this.overOmNom = true;
        }

        return true;
    },
    doubleClick: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            return true;
        }

        return true;
    },
    touchUp: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            return true;
        }

        this.dragging[touchIndex] = false;

        // see if the user clicked on OmNom
        if (this.overOmNom && this.target.pointInDrawQuad(x, y)) {
            this.overOmNom = false;
            PubSub.publish(PubSub.ChannelId.OmNomClicked);
            return;
        } else {
            this.overOmNom = false;
        }

        let i,
            len,
            cameraPos = this.camera.pos,
            cameraAdjustedX = x + cameraPos.x,
            cameraAdjustedY = y + cameraPos.y;

        // drawings
        for (i = 0, len = this.drawings.length; i < len; i++) {
            const drawing = this.drawings[i];
            if (drawing.pointInObject(cameraAdjustedX, cameraAdjustedY)) {
                drawing.showDrawing();

                // remove the drawing
                this.drawings.splice(i, 1);
                break;
            }
        }

        if (this.gravityButton && this.gravityTouchDown === touchIndex) {
            const childIndex = this.gravityButton.isOn() ? 1 : 0,
                child = this.gravityButton.getChild(childIndex);
            if (child.isInTouchZone(x + this.camera.pos.x, y + this.camera.pos.y, true)) {
                this.gravityButton.toggle();
                this.onButtonPressed(GravityButton.DefaultId);
            }
            this.gravityTouchDown = Constants.UNDEFINED;
        }

        for (i = 0, len = this.spikes.length; i < len; i++) {
            var spike = this.spikes[i];
            if (spike.rotateButton && spike.touchIndex === touchIndex) {
                spike.touchIndex = Constants.UNDEFINED;
                if (spike.rotateButton.onTouchUp(x + this.camera.pos.x, y + this.camera.pos.y)) {
                    return true;
                }
            }
        }

        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            const r = this.rotatedCircles[i];
            if (r.operating === touchIndex) {
                r.operating = Constants.UNDEFINED;
                r.soundPlaying = Constants.UNDEFINED;
                r.setIsLeftControllerActive(false);
                r.setIsRightControllerActive(false);
            }
        }

        for (i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i];
            if (grab.wheel && grab.wheelOperating === touchIndex) {
                grab.wheelOperating = Constants.UNDEFINED;
            }

            if (grab.moveLength > 0 && grab.moverDragging === touchIndex) {
                grab.moverDragging = Constants.UNDEFINED;
            }
        }

        return true;
    },
    touchMove: function (x, y, touchIndex) {
        if (this.ignoreTouches) {
            return true;
        }

        if (touchIndex >= Constants.MAX_TOUCHES) {
            return true;
        }

        let touch = new Vector(x, y),
            i,
            len;
        if (this.startPos[touchIndex].distance(touch) > 10) {
            for (i = 0, len = this.pumps.length; i < len; i++) {
                const pump = this.pumps[i];

                // cancel pump touch if we moved
                if (pump.touch === touchIndex && pump.touchTimer !== 0) {
                    pump.touchTimer = 0;
                }
            }
        }

        this.slastTouch.copyFrom(touch);

        const cameraAdjustedTouch = new Vector(x + this.camera.pos.x, y + this.camera.pos.y);

        for (i = 0, len = this.rotatedCircles.length; i < len; i++) {
            const r = this.rotatedCircles[i];
            if (r.operating === touchIndex) {
                const c = new Vector(r.x, r.y);
                if (c.distance(cameraAdjustedTouch) < r.sizeInPixels / 10) {
                    r.lastTouch.copyFrom(cameraAdjustedTouch);
                }

                let m1 = Vector.subtract(r.lastTouch, c),
                    m2 = Vector.subtract(cameraAdjustedTouch, c),
                    a = m2.normalizedAngle() - m1.normalizedAngle();

                if (a > Math.PI) {
                    a = a - 2 * Math.PI;
                } else if (a < -Math.PI) {
                    a = a + 2 * Math.PI;
                }

                r.handle1.rotateAround(a, r.x, r.y);
                r.handle2.rotateAround(a, r.x, r.y);
                r.rotation += Radians.toDegrees(a);

                let soundToPlay = a > 0 ? ResourceId.SND_SCRATCH_IN : ResourceId.SND_SCRATCH_OUT;

                if (Math.abs(a) < 0.07) soundToPlay = Constants.UNDEFINED;

                if (r.soundPlaying != soundToPlay && soundToPlay != Constants.UNDEFINED) {
                    SoundMgr.playSound(soundToPlay);
                    r.soundPlaying = soundToPlay;
                }

                for (i = 0, len = this.bungees.length; i < len; i++) {
                    var g = this.bungees[i],
                        gn = new Vector(g.x, g.y);
                    if (gn.distance(c) <= r.sizeInPixels + 5 * this.PM) {
                        gn.rotateAround(a, r.x, r.y);
                        g.x = gn.x;
                        g.y = gn.y;
                        if (g.rope) {
                            g.rope.bungeeAnchor.pos.copyFrom(gn);
                            g.rope.bungeeAnchor.pin.copyFrom(gn);
                        }
                    }
                }

                for (i = 0, len = this.pumps.length; i < len; i++) {
                    var g = this.pumps[i],
                        gn = new Vector(g.x, g.y);
                    if (gn.distance(c) <= r.sizeInPixels + 5 * this.PM) {
                        gn.rotateAround(a, r.x, r.y);
                        g.x = gn.x;
                        g.y = gn.y;
                        g.rotation += Radians.toDegrees(a);
                        g.updateRotation();
                    }
                }

                for (i = 0, len = this.bubbles.length; i < len; i++) {
                    var g = this.bubbles[i],
                        gn = new Vector(g.x, g.y);
                    if (
                        gn.distance(c) <= r.sizeInPixels + 10 * this.PM &&
                        g !== this.candyBubble &&
                        g !== this.candyBubbleR &&
                        g !== this.candyBubbleL
                    ) {
                        gn.rotateAround(a, r.x, r.y);
                        g.x = gn.x;
                        g.y = gn.y;
                    }
                }

                if (
                    Rectangle.pointInRect(
                        this.target.x,
                        this.target.y,
                        r.x - r.size,
                        r.y - r.size,
                        2 * r.size,
                        2 * r.size
                    )
                ) {
                    gn = new Vector(this.target.x, this.target.y);
                    gn.rotateAround(a, r.x, r.y);
                    this.target.x = gn.x;
                    this.target.y = gn.y;
                }

                r.lastTouch.copyFrom(cameraAdjustedTouch);

                return true;
            }
        }

        for (i = 0, len = this.bungees.length; i < len; i++) {
            const grab = this.bungees[i];
            if (!grab) {
                continue;
            }

            if (grab.wheel && grab.wheelOperating === touchIndex) {
                grab.handleWheelRotate(cameraAdjustedTouch);
                return true;
            }

            if (grab.moveLength > 0 && grab.moverDragging === touchIndex) {
                if (grab.moveVertical) {
                    grab.y = MathHelper.fitToBoundaries(
                        cameraAdjustedTouch.y,
                        grab.minMoveValue,
                        grab.maxMoveValue
                    );
                } else {
                    grab.x = MathHelper.fitToBoundaries(
                        cameraAdjustedTouch.x,
                        grab.minMoveValue,
                        grab.maxMoveValue
                    );
                }

                if (grab.rope) {
                    const ba = grab.rope.bungeeAnchor;
                    ba.pos.x = ba.pin.x = grab.x;
                    ba.pos.y = ba.pin.y = grab.y;
                }

                return true;
            }
        }

        if (this.dragging[touchIndex]) {
            let fc = new FingerCut(
                    Vector.add(this.startPos[touchIndex], this.camera.pos),
                    Vector.add(touch, this.camera.pos),
                    5, // start size
                    5, // end size
                    RGBAColor.white.copy()
                ),
                currentCuts = this.fingerCuts[touchIndex],
                ropeCuts = 0;

            currentCuts.push(fc);
            for (i = 0, len = currentCuts.length; i < len; i++) {
                const fcc = currentCuts[i];
                ropeCuts += this.cut(null, fcc.start, fcc.end, false);
            }

            if (ropeCuts > 0) {
                this.freezeCamera = false;

                if (this.ropesCutAtOnce > 0 && this.ropesAtOnceTimer > 0) {
                    this.ropesCutAtOnce += ropeCuts;
                } else {
                    this.ropesCutAtOnce = ropeCuts;
                }
                this.ropesAtOnceTimer = ROPE_CUT_AT_ONCE_TIMEOUT;

                // rope cut achievements
                // Achievements.increment(AchievementId.ROPE_CUTTER);
                // Achievements.increment(AchievementId.ROPE_CUTTER_MANIAC);
                // Achievements.increment(AchievementId.ULTIMATE_ROPE_CUTTER);

                // // concurrent cut rope achievements
                // if (this.ropesCutAtOnce >= 5) {
                //     Achievements.increment(AchievementId.MASTER_FINGER);
                // } else if (this.ropesCutAtOnce >= 3) {
                //     Achievements.increment(AchievementId.QUICK_FINGER);
                // }
            }

            this.prevStartPos[touchIndex].copyFrom(this.startPos[touchIndex]);
            this.startPos[touchIndex].copyFrom(touch);
        }

        return true;
    },
    touchDragged: function (x, y, touchIndex) {
        if (touchIndex > Constants.MAX_TOUCHES) {
            return false;
        }

        this.slastTouch.x = x;
        this.slastTouch.y = y;
        return true;
    },
    onButtonPressed: function (n) {
        Gravity.toggle();
        this.gravityNormal = Gravity.isNormal();
        SoundMgr.playSound(
            this.gravityNormal ? ResourceId.SND_GRAVITY_OFF : ResourceId.SND_GRAVITY_ON
        );

        for (let i = 0, len = this.earthAnims.length; i < len; i++) {
            const earthImage = this.earthAnims[i];
            if (Gravity.isNormal()) {
                earthImage.playTimeline(EarthImage.TimelineId.NORMAL);
            } else {
                earthImage.playTimeline(EarthImage.TimelineId.UPSIDE_DOWN);
            }
        }
    },
    rotateAllSpikesWithId: function (sid) {
        for (let i = 0, len = this.spikes.length; i < len; i++) {
            if (this.spikes[i].getToggled() === sid) {
                this.spikes[i].rotateSpikes();
            }
        }
    },
});

var IMG_OBJ_CANDY_01_candy_bottom = 0;
var IMG_OBJ_CANDY_01_candy_main = 1;
var IMG_OBJ_CANDY_01_candy_top = 2;

var IMG_OBJ_SPIDER_busted = 11;
var IMG_OBJ_SPIDER_stealing = 12;

var IMG_OBJ_CANDY_01_highlight_start = 8;
var IMG_OBJ_CANDY_01_highlight_end = 17;
var IMG_OBJ_CANDY_01_glow = 18;
var IMG_OBJ_CANDY_01_part_1 = 19;
var IMG_OBJ_CANDY_01_part_2 = 20;
var IMG_OBJ_CANDY_01_part_fx_start = 21;
var IMG_OBJ_CANDY_01_part_fx_end = 25;

var IMG_OBJ_STAR_DISAPPEAR_Frame_1 = 0;
const IMG_OBJ_STAR_DISAPPEAR_Frame_2 = 1;
const IMG_OBJ_STAR_DISAPPEAR_Frame_3 = 2;
const IMG_OBJ_STAR_DISAPPEAR_Frame_4 = 3;
const IMG_OBJ_STAR_DISAPPEAR_Frame_5 = 4;
const IMG_OBJ_STAR_DISAPPEAR_Frame_6 = 5;
const IMG_OBJ_STAR_DISAPPEAR_Frame_7 = 6;
const IMG_OBJ_STAR_DISAPPEAR_Frame_8 = 7;
const IMG_OBJ_STAR_DISAPPEAR_Frame_9 = 8;
const IMG_OBJ_STAR_DISAPPEAR_Frame_10 = 9;
const IMG_OBJ_STAR_DISAPPEAR_Frame_11 = 10;
const IMG_OBJ_STAR_DISAPPEAR_Frame_12 = 11;
var IMG_OBJ_STAR_DISAPPEAR_Frame_13 = 12;

var IMG_OBJ_BUBBLE_FLIGHT_Frame_1 = 0;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_2 = 1;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_3 = 2;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_4 = 3;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_5 = 4;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_6 = 5;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_7 = 6;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_8 = 7;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_9 = 8;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_10 = 9;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_11 = 10;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_12 = 11;
var IMG_OBJ_BUBBLE_FLIGHT_Frame_13 = 12;
const IMG_OBJ_BUBBLE_FLIGHT_Frame_14 = 13;

var IMG_OBJ_BUBBLE_POP_Frame_1 = 0;
const IMG_OBJ_BUBBLE_POP_Frame_2 = 1;
const IMG_OBJ_BUBBLE_POP_Frame_3 = 2;
const IMG_OBJ_BUBBLE_POP_Frame_4 = 3;
const IMG_OBJ_BUBBLE_POP_Frame_5 = 4;
const IMG_OBJ_BUBBLE_POP_Frame_6 = 5;
const IMG_OBJ_BUBBLE_POP_Frame_7 = 6;
const IMG_OBJ_BUBBLE_POP_Frame_8 = 7;
const IMG_OBJ_BUBBLE_POP_Frame_9 = 8;
const IMG_OBJ_BUBBLE_POP_Frame_10 = 9;
const IMG_OBJ_BUBBLE_POP_Frame_11 = 10;
var IMG_OBJ_BUBBLE_POP_Frame_12 = 11;

var IMG_OBJ_BUBBLE_ATTACHED_bubble = 0;
var IMG_OBJ_BUBBLE_ATTACHED_stain_01 = 1;
const IMG_OBJ_BUBBLE_ATTACHED_stain_02 = 2;
var IMG_OBJ_BUBBLE_ATTACHED_stain_03 = 3;

var IMG_HUD_STAR_Frame_1 = 0;
const IMG_HUD_STAR_Frame_2 = 1;
const IMG_HUD_STAR_Frame_3 = 2;
const IMG_HUD_STAR_Frame_4 = 3;
const IMG_HUD_STAR_Frame_5 = 4;
const IMG_HUD_STAR_Frame_6 = 5;
const IMG_HUD_STAR_Frame_7 = 6;
const IMG_HUD_STAR_Frame_8 = 7;
const IMG_HUD_STAR_Frame_9 = 8;
var IMG_HUD_STAR_Frame_10 = 9;
const IMG_HUD_STAR_Frame_11 = 10;

/* 480p vertical frames */
/*
var IMG_CHAR_ANIMATIONS_idle_start = 8;
var IMG_CHAR_ANIMATIONS_idle_end = 26;
var IMG_CHAR_ANIMATIONS_fail_start = 27;
var IMG_CHAR_ANIMATIONS_fail_end = 39;
var IMG_CHAR_ANIMATIONS_mouth_open_start = 40;
var IMG_CHAR_ANIMATIONS_mouth_open_end = 48;
var IMG_CHAR_ANIMATIONS_mouth_close_start = 49;
var IMG_CHAR_ANIMATIONS_mouth_close_end = 52;
var IMG_CHAR_ANIMATIONS_chew_start = 53;
var IMG_CHAR_ANIMATIONS_chew_end = 61;
var IMG_CHAR_ANIMATIONS_blink_start = 62;
var IMG_CHAR_ANIMATIONS_blink_end = 63;
var IMG_CHAR_ANIMATIONS_excited_start = 64;
var IMG_CHAR_ANIMATIONS_excited_end = 83;
var IMG_CHAR_ANIMATIONS_idle2_start = 84;
var IMG_CHAR_ANIMATIONS_idle2_end = 108;
var IMG_CHAR_ANIMATIONS_idle3_start = 109;
var IMG_CHAR_ANIMATIONS_idle3_end = 124;
var IMG_CHAR_ANIMATIONS_puzzled_start = 125;
var IMG_CHAR_ANIMATIONS_puzzled_end = 151;
var IMG_CHAR_ANIMATIONS_greeting_start = 152;
var IMG_CHAR_ANIMATIONS_greeting_end = 180;
*/

var IMG_CHAR_ANIMATIONS_idle_start = 0;
var IMG_CHAR_ANIMATIONS_idle_end = 18;
var IMG_CHAR_ANIMATIONS_mouth_open_start = 19;
var IMG_CHAR_ANIMATIONS_mouth_open_end = 27;
var IMG_CHAR_ANIMATIONS_mouth_close_start = 28;
var IMG_CHAR_ANIMATIONS_mouth_close_end = 31;
var IMG_CHAR_ANIMATIONS_chew_start = 32;
var IMG_CHAR_ANIMATIONS_chew_end = 40;
var IMG_CHAR_ANIMATIONS_blink_start = 41;
var IMG_CHAR_ANIMATIONS_blink_end = 42;
var IMG_CHAR_ANIMATIONS_idle2_start = 43;
var IMG_CHAR_ANIMATIONS_idle2_end = 67;
var IMG_CHAR_ANIMATIONS_idle3_start = 68;
var IMG_CHAR_ANIMATIONS_idle3_end = 83;

var IMG_CHAR_ANIMATIONS2_excited_start = 0;
var IMG_CHAR_ANIMATIONS2_excited_end = 19;
var IMG_CHAR_ANIMATIONS2_puzzled_start = 20;
var IMG_CHAR_ANIMATIONS2_puzzled_end = 46;
var IMG_CHAR_ANIMATIONS2_greeting_start = 47;
var IMG_CHAR_ANIMATIONS2_greeting_end = 76;

var IMG_CHAR_ANIMATIONS3_fail_start = 0;
var IMG_CHAR_ANIMATIONS3_fail_end = 12;
export default GameScene;

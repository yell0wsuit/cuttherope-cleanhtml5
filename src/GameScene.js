import Bouncer from "@/game/Bouncer";
import Bubble from "@/game/Bubble";
import CandyBreak from "@/game/CandyBreak";
import Drawing from "@/game/Drawing";
import FingerCut from "@/game/FingerCut";
import Grab from "@/game/Grab";
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
import {
    LEVEL1_ARROW_SPECIAL_ID,
    RestartState,
    CameraMove,
    ButtonMode,
    PartsType,
    SCOMBO_TIMEOUT,
    SCUT_SCORE,
    MAX_LOST_CANDIES,
    ROPE_CUT_AT_ONCE_TIMEOUT,
    CANDY_JUGGLER_TIME,
    BLINK_SKIP,
    MOUTH_OPEN_TIME,
    PUMP_TIMEOUT,
    SOCK_SPEED_K,
    SOCK_COLLISION_Y_OFFSET,
    CandyBlink,
    TutorialAnimation,
    EarthAnimation,
    CharAnimation,
    HUD_STARS_COUNT,
    HUD_CANDIES_COUNT,
    IMG_BGR_01_bgr,
    IMG_BGR_01_P2_vert_transition,
    IMG_BGR_02_vert_transition,
    IMG_OBJ_CANDY_01_candy_bottom,
    IMG_OBJ_CANDY_01_candy_main,
    IMG_OBJ_CANDY_01_candy_top,
    IMG_OBJ_CANDY_01_part_01,
    IMG_OBJ_CANDY_01_part_02,
    IMG_OBJ_CANDY_01_shadow,
    IMG_OBJ_CANDY_01_gun,
    IMG_OBJ_CANDY_01_gun2,
    IMG_OBJ_CANDY_01_candy_1,
    IMG_OBJ_CANDY_01_candy_2,
    IMG_OBJ_CANDY_01_candy_3,
    IMG_OBJ_CANDY_01_candy_4,
    IMG_OBJ_CANDY_01_candy_5,
    IMG_OBJ_CANDY_01_candy_6,
    IMG_OBJ_CANDY_01_candy_7,
    IMG_OBJ_CANDY_01_candy_8,
    IMG_OBJ_CANDY_01_candy_9,
    IMG_OBJ_CANDY_01_candy_10,
    IMG_OBJ_CANDY_01_glow,
    IMG_OBJ_CANDY_01_part_1,
    IMG_OBJ_CANDY_01_part_2,
    IMG_OBJ_CANDY_01_part_fx_start,
    IMG_OBJ_CANDY_01_part_fx_end,
    IMG_OBJ_CANDY_01_highlight_start,
    IMG_OBJ_CANDY_01_highlight_end,
    IMG_OBJ_SPIDER_busted,
    IMG_OBJ_SPIDER_stealing,
    IMG_OBJ_STAR_DISAPPEAR_Frame_1,
    IMG_OBJ_STAR_DISAPPEAR_Frame_2,
    IMG_OBJ_STAR_DISAPPEAR_Frame_3,
    IMG_OBJ_STAR_DISAPPEAR_Frame_4,
    IMG_OBJ_STAR_DISAPPEAR_Frame_5,
    IMG_OBJ_STAR_DISAPPEAR_Frame_6,
    IMG_OBJ_STAR_DISAPPEAR_Frame_7,
    IMG_OBJ_STAR_DISAPPEAR_Frame_8,
    IMG_OBJ_STAR_DISAPPEAR_Frame_9,
    IMG_OBJ_STAR_DISAPPEAR_Frame_10,
    IMG_OBJ_STAR_DISAPPEAR_Frame_11,
    IMG_OBJ_STAR_DISAPPEAR_Frame_12,
    IMG_OBJ_STAR_DISAPPEAR_Frame_13,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_1,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_2,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_3,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_4,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_5,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_6,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_7,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_8,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_9,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_10,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_11,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_12,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_13,
    IMG_OBJ_BUBBLE_FLIGHT_Frame_14,
    IMG_OBJ_BUBBLE_POP_Frame_1,
    IMG_OBJ_BUBBLE_POP_Frame_2,
    IMG_OBJ_BUBBLE_POP_Frame_3,
    IMG_OBJ_BUBBLE_POP_Frame_4,
    IMG_OBJ_BUBBLE_POP_Frame_5,
    IMG_OBJ_BUBBLE_POP_Frame_6,
    IMG_OBJ_BUBBLE_POP_Frame_7,
    IMG_OBJ_BUBBLE_POP_Frame_8,
    IMG_OBJ_BUBBLE_POP_Frame_9,
    IMG_OBJ_BUBBLE_POP_Frame_10,
    IMG_OBJ_BUBBLE_POP_Frame_11,
    IMG_OBJ_BUBBLE_POP_Frame_12,
    IMG_OBJ_BUBBLE_ATTACHED_bubble,
    IMG_OBJ_BUBBLE_ATTACHED_stain_01,
    IMG_OBJ_BUBBLE_ATTACHED_stain_02,
    IMG_OBJ_BUBBLE_ATTACHED_stain_03,
    IMG_HUD_STAR_Frame_1,
    IMG_HUD_STAR_Frame_2,
    IMG_HUD_STAR_Frame_3,
    IMG_HUD_STAR_Frame_4,
    IMG_HUD_STAR_Frame_5,
    IMG_HUD_STAR_Frame_6,
    IMG_HUD_STAR_Frame_7,
    IMG_HUD_STAR_Frame_8,
    IMG_HUD_STAR_Frame_9,
    IMG_HUD_STAR_Frame_10,
    IMG_HUD_STAR_Frame_11,
    IMG_CHAR_ANIMATIONS_idle_start,
    IMG_CHAR_ANIMATIONS_idle_end,
    IMG_CHAR_ANIMATIONS_mouth_open_start,
    IMG_CHAR_ANIMATIONS_mouth_open_end,
    IMG_CHAR_ANIMATIONS_mouth_close_start,
    IMG_CHAR_ANIMATIONS_mouth_close_end,
    IMG_CHAR_ANIMATIONS_chew_start,
    IMG_CHAR_ANIMATIONS_chew_end,
    IMG_CHAR_ANIMATIONS_blink_start,
    IMG_CHAR_ANIMATIONS_blink_end,
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
    IMG_CHAR_ANIMATIONS3_fail_end
} from "@/gameScene/constants";
import loaderMethods from "@/gameScene/loaders";
import interactionMethods from "@/gameScene/interactions";
import touchMethods from "@/gameScene/touches";
import { sharedState } from "@/gameScene/sharedState";

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

const coreMethods = {
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
        sharedState.starDisappearPool = [];

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
        sharedState.starDisappearPool = [];

        //create bubble animation
        sharedState.bubbleDisappear = new Animation();
        sharedState.bubbleDisappear.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_POP);
        sharedState.bubbleDisappear.doRestoreCutTransparency();
        sharedState.bubbleDisappear.anchor = Alignment.CENTER;

        const a = sharedState.bubbleDisappear.addAnimationDelay(
            0.05,
            Timeline.LoopType.NO_LOOP,
            IMG_OBJ_BUBBLE_POP_Frame_1,
            IMG_OBJ_BUBBLE_POP_Frame_12
        );
        sharedState.bubbleDisappear.getTimeline(a).onFinished = this.aniPool.timelineFinishedDelegate();

        this.aniPool.removeAllChildren();
        this.staticAniPool.removeAllChildren();
        this.dd.cancelAllDispatches();

        this.attachCount = 0;
        this.juggleTimer = 0;

        // load the background image and overlay
        const bgrID = edition.levelBackgroundIds[LevelState.pack],
            overlayId = edition.levelOverlayIds[LevelState.pack];

        if (sharedState.currentPack != LevelState.pack) {
            this.bgTexture = ResourceMgr.getTexture(bgrID);
            const canvasBackground = document.getElementById("c");
            canvasBackground.style.background = "url('" + this.bgTexture.image.src + "')";
            canvasBackground.style.display = "block";

            sharedState.currentPack = LevelState.pack;
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
        this.rotatedCircles = [];
        this.pollenDrawer = null;

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
    /**
     * Loads the map settings for the map node (inside settings layer)
     * @param item
     */
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

                        const starDisappear = sharedState.starDisappearPool[i];
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
};

const GameScene = BaseElement.extend(
    Object.assign({}, coreMethods, loaderMethods, interactionMethods, touchMethods)
);

export default GameScene;

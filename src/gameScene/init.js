import Animation from "@/visual/Animation";
import AnimationPool from "@/visual/AnimationPool";
import Alignment from "@/core/Alignment";
import BackgroundTileMap from "@/visual/BackgroundTileMap";
import Camera2D from "@/visual/Camera2D";
import ConstrainedPoint from "@/physics/ConstrainedPoint";
import Constants from "@/utils/Constants";
import GameObject from "@/visual/GameObject";
import * as GameSceneConstants from "@/gameScene/constants";
import LevelState from "@/game/LevelState";
import ResourceId from "@/resources/ResourceId";
import ResourceMgr from "@/resources/ResourceMgr";
import SoundMgr from "@/game/CTRSoundMgr";
import Timeline from "@/visual/Timeline";
import Vector from "@/core/Vector";
import Rectangle from "@/core/Rectangle";
import DelayedDispatcher from "@/utils/DelayedDispatcher";
import settings from "@/game/CTRSettings";
import edition from "@/edition";
import BoxType from "@/ui/BoxType";
import { IS_XMAS, IS_JANUARY } from "@/resources/ResData";
import resolution from "@/resolution";
import MathHelper from "@/utils/MathHelper";
import TileMap from "@/visual/TileMap";
import LangId from "@/resources/LangId";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import TextImage from "@/visual/TextImage";
import KeyFrame from "@/visual/KeyFrame";
import RGBAColor from "@/core/RGBAColor";
import Gravity from "@/physics/Gravity";

let currentPack = -1;

export const GameSceneInit = {
    init() {
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
        this.starDisappearPool = [];

        for (let i = 0; i < GameSceneConstants.HUD_STARS_COUNT; i++) {
            const hs = (this.hudStars[i] = new Animation());
            hs.initTextureWithId(ResourceId.IMG_HUD_STAR);
            hs.doRestoreCutTransparency();
            hs.addAnimationDelay(
                0.05,
                Timeline.LoopType.NO_LOOP,
                GameSceneConstants.IMG_HUD_STAR_Frame_1,
                GameSceneConstants.IMG_HUD_STAR_Frame_10
            );
            hs.setPause(
                GameSceneConstants.IMG_HUD_STAR_Frame_10 - GameSceneConstants.IMG_HUD_STAR_Frame_1,
                0
            );
            //TODO: + canvas.xOffsetScaled on next line?
            hs.x = 10 + (hs.width + 5) * i;
            hs.y = 8;
            this.addChild(hs);
        }

        this.slastTouch = Vector.newZero();
        this.fingerCuts = [];
        let i;
        for (i = 0; i < Constants.MAX_TOUCHES; i++) {
            this.fingerCuts[i] = [];
        }

        this.clickToCut = settings.getClickToCut();

        this.PM = resolution.PM;
        this.PMY = resolution.PMY;
        this.PMX = 0;

        this.earthAnims = [];

        this.paddingtonFinalFrame = null;
        this.pendingPaddingtonIdleTransition = false;

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
    getCandyResourceId() {
        const boxType = edition.boxTypes?.[LevelState.pack];
        const isHolidayBox = boxType === BoxType.HOLIDAY;
        return IS_JANUARY && isHolidayBox
            ? ResourceId.IMG_OBJ_CANDY_PADDINGTON
            : ResourceId.IMG_OBJ_CANDY_01;
    },
    /**
     * @param {ConstrainedPoint} p
     * @return {boolean}
     */
    pointOutOfScreen(p) {
        const bottomY = this.mapHeight + resolution.OUT_OF_SCREEN_ADJUSTMENT_BOTTOM,
            topY = resolution.OUT_OF_SCREEN_ADJUSTMENT_TOP,
            outOfScreen = p.pos.y > bottomY || p.pos.y < topY;
        return outOfScreen;
    },
    restart() {
        this.hide();
        this.show();
    },
    showGreeting() {
        const boxType = edition.boxTypes?.[LevelState.pack];
        const isHolidayBox = boxType === BoxType.HOLIDAY;

        if (IS_JANUARY && isHolidayBox) {
            this.playPaddingtonIntro();
            return;
        }

        if (IS_XMAS) {
            this.target.playTimeline(GameSceneConstants.CharAnimation.GREETINGXMAS);
            SoundMgr.playSound(ResourceId.SND_XMAS_BELL);
        } else {
            this.target.playTimeline(GameSceneConstants.CharAnimation.GREETING);
        }
    },
    hidePaddingtonFinalFrame() {
        if (this.paddingtonFinalFrame) {
            this.paddingtonFinalFrame.visible = false;
        }
    },
    showPaddingtonFinalFrame() {
        if (this.paddingtonFinalFrame) {
            this.paddingtonFinalFrame.visible = true;
        }
    },
    preparePaddingtonIntro() {
        this.pendingPaddingtonIdleTransition = false;
        if (this.dd && this.dd.cancelDispatch) {
            this.dd.cancelDispatch(this, this.playRegularIdleAfterPaddington, null);
        }
        this.hidePaddingtonFinalFrame();
    },
    playPaddingtonIntro() {
        if (!this.target) {
            return;
        }
        this.preparePaddingtonIntro();
        this.target.playTimeline(GameSceneConstants.CharAnimation.IDLEPADDINGTON);
    },
    shouldSkipTutorialElement(element) {
        const langId = settings.getLangId(),
            tl = element.locale;

        if (LangId.fromString(tl) !== langId) {
            return true;
        }

        return false;
    },
    show() {
        this.starDisappearPool = [];

        //create bubble animation
        this.bubbleDisappear = new Animation();
        this.bubbleDisappear.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_POP);
        this.bubbleDisappear.doRestoreCutTransparency();
        this.bubbleDisappear.anchor = Alignment.CENTER;

        const a = this.bubbleDisappear.addAnimationDelay(
            0.05,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_OBJ_BUBBLE_POP_Frame_1,
            GameSceneConstants.IMG_OBJ_BUBBLE_POP_Frame_12
        );
        this.bubbleDisappear.getTimeline(a).onFinished = this.aniPool.timelineFinishedDelegate();

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
            const backgroundSource = this.bgTexture?.imageSrc || this.bgTexture?.image?.src || "";
            canvasBackground.style.background = backgroundSource
                ? `url('${backgroundSource}')`
                : "";
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
        this.back.addTile(this.bgTexture, GameSceneConstants.IMG_BGR_01_bgr);
        this.back.fill(0, 0, 1, 1, 0);

        this.gravityButton = null;
        this.gravityTouchDown = Constants.UNDEFINED;

        this.twoParts = GameSceneConstants.PartsType.NONE;
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
        const candyResourceId = this.getCandyResourceId();
        this.candyResourceId = candyResourceId;
        this.candy = new GameObject();
        this.candy.initTextureWithId(candyResourceId);
        this.candy.setTextureQuad(GameSceneConstants.IMG_OBJ_CANDY_01_candy_bottom);
        this.candy.doRestoreCutTransparency();
        this.candy.anchor = Alignment.CENTER;
        this.candy.bb = Rectangle.copy(resolution.CANDY_BB);
        this.candy.passTransformationsToChilds = false;
        this.candy.scaleX = this.candy.scaleY = 0.71;
        this.candy.drawPosIncrement = 0.0001;

        // candy main
        this.candyMain = new GameObject();
        this.candyMain.initTextureWithId(candyResourceId);
        this.candyMain.setTextureQuad(GameSceneConstants.IMG_OBJ_CANDY_01_candy_main);
        this.candyMain.doRestoreCutTransparency();
        this.candyMain.anchor = this.candyMain.parentAnchor = Alignment.CENTER;
        this.candy.addChild(this.candyMain);
        this.candyMain.scaleX = this.candyMain.scaleY = 0.71;
        this.candyMain.drawPosIncrement = 0.0001;

        // candy top
        this.candyTop = new GameObject();
        this.candyTop.initTextureWithId(candyResourceId);
        this.candyTop.setTextureQuad(GameSceneConstants.IMG_OBJ_CANDY_01_candy_top);
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
            GameSceneConstants.CandyBlink.INITIAL,
            0.07,
            Timeline.LoopType.NO_LOOP,
            GameSceneConstants.IMG_OBJ_CANDY_01_highlight_start,
            GameSceneConstants.IMG_OBJ_CANDY_01_highlight_end
        );
        this.candyBlink.addAnimationSequence(
            GameSceneConstants.CandyBlink.STAR,
            0.3, // delay
            Timeline.LoopType.NO_LOOP,
            2, // count
            [GameSceneConstants.IMG_OBJ_CANDY_01_glow, GameSceneConstants.IMG_OBJ_CANDY_01_glow]
        );
        const gt = this.candyBlink.getTimeline(GameSceneConstants.CandyBlink.STAR);
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
            GameSceneConstants.IMG_OBJ_BUBBLE_FLIGHT_Frame_1,
            GameSceneConstants.IMG_OBJ_BUBBLE_FLIGHT_Frame_13
        );
        this.candyBubbleAnimation.playTimeline(0);
        this.candy.addChild(this.candyBubbleAnimation);
        this.candyBubbleAnimation.visible = false;
        this.candyBubbleAnimation.drawPosIncrement = 0.0001;

        for (let i = 0; i < GameSceneConstants.HUD_STARS_COUNT; i++) {
            const hs = this.hudStars[i];
            if (hs.currentTimeline) {
                hs.currentTimeline.stop();
            }
            hs.setTextureQuad(GameSceneConstants.IMG_HUD_STAR_Frame_1);
        }

        const map = LevelState.loadedMap;
        this.loadMap(map);

        // add the animations for the bubbles
        if (this.twoParts !== GameSceneConstants.PartsType.NONE) {
            this.candyBubbleAnimationL = new Animation();
            this.candyBubbleAnimationL.initTextureWithId(ResourceId.IMG_OBJ_BUBBLE_FLIGHT);
            this.candyBubbleAnimationL.parentAnchor = this.candyBubbleAnimationL.anchor =
                Alignment.CENTER;
            this.candyBubbleAnimationL.addAnimationDelay(
                0.05,
                Timeline.LoopType.REPLAY,
                GameSceneConstants.IMG_OBJ_BUBBLE_FLIGHT_Frame_1,
                GameSceneConstants.IMG_OBJ_BUBBLE_FLIGHT_Frame_13
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
                GameSceneConstants.IMG_OBJ_BUBBLE_FLIGHT_Frame_1,
                GameSceneConstants.IMG_OBJ_BUBBLE_FLIGHT_Frame_13
            );
            this.candyBubbleAnimationR.playTimeline(0);
            this.candyR.addChild(this.candyBubbleAnimationR);
            this.candyBubbleAnimationR.visible = false;
            this.candyBubbleAnimationR.drawPosIncrement = 0.0001;
        }

        const len = this.rotatedCircles.length;
        let r, i;
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
        this.noCandy = this.twoParts !== GameSceneConstants.PartsType.NONE;
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
            levelText = `${LevelState.pack + 1} - ${LevelState.level + 1}`;
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
    startCamera() {
        const SCREEN_WIDTH = resolution.CANVAS_WIDTH,
            SCREEN_HEIGHT = resolution.CANVAS_HEIGHT;

        if (this.mapWidth > SCREEN_WIDTH || this.mapHeight > SCREEN_HEIGHT) {
            this.ignoreTouches = true;
            this.fastenCamera = false;
            this.camera.type = Camera2D.SpeedType.PIXELS;
            this.camera.speed = 10;
            this.cameraMoveMode = GameSceneConstants.CameraMove.TO_CANDY_PART;

            let startX, startY;
            const cameraTarget =
                this.twoParts !== GameSceneConstants.PartsType.NONE ? this.starL : this.star;

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
    doCandyBlink() {
        this.candyBlink.playTimeline(GameSceneConstants.CandyBlink.INITIAL);
    },
};

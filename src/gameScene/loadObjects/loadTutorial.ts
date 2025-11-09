import TutorialText from "@/game/TutorialText";
import CTRGameObject from "@/game/CTRGameObject";
import ResourceId from "@/resources/ResourceId";
import Alignment from "@/core/Alignment";
import RGBAColor from "@/core/RGBAColor";
import Timeline from "@/visual/Timeline";
import KeyFrame from "@/visual/KeyFrame";
import LevelState from "@/game/LevelState";
import Log from "@/utils/Log";
import MapItem from "@/utils/MapItem";
import resolution from "@/resolution";
import * as GameSceneConstants from "@/gameScene/constants";
import type GameSceneLoaders from "../loaders";
import type { TutorialTextItem, TutorialImageItem } from "../MapLayerItem";

export function loadTutorialText(this: GameSceneLoaders, item: TutorialTextItem): void {
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

export function loadTutorialImage(this: GameSceneLoaders, item: TutorialImageItem): void {
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
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 5.2)
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
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 0.5)
        );
        tl2.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1)
        );
        tl2.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.solidOpaque.copy(), KeyFrame.TransitionType.LINEAR, 1.1)
        );
        tl2.addKeyFrame(
            KeyFrame.makeColor(RGBAColor.transparent.copy(), KeyFrame.TransitionType.LINEAR, 0.5)
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

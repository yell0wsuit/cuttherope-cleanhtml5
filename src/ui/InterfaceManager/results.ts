import platform from "@/config/platforms/platform-web";
import BoxManager from "@/ui/BoxManager";
import ScoreManager from "@/ui/ScoreManager";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import Text from "@/visual/Text";
import Dialogs from "@/ui/Dialogs";
import VideoManager from "@/ui/VideoManager";
import { removeClass, addClass, hide, empty, fadeOut, fadeIn, show } from "@/utils/domHelpers";
import { IS_MSIE_BROWSER } from "@/ui/InterfaceManager/constants";
import ConfettiManager from "@/ui/ConfettiManager";

// result elements
const valdiv = document.getElementById("resultTickerValue") as HTMLCanvasElement | null;
const lbldiv = document.getElementById("resultTickerLabel") as HTMLCanvasElement | null;
const resdiv = document.getElementById("resultScore");
const stamp = document.getElementById("resultImproved");
const msgdiv = document.getElementById("resultTickerMessage");
const levelPanel = document.getElementById("levelPanel");

import type { LevelWonInfo } from "@/ui/InterfaceManager/gameFlow";

interface ResultsManager {
    isInLevelSelectMode: boolean;
    gameFlow: {
        closeBox: () => void;
    };
    _MIN_FPS: number;
}

/**
 * Base class for handling level results
 */
export default class ResultsHandler {
    private manager: ResultsManager;

    constructor(manager: ResultsManager) {
        this.manager = manager;
    }

    /**
     * Handles level won event
     * @param info - Level completion info
     */
    onLevelWon(info: LevelWonInfo): void {
        const stars = info.stars;
        const score = info.score;
        const levelTime = info.time;

        // show level results
        let resultStatusText: string;
        let currentPoints = 0;
        const totalStarPoints = stars * 1000;

        switch (stars) {
            case 3:
                removeClass("#resultStar1", "starEmpty");
                addClass("#resultStar1", "star");
                removeClass("#resultStar2", "starEmpty");
                addClass("#resultStar2", "star");
                removeClass("#resultStar3", "starEmpty");
                addClass("#resultStar3", "star");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED4);
                break;
            case 2:
                removeClass("#resultStar1", "starEmpty");
                addClass("#resultStar1", "star");
                removeClass("#resultStar2", "starEmpty");
                addClass("#resultStar2", "star");
                removeClass("#resultStar3", "star");
                addClass("#resultStar3", "starEmpty");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED3);
                break;
            case 1:
                removeClass("#resultStar1", "starEmpty");
                addClass("#resultStar1", "star");
                removeClass("#resultStar2", "star");
                addClass("#resultStar2", "starEmpty");
                removeClass("#resultStar3", "star");
                addClass("#resultStar3", "starEmpty");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED2);
                break;
            default:
                removeClass("#resultStar1", "star");
                addClass("#resultStar1", "starEmpty");
                removeClass("#resultStar2", "star");
                addClass("#resultStar2", "starEmpty");
                removeClass("#resultStar3", "star");
                addClass("#resultStar3", "starEmpty");
                resultStatusText = Lang.menuText(MenuStringId.LEVEL_CLEARED1);
                break;
        }

        Text.drawBig({
            text: resultStatusText,
            imgSel: "#resultStatus canvas",
            scaleToUI: true,
            canvas: true,
        });

        hide(valdiv);
        hide(lbldiv);
        if (resdiv) {
            empty(resdiv);
            hide(resdiv);
        }
        hide(stamp);
        hide(msgdiv);

        // Helper functions

        const secondsToMin = (sec: number) => {
            const minutes = (sec / 60) | 0;
            const seconds = Math.round(sec % 60);
            return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
        };

        const doStarCountdown = (from: number, callback?: (() => void) | null) => {
            let countDownPoints = from;
            const duration = 1000;
            let lastRender = Date.now();
            const raf = window.requestAnimationFrame;

            const renderCount = () => {
                const now = Date.now();
                const timeDelta = now - lastRender;
                const pointDelta = Math.min(
                    Math.round((from * timeDelta) / duration),
                    countDownPoints
                );

                lastRender = now;
                countDownPoints -= pointDelta;
                currentPoints += pointDelta;
                if (countDownPoints <= 0) {
                    countDownPoints = 0;
                    currentPoints = from;
                    fadeOut(lbldiv, 400);
                    fadeOut(valdiv, 400).then(() => {
                        callback?.();
                    });
                } else if (raf) {
                    raf(renderCount);
                }

                if (valdiv) {
                    Text.drawSmall({
                        text: String(countDownPoints),
                        img: valdiv,
                        scaleToUI: true,
                        canvas: true,
                    });
                }
                Text.drawBigNumbers({
                    text: String(currentPoints),
                    imgParentId: "resultScore",
                    scaleToUI: true,
                    canvas: true,
                });
            };
            renderCount();
        };

        const doTimeCountdown = (
            fromsec: number,
            frompoints: number,
            callback?: (() => void) | null
        ) => {
            const finalPoints = currentPoints + frompoints;
            let countDownSecs = fromsec;
            // between 1 and 2 secs depending on time
            const duration = Math.max(1000, 2000 - fromsec * 50);
            let lastRender = Date.now();
            const raf = window.requestAnimationFrame;

            const renderScore = () => {
                const now = Date.now();
                const percentElapsed = (now - lastRender) / duration;

                lastRender = now;
                currentPoints += Math.round(frompoints * percentElapsed);
                countDownSecs -= fromsec * percentElapsed;
                if (countDownSecs <= 0) {
                    countDownSecs = 0;
                    currentPoints = finalPoints;
                    fadeOut(lbldiv, 400);
                    fadeOut(valdiv, 400).then(() => {
                        callback?.();
                    });
                } else if (raf) {
                    raf(renderScore);
                }

                if (valdiv) {
                    Text.drawSmall({
                        text: secondsToMin(countDownSecs),
                        img: valdiv,
                        scaleToUI: true,
                        canvas: true,
                    });
                }
                Text.drawBigNumbers({
                    text: String(currentPoints),
                    imgParentId: "resultScore",
                    scaleToUI: true,
                    canvas: true,
                });
            };
            renderScore();
        };

        // ANIMATION

        // set up the star bonus countdown
        if (lbldiv) {
            Text.drawSmall({
                text: Lang.menuText(MenuStringId.STAR_BONUS),
                img: lbldiv,
                scaleToUI: true,
                canvas: true,
            });
        }
        if (valdiv) {
            Text.drawSmall({
                text: String(totalStarPoints),
                img: valdiv,
                scaleToUI: true,
                canvas: true,
            });
        }
        if (resdiv) {
            resdiv.querySelectorAll("img").forEach((node) => {
                node.remove();
            });
            resdiv.querySelectorAll("canvas").forEach((node) => {
                node.remove();
            });
        }

        // Trigger confetti for 3-star completion
        const confettiManager = stars === 3 ? new ConfettiManager() : null;

        // TODO: right now boxIndex is zero based and levelIndex starts at 1?
        const boxIndex = BoxManager.currentBoxIndex;
        const levelIndex = BoxManager.currentLevelIndex;

        // save the prev score
        const prevScore = ScoreManager.getScore(boxIndex, levelIndex - 1);

        // run the animation sequence
        setTimeout(() => {
            fadeIn(lbldiv, 300);
            fadeIn(valdiv, 300);
            fadeIn(resdiv, 300).then(() => {
                // Start confetti when results panel appears (3 stars only)
                if (stars === 3 && confettiManager) {
                    if (levelPanel) {
                        confettiManager.start(levelPanel);
                    }
                }
                doStarCountdown(totalStarPoints, () => {
                    if (lbldiv) {
                        Text.drawSmall({
                            text: Lang.menuText(MenuStringId.TIME),
                            img: lbldiv,
                            scaleToUI: true,
                            canvas: true,
                        });
                    }
                    fadeIn(lbldiv, 300);
                    if (valdiv) {
                        Text.drawSmall({
                            text: secondsToMin(Math.ceil(levelTime)),
                            img: valdiv,
                            scaleToUI: true,
                            canvas: true,
                        });
                    }
                    fadeIn(valdiv, 300).then(() => {
                        doTimeCountdown(Math.ceil(levelTime), score - currentPoints, () => {
                            fadeIn(msgdiv, 300);
                            // show the improved result stamp
                            if (prevScore != null && prevScore > 0 && score > prevScore) {
                                if (IS_MSIE_BROWSER) {
                                    show(stamp);
                                } else if (stamp) {
                                    stamp.style.display = "block";
                                    stamp.style.transform = "scale(2.5)";
                                    stamp.style.opacity = "0";
                                    stamp.style.transition = "none";
                                    requestAnimationFrame(() => {
                                        stamp.style.transition =
                                            "transform 600ms ease-in, opacity 600ms ease-in";
                                        stamp.style.transform = "scale(1)";
                                        stamp.style.opacity = "1";
                                        setTimeout(() => {
                                            stamp.style.transition = "";
                                        }, 600);
                                    });
                                }
                            }
                        });
                    });
                });
            });
        }, 1000);

        // Update score of the current level if there is a best result
        ScoreManager.setScore(boxIndex, levelIndex - 1, score, false);
        ScoreManager.setStars(boxIndex, levelIndex - 1, stars, false);

        // unlock next level
        const levelCount = ScoreManager.levelCount(boxIndex);
        if (levelCount != null && levelCount > levelIndex && BoxManager.isNextLevelPlayable()) {
            ScoreManager.setStars(boxIndex, levelIndex, 0, false);
        }

        this.manager.isInLevelSelectMode = false;
        this.manager.gameFlow.closeBox();

        // events that occur after completing the first level
        if (boxIndex === 0 && levelIndex === 1) {
            /*if (analytics.onFirstLevelComplete) {
                analytics.onFirstLevelComplete(info.fps);
            }*/

            // tell the user if the fps was low on the first level
            if (
                info.fps != null &&
                info.fps < this.manager._MIN_FPS &&
                !platform.disableSlowWarning
            ) {
                setTimeout(() => {
                    Dialogs.showSlowComputerPopup();
                }, 3000);
            }
            VideoManager.removeIntroVideo();
        }
    }
}

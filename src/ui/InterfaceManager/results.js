import platform from "@/platform";
import BoxManager from "@/ui/BoxManager";
import ScoreManager from "@/ui/ScoreManager";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import Text from "@/visual/Text";
import Dialogs from "@/ui/Dialogs";
import VideoManager from "@/ui/VideoManager";
import analytics from "@/analytics";
import dom from "@/utils/dom";
import { IS_MSIE_BROWSER } from "@/ui/InterfaceManager/constants";

const { removeClass, addClass, hide, empty, fadeOut, fadeIn, getElement, show } = dom;

// result elements
const valdiv = getElement("#resultTickerValue");
const lbldiv = getElement("#resultTickerLabel");
const resdiv = getElement("#resultScore");
const stamp = getElement("#resultImproved");
const msgdiv = getElement("#resultTickerMessage");

export default function createResultsHandler(manager) {
    const onLevelWon = (info) => {
        const stars = info.stars;
        const score = info.score;
        const levelTime = info.time;

        // show level results
        let resultStatusText;
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

        const secondsToMin = (sec) => {
            const minutes = (sec / 60) | 0;
            const seconds = Math.round(sec % 60);
            return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
        };

        const doStarCountdown = (from, callback) => {
            let countDownPoints = from;
            const duration = 1000;
            let lastRender = Date.now();
            const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

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
                    fadeOut(valdiv, 400).then(callback);
                } else if (raf) {
                    raf(renderCount);
                }

                Text.drawSmall({
                    text: countDownPoints,
                    img: valdiv,
                    scaleToUI: true,
                    canvas: true,
                });
                Text.drawBigNumbers({
                    text: currentPoints,
                    imgParentId: "resultScore",
                    scaleToUI: true,
                    canvas: true,
                });
            };
            renderCount();
        };

        const doTimeCountdown = (fromsec, frompoints, callback) => {
            const finalPoints = currentPoints + frompoints;
            let countDownSecs = fromsec;
            // between 1 and 2 secs depending on time
            const duration = Math.max(1000, 2000 - fromsec * 50);
            let lastRender = Date.now();
            const raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

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
                    fadeOut(valdiv, 400).then(callback);
                } else if (raf) {
                    raf(renderScore);
                }

                Text.drawSmall({
                    text: secondsToMin(countDownSecs),
                    img: valdiv,
                    scaleToUI: true,
                    canvas: true,
                });
                Text.drawBigNumbers({
                    text: currentPoints,
                    imgParentId: "resultScore",
                    scaleToUI: true,
                    canvas: true,
                });
            };
            renderScore();
        };

        // ANIMATION

        // set up the star bonus countdown
        Text.drawSmall({
            text: Lang.menuText(MenuStringId.STAR_BONUS),
            img: lbldiv,
            scaleToUI: true,
            canvas: true,
        });
        Text.drawSmall({
            text: totalStarPoints,
            img: valdiv,
            scaleToUI: true,
            canvas: true,
        });
        if (resdiv) {
            resdiv.querySelectorAll("img").forEach((node) => {
                node.remove();
            });
            resdiv.querySelectorAll("canvas").forEach((node) => {
                node.remove();
            });
        }

        // run the animation sequence
        setTimeout(() => {
            fadeIn(lbldiv, 300);
            fadeIn(valdiv, 300);
            fadeIn(resdiv, 300).then(() => {
                doStarCountdown(totalStarPoints, () => {
                    Text.drawSmall({
                        text: Lang.menuText(MenuStringId.TIME),
                        img: lbldiv,
                        scaleToUI: true,
                        canvas: true,
                    });
                    fadeIn(lbldiv, 300);
                    Text.drawSmall({
                        text: secondsToMin(Math.ceil(levelTime)),
                        img: valdiv,
                        scaleToUI: true,
                        canvas: true,
                    });
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

        // TODO: right now boxIndex is zero based and levelIndex starts at 1?
        const boxIndex = BoxManager.currentBoxIndex;
        const levelIndex = BoxManager.currentLevelIndex;

        // save the prev score
        const prevScore = ScoreManager.getScore(boxIndex, levelIndex - 1);

        // Update score of the current level if there is a best result
        ScoreManager.setScore(boxIndex, levelIndex - 1, score);
        ScoreManager.setStars(boxIndex, levelIndex - 1, stars);

        // unlock next level
        if (ScoreManager.levelCount(boxIndex) > levelIndex && BoxManager.isNextLevelPlayable()) {
            ScoreManager.setStars(boxIndex, levelIndex, 0);
        }

        manager.isInLevelSelectMode = false;
        manager.closeBox();

        // events that occur after completing the first level
        if (boxIndex === 0 && levelIndex === 1) {
            if (analytics.onFirstLevelComplete) {
                analytics.onFirstLevelComplete(info.fps);
            }

            // tell the user if the fps was low on the first level
            if (info.fps < manager._MIN_FPS && !platform.disableSlowWarning) {
                setTimeout(() => {
                    Dialogs.showSlowComputerPopup();
                }, 3000);
            }
            VideoManager.removeIntroVideo();
        }
    };
    return { onLevelWon };
}

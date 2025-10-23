import resolution from "@/resolution";
import PanelId from "@/ui/PanelId";
import PanelManager from "@/ui/PanelManager";
import GameBorder from "@/ui/GameBorder";
import SoundMgr from "@/game/CTRSoundMgr";
import BoxManager from "@/ui/BoxManager";
import ScoreManager from "@/ui/ScoreManager";
import Dialogs from "@/ui/Dialogs";
import Doors from "@/Doors";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import Text from "@/visual/Text";
import PubSub from "@/utils/PubSub";
import dom from "@/utils/dom";
import { MENU_MUSIC_ID } from "@/ui/InterfaceManager/constants";
const { hide, append, empty, getElement } = dom;
export default function createPanelShowHandler(manager) {
    return (panelId) => {
        const panel = PanelManager.getPanelById(panelId);

        switch (panelId) {
            case PanelId.MENU:
            case PanelId.BOXES:
            case PanelId.OPTIONS:
                GameBorder.fadeOut(300);
                break;
            case PanelId.LEVELS:
                GameBorder.show();
                break;
        }

        // make sure the pause level panel is closed
        if (panelId !== PanelId.GAMEMENU) {
            manager._closeLevelMenu();
        }

        // make sure the menu music is started on main menu and level selection
        // which are the entry points from the game
        if (panelId === PanelId.MENU || panelId === PanelId.LEVELS) {
            SoundMgr.playMusic(MENU_MUSIC_ID);
        }

        const boxPanel = PanelManager.getPanelById(PanelId.BOXES);
        if (panelId === PanelId.BOXES) {
            BoxManager.updateBoxLocks();
            ScoreManager.updateTotalScoreText();
            boxPanel.onShow();

            if (manager.isInAdvanceBoxMode) {
                manager.isInAdvanceBoxMode = false;
                setTimeout(() => {
                    hide("#levelResults");
                    boxPanel.slideToNextBox();

                    // if next level is not playable, show the purchase prompt
                    if (!BoxManager.isNextLevelPlayable()) {
                        Dialogs.showPayDialog();
                    }
                }, 800);
            } else {
                clearTimeout(manager._bounceTimeOut);
                manager._bounceTimeOut = setTimeout(() => {
                    boxPanel.bounceCurrentBox();
                }, 300);
            }
        } else {
            boxPanel.onHide();
        }

        const codePanel = PanelManager.getPanelById(PanelId.PASSWORD);
        if (codePanel) {
            if (panelId === PanelId.PASSWORD) {
                codePanel.onShow();
            } else {
                codePanel.onHide();
            }
        }

        if (panelId === PanelId.LEVELS) {
            Doors.renderDoors(true, 0);
            panel.onShow();
        } else if (panelId === PanelId.GAME) {
            manager._updateMiniSoundButton(false, "optionSound");
        } else if (panelId === PanelId.GAMECOMPLETE) {
            hide("#levelResults");

            GameBorder.setGameCompleteBorder();

            const gameWonText = Lang.menuText(MenuStringId.GAME_FINISHED_TEXT).replace(
                "%d",
                ScoreManager.totalStars()
            );
            Text.drawBig({
                text: gameWonText,
                imgSel: "#finalScore img",
                scale: 0.8 * resolution.UI_TEXT_SCALE,
                alignment: 1,
            });

            const congratsElement = getElement("#congrats");
            if (congratsElement) {
                empty(congratsElement);
                append(
                    congratsElement,
                    Text.drawBig({
                        text: Lang.menuText(MenuStringId.CONGRATULATIONS),
                        scale: 1.2 * resolution.UI_TEXT_SCALE,
                    })
                );
            }
            Text.drawBig({
                text: Lang.menuText(MenuStringId.SHARE_ELLIPSIS),
                imgSel: "#finalShareBtn img",
                scale: 0.8 * resolution.UI_TEXT_SCALE,
                maxScaleWidth: resolution.uiScaledNumber(130),
            });
            Text.drawBig({
                text: Lang.menuText(MenuStringId.MORE_CTR_FUN),
                imgSel: "#finalFunBtn img",
                scale: 0.8 * resolution.UI_TEXT_SCALE,
                maxScaleWidth: resolution.uiScaledNumber(310),
            });
        } else if (panelId === PanelId.OPTIONS) {
            PubSub.publish(PubSub.ChannelId.ShowOptionsPage);
        } else if (panelId === PanelId.ACHIEVEMENTS) {
            PubSub.publish(PubSub.ChannelId.UpdateCandyScroller);
        } else if (panelId === PanelId.LEADERBOARDS) {
            PubSub.publish(PubSub.ChannelId.UpdateCandyScroller);
        }
    };
}

import SoundMgr from "@/game/CTRSoundMgr";
import Lang from "@/resources/Lang";
import MenuStringId from "@/resources/MenuStringId";
import Alignment from "@/core/Alignment";
import Text from "@/visual/Text";
import dom from "@/utils/dom";
const { addClass, removeClass, setStyle, stopAnimations, fadeIn, fadeOut, delay } = dom;
export default function createAudioOptions() {
    const showMiniOptionMessage = (msgId, messageText, delayDuration) => {
        if (msgId === undefined) {
            return;
        }
        const showDelay = delayDuration || 500;

        const msg = document.getElementById(msgId);

        if (!msg) {
            return;
        }

        let img = msg.querySelector("img");
        if (!img) {
            img = document.createElement("img");
            msg.appendChild(img);
        }
        Text.drawSmall({
            text: messageText,
            img,
            scaleToUI: true,
            alpha: 0.6,
            alignment: Alignment.LEFT,
        });
        stopAnimations(msg);
        fadeIn(msg, 500)
            .then(() => delay(msg, showDelay))
            .then(() => fadeOut(msg, 750));
    };

    const updateMiniSoundButton = (doToggle, buttonId, msgId) => {
        let isSoundOn = SoundMgr.soundEnabled;
        let isMusicOn = SoundMgr.musicEnabled;
        if (doToggle) {
            if (isSoundOn && isMusicOn) {
                isSoundOn = true;
                isMusicOn = false;
            } else if (!isSoundOn && !isMusicOn) {
                isSoundOn = true;
                isMusicOn = true;
            } else {
                isSoundOn = false;
                isMusicOn = false;
            }
            SoundMgr.setSoundEnabled(isSoundOn);
            SoundMgr.setMusicEnabled(isMusicOn);
        }

        const className =
            !isSoundOn && !isMusicOn
                ? "noSound"
                : isSoundOn && !isMusicOn
                  ? "effectsOnly"
                  : "allSound";

        const allClassNames = "effectsOnly noSound allSound";
        removeClass("#optionSound", allClassNames);
        addClass("#optionSound", className);
        removeClass("#gameSound", allClassNames);
        addClass("#gameSound", className);
        setStyle("#soundBtn .options-x", "display", !isSoundOn ? "block" : "none");
        setStyle("#musicBtn .options-x", "display", !isMusicOn ? "block" : "none");

        let text;
        if (!isMusicOn && !isSoundOn) {
            text = Lang.menuText(MenuStringId.EVERYTHING_OFF);
        } else {
            const musicId = isMusicOn ? MenuStringId.MUSIC_ON : MenuStringId.MUSIC_OFF;
            const soundId = isSoundOn ? MenuStringId.SOUNDS_ON : MenuStringId.SOUNDS_OFF;
            const template = Lang.menuText(MenuStringId.AND_TEMPLATE);
            text = template
                .replace("{0}", Lang.menuText(musicId).toLowerCase())
                .replace("{1}", Lang.menuText(soundId).toLowerCase());
        }
        showMiniOptionMessage(msgId, text);
    };

    return {
        _showMiniOptionMessage: showMiniOptionMessage,
        _updateMiniSoundButton: updateMiniSoundButton,
    };
}

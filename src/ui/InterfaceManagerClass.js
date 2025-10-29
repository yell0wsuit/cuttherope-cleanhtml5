import settings from "@/game/CTRSettings";
import PubSub from "@/utils/PubSub";
import QueryStrings from "@/ui/QueryStrings";
import PanelManager from "@/ui/PanelManager";
import AudioOptions from "@/ui/InterfaceManager/audioOptions";
import { setImageBigText } from "@/ui/InterfaceManager/text";
import PanelInitializer from "@/ui/InterfaceManager/panelsInitialize";
import PanelShowHandler from "@/ui/InterfaceManager/panelsShow";
import GameFlow from "@/ui/InterfaceManager/gameFlow";
import ResultsHandler from "@/ui/InterfaceManager/results";
import { toggleClass } from "@/utils/domHelpers";
import applyMixins from "@/utils/applyMixins";

/**
 * InterfaceManager - Main UI management class
 * Extends AudioOptions and includes methods from PanelInitializer, PanelShowHandler, GameFlow, and ResultsHandler
 *
 * @class
 * @extends AudioOptions
 *
 * Inherited methods from AudioOptions:
 * @method _showMiniOptionMessage
 * @method _updateMiniSoundButton
 *
 * Mixed-in methods from PanelInitializer:
 * @method _onInitializePanel
 *
 * Mixed-in methods from PanelShowHandler:
 * @method _onShowPanel
 *
 * Mixed-in methods from GameFlow:
 * @method _notifyBeginTransition
 * @method _runScoreTicker
 * @method _isLastLevel
 * @method _openLevel
 * @method openLevel
 * @method _closeLevel
 * @method _completeBox
 * @method _openLevelMenu
 * @method _closeLevelMenu
 * @method _showLevelBackground
 * @method _hideLevelBackground
 * @method tapeBox
 * @method showGameUI
 * @method closeGameUI
 * @method openBox
 * @method closeBox
 * @method updateDevLink
 * @method pauseGame
 * @method resumeGame
 * @method domReady
 * @method appReady
 * @method noMenuStartLevel
 * @method openLevelMenu
 *
 * Mixed-in methods from ResultsHandler:
 * @method onLevelWon
 */
class InterfaceManager extends AudioOptions {
    constructor() {
        super();
        this.useHDVersion = settings.getIsHD();
        this.isInLevelSelectMode = false;
        this.isInMenuSelectMode = false;
        this.isInAdvanceBoxMode = false;
        this.isBoxOpen = false;
        this.isTransitionActive = false;
        this.gameEnabled = true;
        this._MIN_FPS = QueryStrings.minFps || 30;
        this._signedIn = false;
        this._bounceTimeOut = null;
        this._transitionTimeout = null;
        this._resultTopLines = [];
        this._resultBottomLines = [];
        this._currentResultLine = 0;
        this._resultTimeShiftIndex = 0;
        this._isDevLinkVisible = true;
        this._setImageBigText = setImageBigText;

        // Initialize PanelManager callback (moved from init() method)
        PanelManager.onShowPanel = (panelId) => this._onShowPanel(panelId);

        PubSub.subscribe(PubSub.ChannelId.SignIn, () => {
            this._signedIn = true;
            this._updateSignInControls();
        });
        PubSub.subscribe(PubSub.ChannelId.SignOut, () => {
            this._signedIn = false;
            this._updateSignInControls();
        });
    }

    _updateSignInControls() {
        toggleClass("#achievementsBtn", "disabled", !this._signedIn);
        toggleClass("#leaderboardsBtn", "disabled", !this._signedIn);
    }
}

// Apply mixins to add methods from other classes
applyMixins(InterfaceManager, [PanelInitializer, PanelShowHandler, GameFlow, ResultsHandler]);

export default InterfaceManager;

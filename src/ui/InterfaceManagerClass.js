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

/**
 * InterfaceManager - Main UI management class using composition pattern
 *
 * This class uses composition to organize functionality into clear, separate modules.
 * Each module is responsible for a specific aspect of the UI.
 *
 * @class
 * @extends AudioOptions - Handles audio UI controls (sound/music buttons)
 *
 * Composed modules (accessed via properties):
 * @property {GameFlow} gameFlow - Game state, levels, boxes, and UI transitions
 * @property {ResultsHandler} results - Level completion and scoring display
 * @property {PanelInitializer} panels - Panel event handler initialization
 * @property {PanelShowHandler} panelShow - Panel visibility management
 */
class InterfaceManager extends AudioOptions {
    constructor() {
        super();

        // Core state properties
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

        // Create composed module instances with explicit manager delegation
        this.gameFlow = new GameFlow(this);
        this.results = new ResultsHandler(this);
        this.panels = new PanelInitializer(this);
        this.panelShow = new PanelShowHandler(this);

        // Initialize PanelManager callback
        PanelManager.onShowPanel = (panelId) => this.panelShow.onShowPanel(panelId);

        // Subscribe to authentication events
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

export default InterfaceManager;

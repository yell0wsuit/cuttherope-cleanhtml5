import settings from "@/game/CTRSettings";
import PubSub from "@/utils/PubSub";
import QueryStrings from "@/ui/QueryStrings";
import panelManager from "@/ui/PanelManager";
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
 */
class InterfaceManager extends AudioOptions {
    useHDVersion: boolean;
    isInLevelSelectMode: boolean;
    isInMenuSelectMode: boolean;
    isInAdvanceBoxMode: boolean;
    isBoxOpen: boolean;
    isTransitionActive: boolean;
    gameEnabled: boolean;
    readonly _MIN_FPS: number;
    _signedIn: boolean;
    _bounceTimeOut: ReturnType<typeof window.setTimeout> | null;
    _transitionTimeout: ReturnType<typeof window.setTimeout> | null;
    _resultTopLines: string[];
    _resultBottomLines: string[];
    _currentResultLine: number;
    _resultTimeShiftIndex: number;
    _isDevLinkVisible: boolean;
    _setImageBigText: typeof setImageBigText;

    gameFlow: GameFlow;
    results: ResultsHandler;
    panels: PanelInitializer;
    panelShow: PanelShowHandler;

    constructor() {
        super();

        // Core state properties
        this.useHDVersion = settings.getIsHD() ?? false;
        this.isInLevelSelectMode = false;
        this.isInMenuSelectMode = false;
        this.isInAdvanceBoxMode = false;
        this.isBoxOpen = false;
        this.isTransitionActive = false;
        this.gameEnabled = true;
        this._MIN_FPS = QueryStrings.minFps ?? 30;
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
        panelManager.onShowPanel = (panelId) => this.panelShow.onShowPanel(panelId);

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

    _updateSignInControls(): void {
        toggleClass("#achievementsBtn", "disabled", !this._signedIn);
        toggleClass("#leaderboardsBtn", "disabled", !this._signedIn);
    }
}

export default InterfaceManager;

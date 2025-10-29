import settings from "@/game/CTRSettings";
import PubSub from "@/utils/PubSub";
import QueryStrings from "@/ui/QueryStrings";
import dom from "@/utils/dom";
import createAudioOptions from "@/ui/InterfaceManager/audioOptions";
import { setImageBigText } from "@/ui/InterfaceManager/text";
import createPanelInitializer from "@/ui/InterfaceManager/panelsInitialize";
import createPanelShowHandler from "@/ui/InterfaceManager/panelsShow";
import createGameFlow from "@/ui/InterfaceManager/gameFlow";
import createResultsHandler from "@/ui/InterfaceManager/results";

const { toggleClass } = dom;

class InterfaceManager {
    constructor() {
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
        Object.assign(this, createAudioOptions());
        this._setImageBigText = setImageBigText;
        this._onInitializePanel = createPanelInitializer(this);
        this._onShowPanel = createPanelShowHandler(this);
        Object.assign(this, createGameFlow(this));
        Object.assign(this, createResultsHandler(this));
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

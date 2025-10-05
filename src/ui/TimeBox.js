import Class from "@/utils/Class";
import Box from "@/ui/Box";
import Text from "@/visual/Text";
import resolution from "@/resolution";
import platform from "@/platform";
import BoxType from "@/ui/BoxType";
import PubSub from "@/utils/PubSub";
import Lang from "@/resources/Lang";
import Alignment from "@/core/Alignment";
import ScoreManager from "@/ui/ScoreManager";
import MenuStringId from "@/resources/MenuStringId";
import QueryStrings from "@/ui/QueryStrings";
import edition from "@/edition";
import MathHelper from "@/utils/MathHelper";
import SettingStorage from "@/core/SettingStorage";
import dom from "@/utils/dom";
// promotion runs from March 4 - April 14
// using ticks makes finding hacking more difficult because
// you can't search the code for well known dates
let BoxOpenDates = [
    1362384000000, // Mar 4
    1362985200000, // Mar 11
    1363590000000, // Mar 18
    1364194800000, // Mar 25
    1364799600000, // Apr 1
    1365404400000, // Apr 8
];

// for testing the date locks
if (true) {
    BoxOpenDates = [
        new Date(), // open now
        new Date(), // open now
        new Date(), // open now
        1364194800000, // Mar 25
        1364799600000, // Apr 1
        1365404400000, // Apr 8
    ];
}

// The random seeds that will be XOR'd with the user's unique value
// to create the keys used to store the status of each box unlock
const BoxKeySeeds = [9240, 7453, 3646, 7305, 5093, 3829];

const LOCK_KEY_PREFIX = String.fromCharCode(98, 107), // prefix is 'bk'
    XOR_VALUE = ScoreManager.getXorValue(),
    getLockKey = function (boxIndex) {
        return LOCK_KEY_PREFIX + (BoxKeySeeds[boxIndex] ^ XOR_VALUE);
    },
    isLocked = function (boxIndex) {
        const key = getLockKey(boxIndex),
            value = SettingStorage.getIntOrDefault(key, 0),
            correctValue = (BoxKeySeeds[boxIndex] - 1000) ^ XOR_VALUE;

        return value !== correctValue && !QueryStrings.unlockAllBoxes;
    },
    unlockBox = function (boxIndex) {
        const key = getLockKey(boxIndex),
            value = (BoxKeySeeds[boxIndex] - 1000) ^ XOR_VALUE;

        SettingStorage.set(key, value);
    };

let enterCodeButton = null;
document.addEventListener("DOMContentLoaded", function () {
    enterCodeButton = document.getElementById("boxEnterCodeButton");
    if (enterCodeButton) {
        dom.hide(enterCodeButton);
    }
});

// cache text images shared between boxes
let availableTextImg = null,
    collectTextImg = null,
    toUnlockTextImg = null,
    bkCodeTextImg = null;

const MonthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const TimeBox = Box.extend({
    init: function (boxIndex, bgimg, reqstars, islocked, type) {
        this._super(boxIndex, bgimg, reqstars, islocked, type);
        this.lockedBoxImg = new Image();
        this.lockedBoxImg.src = this.boxImg.src.replace(".png", "_locked.png");
        this.isBkCodeLocked = isLocked(boxIndex);
        this.isTimeLocked = QueryStrings.unlockAllBoxes !== true && Date.now() < BoxOpenDates[boxIndex];
        this.dateImg = null;
    },

    isClickable: function () {
        return !this.isTimeLocked && !this.isBkCodeLocked;
    },

    onSelected: function () {
        if (!this.isTimeLocked && this.isBkCodeLocked && enterCodeButton) {
            dom.fadeIn(enterCodeButton);
        }
    },

    onUnselected: function () {
        if (enterCodeButton) {
            dom.hide(enterCodeButton);
        }
    },

    render: function (ctx, omnomoffset) {
        const locked = this.islocked || this.isTimeLocked || this.isBkCodeLocked;

        // draw the base box image
        ctx.drawImage(
            locked ? this.lockedBoxImg : this.boxImg,
            resolution.uiScaledNumber(25),
            resolution.uiScaledNumber(0)
        );

        if (this.isTimeLocked) {
            // draw label above date
            if (!availableTextImg) {
                availableTextImg = new Image();
                Text.drawBig({
                    text: "Available starting from",
                    img: availableTextImg,
                    alignment: Alignment.HCENTER,
                    width: resolution.uiScaledNumber(250),
                });
            }
            if (availableTextImg.complete) {
                ctx.drawImage(
                    availableTextImg,
                    resolution.uiScaledNumber(100),
                    resolution.uiScaledNumber(120),
                    availableTextImg.width * 0.8 * resolution.UI_TEXT_SCALE,
                    availableTextImg.height * 0.8 * resolution.UI_TEXT_SCALE
                );
            }

            // draw date the box will open
            if (!this.dateImg) {
                this.dateImg = new Image();
                const openDate = new Date(BoxOpenDates[this.index]);
                Text.drawBig({
                    text: MonthNames[openDate.getMonth()] + " " + openDate.getDate(),
                    img: this.dateImg,
                    width: resolution.uiScaledNumber(200),
                    alignment: Alignment.HCENTER,
                });
            }
            if (this.dateImg.complete) {
                ctx.drawImage(
                    this.dateImg,
                    resolution.uiScaledNumber(77),
                    resolution.uiScaledNumber(195),
                    this.dateImg.width * 1.2 * resolution.UI_TEXT_SCALE,
                    this.dateImg.height * 1.2 * resolution.UI_TEXT_SCALE
                );
            }
        } else if (this.isBkCodeLocked) {
            // text label for "Collect"
            if (!bkCodeTextImg) {
                bkCodeTextImg = new Image();
                Text.drawBig({
                    text: "Visit Burger King to get an\n unlock code!",
                    img: bkCodeTextImg,
                    alignment: Alignment.HCENTER,
                    width: resolution.uiScaledNumber(280),
                });

                Text.drawBig({
                    text: "Enter Code",
                    imgParentId: "boxEnterCodeButton",
                    scaleToUI: true,
                });
            }

            if (bkCodeTextImg.complete) {
                ctx.drawImage(bkCodeTextImg, resolution.uiScaledNumber(50), resolution.uiScaledNumber(90));
            }
        } else if (this.islocked) {
            // text label for "Collect"
            if (!collectTextImg) {
                collectTextImg = new Image();
                Text.drawBig({
                    text: "Collect",
                    img: collectTextImg,
                    scaleToUI: true,
                });
            }
            if (collectTextImg.complete) {
                ctx.drawImage(collectTextImg, resolution.uiScaledNumber(143), resolution.uiScaledNumber(108));
            }

            // prefer css dimensions (scaled) for text
            const reqImgWidth = this.reqImg ? this.reqImg.offsetWidth || this.reqImg.width || 0 : 0,
                reqImgHeight = this.reqImg ? this.reqImg.offsetHeight || this.reqImg.height || 0 : 0,
                textWidth = reqImgWidth * 1.2,
                textHeight = reqImgHeight * 1.2,
                // ok to use raw image width for star (image already scaled)
                starWidth = this.starImg ? this.starImg.offsetWidth || this.starImg.width || 0 : 0,
                starMargin = resolution.uiScaledNumber(-4),
                // center the text and star label
                labelWidth = textWidth + starMargin + starWidth,
                labelMaxWidth = resolution.uiScaledNumber(125),
                labelOffsetX = (labelMaxWidth - labelWidth) / 2,
                labelMinX = resolution.uiScaledNumber(140),
                labelX = labelMinX + labelOffsetX;

            ctx.drawImage(this.starImg, labelX, resolution.uiScaledNumber(160));
            ctx.drawImage(this.reqImg, labelX + starWidth, resolution.uiScaledNumber(150), textWidth, textHeight);

            // text label for "to unlock"
            if (!toUnlockTextImg) {
                toUnlockTextImg = new Image();
                Text.drawBig({
                    text: "to unlock",
                    img: toUnlockTextImg,
                    scaleToUI: true,
                });
            }
            if (toUnlockTextImg.complete) {
                ctx.drawImage(toUnlockTextImg, resolution.uiScaledNumber(130), resolution.uiScaledNumber(204));
            }
        }
    },
});

TimeBox.unlockBox = unlockBox;
TimeBox.isLocked = isLocked;

export default TimeBox;

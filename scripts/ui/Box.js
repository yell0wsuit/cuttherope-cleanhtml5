define("ui/Box", [
    "utils/Class",
    "ui/Easing",
    "visual/Text",
    "resolution",
    "platform",
    "ui/BoxType",
    "utils/PubSub",
    "resources/Lang",
    "core/Alignment",
    "ui/ScoreManager",
    "resources/MenuStringId",
    "edition",
    "game/CTRSettings",
], function (
    Class,
    Easing,
    Text,
    resolution,
    platform,
    BoxType,
    PubSub,
    Lang,
    Alignment,
    ScoreManager,
    MenuStringId,
    edition,
    settings
) {
    // cache upgrade UI elements
    var $upgradeButton;
    $(function () {
        $upgradeButton = $("#boxUpgradePlate").hide();
    });

    function hidePurchaseButton() {
        if ($upgradeButton) {
            $upgradeButton.fadeOut(200);
        }
    }

    PubSub.subscribe(PubSub.ChannelId.SetPaidBoxes, function (paid) {
        if (paid) {
            hidePurchaseButton();
        }
    });

    // localize UI element text
    PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
        Text.drawBig({
            text: Lang.menuText(MenuStringId.BUY_FULL_GAME),
            imgParentId: "boxUpgradePlate",
            scale: 0.6 * resolution.UI_TEXT_SCALE,
        });
    });

    var boxImageBase = platform.boxImageBaseUrl || platform.uiImageBaseUrl;

    var Box = Class.extend({
        init: function (boxIndex, bgimg, reqstars, islocked, type) {
            this.index = boxIndex;
            this.islocked = islocked;
            this.visible = true;

            // initially we assume all boxes are included in the game
            this.purchased = true;

            this.bounceStartTime = 0;
            this.opacity = 1.0;
            this.type = type;

            this.boxImg = new Image();

            if (bgimg) {
                this.boxImg.src = boxImageBase + bgimg;
            }

            var textImg = (this.textImg = new Image()),
                boxWidth = (this.boxWidth = resolution.uiScaledNumber(350)),
                boxTextMargin = (this.boxTextMargin = resolution.uiScaledNumber(20)),
                self = this;

            //     console.log(boxTextMargin)
            //     this.boxTextMargin = 100;
            // }

            this.textRendered = false;
            this.renderText = function () {
                Text.drawBig({
                    text: Lang.boxText(boxIndex, self.includeBoxNumberInTitle),
                    img: textImg,
                    width: (boxWidth - boxTextMargin * 2) / resolution.UI_TEXT_SCALE,
                    alignment: Alignment.HCENTER,
                    scaleToUI: true,
                });

                self.textRendered = true;
            };

            PubSub.subscribe(PubSub.ChannelId.LanguageChanged, this.renderText);

            this.reqImg = Text.drawBig({ text: reqstars, scaleToUI: true });

            this.omNomImg = new Image();
            this.omNomImg.src = platform.uiImageBaseUrl + "box_omnom.png";

            this.lockImg = new Image();
            this.lockImg.src = platform.uiImageBaseUrl + "box_lock.png";

            this.starImg = new Image();
            this.starImg.src = platform.uiImageBaseUrl + "star_result_small.png";

            this.perfectMark = new Image();
            this.perfectMark.src = platform.uiImageBaseUrl + "perfect_mark.png";

            this.includeBoxNumberInTitle = true;
        },

        isRequired: function () {
            return true;
        },

        isGameBox: function () {
            return true;
        },

        isClickable: function () {
            return true;
        },

        draw: function (ctx, omnomoffset) {
            var prevAlpha = ctx.globalAlpha;
            if (this.opacity !== prevAlpha) {
                ctx.globalAlpha = this.opacity;
            }

            // render the box
            this.render(ctx, omnomoffset);

            // restore alpha
            if (this.opacity !== prevAlpha) {
                ctx.globalAlpha = prevAlpha;
            }
        },

        render: function (ctx, omnomoffset) {
            var isGameBox = this.isGameBox();
            if (isGameBox) {
                // draw the black area
                ctx.fillStyle = "rgb(45,45,53)";
                ctx.fillRect(
                    resolution.uiScaledNumber(130),
                    resolution.uiScaledNumber(200),
                    resolution.uiScaledNumber(140),
                    resolution.uiScaledNumber(100)
                );

                // draw omnom
                if (omnomoffset != null) {
                    ctx.drawImage(
                        this.omNomImg,
                        omnomoffset + resolution.uiScaledNumber(4),
                        resolution.uiScaledNumber(215)
                    );
                }
            }

            // draw the box image
            ctx.drawImage(this.boxImg, resolution.uiScaledNumber(25), resolution.uiScaledNumber(0));

            if (isGameBox) {
                // draw the lock
                if (this.islocked) {
                    // prefer css dimensions (scaled) for text
                    var textWidth = $(this.reqImg).width() || this.reqImg.width,
                        textHeight = $(this.reqImg).height() || this.reqImg.height,
                        // ok to use raw image width for star (image already scaled)
                        starWidth = this.starImg.width || $(this.starImg).width(),
                        starLeftMargin = resolution.uiScaledNumber(-6),
                        // center the text and star label
                        labelWidth = textWidth + starLeftMargin + starWidth,
                        labelMaxWidth = resolution.uiScaledNumber(125),
                        labelOffsetX = (labelMaxWidth - labelWidth) / 2,
                        labelMinX = resolution.uiScaledNumber(140),
                        labelX = labelMinX + labelOffsetX;

                    // slightly scale the lock image (not quite big enough for our boxes)
                    // TODO: should resize lock images for every resolution and remove scaling
                    // TODO: also need to normalize the size of boxes (which vary)
                    ctx.scale(1.015, 1);
                    ctx.drawImage(
                        this.lockImg,
                        resolution.uiScaledNumber(23),
                        resolution.uiScaledNumber(155)
                    );
                    ctx.scale(1 / 1.015, 1);

                    if (this.purchased) {
                        ctx.drawImage(
                            this.reqImg,
                            labelX,
                            resolution.uiScaledNumber(220),
                            textWidth,
                            textHeight
                        );
                        ctx.drawImage(
                            this.starImg,
                            labelX + textWidth + starLeftMargin,
                            resolution.uiScaledNumber(225)
                        );
                    }

                    /*
                         // DEBUG: draw red dots to show the label boundaries
                         ctx.fillStyle= 'red';
                         ctx.beginPath();
                         ctx.arc(labelMinX, resolution.uiScaledNumber(220), 5, 0, 2*Math.PI, false);
                         ctx.fill();

                         ctx.beginPath();
                         ctx.arc(labelMinX + labelMaxWidth, resolution.uiScaledNumber(220), 5, 0, 2*Math.PI, false);
                         ctx.fill();
                         */
                }

                // draw the perfect mark if user got every star in the box
                if (
                    ScoreManager.achievedStars(this.index) ===
                    ScoreManager.possibleStarsForBox(this.index)
                ) {
                    ctx.drawImage(
                        this.perfectMark,
                        resolution.uiScaledNumber(260),
                        resolution.uiScaledNumber(250)
                    );
                }
            }

            // draw the text
            if (!this.textRendered) {
                this.renderText();
            }

            var $textImg = $(this.textImg),
                textWidth = $textImg.width() || this.textImg.width,
                textHeight = $textImg.height() || this.textImg.height,
                x = ~~(
                    resolution.uiScaledNumber(25) +
                    this.boxTextMargin +
                    (this.boxWidth - this.boxTextMargin * 2 - textWidth) / 2
                ),
                y = resolution.uiScaledNumber(70);

            ctx.drawImage(this.textImg, x, y);
        },

        bounce: function (ctx) {
            if (!ctx) {
                return;
            }

            this.bounceStartTime = Date.now();

            // stage boundaries in msec
            var s1 = 100,
                s2 = 300,
                s3 = 600,
                w = resolution.uiScaledNumber(1024),
                h = resolution.uiScaledNumber(576);

            var self = this,
                renderBounce = function () {
                    // get the elapsed time
                    t = Date.now() - self.bounceStartTime;

                    var d, x, y;

                    if (t < s1) {
                        d = Easing.easeOutSine(t, 0, 0.05, s1); // to 0.95
                        x = 1.0 - d;
                        y = 1.0 + d;
                    } else if (t < s2) {
                        d = Easing.easeInOutCubic(t - s1, 0, 0.11, s2 - s1); // to 0.95
                        x = 0.95 + d;
                        y = 1.05 - d;
                    } else if (t < s3) {
                        // intentionally not ending at 1.0 prevents the animation from "snapping" at the end.
                        // it's not a great hack, but the animation ends up much smoother (esp. in IE)
                        d = Easing.easeOutCubic(t - s2, 0, 0.05, s3 - s2); // to 0.95
                        x = 1.06 - d;
                        y = 0.94 + d;
                    }

                    var tx = (w - w * x) / 2.0,
                        ty = (h - h * y) / 2.0,
                        sx = (w - 2.0 * tx) / w,
                        sy = (h - 2.0 * ty) / h;

                    if (!isNaN(sx) && !isNaN(sy)) {
                        ctx.save();
                        ctx.setTransform(1, 0, 0, 1, 0, 0);
                        ctx.clearRect(
                            resolution.uiScaledNumber(312),
                            resolution.uiScaledNumber(100),
                            resolution.uiScaledNumber(400),
                            resolution.uiScaledNumber(460)
                        );
                        ctx.restore();

                        ctx.save();
                        ctx.scale(sx, sy);
                        ctx.translate(tx, ty);
                        ctx.translate(
                            resolution.uiScaledNumber(312),
                            resolution.uiScaledNumber(130)
                        );
                        self.draw(ctx, resolution.uiScaledNumber(140));
                        ctx.restore();
                    }

                    if (t > s3) {
                        self.bounceStartTime = 0;
                    } else {
                        window.requestAnimationFrame(renderBounce);
                    }
                };

            // start the animation
            renderBounce();
        },

        cancelBounce: function () {
            this.bounceStartTime = 0;
        },

        onSelected: function () {
            if (!this.purchased) {
                $upgradeButton.toggleClass("purchaseBox", this.isPurchaseBox || false).fadeIn();
            }
        },

        onUnselected: function () {
            hidePurchaseButton();
        },
    });

    return Box;
});

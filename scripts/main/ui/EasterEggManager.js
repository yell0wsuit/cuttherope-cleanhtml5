define("ui/EasterEggManager", [
    "visual/Text",
    "ui/SocialHelper",
    "platform",
    "resolution",
    "analytics",
    "ui/Easing",
    "utils/PubSub",
    "game/CTRRootController",
    "resources/Lang",
    "resources/MenuStringId",
], function (Text, SocialHelper, platform, resolution, analytics, Easing, PubSub, RootController, Lang, MenuStringId) {
    class EasterEggManager {
        constructor() {
            let devCanvas,
                canvas,
                scaleTo = resolution.uiScaledNumber(2.2);

            const getElementById = (id) => document.getElementById(id);
            const animateElement = (element, keyframes, options = {}) => {
                if (!element) {
                    return Promise.resolve();
                }
                const animation = element.animate(keyframes, { fill: "forwards", ...options });
                return animation.finished.catch(() => {});
            };
            const fadeElement = (element, { from = null, to = 1, duration = 200, delay = 0, display } = {}) => {
                if (!element) {
                    return Promise.resolve();
                }
                if (display) {
                    element.style.display = display;
                }
                const startOpacity = from !== null ? from : Number.parseFloat(getComputedStyle(element).opacity) || 0;
                if (from !== null) {
                    element.style.opacity = from;
                }
                const animation = element.animate([{ opacity: startOpacity }, { opacity: to }], {
                    duration,
                    delay,
                    easing: "linear",
                    fill: "forwards",
                });
                return animation.finished
                    .catch(() => {})
                    .then(() => {
                        if (to === 0 && display === "none") {
                            element.style.display = "none";
                        }
                    });
            };
            const toPx = (value) => `${value}px`;
            const easings = {
                easeOutBack: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                easeInExpo: "cubic-bezier(0.95, 0.05, 0.795, 0.035)",
            };
            let dpicBaseClassName = null;
            let gameBtnTrayDisplay = null;

            this.domReady = function () {
                canvas = document.getElementById("e");
                canvas.width = resolution.uiScaledNumber(1024);
                canvas.height = 320;

                devCanvas = document.getElementById("moreCanvas");
                if (devCanvas) {
                    devCanvas.width = 51;
                    devCanvas.height = 51;
                }

                // event handlers
                const dShareBtn = document.getElementById("dshareBtn");
                if (dShareBtn) {
                    dShareBtn.addEventListener("click", function () {
                        SocialHelper.postToFeed(
                            Lang.menuText(MenuStringId.SHARE_DRAWING),
                            SocialHelper.siteDescription,
                            platform.getDrawingBaseUrl() + "drawing" + drawingNum + ".jpg",
                            function () {
                                closeDrawing();
                                return true;
                            }
                        );

                        return false; // cancel bubbling
                    });
                }

                const drawingElement = document.getElementById("d");
                if (drawingElement) {
                    drawingElement.addEventListener("click", function () {
                        closeDrawing();
                    });
                }

                const moreLink = document.getElementById("moreLink");
                if (moreLink) {
                    moreLink.addEventListener("mouseenter", function () {
                        if (!omNomShowing) {
                            omNomShowing = true;
                            showDevLinkOmNom(function () {
                                omNomShowing = false;
                            });
                        }
                    });
                    moreLink.addEventListener("click", function () {
                        analytics.atlasAction("SMG_MRTINX_CTR_SITE_BehindtheScenes");
                    });
                }
            };

            this.appReady = function () {
                // setup (choosing not to use PanelManager for now because of the fade in animation)
                PubSub.subscribe(PubSub.ChannelId.LanguageChanged, function () {
                    Text.drawBig({
                        text: Lang.menuText(MenuStringId.FOUND_DRAWING),
                        imgId: "dmsg",
                        scaleToUI: true,
                    });
                    Text.drawBig({
                        text: Lang.menuText(MenuStringId.SHARE),
                        imgSel: "#dshareBtn img",
                        scaleToUI: true,
                    });
                });

                PubSub.subscribe(PubSub.ChannelId.OmNomClicked, this.showOmNom);
                PubSub.subscribe(PubSub.ChannelId.DrawingClicked, this.showDrawing);
            };

            // ------------------------------------------------------------------------
            // Drawings
            // ------------------------------------------------------------------------
            // show a drawing
            let drawingNum = null;
            this.showDrawing = function (drawingIndex) {
                const d = getElementById("d");
                const dframe = getElementById("dframe");
                const dmsg = getElementById("dmsg");
                const dshareBtn = getElementById("dshareBtn");
                const dpic = getElementById("dpic");
                const gameBtnTray = getElementById("gameBtnTray");

                drawingNum = drawingIndex + 1;
                RootController.pauseLevel();

                if (gameBtnTray) {
                    if (gameBtnTrayDisplay === null) {
                        const resolvedDisplay = getComputedStyle(gameBtnTray).display;
                        gameBtnTrayDisplay = resolvedDisplay === "none" ? "" : resolvedDisplay;
                    }
                    gameBtnTray.style.display = "none";
                }

                if (dpic) {
                    if (dpicBaseClassName === null) {
                        dpicBaseClassName = dpic.className;
                    } else {
                        dpic.className = dpicBaseClassName;
                    }
                    dpic.classList.add(`drawing${drawingNum}`);
                }

                const frameTopStart = toPx(resolution.uiScaledNumber(100));
                const msgTopStart = toPx(resolution.uiScaledNumber(60));

                if (dframe) {
                    dframe.style.top = frameTopStart;
                    dframe.style.transform = "scale(0.35)";
                    dframe.style.opacity = "0";
                }
                if (dmsg) {
                    dmsg.style.top = msgTopStart;
                    dmsg.style.transform = "scale(0.5)";
                    dmsg.style.opacity = "0";
                }
                if (dshareBtn) {
                    dshareBtn.style.opacity = "0";
                    dshareBtn.style.pointerEvents = "none";
                }

                fadeElement(d, { from: 0, to: 1, duration: 100, display: "block" }).then(() => {
                    if (dframe) {
                        dframe.style.opacity = "1";
                        animateElement(
                            dframe,
                            [
                                { top: frameTopStart, transform: "scale(0.35)" },
                                { top: "0px", transform: "scale(1)" },
                            ],
                            { duration: 350, easing: easings.easeOutBack }
                        ).then(() => {
                            dframe.style.top = "0px";
                            dframe.style.transform = "scale(1)";
                        });
                    }
                    if (dmsg) {
                        dmsg.style.opacity = "1";
                        animateElement(
                            dmsg,
                            [
                                { top: msgTopStart, transform: "scale(0.5)" },
                                { top: "0px", transform: "scale(1)" },
                            ],
                            { duration: 350, easing: easings.easeOutBack }
                        ).then(() => {
                            dmsg.style.top = "0px";
                            dmsg.style.transform = "scale(1)";
                        });
                    }
                    if (dshareBtn) {
                        setTimeout(() => {
                            fadeElement(dshareBtn, { from: 0, to: 1, duration: 200 }).then(() => {
                                dshareBtn.style.opacity = "1";
                                dshareBtn.style.pointerEvents = "";
                            });
                        }, 600);
                    }
                });
            };

            var closeDrawing = function () {
                const d = getElementById("d");
                const dframe = getElementById("dframe");
                const dmsg = getElementById("dmsg");
                const dshareBtn = getElementById("dshareBtn");
                const dpic = getElementById("dpic");
                const gameBtnTray = getElementById("gameBtnTray");

                if (dpic) {
                    dpic.className = dpicBaseClassName || "";
                }

                const targetTop = toPx(resolution.uiScaledNumber(50));

                if (dshareBtn) {
                    dshareBtn.style.pointerEvents = "none";
                    fadeElement(dshareBtn, { from: 1, to: 0, duration: 200 }).then(() => {
                        dshareBtn.style.opacity = "0";
                    });
                }

                animateElement(
                    dframe,
                    [
                        { top: "0px", transform: "scale(1)" },
                        { top: targetTop, transform: "scale(0.2)" },
                    ],
                    { duration: 350, easing: easings.easeInExpo }
                ).then(() => {
                    if (dframe) {
                        dframe.style.top = targetTop;
                        dframe.style.transform = "scale(0.2)";
                    }
                });

                animateElement(
                    dmsg,
                    [
                        { top: "0px", transform: "scale(1)" },
                        { top: targetTop, transform: "scale(0.2)" },
                    ],
                    { duration: 350, easing: easings.easeInExpo }
                ).then(() => {
                    if (dmsg) {
                        dmsg.style.top = targetTop;
                        dmsg.style.transform = "scale(0.2)";
                    }
                });

                setTimeout(() => {
                    fadeElement(d, { from: 1, to: 0, duration: 200 }).then(() => {
                        if (d) {
                            d.style.display = "none";
                            d.style.opacity = "";
                        }
                        RootController.resumeLevel();
                        drawingNum = null;
                        if (gameBtnTray) {
                            gameBtnTray.style.display = gameBtnTrayDisplay || "";
                        }
                    });
                }, 200);
            };

            // ------------------------------------------------------------------------
            // Om Nom
            // ------------------------------------------------------------------------
            // mouse over for dev link
            var omNomShowing = false;

            var showDevLinkOmNom = function (onComplete) {
                const ctx = devCanvas.getContext("2d");
                const begin = Date.now();
                const sx = 0.1;
                let sy = 0.1;
                const tx = 0;
                let ty = 0;
                let l = 0;
                let r = 0;
                const dur = 800;

                const sxbegin = sx;
                const sybegin = sy;

                const txbegin = tx;
                const tybegin = ty;

                const s1 = 600;
                const s2 = 400 + s1;
                const s3 = 600 + s2;
                const s4 = 700 + s3;
                const s5 = 500 + s4;
                const s6 = 800 + s5;

                let mod = 0;
                const modflag = false;
                const modt = null;

                function step() {
                    const now = Date.now(),
                        t = now - begin;

                    // zoom up OmNom
                    if (t < s1) {
                        sy = 0 - Easing.easeOutBounce(t, 0, 100, s1, 1.5);
                    }

                    // move his eyes left
                    else if (t < s2) {
                        if (t > s1 + 100) {
                            // delay;
                            l = -1 * Easing.easeOutExpo(t - (s1 + 100), 0, 10, s2 - (s1 + 100));
                            r = l;
                        }
                    }

                    // move his eyes right
                    else if (t < s3) {
                        l = -10 + Easing.easeInOutExpo(t - s2, 0, 20, s3 - s2);
                        r = l;
                    }

                    // move his eyes back
                    else if (t < s4) {
                        if (t > s3 + 100) {
                            // delay;
                            l = 10 - Easing.easeInOutExpo(t - (s3 + 100), 0, 10, s4 - (s3 + 100));
                            r = l;
                        }
                    } else if (t < s5) {
                    }

                    // hide omnom
                    else if (t < s6) {
                        ty = Easing.easeOutExpo(t - s5, txbegin, 50, s6 - s5);
                    }

                    if (t > s1 && t < s3) {
                        mod = Easing.easeInOutBounce(t - s1, 0, 0.02, s3 - s1, 6.0);
                    }

                    if (t > s3 && t < s5) {
                        mod = 0.02 - Easing.easeInOutBounce(t - s3, 0, 0.02, s5 - s3, 2.0);
                    }

                    // position in the canvas
                    const mx = 0 + tx;
                    const my = 75 + ty + sy;

                    ctx.save();
                    ctx.rotate((30 * Math.PI) / 180);
                    drawOmNom(ctx, 0.32, 0.32 + mod, mx, my, l, r);
                    ctx.restore();

                    // get the next frame
                    if (t < s6) {
                        window.requestAnimationFrame(step);
                    } else {
                        onComplete();
                    }
                }

                window.requestAnimationFrame(step);
            };

            this.showOmNom = function () {
                if (!canvas) {
                    return;
                }
                const ctx = canvas.getContext("2d");

                RootController.pauseLevel();

                const startAnimation = () => {
                    const begin = Date.now();
                    let sx = 0.1;
                    let sy = 0.1;
                    const tx = 0;
                    let ty = 0;
                    let l = 0;
                    let r = 0;
                    const dur = 800;

                    const sxbegin = sx;
                    const sybegin = sy;

                    const txbegin = tx;
                    const tybegin = ty;

                    const s1 = 600;
                    const s2 = 400 + s1;
                    const s3 = 600 + s2;
                    const s4 = 700 + s3;
                    const s5 = 500 + s4;
                    const s6 = 800 + s5;

                    let mod = 0;
                    const modflag = false;
                    const modt = null;

                    function step() {
                        const now = Date.now(),
                            t = now - begin;

                        if (t < s1) {
                            sx = Easing.easeOutBounce(t, sxbegin, scaleTo, s1, 1.5);
                            sy = Easing.easeOutBounce(t, sybegin, scaleTo, s1, 1.5);
                        } else if (t < s2) {
                            if (t > s1 + 100) {
                                l =
                                    -1 *
                                    Easing.easeOutExpo(
                                        t - (s1 + 100),
                                        0,
                                        resolution.uiScaledNumber(10),
                                        s2 - (s1 + 100)
                                    );
                                r = l;
                            }
                        } else if (t < s3) {
                            l =
                                resolution.uiScaledNumber(-10) +
                                Easing.easeInOutExpo(t - s2, 0, resolution.uiScaledNumber(20), s3 - s2);
                            r = l;
                        } else if (t < s4) {
                            if (t > s3 + 100) {
                                l =
                                    resolution.uiScaledNumber(10) -
                                    Easing.easeInOutExpo(
                                        t - (s3 + 100),
                                        0,
                                        resolution.uiScaledNumber(10),
                                        s4 - (s3 + 100)
                                    );
                                r = l;
                            }
                        } else if (t < s5) {
                            // intentional
                        } else if (t < s6) {
                            ty = Easing.easeOutExpo(t - s5, tybegin, resolution.uiScaledNumber(300), s6 - s5);
                            const shrink = Easing.easeOutExpo(t - s5, 0, scaleTo - 0.1, s6 - s5);
                            sx = scaleTo - shrink;
                            sy = scaleTo - shrink;
                        }

                        if (t > s1 && t < s3) {
                            mod = Easing.easeInOutBounce(t - s1, 0, 0.1, s3 - s1, 6.0);
                        }

                        if (t > s3 && t < s5) {
                            mod = 0.1 - Easing.easeInOutBounce(t - s3, 0, 0.1, s5 - s3, 2.0);
                        }

                        if (t < s6) {
                            window.requestAnimationFrame(step);
                        } else {
                            fadeElement(canvas, { from: 1, to: 0, duration: 200 }).then(() => {
                                ctx.setTransform(1, 0, 0, 1, 0, 0);
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                canvas.style.display = "none";
                            });
                            RootController.resumeLevel();
                        }

                        const mx =
                            tx + (resolution.uiScaledNumber(500) - (sx / scaleTo) * resolution.uiScaledNumber(200));
                        const my =
                            ty + (resolution.uiScaledNumber(600) - (sy / scaleTo) * resolution.uiScaledNumber(400));

                        drawOmNom(ctx, sx, sy + mod, mx, my, l, r);
                    }

                    window.requestAnimationFrame(step);
                };

                fadeElement(canvas, { from: 0, to: 1, duration: 200, display: "block" }).then(startAnimation);
            };

            var drawOmNom = function (ctx, scaleX, scaleY, translateX, translateY, leftEyeOffset, rightEyeOffset) {
                // clear the canvas
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.restore();

                // set the scale and translate to keep OmNom in the right location on the canvas
                ctx.save();
                ctx.translate(translateX, translateY);
                ctx.scale(scaleX, scaleY);

                // omnom/dark
                ctx.save();
                ctx.beginPath();

                // omnom/dark/Path
                ctx.moveTo(116.1, 38.3);
                ctx.bezierCurveTo(117.2, 37.9, 118.2, 37.4, 119.0, 36.8);
                ctx.lineTo(119.5, 35.6);
                ctx.lineTo(123.3, 21.1);
                ctx.bezierCurveTo(124.5, 18.2, 126.8, 14.6, 130.1, 10.3);
                ctx.bezierCurveTo(129.9, 15.3, 133.6, 18.2, 141.3, 19.0);
                ctx.bezierCurveTo(138.9, 19.1, 136.7, 19.9, 134.8, 21.5);
                ctx.bezierCurveTo(132.4, 23.5, 130.7, 25.2, 129.7, 26.8);
                ctx.bezierCurveTo(128.9, 28.3, 127.9, 30.7, 126.7, 33.8);
                ctx.lineTo(126.4, 36.8);
                ctx.lineTo(126.7, 37.7);
                ctx.lineTo(128.6, 38.7);
                ctx.bezierCurveTo(124.4, 37.5, 120.2, 37.4, 116.1, 38.3);
                ctx.closePath();

                // omnom/dark/Path
                ctx.moveTo(241.8, 203.6);
                ctx.bezierCurveTo(241.6, 202.9, 241.1, 202.2, 240.5, 201.5);
                ctx.lineTo(214.2, 185.6);
                ctx.bezierCurveTo(212.8, 190.0, 210.9, 194.2, 208.4, 198.1);
                ctx.lineTo(208.3, 198.0);
                ctx.lineTo(209.4, 192.8);
                ctx.lineTo(211.0, 183.6);
                ctx.lineTo(211.2, 182.6);
                ctx.lineTo(212.8, 173.3);
                ctx.bezierCurveTo(212.3, 176.0, 211.3, 179.0, 210.0, 182.1);
                ctx.bezierCurveTo(209.9, 182.4, 209.8, 182.6, 209.7, 182.8);
                ctx.bezierCurveTo(208.6, 185.2, 207.3, 187.8, 205.8, 190.5);
                ctx.bezierCurveTo(203.4, 194.6, 200.9, 197.9, 198.1, 200.4);
                ctx.bezierCurveTo(198.7, 201.8, 199.0, 203.2, 199.2, 204.7);
                ctx.bezierCurveTo(199.2, 204.8, 199.2, 204.9, 199.2, 205.0);
                ctx.bezierCurveTo(199.5, 207.9, 199.6, 209.6, 199.7, 210.2);
                ctx.bezierCurveTo(200.0, 211.2, 200.1, 212.0, 200.2, 212.5);
                ctx.lineTo(199.6, 207.8);
                ctx.bezierCurveTo(201.8, 213.8, 203.3, 218.7, 204.0, 222.5);
                ctx.bezierCurveTo(205.3, 222.4, 206.5, 222.4, 207.7, 222.3);
                ctx.bezierCurveTo(213.4, 222.0, 218.9, 221.9, 224.3, 222.1);
                ctx.bezierCurveTo(227.5, 222.5, 230.1, 222.1, 232.3, 221.1);
                ctx.bezierCurveTo(232.8, 220.7, 233.4, 220.2, 233.9, 219.6);
                ctx.bezierCurveTo(235.2, 218.1, 236.5, 216.5, 237.8, 215.0);
                ctx.bezierCurveTo(239.1, 213.3, 240.1, 211.5, 240.9, 209.6);
                ctx.bezierCurveTo(241.8, 207.4, 242.1, 205.4, 241.8, 203.6);
                ctx.closePath();

                // omnom/dark/Path
                ctx.moveTo(148.8, 222.8);
                ctx.bezierCurveTo(139.8, 224.7, 129.5, 225.7, 117.8, 225.9);
                ctx.bezierCurveTo(109.6, 226.0, 101.7, 225.5, 94.3, 224.3);
                ctx.bezierCurveTo(94.3, 224.9, 94.4, 225.6, 94.4, 226.2);
                ctx.bezierCurveTo(94.4, 228.1, 94.3, 230.0, 94.0, 232.0);
                ctx.lineTo(93.8, 233.0);
                ctx.bezierCurveTo(103.6, 234.6, 113.4, 235.1, 123.2, 234.4);
                ctx.bezierCurveTo(132.2, 234.4, 141.0, 233.2, 149.5, 231.0);
                ctx.bezierCurveTo(149.4, 230.6, 149.4, 230.3, 149.4, 230.0);
                ctx.bezierCurveTo(149.0, 227.6, 148.9, 225.2, 148.8, 222.8);
                ctx.closePath();

                // omnom/dark/Path
                ctx.moveTo(196.6, 153.6);
                ctx.lineTo(194.5, 152.6);
                ctx.bezierCurveTo(194.1, 152.8, 193.8, 153.0, 193.4, 153.2);
                ctx.bezierCurveTo(192.6, 153.8, 191.7, 154.5, 191.0, 155.2);
                ctx.lineTo(190.2, 155.8);
                ctx.bezierCurveTo(186.6, 158.8, 183.8, 160.7, 182.0, 161.5);
                ctx.bezierCurveTo(182.0, 162.2, 181.4, 164.0, 180.2, 166.7);
                ctx.bezierCurveTo(183.2, 164.8, 186.2, 162.7, 189.3, 160.6);
                ctx.bezierCurveTo(192.6, 158.2, 195.6, 155.9, 198.4, 153.8);
                ctx.bezierCurveTo(197.6, 153.8, 197.0, 153.7, 196.6, 153.6);
                ctx.closePath();

                // omnom/dark/Path
                ctx.moveTo(121.1, 189.0);
                ctx.bezierCurveTo(128.0, 188.9, 134.8, 188.0, 141.7, 186.0);
                ctx.bezierCurveTo(141.3, 185.9, 141.0, 185.7, 140.7, 185.6);
                ctx.bezierCurveTo(136.2, 183.2, 133.0, 181.8, 131.3, 181.4);
                ctx.bezierCurveTo(128.8, 181.8, 125.7, 181.8, 121.9, 181.4);
                ctx.bezierCurveTo(118.1, 181.0, 114.0, 180.5, 109.4, 179.7);
                ctx.lineTo(109.3, 179.7);
                ctx.bezierCurveTo(108.3, 180.9, 106.5, 182.5, 103.8, 184.6);
                ctx.bezierCurveTo(103.6, 184.7, 103.4, 184.9, 103.2, 185.0);
                ctx.lineTo(102.1, 185.9);
                ctx.lineTo(102.9, 186.1);
                ctx.bezierCurveTo(110.1, 188.1, 116.2, 189.0, 121.1, 189.0);
                ctx.closePath();

                // omnom/dark/Path
                ctx.moveTo(63.1, 164.7);
                ctx.lineTo(50.7, 157.9);
                ctx.lineTo(45.8, 159.6);
                ctx.lineTo(46.2, 159.9);
                ctx.bezierCurveTo(46.3, 160.0, 46.4, 160.1, 46.5, 160.2);
                ctx.bezierCurveTo(52.0, 164.0, 57.9, 167.5, 64.4, 170.9);
                ctx.lineTo(65.5, 171.5);
                ctx.lineTo(65.2, 170.7);
                ctx.bezierCurveTo(64.0, 168.0, 63.4, 166.0, 63.1, 164.7);
                ctx.closePath();

                // omnom/dark/Path
                ctx.moveTo(36.5, 191.7);
                ctx.bezierCurveTo(35.2, 189.5, 34.0, 187.3, 33.0, 185.0);
                ctx.lineTo(33.1, 185.9);
                ctx.lineTo(34.0, 192.4);
                ctx.lineTo(31.3, 189.4);
                ctx.bezierCurveTo(30.8, 188.0, 27.8, 189.3, 22.4, 193.3);
                ctx.bezierCurveTo(16.9, 197.2, 13.7, 199.6, 12.7, 200.6);
                ctx.bezierCurveTo(11.6, 201.6, 10.2, 202.9, 8.4, 204.6);
                ctx.bezierCurveTo(6.7, 206.1, 5.4, 207.3, 4.5, 208.2);
                ctx.bezierCurveTo(3.6, 209.0, 3.2, 210.1, 3.3, 211.5);
                ctx.bezierCurveTo(3.5, 212.9, 4.0, 214.8, 4.8, 217.3);
                ctx.bezierCurveTo(5.6, 219.7, 6.5, 221.8, 7.4, 223.5);
                ctx.bezierCurveTo(8.3, 225.2, 9.8, 226.4, 11.9, 227.1);
                ctx.bezierCurveTo(13.9, 227.7, 15.9, 227.9, 17.8, 227.7);
                ctx.bezierCurveTo(19.7, 227.5, 21.3, 227.4, 22.6, 227.4);
                ctx.bezierCurveTo(24.5, 227.3, 26.4, 227.2, 28.4, 227.2);
                ctx.bezierCurveTo(30.2, 227.2, 32.0, 227.2, 33.8, 227.2);
                ctx.bezierCurveTo(35.8, 227.2, 37.7, 227.2, 39.7, 227.2);
                ctx.bezierCurveTo(41.2, 227.3, 42.9, 227.4, 44.5, 227.6);
                ctx.bezierCurveTo(44.5, 225.9, 44.5, 223.5, 44.6, 220.3);
                ctx.lineTo(44.6, 213.4);
                ctx.lineTo(44.7, 207.6);
                ctx.lineTo(45.1, 204.8);
                ctx.lineTo(45.4, 203.0);
                ctx.bezierCurveTo(45.4, 202.9, 45.4, 202.8, 45.5, 202.6);
                ctx.bezierCurveTo(43.8, 201.2, 42.3, 199.7, 40.9, 198.1);
                ctx.bezierCurveTo(39.3, 196.0, 37.9, 193.8, 36.5, 191.7);
                ctx.closePath();
                ctx.fillStyle = "rgb(100, 150, 40)";
                ctx.fill();

                // omnom/light
                ctx.beginPath();

                // omnom/light/Path
                ctx.moveTo(212.6, 151.5);
                ctx.bezierCurveTo(213.3, 158.8, 213.4, 166.1, 212.8, 173.3);
                ctx.bezierCurveTo(212.3, 176.0, 211.3, 179.0, 210.0, 182.2);
                ctx.bezierCurveTo(209.9, 182.4, 209.8, 182.6, 209.7, 182.8);
                ctx.bezierCurveTo(208.6, 185.3, 207.3, 187.8, 205.8, 190.5);
                ctx.bezierCurveTo(203.4, 194.7, 200.9, 198.0, 198.1, 200.5);
                ctx.bezierCurveTo(198.7, 201.8, 199.0, 203.3, 199.2, 204.7);
                ctx.bezierCurveTo(199.2, 204.8, 199.2, 204.9, 199.2, 205.1);
                ctx.bezierCurveTo(199.5, 207.9, 199.6, 209.7, 199.7, 210.2);
                ctx.bezierCurveTo(199.9, 214.2, 200.0, 218.2, 199.9, 222.4);
                ctx.bezierCurveTo(199.9, 222.5, 199.9, 222.7, 199.9, 222.9);
                ctx.bezierCurveTo(199.9, 225.0, 199.7, 227.0, 199.4, 228.8);
                ctx.bezierCurveTo(199.1, 230.5, 198.7, 232.0, 198.3, 233.5);
                ctx.lineTo(196.7, 235.2);
                ctx.bezierCurveTo(196.6, 235.3, 196.5, 235.4, 196.3, 235.5);
                ctx.bezierCurveTo(195.2, 236.4, 193.3, 237.6, 190.7, 239.2);
                ctx.bezierCurveTo(188.1, 240.8, 184.5, 241.7, 179.9, 242.1);
                ctx.bezierCurveTo(175.3, 242.4, 172.0, 242.5, 169.8, 242.3);
                ctx.bezierCurveTo(167.8, 242.2, 165.5, 241.7, 162.9, 240.8);
                ctx.bezierCurveTo(160.4, 240.0, 158.0, 238.0, 155.6, 234.8);
                ctx.bezierCurveTo(155.4, 234.6, 155.3, 234.4, 155.1, 234.2);
                ctx.bezierCurveTo(154.3, 233.0, 153.5, 231.6, 152.8, 230.1);
                ctx.bezierCurveTo(151.9, 227.9, 151.2, 225.3, 150.7, 222.4);
                ctx.bezierCurveTo(150.7, 222.2, 150.6, 222.1, 150.6, 221.9);
                ctx.bezierCurveTo(149.7, 216.4, 149.3, 213.1, 149.2, 212.0);
                ctx.bezierCurveTo(148.8, 215.6, 148.6, 219.2, 148.8, 222.8);
                ctx.bezierCurveTo(139.8, 224.7, 129.5, 225.7, 117.8, 225.9);
                ctx.bezierCurveTo(109.6, 226.0, 101.7, 225.5, 94.3, 224.3);
                ctx.bezierCurveTo(94.2, 220.8, 94.0, 217.1, 93.8, 213.5);
                ctx.bezierCurveTo(93.8, 214.9, 93.7, 216.0, 93.6, 216.6);
                ctx.bezierCurveTo(93.5, 217.2, 93.5, 217.7, 93.4, 218.1);
                ctx.bezierCurveTo(93.4, 218.5, 93.2, 219.4, 92.8, 220.9);
                ctx.bezierCurveTo(92.6, 222.0, 92.3, 223.0, 92.0, 224.0);
                ctx.bezierCurveTo(91.9, 224.3, 91.8, 224.6, 91.7, 224.8);
                ctx.bezierCurveTo(91.3, 226.0, 90.8, 227.2, 90.2, 228.3);
                ctx.bezierCurveTo(89.9, 229.0, 89.5, 229.7, 89.2, 230.4);
                ctx.bezierCurveTo(88.8, 230.9, 88.4, 231.4, 88.0, 231.9);
                ctx.bezierCurveTo(87.5, 232.6, 86.9, 233.2, 86.2, 233.7);
                ctx.bezierCurveTo(85.8, 234.1, 85.4, 234.5, 84.9, 234.9);
                ctx.bezierCurveTo(83.9, 235.6, 82.8, 236.2, 81.6, 236.7);
                ctx.bezierCurveTo(80.2, 237.3, 78.7, 237.8, 77.1, 238.2);
                ctx.bezierCurveTo(74.1, 238.8, 71.0, 239.1, 67.8, 239.1);
                ctx.bezierCurveTo(60.2, 239.2, 53.4, 237.3, 47.4, 233.3);
                ctx.bezierCurveTo(45.9, 232.5, 45.0, 231.7, 44.9, 230.9);
                ctx.lineTo(44.6, 229.2);
                ctx.bezierCurveTo(44.6, 228.8, 44.5, 228.3, 44.5, 227.6);
                ctx.bezierCurveTo(44.5, 226.0, 44.5, 223.5, 44.6, 220.3);
                ctx.lineTo(44.6, 213.4);
                ctx.lineTo(44.7, 207.6);
                ctx.lineTo(45.1, 204.9);
                ctx.lineTo(45.4, 203.0);
                ctx.bezierCurveTo(45.4, 202.9, 45.4, 202.8, 45.5, 202.7);
                ctx.bezierCurveTo(43.8, 201.2, 42.3, 199.7, 40.9, 198.2);
                ctx.bezierCurveTo(39.3, 196.0, 37.9, 193.9, 36.5, 191.7);
                ctx.bezierCurveTo(35.2, 189.6, 34.0, 187.4, 33.0, 185.1);
                ctx.lineTo(32.7, 183.5);
                ctx.bezierCurveTo(31.8, 176.3, 31.0, 168.9, 30.3, 161.3);
                ctx.bezierCurveTo(30.3, 161.0, 30.3, 160.7, 30.2, 160.4);
                ctx.bezierCurveTo(34.5, 162.0, 39.0, 162.1, 43.8, 160.4);
                ctx.bezierCurveTo(44.4, 160.2, 45.1, 159.9, 45.8, 159.6);
                ctx.lineTo(46.2, 159.9);
                ctx.bezierCurveTo(46.3, 160.0, 46.4, 160.1, 46.5, 160.2);
                ctx.bezierCurveTo(52.0, 164.0, 57.9, 167.6, 64.4, 170.9);
                ctx.lineTo(65.5, 171.5);
                ctx.bezierCurveTo(66.9, 174.7, 68.3, 177.8, 69.8, 180.9);
                ctx.bezierCurveTo(71.4, 184.1, 73.4, 187.0, 76.0, 189.7);
                ctx.bezierCurveTo(78.5, 192.3, 81.7, 193.4, 85.5, 193.1);
                ctx.bezierCurveTo(89.2, 192.6, 92.8, 191.5, 96.3, 189.7);
                ctx.bezierCurveTo(98.5, 188.7, 100.4, 187.4, 102.1, 185.9);
                ctx.lineTo(102.9, 186.2);
                ctx.bezierCurveTo(110.1, 188.1, 116.2, 189.1, 121.1, 189.1);
                ctx.bezierCurveTo(128.0, 189.0, 134.8, 188.0, 141.7, 186.1);
                ctx.bezierCurveTo(142.1, 186.3, 142.6, 186.5, 143.0, 186.7);
                ctx.bezierCurveTo(143.5, 186.9, 144.0, 187.1, 144.5, 187.3);
                ctx.bezierCurveTo(147.1, 188.4, 149.8, 189.4, 152.5, 190.3);
                ctx.bezierCurveTo(155.3, 191.3, 158.2, 191.8, 161.2, 191.8);
                ctx.bezierCurveTo(164.2, 191.8, 166.7, 190.7, 168.6, 188.6);
                ctx.bezierCurveTo(170.0, 187.2, 171.1, 185.7, 172.0, 184.1);
                ctx.bezierCurveTo(173.4, 181.7, 174.7, 179.2, 175.9, 176.6);
                ctx.bezierCurveTo(177.1, 174.0, 178.3, 171.4, 179.4, 168.8);
                ctx.bezierCurveTo(179.7, 168.0, 180.0, 167.4, 180.2, 166.8);
                ctx.bezierCurveTo(183.2, 164.8, 186.2, 162.8, 189.3, 160.6);
                ctx.bezierCurveTo(192.6, 158.2, 195.6, 156.0, 198.4, 153.8);
                ctx.bezierCurveTo(199.3, 153.8, 200.6, 153.8, 202.1, 153.6);
                ctx.bezierCurveTo(204.6, 153.5, 207.0, 153.1, 209.4, 152.5);
                ctx.bezierCurveTo(210.5, 152.2, 211.6, 151.8, 212.6, 151.4);
                ctx.bezierCurveTo(212.6, 151.4, 212.6, 151.4, 212.6, 151.5);
                ctx.closePath();

                // omnom/light/Path
                ctx.moveTo(124.3, 61.0);
                ctx.bezierCurveTo(124.5, 61.3, 124.8, 61.6, 125.0, 61.9);
                ctx.bezierCurveTo(133.4, 55.3, 142.8, 50.4, 153.1, 47.4);
                ctx.bezierCurveTo(149.8, 46.0, 146.3, 44.6, 142.9, 43.3);
                ctx.bezierCurveTo(139.9, 42.5, 137.6, 41.7, 135.8, 41.1);
                ctx.bezierCurveTo(134.1, 40.4, 132.7, 40.0, 131.6, 39.8);
                ctx.bezierCurveTo(130.5, 39.6, 129.5, 39.2, 128.6, 38.8);
                ctx.bezierCurveTo(124.4, 37.6, 120.2, 37.4, 116.1, 38.4);
                ctx.bezierCurveTo(115.7, 38.5, 115.2, 38.6, 114.8, 38.7);
                ctx.bezierCurveTo(114.6, 38.8, 114.2, 38.9, 113.7, 39.0);
                ctx.lineTo(106.0, 40.5);
                ctx.bezierCurveTo(102.5, 41.1, 99.2, 41.9, 95.9, 42.8);
                ctx.bezierCurveTo(106.9, 45.7, 116.3, 51.7, 124.3, 61.0);
                ctx.closePath();

                // omnom/light/Path
                ctx.moveTo(141.3, 19.0);
                ctx.lineTo(143.4, 19.0);
                ctx.lineTo(144.6, 19.1);
                ctx.bezierCurveTo(147.1, 19.4, 148.8, 19.2, 149.7, 18.6);
                ctx.bezierCurveTo(151.7, 17.6, 152.9, 16.0, 153.3, 13.7);
                ctx.bezierCurveTo(153.7, 12.1, 153.7, 10.4, 153.5, 8.6);
                ctx.bezierCurveTo(152.9, 5.3, 150.9, 3.4, 147.6, 3.1);
                ctx.bezierCurveTo(141.0, 2.4, 135.2, 4.8, 130.1, 10.3);
                ctx.bezierCurveTo(129.9, 15.3, 133.6, 18.2, 141.3, 19.0);
                ctx.closePath();

                // omnom/light/Path
                ctx.moveTo(221.0, 104.0);
                ctx.bezierCurveTo(220.8, 103.3, 220.5, 102.6, 220.2, 101.9);
                ctx.bezierCurveTo(219.3, 99.7, 218.2, 97.5, 216.9, 95.4);
                ctx.bezierCurveTo(213.3, 89.7, 209.2, 84.5, 204.4, 79.7);
                ctx.bezierCurveTo(205.4, 83.0, 205.9, 86.5, 205.9, 90.2);
                ctx.bezierCurveTo(205.8, 91.2, 205.8, 92.2, 205.7, 93.2);
                ctx.bezierCurveTo(205.5, 95.7, 205.1, 98.2, 204.6, 100.6);
                ctx.bezierCurveTo(204.9, 102.3, 205.3, 104.3, 205.7, 106.6);
                ctx.lineTo(205.7, 106.6);
                ctx.bezierCurveTo(205.2, 104.4, 204.9, 102.5, 204.6, 101.0);
                ctx.bezierCurveTo(204.2, 103.0, 203.6, 104.9, 203.0, 106.9);
                ctx.lineTo(202.9, 106.9);
                ctx.bezierCurveTo(200.6, 113.5, 197.1, 119.7, 192.3, 125.5);
                ctx.bezierCurveTo(188.4, 130.0, 183.6, 133.5, 177.8, 135.9);
                ctx.bezierCurveTo(169.7, 139.6, 161.7, 140.9, 153.7, 139.7);
                ctx.bezierCurveTo(147.7, 138.6, 142.2, 136.2, 137.2, 132.7);
                ctx.bezierCurveTo(131.7, 128.8, 126.4, 125.0, 121.3, 121.5);
                ctx.lineTo(120.9, 121.3);
                ctx.lineTo(120.6, 121.5);
                ctx.bezierCurveTo(113.9, 128.0, 106.4, 133.2, 98.0, 137.3);
                ctx.bezierCurveTo(83.7, 144.0, 70.0, 142.9, 56.8, 134.0);
                ctx.bezierCurveTo(50.6, 130.0, 45.8, 125.2, 42.5, 119.7);
                ctx.bezierCurveTo(38.6, 113.5, 36.7, 106.4, 36.6, 98.3);
                ctx.bezierCurveTo(36.6, 93.4, 37.1, 88.7, 38.2, 84.1);
                ctx.bezierCurveTo(37.7, 84.8, 37.1, 85.5, 36.6, 86.2);
                ctx.bezierCurveTo(29.8, 95.7, 24.4, 105.8, 20.3, 116.5);
                ctx.bezierCurveTo(20.4, 116.4, 20.4, 117.0, 20.3, 118.2);
                ctx.bezierCurveTo(20.2, 119.7, 20.7, 121.1, 21.6, 122.5);
                ctx.bezierCurveTo(22.2, 123.4, 23.3, 125.0, 25.0, 127.3);
                ctx.lineTo(26.2, 129.3);
                ctx.bezierCurveTo(26.3, 129.4, 26.4, 129.6, 26.5, 129.7);
                ctx.bezierCurveTo(27.9, 131.7, 29.4, 133.7, 31.1, 135.6);
                ctx.bezierCurveTo(34.0, 138.9, 37.4, 142.0, 41.1, 144.9);
                ctx.bezierCurveTo(44.1, 147.2, 47.2, 149.4, 50.5, 151.6);
                ctx.bezierCurveTo(52.5, 152.9, 54.7, 154.4, 57.0, 155.8);
                ctx.bezierCurveTo(60.8, 158.3, 65.2, 160.8, 70.1, 163.1);
                ctx.bezierCurveTo(71.0, 163.6, 72.0, 164.0, 72.9, 164.4);
                ctx.bezierCurveTo(79.8, 167.5, 86.9, 170.1, 94.1, 172.2);
                ctx.bezierCurveTo(101.5, 174.4, 109.0, 175.9, 116.7, 176.5);
                ctx.bezierCurveTo(122.5, 177.2, 128.4, 177.1, 134.5, 176.3);
                ctx.bezierCurveTo(141.6, 175.3, 147.4, 174.0, 152.0, 172.4);
                ctx.bezierCurveTo(156.6, 170.7, 159.7, 169.4, 161.4, 168.4);
                ctx.lineTo(181.4, 156.2);
                ctx.bezierCurveTo(187.7, 152.0, 192.6, 148.2, 195.9, 144.6);
                ctx.lineTo(202.9, 136.6);
                ctx.lineTo(209.8, 126.7);
                ctx.lineTo(211.7, 124.0);
                ctx.lineTo(214.9, 119.9);
                ctx.lineTo(216.7, 117.5);
                ctx.bezierCurveTo(217.8, 116.3, 218.7, 115.1, 219.4, 114.0);
                ctx.bezierCurveTo(219.8, 113.5, 220.1, 113.0, 220.3, 112.5);
                ctx.bezierCurveTo(220.8, 111.5, 221.1, 110.5, 221.3, 109.4);
                ctx.bezierCurveTo(221.5, 108.5, 221.6, 107.6, 221.6, 106.7);
                ctx.bezierCurveTo(221.6, 105.8, 221.4, 104.9, 221.0, 104.0);
                ctx.closePath();
                ctx.fillStyle = "rgb(153, 205, 0)";
                ctx.fill();

                // omnom/outline
                ctx.beginPath();

                // omnom/outline/Path
                ctx.moveTo(245.5, 203.6);
                ctx.bezierCurveTo(245.4, 202.9, 245.3, 202.4, 245.2, 202.0);
                ctx.bezierCurveTo(244.7, 200.9, 244.1, 200.1, 243.5, 199.7);
                ctx.bezierCurveTo(242.9, 199.2, 241.2, 198.1, 238.5, 196.2);
                ctx.bezierCurveTo(238.0, 195.9, 237.5, 195.5, 237.0, 195.2);
                ctx.bezierCurveTo(234.3, 193.5, 230.8, 191.6, 226.3, 189.3);
                ctx.bezierCurveTo(223.0, 187.4, 219.4, 185.7, 215.7, 184.2);
                ctx.lineTo(214.7, 183.8);
                ctx.bezierCurveTo(216.0, 179.3, 216.8, 174.4, 217.0, 169.3);
                ctx.bezierCurveTo(217.3, 162.5, 217.5, 155.7, 217.3, 148.8);
                ctx.bezierCurveTo(217.5, 148.7, 217.7, 148.6, 217.9, 148.5);
                ctx.bezierCurveTo(220.1, 147.0, 221.6, 145.1, 222.5, 142.8);
                ctx.bezierCurveTo(223.5, 140.2, 224.2, 137.4, 224.6, 134.6);
                ctx.bezierCurveTo(224.9, 132.2, 225.0, 129.8, 225.1, 127.3);
                ctx.bezierCurveTo(225.1, 124.8, 225.1, 122.4, 224.8, 119.9);
                ctx.bezierCurveTo(224.8, 119.4, 224.7, 119.0, 224.6, 118.6);
                ctx.lineTo(224.5, 115.9);
                ctx.bezierCurveTo(225.1, 114.1, 225.4, 111.8, 225.6, 108.9);
                ctx.bezierCurveTo(225.7, 107.4, 225.5, 105.8, 224.9, 104.3);
                ctx.bezierCurveTo(220.3, 91.4, 212.2, 80.3, 200.6, 71.0);
                ctx.bezierCurveTo(195.8, 62.6, 189.0, 55.8, 180.1, 50.6);
                ctx.bezierCurveTo(172.6, 46.4, 165.2, 45.0, 157.9, 46.2);
                ctx.bezierCurveTo(155.1, 45.0, 152.3, 43.9, 149.4, 42.8);
                ctx.bezierCurveTo(148.1, 42.3, 146.8, 41.9, 145.5, 41.4);
                ctx.bezierCurveTo(143.2, 40.6, 140.8, 39.9, 138.4, 39.2);
                ctx.bezierCurveTo(136.1, 38.4, 133.8, 37.6, 131.6, 36.7);
                ctx.bezierCurveTo(131.1, 36.6, 130.8, 36.3, 130.4, 36.0);
                ctx.bezierCurveTo(130.1, 35.6, 129.9, 35.3, 129.8, 35.0);
                ctx.bezierCurveTo(129.8, 34.3, 129.9, 33.8, 130.1, 33.5);
                ctx.bezierCurveTo(130.9, 31.6, 132.7, 30.0, 135.7, 29.0);
                ctx.bezierCurveTo(137.8, 27.6, 140.6, 26.5, 144.0, 25.5);
                ctx.bezierCurveTo(152.1, 23.0, 156.6, 19.2, 157.4, 13.9);
                ctx.bezierCurveTo(158.5, 7.2, 155.6, 2.8, 148.7, 0.7);
                ctx.bezierCurveTo(141.1, -1.7, 133.2, 2.0, 125.0, 11.9);
                ctx.bezierCurveTo(121.9, 15.6, 120.1, 19.0, 119.4, 22.1);
                ctx.lineTo(118.6, 25.4);
                ctx.bezierCurveTo(118.2, 30.0, 117.2, 33.0, 115.7, 34.5);
                ctx.bezierCurveTo(114.8, 35.3, 113.3, 36.0, 111.2, 36.6);
                ctx.bezierCurveTo(104.1, 37.5, 97.2, 39.2, 90.6, 41.6);
                ctx.bezierCurveTo(89.4, 41.4, 88.3, 41.3, 87.1, 41.1);
                ctx.bezierCurveTo(71.9, 41.6, 59.7, 47.8, 50.4, 59.6);
                ctx.bezierCurveTo(46.0, 64.9, 42.7, 70.6, 40.4, 76.7);
                ctx.bezierCurveTo(39.8, 77.4, 39.2, 78.1, 38.5, 78.8);
                ctx.bezierCurveTo(29.4, 89.5, 22.3, 101.0, 17.2, 113.3);
                ctx.bezierCurveTo(16.8, 114.3, 16.4, 115.3, 16.1, 116.3);
                ctx.bezierCurveTo(15.8, 117.0, 15.6, 117.6, 15.5, 118.3);
                ctx.bezierCurveTo(15.4, 118.7, 15.3, 119.1, 15.3, 119.5);
                ctx.bezierCurveTo(15.2, 120.4, 15.1, 121.2, 15.2, 122.1);
                ctx.bezierCurveTo(15.5, 124.5, 16.4, 127.1, 18.0, 129.6);
                ctx.bezierCurveTo(18.5, 132.0, 18.6, 134.2, 18.3, 136.0);
                ctx.bezierCurveTo(17.4, 144.5, 19.9, 151.6, 25.9, 157.5);
                ctx.bezierCurveTo(25.9, 159.4, 26.0, 161.4, 26.1, 163.4);
                ctx.bezierCurveTo(26.4, 169.1, 27.2, 175.1, 28.4, 181.4);
                ctx.bezierCurveTo(28.7, 182.6, 28.9, 183.7, 29.2, 184.9);
                ctx.bezierCurveTo(29.1, 184.9, 29.0, 185.0, 28.9, 185.0);
                ctx.bezierCurveTo(25.6, 186.9, 22.7, 188.6, 20.2, 190.1);
                ctx.bezierCurveTo(17.8, 191.7, 15.6, 193.1, 13.8, 194.4);
                ctx.bezierCurveTo(12.5, 195.5, 11.1, 196.7, 9.6, 197.9);
                ctx.bezierCurveTo(7.9, 199.0, 6.3, 200.4, 4.9, 201.9);
                ctx.bezierCurveTo(3.7, 203.0, 2.7, 204.1, 1.7, 205.0);
                ctx.bezierCurveTo(0.7, 206.0, 0.2, 207.4, 0.0, 209.2);
                ctx.bezierCurveTo(-0.1, 211.0, 0.0, 212.5, 0.2, 213.8);
                ctx.bezierCurveTo(0.4, 215.0, 0.9, 217.0, 1.5, 219.7);
                ctx.bezierCurveTo(2.1, 222.4, 3.0, 224.6, 4.0, 226.5);
                ctx.bezierCurveTo(5.1, 228.3, 6.7, 229.7, 9.0, 230.6);
                ctx.bezierCurveTo(9.6, 230.8, 10.3, 231.0, 11.1, 231.2);
                ctx.bezierCurveTo(14.9, 231.1, 18.6, 231.1, 22.4, 231.2);
                ctx.bezierCurveTo(24.2, 231.3, 26.0, 231.5, 27.8, 231.7);
                ctx.bezierCurveTo(29.4, 231.8, 31.0, 232.0, 32.7, 232.2);
                ctx.bezierCurveTo(34.1, 232.3, 35.6, 232.5, 37.1, 232.6);
                ctx.bezierCurveTo(38.4, 232.7, 39.8, 232.8, 41.2, 232.9);
                ctx.bezierCurveTo(41.5, 232.9, 41.8, 233.0, 42.1, 233.0);
                ctx.lineTo(42.2, 233.2);
                ctx.bezierCurveTo(42.4, 233.8, 42.8, 234.4, 43.1, 234.8);
                ctx.bezierCurveTo(48.8, 238.6, 55.0, 240.9, 61.6, 241.5);
                ctx.bezierCurveTo(68.7, 242.6, 75.6, 242.3, 82.4, 240.5);
                ctx.bezierCurveTo(82.5, 240.5, 82.5, 240.5, 82.6, 240.5);
                ctx.bezierCurveTo(84.0, 240.2, 85.4, 239.9, 86.7, 239.6);
                ctx.bezierCurveTo(88.1, 239.3, 89.3, 238.9, 90.4, 238.4);
                ctx.bezierCurveTo(90.9, 238.1, 91.4, 237.8, 91.8, 237.3);
                ctx.bezierCurveTo(104.5, 241.2, 118.7, 242.0, 134.5, 239.7);
                ctx.bezierCurveTo(139.8, 238.9, 145.2, 237.5, 150.9, 235.6);
                ctx.bezierCurveTo(151.5, 237.0, 152.2, 238.2, 153.1, 239.5);
                ctx.bezierCurveTo(153.8, 240.1, 154.6, 240.7, 155.6, 241.3);
                ctx.bezierCurveTo(156.9, 242.2, 158.4, 242.9, 160.2, 243.5);
                ctx.bezierCurveTo(161.9, 243.8, 163.7, 244.1, 165.5, 244.5);
                ctx.bezierCurveTo(171.9, 244.8, 178.0, 244.7, 183.5, 244.1);
                ctx.bezierCurveTo(188.0, 243.7, 192.3, 242.6, 196.2, 240.7);
                ctx.bezierCurveTo(197.0, 240.3, 197.6, 239.9, 198.3, 239.5);
                ctx.bezierCurveTo(200.0, 238.4, 201.4, 237.4, 202.3, 236.5);
                ctx.bezierCurveTo(203.2, 235.6, 203.9, 233.1, 204.5, 229.2);
                ctx.bezierCurveTo(204.5, 229.0, 204.6, 228.7, 204.6, 228.3);
                ctx.lineTo(223.4, 226.8);
                ctx.bezierCurveTo(225.5, 226.6, 227.6, 226.4, 229.8, 226.3);
                ctx.bezierCurveTo(232.0, 226.2, 233.8, 225.5, 235.2, 224.1);
                ctx.bezierCurveTo(237.0, 222.5, 238.5, 220.8, 239.4, 219.1);
                ctx.bezierCurveTo(240.4, 217.5, 241.3, 215.9, 242.2, 214.4);
                ctx.bezierCurveTo(243.0, 212.9, 243.6, 211.6, 244.1, 210.5);
                ctx.bezierCurveTo(244.6, 209.4, 244.9, 208.1, 245.2, 206.7);
                ctx.bezierCurveTo(245.4, 205.2, 245.5, 204.2, 245.5, 203.6);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(219.9, 140.2);
                ctx.bezierCurveTo(219.5, 141.6, 218.8, 143.0, 218.0, 144.5);
                ctx.bezierCurveTo(217.8, 144.9, 217.6, 145.2, 217.3, 145.6);
                ctx.bezierCurveTo(216.7, 146.3, 215.9, 146.9, 214.9, 147.4);
                ctx.bezierCurveTo(214.1, 147.8, 213.2, 148.2, 212.3, 148.4);
                ctx.bezierCurveTo(210.2, 149.1, 208.0, 149.5, 205.6, 149.5);
                ctx.bezierCurveTo(204.5, 149.5, 203.4, 149.4, 202.3, 149.3);
                ctx.bezierCurveTo(200.6, 148.9, 199.7, 148.0, 199.8, 146.7);
                ctx.lineTo(200.7, 145.2);
                ctx.bezierCurveTo(201.3, 144.3, 201.8, 143.4, 202.4, 142.5);
                ctx.bezierCurveTo(202.7, 141.9, 203.0, 141.3, 203.4, 140.8);
                ctx.bezierCurveTo(203.8, 140.0, 204.2, 139.2, 204.7, 138.5);
                ctx.bezierCurveTo(205.3, 137.7, 205.9, 136.8, 206.5, 136.0);
                ctx.bezierCurveTo(206.9, 135.5, 207.3, 135.0, 207.6, 134.5);
                ctx.bezierCurveTo(208.3, 133.7, 209.0, 132.8, 209.7, 132.0);
                ctx.bezierCurveTo(209.9, 131.7, 210.2, 131.4, 210.5, 131.0);
                ctx.bezierCurveTo(211.0, 130.4, 211.5, 129.9, 212.1, 129.3);
                ctx.bezierCurveTo(212.6, 128.8, 213.1, 128.3, 213.6, 127.8);
                ctx.bezierCurveTo(214.1, 127.4, 214.6, 127.0, 215.1, 126.6);
                ctx.bezierCurveTo(215.3, 126.4, 215.5, 126.3, 215.6, 126.2);
                ctx.bezierCurveTo(216.8, 125.4, 217.9, 124.8, 219.0, 124.5);
                ctx.lineTo(219.3, 125.4);
                ctx.bezierCurveTo(220.0, 127.9, 220.5, 130.6, 220.8, 133.3);
                ctx.bezierCurveTo(221.0, 135.7, 220.8, 138.0, 219.9, 140.2);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(106.0, 40.4);
                ctx.lineTo(113.7, 38.9);
                ctx.bezierCurveTo(114.2, 38.8, 114.6, 38.7, 114.8, 38.6);
                ctx.bezierCurveTo(115.2, 38.6, 115.7, 38.4, 116.1, 38.3);
                ctx.bezierCurveTo(117.2, 37.9, 118.2, 37.4, 119.0, 36.8);
                ctx.lineTo(119.5, 35.6);
                ctx.lineTo(123.3, 21.1);
                ctx.bezierCurveTo(124.5, 18.2, 126.8, 14.6, 130.1, 10.3);
                ctx.bezierCurveTo(135.2, 4.8, 141.0, 2.4, 147.6, 3.1);
                ctx.bezierCurveTo(150.9, 3.4, 152.9, 5.2, 153.5, 8.5);
                ctx.bezierCurveTo(153.7, 10.3, 153.7, 12.0, 153.3, 13.7);
                ctx.bezierCurveTo(152.9, 15.9, 151.7, 17.6, 149.7, 18.6);
                ctx.bezierCurveTo(148.8, 19.2, 147.1, 19.4, 144.6, 19.1);
                ctx.lineTo(143.4, 19.0);
                ctx.lineTo(141.3, 19.0);
                ctx.bezierCurveTo(138.9, 19.1, 136.7, 19.9, 134.8, 21.5);
                ctx.bezierCurveTo(132.4, 23.5, 130.7, 25.2, 129.7, 26.8);
                ctx.bezierCurveTo(128.9, 28.3, 127.9, 30.7, 126.7, 33.8);
                ctx.lineTo(126.4, 36.8);
                ctx.lineTo(126.7, 37.7);
                ctx.lineTo(128.6, 38.7);
                ctx.bezierCurveTo(129.5, 39.2, 130.5, 39.5, 131.6, 39.8);
                ctx.bezierCurveTo(132.7, 40.0, 134.1, 40.4, 135.8, 41.0);
                ctx.bezierCurveTo(137.6, 41.7, 139.9, 42.4, 142.9, 43.3);
                ctx.bezierCurveTo(146.3, 44.6, 149.8, 46.0, 153.1, 47.4);
                ctx.bezierCurveTo(142.8, 50.4, 133.4, 55.2, 125.0, 61.8);
                ctx.bezierCurveTo(124.8, 61.6, 124.5, 61.3, 124.3, 61.0);
                ctx.bezierCurveTo(116.3, 51.7, 106.9, 45.6, 95.9, 42.7);
                ctx.bezierCurveTo(99.2, 41.9, 102.5, 41.1, 106.0, 40.4);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(41.7, 90.1);
                ctx.bezierCurveTo(42.4, 84.8, 43.6, 79.9, 45.5, 75.3);
                ctx.bezierCurveTo(46.5, 72.7, 47.7, 70.1, 49.2, 67.7);
                ctx.bezierCurveTo(52.7, 61.9, 57.3, 56.8, 63.0, 52.3);
                ctx.bezierCurveTo(70.4, 46.7, 77.8, 43.8, 85.3, 43.7);
                ctx.bezierCurveTo(87.3, 43.6, 89.3, 43.8, 91.3, 44.1);
                ctx.bezierCurveTo(95.6, 44.9, 100.0, 46.5, 104.4, 49.1);
                ctx.bezierCurveTo(111.9, 53.4, 117.3, 59.5, 120.8, 67.4);
                ctx.lineTo(124.2, 73.8);
                ctx.lineTo(124.6, 73.8);
                ctx.bezierCurveTo(124.7, 73.5, 124.9, 73.2, 125.0, 72.9);
                ctx.bezierCurveTo(126.3, 71.1, 127.5, 69.4, 128.6, 67.7);
                ctx.bezierCurveTo(136.0, 57.6, 146.1, 51.7, 158.7, 50.1);
                ctx.bezierCurveTo(158.9, 50.1, 159.1, 50.1, 159.2, 50.1);
                ctx.bezierCurveTo(162.5, 50.1, 165.7, 50.5, 168.8, 51.2);
                ctx.bezierCurveTo(176.5, 53.0, 183.4, 56.7, 189.4, 62.4);
                ctx.bezierCurveTo(190.0, 63.0, 190.6, 63.5, 191.1, 64.1);
                ctx.bezierCurveTo(193.9, 67.0, 196.1, 70.1, 197.8, 73.5);
                ctx.bezierCurveTo(201.1, 79.7, 202.5, 86.8, 202.2, 94.7);
                ctx.bezierCurveTo(202.0, 99.0, 201.3, 103.2, 199.9, 107.1);
                ctx.bezierCurveTo(197.5, 114.2, 193.1, 120.7, 186.7, 126.4);
                ctx.bezierCurveTo(177.6, 134.4, 168.3, 137.9, 158.5, 137.0);
                ctx.bezierCurveTo(153.1, 136.4, 149.4, 135.6, 147.3, 134.6);
                ctx.bezierCurveTo(137.6, 129.8, 130.4, 122.6, 125.6, 113.0);
                ctx.bezierCurveTo(124.9, 111.7, 124.3, 110.4, 123.8, 109.0);
                ctx.bezierCurveTo(123.3, 107.9, 122.9, 106.7, 122.6, 105.5);
                ctx.bezierCurveTo(121.9, 106.9, 121.2, 108.3, 120.5, 109.6);
                ctx.bezierCurveTo(119.7, 111.0, 118.8, 112.4, 118.0, 113.7);
                ctx.bezierCurveTo(110.3, 125.2, 100.6, 132.5, 88.9, 135.6);
                ctx.bezierCurveTo(75.9, 139.1, 64.3, 136.3, 54.2, 127.3);
                ctx.bezierCurveTo(51.5, 124.9, 49.2, 122.2, 47.4, 119.3);
                ctx.bezierCurveTo(42.2, 111.4, 40.4, 101.7, 41.7, 90.1);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(20.3, 118.2);
                ctx.bezierCurveTo(20.4, 117.0, 20.4, 116.4, 20.3, 116.5);
                ctx.bezierCurveTo(24.4, 105.8, 29.8, 95.7, 36.6, 86.2);
                ctx.bezierCurveTo(37.1, 85.5, 37.7, 84.8, 38.2, 84.1);
                ctx.bezierCurveTo(37.1, 88.6, 36.6, 93.4, 36.6, 98.3);
                ctx.bezierCurveTo(36.7, 106.3, 38.6, 113.5, 42.5, 119.7);
                ctx.bezierCurveTo(45.8, 125.2, 50.6, 129.9, 56.8, 134.0);
                ctx.bezierCurveTo(70.0, 142.9, 83.7, 143.9, 98.0, 137.2);
                ctx.bezierCurveTo(106.4, 133.2, 113.9, 127.9, 120.6, 121.5);
                ctx.lineTo(120.9, 121.3);
                ctx.lineTo(121.3, 121.5);
                ctx.bezierCurveTo(126.4, 125.0, 131.7, 128.7, 137.2, 132.7);
                ctx.bezierCurveTo(142.2, 136.2, 147.7, 138.6, 153.7, 139.7);
                ctx.bezierCurveTo(161.7, 140.8, 169.7, 139.6, 177.8, 135.9);
                ctx.bezierCurveTo(183.6, 133.5, 188.4, 130.0, 192.3, 125.5);
                ctx.bezierCurveTo(197.1, 119.7, 200.6, 113.5, 202.9, 106.8);
                ctx.bezierCurveTo(203.6, 104.8, 204.2, 102.7, 204.6, 100.6);
                ctx.bezierCurveTo(205.1, 98.2, 205.5, 95.7, 205.7, 93.2);
                ctx.bezierCurveTo(205.8, 92.2, 205.8, 91.1, 205.9, 90.2);
                ctx.bezierCurveTo(205.9, 86.5, 205.4, 83.0, 204.4, 79.6);
                ctx.bezierCurveTo(209.2, 84.5, 213.3, 89.7, 216.9, 95.4);
                ctx.bezierCurveTo(218.2, 97.5, 219.3, 99.6, 220.2, 101.8);
                ctx.bezierCurveTo(220.5, 102.5, 220.8, 103.3, 221.0, 104.0);
                ctx.bezierCurveTo(221.4, 104.9, 221.6, 105.7, 221.6, 106.6);
                ctx.bezierCurveTo(221.6, 107.6, 221.5, 108.5, 221.3, 109.4);
                ctx.bezierCurveTo(221.1, 110.4, 220.8, 111.5, 220.3, 112.5);
                ctx.bezierCurveTo(220.1, 113.0, 219.8, 113.5, 219.4, 114.0);
                ctx.bezierCurveTo(218.7, 115.1, 217.8, 116.3, 216.7, 117.4);
                ctx.lineTo(214.9, 119.9);
                ctx.lineTo(211.7, 124.0);
                ctx.lineTo(209.8, 126.7);
                ctx.lineTo(202.9, 136.6);
                ctx.lineTo(195.9, 144.6);
                ctx.bezierCurveTo(192.6, 148.2, 187.7, 152.0, 181.4, 156.2);
                ctx.lineTo(161.4, 168.4);
                ctx.bezierCurveTo(159.7, 169.4, 156.6, 170.7, 152.0, 172.3);
                ctx.bezierCurveTo(147.4, 173.9, 141.6, 175.3, 134.5, 176.2);
                ctx.bezierCurveTo(128.4, 177.1, 122.5, 177.2, 116.7, 176.5);
                ctx.bezierCurveTo(109.0, 175.8, 101.5, 174.4, 94.1, 172.2);
                ctx.bezierCurveTo(86.9, 170.0, 79.8, 167.4, 72.9, 164.4);
                ctx.bezierCurveTo(72.0, 164.0, 71.0, 163.5, 70.1, 163.1);
                ctx.bezierCurveTo(65.2, 160.7, 60.8, 158.3, 57.0, 155.8);
                ctx.bezierCurveTo(54.7, 154.3, 52.5, 152.9, 50.5, 151.5);
                ctx.bezierCurveTo(47.2, 149.4, 44.1, 147.1, 41.1, 144.8);
                ctx.bezierCurveTo(37.4, 142.0, 34.0, 138.9, 31.1, 135.5);
                ctx.bezierCurveTo(29.4, 133.7, 27.9, 131.7, 26.5, 129.7);
                ctx.bezierCurveTo(26.4, 129.5, 26.3, 129.4, 26.2, 129.3);
                ctx.lineTo(25.0, 127.3);
                ctx.bezierCurveTo(23.3, 125.0, 22.2, 123.4, 21.6, 122.5);
                ctx.bezierCurveTo(20.7, 121.1, 20.2, 119.7, 20.3, 118.2);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(177.9, 163.2);
                ctx.lineTo(174.9, 169.8);
                ctx.lineTo(174.7, 170.3);
                ctx.lineTo(174.4, 170.9);
                ctx.bezierCurveTo(174.0, 172.1, 173.5, 173.3, 173.1, 174.5);
                ctx.bezierCurveTo(172.2, 177.2, 171.1, 179.7, 169.6, 182.2);
                ctx.bezierCurveTo(168.3, 184.5, 166.3, 186.1, 163.6, 187.2);
                ctx.bezierCurveTo(160.6, 188.4, 157.5, 188.5, 154.4, 187.3);
                ctx.bezierCurveTo(151.9, 186.4, 149.5, 185.5, 147.2, 184.7);
                ctx.lineTo(146.7, 184.5);
                ctx.lineTo(146.3, 184.3);
                ctx.lineTo(140.9, 182.4);
                ctx.bezierCurveTo(142.8, 182.1, 145.0, 181.4, 147.5, 180.4);
                ctx.bezierCurveTo(148.2, 180.0, 148.9, 179.7, 149.6, 179.4);
                ctx.bezierCurveTo(152.5, 178.0, 155.3, 176.5, 158.1, 174.8);
                ctx.bezierCurveTo(161.2, 172.9, 164.4, 171.1, 167.5, 169.3);
                ctx.bezierCurveTo(170.7, 167.7, 173.7, 165.9, 176.8, 163.9);
                ctx.bezierCurveTo(177.2, 163.7, 177.6, 163.5, 177.9, 163.2);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(101.1, 181.4);
                ctx.lineTo(97.1, 184.2);
                ctx.lineTo(96.8, 184.3);
                ctx.lineTo(96.3, 184.7);
                ctx.bezierCurveTo(93.2, 186.5, 90.2, 187.9, 87.1, 188.9);
                ctx.bezierCurveTo(83.9, 189.9, 81.1, 189.2, 78.6, 186.6);
                ctx.bezierCurveTo(76.0, 184.1, 74.0, 181.3, 72.5, 178.3);
                ctx.bezierCurveTo(71.3, 175.7, 70.1, 172.9, 69.0, 170.1);
                ctx.lineTo(68.0, 167.8);
                ctx.bezierCurveTo(67.8, 167.3, 67.7, 166.8, 67.5, 166.3);
                ctx.bezierCurveTo(69.1, 167.1, 70.7, 167.9, 72.4, 168.8);
                ctx.bezierCurveTo(74.1, 169.6, 75.9, 170.5, 77.9, 171.4);
                ctx.bezierCurveTo(79.9, 172.3, 83.2, 173.8, 87.9, 175.9);
                ctx.bezierCurveTo(92.5, 177.9, 95.7, 179.3, 97.5, 180.0);
                ctx.bezierCurveTo(99.2, 180.7, 100.4, 181.2, 101.1, 181.4);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(25.8, 151.1);
                ctx.bezierCurveTo(23.2, 147.7, 22.0, 143.6, 22.3, 139.0);
                ctx.bezierCurveTo(22.3, 139.0, 22.3, 139.0, 22.3, 139.0);
                ctx.lineTo(22.4, 135.1);
                ctx.bezierCurveTo(22.5, 134.4, 22.9, 134.4, 23.6, 134.9);
                ctx.bezierCurveTo(24.4, 135.4, 25.2, 136.0, 26.0, 136.6);
                ctx.bezierCurveTo(27.6, 137.8, 29.1, 139.0, 30.7, 140.2);
                ctx.bezierCurveTo(34.1, 142.9, 37.3, 145.8, 40.4, 148.8);
                ctx.bezierCurveTo(42.4, 150.6, 44.1, 152.6, 45.6, 154.7);
                ctx.bezierCurveTo(45.8, 155.3, 45.9, 155.7, 45.7, 156.0);
                ctx.lineTo(45.5, 156.1);
                ctx.bezierCurveTo(40.5, 158.4, 35.6, 158.3, 30.9, 155.9);
                ctx.bezierCurveTo(30.6, 155.7, 30.3, 155.6, 30.0, 155.4);
                ctx.bezierCurveTo(30.0, 155.3, 29.9, 155.3, 29.9, 155.3);
                ctx.bezierCurveTo(28.3, 154.0, 26.9, 152.6, 25.8, 151.1);
                ctx.closePath();

                // omnom/outline/Path
                ctx.moveTo(240.9, 209.6);
                ctx.bezierCurveTo(240.1, 211.5, 239.1, 213.3, 237.8, 215.0);
                ctx.bezierCurveTo(236.5, 216.5, 235.2, 218.1, 233.9, 219.6);
                ctx.bezierCurveTo(233.4, 220.2, 232.8, 220.7, 232.3, 221.1);
                ctx.bezierCurveTo(230.1, 222.1, 227.5, 222.5, 224.3, 222.1);
                ctx.bezierCurveTo(218.9, 221.9, 213.4, 222.0, 207.7, 222.3);
                ctx.bezierCurveTo(206.5, 222.4, 205.3, 222.4, 204.0, 222.5);
                ctx.bezierCurveTo(203.3, 218.7, 201.8, 213.8, 199.6, 207.8);
                ctx.lineTo(200.2, 212.5);
                ctx.bezierCurveTo(200.1, 212.0, 200.0, 211.2, 199.7, 210.2);
                ctx.bezierCurveTo(199.9, 214.1, 200.0, 218.2, 199.9, 222.3);
                ctx.bezierCurveTo(199.9, 222.5, 199.9, 222.7, 199.9, 222.9);
                ctx.bezierCurveTo(199.9, 225.0, 199.7, 226.9, 199.4, 228.8);
                ctx.bezierCurveTo(199.1, 230.4, 198.7, 232.0, 198.3, 233.5);
                ctx.lineTo(196.7, 235.1);
                ctx.bezierCurveTo(196.6, 235.2, 196.5, 235.4, 196.3, 235.5);
                ctx.bezierCurveTo(195.2, 236.4, 193.3, 237.6, 190.7, 239.1);
                ctx.bezierCurveTo(188.1, 240.7, 184.5, 241.7, 179.9, 242.1);
                ctx.bezierCurveTo(175.3, 242.4, 172.0, 242.5, 169.8, 242.3);
                ctx.bezierCurveTo(167.8, 242.1, 165.5, 241.6, 162.9, 240.8);
                ctx.bezierCurveTo(160.4, 239.9, 158.0, 237.9, 155.6, 234.8);
                ctx.bezierCurveTo(155.4, 234.6, 155.3, 234.4, 155.1, 234.2);
                ctx.bezierCurveTo(154.3, 233.0, 153.5, 231.6, 152.8, 230.0);
                ctx.bezierCurveTo(151.9, 227.8, 151.2, 225.3, 150.7, 222.4);
                ctx.bezierCurveTo(150.7, 222.2, 150.6, 222.1, 150.6, 221.9);
                ctx.bezierCurveTo(149.7, 216.4, 149.3, 213.1, 149.2, 212.0);
                ctx.bezierCurveTo(148.8, 215.6, 148.6, 219.2, 148.8, 222.8);
                ctx.bezierCurveTo(148.9, 225.2, 149.0, 227.6, 149.4, 230.0);
                ctx.bezierCurveTo(149.4, 230.3, 149.4, 230.6, 149.5, 231.0);
                ctx.bezierCurveTo(141.0, 233.2, 132.2, 234.4, 123.2, 234.4);
                ctx.bezierCurveTo(113.4, 235.1, 103.6, 234.6, 93.8, 233.0);
                ctx.lineTo(94.0, 232.0);
                ctx.bezierCurveTo(94.3, 230.0, 94.4, 228.1, 94.4, 226.2);
                ctx.bezierCurveTo(94.4, 225.6, 94.3, 224.9, 94.3, 224.3);
                ctx.bezierCurveTo(94.2, 220.7, 94.0, 217.1, 93.8, 213.5);
                ctx.bezierCurveTo(93.8, 214.9, 93.7, 215.9, 93.6, 216.6);
                ctx.bezierCurveTo(93.5, 217.2, 93.5, 217.7, 93.4, 218.1);
                ctx.bezierCurveTo(93.4, 218.5, 93.2, 219.4, 92.8, 220.9);
                ctx.bezierCurveTo(92.6, 222.0, 92.3, 223.0, 92.0, 223.9);
                ctx.bezierCurveTo(91.9, 224.2, 91.8, 224.5, 91.7, 224.8);
                ctx.bezierCurveTo(91.3, 226.0, 90.8, 227.1, 90.2, 228.3);
                ctx.bezierCurveTo(89.9, 229.0, 89.5, 229.7, 89.2, 230.4);
                ctx.bezierCurveTo(88.8, 230.9, 88.4, 231.4, 88.0, 231.9);
                ctx.bezierCurveTo(87.5, 232.5, 86.9, 233.1, 86.2, 233.7);
                ctx.bezierCurveTo(85.8, 234.1, 85.4, 234.5, 84.9, 234.8);
                ctx.bezierCurveTo(83.9, 235.6, 82.8, 236.2, 81.6, 236.7);
                ctx.bezierCurveTo(80.2, 237.3, 78.7, 237.7, 77.1, 238.1);
                ctx.bezierCurveTo(74.1, 238.7, 71.0, 239.0, 67.8, 239.0);
                ctx.bezierCurveTo(60.3, 239.1, 53.6, 237.3, 47.7, 233.5);
                ctx.bezierCurveTo(47.6, 233.4, 47.5, 233.4, 47.4, 233.3);
                ctx.bezierCurveTo(45.9, 232.5, 45.0, 231.7, 44.9, 230.9);
                ctx.lineTo(44.6, 229.2);
                ctx.bezierCurveTo(44.6, 228.8, 44.5, 228.2, 44.5, 227.6);
                ctx.bezierCurveTo(44.5, 225.9, 44.5, 223.5, 44.6, 220.3);
                ctx.lineTo(44.6, 213.4);
                ctx.lineTo(44.7, 207.6);
                ctx.lineTo(43.7, 213.0);
                ctx.lineTo(42.4, 220.3);
                ctx.bezierCurveTo(41.9, 223.1, 41.7, 225.4, 41.6, 227.4);
                ctx.bezierCurveTo(41.0, 227.3, 40.3, 227.3, 39.7, 227.2);
                ctx.bezierCurveTo(37.7, 227.2, 35.8, 227.2, 33.8, 227.2);
                ctx.bezierCurveTo(32.0, 227.2, 30.2, 227.2, 28.4, 227.2);
                ctx.bezierCurveTo(26.4, 227.2, 24.5, 227.3, 22.6, 227.4);
                ctx.bezierCurveTo(21.3, 227.4, 19.7, 227.5, 17.8, 227.7);
                ctx.bezierCurveTo(15.9, 227.9, 13.9, 227.7, 11.9, 227.1);
                ctx.bezierCurveTo(9.8, 226.4, 8.3, 225.2, 7.4, 223.5);
                ctx.bezierCurveTo(6.5, 221.8, 5.6, 219.7, 4.8, 217.3);
                ctx.bezierCurveTo(4.0, 214.8, 3.5, 212.9, 3.3, 211.5);
                ctx.bezierCurveTo(3.2, 210.1, 3.6, 209.0, 4.5, 208.2);
                ctx.bezierCurveTo(5.4, 207.3, 6.7, 206.1, 8.4, 204.6);
                ctx.bezierCurveTo(10.2, 202.9, 11.6, 201.6, 12.7, 200.6);
                ctx.bezierCurveTo(13.7, 199.6, 16.9, 197.2, 22.4, 193.3);
                ctx.bezierCurveTo(26.1, 190.5, 28.7, 189.1, 30.1, 188.9);
                ctx.bezierCurveTo(31.2, 193.0, 32.3, 197.0, 33.7, 201.0);
                ctx.bezierCurveTo(34.2, 202.8, 35.0, 204.4, 36.0, 205.9);
                ctx.lineTo(33.3, 187.7);
                ctx.lineTo(33.1, 185.9);
                ctx.lineTo(32.9, 184.7);
                ctx.lineTo(32.7, 183.4);
                ctx.bezierCurveTo(31.8, 176.3, 31.0, 168.9, 30.3, 161.3);
                ctx.bezierCurveTo(30.3, 161.0, 30.3, 160.7, 30.2, 160.3);
                ctx.bezierCurveTo(34.5, 162.0, 39.0, 162.0, 43.8, 160.4);
                ctx.bezierCurveTo(44.4, 160.1, 45.1, 159.9, 45.8, 159.6);
                ctx.lineTo(50.7, 157.9);
                ctx.lineTo(63.1, 164.7);
                ctx.bezierCurveTo(63.4, 166.0, 64.0, 168.0, 65.2, 170.7);
                ctx.lineTo(65.5, 171.5);
                ctx.bezierCurveTo(66.9, 174.7, 68.3, 177.8, 69.8, 180.9);
                ctx.bezierCurveTo(71.4, 184.1, 73.4, 187.0, 76.0, 189.6);
                ctx.bezierCurveTo(78.5, 192.2, 81.7, 193.4, 85.5, 193.1);
                ctx.bezierCurveTo(89.2, 192.6, 92.8, 191.5, 96.3, 189.7);
                ctx.bezierCurveTo(98.5, 188.6, 100.4, 187.4, 102.1, 185.9);
                ctx.lineTo(103.2, 185.0);
                ctx.bezierCurveTo(103.4, 184.9, 103.6, 184.7, 103.8, 184.6);
                ctx.bezierCurveTo(106.5, 182.5, 108.3, 180.9, 109.3, 179.7);
                ctx.lineTo(109.4, 179.7);
                ctx.bezierCurveTo(114.0, 180.5, 118.1, 181.0, 121.9, 181.4);
                ctx.bezierCurveTo(125.7, 181.8, 128.8, 181.8, 131.3, 181.4);
                ctx.bezierCurveTo(133.0, 181.8, 136.2, 183.2, 140.7, 185.6);
                ctx.bezierCurveTo(141.0, 185.7, 141.3, 185.9, 141.7, 186.0);
                ctx.bezierCurveTo(142.1, 186.3, 142.6, 186.5, 143.0, 186.7);
                ctx.bezierCurveTo(143.5, 186.9, 144.0, 187.1, 144.5, 187.3);
                ctx.bezierCurveTo(147.1, 188.4, 149.8, 189.4, 152.5, 190.3);
                ctx.bezierCurveTo(155.3, 191.3, 158.2, 191.7, 161.2, 191.7);
                ctx.bezierCurveTo(164.2, 191.7, 166.7, 190.7, 168.6, 188.6);
                ctx.bezierCurveTo(170.0, 187.2, 171.1, 185.6, 172.0, 184.1);
                ctx.bezierCurveTo(173.4, 181.6, 174.7, 179.1, 175.9, 176.6);
                ctx.bezierCurveTo(177.1, 174.0, 178.3, 171.4, 179.4, 168.7);
                ctx.bezierCurveTo(179.7, 168.0, 180.0, 167.3, 180.2, 166.7);
                ctx.bezierCurveTo(181.4, 164.0, 182.0, 162.2, 182.0, 161.5);
                ctx.bezierCurveTo(183.8, 160.7, 186.6, 158.8, 190.2, 155.8);
                ctx.lineTo(191.0, 155.2);
                ctx.bezierCurveTo(191.7, 154.5, 192.6, 153.8, 193.4, 153.2);
                ctx.bezierCurveTo(193.8, 153.0, 194.1, 152.8, 194.5, 152.6);
                ctx.lineTo(196.6, 153.6);
                ctx.bezierCurveTo(197.0, 153.7, 197.6, 153.8, 198.4, 153.8);
                ctx.bezierCurveTo(199.3, 153.8, 200.6, 153.7, 202.1, 153.6);
                ctx.bezierCurveTo(204.6, 153.5, 207.0, 153.1, 209.4, 152.5);
                ctx.bezierCurveTo(210.5, 152.1, 211.6, 151.8, 212.6, 151.3);
                ctx.bezierCurveTo(212.6, 151.4, 212.6, 151.4, 212.6, 151.4);
                ctx.bezierCurveTo(213.3, 158.8, 213.4, 166.1, 212.8, 173.3);
                ctx.lineTo(211.2, 182.6);
                ctx.lineTo(211.0, 183.6);
                ctx.lineTo(209.4, 192.8);
                ctx.lineTo(208.3, 198.0);
                ctx.lineTo(208.4, 198.1);
                ctx.bezierCurveTo(210.9, 194.2, 212.8, 190.0, 214.2, 185.6);
                ctx.lineTo(240.5, 201.5);
                ctx.bezierCurveTo(241.1, 202.2, 241.6, 202.9, 241.8, 203.6);
                ctx.bezierCurveTo(242.1, 205.4, 241.8, 207.4, 240.9, 209.6);
                ctx.closePath();
                ctx.fillStyle = "rgb(35, 44, 30)";
                ctx.fill();

                // omnom/white
                ctx.beginPath();

                // omnom/white/Path
                ctx.moveTo(219.9, 140.2);
                ctx.bezierCurveTo(219.5, 141.6, 218.8, 143.0, 218.0, 144.5);
                ctx.bezierCurveTo(217.8, 144.9, 217.6, 145.2, 217.3, 145.6);
                ctx.bezierCurveTo(216.7, 146.3, 215.9, 146.9, 214.9, 147.4);
                ctx.bezierCurveTo(214.1, 147.8, 213.2, 148.2, 212.3, 148.4);
                ctx.bezierCurveTo(210.2, 149.1, 208.0, 149.5, 205.6, 149.5);
                ctx.bezierCurveTo(204.5, 149.5, 203.4, 149.4, 202.3, 149.3);
                ctx.bezierCurveTo(200.6, 148.9, 199.7, 148.0, 199.8, 146.7);
                ctx.lineTo(200.7, 145.2);
                ctx.bezierCurveTo(201.3, 144.3, 201.8, 143.4, 202.4, 142.5);
                ctx.bezierCurveTo(202.7, 141.9, 203.0, 141.3, 203.4, 140.8);
                ctx.bezierCurveTo(203.8, 140.0, 204.2, 139.2, 204.7, 138.5);
                ctx.bezierCurveTo(205.3, 137.7, 205.9, 136.8, 206.5, 136.0);
                ctx.bezierCurveTo(206.9, 135.5, 207.3, 135.0, 207.6, 134.5);
                ctx.bezierCurveTo(208.3, 133.7, 209.0, 132.8, 209.7, 132.0);
                ctx.bezierCurveTo(209.9, 131.7, 210.2, 131.4, 210.5, 131.0);
                ctx.bezierCurveTo(211.0, 130.4, 211.5, 129.9, 212.1, 129.3);
                ctx.bezierCurveTo(212.6, 128.8, 213.1, 128.3, 213.6, 127.8);
                ctx.bezierCurveTo(214.1, 127.4, 214.6, 127.0, 215.1, 126.6);
                ctx.bezierCurveTo(215.3, 126.4, 215.5, 126.3, 215.6, 126.2);
                ctx.bezierCurveTo(216.8, 125.4, 217.9, 124.8, 219.0, 124.5);
                ctx.lineTo(219.3, 125.4);
                ctx.bezierCurveTo(220.0, 127.9, 220.5, 130.6, 220.8, 133.3);
                ctx.bezierCurveTo(221.0, 135.7, 220.8, 138.0, 219.9, 140.2);
                ctx.closePath();

                // omnom/white/Path
                ctx.moveTo(40.4, 148.8);
                ctx.bezierCurveTo(37.3, 145.8, 34.1, 142.9, 30.7, 140.2);
                ctx.bezierCurveTo(29.1, 139.0, 27.6, 137.8, 26.0, 136.6);
                ctx.bezierCurveTo(25.2, 136.0, 24.4, 135.4, 23.6, 134.9);
                ctx.bezierCurveTo(22.9, 134.4, 22.5, 134.4, 22.4, 135.1);
                ctx.lineTo(22.3, 139.0);
                ctx.bezierCurveTo(22.3, 139.0, 22.3, 139.0, 22.3, 139.0);
                ctx.bezierCurveTo(22.0, 143.6, 23.2, 147.7, 25.8, 151.1);
                ctx.bezierCurveTo(26.9, 152.6, 28.3, 154.0, 29.9, 155.3);
                ctx.bezierCurveTo(29.9, 155.3, 30.0, 155.3, 30.0, 155.4);
                ctx.bezierCurveTo(30.3, 155.6, 30.6, 155.7, 30.9, 155.9);
                ctx.bezierCurveTo(35.6, 158.3, 40.5, 158.4, 45.5, 156.1);
                ctx.lineTo(45.7, 156.0);
                ctx.bezierCurveTo(45.9, 155.7, 45.8, 155.3, 45.6, 154.7);
                ctx.bezierCurveTo(44.1, 152.6, 42.4, 150.6, 40.4, 148.8);
                ctx.closePath();

                // omnom/white/Path
                ctx.moveTo(87.9, 175.9);
                ctx.bezierCurveTo(83.2, 173.8, 79.9, 172.3, 77.9, 171.4);
                ctx.bezierCurveTo(75.9, 170.5, 74.1, 169.6, 72.4, 168.8);
                ctx.bezierCurveTo(70.7, 167.9, 69.1, 167.1, 67.5, 166.3);
                ctx.bezierCurveTo(67.7, 166.8, 67.8, 167.3, 68.0, 167.8);
                ctx.lineTo(69.0, 170.1);
                ctx.bezierCurveTo(70.1, 172.9, 71.3, 175.7, 72.5, 178.3);
                ctx.bezierCurveTo(74.0, 181.3, 76.0, 184.1, 78.6, 186.6);
                ctx.bezierCurveTo(81.1, 189.2, 83.9, 189.9, 87.1, 188.9);
                ctx.bezierCurveTo(90.2, 187.9, 93.2, 186.5, 96.3, 184.7);
                ctx.lineTo(96.8, 184.3);
                ctx.lineTo(97.1, 184.2);
                ctx.lineTo(101.1, 181.4);
                ctx.bezierCurveTo(100.4, 181.2, 99.2, 180.7, 97.5, 180.0);
                ctx.bezierCurveTo(95.7, 179.3, 92.5, 177.9, 87.9, 175.9);
                ctx.closePath();

                // omnom/white/Path
                ctx.moveTo(167.5, 169.3);
                ctx.bezierCurveTo(164.4, 171.1, 161.2, 172.9, 158.1, 174.8);
                ctx.bezierCurveTo(155.3, 176.5, 152.5, 178.0, 149.6, 179.4);
                ctx.bezierCurveTo(148.9, 179.7, 148.2, 180.0, 147.5, 180.4);
                ctx.bezierCurveTo(145.0, 181.4, 142.8, 182.1, 140.9, 182.4);
                ctx.lineTo(146.3, 184.3);
                ctx.lineTo(146.7, 184.5);
                ctx.lineTo(147.2, 184.7);
                ctx.bezierCurveTo(149.5, 185.5, 151.9, 186.4, 154.4, 187.3);
                ctx.bezierCurveTo(157.5, 188.5, 160.6, 188.4, 163.6, 187.2);
                ctx.bezierCurveTo(166.3, 186.1, 168.3, 184.5, 169.6, 182.2);
                ctx.bezierCurveTo(171.1, 179.7, 172.2, 177.2, 173.1, 174.5);
                ctx.bezierCurveTo(173.5, 173.3, 174.0, 172.1, 174.4, 170.9);
                ctx.lineTo(174.7, 170.3);
                ctx.lineTo(174.9, 169.8);
                ctx.lineTo(177.9, 163.2);
                ctx.bezierCurveTo(177.6, 163.5, 177.2, 163.7, 176.8, 163.9);
                ctx.bezierCurveTo(173.7, 165.9, 170.7, 167.7, 167.5, 169.3);
                ctx.closePath();

                // omnom/white/Path
                ctx.moveTo(202.2, 94.7);
                ctx.bezierCurveTo(202.5, 86.8, 201.1, 79.7, 197.8, 73.5);
                ctx.bezierCurveTo(196.1, 70.1, 193.9, 67.0, 191.1, 64.1);
                ctx.bezierCurveTo(190.6, 63.5, 190.0, 63.0, 189.4, 62.4);
                ctx.bezierCurveTo(183.4, 56.7, 176.5, 53.0, 168.8, 51.2);
                ctx.bezierCurveTo(165.7, 50.5, 162.5, 50.1, 159.2, 50.1);
                ctx.bezierCurveTo(159.1, 50.1, 158.9, 50.1, 158.7, 50.1);
                ctx.bezierCurveTo(146.1, 51.7, 136.0, 57.6, 128.6, 67.7);
                ctx.bezierCurveTo(127.5, 69.4, 126.3, 71.1, 125.0, 72.9);
                ctx.bezierCurveTo(124.9, 73.2, 124.7, 73.5, 124.6, 73.8);
                ctx.lineTo(124.4, 74.2);
                ctx.lineTo(124.2, 73.8);
                ctx.lineTo(120.8, 67.4);
                ctx.bezierCurveTo(117.3, 59.5, 111.9, 53.4, 104.4, 49.1);
                ctx.bezierCurveTo(100.0, 46.5, 95.6, 44.9, 91.3, 44.1);
                ctx.bezierCurveTo(89.3, 43.8, 87.3, 43.6, 85.3, 43.7);
                ctx.bezierCurveTo(77.8, 43.8, 70.4, 46.7, 63.0, 52.3);
                ctx.bezierCurveTo(57.3, 56.8, 52.7, 61.9, 49.2, 67.7);
                ctx.bezierCurveTo(47.7, 70.1, 46.5, 72.7, 45.5, 75.3);
                ctx.bezierCurveTo(43.6, 79.9, 42.4, 84.8, 41.7, 90.1);
                ctx.bezierCurveTo(40.4, 101.7, 42.2, 111.4, 47.4, 119.3);
                ctx.bezierCurveTo(49.2, 122.2, 51.5, 124.9, 54.2, 127.3);
                ctx.bezierCurveTo(64.3, 136.3, 75.9, 139.1, 88.9, 135.6);
                ctx.bezierCurveTo(100.6, 132.5, 110.3, 125.2, 118.0, 113.7);
                ctx.bezierCurveTo(118.8, 112.4, 119.7, 111.0, 120.5, 109.6);
                ctx.bezierCurveTo(121.2, 108.3, 121.9, 106.9, 122.6, 105.5);
                ctx.bezierCurveTo(122.9, 106.7, 123.3, 107.9, 123.8, 109.0);
                ctx.bezierCurveTo(124.3, 110.4, 124.9, 111.7, 125.6, 113.0);
                ctx.bezierCurveTo(130.4, 122.6, 137.6, 129.8, 147.3, 134.6);
                ctx.bezierCurveTo(149.4, 135.6, 153.1, 136.4, 158.5, 137.0);
                ctx.bezierCurveTo(168.3, 137.9, 177.6, 134.4, 186.7, 126.4);
                ctx.bezierCurveTo(193.1, 120.7, 197.5, 114.2, 199.9, 107.1);
                ctx.bezierCurveTo(201.3, 103.2, 202.0, 99.0, 202.2, 94.7);
                ctx.closePath();
                ctx.fillStyle = "rgb(255, 255, 255)";
                ctx.fill();

                // omnom/leftEye
                ctx.save();
                ctx.translate(leftEyeOffset, 0);
                ctx.beginPath();
                ctx.moveTo(101.3, 71.1);
                ctx.bezierCurveTo(101.0, 71.1, 100.7, 71.2, 100.5, 71.3);
                ctx.bezierCurveTo(100.5, 71.3, 100.5, 71.3, 100.5, 71.3);
                ctx.bezierCurveTo(102.7, 72.9, 103.8, 75.8, 104.0, 79.9);
                ctx.bezierCurveTo(104.1, 84.2, 100.5, 86.1, 93.0, 85.6);
                ctx.bezierCurveTo(91.0, 85.5, 89.2, 85.4, 87.8, 85.3);
                ctx.bezierCurveTo(87.7, 86.6, 87.6, 87.9, 87.6, 89.3);
                ctx.bezierCurveTo(87.8, 91.8, 88.6, 94.3, 89.9, 96.7);
                ctx.bezierCurveTo(91.9, 101.5, 95.2, 103.9, 99.8, 103.9);
                ctx.bezierCurveTo(107.4, 103.7, 112.3, 98.0, 114.7, 86.8);
                ctx.bezierCurveTo(114.7, 74.4, 110.2, 69.2, 101.3, 71.1);
                ctx.closePath();
                ctx.fillStyle = "rgb(0, 0, 0)";
                ctx.fill();
                ctx.restore();

                // omnom/rightEye
                ctx.save();
                ctx.translate(rightEyeOffset, 0);
                ctx.beginPath();
                ctx.moveTo(150.4, 74.1);
                ctx.bezierCurveTo(147.9, 71.7, 145.3, 70.5, 142.4, 70.5);
                ctx.bezierCurveTo(141.5, 70.5, 140.5, 70.7, 139.6, 71.0);
                ctx.bezierCurveTo(140.1, 71.3, 140.6, 71.6, 141.1, 72.0);
                ctx.bezierCurveTo(143.3, 73.6, 144.5, 76.5, 144.6, 80.6);
                ctx.bezierCurveTo(144.8, 84.9, 141.1, 86.8, 133.7, 86.3);
                ctx.bezierCurveTo(132.1, 86.2, 130.8, 86.2, 129.6, 86.1);
                ctx.bezierCurveTo(129.6, 86.2, 129.6, 86.2, 129.6, 86.3);
                ctx.bezierCurveTo(129.6, 89.1, 130.2, 91.7, 131.5, 94.1);
                ctx.bezierCurveTo(134.1, 99.0, 138.3, 101.5, 144.0, 101.5);
                ctx.bezierCurveTo(146.8, 101.7, 149.7, 99.7, 152.5, 95.6);
                ctx.bezierCurveTo(154.5, 91.6, 155.5, 88.9, 155.5, 87.5);
                ctx.bezierCurveTo(155.5, 81.9, 153.8, 77.5, 150.4, 74.1);
                ctx.closePath();
                ctx.fillStyle = "rgb(0, 0, 0)";
                ctx.fill();
                ctx.restore();

                ctx.restore();
                ctx.restore();
            };
        }
    }

    return new EasterEggManager();
});

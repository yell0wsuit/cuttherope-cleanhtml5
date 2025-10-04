define("visual/Text", [
    "visual/BaseElement",
    "utils/Constants",
    "core/Alignment",
    "visual/ImageMultiDrawer",
    "utils/Canvas",
    "resources/ResourceId",
    "resources/ResourceMgr",
    "resolution",
    "utils/MathHelper",
    "game/CTRSettings",
], function (
    BaseElement,
    Constants,
    Alignment,
    ImageMultiDrawer,
    Canvas,
    ResourceId,
    ResourceMgr,
    resolution,
    MathHelper,
    settings
) {
    //settings.getLangId()
    function FormattedString(str, width) {
        this.string = str;
        this.width = width;
    }

    Text = BaseElement.extend({
        init: function (font) {
            this._super();
            this.font = font;
            this.formattedStrings = [];
            this.width = Constants.UNDEFINED;
            this.height = Constants.UNDEFINED;
            this.align = Alignment.LEFT;
            this.d = new ImageMultiDrawer(font.texture);
            this.wrapLongWords = false;
            this.maxHeight = Constants.UNDEFINED;
        },
        setString: function (newString, width) {
            this.string = newString;
            if (width == null || width === Constants.UNDEFINED) {
                this.wrapWidth = Math.ceil(this.font.stringWidth(newString));
            } else {
                this.wrapWidth = Math.ceil(width);
            }

            if (this.string) {
                this.formatText();
                this.updateDrawerValues();
            }
        },
        updateDrawerValues: function () {
            var dx = 0,
                dy = 0,
                itemHeight = this.font.fontHeight(),
                n = 0,
                dotsString = "..",
                dotsOffset = this.font.getCharOffset(dotsString, 0),
                linesToDraw =
                    this.maxHeight === Constants.UNDEFINED
                        ? this.formattedStrings.length
                        : Math.min(
                              this.formattedStrings.length,
                              this.maxHeight / itemHeight + this.font.lineOffset
                          ),
                drawEllipsis = linesToDraw !== this.formattedStrings.length;

            for (var i = 0; i < linesToDraw; i++) {
                var fs = this.formattedStrings[i],
                    s = fs.string,
                    len = s.length;

                if (this.align !== Alignment.LEFT) {
                    if (this.align === Alignment.HCENTER || this.align === Alignment.CENTER) {
                        dx = (this.wrapWidth - fs.width) / 2;
                    } else {
                        dx = this.wrapWidth - fs.width;
                    }
                } else {
                    dx = 0;
                }

                for (var c = 0; c < len; c++) {
                    if (s[c] === " ") {
                        dx += this.font.spaceWidth + this.font.getCharOffset(s, c);
                    } else {
                        var quadIndex = this.font.getCharQuad(s[c]),
                            itemWidth = this.font.texture.rects[quadIndex].w;
                        this.d.mapTextureQuad(quadIndex, Math.round(dx), Math.round(dy), n++);
                        dx += itemWidth + this.font.getCharOffset(s, c);
                    }

                    if (drawEllipsis && i === linesToDraw - 1) {
                        var dotIndex = this.font.getCharQuad(".");
                        var dotWidth = this.font.texture.rects[dotIndex].w;
                        if (
                            c === len - 1 ||
                            (c === len - 2 &&
                                dx + 3 * (dotWidth + dotsOffset) + this.font.spaceWidth >
                                    this.wrapWidth)
                        ) {
                            this.d.mapTextureQuad(dotIndex, Math.round(dx), Math.round(dy), n++);
                            dx += dotWidth + dotsOffset;
                            this.d.mapTextureQuad(dotIndex, Math.round(dx), Math.round(dy), n++);
                            dx += dotWidth + dotsOffset;
                            this.d.mapTextureQuad(dotIndex, Math.round(dx), Math.round(dy), n++);
                            dx += dotWidth + dotsOffset;
                            break;
                        }
                    }
                }
                dy += itemHeight + this.font.lineOffset;
            }

            if (this.formattedStrings.length <= 1) {
                this.height = this.font.fontHeight();
                this.width = dx;
            } else {
                this.height =
                    (this.font.fontHeight() + this.font.lineOffset) * this.formattedStrings.length -
                    this.font.lineOffset;
                this.width = this.wrapWidth;
            }

            if (this.maxHeight !== Constants.UNDEFINED) {
                this.height = Math.min(this.height, this.maxHeight);
            }
        },
        draw: function () {
            this.preDraw();

            // only draw if the image is non-transparent
            if (this.color.a !== 0) {
                var len = this.string.length,
                    ctx = Canvas.context;
                if (len > 0) {
                    ctx.translate(this.drawX, this.drawY);
                    this.d.drawNumberOfQuads(len);
                    ctx.translate(-this.drawX, -this.drawY);
                }
            }

            this.postDraw();
        },
        formatText: function () {
            var strIdx = [],
                s = this.string,
                len = s.length,
                idx = 0,
                xc = 0,
                wc = 0,
                xp = 0,
                xpe = 0,
                wp = 0,
                dx = 0;

            while (dx < len) {
                var c = s[dx++];

                if (c == " " || c == "\n") {
                    wp += wc;
                    xpe = dx - 1;
                    wc = 0;
                    xc = dx;

                    if (c == " ") {
                        xc--;
                        wc = this.font.spaceWidth + this.font.getCharOffset(s, dx - 1);
                    }
                } else {
                    var quadIndex = this.font.getCharQuad(c),
                        charWidth = this.font.texture.rects[quadIndex].w;
                    wc += charWidth + this.font.getCharOffset(s, dx - 1);
                }

                var tooLong = MathHelper.roundP2(wp + wc) > this.wrapWidth;

                if (this.wrapLongWords && tooLong && xpe == xp) {
                    wp += wc;
                    xpe = dx;
                    wc = 0;
                    xc = dx;
                }

                if ((MathHelper.roundP2(wp + wc) > this.wrapWidth && xpe != xp) || c == "\n") {
                    strIdx[idx++] = xp;
                    strIdx[idx++] = xpe;
                    while (xc < len && s[xc] == " ") {
                        xc++;
                        wc -= this.font.spaceWidth;
                    }

                    xp = xc;
                    xpe = xp;
                    wp = 0;
                }
            }

            if (wc != 0) {
                strIdx[idx++] = xp;
                strIdx[idx++] = dx;
            }

            var strCount = idx >> 1;

            this.formattedStrings = [];
            for (var i = 0; i < strCount; i++) {
                var start = strIdx[i << 1],
                    end = strIdx[(i << 1) + 1],
                    str = this.string.substring(start, end),
                    wd = this.font.stringWidth(str),
                    fs = new FormattedString(str, wd);
                this.formattedStrings.push(fs);
            }
        },
        createFromXml: function (xml) {
            var resId = Xml.attrInt(xml, "font"),
                font = ResourceMgr.getFont(resId),
                element = new Text(font);

            if (xml.hasAttribute("align")) {
                element.align = Alignment.parse(Xml.attr(xml, "align"));
            }

            if (xml.hasAttribute("string")) {
                var strId = Xml.attrInt("string"),
                    str = ResourceMgr.getString(strId),
                    strWidth = xml.hasAttribute("width")
                        ? Xml.attrFloat(xml, "width")
                        : Constants.UNDEFINED;

                element.setString(str, strWidth);
            }

            if (xml.hasAttribute("height")) {
                element.maxHeight = Xml.attrFloat(xml, "height");
            }

            return element;
        },
    });

    function stringToArray(ctx, string, width) {
        // convert string to array of lines then words
        var input = string.split("\n");
        for (var i = 0; i < input.length; ++i) {
            input[i] = input[i].split(" ");
        }

        var i = 0,
            j = 0,
            output = [];
        var runningWidth = 0;
        var line = 0;

        while (i < input.length) {
            while (j < input[i].length) {
                if (!output[line]) {
                    output[line] = "";
                }

                var text = input[i][j] + " ";
                var w = ctx.measureText(text).width;

                // overflow to a newline
                if (runningWidth + w > width && runningWidth > 0) {
                    line++;
                    runningWidth = 0;
                } else {
                    output[line] += text;
                    j++;
                    runningWidth += w;
                }
            }

            output[line] = output[line].trim();
            i++;
            line++;
            j = 0;
            runningWidth = 0;
        }

        return output;
    }

    function setupFont(ctx, options) {
        var color = options.fontId === 5 ? "#000" : "#fff";
        if (options.alignment !== 1) {
            ctx.textAlign = "center";
        }

        ctx.fillStyle = color;
        ctx.font = "normal 100 18px 'gooddognew', sans-serif";

        if (options.fontId === 4) {
            ctx.strokeStyle = "rgba(0,0,0,0.7)";
            ctx.lineWidth = 3;
        }

        if (options.alpha) {
            ctx.globalAlpha = options.alpha;
        }
    }

    Text.drawSystem = function (options) {
        var lineHeight = 22;
        var cnv = options.canvas ? options.img : document.createElement("canvas");
        cnv.width = options.width || options.maxScaleWidth || options.text.length * 16;
        cnv.height = lineHeight;

        var ctx = cnv.getContext("2d");
        var x = cnv.width / 2;

        if (options.alignment === 1) {
            x = 0;
        }

        setupFont(ctx, options);

        // detect overflow by measuring or newline character
        var metric = ctx.measureText(options.text);
        if (options.text.indexOf("\n") > 0 || (options.width && metric.width > options.width)) {
            var text = stringToArray(ctx, options.text, options.width);
            cnv.height = lineHeight * text.length + 5;

            setupFont(ctx, options);

            for (var i = 0; i < text.length; ++i) {
                if (options.fontId === 4) {
                    ctx.strokeText(text[i], x, (i + 1) * lineHeight);
                }
                ctx.fillText(text[i], x, (i + 1) * lineHeight);
            }
        } else {
            // use the measured width
            if (!options.width || !options.maxScaleWidth) {
                cnv.width = metric.width + 5;
                setupFont(ctx, options);
                if (options.alignment !== 1) x = cnv.width / 2;
            }
            if (options.fontId === 4) {
                ctx.strokeText(options.text, x, 15);
            }
            ctx.fillText(options.text, x, 15);
        }

        if (!options.canvas) {
            options.img.src = cnv.toDataURL("image/png");
            options.img.style.paddingTop = "4px";
        }

        options.img.style.height = "auto";
        options.img.style.width = "auto";

        return options.img;
    };

    Text.drawImg = function (options) {
        // get or create the image element
        var img = options.img;
        if (!img && options.imgId) {
            img = document.getElementById(options.imgId);
        }
        if (!img && options.imgSel) {
            img = $(options.imgSel)[0];
        }
        if (!img && options.imgParentId) {
            // obbtains img child or prepends new Image if necessary
            var $parent = $("#" + options.imgParentId),
                $img = $parent.find(options.canvas ? "canvas" : "img");
            if ($img.length === 0) {
                $img = $(options.canvas ? "<canvas>" : "<img>").prependTo($parent);
            }
            img = $img[0];
        }
        if (!img) {
            img = new Image();
        }

        var lang = settings.getLangId();
        if (lang >= 4 && lang <= 9) {
            $("#lang").addClass("lang-system");
            options.img = img;
            options.text = options.text.toString();
            return Text.drawSystem(options);
        }

        var fontId = options.fontId,
            width = options.width,
            alignment = options.alignment,
            scaleToUI = options.scaleToUI,
            alpha = options.alpha != null ? options.alpha : 1,
            scale = options.scaleToUI ? resolution.UI_TEXT_SCALE : options.scale || 1,
            // ensure the text is a string (ex: convert number to string)
            text = options.text.toString();

        // save the existing canvas id and switch to the hidden canvas
        var existingCanvas = Canvas.element;

        // create a temporary canvas to use
        Canvas.setTarget(options.canvas ? img : document.createElement("canvas"));

        var font = ResourceMgr.getFont(fontId);
        var t = new Text(font);
        var padding = 24 * resolution.CANVAS_SCALE; // add padding to each side

        // set the text parameters
        t.x = Math.ceil(padding / 2);
        t.y = 0;
        t.align = alignment || Alignment.LEFT;
        t.setString(text, width);

        // set the canvas width and height
        var canvas = Canvas.element,
            ctx = Canvas.context,
            imgWidth = (width || Math.ceil(t.width)) + Math.ceil(t.x * 2),
            imgHeight = Math.ceil(t.height);
        canvas.width = imgWidth;
        canvas.height = imgHeight;

        var previousAlpha = ctx.globalAlpha;
        if (alpha !== previousAlpha) {
            ctx.globalAlpha = alpha;
        }

        // draw the text and get the image data
        t.draw();
        if (!options.canvas) img.src = canvas.toDataURL("image/png");

        if (alpha !== previousAlpha) {
            ctx.globalAlpha = previousAlpha;
        }

        // restore the original canvas for the App
        if (existingCanvas) {
            Canvas.setTarget(existingCanvas);
        }

        var finalWidth = imgWidth * scale,
            finalHeight = imgHeight * scale,
            maxScaleWidth = options.maxScaleWidth,
            topPadding,
            widthScale;

        // do additional scaling if a max scale width was specified and exceeded
        if (maxScaleWidth && finalWidth > maxScaleWidth) {
            widthScale = maxScaleWidth / finalWidth;
            topPadding = Math.round(((1 - widthScale) * finalHeight) / 2);
            finalWidth *= widthScale;
            finalHeight *= widthScale;
        }

        // When the src is set using image data, the height and width are
        // not immediately available so we'll explicitly set them
        var $img = $(img).width(finalWidth).height(finalHeight).css("padding-top", 0);

        // adjust the top padding if we scaled the image for width
        if (topPadding) {
            $img.css("padding-top", topPadding);
        }

        return img;
    };

    Text.drawSmall = function (options) {
        options.fontId = ResourceId.FNT_SMALL_FONT;
        return Text.drawImg(options);
    };
    Text.drawBig = function (options) {
        options.fontId = ResourceId.FNT_BIG_FONT;
        return Text.drawImg(options);
    };
    Text.drawBigNumbers = function (options) {
        options.fontId = ResourceId.FNT_FONT_NUMBERS_BIG;
        return Text.drawImg(options);
    };

    return Text;
});

import BaseElement from "@/visual/BaseElement";
import Constants from "@/utils/Constants";
import Alignment from "@/core/Alignment";
import ImageMultiDrawer from "@/visual/ImageMultiDrawer";
import Canvas from "@/utils/Canvas";
import ResourceId from "@/resources/ResourceId";
import ResourceMgr from "@/resources/ResourceMgr";
import resolution from "@/resolution";
import MathHelper from "@/utils/MathHelper";
import settings from "@/game/CTRSettings";

//settings.getLangId()
class FormattedString {
    constructor(str, width) {
        this.string = str;
        this.width = width;
    }
}

class Text extends BaseElement {
    constructor(font) {
        super();
        this.font = font;
        this.formattedStrings = [];
        this.width = Constants.UNDEFINED;
        this.height = Constants.UNDEFINED;
        this.align = Alignment.LEFT;
        this.d = new ImageMultiDrawer(font.texture);
        this.wrapLongWords = false;
        this.maxHeight = Constants.UNDEFINED;
    }

    setString(newString, width) {
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
    }

    updateDrawerValues() {
        let dx = 0,
            dy = 0,
            n = 0;
        const itemHeight = this.font.fontHeight(),
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

        for (let i = 0; i < linesToDraw; i++) {
            const fs = this.formattedStrings[i],
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

            for (let c = 0; c < len; c++) {
                if (s[c] === " ") {
                    dx += this.font.spaceWidth + this.font.getCharOffset(s, c);
                } else {
                    const quadIndex = this.font.getCharQuad(s[c]),
                        itemWidth = this.font.texture.rects[quadIndex].w;
                    this.d.mapTextureQuad(quadIndex, Math.round(dx), Math.round(dy), n++);
                    dx += itemWidth + this.font.getCharOffset(s, c);
                }

                if (drawEllipsis && i === linesToDraw - 1) {
                    const dotIndex = this.font.getCharQuad(".");
                    const dotWidth = this.font.texture.rects[dotIndex].w;
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
    }

    draw() {
        this.preDraw();

        // only draw if the image is non-transparent
        if (this.color.a !== 0) {
            const len = this.string.length,
                ctx = Canvas.context;
            if (len > 0) {
                ctx.translate(this.drawX, this.drawY);
                this.d.drawNumberOfQuads(len);
                ctx.translate(-this.drawX, -this.drawY);
            }
        }

        this.postDraw();
    }

    formatText() {
        const strIdx = [],
            s = this.string,
            len = s.length;
        let idx = 0,
            xc = 0,
            wc = 0,
            xp = 0,
            xpe = 0,
            wp = 0,
            dx = 0;

        while (dx < len) {
            const c = s[dx++];

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
                const quadIndex = this.font.getCharQuad(c),
                    charWidth = this.font.texture.rects[quadIndex].w;
                wc += charWidth + this.font.getCharOffset(s, dx - 1);
            }

            const tooLong = MathHelper.roundP2(wp + wc) > this.wrapWidth;

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

        const strCount = idx >> 1;

        this.formattedStrings = [];
        for (let i = 0; i < strCount; i++) {
            const start = strIdx[i << 1],
                end = strIdx[(i << 1) + 1],
                str = this.string.substring(start, end),
                wd = this.font.stringWidth(str),
                fs = new FormattedString(str, wd);
            this.formattedStrings.push(fs);
        }
    }

    createFromXml(xml) {
        const resId = xml.attrInt(xml, "font"),
            font = ResourceMgr.getFont(resId),
            element = new Text(font);

        if (xml.hasAttribute("align")) {
            element.align = Alignment.parse(xml.attr(xml, "align"));
        }

        if (xml.hasAttribute("string")) {
            const strId = xml.attrInt("string"),
                str = ResourceMgr.getString(strId),
                strWidth = xml.hasAttribute("width")
                    ? xml.attrFloat(xml, "width")
                    : Constants.UNDEFINED;

            element.setString(str, strWidth);
        }

        if (xml.hasAttribute("height")) {
            element.maxHeight = xml.attrFloat(xml, "height");
        }

        return element;
    }
}

function stringToArray(ctx, string, width) {
    // convert string to array of lines then words
    const input = string.split("\n");
    for (let i = 0; i < input.length; ++i) {
        input[i] = input[i].split(" ");
    }

    let i = 0,
        j = 0;
    const output = [];
    let runningWidth = 0;
    let line = 0;

    while (i < input.length) {
        while (j < input[i].length) {
            if (!output[line]) {
                output[line] = "";
            }

            const text = `${input[i][j]} `;
            const w = ctx.measureText(text).width;

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
    const color = options.fontId === 5 ? "#000" : "#fff";
    if (options.alignment !== 1) {
        ctx.textAlign = "center";
    }

    ctx.fillStyle = color;

    // Scale factor for 1920x1080 (1920/1024 = 1.875)
    const scaleFactor = resolution.CANVAS_WIDTH / 1024;

    // Font ID 4 uses larger font size, Font ID 5 uses 22px
    // Base sizes are for 1024x576, scale them for higher resolutions
    if (options.fontId === 4) {
        const fontSize = Math.round(32 * scaleFactor);
        ctx.font = `bold ${fontSize}px 'gooddognew', sans-serif`;
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.lineWidth = Math.round(3 * scaleFactor);
    } else {
        const fontSize = Math.round(22 * scaleFactor);
        ctx.font = `normal ${fontSize}px 'gooddognew', sans-serif`;
    }

    if (options.alpha) {
        ctx.globalAlpha = options.alpha;
    }
}

Text.drawSystem = function (options) {
    // Scale factor for 1920x1080 (1920/1024 = 1.875)
    const scaleFactor = resolution.CANVAS_WIDTH / 1024;

    // Use different line heights based on font ID, scaled for resolution
    const baseLineHeight = options.fontId === 4 ? 28 : 22;
    const lineHeight = Math.round(baseLineHeight * scaleFactor);

    // Add top padding to prevent text cutoff, more for big font with CJK
    const baseTopPadding = options.fontId === 4 ? 12 : 8;
    const topPadding = Math.round(baseTopPadding * scaleFactor);

    // Add bottom padding for small font to prevent cutoff for descenders like "g", "y", "p"
    const baseBottomPadding = options.fontId === 4 ? 0 : 6;
    const bottomPadding = Math.round(baseBottomPadding * scaleFactor);

    const cnv = options.canvas ? options.img : document.createElement("canvas");
    cnv.width = options.width || options.maxScaleWidth || options.text.length * 16 * scaleFactor;
    cnv.height = lineHeight + topPadding + bottomPadding;

    const ctx = cnv.getContext("2d");
    let x = cnv.width / 2;

    if (options.alignment === 1) {
        x = 0;
    }

    setupFont(ctx, options);

    // detect overflow by measuring or newline character
    const metric = ctx.measureText(options.text);
    if (options.text.indexOf("\n") > 0 || (options.width && metric.width > options.width)) {
        const text = stringToArray(ctx, options.text, options.width);
        cnv.height = lineHeight * text.length + topPadding + bottomPadding;

        setupFont(ctx, options);

        for (let i = 0; i < text.length; ++i) {
            const yPos = topPadding + (i + 1) * lineHeight - (lineHeight - Math.round(18 * scaleFactor));
            if (options.fontId === 4) {
                ctx.strokeText(text[i], x, yPos);
            }
            ctx.fillText(text[i], x, yPos);
        }
    } else {
        // use the measured width
        if (!options.width || !options.maxScaleWidth) {
            cnv.width = metric.width + Math.round(5 * scaleFactor);
            setupFont(ctx, options);
            if (options.alignment !== 1) x = cnv.width / 2;
        }
        const yPos = topPadding + lineHeight - (lineHeight - Math.round(18 * scaleFactor));
        if (options.fontId === 4) {
            ctx.strokeText(options.text, x, yPos);
        }
        ctx.fillText(options.text, x, yPos);
    }

    if (!options.canvas) {
        options.img.src = cnv.toDataURL("image/png");
        options.img.style.paddingTop = "18px";
    }

    options.img.style.height = "auto";
    options.img.style.width = "auto";

    return options.img;
};

Text.drawImg = function (options) {
    // get or create the image element
    let img = options.img;
    if (!img && options.imgId) {
        img = document.getElementById(options.imgId);
    }
    if (!img && options.imgSel) {
        img = document.querySelector(options.imgSel);
    }
    if (!img && options.imgParentId) {
        // obtains img child or prepends new Image if necessary
        const parent = document.getElementById(options.imgParentId);
        if (parent) {
            let imgElement = parent.querySelector(options.canvas ? "canvas" : "img");
            if (!imgElement) {
                imgElement = document.createElement(options.canvas ? "canvas" : "img");
                parent.insertBefore(imgElement, parent.firstChild);
            }
            img = imgElement;
        }
    }
    if (!img) {
        img = new Image();
    }

    const lang = settings.getLangId();
    if (lang >= 4 && lang <= 9) {
        document.getElementById("lang").classList.add("lang-system");
        options.img = img;
        options.text = options.text.toString();
        return Text.drawSystem(options);
    }

    const fontId = options.fontId,
        width = options.width,
        alignment = options.alignment,
        scaleToUI = options.scaleToUI,
        alpha = options.alpha != null ? options.alpha : 1,
        scale = options.scaleToUI ? resolution.UI_TEXT_SCALE : options.scale || 1,
        // ensure the text is a string (ex: convert number to string)
        text = options.text.toString();

    // save the existing canvas id and switch to the hidden canvas
    const existingCanvas = Canvas.element;

    // create a temporary canvas to use
    Canvas.setTarget(options.canvas ? img : document.createElement("canvas"));

    const font = ResourceMgr.getFont(fontId);
    const t = new Text(font);
    const padding = 24 * resolution.CANVAS_SCALE; // add padding to each side

    // set the text parameters
    t.x = Math.ceil(padding / 2);
    t.y = 0;
    t.align = alignment || Alignment.LEFT;
    t.setString(text, width);

    // set the canvas width and height
    const canvas = Canvas.element,
        ctx = Canvas.context,
        imgWidth = (width || Math.ceil(t.width)) + Math.ceil(t.x * 2),
        imgHeight = Math.ceil(t.height);
    canvas.width = imgWidth;
    canvas.height = imgHeight;

    const previousAlpha = ctx.globalAlpha;
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

    let finalWidth = imgWidth * scale,
        finalHeight = imgHeight * scale,
        topPadding,
        widthScale;
    const maxScaleWidth = options.maxScaleWidth;

    // do additional scaling if a max scale width was specified and exceeded
    if (maxScaleWidth && finalWidth > maxScaleWidth) {
        widthScale = maxScaleWidth / finalWidth;
        topPadding = Math.round(((1 - widthScale) * finalHeight) / 2);
        finalWidth *= widthScale;
        finalHeight *= widthScale;
    }

    // When the src is set using image data, the height and width are
    // not immediately available so we'll explicitly set them
    img.style.width = `${finalWidth}px`;
    img.style.height = `${finalHeight}px`;
    img.style.paddingTop = "0px";

    // adjust the top padding if we scaled the image for width
    if (topPadding) {
        img.style.paddingTop = `${topPadding}px`;
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

export default Text;

const elements = {
    assetFilter: document.getElementById("assetFilter"),
    assetUpload: document.getElementById("assetUpload"),
    assetSelect: document.getElementById("assetSelect"),
    resolutionSelect: document.getElementById("resolutionSelect"),
    zoomRange: document.getElementById("zoomRange"),
    zoomLabel: document.getElementById("zoomLabel"),
    toggleOffsets: document.getElementById("toggleOffsets"),
    toggleNumbers: document.getElementById("toggleNumbers"),
    spriteCanvas: document.getElementById("spriteCanvas"),
    cursorPosition: document.getElementById("cursorPosition"),
    selectedRectLabel: document.getElementById("selectedRectLabel"),
    assetSummary: document.getElementById("assetSummary"),
    rectTable: document.getElementById("rectTable"),
    newRectTable: document.getElementById("newRectTable"),
    newRectX: document.getElementById("newRectX"),
    newRectY: document.getElementById("newRectY"),
    newRectW: document.getElementById("newRectW"),
    newRectH: document.getElementById("newRectH"),
    newOffsetX: document.getElementById("newOffsetX"),
    newOffsetY: document.getElementById("newOffsetY"),
    rectPasteTextarea: document.getElementById("rectPasteTextarea"),
    offsetPasteTextarea: document.getElementById("offsetPasteTextarea"),
    parsePasteValues: document.getElementById("parsePasteValues"),
    drawModeToggle: document.getElementById("drawModeToggle"),
    addRectButton: document.getElementById("addRectButton"),
    updateRectButton: document.getElementById("updateRectButton"),
    clearRectsButton: document.getElementById("clearRectsButton"),
    outputTextarea: document.getElementById("outputTextarea"),
    copyRectOutput: document.getElementById("copyRectOutput"),
    copyOffsetOutput: document.getElementById("copyOffsetOutput"),
    copyJsonOutput: document.getElementById("copyJsonOutput"),
    animationLoopToggle: document.getElementById("animationLoopToggle"),
    animationBg: document.getElementById("animationBg"),
    playAnimation: document.getElementById("playAnimation"),
    stopAnimation: document.getElementById("stopAnimation"),
    clearAnimation: document.getElementById("clearAnimation"),
    animationTable: document.getElementById("animationTable"),
    animationCanvas: document.getElementById("animationCanvas"),
};

const state = {
    assets: [],
    filteredAssets: [],
    metadata: null,
    currentAsset: null,
    currentImage: null,
    currentImagePath: null,
    activeRects: [],
    activeOffsets: [],
    scaleInfo: null,
    showOffsets: true,
    showNumbers: true,
    scale: 1,
    selectedRectIndex: null,
    selectedResolution: "__auto__",
    newRects: [],
    newRectSelectedIndex: null,
    drawMode: false,
    dragStart: null,
    tempRect: null,
    animationFrames: [],
    animationLoop: false,
    animationPlaying: false,
    animationFrameIndex: 0,
    animationFrameStart: 0,
    animationRequestId: null,
    customAssetCounter: 0,
};

const canvasCtx = elements.spriteCanvas.getContext("2d");
const animationCtx = elements.animationCanvas.getContext("2d");

init();

async function init() {
    try {
        const response = await fetch("assets-data.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Failed to load assets-data.json (${response.status})`);
        }
        const data = await response.json();
        state.metadata = data.metadata || {};
        state.assets = (data.assets || [])
            .filter((asset) => asset && asset.file && (asset.type === "IMAGE" || asset.type === "FONT"))
            .sort((a, b) => assetLabel(a).localeCompare(assetLabel(b)));
        state.filteredAssets = [...state.assets];
        populateResolutionOptions();
        populateAssetSelect();
        registerEventHandlers();
        if (state.filteredAssets.length > 0) {
            elements.assetSelect.selectedIndex = 0;
            loadAsset(state.filteredAssets[0]);
        } else {
            updateAssetSummary(null, null, "No assets available.");
        }
    } catch (error) {
        console.error(error);
        updateAssetSummary(null, null, `Unable to initialise inspector: ${error.message}`);
    }
}

function registerEventHandlers() {
    elements.assetFilter.addEventListener("input", handleAssetFilter);
    if (elements.assetUpload) {
        elements.assetUpload.addEventListener("change", handleCustomAssetUpload);
    }
    elements.assetSelect.addEventListener("change", () => {
        const selected = getSelectedAsset();
        if (selected) {
            loadAsset(selected);
        }
    });
    elements.resolutionSelect.addEventListener("change", () => {
        state.selectedResolution = elements.resolutionSelect.value;
        const selected = getSelectedAsset();
        if (selected) {
            loadAsset(selected, true);
        }
    });
    elements.zoomRange.addEventListener("input", handleZoomChange);
    elements.toggleOffsets.addEventListener("click", () => {
        state.showOffsets = !state.showOffsets;
        elements.toggleOffsets.classList.toggle("active", state.showOffsets);
        drawCanvas();
    });
    elements.toggleNumbers.addEventListener("click", () => {
        state.showNumbers = !state.showNumbers;
        elements.toggleNumbers.classList.toggle("active", state.showNumbers);
        drawCanvas();
    });

    elements.spriteCanvas.addEventListener("mousedown", onCanvasMouseDown);
    elements.spriteCanvas.addEventListener("mousemove", onCanvasMouseMove);
    elements.spriteCanvas.addEventListener("mouseleave", () => {
        elements.cursorPosition.textContent = "Cursor: —";
        state.tempRect = null;
        drawCanvas();
    });
    window.addEventListener("mouseup", onCanvasMouseUp);

    elements.drawModeToggle.addEventListener("change", () => {
        state.drawMode = elements.drawModeToggle.checked;
        state.dragStart = null;
        state.tempRect = null;
        drawCanvas();
    });
    elements.addRectButton.addEventListener("click", addRectFromInputs);
    elements.updateRectButton.addEventListener("click", updateSelectedNewRect);
    elements.clearRectsButton.addEventListener("click", () => {
        state.newRects = [];
        state.newRectSelectedIndex = null;
        populateNewRectInputs(null);
        pruneNewAnimationFrames();
        renderNewRectTable();
        updateOutputPreview();
        drawCanvas();
    });

    if (elements.parsePasteValues) {
        elements.parsePasteValues.addEventListener("click", handleParsePastedValues);
    }

    elements.copyRectOutput.addEventListener("click", () => handleCopy(generateRectArrayString()));
    elements.copyOffsetOutput.addEventListener("click", () => handleCopy(generateOffsetArrayString()));
    elements.copyJsonOutput.addEventListener("click", () => handleCopy(generateJsonString()));

    elements.animationLoopToggle.addEventListener("change", () => {
        state.animationLoop = elements.animationLoopToggle.checked;
    });
    elements.animationBg.addEventListener("input", () => {
        if (!state.animationPlaying) {
            fillAnimationBackground();
        }
    });
    elements.playAnimation.addEventListener("click", startAnimation);
    elements.stopAnimation.addEventListener("click", stopAnimation);
    elements.clearAnimation.addEventListener("click", () => {
        stopAnimation();
        state.animationFrames = [];
        renderAnimationTable();
    });
}

function populateResolutionOptions() {
    const { availableResolutions = [], extraImageDirectories = [] } = state.metadata || {};
    const select = elements.resolutionSelect;
    select.innerHTML = "";
    const autoOption = document.createElement("option");
    autoOption.value = "__auto__";
    autoOption.textContent = "Auto (best match)";
    select.appendChild(autoOption);
    availableResolutions.forEach((resolution) => {
        const option = document.createElement("option");
        option.value = resolution;
        option.textContent = `${resolution}px`;
        select.appendChild(option);
    });
    extraImageDirectories.forEach((dir) => {
        const option = document.createElement("option");
        option.value = `global:${dir}`;
        option.textContent = `Global – ${dir}`;
        select.appendChild(option);
    });
    select.value = state.selectedResolution;
}

function populateAssetSelect() {
    const select = elements.assetSelect;
    const previous = select.value;
    select.innerHTML = "";
    state.filteredAssets.forEach((asset) => {
        const option = document.createElement("option");
        option.value = assetKey(asset);
        option.textContent = assetLabel(asset);
        select.appendChild(option);
    });
    if (previous) {
        const match = Array.from(select.options).find((opt) => opt.value === previous);
        if (match) {
            select.value = previous;
        }
    }
}

function handleAssetFilter() {
    const term = elements.assetFilter.value.trim().toLowerCase();
    if (!term) {
        state.filteredAssets = [...state.assets];
    } else {
        state.filteredAssets = state.assets.filter((asset) => assetLabel(asset).toLowerCase().includes(term));
    }
    populateAssetSelect();
    if (state.filteredAssets.length > 0) {
        elements.assetSelect.selectedIndex = 0;
        loadAsset(state.filteredAssets[0]);
    } else {
        stopAnimation();
        state.currentAsset = null;
        state.currentImage = null;
        state.currentImagePath = null;
        state.selectedRectIndex = null;
        renderRectTable();
        drawCanvas();
        updateSelectedRectLabel();
        updateAssetSummary(null, null, "No assets match the current filter.");
    }
}

function getSelectedAsset() {
    const value = elements.assetSelect.value;
    if (!value) {
        return null;
    }
    return state.filteredAssets.find((asset) => assetKey(asset) === value) || null;
}

function assetKey(asset) {
    return String(asset.id ?? asset.file);
}

function assetLabel(asset) {
    const parts = [];
    if (asset.id !== null && asset.id !== undefined) {
        parts.push(`#${asset.id}`);
    }
    if (asset.name) {
        parts.push(asset.name);
    }
    if (asset.file) {
        parts.push(`(${asset.file})`);
    }
    return parts.join(" · ") || "Unnamed asset";
}
function loadAsset(asset, keepSelection = false) {
    stopAnimation();
    const previousSelection = keepSelection ? state.selectedRectIndex : null;
    state.currentAsset = asset;
    const maxIndex = Array.isArray(asset?.rects) ? asset.rects.length - 1 : -1;
    state.selectedRectIndex = previousSelection !== null && previousSelection >= 0 && previousSelection <= maxIndex ? previousSelection : null;
    state.currentImage = null;
    state.currentImagePath = null;
    state.activeRects = [];
    state.activeOffsets = [];
    state.scaleInfo = null;
    state.newRects = [];
    state.newRectSelectedIndex = null;
    elements.drawModeToggle.checked = state.drawMode = false;
    state.tempRect = null;

    const imagePath = resolveImagePath(asset);
    state.currentImagePath = imagePath;
    applyAssetScaling(asset, imagePath);

    renderRectTable();
    renderNewRectTable();
    renderAnimationTable();
    updateSelectedRectLabel();
    drawCanvas();

    if (!asset) {
        updateAssetSummary(null, null, "Select an asset to inspect.");
        return;
    }

    if (!imagePath) {
        updateAssetSummary(asset, null, "No image found for the current resolution.");
        return;
    }

    updateAssetSummary(asset, imagePath, "Loading image…");

    const img = new Image();
    img.onload = () => {
        state.currentImage = img;
        drawCanvas();
        renderRectTable();
        updateAssetSummary(asset, imagePath);
        fillAnimationBackground();
    };
    img.onerror = () => {
        state.currentImage = null;
        drawCanvas();
        updateAssetSummary(asset, imagePath, "Failed to load the image file.");
    };
    img.src = imagePath;
}

function resolveImagePath(asset) {
    if (!asset) {
        return null;
    }
    if (asset.inlineImage) {
        return asset.inlineImage;
    }
    const selection = state.selectedResolution;
    const availablePaths = asset.availablePaths || {};
    const globalPaths = asset.globalPaths || [];

    if (selection && selection.startsWith("global:")) {
        const dir = selection.split(":")[1];
        const match = globalPaths.find((path) => path.startsWith(`images/${dir}`));
        if (match) {
            return toRelative(match);
        }
        return null;
    }

    if (selection && selection !== "__auto__") {
        const explicit = availablePaths[selection];
        if (explicit) {
            return toRelative(explicit);
        }
        return null;
    }

    const firstResolution = Object.values(availablePaths)[0];
    if (firstResolution) {
        return toRelative(firstResolution);
    }
    if (globalPaths.length > 0) {
        return toRelative(globalPaths[0]);
    }
    return null;
}

function toRelative(publicPath) {
    return `../../${publicPath}`;
}

function applyAssetScaling(asset, imagePath) {
    if (!asset) {
        state.activeRects = [];
        state.activeOffsets = [];
        state.scaleInfo = null;
        return;
    }

    const baseScaleInfo = computeScaleInfo(asset, imagePath);
    const scale = typeof baseScaleInfo?.scale === "number" && Number.isFinite(baseScaleInfo.scale) ? baseScaleInfo.scale : 1;
    const originalRects = extractOriginalRects(asset);
    const originalOffsets = extractOriginalOffsets(asset);
    const geometry = buildScaledGeometry(originalRects, originalOffsets, scale);

    state.activeRects = geometry.rects;
    state.activeOffsets = geometry.offsets;
    state.scaleInfo = {
        ...(baseScaleInfo || { scale }),
        layout: geometry.layout,
        coverage: geometry.coverage,
    };
}

function computeScaleInfo(asset, imagePath) {
    if (!asset) {
        return null;
    }
    const resScale = typeof asset.resScale === "number" && !Number.isNaN(asset.resScale) ? asset.resScale : 1;
    const resolution = extractResolutionFromPath(imagePath);
    const canvasScale = resolution ? resolution / 2560 : null;
    const combinedScale = (canvasScale ?? 1) * resScale;
    return {
        scale: combinedScale,
        resolution,
        canvasScale,
        resScale,
    };
}

function extractOriginalRects(asset) {
    if (!asset) {
        return [];
    }
    if (Array.isArray(asset.rectValues) && asset.rectValues.length >= 4) {
        return chunkRectValues(asset.rectValues);
    }
    if (Array.isArray(asset.rects) && asset.rects.length) {
        return asset.rects.map((rect) => ({
            w: typeof rect.w === "number" ? rect.w : 0,
            h: typeof rect.h === "number" ? rect.h : 0,
        }));
    }
    return [];
}

function extractOriginalOffsets(asset) {
    if (!asset) {
        return [];
    }
    if (Array.isArray(asset.offsetValues) && asset.offsetValues.length >= 2) {
        return chunkOffsetValues(asset.offsetValues);
    }
    if (Array.isArray(asset.offsets) && asset.offsets.length) {
        return asset.offsets.map((offset) => ({
            x: typeof offset.x === "number" ? offset.x : 0,
            y: typeof offset.y === "number" ? offset.y : 0,
        }));
    }
    return [];
}

function chunkRectValues(values) {
    const rects = [];
    for (let i = 0; i <= values.length - 4; i += 4) {
        const w = values[i + 2];
        const h = values[i + 3];
        rects.push({
            w: typeof w === "number" ? w : 0,
            h: typeof h === "number" ? h : 0,
        });
    }
    return rects;
}

function chunkOffsetValues(values) {
    const offsets = [];
    for (let i = 0; i <= values.length - 2; i += 2) {
        const x = values[i];
        const y = values[i + 1];
        offsets.push({
            x: typeof x === "number" ? x : 0,
            y: typeof y === "number" ? y : 0,
        });
    }
    return offsets;
}

function buildScaledGeometry(originalRects, originalOffsets, scale) {
    const packing = layoutRectsLikeRuntime(originalRects, scale);
    const offsets = scaleOffsetsLikeRuntime(originalOffsets, scale);
    return {
        rects: packing.rects,
        offsets,
        layout: {
            columns: packing.columns,
            padding: packing.padding,
        },
        coverage: packing.coverage,
    };
}

function layoutRectsLikeRuntime(originalRects, scale) {
    const rectList = Array.isArray(originalRects) ? originalRects : [];
    if (!rectList.length) {
        return {
            rects: [],
            columns: 0,
            padding: 0,
            coverage: { width: 0, height: 0 },
        };
    }

    const padding = 2;
    const numRects = rectList.length;
    const numColumns = Math.max(1, Math.ceil(Math.sqrt(numRects)));
    let columnIndex = 0;
    let currentX = 0;
    let currentY = padding;
    let maxColumnWidth = 0;
    let maxRight = 0;
    let maxBottom = 0;
    const rects = [];

    for (let i = 0; i < numRects; i++) {
        const original = rectList[i];
        columnIndex = (columnIndex + 1) % numColumns;
        if (columnIndex === 1) {
            currentX += maxColumnWidth + padding;
            currentY = padding;
            maxColumnWidth = 0;
        }

        const width = scaleNumber(original.w, scale);
        const height = scaleNumber(original.h, scale);
        const rect = {
            x: currentX,
            y: currentY,
            w: width,
            h: height,
        };

        rects.push(rect);

        currentY += Math.ceil(height) + padding;
        maxColumnWidth = Math.max(maxColumnWidth, Math.ceil(width));
        maxRight = Math.max(maxRight, rect.x + width);
        maxBottom = Math.max(maxBottom, rect.y + height);
    }

    return {
        rects,
        columns: numColumns,
        padding,
        coverage: {
            width: Math.ceil(maxRight),
            height: Math.ceil(maxBottom),
        },
    };
}

function scaleOffsetsLikeRuntime(originalOffsets, scale) {
    const offsets = Array.isArray(originalOffsets) ? originalOffsets : [];
    if (!offsets.length) {
        return [];
    }
    return offsets.map((offset) => ({
        x: scaleNumber(offset.x, scale),
        y: scaleNumber(offset.y, scale),
    }));
}

function extractResolutionFromPath(path) {
    if (!path) {
        return null;
    }
    const match = path.match(/images\/(\d+)\//);
    if (!match) {
        return null;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : null;
}

function scaleNumber(value, scale) {
    if (typeof value !== "number" || Number.isNaN(value)) {
        return value;
    }
    if (typeof scale !== "number" || !Number.isFinite(scale)) {
        return value;
    }
    return Math.round(value * scale * 10000) / 10000;
}

function getActiveRects() {
    return Array.isArray(state.activeRects) ? state.activeRects : [];
}

function getActiveOffsets() {
    return Array.isArray(state.activeOffsets) ? state.activeOffsets : [];
}

function getActiveRect(index) {
    const rects = getActiveRects();
    return index !== null && index !== undefined ? rects[index] || null : null;
}

function getActiveOffset(index) {
    const offsets = getActiveOffsets();
    return index !== null && index !== undefined ? offsets[index] || null : null;
}

function formatScale(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
        return "1";
    }
    return value.toFixed(4).replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function updateSelectedRectLabel() {
    const index = state.selectedRectIndex;
    if (index === null || index === undefined) {
        elements.selectedRectLabel.textContent = "Selected rect: —";
        return;
    }
    const rect = getActiveRect(index);
    if (rect) {
        elements.selectedRectLabel.textContent = `Selected rect: #${index + 1} (x=${rect.x}, y=${rect.y}, w=${rect.w}, h=${rect.h})`;
    } else {
        elements.selectedRectLabel.textContent = "Selected rect: —";
    }
}

function updateAssetSummary(asset, imagePath, message = "") {
    if (!asset) {
        elements.assetSummary.innerHTML = `<div>${message || "Select a sprite sheet to begin."}</div>`;
        return;
    }
    const rectCount = asset.rects ? asset.rects.length : 0;
    const offsetsCount = asset.offsets ? asset.offsets.length : 0;
    const resolutions = Object.keys(asset.availablePaths || {}).join(", ") || "—";
    const globalPaths = (asset.globalPaths || []).map((p) => p.replace(/^images\//, "")).join(", ") || "—";
    const parts = [
        `<div><strong>${assetLabel(asset)}</strong></div>`,
        `<div><strong>Type:</strong> ${asset.type || "Unknown"}</div>`,
        `<div><strong>Rects:</strong> ${rectCount}</div>`,
        `<div><strong>Offsets:</strong> ${offsetsCount}</div>`,
        `<div><strong>Pre-cut size:</strong> ${asset.preCutWidth && asset.preCutHeight ? `${asset.preCutWidth}×${asset.preCutHeight}` : "—"}</div>`,
        `<div><strong>Available resolutions:</strong> ${resolutions}</div>`,
        `<div><strong>Global paths:</strong> ${globalPaths}</div>`,
    ];
    if (asset.sourceNote) {
        parts.push(`<div><strong>Source:</strong> ${asset.sourceNote}</div>`);
    }
    if (state.scaleInfo) {
        const { scale, resolution, canvasScale, resScale, layout, coverage } = state.scaleInfo;
        const showScale = (typeof scale === "number" && scale !== 1) || (canvasScale && canvasScale !== 1) || (resScale && resScale !== 1);
        if (showScale) {
            const factors = [];
            if (canvasScale && canvasScale !== 1) {
                factors.push(`canvas ×${formatScale(canvasScale)}`);
            }
            if (resScale && resScale !== 1) {
                factors.push(`resScale ×${formatScale(resScale)}`);
            }
            const applied = formatScale(scale || 1);
            const scaleDetails = factors.length ? ` (${factors.join(" · ")})` : "";
            parts.push(`<div><strong>Overlay scale:</strong> ×${applied}${scaleDetails}</div>`);
        }
        if (resolution) {
            parts.push(`<div><strong>Resolved image width:</strong> ${resolution}px</div>`);
        }
        if (layout && layout.columns) {
            const columnLabel = layout.columns === 1 ? "1 column" : `${layout.columns} columns`;
            const paddingLabel = typeof layout.padding === "number" ? `${layout.padding}px padding` : "default padding";
            parts.push(`<div><strong>Runtime packing:</strong> ${columnLabel} with ${paddingLabel}</div>`);
        }
        if (coverage && coverage.width && coverage.height) {
            parts.push(`<div><strong>Packed coverage:</strong> ${coverage.width}×${coverage.height}px</div>`);
        }
    }
    if (imagePath) {
        const pathLabel = asset.inlineImage ? asset.file || "Uploaded image" : imagePath.replace(/^\.\.\//, "");
        parts.push(`<div><strong>Loaded path:</strong> ${pathLabel}</div>`);
    }
    if (state.currentImage) {
        parts.push(
            `<div><strong>Image size:</strong> ${state.currentImage.naturalWidth}×${state.currentImage.naturalHeight}px</div>`
        );
    }
    if (message) {
        parts.push(`<div class="error">${message}</div>`);
    }
    elements.assetSummary.innerHTML = parts.join("");
}

function handleCustomAssetUpload(event) {
    const file = event?.target?.files?.[0];
    if (!file) {
        return;
    }
    if (!file.type.startsWith("image/")) {
        updateAssetSummary(state.currentAsset, state.currentImagePath, "Custom uploads must be image files.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl !== "string") {
            updateAssetSummary(state.currentAsset, state.currentImagePath, "Unable to read the selected file.");
            return;
        }

        state.customAssetCounter += 1;
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const newAsset = {
            id: `custom-${Date.now()}-${state.customAssetCounter}`,
            name: baseName || file.name,
            file: file.name,
            type: "IMAGE",
            rects: [],
            offsets: [],
            inlineImage: dataUrl,
            sourceNote: "Uploaded from local file (not saved)",
        };

        state.assets = [...state.assets, newAsset].sort((a, b) => assetLabel(a).localeCompare(assetLabel(b)));
        elements.assetFilter.value = "";
        state.filteredAssets = [...state.assets];
        populateAssetSelect();

        const key = assetKey(newAsset);
        elements.assetSelect.value = key;
        loadAsset(newAsset);
    };
    reader.onerror = () => {
        updateAssetSummary(state.currentAsset, state.currentImagePath, "Failed to read the selected file.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
}

function handleZoomChange() {
    const value = parseFloat(elements.zoomRange.value);
    state.scale = value;
    elements.zoomLabel.textContent = `${Math.round(value * 100)}%`;
    drawCanvas();
}

function drawCanvas() {
    const canvas = elements.spriteCanvas;
    const image = state.currentImage;
    if (!image) {
        canvas.width = 1;
        canvas.height = 1;
        canvas.style.width = `${state.scale}px`;
        canvas.style.height = `${state.scale}px`;
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    if (canvas.width !== image.naturalWidth || canvas.height !== image.naturalHeight) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
    }
    canvas.style.width = `${canvas.width * state.scale}px`;
    canvas.style.height = `${canvas.height * state.scale}px`;

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
    canvasCtx.drawImage(image, 0, 0);

    drawExistingRects();
    drawNewRects();
    drawTempRect();
}

function drawExistingRects() {
    const rects = getActiveRects();
    if (!rects.length) {
        return;
    }
    const offsets = getActiveOffsets();
    rects.forEach((rect, index) => {
        if (!rect) return;
        const isSelected = index === state.selectedRectIndex;
        canvasCtx.save();
        canvasCtx.lineWidth = isSelected ? 3 : 2;
        canvasCtx.strokeStyle = isSelected ? "#38bdf8" : "rgba(248,113,113,0.9)";
        canvasCtx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w, rect.h);
        canvasCtx.restore();

        if (state.showNumbers) {
            drawNumberBadge(index + 1, rect);
        }
        if (state.showOffsets && offsets[index]) {
            drawOffsetMarker(rect.x + offsets[index].x, rect.y + offsets[index].y, isSelected);
        }
    });
}

function drawNumberBadge(number, rect) {
    const text = String(number);
    canvasCtx.save();
    canvasCtx.font = "bold 16px 'Inter', sans-serif";
    canvasCtx.textBaseline = "top";
    const paddingX = 4;
    const paddingY = 2;
    const metrics = canvasCtx.measureText(text);
    const width = Math.ceil(metrics.width) + paddingX * 2;
    const height = 18 + paddingY * 2;
    const x = rect.x + 2;
    const y = rect.y + 2;

    canvasCtx.fillStyle = "rgba(15, 23, 42, 0.75)";
    canvasCtx.fillRect(x, y, width, height);
    canvasCtx.strokeStyle = "rgba(56, 189, 248, 0.9)";
    canvasCtx.lineWidth = 1;
    canvasCtx.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
    canvasCtx.fillStyle = "#e2e8f0";
    canvasCtx.fillText(text, x + paddingX, y + paddingY);
    canvasCtx.restore();
}

function drawOffsetMarker(x, y, emphasize) {
    const size = 6;
    canvasCtx.save();
    canvasCtx.strokeStyle = emphasize ? "#0ea5e9" : "rgba(56, 189, 248, 0.8)";
    canvasCtx.lineWidth = emphasize ? 2 : 1.5;
    canvasCtx.beginPath();
    canvasCtx.moveTo(x - size, y);
    canvasCtx.lineTo(x + size, y);
    canvasCtx.moveTo(x, y - size);
    canvasCtx.lineTo(x, y + size);
    canvasCtx.stroke();
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, emphasize ? 3 : 2.5, 0, Math.PI * 2);
    canvasCtx.fillStyle = emphasize ? "#0ea5e9" : "rgba(56, 189, 248, 0.8)";
    canvasCtx.fill();
    canvasCtx.restore();
}

function drawNewRects() {
    if (!state.newRects.length) {
        return;
    }
    state.newRects.forEach((rect, index) => {
        const isSelected = index === state.newRectSelectedIndex;
        canvasCtx.save();
        canvasCtx.lineWidth = isSelected ? 3 : 2;
        canvasCtx.strokeStyle = isSelected ? "rgba(52, 211, 153, 0.95)" : "rgba(74, 222, 128, 0.75)";
        canvasCtx.setLineDash(isSelected ? [] : [6, 4]);
        canvasCtx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w, rect.h);
        canvasCtx.restore();
        if (rect.offset) {
            drawOffsetMarker(rect.x + rect.offset.x, rect.y + rect.offset.y, true);
        }
    });
}

function drawTempRect() {
    if (!state.tempRect) {
        return;
    }
    const rect = state.tempRect;
    canvasCtx.save();
    canvasCtx.strokeStyle = "rgba(251, 191, 36, 0.9)";
    canvasCtx.setLineDash([8, 4]);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w, rect.h);
    canvasCtx.restore();
}
function onCanvasMouseDown(event) {
    const point = getCanvasPoint(event);
    if (!point) return;

    if (state.drawMode) {
        state.dragStart = point;
        state.tempRect = { x: point.x, y: point.y, w: 0, h: 0 };
        drawCanvas();
        return;
    }

    const rectIndex = findRectIndexAtPoint(point);
    if (rectIndex !== null) {
        setSelectedRect(rectIndex);
    } else {
        state.selectedRectIndex = null;
        updateSelectedRectLabel();
        renderRectTable();
        drawCanvas();
    }
}

function onCanvasMouseMove(event) {
    const point = getCanvasPoint(event);
    if (!point) {
        elements.cursorPosition.textContent = "Cursor: —";
        return;
    }
    elements.cursorPosition.textContent = `Cursor: ${point.x}, ${point.y}`;

    if (state.drawMode && state.dragStart) {
        const rect = buildRectFromPoints(state.dragStart, point);
        state.tempRect = rect;
        populateNewRectInputs(rect);
        drawCanvas();
    }
}

function onCanvasMouseUp(event) {
    if (!state.drawMode || !state.dragStart) {
        return;
    }
    const point = getCanvasPoint(event);
    if (point) {
        const rect = buildRectFromPoints(state.dragStart, point);
        if (rect.w > 0 && rect.h > 0) {
            addNewRect(rect);
        }
    }
    state.dragStart = null;
    state.tempRect = null;
    drawCanvas();
}

function getCanvasPoint(event) {
    const rect = elements.spriteCanvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        return null;
    }
    const scaleX = elements.spriteCanvas.width / rect.width;
    const scaleY = elements.spriteCanvas.height / rect.height;
    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);
    return { x, y };
}

function findRectIndexAtPoint(point) {
    const rects = getActiveRects();
    if (!rects.length) {
        return null;
    }
    for (let i = 0; i < rects.length; i++) {
        const rect = rects[i];
        if (
            point.x >= rect.x &&
            point.x <= rect.x + rect.w &&
            point.y >= rect.y &&
            point.y <= rect.y + rect.h
        ) {
            return i;
        }
    }
    return null;
}

function setSelectedRect(index) {
    state.selectedRectIndex = index;
    renderRectTable();
    drawCanvas();
    updateSelectedRectLabel();
}

function renderRectTable() {
    const tbody = elements.rectTable.querySelector("tbody");
    tbody.innerHTML = "";
    const rects = getActiveRects();
    if (!state.currentAsset || rects.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 8;
        cell.textContent = "No rect data available.";
        cell.style.textAlign = "center";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }
    const offsets = getActiveOffsets();
    rects.forEach((rect, index) => {
        const row = document.createElement("tr");
        row.dataset.index = String(index);
        if (index === state.selectedRectIndex) {
            row.classList.add("is-selected");
        }
        const offset = offsets && offsets[index] ? offsets[index] : null;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${rect.x}</td>
            <td>${rect.y}</td>
            <td>${rect.w}</td>
            <td>${rect.h}</td>
            <td>${offset ? offset.x : "—"}</td>
            <td>${offset ? offset.y : "—"}</td>
            <td></td>
        `;
        const actionCell = row.querySelector("td:last-child");
        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.className = "secondary";
        addButton.textContent = "Add to animation";
        addButton.addEventListener("click", (event) => {
            event.stopPropagation();
            addAnimationFrame(index, "existing");
        });
        actionCell.appendChild(addButton);
        row.addEventListener("click", () => setSelectedRect(index));
        tbody.appendChild(row);
    });
}

function buildRectFromPoints(a, b) {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const w = Math.abs(a.x - b.x);
    const h = Math.abs(a.y - b.y);
    return { x, y, w, h };
}

function populateNewRectInputs(rect) {
    if (!rect) {
        elements.newRectX.value = "";
        elements.newRectY.value = "";
        elements.newRectW.value = "";
        elements.newRectH.value = "";
        elements.newOffsetX.value = 0;
        elements.newOffsetY.value = 0;
        return;
    }
    elements.newRectX.value = rect.x ?? "";
    elements.newRectY.value = rect.y ?? "";
    elements.newRectW.value = rect.w ?? "";
    elements.newRectH.value = rect.h ?? "";
    elements.newOffsetX.value = rect.offset ? rect.offset.x : 0;
    elements.newOffsetY.value = rect.offset ? rect.offset.y : 0;
}

function addRectFromInputs() {
    const rect = getRectInputs();
    if (!rect) {
        return;
    }
    addNewRect(rect);
    state.newRectSelectedIndex = state.newRects.length - 1;
    renderNewRectTable();
    drawCanvas();
    updateOutputPreview();
}

function getRectInputs() {
    const x = Number(elements.newRectX.value);
    const y = Number(elements.newRectY.value);
    const w = Number(elements.newRectW.value);
    const h = Number(elements.newRectH.value);
    const offsetX = Number(elements.newOffsetX.value || 0);
    const offsetY = Number(elements.newOffsetY.value || 0);
    if ([x, y, w, h].some((value) => Number.isNaN(value))) {
        alert("Rect values must be valid numbers.");
        return null;
    }
    if (w <= 0 || h <= 0) {
        alert("Width and height must be positive.");
        return null;
    }
    return { x, y, w, h, offset: { x: offsetX, y: offsetY } };
}

function addNewRect(rect) {
    state.newRects.push({ ...rect, offset: rect.offset || { x: 0, y: 0 } });
    state.newRectSelectedIndex = state.newRects.length - 1;
    renderNewRectTable();
    updateOutputPreview();
}

function handleParsePastedValues() {
    if (!elements.rectPasteTextarea) {
        return;
    }
    const rectText = elements.rectPasteTextarea.value || "";
    const offsetText = elements.offsetPasteTextarea ? elements.offsetPasteTextarea.value || "" : "";
    if (!rectText.trim()) {
        alert("Paste rect values to parse.");
        return;
    }
    const rects = parseRectText(rectText);
    if (!rects) {
        return;
    }
    const offsets = parseOffsetText(offsetText, rects.length);
    if (!offsets) {
        return;
    }
    state.newRects = rects.map((rect, index) => ({ ...rect, offset: offsets[index] }));
    if (state.newRects.length) {
        state.newRectSelectedIndex = 0;
        populateNewRectInputs(state.newRects[0]);
    } else {
        state.newRectSelectedIndex = null;
        populateNewRectInputs(null);
    }
    pruneNewAnimationFrames();
    renderNewRectTable();
    drawCanvas();
    updateOutputPreview();
}

function parseRectText(text) {
    const numbers = extractNumbers(text);
    if (!numbers.length) {
        alert("No rect values found to parse.");
        return null;
    }
    if (numbers.length % 4 !== 0) {
        alert("Rect values must be provided in groups of four (x, y, width, height).");
        return null;
    }
    const rects = [];
    for (let i = 0; i < numbers.length; i += 4) {
        const x = numbers[i];
        const y = numbers[i + 1];
        const w = numbers[i + 2];
        const h = numbers[i + 3];
        if ([x, y, w, h].some((value) => Number.isNaN(value))) {
            alert(`Rect #${rects.length + 1} includes an invalid number.`);
            return null;
        }
        if (w <= 0 || h <= 0) {
            alert(`Rect #${rects.length + 1} must have positive width and height.`);
            return null;
        }
        rects.push({ x, y, w, h });
    }
    return rects;
}

function parseOffsetText(text, rectCount) {
    const numbers = extractNumbers(text);
    if (!numbers.length) {
        return createZeroOffsets(rectCount);
    }
    if (numbers.length % 2 !== 0) {
        alert("Offset values must be provided in pairs (x, y).");
        return null;
    }
    const pairCount = numbers.length / 2;
    if (pairCount !== rectCount) {
        alert(`Expected ${rectCount} offset pairs but found ${pairCount}.`);
        return null;
    }
    const offsets = [];
    for (let i = 0; i < numbers.length; i += 2) {
        offsets.push({ x: numbers[i], y: numbers[i + 1] });
    }
    return offsets;
}

function extractNumbers(input) {
    if (!input) {
        return [];
    }
    const matches = String(input).match(/-?\d+(?:\.\d+)?/g);
    if (!matches) {
        return [];
    }
    return matches
        .map((value) => Number(value))
        .filter((value) => !Number.isNaN(value));
}

function createZeroOffsets(count) {
    return Array.from({ length: count }, () => ({ x: 0, y: 0 }));
}

function renderNewRectTable() {
    const tbody = elements.newRectTable.querySelector("tbody");
    tbody.innerHTML = "";
    if (state.newRects.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 8;
        cell.style.textAlign = "center";
        cell.textContent = "No rects defined yet.";
        row.appendChild(cell);
        tbody.appendChild(row);
        elements.updateRectButton.disabled = true;
        return;
    }
    state.newRects.forEach((rect, index) => {
        const row = document.createElement("tr");
        row.dataset.index = String(index);
        if (index === state.newRectSelectedIndex) {
            row.classList.add("is-selected");
        }
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${rect.x}</td>
            <td>${rect.y}</td>
            <td>${rect.w}</td>
            <td>${rect.h}</td>
            <td>${rect.offset ? rect.offset.x : 0}</td>
            <td>${rect.offset ? rect.offset.y : 0}</td>
            <td></td>
        `;
        const actionCell = row.querySelector("td:last-child");
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "secondary";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", (event) => {
            event.stopPropagation();
            selectNewRect(index);
        });
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "secondary";
        deleteButton.textContent = "Remove";
        deleteButton.addEventListener("click", (event) => {
            event.stopPropagation();
            removeNewRect(index);
        });
        const animateButton = document.createElement("button");
        animateButton.type = "button";
        animateButton.className = "secondary";
        animateButton.textContent = "Add to animation";
        animateButton.addEventListener("click", (event) => {
            event.stopPropagation();
            addAnimationFrame(index, "new");
        });
        const controls = document.createElement("div");
        controls.className = "button-row";
        controls.append(animateButton, editButton, deleteButton);
        actionCell.appendChild(controls);
        row.addEventListener("click", () => selectNewRect(index));
        tbody.appendChild(row);
    });
    elements.updateRectButton.disabled = state.newRectSelectedIndex === null;
}

function selectNewRect(index) {
    state.newRectSelectedIndex = index;
    const rect = state.newRects[index];
    populateNewRectInputs(rect);
    elements.updateRectButton.disabled = false;
    renderNewRectTable();
    drawCanvas();
}

function updateSelectedNewRect() {
    if (state.newRectSelectedIndex === null) {
        return;
    }
    const rect = getRectInputs();
    if (!rect) {
        return;
    }
    state.newRects[state.newRectSelectedIndex] = { ...rect, offset: rect.offset };
    renderNewRectTable();
    drawCanvas();
    updateOutputPreview();
}

function removeNewRect(index) {
    state.newRects.splice(index, 1);
    if (state.newRectSelectedIndex === index) {
        state.newRectSelectedIndex = null;
        populateNewRectInputs(null);
    } else if (state.newRectSelectedIndex !== null && state.newRectSelectedIndex > index) {
        state.newRectSelectedIndex--;
    }
    if (state.animationFrames.length) {
        for (let i = state.animationFrames.length - 1; i >= 0; i--) {
            const frame = state.animationFrames[i];
            if (frame.source === "new") {
                if (frame.rectIndex === index) {
                    state.animationFrames.splice(i, 1);
                    if (state.animationPlaying && i <= state.animationFrameIndex && state.animationFrameIndex > 0) {
                        state.animationFrameIndex--;
                    }
                } else if (frame.rectIndex > index) {
                    frame.rectIndex -= 1;
                }
            }
        }
        if (state.animationFrameIndex >= state.animationFrames.length) {
            state.animationFrameIndex = Math.max(0, state.animationFrames.length - 1);
        }
    }
    renderNewRectTable();
    renderAnimationTable();
    drawCanvas();
    updateOutputPreview();
}

function pruneNewAnimationFrames() {
    if (!state.animationFrames.length) {
        return false;
    }
    const filtered = state.animationFrames.filter((frame) => frame.source !== "new");
    if (filtered.length === state.animationFrames.length) {
        return false;
    }
    state.animationFrames = filtered;
    if (state.animationPlaying && filtered.length === 0) {
        stopAnimation();
        return true;
    }
    if (state.animationFrameIndex >= filtered.length) {
        state.animationFrameIndex = Math.max(0, filtered.length - 1);
    }
    renderAnimationTable();
    return true;
}
function updateOutputPreview() {
    const rectArray = generateRectArrayString();
    const offsetArray = generateOffsetArrayString();
    const json = generateJsonString();
    const preview = [
        "Rect values:",
        rectArray || "(none)",
        "\nOffset values:",
        offsetArray || "(none)",
        "\nJSON:",
        json || "{}",
    ].join("\n");
    elements.outputTextarea.value = preview;
}

function generateRectArrayString() {
    if (!state.newRects.length) return "";
    const values = [];
    state.newRects.forEach((rect) => {
        values.push(rect.x, rect.y, rect.w, rect.h);
    });
    return values.join(", ");
}

function generateOffsetArrayString() {
    if (!state.newRects.length) return "";
    const values = [];
    state.newRects.forEach((rect) => {
        const offset = rect.offset || { x: 0, y: 0 };
        values.push(offset.x, offset.y);
    });
    return values.join(", ");
}

function generateJsonString() {
    if (!state.newRects.length) return "";
    const payload = {
        rects: state.newRects.map((rect) => ({ x: rect.x, y: rect.y, w: rect.w, h: rect.h })),
        offsets: state.newRects.map((rect) => ({ x: rect.offset?.x || 0, y: rect.offset?.y || 0 })),
    };
    return JSON.stringify(payload, null, 2);
}

async function handleCopy(text) {
    if (!text) {
        return;
    }
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const helper = document.createElement("textarea");
            helper.value = text;
            helper.style.position = "fixed";
            helper.style.top = "-1000px";
            document.body.appendChild(helper);
            helper.focus();
            helper.select();
            document.execCommand("copy");
            document.body.removeChild(helper);
        }
    } catch (error) {
        console.warn("Copy failed", error);
    }
}

function addAnimationFrame(rectIndex, source = "existing") {
    if (typeof rectIndex !== "number" || rectIndex < 0) {
        return;
    }
    if (source === "existing" && !getActiveRect(rectIndex)) {
        return;
    }
    if (source === "new" && !state.newRects[rectIndex]) {
        return;
    }
    state.animationFrames.push({ rectIndex, source, duration: 120 });
    renderAnimationTable();
}

function renderAnimationTable() {
    const tbody = elements.animationTable.querySelector("tbody");
    tbody.innerHTML = "";
    if (state.animationFrames.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.style.textAlign = "center";
        cell.textContent = "No frames queued.";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }
    state.animationFrames.forEach((frame, index) => {
        const row = document.createElement("tr");
        row.dataset.index = String(index);
        if (state.animationPlaying && index === state.animationFrameIndex) {
            row.classList.add("is-playing");
        }
        let rectLabel = `#${frame.rectIndex + 1}`;
        if (frame.source === "new") {
            rectLabel = state.newRects[frame.rectIndex] ? `New #${frame.rectIndex + 1}` : "Missing new rect";
        } else if (!getActiveRect(frame.rectIndex)) {
            rectLabel = "Missing rect";
        } else {
            rectLabel = `Rect #${frame.rectIndex + 1}`;
        }
        const durationInput = document.createElement("input");
        durationInput.type = "number";
        durationInput.min = "16";
        durationInput.value = frame.duration;
        durationInput.addEventListener("change", () => {
            frame.duration = Math.max(16, Number(durationInput.value) || 120);
        });
        const controls = document.createElement("div");
        controls.className = "button-row";
        const upButton = document.createElement("button");
        upButton.type = "button";
        upButton.className = "secondary";
        upButton.textContent = "▲";
        upButton.addEventListener("click", (event) => {
            event.stopPropagation();
            moveAnimationFrame(index, -1);
        });
        const downButton = document.createElement("button");
        downButton.type = "button";
        downButton.className = "secondary";
        downButton.textContent = "▼";
        downButton.addEventListener("click", (event) => {
            event.stopPropagation();
            moveAnimationFrame(index, 1);
        });
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "secondary";
        removeButton.textContent = "✕";
        removeButton.addEventListener("click", (event) => {
            event.stopPropagation();
            removeAnimationFrame(index);
        });
        controls.append(upButton, downButton, removeButton);

        const cells = [
            createCell(index + 1, "center"),
            createCell(rectLabel, "center"),
            createCell(durationInput),
            createCell(controls),
        ];
        cells.forEach((cell) => row.appendChild(cell));
        tbody.appendChild(row);
    });
}

function createCell(content, align = "right") {
    const cell = document.createElement("td");
    cell.style.textAlign = align;
    if (content instanceof HTMLElement) {
        cell.appendChild(content);
    } else {
        cell.textContent = content;
    }
    return cell;
}

function moveAnimationFrame(index, delta) {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= state.animationFrames.length) {
        return;
    }
    const [frame] = state.animationFrames.splice(index, 1);
    state.animationFrames.splice(newIndex, 0, frame);
    renderAnimationTable();
}

function removeAnimationFrame(index) {
    state.animationFrames.splice(index, 1);
    if (state.animationPlaying && index <= state.animationFrameIndex && state.animationFrameIndex > 0) {
        state.animationFrameIndex--;
    }
    renderAnimationTable();
}

function startAnimation() {
    if (!state.currentImage || state.animationFrames.length === 0) {
        return;
    }
    state.animationLoop = elements.animationLoopToggle.checked;
    state.animationPlaying = true;
    state.animationFrameIndex = 0;
    state.animationFrameStart = 0;
    fillAnimationBackground();
    if (state.animationRequestId) {
        cancelAnimationFrame(state.animationRequestId);
    }
    state.animationRequestId = requestAnimationFrame(stepAnimation);
    renderAnimationTable();
}

function stopAnimation() {
    if (state.animationRequestId) {
        cancelAnimationFrame(state.animationRequestId);
        state.animationRequestId = null;
    }
    state.animationPlaying = false;
    state.animationFrameIndex = 0;
    state.animationFrameStart = 0;
    renderAnimationTable();
    fillAnimationBackground();
}

function stepAnimation(timestamp) {
    if (!state.animationPlaying) {
        return;
    }
    if (!state.currentImage) {
        stopAnimation();
        return;
    }
    const frames = state.animationFrames;
    if (frames.length === 0) {
        stopAnimation();
        return;
    }
    const frame = frames[state.animationFrameIndex];
    let rect = null;
    let offsets = null;
    if (frame.source === "new") {
        const newRect = state.newRects[frame.rectIndex];
        if (newRect) {
            rect = newRect;
            offsets = newRect.offset || null;
        }
    } else {
        rect = getActiveRect(frame.rectIndex);
        offsets = getActiveOffset(frame.rectIndex);
    }
    if (!rect) {
        advanceAnimationFrame(timestamp);
        state.animationRequestId = requestAnimationFrame(stepAnimation);
        return;
    }
    if (!state.animationFrameStart) {
        state.animationFrameStart = timestamp;
    }
    drawAnimationFrame(rect, offsets);
    const elapsed = timestamp - state.animationFrameStart;
    const duration = Math.max(16, Number(frame.duration) || 120);
    if (elapsed >= duration) {
        advanceAnimationFrame(timestamp);
    }
    state.animationRequestId = requestAnimationFrame(stepAnimation);
}

function advanceAnimationFrame(timestamp) {
    state.animationFrameStart = timestamp;
    state.animationFrameIndex++;
    if (state.animationFrameIndex >= state.animationFrames.length) {
        if (state.animationLoop) {
            state.animationFrameIndex = 0;
        } else {
            stopAnimation();
            return;
        }
    }
    renderAnimationTable();
}
function drawAnimationFrame(rect, offsets) {
    const canvas = elements.animationCanvas;
    if (canvas.width !== rect.w || canvas.height !== rect.h) {
        canvas.width = rect.w || 1;
        canvas.height = rect.h || 1;
    }
    fillAnimationBackground();
    animationCtx.drawImage(
        state.currentImage,
        rect.x,
        rect.y,
        rect.w,
        rect.h,
        0,
        0,
        rect.w,
        rect.h
    );
    if (offsets) {
        animationCtx.save();
        animationCtx.strokeStyle = "rgba(14, 165, 233, 0.9)";
        animationCtx.lineWidth = 1.5;
        const pivotX = offsets.x;
        const pivotY = offsets.y;
        animationCtx.beginPath();
        animationCtx.moveTo(pivotX - 6, pivotY);
        animationCtx.lineTo(pivotX + 6, pivotY);
        animationCtx.moveTo(pivotX, pivotY - 6);
        animationCtx.lineTo(pivotX, pivotY + 6);
        animationCtx.stroke();
        animationCtx.beginPath();
        animationCtx.arc(pivotX, pivotY, 2.5, 0, Math.PI * 2);
        animationCtx.fillStyle = "rgba(14, 165, 233, 0.9)";
        animationCtx.fill();
        animationCtx.restore();
    }
}

function fillAnimationBackground() {
    const color = elements.animationBg.value || "#000";
    animationCtx.fillStyle = color;
    animationCtx.fillRect(0, 0, elements.animationCanvas.width, elements.animationCanvas.height);
}



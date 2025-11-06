type RGBAColor = import("@/core/RGBAColor").default;

type TimelineElement = {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    color: RGBAColor;
};

type TimelineKeyFrameListener = (
    timeline: TimelineLike,
    trackType: number,
    keyFrameIndex: number
) => void;

type TimelineLike = {
    time: number;
    timelineDirReverse: boolean;
    element: TimelineElement | null;
    onKeyFrame: TimelineKeyFrameListener | null;
};

export type { TimelineElement, TimelineLike, TimelineKeyFrameListener };

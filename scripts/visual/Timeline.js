define("visual/Timeline", [
    "utils/Class",
    "visual/TimelineTrack",
    "visual/TrackType",
    "utils/Constants",
], function (Class, TimelineTrack, TrackType, Constants) {
    var Timeline = Class.extend({
        init: function () {
            this.time = 0;
            this.length = 0;
            this.loopsLimit = Constants.UNDEFINED;
            this.state = Timeline.StateType.STOPPED;
            this.loopType = Timeline.LoopType.NO_LOOP;
            this.tracks = [];

            // callback fired when the timeline finishes playing
            this.onFinished = null;

            // callback fired when the timeline reaches a key frame
            this.onKeyFrame = null;

            this.timelineDirReverse = false;

            this.element = null;
        },
        addKeyFrame: function (keyFrame) {
            var track = this.tracks[keyFrame.trackType],
                index = track == null ? 0 : track.keyFrames.length;
            this.setKeyFrame(keyFrame, index);
        },
        setKeyFrame: function (keyFrame, index) {
            var track = this.tracks[keyFrame.trackType];
            if (!track) {
                this.tracks[keyFrame.trackType] = track = new TimelineTrack(
                    this,
                    keyFrame.trackType
                );
            }
            track.setKeyFrame(keyFrame, index);
        },
        getTrack: function (index) {
            return this.tracks[index];
        },
        play: function () {
            if (this.state !== Timeline.StateType.PAUSED) {
                this.time = 0;
                this.timelineDirReverse = false;
                this.length = 0;

                for (var i = 0, len = this.tracks.length; i < len; i++) {
                    var track = this.tracks[i];
                    if (track) {
                        track.updateRange();
                        if (track.endTime > this.length) {
                            this.length = track.endTime;
                        }
                    }
                }
                this.update(0);
            }
            this.state = Timeline.StateType.PLAYING;
        },
        pause: function () {
            this.state = Timeline.StateType.PAUSED;
        },
        jumpToTrack: function (trackIndex, keyFrame) {
            if (this.state === Timeline.StateType.STOPPED) {
                this.state = Timeline.StateType.PAUSED;
            }
            var delta = this.tracks[trackIndex].getFrameTime(keyFrame) - this.time;
            this.update(delta);
        },
        stop: function () {
            this.state = Timeline.StateType.STOPPED;
            this.deactivateTracks();
        },
        deactivateTracks: function () {
            for (var i = 0, len = this.tracks.length; i < len; i++) {
                var track = this.tracks[i];
                if (track) {
                    track.deactivate();
                }
            }
        },
        update: function (delta) {
            if (this.state !== Timeline.StateType.PLAYING) return;

            if (!this.timelineDirReverse) this.time += delta;
            else this.time -= delta;

            for (var i = 0, len = this.tracks.length; i < len; i++) {
                var track = this.tracks[i];
                if (track != null) {
                    if (track.type === TrackType.ACTION) track.updateActionTrack(delta);
                    else track.updateNonActionTrack(delta);
                }
            }

            if (this.loopType === Timeline.LoopType.PING_PONG) {
                var reachedEnd =
                    this.timelineDirReverse === false &&
                    this.time >= this.length - Constants.FLOAT_PRECISION;
                if (reachedEnd) {
                    this.time = Math.max(0, this.length - (this.time - this.length));
                    this.timelineDirReverse = true;
                } else {
                    var reachedStart =
                        this.timelineDirReverse && this.time <= Constants.FLOAT_PRECISION;
                    if (reachedStart) {
                        if (this.loopsLimit > 0) {
                            this.loopsLimit--;
                            if (this.loopsLimit === 0) {
                                this.stop();
                                if (this.onFinished) {
                                    this.onFinished(this);
                                }
                            }
                        }

                        this.time = Math.min(-this.time, this.length);
                        this.timelineDirReverse = false;
                    }
                }
            } else if (this.loopType === Timeline.LoopType.REPLAY) {
                if (this.time >= this.length - Constants.FLOAT_PRECISION) {
                    if (this.loopsLimit > 0) {
                        this.loopsLimit--;
                        if (this.loopsLimit === 0) {
                            this.stop();
                            if (this.onFinished) {
                                this.onFinished(this);
                            }
                        }
                    }

                    this.time = Math.min(this.time - this.length, this.length);
                }
            } else if (this.loopType === Timeline.LoopType.NO_LOOP) {
                if (this.time >= this.length - Constants.FLOAT_PRECISION) {
                    this.stop();
                    if (this.onFinished) {
                        this.onFinished(this);
                    }
                }
            }
        },
    });

    /**
     * @enum {number}
     */
    Timeline.LoopType = {
        NO_LOOP: 0,
        REPLAY: 1,
        PING_PONG: 2,
    };

    /**
     * @enum {number}
     */
    Timeline.StateType = {
        STOPPED: 0,
        PLAYING: 1,
        PAUSED: 2,
    };

    return Timeline;
});

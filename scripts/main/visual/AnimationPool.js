import BaseElement from "visual/BaseElement";
/**
 * Container to hold animated objects which can be automatically deleted
 * once their animation timelines have completed
 */
const AnimationPool = BaseElement.extend({
    init: function () {
        this._super();

        // keeps track of child elements whose timeline has completed
        // and can be removed
        this.removeList = [];
    },
    update: function (delta) {
        // remove the children
        for (let i = 0, len = this.removeList.length; i < len; i++) {
            this.removeChild(this.removeList[i]);
        }

        // clear the remove list
        this.removeList.length = 0;
        this._super(delta);
    },
    /**
     * @param timeline {Timeline}
     */
    timelineFinished: function (timeline) {
        this.removeList.push(timeline.element);
    },
    /**
     * Returns a delegate that can be invoked when a timeline finishes
     */
    timelineFinishedDelegate: function () {
        // save a reference to ourselves since we may be called in a
        // different context (typically by another class)
        const self = this;
        return function (timeline) {
            self.timelineFinished(timeline);
        };
    },
    /**
     * @param particles {Particles}
     */
    particlesFinished: function (particles) {
        this.removeList.push(particles);
    },
    /**
     * Returns a delegate that can be invoked when a particle system finishes
     */
    particlesFinishedDelegate: function () {
        // save a reference to ourselves since we may be called in a
        // different context (typically by another class)
        const self = this;
        return function (particles) {
            self.particlesFinished(particles);
        };
    },
});

export default AnimationPool;

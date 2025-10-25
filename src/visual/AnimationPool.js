import BaseElement from "@/visual/BaseElement";

/**
 * Container to hold animated objects which can be automatically deleted
 * once their animation timelines have completed
 */
class AnimationPool extends BaseElement {
    constructor() {
        super();

        // keeps track of child elements whose timeline has completed
        // and can be removed
        this.removeList = [];
    }

    update(delta) {
        // remove the children
        for (let i = 0, len = this.removeList.length; i < len; i++) {
            this.removeChild(this.removeList[i]);
        }

        // clear the remove list
        this.removeList.length = 0;
        super.update(delta);
    }

    /**
     * @param timeline {Timeline}
     */
    timelineFinished(timeline) {
        this.removeList.push(timeline.element);
    }

    /**
     * Returns a delegate that can be invoked when a timeline finishes
     */
    timelineFinishedDelegate() {
        // save a reference to ourselves since we may be called in a
        // different context (typically by another class)
        return (timeline) => {
            this.timelineFinished(timeline);
        };
    }

    /**
     * @param particles {Particles}
     */
    particlesFinished(particles) {
        this.removeList.push(particles);
    }

    /**
     * Returns a delegate that can be invoked when a particle system finishes
     */
    particlesFinishedDelegate() {
        // save a reference to ourselves since we may be called in a
        // different context (typically by another class)
        return (particles) => {
            this.particlesFinished(particles);
        };
    }
}

export default AnimationPool;

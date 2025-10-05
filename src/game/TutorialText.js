import TextImage from "@/visual/TextImage";
const TutorialText = TextImage.extend({
    init: function () {
        this._super();
        this.special = 0;
    },
});

export default TutorialText;

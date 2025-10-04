define("ui/MoreComingBox", ["ui/Box"], function (Box) {
    var MoreComingBox = Box.extend({
        init: function (boxIndex, bgimg, reqstars, islocked, type) {
            this._super(boxIndex, bgimg, reqstars, islocked, type);
            this.includeBoxNumberInTitle = false;
        },

        isRequired: function () {
            // not a box required for game completion
            return false;
        },

        isGameBox: function () {
            return false;
        },

        isClickable: function () {
            return false;
        },
    });

    return MoreComingBox;
});

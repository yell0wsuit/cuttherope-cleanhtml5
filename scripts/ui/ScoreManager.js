define("ui/ScoreManager", [
    "ui/QueryStrings",
    "utils/PubSub",
    "utils/MathHelper",
    "core/SettingStorage",
    "edition",
    "visual/Text",
    "resources/Lang",
    "resources/LangId",
    "resources/MenuStringId",
    "game/RoamSettings",
], function (
    QueryStrings,
    PubSub,
    MathHelper,
    SettingStorage,
    edition,
    Text,
    Lang,
    LangId,
    MenuStringId,
    RoamSettings
) {
    // we use XOR to obfuscate the level scores to discourage cheats. Doesn't
    // prevent hacks - server side code would be necessary for that.

    // make the prefixes hard to find in source code
    var SCORE_PREFIX = String.fromCharCode(98, 112), // 'bp' (short for box-points)
        STARS_PREFIX = String.fromCharCode(98, 115), // 'bs' (short for box-stars)
        // our XOR value is a random number that is stored in an entry that is
        // intended to look similar to the score record for a box
        XOR_KEY = SCORE_PREFIX + String.fromCharCode(50, 51, 57, 48),
        XOR_VALUE = SettingStorage.getIntOrDefault(XOR_KEY, null);

    // create the random value if it doesn't exist
    if (XOR_VALUE == null) {
        XOR_VALUE = MathHelper.randomRange(1000, 10000);
        SettingStorage.set(XOR_KEY, XOR_VALUE);
    }

    // helper functions to get/set score
    var getScoreKey = function (box, level) {
            var val = (box * 1000 + level) ^ XOR_VALUE,
                key = SCORE_PREFIX + val;

            // make sure we don't overwrite our XOR key
            if (key === XOR_KEY) {
                return key + "_";
            }

            return key;
        },
        setScore = function (box, level, points) {
            SettingStorage.set(
                getScoreKey(box, level),
                // NOTE: we intentionally swap multiplier to level (key uses box)
                (points + level * 1000 + box) ^ XOR_VALUE
            );

            RoamSettings.setScore(box, level, points);
        },
        getScore = function (box, level) {
            // fetch both roaming and local scores
            var roamScore = RoamSettings.getScore(box, level) || 0,
                localKey = getScoreKey(box, level),
                localVal = SettingStorage.getIntOrDefault(localKey, null),
                localScore = localVal == null ? 0 : (localVal ^ XOR_VALUE) - box - level * 1000;

            return Math.max(roamScore, localScore);
        };

    // helper functions to get/set stars
    var STARS_UNKNOWN = -1, // needs to be a number but can't be null
        getStarsKey = function (box, level) {
            // NOTE: we intentionally swap multiplier from whats used for points
            var key = (level * 1000 + box) ^ XOR_VALUE;
            return STARS_PREFIX + key;
        },
        setStars = function (box, level, stars) {
            var localStars = stars == null ? STARS_UNKNOWN : stars;
            SettingStorage.set(
                getStarsKey(box, level),
                // NOTE: we intentionally swap multiplier to box (key uses level)
                (localStars + box * 1000 + level) ^ XOR_VALUE
            );

            RoamSettings.setStars(box, level, stars);
        },
        getStars = function (box, level) {
            var roamStars = RoamSettings.getStars(box, level),
                localKey = getStarsKey(box, level),
                localVal = SettingStorage.getIntOrDefault(localKey, null),
                localStars = localVal == null ? null : (localVal ^ XOR_VALUE) - level - box * 1000;

            if (localStars === STARS_UNKNOWN || localStars === null) {
                return roamStars;
            } else if (roamStars == null) {
                return localStars;
            }

            return Math.max(roamStars, localStars);
        };

    var resetLevel = function (boxIndex, levelIndex) {
        // first level gets 0 stars, otherwise null
        var stars = levelIndex === 0 ? 0 : null;

        setStars(boxIndex, levelIndex, stars);
        setScore(boxIndex, levelIndex, 0);
    };

    var ScoreBox = function (levelCount, requiredStars, scores, stars) {
        this.levelCount = levelCount;
        this.requiredStars = requiredStars;
        this.scores = scores || [];
        this.stars = stars || [];
    };

    var ScoreManager = new (function () {
        var boxes = [];

        this.load = function () {
            // clear existing boxes
            boxes.length = 0;

            // load box scores
            for (var i = 0, len = edition.boxes.length; i < len; i++) {
                boxes[i] = loadBox(i);
            }

            // update score text
            if (appReady) {
                ScoreManager.updateTotalScoreText();
            }
        };

        PubSub.subscribe(PubSub.ChannelId.SignIn, this.load);
        PubSub.subscribe(PubSub.ChannelId.SignOut, this.load);
        PubSub.subscribe(PubSub.ChannelId.RoamingDataChanged, this.load);

        // the score text can only be updated when the app is ready
        var appReady = false;
        PubSub.subscribe(PubSub.ChannelId.AppRun, function () {
            appReady = true;
        });

        // load previous scores from local storage
        var loadBox = function (boxIndex) {
            // see if the box exists by checking for a level 1 star record
            var boxExists = getStars(boxIndex, 0) !== null,
                levelCount = edition.boxes[boxIndex].levels.length,
                requiredStars = edition.unlockStars[boxIndex],
                scores = [],
                stars = [],
                levelIndex;

            // get (or create) scores and stars from each level
            for (levelIndex = 0; levelIndex < levelCount; levelIndex++) {
                // if the box doesn't exist
                if (!boxExists) {
                    resetLevel(boxIndex, levelIndex);
                }

                scores.push(getScore(boxIndex, levelIndex));
                stars.push(getStars(boxIndex, levelIndex));
            }

            // generate fake (and good) star counts
            if (QueryStrings.createScoresForBox == boxIndex + 1) {
                for (var i = 0; i < levelCount; i++) {
                    ScoreManager.setStars(boxIndex, i, 3, true);
                }
            }

            return new ScoreBox(levelCount, requiredStars, scores, stars);
        };

        this.getXorValue = function () {
            return XOR_VALUE;
        };

        this.boxCount = function () {
            if (boxes != null) return boxes.length;
            return null;
        };

        this.levelCount = function (boxIndex) {
            var box = boxes[boxIndex];
            if (box != null) return box.levelCount;
            return null;
        };

        this.requiredStars = function (boxIndex) {
            var box = boxes[boxIndex];
            if (box != null) return box.requiredStars;
            return 0;
        };

        this.achievedStars = function (boxIndex) {
            var box = boxes[boxIndex];
            if (box != null) {
                var count = 0;
                for (var j = 0; j < box.levelCount; j++) {
                    var stars = box.stars[j];
                    count += stars == null ? 0 : stars;
                }
                return count;
            }
            return 0;
        };

        this.totalStars = function () {
            var total = 0;
            for (var i = 0; i < boxes.length; i++) {
                total += ScoreManager.achievedStars(i);
            }
            return total;
        };

        this.possibleStarsForBox = function (boxIndex) {
            var box = boxes[boxIndex];
            if (box != null) {
                return box.levelCount * 3;
            }
            return 0;
        };

        this.isBoxLocked = function (boxIndex) {
            if (boxIndex == 0) return false;
            if (QueryStrings.unlockAllBoxes) return false;
            var box = boxes[boxIndex];
            if (box != null && ScoreManager.totalStars() >= ScoreManager.requiredStars(boxIndex)) {
                return false;
            }
            return true;
        };

        this.isLevelUnlocked = function (boxIndex, levelindex) {
            var box = boxes[boxIndex];
            if (QueryStrings.unlockAllBoxes) return true;
            if (box != null) {
                return box.stars[levelindex] != null;
            }
            return false;
        };

        this.setScore = function (boxIndex, levelIndex, levelScore, overridePrevious) {
            var box = boxes[boxIndex];
            if (box != null) {
                if (overridePrevious) {
                    box.scores[levelIndex] = levelScore;
                } else {
                    var prevScore = getScore(boxIndex, levelIndex);
                    box.scores[levelIndex] = Math.max(levelScore, prevScore);
                }

                setScore(boxIndex, levelIndex, box.scores[levelIndex]);

                // sum all scores for the box
                var numLevels = box.scores.length,
                    boxScore = 0,
                    i;
                for (i = 0; i < numLevels; i++) {
                    boxScore += box.scores[i];
                }

                // always report scores since we may have been offline when the
                // previous high score was achieved.
                PubSub.publish(PubSub.ChannelId.UpdateBoxScore, boxIndex, boxScore);
            }
        };

        this.getScore = function (boxIndex, levelIndex) {
            var box = boxes[boxIndex];
            if (box != null) return box.scores[levelIndex];
            return null;
        };

        this.setStars = function (boxIndex, levelIndex, score, overridePrevious) {
            var previousStars = this.totalStars(),
                box = boxes[boxIndex];
            if (box != null) {
                //don't override past high score
                var prevStars = getStars(boxIndex, levelIndex);
                if (prevStars != null && !overridePrevious) {
                    box.stars[levelIndex] = Math.max(score, prevStars);
                } else {
                    box.stars[levelIndex] = score;
                }
                setStars(boxIndex, levelIndex, box.stars[levelIndex]);
            }

            var newStarCount = this.totalStars();
            if (newStarCount !== previousStars) {
                PubSub.publish(PubSub.ChannelId.StarCountChanged, newStarCount);
            }
        };

        this.getStars = function (boxIndex, levelIndex) {
            var box = boxes[boxIndex];
            if (box != null) return box.stars[levelIndex];
            return null;
        };

        this.resetGame = function () {
            var boxCount = boxes.length,
                boxIndex,
                box,
                levelIndex,
                levelCount;

            for (boxIndex = 0; boxIndex < boxCount; boxIndex++) {
                box = boxes[boxIndex];
                levelCount = box.levelCount;
                for (levelIndex = 0; levelIndex < levelCount; levelIndex++) {
                    resetLevel(boxIndex, levelIndex);
                    box.stars[levelIndex] = getStars(boxIndex, levelIndex);
                    box.scores[levelIndex] = getScore(boxIndex, levelIndex);
                }
            }

            // update score
            this.updateTotalScoreText();
        };

        this.updateTotalScoreText = function () {
            var text = Lang.menuText(MenuStringId.TOTAL_STARS).replace(
                "%d",
                ScoreManager.totalStars()
            );
            Text.drawBig({ text: text, imgSel: "#boxScore img", scaleToUI: true });
        };

        PubSub.subscribe(PubSub.ChannelId.LanguageChanged, this.updateTotalScoreText);
    })();

    return ScoreManager;
});

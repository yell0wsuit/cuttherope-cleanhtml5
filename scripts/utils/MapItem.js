define("utils/MapItem", [], function () {
    /**
     * @enum {number}
     */
    var MapItem = {
        MAP: 0,
        GAME_DESIGN: 1,
        TARGET: 2,
        STAR: 3,
        TUTORIAL_TEXT: 4,
        TUTORIAL_01: 5,
        TUTORIAL_02: 6,
        TUTORIAL_03: 7,
        TUTORIAL_04: 8,
        TUTORIAL_05: 9,
        TUTORIAL_06: 10,
        TUTORIAL_07: 11,
        TUTORIAL_08: 12,
        TUTORIAL_09: 13,
        TUTORIAL_10: 14,
        TUTORIAL_11: 15,
        TUTORIAL_12: 16,
        TUTORIAL_13: 17,
        TUTORIAL_14: 18,
        // leave space for future tutorial elements
        // (which the game assumes are sequentially numbered)

        CANDY_L: 50,
        CANDY_R: 51,
        CANDY: 52,
        GRAVITY_SWITCH: 53,
        BUBBLE: 54,
        PUMP: 55,
        SOCK: 56,
        SPIKE_1: 57,
        SPIKE_2: 58,
        SPIKE_3: 59,
        SPIKE_4: 60,
        SPIKES_SWITCH: 61,
        // leave space for future spike elements

        ELECTRO: 80,
        BOUNCER1: 81,
        BOUNCER2: 82,
        // leave space for future bouncers

        GRAB: 100,
        HIDDEN_01: 101,
        HIDDEN_02: 102,
        HIDDEN_03: 103,
        // leave space for additional hidden

        ROTATED_CIRCLE: 120,
        TARGET_2: 121,
        CANDY_2: 122,
    };

    function getMapItem(name) {
        switch (name) {
            case "map":
                return MapItem.MAP;
            case "gameDesign":
                return MapItem.GAME_DESIGN;
            case "target":
                return MapItem.TARGET;
            case "target2":
                return MapItem.TARGET_2;
            case "star":
                return MapItem.STAR;
            case "tutorialText":
                return MapItem.TUTORIAL_TEXT;
            case "tutorial01":
                return MapItem.TUTORIAL_01;
            case "tutorial02":
                return MapItem.TUTORIAL_02;
            case "tutorial03":
                return MapItem.TUTORIAL_03;
            case "tutorial04":
                return MapItem.TUTORIAL_04;
            case "tutorial05":
                return MapItem.TUTORIAL_05;
            case "tutorial06":
                return MapItem.TUTORIAL_06;
            case "tutorial07":
                return MapItem.TUTORIAL_07;
            case "tutorial08":
                return MapItem.TUTORIAL_08;
            case "tutorial09":
                return MapItem.TUTORIAL_09;
            case "tutorial10":
                return MapItem.TUTORIAL_10;
            case "tutorial11":
                return MapItem.TUTORIAL_11;
            case "tutorial12":
                return MapItem.TUTORIAL_12;
            case "tutorial13":
                return MapItem.TUTORIAL_13;
            case "tutorial14":
                return MapItem.TUTORIAL_14;
            case "candyL":
                return MapItem.CANDY_L;
            case "candyR":
                return MapItem.CANDY_R;
            case "candy":
                return MapItem.CANDY;
            case "candy2":
                return MapItem.CANDY_2;
            case "gravitySwitch":
                return MapItem.GRAVITY_SWITCH;
            case "bubble":
                return MapItem.BUBBLE;
            case "pump":
                return MapItem.PUMP;
            case "sock":
                return MapItem.SOCK;
            case "spike1":
                return MapItem.SPIKE_1;
            case "spike2":
                return MapItem.SPIKE_2;
            case "spike3":
                return MapItem.SPIKE_3;
            case "spike4":
                return MapItem.SPIKE_4;
            case "spikesSwitch":
                return MapItem.SPIKES_SWITCH;
            case "electro":
                return MapItem.ELECTRO;
            case "bouncer1":
                return MapItem.BOUNCER1;
            case "bouncer2":
                return MapItem.BOUNCER2;
            case "grab":
                return MapItem.GRAB;
            case "hidden01":
                return MapItem.HIDDEN_01;
            case "hidden02":
                return MapItem.HIDDEN_02;
            case "hidden03":
                return MapItem.HIDDEN_03;
            case "rotatedCircle":
                return MapItem.ROTATED_CIRCLE;
            default:
                alert("Unknown map item:" + name);
                return null;
        }
    }

    MapItem.fromName = getMapItem;

    return MapItem;
});

define("config/editions/net-edition", [
    "boxes",
    "resources/ResourcePacks",
    "resources/ResourceId",
    "ui/BoxType",
    "resources/LangId",
], function (boxes, ResourcePacks, ResourceId, BoxType, LangId) {
    const netEdition = {
        siteUrl: "http://www.cuttherope.net",

        // no hidden drawings yet
        disableHiddenDrawings: true,

        // the text to display on the box in the box selector
        boxText: [
            {
                en: "Cardboard Box",
                ko: "골판지 상자",
                zh: "纸板盒",
                ja: "ダンボール箱",
                nl: "Karton",
                it: "Cartone",
                ca: "Cartró",
                br: "Papelão",
                es: "Cartón",
                fr: "Carton",
                de: "Pappkiste",
                ru: "\u041a\u0430\u0440\u0442\u043e\u043d\u043d\u0430\u044f",
            },
            {
                en: "Fabric Box",
                ko: "천 상자",
                zh: "布盒",
                ja: "布の箱",
                nl: "Stof",
                it: "Tessuto",
                ca: "Tela",
                br: "Tecido",
                es: "Tela",
                fr: "Tissu",
                de: "Stoffkiste",
                ru: "\u0422\u043a\u0430\u043d\u0435\u0432\u0430\u044f",
            },
            {
                en: "Toy Box",
                ko: "장난감 상자",
                zh: "玩具盒",
                ja: "おもちゃ箱",
                nl: "Speelgoed",
                it: "Giochi",
                ca: "Joguines",
                br: "Brinquedos",
                es: "Juguetes",
                fr: "Jouets",
                de: "Spielzeugkiste",
                ru: "\u0418\u0433\u0440\u0443\u0448\u0435\u0447\u043d\u0430\u044f",
            },
            {
                en: "Magic Box",
                ko: "마술 상자",
                zh: "魔盒",
                ja: "魔法の箱",
                nl: "Tover",
                it: "Magica",
                ca: "Magica",
                br: "Mágica",
                es: "Magia",
                fr: "Magique",
                de: "Magiekiste",
                ru: "\u0412\u043e\u043b\u0448\u0435\u0431\u043d\u0430\u044f",
            },
            {
                en: "New levels\ncoming soon!",
                ko: "새 레벨들이 곧 추가됩니다!",
                zh: "新关卡 即将到来！",
                ja: "次の*レベル まで もう すこし!",
                nl: "Er komen binnenkort nieuwe levels aan!",
                it: "Nuovi livelli in arrivo!",
                ca: "Nous nivells pròximament!",
                br: "Novos níveis em breve!",
                es: "¡Más niveles próximamente!",
                fr: "De nouveaux niveaux bient\u00f4t disponibles!",
                de: "Neue Level\nkommen bald!",
                ru: "\u041d\u043e\u0432\u044b\u0435 \u0443\u0440\u043e\u0432\u043d\u0438\n\u043d\u0430 \u043f\u043e\u0434\u0445\u043e\u0434\u0435!",
            },
        ],

        // !LANG
        languages: [
            LangId.EN,
            LangId.FR,
            LangId.IT,
            LangId.DE,
            LangId.NL,
            LangId.RU,
            LangId.ES,
            LangId.BR,
            LangId.CA,
            LangId.KO,
            LangId.ZH,
            LangId.JA,
        ],

        // the background image to use for the box in the box selector
        boxImages: [
            "box1_bgd.png",
            "box2_bgd.png",
            "box6_bgd.png",
            "box4_bgd.png",
            "boxmore_bgd.png",
        ],

        // no box borders in Chrome theme
        boxBorders: [],

        // images used for the sliding door transitions
        boxDoors: ["levelbg1.jpg", "levelbg2.jpg", "levelbg6.jpg", "levelbg4.jpg"],

        // the type of box to create
        boxTypes: [
            BoxType.NORMAL,
            BoxType.NORMAL,
            BoxType.NORMAL,
            BoxType.NORMAL,
            BoxType.MORECOMING,
        ],

        // how many stars are required to unlock each box
        unlockStars: [0, 20, 40, 60, null],

        // the index of the quad for the support OmNom sits on
        supports: [0, 1, 5, 3, null],

        // determines whether the earth animation is shown
        showEarth: [false, false, false, false, false],

        menuSoundIds: ResourcePacks.StandardMenuSounds,

        gameSoundIds: ResourcePacks.StandardGameSounds.concat(
            ResourcePacks.ChromeLiteAdditionalGameSounds
        ),

        menuImageFilenames: ResourcePacks.StandardMenuImageFilenames,

        loaderPageImages: ["loader-bg.jpg", "loader-logo.png"],

        gameImageIds: ResourcePacks.StandardGameImages.concat(
            ResourcePacks.ChromeLiteAdditionalGameImages
        ),

        boxes: boxes,

        levelBackgroundIds: [
            ResourceId.IMG_BGR_01_P1,
            ResourceId.IMG_BGR_02_P1,

            // import to use the toy box bg (#6 in full game) so offsets are correct
            ResourceId.IMG_BGR_06_P1,

            // magic box
            ResourceId.IMG_BGR_04_P1,
        ],

        // none of the chrome lite levels scroll
        levelOverlayIds: [],

        // hidden drawings are disabled
        drawingImageNames: [],
    };

    return netEdition;
});

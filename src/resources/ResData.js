import ResEntry from "@/resources/ResEntry";
import ResourceType from "@/resources/ResourceType";
import ResourceId from "@/resources/ResourceId";

const currentMonth = new Date().getMonth();
export const IS_XMAS = currentMonth === 11 || currentMonth === 0;
export const IS_JANUARY = currentMonth === 0;

const RES_DATA = [];

RES_DATA[ResourceId.IMG_DEFAULT] = new ResEntry("zeptolab.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_LOADERBAR_FULL] = new ResEntry("loaderbar_full.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_CHILLINGO] = new ResEntry("Default.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_MENU_BUTTON_DEFAULT] = new ResEntry(
    "menu_button_default.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.FNT_BIG_FONT] = new ResEntry("big_font.png", ResourceType.FONT);
RES_DATA[ResourceId.FNT_SMALL_FONT] = new ResEntry("small_font.png", ResourceType.FONT);
RES_DATA[ResourceId.IMG_MENU_LOADING] = new ResEntry("menu_loading.png", ResourceType.IMAGE);
RES_DATA[ResourceId.SND_TAP] = new ResEntry("tap", ResourceType.SOUND);
RES_DATA[ResourceId.STR_MENU] = new ResEntry("menu_strings.xml", ResourceType.STRINGS);
RES_DATA[ResourceId.SND_BUTTON] = new ResEntry("button", ResourceType.SOUND);
RES_DATA[ResourceId.SND_BUBBLE_BREAK] = new ResEntry("bubble_break", ResourceType.SOUND);
RES_DATA[ResourceId.SND_BUBBLE] = new ResEntry("bubble", ResourceType.SOUND);
RES_DATA[ResourceId.SND_CANDY_BREAK] = new ResEntry("candy_break", ResourceType.SOUND);
RES_DATA[ResourceId.SND_MONSTER_CHEWING] = new ResEntry("monster_chewing", ResourceType.SOUND);
RES_DATA[ResourceId.SND_MONSTER_CLOSE] = new ResEntry("monster_close", ResourceType.SOUND);
RES_DATA[ResourceId.SND_MONSTER_OPEN] = new ResEntry("monster_open", ResourceType.SOUND);
RES_DATA[ResourceId.SND_MONSTER_SAD] = new ResEntry("monster_sad", ResourceType.SOUND);
RES_DATA[ResourceId.SND_RING] = new ResEntry("ring", ResourceType.SOUND);
RES_DATA[ResourceId.SND_ROPE_BLEAK_1] = new ResEntry("rope_bleak_1", ResourceType.SOUND);
RES_DATA[ResourceId.SND_ROPE_BLEAK_2] = new ResEntry("rope_bleak_2", ResourceType.SOUND);
RES_DATA[ResourceId.SND_ROPE_BLEAK_3] = new ResEntry("rope_bleak_3", ResourceType.SOUND);
RES_DATA[ResourceId.SND_ROPE_BLEAK_4] = new ResEntry("rope_bleak_4", ResourceType.SOUND);
RES_DATA[ResourceId.SND_ROPE_GET] = new ResEntry("rope_get", ResourceType.SOUND);
RES_DATA[ResourceId.SND_STAR_1] = new ResEntry("star_1", ResourceType.SOUND);
RES_DATA[ResourceId.SND_STAR_2] = new ResEntry("star_2", ResourceType.SOUND);
RES_DATA[ResourceId.SND_STAR_3] = new ResEntry("star_3", ResourceType.SOUND);
RES_DATA[ResourceId.SND_ELECTRIC] = new ResEntry("electric", ResourceType.SOUND);
RES_DATA[ResourceId.SND_PUMP_1] = new ResEntry("pump_1", ResourceType.SOUND);
RES_DATA[ResourceId.SND_PUMP_2] = new ResEntry("pump_2", ResourceType.SOUND);
RES_DATA[ResourceId.SND_PUMP_3] = new ResEntry("pump_3", ResourceType.SOUND);
RES_DATA[ResourceId.SND_PUMP_4] = new ResEntry("pump_4", ResourceType.SOUND);
RES_DATA[ResourceId.SND_SPIDER_ACTIVATE] = new ResEntry("spider_activate", ResourceType.SOUND);
RES_DATA[ResourceId.SND_SPIDER_FALL] = new ResEntry("spider_fall", ResourceType.SOUND);
RES_DATA[ResourceId.SND_SPIDER_WIN] = new ResEntry("spider_win", ResourceType.SOUND);
RES_DATA[ResourceId.SND_WHEEL] = new ResEntry("wheel", ResourceType.SOUND);
RES_DATA[ResourceId.SND_WIN] = new ResEntry("win", ResourceType.SOUND);
RES_DATA[ResourceId.SND_GRAVITY_OFF] = new ResEntry("gravity_off", ResourceType.SOUND);
RES_DATA[ResourceId.SND_GRAVITY_ON] = new ResEntry("gravity_on", ResourceType.SOUND);
RES_DATA[ResourceId.SND_CANDY_LINK] = new ResEntry("candy_link", ResourceType.SOUND);
RES_DATA[ResourceId.SND_BOUNCER] = new ResEntry("bouncer", ResourceType.SOUND);
RES_DATA[ResourceId.IMG_MENU_BGR] = new ResEntry("menu_bgr.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_MENU_BUTTON_CRYSTAL] = new ResEntry(
    "menu_button_crystal.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_MENU_POPUP] = new ResEntry("menu_popup.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_MENU_BUTTON_CRYSTAL_ICON] = new ResEntry(
    "menu_button_crystal_icon.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_MENU_LOGO] = new ResEntry("menu_logo.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_MENU_LEVEL_SELECTION] = new ResEntry(
    "menu_level_selection.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_MENU_PACK_SELECTION] = new ResEntry(
    "menu_pack_selection.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_MENU_EXTRA_BUTTONS] = new ResEntry(
    "menu_extra_buttons.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_MENU_EXTRA_BUTTONS_EN] = new ResEntry(
    "menu_extra_buttons_en.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_MENU_BUTTON_SHORT] = new ResEntry(
    "menu_button_short.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_HUD_BUTTONS] = new ResEntry("hud_buttons.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_CANDY_01] = new ResEntry("obj_candy_01.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_SPIDER] = new ResEntry("obj_spider.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_CONFETTI_PARTICLES] = new ResEntry(
    "confetti_particles.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_MENU_PAUSE] = new ResEntry("menu_pause.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_MENU_RESULT] = new ResEntry("menu_result.png", ResourceType.IMAGE);
RES_DATA[ResourceId.FNT_FONT_NUMBERS_BIG] = new ResEntry("font_numbers_big.png", ResourceType.FONT);
RES_DATA[ResourceId.IMG_HUD_BUTTONS_EN] = new ResEntry("hud_buttons_en.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_MENU_RESULT_EN] = new ResEntry("menu_result_en.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_STAR_DISAPPEAR] = new ResEntry(
    "obj_star_disappear.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_BUBBLE_FLIGHT] = new ResEntry(
    "obj_bubble_flight.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_BUBBLE_POP] = new ResEntry("obj_bubble_pop.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_HOOK_AUTO] = new ResEntry("obj_hook_auto.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_SPIKES_04] = new ResEntry("obj_spikes_04.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_BUBBLE_ATTACHED] = new ResEntry(
    "obj_bubble_attached.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_HOOK_01] = new ResEntry("obj_hook_01.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_HOOK_02] = new ResEntry("obj_hook_02.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_STAR_IDLE] = new ResEntry("obj_star_idle.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_HUD_STAR] = new ResEntry("hud_star.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_SPIKES_03] = new ResEntry("obj_spikes_03.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_SPIKES_02] = new ResEntry("obj_spikes_02.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_SPIKES_01] = new ResEntry("obj_spikes_01.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_CHAR_ANIMATIONS] = new ResEntry("char_animations.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_CHAR_ANIMATIONS2] = new ResEntry(
    "char_animations2.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_CHAR_ANIMATIONS3] = new ResEntry(
    "char_animations3.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_HOOK_REGULATED] = new ResEntry(
    "obj_hook_regulated.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_ELECTRODES] = new ResEntry("obj_electrodes.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_HOOK_MOVABLE] = new ResEntry(
    "obj_hook_movable.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_PUMP] = new ResEntry("obj_pump.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_TUTORIAL_SIGNS] = new ResEntry("tutorial_signs.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_SOCKS] = new ResEntry("obj_hat.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_BOUNCER_01] = new ResEntry("obj_bouncer_01.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_BOUNCER_02] = new ResEntry("obj_bouncer_02.png", ResourceType.IMAGE);
RES_DATA[ResourceId.SND_MENU_MUSIC] = new ResEntry("menu_music", ResourceType.SOUND);
RES_DATA[ResourceId.SND_GAME_MUSIC] = new ResEntry("game_music", ResourceType.SOUND);
RES_DATA[ResourceId.SND_GAME_MUSIC2] = new ResEntry("game_music2", ResourceType.SOUND);
RES_DATA[ResourceId.SND_GAME_MUSIC3] = new ResEntry("game_music3", ResourceType.SOUND);
RES_DATA[ResourceId.SND_GAME_MUSIC4] = new ResEntry("game_music4", ResourceType.SOUND);

RES_DATA[ResourceId.IMG_DRAWING_HIDDEN] = new ResEntry(
    "obj_drawing_hidden.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_ROTATABLE_SPIKES_01] = new ResEntry(
    "obj_rotatable_spikes_01.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_ROTATABLE_SPIKES_02] = new ResEntry(
    "obj_rotatable_spikes_02.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_ROTATABLE_SPIKES_03] = new ResEntry(
    "obj_rotatable_spikes_03.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_ROTATABLE_SPIKES_04] = new ResEntry(
    "obj_rotatable_spikes_04.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_ROTATABLE_SPIKES_BUTTON] = new ResEntry(
    "obj_rotatable_spikes_button.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_OBJ_BEE_HD] = new ResEntry("obj_bee_hd.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_POLLEN_HD] = new ResEntry("obj_pollen_hd.png", ResourceType.IMAGE);
RES_DATA[ResourceId.SND_SPIKE_ROTATE_IN] = new ResEntry("spike_rotate_in", ResourceType.SOUND);
RES_DATA[ResourceId.SND_SPIKE_ROTATE_OUT] = new ResEntry("spike_rotate_out", ResourceType.SOUND);
RES_DATA[ResourceId.IMG_CHAR_SUPPORTS] = new ResEntry("char_supports.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_OBJ_VINIL] = new ResEntry("obj_vinil.png", ResourceType.IMAGE);
RES_DATA[ResourceId.SND_SCRATCH_IN] = new ResEntry("scratch_in", ResourceType.SOUND);
RES_DATA[ResourceId.SND_SCRATCH_OUT] = new ResEntry("scratch_out", ResourceType.SOUND);
RES_DATA[ResourceId.SND_BUZZ] = new ResEntry("buzz", ResourceType.SOUND);
RES_DATA[ResourceId.SND_TELEPORT] = new ResEntry("teleport", ResourceType.SOUND);

RES_DATA[ResourceId.IMG_BGR_01_P1] = new ResEntry("bgr_01_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_01_P2] = new ResEntry("bgr_01_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_02_P1] = new ResEntry("bgr_02_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_02_P2] = new ResEntry("bgr_02_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_03_P1] = new ResEntry("bgr_03_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_03_P2] = new ResEntry("bgr_03_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_04_P1] = new ResEntry("bgr_04_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_04_P2] = new ResEntry("bgr_04_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_05_P1] = new ResEntry("bgr_05_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_05_P2] = new ResEntry("bgr_05_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_06_P1] = new ResEntry("bgr_06_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_06_P2] = new ResEntry("bgr_06_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_07_P1] = new ResEntry("bgr_07_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_07_P2] = new ResEntry("bgr_07_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_08_P1] = new ResEntry("bgr_08_p1.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_08_P2] = new ResEntry("bgr_08_p2.png", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_09_P1] = new ResEntry("bgr_09_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_09_P2] = new ResEntry("bgr_09_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_10_P1] = new ResEntry("bgr_10_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_10_P2] = new ResEntry("bgr_10_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_11_P1] = new ResEntry("bgr_11_p1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_11_P2] = new ResEntry("bgr_11_p2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_XMAS] = new ResEntry("bgr_xmas.webp", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_BGR_PADDINGTON] = new ResEntry("bgr_paddington.webp", ResourceType.IMAGE);

// IE box background
RES_DATA[ResourceId.IMG_BGR_IE] = new ResEntry("bgr_ie.jpg", ResourceType.IMAGE);

RES_DATA[ResourceId.IMG_TIME_BGR_1] = new ResEntry("bgr_time1.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_TIME_BGR_2] = new ResEntry("bgr_time2.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_TIME_BGR_3] = new ResEntry("bgr_time3.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_TIME_BGR_4] = new ResEntry("bgr_time4.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_TIME_BGR_5] = new ResEntry("bgr_time5.jpg", ResourceType.IMAGE);
RES_DATA[ResourceId.IMG_TIME_BGR_6] = new ResEntry("bgr_time6.jpg", ResourceType.IMAGE);

RES_DATA[ResourceId.IMG_CAESAR_ANIMATIONS_1] = new ResEntry(
    "Caesar_animations_1_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_CAESAR_ANIMATIONS_2] = new ResEntry(
    "Caesar_animations_2_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_CAESAR_ANIMATIONS_3] = new ResEntry(
    "Caesar_animations_3_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_CAESAR_ANIMATIONS_4] = new ResEntry(
    "Caesar_animations_4_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PAINTER_ANIMATIONS_1] = new ResEntry(
    "Painter_animations_1_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PAINTER_ANIMATIONS_2] = new ResEntry(
    "Painter_animations_2_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PAINTER_ANIMATIONS_3] = new ResEntry(
    "Painter_animations_3_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PAINTER_ANIMATIONS_4] = new ResEntry(
    "Painter_animations_4_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PHARAOH_ANIMATIONS_1] = new ResEntry(
    "Pharaoh_animations_1_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PHARAOH_ANIMATIONS_2] = new ResEntry(
    "Pharaoh_animations_2_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PHARAOH_ANIMATIONS_3] = new ResEntry(
    "Pharaoh_animations_3_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PHARAOH_ANIMATIONS_4] = new ResEntry(
    "Pharaoh_animations_4_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PIRATE_ANIMATIONS_1] = new ResEntry(
    "Pirate_animations_1_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PIRATE_ANIMATIONS_2] = new ResEntry(
    "Pirate_animations_2_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PIRATE_ANIMATIONS_3] = new ResEntry(
    "Pirate_animations_3_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PIRATE_ANIMATIONS_4] = new ResEntry(
    "Pirate_animations_4_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PREHISTORIC_ANIMATIONS_1] = new ResEntry(
    "Prehistoric_animations_1_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PREHISTORIC_ANIMATIONS_2] = new ResEntry(
    "Prehistoric_animations_2_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PREHISTORIC_ANIMATIONS_3] = new ResEntry(
    "Prehistoric_animations_3_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_PREHISTORIC_ANIMATIONS_4] = new ResEntry(
    "Prehistoric_animations_4_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_VIKING_ANIMATIONS_1] = new ResEntry(
    "Viking_animations_1_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_VIKING_ANIMATIONS_2] = new ResEntry(
    "Viking_animations_2_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_VIKING_ANIMATIONS_3] = new ResEntry(
    "Viking_animations_3_hd.png",
    ResourceType.IMAGE
);
RES_DATA[ResourceId.IMG_VIKING_ANIMATIONS_4] = new ResEntry(
    "Viking_animations_4_hd.png",
    ResourceType.IMAGE
);

RES_DATA[ResourceId.SND_CANDY_HIT] = new ResEntry("candy_hit", ResourceType.SOUND);
RES_DATA[ResourceId.SND_PREHISTORIC_MONSTER_CHEWING] = new ResEntry(
    "prehistoric_monster_chewing",
    ResourceType.SOUND
);
RES_DATA[ResourceId.SND_PREHISTORIC_MONSTER_CLOSE] = new ResEntry(
    "prehistoric_monster_close",
    ResourceType.SOUND
);
RES_DATA[ResourceId.SND_PREHISTORIC_MONSTER_OPEN] = new ResEntry(
    "prehistoric_monster_open",
    ResourceType.SOUND
);
RES_DATA[ResourceId.SND_PREHISTORIC_MONSTER_SAD] = new ResEntry(
    "prehistoric_monster_sad",
    ResourceType.SOUND
);
RES_DATA[ResourceId.SND_TIME_MENU_MUSIC] = new ResEntry("time_menu", ResourceType.SOUND);

RES_DATA[ResourceId.IMG_TIME_STANDS] = new ResEntry("time-stands.png", ResourceType.IMAGE);

// Christmas resources

RES_DATA[ResourceId.SND_XMAS_BELL] = new ResEntry("xmas_bell", ResourceType.SOUND);

RES_DATA[ResourceId.SND_MENU_MUSIC_XMAS] = new ResEntry("menu_music_xmas", ResourceType.SOUND);

RES_DATA[ResourceId.SND_GAME_MUSIC_XMAS] = new ResEntry("game_music_xmas", ResourceType.SOUND);

RES_DATA[ResourceId.SND_TELEPORT_XMAS] = new ResEntry("teleport_xmas", ResourceType.SOUND);

RES_DATA[ResourceId.IMG_CHAR_SUPPORTS_XMAS] = new ResEntry(
    "char_supports_xmas.png",
    ResourceType.IMAGE,
    {
        atlasPath: "char_supports_xmas.json",
        atlasFormat: "texture-packer",
    }
);

RES_DATA[ResourceId.IMG_CHAR_GREETINGS_XMAS] = new ResEntry(
    "char_greeting_xmas.png",
    ResourceType.IMAGE,
    {
        atlasPath: "char_greeting_xmas.json",
        atlasFormat: "texture-packer",
    }
);

RES_DATA[ResourceId.IMG_CHAR_IDLE_XMAS] = new ResEntry("char_idle_xmas.png", ResourceType.IMAGE, {
    atlasPath: "char_idle_xmas.json",
    atlasFormat: "texture-packer",
});

RES_DATA[ResourceId.IMG_XMAS_LIGHTS] = new ResEntry("christmas_lights.png", ResourceType.IMAGE, {
    atlasPath: "christmas_lights.json",
    atlasFormat: "texture-packer",
});

RES_DATA[ResourceId.IMG_OBJ_CANDY_PADDINGTON] = new ResEntry(
    "obj_candy_paddington.png",
    ResourceType.IMAGE,
    {
        atlasPath: "obj_candy_paddington.json",
        atlasFormat: "texture-packer",
    }
);

RES_DATA[ResourceId.IMG_SNOWFLAKES] = new ResEntry("snowflakes.png", ResourceType.IMAGE, {
    atlasPath: "snowflakes.json",
    atlasFormat: "texture-packer",
});

RES_DATA[ResourceId.IMG_OBJ_SOCKS_XMAS] = new ResEntry("obj_socks.png", ResourceType.IMAGE, {
    atlasPath: "obj_socks.json",
    atlasFormat: "texture-packer",
});

RES_DATA[ResourceId.IMG_CHAR_ANIMATION_PADDINGTON] = new ResEntry(
    "char_animation_paddington.png",
    ResourceType.IMAGE,
    {
        atlasPath: "char_animation_paddington.json",
        atlasFormat: "texture-packer",
    }
);

export default RES_DATA;

export const CDN_URL     = "https://cdn.jsdelivr.net/gh/IonDen/ion.sound/sounds/";
export const SOUND_FILES = {
    bgm_menu:   "https://assets.mixkit.co/music/preview/mixkit-medieval-fantasy-12.mp3",
    bgm_battle: "https://assets.mixkit.co/music/preview/mixkit-epic-war-614.mp3",
    click:      `${CDN_URL}button_click.mp3`,
    play_card:  `${CDN_URL}camera_flashing.mp3`,
    attack:     `${CDN_URL}metal_plate.mp3`,
    damage:     `${CDN_URL}glass_breaking.mp3`,
    die:        `${CDN_URL}water_droplet.mp3`,
    win:        `${CDN_URL}bell_ring.mp3`,
    lose:       `${CDN_URL}branch_break.mp3`,
    draw:       `${CDN_URL}button_tiny.mp3`,
    buff:       `${CDN_URL}stapler.mp3`,
};
export type SoundType = keyof typeof SOUND_FILES;

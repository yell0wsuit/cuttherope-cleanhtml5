import BaseElement from "@/visual/BaseElement";
import { GameSceneInit } from "@/gameScene/init";
import { GameSceneLoaders } from "@/gameScene/loaders";
import { GameSceneCharacter } from "@/gameScene/character";
import { GameSceneUpdate } from "@/gameScene/update";
import { GameSceneTouch } from "@/gameScene/touch";

class GameScene extends BaseElement {
    constructor() {
        super();
        // Call the init method from the mixin after BaseElement constructor
        this.init();
    }
}

// Apply mixins to the class
Object.assign(
    GameScene.prototype,
    GameSceneInit,
    GameSceneLoaders,
    GameSceneCharacter,
    GameSceneUpdate,
    GameSceneTouch
);

export default GameScene;

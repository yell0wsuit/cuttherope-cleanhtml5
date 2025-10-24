import BaseElement from "@/visual/BaseElement";
import { GameSceneInit } from "@/gameScene/init";
import { GameSceneLoaders } from "@/gameScene/loaders";
import { GameSceneCharacter } from "@/gameScene/character";
import { GameSceneUpdate } from "@/gameScene/update";
import { GameSceneTouch } from "@/gameScene/touch";

const GameScene = BaseElement.extend(
    Object.assign(
        {},
        GameSceneInit,
        GameSceneLoaders,
        GameSceneCharacter,
        GameSceneUpdate,
        GameSceneTouch
    )
);

export default GameScene;

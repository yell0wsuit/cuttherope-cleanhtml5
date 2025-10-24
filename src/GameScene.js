import BaseElement from "@/visual/BaseElement";
import { GameSceneInit } from "@/GameScene/init";
import { GameSceneLoaders } from "@/GameScene/loaders";
import { GameSceneCharacter } from "@/GameScene/character";
import { GameSceneUpdate } from "@/GameScene/update";
import { GameSceneTouch } from "@/GameScene/touch";

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

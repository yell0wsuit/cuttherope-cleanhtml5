import BaseElement from "@/visual/BaseElement";
import { GameSceneInit } from "./GameSceneInit";
import { GameSceneLoaders } from "./GameSceneLoaders";
import { GameSceneCharacter } from "./GameSceneCharacter";
import { GameSceneUpdate } from "./GameSceneUpdate";
import { GameSceneTouch } from "./GameSceneTouch";

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

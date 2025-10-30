import BaseElement from "@/visual/BaseElement";
import GameSceneInit from "@/gameScene/init";
import GameSceneLoaders from "@/gameScene/loaders";
import GameSceneCharacter from "@/gameScene/character";
import GameSceneUpdate from "@/gameScene/update";
import GameSceneTouch from "@/gameScene/touch";

class GameScene extends BaseElement {
    constructor() {
        super();

        /** @type {Array<object>} */
        this._delegateInstances = [];
        /** @type {Record<string, object>} */
        this._delegateMethodMap = Object.create(null);
        /** @type {WeakMap<object, object>} */
        this._delegateTargetMap = new WeakMap();

        this._registerDelegate("init", new GameSceneInit(this));
        this._registerDelegate("loaders", new GameSceneLoaders(this));
        this._registerDelegate("character", new GameSceneCharacter(this));
        this._registerDelegate("updateCoordinator", new GameSceneUpdate(this));
        this._registerDelegate("touchHandlers", new GameSceneTouch(this));

        this.init();
    }

    _registerDelegate(name, delegate) {
        const scene = this;
        const handler = {
            get(target, prop, receiver) {
                if (prop === "scene") {
                    return scene;
                }
                if (prop in target) {
                    const value = Reflect.get(target, prop, receiver);
                    return typeof value === "function" ? value.bind(receiver) : value;
                }

                const owner = scene._delegateMethodMap[prop];
                if (owner) {
                    const ownerTarget = scene._delegateTargetMap.get(owner);
                    if (ownerTarget) {
                        const value = Reflect.get(ownerTarget, prop, owner);
                        return typeof value === "function" ? value.bind(owner) : value;
                    }
                }

                const sceneValue = Reflect.get(scene, prop);
                return typeof sceneValue === "function" ? sceneValue.bind(scene) : sceneValue;
            },
            set(target, prop, value, receiver) {
                if (prop === "scene") {
                    return false;
                }

                if (Object.prototype.hasOwnProperty.call(target, prop)) {
                    return Reflect.set(target, prop, value, receiver);
                }

                scene[prop] = value;
                return true;
            },
            has(target, prop) {
                return (
                    prop in target ||
                    prop in scene ||
                    Object.prototype.hasOwnProperty.call(scene._delegateMethodMap, prop)
                );
            },
        };

        const proxiedDelegate = new Proxy(delegate, handler);
        this._delegateTargetMap.set(proxiedDelegate, delegate);

        if (name && !Object.prototype.hasOwnProperty.call(this, name)) {
            this[name] = proxiedDelegate;
        }

        this._delegateInstances.push(proxiedDelegate);

        const proto = Object.getPrototypeOf(delegate);
        const methodNames = Object.getOwnPropertyNames(proto).filter(
            (methodName) =>
                methodName !== "constructor" && typeof delegate[methodName] === "function"
        );

        for (const methodName of methodNames) {
            this._delegateMethodMap[methodName] = proxiedDelegate;
            this[methodName] = (...args) => proxiedDelegate[methodName](...args);
        }
    }

    registerDelegate(name, delegate) {
        this._registerDelegate(name, delegate);
    }
}

export default GameScene;

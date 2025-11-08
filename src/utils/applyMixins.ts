/**
 * Helper function to copy all methods from source classes to target class
 */

type Constructor = new (...args: unknown[]) => object;

const applyMixins = (targetClass: Constructor, sourceClasses: Constructor[]) => {
    sourceClasses.forEach((sourceClass) => {
        Object.getOwnPropertyNames(sourceClass.prototype).forEach((name) => {
            if (name !== "constructor") {
                Object.defineProperty(
                    targetClass.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(sourceClass.prototype, name) ||
                        Object.create(null)
                );
            }
        });
    });
};

export default applyMixins;

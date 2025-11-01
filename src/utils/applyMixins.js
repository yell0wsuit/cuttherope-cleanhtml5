/**
 * Helper function to copy all methods from source classes to target class
 * @param {Function} targetClass - The class to add methods to
 * @param {Function[]} sourceClasses - Array of classes to copy methods from
 */
const applyMixins = (targetClass, sourceClasses) => {
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

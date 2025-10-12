/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype

let Class;

(function () {
    let initializing = false;

    const fnTest = /var xyz/.test(function () {
        //noinspection JSUnusedLocalSymbols
        let xyz;
    })
        ? /\b_super\b/
        : /.*/;

    // The base Class implementation (does nothing)
    Class = function () {};

    // Create a new Class that inherits from this class
    function extendClass(prop) {
        const _super = this.prototype;

        initializing = true;
        const prototype = new this();
        initializing = false;

        for (const name in prop) {
            prototype[name] =
                typeof prop[name] == "function" &&
                typeof _super[name] == "function" &&
                fnTest.test(prop[name])
                    ? (function (name, fn) {
                          return function () {
                              const tmp = this._super;
                              this._super = _super[name];
                              const ret = fn.apply(this, arguments);
                              this._super = tmp;
                              return ret;
                          };
                      })(name, prop[name])
                    : prop[name];
        }

        function SubClass() {
            if (!initializing && this.init) this.init.apply(this, arguments);
        }

        SubClass.prototype = prototype;
        SubClass.prototype.constructor = SubClass;
        SubClass.extend = extendClass;

        return SubClass;
    }

    Class.extend = extendClass;
})();

export default Class;

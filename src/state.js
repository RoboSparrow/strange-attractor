class StateProvider {
    constructor(defaults) {
        const _state = {};
        const _defaults = {};

        Object.freeze(Object.assign(_defaults, defaults));
        Object.assign(_state, defaults);

        this.reset = function() {
            return Object.assign(_state, _defaults);
        };

        this.get = function() {
            return Object.assign({}, _state);
        };

        this.set = function(updates) {
            return Object.assign(_state, updates);
        };
    }
}

export default StateProvider;

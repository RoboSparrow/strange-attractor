const state = {
    fps: 32,
    count: 0,
};

const getState = function() {
    return state;
};

let prev = 0;

const update = function(callback) {
    const { fps } = state;

    const now = Date.now();
    const delta = now - prev; //msec

    if (fps > 0 && delta >= 1000 / fps) {
        callback();
        prev = now;
        state.count += 1;
    }


    requestAnimationFrame(update.bind(null, callback));
};

const init = function(callback, options = {}) {
    Object.assign(state, options);
    requestAnimationFrame(update.bind(null, callback));
};

export default {
    init,
    getState,
};

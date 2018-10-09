const state = {
    fps: 32,
    count: 0,
};

const getState = function() {
    return state;
};

let prev = 0;
let requestId = -1;

const update = function(callback) {
    const { fps } = state;

    const now = Date.now();
    const delta = now - prev; //msec

    if (fps > 0 && delta >= 1000 / fps) {
        callback();
        prev = now;
        state.count += 1;
    }

    requestId = requestAnimationFrame(update.bind(null, callback));
};

const cancel = function() {
    if (requestId > 0) {
        cancelAnimationFrame(requestId);
    }
    requestId = -1;
};

const init = function(callback, options = {}) {
    cancel();
    Object.assign(state, options);
    requestId = requestAnimationFrame(update.bind(null, callback));
};

export default {
    init,
    cancel,
    getState,
};

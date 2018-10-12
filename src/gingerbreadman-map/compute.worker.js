/* eslint-env serviceworker */
import compute from './compute';

onmessage = function(e) {
    const { state } = e.data;
    const chain = compute(state);

    postMessage({ state, chain });
};

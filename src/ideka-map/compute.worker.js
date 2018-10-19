/* eslint-env serviceworker */
import { computeIdekaTrail } from './compute';

onmessage = function(e) {
    const { state } = e.data;
    const chain = computeIdekaTrail(state);

    postMessage({ state, chain });
};

/* eslint-env serviceworker */
import compute from './compute';


onmessage = function(e) {
    const { id, state, width, height, pixelData, originalPixelData } = e.data;
    const newData = compute(state, width, height, pixelData, originalPixelData);

    postMessage({
        id,
        state,
        pixelData: newData,
        width,
        height,
    });
};

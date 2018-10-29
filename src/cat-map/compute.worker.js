/* eslint-env serviceworker */
import compute from './compute';


onmessage = function(e) {
    const { id, state, width, height, pixelData} = e.data;
    const cycle = compute.cycle(state, width, height, pixelData);

    postMessage({
        id,
        cycle,
    });

    // const newData = compute.step(state, width, height, pixelData, originalPixelData);
    //
    // postMessage({
    //     id,
    //     state,
    //     pixelData: newData,
    //     width,
    //     height,
    // });
};

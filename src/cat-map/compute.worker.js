/* eslint-env serviceworker */
//import compute from './compute';
const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

onmessage = function(e) {
    //const { state } = e.data;
    const { width, height, u8Data } = e.data;

    const prev = u8Data;
    const next = new Uint8ClampedArray(u8Data.length);
    //const chain = compute(state);
    let i = 0;
    let xnew;
    let ynew;
    let r;

    for (x = 0; x < width; x += 1) {
        for (y = 0; y < height; y += 1) {
            xnew  = 2 * x + y;
            ynew  = x + y;
            if (xnew > width) {
                xnew = xnew - width;
            }
            if (ynew > height) {
                ynew = ynew - height;
            }
            r = locatePixel2D(xnew, ynew, width);

            //next[r] = Math.floor(Math.random() * 255);
            //next[r + 1] = Math.floor(Math.random() * 255);
            //next[r + 2] = Math.floor(Math.random() * 255);
            //next[r + 3] = Math.floor(Math.random() * 255);

            next[i] = prev[r];
            next[i + 1] = prev[r + 1];
            next[i + 2] = prev[r + 2];
            next[i + 3] = prev[r + 3];
            i += 4;
        }
    }

    postMessage({ width, height, u8Data: next } );
};

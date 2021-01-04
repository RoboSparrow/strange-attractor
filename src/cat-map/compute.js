const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

const step = function(state, width, height, pixelData, originalPixelData) {
    const { length } = pixelData;
    const next = new Uint8ClampedArray(length);

    let x;
    let y;
    let xNext;
    let yNext;

    //red pixel location in imgdata
    let c; // current
    let n; // next
    let i;
    let restored = true;

    for (y = 0; y < height; y += 1) {
        for (x = 0; x < width; x += 1) {

            // cat map!
            xNext = (2 * x + y) % width;
            yNext = (x + y) % height;

            c = locatePixel2D(x, y, width);
            n = locatePixel2D(xNext, yNext, height);

            for (i = 0; i < 4; i += 1) {
                next[c + i] = pixelData[n + i];
                if (next[c + i] !== originalPixelData[c + i]) {
                    restored = false;
                }
            }
        }
    }

    return {
        restored,
        pixelData: next,
    };

};

const cycle = function(state, width, height, pixelData, notify) {
    const frames = [pixelData];
    let restored = false;
    let frame;
    let prevPixelData = pixelData;

    while (!restored) {
        frame = step(state, width, height, prevPixelData, pixelData);

        // eslint-disable-next-line prefer-destructuring
        restored = frame.restored;
        prevPixelData = frame.pixelData;

        frames.push(frame.pixelData);
        if (typeof notify === 'function') {
            notify(frames.length, restored);
        }
    }

    return frames;
};

export default { step, cycle };

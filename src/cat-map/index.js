/**
 * @see https://en.wikipedia.org/wiki/Arnold%27s_cat_map
 * note: cat map images need to e quadratic: "...on a circular ring with circumference N"
 */
import animation from '../animation';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

import CatImage from '../images/cat.jpg';

const UpdateEvent = new Event('CatMap:updated');
// state

const State = new StateProvider({
    // henon map algorithm params
    imgSrc: CatImage,

    step: 0,
});

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

const update = function(ctx) {

    const { u8, step } = State.get();
    const { width, height } = ctx.canvas;

    const imageData = ctx.getImageData(0, 0, width, height);
    const prev = imageData.data;
    const next = new Uint8ClampedArray(prev.length);

    // on first hit store original imgdata
    if (!u8) {
        State.set({
            u8: prev.toString(),
        });
    }

    let x;
    let y;
    let xNext;
    let yNext;

    //red pixel location in imgdata
    let c; // current
    let n; // next

    for (y = 0; y < height; y += 1) {
        for (x = 0; x < width; x += 1) {

            // cat map!
            xNext = (2 * x + y) % width;
            yNext = (x + y) % height;

            c = locatePixel2D(x, y, width);
            n = locatePixel2D(xNext, yNext, height);

            next[c] = prev[n];
            next[c + 1] = prev[n + 1];
            next[c + 2] = prev[n + 2];
            next[c + 3] = prev[n + 3];
        }
    }

    ctx.fillRect(0, 0, width, height);
    imageData.data.set(next);
    ctx.putImageData(imageData, 0, 0);

    State.set({ step: step + 1 });

    // first time
    if (!step) {
        setTimeout(() => update(ctx), 10);
        return;
    }

    // stop if original image is restored
    if (next.toString() !== u8) {
        // TODO use animate
        setTimeout(() => update(ctx), 10);
    }

    document.dispatchEvent(UpdateEvent);
};

// plotting
const loadImage = function(imgSrc, ctx) {

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = function() {
            const squared = (this.width > this.height) ? this.height : this.width;
            ctx.canvas.width = squared;
            ctx.canvas.height = squared;

            ctx.drawImage(this, 0, 0, squared, squared, 0, 0, ctx.canvas.width, ctx.canvas.height);
            resolve(this);
        };
        img.onerror = function(error) {
            reject(error);
        };
    });

};

const plot = function(ctx) {
    animation.stop();
    contextHelper(ctx)
        .clear('#101010')
        .progress('computing..', '#ff0000');

    const { imgSrc } = State.get();

    return loadImage(imgSrc, ctx)
        .then(() => update(ctx));
};

const init = function(container = document.body) {
    const canvas = initCanvas(container);
    const { ctx } = contextHelper(canvas).clear('#101010');

    animation.stop();

    return {
        getState: State.get,
        reset: () => {
            State.reset();
            plot(ctx);
        },
        plot: (updates) => {
            State.set(updates);
            plot(ctx);
        },
    };
};

export { init, animation };

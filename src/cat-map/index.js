/**
 * @see https://en.wikipedia.org/wiki/Arnold%27s_cat_map
 */
// import Worker from './compute.worker';
import animation from '../animation';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

import CatImage from '../images/cat.png';

// state

const State = new StateProvider({
    // henon map algorithm params
    imgSrc: CatImage,

    step: 0,
});

// algorithm

// const compute = function(ctx) {
//
//     // const state = State.get();
//
//     const { width, height } = ctx.canvas;
//     const imageData = ctx.getImageData(0, 0, 300, 150);
//
//     return new Promise((resolve, reject) => {
//         const worker = new Worker();
//
//         worker.addEventListener('message', (e) => {
//             // todo track progress
//             resolve(e.data);
//         });
//
//         worker.addEventListener('error', (error) => {
//             reject(error);
//         });
//
//         worker.postMessage({
//             width,
//             height,
//             u8Data: imageData.data,
//         }, [imageData.data.buffer]);
//     });
//
// };

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

const compute = function(ctx) {

    // const state = State.get();
    const { u8, step } = State.get();
    const { width, height } = ctx.canvas;
    //const width = 200;
    //const height = 200;
    const imageData = ctx.getImageData(0, 0, width, height);
    const prev = imageData.data;
    const next = new Uint8ClampedArray(prev.length);

    if (!u8) { // first hit original
        State.set({
            u8: prev.toString(),
        });
    }

    //const chain = compute(state);
    let xnew;
    let ynew;

    let r;
    let x;
    let y;
    let i = 0;
    //const test = (height > width) ? height : width;
    for (y = 0; y < height; y += 1) {
        for (x = 0; x < width; x += 1) {
            xnew = (2 * x + y) % width;
            ynew = (x + y) % height;

            // if (xnew > width) {
            //     xnew -= width;
            // }
            // if (ynew > height) {
            //     ynew -= height;
            // }

            i = locatePixel2D(x, y, width);
            r = locatePixel2D(xnew, ynew, height);

            // next[r] = Math.floor(Math.random() * 255);
            // next[r + 1] = Math.floor(Math.random() * 255);
            // next[r + 2] = Math.floor(Math.random() * 255);
            // next[r + 3] = Math.floor(Math.random() * 255);

            next[i] = prev[r];
            next[i + 1] = prev[r + 1];
            next[i + 2] = prev[r + 2];
            next[i + 3] = prev[r + 3];
            //i += 4;
        }
    }

    //console.log(JSON.stringify(next));
    ctx.fillRect(0, 0, width, height);
    imageData.data.set(next);
    ctx.putImageData(imageData, 0, 0);

    State.set({ step: step + 1 });

    // console.log(u8);
    // console.log(next.toString(), u8);
    // console.log('--');
    if (next.toString() !== u8) {
        setTimeout(() => compute(ctx), 10);
    }

};

// compute attractor

const update = function(ctx) {
    compute(ctx);
    //setTimeout(() => update(ctx), 100);
};


// plotting
const loadImage = function(imgSrc, ctx) {

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = function() {
            ctx.drawImage(this, 0, 0);
            State.set({
                u8: null
            });
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
        //.then(() => compute(ctx))
        .then(data => update(ctx, data));
    //    .then(() => {
    //        animation.assign(() => update(ctx)).play();
    //        return true;
    //    });
};

const init = function(container = document.body) {
    const canvas = initCanvas(container, 128, 128);
    const { ctx } = contextHelper(canvas).clear('#101010');

    animation.throttle(32);

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

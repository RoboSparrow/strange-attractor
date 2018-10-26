/**
 * @see https://en.wikipedia.org/wiki/Arnold%27s_cat_map
 * note: cat map images need to be quadratic: "...on a circular ring with circumference N"
 */
import Worker from './compute.worker';
import animation from '../animation';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

import CatImage from '../images/cat.jpg';

const UpdateEvent = new Event('CatMap:updated');
// state

const State = new StateProvider({
    imgSrc: CatImage,

    step: 0,
    interval: 10,
    targetStep: -1,
    reversingAt: -1, // to be computed
});

const worker = new Worker();
let originalPixelData;

// algorithm

const compute = function(ctx) {

    const state = State.get();

    const { width, height } = ctx.canvas;
    const pixelData = ctx.getImageData(0, 0, width, height).data;

    if (state.step === 0) {
        originalPixelData = pixelData;
    }
    const id = performance.now();

    return new Promise((resolve, reject) => {

        worker.addEventListener('message', (e) => {
            // todo track progress
            if (e.data.id !== id) {
                return;
            }
            resolve(e.data.pixelData);
        });

        worker.addEventListener('error', (error) => {
            reject(error);
        });

        worker.postMessage({
            id,
            state,
            width,
            height,
            pixelData,
            originalPixelData,
            restored: false, // always
        });
    });

};

const hasNextLoop = function(targetStep, step, restored) {
    if (targetStep <= 0 && !restored) {
        return true;
    }
    if (step < targetStep - 1 && !restored) {
        return true;
    }
    return false;
};

const update = function(ctx, pixelData) {
    const { step, interval, targetStep } = State.get();
    const { width, height } = ctx.canvas;
    const { next, restored } = pixelData;

    const imageData = ctx.getImageData(0, 0, width, height);

    imageData.data.set(next);
    ctx.putImageData(imageData, 0, 0);

    if (restored) {
        // set reverse point
        State.set({ reversingAt: step });
    }

    const nextLoop = hasNextLoop(targetStep, step, restored);

    if (nextLoop) {
        setTimeout(() => compute(ctx)
            .then(pixels => update(ctx, pixels)), interval);
    }

    State.set({ step: step + 1 });

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

            ctx.drawImage(this, 0, 0, squared, squared, 0, 0, squared, squared);
            resolve(this);
        };
        img.onerror = function(error) {
            reject(error);
        };
    });

};

const plot = function(ctx) {
    contextHelper(ctx)
        .clear('#101010')
        .progress('computing..', '#ff0000');

    const { imgSrc } = State.get();
    State.set({
        step: 0,
    });// reset counter

    return loadImage(imgSrc, ctx)
        .then(() => compute(ctx))
        .then(pixelData => update(ctx, pixelData));
};

const init = function(container = document.body) {
    const canvas = initCanvas(container);
    const { ctx } = contextHelper(canvas).clear('#101010');
    const { imgSrc } = State.get();

    animation.stop();
    loadImage(imgSrc, ctx);

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

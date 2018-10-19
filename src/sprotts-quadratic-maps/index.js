/**
 * @see http://mathworld.wolfram.com/StrangeAttractor.html
 * @see http://sprott.physics.wisc.edu/
 */
import Worker from './compute.worker';
import animation from '../animation';

import { Coefficients, Patterns } from './compute';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

// state

const State = new StateProvider({
    // quantity
    maxParticles: 30000,
    scale: 100,
    // sprotts patterns
    pattern: Patterns[4],
});

// random pattern

const randomBetween = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createRandomPattern = function() {
    let pattern = '';
    let rand;

    const codes = Object.keys(Coefficients);
    const max = codes.length;

    for (let i = 0; i < 12; i += 1) {
        rand = randomBetween(0, max - 1);
        pattern += codes[rand];
    }
    return pattern;
};

// rendering

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

const update = function(ctx, chain) {

    const { width, height } = ctx.canvas;

    ctx.fillRect(0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);


    const { scale } = State.get();
    const translateCenter = (width > height) ? height / 2 : width / 2;

    let particle;

    const max = chain.length;
    let i = 0;
    let red;
    let x;
    let y;

    // clear canvas
    ctx.fillRect(0, 0, width, height);

    while (i < max) {
        particle = chain[i];

        // interpolating to canvas
        x = Math.floor(translateCenter + (scale * particle.x));
        y = Math.floor(translateCenter + (-scale * particle.y));

        red = locatePixel2D(x, y, width);
        imageData.data[red] = 255;

        i += 1;
    }

    // fill canvas
    ctx.putImageData(imageData, 0, 0);
};

// algorithm

const compute = function() {

    const state = State.get();

    return new Promise((resolve, reject) => {
        const worker = new Worker();

        worker.addEventListener('message', (e) => {
            // todo track progress
            const { chain } = e.data;
            resolve(chain);
        });

        worker.addEventListener('error', (error) => {
            reject(error);
        });

        worker.postMessage({ state });
    });

};

// plotting

const plot = function(ctx) {
    animation.stop();
    contextHelper(ctx)
        .clear('#101010')
        .progress('computing..', '#ff0000');

    return compute().then((chain) => {
        contextHelper(ctx).clear('#101010');
        animation.assign(() => update(ctx, chain)).play();
        return true;
    });
};

const init = function(container = document.body) {
    const canvas = initCanvas(container);
    const { ctx } = contextHelper(canvas).clear('#101010');
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

export { init, animation, Patterns, createRandomPattern };

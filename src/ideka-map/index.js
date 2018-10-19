/**
 * @see http://mathworld.wolfram.com/HenonMap.html
 * @see https://www.dreamincode.net/forums/topic/365205-Henon-Map/
 * @see https://www.rdocumentation.org/packages/nonlinearTseries/versions/0.2.4/topics/henon
 */
import Worker from './compute.worker';
import animation from '../animation';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

// state

const State = new StateProvider({
    // coefficients
    u: 0.918,
    // quantity
    maxParticles: 200,
    trajectoryIterations: 1000,
    scale: 100,
});

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
    animation.throttle(32);

    return {
        getState: State.get,
        reset: () => {
            State.reset();
            plot(ctx);
        },
        plot: (updates) => {
            State.set(updates);
            return plot(ctx);
        },
    };
};

export { init, animation };

/**
 * @see https://en.wikipedia.org/wiki/Ikeda_map
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
    scale: 30,
    // rendering
    drawingMode: 'pixel',
});

// rendering

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

const renderProgress = function(ctx, percent, textColor) {
    const margin = 20;
    const height = 10;
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.font = `${height}px sans-serif`;

    const msg = `${percent}%`;
    const { width } = ctx.measureText(msg);
    ctx.fillRect(margin, margin, width, height);

    ctx.fillStyle = textColor;
    ctx.fillText(msg, margin, margin);
    ctx.restore();
};

const update = function(ctx, chain, index) {

    const { width, height } = ctx.canvas;

    //ctx.fillRect(0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const { scale, maxParticles, drawingMode } = State.get();
    const translateCenter = (width > height) ? height / 2 : width / 2;

    let particle;

    const max = chain.length;
    let i = 0;
    let red;
    let x;
    let y;

    // clear canvas
    //ctx.fillRect(0, 0, width, height);

    if (drawingMode === 'path') {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(255, 0, 0)';
        ctx.lineWidth = 1;
    }

    while (i < max) {
        particle = chain[i];

        // interpolating to canvas
        x = Math.floor(translateCenter + (scale * particle.x));
        y = Math.floor(translateCenter + (-scale * particle.y));

        if (drawingMode === 'path') {
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        } else {
            red = locatePixel2D(x, y, width);
            imageData.data[red] = 255;
        }

        i += 1;
    }

    // fill canvas
    if (drawingMode === 'path') {
        ctx.stroke();
    } else {
        ctx.putImageData(imageData, 0, 0);
    }

    const percent = Math.floor(index / maxParticles * 100);
    renderProgress(ctx, percent, 'rgba(255,0,0,1)');
};

// algorithm

const compute = function(callback) {

    const state = State.get();
    const { maxParticles } = state;
    const worker = new Worker();

    let index = 0;
    return new Promise((resolve, reject) => {
        worker.addEventListener('message', (e) => {
            // todo track progress
            index += 1;

            if (index >= maxParticles) {
                resolve(true);
            }

            const { chain } = e.data;
            callback(chain, index);
            if (index < maxParticles) {
                setTimeout(() => worker.postMessage({ state, id: index }), 50);
            }

        });

        worker.addEventListener('error', (error) => {
            index += 1;
            reject(error);
        });

        worker.postMessage({ state, id: index });
    });

};

// plotting

const plot = function(ctx) {
    animation.stop();
    contextHelper(ctx)
        .clear('#101010');

    return compute((chain, index) => {
        update(ctx, chain, index);
        return true;
    }).then(() => animation.play());
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

/**
 * @see http://mathworld.wolfram.com/RoesslerAttractor.html
 * @see https://en.wikipedia.org/wiki/R%C3%B6ssler_attractor
 */
import Worker from './compute.worker';
import animation from '../animation';

import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';
import Matrix4x4 from '../space/Matrix4x4';
import Particle from '../space/Particle';

// state

const State = new StateProvider({
    // henon map algorithm params
    a: 0.2,
    b: 0.2,
    c: 5.7,
    t: 0.01,

    // quantity
    maxParticles: 3000,
    scale: 100,

    // mousemove coords
    targetX: 0,
    targetY: 0,

    focalLength: 10,
    pixelDensity: 32,

    animationMode: 'mousemove', //'continous',
});

// render calculations

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};


/**
 * computes an xy translation matrix
 */
const computeTranslationMatrixXY = function(transformX, transformY) {
    const speed = 0.05;
    const translationMatrix = Matrix4x4.translate(0, 0, 10); //?
    const scaleMatrix = Matrix4x4.scale(1000, 1000, 1000); //?
    const rotateY = Matrix4x4.rotateY(transformX * speed); // rotate around y-axis
    const rotateX = Matrix4x4.rotateX(transformY * speed); // rotate around x-axis

    // order of factors in matrix multiplication matter!
    const rotateXY = Matrix4x4.multiply(rotateY, rotateX);
    const multiply = Matrix4x4.multiply(rotateXY, translationMatrix);
    return Matrix4x4.multiply(multiply, scaleMatrix);

};

const applyTranslationMatrix = function(particle, matrix, focalLength, originX, originY) {

    const { x, y, z } = particle;

    // The first three columns of the matrix define the direction vector of the X, Y and Z axii respectively.
    //
    // |  0  1  2  3 |    | xX xY xZ  3 |
    // |  4  5  6  7 | => | yX yY yZ  7 |
    // |  8  9 10 11 |    | zX zY zZ 11 |
    // | 12 13 14 15 |    | 12 13 14 15 |

    //z-pos
    const pz = focalLength + x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14];

    if (pz <= 0) {
        // consider only points in front of camera
        return null;
    }

    const w = focalLength / pz;
    // with matrix X-coordinates
    const xi = Math.floor(w * (x * matrix[0] + y * matrix[4] + z * matrix[8]) + originX);
    // with matrix Y-coordinates
    const yi = Math.floor(w * (x * matrix[1] + y * matrix[5] + z * matrix[9]) + originY);

    return new Particle(xi, yi, 0); // 2D

};

// compute attractor

const update = function(ctx, chain) {
    const { width, height } = ctx.canvas;
    const { pixelDensity, targetX, targetY, animationMode } = State.get();
    const { count } = animation.getState();

    const transformX = (animationMode === 'mousemove') ? targetX : count;
    const transformY = (animationMode === 'mousemove') ? targetY : count;

    const imageData = ctx.getImageData(0, 0, width, height);

    // clear canvas
    ctx.fillRect(0, 0, width, height);

    const focalLength = 10;
    const matrix = computeTranslationMatrixXY(transformX, transformY);

    const originX = width / 2;
    const originY = height / 2;
    // const focalLength = 400;

    const maxIndex = imageData.data.length; //or: (width * height) * 4
    let index = maxIndex;

    let particle;
    let x;
    let y;

    let i = 0;
    const numParticles = chain.length;

    while (i < numParticles) {
        particle = applyTranslationMatrix(chain[i], matrix, focalLength, originX, originY); // cameraa?

        if (particle) {
            ({ x, y } = particle);
            index = locatePixel2D(x, y, width);

            if (index > -1 && index < maxIndex) {
                imageData.data[index] += pixelDensity;
            }
        }

        i += 1;
    }

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
    const { animationMode, targetX, targetY } = State.get();

    canvas.addEventListener('mousemove', (e) => {

        if (animationMode !== 'mousemove') {
            return;
        }

        State.set({
            targetX: (e.clientX - targetX) * 0.1,
            targetY: (e.clientY - targetY) * 0.1,
        });

    }, false);

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

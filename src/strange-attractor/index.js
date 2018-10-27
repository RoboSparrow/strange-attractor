/**
 * @see http://mathworld.wolfram.com/StrangeAttractor.html
 * @see https://mrdoob.com/#/107/strange_attractor
 */

import Particle from '../space/Particle';
import Matrix4x4 from '../space/Matrix4x4';

import animation from '../animation';
import initCanvas, { contextHelper } from '../canvas';
import StateProvider from '../state';

// state

const State = new StateProvider({
    // animation types: continous, mousemove
    animationMode: 'continous',

    maxParticles: 1024 * 300,

    // mousemove coords
    targetX: 0,
    targetY: 0,

    focalLength: 10,
    pixelDensity: 32,
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
    const rotateY = Matrix4x4.rotateY(transformX * speed); // rotate around y-axis
    const rotateX = Matrix4x4.rotateX(transformY * speed); // rotate around x-axis

    // order of factors in matrix multiplication matter!
    const rotateXY = Matrix4x4.multiply(rotateY, rotateX);
    return Matrix4x4.multiply(rotateXY, translationMatrix);
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

const compute = function() {
    const { maxParticles } = State.get();

    const scale = 40.0;

    const _a = 1.111;
    const _b = 1.479;
    const _f = 4.494;
    const _g = 0.44;
    const _d = 0.135;

    let cx = 1.0;
    let cy = 1.0;
    let cz = 1.0;
    let mx = 0.0;
    let my = 0.0;
    let mz = 0.0;

    const chain = []; //todo new Float32Array(maxParticles * 3)
    let particle;

    let i = 0;
    while (i < maxParticles) {

        mx = cx + _d * (-_a * cx - cy * cy - cz * cz + _a * _f);
        my = cy + _d * (-cy + cx * cy - _b * cx * cz + _g);
        mz = cz + _d * (-cz + _b * cx * cy + cx * cz);

        // prevent infinity: largest integer +/- 9007199254740991 (+/- 2^53)
        /* eslint-disable no-restricted-globals */
        if (!isFinite(mx) || !isFinite(my) || !isFinite(mz)) {
            mx = 0;
            my = 0;
            mz = 0;
        }
        /* eslint-enable no-restricted-globals */

        cx = mx;
        cy = my;
        cz = mz;

        particle = new Particle();
        particle.x = mx * scale;
        particle.y = my * scale;
        particle.z = mz * scale;
        chain[i] = particle;

        i += 1;
    }

    return chain;
};

// render

const update = function(ctx, chain) {

    const { count } = animation.getState();
    const { targetX, targetY, focalLength, pixelDensity, animationMode } = State.get();

    const transformX = (animationMode === 'mousemove') ? targetX : count;
    const transformY = (animationMode === 'mousemove') ? targetY : count;

    const { width, height } = ctx.canvas;

    ctx.fillRect(0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
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

const plot = function(ctx) {
    const chain = compute();

    animation.assign(() => update(ctx, chain)).play();
};

const init = function(container) {
    const canvas = initCanvas(container);
    const { ctx } = contextHelper(canvas).clear('#101010');

    canvas.addEventListener('mousemove', (e) => {

        const { animationMode, targetX, targetY } = State.get();

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

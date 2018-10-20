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

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

const computeTranslationMatrix = function(transformX, transformY) {
    const translationMatrix = Matrix4x4.translate(0, 0, 10);

    let matrix = Matrix4x4.rotateY(transformX * 0.05);
    matrix = Matrix4x4.multiply(matrix, Matrix4x4.rotateX(transformY * 0.05));
    matrix = Matrix4x4.multiply(matrix, translationMatrix);
    return matrix;
};

const applyTranslationMatrix = function(particle, matrix, focalLength, cx, cy) {
    const { x, y, z } = particle;

    // 00 this.I00; 01 this.I01; 02 this.I02; 03 this.I03;
    // 04 this.I10; 05 this.I11; 06 this.I12; 07 this.I13;
    // 08 this.I20; 09 this.I21; 10 this.I22; 11 this.I23;
    // 12 this.I30; 13 this.I31; 14 this.I32; 15 this.I33;

    const pz = focalLength + x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14];
    if (pz <= 0) {
        return false;
    }

    const w = focalLength / pz;
    const xi = Math.floor(w * (x * matrix[0] + y * matrix[4] + z * matrix[8]) + cx);
    const yi = Math.floor(w * (x * matrix[1] + y * matrix[5] + z * matrix[9]) + cy);

    return new Particle(xi, yi, 0);
};

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

const update = function(ctx, chain) {

    const { count } = animation.getState();
    const { targetX, targetY, focalLength, pixelDensity, animationMode } = State.get();

    const transformX = (animationMode === 'mousemove') ? targetX : count;
    const transformY = (animationMode === 'mousemove') ? targetY : count;

    const { width, height } = ctx.canvas;

    ctx.fillRect(0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const matrix = computeTranslationMatrix(transformX, transformY);

    const cx = 275;
    const cy = 200;//TODO canvas/2?
    // const focalLength = 400;

    let x = 0;
    let y = 0;

    const maxIndex = imageData.data.length; //or: (width * height) * 4
    let index = maxIndex;

    let particle;
    let i = 0;
    const numParticles = chain.length;

    while (i < numParticles) {
        particle = applyTranslationMatrix(chain[i], matrix, focalLength, cx, cy);

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
    animation.throttle(32);

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

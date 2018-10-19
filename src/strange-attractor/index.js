/**
 * @see http://mathworld.wolfram.com/StrangeAttractor.html
 * @see https://mrdoob.com/#/107/strange_attractor
 */

import Particle from '../space/Particle';
import Matrix4x4, { idendityMatrix } from '../space/Matrix4x4';

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

const update = function(ctx, chain, matrix) {

    const { count } = animation.getState();
    const { targetX, targetY, focalLength, pixelDensity, animationMode } = State.get();

    const transformX = (animationMode === 'mousemove') ? targetX : count;
    const transformY = (animationMode === 'mousemove') ? targetY : count;

    const { width, height } = ctx.canvas;

    ctx.fillRect(0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    const translationMatrix = Matrix4x4.translate(0, 0, 10);

    matrix = Matrix4x4.rotateY(transformX * 0.05);
    matrix = Matrix4x4.multiply(matrix, Matrix4x4.rotateX(transformY * 0.05));
    matrix = Matrix4x4.multiply(matrix, translationMatrix);

    const cx = 275;
    const cy = 200;//TODO canvas/2?
    // const focalLength = 400;

    let xi = 0;
    let yi = 0;
    let w = 0;
    let x = 0;
    let y = 0;
    let z = 0;
    let pz = 0;

    const maxIndex = imageData.data.length; //or: (width * height) * 4
    let index = maxIndex;

    let particle;

    let i = 0;
    const numParticles = chain.length;

    while (i < numParticles) {
        particle = chain[i];
        ({ x, y, z } = particle);

        // 00 this.I00; 01 this.I01; 02 this.I02; 03 this.I03;
        // 04 this.I10; 05 this.I11; 06 this.I12; 07 this.I13;
        // 08 this.I20; 09 this.I21; 10 this.I22; 11 this.I23;
        // 12 this.I30; 13 this.I31; 14 this.I32; 15 this.I33;

        pz = focalLength + x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14];

        if (pz > 0) {

            xi = Math.floor((w = focalLength / pz) * (x * matrix[0] + y * matrix[4] + z * matrix[8]) + cx);
            yi = Math.floor(w * (x * matrix[1] + y * matrix[5] + z * matrix[9]) + cy);

            index = (xi + yi * width) * 4; //rgb - red

            if (index > -1 && index < maxIndex) {
                imageData.data[index] += pixelDensity;
            }

        }

        i += 1;
    }

    ctx.putImageData(imageData, 0, 0);
};

const plot = function(ctx) {
    const matrix = idendityMatrix(); // todo move out?
    const chain = compute();

    animation.assign(() => update(ctx, chain, matrix)).play();
};

const init = function(container) {
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

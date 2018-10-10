import Particle from '../space/Particle';
import Matrix4x4, { idendityMatrix } from '../space/Matrix4x4';

import animation from '../animate';
import initCanvas from '../canvas';

const STATE = {
    // animation types: continous, mousemove
    animate: 'continous',

    // mousemove coords
    targetX: 0,
    targetY: 0,

    focalLength: 400,
    pixelDensity: 32,
};

const getState = function() {
    return STATE;
};

const MaxParticles = 1024 * 300;

const createParticleChain = function(max = MaxParticles) {

    const chain = new Particle();
    let current = chain;
    let count = max;

    while (count > 0) {
        current.next = new Particle();
        current = current.next;
        count -= 1;
    }

    return chain;
};

const applyAttractor = function(chain) {
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

    let particle = chain;

    while (particle !== null) {

        mx = cx + _d * (-_a * cx - cy * cy - cz * cz + _a * _f);
        my = cy + _d * (-cy + cx * cy - _b * cx * cz + _g);
        mz = cz + _d * (-cz + _b * cx * cy + cx * cz);

        cx = mx;
        cy = my;
        cz = mz;

        particle.x = mx * scale;
        particle.y = my * scale;
        particle.z = mz * scale;

        particle = particle.next;
    }

};

const update = function(ctx, chain, matrix) {

    const { count } = animation.getState();
    const { targetX, targetY, focalLength, pixelDensity } = getState();

    const transformX = (STATE.animate === 'mousemove') ? targetX : count;
    const transformY = (STATE.animate === 'mousemove') ? targetY : count;

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

    let particle = chain;

    while (particle !== null) {

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

        particle = particle.next;
    }

    ctx.putImageData(imageData, 0, 0);
};

const initcontext2d = function(canvas) {
    const { width, height } = canvas;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, width, height);
    return ctx;
};

const init = function(container = document.body, bindState = {}) {

    const canvas = initCanvas(container);
    const ctx = initcontext2d(canvas);
    const chain = createParticleChain();
    const matrix = idendityMatrix();

    applyAttractor(chain);

    canvas.addEventListener('mousemove', (e) => {
        if (STATE.animate !== 'mousemove') {
            return;
        }

        STATE.targetX += (e.clientX - STATE.targetX) * 0.1;
        STATE.targetY += (e.clientY - STATE.targetY) * 0.1;
    }, false);

    animation.init(() => update(ctx, chain, matrix), { fps: 32 });

    Object.assign(bindState, STATE);
};

const getAnimationState = animation.getState;

export { init, getState, getAnimationState };

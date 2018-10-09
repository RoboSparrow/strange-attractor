/**
 * @see http://mathworld.wolfram.com/HenonMap.html
 * @see https://www.dreamincode.net/forums/topic/365205-Henon-Map/
 * @see https://www.rdocumentation.org/packages/nonlinearTseries/versions/0.2.4/topics/henon
 */

import Particle from '../space/Particle';
import animation from '../animate';

import initCanvas from '../canvas';

const STATE = {
};

const getState = function() {
    return STATE;
};

const MaxParticles = 3000;

const createParticleChain = function(max = MaxParticles) {
    const chain = [];
    let count = 0;

    while (count < max) {
        chain.push(new Particle());
        count += 1;
    }

    return chain;
};

const applyAttractor = function(chain) {
    const scale = 1.0;

    let x = 0.0;
    let y = 0.0;
    let z = 0.0;

    let particle;
    let prev = null;

    let i = 0;
    const max = chain.length;

    const alpha = 1.4;
    const beta = 0.3;

    while (i < max) {

        particle = chain[i];

        if (i === 0) {

            x = 0.1;
            y = 0.3;
            z = 0;

        } else {

            prev = chain[i - 1];

            x = prev.y + 1.0 - alpha * (prev.x * prev.x);
            y = beta * prev.x;
            z = 1 * particle.z;

            // prevent infinity
            if (Math.abs(x) > 1e6 || Math.abs(y) > 1e6) {
                x = 0;
                y = 0;
            }
        }

        particle.x = x * scale;
        particle.y = y * scale;
        particle.z = z * scale;

        i += 1;
    }
    console.log(chain);
    return chain;
};

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

//ctx.putImageData(myImageData, dx, dy);

const update = function(ctx, chain) {

    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);

    // toto to state
    const scale = 100;
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

    // fillcanvas
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
    let chain;

    const canvas = initCanvas(container);
    const ctx = initcontext2d(canvas);

    chain = createParticleChain();
    chain = applyAttractor(chain);

    canvas.addEventListener('mousemove', (e) => {
        if (STATE.animate !== 'mousemove') {
            return;
        }

        STATE.targetX += (e.clientX - STATE.targetX) * 0.1;
        STATE.targetY += (e.clientY - STATE.targetY) * 0.1;
    }, false);

    animation.init(() => update(ctx, chain), { fps: 32 });

    Object.assign(bindState, STATE);
};

const getAnimationState = animation.getState;

export { init, getState, getAnimationState };

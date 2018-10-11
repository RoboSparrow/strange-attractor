/**
 * @see http://mathworld.wolfram.com/StrangeAttractor.html
 * @see http://sprott.physics.wisc.edu/
 */

import Particle from '../space/Particle';
import animation from '../animation';

import initCanvas from '../canvas';

const Coefficients = Object.freeze({
    A: -1.2,
    B: -1.1,
    C: -1.0,
    D: -0.9,
    E: -0.8,
    F: -0.7,
    G: -0.6,
    H: -0.5,
    I: -0.4,
    J: -0.3,
    K: -0.2,
    L: -0.1,
    M: 0,
    N: 0.1,
    O: 0.2,
    P: 0.3,
    Q: 0.4,
    R: 0.5,
    S: 0.6,
    T: 0.7,
    U: 0.8,
    V: 0.9,
    W: 1.0,
    X: 1.1,
    Y: 1.2,
});

const Patterns = Object.freeze([
    'AMTMNQQXUYGA',
    'CVQKGHQTPHTE',
    'FIRCDERRPVLD',
    'GIIETPIQRRUL',
    'GLXOESFTTPSV', // start
    'GXQSNSKEECTX',
    'HGUHDPHNSGOH',
    'ILIBVPKJWGRR',
    'LUFBBFISGJYS',
    'MCRBIPOPHTBN',
    'MDVAIDOYHYEA',
    'ODGQCNXODNYA',
    'QFFVSLMJJGCR',
    'UWACXDQIGKHF',
    'VBWNBDELYHUL',
    'WNCSLFLGIHGL',
]);

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
        console.log(rand, codes[rand]);
        pattern += codes[rand];
    }
    console.log('---------');
    return pattern;
};
//// state

const Defaults = Object.freeze({
    // quantity
    maxParticles: 300000,
    scale: 100,
    // sprotts patterns
    pattern: Patterns[4],
});

const State = Object.assign({}, Defaults);

const resetState = function() {
    return Object.assign(State, Defaults);
};

const getState = function() {
    return Object.assign({}, State);
};

const setState = function(updates) {
    return Object.assign(State, updates);
};

const createParticleChain = function() {
    const chain = [];
    let count = 0;
    const { maxParticles } = getState();

    while (count < maxParticles) {
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

    while (i < max) {

        particle = chain[i];

        if (i === 0) {

            x = 0;
            y = 0;
            z = 0;

        } else {

            prev = chain[i - 1];

            /*
             * Julien C. Sprott, STRANGE ATTRACTORS, page 58
             * Xn+1 = a1 + a2Xn + a3Xn^2 + a4XnYn + a5Yn + a6Yn^2
             * Yn+1 = a7 + a8Xn + a9Xn^2 + a10XnYn + a11Yn + a12Yn^2
            */
            const { pattern } = getState();
            const a = [null].concat(pattern.split('').map(letter => Coefficients[letter])); //todo function

            /* eslint-disable computed-property-spacing */
            x = a[ 1] + (a[ 2] * prev.x) + (a[ 3] * (prev.x ** 2)) + (a[ 4] * prev.x * prev.y) + (a[ 5] * prev.y) + (a[ 6] * (prev.y ** 2));
            y = a[ 7] + (a[ 8] * prev.x) + (a[ 9] * (prev.x ** 2)) + (a[10] * prev.x * prev.y) + (a[11] * prev.y) + (a[12] * (prev.y ** 2));
            z = 1 * particle.z;
            /* eslint-enable computed-property-spacing */

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

    return chain;
};

const locatePixel2D = function(x, y, width) {
    return y * (width * 4) + x * 4;
};

//ctx.putImageData(myImageData, dx, dy);

const update = function(ctx, chain) {

    const { width, height } = ctx.canvas;

    ctx.fillRect(0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);

    // toto to state
    const { scale } = getState();
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

const initcontext2d = function(canvas) {
    const { width, height } = canvas;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#101010';
    ctx.fillRect(0, 0, width, height);
    return ctx;
};

const plot = function(ctx) {
    let chain;

    chain = createParticleChain();
    chain = applyAttractor(chain);

    animation.init(() => update(ctx, chain), { fps: 32 });
};

const init = function(container = document.body) {
    const canvas = initCanvas(container);
    const ctx = initcontext2d(canvas);

    return {
        getState,
        reset: () => {
            resetState();
            plot(ctx);
        },
        plot: (updates) => {
            setState(updates);
            plot(ctx);
        },
    };
};

export { init, animation, Coefficients, Patterns, createRandomPattern };

/**
 * @see https://en.wikipedia.org/wiki/Ikeda_map
 */

import Particle from '../space/Particle';

const randomBetween = function(min, max) {
    return Math.random() * (max - min + 1) + min;
};

const computeT = function(particle) {
    return 0.4 - 6 / (1 + (particle.x ** 2) + (particle.y ** 2));
};

const computeIkedaPoint = function(prev, u) {
    // x1 = 1 + u*(x*cos(t) - y*sin(t)) ;
    // y1 = u*(x*sin(t) + y*cos(t)) ;
    const t = computeT(prev);
    let x = 1 + u * (prev.x * Math.cos(t) - prev.y * Math.sin(t));
    let y = u * (prev.x * Math.sin(t) + prev.y * Math.cos(t));
    const z = 0;

    // prevent infinity: largest integer +/- 9007199254740991 (+/- 2^53)
    /* eslint-disable no-restricted-globals */
    if (!isFinite(x) || !isFinite(y)) {
        x = 0;
        y = 0;
    }
    /* eslint-enable no-restricted-globals */

    return new Particle(x, y, z);
};

const computeIdekaTrail = function(origin, state) {

    const { trajectoryIterations, u } = state;
    const chain = [origin];

    let prev = null;
    let i = 1;

    while (i < trajectoryIterations) {
        prev = chain[i - 1];
        chain[i] = computeIkedaPoint(prev, u);
        i += 1;
    }
    i += 1;

    return chain;

};

const compute = function(state) {

    const { maxParticles } = state;
    let chain = [];

    let prev = null;
    let i = 0;

    while (i < maxParticles) {
        prev = new Particle(randomBetween(-1, 1), randomBetween(-1, 1), 0);
        chain = chain.concat(computeIdekaTrail(prev, state));
        i += 1;
    }

    return chain;

};


export default compute;

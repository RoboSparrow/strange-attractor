import Particle from '../space/Particle';

const compute = function(state) {

    const { maxParticles } = state;
    const scale = 1.0;

    let x = 0.0;
    let y = 0.0;
    let z = 0.0;

    const chain = []; // todo new Float32Array(maxParticles * 3)
    let particle;
    let prev = null;

    let i = 0;
    while (i < maxParticles) {

        if (i === 0) {

            x = 0.9237274331240513; // Math.random();
            y = -0.0629007300535831; //-Math.random();
            z = 0;

        } else {

            prev = chain[i - 1];

            x = 1.0 - prev.y + Math.abs(prev.x);
            y = prev.x;
            z = 0;

            // prevent infinity: largest integer +/- 9007199254740991 (+/- 2^53)
            /* eslint-disable no-restricted-globals */
            if (!isFinite(x) || !isFinite(y)) {
                x = 0;
                y = 0;
            }
            /* eslint-enable no-restricted-globals */
        }

        particle = new Particle();
        particle.x = x * scale;
        particle.y = y * scale;
        particle.z = z * scale;
        chain[i] = particle;

        i += 1;
    }

    return chain;
};

export default compute;

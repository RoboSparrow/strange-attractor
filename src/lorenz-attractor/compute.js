/**
 * @see https://en.wikipedia.org/wiki/Lorenz_system
 */
import Particle from '../space/Particle';

const compute = function(state) {
    const { a, b, c, maxParticles } = state;
    const scale = 1.0;

    let x = 0.1;
    let y = 0;
    let z = 0;

    const t = 0.01;

    const chain = []; //todo new Float32Array(maxParticles * 3)
    let particle;
    let prev = null;

    let i = 0;
    while (i < maxParticles) {

        if (i === 0) {

            x = 0.1;
            y = 0;
            z = 0;

        } else {

            prev = chain[i - 1];

            x = prev.x + t * a * (prev.y - prev.x);
            y = prev.y + t * (prev.x * (b - prev.z) - prev.y);
            z = prev.z + t * (prev.x * prev.y - c * prev.z);
            // prevent infinity: largest integer +/- 9007199254740991 (+/- 2^53)
            /* eslint-disable no-restricted-globals */
            if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
                x = 0;
                y = 0;
                z = 0;
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

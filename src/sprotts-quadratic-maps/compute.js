import Particle from '../space/Particle';


// sprott's coefficents

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

const compute = function(state) {

    const { maxParticles, pattern } = state;
    const scale = 1.0;

    let x = 0.0;
    let y = 0.0;
    let z = 0.0;

    const chain = []; //todo new Float32Array(maxParticles)
    let particle;
    let prev = null;

    let i = 0;
    while (i < maxParticles) {

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

            const a = [null].concat(pattern.split('').map(letter => Coefficients[letter])); //todo function

            /* eslint-disable computed-property-spacing */
            x = a[ 1] + (a[ 2] * prev.x) + (a[ 3] * (prev.x ** 2)) + (a[ 4] * prev.x * prev.y) + (a[ 5] * prev.y) + (a[ 6] * (prev.y ** 2));
            y = a[ 7] + (a[ 8] * prev.x) + (a[ 9] * (prev.x ** 2)) + (a[10] * prev.x * prev.y) + (a[11] * prev.y) + (a[12] * (prev.y ** 2));
            z = 0;
            /* eslint-enable computed-property-spacing */

            // prevent infinity
            if (Math.abs(x) > 1e6 || Math.abs(y) > 1e6) {
                x = 0;
                y = 0;
            }
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

export { compute as default, Coefficients, Patterns };

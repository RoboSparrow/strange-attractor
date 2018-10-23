import Particle from '../space/Particle';

const compute = function(state) {

    const { maxParticles, a, b, c, t } = state;
    const scale = 1;

    let x = 0.1;
    let y = 0.0;
    let z = 0.0;

    const chain = [new Particle(x, y, z)]; //todo new Float32Array(maxParticles * 3)
    let particle;
    let prev = null;

    let i = 1;
    let dt = 0;

    while (i < maxParticles) {
        prev = chain[i - 1];
        //x_n1=x_n+h*(-y_n-z_n)
        //y_n1=y_n+h*(x_n+a*y_n)
        //z_n1=z_n+h*(b+z_n*(x_n-c))

        x = prev.x + dt * (-prev.y - prev.z);
        y = prev.y + dt * (prev.x + a * prev.y);
        z = prev.z + dt * (b + prev.z * (prev.x - c));


        // prevent infinity: largest integer +/- 9007199254740991 (+/- 2^53)
        /* eslint-disable no-restricted-globals */
        if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
            x = 0;
            y = 0;
            z = 0;
        }
        /* eslint-enable no-restricted-globals */

        // The stability in the x , y plane can then be found by calculating the eigenvalues of the Jacobian
        // const jacobian = [
        //     0, -1,
        //     1, a,
        // ];

        particle = new Particle();
        particle.x = x * scale;
        particle.y = y * scale;
        particle.z = z * scale;
        chain[i] = particle;

        i += 1;
        dt += t;
    }

    // console.log(JSON.stringify(chain, null, 4));
    return chain;

};

export default compute;

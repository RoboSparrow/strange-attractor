import assert from 'assert';
import M from '../src/space/Matrix4x4';

/**
 * test drived from https://www.scratchapixel.com/lessons/3d-basic-rendering/computing-pixel-coordinates-of-3d-point/mathematics-computing-2d-coordinates-of-3d-points
 */

const matrixLocal = [
    0.718762, 0.615033, -0.324214, 0,
    -0.393732, 0.744416, 0.539277, 0,
    0.573024, -0.259959, 0.777216, 0,
    0.526967, 1.254234, -2.53215, 1,
];

const pointLocal = [
    -0.5, // x
    0.5, // y
    -0.5, // z
];

describe('Example test', function() {

    // compute point world coordinates from local coordinates
    const pointWorld = M.multiplyVector(pointLocal, matrixLocal);
    // expect [-0.315792 1.4489 -2.48901]

    // Let's now transform the world coordinates of this point, to local coordinates.
    const invertedLocalMatrix = M.invert(matrixLocal);
    const pointLocalReversed = M.multiplyVector(pointLocal, invertedLocalMatrix);
    //i.e [ -0.5, 0.5, -0.5 ] sth like [ -0.5000009536743164, 0.5, -0.5 ]

    it('pointWorld = pointLocal ∗ matrixLocal', function() {
        assert.strictEqual(pointWorld[0].toFixed(6), '-0.315792');
        assert.strictEqual(pointWorld[1].toFixed(4), '1.4489');
        assert.strictEqual(pointWorld[2].toFixed(5), '-2.48901');
    });

    it('pointLocal = pointLocal * matrixLocal(inversed)', function() {
        assert.strictEqual(pointLocalReversed[0].toFixed(1), pointLocal[0].toFixed(1));
        assert.strictEqual(pointLocalReversed[1].toFixed(1), pointLocal[1].toFixed(1));
        assert.strictEqual(pointLocalReversed[2].toFixed(1), pointLocal[2].toFixed(1));
    });

});

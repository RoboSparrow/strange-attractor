import { assert } from 'chai';
import M, { idendityMatrix } from '../src/space/Matrix4x4';

/**
 * https://www.scratchapixel.com/code.php?id=23&origin=/lessons/3d-basic-rendering/computing-pixel-coordinates-of-3d-point&src=1
 * geometry.h
 */
describe('Inverse M', function() {

    const matrix = [
        0.707107, 0, -0.707107, 0,
        -0.331295, 0.883452, -0.331295, 0,
        0.624695, 0.468521, 0.624695, 0,
        4.000574, 3.00043, 4.000574, 1
    ];

    const expected = [
        0.707107, -0.331295, 0.624695, 0,
        0, 0.883452, 0.468521, 0,
        -0.707107, -0.331295, 0.624695, 0,
        0, 0, -6.404043, 1,
    ];

    const inverted = M.invert(M.create(matrix));

    it('inverted matrix is a Float32Array', function() {
        assert.strictEqual(inverted.constructor.name, 'Float32Array');
    });

    it('inverted matrix length', function() {
        assert.strictEqual(inverted.length, idendityMatrix().length);
    });

    it('inverted matrix should match the expected matrix', function() {
        for (let i = 0; i < inverted.length; i += 1) {
            assert.closeTo(inverted[i], expected[i], 0.00001, `expected[${i}]`);
        }
    });

});

/**
 * test derived from https://www.scratchapixel.com/lessons/3d-basic-rendering/computing-pixel-coordinates-of-3d-point/mathematics-computing-2d-coordinates-of-3d-points
 */

describe('Point WorldM => LocalM => WorldM', function() {

    const mLocal = Object.freeze([
        0.718762, 0.615033, -0.324214, 0,
        -0.393732, 0.744416, 0.539277, 0,
        0.573024, -0.259959, 0.777216,
        0, 0.526967, 1.254234, -2.53215, 1,
    ]);

    const pLocal = Object.freeze([
        -0.5, // x
        0.5, // y
        -0.5, // z
    ]);

    const expected = Object.freeze([
        -0.315792,
        1.448900,
        -2.489010,
    ]);

    //// compute point world coordinates from local coordinates
    // expect [-0.315792 1.4489 -2.48901]
    const pointWorld = M.multiplyVector(pLocal[0], pLocal[1], pLocal[2], mLocal);

    //// Let's now transform the world coordinates of this point, to local coordinates.
    // i.e [ -0.5, 0.5, -0.5 ] expect sth like [ -0.5000009536743164, 0.5, -0.5 ]  (floating point precision)
    const mInverted = M.invert(mLocal);
    const pLocalReversed = M.multiplyVector(pointWorld[0], pointWorld[1], pointWorld[2], mInverted);

    it('pointWorld = pLocal ∗ mLocal', function() {
        for (let i = 0; i < pointWorld.length; i += 1) {
            assert.closeTo(pointWorld[i], expected[i], 0.00001, `expected[${i}]`);
        }
    });

    it('pLocal = pLocal * mLocal(inversed)', function() {
        for (let i = 0; i < pLocalReversed.length; i += 1) {
            assert.closeTo(pLocalReversed[i], pLocal[i], 0.00001, `expected[${i}]`);
        }
    });

});

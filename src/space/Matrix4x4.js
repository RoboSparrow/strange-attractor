
////
//
// @see http://www.opengl-tutorial.org/beginners-tutorials/tutorial-3-matrices/
// @see https://github.com/RoboSparrow/Matrix-and-Quaternions-FAQ/blob/master/Matrix%20and%20Quaternion%20FAQ.md
//
// | 1  0  0  Tx|   | x |   | x + Tx |
// | 0  1  0  Ty|   | y |   | y + Ty |
// | 0  0  1  Tz| x | z | = | z + Tz |
// | 0  0  0   1|   | 1 |   |   1    |
//
// differences to OpenGL
// In this document (as in most math textbooks), all matrices are drawn in the standard mathematical manner.
// Unfortunately graphics libraries like IrisGL, OpenGL and SGI's Performer all represent them with the rows and columns swapped.
// This Document                  OpenGL
//        | 0  1  2  3  |            | 0  4  8  12 |
//        |             |            |             |
//        | 4  5  6  7  |            | 1  5  9  13 |
//    M = |             |        M = |             |
//        | 8  9  10 11 |            | 2  6  10 14 |
//        |             |            |             |
//        | 12 13 14 15 |            | 3  7  11 15 |
////

const idendityMatrix = function() {
    /*
        00 | 01 | 02 | 03
        04 | 05 | 06 | 07
        08 | 09 | 10 | 11
        12 | 13 | 14 | 15

        mrdoob

        00 this.I00; 01 this.I01; 02 this.I02; 03 this.I03;
        04 this.I10; 05 this.I11; 06 this.I12; 07 this.I13;
        08 this.I20; 09 this.I21; 10 this.I22; 11 this.I23;
        12 this.I30; 13 this.I31; 14 this.I32; 15 this.I33;
    */
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
};

const Matrix4x4 = {

    translate: function(x, y, z) {

        const m = idendityMatrix();

        m[3] = x;
        m[7] = y;
        m[11] = z;

        return m;
    },

    rotateX: function(rad) {

        const m = idendityMatrix();
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        m[5] = cos;
        m[6] = -sin;
        m[9] = sin;
        m[10] = cos;

        return m;
    },

    rotateY: function(rad) {

        // 00 this.I00; 01 this.I01; 02 this.I02; 03 this.I03;
        // 04 this.I10; 05 this.I11; 06 this.I12; 07 this.I13;
        // 08 this.I20; 09 this.I21; 10 this.I22; 11 this.I23;
        // 12 this.I30; 13 this.I31; 14 this.I32; 15 this.I33;

        const m = idendityMatrix();
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        m[0] = cos;
        m[2] = -sin;
        m[8] = sin;
        m[10] = cos;

        return m;
    },

    multiply: function(m1, m2) {

        const m = idendityMatrix();

        m[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8];
        m[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9];
        m[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10];
        m[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3];

        m[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8];
        m[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9];
        m[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10];
        m[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7];

        m[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8];
        m[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9];
        m[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10];
        m[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11];

        m[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8];
        m[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9];
        m[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10];
        m[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m[15];

        return m;
    }
};

export { Matrix4x4 as default, idendityMatrix };

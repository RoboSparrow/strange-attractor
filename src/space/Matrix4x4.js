
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
//
// http://www.euclideanspace.com/maths/algebra/matrix
//
// M00:0   M01:1   M02:2   M03:3
// M10:4   M11:5   M12:6   M13:7
// M20:8   M21:9   M22:10  M23:11
// M30:12  M31:13  M32:14  M33:15
//
// mrdoob
//
//  0 this.I00;  1 this.I01;  2 this.I02;  3 this.I03;
//  4 this.I10;  5 this.I11;  6 this.I12;  7 this.I13;
//  8 this.I20;  9 this.I21; 10 this.I22; 11 this.I23;
// 12 this.I30; 13 this.I31; 14 this.I32; 15 this.I33;
////

const idendityMatrix = function() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]);
};

const nullMatrix = function() {
    return new Float32Array(16);
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

        const m = idendityMatrix();
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        m[0] = cos;
        m[2] = -sin;
        m[8] = sin;
        m[10] = cos;

        return m;
    },

    //        | 0  1  2  3  |         | X  0  0  0 |
    //        |             |         |            |
    //        | 4  5  6  7  |         | 0  Y  0  0 |
    //    M = |             |     M = |            |
    //        | 8  9  10 11 |         | 0  0  Z  0 |
    //        |             |         |            |
    //        | 12 13 14 15 |         | 0  0  0  1 |

    scale: function(xScale = 1, yScale = 1, zScale = 1) {

        const m = idendityMatrix();

        m[0] = xScale;
        m[5] = yScale;
        m[10] = zScale;

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
    },

    // Multiply a vector array [x,y,z] into am matrix
    // rule: multiply row into column and sum the result
    // todo automate in general for different matrices (flexible col number)

    multiplyVector: function(xyz, m) {
        const [x, y, z] = xyz;
        const w = 1;
        m = m || idendityMatrix();
        return [
            x * m[0] + y * m[4] + z * m[8] + w * m[12],
            x * m[1] + y * m[5] + z * m[9] + w * m[13],
            x * m[2] + y * m[6] + z * m[10] + w * m[14],
        ];
    },

    // converted from http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

    determinant: function(m) {
        const rd = m[3] * m[6] * m[9] * m[12] - m[2] * m[7] * m[9] * m[12] - m[3] * m[5] * m[10] * m[12] + m[1] * m[7] * m[10] * m[12]
            + m[2] * m[5] * m[11] * m[12] - m[1] * m[6] * m[11] * m[12] - m[3] * m[6] * m[8] * m[13] + m[2] * m[7] * m[8] * m[13]
            + m[3] * m[4] * m[10] * m[13] - m[0] * m[7] * m[10] * m[13] - m[2] * m[4] * m[11] * m[13] + m[0] * m[6] * m[11] * m[13]
            + m[3] * m[5] * m[8] * m[14] - m[1] * m[7] * m[8] * m[14] - m[3] * m[4] * m[9] * m[14] + m[0] * m[7] * m[9] * m[14]
            + m[1] * m[4] * m[11] * m[14] - m[0] * m[5] * m[11] * m[14] - m[2] * m[5] * m[8] * m[15] + m[1] * m[6] * m[8] * m[15]
            + m[2] * m[4] * m[9] * m[15] - m[0] * m[6] * m[9] * m[15] - m[1] * m[4] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
        return rd;
    },

    // converted from http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

    invert: function(m) {
        const r = nullMatrix(); //TODO or empty
        r[0] = m[6] * m[11] * m[13] - m[7] * m[10] * m[13] + m[7] * m[9] * m[14] - m[5] * m[11] * m[14] - m[6] * m[9] * m[15] + m[5] * m[10] * m[15];
        r[1] = m[3] * m[10] * m[13] - m[2] * m[11] * m[13] - m[3] * m[9] * m[14] + m[1] * m[11] * m[14] + m[2] * m[9] * m[15] - m[1] * m[10] * m[15];
        r[2] = m[2] * m[7] * m[13] - m[3] * m[6] * m[13] + m[3] * m[5] * m[14] - m[1] * m[7] * m[14] - m[2] * m[5] * m[15] + m[1] * m[6] * m[15];
        r[3] = m[3] * m[6] * m[9] - m[2] * m[7] * m[9] - m[3] * m[5] * m[10] + m[1] * m[7] * m[10] + m[2] * m[5] * m[11] - m[1] * m[6] * m[11];
        r[4] = m[7] * m[10] * m[12] - m[6] * m[11] * m[12] - m[7] * m[8] * m[14] + m[4] * m[11] * m[14] + m[6] * m[8] * m[15] - m[4] * m[10] * m[15];
        r[5] = m[2] * m[11] * m[12] - m[3] * m[10] * m[12] + m[3] * m[8] * m[14] - m[0] * m[11] * m[14] - m[2] * m[8] * m[15] + m[0] * m[10] * m[15];
        r[6] = m[3] * m[6] * m[12] - m[2] * m[7] * m[12] - m[3] * m[4] * m[14] + m[0] * m[7] * m[14] + m[2] * m[4] * m[15] - m[0] * m[6] * m[15];
        r[7] = m[2] * m[7] * m[8] - m[3] * m[6] * m[8] + m[3] * m[4] * m[10] - m[0] * m[7] * m[10] - m[2] * m[4] * m[11] + m[0] * m[6] * m[11];
        r[8] = m[5] * m[11] * m[12] - m[7] * m[9] * m[12] + m[7] * m[8] * m[13] - m[4] * m[11] * m[13] - m[5] * m[8] * m[15] + m[4] * m[9] * m[15];
        r[9] = m[3] * m[9] * m[12] - m[1] * m[11] * m[12] - m[3] * m[8] * m[13] + m[0] * m[11] * m[13] + m[1] * m[8] * m[15] - m[0] * m[9] * m[15];
        r[10] = m[1] * m[7] * m[12] - m[3] * m[5] * m[12] + m[3] * m[4] * m[13] - m[0] * m[7] * m[13] - m[1] * m[4] * m[15] + m[0] * m[5] * m[15];
        r[11] = m[3] * m[5] * m[8] - m[1] * m[7] * m[8] - m[3] * m[4] * m[9] + m[0] * m[7] * m[9] + m[1] * m[4] * m[11] - m[0] * m[5] * m[11];
        r[12] = m[6] * m[9] * m[12] - m[5] * m[10] * m[12] - m[6] * m[8] * m[13] + m[4] * m[10] * m[13] + m[5] * m[8] * m[14] - m[4] * m[9] * m[14];
        r[13] = m[1] * m[10] * m[12] - m[2] * m[9] * m[12] + m[2] * m[8] * m[13] - m[0] * m[10] * m[13] - m[1] * m[8] * m[14] + m[0] * m[9] * m[14];
        r[14] = m[2] * m[5] * m[12] - m[1] * m[6] * m[12] - m[2] * m[4] * m[13] + m[0] * m[6] * m[13] + m[1] * m[4] * m[14] - m[0] * m[5] * m[14];
        r[15] = m[1] * m[6] * m[8] - m[2] * m[5] * m[8] + m[2] * m[4] * m[9] - m[0] * m[6] * m[9] - m[1] * m[4] * m[10] + m[0] * m[5] * m[10];

        const d = Matrix4x4.determinant(r);
        return Matrix4x4.scale(1 / d);
    }

};

export { Matrix4x4 as default, idendityMatrix, nullMatrix };

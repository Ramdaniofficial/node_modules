import { factory } from '../../utils/factory.js';
import { createAlgorithm02 } from '../../type/matrix/utils/algorithm02.js';
import { createAlgorithm03 } from '../../type/matrix/utils/algorithm03.js';
import { createAlgorithm09 } from '../../type/matrix/utils/algorithm09.js';
import { createAlgorithm11 } from '../../type/matrix/utils/algorithm11.js';
import { createAlgorithm12 } from '../../type/matrix/utils/algorithm12.js';
import { createAlgorithm13 } from '../../type/matrix/utils/algorithm13.js';
import { createAlgorithm14 } from '../../type/matrix/utils/algorithm14.js';
var name = 'atan2';
var dependencies = ['typed', 'matrix', 'equalScalar', 'BigNumber', 'DenseMatrix'];
export var createAtan2 = /* #__PURE__ */factory(name, dependencies, _ref => {
  var {
    typed,
    matrix,
    equalScalar,
    BigNumber,
    DenseMatrix
  } = _ref;
  var algorithm02 = createAlgorithm02({
    typed,
    equalScalar
  });
  var algorithm03 = createAlgorithm03({
    typed
  });
  var algorithm09 = createAlgorithm09({
    typed,
    equalScalar
  });
  var algorithm11 = createAlgorithm11({
    typed,
    equalScalar
  });
  var algorithm12 = createAlgorithm12({
    typed,
    DenseMatrix
  });
  var algorithm13 = createAlgorithm13({
    typed
  });
  var algorithm14 = createAlgorithm14({
    typed
  });
  /**
   * Calculate the inverse tangent function with two arguments, y/x.
   * By providing two arguments, the right quadrant of the computed angle can be
   * determined.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.atan2(y, x)
   *
   * Examples:
   *
   *    math.atan2(2, 2) / math.pi       // returns number 0.25
   *
   *    const angle = math.unit(60, 'deg') // returns Unit 60 deg
   *    const x = math.cos(angle)
   *    const y = math.sin(angle)
   *
   *    math.atan(2)             // returns Complex 1.5707963267948966 -1.3169578969248166 i
   *
   * See also:
   *
   *    tan, atan, sin, cos
   *
   * @param {number | Array | Matrix} y  Second dimension
   * @param {number | Array | Matrix} x  First dimension
   * @return {number | Array | Matrix} Four-quadrant inverse tangent
   */

  return typed(name, {
    'number, number': Math.atan2,
    // Complex numbers doesn't seem to have a reasonable implementation of
    // atan2(). Even Matlab removed the support, after they only calculated
    // the atan only on base of the real part of the numbers and ignored the imaginary.
    'BigNumber, BigNumber': function BigNumberBigNumber(y, x) {
      return BigNumber.atan2(y, x);
    },
    'SparseMatrix, SparseMatrix': function SparseMatrixSparseMatrix(x, y) {
      return algorithm09(x, y, this, false);
    },
    'SparseMatrix, DenseMatrix': function SparseMatrixDenseMatrix(x, y) {
      // mind the order of y and x!
      return algorithm02(y, x, this, true);
    },
    'DenseMatrix, SparseMatrix': function DenseMatrixSparseMatrix(x, y) {
      return algorithm03(x, y, this, false);
    },
    'DenseMatrix, DenseMatrix': function DenseMatrixDenseMatrix(x, y) {
      return algorithm13(x, y, this);
    },
    'Array, Array': function ArrayArray(x, y) {
      return this(matrix(x), matrix(y)).valueOf();
    },
    'Array, Matrix': function ArrayMatrix(x, y) {
      return this(matrix(x), y);
    },
    'Matrix, Array': function MatrixArray(x, y) {
      return this(x, matrix(y));
    },
    'SparseMatrix, number | BigNumber': function SparseMatrixNumberBigNumber(x, y) {
      return algorithm11(x, y, this, false);
    },
    'DenseMatrix, number | BigNumber': function DenseMatrixNumberBigNumber(x, y) {
      return algorithm14(x, y, this, false);
    },
    'number | BigNumber, SparseMatrix': function numberBigNumberSparseMatrix(x, y) {
      // mind the order of y and x
      return algorithm12(y, x, this, true);
    },
    'number | BigNumber, DenseMatrix': function numberBigNumberDenseMatrix(x, y) {
      // mind the order of y and x
      return algorithm14(y, x, this, true);
    },
    'Array, number | BigNumber': function ArrayNumberBigNumber(x, y) {
      return algorithm14(matrix(x), y, this, false).valueOf();
    },
    'number | BigNumber, Array': function numberBigNumberArray(x, y) {
      return algorithm14(matrix(y), x, this, true).valueOf();
    }
  });
});
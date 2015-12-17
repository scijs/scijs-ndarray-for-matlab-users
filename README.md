# scijs ndarrays for MATLAB users

> Common [scijs/ndarray](https://github.com/scijs/ndarray) operations for people familar with MATLAB (or at least not familiar with [scijs](https://github.com/scijs))

## Introduction

This document is a work in progress! Inspired by [Numpy for Matlab users](https://docs.scipy.org/doc/numpy-dev/user/numpy-for-matlab-users.html), aspiring to be [NumPy for MATLAB users](http://mathesaurus.sourceforge.net/matlab-numpy.html).

Not all operations have a direct translation, in particular since ndarrays allow somewhat different memory managment, since JavaScript does not allow operator overloading, and since JavaScript has no native complex numbers. Many ndarray operations return or operate on views—that is, symbolic representations of ndarrays that operate on the same underlying data.

## Memory Management

To get a sense for how managing ndarrays differs from managing MATLAB arrays, consider the diagonal of a 5&times;5 matrix:

```javascript
var iota = require('iota-array')
var pool = require('ndarray-scratch')
var diag = require('ndarray-diagonal')

// A 5x5 matrix of ones:
var a = pool.ones([5,5])

// A view of the diagonal of a:
var x = diag(a)
```

The data contained in ndarray `x` is identical by reference to that in `a`. The strides and offsets have been modified to select only the diagonal elements. To see this directly:

```javascript
console.log(x)
// => View1dfloat64 {
//   data: 
//    Float64Array {'0': 1, '1': 1, '2': 1, ..., '22': 1, '23': 1, '24': 1 },
//   shape: [ 5 ],
//   stride: [ 6 ],
//   offset: 0 }
```

Cloning simplifies the representation by allocating new storage and copying only the elements in the diagonal view:

```javascript
console.log(pool.clone(x))
// => View1dfloat64 {
//      data: Float64Array { '0': 1, '1': 1, '2': 1, '3': 1, '4': 1 },
//      shape: [ 5 ],
//      stride: [ 1 ],
//      offset: 0 }
```

A big advantage is the ability to manipulate representations directly without iterating directly or allocating additional memory:

```javascript
var ops = require('ndarray-ops')
var show = require('ndarray-show')

// Set each element of the diagonal to 2:
ops.assigns(diag(a, 2))

console.log(show(a))
// =>  2.000    1.000    1.000    1.000    1.000
//     1.000    2.000    1.000    1.000    1.000
//     1.000    1.000    2.000    1.000    1.000
//     1.000    1.000    1.000    2.000    1.000
//     1.000    1.000    1.000    1.000    2.000
```

## Operations

The table below collects common matlab operations as well as their ndarray analogs. Not all operations have a conterpart, some because of features and shortcomings of the JavaScript language, some because of differences in memory management, and some because they're simply not yet implemented.

MATLAB            | JavaScript          | Notes
:-----------------|:--------------------|:---------------
`ndims(a)`        | `a.dimension`       | get the number of dimensions of `a`
`numel(a)`        | `a.size`            | get the number of elements of an arary
`size(a)`         | `a.shape`           | get the size of the array
`size(a,n)`       | `a.shape[n-1]`      | get the number of elements of the n-th dimension of array `a`
`[1 2 3; 4 5 6 ]` | `ndarray([1,2,3,4,5,6],[2,3])`                    | 2&times;3 matrix literal (using `Array` type)
                  | `ndarray(new Float64Array([1,2,3,4,5,6]),[2,3])`  | 2&times;3 matrix literal (using 64-bit typed array)
`a(end)`          | `a.get(a.shape[0]-1)` | access last element in the 1&times;n matrix `a`
`a(2,5)`          | `a.get(1,4)`        | access element in second row, fifth column
`a(2,:)`          | `a.pick(1,null)`    | entire second row of `a`
`a(1:5,:)`        | `a.hi(5,null)`      | the first five rows of `a`
`a(end-4:end,:)`  | `a.lo(c.shape[0]-5,null)` | the last five rows of `a`
`a(1:3,5:9)`      | `a.hi(3,9).lo(0,4)` | rows one to three and columns five to nine of `a`
`a([2,4,5],[1,3])`|                     | rows 2, 4, and 5 and columns 1 and 3.
`a(3:2:21,:)`     | `a.hi(21,null).lo(2,null).step(2,1)` | every other row of `a`, starting with the third and going to the twenty-first
`a(1:2:end,:)`    | `a.step(2,1)`       | every other row of `a`, starting with the first
`a(end:-1:1,:)` or `flipup(a)` | `a.step(-1,1)` | `a` with rows in reverse order
`a([1:end 1],:)`  |                     | `a` with copy of the first rows appended to the end
`a.'`             | `a.transpose(1,0)`  | transpose of `a`
`a'`              |                     | conjugate transpose of `a`
`c = a * b`       | [`ndgemm`](https://github.com/scijs/ndgemm)`(c, a, b)`| matrix multiply
`c = a + b`       | [`ops.add`](https://github.com/scijs/ndarray-ops)`(c, a, b)`  | matrix addition
`c = a + 2`       | [`ops.adds`](https://github.com/scijs/ndarray-ops)`(c, a, 2)`  | matrix + scalar addition
`c *= a + b` (not available in MATLAB) | [`ops.addeq`](https://github.com/scijs/ndarray-ops)`(a, b)`  | in-palce matrix addition
`a .* b`          | [`ops.mul`](https://github.com/scijs/ndarray-ops)`(c, a, b)`  | element-wise multiply
`a = a .* b`      | [`ops.muleq`](https://github.com/scijs/ndarray-ops)`(a, b)`   | element-wise multiply (in-place)
`a ./ b`          | [`ops.div`](https://github.com/scijs/ndarray-ops)`(c, a, b) ` | element-wise division
`a = a ./ b`      | [`ops.diveq`](https://github.com/scijs/ndarray-ops)`(a, b)`   | element-wise division (in-place)
`a.^3`            | [`ops.pows`](https://github.com/scijs/ndarray-ops)`(a, 3)`    | element-wise scalar exponentiation
`(a>0.5)`         |                     | matrix whose i,jth element is (a\_ij > 0.5)
`find(a>0.5)`     |                     | find the indices where (a > 0.5)
`a(:,find(v>0.5))`|                     | extract the columns of a where vector v > 0.5
`a(a<0.5)=0`      |                     | `a` with elements less than 0.5 zeroed out
`a .* (a>0.5)`    |                     | `a` with elements less than 0.5 zeroed out
`a(:) = 3`        | [`ops.assigns`](https://github.com/scijs/ndarray-ops)`(a, 3)` | set all values to the same scalar value
`y=x`             | `y =`[`pool.clone`](https://www.npmjs.com/package/ndarray-scratch#pool-clone-array)`(x)` | clone by value
`y=x(2,:)`        | `y = x.pick(1,null)`| slices are by reference
`1:10`            |                     | create an increasing vector
`0:9`             |                     | create an increasing vector
`zeros(3,4)`      | [`pool.zeros`](https://github.com/scijs/ndarray-scratch#poolzerosshapedtype)`([3,4], 'float64')`   | 3&times;4 rand-2 array full of 64-bit floating point zeros
`zeros(3,4,5)`    | [`pool.zeros`](https://github.com/scijs/ndarray-scratchpoolzerosshapedtype)`([3,4,5], 'float64')` | 3&times;4&times;5 rank-3 array full of 64-bit floating point zeros
`ones(3,4)`       | [`pool.ones`](https://github.com/scijs/ndarray-scratch#poolonesshapedtype)`([3,4], 'float64')` | 3&times;4 rank-2 array full of 64-bit floating point ones
`eye(3)`          | [`pool.eye`](https://github.com/scijs/ndarray-scratch#pooleyeshapedtype)`([3,3], 'float64')` | 3&times;3 identity matrix with 64-bit floating point precision
`diag(a)`         | [`diag`](https://github.com/scijs/ndarray-diagonal)`(a)`| vector of diagonal elements of `a` (returns diagonal by reference)
`diag(a,0)`       | `b = `[`pool.zeros`](https://github.com/scijs/ndarray-scratch)`(a.shape)` <br> [`ops.assign`](https://github.com/scijs/ndarray-ops)`(`[`diag`](https://github.com/scijs/ndarray-diagonal)`(b), `[`diag`](https://github.com/scijs/ndarray-diagonal)`(a))` | square diagonal matrix whose nonzero values are the elements of a
`rand(3,4)`       | [`fill`](https://www.npmjs.com/package/ndarray-fill)`(`[`pool.zeros`](https://github.com/scijs/ndarray-scratch#poolmallocshape-dtype)`([3, 4]), Math.random)` | random 3&times;4 matrix
`linspace(1,3,4)` |                     | 4 equally spaced samples between 1 and 3, inclusive
`[x,y]=meshgrid(0:8,0:5)` |            | two 2D arrays: one of x values, one of y values
`[x,y]=meshgrid([1,2,4],[2,4,5])` |     |
`repmat(a, m, n)` |                     | create m&times;n copies of `a`
`[a b]`           |                     | concatenate columsn of `a` and `b`
`[a; b]`          |                     | concatenate rows of `a` and `b`
`max(max(a))`     |                     | maximum element of `a`
`max(a)`          | [`ops.max`](https://github.com/scijs/ndarray-ops#map-reduce-aggregate-operators)`(a)` | maximum element in `a`
`norm(v)`         | [`ops.norm2`](https://github.com/scijs/ndarray-ops#map-reduce-aggregate-operators)`(v)` | L2 norm of vector `v`
`c = a & b`       | [`ops.band`](https://github.com/scijs/ndarray-ops#conventions)`(c, a, b)` | element-by-element AND operator
<code>c = a &#124; b</code> | [`ops.bor`](https://github.com/scijs/ndarray-ops#conventions)`(c, a, b)` | element-by-element OR operator
`inv(a)`          |                     | inverse of square matrix `a`
`pinv(a)`         |                     | pseudo-inverse of matrix `a`
`rank(a)`         |                     | rank of matrix `a`
`a\b`             | [`lup`](https://github.com/scijs/ndarray-lup-factorization)`(a, a, P)`<br>[`solve`](https://github.com/scijs/ndarray-lup-solve)`(a, a, P, b)` | solution of `a x = b` for `x`
`b/a`             |                     | solution of `x a = b` for `x`
`chol(a)`         | [`chol`](https://github.com/scijs/ndarray-cholesky-factorization)`(a, L)`   | cholesky factorization of matrix
`[V,D]=eig(a)`    |                     | eigenvalues and eigenvectors of `a`
`[V,D]=eig(a,b)`  |                     | eigenvalues and eigenvectors of `a`, `b`
`[Q,R,P]=qr(a,0)` | [`qr.factor`](https://github.com/scijs/ndarray-householder-qr#usage)`(A, d)`<br>[`qr.constructQ`](https://github.com/scijs/ndarray-householder-qr#usage)`(A, Q)` | QR decomposition. (Depending on the use, you can likely use Q without constructing explicitly. [See documentation](https://github.com/scijs/ndarray-householder-qr#usage).)
`[L,U,P]=lu(a)`   | [`lup`](https://github.com/scijs/ndarray-lup-factorization#requirendarray-lup-factorization-a-l-p-)`(A, L, P)`     | LU decomposition
`fft(a)`          | [`fft`](https://github.com/scijs/ndarray-fft#requirendarray-fftdir-x-y)`(1, ar, ai)` | Fourier transform of `a`. Javascript does not have a complex type so real and imaginary parts must be passed separately.
`ifft(a)`         | [`fft`](https://github.com/scijs/ndarray-fft#requirendarray-fftdir-x-y)`(-1, ar, ai)`| inverse Fourier transform of `a`
`[b,I]=sortrows(a,i)` | [`sort`](https://github.com/scijs/ndarray-sort)`(a)` | sort the rows of the matrix
                      | [`sort`](https://github.com/scijs/ndarray-sort)`(a.transpose(1,0))` | sort the column of the matrix
`regress(y,X)`    | [`qr.factor`](https://github.com/scijs/ndarray-householder-qr#factor-a-d-)`( A, d );`<br> [`qr.solve`](https://github.com/scijs/ndarray-householder-qr#solve-a-d-x-)`( A, d, y );` | multilinear regression
`decimate(x,q)`   | [`resample`](https://github.com/scijs/ndarray-resample)`(output, input)` | downsample with low-pass filtering ([`resample`](https://github.com/scijs/ndarray-resample) downsamples by a factor of two)
`unique`          |                     | 
`squeeze(a)`      |                     |


## License

&copy; 2015 Ricky Reusser. MIT License. 

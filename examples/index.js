var ndarray = require('ndarray')
var show = require('ndarray-show')
var iota = require('iota-array')
var diag = require('ndarray-diagonal')
var fill = require('ndarray-fill')
var ops = require('ndarray-ops')
var pool = require('ndarray-scratch')

var a = ndarray(new Float64Array([1,2,3,4,5,6]),[2,3])

console.log('a =\n'+show(a))
console.log('\na.dimension = ',a.dimension)

console.log('a.size =', a.size)
console.log('a.shape =',a.shape)
console.log('a.shape[0] =',a.shape[0])
console.log('a.shape[1] =',a.shape[1])
console.log('\na[:,:-1:]=\n'+show(a.step(-1,1)))

var b = ndarray(new Float64Array([1,2,3,4,5,6]))
console.log('\nb ='+show(b))
console.log('\nb[-1] =',b.get(b.shape[0]-1))


var c = ndarray(iota(56), [8,7])
console.log('\nc =\n'+show(c))

console.log('\nfirst five rows of c =\n'+show(c.hi(5,null)))
console.log('\nlast five rows of c =\n'+show(c.lo(c.shape[0]-5,null)))
console.log('\nrows one to three and columns five to seven =\n'+show(c.hi(3,7).lo(0,4)))


var d = pool.zeros(c.shape)
ops.assign(diag(d), diag(c))

console.log('populated diag(c) =\n'+show(d))

async function asyncFlatMap(arr, asyncFn) {
	return Promise.all(flatten(await asyncMap(arr, asyncFn)))
}

function asyncMap(arr, asyncFn) {
	return Promise.all(arr.map(asyncFn))
}

function flatMap(arr, fn) {
	return flatten(arr.map(fn))
}

function flatten(arr) {
	return [].concat(...arr)
}

module.exports = {
	asyncFlatMap,
	asyncMap,
	flatMap,
	flatten,
}

// Functional programming
const range = n => Array.from(Array(n).keys())
const zipWith = (a, b, f) => Object.keys(a).map(i => f(a[i], b[i]))
const headTail = (l, n) => [l.slice(0, n), l.slice(n - l.length)]
const add = (a, b) => a + b
const mul = (a, b) => a * b
const sum = l => l.reduce(add, 0)

// Statistics
const randBetween = (a, b) => Math.random() * (b - a) + a
const sigmoid = x => 1 / (1 + Math.exp(-x))
const bernoulliPick = (proba, a, b) => Math.random() < proba ? a : b
const centerInRange = (x, a, b) => 2 * (x-a)/(b-a) - 1  // number of half-ranges from center
function shuffle(array) {
    /* Fisher-Yates (aka Knuth) Shuffle */
    let currentIndex = array.length
    let copy = [...array]

    while (currentIndex > 0) { // elements left to shuffle
        // Pick random element...
        const randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex--

        // ...and swap it with the current element.
        const t = copy[currentIndex]
        copy[currentIndex] = copy[randomIndex]
        copy[randomIndex] = t
    }

    return copy
}
const sample = (l, n) => shuffle(l).slice(0, n)
function multiply(a_, b) {
    const a = [coerce1d(a_)]
    const n = a.length
    const p = a[0].length
    console.assert(p === b.length, 'dimensions must agree for matrix multiplication')
    const m = b[0].length

    const res = new Array(n)  // initialize array of rows
    for (let r = 0; r < n; ++r) {
        res[r] = new Array(m) // initialize the current row
        for (let c = 0; c < m; ++c) {
            res[r][c] = 0             // initialize the current cell
            for (let k = 0; k < p; ++k)
                res[r][c] += a[r][k] * b[k][c]
        }
    }
    return coerce1d(res)
}
function dot(a, b) {
    return sum(zipWith(a, b, mul))
}

// Engineering
const clone = (orig) => Object.assign(Object.create(orig), orig)
const coerce1d = (a) => a[0].length === undefined ? a : a[0]


export {
    zipWith, range, headTail, sample, add, dot,
    randBetween, sigmoid, shuffle, bernoulliPick, multiply, centerInRange,
    clone
}

// Functional programming
const range = n => Array.from(Array(n).keys())
const zipWith = (a, b, f) => a.map((_, idx) => f(a[idx], b[idx]))
const sum = l => l.reduce((a, b) => a + b, 0)

// Statistics
const randBetween = (a, b) => Math.random() * (b - a) + a
const sigmoid = x => 1 / (1 + Math.exp(-x))

export {
    zipWith, range, sum,
    randBetween, sigmoid
}

// Functional programming
const range = n => Array.from(Array(n).keys())
const zipWith = (a, b, f) => a.map((_, idx) => f(a[idx], b[idx]))
const sum = l => l.reduce((a, b) => a + b, 0)
const headTail = (l, n) => [l.splice(0, n), l.splice(n)]

// Statistics
const randBetween = (a, b) => Math.random() * (b - a) + a
const sigmoid = x => 1 / (1 + Math.exp(-x))
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

    return array;
}
const sample = (l, n) => shuffle(l).splice(0, n)
const bernoulli = proba => Math.random() < proba

// Engineering
const clone = (orig) => Object.assign(Object.create(orig), orig)

export {
    zipWith, range, sum, headTail, sample,
    randBetween, sigmoid, shuffle, bernoulli,
    clone,
}

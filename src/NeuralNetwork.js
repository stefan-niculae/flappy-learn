import {add, dot, sigmoid, clone, range, randBetween, zipWith, multiply} from './utils'

const INPUT_DIM = 3
const HIDDEN_DIM = 8


export default class NeuralNetwork {
    /* A single hidden layer, tanh hidden nonlinearly, sigmoid output activation */

    constructor() {
        /* Initialize weights randomly and biases to zero */
        this.inputWeights = range(INPUT_DIM).map(() =>
            range(HIDDEN_DIM).map(() => randBetween(-1, 1)))
        this.hiddenWeights = range(HIDDEN_DIM).map(() => randBetween(-1, 1)) // uniform
        this.hiddenBiases = range(HIDDEN_DIM).fill(0)
        this.outputBias = 0
    }

    simulate(input) {
        /* Network output on the given input vector */
        const hiddenResult = zipWith(multiply(input, this.inputWeights), this.hiddenBiases, add)
            .map(Math.tanh)
        const output = sigmoid(
            dot(hiddenResult, this.hiddenWeights) + this.outputBias)
        return output > .5
    }

    map(f) {
        // Hello fmap, my old friend!
        let result = clone(this)
        result.inputWeights = this.inputWeights.map(row => row.map(f))
        result.hiddenWeights = this.hiddenWeights.map(f)
        result.hiddenBiases = this.hiddenBiases.map(f)
        result.outputBias = f(this.outputBias)
        return result
    }

    loadFrom(trained) {
        Object.keys(this).forEach(k => this[k] = trained[k])
    }
}

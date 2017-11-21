import math from 'mathjs'
import {sigmoid, clone} from './utils'

const INPUT_DIM = 2
const HIDDEN_DIM = 5

export default class NeuralNetwork {
    /* A single hidden layer, tanh hidden nonlinearly, sigmoid output activation */

    constructor() {
        this.inputWeights = math.random([INPUT_DIM, HIDDEN_DIM], -1, 1) // uniform
        this.inputBiases = math.zeros(INPUT_DIM)

        this.hiddenWeights = math.random([HIDDEN_DIM, 1], -1, 1) // uniform
        this.hiddenBiases = math.zeros(HIDDEN_DIM)
    }

    simulate(input) {
        const hiddenOutput = math.tanh(
            math.add(math.multiply(input, this.inputWeights), this.inputBiases))
        return sigmoid(
            math.add(math.multiply(hiddenOutput, this.hiddenWeights), this.hiddenBiases))
    }

    map(f) {
        // hello fmap, my old friend
        const result = clone(this)
        Object.keys(result).forEach(k => result[k] = this[k].map(f))
        return result
    }
}

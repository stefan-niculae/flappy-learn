import math from 'mathjs'
import {zipWith, sum, sigmoid} from './utils'

const INPUT_DIM = 2
const HIDDEN_DIM = 5

export default class {
    /* A single hidden layer, tanh hidden nonlinearly, sigmoid output activation */

    constructor() {
        this.inputWeights  = math.random([INPUT_DIM, HIDDEN_DIM], -1, 1) // uniform
        this.hiddenWeights = math.random([HIDDEN_DIM, 1], -1, 1) // uniform
    }

    simulate(...input) {
        const hiddenOutputs = math.tanh(math.multiply(input, this.inputWeights))
        const finalInput = zipWith(hiddenOutputs, this.hiddenWeights, (o, w) => o * w)
        return sigmoid(sum(finalInput))
    }
}

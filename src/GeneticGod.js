import Bird from './Bird'
import {range, randBetween} from './utils'

const POPULATION_SIZE = 3
const ELITISM = .2 // percentage kept as winners
const MUTATION_RATE = .1 // percentage suffering a variation


export default class {
    makeInitialPopulation(game) {
        this.generation_number = 0
        return range(POPULATION_SIZE).map(() => new Bird(game))
    }

    // breed
    // genome (individ)
    // offspring = children
    // evolve generation
}

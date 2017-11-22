import {sample, range, headTail, randBetween, zipWith, bernoulliPick, clone} from './utils'
import NeuralNetwork from './NeuralNetwork'

const POPULATION_SIZE = 10
const ELITISM = 4 // number of winners selected
const LUCKY = 2 // number of not-fittest selected

const CROSSOVER_RATE = .75 // chance of taking from other parent
const MUTATION_RATE = .2 // chance of suffering a variation

const MIN_FITNESS = 3


export default class GeneticGod {
    constructor() {
        this.generationNumber = 0
    }

    static initialPopulation() {
        return range(POPULATION_SIZE).map(i =>
            new NeuralNetwork(i))
    }

    evolve(prevGeneration) {
        this.generationNumber++
        console.log(`Generation number ${this.generationNumber}`)

        const [winners, lucky] = GeneticGod.select(prevGeneration)
        if (winners[0].age < MIN_FITNESS)
            // even the best is bad. washout this generation and start from scratch
            return GeneticGod.initialPopulation()

        const offsprings = [
            GeneticGod.crossover(winners.slice(0, 2)),
            GeneticGod.crossover(sample(winners, 2)),
            GeneticGod.crossover(sample(winners, 2)),
        ]
        const mutated = [winners[0], ...lucky, ...offsprings].map(GeneticGod.mutate)
        return [...winners, ...mutated]
    }

    static select(population) {
        /* The survivors are the fittest plus some lucky ones */
        const sorted = population.sort((a, b) => a.age - b.age)
        const [fittest, rest] = headTail(sorted, ELITISM)
        const lucky = sample(rest, LUCKY)
        return [fittest, lucky]
    }

    static crossover([dominant, recessive]) {
        /* Keep the all but some weights from one of the parents */
        const offspring = clone(dominant)
        offspring.hiddenBiases = zipWith(dominant.hiddenBiases, recessive.hiddenBiases,
            (d, r) => bernoulliPick(CROSSOVER_RATE, d, r)
        )
        return offspring
    }

    static mutate(genome) {
        /* Apply random variations to some weights */
        return genome.map(w => bernoulliPick(
            MUTATION_RATE, w, w + randBetween(-.5, .5))
        )
    }
}

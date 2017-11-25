import {sample, range, headTail, randBetween, zipWith, bernoulliPick, clone} from './utils'
import NeuralNetwork from './NeuralNetwork'

const POPULATION_SIZE = 10
const MIN_FITNESS = 5000 // ms

const ELITISM = 3 // number of winners selected
const N_LUCKY = 2 // number of not-fittest selected
const N_RANDOM = 1

const CROSSOVER_RATE = .75 // chance of taking from other parent
const MUTATION_RATE = .2 // chance of suffering a variation


export default class GeneticGod {
    constructor() {
        this.generationNumber = 1
    }

    static initialPopulation(size) {
        const n = size || POPULATION_SIZE
        return range(n).map(() => new NeuralNetwork())
    }

    evolve(prevGeneration) {
        this.generationNumber++

        const [winners, lucky] = GeneticGod.select(prevGeneration)
        const best = winners[0]

        if (best.age < MIN_FITNESS)
            // even the best is bad. washout this generation and start from scratch
            return [best, ...GeneticGod.initialPopulation(POPULATION_SIZE - 1)]

        const offsprings = [
            GeneticGod.crossover(winners.slice(0, 2)),
            GeneticGod.crossover(sample(winners, 2)),
            GeneticGod.crossover(sample(prevGeneration, 2)),
        ]
        const mutated = [best, ...lucky, ...offsprings].map(GeneticGod.mutate)
        return [...winners, ...mutated, ...GeneticGod.initialPopulation(N_RANDOM)]
    }

    static select(population) {
        /* The survivors are the fittest plus some lucky ones */
        const sorted = population.sort((a, b) => b.age - a.age) // largest first
        const [fittest, rest] = headTail(sorted, ELITISM)
        const lucky = sample(rest, N_LUCKY)

        fittest.forEach(f => f.origin = 'fit')
        lucky.forEach(l => l.origin = 'lucky')
        return [fittest, lucky]
    }

    static crossover([dominant, recessive]) {
        /* Keep the all but some weights from one of the parents */
        const offspring = clone(dominant)
        offspring.hiddenBiases = zipWith(dominant.hiddenBiases, recessive.hiddenBiases,
            (d, r) => bernoulliPick(CROSSOVER_RATE, d, r)
        )

        offspring.origin = 'crossover'
        return offspring
    }

    static mutate(genome) {
        /* Apply random variations to some weights */
        return genome.map(w => bernoulliPick(
            MUTATION_RATE, w, w * randBetween(.85, 1.15) + randBetween(-.2, .2))
        )
    }
}

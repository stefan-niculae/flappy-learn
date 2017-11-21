import {range, sample, headTail, randBetween, zipWith, bernoulli} from './utils'
import NeuralNetwork from './NeuralNetwork'

const POPULATION_SIZE = 10
const ELITISM = 4 // number of winners
const LUCKY = 2

const CROSSOVER_RATE = .2
const MUTATION_RATE = .2 // chance of suffering a variation


export default class GeneticGod {
    initialPopulation() {
        this.generationNumber = 0
        return range(POPULATION_SIZE).map(() => new NeuralNetwork())
    }

    evolve(prevGeneration) {
        this.generationNumber++
        console.log(`Generation number ${this.generationNumber}`)

        const [winners, lucky] = GeneticGod.select(prevGeneration)
        const offsprings = [
            GeneticGod.crossover(winners.splice(0, 2)),
            GeneticGod.crossover(sample(winners, 2)),
            GeneticGod.crossover(sample(winners, 2)),
        ]
        const breeded = [...lucky, ...offsprings, winners[0]]
        const mutated = GeneticGod.mutate(breeded)

        return [...winners, ...mutated]
    }

    static select(population) {
        /* Fittest ones plus some lucky ones */
        const sorted = population.sort((a, b) => a.age - b.age)
        const [fittest, rest] = headTail(sorted, ELITISM)
        const lucky = sample(rest, LUCKY)
        return [...fittest, ...lucky]
    }

    static crossover([dominant, recessive]) {
        return zipWith(dominant, recessive, (d, r) =>
            bernoulli(CROSSOVER_RATE) ?
                d :
                r
        )
    }

    static mutate(genome) {
        return genome.map(w =>
            bernoulli(MUTATION_RATE) ?
                w + randBetween(-.5, .5) :
                w
        )
    }
}

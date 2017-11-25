# flappy-learn

Evolve birds to play Flappy Bird. [Live demo](http://stefann.eu/flappy-learn)

<p align="center">
  <img src="https://github.com/stefan-niculae/flappy-learn/blob/master/demo/screenshot.png">
</p>

## Description

There is only one button: jump. The objective is to survive as long as possible without hitting the spikes or falling off-screen. The gap between spikes gets increasingly smaller, until a bird can no longer pass through it (at around score 80).

## Demo

Start a run by accessing [stefann.eu/flappy-learn](http://stefann.eu/flappy-learn) and watch your birds learn how to fly. If you wish to observe a high-scoring bird, load the brain from `demo/champion.json`.

## How?

Each bird's brain is a neural network with a few hidden layers and one output. It takes as input the x and y distances from the next gap center and the output dictates whether it should jump. This brain is simulated multiple times per second.

To optimize the network, a genetic algorithm is used. The fitness function is the bird's age – the time it survived.

The initial population consists of many birds with random weights. Each subsequent generation is built upon the previous like so:

- the fittest genomes are selected
- the best one, together with some lucky ones are mutated by applying random variation to their weights
- offsprings are created by picking two winning genomes and randomly swapping their weights

## Dependencies

- [Phaser](https://phaser.io) - game engine
- [Kenney](http://kenney.nl) - assets (paid)
- Inspired by: [Phaser tutorial](http://www.lessmilk.com/tutorial/flappy-bird-phaser-1), [another implementation](https://github.com/ssusnic/Machine-Learning-Flappy-Bird), [some other implementation](https://github.com/xviniette/FlappyLearning)


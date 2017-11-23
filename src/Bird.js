import {Sprite} from 'phaser'
import NeuralNetwork from './NeuralNetwork'
import {centerInRange} from './utils'

const HORIZ_OFFSET = 100 // how far from the left edge the bird spawns


export default class Bird extends Sprite {
    constructor(game, brain) {
        super(game, HORIZ_OFFSET, game.world.centerY, 'planes')
        game.add.existing(this)

        this.scale.set(.5)
        this.animations.add('propeller', [1, 12, 9, 12], 20, true)
        this.animations.play('propeller')

        this.jumpRotation = this.game.add  // turn head upwards, incrementally
            .tween(this)
            .to({ angle: -20 }, 75)
        // anchor on the left, behind the bird, in the middle so jump rotation looks natural
        this.anchor.x = -.2

        this.game.physics.enable(this)  // for: movements, gravity, collisions
        this.body.gravity.y = 1500 // make it fall

        // Die if player gets off screen
        this.checkWorldBounds = true
        this.outOfBoundsKill = true
        this.events.onKilled.add(this.die, this)

        this.brain = brain
        this.birthTime = game.time.now
    }

    update() {
        // Slowly turn head downwards
        if (this.angle < 25)
            this.angle += 1
    }

    think(target) {
        /* Decide whether to jump, based on the environment's state */
        if (!this.alive) // can't think if you're dead, yo!
            return

        // Preprocess: bring into [-1, +1] range
        const envInfo = [
            centerInRange(target.x - this.x, HORIZ_OFFSET, this.game.width), // ranges from bird to edge
            centerInRange(target.y - this.x, 0, this.game.height), // ranges from top to bottom edges
        ]
        if (this.brain.simulate(envInfo))
            this.jump()
        // if (Math.abs(envInfo[0]) > 1)  console.warn(envInfo)
    }

    jump() {
        this.body.velocity.y = -400  // "Up" impulse
        this.jumpRotation.start()
    }
    
    die() {
        /* The bird's fitness is represented by its age */
        this.brain.age = this.game.time.now - this.birthTime
        this.destroy()
    }

    toJSON() {
        this.brain.age = this.game.time.now - this.birthTime
        return this.brain
    }
}

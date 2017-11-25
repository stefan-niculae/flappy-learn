import {Sprite, Keyboard} from 'phaser'
import NeuralNetwork from './NeuralNetwork'
import {centerInRange, randBetween} from './utils'

const HORIZ_OFFSET = 100 // how far from the left edge the bird spawns

const SPRITE_INDICES = {
    fit:        [1, 12, 9, 12], // red
    random:     [2, 0, 10, 0], // blue
    crossover:  [3, 5, 7, 5], // green
    lucky:      [4, 6, 8, 6] // yellow
}

export default class Bird extends Sprite {
    constructor(game, brain) {
        super(game, HORIZ_OFFSET, game.world.centerY * randBetween(.95, 1.05), 'planes')
        game.add.existing(this)

        this.scale.set(.6)
        this.animations.add('propeller', SPRITE_INDICES[brain.origin], 20, true)
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

        // Controls - for debugging purposes
        const spaceKey = this.game.input.keyboard.addKey(Keyboard.SPACEBAR)
        spaceKey.onDown.add(() => {if (this.alive) this.jump()})

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
            centerInRange(target.x - this.x, 0, this.game.width - HORIZ_OFFSET), // ranges from bird to edge
            centerInRange(target.y - this.y, -this.game.height, this.game.height), // can be a full height lower/higher
            // centerInRange(this.y, 0, this.game.height), // ranges from top to bottom edges
        ]
        if (this.brain.simulate(envInfo))
            this.jump()
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

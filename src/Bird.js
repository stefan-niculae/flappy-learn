import NeuralNetwork from './NeuralNetwork'
import {Sprite} from 'phaser'

export default class extends Sprite {
    constructor(game) {
        super(game, game.width / 4, game.world.centerY, 'planes')
        game.add.existing(this)

        this.scale.set(.75)
        this.animations.add('propeller', [1, 12, 9, 12], 20, true)
        this.animations.play('propeller')

        this.jumpRotation = this.game.add  // turn head upwards, incrementally
            .tween(this)
            .to({ angle: -20 }, 75)
        // anchor on the left, behind the bird, in the middle so jump rotation looks natural
        this.anchor.x = -.2

        this.brain = new NeuralNetwork()

        this.game.physics.enable(this)  // for: movements, gravity, collisions
        this.body.gravity.y = 1000 // make it fall

        // Die if player gets off screen
        this.checkWorldBounds = true
        this.outOfBoundsKill = true
        this.events.onKilled.add(this.rememberDeath, this)
    }

    update() {
        // Slowly turn head downwards
        if (this.angle < 25)
            this.angle += 1
    }

    think(...envInfo) {
        /* Decide whether to jump, based on the environment's state */
        if (brain.simulate(...envInfo) > .5)
            jump()
    }

    jump() {
        this.body.velocity.y = -400  // "Up" impulse
        this.jumpRotation.start()
    }
    
    rememberDeath() {
        this.age = this.game.time.totalElapsedSeconds()
        this.body.velocity.x = -150 // travel backwards with the barrier
    }
}

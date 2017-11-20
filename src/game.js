import {State, Keyboard, Physics} from 'phaser'
import {randBetween} from './utils'

const N_BIRDS = 1
const BARRIER_GAP = 150
const BARRIER_SPEED = 150
const BARRIER_OFFSET_RANGE = .4

export default class extends State {
    constructor(god) {
        super()
        this.god = god
    }

    preload() {
        // Load assets
        this.load.image('background', 'assets/background.png')
        this.load.spritesheet('planes', 'assets/planes.png', 88, 73)
        this.load.image('spike', 'assets/spike.png')
    }

    createBackground() {
        const img = this.cache.getImage('background')
        this.bg = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background')
        this.bg.tileScale.y = this.game.height / img.height
    }

    createScore() {
        this.score = 0
        this.labelScore = this.add.text(this.world.centerX, this.game.height / 10, '0', {
            font: 'bold 40px Arial',
            fill: 'white',
            strokeThickness: 5,
            boundsAlignH: 'center',
        })
    }

    create() {
        this.createBackground()
        this.physics.startSystem(Physics.ARCADE)

        // Birds
        this.birds = this.god.makeInitialPopulation(this.game)

        // Controls
        const spaceKey = this.input.keyboard.addKey(Keyboard.SPACEBAR)
        spaceKey.onDown.add(this.allJump, this)

        // Barriers
        this.barriers = this.add.group()
        this.barrierTimer = this.time.events.loop(2000, this.createBarrier, this)

        this.createScore()
    }

    allJump() {
        this.birds.forEach(b => b.jump())
    }

    update() {
        /* Game logic. Called 60 times per second */
        const aliveBirds = this.birds.filter(b => b.alive)
        if (aliveBirds.length === 0) {
            this.endGame()
            return
        }

        this.bg.tilePosition.x -= .5

        // Barrier collision
        const hitBirds = aliveBirds.filter(b => this.physics.arcade.overlap(b, this.barriers))
        hitBirds.forEach(b => b.alive = false) // kill them
    }

    endGame() {
        this.time.events.remove(this.barrierTimer)  // no new pipes
        this.barriers.forEach(b => b.body.velocity.x = 0) // stop existing ones
        this.birds.forEach(b => b.body.velocity.x = 0) // stop birds as well

        this.time.events.add(1000, () => this.state.start('default')) // restart after a short delay
    }

    createSpike(x, y) {
        const spike = this.add.sprite(x, y, 'spike')
        this.barriers.add(spike)

        this.physics.enable(spike)
        spike.body.velocity.x = -BARRIER_SPEED  // move left

        // Kill it when it goes off screen
        spike.checkWorldBounds = true
        spike.outOfBoundsKill = true

        spike.anchor.setTo(.5, .5)
        return spike
    }

    createBarrier() {
        const y = this.game.height * randBetween(-BARRIER_OFFSET_RANGE, BARRIER_OFFSET_RANGE)
        const x = this.game.width

        const topSpike = this.createSpike(x, y)
        topSpike.scale.y = -1 // flip it upside-down
        const botSpike = this.createSpike(x, y)

        const spikeHeight = this.cache.getImage('spike').height
        topSpike.y -= spikeHeight / 2 + BARRIER_GAP / 2
        botSpike.y += spikeHeight / 2 + BARRIER_GAP / 2
        console.log(botSpike.y);

        // Update score
        this.score++
        this.labelScore.text = this.score
    }
}

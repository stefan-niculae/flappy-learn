import {State, Keyboard, Physics} from 'phaser'
import Bird from './Bird'
import {randBetween} from './utils'

const BARRIER_GAP = 275
const BARRIER_SPEED = 150
const BARRIER_OFFSET_RANGE = .3 // center plus/minus this percentage


export default class extends State {
    constructor(god) {
        super()
        this.god = god
    }

    init(prevGeneration) {
        if (prevGeneration === undefined)
            this.brains = this.god.initialPopulation()
        else
            this.brains = this.god.evolve(prevGeneration)
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
        this.birds = this.brains.map(b => new Bird(this.game, b))

        this.time.events.loop(500, this.makeBirdsThink, this) // let birds think periodically
        // Will be replaced after each new barrier is created, needed for computation before any barriers
        this.getNextBarrierCenter = () => ({x: this.game.width, y: this.world.centerY})

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

    makeBirdsThink() {
        const nextBarrier = this.getNextBarrierCenter()
        this.birds.forEach(b => b.think([
            // preprocess: bring into [-1, +1] range
            ((nextBarrier.x - b.x) / this.game.width) * 2 - 1, // horiz dist is in (0, +1)
             (nextBarrier.y - b.y) / this.game.height, // vert ranges from -1 to +1
        ]))
    }

    endGame() {
        this.time.events.remove(this.barrierTimer)  // no new pipes
        this.barriers.forEach(b => b.body.velocity.x = 0) // stop existing ones
        this.birds.forEach(b => b.body.velocity.x = 0) // stop birds as well

        this.time.events.add(1000, () => // restart after a short delay, remembdering this generation
            this.state.start('default', true, false, this.birds.map(b => b.brain)))
    }

    createSpike(x, y) {
        const spike = this.add.sprite(x, y, 'spike')
        this.barriers.add(spike)

        this.physics.enable(spike)
        spike.body.velocity.x = -BARRIER_SPEED  // move left

        // Kill it when exits left
        spike.checkWorldBounds = true
        spike.events.onOutOfBounds.add(spike.destroy, spike)

        spike.anchor.setTo(.5, 0)
        return spike
    }

    createBarrier() {
        const offsetCoef = randBetween(-BARRIER_OFFSET_RANGE, BARRIER_OFFSET_RANGE)
        const y = this.game.world.centerY + this.game.height * offsetCoef
        const x = this.game.width

        const topSpike = this.createSpike(x, y)
        topSpike.scale.y = -1 // flip upside-down
        const botSpike = this.createSpike(x, y)
        topSpike.y -= BARRIER_GAP / 2 // nudge it higher
        botSpike.y += BARRIER_GAP / 2 // nudge it lower

        this.getNextBarrierCenter = () => ({x: topSpike.x, y}) // y stays the same

        // Update score
        this.score++
        this.labelScore.text = this.score
    }
}

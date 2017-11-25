import {State, Physics} from 'phaser'
import Bird from './Bird'
import {randBetween, saveObject} from './utils'

const BARRIER_GAP = 200
const BARRIER_SPEED = 150
const BARRIER_OFFSET_RANGE = .3 // center plus/minus this percentage

const DOM_ELEMS = {
    aliveCounter: document.getElementById('n-alive'),
    maxScore: document.getElementById('max-score'),
    populationSize: document.getElementById('total'),
    generation: document.getElementById('gen-no'),

    saveBtn: document.getElementById('save'),
    loadBtn: document.getElementById('load'),
    loadInput: document.getElementById('load-input'),
}


export default class extends State {
    constructor(god) {
        super()
        this.god = god
        this.maxScore = 0
    }

    init(prevGeneration) {
        /* Takes the generation passed down from the previous game (or none if this is the first game) */
        this.brains = prevGeneration === undefined ?
            this.god.constructor.initialPopulation() :
            this.god.evolve(prevGeneration)

        DOM_ELEMS.generation.textContent = this.god.generationNumber
        DOM_ELEMS.populationSize.textContent = this.brains.length
    }

    preload() {
        /* Load assets - images */
        this.load.image('background', 'assets/background.png')
        this.load.spritesheet('planes', 'assets/planes.png', 88, 73)
        this.load.image('spike', 'assets/spike.png')
    }

    create() {
        /* Setup game logic */
        this.createBackground() // under everything
        this.physics.startSystem(Physics.ARCADE)

        // Birds
        this.birds = this.brains.map(b => new Bird(this.game, b))
        this.time.events.loop(100, this.makeBirdsThink, this) // birds think periodically

        // Barriers
        this.barriers = this.add.group()
        this.time.events.add(2000, this.createBarrier, this) // allow a short period with no barriers
        this.getNextGapCenter = () => ({x: this.game.width, y: this.world.centerY}) // but give them something to chase

        this.createScore() // over everything
        this.setupCheckpointButtons()
    }

    createBackground() {
        const img = this.cache.getImage('background')
        this.bg = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'background')
        this.bg.tileScale.y = this.game.height / img.height
    }

    createScore() {
        this.score = 0
        this.labelScore = this.add.text(this.world.centerX*.95, this.game.height / 10, '0', {
            font: 'bold 40px Open Sans',
            fill: 'white',
            strokeThickness: 7,
            boundsAlignH: 'center',
        })
    }

    setupCheckpointButtons() {
        DOM_ELEMS.saveBtn.onclick = () => {
            const bird = this.birds.filter(b => b.alive)[0]
            const text = JSON.stringify(bird, null, 4)
            const file = new Blob([text], {type: 'text/plain'})
            DOM_ELEMS.saveBtn.href = URL.createObjectURL(file)
        }

        DOM_ELEMS.loadBtn.onclick = () => {
            DOM_ELEMS.loadInput.click()
            return false
        }
        DOM_ELEMS.loadInput.onchange = e => {
            const file = e.target.files[0]
            const reader = new FileReader()
            reader.onload = e => {
                const obj = JSON.parse(e.target.result)
                this.birds.filter(b => b.alive)[0]
                    .brain.loadFrom(obj)
            }
            reader.readAsText(file)
        }
    }

    update() {
        /* Check collisions. Called each frame, 60 times per second */
        const aliveBirds = this.birds.filter(b => b.alive)
        DOM_ELEMS.aliveCounter.textContent = aliveBirds.length

        if (aliveBirds.length === 0) {
            this.endGame()
            return
        }

        this.bg.tilePosition.x -= .5 // scroll background

        // Barrier collision
        const hitBirds = aliveBirds.filter(b => this.physics.arcade.overlap(b, this.barriers))
        hitBirds.forEach(b => b.alive = false) // kill them

        // Bird passed the barrier
        if (this.getNextGapCenter().x < aliveBirds[0].x + 1) {
            this.incrementScore()
            this.createBarrier()
        }
    }

    makeBirdsThink() {
        /* Simulate each bird's brain on (normalized) data about the current environment */
        const nextGap = this.getNextGapCenter()
        this.birds.forEach(b => b.think(nextGap))
    }

    endGame() {
        /* Restart the game, passing down this generation */
        this.barriers.forEach(b => b.body.velocity.x = 0) // stop barriers from advancing
        this.time.events.add(1000, () => // wait a bit to create a logical separation
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
        /* Place a pair of spikes at the right edge of the screen, at a random y position */
        const offsetCoef = randBetween(-BARRIER_OFFSET_RANGE, BARRIER_OFFSET_RANGE)
        const y = this.game.world.centerY + this.game.height * offsetCoef
        let x = this.game.width

        const topSpike = this.createSpike(x, y)
        topSpike.scale.y = -1 // flip upside-down
        const botSpike = this.createSpike(x, y)
        topSpike.y -= BARRIER_GAP / 2 // nudge it higher
        botSpike.y += BARRIER_GAP / 2 // nudge it lower

        // Will be used by the birds' brains
        this.getNextGapCenter = () => ({x: topSpike.x, y}) // y stays the same
    }

    incrementScore() {
        /* Ingame and max score */
        this.score++
        this.labelScore.text = this.score

        this.maxScore = Math.max(this.maxScore, this.score)
        DOM_ELEMS.maxScore.textContent = this.maxScore
    }

}

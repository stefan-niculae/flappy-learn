import Phaser from 'phaser'
import GameState from './game'
import God from './GeneticGod'

const container = document.getElementById('game')
const god = new God()

new Phaser.Game(
    container.clientWidth,
    container.clientHeight,
    Phaser.AUTO,
    container,
    new GameState(god),
)

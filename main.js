import Room from './room';
import player from './player';

//acceptable commands
const commands = {
  move: ['go', 'move', 'head', 'walk', 'run', 'crawl', 'skip'],
  examine: ['look', 'examine', 'check', 'study'],
  take: ['pick', 'take', 'grab', 'steal', 'buy'],
  use: ['use', 'give', 'eat', 'drink']
}

const directions = {
  north: ['n', 'north'],
  south: ['s', 'south'],
  east: ['e', 'east'],
  west: ['w', 'west']
}

//Objects definition
class InvObj {
  constructor(name, desc, takeable, action) {
    //name and desc should be strings, takeable is a boolean, action is optional, but should be a function
    this.name = name;
    this.description = desc;
    this.takeable = takeable;
    this.action = action || null
  }
}

//list of rooms with allowable transitions for state machine
let rooms = {

}

//actual game implementation definition
async function play() {

}
const readline = require('readline');

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
};

//------------------------------------------------------------------------------------------------------------------------
//Rule sets and templates

//player object
const player = {
  name: null,
  currentRoom: null,
  inventory: [],
  status: [],

  lookAround: () => {
    return this.currentRoom.description
  },

  //move
  changeRoom: (room) => {
    if (!room.isLocked) {
      player.currentRoom = room
    } else {
      console.log(`The ${room.name} is locked...`)
    }
  },

  //pick up
  pickUp: (item) => {
    if (item.takeable === true) {
      player.inventory.push(item);
      player.currentRoom.inventory.pop(item)
      return `You pick up a ${item.name}`
    } else {
      return "You can't take that"
    }
  },

  //use items
  useItem: (item) => {
    item.action()
  }
}

//Room template
class Room {
  constructor(name, description, inventory, north, south, east, west) {
    //name and description should be strings, inventory is an array of objects, directions are strings

    this.name = name;
    this.description = description;
    this.inventory = inventory || [];
    this.isLocked = false;
    this.north = north || null;
    this.south = south || null;
    this.east = east || null;
    this.west = west || null;

    this.unlock = () => {
      if (player.inventory.includes(obObjs['key'])) {
        if (this.isLocked === false) {
          return ('The door is already unlocked')
        } else {
          this.isLocked = false;
          return ("The door unlocks with an audible click.")
        }
      } else {
        return "You don't have a key..."
      }
    };

    this.removeItem = (item) => {
      this.inventory.pop(item)
    };

    this.examineItem = (item) => {
      return item.description
    };

    this.enterRoom = () => {
      return (this.name + '\n' + this.description)
    }

  }
}

//Items object definition
class InvObj {
  constructor(name, desc, takeable, action) {
    //name and desc should be strings, takeable is a boolean, action should be a function
    this.name = name;
    this.description = desc;
    this.takeable = takeable;
    this.action = action
  }
}

//acceptable commands
const commands = {
  affirmative: ['yes', 'yesh', 'yup', 'y', 'yeah', 'ok', ''],
  move: ['go', 'move', 'head', 'walk', 'run', 'crawl', 'skip', 'enter'],
  examine: ['look', 'examine', 'check', 'study', 'inspect'],
  take: ['pick', 'take', 'grab', 'steal', 'buy'],
  use: ['use', 'give', 'eat', 'drink'],
  unlock: ['unlock', 'open']
}

const directions = {
  north: ['n', 'north'],
  south: ['s', 'south'],
  east: ['e', 'east'],
  west: ['w', 'west']
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//object definitions

//objects list MUST BE BEFORE ROOMS
const stick = new InvObj('stick', 'A seemingly ordinary stick', true, () => { console.log('The stick breaks...'); player.inventory.pop(stick) });
const rock = new InvObj('rock', 'A rock. Not very exciting, but something shiney catches your eye...', false, () => { console.log('The rock is impervious, heavy, and boring. You should probably leave it be...') });
const key = new InvObj('key', 'A small key you found amongst the rocks', true, () => {
  if (player.currentRoom.north && obRooms[player.currentRoom.north].isLocked) {
    console.log(obRooms[player.currentRoom.north].unlock())
  } else if (player.currentRoom.south && obRooms[player.currentRoom.south].isLocked) {
    console.log(obRooms[player.currentRoom.south].unlock())
  } else if (player.currentRoom.east && obRooms[player.currentRoom.east].isLocked) {
    console.log(obRooms[player.currentRoom.east].unlock())
  } else if (player.currentRoom.west && obRooms[player.currentRoom.west].isLocked) {
    console.log(obRooms[player.currentRoom.west].unlock())
  } else {
    console.log('There is nothing to unlock here...')
  }
})


//room definitions
const canyon = new Room('canyon', 'You stand in a canyon completely blocked in on three sides.\nThe cannyon is littered with rocks. Your only path out lies to the north...', [rock, key], 'field')
const field = new Room('field', 'You stand in an open field surrounded by forboding forests.\nTo the south a line of cliffs stretches, broken only by a narrow canyon.\nSticks litter the ground...', new Array(10).fill(stick), 'deepForest', 'canyon', 'clearing', 'deepForestW');
const clearing = new Room('clearing', 'A small, overgrown clearing. To the east is a run down shack...', [], 'deepForest', null, 'shack', 'field');
const shack = new Room('shack', "Broken chairs and a dusty table. There's nothing of interest here", [], null, null, null, 'clearing');
shack.isLocked = true;
const deepForestW = new Room('deepForestW', 'The forest is deep, and dark.\nThe only paths through the tangled underbrush are game trails.\nThe trees seem to thin out to the East. There is a noticable rise to the west,\nand hazy mountain peaks rize above the treeline.\nTo the south is an unbroken line of cliffs', new Array(10).fill(stick), 'glade', null, 'field', 'foothills');
const glade = new Room('glade', 'An ancient tree has fallen here taking down a swath of trees, and leaving an idylic glade', [], 'forestW', 'deepForestW', 'deepForest', 'foothills');
const foothills = new Room('foothills', "You come out of the forest into rolling hills.\nTo the west a mighty mountain range blocks out the sky.\nA plume of smoke drifts across the sky to the north...", [], 'hutYard', null, 'glade', 'mountains');
const hutYard = new Room('hutYard', "A small hut is nestled amongst the base of the mountains to the west.\nTo the East the forest looms. A road leads into cultivated fields to the North.\nRolling hills stretch as far as the eye can see to the south...", [], null, 'foothills', 'forestW', 'hut');
const hut = new Room('hut', "The hut is a single room, cozy, and warm from the fire burning in the hearth.\nDespite the cleanliness of the cabin, and fire there are no signs of the occupants...", [], null, null, 'hutYard');
hut.isLocked = true;
const forestW = new Room('forestW', "The forest is dark and menacing, visibility is low\nand you hear animal noises all around. The trees seem to thin out to the North.\nIt would not be wise to linger...", [], 'fieldW', 'glade', 'forest', 'hutYard');
const forest = new Room('forest', 'The trees are thinner here.\nYou can see cultivated fields through the trees to the north...', [], 'fieldC', 'deepForest', 'forestE', 'forestW');
const deepForest = new Room('deepForest', "The forest is dark and menacing, visibility is low\nand you hear animal noises all around.\nIt would be most unwise to linger...", [], 'forest', 'field', 'deepForestE', 'glade');
const deepForestE = new Room('deepForestE', "The forest is dark and menacing, visibility is low\nand you hear animal noises all around. It would not be wise to linger.\nThe trees seem to thin a bit to the East, and the South...", [], 'forestE', 'clearing', 'riverS', 'deepForest');
const forestE = new Room('forestE', "The trees are thinner here.\nYou can see cultivated fields through the trees to the north.\nYou here the sound of running water to the East...", [], 'fieldE', 'deepForestE', 'river', 'forest');
const river = new Room('river', "You stand on the Western bank of a river flowing swiftly from South to North\nTo the West the forest looms...", [], 'riverN', 'riverS', null, 'forestE');
const riverS = new Room('riverS', "You stand on the Western bank of a river flowing swiftly from South to North\nTo the West the forest looms.\nThe southern cliffs can be seen above the treeline to the South...", [], 'river', 'caveEnterance', null, 'deepForestE');
const riverN = new Room('riverN', "You stand on the Western bank of a river flowing swiftly from South to North\nTo the West cultivated fields spread into the distance.\nTo the North the river dissapears beneath the city walls...", [], null, 'river', null, 'fieldE');
const fieldC = new Room('fieldC', "A road leads through fields of golden wheat.\nTo the north a set of massive gates are set into a gigantic wall.\nRoofs, and towers can be seen beyond the walls.\nMore fields stretch to the East and West. To the south the forest looms.\nEverything is earily silent...", [], null, 'forest', 'fieldE', 'fieldW');
const fieldE = new Room('fieldE', "You stand amidst a field of ripe wheat. A river flows along the Eastern side of the field.\nThe city walls tower over the Northern end of the field.\nTo the South the forest stretches into the distance...", [], null, 'forestE', 'riverN', 'fieldC');
const fieldW = new Room('fieldW', "You stand amidst a field of ripe wheat. An impassable mountain range shades\nthe Western side of the field.\nThe city walls tower over the Northern end of the field.\nTo the South the forest stretches into the distance...", [], null, 'forestW', 'fieldC', null);
const mountains = new Room('mountains', "You hike into the mountains, however they quickly become too steep to climb...", [], null, null, 'foothills')
const caveEnterance = new Room('caveEnterance', "The river rushes through a dark hole in the cliffs,\nand dissapears beneath the earth...", [], 'riverS')

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//lookup tables

//items table
const obObjs = {
  'rocks': rock,
  'rock': rock,
  'sticks': stick,
  'stick': stick,
  'shiney': key,
  'key': key
}

//rooms table
const obRooms = {
  'canyon': canyon,
  'field': field,
  'clearing': clearing,
  'shack': shack,
  'deepForestW': deepForestW,
  'deepforestw': deepForestW,
  'glade': glade,
  'foothills': foothills,
  'hutYard': hutYard,
  'hutyard': hutYard,
  'hut': hut,
  'forestW': forestW,
  'forestw': forestW,
  'forest': forest,
  'deepForest': deepForest,
  'deepforest': deepForest,
  'deepForestE': deepForestE,
  'deepforeste': deepForestE,
  'forestE': forestE,
  'foreste': forestE,
  'river': river,
  'riverS': riverS,
  'rivers': riverS,
  'riverN': riverN,
  'rivern': riverN,
  'fieldC': fieldC,
  'fieldc': fieldC,
  'fieldE': fieldE,
  'fielde': fieldE,
  'fieldW': fieldW,
  'fieldw': fieldW,
  'caveEnterance': caveEnterance,
  'caveenterance': caveEnterance,
  'mountains': mountains
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//actual game implementation definition

async function startGame() {
  player.name = null;
  let userName = await ask('Greetings adventurer! What is your name?\n>_ ');
  player.name = userName;
  let init = await ask(`Welcome ${player.name}. You are about to embark on a text based adventure;\nplease type your actions in the format [action] [item].\nTo move to a new area use [move] [direction].\nTo view your inventory type 'j' to view the room's inventory type 'i'\nAre you ready to start your journey?\n>_ `);
  if (commands.affirmative.includes(init.toLowerCase())) {
    console.log(canyon.enterRoom());
    player.currentRoom = canyon
    play()
  }
  else {
    console.log('Goodbye...');
    process.exit()
  }

}

//game mechanics
async function play() {
  let input = await ask('>_')
  let sanInput = input.toLowerCase()
  let inputArray = sanInput.split(' ');
  let thisAction = inputArray[0];
  let focus = inputArray[inputArray.length - 1]

  //exit
  if (sanInput === 'exit') {
    process.exit()
  }

  //show room inventory
  else if (sanInput === 'i') {
    if (player.currentRoom.inventory.length === 0) {
      console.log("There is nothing here...")
      play();
    } else {
      player.currentRoom.inventory.forEach(obj => console.log(obj.name))
      play();
    }
  }

  //show player inventory
  else if (sanInput === 'j') {
    if (player.inventory.length === 0) {
      console.log("What's it got it it's pocketses? Nothing, apparently...")
      play();
    } else {
      player.inventory.forEach(obj => console.log(obj.name));
      play();
    }
  }

  else if (thisAction === 'linger' && player.currentRoom.name.includes('Forest')) {
    console.log("As you linger in the forest you hear movement all around you.\nFirst one pair of glowing red eyes appears through the undergrowth,\nthen another, then a hundred more.  All at once the beasts pounce on you\ntearing you to pieces in an explosion of gore.\nYou have died.");
    process.exit();
  }

  //move
  else if (commands.move.includes(thisAction)) {
    if (inputArray.length === 1) {
      console.log('When beset be fear or doubt\nRun in circles\nScream and shout.');
      play()
    }
    else {
      if (focus === 'n') {
        focus = 'north'
      }
      else if (focus === 's') {
        focus = 'south'
      }
      else if (focus === 'e') {
        focus = 'east'
      }
      else if (focus === 'w') {
        focus = 'west'
      }
      let direction = focus;
      if (directions[direction].includes(direction) || direction === player.currentRoom[direction].toLowerCase()) {
        console.log(`Moving ${direction}...`);
        player.changeRoom(obRooms[player.currentRoom[direction]]);
        console.log(player.currentRoom.enterRoom())
        play();
      }
      else if (obRooms[player.currentRoom][direction] == undefined) {
        console.log("You can't go that way...")
        play()
      }

      else {
        console.log("That's not a valid direction.\nPlease choose one of the cardinal directions (n,s,e,w)");
        play()
      }
    }
  }
  else if (thisAction === 'xyzzy' && obRooms[focus]) {
    if (obRooms[focus].isLocked) {
      obRooms[focus].unlock()
    }
    player.changeRoom(obRooms[focus])
    console.log(player.currentRoom.enterRoom())
    play();
  }

  //examine objects
  else if (commands.examine.includes(thisAction) && player.currentRoom.inventory.includes(obObjs[focus])) {
    let item = focus;
    console.log(obObjs[item].description)
    play();
  }
  else if (commands.examine.includes(thisAction) && player.inventory.includes(obObjs[focus])) {
    let item = focus;
    console.log(obObjs[item].description)
    play();
  }

  //examine room
  else if (commands.examine.includes(thisAction)) {
    console.log(player.currentRoom.description);
    play();
  }

  //pick up item
  else if (commands.take.includes(thisAction)) {
    let item = obObjs[focus]
    if (player.currentRoom.inventory.includes(item)) {
      console.log(player.pickUp(item));
      play();
    }
    else {
      console.log(`You don't see any ${focus}s here...`)
      play()
    }
  }

  //use item
  else if (commands.use.includes(thisAction)) {
    let item = obObjs[focus]
    if (player.inventory.includes(item) || player.currentRoom.inventory.includes(item)) {
      item.action()
      play();
    } else {
      console.log("You can't use what isn't here...");
      play()
    }
  }

  else if (commands.unlock.includes(thisAction)) {
    if (player.inventory.includes(key)) {
      key.action();
      play()
    }
    else {
      console.log("You don't have a key...");
      play()
    }
  }

  else {
    console.log("I don't know how to " + thisAction);
    play();
  }
}

startGame();

//To Do:
//  NPCs or the myst approach? Which should I do? NPCs would need another chunk of behavioral code & class template...
// create an actual narative/world


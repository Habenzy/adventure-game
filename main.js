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
const key = new InvObj('key', 'A small key', true, () => {
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


//list of rooms
const canyon = new Room('canyon', 'You stand in a canyon completely blocked in on three sides.\nThe cannyon is littered with rocks. Your only path out lies to the north...', [rock, key], 'field')
const field = new Room('field', 'You stand in an open field surrounded by forboding forests.\nTo the south a line of cliffs stretches, broken only by a narrow canyon.\n Sticks litter the ground...', new Array(10).fill(stick), null, 'canyon', 'clearing');
const clearing = new Room('clearing', 'A small, overgrown clearing. To the east is a run down shack...', [], null, null, 'shack', 'field');
const shack = new Room('shack', "Broken chairs and a dusty table. There's nothing of interest here", [], null, null, null, 'clearing');
shack.isLocked = true;

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//lookup tables

//items table
const obObjs = {
  'rocks': rock,
  'rock': rock,
  'sticks':stick,
  'stick': stick,
  'shiney': key,
  'key' : key
}

//rooms table
const obRooms = {
  'canyon': canyon,
  'field': field,
  'clearing' : clearing,
  'shack': shack
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

  //move
  else if (commands.move.includes(thisAction)) {
    if (inputArray.length === 1) {
      console.log('When beset be fear or doubt\nRun in circles\nScream and shout.');
      play()
    }
    else {
      let direction = focus;
      if (directions.north.includes(direction) || direction === player.currentRoom.north) {
        direction = 'north';
        if (player.currentRoom.north) {
          console.log("Moving North...");
          player.changeRoom(obRooms[player.currentRoom.north]);
          console.log(player.currentRoom.enterRoom())
          play();
        }
        else {
          console.log("You can't go that way...")
          play()
        }
      }
      else if (directions.south.includes(direction) || direction === player.currentRoom.south) {
        direction = 'south';
        if (player.currentRoom.south) {
          console.log('Moving South...')
          player.changeRoom(obRooms[player.currentRoom.south]);
          console.log(player.currentRoom.enterRoom())
          play();
        }
        else {
          console.log("You can't go that way...")
          play()
        }
      }
      else if (directions.east.includes(direction) || direction === player.currentRoom.east) {
        direction = 'east';
        if (player.currentRoom.east) {
          console.log('Moving East...')
          player.changeRoom(obRooms[player.currentRoom.east]);
          console.log(player.currentRoom.enterRoom())
          play();
        }
        else {
          console.log("You can't go that way...")
          play()
        }
      }
      else if (directions.west.includes(direction) || direction === player.currentRoom.west) {
        direction = 'west';
        if (player.currentRoom.west) {
          console.log('Moving west...')
          player.changeRoom(obRooms[player.currentRoom.west]);
          console.log(player.currentRoom.enterRoom())
          play();
        }
        else {
          console.log("You can't go that way...")
          play()
        }
      }
      else {
        console.log("That's not a valid direction.\nPlease choose one of the cardinal directions (n,s,e,w)");
        play()
      }
    }
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
    if(player.inventory.includes(key)){
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
//  NPCs or the myst approach? Which should I do? NPCs would need another chunk of behavioral code & object template...
// create an actual narative/world
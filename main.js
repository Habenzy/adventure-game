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
    player.currentRoom = room
  },
  //pick up
  pickUp: (item) => {
    if (item.takeable === true) {
      console.log(player.inventory)
      player.inventory.push(item);
      return (`You pick up ${item.name}`)
    }
    else return ("You can't take that")
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
      if (this.isLocked === false) {
        return ('The door is already unlocked')
      }
      else {
        this.isLocked = false;
        return ("The door unlocks with an audible click.")
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

//objects list MUST BE BEFORE ROOMS
const stick = new InvObj('stick', 'A seemingly ordinary stick', true, () => { console.log('The stick breaks...'); player.inventory.pop(stick) });
const rock = new InvObj('rock', 'A rock. Not very exciting', false, () => { console.log('The rock is impervious, heavy, and boring. You should leave it be...') })

//list of rooms
const canyon = new Room('canyon', 'You stand in a canyon completely blocked in on three sides, your only path out lies to the north...', [rock], 'field')
const field = new Room('field', 'You stand in an open field surrounded by forboding forests.\nTo the south a line of cliffs stretches, broken only by a narrow canyon...', [stick], null, 'canyon')

const obObjs = {
  'rock': rock,
  'stick': stick
}

const obRooms = {
  'canyon': canyon,
  'field': field
}

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
      if (directions.north.includes(direction)) {
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
      else if (directions.south.includes(direction)) {
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
      else if (directions.east.includes(direction)) {
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
      else if (directions.west.includes(direction)) {
        direction = 'west';
        if (player.currentRoom.west) {
          console.log('Moving West...')
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

  else {
    console.log("I don't know how to do that...");
    play();
  }
}

startGame();
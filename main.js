//Server initialization
const express = require("express");
const app = express();
const port = process.env.PORT || 5500;

app.use(express.static("client/dist"));
app.use(express.json());

const Room = require('./game_templates/room.js')
const InvObj = require('./game_templates/item.js')
const Npc = require('./game_templates/npc.js')
//Rule sets

let gameStarted = false;

//player object
const player = {
  name: null,
  currentRoom: null,
  inventory: [],
  status: [],

  lookAround: () => {
    return this.currentRoom.description;
  },

  //move
  changeRoom: (room) => {
    if (!room.isLocked) {
      player.currentRoom = room;
    } else {
      console.log(`The ${room.name} is locked...`);
    }
  },

  //pick up
  pickUp: (item) => {
    if (item.takeable) {
      player.inventory.push(item);
      player.currentRoom.removeItem(item);
      return `You pick up a ${item.name}`;
    } else {
      return "You can't take that";
    }
  },

  //drop item
  dropItem: (itemName) => {
    let item = player.inventory.find((object) => {
      return object.name === itemName;
    });
    let dropped = player.inventory.splice(player.inventory.indexOf(item), 1);
    //console.log(dropped)
    player.currentRoom.addItem(dropped[0]);
  },
  //make item

  //use items
  useItem: (item) => {
    item.action();
  },
};

//acceptable commands
const commands = {
  affirmative: ["yes", "yesh", "yup", "y", "yeah", "ok", ""],
  move: [
    "go",
    "move",
    "head",
    "walk",
    "run",
    "crawl",
    "skip",
    "enter",
    "continue",
  ],
  examine: ["look", "examine", "check", "study", "inspect"],
  take: ["pick", "take", "grab", "steal", "buy"],
  use: ["use", "give", "eat", "drink"],
  unlock: ["unlock", "open"],
  immolate: ["immolate", "ignite", "light", "burn"],
  drop: ["drop", "remove"],
  talk: ["talk", "speak", "yell", "whisper"],
  attack: ["attack", "strike"]
};

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//object definitions

//objects list MUST BE BEFORE ROOMS
const stick = new InvObj(
  "stick",
  "A seemingly ordinary stick",
  true,
  (req, res) => {
    player.inventory.splice(player.inventory.indexOf(stick, 1));
    res.json({ request: input, display: "The stick breaks..." });
  }
); //refactor removal of stick
const rock = new InvObj(
  "rock",
  "A rock. Not very exciting, but something shiney catches your eye...",
  false,
  (req, res) => {
    res.json({
      request: input,
      display:
        "The rock is impervious, heavy, and boring. You should probably leave it be...",
    });
  }
);
const key = new InvObj(
  "key",
  "A small key you found amongst the rocks",
  true,
  (req, res) => {
    if (
      player.currentRoom.north &&
      obRooms[player.currentRoom.north].isLocked
    ) {
      res.json({
        request: input,
        display: obRooms[player.currentRoom.north].unlock(),
      });
    } else if (
      player.currentRoom.south &&
      obRooms[player.currentRoom.south].isLocked
    ) {
      res.json({
        request: input,
        display: obRooms[player.currentRoom.south].unlock(),
      });
    } else if (
      player.currentRoom.east &&
      obRooms[player.currentRoom.east].isLocked
    ) {
      res.json({
        request: input,
        display: obRooms[player.currentRoom.east].unlock(),
      });
    } else if (
      player.currentRoom.west &&
      obRooms[player.currentRoom.west].isLocked
    ) {
      res.json({
        request: input,
        display: obRooms[player.currentRoom.west].unlock(),
      });
    } else {
      res.json({
        request: input,
        display: "There is nothing to unlock here...",
      });
    }
  }
);

//NPC definitions

//room definitions
const canyon = new Room(
  "canyon",
  "You stand in a canyon completely blocked in on three sides.\nThe cannyon is littered with rocks. Your only path out lies to the north...",
  [rock, key],
  "field"
);
const field = new Room(
  "field",
  "You stand in an open field surrounded by forboding forests.\nTo the south a line of cliffs stretches, broken only by a narrow canyon.\nSticks litter the ground...",
  new Array(10).fill(stick),
  "deepForest",
  "canyon",
  "clearing",
  "deepForestW"
);
const clearing = new Room(
  "clearing",
  "A small, overgrown clearing. To the east is a run down shack...",
  [],
  "deepForest",
  null,
  "shack",
  "field"
);
const shack = new Room(
  "shack",
  "Broken chairs and a dusty table. There's nothing of interest here",
  [],
  null,
  null,
  null,
  "clearing"
);
shack.isLocked = true;
const deepForestW = new Room(
  "deepForestW",
  "The forest is deep, and dark.\nThe only paths through the tangled underbrush are game trails.\nThe trees seem to thin out to the East. There is a noticable rise to the west,\nand hazy mountain peaks rize above the treeline.\nTo the south is an unbroken line of cliffs",
  new Array(10).fill(stick),
  "glade",
  null,
  "field",
  "foothills"
);
const glade = new Room(
  "glade",
  "An ancient tree has fallen here taking down a swath of trees, and leaving an idylic glade",
  [],
  "forestW",
  "deepForestW",
  "deepForest",
  "foothills"
);
const foothills = new Room(
  "foothills",
  "You come out of the forest into rolling hills.\nTo the west a mighty mountain range blocks out the sky.\nA plume of smoke drifts across the sky to the north...",
  [],
  "hutYard",
  null,
  "glade",
  "mountains"
);
const hutYard = new Room(
  "hutYard",
  "A small hut is nestled amongst the base of the mountains to the west.\nTo the East the forest looms. A road leads into cultivated fields to the North.\nRolling hills stretch as far as the eye can see to the south...",
  [],
  null,
  "foothills",
  "forestW",
  "hut"
);
const hut = new Room(
  "hut",
  "The hut is a single room, cozy, and warm from the fire burning in the hearth.\nDespite the cleanliness of the cabin, and fire there are no signs of the occupants...",
  [],
  null,
  null,
  "hutYard"
);
hut.isLocked = true;
const forestW = new Room(
  "forestW",
  "The forest is dark and menacing, visibility is low\nand you hear animal noises all around. The trees seem to thin out to the North.\nIt would not be wise to linger...",
  [],
  "fieldW",
  "glade",
  "forest",
  "hutYard"
);
const forest = new Room(
  "forest",
  "The trees are thinner here.\nYou can see cultivated fields through the trees to the north...",
  [],
  "fieldC",
  "deepForest",
  "forestE",
  "forestW"
);
const deepForest = new Room(
  "deepForest",
  "The forest is dark and menacing, visibility is low\nand you hear animal noises all around.\nIt would be most unwise to linger...",
  [],
  "forest",
  "field",
  "deepForestE",
  "glade"
);
const deepForestE = new Room(
  "deepForestE",
  "The forest is dark and menacing, visibility is low\nand you hear animal noises all around. It would not be wise to linger.\nThe trees seem to thin a bit to the East, and the South...",
  [],
  "forestE",
  "clearing",
  "riverS",
  "deepForest"
);
const forestE = new Room(
  "forestE",
  "The trees are thinner here.\nYou can see cultivated fields through the trees to the north.\nYou here the sound of running water to the East...",
  [],
  "fieldE",
  "deepForestE",
  "river",
  "forest"
);
const river = new Room(
  "river",
  "You stand on the Western bank of a river flowing swiftly from South to North\nTo the West the forest looms...",
  [],
  "riverN",
  "riverS",
  null,
  "forestE"
);
const riverS = new Room(
  "riverS",
  "You stand on the Western bank of a river flowing swiftly from South to North\nTo the West the forest looms.\nThe southern cliffs can be seen above the treeline to the South...",
  [],
  "river",
  "caveEnterance",
  null,
  "deepForestE"
);
const riverN = new Room(
  "riverN",
  "You stand on the Western bank of a river flowing swiftly from South to North\nTo the West cultivated fields spread into the distance.\nTo the North the river dissapears beneath the city walls...",
  [],
  null,
  "river",
  null,
  "fieldE"
);
const fieldC = new Room(
  "fieldC",
  "A road leads through fields of golden wheat.\nTo the north a set of massive gates are set into a gigantic wall.\nRoofs, and towers can be seen beyond the walls.\nMore fields stretch to the East and West. To the south the forest looms.\nEverything is earily silent...",
  [],
  null,
  "forest",
  "fieldE",
  "fieldW"
);
const fieldE = new Room(
  "fieldE",
  "You stand amidst a field of ripe wheat. A river flows along the Eastern side of the field.\nThe city walls tower over the Northern end of the field.\nTo the South the forest stretches into the distance...",
  [],
  null,
  "forestE",
  "riverN",
  "fieldC"
);
const fieldW = new Room(
  "fieldW",
  "You stand amidst a field of ripe wheat. An impassable mountain range shades\nthe Western side of the field.\nThe city walls tower over the Northern end of the field.\nTo the South the forest stretches into the distance...",
  [],
  null,
  "forestW",
  "fieldC",
  null
);
const mountains = new Room(
  "mountains",
  "You hike into the mountains, however they quickly become too steep to climb...",
  [],
  null,
  null,
  "foothills"
);
const caveEnterance = new Room(
  "caveEnterance",
  "The river rushes through a dark hole in the cliffs,\nand disappears beneath the earth...",
  [],
  "riverS"
);

//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//lookup tables

//items table
const obObjs = {
  rocks: rock,
  rock: rock,
  sticks: stick,
  stick: stick,
  shiney: key,
  key: key,
};

//rooms table
const obRooms = {
  canyon: canyon,
  field: field,
  clearing: clearing,
  shack: shack,
  deepForestW: deepForestW,
  deepforestw: deepForestW,
  glade: glade,
  foothills: foothills,
  hutYard: hutYard,
  hutyard: hutYard,
  hut: hut,
  forestW: forestW,
  forestw: forestW,
  forest: forest,
  deepForest: deepForest,
  deepforest: deepForest,
  deepForestE: deepForestE,
  deepforeste: deepForestE,
  forestE: forestE,
  foreste: forestE,
  river: river,
  riverS: riverS,
  rivers: riverS,
  riverN: riverN,
  rivern: riverN,
  fieldC: fieldC,
  fieldc: fieldC,
  fieldE: fieldE,
  fielde: fieldE,
  fieldW: fieldW,
  fieldw: fieldW,
  caveEnterance: caveEnterance,
  caveenterance: caveEnterance,
  mountains: mountains,
};

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//actual game implementation functions

async function combat(req, res) {

}

async function startGame(req, res) {
  //initialize player object in starting location
  player.name = null;
  let userName = req.body.input;
  player.name = userName;
  player.currentRoom = canyon;
  gameStarted = true;

  res.json({
    request: "",
    display: `Welcome ${
      player.name
    }. You are about to embark on a text based adventure;\nplease type your actions in the format [action] [item].\nTo move to a new area use [move] [direction].\nTo view your inventory type 'j' to view the room's inventory type 'i'\nIt's time to start your journey!\n${canyon.enterRoom()}`,
  });
}

//game mechanics
async function play(req, res) {
  let input = req.body.input;
  let sanInput = input.toLowerCase().trim();
  let inputArray = sanInput.split(" ");
  let thisAction = inputArray[0];
  let focus = inputArray[inputArray.length - 1];

  //exit
  if (sanInput === "exit") {
    res.json({ request: input, display: "Goodbye...", gameOver: true });
    gameStarted = false;
  }

  //show room inventory
  else if (sanInput === "i") {
    if (player.currentRoom.inventory.length === 0) {
      res.json({ request: input, display: "There is nothing here..." });
    } else {
      let objList = player.currentRoom.inventory.map((obj) => obj.name);
      res.json({ request: input, display: objList });
    }
  }

  //show player inventory
  else if (sanInput === "j") {
    if (player.inventory.length === 0) {
      res.json({
        request: input,
        display: "What's it got it it's pocketses? Nothing, apparently...",
      });
    } else {
      let objList = player.inventory.map((obj) => console.log(obj.name));
      res.json({ request: input, display: objList });
    }
  } else if (
    thisAction === "linger" &&
    player.currentRoom.name.toLowerCase().includes("forest")
  ) {
    res.json({
      request: input,
      display:
        "As you linger in the forest you hear movement all around you.\nFirst one pair of glowing red eyes appears through the undergrowth,\nthen another, then a hundred more.  All at once the beasts pounce on you\ntearing you to pieces in an explosion of gore.\nYou have died...",
      gameOver: true,
    });
    gameStarted = false;
  }

  //move
  else if (commands.move.includes(thisAction)) {
    if (inputArray.length === 1) {
      res.json({
        request: input,
        display:
          "When beset be fear or doubt\nRun in circles\nScream and shout.",
      });
    } else {
      if (focus === "n") {
        focus = "north";
      } else if (focus === "s") {
        focus = "south";
      } else if (focus === "e") {
        focus = "east";
      } else if (focus === "w") {
        focus = "west";
      }
      let direction = focus;
      if (player.currentRoom[direction]) {
        player.changeRoom(obRooms[player.currentRoom[direction]]);
        res.json({
          request: input,
          display: `Moving ${direction}...\n${player.currentRoom.enterRoom()}`,
        });
      } else if (
        direction !== "north" &&
        direction !== "south" &&
        direction !== "east" &&
        direction !== "west"
      ) {
        res.json({
          request: input,
          display:
            "That's not a valid direction\nPlease choose one of the cardinal directions (n,s,e,w)",
        });
      } else {
        res.json({ request: input, display: "You can't go that way..." });
      }
    }
  } else if (thisAction === "xyzzy" && obRooms[focus]) {
    if (obRooms[focus].isLocked) {
      obRooms[focus].unlock();
    }
    player.changeRoom(obRooms[focus]);
    res.json({ request: input, display: player.currentRoom.enterRoom() });
  }

  //examine objects
  else if (
    commands.examine.includes(thisAction) &&
    player.currentRoom.inventory.includes(obObjs[focus])
  ) {
    let item = focus;
    res.json({ request: input, display: obObjs[item].description });
  } else if (
    commands.examine.includes(thisAction) &&
    player.inventory.includes(obObjs[focus])
  ) {
    let item = focus;
    res.json({ request: input, display: obObjs[item].description });
  }

  //examine room
  else if (commands.examine.includes(thisAction)) {
    res.json({ request: input, display: player.currentRoom.description });
  }

  //pick up item
  else if (commands.take.includes(thisAction)) {
    let item = obObjs[focus];
    if (player.currentRoom.inventory.includes(item)) {
      res.json({ request: input, display: player.pickUp(item) });
    } else {
      res.json({
        request: input,
        display: `You don't see any ${focus}s here...`,
      });
    }
  }

  //use item
  else if (commands.use.includes(thisAction)) {
    let item = obObjs[focus];
    if (
      player.inventory.includes(item) ||
      player.currentRoom.inventory.includes(item)
    ) {
      item.action(req, res);
    } else {
      res.json({ request: input, display: "You can't use what isn't here..." });
    }
  }

  //Drop Item
  else if (commands.drop.includes(thisAction)) {
    let item = obObjs[focus];
    if (item && player.inventory.includes(item)) {
      player.dropItem(item.name);
      res.json({ request: input, display: `You drop ${item.name}` });
    } else {
      res.json({ request: input, display: `You do not have ${focus}...` });
    }
  }

  //Unlock rooms
  else if (commands.unlock.includes(thisAction)) {
    if (player.inventory.includes(key)) {
      key.action(req, res);
    } else {
      res.json({ request: input, display: "You don't have a key..." });
    }
  }

  //talk to NPCs
  else if (commands.talk.includes(thisAction)) {
    player.currentRoom.npcs.length ? //should eventually be changed to target specific NPC, but I'm feeling lazy
      res.json({request: input, display: player.currentRoom.npcs[0].questDialog}) :
      res.json({request: input, display: "Talking to your self is the first sign of madness..."}) //implement madness mechanics?
  }

  //Light things on FIRE!!!!!!!!!!!!!!
  else if (commands.immolate.includes(thisAction)) {
    if (obObjs[focus] && obObjs[focus].name === "stick") {
      player.dropItem("stick");
      res.json({
        request: input,
        display: "The stick burns merrily for a second...",
      });
    } else {
      gameStarted = false;
      res.json({
        request: input,
        display:
          "The fire spreads quickly... too quickly\nThere is no escape. You have died...",
        gameOver: true,
      });
    }
  }

  //Catch all for unexpected actions
  else {
    res.json({ request: input, display: "I don't know how to " + thisAction });
  }
}

//Server routes
app.post("/act", (req, res) => {
  console.log(req.body);
  if (!gameStarted) {
    startGame(req, res);
  } else {
    play(req, res);
  }
});

app.get("*", (req, res) => {
  res.sendFile(__dirname + "/client/dist/index.html");
});

app.listen(port, () => console.log(`Listening on port ${port}`));

//To Do:
// build out city and cave network
// make more items, and puzzles

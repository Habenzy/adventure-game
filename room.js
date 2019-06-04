import player from "./player";

class Room {
  constructor(name, description, inventory, north, south, east, west) {
    //name and description should be strings, inventory is an array of objects, directionals are pointers to the next room
    this.name = name;
    this.playerIsHere = false;
    this.description = description;
    this.inventory = inventory || [];
    this.isLocked = false;
    this.north = north || null;
    this.south = south || null;
    this.east = east || null;
    this.west = west || null;

    this.canMoveDir = (direction) => {
      let validTransitions = rooms[this.name.toString()].canChangeTo;
      if (validTransitions.includes(direction)) {
        return true
      }
      else { return false }
    };

    this.moveDir = (dir) => {
      if (this.canMoveDir(dir)) {
        player.changeRoom(this.dir)
      }
      else { return "You can't go that way..."}
    }

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
      let thisItem = this.inventory.find(obj => {
        return (obj.name === item.toLowerCase())
      })
      if (this.inventory.includes(thisItem)) {
        return (thisItem.description)
      }
      else { return (`You don't see ${item} in here...`) }
    };

    this.enterRoom = () => {
      return (this.name + '\n' + this.description)
    }

  }
}

export default Room
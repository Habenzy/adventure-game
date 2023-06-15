//Area creation
class Room {
  constructor(name, description, npcs, inventory, north, south, east, west) {
    //name and description should be strings, inventory is an array of objects, directions are strings

    this.name = name;
    this.description = description;
    this.npcs = npcs || []
    this.inventory = inventory || [];
    this.isLocked = false;
    this.north = north || null;
    this.south = south || null;
    this.east = east || null;
    this.west = west || null;

    this.unlock = () => {
      if (player.inventory.includes(obObjs["key"])) {
        if (this.isLocked === false) {
          return "The door is already unlocked";
        } else {
          this.isLocked = false;
          return "The door unlocks with an audible click.";
        }
      } else {
        return "You don't have a key...";
      }
    };

    this.removeItem = (itemName) => {
      let item = this.inventory.find((object) => {
        return object.name === itemName;
      });

      this.inventory.splice(this.inventory.indexOf(item), 1);
    };

    this.addItem = (item) => {
      this.inventory.push(item);
    };

    this.examineItem = (item) => {
      return item.description;
    };

    this.enterRoom = () => {
      return this.name + "\n" + this.description;
    };
  }
}

module.exports = Room
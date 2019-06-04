player = {
  name: null,
  currentRoom: null,
  playerInventory: [],
  playerStatus: [],
  focus: null,
  //player actions
    lookAround: () => {
    return (this.currentRoom.description)
  },

  changeFocus: (obj) => {
    if (this.currentRoom.examineItem(obj) !== `You don't see ${item} in here...`) {
      focus = obj;
      return (obj.description)
    }
    else {
      return `You don't see ${item} in here...`
    }
  },
  
  changeRoom: (room) => {
      this.currentRoom = room;
      focus = null;
      currentRoom.enterRoom()
  },
    //pick up
  pickUp: (item) => {
    if (item.takeable === true) { 
      this.playerInventory.push(item);
      return (`You pick up ${item.name}`)
    }
    else return("You can't take that")
  },
    //use items
  useItem: (item) => {
    item.action()
  }
}

export default player
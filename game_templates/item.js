//Item creation
class InvObj {
  constructor(name, desc, takeable, action) {
    //name and desc should be strings, takeable is a boolean, action should be a function
    this.name = name;
    this.description = desc;
    this.takeable = takeable;
    this.action = action;
  }
}

module.exports = InvObj
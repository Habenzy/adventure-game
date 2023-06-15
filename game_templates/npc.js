class Npc {
  constructor(name, description, items, questDialog, hostile) {
    this.name  = name
    this.description = description
    this.items = items || []
    this.questDialog = questDialog
    this.hostile = hostile || false
  }
}
const { readdirSync } = require('fs')
const path = require('path')
const Command = require('./lib/command')
const { Client } = require('discord.js')

module.exports = {
  /**Load all the commands from a commands folder into the client.
   * @param {Client} client
   * @param {string} comsDir 
   */
  loadCommands(client, comsDir){
    //create the containers of commands.
    let commands = {}
    let commandSet = new Set()

    //iterate over all the command files.
    for (const file of readdirSync(comsDir)){
      if (!file.endsWith('.js')) continue
      const Com = require(`${comsDir}/${file}`)
      if(!(typeof Com === 'function')) continue
      /**@type {Command} */
      let com = new Com()
      if (!(com instanceof Command)) continue
      commandSet.add(com)
      for (alias of com.aliases) commands[alias] = com
    }

    //add the command containers to the client
    client.commands = commands
    client.commandSet = commandSet
  },

  /**Load all the events from an events folder into the client.
   * @param {Client} client
   * @param {string} evntsDir 
   */
  loadEvents(client, evntsDir){
    //iterate over the event files
    for (const file of readdirSync(evntsDir)){
      if (!file.endsWith('.js')) continue
      const { name, once, trigger } = require(`${evntsDir}/${file}`)
      if (once) client.once(name, (...args) => trigger(client, ...args))
      else client.on(name, (...args) => trigger(client, ...args))
    }
  },
  
  /**Load all the commands and events from a commands and an events folders
   *respectively, into the client.
   * @param {Client} client
   * @param {string} comsDir 
   * @param {string} evntsDir 
   */
  init(client, comsDir, evntsDir){
    module.exports.loadCommands(client, comsDir)
    module.exports.loadEvents(client, evntsDir)
  }
}
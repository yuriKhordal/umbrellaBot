const { Message, Client } = require("discord.js");
const Command = require("../lib/command");

/**Handles unknown commands.
 * @param {Client} client The bot client.
 * @param {Message} message The message that triggered the event.
 * @param {string[]} args An array of the arguments of the command.
 */
async function unknownCommand(client, message, args){
  const prefix = process.env.PREFIX
  await message.channel.send(`Unknown command \`${prefix}${args[0]}\``)
  await client.commands.help.execute(client, message, args)
}

module.exports = {
  /**The name of the event.*/
  name: 'messageCreate',
  /**Whether the event should only trigger once.*/
  once: false,
  /**Run when the event gets triggered.
   * @param {Client} client The bot client.
   * @param {Message} message The message that triggered the event.
   */
  trigger(client, message){
    let prefix = process.env.PREFIX
    //ignore non commands and bots
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    //Parse the command and execute it
    /**@type {string[]}*/
    let args = message.content.split(/\s+/)
    args[0] = args[0].slice(prefix.length)
    /**@type {Command} */
    let command = client.commands[args[0]]
    if (!command) return unknownCommand(client, message, args)
    command.execute(client, message, args)
  }
}
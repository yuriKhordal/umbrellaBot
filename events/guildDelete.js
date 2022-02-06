const { Client, Guild } = require("discord.js");
const { removeGuild } = require("../lib/sqlHelper")

module.exports = {
  /**The name of the event.*/
  name: 'guildDelete',
  /**Whether the event should only trigger once.*/
  once: false,
  /**Run when the event gets triggered.
   * @param {Client} client The bot client.
   * @param {Guild} guild The guild that the client joined.
   */
  trigger(client, guild){
    removeGuild(guild)
  }
}
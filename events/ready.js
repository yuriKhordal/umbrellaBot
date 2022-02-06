const { Client } = require("discord.js")

module.exports = {
  /**The name of the event.*/
  name: 'ready',
  /**Whether the event should only trigger once.*/
  once: true,
  /**Run when the event gets triggered.
   * @param {Client} client The bot client.
   */
  trigger(client){
    console.log('ready!')

    client.user.setActivity("Having trouble? ;help", {type: "CUSTOM_STATUS"})
  }
}
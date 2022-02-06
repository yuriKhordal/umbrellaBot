const { Client, Message, TextChannel, DMChannel, NewsChannel} = 
  require("discord.js");
const Permissions = require("./permissions");

/**The base class for commands.
 * @abstract
 */
class Command{
  constructor(){
    /**The aliases of the command
     * @type {string[]}
     * @abstract
     */
    this.aliases
    /**A brief description of the command for the help command summary
     * @type {string}
     * @abstract
     */
    this.description
    /**A list allow/deny permissions for users and roles.
     * @type {Permissions}
     */
    this.permissions = new Permissions()
    /**Whether the command is hidden from help and stuff
     * @type {boolean}
     */
    this.hidden = false
  }

  /**Execute the command.
   * @param {Client} client The bot client.
   * @param {Message} message The message that triggered the command.
   * @param {string[]} args An array of the arguments of the command.
   * @abstract
   */
  async execute(client, message, args){}

  /**Check if the message's author has permissions to run the command and
   *displays a message if he has no such permission.
   * @param {Message} message 
   * @returns {Promise<boolean>} `true` if the user has **no** permission to run the
   *command. `false` if the user has permissions
   */
  async noPermission(message){
    if (this.permissions.hasPermission(message.member)) return false

    await message.channel.send("You are not allowed to do that!")
    return true
  }

  /**Send a full description of the command to the specified channel.
   * Not to be confused with the `description` property, this method is called
   * on the `help` command with the current command as an argument, the
   * `description` property is used in the general `help` command.
   * @param {TextChannel|DMChannel|NewsChannel} channel 
   * @abstract
   */
  async sendDescription(channel){}
}

module.exports = Command
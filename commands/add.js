const { MessageEmbed, TextChannel, DMChannel, NewsChannel, Client, Message } =
  require("discord.js");
const { ArgFlag, ArgsParser, UserError } = require("../lib/argparser");
const Command = require("../lib/command");
const { addGuild, removeGuild } = require("../lib/sqlHelper");

/**A command to display help messages*/
class Add extends Command{
  constructor(){
    super()
    this.aliases = ['add']
    this.permissions.allowByDefault()
    this.description = "Displays a brienf description of all commands."
  }

  /**@param {Message} message */
  async execute(client, message, args){
    addGuild(message.guild)
  }

  /**Send a brief description of all the commands
   * @param {Client} client
   * @param {TextChannel|DMChannel|NewsChannel} channel
   * @param {boolean} long
   */
  async sendHelpEmbed(client, channel, long){
  }

  async sendDescription(channel){}
}

module.exports = Add
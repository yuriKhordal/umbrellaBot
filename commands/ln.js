const { MessageEmbed, TextChannel, DMChannel, NewsChannel, Client, Message } =
  require("discord.js");
const { ArgFlag, ArgsParser, UserError } = require("../lib/argparser");
const Command = require("../lib/command");
const { addGuild, removeGuild, linkRoles } = require("../lib/sqlHelper");

/**A command to display help messages*/
class Ln extends Command{
  constructor(){
    super()
    this.aliases = ['ln']
    this.permissions.allowByDefault()
    this.description = "Displays a brienf description of all commands."
  }

  /**@param {Message} message */
  async execute(client, message, args){
    let guild = message.guild
    let parent = await guild.roles.fetch(args[1].slice(3,-1))
    let roles = []
    for (const role of args) {
      if (role === args[0]) continue
      if (role === args[1]) continue
      roles.push(await guild.roles.fetch(role.slice(3,-1)))
    }
    linkRoles(guild.id, parent, ...roles)
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

module.exports = Ln
const { MessageEmbed, TextChannel, DMChannel, NewsChannel, Client } =
  require("discord.js");
const { ArgFlag, ArgsParser, UserError } = require("../lib/argparser");
const Command = require("../lib/command");

/**A command to display help messages*/
class Help extends Command{
  constructor(){
    super()
    this.aliases = ['help', 'h']
    this.permissions.allowByDefault()
    this.description = "Displays a brienf description of all commands."

    this.long = new ArgFlag().setShort('l').setLong('long')
    this.dm = new ArgFlag().setShort('d').setLong('dm')
    this.help = new ArgFlag().setShort('h').setLong('help')
    this.parser = new ArgsParser().addOption(this.long).addOption(this.dm)
      .addOption(this.help).setArgsAction((command, ...rest) => {
        if (rest.length > 0) throw UserError.wrongArgNumber()
        this.parser.command = command ?? ''
      })
    this.parser.command = ''
  }

  async execute(client, message, args){
    if (await this.noPermission(message)) return;

    let long = false, dm = false, help = false, command = null
    try {
      this.parser.parse(...args)
      long = this.long.flag
      dm = this.dm.flag
      help = this.help.flag
      let name = this.parser.command

      if (name) {
        command = client.commands[name]
        if (!command || command.hidden) throw new UserError(`Command \
\`${name}\` not found.`)
      } else command = null
    } catch(e) {
      if (e instanceof UserError){
        await message.channel.send(`help: ${e.message}`)
        await this.sendDescription(message.channel)
        return
      } else throw e
    } finally {
      this.parser.resetFlags()
      this.parser.command = ''
    }
    
    let channel = dm ? await message.author.createDM() : message.channel
    if (help) await this.sendDescription(channel)
    else if (!command) await this.sendHelpEmbed(client, channel, long)
    else await command.sendDescription(channel)
  }

  /**Send a brief description of all the commands
   * @param {Client} client
   * @param {TextChannel|DMChannel|NewsChannel} channel
   * @param {boolean} long
   */
  async sendHelpEmbed(client, channel, long){
    const prefix = process.env.PREFIX
    let embed = new MessageEmbed().setTitle("Commands")
    for(const command of client.commandSet){
      if (command.hidden) continue
      let aliases = `${prefix}${command.aliases[0]}`
      let description = command.description ?? "\u200b"
      for (let i = 1; i < command.aliases.length; i++)
        aliases = aliases.concat(', ', prefix, command.aliases[i])
      embed.addField(aliases, description, !long)
    }
    channel.send({embeds: [embed]})
  }

  async sendDescription(channel){
    const prefix = process.env.PREFIX
    let embed = new MessageEmbed().setTitle("Help")
      .addField('Usage:', `\`${prefix}help [OPTION]... [COMMAND]\``)
      .addField('Description:', 'Display a brief description of all the \
commands.\n\n' + 'Appending a COMMAND name to the help command, displays a full \
description of that COMMAND instead.')
      .addField('Options', '\u200b')
      .addField('`-l`, `--long`', 'Display the help message in long format.')
      .addField('`-m`, `--dm`', 'Send the help message to the user\'s DM instead.')
    channel.send({embeds: [embed]})
  }
}

module.exports = Help
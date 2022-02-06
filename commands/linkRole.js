const { MessageEmbed, TextChannel, DMChannel, NewsChannel, Client, Guild, Role, Message, User } =
  require("discord.js");
const { ArgFlag, ArgsParser, UserError } = require("../lib/argparser");
const Command = require("../lib/command");
const { checkPermission, linkRoles, checkIfRoleLinked } = require("../lib/sqlHelper");

/**A command to link a role to others*/
class LinkRole extends Command{
  constructor(){
    super()
    this.aliases = ['linkRole', 'lnk']
    this.permissions.denyByDefault()
    this.description = "Links a role as parent to other roles."

    this.help = new ArgFlag().setShort('h').setLong('help')
    this.parser = new ArgsParser().addOption(this.help)
      .setArgsAction((parent, ...roles) => {
        if (parent === undefined) throw UserError.wrongArgNumber()
        if (roles.length === 0) throw UserError.wrongArgNumber()
        this.parser.parent = parent
        this.parser.roles = roles
      })
      this.parser.parent = null
      this.parser.roles = null
  }

  async execute(client, message, args){
    if (await this.noPermission(message)) return;

    let help = false, parent = null, roles = null
    try {
      this.parser.parse(...args)
      help = this.help.flag
      parent = this.parser.parent
      roles = this.parser.roles
      
      parent = await this.validateParent(message.guild, parent)
      roles = await this.validateRoles(client, message.guild, roles)
    } catch(e) {
      if (e instanceof UserError){
        await message.channel.send(`linkRole: ${e.message}`)
        await this.sendDescription(message.channel)
        return
      } else throw e
    } finally {
      this.parser.resetFlags()
      this.parser.parent = null
      this.parser.roles = null
    }
    
    if (help) {
      this.sendDescription(message.channel)
      return
    }

    linkRoles(message.guild.id, parent, ...roles)
  }
  
  /**
   * @param {Message} message 
   */
  async noPermission(message) {
    if (message.guild.ownerId === message.author.id) return false
    if (checkPermission(message.author)) return false;

    return super.noPermission(message)
  }

  /**Validate the role strings, and return as an array of roles.
   * @param {Guild} guild
   * @param {string} role
   * @returns {Role}
   */
  async validateParent(guild, role) {
    if (!role.startsWith('<@&') || !role.endsWith('>'))
      throw UserError.IllegalArg(role)
    let roleid = role.slice(3, -1)
    let rl = await guild.roles.fetch(roleid)
    if (!rl) throw UserError.IllegalArg(role)
    return rl
  }

  /**Validate the role strings, and return as an array of roles.
   * @param {Client} client
   * @param {Guild} guild
   * @param {string[]} roles
   * @returns {Role[]}
   */
  async validateRoles(client, guild, roles){
    if (roles === []) return []
    let arr = []

    //Iterate through roles
    for (let role of roles){
      if (!role.startsWith('<@&') || !role.endsWith('>'))
        throw UserError.IllegalArg(role)
      let roleid = role.slice(3, -1)

      //TODO: CHECK
      let rl = await guild.roles.fetch(roleid)
      if (!rl) throw UserError.IllegalArg(role)
      if (checkIfRoleLinked(rl)) throw new UserError(`Role ${role} already linked!`)
      arr.push(rl)
    }

    return arr
  }

  async sendDescription(channel){
    const prefix = process.env.PREFIX
    let embed = new MessageEmbed().setTitle("Link Roles")
      .addField('Usage:', `\`${prefix}linkRole [PARENT] [ROLES]...\``)
      .addField('Description:', 'Links a role as a parent role to other \
roles, when a user gets asigned a roll, he automatically gains all it\'s \
parent roles.')
      .addField('Options', '\u200b')
      .addField('`-h`, `--help`', 'Display this message.')
    channel.send({embeds: [embed]})
  }
}

module.exports = LinkRole
const { Client, GuildMember } = require("discord.js")

/**Represents allow/deny permission for users and roles.*/
class Permissions{
  constructor(){
    /**Which users/roles to deny.*/
    this.deny = {
      /**A list of ids of the users to deny.
       * @type {string[]}
       */
      users: [],
      /**A list of ids of the roles to deny.
       * @type {string[]}
       */
      roles: []
    }
    /**Which users/roles to allow.*/
    this.allow = {
      /**A list of ids of the users to allow.
       * @type {string[]}
       */
      users: [],
      /**A list of ids of the roles to allow.
       * @type {string[]}
       */
      roles: []
    }
    /**Whether to allow(true) or deny(false) a user/role that is not in the
     *list.
     * @type {boolean}
    */
    this._allowByDefault = true
  }

  /**Set the permission to allow by default any user/role that is not in the
   *list.
   * @returns {this}
   */
  allowByDefault(){
    this._allowByDefault = true
    return this
  }

  /**Set the permission to deny by default any user/role that is not in the
   *list.
   * @returns {this}
   */
  denyByDefault(){
    this._allowByDefault = false
    return this
  }

  /**Add a user id to the allow list.
   * @param {string} id 
   * @returns {this}
   */
  allowUser(id){
    this.allow.users.push(id)
    return this
  }
  
  /**Add a role id to the allow list.
   * @param {string} id 
   * @returns {this}
   */
  allowRole(id){
    this.allow.roles.push(id)
    return this
  }
  
  /**Add a user id to the deny list.
   * @param {string} id 
   * @returns {this}
   */
  denyUser(id){
    this.deny.users.push(id)
    return this
  }
  
  /**Add a role id to the deny list.
   * @param {string} id 
   * @returns {this}
   */
  denyRole(id){
    this.deny.roles.push(id)
    return this
  }

  /**Check whether a user has the required permissions.
   *
   * Order of permissions:
   * - Deny User
   * - Allow User
   * - Deny Role
   * - Allow Role
   * @param {Client} client 
   * @param {GuildMember} member 
   * @returns {boolean}
   */
  hasPermission(member){
    if (this.deny.users.includes(member.id)) return false
    if (this.allow.users.includes(member.id)) return true

    for (let role of this.deny.roles)
      if (member.roles.cache.has(role)) return false
    
    for (let role of this.allow.roles)
      if (member.roles.cache.has(role)) return true
    
    return this._allowByDefault
  }
}

module.exports = Permissions
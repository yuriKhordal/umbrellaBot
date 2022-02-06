const { Role, Guild, User, Message } = require("discord.js");
const { Database, OPEN_CREATE } = require("sqlite3").verbose();
const { readFileSync } = require("fs");

function throwOnErr(err) {
  if (err) throw err
}

function init() {
  let db = new Database('./db/umbrella.db', throwOnErr);

  db.run(readFileSync("./db/tables/Guilds.sql").toString(), throwOnErr)
  db.run(readFileSync("./db/tables/AllowedUsers.sql").toString(), throwOnErr)
  db.run(readFileSync("./db/tables/AllowedRoles.sql").toString(), throwOnErr)
  db.run(readFileSync("./db/tables/Roles.sql").toString(), throwOnErr)
  
  db.close(throwOnErr)
}

/**Add a guild to the db.
 * @param {Guild} guild
 */
function addGuild(guild) {
  let db = new Database("./db/umbrella.db", throwOnErr)

  let insert = readFileSync("./db/queries/insertGuild.sql").toString()
  db.run(insert, { $id: guild.id, $name: guild.name }, throwOnErr)
  
  db.close(throwOnErr)
}

/**Remove a guild from the db.
 * @param {Guild} guild
 */
function removeGuild(guild) {
  let db = new Database("./db/umbrella.db", throwOnErr)

  let del = readFileSync("./db/queries/deleteGuild.sql").toString()
  del = del.split("\n")
  for (const sql of del) db.run(sql, { $id: guild.id }, throwOnErr)
  
  db.close(throwOnErr)
}

/**Check if a message author is allowed to link roles.
 * @param {Message} message
 * @returns {boolean}
 */
function checkPermission(message) {
  let db = new Database("./db/umbrella.db", throwOnErr)

  let found = false
  let select = readFileSync("./db/queries/selectAllowed.sql").toString().split("\n")
  let params = { $id: message.author.id, $guildId: message.guildId };
  db.get(select[0], params, (err, row) => {
    if (err) throw err
    if (row !== undefined) found = true
  })
  if (!found) db.each(select[1], params, (err, row) => {
    if (err) throw err
    if (message.member.roles.cache.has(row.Id)) found = true
  })
  
  db.close(throwOnErr)
  return found
}

/**Check if the role has already been linked.
 * @param {Role} role
 * @returns {boolean}
 */
function checkIfRoleLinked(role) {
  let db = new Database("./db/umbrella.db", throwOnErr)

  let select = "SELECT * FROM Roles WHERE Id = $id AND GuildId = $guildId"
  let params = { $id: role.id, $guildId: role.guild.id }
  let linked = false
  db.serialize( () => {
    db.get(select, params, (err, row) => {
      if (err) throw err
      if (row !== undefined) linked = true
      console.log(row)
    })
    db.close(throwOnErr)
  })
  
  console.log(linked)
  return linked
}

/**Link multiple roles to a parent role.
   * @param {string} guildid The guild of the role.
   * @param {Role} parent The parent role to link to.
   * @param {...Role} children The roles to link to the parent.
  */
function linkRoles(guildid, parent, ...children) {
  let db = new Database("./db/umbrella.db", throwOnErr)

  let insert = readFileSync("./db/queries/insertRoles.sql").toString()
  for (const child of children) {
    let params = { $id: child.id, $name: child.name,
      $guildId: guildid, $parentId: parent.id }
    db.run(insert, params, throwOnErr)
  }
  
  db.close(throwOnErr)
}

module.exports = {
  init: init,
  addGuild: addGuild,
  removeGuild: removeGuild,
  linkRoles: linkRoles,
  checkPermission: checkPermission,
  checkIfRoleLinked: checkIfRoleLinked
}
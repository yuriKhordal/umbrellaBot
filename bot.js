const {Client, Intents} = require('discord.js')
require('dotenv').config()

process.env.MY_ID = '224871660409323521'

require("./lib/sqlHelper").init()

//Test RoleTree stringify
// const RoleTree = require("./lib/roleTree")
// let tree = new RoleTree()
// tree.root.value = "Root"
// let A = tree.root.addChild("A")
//   let Aa = A.addChild("a")
//     Aa.addChild("c")
//   A.addChild("b")
// tree.root.addChild("B")
// let C = tree.root.addChild("C")
//   let C1 = C.addChild("1")
//   let C2 = C.addChild("2")
//     let C2X = C2.addChild("X")
//     let C2Y = C2.addChild("Y")
//     let C2Z = C2.addChild("Z")
//   let C3 = C.addChild("3")
//   let C4 = C.addChild("4")
//   let C5 = C.addChild("5")
// console.log(tree.stringify(id => id))
// return

let botIntents = new Intents()
botIntents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_MESSAGES)

let client = new Client({intents: botIntents})
require('./discordHelper').init(client, './commands', './events')

client.login(process.env.TOKEN)
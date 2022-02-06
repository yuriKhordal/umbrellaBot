const {Tree, TreeNode} = require("../lib/tree")

class RoleTree extends Tree {
  constructor() {
    super(null)
    /**The roles in the tree.
     * @type {Set<string>}
    */
    this.roleSet = new Set();
  }

  /**Find the node with specidied role id.
   * @param {string} roleid The id of the role to find.
   * @returns {TreeNode}
  */
  findRole(roleid) {
    return this.findNode(roleid)
  }

  /**Link multiple roles to a parent role.
   * @param {string} parent The parent role to link to.
   * @param {...string} children The roles to link to the parent.
  */
  linkRoles(parent, ...children) {
    let node = parent === null ? this.root : this.findNode(parent)
    for (const child of children) {
      this.roleSet.add(child)
      node.addChild(child)
    }
  }

  /**Insert a role between two roles.
   * @param {string} parent The parent role after which to insert new role.
   * @param {string} role The role to insert inbetween.
   * @param {string} child The role to insert after the new role.
  */
  insertRole(parent, role, child) {
    let prev = parent === null ? this.root : this.findNode(parent)
    let next = prev.removeChild(child)

    //child not found.
    if (next === null) return null

    prev.addChild(role).addChild(next)
  }

  /**Return a string representation of the tree.
   * @param {function(string):string} translate A function that gets the
   *  role name from it's id.
   * @returns {string}
  */
  stringify(translate) {
    return this.#stringifyRec([], this.root, 0, translate).join("")
  }

  /**Returns a string representation of the object.
   * @param {string[]} str The string to this point.
   * @param {TreeNode} node The current node.
   * @param {number} length The length of the line.
   * @param {function(string):string} translate A function that gets the
   *  role name from it's id.
   * @returns {string[]}
   */
  #stringifyRec(str, node, length, translate) {
    let name = translate(node.value)
    if (node !== this.root) {
      str.push("->")
      length += 2
    }
    str.push(name)
    length += name.length
    if (node.isLeaf()) return str

    let first = true
    for (const child of node.children) {
      if (first) first = false
      else {
        str.push("\n")
        str.push(" ".repeat(length))
      }
      this.#stringifyRec(str, child, length, translate);
    }

    return str
  }
}

module.exports = RoleTree
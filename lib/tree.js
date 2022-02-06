/**Represents a node for a tree structure.*/
class TreeNode {
  /**Initialize a new node with a value.
   * @param {any} value The value of the node.
   */
  constructor(value) {
    /**The value of this node.
     * @type {any}
     */
    this.value = value

    /**The children of this node.
     * @type {TreeNode[]}
     */
    this.children = []
  }

  /**Checks if the node is a leaf.
   * @returns {boolean}
  */
  isLeaf() {
    return this.children.length === 0
  }

  /**Add a child with a specified value to the tree.
   * @param {any} value The value of the child.
   * @returns {TreeNode} The added node.
   */
  addChild(value) {
    this.children.push(new TreeNode(value))
    return this.children[this.children.length - 1]
  }

  /**Remove a child with a specified value to the tree.
   * @param {any} value The value of the child.
   * @returns {TreeNode} The removed node.
   */
  removeChild(value) {
    let idx = this.children.findIndex(node => node.value === value)
    if (idx === -1) return null
    let child = this.children[idx]
    this.children = this.children.filter((_,index) => idx !== index)
    return child
  }
}

/**Represents a tree structure.*/
class Tree {
  /**Initialize a new tree with a value for the root.
   * @param {any} value The value of the node.
   */
  constructor(value) {
    /**The root of the tree
     * @type {TreeNode}
     */
    this.root = new TreeNode(value)
  }

  /**Find a node with a specified value.
   * @param {any} value The value of the node to find.
   * @returns {TreeNode} The first node that was found with the value.
   */
  findNode(value) {
    return this.#findNodeRec(root, value)
  }

  /**Find a node with a specified value.
   * @param {TreeNode} cur The node currently being checked.
   * @param {any} value The value of the node to find.
   * @returns {TreeNode} The first node that was found with the value.
   */
  #findNodeRec(cur, value) {
    if (cur.value === value) return cur
    if (cur.isLeaf()) return null
    
    for (const child of cur.children) {
      let found = this.#findNodeRec(child, value)
      if (found !== null) return found
    }

    return null
  }
}

module.exports = {
  TreeNode: TreeNode,
  Tree: Tree
}
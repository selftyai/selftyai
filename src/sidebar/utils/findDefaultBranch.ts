import { TreeNode } from '@/sidebar/types/TreeNode'

export default function findDefaultBranch(tree: TreeNode[]): number[] {
  // Helper function to get all leaf nodes
  const getLeafNodes = (nodes: TreeNode[]): TreeNode[] => {
    const leaves: TreeNode[] = []
    const traverse = (node: TreeNode) => {
      if (!node.children || node.children.length === 0) {
        leaves.push(node)
      } else {
        node.children.forEach(traverse)
      }
    }
    nodes.forEach(traverse)
    return leaves
  }

  // Get all leaf nodes
  const leafNodes = getLeafNodes(tree)
  if (leafNodes.length === 0) return []

  // Find the most recently updated leaf node
  const latestLeaf = leafNodes.reduce((latest, current) => {
    if (!latest.updatedAt) return current
    if (!current.updatedAt) return latest
    return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest
  }, leafNodes[0])

  // Build path from leaf to root
  const path: number[] = []
  let currentNode: TreeNode | null = latestLeaf

  while (currentNode !== null) {
    if (currentNode.id !== undefined) {
      path.push(currentNode.id)
    }
    const parent = findParentNode(tree, currentNode)
    if (!parent) break
    currentNode = parent
  }

  // Helper function to find parent node
  function findParentNode(nodes: TreeNode[], target: TreeNode): TreeNode | null {
    for (const node of nodes) {
      if (node.children?.some((child) => child === target)) {
        return node
      }
      if (node.children) {
        const found = findParentNode(node.children, target)
        if (found) return found
      }
    }
    return null
  }

  return path.reverse()
}

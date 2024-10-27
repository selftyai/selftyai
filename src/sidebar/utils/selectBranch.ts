import { TreeNode } from '@/sidebar/types/TreeNode'

export default function selectBranch(tree: TreeNode[], path: number[]): number[] {
  let currentNodes = tree
  const currentPath: number[] = []

  for (const id of path) {
    const node = currentNodes.find((n) => n.id === id)
    if (node) {
      currentPath.push(node.id!)
      currentNodes = node.children
    } else {
      // Node not found in currentNodes
      if (currentNodes.length > 0) {
        // Select the first available child
        const firstChild = currentNodes[0]
        currentPath.push(firstChild.id!)
        currentNodes = firstChild.children
      } else {
        // No children to proceed with
        break
      }
    }
  }

  // Fill the gap until currentNodes is null or no more children
  while (currentNodes && currentNodes.length > 0) {
    const firstChild = currentNodes[currentNodes.length - 1] // Last child
    currentPath.push(firstChild.id!)
    currentNodes = firstChild.children
  }

  return currentPath
}

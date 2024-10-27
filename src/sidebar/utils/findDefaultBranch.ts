import { TreeNode } from '@/sidebar/types/TreeNode'

export default function findDefaultBranch(tree: TreeNode[]): number[] {
  const path: number[] = []
  let currentNodes = tree
  while (currentNodes.length > 0) {
    const node = currentNodes[currentNodes.length - 1] // Last node
    path.push(node.id!)
    currentNodes = node.children
  }
  return path
}

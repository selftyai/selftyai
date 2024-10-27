import logger from '@/shared/logger'
import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'
import { TreeNode } from '@/sidebar/types/TreeNode'

export default function buildMessageTree(messages: MessageWithFiles[]): TreeNode[] {
  const messageMap: Record<number, TreeNode> = {}
  const roots: TreeNode[] = []

  // Initialize message nodes
  messages.forEach((message) => {
    messageMap[message.id!] = { ...message, children: [] }
  })

  // Build the tree
  messages.forEach((message) => {
    const node = messageMap[message.id!]
    if (message.parentMessageId) {
      const parentNode = messageMap[message.parentMessageId]
      if (parentNode) {
        parentNode.children.push(node)
      } else {
        // Orphaned message; parent not found
        logger.warn(`Parent message not found for message ID ${message.id}`)
        roots.push(node) // You may choose to handle this differently
      }
    } else {
      // Root messages (e.g., initial user messages without parent)
      roots.push(node)
    }
  })

  return roots
}

import { MessageWithFiles } from '@/sidebar/types/MessageWithFiles'

export interface TreeNode extends MessageWithFiles {
  children: TreeNode[]
}

export type BranchPath = number[]

export interface Branch {
  id?: number
  branchPath: BranchPath
  conversationId: number
}

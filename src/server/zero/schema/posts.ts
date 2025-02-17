import { z } from "zod"
import type { WriteTransaction, ReadTransaction } from "@rocicorp/reflect"

export const Post = z.object({
  id: z.number(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Post = z.infer<typeof Post>

export const posts = {
  name: "post",
  schema: Post,
  async list(tx: ReadTransaction) {
    const entries = tx.scan()
    const values = await entries.toArray()
    return values as Post[]
  },
  async get(tx: ReadTransaction, id: number) {
    const value = await tx.get(`post/${id}`)
    return value as Post | undefined
  },
  async put(tx: WriteTransaction, post: Post) {
    await tx.set(`post/${post.id}`, post)
  },
  async delete(tx: WriteTransaction, id: number) {
    await tx.del(`post/${id}`)
  }
}

// Define query helpers
export const postQueries = {
  list: posts.list,
  get: posts.get,
} 
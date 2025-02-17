import { Reflect } from "@rocicorp/reflect/client"
import type { WriteTransaction, ReadTransaction, MutatorDefs as ReflectMutatorDefs } from "@rocicorp/reflect"
import { posts, postQueries, Post } from "./schema/posts"

export type { WriteTransaction, ReadTransaction }

export type MutatorDefs = ReflectMutatorDefs & {
  "post/create": (tx: WriteTransaction, args: { name: string }) => Promise<void>
  "post/delete": (tx: WriteTransaction, args: { id: number }) => Promise<void>
  "post/update": (tx: WriteTransaction, args: { id: number; name: string }) => Promise<void>
}

const mutators: MutatorDefs = {
  "post/create": async (tx, { name }) => {
    const post: Post = {
      id: Date.now(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await posts.put(tx, post)
  },
  "post/delete": async (tx, { id }) => {
    await posts.delete(tx, id)
  },
  "post/update": async (tx, { id, name }) => {
    const post = await posts.get(tx, id)
    if (!post) return
    await posts.put(tx, {
      ...post,
      name,
      updatedAt: new Date().toISOString(),
    })
  },
}

export const query = {
  posts: postQueries,
}

export type Client = Reflect<MutatorDefs> & {
  query: typeof query
}

let clientInstance: Client | null = null

export function createClient(roomID = "default", userID = "default"): Client {
  if (typeof window === "undefined") {
    throw new Error("Zero client can only be created in the browser")
  }

  if (!clientInstance) {
    clientInstance = Object.assign(
      new Reflect({
        roomID,
        userID,
        mutators,
      }),
      { query }
    )
  }

  return clientInstance
} 
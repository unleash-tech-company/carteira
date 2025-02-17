import { useEffect, useState } from "react"
import { createClient, type Client, type ReadTransaction } from "@/server/zero/client"
import type { Post } from "@/server/zero/schema/posts"

export function useZero() {
  const [client] = useState<Client>(() => createClient())
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    return client.subscribe(async (tx: ReadTransaction) => {
      const posts = await client.query.posts.list(tx)
      return posts
    }, setPosts)
  }, [client])

  const createPost = async (name: string) => {
    await client.mutate["post/create"]({ name })
  }

  const deletePost = async (id: number) => {
    await client.mutate["post/delete"]({ id })
  }

  const updatePost = async (id: number, name: string) => {
    await client.mutate["post/update"]({ id, name })
  }

  return {
    posts,
    createPost,
    deletePost,
    updatePost,
  }
} 
"use client"

import { useEffect, useState } from "react"
import type { ReadTransaction } from "@/server/zero/client"
import type { Post } from "@/server/zero/schema/posts"
import { useZeroContext } from "@/components/providers/zero-provider"

export function useZero() {
  const client = useZeroContext()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    if (!client) return

    return client.subscribe(async (tx: ReadTransaction) => {
      const posts = await client.query.posts.list(tx)
      return posts
    }, setPosts)
  }, [client])

  const createPost = async (name: string) => {
    if (!client) return
    await client.mutate["post/create"]({ name })
  }

  const deletePost = async (id: number) => {
    if (!client) return
    await client.mutate["post/delete"]({ id })
  }

  const updatePost = async (id: number, name: string) => {
    if (!client) return
    await client.mutate["post/update"]({ id, name })
  }

  return {
    posts,
    createPost,
    deletePost,
    updatePost,
  }
} 
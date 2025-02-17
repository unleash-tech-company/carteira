"use client"

import { useEffect, useState } from "react"
import type { ReadTransaction } from "@/server/zero/client"
import type { Post } from "@/server/zero/schema/posts"
import { useZeroContext } from "@/components/providers/zero-provider"

export function useZero() {
  const client = useZeroContext()
  const [posts, setPosts] = useState<Post[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!client) return

    let unsubscribe: (() => void) | undefined

    const setupSubscription = async () => {
      try {
        unsubscribe = client.subscribe(async (tx: ReadTransaction) => {
          const posts = await client.query.posts.list(tx)
          return posts
        }, setPosts)
        setIsSubscribed(true)
      } catch (error) {
        console.error('Error setting up subscription:', error)
        setIsSubscribed(false)
      }
    }

    setupSubscription()

    return () => {
      if (unsubscribe) {
        unsubscribe()
        setIsSubscribed(false)
      }
    }
  }, [client])

  const createPost = async (name: string) => {
    if (!client || !isSubscribed) return
    try {
      await client.mutate["post/create"]({ name })
    } catch (error) {
      console.error('Error creating post:', error)
      throw error
    }
  }

  const deletePost = async (id: number) => {
    if (!client || !isSubscribed) return
    try {
      await client.mutate["post/delete"]({ id })
    } catch (error) {
      console.error('Error deleting post:', error)
      throw error
    }
  }

  const updatePost = async (id: number, name: string) => {
    if (!client || !isSubscribed) return
    try {
      await client.mutate["post/update"]({ id, name })
    } catch (error) {
      console.error('Error updating post:', error)
      throw error
    }
  }

  return {
    posts,
    createPost,
    deletePost,
    updatePost,
    isSubscribed
  }
} 
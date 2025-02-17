"use client"

import { useState } from "react"
import { useQuery } from "@rocicorp/zero/react"
import type { Schema, Post } from "@/server/zero/schema/posts"
import { useZeroContext } from "@/components/providers/zero-provider"

export function useZero() {
  const z = useZeroContext()
  const [filterText, setFilterText] = useState<string>("")

  const all = z.query.posts
  const [allPosts] = useQuery(all)

  let filtered = all.orderBy("createdAt", "desc")

  if (filterText) {
    filtered = filtered.where("name", "LIKE", `%${filterText}%`)
  }

  const [filteredPosts] = useQuery(filtered)

  const createPost = async (name: string) => {
    await z.mutate.posts.insert({
      id: Date.now(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  const deletePost = async (id: number) => {
    await z.mutate.posts.delete({ id })
  }

  const updatePost = async (id: number, name: string) => {
    const post = allPosts.find(p => p.id === id)
    if (!post) return

    await z.mutate.posts.update({
      ...post,
      name,
      updatedAt: new Date().toISOString(),
    })
  }

  return {
    posts: filteredPosts,
    allPosts,
    createPost,
    deletePost,
    updatePost,
    filterText,
    setFilterText,
  }
} 
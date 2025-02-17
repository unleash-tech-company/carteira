"use client"

import { useState } from "react"
import { useZero } from "@/hooks/use-zero"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TypographyH2, TypographyP } from "@/components/ui/typography"

export function PostsSection() {
  const { posts, createPost, updatePost, deletePost } = useZero()
  const [newPostName, setNewPostName] = useState("")
  const [editingPost, setEditingPost] = useState<{ id: number; name: string } | null>(null)

  const handleCreatePost = async () => {
    if (!newPostName.trim()) return
    await createPost(newPostName)
    setNewPostName("")
  }

  const handleUpdatePost = async () => {
    if (!editingPost || !editingPost.name.trim()) return
    await updatePost(editingPost.id, editingPost.name)
    setEditingPost(null)
  }

  return (
    <div className="space-y-4">
      <TypographyH2>Posts</TypographyH2>
      
      <div className="flex gap-2">
        <Input
          placeholder="New post name"
          value={newPostName}
          onChange={(e) => setNewPostName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreatePost()}
        />
        <Button onClick={handleCreatePost}>Create Post</Button>
      </div>

      {posts.length === 0 ? (
        <TypographyP className="text-muted-foreground">No posts yet. Create your first one!</TypographyP>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>{post.id}</TableCell>
                <TableCell>
                  {editingPost?.id === post.id ? (
                    <Input
                      value={editingPost.name}
                      onChange={(e) => setEditingPost({ ...editingPost, name: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdatePost()}
                    />
                  ) : (
                    post.name
                  )}
                </TableCell>
                <TableCell>{new Date(post.createdAt).toLocaleString()}</TableCell>
                <TableCell>{new Date(post.updatedAt).toLocaleString()}</TableCell>
                <TableCell>
                  {editingPost?.id === post.id ? (
                    <div className="flex gap-2">
                      <Button onClick={handleUpdatePost}>Save</Button>
                      <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => setEditingPost({ id: post.id, name: post.name })}>Edit</Button>
                      <Button variant="destructive" onClick={() => deletePost(post.id)}>Delete</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
} 
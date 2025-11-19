'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useChat } from 'ai/react'

export function KnowledgeSearch() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  })

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about your files..."
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          Search
        </Button>
      </form>

      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="p-4">
            <div className="font-semibold mb-2">
              {message.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}


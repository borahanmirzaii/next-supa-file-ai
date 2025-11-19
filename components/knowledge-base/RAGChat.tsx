'use client'

import { useState } from 'react'
import { useKBChat } from '@/hooks/use-kb-chat'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Send,
  Loader2,
  FileText,
  Sparkles,
  User,
  Bot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RAGChatProps {
  fileIds?: string[]
  placeholder?: string
}

export function RAGChat({ fileIds, placeholder }: RAGChatProps) {
  const [showSources, setShowSources] = useState(true)

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    sources,
    isSearching,
  } = useKBChat({
    fileIds,
    onSourcesRetrieved: (newSources) => {
      console.log('Retrieved sources:', newSources)
    },
  })

  return (
    <div className="flex flex-col h-[700px]">
      <Card className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">AI Chat</h3>
                <p className="text-xs text-muted-foreground">
                  Powered by RAG with your knowledge base
                </p>
              </div>
            </div>
            {fileIds && fileIds.length > 0 && (
              <Badge variant="secondary">
                {fileIds.length} file{fileIds.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Start a conversation</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Ask questions about your files and I'll search your knowledge base to provide accurate answers with citations.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}

                <div
                  className={cn(
                    'rounded-lg px-4 py-3 max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isSearching && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Searching knowledge base...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Sources Panel */}
        {sources.length > 0 && (
          <div className="border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between p-4"
              onClick={() => setShowSources(!showSources)}
            >
              <span className="text-sm font-medium">
                Sources ({sources.length})
              </span>
              {showSources ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showSources && (
              <div className="p-4 pt-0 space-y-2 max-h-[200px] overflow-y-auto">
                {sources.map((source: any, index: number) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">
                        [{source.citation}]
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">
                          {source.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {source.snippet}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {Math.round(source.similarity * 100)}% relevant
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={placeholder || "Ask about your files..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


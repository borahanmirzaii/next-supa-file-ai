'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Wrench,
  Filter,
  Play,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MCPTool } from '@/types/mcp'

interface ToolBrowserProps {
  tools: MCPTool[]
  onToolSelect: (tool: MCPTool) => void
  selectedTool?: MCPTool
}

export function ToolBrowser({ tools, onToolSelect, selectedTool }: ToolBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Get unique categories
  const categories = ['all', ...new Set(tools.map(t => t.category || 'other'))]
  
  // Filter tools
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || tool.category === categoryFilter
    return matchesSearch && matchesCategory
  })
  
  // Group by server
  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.serverId]) {
      acc[tool.serverId] = []
    }
    acc[tool.serverId].push(tool)
    return acc
  }, {} as Record<string, MCPTool[]>)

  return (
    <Card className="flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Available Tools</h3>
          <Badge variant="secondary">{filteredTools.length}</Badge>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools..."
            className="pl-10"
          />
        </div>
        
        {/* Category Filter */}
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Tool List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(groupedTools).map(([serverId, serverTools]) => (
            <div key={serverId}>
              <h4 className="font-medium text-sm text-muted-foreground mb-3 uppercase">
                {serverId.replace(/-/g, ' ')}
              </h4>
              <div className="space-y-2">
                {serverTools.map(tool => (
                  <Card
                    key={tool.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                      selectedTool?.id === tool.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onToolSelect(tool)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{tool.name}</h5>
                        {tool.enabled === false && (
                          <Badge variant="outline" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                      </div>
                      {tool.usageCount !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {tool.usageCount} uses
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                    {tool.lastUsed && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Last used: {new Date(tool.lastUsed).toLocaleString()}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">No tools found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}


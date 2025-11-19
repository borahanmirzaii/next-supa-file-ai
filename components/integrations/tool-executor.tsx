'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Code,
  FileJson,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { executeToolAction } from '@/app/actions/execute-tool'
import type { MCPTool, MCPToolExecution } from '@/types/mcp'

interface ToolExecutorProps {
  tool: MCPTool
}

export function ToolExecutor({ tool }: ToolExecutorProps) {
  const [inputs, setInputs] = useState<Record<string, any>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [execution, setExecution] = useState<MCPToolExecution | null>(null)
  const { toast } = useToast()

  const handleInputChange = (field: string, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleExecute = async () => {
    setIsExecuting(true)
    setExecution({
      id: crypto.randomUUID(),
      toolId: tool.id,
      toolName: tool.name,
      input: inputs,
      status: 'running',
      startedAt: new Date(),
    })

    try {
      const result = await executeToolAction(tool.serverId, tool.name, inputs)
      setExecution(prev => ({
        ...prev!,
        status: 'completed',
        output: result,
        completedAt: new Date(),
      }))
      toast({
        title: 'Tool executed successfully',
        description: `${tool.name} completed`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setExecution(prev => ({
        ...prev!,
        status: 'failed',
        error: errorMessage,
        completedAt: new Date(),
      }))
      toast({
        title: 'Execution failed',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsExecuting(false)
    }
  }

  const renderInputField = (fieldName: string, fieldSchema: any) => {
    const isRequired = tool.inputSchema.required?.includes(fieldName)
    
    switch (fieldSchema.type) {
      case 'string':
        if (fieldSchema.enum) {
          return (
            <div key={fieldName} className="space-y-2">
              <Label>
                {fieldName}
                {isRequired && <span className="text-destructive">*</span>}
              </Label>
              <select
                className="w-full p-2 border rounded-md"
                value={inputs[fieldName] || ''}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
              >
                <option value="">Select...</option>
                {fieldSchema.enum.map((option: string) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {fieldSchema.description && (
                <p className="text-xs text-muted-foreground">
                  {fieldSchema.description}
                </p>
              )}
            </div>
          )
        }
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {fieldName}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            {fieldSchema.description?.includes('long') || fieldSchema.description?.includes('content') ? (
              <Textarea
                value={inputs[fieldName] || ''}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                placeholder={fieldSchema.description}
                rows={4}
              />
            ) : (
              <Input
                type="text"
                value={inputs[fieldName] || ''}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                placeholder={fieldSchema.description}
              />
            )}
            {fieldSchema.description && (
              <p className="text-xs text-muted-foreground">
                {fieldSchema.description}
              </p>
            )}
          </div>
        )
      case 'number':
      case 'integer':
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {fieldName}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              type="number"
              value={inputs[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, parseFloat(e.target.value))}
              placeholder={fieldSchema.description}
            />
            {fieldSchema.description && (
              <p className="text-xs text-muted-foreground">
                {fieldSchema.description}
              </p>
            )}
          </div>
        )
      case 'boolean':
        return (
          <div key={fieldName} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={fieldName}
              checked={inputs[fieldName] || false}
              onChange={(e) => handleInputChange(fieldName, e.target.checked)}
              className="rounded"
            />
            <Label htmlFor={fieldName}>
              {fieldName}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
          </div>
        )
      case 'array':
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {fieldName} (JSON array)
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              value={inputs[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder='["item1", "item2"]'
              rows={3}
            />
            {fieldSchema.description && (
              <p className="text-xs text-muted-foreground">
                {fieldSchema.description}
              </p>
            )}
          </div>
        )
      case 'object':
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {fieldName} (JSON object)
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              value={inputs[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder='{"key": "value"}'
              rows={4}
            />
            {fieldSchema.description && (
              <p className="text-xs text-muted-foreground">
                {fieldSchema.description}
              </p>
            )}
          </div>
        )
      default:
        return (
          <div key={fieldName} className="space-y-2">
            <Label>
              {fieldName}
              {isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              type="text"
              value={inputs[fieldName] || ''}
              onChange={(e) => handleInputChange(fieldName, e.target.value)}
              placeholder={fieldSchema.description}
            />
          </div>
        )
    }
  }

  return (
    <Card className="flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Code className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{tool.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{tool.description}</p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Input Form */}
          <div>
            <h4 className="font-medium mb-4">Input Parameters</h4>
            <div className="space-y-4">
              {Object.entries(tool.inputSchema.properties || {}).map(([fieldName, fieldSchema]) =>
                renderInputField(fieldName, fieldSchema)
              )}
            </div>
          </div>
          
          {/* Execute Button */}
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Execute Tool
              </>
            )}
          </Button>
          
          {/* Execution Result */}
          {execution && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {execution.status === 'running' && (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  {execution.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {execution.status === 'failed' && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  <h4 className="font-medium">Execution Result</h4>
                  <Badge
                    variant={
                      execution.status === 'completed'
                        ? 'default'
                        : execution.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {execution.status}
                  </Badge>
                </div>
                
                {/* Input Display */}
                <div className="mb-4">
                  <Label className="text-xs text-muted-foreground">Input</Label>
                  <Card className="p-3 bg-muted">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(execution.input, null, 2)}
                    </pre>
                  </Card>
                </div>
                
                {/* Output Display */}
                {execution.output && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Output</Label>
                    <Card className="p-3 bg-muted">
                      <pre className="text-xs overflow-x-auto">
                        {typeof execution.output === 'string'
                          ? execution.output
                          : JSON.stringify(execution.output, null, 2)}
                      </pre>
                    </Card>
                  </div>
                )}
                
                {/* Error Display */}
                {execution.error && (
                  <div>
                    <Label className="text-xs text-destructive">Error</Label>
                    <Card className="p-3 bg-destructive/10 border-destructive">
                      <p className="text-sm text-destructive">{execution.error}</p>
                    </Card>
                  </div>
                )}
                
                {/* Timing */}
                {execution.completedAt && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Completed in{' '}
                    {Math.round(
                      (execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000
                    )}
                    s
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </Card>
  )
}


import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function KnowledgeBaseLoading() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Search Section */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </Card>

        {/* Chat Section */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={i % 2 === 0 ? 'flex justify-end' : ''}>
                <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`} />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
    </div>
  )
}

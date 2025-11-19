import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function FilesLoading() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />

        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

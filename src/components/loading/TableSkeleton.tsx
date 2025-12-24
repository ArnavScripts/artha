import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-8 w-24" />
            </div>
            <div className="border rounded-md">
                <div className="p-4 border-b">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/6" />
                        <Skeleton className="h-4 w-1/6" />
                    </div>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border-b last:border-0">
                        <div className="flex gap-4">
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-4 w-1/6" />
                            <Skeleton className="h-4 w-1/6" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

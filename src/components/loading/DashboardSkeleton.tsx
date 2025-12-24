import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            <div className="lg:col-span-7 space-y-6">
                <div className="p-6 border rounded-xl space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
                <div className="p-6 border rounded-xl space-y-4">
                    <Skeleton className="h-6 w-1/4" />
                    <div className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
                <div className="p-6 border rounded-xl h-48">
                    <Skeleton className="h-full w-full" />
                </div>
                <div className="p-6 border rounded-xl h-64">
                    <Skeleton className="h-full w-full" />
                </div>
            </div>
        </div>
    )
}

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

function HomeSkeletonPresenceTable({ rows = 4, columns = 3 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            {Array.from({ length: columns }).map((__, columnIndex) => (
              <Skeleton key={columnIndex} className={`h-4 ${columnIndex === 0 ? 'flex-1' : 'w-24'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeSkeletonLinksCard() {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HomeSkeletonHeader() {
  return (
    <div className="rounded-2xl border border-border bg-card px-6 py-6">
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="flex min-h-[220px] flex-col justify-between space-y-6 lg:col-span-4">
          <div className="space-y-4">
            <Skeleton className="h-12 w-52" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="space-y-4 lg:col-span-8">
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function HomeSkeletonActualites() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function HomeSkeletonPresenceSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <Card>
        <CardContent className="space-y-4 p-6">
          <HomeSkeletonPresenceTable rows={5} columns={3} />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-6">
          <HomeSkeletonPresenceTable rows={4} columns={2} />
        </CardContent>
      </Card>
      <Card className="self-start">
        <CardContent className="space-y-6 p-6">
          <HomeSkeletonPresenceTable rows={3} columns={3} />
          <HomeSkeletonPresenceTable rows={3} columns={2} />
          <HomeSkeletonPresenceTable rows={3} columns={3} />
        </CardContent>
      </Card>
    </div>
  );
}

function HomeSkeletonLinksSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <HomeSkeletonLinksCard />
      <HomeSkeletonLinksCard />
      <HomeSkeletonLinksCard />
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <HomeSkeletonHeader />
      <HomeSkeletonActualites />
      <HomeSkeletonPresenceSection />
      <HomeSkeletonLinksSection />
    </div>
  );
}

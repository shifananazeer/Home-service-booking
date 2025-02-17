export function ProfileSkeleton() {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="w-24 h-24 rounded-full bg-muted mx-auto" />
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
          <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
        </div>
      </div>
    )
  }
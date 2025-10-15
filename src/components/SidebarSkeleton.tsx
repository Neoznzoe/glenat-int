import { FC } from "react";
import clsx from "clsx";

type SidebarSkeletonProps = {
  count?: number;
  isExpanded?: boolean;
};

const BASE_ITEM_CLASSES = "flex items-center gap-3 rounded-md bg-muted/30";

export const SidebarSkeleton: FC<SidebarSkeletonProps> = ({ count = 5, isExpanded = true }) => {
  return (
    <div className="flex flex-col gap-2" aria-label="Chargement du menu">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            BASE_ITEM_CLASSES,
            "animate-pulse",
            isExpanded ? "h-10 px-3" : "h-10 w-10 justify-center"
          )}
        >
          <div className="h-4 w-4 rounded bg-muted" />
          {isExpanded ? <div className="h-3 flex-1 rounded bg-muted" /> : null}
        </div>
      ))}
    </div>
  );
};

export default SidebarSkeleton;

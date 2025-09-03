import { ChevronRight } from 'lucide-react';

interface Notification {
  count: number;
  label: string;
  href?: string;
}

interface Props {
  notifications: Notification[];
}

export default function NotificationList({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-sm w-80">
        <h3 className="text-base font-medium mb-4">Notifications</h3>
        <p className="text-muted-foreground">Aucune notification pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 text-sm w-80">
      <h3 className="text-base font-medium mb-4">Notifications</h3>
      <ul className="space-y-2">
        {notifications.map((n, index) => (
          <li key={index}>
            <a
              href={n.href ?? '#'}
              className="flex w-full items-start justify-between border px-3 py-2 rounded hover:bg-muted"
            >
              <div className="flex items-start space-x-2 pr-2">
                <span className="flex-shrink-0 bg-[#ff3b30] text-white text-[10px] font-semibold w-6 h-6 rounded flex items-center justify-center">
                  {n.count}
                </span>
                <span className="text-foreground text-xs leading-tight">{n.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}


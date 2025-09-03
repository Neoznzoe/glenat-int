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
              className="flex items-center justify-between border px-3 py-2 rounded hover:bg-muted"
            >
              <span>
                <span className="font-semibold mr-1">{n.count}</span>
                {n.label}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}


import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'There is no data to display.',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <Inbox className="h-10 w-10 mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}

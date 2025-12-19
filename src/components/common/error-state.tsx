import { AlertTriangle } from 'lucide-react';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again later.',
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-destructive">
      <AlertTriangle className="h-10 w-10 mb-4" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}

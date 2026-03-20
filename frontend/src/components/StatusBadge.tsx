import { Badge } from '@/components/ui/badge';
import type { ComplaintStatus } from '@/types/database';
import { cn } from '@/lib/utils';

const statusConfig: Record<ComplaintStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-destructive/15 text-destructive border-destructive/30' },
  assigned: { label: 'Assigned', className: 'bg-warning/15 text-warning border-warning/30' },
  in_progress: { label: 'In Progress', className: 'bg-accent/15 text-accent border-accent/30' },
  resolved: { label: 'Resolved', className: 'bg-success/15 text-success border-success/30' },
};

export default function StatusBadge({ status }: { status: ComplaintStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn('font-semibold text-xs border', config.className)}>
      {config.label}
    </Badge>
  );
}

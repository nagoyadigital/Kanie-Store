import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Reserved: 'bg-amber-50 text-amber-700 border-amber-200',
  Sold: 'bg-blue-50 text-blue-700 border-blue-200',
  Returned: 'bg-orange-50 text-orange-700 border-orange-200',
  Service: 'bg-purple-50 text-purple-700 border-purple-200',
  Damaged: 'bg-red-50 text-red-700 border-red-200',
};

export default function DeviceStatusBadge({ status }) {
  return (
    <Badge variant="outline" className={cn('text-[11px] font-medium', statusStyles[status] || '')}>
      {status}
    </Badge>
  );
}
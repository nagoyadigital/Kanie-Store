import React from 'react';
import { ShoppingCart, Package, Wrench, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';

const iconMap = {
  sale: ShoppingCart,
  stock: Package,
  service: Wrench,
  return: ArrowDownLeft
};

const colorMap = {
  sale: 'text-emerald-600 bg-emerald-50',
  stock: 'text-primary bg-primary/10',
  service: 'text-amber-600 bg-amber-50',
  return: 'text-destructive bg-destructive/10'
};

export default function RecentActivity({ activities }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold mb-4">Aktivitas Terbaru</h3>
      <div className="space-y-3">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Belum ada aktivitas</p>
        )}
        {activities.map((item, i) => {
          const Icon = iconMap[item.type] || Package;
          const color = colorMap[item.type] || 'text-muted-foreground bg-muted';
          return (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </div>
              {item.date && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {format(new Date(item.date), 'MMM d')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
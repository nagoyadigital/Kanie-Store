import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Smartphone, DollarSign, ShoppingCart, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import TopDevicesChart from '@/components/dashboard/TopDevicesChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { useStockNotification } from '@/lib/StockNotificationContext';

export default function Dashboard() {
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => base44.entities.Device.list('-created_date', 1000),
  });

  const { data: sales = [] } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-created_date', 500),
  });

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.ServiceOrder.filter({ status: 'Waiting' }),
  });

  const available = devices.filter(d => d.status === 'Available');
  const sold = devices.filter(d => d.status === 'Sold');
  const totalValue = available.reduce((sum, d) => sum + (d.selling_price || 0), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (s.final_price || 0), 0);
  const totalProfit = sales.reduce((sum, s) => sum + (s.profit || 0), 0);

  const { lowStockCount, lowStockItems } = useStockNotification();

  // Build monthly chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.map((name, i) => {
    const monthSales = sales.filter(s => {
      const d = new Date(s.sale_date || s.created_date);
      return d.getMonth() === i;
    });
    return {
      name,
      revenue: monthSales.reduce((sum, s) => sum + (s.final_price || 0), 0),
      profit: monthSales.reduce((sum, s) => sum + (s.profit || 0), 0),
    };
  });

  // Top selling
  const brandCounts = {};
  sold.forEach(d => {
    const key = `${d.brand} ${d.model}`;
    brandCounts[key] = (brandCounts[key] || 0) + 1;
  });
  const topDevices = Object.entries(brandCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, sold]) => ({ name, sold }));

  // Recent activities
  const activities = sales.slice(0, 5).map(s => ({
    type: 'sale',
    title: `Terjual ${s.device_name}`,
    subtitle: `¥${(s.final_price || 0).toLocaleString()} — ${s.customer_name}`,
    date: s.sale_date || s.created_date
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Beranda</h1>
        <p className="text-sm text-muted-foreground mt-1">Ringkasan performa toko Anda</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Stok" value={devices.length} icon={Smartphone} subtitle={`${available.length} tersedia`} />
        <StatCard title="Nilai Stok" value={`¥${totalValue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Total Terjual" value={sold.length} icon={ShoppingCart} />
        <StatCard title="Pendapatan" value={`¥${totalRevenue.toLocaleString()}`} icon={TrendingUp} />
        <StatCard title="Laba Bersih" value={`¥${totalProfit.toLocaleString()}`} icon={BarChart3} trendUp={totalProfit > 0} />
        <StatCard
          title="Servis Menunggu"
          value={services.length}
          icon={AlertTriangle}
          className={services.length > 0 ? 'border-amber-200 bg-amber-50/50' : ''}
        />
      </div>

      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Peringatan Stok Rendah</p>
            <p className="text-xs text-amber-600">
              {lowStockItems.slice(0, 3).map(i => `${i.name} (sisa ${i.stock})`).join(', ')}
              {lowStockCount > 3 ? ` dan ${lowStockCount - 3} lainnya` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SalesChart data={chartData} />
        <TopDevicesChart data={topDevices.length > 0 ? topDevices : [{ name: 'No sales yet', sold: 0 }]} />
      </div>

      {/* Activity */}
      <RecentActivity activities={activities} />
    </div>
  );
}
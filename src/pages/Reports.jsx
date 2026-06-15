import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, Smartphone, ShoppingCart, TrendingUp, Users, Wrench } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const COLORS = ['hsl(220, 90%, 56%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(280, 65%, 60%)', 'hsl(0, 72%, 51%)', '#6366f1', '#ec4899'];

export default function Reports() {
  const { data: devices = [] } = useQuery({ queryKey: ['devices'], queryFn: () => base44.entities.Device.list('-created_date', 1000) });
  const { data: sales = [] } = useQuery({ queryKey: ['sales'], queryFn: () => base44.entities.Sale.list('-created_date', 1000) });
  const { data: services = [] } = useQuery({ queryKey: ['services-all'], queryFn: () => base44.entities.ServiceOrder.list('-created_date', 500) });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: () => base44.entities.Customer.list('-created_date', 500) });

  const totalRevenue = sales.reduce((s, v) => s + (v.final_price || 0), 0);
  const totalProfit = sales.reduce((s, v) => s + (v.profit || 0), 0);
  const avgProfit = sales.length > 0 ? Math.round(totalProfit / sales.length) : 0;

  // Brand distribution
  const brandCounts = {};
  devices.forEach(d => { brandCounts[d.brand] = (brandCounts[d.brand] || 0) + 1; });
  const brandData = Object.entries(brandCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  // Monthly profit
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const profitData = months.map((name, i) => {
    const ms = sales.filter(s => new Date(s.sale_date || s.created_date).getMonth() === i);
    return { name, profit: ms.reduce((sum, s) => sum + (s.profit || 0), 0), revenue: ms.reduce((sum, s) => sum + (s.final_price || 0), 0) };
  });

  // Payment methods
  const paymentCounts = {};
  sales.forEach(s => { paymentCounts[s.payment_method || 'Cash'] = (paymentCounts[s.payment_method || 'Cash'] || 0) + 1; });
  const paymentData = Object.entries(paymentCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <PageHeader title="Laporan & Analitik" description="Wawasan bisnis lengkap" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Stok" value={devices.length} icon={Smartphone} />
        <StatCard title="Total Penjualan" value={sales.length} icon={ShoppingCart} />
        <StatCard title="Pelanggan" value={customers.length} icon={Users} />
        <StatCard title="Order Servis" value={services.length} icon={Wrench} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Pendapatan" value={`¥${totalRevenue.toLocaleString()}`} icon={TrendingUp} />
        <StatCard title="Total Laba" value={`¥${totalProfit.toLocaleString()}`} icon={BarChart3} />
        <StatCard title="Rata-rata Laba/Transaksi" value={`¥${avgProfit.toLocaleString()}`} icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Revenue & Profit */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Pendapatan & Laba Bulanan</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `¥${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} formatter={v => `¥${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="hsl(220, 90%, 56%)" radius={[6, 6, 0, 0]} barSize={16} />
                <Bar dataKey="profit" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">Stok per Merek</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={brandData.length > 0 ? brandData : [{ name: 'No data', value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {brandData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4">Metode Pembayaran</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paymentData.length > 0 ? paymentData : [{ name: 'No data', value: 0 }]} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="value" fill="hsl(220, 90%, 56%)" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
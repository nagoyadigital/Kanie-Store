import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, ShoppingCart, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import NewSaleDialog from '@/components/sales/NewSaleDialog';
import PrintInvoice from '@/components/sales/PrintInvoice';

export default function Sales() {
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [printSale, setPrintSale] = useState(null);

  const { data: sales = [], isLoading } = useQuery({
    queryKey: ['sales'],
    queryFn: () => base44.entities.Sale.list('-created_date', 500),
  });

  const filtered = sales.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.invoice_number && s.invoice_number.toLowerCase().includes(q)) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(q)) ||
      (s.device_name && s.device_name.toLowerCase().includes(q)) ||
      (s.imei && s.imei.includes(search));
  });

  const totalRevenue = sales.reduce((s, v) => s + (v.final_price || 0), 0);
  const totalProfit = sales.reduce((s, v) => s + (v.profit || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Penjualan" description={`${sales.length} transaksi — ¥${totalRevenue.toLocaleString()} pendapatan`}>
        <Button onClick={() => setShowNew(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Penjualan Baru
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Penjualan</p>
          <p className="text-xl font-bold mt-1">{sales.length}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Pendapatan</p>
          <p className="text-xl font-bold mt-1">¥{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Laba</p>
          <p className="text-xl font-bold mt-1 text-emerald-600">¥{totalProfit.toLocaleString()}</p>
        </div>
      </div>

      <Input
        placeholder="Cari faktur, pelanggan, perangkat, IMEI..."
        className="max-w-md bg-card"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Faktur</TableHead>
                <TableHead className="text-xs font-semibold">Pelanggan</TableHead>
                <TableHead className="text-xs font-semibold">Perangkat</TableHead>
                <TableHead className="text-xs font-semibold">IMEI</TableHead>
                <TableHead className="text-xs font-semibold">Harga</TableHead>
                <TableHead className="text-xs font-semibold">Laba</TableHead>
                <TableHead className="text-xs font-semibold">Pembayaran</TableHead>
                <TableHead className="text-xs font-semibold">Tanggal</TableHead>
                <TableHead className="text-xs font-semibold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(sale => (
                <TableRow key={sale.id} className="hover:bg-accent/50">
                  <TableCell className="text-xs font-mono font-medium">{sale.invoice_number || '—'}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{sale.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{sale.customer_type}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{sale.device_name}</TableCell>
                  <TableCell className="text-xs font-mono">{sale.imei}</TableCell>
                  <TableCell className="text-sm font-medium">¥{(sale.final_price || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={(sale.profit || 0) >= 0 ? 'text-sm font-medium text-emerald-600' : 'text-sm font-medium text-destructive'}>
                      ¥{(sale.profit || 0).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{sale.payment_method}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {sale.sale_date ? format(new Date(sale.sale_date), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPrintSale(sale)}>
                      <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Belum ada penjualan"
          description="Catat penjualan pertama Anda"
          actionLabel="Penjualan Baru"
          onAction={() => setShowNew(true)}
        />
      )}

      <NewSaleDialog open={showNew} onClose={() => setShowNew(false)} />
      <PrintInvoice sale={printSale} open={!!printSale} onClose={() => setPrintSale(null)} />
    </div>
  );
}
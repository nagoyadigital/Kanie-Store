import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import { useStockNotification } from '@/lib/StockNotificationContext';

const categories = ['Charger', 'Cable', 'Case', 'Tempered Glass', 'AirPods', 'Power Bank', 'Other'];

export default function Accessories() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Other', brand: '', stock: '', min_stock: '5', purchase_price: '', selling_price: '', sku: '' });

  const { refreshStock } = useStockNotification();

  const { data: accessories = [], isLoading } = useQuery({
    queryKey: ['accessories'],
    queryFn: () => base44.entities.Accessory.list('-created_date', 500),
  });

  const filtered = accessories.filter(a => {
    if (!search) return true;
    return a.name?.toLowerCase().includes(search.toLowerCase()) || a.category?.toLowerCase().includes(search.toLowerCase());
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Accessory.create({
      ...form,
      stock: Number(form.stock) || 0,
      min_stock: Number(form.min_stock) || 5,
      purchase_price: Number(form.purchase_price) || 0,
      selling_price: Number(form.selling_price) || 0,
    });

    // Otomatis catat ke Arus Kas (Cash Out) jika ada harga beli & stok
    const purchaseTotal = (Number(form.purchase_price) || 0) * (Number(form.stock) || 0);
    if (purchaseTotal > 0) {
      await base44.entities.CashFlow.create({
        type: 'Cash Out',
        category: 'Inventory Purchase',
        amount: purchaseTotal,
        description: `Pembelian aksesoris: ${form.name} (${form.stock} pcs)`,
        date: new Date().toISOString().split('T')[0],
      });
    }

    queryClient.invalidateQueries({ queryKey: ['accessories'] });
    queryClient.invalidateQueries({ queryKey: ['cashflow'] });
    refreshStock();
    setSaving(false);
    setForm({ name: '', category: 'Other', brand: '', stock: '', min_stock: '5', purchase_price: '', selling_price: '', sku: '' });
    setShowAdd(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Aksesoris" description={`${accessories.length} item`}>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Tambah Aksesoris</Button>
      </PageHeader>

      <Input placeholder="Cari aksesoris..." className="max-w-md bg-card" value={search} onChange={e => setSearch(e.target.value)} />

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Nama</TableHead>
                <TableHead className="text-xs font-semibold">Kategori</TableHead>
                <TableHead className="text-xs font-semibold">Merek</TableHead>
                <TableHead className="text-xs font-semibold">Stok</TableHead>
                <TableHead className="text-xs font-semibold">Harga Beli</TableHead>
                <TableHead className="text-xs font-semibold">Harga Jual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id} className="hover:bg-accent/50">
                  <TableCell className="text-sm font-medium">{a.name}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{a.category}</Badge></TableCell>
                  <TableCell className="text-sm">{a.brand || '—'}</TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${(a.stock || 0) <= 5 ? 'text-destructive' : ''}`}>{a.stock}</span>
                  </TableCell>
                  <TableCell className="text-sm">¥{(a.purchase_price || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-sm font-medium">¥{(a.selling_price || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Headphones} title="Belum ada aksesoris" actionLabel="Tambah Aksesoris" onAction={() => setShowAdd(true)} />
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Aksesoris</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nama *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select value={form.category} onValueChange={v => update('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Merek</Label><Input value={form.brand} onChange={e => update('brand', e.target.value)} /></div>
              <div className="space-y-2"><Label>Stok *</Label><Input type="number" value={form.stock} onChange={e => update('stock', e.target.value)} /></div>
              <div className="space-y-2"><Label>Min. Stok</Label><Input type="number" value={form.min_stock} onChange={e => update('min_stock', e.target.value)} placeholder="5" /></div>
              <div className="space-y-2"><Label>Harga Beli (¥)</Label><Input type="number" value={form.purchase_price} onChange={e => update('purchase_price', e.target.value)} /></div>
              <div className="space-y-2"><Label>Harga Jual (¥)</Label><Input type="number" value={form.selling_price} onChange={e => update('selling_price', e.target.value)} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.name}>{saving ? 'Menyimpan...' : 'Tambah Aksesoris'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
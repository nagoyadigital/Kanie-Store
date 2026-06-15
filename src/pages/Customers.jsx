import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

export default function Customers() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', customer_type: 'Retail', notes: '' });

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 500),
  });

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.phone?.includes(search) || c.email?.toLowerCase().includes(q);
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Customer.create(form);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setSaving(false);
    setForm({ name: '', phone: '', email: '', address: '', customer_type: 'Retail', notes: '' });
    setShowAdd(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Pelanggan" description={`${customers.length} pelanggan`}>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Tambah Pelanggan</Button>
      </PageHeader>

      <Input placeholder="Cari nama, telepon, email..." className="max-w-md bg-card" value={search} onChange={e => setSearch(e.target.value)} />

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Nama</TableHead>
                <TableHead className="text-xs font-semibold">Telepon</TableHead>
                <TableHead className="text-xs font-semibold">Email</TableHead>
                <TableHead className="text-xs font-semibold">Tipe</TableHead>
                <TableHead className="text-xs font-semibold">Pembelian</TableHead>
                <TableHead className="text-xs font-semibold">Total Belanja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(c => (
                <TableRow key={c.id} className="hover:bg-accent/50">
                  <TableCell className="text-sm font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.email || '—'}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{c.customer_type}</Badge></TableCell>
                  <TableCell className="text-sm">{c.total_purchases || 0}</TableCell>
                  <TableCell className="text-sm font-medium">¥{(c.total_spending || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Users} title="Belum ada pelanggan" description="Tambahkan pelanggan pertama" actionLabel="Tambah Pelanggan" onAction={() => setShowAdd(true)} />
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Pelanggan</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nama *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
              <div className="space-y-2"><Label>Telepon *</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => update('email', e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={form.customer_type} onValueChange={v => update('customer_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Retail">Retail</SelectItem><SelectItem value="Reseller">Reseller</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Alamat</Label><Input value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div className="space-y-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.phone}>{saving ? 'Menyimpan...' : 'Tambah Pelanggan'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
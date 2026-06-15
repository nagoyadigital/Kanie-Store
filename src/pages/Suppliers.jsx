import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

export default function Suppliers() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list('-created_date', 200),
  });

  const filtered = suppliers.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.contact_person?.toLowerCase().includes(q) || s.phone?.includes(search);
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Supplier.create(form);
    queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    setSaving(false);
    setForm({ name: '', contact_person: '', phone: '', email: '', address: '', notes: '' });
    setShowAdd(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Supplier" description={`${suppliers.length} supplier`}>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Tambah Supplier</Button>
      </PageHeader>

      <Input placeholder="Cari supplier..." className="max-w-md bg-card" value={search} onChange={e => setSearch(e.target.value)} />

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Nama</TableHead>
                <TableHead className="text-xs font-semibold">Kontak</TableHead>
                <TableHead className="text-xs font-semibold">Telepon</TableHead>
                <TableHead className="text-xs font-semibold">Email</TableHead>
                <TableHead className="text-xs font-semibold">Total Order</TableHead>
                <TableHead className="text-xs font-semibold">Total Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-accent/50">
                  <TableCell className="text-sm font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm">{s.contact_person || '—'}</TableCell>
                  <TableCell className="text-sm">{s.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.email || '—'}</TableCell>
                  <TableCell className="text-sm">{s.total_purchases || 0}</TableCell>
                  <TableCell className="text-sm font-medium">¥{(s.total_amount || 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Truck} title="Belum ada supplier" description="Tambahkan supplier pertama" actionLabel="Tambah Supplier" onAction={() => setShowAdd(true)} />
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Supplier</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nama *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
              <div className="space-y-2"><Label>Kontak</Label><Input value={form.contact_person} onChange={e => update('contact_person', e.target.value)} /></div>
              <div className="space-y-2"><Label>Telepon *</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={e => update('email', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Alamat</Label><Input value={form.address} onChange={e => update('address', e.target.value)} /></div>
            <div className="space-y-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.phone}>{saving ? 'Menyimpan...' : 'Tambah Supplier'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
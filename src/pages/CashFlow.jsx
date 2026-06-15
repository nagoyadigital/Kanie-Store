import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';

const cashInCategories = ['Device Sales', 'Accessory Sales', 'Service Revenue'];
const cashOutCategories = ['Inventory Purchase', 'Operational', 'Salary', 'Transportation', 'Other'];

export default function CashFlowPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'Cash In', category: 'Device Sales', amount: '', description: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const { data: records = [] } = useQuery({
    queryKey: ['cashflow'],
    queryFn: () => base44.entities.CashFlow.list('-created_date', 1000),
  });

  const totalIn = records.filter(r => r.type === 'Cash In').reduce((s, r) => s + (r.amount || 0), 0);
  const totalOut = records.filter(r => r.type === 'Cash Out').reduce((s, r) => s + (r.amount || 0), 0);
  const balance = totalIn - totalOut;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.CashFlow.create({ ...form, amount: Number(form.amount) || 0 });
    queryClient.invalidateQueries({ queryKey: ['cashflow'] });
    setSaving(false);
    setForm({ type: 'Cash In', category: 'Device Sales', amount: '', description: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setShowAdd(false);
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));
  const cats = form.type === 'Cash In' ? cashInCategories : cashOutCategories;

  return (
    <div className="space-y-6">
      <PageHeader title="Arus Kas" description="Lacak pemasukan dan pengeluaran">
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Tambah Entri</Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Pemasukan" value={`¥${totalIn.toLocaleString()}`} icon={ArrowUpRight} />
        <StatCard title="Pengeluaran" value={`¥${totalOut.toLocaleString()}`} icon={ArrowDownRight} />
        <StatCard title="Saldo" value={`¥${balance.toLocaleString()}`} icon={Wallet} className={balance >= 0 ? 'border-emerald-200' : 'border-red-200'} />
      </div>

      {records.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">Tipe</TableHead>
                <TableHead className="text-xs font-semibold">Kategori</TableHead>
                <TableHead className="text-xs font-semibold">Keterangan</TableHead>
                <TableHead className="text-xs font-semibold">Jumlah</TableHead>
                <TableHead className="text-xs font-semibold">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id} className="hover:bg-accent/50">
                  <TableCell>
                    <Badge variant="outline" className={r.type === 'Cash In' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-red-600 border-red-200 bg-red-50'}>
                      {r.type === 'Cash In' ? '↑ Masuk' : '↓ Keluar'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{r.category}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.description || '—'}</TableCell>
                  <TableCell className={`text-sm font-semibold ${r.type === 'Cash In' ? 'text-emerald-600' : 'text-destructive'}`}>
                    {r.type === 'Cash In' ? '+' : '-'}¥{(r.amount || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.date ? format(new Date(r.date), 'MMM d, yyyy') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tambah Entri Arus Kas</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={form.type} onValueChange={v => { update('type', v); update('category', v === 'Cash In' ? 'Device Sales' : 'Operational'); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Cash In">Pemasukan</SelectItem><SelectItem value="Cash Out">Pengeluaran</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={v => update('category', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{cats.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Jumlah (¥) *</Label><Input type="number" value={form.amount} onChange={e => update('amount', e.target.value)} /></div>
              <div className="space-y-2"><Label>Tanggal</Label><Input type="date" value={form.date} onChange={e => update('date', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Keterangan</Label><Input value={form.description} onChange={e => update('description', e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.amount}>{saving ? 'Menyimpan...' : 'Tambah Entri'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
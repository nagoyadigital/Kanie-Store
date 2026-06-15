import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { format } from 'date-fns';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';

const statusColors = {
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Picked Up': 'bg-gray-50 text-gray-600 border-gray-200',
};

export default function Services() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customer_name: '', customer_phone: '',
    device_brand: '', device_model: '', imei: '',
    complaint: '', technician: '', estimated_cost: '',
    notes: ''
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['service-orders'],
    queryFn: () => base44.entities.ServiceOrder.list('-created_date', 500),
  });

  const filtered = services.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.customer_name?.toLowerCase().includes(q) || s.service_number?.toLowerCase().includes(q) ||
      s.device_model?.toLowerCase().includes(q) || s.imei?.includes(search);
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.ServiceOrder.create({
      ...form,
      service_number: `SVC-${Date.now().toString(36).toUpperCase()}`,
      estimated_cost: Number(form.estimated_cost) || 0,
      status: 'Waiting',
      received_date: new Date().toISOString().split('T')[0],
    });
    queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    setSaving(false);
    setForm({ customer_name: '', customer_phone: '', device_brand: '', device_model: '', imei: '', complaint: '', technician: '', estimated_cost: '', notes: '' });
    setShowAdd(false);
  };

  const updateStatus = async (id, status) => {
    const data = { status };
    if (status === 'Completed') data.completed_date = new Date().toISOString().split('T')[0];
    await base44.entities.ServiceOrder.update(id, data);

    // Catat pendapatan ke Arus Kas saat servis selesai (Picked Up = sudah bayar)
    if (status === 'Picked Up') {
      const order = services.find(s => s.id === id);
      if (order) {
        const cost = order.final_cost || order.estimated_cost || 0;
        if (cost > 0) {
          await base44.entities.CashFlow.create({
            type: 'Cash In',
            category: 'Service Revenue',
            amount: cost,
            description: `Servis ${order.device_brand} ${order.device_model} — ${order.service_number}`,
            date: new Date().toISOString().split('T')[0],
          });
          await base44.entities.ActivityLog.create({
            action: 'Servis Selesai',
            entity_type: 'ServiceOrder',
            details: `${order.device_brand} ${order.device_model} — ${order.customer_name} — ¥${cost.toLocaleString()}`,
            user_name: 'Admin',
          });
        }
      }
    }

    queryClient.invalidateQueries({ queryKey: ['service-orders'] });
    queryClient.invalidateQueries({ queryKey: ['cashflow'] });
    queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
  };

  const update = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Servis & Perbaikan" description={`${services.filter(s => s.status !== 'Picked Up').length} order aktif`}>
        <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" /> Servis Baru</Button>
      </PageHeader>

      <Input placeholder="Cari order servis..." className="max-w-md bg-card" value={search} onChange={e => setSearch(e.target.value)} />

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold">No. Servis</TableHead>
                <TableHead className="text-xs font-semibold">Pelanggan</TableHead>
                <TableHead className="text-xs font-semibold">Perangkat</TableHead>
                <TableHead className="text-xs font-semibold">Keluhan</TableHead>
                <TableHead className="text-xs font-semibold">Teknisi</TableHead>
                <TableHead className="text-xs font-semibold">Biaya</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(s => (
                <TableRow key={s.id} className="hover:bg-accent/50">
                  <TableCell className="text-xs font-mono font-medium">{s.service_number}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{s.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{s.customer_phone}</p>
                  </TableCell>
                  <TableCell className="text-sm">{s.device_brand} {s.device_model}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">{s.complaint}</TableCell>
                  <TableCell className="text-sm">{s.technician || '—'}</TableCell>
                  <TableCell className="text-sm">¥{(s.final_cost || s.estimated_cost || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <Select value={s.status} onValueChange={v => updateStatus(s.id, v)}>
                      <SelectTrigger className="h-7 w-28 border-0 p-0">
                        <Badge variant="outline" className={`text-[10px] ${statusColors[s.status] || ''}`}>{s.status}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {['Waiting', 'In Progress', 'Completed', 'Picked Up'].map(st => (
                          <SelectItem key={st} value={st}>{st}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.received_date ? format(new Date(s.received_date), 'MMM d') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState icon={Wrench} title="Belum ada order servis" description="Buat order perbaikan pertama" actionLabel="Servis Baru" onAction={() => setShowAdd(true)} />
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order Servis Baru</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nama Pelanggan *</Label><Input value={form.customer_name} onChange={e => update('customer_name', e.target.value)} /></div>
              <div className="space-y-2"><Label>Telepon</Label><Input value={form.customer_phone} onChange={e => update('customer_phone', e.target.value)} /></div>
              <div className="space-y-2"><Label>Merek Perangkat *</Label><Input value={form.device_brand} onChange={e => update('device_brand', e.target.value)} placeholder="Apple" /></div>
              <div className="space-y-2"><Label>Model Perangkat *</Label><Input value={form.device_model} onChange={e => update('device_model', e.target.value)} placeholder="iPhone 15" /></div>
              <div className="space-y-2"><Label>IMEI</Label><Input value={form.imei} onChange={e => update('imei', e.target.value)} className="font-mono" /></div>
              <div className="space-y-2"><Label>Estimasi Biaya (¥)</Label><Input type="number" value={form.estimated_cost} onChange={e => update('estimated_cost', e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Keluhan *</Label><Textarea value={form.complaint} onChange={e => update('complaint', e.target.value)} placeholder="Jelaskan masalahnya..." /></div>
            <div className="space-y-2"><Label>Teknisi</Label><Input value={form.technician} onChange={e => update('technician', e.target.value)} /></div>
            <div className="space-y-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e => update('notes', e.target.value)} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.customer_name || !form.device_brand || !form.device_model || !form.complaint}>
                {saving ? 'Menyimpan...' : 'Buat Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
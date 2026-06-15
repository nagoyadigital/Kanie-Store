import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function NewSaleDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [form, setForm] = useState({
    customer_name: '', customer_type: 'Retail',
    discount: '0', payment_method: 'Cash',
    selling_price: '', notes: ''
  });

  const { data: devices = [] } = useQuery({
    queryKey: ['devices-available'],
    queryFn: () => base44.entities.Device.filter({ status: 'Available' }),
    enabled: open,
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const selectDevice = (deviceId) => {
    const dev = devices.find(d => d.id === deviceId);
    if (dev) {
      setSelectedDevice(dev);
      setForm(prev => ({ ...prev, selling_price: String(dev.selling_price || '') }));
    }
  };

  const handleSave = async () => {
    if (!selectedDevice || !form.customer_name) return;
    setSaving(true);

    const finalPrice = Number(form.selling_price) - Number(form.discount || 0);
    const profit = finalPrice - (selectedDevice.purchase_price || 0);
    const invoiceNum = `INV-${Date.now().toString(36).toUpperCase()}`;

    await base44.entities.Sale.create({
      invoice_number: invoiceNum,
      customer_name: form.customer_name,
      customer_type: form.customer_type,
      device_id: selectedDevice.id,
      device_name: `${selectedDevice.brand} ${selectedDevice.model}`,
      imei: selectedDevice.imei1,
      selling_price: Number(form.selling_price),
      discount: Number(form.discount || 0),
      final_price: finalPrice,
      purchase_price: selectedDevice.purchase_price,
      profit,
      payment_method: form.payment_method,
      sale_date: new Date().toISOString().split('T')[0],
      notes: form.notes,
    });

    await base44.entities.Device.update(selectedDevice.id, {
      status: 'Sold',
      sale_date: new Date().toISOString().split('T')[0],
    });

    // Otomatis catat ke Arus Kas (Cash In)
    await base44.entities.CashFlow.create({
      type: 'Cash In',
      category: 'Device Sales',
      amount: finalPrice,
      description: `Penjualan ${selectedDevice.brand} ${selectedDevice.model} — ${invoiceNum}`,
      date: new Date().toISOString().split('T')[0],
    });

    // Catat aktivitas
    await base44.entities.ActivityLog.create({
      action: 'Penjualan',
      entity_type: 'Sale',
      details: `${selectedDevice.brand} ${selectedDevice.model} ke ${form.customer_name} — ¥${finalPrice.toLocaleString()}`,
      user_name: 'Admin',
    });

    // Update statistik pelanggan (jika ada di database)
    try {
      const customers = await base44.entities.Customer.list('-created_date', 500);
      const customer = customers.find(c => c.name === form.customer_name || c.phone === form.customer_name);
      if (customer) {
        await base44.entities.Customer.update(customer.id, {
          total_purchases: (customer.total_purchases || 0) + 1,
          total_spending: (customer.total_spending || 0) + finalPrice,
        });
      }
    } catch {
      // Silent — customer stats update is non-critical
    }

    queryClient.invalidateQueries({ queryKey: ['sales'] });
    queryClient.invalidateQueries({ queryKey: ['devices'] });
    queryClient.invalidateQueries({ queryKey: ['devices-available'] });
    queryClient.invalidateQueries({ queryKey: ['cashflow'] });
    queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    setSaving(false);
    setSelectedDevice(null);
    setForm({ customer_name: '', customer_type: 'Retail', discount: '0', payment_method: 'Cash', selling_price: '', notes: '' });
    onClose();
  };

  const finalPrice = Number(form.selling_price || 0) - Number(form.discount || 0);
  const profit = selectedDevice ? finalPrice - (selectedDevice.purchase_price || 0) : 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Penjualan Baru</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Perangkat *</Label>
            <Select onValueChange={selectDevice}>
              <SelectTrigger><SelectValue placeholder="Pilih perangkat tersedia" /></SelectTrigger>
              <SelectContent>
                {devices.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.brand} {d.model} — {d.imei1} — ¥{(d.selling_price || 0).toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Pelanggan *</Label>
              <Input value={form.customer_name} onChange={e => update('customer_name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipe Pelanggan</Label>
              <Select value={form.customer_type} onValueChange={v => update('customer_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Reseller">Reseller</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Harga Jual (¥)</Label>
              <Input type="number" value={form.selling_price} onChange={e => update('selling_price', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Diskon (¥)</Label>
              <Input type="number" value={form.discount} onChange={e => update('discount', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Pembayaran</Label>
              <Select value={form.payment_method} onValueChange={v => update('payment_method', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Cash', 'Bank Transfer', 'QR Payment', 'Credit Card'].map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Totals */}
          {selectedDevice && (
            <div className="bg-muted rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga Final</span>
                <span className="font-semibold">¥{finalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga Beli</span>
                <span>¥{(selectedDevice.purchase_price || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Laba</span>
                <span className={profit >= 0 ? 'font-bold text-emerald-600' : 'font-bold text-destructive'}>
                  ¥{profit.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Catatan</Label>
            <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={handleSave} disabled={saving || !selectedDevice || !form.customer_name}>
              {saving ? 'Memproses...' : 'Selesaikan Penjualan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
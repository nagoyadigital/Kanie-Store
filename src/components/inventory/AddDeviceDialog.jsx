import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const brands = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Google', 'OnePlus', 'Huawei', 'Realme', 'Other'];
const storages = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'];
const conditions = ['New', 'Used', 'Refurbished', 'Like New'];
const grades = ['A+', 'A', 'B+', 'B', 'C'];
const statuses = ['Available', 'Reserved', 'Sold', 'Returned', 'Service', 'Damaged'];

export default function AddDeviceDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand: '', model: '', color: '', storage: '', ram: '',
    imei1: '', imei2: '', serial_number: '',
    purchase_price: '', selling_price: '',
    status: 'Available', condition: 'New', grade: 'A+',
    battery_health: '', battery_cycle_count: '', battery_original: true,
    face_id: 'N/A', touch_id: 'N/A', display_type: 'Original',
    true_tone: true, dead_pixel: false, burn_in: false,
    screen_scratch: 'None', front_camera: 'Normal', rear_camera: 'Normal',
    speaker: 'Normal', microphone: 'Normal',
    frame_condition: 'None', back_cover_condition: 'None',
    supplier_name: '', notes: ''
  });

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      purchase_price: Number(form.purchase_price) || 0,
      selling_price: Number(form.selling_price) || 0,
      battery_health: Number(form.battery_health) || null,
      battery_cycle_count: Number(form.battery_cycle_count) || null,
      purchase_date: new Date().toISOString().split('T')[0],
    };
    await base44.entities.Device.create(data);

    // Otomatis catat ke Arus Kas (Cash Out) jika ada harga beli
    if (data.purchase_price > 0) {
      await base44.entities.CashFlow.create({
        type: 'Cash Out',
        category: 'Inventory Purchase',
        amount: data.purchase_price,
        description: `Pembelian ${data.brand} ${data.model}`,
        date: new Date().toISOString().split('T')[0],
      });
    }

    // Catat aktivitas
    await base44.entities.ActivityLog.create({
      action: 'Tambah Stok',
      entity_type: 'Device',
      details: `${data.brand} ${data.model} — IMEI: ${data.imei1}`,
      user_name: 'Admin',
    });

    queryClient.invalidateQueries({ queryKey: ['devices'] });
    queryClient.invalidateQueries({ queryKey: ['cashflow'] });
    queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Perangkat Baru</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic">Dasar</TabsTrigger>
            <TabsTrigger value="identity">Identitas</TabsTrigger>
            <TabsTrigger value="battery">Baterai</TabsTrigger>
            <TabsTrigger value="inspection">Inspeksi</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Merek *</Label>
                <Select value={form.brand} onValueChange={v => update('brand', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih merek" /></SelectTrigger>
                  <SelectContent>{brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Input value={form.model} onChange={e => update('model', e.target.value)} placeholder="iPhone 15 Pro Max" />
              </div>
              <div className="space-y-2">
                <Label>Warna</Label>
                <Input value={form.color} onChange={e => update('color', e.target.value)} placeholder="Natural Titanium" />
              </div>
              <div className="space-y-2">
                <Label>Penyimpanan</Label>
                <Select value={form.storage} onValueChange={v => update('storage', v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>{storages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>RAM</Label>
                <Input value={form.ram} onChange={e => update('ram', e.target.value)} placeholder="8GB" />
              </div>
              <div className="space-y-2">
                <Label>Kondisi</Label>
                <Select value={form.condition} onValueChange={v => update('condition', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{conditions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={form.grade} onValueChange={v => update('grade', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => update('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Harga Beli (¥) *</Label>
                <Input type="number" value={form.purchase_price} onChange={e => update('purchase_price', e.target.value)} placeholder="130000" />
              </div>
              <div className="space-y-2">
                <Label>Harga Jual (¥) *</Label>
                <Input type="number" value={form.selling_price} onChange={e => update('selling_price', e.target.value)} placeholder="150000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={form.supplier_name} onChange={e => update('supplier_name', e.target.value)} placeholder="Nama supplier" />
            </div>
          </TabsContent>

          <TabsContent value="identity" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>IMEI 1 *</Label>
                <Input value={form.imei1} onChange={e => update('imei1', e.target.value)} placeholder="Masukkan IMEI 1" className="font-mono" />
              </div>
              <div className="space-y-2">
                <Label>IMEI 2</Label>
                <Input value={form.imei2} onChange={e => update('imei2', e.target.value)} placeholder="Masukkan IMEI 2" className="font-mono" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Nomor Seri</Label>
                <Input value={form.serial_number} onChange={e => update('serial_number', e.target.value)} placeholder="Masukkan nomor seri" className="font-mono" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="battery" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kesehatan Baterai (%)</Label>
                <Input type="number" min="0" max="100" value={form.battery_health} onChange={e => update('battery_health', e.target.value)} placeholder="98" />
              </div>
              <div className="space-y-2">
                <Label>Cycle Count</Label>
                <Input type="number" value={form.battery_cycle_count} onChange={e => update('battery_cycle_count', e.target.value)} placeholder="150" />
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <Switch checked={form.battery_original} onCheckedChange={v => update('battery_original', v)} />
                <Label>Baterai Original</Label>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inspection" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Face ID</Label>
                <Select value={form.face_id} onValueChange={v => update('face_id', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Working">Berfungsi</SelectItem>
                    <SelectItem value="Not Working">Tidak Berfungsi</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Layar</Label>
                <Select value={form.display_type} onValueChange={v => update('display_type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Original">Original</SelectItem>
                    <SelectItem value="Replaced">Diganti</SelectItem>
                    <SelectItem value="OEM">OEM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kamera Depan</Label>
                <Select value={form.front_camera} onValueChange={v => update('front_camera', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Defective">Rusak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kamera Belakang</Label>
                <Select value={form.rear_camera} onValueChange={v => update('rear_camera', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Defective">Rusak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Goresan Layar</Label>
                <Select value={form.screen_scratch} onValueChange={v => update('screen_scratch', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['None', 'Minor', 'Moderate', 'Heavy'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kondisi Frame</Label>
                <Select value={form.frame_condition} onValueChange={v => update('frame_condition', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['None', 'Minor', 'Moderate', 'Heavy'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.true_tone} onCheckedChange={v => update('true_tone', v)} /><Label>True Tone</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.dead_pixel} onCheckedChange={v => update('dead_pixel', v)} /><Label>Dead Pixel</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.burn_in} onCheckedChange={v => update('burn_in', v)} /><Label>Burn In</Label></div>
            </div>
            <div className="space-y-2">
              <Label>Catatan</Label>
              <Textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Catatan tambahan..." />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave} disabled={saving || !form.brand || !form.model || !form.imei1}>
            {saving ? 'Menyimpan...' : 'Tambah Perangkat'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Battery, Camera, Smartphone, Monitor, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DeviceStatusBadge from '@/components/inventory/DeviceStatusBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

function InspectionItem({ label, value, good }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Badge variant="outline" className={good ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-red-600 border-red-200 bg-red-50'}>
        {value}
      </Badge>
    </div>
  );
}

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: device, isLoading } = useQuery({
    queryKey: ['device', id],
    queryFn: async () => {
      const devices = await base44.entities.Device.filter({ id });
      return devices[0];
    },
    enabled: !!id,
  });

  const handleStatusChange = async (status) => {
    await base44.entities.Device.update(device.id, { status });
    queryClient.invalidateQueries({ queryKey: ['device', id] });
    queryClient.invalidateQueries({ queryKey: ['devices'] });
  };

  const handleDelete = async () => {
    if (confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) {
      await base44.entities.Device.delete(device.id);
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      navigate('/inventory');
    }
  };

  if (isLoading || !device) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const profit = (device.selling_price || 0) - (device.purchase_price || 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')} className="rounded-lg">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{device.brand} {device.model}</h1>
            <DeviceStatusBadge status={device.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {device.color} · {device.storage} · IMEI: {device.imei1}
          </p>
        </div>
        <Select value={device.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Available', 'Reserved', 'Sold', 'Returned', 'Service', 'Damaged'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pricing */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Harga & Identitas</h3>
          </div>
          <InfoRow label="Harga Beli" value={`¥${(device.purchase_price || 0).toLocaleString()}`} />
          <InfoRow label="Harga Jual" value={`¥${(device.selling_price || 0).toLocaleString()}`} />
          <InfoRow label="Est. Laba" value={
            <span className={profit >= 0 ? 'text-emerald-600' : 'text-destructive'}>¥{profit.toLocaleString()}</span>
          } />
          <InfoRow label="Kondisi" value={`${device.condition} (${device.grade})`} />
          <InfoRow label="IMEI 1" value={device.imei1} />
          <InfoRow label="IMEI 2" value={device.imei2} />
          <InfoRow label="Nomor Seri" value={device.serial_number} />
          <InfoRow label="Supplier" value={device.supplier_name} />
        </div>

        {/* Battery */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Battery className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Kesehatan Baterai</h3>
          </div>
          <div className="text-center py-4 mb-4">
            <div className="relative w-24 h-24 mx-auto mb-3">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                <circle cx="48" cy="48" r="40" fill="none" stroke={device.battery_health >= 80 ? '#10b981' : device.battery_health >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8" strokeDasharray={`${(device.battery_health || 0) * 2.51} 251.2`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                {device.battery_health || 0}%
              </span>
            </div>
            <Badge variant="outline" className={
              (device.battery_health || 0) >= 80 ? 'text-emerald-600 border-emerald-200' :
              (device.battery_health || 0) >= 50 ? 'text-amber-600 border-amber-200' : 'text-red-600 border-red-200'
            }>
              {(device.battery_health || 0) >= 80 ? 'Sangat Baik' : (device.battery_health || 0) >= 50 ? 'Baik' : 'Buruk'}
            </Badge>
          </div>
          <InfoRow label="Cycle Count" value={device.battery_cycle_count} />
          <InfoRow label="Baterai Original" value={device.battery_original ? 'Ya' : 'Diganti'} />
        </div>

        {/* Display & Cameras */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Layar & Biometrik</h3>
          </div>
          <InspectionItem label="Layar" value={device.display_type} good={device.display_type === 'Original'} />
          <InspectionItem label="True Tone" value={device.true_tone ? 'Aktif' : 'Mati'} good={device.true_tone} />
          <InspectionItem label="Dead Pixel" value={device.dead_pixel ? 'Ya' : 'Tidak'} good={!device.dead_pixel} />
          <InspectionItem label="Burn In" value={device.burn_in ? 'Ya' : 'Tidak'} good={!device.burn_in} />
          <InspectionItem label="Goresan Layar" value={device.screen_scratch} good={device.screen_scratch === 'None'} />
          <InspectionItem label="Face ID" value={device.face_id} good={device.face_id === 'Working'} />
          <InspectionItem label="Touch ID" value={device.touch_id} good={device.touch_id === 'Working'} />
        </div>

        {/* Hardware */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Camera className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Inspeksi Hardware</h3>
          </div>
          <InspectionItem label="Kamera Depan" value={device.front_camera} good={device.front_camera === 'Normal'} />
          <InspectionItem label="Kamera Belakang" value={device.rear_camera} good={device.rear_camera === 'Normal'} />
          <InspectionItem label="Speaker" value={device.speaker} good={device.speaker === 'Normal'} />
          <InspectionItem label="Mikrofon" value={device.microphone} good={device.microphone === 'Normal'} />
          <InspectionItem label="Frame" value={device.frame_condition} good={device.frame_condition === 'None'} />
          <InspectionItem label="Cover Belakang" value={device.back_cover_condition} good={device.back_cover_condition === 'None'} />
        </div>
      </div>

      {device.notes && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-2">Catatan</h3>
          <p className="text-sm text-muted-foreground">{device.notes}</p>
        </div>
      )}
    </div>
  );
}
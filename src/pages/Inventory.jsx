import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Filter, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import DeviceTable from '@/components/inventory/DeviceTable';
import AddDeviceDialog from '@/components/inventory/AddDeviceDialog';

export default function Inventory() {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');

  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => base44.entities.Device.list('-created_date', 1000),
  });

  const filtered = devices.filter(d => {
    const matchSearch = !search ||
      (d.brand + ' ' + d.model).toLowerCase().includes(search.toLowerCase()) ||
      (d.imei1 && d.imei1.includes(search)) ||
      (d.imei2 && d.imei2?.includes(search));
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchBrand = brandFilter === 'all' || d.brand === brandFilter;
    return matchSearch && matchStatus && matchBrand;
  });

  const brands = [...new Set(devices.map(d => d.brand).filter(Boolean))];

  return (
    <div className="space-y-6">
      <PageHeader title="Stok" description={`${devices.length} perangkat total — ${devices.filter(d => d.status === 'Available').length} tersedia`}>
        <Button onClick={() => setShowAdd(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Tambah Perangkat
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10 bg-card border"
            placeholder="Cari perangkat, IMEI..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            {['Available', 'Reserved', 'Sold', 'Returned', 'Service', 'Damaged'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className="w-36 bg-card">
            <SelectValue placeholder="Merek" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Merek</SelectItem>
            {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <DeviceTable devices={filtered} />
      ) : (
        <EmptyState
          icon={Smartphone}
          title="Tidak ada perangkat"
          description={search ? "Coba ubah kata pencarian" : "Tambahkan perangkat pertama Anda"}
          actionLabel={!search ? "Tambah Perangkat" : undefined}
          onAction={!search ? () => setShowAdd(true) : undefined}
        />
      )}

      <AddDeviceDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
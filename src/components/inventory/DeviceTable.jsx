import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Battery, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeviceStatusBadge from './DeviceStatusBadge';

export default function DeviceTable({ devices }) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-semibold">Perangkat</TableHead>
            <TableHead className="text-xs font-semibold">IMEI</TableHead>
            <TableHead className="text-xs font-semibold">Penyimpanan</TableHead>
            <TableHead className="text-xs font-semibold">Kondisi</TableHead>
            <TableHead className="text-xs font-semibold">Baterai</TableHead>
            <TableHead className="text-xs font-semibold">Harga Beli</TableHead>
            <TableHead className="text-xs font-semibold">Harga Jual</TableHead>
            <TableHead className="text-xs font-semibold">Status</TableHead>
            <TableHead className="text-xs font-semibold w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map(device => (
            <TableRow
              key={device.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/inventory/${device.id}`)}
            >
              <TableCell>
                <div>
                  <p className="text-sm font-medium">{device.brand} {device.model}</p>
                  <p className="text-xs text-muted-foreground">{device.color}</p>
                </div>
              </TableCell>
              <TableCell className="text-xs font-mono">{device.imei1}</TableCell>
              <TableCell className="text-xs">{device.storage}</TableCell>
              <TableCell>
                <span className="text-xs">{device.condition} {device.grade && `(${device.grade})`}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{device.battery_health ? `${device.battery_health}%` : '—'}</span>
                </div>
              </TableCell>
              <TableCell className="text-xs">¥{(device.purchase_price || 0).toLocaleString()}</TableCell>
              <TableCell className="text-xs font-medium">¥{(device.selling_price || 0).toLocaleString()}</TableCell>
              <TableCell><DeviceStatusBadge status={device.status} /></TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
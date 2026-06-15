import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Shield, Activity, Lock, Image, Type, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import PageHeader from '@/components/shared/PageHeader';
import toast from 'react-hot-toast';

export default function Settings() {
  const [adminSettings, setAdminSettings] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.auth.getSettings().then(setAdminSettings);
  }, []);

  const { data: logs = [] } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: () => base44.entities.ActivityLog.list('-created_date', 100),
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updates = { ...adminSettings };
      if (newPassword.trim()) {
        updates.password = newPassword;
      }
      await base44.auth.updateSettings(updates);
      setNewPassword('');
      toast.success('Settings berhasil disimpan');
    } catch {
      toast.error('Gagal menyimpan settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Settings" description="Kelola pengaturan aplikasi" />

      <Tabs defaultValue="login">
        <TabsList>
          <TabsTrigger value="login" className="gap-2"><Shield className="w-3.5 h-3.5" /> Pengaturan Login</TabsTrigger>
          <TabsTrigger value="activity" className="gap-2"><Activity className="w-3.5 h-3.5" /> Aktivitas</TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="mt-4">
          {adminSettings && (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-1">Pengaturan Halaman Login</h3>
                <p className="text-xs text-muted-foreground">Atur tampilan dan keamanan halaman login</p>
              </div>

              {/* Toggle Login */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="text-sm font-medium">Login aktif</p>
                  <p className="text-xs text-muted-foreground">Matikan untuk bypass login</p>
                </div>
                <Switch
                  checked={adminSettings.loginEnabled}
                  onCheckedChange={(checked) => setAdminSettings({ ...adminSettings, loginEnabled: checked })}
                />
              </div>

              <div className="grid gap-4">
                {/* App Name */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" /> Nama Aplikasi
                  </Label>
                  <Input
                    value={adminSettings.appName}
                    onChange={(e) => setAdminSettings({ ...adminSettings, appName: e.target.value })}
                    placeholder="Nama aplikasi"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Type className="w-3.5 h-3.5" /> Subtitle
                  </Label>
                  <Input
                    value={adminSettings.subtitle}
                    onChange={(e) => setAdminSettings({ ...adminSettings, subtitle: e.target.value })}
                    placeholder="Teks di bawah judul"
                  />
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5" /> Logo URL
                  </Label>
                  <Input
                    value={adminSettings.logo}
                    onChange={(e) => setAdminSettings({ ...adminSettings, logo: e.target.value })}
                    placeholder="https://example.com/logo.png (kosongkan untuk default)"
                  />
                  {adminSettings.logo && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-xl flex items-center gap-3">
                      <img src={adminSettings.logo} alt="Preview" className="w-12 h-12 rounded-xl object-contain" />
                      <span className="text-xs text-muted-foreground">Preview logo</span>
                    </div>
                  )}
                </div>

                {/* Change Password */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Ubah Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Password baru (kosongkan jika tidak diubah)"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password saat ini: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{adminSettings.password}</code>
                  </p>
                </div>
              </div>

              <Button onClick={handleSaveSettings} disabled={saving} className="w-full">
                {saving ? 'Menyimpan...' : 'Simpan Settings'}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-semibold">Aksi</TableHead>
                  <TableHead className="text-xs font-semibold">Entitas</TableHead>
                  <TableHead className="text-xs font-semibold">Detail</TableHead>
                  <TableHead className="text-xs font-semibold">Pengguna</TableHead>
                  <TableHead className="text-xs font-semibold">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada aktivitas</TableCell></TableRow>
                ) : logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm font-medium">{log.action}</TableCell>
                    <TableCell className="text-sm">{log.entity_type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.details || '—'}</TableCell>
                    <TableCell className="text-sm">{log.user_name || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(log.created_date), 'MMM d, HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

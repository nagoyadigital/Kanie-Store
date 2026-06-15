import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sun, Moon, AlertTriangle, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useStockNotification } from '@/lib/StockNotificationContext';

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const { lowStockItems, lowStockCount, hasNewAlert, dismissNewAlert } = useStockNotification();

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    try {
      const devices = await base44.entities.Device.list('-created_date', 100);
      const filtered = devices.filter(d =>
        (d.imei1 && d.imei1.includes(query)) ||
        (d.imei2 && d.imei2.includes(query)) ||
        (d.serial_number && d.serial_number.toLowerCase().includes(query.toLowerCase())) ||
        (d.model && d.model.toLowerCase().includes(query.toLowerCase())) ||
        (d.brand && d.brand.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);
      setSearchResults(filtered);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (hasNewAlert) dismissNewAlert();
  };

  const handleNotificationItemClick = (item) => {
    setShowNotifications(false);
    if (item.type === 'accessory') {
      navigate('/accessories');
    } else {
      navigate('/inventory');
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Cari IMEI, serial, perangkat..."
          className="pl-10 bg-secondary/50 border-0 h-10 focus-visible:ring-1"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
            {searchResults.map(device => (
              <button
                key={device.id}
                className="w-full px-4 py-3 text-left hover:bg-accent transition-colors flex items-center justify-between"
                onMouseDown={() => navigate(`/inventory/${device.id}`)}
              >
                <div>
                  <p className="text-sm font-medium">{device.brand} {device.model}</p>
                  <p className="text-xs text-muted-foreground">IMEI: {device.imei1}</p>
                </div>
                <Badge variant={device.status === 'Available' ? 'default' : 'secondary'} className="text-[10px]">
                  {device.status}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleDark} className="rounded-lg">
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-lg relative ${hasNewAlert ? 'animate-pulse' : ''}`}
            onClick={handleBellClick}
          >
            <Bell className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600' : ''}`} />
            {lowStockCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full animate-in fade-in zoom-in duration-300">
                {lowStockCount}
              </span>
            )}
          </Button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              {/* Panel */}
              <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <h3 className="text-sm font-semibold">Stok Menipis</h3>
                    </div>
                    {lowStockCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5">
                        {lowStockCount} item
                      </Badge>
                    )}
                  </div>
                  {lowStockCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Beberapa barang hampir habis</p>
                  )}
                </div>

                {/* Items */}
                <div className="max-h-[320px] overflow-y-auto">
                  {lowStockCount === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center mb-3">
                        <Package className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Semua stok aman</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Tidak ada barang yang menipis</p>
                    </div>
                  ) : (
                    lowStockItems.map((item, index) => (
                      <button
                        key={item.id}
                        onClick={() => handleNotificationItemClick(item)}
                        className={`w-full px-4 py-3 text-left hover:bg-accent/50 transition-all duration-150 flex items-center gap-3 border-b border-border/50 last:border-0 ${
                          index === 0 ? '' : ''
                        }`}
                      >
                        {/* Status indicator */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          item.critical ? 'bg-red-500 animate-pulse' : 'bg-amber-400'
                        }`} />

                        {/* Item info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.type === 'accessory' ? item.category || 'Aksesoris' : 'Perangkat'}
                          </p>
                        </div>

                        {/* Stock count */}
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          item.critical
                            ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}>
                          sisa {item.stock}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Footer */}
                {lowStockCount > 0 && (
                  <div className="px-4 py-2.5 border-t border-border bg-muted/30">
                    <button
                      onClick={() => { setShowNotifications(false); navigate('/inventory'); }}
                      className="text-xs text-primary font-medium hover:underline w-full text-center"
                    >
                      Lihat semua stok →
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Smartphone, ShoppingCart, Users, Truck,
  Wrench, Wallet, BarChart3, Settings,
  ChevronLeft, ChevronRight, LogOut, Headphones
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { label: 'Beranda', icon: LayoutDashboard, path: '/' },
  { label: 'Stok', icon: Smartphone, path: '/inventory' },
  { label: 'Penjualan', icon: ShoppingCart, path: '/sales' },
  { label: 'Pelanggan', icon: Users, path: '/customers' },
  { label: 'Supplier', icon: Truck, path: '/suppliers' },
  { label: 'Servis', icon: Wrench, path: '/services' },
  { label: 'Aksesoris', icon: Headphones, path: '/accessories' },
  { label: 'Arus Kas', icon: Wallet, path: '/cashflow' },
  { label: 'Laporan', icon: BarChart3, path: '/reports' },
  { label: 'Pengaturan', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      "h-screen flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
      collapsed ? "w-[72px]" : "w-[240px]"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        {collapsed ? (
          <svg className="w-6 h-6 mx-auto text-foreground" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.3-49.1 188.3-49.1 30.5.1 110.8 2.9 173.3 71.1zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
          </svg>
        ) : (
          <div className="flex items-center gap-2.5">
            <svg className="w-7 h-7 flex-shrink-0 text-foreground" viewBox="0 0 814 1000" fill="currentColor">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.3-49.1 188.3-49.1 30.5.1 110.8 2.9 173.3 71.1zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
            </svg>
            <div>
              <h1 className="text-sm font-black tracking-widest text-foreground">KANIE STORE</h1>
              <p className="text-[9px] text-muted-foreground font-medium tracking-wide">Powered Nagoya Digital</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <item.icon className={cn("w-[18px] h-[18px] flex-shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent w-full transition-all"
        >
          {collapsed ? <ChevronRight className="w-[18px] h-[18px] mx-auto" /> : <ChevronLeft className="w-[18px] h-[18px]" />}
          {!collapsed && <span>Tutup</span>}
        </button>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-all"
        >
          <LogOut className={cn("w-[18px] h-[18px]", collapsed && "mx-auto")} />
          {!collapsed && <span>Keluar</span>}
        </button>
        {!collapsed && (
          <p className="text-[9px] text-muted-foreground text-center py-1 px-2">
            © {new Date().getFullYear()} Nagoya Digital
          </p>
        )}
      </div>
    </aside>
  );
}
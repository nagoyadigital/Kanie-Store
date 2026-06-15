import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const StockNotificationContext = createContext();

// Default min_stock threshold if not set on item
const DEFAULT_MIN_STOCK = 5;

// Notification sound (short beep)
const NOTIFICATION_SOUND_URL = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGMcBj+a2teleAsLTJna4LNmGwU+mNnepHISDk2T0NsAAAAAAA==';

function playNotificationSound() {
  try {
    const audio = new Audio(NOTIFICATION_SOUND_URL);
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore autoplay errors
  } catch {
    // Silent fail
  }
}

function requestDesktopNotification(title, body, onClick) {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, { body, icon: '/favicon.ico' });
    if (onClick) notification.onclick = onClick;
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        const notification = new Notification(title, { body, icon: '/favicon.ico' });
        if (onClick) notification.onclick = onClick;
      }
    });
  }
}

export const StockNotificationProvider = ({ children }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const previousCountRef = useRef(0);
  const notifiedIdsRef = useRef(new Set());
  const intervalRef = useRef(null);

  const checkStock = useCallback(async () => {
    try {
      // Check accessories (they have stock field)
      const accessories = await base44.entities.Accessory.list('-created_date', 1000);

      // Check devices with status "Available" count per model
      const devices = await base44.entities.Device.list('-created_date', 1000);
      const availableDevices = devices.filter(d => d.status === 'Available');

      // Group devices by brand+model to get "stock" count
      const deviceGroups = {};
      availableDevices.forEach(d => {
        const key = `${d.brand} ${d.model}`;
        if (!deviceGroups[key]) {
          deviceGroups[key] = { name: key, stock: 0, min_stock: DEFAULT_MIN_STOCK, type: 'device' };
        }
        deviceGroups[key].stock++;
      });

      const lowItems = [];

      // Check accessories
      accessories.forEach(acc => {
        const minStock = acc.min_stock || DEFAULT_MIN_STOCK;
        const stock = acc.stock || 0;
        if (stock <= minStock) {
          lowItems.push({
            id: acc.id,
            name: acc.name,
            stock,
            min_stock: minStock,
            type: 'accessory',
            category: acc.category,
            critical: stock <= 2,
          });
        }
      });

      // Check device groups
      Object.values(deviceGroups).forEach(group => {
        if (group.stock <= group.min_stock) {
          lowItems.push({
            id: `device_group_${group.name}`,
            name: group.name,
            stock: group.stock,
            min_stock: group.min_stock,
            type: 'device',
            critical: group.stock <= 2,
          });
        }
      });

      // Sort: critical first, then by stock ascending
      lowItems.sort((a, b) => {
        if (a.critical && !b.critical) return -1;
        if (!a.critical && b.critical) return 1;
        return a.stock - b.stock;
      });

      // Detect new low-stock items (for sound/push notification)
      const currentIds = new Set(lowItems.map(i => i.id));
      const newItems = lowItems.filter(i => !notifiedIdsRef.current.has(i.id));

      if (newItems.length > 0 && previousCountRef.current < lowItems.length) {
        setHasNewAlert(true);
        playNotificationSound();
        
        // Desktop notification
        const names = newItems.slice(0, 3).map(i => `${i.name} (sisa ${i.stock})`).join(', ');
        requestDesktopNotification(
          '⚠️ Stok Menipis',
          names + (newItems.length > 3 ? ` dan ${newItems.length - 3} lainnya` : ''),
          () => { window.focus(); }
        );
      }

      // Update notified IDs — reset items that are no longer low
      notifiedIdsRef.current = currentIds;
      previousCountRef.current = lowItems.length;

      setLowStockItems(lowItems);
    } catch {
      // Silent fail
    }
  }, []);

  // Initial check + polling every 10 seconds
  useEffect(() => {
    checkStock();
    intervalRef.current = setInterval(checkStock, 10000);
    return () => clearInterval(intervalRef.current);
  }, [checkStock]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const dismissNewAlert = useCallback(() => {
    setHasNewAlert(false);
  }, []);

  const refreshStock = useCallback(() => {
    checkStock();
  }, [checkStock]);

  return (
    <StockNotificationContext.Provider value={{
      lowStockItems,
      lowStockCount: lowStockItems.length,
      hasNewAlert,
      dismissNewAlert,
      refreshStock,
    }}>
      {children}
    </StockNotificationContext.Provider>
  );
};

export const useStockNotification = () => {
  const ctx = useContext(StockNotificationContext);
  if (!ctx) {
    throw new Error('useStockNotification must be used within StockNotificationProvider');
  }
  return ctx;
};

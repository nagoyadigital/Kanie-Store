import React, { useRef, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PrintInvoice({ sale, open, onClose }) {
  const printRef = useRef();

  const handlePrint = useCallback(() => {
    if (!sale) return;
    const saleDate = sale.sale_date
      ? format(new Date(sale.sale_date), 'dd/MM/yyyy')
      : format(new Date(), 'dd/MM/yyyy');

    const win = window.open('', '_blank', 'width=800,height=900');
    win.document.write(`<!DOCTYPE html><html><head><title>Faktur ${sale.invoice_number || ''}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #1a1a1a; background: #fff; }
        .invoice { max-width: 400px; margin: 0 auto; padding: 32px 28px; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 20px; font-weight: 800; letter-spacing: 4px; }
        .sub { font-size: 9px; color: #888; letter-spacing: 2px; margin-top: 4px; text-transform: uppercase; }
        .badge { display: inline-block; background: #f0f0f0; color: #333; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 4px; text-transform: uppercase; }
        .divider { border: none; border-top: 1px solid #e5e5e5; margin: 14px 0; }
        .divider-d { border: none; border-top: 1px dashed #d0d0d0; margin: 12px 0; }
        .stitle { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; color: #999; text-transform: uppercase; margin-bottom: 6px; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; }
        .lbl { color: #666; }
        .val { font-weight: 600; text-align: right; max-width: 60%; word-break: break-all; }
        .mono { font-family: monospace; font-size: 11px; }
        .total-box { background: #f8f8f8; border-radius: 8px; padding: 14px; margin: 14px 0; display: flex; justify-content: space-between; align-items: center; }
        .total-box .tl { font-size: 14px; font-weight: 700; }
        .total-box .tv { font-size: 20px; font-weight: 800; }
        .discount { color: #e53e3e; }
        .footer { text-align: center; margin-top: 20px; padding-top: 14px; border-top: 1px dashed #e0e0e0; }
        .footer p { font-size: 10px; color: #999; line-height: 1.8; }
      </style></head><body><div class="invoice">
        <div class="header"><div class="logo">KANIE STORE</div><div class="sub">Powered by Nagoya Digital</div></div>
        <div style="text-align:center;margin-bottom:14px;"><span class="badge">Faktur Penjualan</span></div>
        <hr class="divider"/>
        <div class="row"><span class="lbl">No. Faktur</span><span class="val mono">${sale.invoice_number || '—'}</span></div>
        <div class="row"><span class="lbl">Tanggal</span><span class="val">${saleDate}</span></div>
        <div class="row"><span class="lbl">Pembayaran</span><span class="val">${sale.payment_method || 'Cash'}</span></div>
        <hr class="divider-d"/>
        <div class="stitle">Pelanggan</div>
        <div class="row"><span class="lbl">Nama</span><span class="val">${sale.customer_name || '—'}</span></div>
        <div class="row"><span class="lbl">Tipe</span><span class="val">${sale.customer_type || 'Retail'}</span></div>
        <hr class="divider-d"/>
        <div class="stitle">Perangkat</div>
        <div class="row"><span class="lbl">Model</span><span class="val">${sale.device_name || '—'}</span></div>
        <div class="row"><span class="lbl">IMEI</span><span class="val mono">${sale.imei || '—'}</span></div>
        <hr class="divider-d"/>
        <div class="stitle">Rincian Harga</div>
        <div class="row"><span class="lbl">Harga Jual</span><span class="val">¥${(sale.selling_price || 0).toLocaleString()}</span></div>
        ${(sale.discount || 0) > 0 ? `<div class="row"><span class="lbl">Diskon</span><span class="val discount">- ¥${(sale.discount || 0).toLocaleString()}</span></div>` : ''}
        <div class="total-box"><span class="tl">TOTAL</span><span class="tv">¥${(sale.final_price || 0).toLocaleString()}</span></div>
        ${sale.notes ? `<div class="stitle">Catatan</div><p style="font-size:11px;color:#555;margin-bottom:12px;">${sale.notes}</p>` : ''}
        <div class="footer"><p style="font-size:11px;color:#555;font-weight:500;">Terima kasih atas pembelian Anda!</p><p>KANIE STORE — Powered by Nagoya Digital</p></div>
      </div><script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script></body></html>`);
    win.document.close();
  }, [sale]);

  const handleDownloadPDF = useCallback(async () => {
    if (!printRef.current || !sale) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [100, 150],
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Faktur-${sale.invoice_number || 'invoice'}.pdf`);
    } catch {
      handlePrint();
    }
  }, [sale, handlePrint]);

  if (!sale) return null;

  const saleDate = sale.sale_date
    ? format(new Date(sale.sale_date), 'dd/MM/yyyy')
    : format(new Date(), 'dd/MM/yyyy');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/30">
          <span className="text-sm font-semibold">Faktur Penjualan</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="gap-1.5 h-8 text-xs">
              <Download className="w-3.5 h-3.5" /> Unduh PDF
            </Button>
            <Button size="sm" onClick={handlePrint} className="gap-1.5 h-8 text-xs">
              <Printer className="w-3.5 h-3.5" /> Cetak
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div className="p-6 overflow-y-auto max-h-[80vh] bg-gray-50">
          <div
            ref={printRef}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-7 max-w-[400px] mx-auto"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="text-xl font-extrabold tracking-[4px] text-gray-900">KANIE STORE</h2>
              <p className="text-[9px] text-gray-400 tracking-[2px] uppercase mt-1">Powered by Nagoya Digital</p>
            </div>

            <div className="text-center mb-4">
              <span className="inline-block bg-gray-100 text-gray-600 text-[9px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 rounded">
                Faktur Penjualan
              </span>
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Invoice Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">No. Faktur</span>
                <span className="text-[12px] font-semibold font-mono text-gray-900">{sale.invoice_number || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">Tanggal</span>
                <span className="text-[12px] font-medium text-gray-900">{saleDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[12px] text-gray-500">Pembayaran</span>
                <span className="text-[12px] font-medium text-gray-900">{sale.payment_method || 'Cash'}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            {/* Customer */}
            <div className="mb-4">
              <p className="text-[9px] font-bold tracking-[1.5px] text-gray-400 uppercase mb-2">Pelanggan</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">Nama</span>
                  <span className="text-[12px] font-semibold text-gray-900">{sale.customer_name || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">Tipe</span>
                  <span className="text-[12px] font-medium text-gray-900">{sale.customer_type || 'Retail'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            {/* Device */}
            <div className="mb-4">
              <p className="text-[9px] font-bold tracking-[1.5px] text-gray-400 uppercase mb-2">Perangkat</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">Model</span>
                  <span className="text-[12px] font-semibold text-gray-900 text-right max-w-[55%]">{sale.device_name || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">IMEI</span>
                  <span className="text-[11px] font-mono font-medium text-gray-700 text-right max-w-[60%] break-all">{sale.imei || '—'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4" />

            {/* Pricing */}
            <div className="mb-4">
              <p className="text-[9px] font-bold tracking-[1.5px] text-gray-400 uppercase mb-2">Rincian Harga</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-gray-500">Harga Jual</span>
                  <span className="text-[12px] font-medium text-gray-900">¥{(sale.selling_price || 0).toLocaleString()}</span>
                </div>
                {(sale.discount || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gray-500">Diskon</span>
                    <span className="text-[12px] font-medium text-red-500">- ¥{(sale.discount || 0).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="bg-gray-50 rounded-lg p-4 my-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">TOTAL</span>
                <span className="text-xl font-extrabold text-gray-900">¥{(sale.final_price || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="mb-4">
                <p className="text-[9px] font-bold tracking-[1.5px] text-gray-400 uppercase mb-1">Catatan</p>
                <p className="text-[11px] text-gray-500">{sale.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 mt-4 border-t border-dashed border-gray-200">
              <p className="text-[11px] text-gray-500 font-medium">Terima kasih atas pembelian Anda!</p>
              <p className="text-[9px] text-gray-400 mt-1">KANIE STORE — Powered by Nagoya Digital</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { clinicConfig, type FiscalInvoice, formatDateAL, paymentMethodLabelsAL, numberToWordsAL } from "@/lib/invoice-utils";

interface InvoicePreviewProps {
  invoice: FiscalInvoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const sym = invoice.currencySymbol || clinicConfig.currencySymbol;
  const cur = invoice.currency || clinicConfig.currency;

  return (
    <div className="bg-white text-gray-900 p-8 max-w-[210mm] mx-auto shadow-lg rounded-sm text-[13px] leading-relaxed font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-primary pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white text-lg font-bold">
              D
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{clinicConfig.name}</h1>
              <p className="text-xs text-gray-500">Klinikë Dentare</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
            <p>{clinicConfig.address}</p>
            <p>Tel: {clinicConfig.phone} | Email: {clinicConfig.email}</p>
            <p className="font-medium">NIPT: {clinicConfig.nipt}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-primary tracking-tight">FATURË</h2>
          <p className="text-sm font-mono font-semibold text-gray-700 mt-1">{invoice.invoiceNumber}</p>
          <div className="mt-2 text-xs text-gray-600 space-y-0.5">
            <p>Data: {formatDateAL(invoice.date)}</p>
            <p>Ora: {invoice.time}</p>
            <p>Afati: {formatDateAL(invoice.dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Client info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-md p-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Blerësi</h3>
          <p className="font-semibold text-gray-900">{invoice.patientName}</p>
          {invoice.patientAddress && <p className="text-xs text-gray-600">{invoice.patientAddress}</p>}
          {invoice.patientNipt && <p className="text-xs text-gray-600">NIPT: {invoice.patientNipt}</p>}
        </div>
        <div className="bg-gray-50 rounded-md p-3">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Detaje</h3>
          <p className="text-xs text-gray-600">Dentist: <span className="font-medium text-gray-900">{invoice.dentist}</span></p>
          <p className="text-xs text-gray-600">Pagesa: <span className="font-medium text-gray-900">{paymentMethodLabelsAL[invoice.paymentMethod]}</span></p>
          <p className="text-xs text-gray-600">Monedha: <span className="font-medium text-gray-900">{cur}</span></p>
          <p className="text-xs text-gray-600">
            Statusi:{" "}
            <span className={`font-medium ${invoice.status === "paid" ? "text-emerald-600" : invoice.status === "overdue" ? "text-red-600" : "text-amber-600"}`}>
              {invoice.status === "paid" ? "Paguar" : invoice.status === "partial" ? "Pjesërisht" : invoice.status === "overdue" ? "Vonuar" : "Papaguar"}
            </span>
          </p>
        </div>
      </div>

      {/* Items table */}
      <table className="w-full mb-4">
        <thead>
          <tr className="bg-primary/5">
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-2">#</th>
            <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-2">Përshkrimi</th>
            <th className="text-center text-[11px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-2">Sasia</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-2">Çmimi</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-2">TVSH %</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-2">TVSH</th>
            <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-600 px-3 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="px-3 py-2 text-gray-500 tabular-nums">{idx + 1}</td>
              <td className="px-3 py-2 text-gray-900">{item.description}</td>
              <td className="px-3 py-2 text-center tabular-nums">{item.quantity}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{item.unitPrice.toFixed(2)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{item.vatRate}%</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{item.vatAmount.toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums font-medium">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Nëntotali:</span>
            <span className="font-mono tabular-nums">{sym}{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVSH ({clinicConfig.vatRate}%):</span>
            <span className="font-mono tabular-nums">{sym}{invoice.vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t-2 border-primary pt-2 mt-1">
            <span className="text-gray-900">TOTAL:</span>
            <span className="font-mono tabular-nums text-primary">{sym}{invoice.total.toFixed(2)}</span>
          </div>
          {invoice.paid > 0 && invoice.paid < invoice.total && (
            <>
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Paguar:</span>
                <span className="font-mono tabular-nums">-{sym}{invoice.paid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-red-600">
                <span>Mbetur:</span>
                <span className="font-mono tabular-nums">{sym}{(invoice.total - invoice.paid).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amount in words */}
      <div className="bg-gray-50 rounded-md p-3 mb-6 text-xs">
        <span className="text-gray-500">Shuma me fjalë: </span>
        <span className="font-medium text-gray-900 capitalize">{numberToWordsAL(invoice.total)} {cur}</span>
      </div>

      {/* Bank details */}
      <div className="mb-6">
        <div className="text-xs text-gray-600 space-y-1">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Të dhëna bankare</h3>
          <p>Banka: <span className="font-medium text-gray-900">{clinicConfig.bankName}</span></p>
          <p>IBAN: <span className="font-mono font-medium text-gray-900">{clinicConfig.iban}</span></p>
          <p>Përfituesi: <span className="font-medium text-gray-900">{clinicConfig.name}</span></p>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="text-xs text-gray-500 mb-4">
          <span className="font-medium">Shënim: </span>{invoice.notes}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-3 text-[11px] text-gray-400 text-center space-y-0.5">
        <p>Faleminderit për besimin tuaj! | Shëndet të mirë!</p>
        <p>{clinicConfig.name} | NIPT: {clinicConfig.nipt} | {clinicConfig.address}</p>
        <p className="text-[10px]">Kjo faturë është gjeneruar automatikisht nga sistemi DenteOS CRM</p>
      </div>
    </div>
  );
}

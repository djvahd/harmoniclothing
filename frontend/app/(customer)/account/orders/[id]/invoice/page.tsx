"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Printer } from "lucide-react";
import Logo from "@/components/layout/Logo";
import PriceSummaryRow from "@/components/ui/PriceSummaryRow";
import Badge from "@/components/ui/Badge";
import LoadingState from "@/components/ui/LoadingState";
import { formatDate } from "@/lib/format";
import { getInvoice } from "@/services/orders";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useSWR(`/orders/${params.id}/invoice`, () =>
    getInvoice(Number(params.id)),
  );
  const invoice = data?.data;

  if (isLoading) return <LoadingState variant="detail" />;
  if (!invoice) {
    return (
      <p className="p-8 font-body text-sm text-text-secondary">
        Invoice belum tersedia - pesanan mungkin belum dibayar.
      </p>
    );
  }

  const { order } = invoice;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-20">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 font-body text-sm text-text-secondary"
        >
          <ArrowLeft className="size-4" /> Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 font-body text-sm text-text-secondary"
        >
          <Printer className="size-4" /> Print
        </button>
      </div>

      <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-10">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-primary to-accent" />
        <div className="flex justify-between">
          <div>
            <Logo />
            <p className="mt-2 font-body text-xs text-text-secondary">
              Jl. Konveksi Raya No. 8, Bandung, Indonesia
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-sm font-semibold text-text-primary">
              Invoice #{invoice.invoice_number}
            </p>
            <p className="font-body text-xs text-text-secondary">
              Diterbitkan {formatDate(invoice.issued_at)}
            </p>
            <Badge variant="success">Lunas</Badge>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-1 font-body text-sm">
              <span className="text-text-secondary">
                {item.product_variant.product?.name} x{item.quantity}
              </span>
              <span className="font-semibold text-text-primary">
                {new Intl.NumberFormat("id-ID").format(item.subtotal)}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <PriceSummaryRow label="Subtotal" amount={order.subtotal} />
          <PriceSummaryRow label="Ongkos Kirim" amount={order.shipping_cost} />
          <div className="mt-2 border-t border-border pt-2">
            <PriceSummaryRow label="Total Dibayar" amount={order.total} emphasis />
          </div>
        </div>
      </div>
    </div>
  );
}

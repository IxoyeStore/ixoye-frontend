"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaymentModalProps {
  onSuccess: (tokenId: string) => void;
  total: number;
}

export default function PaymentModal({ onSuccess, total }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    holder_name: "",
    card_number: "",
    expiration_month: "",
    expiration_year: "",
    cvv2: "",
  });

  const handleTokenization = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!window.OpenPay) {
      toast.error("Error al cargar el sistema de pagos");
      setLoading(false);
      return;
    }

    window.OpenPay.token.create(
      cardData,
      (response: any) => {
        setLoading(false);
        onSuccess(response.data.id);
      },
      (error: any) => {
        setLoading(false);
        console.error("Openpay Error:", error);
        toast.error("Datos de tarjeta inválidos. Revisa el número y vigencia.");
      }
    );
  };

  return (
    <form
      onSubmit={handleTokenization}
      className="space-y-4 p-4 bg-white rounded-2xl"
    >
      <h3 className="text-sm font-black text-sky-950 uppercase tracking-widest mb-4">
        Detalles de Pago -{" "}
        {total.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
      </h3>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Nombre en la tarjeta
        </label>
        <input
          required
          className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold"
          placeholder="COMO APARECE EN LA TARJETA"
          onChange={(e) =>
            setCardData({ ...cardData, holder_name: e.target.value })
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Número de tarjeta
        </label>
        <input
          required
          maxLength={16}
          className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold"
          placeholder="0000 0000 0000 0000"
          onChange={(e) =>
            setCardData({
              ...cardData,
              card_number: e.target.value.replace(/\s/g, ""),
            })
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400">
            Mes (MM)
          </label>
          <input
            required
            maxLength={2}
            className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold"
            placeholder="01"
            onChange={(e) =>
              setCardData({ ...cardData, expiration_month: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400">
            Año (AA)
          </label>
          <input
            required
            maxLength={2}
            className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold"
            placeholder="28"
            onChange={(e) =>
              setCardData({ ...cardData, expiration_year: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-400">
            CVV
          </label>
          <input
            required
            maxLength={4}
            className="w-full p-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold"
            placeholder="123"
            onChange={(e) => setCardData({ ...cardData, cvv2: e.target.value })}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white font-black uppercase text-[11px] py-6 shadow-lg mt-4"
      >
        {loading ? "Procesando..." : "Confirmar y Pagar"}
      </Button>
    </form>
  );
}

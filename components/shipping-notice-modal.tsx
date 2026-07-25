"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SEEN_KEY = "ixoye_shipping_notice_seen";
const WHATSAPP_NUMBER = "3112377582";
const SHIPPING_WHATSAPP_NUMBER = "3118477877";

export default function ShippingNoticeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(SEEN_KEY)) {
      setOpen(true);
    }
  }, []);

  const close = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-[#012849] dark:text-sky-300 text-center mb-2">
            Aviso sobre cobertura de envíos
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Los envíos realizados a través de esta página actualmente están disponibles{" "}
          <strong className="text-slate-800 dark:text-slate-200">
            únicamente dentro del estado de Nayarit
          </strong>
          . Si necesitas que te enviemos a otro estado, contáctanos directamente
          por WhatsApp y con gusto te ayudamos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={`https://wa.me/${SHIPPING_WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors"
          >
            <MessageCircle size={16} />
            Escribir por WhatsApp
          </a>
          <button
            onClick={close}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Entendido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

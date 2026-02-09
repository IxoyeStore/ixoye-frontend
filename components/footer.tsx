/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Headset,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Footer() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [isLoadingLegal, setIsLoadingLegal] = useState(false);

  const openLegalModal = async (
    type: "terms-and-condition" | "privacy-policy",
  ) => {
    setIsModalOpen(true);
    setIsLoadingLegal(true);
    setModalContent("");

    setModalTitle(
      type === "terms-and-condition"
        ? "Términos y Condiciones"
        : "Aviso de Privacidad",
    );

    try {
      const res = await fetch(
        `https://ixoye-backend-production.up.railway.app/api/${type}`,
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const result = await res.json();
      const rawData = result.data?.attributes?.content || result.data?.content;

      if (Array.isArray(rawData)) {
        const parsedText = rawData
          .map((block: any) =>
            block.children?.map((child: any) => child.text).join(""),
          )
          .join("\n\n");
        setModalContent(parsedText);
      } else if (typeof rawData === "string") {
        setModalContent(rawData);
      } else {
        setModalContent("Contenido no disponible temporalmente.");
      }
    } catch (error) {
      console.error("Error fetching legal content:", error);
      setModalContent("Error al cargar la información legal.");
    } finally {
      setIsLoadingLegal(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-[#0055a4] to-[#003366] text-white/80 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12">
          {/* Logo + descripción */}
          <div className="space-y-4 md:col-span-1">
            <img
              src="/logo.png"
              alt="logo"
              className="h-16 w-auto brightness-0 invert object-contain"
            />
            <p className="text-sm text-blue-50/80 leading-relaxed">
              Comercializadora e importadora de refacciones para motores diésel.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Navegación
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="hover:text-sky-200 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/category"
                  className="hover:text-sky-200 transition-colors"
                >
                  Tienda
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="hover:text-sky-200 transition-colors"
                >
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-sky-300 mt-0.5" />
                <a
                  href="mailto:soporte@refaccionesixoye.mx"
                  className="hover:text-sky-200 transition-colors"
                >
                  soporte@refaccionesixoye.mx
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-sky-300 mt-0.5" />
                <a
                  href="tel:+520000000000"
                  className="hover:text-sky-200 transition-colors"
                >
                  +52 (311) 591 0847 <br />
                  +52 (311) 591 0848 <br />
                  +52 (311) 591 0850
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-sky-300 mt-0.5 shrink-0" />
                <span className="leading-tight">
                  Vicente Guerrero #298, Tepic, Nayarit.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Headset size={16} className="text-sky-300 mt-0.5 shrink-0" />
                <span className="leading-tight">
                  Horario de Atención:
                  <br />
                  Lun-Vie (9:00 - 18:00)
                  <br />
                  Sab (9:00 - 2:00)
                </span>
              </li>
            </ul>
          </div>

          {/* Información Legal */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => openLegalModal("privacy-policy")}
                  className="hover:text-sky-200 transition-colors text-left"
                >
                  Aviso de Privacidad
                </button>
              </li>
              <li>
                <button
                  onClick={() => openLegalModal("terms-and-condition")}
                  className="hover:text-sky-200 transition-colors text-left"
                >
                  Términos y condiciones
                </button>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Síguenos
            </h3>
            <div className="flex items-center gap-3">
              <Link
                href="https://www.facebook.com/refaccioneixoye/"
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white hover:text-[#0055a4] transition-all border border-white/20"
                target="_blank"
              >
                <Facebook size={18} />
              </Link>
              <Link
                href="https://www.instagram.com/refaccionesixoye/"
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white hover:text-[#0055a4] transition-all border border-white/20"
                target="_blank"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="https://www.youtube.com/@refaccionesixoye4057"
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white hover:text-[#0055a4] transition-all border border-white/20"
                target="_blank"
              >
                <Youtube size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Banner de Facturación */}
        <div className="mt-12 p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="p-2 rounded-full bg-sky-500/10">
            <Info size={20} className="text-sky-300" />
          </div>
          <p className="text-xs text-blue-50/80 text-center sm:text-left leading-relaxed">
            <strong className="text-white block sm:inline mr-2">
              ¿Necesitas Factura?
            </strong>
            Envía tu Constancia de Situación Fiscal y número de pedido a nuestro
            correo o WhatsApp dentro del mes de tu compra.
          </p>
        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-blue-100/60">
          <p>
            © {new Date().getFullYear()} Refacciones Diesel y Agricola Ixoye.
            Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <span className="bg-white/10 text-white font-bold tracking-widest text-[9px] uppercase px-3 py-1 rounded-full border border-white/10">
              Calidad Garantizada
            </span>
          </div>
        </div>
      </div>

      {/* MODAL LEGAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden text-slate-900">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold text-[#012849]">
              {modalTitle}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-6">
            <ScrollArea className="h-[400px] sm:h-[500px] w-full rounded-md border p-4 bg-white shadow-inner">
              {isLoadingLegal ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0071b1] border-t-transparent"></div>
                  <span className="text-sm text-gray-500">Cargando...</span>
                </div>
              ) : (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line pr-4">
                  {modalContent}
                </div>
              )}
            </ScrollArea>
          </div>

          <DialogFooter className="p-6 pt-2 border-t bg-gray-50/50">
            <Button
              className="bg-[#0071b1] hover:bg-[#005a8e] text-white"
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

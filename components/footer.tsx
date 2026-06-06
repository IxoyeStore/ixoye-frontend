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
    <footer className="w-full min-h-[1px] bg-[#003366] bg-gradient-to-b from-[#0055a4] to-[#003366] text-white/80 py-12 mt-20 [transform:translateZ(0)]">
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
                  +52 (311) 237 7582 <br/>
                  +52 (311) 847 7877

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
                  <strong>Horario de Atención:</strong>
                  <br />
                  Lun-Vie (9:00 - 18:00)
                  <br />
                  Sab (9:00 - 2:00)
                  <br />
                  Zona horaria del Pacifico (GMT-7)
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
            <div className="flex flex-wrap gap-4">
              {[
                { href: "https://www.facebook.com/refaccioneixoye/", label: "Facebook", icon: <Facebook size={29} /> },
                { href: "https://www.instagram.com/refaccionesixoye/", label: "Instagram", icon: <Instagram size={29} /> },
                { href: "https://www.youtube.com/@refaccionesixoye4057", label: "YouTube", icon: <Youtube size={29} /> },
                { href: "https://www.mercadolibre.com.mx/pagina/refaccionesixoye", label: "Mercado Libre", icon: (
                  <svg width="29" height="29" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="24" cy="24" rx="19.5" ry="12.978"/>
                    <path d="M9.7044,15.5305A20.8345,20.8345,0,0,0,16.09,17.3957a22.8207,22.8207,0,0,0,4.546-.7731"/>
                    <path d="M38.8824,15.6143a8.6157,8.6157,0,0,1-5.1653,1.4849c-3.3351,0-6.2255-2.1987-9.2148-2.1987-2.6681,0-7.189,4.3727-7.189,5.1633s1.3094,1.26,2.3717.7411c.6215-.3036,3.31-2.9151,5.4843-2.9151s9.2186,7.1361,9.8571,7.8066c.9882,1.0376-.9264,3.2733-2.1493,2.05s-3.4092-3.1621-3.4092-3.1621"/>
                    <path d="M43.4,22.6826a23.9981,23.9981,0,0,0-8.5467,2.6926"/>
                    <path d="M32.5807,27.4555c.9881,1.0376-.9265,3.2733-2.1493,2.05S27.85,26.9933,27.85,26.9933"/>
                    <path d="M30.1349,29.2147c.9882,1.0376-.9264,3.2733-2.1493,2.05S25.96,29.3032,25.96,29.3032"/>
                    <path d="M24.2015,31.3156A2.309,2.309,0,0,0,27.85,31.13"/>
                    <path d="M24.2015,31.3156c.5306-.6964.49-3.1817-2.2437-2.6876.6423-1.2188.0658-3.1457-2.3881-2.0093A1.69,1.69,0,0,0,16.424,25.96a1.4545,1.4545,0,0,0-2.8-.28c-.5435,1.1035.2964,3.0963,2.0916,1.9763-.1812,1.9435.84,2.5364,2.6845,1.7788.0989,1.91,1.367,1.7457,2.2728,1.3011A1.9376,1.9376,0,0,0,24.2015,31.3156Z"/>
                    <path d="M4.6706,22.2785a18.3081,18.3081,0,0,1,9.0635,3.2144"/>
                  </svg>
                )},
              ].map(({ href, label, icon }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className="p-2 rounded-full bg-white/10 text-white group-hover:bg-white group-hover:text-[#0055a4] transition-all border border-white/20">
                    {icon}
                  </span>
                  <span className="text-[10px] font-bold text-blue-100/70 group-hover:text-white transition-colors tracking-wide">
                    {label}
                  </span>
                </Link>
              ))}
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
            correo o WhatsApp dentro del mes de tu compra para.
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

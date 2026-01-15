/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    // GRADIENTE AJUSTADO: Azul vibrante a Azul marino profesional
    <footer className="bg-gradient-to-b from-[#0055a4] to-[#003366] text-white/80 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo + descripción */}
          <div className="space-y-4">
            <img
              src="/logo.png"
              alt="logo"
              className="h-16 w-auto brightness-0 invert object-contain"
            />
            <p className="text-sm text-blue-50/80 leading-relaxed">
              Comercializadora e importadora de refacciones para motores diésel,
              transporte pesado, liviano, construcción y agrícola.
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
                  href="/tienda"
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

          {/* Información */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Información
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-sky-200 transition-colors"
                >
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="hover:text-sky-200 transition-colors"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
              Redes sociales
            </h3>
            <div className="flex items-center gap-5">
              <Link
                href="https://www.facebook.com/refaccioneixoye/"
                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white hover:text-[#0055a4] transition-all border border-white/20"
                target="_blank"
              >
                <Facebook size={20} />
              </Link>

              <Link
                href="https://www.instagram.com/refaccionesixoye/"
                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white hover:text-[#0055a4] transition-all border border-white/20"
                target="_blank"
              >
                <Instagram size={20} />
              </Link>

              <Link
                href="https://www.youtube.com/@refaccionesixoye4057"
                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white hover:text-[#0055a4] transition-all border border-white/20"
                target="_blank"
              >
                <Youtube size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-blue-100/60">
          <p>
            © {new Date().getFullYear()} Refacciones Diesel y Agricola Ixoye.
          </p>
          <div className="flex items-center gap-4">
            <span className="bg-white/10 text-white font-bold tracking-widest text-[9px] uppercase px-3 py-1 rounded-full border border-white/10">
              Calidad Garantizada
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

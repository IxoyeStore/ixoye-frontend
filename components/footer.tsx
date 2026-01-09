/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111] text-gray-300 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo + descripción */}
          <div>
            <img src="/logo.png" alt="logo" className="h-12 mb-4" />
            <p className="text-sm text-gray-400 leading-relaxed">
              Comercializadora e importadora de refacciones para motores diésel,
              transporte pesado, transporte liviano, para construcción y
              agrícola.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <h3 className="text-white font-semibold mb-3">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="hover:text-white transition">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="app/cart" className="hover:text-white transition">
                  Carrito
                </Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-white font-semibold mb-3">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-white transition"
                >
                  Políticas de privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="hover:text-white transition"
                >
                  Términos y condiciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes sociales */}
          <div>
            <h3 className="text-white font-semibold mb-3">Síguenos</h3>
            <div className="flex items-center gap-4 mt-2">
              <Link
                href="https://www.facebook.com/refaccioneixoye/"
                className="hover:text-white transition"
                target="_blank"
              >
                <Facebook size={22} />
              </Link>

              <Link
                href="https://www.instagram.com/refaccionesixoye/"
                className="hover:text-white transition"
                target="_blank"
              >
                <Instagram size={22} />
              </Link>

              <Link
                href="https://www.youtube.com/@refaccionesixoye4057"
                className="hover:text-white transition"
                target="_blank"
              >
                <Youtube size={22} />
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Refacciones Diesel y Agricola Ixoye.
          Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

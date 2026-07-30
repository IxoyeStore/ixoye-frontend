"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

// Por defecto, el gesto/boton de "regresar" de Android en Capacitor
// simplemente cierra la app en vez de navegar hacia atras dentro del
// historial del sitio - hay que engancharlo a mano. Si el WebView puede
// regresar (canGoBack), navega atras; si ya esta en la pantalla raiz, se
// minimiza la app (comportamiento estandar de Android) en vez de
// matarla. Se monta una sola vez en el layout raiz para que funcione en
// cualquier pantalla, incluido el panel de admin.
export default function MobileBackButtonHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        App.minimizeApp();
      }
    });

    return () => {
      listenerPromise.then((handle) => handle.remove());
    };
  }, []);

  return null;
}

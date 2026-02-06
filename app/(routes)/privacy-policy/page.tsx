import { Separator } from "@/components/ui/separator";
import { getPrivacyPolicy } from "@/api/getPrivacyPolicy";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function PrivacyPolicyPage() {
  try {
    const policy = await getPrivacyPolicy();

    if (!policy) {
      throw new Error("No se pudo obtener la política");
    }

    return (
      <div className="min-h-[calc(100vh-64px)] flex justify-center px-4">
        <div className="w-full max-w-4xl py-10">
          <h1 className="text-3xl font-bold text-center">
            {policy.title || "Aviso de Privacidad"}
          </h1>

          <Separator className="my-6" />

          <article
            className="prose dark:prose-invert max-w-none mx-auto"
            dangerouslySetInnerHTML={{
              __html: policy.content || "<p>Contenido en mantenimiento.</p>",
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error en PrivacyPolicyPage:", error);

    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <h1 className="text-xl font-semibold">Aviso de Privacidad</h1>
        <p className="text-muted-foreground">
          Estamos actualizando nuestros términos. Por favor, intenta más tarde.
        </p>
      </div>
    );
  }
}

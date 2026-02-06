import { Separator } from "@/components/ui/separator";
import { getPrivacyPolicy } from "@/api/getPrivacyPolicy";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function TermsAndConditionsPage() {
  const policy = await getPrivacyPolicy();

  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center px-4">
      <div className="w-full max-w-4xl py-10">
        <h1 className="text-3xl font-bold text-center">
          Términos y Condiciones
        </h1>

        <Separator className="my-6" />

        <article className="prose dark:prose-invert max-w-none mx-auto">
          {policy?.content ? (
            <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          ) : (
            <p>
              Bienvenido a Refacciones Ixoye. Al usar nuestro sitio, aceptas
              nuestros términos de servicio. Este contenido se actualizará
              próximamente desde el panel de administración.
            </p>
          )}
        </article>
      </div>
    </div>
  );
}

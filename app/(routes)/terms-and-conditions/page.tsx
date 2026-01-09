import { Separator } from "@/components/ui/separator";
import { getPrivacyPolicy } from "@/api/getPrivacyPolicy";

export default async function PrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();

  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center px-4">
      <div className="w-full max-w-4xl py-10">
        <h1 className="text-3xl font-bold text-center">
          Terminos y Condiciones
        </h1>

        <Separator className="my-6" />

        <article>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet magni
          omnis similique fugit molestias dolorem, cupiditate assumenda?
          Accusantium, cumque veniam illo blanditiis incidunt, deleniti, numquam
          perferendis porro debitis id eos.
        </article>
      </div>
    </div>
  );
}

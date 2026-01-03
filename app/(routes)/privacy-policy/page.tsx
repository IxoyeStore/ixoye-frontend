import { Separator } from "@/components/ui/separator";
import { getPrivacyPolicy } from "@/api/getPrivacyPolicy";

export default async function PrivacyPolicyPage() {
  const policy = await getPrivacyPolicy();

  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center px-4">
      <div className="w-full max-w-4xl py-10">
        <h1 className="text-3xl font-bold text-center">{policy.title}</h1>

        <Separator className="my-6" />

        <article
          className="prose dark:prose-invert max-w-none mx-auto"
          dangerouslySetInnerHTML={{ __html: policy.content }}
        />
      </div>
    </div>
  );
}

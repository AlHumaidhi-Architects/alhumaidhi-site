import { notFound } from "next/navigation";
import { getPublished } from "@/lib/content";
import { getSiteContent } from "@/lib/get-content";
import { Presentation } from "@/components/Presentation";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getSiteContent();
  const project = getPublished(content);
  if (!project) notFound();
  return (
    <Presentation
      studio={content.studio}
      theme={content.theme}
      project={project}
      year={new Date().getFullYear()}
    />
  );
}

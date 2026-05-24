import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/content";
import { getSiteContent } from "@/lib/get-content";
import { Presentation } from "@/components/Presentation";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = getBySlug(content, slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.info.name,
    description: project.info.description || `${content.studio.name} — ${project.info.name}`,
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const content = await getSiteContent();
  const project = getBySlug(content, slug);
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

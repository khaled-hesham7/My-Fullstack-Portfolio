import { getApiBaseUrl } from "@/lib/utils";
import ProjectDetailClient from "./ProjectDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

// Dynamic SEO per project
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const res = await fetch(`${getApiBaseUrl()}/projects/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return { title: "Project Not Found" };
    const payload = await res.json();
    const p = payload.data;
    return {
      title: `${p.title} | Projects | Khaled Hesham`,
      description: p.description?.slice(0, 160) || "Project details",
      openGraph: {
        title: p.title,
        description: p.description?.slice(0, 160),
        images: p.image_url ? [{ url: p.image_url }] : [],
      },
    };
  } catch {
    return { title: "Project | Khaled Hesham" };
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  let project = null;
  try {
    const res = await fetch(`${getApiBaseUrl()}/projects/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) notFound();
    const payload = await res.json();
    if (payload.success) project = payload.data;
  } catch {
    notFound();
  }

  if (!project) notFound();

  return <ProjectDetailClient project={project} />;
}

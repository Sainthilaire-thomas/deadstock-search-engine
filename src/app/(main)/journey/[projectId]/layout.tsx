// src/app/journey/[projectId]/layout.tsx
// Layout partagé pour toutes les étapes d'un projet

import { notFound } from 'next/navigation';
import { getProjectAction } from '@/features/journey/actions/projectActions';
import { ProjectProvider } from '@/features/journey/context/ProjectContext';

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  const { projectId } = await params;
  
  const project = await getProjectAction(projectId);
  
  if (!project) {
    notFound();
  }

  return (
    <ProjectProvider initialProject={project} projectId={projectId}>
      {children}
    </ProjectProvider>
  );
}

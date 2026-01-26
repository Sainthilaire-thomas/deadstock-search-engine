// src/app/(main)/boards/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Layout, Archive } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import { listBoardsWithPreviewAction, createBoardAction } from '@/features/boards/actions/boardActions';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BOARD_STATUS_LABELS, type BoardWithPreview } from '@/features/boards/domain/types';

export const metadata = {
  title: 'Mes Projets | Deadstock',
  description: 'Gérez vos projets créatifs',
};

// Force dynamic rendering (requires authentication)
export const dynamic = 'force-dynamic';

// Server Action pour créer un board et rediriger
async function createAndRedirect() {
  'use server';
  const result = await createBoardAction({ name: 'Nouveau projet' });
  if (result.success && result.data) {
    redirect(`/boards/${result.data.id}`);
  }
}

export default async function BoardsPage() {
  const t = await getTranslations();
  const locale = await getLocale();
  const result = await listBoardsWithPreviewAction();
  const boards = result.data ?? [];

  const activeBoards = boards.filter((b) => b.status !== 'archived');
  const archivedBoards = boards.filter((b) => b.status === 'archived');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">{t('project.myProjects')}</h1>
          <p className="text-muted-foreground mt-1">
            {locale === 'en' 
              ? 'Organize your ideas and inspirations' 
              : 'Organisez vos idées et inspirations'}
          </p>
        </div>
        <form action={createAndRedirect}>
          <Button type="submit">
            <Plus className="w-4 h-4 mr-2" />
            {t('project.newProject')}
          </Button>
        </form>
      </div>

      {/* Empty state */}
      {boards.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Layout className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-medium mb-2">{t('project.noProjects')}</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              {t('project.createFirst')}
            </p>
            <form action={createAndRedirect}>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                {t('project.createProject')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active boards */}
      {activeBoards.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            {t('project.plural')} ({activeBoards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBoards.map((board) => (
  <BoardCard key={board.id} board={board} locale={locale} t={t} />
))}
          </div>
        </div>
      )}

      {/* Archived boards */}
      {archivedBoards.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            {locale === 'en' ? 'Archived' : 'Archivés'} ({archivedBoards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {archivedBoards.map((board) => (
  <BoardCard key={board.id} board={board} locale={locale} t={t} />
))}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant carte board avec preview
function BoardCard({ board, locale, t }: { board: BoardWithPreview; locale: string; t: Awaited<ReturnType<typeof getTranslations>> }) {
  
  const displayName = board.name || (locale === 'en' ? 'Untitled' : 'Sans titre');
  const updatedAt = new Date(board.updatedAt).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Labels avec pluralisation
  const elementLabel = locale === 'en'
    ? `${board.elementCount} element${board.elementCount > 1 ? 's' : ''}`
    : `${board.elementCount} élément${board.elementCount > 1 ? 's' : ''}`;
  
  const zoneLabel = `${board.zoneCount} zone${board.zoneCount > 1 ? 's' : ''}`;

  const modifiedLabel = locale === 'en' ? 'Modified' : 'Modifié le';

  return (
    <Link href={`/boards/${board.id}`}>
      <Card className="hover:border-foreground/20 transition-colors cursor-pointer group overflow-hidden">
        <CardContent className="p-0">
          {/* Preview image */}
          <div className="aspect-video bg-muted relative overflow-hidden">
            {board.previewUrl ? (
              <Image
                src={board.previewUrl}
                alt={displayName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Layout className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}

            {/* Badges compteurs */}
            <div className="absolute bottom-2 right-2 flex gap-1.5">
              {board.elementCount > 0 && (
                <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {elementLabel}
                </span>
              )}
              {board.zoneCount > 0 && (
                <span className="bg-primary/80 text-white text-xs px-2 py-0.5 rounded-full">
                  {zoneLabel}
                </span>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                  {displayName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {modifiedLabel} {updatedAt}
                </p>
              </div>

              {/* Status badge */}
              {board.status === 'archived' && (
                <span className="text-xs bg-muted px-2 py-1 rounded ml-2">
                  {BOARD_STATUS_LABELS[board.status as keyof typeof BOARD_STATUS_LABELS]}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// src/app/(main)/boards/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import { Plus, Layout, Archive } from 'lucide-react';
import { listBoardsWithPreviewAction, createBoardAction } from '@/features/boards/actions/boardActions';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BOARD_STATUS_LABELS, type BoardWithPreview } from '@/features/boards/domain/types';

export const metadata = {
  title: 'Mes Boards | Deadstock',
  description: 'Gérez vos boards créatifs',
};

// Force dynamic rendering (requires authentication)
export const dynamic = 'force-dynamic';

// Server Action pour créer un board et rediriger
async function createAndRedirect() {
  'use server';
  const result = await createBoardAction({ name: 'Nouveau board' });
  if (result.success && result.data) {
    redirect(`/boards/${result.data.id}`);
  }
}

export default async function BoardsPage() {
  const result = await listBoardsWithPreviewAction();
  const boards = result.data ?? [];

  const activeBoards = boards.filter((b) => b.status !== 'archived');
  const archivedBoards = boards.filter((b) => b.status === 'archived');

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Mes Boards</h1>
          <p className="text-muted-foreground mt-1">
            Organisez vos idées et inspirations
          </p>
        </div>
        <form action={createAndRedirect}>
          <Button type="submit">
            <Plus className="w-4 h-4 mr-2" />
            Nouveau board
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
            <h2 className="text-lg font-medium mb-2">Aucun board</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Créez votre premier board pour commencer à organiser vos tissus,
              palettes et inspirations.
            </p>
            <form action={createAndRedirect}>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Créer mon premier board
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active boards */}
      {activeBoards.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
            Boards actifs ({activeBoards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      )}

      {/* Archived boards */}
      {archivedBoards.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Archivés ({archivedBoards.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {archivedBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant carte board avec preview
function BoardCard({ board }: { board: BoardWithPreview }) {
  const displayName = board.name || 'Sans titre';
  const updatedAt = new Date(board.updatedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

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
                  {board.elementCount} élément{board.elementCount > 1 ? 's' : ''}
                </span>
              )}
              {board.zoneCount > 0 && (
                <span className="bg-primary/80 text-white text-xs px-2 py-0.5 rounded-full">
                  {board.zoneCount} zone{board.zoneCount > 1 ? 's' : ''}
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
                  Modifié le {updatedAt}
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

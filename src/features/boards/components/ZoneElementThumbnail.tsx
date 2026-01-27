// src/features/boards/components/ZoneElementThumbnail.tsx
'use client';

import React from 'react';
import {
  Shirt,
  Palette,
  Image,
  Video,
  StickyNote,
  Ruler,
  Link,
  FileText,
  Scissors,
  User,
} from 'lucide-react';
import type {
  BoardElement,
  TextileElementData,
  PaletteElementData,
  InspirationElementData,
  VideoElementData,
} from '../domain/types';

const THUMB_SIZE = 40;

interface ZoneElementThumbnailProps {
  element: BoardElement;
}

export const ZoneElementThumbnail = React.memo(function ZoneElementThumbnail({
  element,
}: ZoneElementThumbnailProps) {
  const renderContent = () => {
    switch (element.elementType) {
      case 'textile': {
        const data = element.elementData as TextileElementData;
        if (data.snapshot?.imageUrl) {
          return (
            <img
              src={data.snapshot.imageUrl}
              alt={data.snapshot?.name || 'Tissu'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          );
        }
        return <Shirt className="w-4 h-4 text-gray-400" />;
      }

      case 'palette': {
        const data = element.elementData as PaletteElementData;
        const colors = data.colors?.slice(0, 4) || [];
        if (colors.length > 0) {
          return (
            <div className="w-full h-full grid grid-cols-2 gap-px">
              {colors.map((color, i) => (
                <div key={i} style={{ backgroundColor: color }} />
              ))}
            </div>
          );
        }
        return <Palette className="w-4 h-4 text-gray-400" />;
      }

      case 'inspiration': {
        const data = element.elementData as InspirationElementData;
        if (data.imageUrl || data.thumbnailUrl) {
          return (
            <img
              src={data.thumbnailUrl || data.imageUrl}
              alt={data.caption || 'Inspiration'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          );
        }
        return <Image className="w-4 h-4 text-gray-400" />;
      }

      case 'video': {
        const data = element.elementData as VideoElementData;
        if (data.thumbnailUrl) {
          return (
            <img
              src={data.thumbnailUrl}
              alt={data.title || 'Video'}
              className="w-full h-full object-cover"
              draggable={false}
            />
          );
        }
        return <Video className="w-4 h-4 text-gray-400" />;
      }

      case 'note':
        return <StickyNote className="w-4 h-4 text-amber-500" />;

      case 'calculation':
        return <Ruler className="w-4 h-4 text-blue-500" />;

      case 'link':
        return <Link className="w-4 h-4 text-indigo-500" />;

      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;

      case 'pattern':
        return <Scissors className="w-4 h-4 text-purple-500" />;

      case 'silhouette':
        return <User className="w-4 h-4 text-teal-500" />;

      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div
      className="rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
      style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
      title={element.elementType}
    >
      {renderContent()}
    </div>
  );
});

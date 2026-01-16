// src/features/journey/components/OrderForm.tsx
// Formulaire de commande (Sprint C3)
// Date: 2026-01-16

'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, AlertTriangle, Loader2, X, ExternalLink } from 'lucide-react';
import { placeOrderAction } from '../actions/orderActions';
import type { BoardElement } from '@/features/boards/domain/types';
import { isTextileElement } from '@/features/boards/domain/types';

interface OrderFormProps {
  projectId: string;
  zoneElements: BoardElement[];
  onCancel: () => void;
  onSuccess: () => void;
}

interface TextileWithUrl {
  elementId: string;
  textileId: string;
  name: string;
  source: string;
  sourceUrl: string | null;
  price: number;
  currency: string;
  imageUrl: string | null;
}

export function OrderForm({ projectId, zoneElements, onCancel, onSuccess }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [textileUrls, setTextileUrls] = useState<Record<string, string | null>>({});
const [textileSources, setTextileSources] = useState<Record<string, string | null>>({});

  // Filtrer les textiles
  const textileElements = useMemo(() => {
    return zoneElements.filter(
      e => e.elementType === 'textile' && isTextileElement(e.elementData)
    );
  }, [zoneElements]);

  // Construire la liste des textiles avec leurs infos
 const textilesWithInfo: TextileWithUrl[] = useMemo(() => {
    return textileElements.map(element => {
      if (!isTextileElement(element.elementData)) return null;
      const data = element.elementData;
      return {
        elementId: element.id,
        textileId: data.textileId,
        name: data.snapshot.name,
        source: textileSources[data.textileId] || data.snapshot.source || 'Fournisseur',
        sourceUrl: textileUrls[data.textileId] ?? null,
        price: data.snapshot.price,
        currency: data.snapshot.currency,
        imageUrl: data.snapshot.imageUrl,
      };
    }).filter((t): t is TextileWithUrl => t !== null);
  }, [textileElements, textileUrls, textileSources]);

 

  // Déterminer le fournisseur unique (si tous du même site)
  const uniqueSupplier = useMemo(() => {
    const sources = [...new Set(textilesWithInfo.map(t => t.source))];
    return sources.length === 1 ? sources[0] : null;
  }, [textilesWithInfo]);

  // État du formulaire
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    textileElements.forEach(t => {
      initial[t.id] = 1; // Default 1m
    });
    return initial;
  });
  const [supplier, setSupplier] = useState('');
  const [orderReference, setOrderReference] = useState('');
  const [notes, setNotes] = useState('');

 // Auto-remplir le fournisseur si unique (après chargement des sources)
  useEffect(() => {
    if (!isLoadingUrls && uniqueSupplier && supplier === '') {
      setSupplier(uniqueSupplier);
    }
  }, [uniqueSupplier, isLoadingUrls]);

  // Charger les URLs des textiles
  useEffect(() => {
    const fetchTextileUrls = async () => {
      setIsLoadingUrls(true);
      try {
        const textileIds = textileElements
          .map(e => isTextileElement(e.elementData) ? e.elementData.textileId : null)
          .filter((id): id is string => id !== null);

        if (textileIds.length === 0) {
          setIsLoadingUrls(false);
          return;
        }

        // Fetch URLs from API
        const response = await fetch('/api/textiles/urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textileIds }),
        });

         if (response.ok) {
          const data = await response.json();
          setTextileUrls(data.urls || {});
          setTextileSources(data.sources || {});
        }
      } catch (err) {
        console.error('Failed to fetch textile URLs:', err);
      } finally {
        setIsLoadingUrls(false);
      }
    };

    fetchTextileUrls();
  }, [textileElements]);

  // Calcul du total
  const calculateTotal = () => {
    return textilesWithInfo.reduce((sum, textile) => {
      const qty = quantities[textile.elementId] || 0;
      return sum + (qty * textile.price);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await placeOrderAction({
        projectId,
        quantities,
        supplier,
        orderReference: orderReference || undefined,
        notes: notes || undefined,
      });

      if (!result.success) {
        setError(result.error || 'Erreur lors de la commande');
        return;
      }

      onSuccess();
    } catch (err) {
      setError('Erreur inattendue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Passer commande</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p><strong>Étape 1 :</strong> Cliquez sur les liens pour commander sur les sites fournisseurs.</p>
                <p className="mt-1"><strong>Étape 2 :</strong> Une fois la commande passée, revenez ici pour confirmer et saisir la référence.</p>
              </div>
            </div>
          </div>

          {/* Liste des tissus avec liens */}
          <div className="space-y-4">
            <h3 className="font-medium">Tissus à commander</h3>
            
            {isLoadingUrls ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : textilesWithInfo.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Aucun tissu dans cette zone. Ajoutez des tissus avant de commander.
              </p>
            ) : (
              <div className="space-y-3">
                {textilesWithInfo.map(textile => (
                  <div key={textile.elementId} className="p-3 border rounded-lg space-y-3">
                    <div className="flex items-center gap-4">
                      {textile.imageUrl && (
                        <img
                          src={textile.imageUrl}
                          alt={textile.name}
                          className="w-14 h-14 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{textile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {textile.source} • {textile.price}{textile.currency === 'EUR' ? '€' : textile.currency}/m
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={quantities[textile.elementId] || ''}
                          onChange={(e) => setQuantities(prev => ({
                            ...prev,
                            [textile.elementId]: parseFloat(e.target.value) || 0
                          }))}
                          className="w-20 px-3 py-2 border rounded-lg text-right text-sm"
                        />
                        <span className="text-sm text-muted-foreground">m</span>
                      </div>
                      <div className="w-20 text-right">
                        <p className="font-medium text-sm">
                          {((quantities[textile.elementId] || 0) * textile.price).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    
                    {/* Lien vers le site fournisseur */}
                    {textile.sourceUrl ? (
                      
                    <a    href={textile.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Commander sur {textile.source}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Lien non disponible - Recherchez "{textile.name}" sur {textile.source}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détails commande */}
          <div className="space-y-4">
            <h3 className="font-medium">Confirmation de commande</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Fournisseur *
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Ex: Nona Source"
                required
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Référence commande (du site fournisseur)
              </label>
              <input
                type="text"
                value={orderReference}
                onChange={(e) => setOrderReference(e.target.value)}
                placeholder="Ex: NS-2026-1234"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Instructions particulières..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg resize-none text-sm"
              />
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-4 border-t border-b">
            <span className="text-lg font-medium">Total estimé</span>
            <span className="text-2xl font-bold">{calculateTotal().toFixed(2)}€</span>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 py-3 border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !supplier || textilesWithInfo.length === 0}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5" />
              )}
              J'ai commandé - Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

# ADR-015 : UX Configuration Scraping - Page Dédiée vs Modal

**Date** : 2 Janvier 2026

**Statut** : ✅ Accepté

**Contexte** : Session 8 - Module Admin Complet

---

## Contexte

Lors de la conception du module admin (Session 8), nous devons permettre aux administrateurs de configurer le scraping pour chaque site découvert :

**Informations à afficher** :

- Discovery results (read-only) : collections totales, pertinentes, produits estimés, quality score
- Collections disponibles (liste avec checkboxes)
- Paramètres scraping : max produits par collection, filtres prix, options (images, disponibilité)
- Actions : Save config, Preview (10 produits), Start Full Scraping

**Problème UX** : Où placer cette interface de configuration complexe ?

**Options considérées** :

1. Modal/Dialog depuis page détail site
2. Page dédiée `/admin/sites/[id]/configure`
3. Inline dans page détail site (accordion/collapsible)
4. Sidebar/Drawer depuis page détail site

---

## Décision

**Nous créons une page dédiée `/admin/sites/[id]/configure` pour la configuration scraping.**

### Workflow

**Parcours utilisateur** :

1. **Dashboard Admin** (`/admin`)

   - Vue d'ensemble métriques
   - Quick actions
2. **Liste Sites** (`/admin/sites`)

   - Grid cards tous les sites
   - Status, quality score, last scraped
3. **Détail Site** (`/admin/sites/[id]`)

   - Informations site
   - **Discovery profile** (read-only)
   - Stats jobs/textiles
   - **Bouton "Configure Scraping Settings"** → Redirection page configure
4. **Configure Scraping** (`/admin/sites/[id]/configure`) ⭐ **NOUVELLE PAGE**

   - **Breadcrumb** : Admin > Sites > [Site Name] > Configure
   - **Section 1 : Discovery Results** (read-only)
     * Date découverte
     * Métriques (collections, produits, quality)
   - **Section 2 : Select Collections** (interactive)
     * Liste collections avec checkboxes
     * Info par collection (titre, handle, productCount)
   - **Section 3 : Scraping Parameters** (interactive)
     * Max products per collection
     * Price range (min/max)
     * Filters (only available, require images, require price)
   - **Section 4 : Actions** (buttons)
     * Save Configuration (sans scraper)
     * Preview (10 produits test)
     * Start Full Scraping (lance job complet)
5. **Jobs Monitoring** (`/admin/jobs`)

   - Liste jobs avec status
   - Stats par job

### Implémentation

**Route** : `src/app/admin/sites/[id]/configure/page.tsx`

**Structure** :

```typescript
export default async function ConfigurePage({ params }: Props) {
  const { id } = await params;
  const site = await getSiteByIdServer(id);

  if (!site?.profile) {
    return <ErrorState message="No discovery profile found" />;
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb />

      {/* Header */}
      <h1>Configure Scraping: {site.name}</h1>

      {/* Discovery Results (Read-only) */}
      <Card>
        <CardHeader>
          <CardTitle>Discovery Results</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsGrid>
            <Stat label="Total Collections" value={profile.total_collections} />
            <Stat label="Relevant Collections" value={profile.relevant_collections} />
            <Stat label="Estimated Products" value={profile.estimated_products} />
            <Stat label="Quality Score" value={`${profile.quality_metrics.overallScore}%`} />
          </StatsGrid>
        </CardContent>
      </Card>

      {/* Scraping Configuration Form */}
      <ScrapingConfigForm 
        siteId={site.id}
        profile={site.profile}
        currentConfig={site.scraping_config}
      />
    </div>
  );
}
```

**Composant Form** : `ScrapingConfigForm.tsx` (Client Component)

```typescript
'use client'

export function ScrapingConfigForm({ siteId, profile, currentConfig }: Props) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [config, setConfig] = useState<ScrapingConfig>(currentConfig || {});
  const [loading, setLoading] = useState({ save: false, preview: false, scraping: false });

  const availableCollections = (profile.collections as Collection[]) || [];

  const handleSave = async () => {
    // Save config without scraping
    const updated = await updateSiteConfig(siteId, { ...config, collections: selectedCollections });
    toast.success('Configuration saved');
  };

  const handlePreview = async () => {
    // Preview scraping (10 products)
    await triggerPreviewScraping(siteId, selectedCollections[0]);
    toast.success('Preview scraping started');
  };

  const handleStartScraping = async () => {
    // Start full scraping
    await triggerFullScraping(siteId, { ...config, collections: selectedCollections });
    toast.success('Full scraping started');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Collections to Scrape</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Collections Checkboxes */}
        {availableCollections.map(collection => (
          <Checkbox 
            key={collection.handle}
            checked={selectedCollections.includes(collection.handle)}
            onChange={() => handleToggle(collection.handle)}
            label={`${collection.title} (${collection.productCount} products)`}
          />
        ))}

        {/* Scraping Parameters */}
        <div className="space-y-4 mt-6">
          <Input 
            type="number" 
            label="Max Products per Collection"
            value={config.maxProductsPerCollection}
            onChange={(e) => setConfig({ ...config, maxProductsPerCollection: Number(e.target.value) })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Min Price (€)" value={config.filters?.priceRange?.min} />
            <Input type="number" label="Max Price (€)" value={config.filters?.priceRange?.max} />
          </div>

          <Checkbox label="Only available products" checked={config.filters?.onlyAvailable} />
          <Checkbox label="Require images" checked={config.filters?.requireImages} />
          <Checkbox label="Require price" checked={config.filters?.requirePrice} />
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button onClick={handleSave} disabled={loading.save}>
            {loading.save ? 'Saving...' : 'Save Configuration'}
          </Button>
          <Button onClick={handlePreview} disabled={loading.preview} variant="outline">
            {loading.preview ? 'Starting...' : 'Preview (10 products)'}
          </Button>
          <Button onClick={handleStartScraping} disabled={loading.scraping} variant="default">
            {loading.scraping ? 'Starting...' : 'Start Full Scraping'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Conséquences

### ✅ Positives

1. **Espace Suffisant**

   - Page complète dédiée à la configuration
   - Pas de contraintes layout
   - Scroll naturel si beaucoup de collections
2. **Workflow Linéaire Clair**

   - Discovery → Configure → Scraping
   - Chaque étape a sa page
   - Navigation breadcrumb claire
3. **Séparation Concerns**

   - Détail site = vue d'ensemble read-only
   - Configure = actions modification
   - Jobs = monitoring résultats
4. **URL Partageable**

   - `/admin/sites/[id]/configure` peut être partagée
   - Deep linking direct vers configuration
   - Bookmark possible
5. **État Préservé**

   - Configuration sauvegardée dans DB (`scraping_config`)
   - Peut quitter et revenir sans perte
   - Navigation browser back/forward fonctionne
6. **Évolutivité**

   - Facile ajouter sections (planning, webhooks, etc.)
   - Pas de limitation espace modal
   - Peut devenir formulaire multi-étapes si nécessaire

### ⚠️ Négatives / Contraintes

1. **Navigation Supplémentaire**

   - Clic "Configure" puis retour
   - Moins immédiat qu'un modal
   - **Mitigation** : Breadcrumb + bouton "Back to Site"
2. **Context Switching**

   - Quitter page détail site
   - Peut perdre contexte temporairement
   - **Mitigation** : Breadcrumb rappelle où on est
3. **Plus de Code**

   - Page + route supplémentaire
   - Vs modal inline dans même page
   - **Acceptable** : Code mieux organisé

---

## Alternatives Considérées

### Alternative 1 : Modal/Dialog

**Approche** : Bouton "Configure" ouvre modal overlay

```typescript
// Dans page détail site
<Dialog>
  <DialogTrigger>Configure Scraping</DialogTrigger>
  <DialogContent className="max-w-4xl">
    <ScrapingConfigForm {...props} />
  </DialogContent>
</Dialog>
```

**Avantages** :

- ✅ Pas de navigation, reste sur même page
- ✅ Overlay clair (focus sur config)
- ✅ Fermeture rapide (Esc)

**Inconvénients** :

- ❌ **Espace limité** (max-width contraint)
- ❌ **Perte données si fermé accidentellement**
- ❌ Scroll dans scroll (modal + liste collections)
- ❌ Mobile : Prend tout l'écran (équivalent page anyway)
- ❌ Pas de URL partageable
- ❌ Difficile ajouter sections futures

**Rejetée car** :

- Configuration trop complexe pour modal
- Risque UX frustrant (espace insuffisant)
- Pas évolutif

---

### Alternative 2 : Inline Accordion

**Approche** : Section collapsible dans page détail site

```typescript
// Dans page détail site
<Accordion>
  <AccordionItem value="configure">
    <AccordionTrigger>Configure Scraping</AccordionTrigger>
    <AccordionContent>
      <ScrapingConfigForm {...props} />
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

**Avantages** :

- ✅ Pas de navigation
- ✅ Tout visible sur une page

**Inconvénients** :

- ❌ **Page détail devient trop longue**
- ❌ Mélange read-only (infos) et édition (config)
- ❌ Pas de séparation claire concerns
- ❌ Scroll confus (où suis-je dans la page ?)
- ❌ État accordion à gérer

**Rejetée car** :

- Page détail devient fourre-tout
- UX confuse (trop d'info en un lieu)
- Difficile maintenir

---

### Alternative 3 : Sidebar/Drawer

**Approche** : Drawer slide-in depuis droite

```typescript
<Sheet>
  <SheetTrigger>Configure Scraping</SheetTrigger>
  <SheetContent side="right" className="w-[600px]">
    <ScrapingConfigForm {...props} />
  </SheetContent>
</Sheet>
```

**Avantages** :

- ✅ Contexte site visible en arrière-plan
- ✅ Animation smooth

**Inconvénients** :

- ❌ **Largeur fixe limitée** (600px max raisonnable)
- ❌ Perte données si fermé
- ❌ Mobile : équivalent page
- ❌ Pas standard pattern admin

**Rejetée car** :

- Similaire modal (espace limité)
- Pattern moins familier pour config complexe

---

### Alternative 4 : Wizard Multi-Étapes

**Approche** : Configuration en plusieurs étapes (stepper)

```typescript
// Étape 1 : Select Collections
// Étape 2 : Configure Filters
// Étape 3 : Review & Launch
```

**Avantages** :

- ✅ Décompose complexité
- ✅ Guidage clair

**Inconvénients** :

- ❌ **Overkill pour configuration actuelle**
- ❌ Plus de clics (Next, Previous)
- ❌ État multi-étapes à gérer

**Considération future** :

- Si configuration devient beaucoup plus complexe
- Si ajout scheduling, webhooks, validation rules
- Phase 2+ potentiellement

---

## Justification Décision

### Pourquoi Page Dédiée est Optimale

**1. Nature de la Tâche**

- Configuration = tâche focalisée, délibérée
- Pas une action rapide (contrairement toggle status)
- Nécessite attention et review

**2. Fréquence d'Usage**

- Configuration faite 1-2 fois par site
- Puis révisitée occasionnellement
- Pas besoin accès ultra-rapide

**3. Complexité Information**

- Discovery results + Collections + Params + Actions
- Beaucoup d'informations à afficher
- Besoin espace respirer

**4. Workflow Naturel**

- Découvrir site → Analyser profile → Configurer → Lancer
- Chaque étape mérite son espace
- Navigation breadcrumb guide utilisateur

**5. Évolutivité**

- Facile ajouter : scheduling, webhooks, advanced filters
- Peut devenir wizard si nécessaire
- Pas de refactor majeur

---

## Détails Implémentation

### Navigation Breadcrumb

**Composant** :

```typescript
import { ChevronRight } from 'lucide-react';

function Breadcrumb({ site }: { site: Site }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/admin">Admin</Link>
      <ChevronRight className="h-4 w-4" />
      <Link href="/admin/sites">Sites</Link>
      <ChevronRight className="h-4 w-4" />
      <Link href={`/admin/sites/${site.id}`}>{site.name}</Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground">Configure</span>
    </nav>
  );
}
```

---

### Bouton "Back to Site"

**Placement** : En haut à gauche de la page configure

```typescript
<Link 
  href={`/admin/sites/${siteId}`}
  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
>
  <ArrowLeft className="h-4 w-4" />
  Back to Site
</Link>
```

---

### Sauvegarde Configuration

**Server Action** :

```typescript
// src/features/admin/application/actions.ts
'use server'

export async function updateSiteConfig(
  siteId: string, 
  config: ScrapingConfig
) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('sites')
    .update({ scraping_config: config })
    .eq('id', siteId)
    .select()
    .single();

  if (error) throw new Error(`Failed to update config: ${error.message}`);
  
  revalidatePath(`/admin/sites/${siteId}`);
  revalidatePath(`/admin/sites/${siteId}/configure`);
  
  return data;
}
```

**Usage dans Form** :

```typescript
const handleSave = async () => {
  setLoading({ ...loading, save: true });
  
  try {
    await updateSiteConfig(siteId, {
      ...config,
      collections: selectedCollections
    });
  
    toast.success('Configuration saved successfully');
  } catch (error) {
    toast.error('Failed to save configuration');
  } finally {
    setLoading({ ...loading, save: false });
  }
};
```

---

### Preview vs Full Scraping

**Preview** : Teste sur 10 produits d'une collection

```typescript
export async function triggerPreviewScraping(
  siteId: string, 
  collectionHandle: string
) {
  // Lance CLI scraper avec limit=10
  const result = await fetch('/api/admin/scraping/preview', {
    method: 'POST',
    body: JSON.stringify({ siteId, collectionHandle, limit: 10 })
  });
  
  return result.json();
}
```

**Full Scraping** : Lance job complet avec config

```typescript
export async function triggerFullScraping(
  siteId: string, 
  config: ScrapingConfig
) {
  // Sauvegarde config d'abord
  await updateSiteConfig(siteId, config);
  
  // Lance job scraping
  const result = await fetch('/api/admin/scraping/start', {
    method: 'POST',
    body: JSON.stringify({ siteId, config })
  });
  
  return result.json();
}
```

---

## Validation UX

### Tests Utilisateur

**Scénario 1 : Configuration Initiale**

1. ✅ Admin clique "Configure Scraping Settings" sur page détail
2. ✅ Redirection vers page configure
3. ✅ Discovery results affichés clairement
4. ✅ Collections listées avec infos
5. ✅ Sélection collections intuitive (checkboxes)
6. ✅ Paramètres visibles et modifiables
7. ✅ Bouton "Save" sauvegarde sans scraper
8. ✅ Toast confirmation apparaît
9. ✅ Bouton "Back to Site" retourne page détail

**Scénario 2 : Preview Scraping**

1. ✅ Sélectionner 1 collection
2. ✅ Cliquer "Preview (10 products)"
3. ✅ Loading state sur bouton
4. ✅ Toast "Preview scraping started"
5. ✅ Redirection vers Jobs pour voir résultat

**Scénario 3 : Modification Config Existante**

1. ✅ Site déjà configuré (scraping_config existe)
2. ✅ Page configure charge config existante
3. ✅ Collections précédemment sélectionnées checked
4. ✅ Paramètres pré-remplis
5. ✅ Modification + Save fonctionne
6. ✅ Confirmation update

---

### Métriques UX

**Efficacité** :

- Time to configure : ~2-3 minutes (acceptable pour tâche rare)
- Clicks to launch scraping : 3 (Configure → Select → Start)

**Clarté** :

- Breadcrumb toujours visible (orientation)
- Sections bien délimitées (Discovery vs Config vs Actions)
- Labels explicites

**Erreurs** :

- Validation : au moins 1 collection sélectionnée
- Feedback : toasts success/error clairs
- Loading states : spinners sur tous boutons actions

---

## Évolutions Futures

### Phase 2 : Features Avancées

**Scheduling** :

- Section "Schedule Scraping"
- Cron expression ou presets (daily, weekly)
- Timezone selection

**Webhooks** :

- Section "Notifications"
- URL webhook quand job terminé
- Slack/Discord integration

**Advanced Filters** :

- Regex patterns pour noms produits
- Exclude keywords
- Brand whitelist/blacklist

**Validation Rules** :

- Min/max quantity
- Required fields
- Custom validators

### Potentiel Wizard

Si complexité augmente beaucoup, transformer en wizard :

**Étape 1** : Select Collections
**Étape 2** : Configure Filters
**Étape 3** : Schedule & Webhooks
**Étape 4** : Review & Launch

---

## Références

**UX Patterns** :

- [Forms Best Practices](https://www.nngroup.com/articles/web-form-design/)
- [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Breadcrumb Navigation](https://www.nngroup.com/articles/breadcrumbs/)

**Exemples Inspirants** :

- GitHub Actions Workflow Editor (page dédiée)
- Vercel Deployment Settings (page dédiée)
- Linear Issue Detail → Edit (inline mais simple)

**Projet** :

- ADR-013 : Admin Service Role Key
- ADR-014 : TypeScript Types Generation
- SPEC_MODULE_ADMIN.md

---

## Décision Validée Par

**Auteur** : Thomas (Founder & Developer)

**Date** : 2 Janvier 2026

**Session** : 8 - Module Admin Complet

**Status** : ✅ Implémenté et fonctionnel

**Page** : `/admin/sites/[id]/configure`

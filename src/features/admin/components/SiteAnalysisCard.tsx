'use client';

import { 
  TrendingUp, 
  Package, 
  Tag, 
  Scale, 
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  BarChart3
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ProductTypeFrequency {
  type: string;
  count: number;
  percent: number;
}

interface TagFrequency {
  tag: string;
  count: number;
  percent: number;
}

interface PriceStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  currency: string;
}

interface WeightStats {
  hasWeight: number;
  hasWeightPercent: number;
  minGrams: number;
  maxGrams: number;
  avgGrams: number;
}

interface PriceDistribution {
  under10: number;
  from10to30: number;
  from30to50: number;
  from50to100: number;
  over100: number;
}

interface DeadstockScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    hasDeadstockKeywords: boolean;
    hasFabricTypes: boolean;
    priceRangeOk: boolean;
    availabilityGood: boolean;
    dataQualityGood: boolean;
    hasWeightData: boolean;
  };
  recommendations: string[];
}

interface GlobalAnalysis {
  allProductTypes: ProductTypeFrequency[];
  allTags: TagFrequency[];
  allVendors: { vendor: string; count: number; percent: number }[];
  priceDistribution: PriceDistribution;
  priceStats: PriceStats | null;
  weightStats: WeightStats | null;
  availabilityRate: number;
  deadstockScore: DeadstockScore;
}

interface QualityMetrics {
  hasImages: number;
  hasPrice: number;
  hasTags: number;
  hasDescription: number;
  hasWeight: number;
  hasProductType: number;
  overallScore: number;
}

interface SiteAnalysisCardProps {
  siteName: string;
  totalCollections: number;
  relevantCollections: number;
  estimatedProducts: number;
  estimatedAvailable: number;
  qualityMetrics: QualityMetrics;
  globalAnalysis: GlobalAnalysis | null;
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function GradeBadge({ grade }: { grade: string }) {
  const gradeColors: Record<string, string> = {
    'A': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'B': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'C': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'D': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'F': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-sm font-bold ${gradeColors[grade] || gradeColors['F']}`}>
      {grade}
    </span>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{Math.round(score * 100)}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full ${getBarColor(score * 100)} transition-all duration-500`}
          style={{ width: `${score * 100}%` }}
        />
      </div>
    </div>
  );
}

function FactorCheck({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {checked ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
      )}
      <span className={checked ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  );
}

function PriceDistributionBar({ distribution }: { distribution: PriceDistribution }) {
  const total = distribution.under10 + distribution.from10to30 + distribution.from30to50 + distribution.from50to100 + distribution.over100;
  
  if (total === 0) return <p className="text-sm text-muted-foreground">No price data</p>;

  const segments = [
    { key: 'under10', label: '<10€', value: distribution.under10, color: 'bg-green-500' },
    { key: 'from10to30', label: '10-30€', value: distribution.from10to30, color: 'bg-blue-500' },
    { key: 'from30to50', label: '30-50€', value: distribution.from30to50, color: 'bg-yellow-500' },
    { key: 'from50to100', label: '50-100€', value: distribution.from50to100, color: 'bg-orange-500' },
    { key: 'over100', label: '>100€', value: distribution.over100, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        {segments.map(seg => {
          const percent = (seg.value / total) * 100;
          if (percent === 0) return null;
          return (
            <div 
              key={seg.key}
              className={`${seg.color} transition-all`}
              style={{ width: `${percent}%` }}
              title={`${seg.label}: ${seg.value} (${Math.round(percent)}%)`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map(seg => (
          <span key={seg.key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${seg.color}`} />
            {seg.label}: {seg.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SiteAnalysisCard({
  siteName,
  totalCollections,
  relevantCollections,
  estimatedProducts,
  estimatedAvailable,
  qualityMetrics,
  globalAnalysis,
}: SiteAnalysisCardProps) {
  const availabilityPercent = estimatedProducts > 0 
    ? Math.round((estimatedAvailable / estimatedProducts) * 100)
    : 0;

  // Handle missing global analysis
  if (!globalAnalysis) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <AlertCircle className="w-5 h-5" />
          <span>No analysis data available. Run Discovery to analyze the site.</span>
        </div>
      </div>
    );
  }

  const { deadstockScore, priceStats, weightStats, priceDistribution, allProductTypes, allTags } = globalAnalysis;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Site Analysis</h3>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-2xl font-bold">{deadstockScore.score}</span>
            <span className="text-muted-foreground">/100</span>
            <GradeBadge grade={deadstockScore.grade} />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-primary">{totalCollections}</div>
            <div className="text-xs text-muted-foreground">Collections</div>
            <div className="text-xs text-green-600">{relevantCollections} relevant</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{estimatedProducts.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Products</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-green-600">{estimatedAvailable.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Available</div>
            <div className="text-xs text-green-600">{availabilityPercent}%</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{Math.round(qualityMetrics.overallScore * 100)}%</div>
            <div className="text-xs text-muted-foreground">Data Quality</div>
          </div>
        </div>

        {/* Deadstock Score Factors */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Deadstock Score Factors
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <FactorCheck 
              checked={deadstockScore.factors.hasDeadstockKeywords} 
              label="Deadstock keywords" 
            />
            <FactorCheck 
              checked={deadstockScore.factors.hasFabricTypes} 
              label="Fabric types detected" 
            />
            <FactorCheck 
              checked={deadstockScore.factors.priceRangeOk} 
              label="Price range OK" 
            />
            <FactorCheck 
              checked={deadstockScore.factors.availabilityGood} 
              label="Good availability" 
            />
            <FactorCheck 
              checked={deadstockScore.factors.dataQualityGood} 
              label="Data quality good" 
            />
            <FactorCheck 
              checked={deadstockScore.factors.hasWeightData} 
              label="Weight data available" 
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Product Types */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Product Types
              </h4>
              {allProductTypes.length > 0 ? (
                <div className="space-y-1">
                  {allProductTypes.slice(0, 5).map((pt, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-45" title={pt.type}>
                        {pt.type || '(empty)'}
                      </span>
                      <span className="font-medium">{pt.percent}%</span>
                    </div>
                  ))}
                  {allProductTypes.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{allProductTypes.length - 5} more...</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No product types detected</p>
              )}
            </div>

            {/* Top Tags */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Top Tags
              </h4>
              {allTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {allTags.slice(0, 10).map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground"
                      title={`${tag.count} products (${tag.percent}%)`}
                    >
                      {tag.tag}
                    </span>
                  ))}
                  {allTags.length > 10 && (
                    <span className="px-2 py-0.5 text-xs text-muted-foreground">
                      +{allTags.length - 10} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tags detected</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Price Stats */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Price Range
              </h4>
              {priceStats ? (
                <div className="space-y-2">
                  <div className="flex gap-4 text-sm">
                    <span>
                      <span className="text-muted-foreground">Min:</span>{' '}
                      <span className="font-medium">{priceStats.min}€</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Max:</span>{' '}
                      <span className="font-medium">{priceStats.max}€</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Avg:</span>{' '}
                      <span className="font-medium">{priceStats.avg}€</span>
                    </span>
                  </div>
                  <PriceDistributionBar distribution={priceDistribution} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No price data</p>
              )}
            </div>

            {/* Weight Stats */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Weight / Grammage
              </h4>
              {weightStats ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${weightStats.hasWeightPercent}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-16 text-right">
                      {weightStats.hasWeightPercent}% have data
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span>
                      <span className="text-muted-foreground">Min:</span>{' '}
                      <span className="font-medium">{weightStats.minGrams}g</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Max:</span>{' '}
                      <span className="font-medium">{weightStats.maxGrams}g</span>
                    </span>
                    <span>
                      <span className="text-muted-foreground">Avg:</span>{' '}
                      <span className="font-medium">{weightStats.avgGrams}g</span>
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No weight data available</p>
              )}
            </div>

            {/* Data Quality */}
            <div className="space-y-2">
              <h4 className="font-medium">Data Quality</h4>
              <div className="space-y-2">
                <ScoreBar score={qualityMetrics.hasImages} label="Images" />
                <ScoreBar score={qualityMetrics.hasPrice} label="Price" />
                <ScoreBar score={qualityMetrics.hasTags} label="Tags" />
                <ScoreBar score={qualityMetrics.hasWeight} label="Weight" />
                <ScoreBar score={qualityMetrics.hasProductType} label="Product Type" />
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {deadstockScore.recommendations.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {deadstockScore.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// src/features/admin/components/AddSiteForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSite } from '@/features/admin/application/actions';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AddSiteForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    platform_type: 'shopify' as 'shopify' | 'woocommerce' | 'custom',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.url) {
      toast.error('Name and URL are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSite(formData);
      
      if (result.success) {
        toast.success(result.message || 'Site created successfully!');
        router.push('/admin/sites');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to create site');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Site Name *</Label>
        <Input
          id="name"
          placeholder="e.g., My Little Coupon"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      {/* URL */}
      <div className="space-y-2">
        <Label htmlFor="url">URL *</Label>
        <Input
          id="url"
          type="url"
          placeholder="e.g., mylittlecoupon.fr"
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">
          Without https:// or www. (e.g., example.com)
        </p>
      </div>

      {/* Platform Type */}
      <div className="space-y-2">
        <Label htmlFor="platform_type">Platform Type</Label>
        <Select
          value={formData.platform_type}
          onValueChange={(value: 'shopify' | 'woocommerce' | 'custom') => 
            setFormData({ ...formData, platform_type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shopify">Shopify</SelectItem>
            <SelectItem value="woocommerce">WooCommerce</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value: 'high' | 'medium' | 'low') => 
            setFormData({ ...formData, priority: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Additional information about this site..."
          rows={4}
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Site'
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push('/admin/sites')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

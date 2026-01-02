// src/app/admin/sites/new/page.tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { AddSiteForm } from '@/features/admin/components/AddSiteForm';

export default function NewSitePage() {
  return (
    <div className="container mx-auto p-6 space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/sites">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sites
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Site</h1>
          <p className="text-muted-foreground">
            Configure a new scraping source
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
          <CardDescription>
            Enter the details of the site you want to scrape
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddSiteForm />
        </CardContent>
      </Card>
    </div>
  );
}

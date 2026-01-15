const UNSPLASH_API = 'https://api.unsplash.com';

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;  // 1080px - pour extraction
    small: string;    // 400px - pour preview
    thumb: string;    // 200px - pour grille
  };
  alt_description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
    download_location: string;
  };
  color: string;
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export async function searchUnsplashPhotos(
  query: string,
  page: number = 1,
  perPage: number = 12
): Promise<UnsplashSearchResult> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error('Unsplash API key not configured');

  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
  });

  const response = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });

  if (!response.ok) throw new Error('Unsplash API error');
  return response.json();
}

// Obligatoire selon guidelines Unsplash
export async function trackDownload(downloadLocation: string): Promise<void> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (!accessKey) return;

  await fetch(downloadLocation, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
}

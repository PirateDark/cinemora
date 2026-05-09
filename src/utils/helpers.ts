export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getImageUrl(path: string | null | undefined, size = 'w500'): string {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTitle(media: { title?: string; name?: string }): string {
  return media.title || media.name || 'بدون عنوان';
}
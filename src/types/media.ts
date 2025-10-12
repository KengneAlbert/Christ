export type MediaType = 'video' | 'document' | 'audio' | 'image';

export interface MediaImage {
  id: string;
  media_id: string;
  image_url: string;
  thumbnail_url: string | null;
  is_cover: boolean;
  position: number | null;
  created_at: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  file_url: string | null;
  youtube_id: string | null;
  file_name: string | null;
  file_size: number | null;
  duration: string | null;
  pages: number | null;
  created_at: string;
  updated_at: string;
  is_published: boolean;
  views_count: number;
  downloads_count: number;
  created_by?: string;
  // Optional gallery images loaded alongside a media item
  images?: MediaImage[];
}

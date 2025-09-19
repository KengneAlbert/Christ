CREATE OR REPLACE FUNCTION get_media_statistics()
RETURNS TABLE(
    total_media BIGINT,
    total_views BIGINT,
    total_downloads BIGINT,
    total_published BIGINT,
    total_videos BIGINT,
    total_audios BIGINT,
    total_documents BIGINT,
    total_images BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_media,
        COALESCE(SUM(views_count), 0) AS total_views,
        COALESCE(SUM(downloads_count), 0) AS total_downloads,
        COUNT(*) FILTER (WHERE is_published = true) AS total_published,
        COUNT(*) FILTER (WHERE type = 'video') AS total_videos,
        COUNT(*) FILTER (WHERE type = 'audio') AS total_audios,
        COUNT(*) FILTER (WHERE type = 'document') AS total_documents,
        COUNT(*) FILTER (WHERE type = 'image') AS total_images
    FROM
        public.media_items;
END;
$$;

-- Grant execute permission to the authenticated role
GRANT EXECUTE ON FUNCTION public.get_media_statistics() TO authenticated;
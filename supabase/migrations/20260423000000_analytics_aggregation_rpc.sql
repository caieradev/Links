-- Aggregate analytics in Postgres instead of fetching all raw rows to the app.
-- Fixes the 1000-row default limit bug that caused events after ~March 31 to disappear.

CREATE OR REPLACE FUNCTION get_analytics_summary(
  p_profile_id UUID,
  p_start_date TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'events_by_day', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          created_at::date AS date,
          event_type,
          count(*) AS count
        FROM analytics_events
        WHERE profile_id = p_profile_id
          AND created_at >= p_start_date
        GROUP BY created_at::date, event_type
        ORDER BY date
      ) t
    ),
    'top_links', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          ae.link_id AS id,
          l.title,
          l.url,
          count(*) AS clicks
        FROM analytics_events ae
        LEFT JOIN links l ON l.id = ae.link_id
        WHERE ae.profile_id = p_profile_id
          AND ae.created_at >= p_start_date
          AND ae.event_type = 'link_click'
          AND ae.link_id IS NOT NULL
        GROUP BY ae.link_id, l.title, l.url
        ORDER BY clicks DESC
        LIMIT 10
      ) t
    ),
    'device_stats', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          coalesce(device_type, 'unknown') AS type,
          count(*) AS count
        FROM analytics_events
        WHERE profile_id = p_profile_id
          AND created_at >= p_start_date
        GROUP BY device_type
        ORDER BY count DESC
      ) t
    ),
    'browser_stats', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          coalesce(browser, 'unknown') AS browser,
          count(*) AS count
        FROM analytics_events
        WHERE profile_id = p_profile_id
          AND created_at >= p_start_date
        GROUP BY browser
        ORDER BY count DESC
        LIMIT 5
      ) t
    ),
    'referrer_stats', (
      SELECT coalesce(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT
          split_part(split_part(referrer, '://', 2), '/', 1) AS referrer,
          count(*) AS count
        FROM analytics_events
        WHERE profile_id = p_profile_id
          AND created_at >= p_start_date
          AND referrer IS NOT NULL
          AND referrer != ''
        GROUP BY split_part(split_part(referrer, '://', 2), '/', 1)
        ORDER BY count DESC
        LIMIT 10
      ) t
    )
  ) INTO result;

  RETURN result;
END;
$$;

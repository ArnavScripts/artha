-- Enable the pg_cron extension if not already enabled
create extension if not exists pg_cron;

-- Schedule the market ticker bot to run every minute
select
  cron.schedule(
    'market-ticker-every-minute', -- name of the cron job
    '* * * * *',                  -- every minute
    $$
    select
      net.http_post(
        url:='https://project-ref.supabase.co/functions/v1/market-ticker-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body:='{}'::jsonb
      ) as request_id;
    $$
  );

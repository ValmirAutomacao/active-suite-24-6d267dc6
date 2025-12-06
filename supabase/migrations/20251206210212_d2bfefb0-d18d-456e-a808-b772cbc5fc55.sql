-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule daily payment reminder at 8:00 AM (UTC)
SELECT cron.schedule(
  'send-payment-reminders-daily',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://gnvudzdulhwunrjfoyrx.supabase.co/functions/v1/send-payment-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudnVkemR1bGh3dW5yamZveXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzU2OTIsImV4cCI6MjA3NTI1MTY5Mn0.OiK9GYohJIiqPeEW4_r4jUoSm8eAT7A4c1OKAC7osFs"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
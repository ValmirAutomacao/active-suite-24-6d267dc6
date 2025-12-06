-- Remove the old cron job
SELECT cron.unschedule('send-payment-reminders-daily');

-- Schedule with correct time: 8h Brasília = 11h UTC
SELECT cron.schedule(
  'send-payment-reminders-daily',
  '0 11 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://gnvudzdulhwunrjfoyrx.supabase.co/functions/v1/send-payment-reminders',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudnVkemR1bGh3dW5yamZveXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzU2OTIsImV4cCI6MjA3NTI1MTY5Mn0.OiK9GYohJIiqPeEW4_r4jUoSm8eAT7A4c1OKAC7osFs"}'::jsonb,
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
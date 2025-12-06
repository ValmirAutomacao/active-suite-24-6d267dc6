-- Function to generate payment when enrollment is created
CREATE OR REPLACE FUNCTION public.generate_enrollment_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_student_name TEXT;
  v_sport_name TEXT;
  v_due_date DATE;
  v_month_name TEXT;
  v_payment_day INTEGER;
BEGIN
  -- Only generate payment for active enrollments
  IF NEW.status != 'active' THEN
    RETURN NEW;
  END IF;

  -- Get student name
  SELECT name INTO v_student_name
  FROM public.students
  WHERE id = NEW.student_id;

  -- Get sport/modality name
  SELECT name INTO v_sport_name
  FROM public.sports
  WHERE id = NEW.modality_id;

  -- Get payment due day (from enrollment or default to 5)
  v_payment_day := COALESCE(NEW.payment_due_date, 5);

  -- Calculate due date for current month
  -- If today is past the due day, generate for next month
  IF EXTRACT(DAY FROM CURRENT_DATE) > v_payment_day THEN
    v_due_date := DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + (v_payment_day - 1) * INTERVAL '1 day';
  ELSE
    v_due_date := DATE_TRUNC('month', CURRENT_DATE) + (v_payment_day - 1) * INTERVAL '1 day';
  END IF;

  -- Get month name in Portuguese
  v_month_name := TO_CHAR(v_due_date, 'TMMonth') || '/' || TO_CHAR(v_due_date, 'YYYY');

  -- Check if payment already exists for this student/month/sport
  IF EXISTS (
    SELECT 1 FROM public.payments
    WHERE student_id = NEW.student_id
      AND month = v_month_name
      AND sport = v_sport_name
  ) THEN
    RETURN NEW;
  END IF;

  -- Create payment record
  INSERT INTO public.payments (
    student_id,
    student_name,
    amount,
    due_date,
    month,
    sport,
    status
  ) VALUES (
    NEW.student_id,
    v_student_name,
    COALESCE(NEW.monthly_fee, 0),
    v_due_date,
    v_month_name,
    COALESCE(v_sport_name, 'Modalidade'),
    'pending'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for new enrollments
DROP TRIGGER IF EXISTS on_enrollment_created ON public.enrollments;
CREATE TRIGGER on_enrollment_created
  AFTER INSERT ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_enrollment_payment();

-- Also trigger when enrollment status changes to active
DROP TRIGGER IF EXISTS on_enrollment_activated ON public.enrollments;
CREATE TRIGGER on_enrollment_activated
  AFTER UPDATE OF status ON public.enrollments
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM 'active' AND NEW.status = 'active')
  EXECUTE FUNCTION public.generate_enrollment_payment();
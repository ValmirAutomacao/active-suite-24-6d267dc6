import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PAYMENTS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get all active enrollments
    const { data: enrollments, error: enrollmentsError } = await supabaseClient
      .from('enrollments')
      .select(`
        id,
        student_id,
        modality_id,
        monthly_fee,
        payment_due_date
      `)
      .eq('status', 'active');

    if (enrollmentsError) {
      throw new Error(`Error fetching enrollments: ${enrollmentsError.message}`);
    }

    logStep("Active enrollments found", { count: enrollments?.length || 0 });

    if (!enrollments || enrollments.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No active enrollments found",
        payments_created: 0
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get all students for names
    const studentIds = [...new Set(enrollments.map(e => e.student_id))];
    const { data: students, error: studentsError } = await supabaseClient
      .from('students')
      .select('id, name')
      .in('id', studentIds);

    if (studentsError) {
      throw new Error(`Error fetching students: ${studentsError.message}`);
    }

    const studentMap = new Map(students?.map(s => [s.id, s.name]) || []);

    // Get all sports for names
    const modalityIds = [...new Set(enrollments.map(e => e.modality_id).filter(Boolean))];
    const { data: sports, error: sportsError } = await supabaseClient
      .from('sports')
      .select('id, name')
      .in('id', modalityIds);

    if (sportsError) {
      throw new Error(`Error fetching sports: ${sportsError.message}`);
    }

    const sportMap = new Map(sports?.map(s => [s.id, s.name]) || []);

    // Calculate next month's due date
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Month name in Portuguese
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const monthName = `${monthNames[nextMonth.getMonth()]}/${nextMonth.getFullYear()}`;

    logStep("Generating payments for month", { monthName });

    // Get existing payments for next month to avoid duplicates
    const { data: existingPayments, error: existingError } = await supabaseClient
      .from('payments')
      .select('student_id, sport')
      .eq('month', monthName);

    if (existingError) {
      throw new Error(`Error fetching existing payments: ${existingError.message}`);
    }

    const existingSet = new Set(
      existingPayments?.map(p => `${p.student_id}-${p.sport}`) || []
    );

    let paymentsCreated = 0;
    const errors: string[] = [];

    for (const enrollment of enrollments) {
      const studentName = studentMap.get(enrollment.student_id) || 'Aluno';
      const sportName = sportMap.get(enrollment.modality_id) || 'Modalidade';
      const paymentDay = enrollment.payment_due_date || 5;

      // Check if payment already exists
      const key = `${enrollment.student_id}-${sportName}`;
      if (existingSet.has(key)) {
        logStep("Payment already exists, skipping", { studentName, sportName, monthName });
        continue;
      }

      // Calculate due date
      const dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), paymentDay);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      try {
        const { error: insertError } = await supabaseClient
          .from('payments')
          .insert({
            student_id: enrollment.student_id,
            student_name: studentName,
            amount: enrollment.monthly_fee || 0,
            due_date: dueDateStr,
            month: monthName,
            sport: sportName,
            status: 'pending'
          });

        if (insertError) {
          errors.push(`Error for ${studentName}: ${insertError.message}`);
          logStep("Insert error", { studentName, error: insertError.message });
        } else {
          paymentsCreated++;
          logStep("Payment created", { studentName, sportName, amount: enrollment.monthly_fee });
        }
      } catch (err: any) {
        errors.push(`Error for ${studentName}: ${err.message}`);
      }
    }

    logStep("Function completed", { paymentsCreated, errors: errors.length });

    return new Response(JSON.stringify({
      success: true,
      month: monthName,
      payments_created: paymentsCreated,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

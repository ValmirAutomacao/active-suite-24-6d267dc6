import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-REMINDER] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendKey);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate the target date (5 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    logStep("Looking for payments due on", { targetDate: targetDateStr });

    // Get pending payments due in 5 days
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select(`
        id,
        student_name,
        student_id,
        amount,
        due_date,
        month,
        sport
      `)
      .eq('status', 'pending')
      .eq('due_date', targetDateStr);

    if (paymentsError) {
      throw new Error(`Error fetching payments: ${paymentsError.message}`);
    }

    logStep("Payments found", { count: payments?.length || 0 });

    if (!payments || payments.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No payments due in 5 days",
        reminders_sent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get student guardian emails
    const studentIds = payments.map(p => p.student_id);
    const { data: students, error: studentsError } = await supabaseClient
      .from('students')
      .select('id, guardian')
      .in('id', studentIds);

    if (studentsError) {
      throw new Error(`Error fetching students: ${studentsError.message}`);
    }

    // Create a map of student_id to guardian email
    const studentGuardianMap = new Map();
    students?.forEach(s => {
      const guardianEmail = s.guardian?.email;
      if (guardianEmail) {
        studentGuardianMap.set(s.id, guardianEmail);
      }
    });

    let remindersSent = 0;
    const errors: string[] = [];

    // Send reminder emails
    for (const payment of payments) {
      const guardianEmail = studentGuardianMap.get(payment.student_id);
      
      if (!guardianEmail) {
        logStep("No guardian email for student", { studentId: payment.student_id });
        continue;
      }

      const formattedAmount = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(payment.amount);

      const formattedDueDate = new Date(payment.due_date).toLocaleDateString('pt-BR');

      try {
        const emailResponse = await resend.emails.send({
          from: "Bayer Academy <onboarding@resend.dev>",
          to: [guardianEmail],
          subject: `Lembrete: Mensalidade ${payment.month} vence em 5 dias`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1a365d;">Bayer Academy</h1>
              <h2 style="color: #2d3748;">Lembrete de Pagamento</h2>
              
              <p>Olá!</p>
              
              <p>Este é um lembrete de que a mensalidade do(a) <strong>${payment.student_name}</strong> está próxima do vencimento.</p>
              
              <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Modalidade:</strong> ${payment.sport}</p>
                <p><strong>Referência:</strong> ${payment.month}</p>
                <p><strong>Valor:</strong> ${formattedAmount}</p>
                <p><strong>Vencimento:</strong> ${formattedDueDate}</p>
              </div>
              
              <p>Para evitar multas e juros, realize o pagamento até a data de vencimento.</p>
              
              <p>Acesse o aplicativo para efetuar o pagamento online.</p>
              
              <p style="color: #718096; font-size: 12px; margin-top: 40px;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
            </div>
          `,
        });

        logStep("Email sent successfully", { 
          paymentId: payment.id, 
          to: guardianEmail,
          response: emailResponse 
        });
        remindersSent++;
      } catch (emailError: any) {
        const errorMsg = `Failed to send to ${guardianEmail}: ${emailError.message}`;
        logStep("Email send failed", { error: errorMsg });
        errors.push(errorMsg);
      }
    }

    logStep("Function completed", { remindersSent, errors: errors.length });

    return new Response(JSON.stringify({ 
      success: true, 
      reminders_sent: remindersSent,
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

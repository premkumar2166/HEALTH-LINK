import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/jwt';
import { Role } from '@/types/auth';

// In a real system, you'd check process.env.OPENAI_API_KEY
const IS_PROVIDER_CONFIGURED = false; 

export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const payload = await decrypt(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { messages, contextData } = await request.json();
    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const userRole = payload.role as Role;

    if (!IS_PROVIDER_CONFIGURED) {
      // Mock response simulating a bounded AI based on role
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      let aiResponse = '';
      const lowerMsg = lastUserMessage.toLowerCase();

      // Rule 1: No diagnosing or prescribing
      if (
        lowerMsg.includes('diagnose') || 
        lowerMsg.includes('prescription') || 
        lowerMsg.includes('what is wrong with me') ||
        lowerMsg.includes('prescribe') ||
        lowerMsg.includes('symptoms')
      ) {
        aiResponse = "I am an AI assistant and cannot diagnose conditions, prescribe medication, or provide clinical certainty. Please consult your physician for medical advice.";
      } 
      else if (userRole === Role.PATIENT) {
        if (lowerMsg.includes('navigate') || lowerMsg.includes('where')) {
          aiResponse = "You can find your test results under the 'Documents' tab, and send direct messages to your doctor via the 'Messages' section.";
        } else if (lowerMsg.includes('question') || lowerMsg.includes('prepare')) {
          aiResponse = "When preparing for your visit, it's helpful to write down your current symptoms, any new medications you're taking, and specifically ask your doctor about your recent lab results.";
        } else {
          aiResponse = "I am your HEALTHLINK Patient Assistant. I can help explain healthcare terminology, guide you through the portal, or help prepare questions for your doctor.";
        }
      } 
      else if (userRole === Role.DOCTOR) {
        if (lowerMsg.includes('summarize')) {
          aiResponse = "Based on the authorized context, the patient has a history of Type 2 Diabetes, is currently taking Metformin, and their last A1C was 6.8%. (Note: This is an AI summary, please review clinical notes for accuracy).";
        } else if (lowerMsg.includes('draft')) {
          aiResponse = "Here is a draft response: 'Hello, your lab results are stable. Please continue your current medication and we will review everything at your next appointment.'";
        } else {
          aiResponse = "I am your HEALTHLINK Clinical Assistant. I can help summarize patient timelines, assist with documentation, or retrieve information from authorized records. I do not make clinical decisions.";
        }
      } 
      else if (userRole === Role.HOSPITAL_ADMIN || userRole === Role.HOSPITAL_STAFF) {
        if (lowerMsg.includes('report') || lowerMsg.includes('trend')) {
          aiResponse = "Based on current hospital data, bed occupancy is at 85% in Cardiology and 92% in ICU. Admissions have increased by 5% this week.";
        } else {
          aiResponse = "I am your HEALTHLINK Operational Assistant. I can help query hospital analytics, generate operational summaries, or check inventory trends.";
        }
      }

      return NextResponse.json({ 
        message: aiResponse, 
        providerConfigured: IS_PROVIDER_CONFIGURED 
      });
    } else {
      // Real LLM integration would go here (e.g., OpenAI SDK)
      // Never send PHI without explicit config checks
      return NextResponse.json({ 
        message: "AI Provider is configured, but implementation is pending.",
        providerConfigured: true
      });
    }

  } catch (e) {
    return NextResponse.json({ error: 'Failed to process AI request' }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizePost(postText) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  const prompt = `You are an expert educational content analyzer specializing in academic announcements and institutional communications.

Your task is to provide a comprehensive yet concise summary of the following announcement. Structure your summary as follows:

**Main Purpose**: Start with one clear sentence stating the primary objective or topic of the announcement.

**Key Points**: Present the most important information in 3-5 well-structured bullet points, focusing on:
- Critical details (dates, deadlines, requirements)
- Action items or what students/staff need to do
- Important conditions, eligibility, or restrictions
- Benefits or consequences

**Target Audience**: If mentioned or implied, note who this announcement is relevant to.

**Urgency**: If there are time-sensitive elements, highlight them clearly.

Guidelines:
- Be clear, accurate, and objective
- Preserve all important dates, numbers, and specific requirements
- Use professional academic tone
- Avoid unnecessary elaboration
- Ensure the summary is actionable and informative

Announcement Content:
${postText}

Provide the summary in a clean, well-formatted manner without using markdown headers (avoid using # or **).`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return response;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Strip HTML tags from content for better summarization
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    // Generate summary using Google Generative AI
    const summary = await summarizePost(plainText);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarize endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

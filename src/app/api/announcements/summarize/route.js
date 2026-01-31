import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function summarizePost(postText) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash', // fast & cheap
  });

  const prompt = `
  Summarize the following post in 3–4 concise bullet points:

  ${postText}
  `;

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

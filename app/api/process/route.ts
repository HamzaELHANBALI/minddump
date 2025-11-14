import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are a helpful AI assistant that organizes people's thoughts into clear categories. 

A user has just done a "brain dump" - they spoke for a few minutes about whatever was on their mind after a long workday. Your job is to analyze their transcript and organize it into these 4 categories:

1. **Actions Needed**: Things they mentioned that require action or follow-up (tasks, emails to send, meetings to schedule, etc.)
2. **Decisions Pending**: Decisions they're struggling with or need to make
3. **Worries to Release**: Anxieties, concerns, or things they're stressed about that they should acknowledge and let go
4. **Wins to Celebrate**: Positive things, accomplishments, or things they're grateful for

Return ONLY a valid JSON object in this exact format:
{
  "categories": {
    "actions": ["action item 1", "action item 2"],
    "decisions": ["decision 1", "decision 2"],
    "worries": ["worry 1", "worry 2"],
    "wins": ["win 1", "win 2"]
  }
}

Guidelines:
- Be empathetic and understanding
- Extract the actual meaning, not just literal words
- If a category has no items, use an empty array
- Keep items concise but meaningful (1-2 sentences max)
- For actions, be specific about what needs to be done
- For worries, acknowledge them but frame them in a way that helps release them
- For wins, celebrate even small victories

User's transcript:
${transcript}

Return only the JSON, no other text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency, can upgrade to gpt-4o if needed
      messages: [
        {
          role: 'system',
          content: 'You are a thoughtful assistant that helps people organize their thoughts. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(responseText);

    // Validate structure
    if (!parsed.categories || typeof parsed.categories !== 'object') {
      throw new Error('Invalid response structure');
    }

    // Ensure all categories exist and are arrays
    const categories = {
      actions: Array.isArray(parsed.categories.actions) ? parsed.categories.actions : [],
      decisions: Array.isArray(parsed.categories.decisions) ? parsed.categories.decisions : [],
      worries: Array.isArray(parsed.categories.worries) ? parsed.categories.worries : [],
      wins: Array.isArray(parsed.categories.wins) ? parsed.categories.wins : [],
    };

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error processing thoughts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process thoughts' },
      { status: 500 }
    );
  }
}


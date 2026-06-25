import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, SessionSummary } from './db';

const THERAPIST_SYSTEM_INSTRUCTION = `
You are a kind, empathetic, and professional AI Therapist named "Aura". 
You use principles of Cognitive Behavioral Therapy (CBT), Mindfulness, and compassionate active listening. 
Your goal is to provide a safe, non-judgmental space for the user to explore their thoughts, feelings, and emotions.

Guidelines:
1. Be warm, validating, and supportive. Use active listening to reflect back what the user is saying.
2. Ask open-ended, gentle questions that encourage deeper reflection.
3. Keep responses relatively concise (1-3 paragraphs) to fit a real-time chat interface.
4. Do NOT diagnose clinical conditions or suggest specific medications.
5. If the user displays signs of self-harm, suicide, or crisis, express deep care, suggest they connect with a professional or trusted contact immediately, and refer them to emergency resources. Keep your response short and crisis-focused.
`;

const SUMMARY_SYSTEM_INSTRUCTION = `
You are an expert clinical summarizer. Your task is to review a chat transcript between a user and an AI Therapist and output a JSON object summarizing the session.

You must return a raw JSON object matching the following structure:
{
  "reflection": "A 2-3 sentence overview of the main topics, concerns, or breakthroughs the user explored.",
  "trajectory": "A 1-2 sentence description of how the user's emotional state or mood evolved during the session (e.g., from anxious to reflective).",
  "copingSteps": [
    "Step 1: Specific, actionable, and personalized coping strategy tailored to their session discussion.",
    "Step 2: Another personalized strategy.",
    "Step 3: A third personalized strategy."
  ],
  "exercise": "A detailed step-by-step mental or physical exercise (e.g., a specific box breathing pattern, cognitive reframing prompt, or a grounding technique) that matches their needs."
}

Do not include any markdown formatting or extra text outside the JSON. Return only the valid JSON structure.
`;

// Helper to get Gemini Client
function getGeminiClient(clientApiKey?: string) {
  const key = clientApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

// Empathy triggers for fallback simulated therapist
const MOCK_TRIGGERS = [
  {
    keywords: ['anxiety', 'anxious', 'panic', 'nervous', 'worry', 'worried', 'stress', 'stressed'],
    response: "I hear how much weight you're carrying right now. Anxiety can feel so loud and physical in the body. When you feel that tightening in your chest or your mind racing, it's your body trying to protect you, even if it feels overwhelming. Let's take a slow breath together. Would you like to share what specific thoughts seem to be driving this worry today?"
  },
  {
    keywords: ['sad', 'depressed', 'crying', 'lonely', 'empty', 'hurting', 'heavy', 'grief', 'grieving'],
    response: "Thank you for being so honest about how heavy things feel right now. It is completely okay to feel sad, lonely, or empty. You don't have to force yourself to 'look on the bright side' here. Sometimes just sitting with these feelings and letting them exist is the first step. What do you think this sadness is trying to tell you, or when did you first notice it settling in?"
  },
  {
    keywords: ['angry', 'frustrated', 'mad', 'furious', 'annoyed', 'hate', 'rage'],
    response: "It sounds like there is a lot of valid frustration and anger built up inside you. Anger is often a secondary emotion—like a protective shield covering up deeper hurt, fear, or boundary violations. It's completely valid to feel this way. What feels like the main trigger for this frustration right now? Let's unpack it together."
  },
  {
    keywords: ['tired', 'exhausted', 'burnout', 'burnt out', 'give up', 'overwhelmed', 'cannot cope'],
    response: "It sounds like you are running on empty, and I want to acknowledge how exhausting that is. When we are overwhelmed, even tiny tasks feel like mountains. It is okay to take a pause and just breathe. You don't have to figure everything out right this second. If you could set aside just one responsibility or expectation for today, what would give you the most relief?"
  },
  {
    keywords: ['help', 'crisis', 'suicide', 'die', 'kill myself', 'hurt myself'],
    response: "I want you to know that you are not alone, and I care deeply about your safety. Because I am an AI, I cannot provide the emergency intervention you deserve right now. Please consider reaching out to a professional or calling/texting 988 (in the US/Canada) immediately. There are people who want to listen and support you. Can we talk about a trusted friend, family member, or professional you can reach out to today?"
  }
];

// Fallback response generator
function getMockTherapistResponse(messages: ChatMessage[]): string {
  const lastMessage = messages[messages.length - 1]?.text.toLowerCase() || '';

  // Check matching keywords
  for (const trigger of MOCK_TRIGGERS) {
    if (trigger.keywords.some(kw => lastMessage.includes(kw))) {
      return trigger.response;
    }
  }

  // Generic empathetic response
  return "I'm listening, and I'm really glad you shared that with me. It sounds like you're navigating some complex feelings. Could you expand a bit on what that experience is like for you? I want to make sure I truly understand your perspective.";
}

export async function generateTherapistResponse(
  messages: ChatMessage[],
  clientApiKey?: string
): Promise<string> {
  const genAI = getGeminiClient(clientApiKey);

  if (!genAI) {
    // Return high-fidelity fallback response if no API key is provided
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockTherapistResponse(messages));
      }, 1000); // Simulate network latency
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: THERAPIST_SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    const latestMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(latestMessage.text);
    return result.response.text();
  } catch (error) {
    console.error('Error generating therapist response from Gemini:', error);
    return "I apologize, but I encountered a connection issue. I'm still here for you. Could you repeat or tell me more about what you were just sharing?";
  }
}

export async function generateSessionSummary(
  messages: ChatMessage[],
  clientApiKey?: string
): Promise<SessionSummary> {
  const genAI = getGeminiClient(clientApiKey);

  if (!genAI) {
    // Return mock summary if no API key is provided
    return new Promise((resolve) => {
      setTimeout(() => {
        const textDump = messages.map(m => m.text).join(' ').toLowerCase();
        let mainTheme = "personal growth and emotional balance";
        let exercises = "Box Breathing Exercise";
        let steps = [
          "Establish a consistent daily journal routine to record thoughts.",
          "Identify and pause automatic negative thoughts when stressed.",
          "Practice setting clear personal boundaries to conserve emotional energy."
        ];

        if (textDump.includes('anxi') || textDump.includes('stress') || textDump.includes('worry')) {
          mainTheme = "managing stress, anxiety, and racing thoughts";
          exercises = "4-7-8 Breathing Technique: Inhale for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds. Repeat 4 times to settle your nervous system.";
          steps = [
            "Use the 4-7-8 breathing exercise whenever you feel a wave of physical anxiety.",
            "Write down your worries in a 'worry journal' to externalize them from your head.",
            "Break down large, overwhelming tasks into small, bite-sized daily goals."
          ];
        } else if (textDump.includes('sad') || textDump.includes('lonely') || textDump.includes('depress')) {
          mainTheme = "navigating feelings of sadness, isolation, and low energy";
          exercises = "Self-Compassion Pause: Place your hand on your heart, acknowledge the pain by saying 'this is a moment of suffering,' and repeat a kind phrase to yourself, like 'may I be gentle with myself today.'";
          steps = [
            "Commit to one small positive action daily, like a short walk outside or texting a friend.",
            "Practice the self-compassion pause during moments of intense self-criticism.",
            "Identify 1-2 small daily routines that bring comfort and protect them."
          ];
        } else if (textDump.includes('frustrat') || textDump.includes('angr') || textDump.includes('mad')) {
          mainTheme = "processing feelings of anger, irritation, and boundary issues";
          exercises = "Physiological Sigh & Grounding: Take a double quick inhale through your nose, then a long slow exhale through your mouth. Follow this by naming three solid objects in your room to anchor yourself.";
          steps = [
            "Utilize the physiological sigh to instantly lower physical rage or agitation.",
            "Set aside 10 minutes to write down the boundary that felt violated, without filter.",
            "Practice communicating your feelings using 'I' statements (e.g., 'I feel overwhelmed when...')."
          ];
        }

        resolve({
          reflection: `In this session, you explored themes surrounding ${mainTheme}. You expressed your thoughts openly and worked towards understanding the triggers behind your current feelings.`,
          trajectory: "You began the session by expressing raw, heavy emotions. As we explored the roots of these feelings, you shifted towards a more reflective and self-compassive mindset.",
          copingSteps: steps,
          exercise: exercises
        });
      }, 1500); // Simulate network latency
    });
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SUMMARY_SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Please summarize this therapist-user conversation transcript:\n\n${messages
      .map(m => `${m.sender.toUpperCase()}: ${m.text}`)
      .join('\n')}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as SessionSummary;
  } catch (error) {
    console.error('Error generating summary from Gemini:', error);
    // Return fallback summary on error
    return {
      reflection: "You shared your current challenges and feelings. We explored some of the emotional dynamics surrounding your relationships and work stress.",
      trajectory: "You remained reflective throughout the session, showing a strong willingness to explore solutions and practice mindfulness.",
      copingSteps: [
        "Take regular 5-minute breathing breaks during high-stress hours.",
        "Practice mindful journaling to write out and release negative self-talk.",
        "Set direct boundaries around your personal rest time."
      ],
      exercise: "5-4-3-2-1 Grounding Method: Name 5 things you see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste to anchor yourself in the present."
    };
  }
}

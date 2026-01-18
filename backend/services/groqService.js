const Groq = require("groq-sdk");

class GroqService {
    constructor() {
        if (!process.env.GROQ_API_KEY) {
            console.warn("⚠️  GROQ_API_KEY not set. AI features will not work.");
            this.groq = null;
        } else {
            this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
    }

    async generateQuestions(keywords, numQuestions, existingQuestions = []) {
        if (!this.groq) {
            throw new Error("Groq API key not configured");
        }

        let existingQuestionsPrompt = "";
        if (existingQuestions.length > 0) {
            const existingQuestionsText = existingQuestions
                .map((q) => q.question)
                .join("\n- ");
            existingQuestionsPrompt = `\n\nIMPORTANT: Avoid generating questions similar to these existing questions:\n- ${existingQuestionsText}\n\nGenerate completely NEW and DIFFERENT questions.`;
        }

        const prompt = `Generate EXACTLY ${numQuestions} multiple choice quiz questions (NOT MORE, NOT LESS) based on these keywords: ${keywords}${existingQuestionsPrompt}

For each question, provide:
1. A clear, concise question
2. Exactly 4 options
3. Mark the correct answer

Format your response as a JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correctAnswer": "The exact text of the correct option"
  }
]

CRITICAL REQUIREMENTS:
- Generate EXACTLY ${numQuestions} questions - NO MORE, NO LESS
- If asked for 10 questions, generate exactly 10, not 20 or any other number
- Each question must have exactly 4 options
- The correctAnswer must match one of the options exactly
- Make questions clear and educational
- Return ONLY the JSON array, no other text or explanations`;

        const chatCompletion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 4000,
            top_p: 1,
            stream: false,
        });

        const text = chatCompletion.choices[0]?.message?.content || "";

        // Extract JSON from response
        let jsonText = text.trim();
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```\n?/g, "");
        }

        const generatedQuestions = JSON.parse(jsonText);

        if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
            throw new Error("AI generated invalid response");
        }

        // Strictly enforce the requested number of questions
        const exactNumber = parseInt(numQuestions);
        const limitedQuestions = generatedQuestions.slice(0, exactNumber);


        return limitedQuestions;
    }

    async generateDescription(roundName) {
        if (!this.groq) {
            throw new Error("Groq API key not configured");
        }

        const prompt = `Generate a concise, professional description for a quiz round named "${roundName}".

Do NOT include the round name as a heading.
Focus strictly on the rules and format.

Structure Requirements:
1. Start with a brief, engaging 1-sentence introduction (<p>).
2. Follow immediately with a clear bulleted list (<ul>) of key rules:
   - Mention the question type (e.g., multiple choice)
   - Mention scoring (positive/negative points) without hardcoding values
   - Mention time constraints
3. End with a short encouraging closing sentence (<p>).

Return ONLY raw HTML code (e.g., <p>, <ul>, <li>). Do not use <h3> or other headers. Keep it simple and clean.`;

        const chatCompletion = await this.groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 500,
            top_p: 1,
            stream: false,
        });

        return chatCompletion.choices[0]?.message?.content?.trim() || "";
    }
}

module.exports = new GroqService();

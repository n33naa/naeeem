
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { TranslationResult, WritingCorrection, DailyWord, CefrLevel, ExamQuestion, NeuralFeedback, SlangWord, WritingPrompt, RephraseResult } from "../types";

const FAST_MODEL = 'gemini-3-flash-preview';

const extractJson = (text?: string) => {
  if (!text || typeof text !== 'string') return null;
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parsing failed", text);
    return null;
  }
};

const handleApiError = (error: any) => {
  const message = error?.message || String(error);
  if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    throw new Error("QUOTA_EXHAUSTED");
  }
  if (message.includes("Requested entity was not found")) {
    throw new Error("KEY_NOT_FOUND");
  }
  throw error;
};

export const correctWriting = async (text: string): Promise<WritingCorrection> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Act as a senior English linguist. Analyze the text: "${text}". 
    1. Provide 'basicCorrection': ONLY fix spelling and grammar errors, keeping the user's original words and simple tone.
    2. Provide 'corrected': A refined, professional version that improves flow and vocabulary.
    Also include CEFR assessment, flow feedback, specific errors list, and vocabulary upgrades.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            basicCorrection: { type: Type.STRING },
            corrected: { type: Type.STRING },
            cefrLevel: { type: Type.STRING },
            tone: { type: Type.STRING },
            flowFeedback: { type: Type.STRING },
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  error: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["type", "error", "explanation"]
              }
            },
            vocabularyUpgrades: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  upgrade: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["original", "upgrade", "reason"]
              }
            }
          },
          required: ["original", "basicCorrection", "corrected", "cefrLevel", "flowFeedback", "errors", "vocabularyUpgrades"]
        }
      }
    });
    const data = extractJson(response.text);
    if (!data) throw new Error("NULL_DATA");
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const analyzeImage = async (base64Data: string): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform an exhaustive English linguistic scan of this image. 
    1. Identify EVERY visible object, concept, and detail.
    2. Perform OCR: Extract and identify EVERY piece of text visible in the image.
    3. For each identified item (object or text), provide:
       - 'name': The English name or the extracted text.
       - 'arabic': Accurate Arabic translation.
       - 'phonetic': Phonetic pronunciation in English.
       - 'description': A short, precise description of what it is or its context in the image.
       - 'example': A contextual English example sentence using the word, with its Arabic translation.
    Return as a JSON object with an 'objects' array containing ALL identified items. Be extremely detailed and precise.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: { 
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } }, 
          { text: prompt }
        ] 
      },
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            objects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  arabic: { type: Type.STRING },
                  phonetic: { type: Type.STRING },
                  description: { type: Type.STRING },
                  example: {
                    type: Type.OBJECT,
                    properties: {
                      english: { type: Type.STRING },
                      arabic: { type: Type.STRING }
                    },
                    required: ["english", "arabic"]
                  }
                },
                required: ["name", "arabic", "phonetic", "description", "example"]
              }
            }
          },
          required: ["objects"]
        }
      }
    });
    const data = extractJson(response.text);
    return data || { objects: [] };
  } catch (error) {
    return handleApiError(error);
  }
};

export const translateWord = async (word: string): Promise<TranslationResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Linguistic analysis of: "${word}". Provide Arabic meaning and examples.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            cefrLevel: { type: Type.STRING },
            arabicMeaning: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            frequency: { type: Type.STRING },
            synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            collocations: { type: Type.ARRAY, items: { type: Type.STRING } },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  english: { type: Type.STRING },
                  arabic: { type: Type.STRING }
                },
                required: ["english", "arabic"]
              }
            }
          },
          required: ["word", "arabicMeaning", "examples", "phonetic", "cefrLevel"]
        }
      }
    });
    const data = extractJson(response.text);
    if (!data) throw new Error("NULL_DATA");
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const fetchSlangMatrix = async (level: 'Rookie' | 'Hustler' | 'OG'): Promise<SlangWord[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Generate 10 UNIQUE American Slang/Idioms for level: ${level}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              phrase: { type: Type.STRING },
              meaning: { type: Type.STRING },
              arabicEquivalent: { type: Type.STRING },
              origin: { type: Type.STRING },
              examples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    english: { type: Type.STRING },
                    arabic: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      }
    });
    return extractJson(response.text) || [];
  } catch (error) { return handleApiError(error); }
};

export const fetchMasteryMatrix = async (level: CefrLevel, newCount: number, reviewWords: string[], excludeList: string[]): Promise<DailyWord[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate ${newCount} useful English words for level ${level}. 
    CRITICAL: For each word, provide an accurate ARABIC translation in the 'translation' field.
    Provide an English definition and ONE high-quality English example sentence with its Arabic translation.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING },
              translation: { type: Type.STRING, description: "The Arabic translation of the word" },
              definition: { type: Type.STRING },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
              examples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    english: { type: Type.STRING },
                    arabic: { type: Type.STRING }
                  },
                  required: ["english", "arabic"]
                }
              }
            },
            required: ["word", "translation", "definition", "examples"]
          }
        }
      }
    });
    return extractJson(response.text) || [];
  } catch (error) { return handleApiError(error); }
};

export const generateExam = async (words: string[]): Promise<ExamQuestion[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Generate an English exam for these words: ${words?.join(',')}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              targetWord: { type: Type.STRING },
              type: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });
    return extractJson(response.text) || [];
  } catch (error) { return handleApiError(error); }
};

export const generateStory = async (topic: string, level: string = "B1"): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Write a long, engaging, and educational English story about: "${topic}". 
    The story MUST be written at a ${level} level (CEFR standard).
    The story should be at least 500 words long. 
    Use a variety of useful vocabulary and interesting grammatical structures appropriate for ${level}. 
    Return ONLY the story text.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
    });
    return response.text?.trim() || "Story generation failed";
  } catch (error) {
    return handleApiError(error);
  }
};

export const analyzeWordInContext = async (word: string, context: string): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Quickly analyze "${word}" in context: "${context}". 
    Return JSON: {arabic: "translation", definition: "short english def", phonetic: "pronunciation", partOfSpeech: "arabic POS"}`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are a lightning-fast English-Arabic dictionary. Provide extremely concise translations and definitions. Return ONLY JSON.",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            arabic: { type: Type.STRING },
            definition: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING }
          },
          required: ["arabic", "definition", "phonetic", "partOfSpeech"]
        }
      }
    });
    return extractJson(response.text);
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateGrammarLesson = async (topic: string): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a comprehensive English grammar lesson on the topic: "${topic}". 
    1. Provide a 'title'.
    2. Provide a 'concept' explanation (clear and concise).
    3. Provide 'rules': 3-4 key rules with examples.
    4. Provide 'commonMistakes': 2-3 common errors and how to fix them.
    5. Provide 'practiceQuiz': 3 multiple-choice questions.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            concept: { type: Type.STRING },
            rules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rule: { type: Type.STRING },
                  example: { type: Type.STRING }
                },
                required: ["rule", "example"]
              }
            },
            commonMistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mistake: { type: Type.STRING },
                  correction: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["mistake", "correction", "explanation"]
              }
            },
            practiceQuiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["title", "concept", "rules", "commonMistakes", "practiceQuiz"]
        }
      }
    });
    return extractJson(response.text);
  } catch (error) {
    return handleApiError(error);
  }
};

export const analyzeReading = async (text: string): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a deep linguistic analysis of this text: "${text}". 
    1. Provide a concise 'summary'.
    2. Provide 'keyVocabulary': 5-8 difficult words with Arabic translation, English definition, and phonetic pronunciation.
    3. Provide 'grammarInsights': 2-3 interesting grammar points used in the text.
    4. Provide 'comprehensionQuiz': 3 multiple-choice questions to test understanding.
    5. Provide 'cefrLevel' assessment.`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            cefrLevel: { type: Type.STRING },
            keyVocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  arabic: { type: Type.STRING },
                  definition: { type: Type.STRING },
                  phonetic: { type: Type.STRING }
                },
                required: ["word", "arabic", "definition", "phonetic"]
              }
            },
            grammarInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  example: { type: Type.STRING }
                },
                required: ["point", "explanation", "example"]
              }
            },
            comprehensionQuiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["summary", "cefrLevel", "keyVocabulary", "grammarInsights", "comprehensionQuiz"]
        }
      }
    });
    const data = extractJson(response.text);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const analyzeExamPerformance = async (results: {word: string, correct: boolean}[]): Promise<NeuralFeedback> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Analyze: ${JSON.stringify(results)}`,
      config: { responseMimeType: "application/json" }
    });
    return extractJson(response.text) || { summary: "", weakWords: [], improvementTip: "" };
  } catch (error) { return handleApiError(error); }
};

export const translateText = async (text: string, targetLang: string = "Arabic"): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: `Translate the following English text to ${targetLang}. Return ONLY the translated text: "${text}"`,
    });
    return response.text?.trim() || "Translation failed";
  } catch (error) {
    console.error("Translation error", error);
    return "Translation error";
  }
};

export const rephraseSentence = async (sentence: string): Promise<RephraseResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Rephrase the following English sentence in 4 different tones: Professional, Casual, Academic, and Creative. 
    Sentence: "${sentence}"`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            variations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tone: { type: Type.STRING },
                  text: { type: Type.STRING }
                },
                required: ["tone", "text"]
              }
            }
          },
          required: ["original", "variations"]
        }
      }
    });
    return extractJson(response.text);
  } catch (error) {
    return handleApiError(error);
  }
};

export const generateWritingPrompt = async (category?: string): Promise<WritingPrompt> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a creative and engaging English writing prompt. ${category ? `Category: ${category}` : ''}`;

    const response = await ai.models.generateContent({
      model: FAST_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING }
          },
          required: ["id", "title", "description", "category", "difficulty"]
        }
      }
    });
    return extractJson(response.text);
  } catch (error) {
    return handleApiError(error);
  }
};

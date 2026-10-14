"use server"

import OpenAI from "openai"

// 1. Define what a single line item looks like
type LineItem = {
  description: string
  quantity: number
  unitPrice: number
}

// 2. Define what the AI's JSON response object looks like
type AIResponse = {
  lineItems?: LineItem[]
  items?: LineItem[]
  data?: LineItem[]
}

// Setup OpenRouter
const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

export async function generateLineItems(
  prompt: string,
  defaultRate: number = 0
) {
  if (!process.env.OPENROUTER_API_KEY) {
    return { success: false, error: "Missing OPENROUTER_API_KEY in .env" }
  }

  try {
    const fullPrompt = `
You are an expert freelance invoicing assistant. 
Convert this rough description into professional invoice line items: "${prompt}"
Use ${defaultRate} as the default price if none is mentioned.

Return ONLY a valid JSON object with a "lineItems" key. No markdown, no explanation.
Format: { "lineItems": [{"description": "string", "quantity": number, "unitPrice": number}] }
    `

    const completion = await openrouter.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0]?.message?.content || "{}"
    
    // FIX: We cast the parsed JSON to our specific types instead of using 'any'
    const parsed = JSON.parse(content) as AIResponse | LineItem[]
    
    let lineItems: LineItem[] = []

    // Check if it's an object with a lineItems key
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const responseObj = parsed as AIResponse
        lineItems = responseObj.lineItems || responseObj.items || responseObj.data || []
    } 
    // Fallback if the AI ignored the object rule and just sent an array
    else if (Array.isArray(parsed)) {
        lineItems = parsed
    }

    return { success: true, lineItems }

  } catch (error) {
    console.error("OpenRouter AI Error:", error)
    return { success: false, error: "AI generation failed." }
  }
}
// Designed 2 logos for $150 each and built a 5-page website for $500 total
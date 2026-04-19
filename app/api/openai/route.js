

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(prompt) {

 const {pantryItems} = await prompt.json()
  console.log("Received pantryItems:", pantryItems) 

  const pantryNames = pantryItems.map((item) => item.name).join(", ");
  console.log("Pantry Items", pantryNames)
  const fullPrompt = `
  You are given the following pantry ingredients: ${pantryNames}.
  
  Generate exactly 2 creative and unique recipes using some or all of these ingredients.
  
  Rules:
  - Only use ingredients that exist in the pantry list
  - Each recipe must have a name and a short appetizing description
  
  Return a JSON object with a key called "result" containing an array of exactly 2 objects in this format:
{
  "result": [
    { "name": "Recipe Name", "description": "Recipe description" },
    { "name": "Recipe Name", "description": "Recipe description" }
  ]
}
`
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: {type: "json_object"},
    temperature: 1.5,
    messages: [
    
      {
        role: "user",
        content: `Generate 2 recipes based on this prompt:  ${fullPrompt}`
      },
    ],
  });


  const answer = response.choices[0].message.content;
  const parsed = JSON.parse(answer)

  return Response.json({ result: parsed.result })
}

"use server";

import { ChatOpenAI } from "@langchain/openai";
import { OpenAI } from "openai";

const chatModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateRecipes(prompt) {
  const pantryNames = prompt.map((item) => item.name).join(", ");
  const fullPrompt = `Generate two recipe for ${pantryNames} dish. The output should be in JSON array and each object should contain a recipe name field named 'name', description field named 'description'. Only two recipes with two name and two description. You dont have to use all the ingredients but if you make ingredients ensure ingredients exist in pantry. And be creative with recipes, nothing boring `;

  try {
    const response = await chatModel.invoke(fullPrompt);
    const recipes = JSON.parse(response.content);
    return recipes;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error(
        "OpenAI API quota exceeded. Please check your plan and billing details."
      );
      // You could also implement a retry mechanism here
    } else {
      console.error("Error generating recipe:", error);
    }
    throw error;
  }
}

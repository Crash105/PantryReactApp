"use server";

import { ChatOpenAI } from "@langchain/openai";

const chatModel = new ChatOpenAI({
    apiKey: "sk-proj-uKq9N4zxJMBykpSK0UaHT3BlbkFJkLU23FLwXpMkUYOjyDdW"
});

export async function generateRecipes(prompt) {

    

   

    const pantryNames = prompt.map(item => item.name).join(", ");
    const fullPrompt = `Generate one recipe for ${pantryNames} dish. The output should be in JSON array and each object should contain a recipe name field named 'name', description field named 'description'. Only one recipe with one name and one description. You dont have to use all the ingredients and be creative `;
    
    try {
        const response = await chatModel.invoke(fullPrompt);
        const recipes = JSON.parse(response.content);
        return recipes;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error("OpenAI API quota exceeded. Please check your plan and billing details.");
            // You could also implement a retry mechanism here
        } else {
            console.error("Error generating recipe:", error);
        }
        throw error;
    }
}

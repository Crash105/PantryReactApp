"use server";

import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function describeImage(url) {
  console.log("Descibe Images");

  let base64Data = url.split(",")[1];
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "What’s pantry item is in this image.?Say the response in ONE word",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`,
            },
          },
        ],
      },
    ],
  });
  console.log("Response" + response.choices[0].message.content);

  const answer = response.choices[0].message.content;

  return answer;
}

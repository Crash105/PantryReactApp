const response = await openAI.createCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "What is 2+2",
      },
    ],
  })

  const responseText = response.data.choices[0]?.message.content;
res.status(200).json({ response: responseText });
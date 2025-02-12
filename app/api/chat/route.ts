import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages } = await req.json()

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      stream: true,
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || ''
          controller.enqueue(encoder.encode(content))
        }
        controller.close()
      }
    })

    console.log('Returning response', stream)
    return new Response(stream)
  } catch (error) {
    console.log('Error processing request', error)
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
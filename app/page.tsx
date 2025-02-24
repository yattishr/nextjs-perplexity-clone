'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons"

// Define the expected API response format
interface SearchResponse {
  title: string
  summary: string 
  links: { text: string, url: string }[]
  related_questions: string[]
}

export default function Home() {
  const [query, setQuery] = useState<string>('')
  const [response, setResponse] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  // Example questions (you can make these dynamic)
  const exampleQuestions = [
    "Microsoft Study: AI",
    "Google Expands",
    "How do I file a tax extension?",
    "Fastest growing exercise trends",
    "NotebookLM Plus",
    "Impairs Critical...",
    "8. AMZN",
    "S&P 500"
  ]

  const handleDeepSearch = async () => {
    if (!query.trim()) return
    console.log('Deep Search:', query)
  }

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setResponse(null)
    
    try {
      const res = await fetch('/api/chat/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })

      const data: SearchResponse = await res.json()
      setResponse(data) 

    } catch (error) {
      console.error(error);
      setResponse(null);
    } finally {
      setLoading(false)
    }
  }  

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b">
        <h1 className="text-xl font-semibold text-purple-400">
          Intelli<span className="text-purple-800">Search</span>
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" className="text-sm">
            History
          </Button>
          <Button variant="ghost" className="text-sm">
            Sign In
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto mt-12 px-4">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-semibold">What do you want to know?</h2>
          {/* Search Area */}
          <div className="w-full space-y-8">
            {/* Input Container */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Ask anything..."
                className="w-full h-14 text-lg pl-12 pr-20 rounded-lg border-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <Button
                  className="h-10 w-10 rounded-lg bg-purple-700"
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </Button>
                <Button
                  className="h-10 px-3 rounded-lg bg-purple-400"
                  onClick={handleDeepSearch}
                  disabled={loading || !query.trim()}
                >
                  Deep Search
                </Button>
              </div>
            </div>

            {/* Example Questions */}
            <h3 className="text-lg font-semibold">Trending Searches</h3>
            <div className="grid grid-cols-2 gap-4">            
              {exampleQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-16 justify-start text-left text-sm font-normal hover:bg-gray-50 border border-purple-400"
                  onClick={() => setQuery(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Response Area */}
      {response && (
        <div className="max-w-3xl mx-auto mt-8 px-4">
          <Card className="p-6 bg-white shadow-none border">
            <h2 className="text-xl font-semibold">{response.title}</h2>
            <p className="text-gray-700">{response.summary}</p>
            <ul className="mt-4 space-y-2">
              {response.links.map((link, index) => (
                <li key={index}>
                  🔗{" "}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          {/* People also ask section with Accordion */}
          {response.related_questions.length > 0 && (
            <Card className="p-6 bg-gray-100 shadow-none border mt-6">
              <h3 className="text-lg font-semibold">People also ask</h3>
              <Accordion type="single" collapsible>
              {response.related_questions.map((question, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger>{question}</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-800">
                      This is the answer to the question: "{question}"
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            </Card>            
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-3xl mx-auto mt-8 px-4">
          <Card className="p-6 bg-white shadow-none border">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
              <p className="text-md text-blue-600">Hold on—I'm consulting the digital oracle...</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
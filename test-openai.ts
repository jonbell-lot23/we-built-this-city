#!/usr/bin/env bun

import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

console.log('Testing OpenAI connection...')
console.log('API Key:', process.env.OPENAI_API_KEY ? `Set (${process.env.OPENAI_API_KEY.substring(0, 7)}...)` : 'Not set')

try {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Say "hello"' }],
    max_tokens: 10
  })
  
  console.log('✅ Success:', response.choices[0].message.content)
} catch (error: any) {
  console.error('❌ Error:', error.message)
}
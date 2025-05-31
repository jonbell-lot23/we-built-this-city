import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const files = fs.readdirSync(publicDir)
    const csvFiles = files.filter(file => file.endsWith('.csv') && file.startsWith('city_'))
    
    return NextResponse.json({ files: csvFiles })
  } catch (error) {
    return NextResponse.json({ files: [] })
  }
}
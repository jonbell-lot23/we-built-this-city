'use client'

import { useState, useEffect } from 'react'
import CityGrid from '@/components/CityGrid'

export default function Home() {
  const [csvFiles, setCsvFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<string>('')

  useEffect(() => {
    fetch('/api/csv-files')
      .then(res => res.json())
      .then(data => setCsvFiles(data.files))
      .catch(err => console.error('Error loading CSV files:', err))
  }, [])

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">City Grid Viewer</h1>
        
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a city grid:
          </label>
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            <option value="">Choose a file...</option>
            {csvFiles.map(file => (
              <option key={file} value={file}>{file}</option>
            ))}
          </select>
        </div>

        {selectedFile && <CityGrid filename={selectedFile} />}
      </div>
    </main>
  )
}
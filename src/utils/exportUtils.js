// Export utility functions for JSON and CSV

export const exportToJSON = (data, filename = 'export') => {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  downloadFile(blob, `${filename}.json`)
}

export const exportToCSV = (data, filename = 'export') => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Handle single item (convert to array)
  const items = Array.isArray(data) ? data : [data]
  
  // Get all unique keys from all items
  const allKeys = new Set()
  items.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key))
  })
  
  const headers = Array.from(allKeys)
  
  // Create CSV content
  let csv = headers.join(',') + '\n'
  
  items.forEach(item => {
    const row = headers.map(header => {
      let value = item[header]
      
      // Handle different data types
      if (value === null || value === undefined) {
        return ''
      }
      
      // Handle arrays (like tags)
      if (Array.isArray(value)) {
        value = value.join('; ')
      }
      
      // Handle objects (stringify them)
      if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      
      // Escape quotes and wrap in quotes if contains comma or quote
      value = String(value).replace(/"/g, '""')
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`
      }
      
      return value
    })
    
    csv += row.join(',') + '\n'
  })
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadFile(blob, `${filename}.csv`)
}

const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const getExportFilename = (prefix, itemCount = null) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const count = itemCount !== null ? `_${itemCount}_items` : ''
  return `${prefix}${count}_${timestamp}`
}

// Import utility functions

export const parseJSONFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data)
      } catch (error) {
        reject(new Error('Invalid JSON file format'))
      }
    }
    
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

export const parseCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const text = e.target.result
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          reject(new Error('CSV file is empty or invalid'))
          return
        }
        
        // Parse headers
        const headers = parseCSVLine(lines[0])
        
        // Parse data rows
        const data = []
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i])
          if (values.length === 0) continue
          
          const item = {}
          headers.forEach((header, index) => {
            let value = values[index] || ''
            
            // Try to parse as JSON for objects
            if (value.startsWith('{') || value.startsWith('[')) {
              try {
                value = JSON.parse(value)
              } catch (e) {
                // Keep as string if not valid JSON
              }
            }
            
            // Convert array-like strings (semicolon-separated)
            if (typeof value === 'string' && value.includes(';')) {
              value = value.split(';').map(v => v.trim()).filter(v => v)
            }
            
            // Convert boolean strings
            if (value === 'true') value = true
            if (value === 'false') value = false
            
            // Convert empty strings to null for certain fields
            if (value === '' && ['description', 'image_url'].includes(header)) {
              value = null
            }
            
            item[header] = value
          })
          
          data.push(item)
        }
        
        resolve(data)
      } catch (error) {
        reject(new Error('Error parsing CSV file: ' + error.message))
      }
    }
    
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsText(file)
  })
}

const parseCSVLine = (line) => {
  const values = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quotes
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  values.push(current)
  return values
}

export const prepareImportData = (data, currentUserId) => {
  // Handle single item or array
  const items = Array.isArray(data) ? data : [data]
  
  return items.map(item => {
    // Remove old IDs and timestamps to avoid conflicts
    const { id, created_at, updated_at, ...itemData } = item
    
    // Set current user_id
    itemData.user_id = currentUserId
    
    // Ensure required fields exist
    if (!itemData.name) {
      throw new Error('Item must have a name')
    }
    if (!itemData.type) {
      throw new Error('Item must have a type (category)')
    }
    
    // Set defaults for optional fields
    if (!itemData.sub_type) itemData.sub_type = ''
    if (!itemData.description) itemData.description = null
    if (!itemData.tags) itemData.tags = []
    if (!itemData.image_url) itemData.image_url = null
    if (itemData.archived === undefined) itemData.archived = false
    if (itemData.favorite === undefined) itemData.favorite = false
    
    return itemData
  })
}

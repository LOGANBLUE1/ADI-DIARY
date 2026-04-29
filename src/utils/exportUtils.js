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

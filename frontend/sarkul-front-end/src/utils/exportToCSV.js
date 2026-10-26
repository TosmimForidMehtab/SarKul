export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    return;
  }
  
  // Get headers
  const headers = Object.keys(data[0]);
  
  // Format CSV helper
  const formatCell = (val) => {
    let cell = val === null || val === undefined ? '' : String(val);
    if (cell.includes(',') || cell.includes('\n') || cell.includes('"') || cell.includes('\r')) {
      cell = `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const csvContent = [
    headers.map(formatCell).join(','), // Header row
    ...data.map(row => 
      headers.map(header => formatCell(row[header])).join(',')
    )
  ].join('\r\n');
  
  // Create download link with UTF-8 BOM for Excel support
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

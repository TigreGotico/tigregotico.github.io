import { marked } from 'marked';
import jsPDF from 'jspdf';

export type SupportedFileType = 'pdf' | 'md' | 'txt';

export function getFileExtension(filePath: string): SupportedFileType | null {
  const ext = filePath.split('.').pop()?.toLowerCase();
  if (ext === 'pdf' || ext === 'md' || ext === 'txt') {
    return ext;
  }
  return null;
}

export async function convertMarkdownToPDF(markdownContent: string, title: string = 'Document'): Promise<Blob> {
  // Convert markdown to HTML
  const html = await marked(markdownContent);
  
  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Create PDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(title, maxWidth);
  titleLines.forEach((line: string) => {
    if (yPosition + 10 > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 10;
  });
  
  yPosition += 10;
  
  // Process each element
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const processNode = (node: ChildNode) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition + 7 > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 7;
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      
      // Handle different HTML elements
      if (tagName.match(/^h[1-6]$/)) {
        yPosition += 5;
        const fontSize = 18 - (parseInt(tagName[1]) * 2);
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', 'bold');
        const text = element.textContent?.trim() || '';
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition + fontSize * 0.35 > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += fontSize * 0.35;
        });
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        yPosition += 3;
      } else if (tagName === 'p') {
        element.childNodes.forEach(processNode);
        yPosition += 5;
      } else if (tagName === 'strong' || tagName === 'b') {
        pdf.setFont('helvetica', 'bold');
        element.childNodes.forEach(processNode);
        pdf.setFont('helvetica', 'normal');
      } else if (tagName === 'em' || tagName === 'i') {
        pdf.setFont('helvetica', 'italic');
        element.childNodes.forEach(processNode);
        pdf.setFont('helvetica', 'normal');
      } else if (tagName === 'ul' || tagName === 'ol') {
        Array.from(element.children).forEach((li, index) => {
          const bullet = tagName === 'ul' ? '• ' : `${index + 1}. `;
          if (yPosition + 7 > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          const text = li.textContent?.trim() || '';
          const lines = pdf.splitTextToSize(bullet + text, maxWidth - 5);
          lines.forEach((line: string, lineIndex: number) => {
            if (yPosition + 7 > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(line, margin + (lineIndex === 0 ? 0 : 5), yPosition);
            yPosition += 7;
          });
        });
        yPosition += 3;
      } else if (tagName === 'code' && element.parentElement?.tagName !== 'PRE') {
        pdf.setFont('courier', 'normal');
        element.childNodes.forEach(processNode);
        pdf.setFont('helvetica', 'normal');
      } else if (tagName === 'pre') {
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(9);
        const code = element.textContent || '';
        const lines = code.split('\n');
        lines.forEach((line: string) => {
          const wrappedLines = pdf.splitTextToSize(line || ' ', maxWidth);
          wrappedLines.forEach((wrappedLine: string) => {
            if (yPosition + 6 > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }
            pdf.text(wrappedLine, margin, yPosition);
            yPosition += 6;
          });
        });
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        yPosition += 5;
      } else {
        element.childNodes.forEach(processNode);
      }
    }
  };
  
  tempDiv.childNodes.forEach(processNode);
  
  return pdf.output('blob');
}

export async function convertTextToPDF(textContent: string, title: string = 'Document'): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Add title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, yPosition);
  yPosition += 15;
  
  // Add content
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const lines = textContent.split('\n');
  lines.forEach((line: string) => {
    const wrappedLines = pdf.splitTextToSize(line || ' ', maxWidth);
    wrappedLines.forEach((wrappedLine: string) => {
      if (yPosition + 7 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(wrappedLine, margin, yPosition);
      yPosition += 7;
    });
  });
  
  return pdf.output('blob');
}

export async function downloadFile(filePath: string, title: string): Promise<void> {
  const fileType = getFileExtension(filePath);
  
  if (fileType === 'pdf') {
    // Direct download for PDF
    window.open(filePath, '_blank');
    return;
  }
  
  if (fileType === 'md' || fileType === 'txt') {
    try {
      // Fetch the file content
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      const content = await response.text();
      
      // Convert to PDF
      let pdfBlob: Blob;
      if (fileType === 'md') {
        pdfBlob = await convertMarkdownToPDF(content, title);
      } else {
        pdfBlob = await convertTextToPDF(content, title);
      }
      
      // Trigger download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting file to PDF:', error);
      alert('Failed to convert and download the file. Please try again.');
    }
  } else {
    // Unsupported file type
    alert('Unsupported file type');
  }
}

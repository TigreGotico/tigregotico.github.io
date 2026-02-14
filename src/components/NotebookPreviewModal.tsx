import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Code } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NotebookCell {
  type: string;
  content: string;
  language?: string;
}

interface NotebookPreviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  notebookUrl: string;
}

export const NotebookPreviewModal = ({ 
  isOpen, 
  onOpenChange, 
  title, 
  notebookUrl 
}: NotebookPreviewModalProps) => {
  console.log('NotebookPreviewModal rendered with:', { isOpen, title, notebookUrl });
  const [cells, setCells] = useState<NotebookCell[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotebook = async () => {
    console.log('loadNotebook called', { notebookUrl, cellsLength: cells.length });
    if (!notebookUrl || cells.length > 0) return; // Already loaded or no URL
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching notebook from:', notebookUrl);
      const response = await fetch(notebookUrl);
      console.log('Fetch response:', { ok: response.ok, status: response.status });
      const text = await response.text();
      console.log('Fetched text length:', text.length, 'First 200 chars:', text.substring(0, 200));
      
      // Try parsing as JSON first (standard Jupyter format)
      try {
        const notebookData = JSON.parse(text);
        console.log('Parsed as JSON, has cells:', !!notebookData.cells);
        if (notebookData.cells) {
          const parsedCells = notebookData.cells.map((cell: any) => ({
            type: cell.cell_type,
            content: Array.isArray(cell.source) ? cell.source.join('') : cell.source,
            language: cell.cell_type === 'code' ? (cell.metadata?.language || 'python') : undefined
          }));
          console.log('Parsed JSON cells:', parsedCells.length);
          setCells(parsedCells);
          return;
        }
      } catch (jsonError) {
        console.log('JSON parsing failed, trying XML:', jsonError);
        // If JSON parsing fails, try XML format
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/xml');
        const xmlCells = doc.querySelectorAll('VSCode\\.Cell');
        console.log('Found XML cells:', xmlCells.length);
        
        const parsedCells: NotebookCell[] = [];
        xmlCells.forEach((cell) => {
          const language = cell.getAttribute('language');
          const cellContent = cell.textContent || '';
          parsedCells.push({
            type: language === 'markdown' ? 'markdown' : 'code',
            content: cellContent,
            language: language || 'python'
          });
        });
        
        console.log('Parsed XML cells:', parsedCells.length);
        setCells(parsedCells);
      }
    } catch (err) {
      console.error('Error loading notebook:', err);
      setError('Failed to load notebook content');
    } finally {
      setLoading(false);
    }
  };

  // Load notebook when dialog opens
  const handleOpenChange = (open: boolean) => {
    console.log('handleOpenChange called', { open, notebookUrl });
    if (open) {
      loadNotebook();
    } else {
      // Only close if we've actually loaded or attempted to load
      console.log('Attempting to close, cells:', cells.length);
    }
    onOpenChange(open);
  };

  // Also trigger loading when isOpen becomes true
  useEffect(() => {
    console.log('useEffect triggered', { isOpen, notebookUrl, cellsLength: cells.length });
    if (isOpen && notebookUrl && cells.length === 0) {
      console.log('Calling loadNotebook from useEffect');
      loadNotebook();
    }
  }, [isOpen, notebookUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto" onPointerDownOutside={(e) => {
        console.log('Pointer down outside dialog');
      }} onEscapeKeyDown={(e) => {
        console.log('Escape key pressed');
      }}>
        <DialogHeader>
          <DialogTitle>{title || 'Notebook Preview'}</DialogTitle>
          <DialogDescription>
            Notebook preview - {cells.length} cells
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading notebook...</div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            cells.map((cell, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                {cell.type === 'markdown' ? (
                  <div className="bg-background p-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {cell.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : cell.type === 'code' ? (
                  <div className="bg-muted/50">
                    <div className="overflow-x-auto">
                      <SyntaxHighlighter
                        language={cell.language || 'python'}
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          fontSize: '0.875rem'
                        }}
                      >
                        {cell.content}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-destructive/10 text-destructive">
                    {cell.content}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

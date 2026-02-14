import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [cells, setCells] = useState<NotebookCell[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCells([]);
  }, [notebookUrl]);

  const loadNotebook = async () => {
    if (!notebookUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(notebookUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notebook: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      
      try {
        const notebookData = JSON.parse(text);
        if (notebookData.cells) {
          const parsedCells = notebookData.cells.map((cell: any) => ({
            type: cell.cell_type,
            content: Array.isArray(cell.source) ? cell.source.join('') : cell.source,
            language: cell.cell_type === 'code' ? (cell.metadata?.language || 'python') : undefined
          }));
          setCells(parsedCells);
          return;
        }
      } catch (jsonError) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/xml');
        const xmlCells = doc.querySelectorAll('VSCode\\.Cell');
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
    if (open) {
      loadNotebook();
    }
    onOpenChange(open);
  };

  // Load notebook when dialog opens or URL changes
  useEffect(() => {
    if (isOpen && notebookUrl) {
      loadNotebook();
    }
  }, [isOpen, notebookUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={true}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
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

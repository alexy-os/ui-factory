import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogPortal,
  DialogOverlay
} from "@ui-factory/ui-shadcn/components/ui/dialog";
import { Button } from "@ui-factory/ui-shadcn/components/ui/button";
import { Code2 } from "lucide-react";
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import jsx from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github-dark.css';
import { useState } from "react";

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('jsx', jsx);

interface CodePreviewProps {
  code: string;
  title: string;
}

export function CodePreview({ code, title }: CodePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  const highlightedCode = hljs.highlight(code, {
    language: 'jsx',
    ignoreIllegals: true
  }).value;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsOpen(true)}
        >
          <Code2 className="w-4 h-4 mr-2" />
          View Code
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="bg-black/80 fixed inset-0" />
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background border rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto p-4 [&>button]:hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              View the source code for this component
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <pre className="p-3 bg-muted rounded-lg overflow-x-auto relative [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
              <code 
                className="hljs language-jsx text-xs leading-5 block"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
} 
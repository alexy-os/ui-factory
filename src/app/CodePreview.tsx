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
import 'highlight.js/styles/github.css';
import { useState } from "react";
import { useTheme } from "next-themes";

hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('jsx', jsx);

interface CodePreviewProps {
  code: string;
  title: string;
}

export function CodePreview({ code, title }: CodePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

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
        <DialogOverlay className="bg-background/80 backdrop-blur-sm fixed inset-0" />
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-2xl shadow-lg w-full max-w-5xl max-h-[80vh] overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-transparent">
          <DialogHeader className="mb-2">
            <DialogTitle className="font-semibold text-foreground">{title}</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              View the source code for this component
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <pre className={`p-3 bg-muted rounded-lg overflow-x-auto relative [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 [&::-webkit-scrollbar-track]:bg-transparent ${theme === 'dark' ? 'hljs-dark' : 'hljs-light'}`}>
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
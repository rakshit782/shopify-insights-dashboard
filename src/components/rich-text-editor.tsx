
'use client';

import React, { useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Strikethrough } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// A simplified DOM-like structure to represent the rich text content
type Node = {
  tag: string;
  children: (Node | string)[];
  attributes?: { [key: string]: string };
};

// Basic HTML to AST parser
const parseHtml = (html: string): Node[] => {
  if (typeof window === 'undefined') return []; // Don't run on server
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const parseNode = (element: Element): Node => {
    const node: Node = {
      tag: element.tagName.toLowerCase(),
      children: [],
    };
    Array.from(element.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        node.children.push(child.textContent || '');
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        node.children.push(parseNode(child as Element));
      }
    });
    return node;
  };

  const nodes: Node[] = [];
  Array.from(doc.body.children).forEach(child => {
      nodes.push(parseNode(child));
  });

  // If the body is empty but there's text, wrap it in a <p>
  if (nodes.length === 0 && doc.body.textContent) {
    return [{ tag: 'p', children: [doc.body.textContent] }];
  }

  return nodes;
};

// Basic AST to HTML serializer
const serializeToHtml = (nodes: Node[]): string => {
  const serializeNode = (node: Node | string): string => {
    if (typeof node === 'string') {
      return node;
    }
    const childrenHtml = node.children.map(serializeNode).join('');
    return `<${node.tag}>${childrenHtml}</${node.tag}>`;
  };
  return nodes.map(serializeNode).join('');
};


export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const editorRef = React.useRef<HTMLDivElement>(null);

  // Avoid hydration errors by only rendering editor on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync editor content with the initial value from react-hook-form
  useEffect(() => {
    if (isMounted && editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '<p><br></p>';
    }
  }, [value, isMounted]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (onChange) {
      onChange(e.currentTarget.innerHTML);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const createList = (type: 'insertUnorderedList' | 'insertOrderedList') => {
      execCommand(type);
  }

  if (!isMounted) {
    return (
      <div className={cn("min-h-[200px] w-full rounded-md border border-input bg-muted/50 p-3 ring-offset-background", className)}>
        {/* Placeholder or skeleton */}
      </div>
    );
  }
  
  return (
    <div className={cn("rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}>
        <div className="p-2 border-b">
            <ToggleGroup type="multiple" size="sm">
                <ToggleGroupItem value="bold" aria-label="Toggle bold" onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }}>
                    <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Toggle italic" onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }}>
                    <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Toggle underline" onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }}>
                    <Underline className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough" onMouseDown={(e) => { e.preventDefault(); execCommand('strikeThrough'); }}>
                    <Strikethrough className="h-4 w-4" />
                </ToggleGroupItem>
                <Separator orientation="vertical" className="h-auto mx-1" />
                <ToggleGroupItem value="ul" aria-label="Unordered List" onMouseDown={(e) => { e.preventDefault(); createList('insertUnorderedList'); }}>
                    <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="ol" aria-label="Ordered List" onMouseDown={(e) => { e.preventDefault(); createList('insertOrderedList'); }}>
                    <ListOrdered className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning={true}
        className="prose dark:prose-invert max-w-none min-h-[200px] p-3 focus:outline-none text-sm"
        dangerouslySetInnerHTML={{ __html: value || '<p><br></p>' }}
      />
    </div>
  );
}

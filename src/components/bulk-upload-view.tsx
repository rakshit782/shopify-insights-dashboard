
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadViewProps {
  platform: string;
}

// This is a placeholder. In a real scenario, this would come from a CSV parsing library.
const mockParseCSV = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    const header = lines[0].split(',');
    const data = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: { [key: string]: string } = {};
        header.forEach((h, i) => {
            row[h.trim()] = values[i].trim();
        });
        return row;
    });
    return { header, data };
};

export function BulkUploadView({ platform }: BulkUploadViewProps) {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [parsedData, setParsedData] = useState<{ header: string[], data: any[] } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                setFileContent(content);
                const { header, data } = mockParseCSV(content);
                setParsedData({ header, data });
            };
            reader.readAsText(file);
        }
    };

    const handleProcessUpload = async () => {
        if (!parsedData) return;
        setIsProcessing(true);
        toast({
            title: `Processing ${platform} Upload...`,
            description: `Uploading ${parsedData.data.length} products. This may take a while.`,
        });

        // In a real application, you would call a server action here
        // that processes the data in batches and makes API calls to the platform.
        // e.g., await handleBulkUpload({ platform, data: parsedData.data });
        await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing delay

        setIsProcessing(false);
        toast({
            title: 'Upload Complete',
            description: `Successfully processed ${parsedData.data.length} products for ${platform}.`,
        });
        
        // Reset state after successful upload
        setFileContent(null);
        setParsedData(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bulk Product Upload for {platform}</CardTitle>
                <CardDescription>
                    Upload a CSV file with your product data to create or update listings on {platform}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!parsedData ? (
                    <div className="flex items-center justify-center w-full">
                        <label htmlFor={`file-upload-${platform}`} className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileUp className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">CSV file (MAX. 5MB)</p>
                            </div>
                            <Input id={`file-upload-${platform}`} type="file" className="hidden" onChange={handleFileChange} accept=".csv" />
                        </label>
                    </div>
                ) : (
                    <div>
                        <h3 className="text-lg font-medium mb-2">File Preview</h3>
                        <div className="relative w-full overflow-auto border rounded-lg max-h-96">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {parsedData.header.map(h => <TableHead key={h}>{h}</TableHead>)}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.data.slice(0, 10).map((row, i) => (
                                        <TableRow key={i}>
                                            {parsedData.header.map(h => <TableCell key={h}>{row[h]}</TableCell>)}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                         {parsedData.data.length > 10 && (
                            <p className="text-sm text-muted-foreground mt-2">Showing first 10 of {parsedData.data.length} rows.</p>
                         )}
                    </div>
                )}
            </CardContent>
            {parsedData && (
                 <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setFileContent(null); setParsedData(null); }} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleProcessUpload} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Process {parsedData.data.length} Products
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

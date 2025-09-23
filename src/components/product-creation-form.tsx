
'use client';

import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Trash2, Wand2, Plus, Image as ImageIcon, Video, X, Link } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleOptimizeContent } from '@/app/actions';
import { RichTextEditor } from './rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';


const bulletPointSchema = z.object({
  id: z.string(),
  value: z.string().min(1, 'Bullet point cannot be empty.'),
});

const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.'),
  description: z.string().optional(),
  bulletPoints: z.array(bulletPointSchema).max(5, 'You can add a maximum of 5 bullet points.'),
  googleKeywords: z.string().optional(),
  amazonKeywords: z.string().optional(),
  walmartKeywords: z.string().optional(),
  ebayKeywords: z.string().optional(),
  etsyKeywords: z.string().optional(),
  imageUrl1: z.string().url().optional().or(z.literal('')),
  imageUrl2: z.string().url().optional().or(z.literal('')),
  imageUrl3: z.string().url().optional().or(z.literal('')),
  imageUrl4: z.string().url().optional().or(z.literal('')),
  imageUrl5: z.string().url().optional().or(z.literal('')),
  imageUrl6: z.string().url().optional().or(z.literal('')),
  imageUrl7: z.string().url().optional().or(z.literal('')),
  videoUrl1: z.string().url().optional().or(z.literal('')),
  videoUrl2: z.string().url().optional().or(z.literal('')),
});

type ProductFormValues = z.infer<typeof formSchema>;
type Marketplace = 'google' | 'amazon' | 'walmart' | 'ebay' | 'etsy';

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mt-8 mb-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Separator className="mt-2" />
    </div>
  );
}

function FileUploadPlaceholder({ icon: Icon, label }: { icon: React.FC<any>; label: string }) {
    return (
        <div className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer">
            <Icon className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium text-center">{label}</span>
            <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
    );
}

function UrlUpload({ name, control, label }: { name: any; control: any, label: string; }) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-xs">{label}</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="https://... (must be a direct link)" className="pl-9" />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

export function ProductCreationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState<Marketplace | null>(null);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      bulletPoints: [{ id: uuidv4(), value: '' }],
      googleKeywords: '',
      amazonKeywords: '',
      walmartKeywords: '',
      ebayKeywords: '',
      etsyKeywords: '',
      imageUrl1: '',
      imageUrl2: '',
      imageUrl3: '',
      imageUrl4: '',
      imageUrl5: '',
      imageUrl6: '',
      imageUrl7: '',
      videoUrl1: '',
      videoUrl2: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'bulletPoints',
  });

  const onOptimize = async (marketplace: Marketplace) => {
    setIsOptimizing(marketplace);
    toast({
      title: `Optimizing for ${marketplace}...`,
      description: 'The AI is working its magic. This may take a moment.',
    });

    const currentValues = form.getValues();
    const result = await handleOptimizeContent({
      title: currentValues.title,
      description: currentValues.description || '',
      bulletPoints: currentValues.bulletPoints.map(bp => bp.value).filter(Boolean),
      marketplace: marketplace,
    });

    if (result.success && result.data) {
      form.setValue('title', result.data.optimizedTitle, { shouldValidate: true });
      form.setValue('description', result.data.optimizedDescription, { shouldValidate: true });
      
      // Clear existing bullet points and append new ones
      remove(); // Remove all
      result.data.optimizedBulletPoints.forEach(bp => append({ id: uuidv4(), value: bp }));
      
      toast({
        title: 'Optimization Complete',
        description: `Content has been updated for ${marketplace}.`,
      });
    } else {
      toast({
        title: 'Optimization Failed',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsOptimizing(null);
  };


  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    // In a real app, you would handle the form submission, including file uploads.
    console.log(values);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: 'Product Created (Simulated)',
      description: 'The new product has been saved to your catalog.',
    });
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Product</CardTitle>
            <CardDescription>Fill out the details below to add a new product to your master catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Core Content Section */}
            <SectionHeader title="Core Content" description="The foundational content for your product listing." />
            
            <div className="space-y-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <Controller
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><RichTextEditor value={field.value || ''} onChange={field.onChange} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            {/* Bullet Points Section */}
            <div className="mt-6">
              <FormLabel>Bullet Points ({fields.length}/5)</FormLabel>
              <div className="mt-2 space-y-3">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`bulletPoints.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl><Input {...field} placeholder={`Bullet point ${index + 1}`} /></FormControl>
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ id: uuidv4(), value: '' })}
                  disabled={fields.length >= 5}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Bullet Point
                </Button>
              </div>
            </div>

            {/* AI Optimization Section */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <h4 className="font-semibold flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary"/> AI Content Optimizer</h4>
                        <p className="text-sm text-muted-foreground">Optimize the title, description, and bullet points for a specific marketplace.</p>
                    </div>
                     <Select onValueChange={(value: Marketplace) => onOptimize(value)} disabled={!!isOptimizing}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder={isOptimizing ? 'Optimizing...' : 'Select Marketplace'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="google">Google</SelectItem>
                            <SelectItem value="amazon">Amazon</SelectItem>
                            <SelectItem value="walmart">Walmart</SelectItem>
                            <SelectItem value="ebay">eBay</SelectItem>
                            <SelectItem value="etsy">Etsy</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Media Section */}
            <SectionHeader title="Media" description="Upload images and videos for your product." />
            
            <div className="space-y-6">
                 <Tabs defaultValue="upload-images">
                    <div className="flex items-center justify-between">
                         <FormLabel>Images (up to 7)</FormLabel>
                        <TabsList>
                            <TabsTrigger value="upload-images">Upload</TabsTrigger>
                            <TabsTrigger value="url-images">URL</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="upload-images">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-2">
                            {Array.from({ length: 7 }).map((_, i) => (
                               <FileUploadPlaceholder key={i} icon={ImageIcon} label={`Image ${i + 1}`} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="url-images">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                             {Array.from({ length: 7 }).map((_, i) => (
                               <UrlUpload key={i} name={`imageUrl${i + 1}`} control={form.control} label={`Image URL ${i + 1}`} />
                            ))}
                        </div>
                    </TabsContent>
                 </Tabs>

                 <Tabs defaultValue="upload-videos">
                    <div className="flex items-center justify-between">
                         <FormLabel>Videos (up to 2)</FormLabel>
                        <TabsList>
                            <TabsTrigger value="upload-videos">Upload</TabsTrigger>
                            <TabsTrigger value="url-videos">URL</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="upload-videos">
                        <div className="grid grid-cols-2 gap-4 mt-2">
                             {Array.from({ length: 2 }).map((_, i) => (
                               <FileUploadPlaceholder key={i} icon={Video} label={`Video ${i + 1}`} />
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="url-videos">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <UrlUpload key={i} name={`videoUrl${i + 1}`} control={form.control} label={`Video URL ${i+1}`} />
                            ))}
                        </div>
                    </TabsContent>
                 </Tabs>
            </div>


            {/* SEO & Keywords Section */}
            <SectionHeader title="SEO & Keywords" description="Add keywords to improve discoverability on different channels." />
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="googleKeywords"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Google Keywords</FormLabel>
                        <FormControl><Textarea {...field} placeholder="e.g., leather wallet, bifold, mens gift" /></FormControl>
                        <FormDescription>Comma-separated keywords for Google Search.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="amazonKeywords"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amazon Search Terms</FormLabel>
                        <FormControl><Textarea {...field} placeholder="e.g., slim wallet, rfid blocking, genuine leather" /></FormControl>
                        <FormDescription>Backend keywords for Amazon's A9 algorithm.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="walmartKeywords"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Walmart Keywords</FormLabel>
                        <FormControl><Textarea {...field} placeholder="e.g., durable wallet, gift for dad, card holder" /></FormControl>
                         <FormDescription>Keywords for Walmart's search engine.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="ebayKeywords"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>eBay Keywords</FormLabel>
                        <FormControl><Textarea {...field} placeholder="e.g., new leather wallet, mens accessory, classic bifold" /></FormControl>
                        <FormDescription>Keywords for eBay search and promoted listings.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="etsyKeywords"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Etsy Tags</FormLabel>
                        <FormControl><Textarea {...field} placeholder="e.g., handmade wallet, personalized gift, minimalist leather" /></FormControl>
                        <FormDescription>13 comma-separated tags for Etsy search.</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
          </CardContent>
          <CardFooter className="flex justify-end pt-8">
            <Button type="submit" disabled={isSubmitting || !!isOptimizing}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create Product'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

    

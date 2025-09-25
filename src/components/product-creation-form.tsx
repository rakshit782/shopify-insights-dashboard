
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Trash2, Wand2, Plus, Image as ImageIcon, Video, X, Link as LinkIcon, CheckCircle, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { handleOptimizeContent, handleGetCredentialStatuses, handleCreateProduct } from '@/app/actions';
import { RichTextEditor } from './rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Checkbox } from './ui/checkbox';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  marketplaces: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;
type Marketplace = 'google' | 'amazon' | 'walmart' | 'ebay' | 'etsy';

const platformMeta: { [key: string]: { name: string; icon: React.ReactNode } } = {
    'shopify': { name: 'Shopify', icon: <Image src="/shopify.svg" alt="Shopify" width={20} height={20} unoptimized /> },
    'amazon': { name: 'Amazon', icon: <Image src="/amazon.svg" alt="Amazon" width={20} height={20} unoptimized /> },
    'walmart': { name: 'Walmart', icon: <Image src="/walmart.svg" alt="Walmart" width={20} height={20} unoptimized /> },
    'ebay': { name: 'eBay', icon: <Image src="/ebay.svg" alt="eBay" width={20} height={20} unoptimized /> },
    'etsy': { name: 'Etsy', icon: <Image src="/etsy.svg" alt="Etsy" width={20} height={20} unoptimized /> },
    'wayfair': { name: 'Wayfair', icon: <Image src="/wayfair.svg" alt="Wayfair" width={20} height={20} unoptimized /> },
};


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
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="https://... (must be a direct link)" className="pl-9" />
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

// Simple unique ID generator
const getUniqueId = () => `${Date.now()}-${Math.random()}`;

export function ProductCreationForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState<Marketplace | null>(null);
  const [channelStatuses, setChannelStatuses] = useState<Record<string, boolean>>({});
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      bulletPoints: [{ id: getUniqueId(), value: '' }],
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
      marketplaces: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'bulletPoints',
  });

   useEffect(() => {
    async function fetchStatuses() {
        setIsLoadingChannels(true);
        const result = await handleGetCredentialStatuses();
        if (result.success && result.statuses) {
            setChannelStatuses(result.statuses);
            // Pre-select connected marketplaces
            const connected = Object.keys(result.statuses).filter(key => result.statuses![key] && platformMeta[key]);
            form.setValue('marketplaces', connected);
        } else {
            toast({
                title: 'Error fetching channel statuses',
                description: result.error,
                variant: 'destructive'
            });
        }
        setIsLoadingChannels(false);
    }
    fetchStatuses();
  }, [form, toast]);


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
      result.data.optimizedBulletPoints.forEach(bp => append({ id: getUniqueId(), value: bp }));
      
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

    // For now, we'll create a mock product and sync it.
    // The handleCreateProduct function is now simplified.
    // A real implementation would map catalog data to Shopify/other platform schemas.
    const result = await handleCreateProduct({
        title: values.title,
        body_html: values.description || '',
        vendor: 'YourBrand', // Placeholder
        product_type: 'YourType', // Placeholder
        price: 99.99 // Placeholder
    });
    
    if (result.success) {
        toast({
        title: 'Product Created',
        description: 'The new product has been saved and synced.',
        });
        form.reset();
        router.push('/product-database');
        router.refresh();
    } else {
        toast({
        title: 'Creation Failed',
        description: result.error,
        variant: 'destructive'
        })
    }

    setIsSubmitting(false);
  };

  const connectedChannels = Object.keys(channelStatuses).filter(key => channelStatuses[key] && platformMeta[key]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Core Content Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Core Content</CardTitle>
                        <CardDescription>The foundational content for your product listing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                         <div>
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
                                onClick={() => append({ id: getUniqueId(), value: '' })}
                                disabled={fields.length >= 5}
                                >
                                <Plus className="mr-2 h-4 w-4" /> Add Bullet Point
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Media Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Media</CardTitle>
                        <CardDescription>Upload images and videos for your product.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Tabs defaultValue="upload-images">
                            <div className="flex items-center justify-between">
                                <FormLabel>Images (up to 7)</FormLabel>
                                <TabsList>
                                    <TabsTrigger value="upload-images">Upload</TabsTrigger>
                                    <TabsTrigger value="url-images">URL</TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="upload-images">
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                                    {Array.from({ length: 7 }).map((_, i) => (
                                    <FileUploadPlaceholder key={i} icon={ImageIcon} label={`Image ${i + 1}`} />
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="url-images">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
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
                    </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 space-y-8">
                 {/* AI Optimizer Card */}
                 <Card>
                    <CardHeader>
                         <h4 className="font-semibold flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary"/> AI Content Optimizer</h4>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground mb-4">Optimize the title, description, and bullet points for a specific marketplace.</p>
                         <Select onValueChange={(value: Marketplace) => onOptimize(value)} disabled={!!isOptimizing}>
                            <SelectTrigger>
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
                    </CardContent>
                 </Card>

                 {/* Publishing Card */}
                 <Card>
                    <CardHeader>
                        <CardTitle>Publishing</CardTitle>
                        <CardDescription>Select which connected marketplaces to publish this product to.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <FormField
                            control={form.control}
                            name="marketplaces"
                            render={() => (
                                <FormItem>
                                {isLoadingChannels ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-8 w-full" />
                                        <Skeleton className="h-8 w-full" />
                                    </div>
                                ) : connectedChannels.length > 0 ? (
                                        <div className="space-y-4">
                                        {connectedChannels.map((id) => (
                                            <FormField
                                            key={id}
                                            control={form.control}
                                            name="marketplaces"
                                            render={({ field }) => {
                                                return (
                                                <FormItem key={id} className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(id)}
                                                            onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), id])
                                                                : field.onChange(
                                                                    field.value?.filter(
                                                                    (value) => value !== id
                                                                    )
                                                                )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal flex items-center gap-2">
                                                        {platformMeta[id].icon}
                                                        Publish to {platformMeta[id].name}
                                                    </FormLabel>
                                                </FormItem>
                                                )
                                            }}
                                            />
                                        ))}
                                        <FormMessage />
                                        </div>
                                ) : (
                                        <div className="text-sm text-muted-foreground p-4 border border-dashed rounded-md flex items-center gap-3">
                                            <XCircle className="h-5 w-5 text-destructive" />
                                            No marketplaces connected. Please add credentials to your .env file.
                                        </div>
                                )}
                                </FormItem>
                            )}
                            />
                    </CardContent>
                 </Card>

                  {/* SEO & Keywords Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>SEO & Keywords</CardTitle>
                        <CardDescription>Add keywords to improve discoverability on different channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="googleKeywords"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Google Keywords</FormLabel>
                                <FormControl><Textarea {...field} placeholder="e.g., leather wallet, bifold, mens gift" /></FormControl>
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
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
              </div>
          </div>
          
          <div className="flex justify-end mt-8">
            <Button type="submit" size="lg" disabled={isSubmitting || !!isOptimizing}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Create & Publish Product'}
            </Button>
          </div>
      </form>
    </Form>
  );
}

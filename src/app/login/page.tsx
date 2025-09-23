
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { login, signup } from '@/app/auth/actions';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

// Refine the schema to make names required for sign-up
const refinedSchema = formSchema.superRefine((data, ctx) => {
    if (data.isSignUp) {
        if (!data.firstName || data.firstName.length < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'First name is required.',
                path: ['firstName'],
            });
        }
        if (!data.lastName || data.lastName.length < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Last name is required.',
                path: ['lastName'],
            });
        }
    }
});


type FormValues = z.infer<typeof refinedSchema> & { isSignUp?: boolean };


export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(refinedSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    let errorMessage = 'An unknown error occurred.';

    try {
        if (isSignUp) {
            const result = await signup({
                email: values.email,
                password: values.password,
                firstName: values.firstName!,
                lastName: values.lastName!,
            });
            if (result?.error) {
                errorMessage = result.error;
                throw new Error(errorMessage);
            }
            toast({
                title: 'Check your email',
                description: 'A confirmation link has been sent to your email address.',
            });
             setIsSignUp(false); // Switch back to login view
             form.reset();
        } else {
            const result = await login({
                email: values.email,
                password: values.password,
            });
             if (!result.success) {
                errorMessage = result.error || errorMessage;
                throw new Error(errorMessage);
             }
             // On successful login, redirect to the homepage.
             router.push('/');
             router.refresh();
        }
    } catch (error) {
        toast({
            title: `Authentication Failed`,
            description: error instanceof Error ? error.message : errorMessage,
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-background">
       <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://picsum.photos/seed/login-bg/1920/1080)', filter: 'blur(4px) brightness(0.7)' }}></div>
       <div className="relative z-10 flex flex-col items-center">
            <h1 className="mb-8 text-4xl font-bold text-white drop-shadow-md">Shopify Insights</h1>
            <Card className="w-full max-w-sm">
                <CardHeader>
                <CardTitle>{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
                <CardDescription>
                    {isSignUp ? 'Enter your details to create an account.' : 'Enter your credentials to access your account.'}
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => onSubmit({...data, isSignUp}))} className="space-y-4">
                     <div className={cn("grid grid-cols-2 gap-4 transition-all duration-300", isSignUp ? "opacity-100" : "opacity-0 h-0 overflow-hidden")}>
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input type="email" placeholder="m@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isSignUp ? 'Sign Up' : 'Sign In'}
                    </Button>
                    </form>
                </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center justify-center text-sm">
                    <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </Button>
                </CardFooter>
            </Card>
       </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import Image from 'next/image';
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

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
        if (isSignUp) {
            const result = await signup(values);
            if (result?.error) throw new Error(result.error);
            toast({
                title: 'Check your email',
                description: 'A confirmation link has been sent to your email address.',
            });
        } else {
            const result = await login(values);
             if (result?.error) throw new Error(result.error);
        }
    } catch (error) {
        toast({
            title: `Authentication Failed`,
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
        form.reset();
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

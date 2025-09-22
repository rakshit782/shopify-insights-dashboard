
import { signup } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { ChromeIcon, GithubIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function SignupPage() {
    const loginImage = PlaceHolderImages.find(p => p.id === 'login-background');
  return (
     <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
       <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" name="first-name" placeholder="Max" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" name="last-name" placeholder="Robinson" required />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" />
              </div>
              <Button formAction={signup} className="w-full">
                Create an account
              </Button>
            </div>
            </form>
            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                    <GithubIcon className="mr-2 h-4 w-4" />
                    GitHub
                </Button>
                <Button variant="outline">
                    <ChromeIcon className="mr-2 h-4 w-4" />
                    Google
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
        <div className="hidden bg-muted lg:block relative">
            {loginImage && (
                <Image
                    src={loginImage.imageUrl}
                    alt={loginImage.description}
                    fill
                    unoptimized
                    className="object-cover dark:brightness-[0.3] dark:grayscale"
                    data-ai-hint={loginImage.imageHint}
                />
            )}
        </div>
    </div>
  )
}

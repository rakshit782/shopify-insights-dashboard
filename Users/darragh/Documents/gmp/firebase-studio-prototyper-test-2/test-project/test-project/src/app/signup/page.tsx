
import { signup } from '@/app/auth/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChromeIcon, GithubIcon, SlackIcon, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#233C8B] to-[#121E45] p-4 flex items-center justify-center relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-[-50px] right-[-50px] h-64 w-64 bg-white/5 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-[-50px] left-[-50px] h-72 w-72 bg-blue-400/5 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 h-56 w-56 bg-indigo-400/5 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-8 text-white z-10">
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-6 w-6" />
                    <h1 className="text-xl font-bold">Your Logo</h1>
                </div>
                <h2 className="text-3xl font-bold">Create an Account</h2>
            </div>
            
            <form>
                <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="first-name">First name</Label>
                        <Input id="first-name" name="first-name" placeholder="Max" required className="bg-white/10 border-white/20 placeholder:text-gray-300 text-white focus:ring-white"/>
                        </div>
                        <div className="grid gap-2">
                        <Label htmlFor="last-name">Last name</Label>
                        <Input id="last-name" name="last-name" placeholder="Robinson" required className="bg-white/10 border-white/20 placeholder:text-gray-300 text-white focus:ring-white"/>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="username@gmail.com"
                        required
                        className="bg-white/10 border-white/20 placeholder:text-gray-300 text-white focus:ring-white"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            name="password" 
                            type="password"
                            placeholder="Create a password"
                            className="bg-white/10 border-white/20 placeholder:text-gray-300 text-white focus:ring-white"
                        />
                    </div>
                    <Button formAction={signup} className="w-full bg-[#121E45] hover:bg-opacity-90 text-white font-bold text-base h-11">
                        Create an account
                    </Button>
                </div>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#233C8B] bg-opacity-50 backdrop-blur-sm px-2 text-gray-300">
                        or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                 <Button variant="outline" className="bg-white/90 text-gray-800 hover:bg-white">
                    <ChromeIcon className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="bg-white/90 text-gray-800 hover:bg-white">
                    <GithubIcon className="h-5 w-5" />
                </Button>
                <Button variant="outline" className="bg-white/90 text-gray-800 hover:bg-white">
                    <SlackIcon className="h-5 w-5" />
                </Button>
            </div>

            <div className="mt-6 text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="font-bold underline">
                    Sign in
                </Link>
            </div>
        </div>
    </div>
  )
}

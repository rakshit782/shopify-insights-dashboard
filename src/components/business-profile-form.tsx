
'use client';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "./ui/textarea";

export function BusinessProfileForm() {
    // In a real app, form state would be managed here, and data fetched/submitted.

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>
                        Update your company's information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name</Label>
                        <Input id="business-name" placeholder="Your Company LLC" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="business-logo">Business Logo</Label>
                        <Input id="business-logo" type="file" />
                        <p className="text-xs text-muted-foreground">
                            Upload a PNG, JPG, or SVG file. Recommended size: 256x256px.
                        </p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="business-address">Business Address</Label>
                        <Textarea id="business-address" placeholder="123 Main St, Anytown, USA 12345" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Save Business Profile</Button>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Licensing Information</CardTitle>
                    <CardDescription>
                        Details about your current software license.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <span className="font-medium text-sm">License Tier</span>
                        <span className="text-sm">Premium</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <span className="font-medium text-sm">Valid Until</span>
                        <span className="text-sm">December 31, 2025</span>
                    </div>
                     <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <span className="font-medium text-sm">Status</span>
                        <span className="text-sm text-green-600">Active</span>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline">Manage Subscription</Button>
                </CardFooter>
            </Card>
        </div>
    )
}

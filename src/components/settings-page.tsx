
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ProfileForm } from "./profile-form";
import { BusinessProfileForm } from "./business-profile-form";

export function SettingsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Settings</h1>
                <p className="text-muted-foreground mb-8">
                    Manage your account settings and preferences.
                </p>
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile & Appearance</TabsTrigger>
                        <TabsTrigger value="business">Business</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="pt-6">
                        <ProfileForm />
                    </TabsContent>
                    <TabsContent value="business" className="pt-6">
                        <BusinessProfileForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}


import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ConnectionsForm } from "./connections-form";
import { ProfileForm } from "./profile-form";

export function SettingsPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Settings</h1>
                <p className="text-muted-foreground mb-8">
                    Manage your account settings, connections, and preferences.
                </p>
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile">Profile & Appearance</TabsTrigger>
                        <TabsTrigger value="connections">Connections</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="pt-6">
                        <ProfileForm />
                    </TabsContent>
                    <TabsContent value="connections" className="pt-6">
                        <ConnectionsForm />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

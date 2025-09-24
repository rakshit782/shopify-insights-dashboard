
import { SettingsPage } from '@/components/settings-page';

// The settings page is now simplified and no longer manages business profiles
// or marketplace connections, as these are handled by environment variables.
export default function Settings() {
    return <SettingsPage />;
}

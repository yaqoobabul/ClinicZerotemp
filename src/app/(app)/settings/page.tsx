import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <Card className="w-full max-w-lg">
        <CardHeader>
            <CardTitle className="text-2xl">Settings</CardTitle>
            <CardDescription>
            This section is under construction. Soon you will be able to configure your clinic and profile settings here.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p>Coming soon...</p>
        </CardContent>
        </Card>
    </div>
  );
}

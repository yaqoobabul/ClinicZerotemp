
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';

function ProfileSettings() {
    const { user, sendPasswordReset } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        setIsLoading(true);
        try {
            await sendPasswordReset();
            toast({
                title: "Password Reset Email Sent",
                description: `An email has been sent to ${user.email} with instructions to reset your password.`,
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send password reset email.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Manage your personal account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user?.email || ''} readOnly disabled />
                </div>
                <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-muted-foreground flex-grow">For security, you can reset your password via email.</p>
                        <Button variant="outline" onClick={handlePasswordReset} disabled={isLoading}>
                             {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Password Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ClinicSettings() {
    const [clinicName, setClinicName] = useState("ClinicZero Demo");
    const { toast } = useToast();

    const handleSave = () => {
        // In a real app, you would save this to your database
        toast({
            title: "Clinic Name Updated",
            description: `Your clinic name has been set to "${clinicName}".`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clinic</CardTitle>
                <CardDescription>Manage your clinic's general information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input 
                        id="clinic-name" 
                        value={clinicName} 
                        onChange={(e) => setClinicName(e.target.value)} 
                    />
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave}>Save Changes</Button>
                </div>
            </CardContent>
        </Card>
    );
}

function StaffManagement() {
    const { createUser } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUser(email, password);
            toast({
                title: "Staff Account Created",
                description: `An account for ${email} has been successfully created.`,
            });
            setEmail('');
            setPassword('');
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Creation Failed",
                description: error.message || "Could not create staff account.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Staff Management</CardTitle>
                <CardDescription>Create and manage login credentials for your staff.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="staff-email">Staff Email</Label>
                        <Input 
                            id="staff-email" 
                            type="email" 
                            placeholder="staff.member@example.com" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="staff-password">Temporary Password</Label>
                        <Input 
                            id="staff-password" 
                            type="password" 
                            placeholder="Create a strong password" 
                            required 
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">The staff member will be prompted to change this on first login.</p>
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Staff Account
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}


export default function SettingsPage() {
  return (
    <div className="grid flex-1 items-start gap-4">
        <CardHeader className="px-0">
            <CardTitle>Settings</CardTitle>
            <CardDescription>
                Manage your account, clinic, and staff settings.
            </CardDescription>
        </CardHeader>
        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="clinic">Clinic</TabsTrigger>
                <TabsTrigger value="staff">Staff Management</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4">
                <ProfileSettings />
            </TabsContent>
            <TabsContent value="clinic" className="mt-4">
                <ClinicSettings />
            </TabsContent>
            <TabsContent value="staff" className="mt-4">
                <StaffManagement />
            </TabsContent>
        </Tabs>
    </div>
  );
}

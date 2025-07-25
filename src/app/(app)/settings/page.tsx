
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from 'lucide-react';
import { useClinic } from '@/context/PatientContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const doctorProfileSchema = z.object({
    name: z.string().min(1, "Name is required."),
    registrationId: z.string().min(1, "Registration ID is required."),
    qualification: z.string().min(1, "Qualification is required."),
});

function ProfileSettings() {
    const { user, sendPasswordReset } = useAuth();
    const { doctors, updateDoctorProfile, addDoctor } = useClinic();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const currentUserDoctorProfile = doctors.find(d => d.uid === user?.uid);

    const form = useForm<z.infer<typeof doctorProfileSchema>>({
        resolver: zodResolver(doctorProfileSchema),
        defaultValues: {
            name: '',
            registrationId: '',
            qualification: '',
        }
    });

    useEffect(() => {
        if (currentUserDoctorProfile) {
            form.reset({
                name: currentUserDoctorProfile.name || user?.displayName || '',
                registrationId: currentUserDoctorProfile.registrationId || '',
                qualification: currentUserDoctorProfile.qualification || '',
            });
        } else if (user) {
             form.reset({
                name: user.displayName || '',
                registrationId: '',
                qualification: '',
            });
        }
    }, [currentUserDoctorProfile, user, form]);
    
    const handleProfileUpdate = (values: z.infer<typeof doctorProfileSchema>) => {
        if (!user) return;

        if (currentUserDoctorProfile) {
            updateDoctorProfile(currentUserDoctorProfile.id, values);
            toast({
                title: "Profile Updated",
                description: "Your professional details have been saved.",
            });
        } else {
            addDoctor({ uid: user.uid, ...values });
            toast({
                title: "Profile Created",
                description: "Your professional details have been saved.",
            });
        }
    };

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
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleProfileUpdate)}>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Manage your personal and professional account settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Dr. Jane Doe" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="qualification" render={({ field }) => (
                            <FormItem><FormLabel>Qualifications</FormLabel><FormControl><Input {...field} placeholder="e.g., MBBS, MD (General Medicine)" /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="registrationId" render={({ field }) => (
                            <FormItem><FormLabel>Registration ID</FormLabel><FormControl><Input {...field} placeholder="e.g., 12345" /></FormControl><FormMessage /></FormItem>
                        )} />
                        
                        <div className="space-y-2 pt-4">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={user?.email || ''} readOnly disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-muted-foreground flex-grow">For security, you can reset your password via email.</p>
                                <Button type="button" variant="outline" onClick={handlePasswordReset} disabled={isLoading}>
                                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Password Reset
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit">Save Changes</Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}

function ClinicSettings() {
    const { 
        clinicName, setClinicName, 
        clinicAddress, setClinicAddress,
        clinicPhone, setClinicPhone 
    } = useClinic();
    const [name, setName] = useState(clinicName);
    const [address, setAddress] = useState(clinicAddress);
    const [phone, setPhone] = useState(clinicPhone);
    const { toast } = useToast();

    const handleSave = () => {
        setClinicName(name);
        setClinicAddress(address);
        setClinicPhone(phone);
        toast({
            title: "Clinic Info Updated",
            description: `Your clinic's details have been saved.`,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clinic</CardTitle>
                <CardDescription>Manage your clinic's general information. This will appear on all generated documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input 
                        id="clinic-name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clinic-address">Clinic Address</Label>
                    <Input 
                        id="clinic-address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clinic-phone">Clinic Phone</Label>
                    <Input 
                        id="clinic-phone"
                        type="tel"
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                    />
                </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleSave}>Save Changes</Button>
            </CardFooter>
        </Card>
    );
}

function StaffManagement() {
    const { createUser, staff, deleteStaff, user: adminUser, signInWithEmail } = useAuth();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const adminEmail = adminUser?.email;
        // In a real app, you would not hardcode the admin password.
        // This is a workaround for the demo environment.
        const adminPassword = '123'; 

        if (!adminEmail) {
            toast({ variant: 'destructive', title: 'Error', description: 'Admin user not found.' });
            setIsLoading(false);
            return;
        }

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
            // Re-authenticate the admin user to restore their session
            if (adminUser) {
                try {
                    await signInWithEmail(adminEmail, adminPassword);
                } catch (reauthError: any) {
                     toast({
                        variant: "destructive",
                        title: "Session Error",
                        description: reauthError.message || "Could not restore your session. Please log out and log back in.",
                    });
                }
            }
            setIsLoading(false);
        }
    };
    

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create Staff Account</CardTitle>
                    <CardDescription>Create login credentials for your staff. The password cannot be recovered, so please share it securely.</CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateStaff}>
                    <CardContent className="space-y-4">
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
                                <p className="text-xs text-muted-foreground">The staff member can reset this password later if needed.</p>
                            </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Staff Account
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Existing Staff</CardTitle>
                    <CardDescription>List of all created staff accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {staff.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No staff accounts created yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {staff.map((staffMember) => (
                                <li key={staffMember.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <span className="font-medium text-sm">{staffMember.email}</span>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action will permanently disable the staff account for {staffMember.email}. They will no longer be able to log in.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => deleteStaff(staffMember.id)}>
                                            Yes, delete account
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
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

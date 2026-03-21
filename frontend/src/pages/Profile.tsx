import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IdCard, Mail, User, ShieldCheck, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
    const { user } = useAuth();
    const [govId, setGovId] = useState('');

    const handleSaveGovId = () => {
        if (!govId.trim()) {
            toast.error('Please enter a valid Government ID.');
            return;
        }
        // Simulate API call
        toast.success('Government ID successfully linked to your account!');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Please log in to view your profile.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <main className="flex-1 container max-w-5xl mx-auto py-12 px-4 md:px-6">
                <div className="flex items-center space-x-6 mb-10">
                    <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-xl">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=800000,000000`} alt={user.name} />
                        <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">{user.name}</h1>
                        <Badge variant="secondary" className="text-sm px-3 py-1 uppercase tracking-wider font-semibold bg-secondary/50 border border-border/50">
                            {user.role} Account
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Account Details Card */}
                    <Card className="shadow-lg border-border/50 overflow-hidden">
                        <CardHeader className="bg-secondary/30 pb-5 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <User className="h-6 w-6 text-primary" />
                                Account Outline
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">Personal information associated with your account profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-7 pt-7">
                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-2 font-medium">
                                    <User className="h-4 w-4" /> Full Name
                                </Label>
                                <div className="font-bold text-xl text-foreground">{user.name}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-2 font-medium">
                                    <Mail className="h-4 w-4" /> Email Address
                                </Label>
                                <div className="font-bold text-xl text-foreground">{user.email}</div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-muted-foreground flex items-center gap-2 font-medium">
                                    <ShieldCheck className="h-4 w-4" /> Account Role
                                </Label>
                                <div className="font-bold text-xl text-foreground capitalize">{user.role}</div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Verification / Government ID Card */}
                    <Card className="shadow-lg border-border/50 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110 duration-700" />
                        <CardHeader className="bg-primary/5 pb-5 border-b border-border/50">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <IdCard className="h-6 w-6 text-primary" />
                                Government Verification
                            </CardTitle>
                            <CardDescription className="text-sm mt-1">Link your official Government ID to unlock full portal features and report authentication.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-7">
                            <div className="space-y-4">
                                <Label htmlFor="gov-id" className="text-foreground font-semibold text-base">Government ID Number (Aadhar / PAN)</Label>
                                <Input
                                    id="gov-id"
                                    placeholder="Enter your 12-digit Aadhar or PAN number"
                                    value={govId}
                                    onChange={(e) => setGovId(e.target.value)}
                                    className="border-primary/20 focus-visible:ring-primary/50 text-lg py-6 tracking-widest placeholder:tracking-normal placeholder:font-normal font-semibold shadow-inner"
                                />
                                <p className="text-xs text-muted-foreground leading-relaxed">Your ID is entirely encrypted securely and used exclusively for robust identity verification strictly within the Smart Nagar Reporting Portal. We do not share this data with 3rd parties.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-secondary/10 border-t border-border/50 py-5 flex justify-end">
                            <Button onClick={handleSaveGovId} className="gap-2 font-bold px-8 py-5 text-sm shadow-md hover:shadow-lg transition-all">
                                <Save className="h-4 w-4" />
                                Save & Verify
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}

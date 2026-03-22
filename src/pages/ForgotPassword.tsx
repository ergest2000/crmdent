import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    if (error) {
      toast({ title: "Gabim", description: error, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl bg-white shadow-xl border border-border/30 p-8 space-y-6">
          <div className="text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">D</div>
            <h1 className="mt-3 text-xl font-semibold text-foreground">Rivendos Fjalëkalimin</h1>
            <p className="text-sm text-muted-foreground mt-1">Do të marrësh një email me linkun e rivendosjes</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <p className="text-sm text-foreground">Email-i u dërgua me sukses te <strong>{email}</strong></p>
              <p className="text-xs text-muted-foreground">Kontrollo inbox-in (dhe spam) për linkun e rivendosjes.</p>
              <Link to="/login">
                <Button variant="outline" className="gap-2 mt-2"><ArrowLeft className="h-4 w-4" /> Kthehu te Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@shembull.com" className="pl-10 h-10" />
                </div>
              </div>
              <Button type="submit" className="w-full h-10" disabled={isLoading}>
                {isLoading ? "Duke dërguar..." : "Dërgo Linkun"}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-xs text-primary hover:underline">Kthehu te Login</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

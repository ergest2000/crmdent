import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const loading = useAuthStore((s) => s.loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await resetPassword(email);
    if (error) {
      toast({ title: "Gabim", description: error, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">D</div>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Rivendos Fjalëkalimin</h1>
            <p className="text-sm text-muted-foreground">
              {sent ? "Kontrollo email-in tënd" : "Shkruaj email-in për të marrë linkun e rivendosjes"}
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Kemi dërguar një link rivendosjeje te <strong>{email}</strong>. Kontrollo inbox-in dhe spam-in.
              </p>
              <Link to="/login">
                <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Kthehu te Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className="h-10" />
              </div>
              <Button type="submit" className="w-full h-10 gap-2" disabled={loading}>
                <Mail className="h-4 w-4" /> {loading ? "Duke dërguar..." : "Dërgo Linkun"}
              </Button>
              <p className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">Kthehu te Login</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

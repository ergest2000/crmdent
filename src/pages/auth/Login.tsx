import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await login(email, password);
    if (error) {
      toast({ title: "Gabim", description: error, variant: "destructive" });
    } else {
      navigate("/");
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
            <h1 className="text-xl font-semibold text-foreground">DenteOS</h1>
            <p className="text-sm text-muted-foreground">Hyni në llogarinë tuaj</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className="h-10" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fjalëkalimi</label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Keni harruar fjalëkalimin?</Link>
            </div>
            <Button type="submit" className="w-full h-10 gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" /> {loading ? "Duke hyrë..." : "Hyr"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Nuk keni llogari?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Regjistrohu</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

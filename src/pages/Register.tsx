import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("client");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Gabim", description: "Fjalëkalimi duhet të ketë të paktën 6 karaktere", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const { error } = await register(email, password, fullName, role);
    setIsLoading(false);
    if (error) {
      toast({ title: "Gabim", description: error, variant: "destructive" });
    } else {
      toast({ title: "Sukses!", description: "Llogaria u krijua me sukses" });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl bg-white shadow-xl border border-border/30 p-8 space-y-6">
          <div className="text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">D</div>
            <h1 className="mt-3 text-xl font-semibold text-foreground">DenteOS</h1>
            <p className="text-sm text-muted-foreground mt-1">Krijo një llogari të re</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Emri i plotë *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Emri Mbiemri" className="pl-10 h-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@shembull.com" className="pl-10 h-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fjalëkalimi *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 6 karaktere" className="pl-10 pr-10 h-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Roli</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client">Klient</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? "Duke krijuar..." : "Regjistrohu"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Keni llogari?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Hyr</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

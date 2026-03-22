import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("client");
  const [showPass, setShowPass] = useState(false);
  const register = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Gabim", description: "Fjalëkalimi duhet të jetë të paktën 6 karaktere", variant: "destructive" });
      return;
    }
    const { error } = await register(email, password, fullName, role);
    if (error) {
      toast({ title: "Gabim", description: error, variant: "destructive" });
    } else {
      toast({ title: "Sukses", description: "Llogaria u krijua! Duke hyrë..." });
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
            <h1 className="text-xl font-semibold text-foreground">Krijo Llogari</h1>
            <p className="text-sm text-muted-foreground">Regjistrohu në DenteOS</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Emri i plotë *</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Emri Mbiemri" className="h-10" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email *</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className="h-10" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fjalëkalimi *</label>
              <div className="relative">
                <Input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 6 karaktere" className="h-10 pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
            <Button type="submit" className="w-full h-10 gap-2" disabled={loading}>
              <UserPlus className="h-4 w-4" /> {loading ? "Duke u regjistruar..." : "Regjistrohu"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Keni llogari?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Hyr</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

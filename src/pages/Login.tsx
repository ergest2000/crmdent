import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Lock, User, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  isDemoEmail,
  provisionDemo,
  ensureDemoReady,
} from "@/lib/demo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  // Butoni "Fill demo credentials": mbush fushat dhe siguron demo user-in në sfond.
  const handleFillDemo = async () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setDemoBusy(true);
    try {
      const r = await provisionDemo();
      if (!r.ok) {
        toast({
          title: "Kujdes",
          description: "Demo po përgatitet ende. Nëse hyrja dështon, kliko sërish pas pak sekondash.",
        });
      }
    } finally {
      setDemoBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Username -> email i brendshem (nese s'ka "@")
    const loginId = email.includes("@") ? email.trim() : `${email.trim().toLowerCase()}@crmdent.local`;

    let { error } = await login(loginId, password);

    // Nese eshte demo dhe hyrja deshton, sigurohu qe demo user ekziston dhe riprovo
    if (error && isDemoEmail(loginId)) {
      await provisionDemo();
      ({ error } = await login(loginId, password));
    }

    if (error) {
      setIsLoading(false);
      toast({ title: "Gabim", description: error, variant: "destructive" });
      return;
    }

    // Per demo: rikthe klinikën në gjendjen fillestare (të dhëna të plota, jo bosh)
    if (isDemoEmail(loginId)) {
      setPreparing(true);
      await ensureDemoReady();
    }

    setIsLoading(false);
    navigate("/app");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl bg-white shadow-xl border border-border/30 p-8 space-y-6">
          <div className="text-center">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">D</div>
            <h1 className="mt-3 text-xl font-semibold text-foreground">DenteOS</h1>
            <p className="text-sm text-muted-foreground mt-1">Hyr në llogarinë tënde</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Username ose email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="username ose email" className="pl-10 h-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Fjalëkalimi</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="pl-10 pr-10 h-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Keni harruar fjalëkalimin?</Link>
            </div>
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {preparing ? "Po përgatitet demo..." : isLoading ? "Duke hyrë..." : "Hyr"}
            </Button>
          </form>

          {/* --- DEMO --- */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-white px-2 text-muted-foreground uppercase tracking-wider">ose</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full h-10 gap-2"
            onClick={handleFillDemo}
            disabled={demoBusy || isLoading}
          >
            {demoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Fill demo credentials
          </Button>
          <p className="text-center text-[11px] text-muted-foreground -mt-2">
            demo@dentalcrm.com · demo123 — pastaj kliko <span className="font-medium">Hyr</span>
          </p>

          <div className="text-center text-sm text-muted-foreground">
            Nuk keni llogari?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Regjistrohu</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

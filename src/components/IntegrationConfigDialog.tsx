import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useIntegrationStore } from "@/stores/integration-store";
import { Loader2, CheckCircle2, AlertCircle, MessageSquare, Mail, Calendar, Facebook, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonLabel: string;
  buttonColor: string;
  iconBg: string;
}

const platformInfo: Record<string, PlatformInfo> = {
  whatsapp: {
    title: "WhatsApp Business",
    description: "Lidhuni me WhatsApp Business për të marrë dhe dërguar mesazhe direkt nga CRM. Autorizimi bëhet përmes llogarisë suaj Meta Business.",
    icon: <MessageSquare className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />,
    buttonLabel: "Vazhdo me WhatsApp",
    buttonColor: "bg-[#25D366] hover:bg-[#20bd5a] text-white",
    iconBg: "bg-[#25D366]",
  },
  facebook: {
    title: "Facebook Messenger",
    description: "Lidhuni faqen tuaj Facebook me CRM për të menaxhuar mesazhet e Messenger. Zgjidhni faqen dhe autorizoni aksesin.",
    icon: <Facebook className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />,
    buttonLabel: "Vazhdo me Facebook",
    buttonColor: "bg-[#1877F2] hover:bg-[#166fe5] text-white",
    iconBg: "bg-[#1877F2]",
  },
  instagram: {
    title: "Instagram Direct",
    description: "Lidhuni llogarinë tuaj Instagram Business me CRM për të menaxhuar mesazhet direkte. Kërkon llogari Instagram Business të lidhur me Facebook.",
    icon: <Instagram className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />,
    buttonLabel: "Vazhdo me Instagram",
    buttonColor: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white",
    iconBg: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
  },
  email: {
    title: "Email (Gmail)",
    description: "Lidhuni llogarinë tuaj Gmail me CRM për të marrë dhe dërguar email direkt nga sistemi. Autorizimi bëhet përmes Google OAuth.",
    icon: <Mail className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />,
    buttonLabel: "Vazhdo me Google",
    buttonColor: "bg-[#EA4335] hover:bg-[#d33426] text-white",
    iconBg: "bg-[#EA4335]",
  },
  google_calendar: {
    title: "Google Calendar",
    description: "Sinkronizoni takimet e CRM me Google Calendar. Të gjitha takimet do të shfaqen automatikisht në të dyja kalenaret.",
    icon: <Calendar className="h-6 w-6 text-[hsl(var(--primary-foreground))]" />,
    buttonLabel: "Vazhdo me Google",
    buttonColor: "bg-[#4285F4] hover:bg-[#3b78db] text-white",
    iconBg: "bg-[#4285F4]",
  },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: string;
  onSuccess?: () => void;
}

export function IntegrationConfigDialog({ open, onOpenChange, platform, onSuccess }: Props) {
  const info = platformInfo[platform];
  const fetchIntegrations = useIntegrationStore((s) => s.fetchIntegrations);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Listen for OAuth popup result
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === "oauth_result") {
        if (event.data.status === "success") {
          setStatus("success");
          toast({ title: `${info?.title} u lidh me sukses!` });
          fetchIntegrations();
          setTimeout(() => {
            onOpenChange(false);
            setStatus("idle");
            onSuccess?.();
          }, 1500);
        } else {
          setStatus("error");
          setErrorMsg(event.data.detail || "Lidhja dështoi. Provo përsëri.");
        }
      }
    },
    [info, fetchIntegrations, onOpenChange, onSuccess]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  if (!info) return null;

  const handleConnect = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      const { data, error } = await supabase.functions.invoke("oauth-start", {
        body: { platform },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (!data?.auth_url) throw new Error("Nuk u mor URL e autorizimit");

      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.auth_url,
        `oauth_${platform}`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
      );

      if (!popup) {
        throw new Error("Popup u bllokua nga browser-i. Lejo popup-et për këtë faqe.");
      }

      // Monitor popup close
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          // If still loading after popup closes, check if it was successful
          setTimeout(async () => {
            if (status === "loading") {
              await fetchIntegrations();
              const integration = useIntegrationStore.getState().getIntegration(platform);
              if (integration?.is_connected) {
                setStatus("success");
                toast({ title: `${info.title} u lidh me sukses!` });
                setTimeout(() => {
                  onOpenChange(false);
                  setStatus("idle");
                  onSuccess?.();
                }, 1500);
              } else {
                setStatus("idle");
              }
            }
          }, 1000);
        }
      }, 500);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Lidhja dështoi. Provo përsëri.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (status !== "loading") {
          onOpenChange(v);
          setStatus("idle");
          setErrorMsg("");
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${info.iconBg}`}>
              {info.icon}
            </div>
            {info.title}
          </DialogTitle>
          <DialogDescription className="pt-1">{info.description}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {status === "success" ? (
            <div className="py-6 text-center space-y-3">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium text-foreground">Lidhja u krye me sukses!</p>
              <p className="text-xs text-muted-foreground">Mesazhet dhe të dhënat do të sinkronizohen automatikisht.</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
                <p className="text-xs font-medium text-foreground">Si funksionon:</p>
                <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                  <li>Klikoni butonin më poshtë për të hapur dritaren e autorizimit</li>
                  <li>Identifikohuni me llogarinë tuaj</li>
                  <li>Autorizoni aksesin për CRM</li>
                  <li>Lidhja bëhet automatikisht</li>
                </ol>
              </div>

              <Button
                onClick={handleConnect}
                disabled={status === "loading"}
                className={`w-full h-11 gap-2 font-medium ${info.buttonColor}`}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Duke u lidhur...
                  </>
                ) : (
                  <>
                    {info.icon}
                    {info.buttonLabel}
                  </>
                )}
              </Button>

              {status === "error" && errorMsg && (
                <div className="flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-destructive">{errorMsg}</p>
                    <button
                      onClick={() => { setStatus("idle"); setErrorMsg(""); }}
                      className="text-xs text-destructive/80 underline mt-1"
                    >
                      Provo përsëri
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground text-center">
                Të dhënat tuaja janë të sigurta. Token-et ruhen në mënyrë të enkriptuar.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

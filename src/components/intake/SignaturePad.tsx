import { useRef, useEffect, useCallback } from "react";
import SignaturePadLib from "signature_pad";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface Props {
  value: string;
  onChange: (data: string) => void;
}

export function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pad = new SignaturePadLib(canvas, {
      backgroundColor: "rgb(255,255,255)",
      penColor: "rgb(0,0,0)",
    });
    padRef.current = pad;

    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      pad.clear();
      if (value) {
        pad.fromDataURL(value);
      }
    };
    resize();
    window.addEventListener("resize", resize);

    pad.addEventListener("endStroke", () => {
      onChange(pad.toDataURL());
    });

    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
    };
  }, []);

  const clear = useCallback(() => {
    padRef.current?.clear();
    onChange("");
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="border rounded-md overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: 150, touchAction: "none" }}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={clear} className="gap-1.5">
        <Eraser className="h-3.5 w-3.5" />
        Pastro firmën
      </Button>
    </div>
  );
}

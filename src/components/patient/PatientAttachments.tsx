import { useRef, useState } from "react";
import { Upload, Eye, Trash2, FileText, Download, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePatientStore, type FullPatient } from "@/stores/patient-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  patient: FullPatient;
}

export function PatientAttachments({ patient }: Props) {
  const updatePatient = usePatientStore((s) => s.updatePatient);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const photos = patient.documents.filter((d) => d.type === "Foto");
  const docs = patient.documents.filter((d) => d.type !== "Foto");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newDocs = [...patient.documents];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const filePath = `${patient.id}/${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const { error } = await supabase.storage.from("patient-attachments").upload(filePath, file);
      if (error) {
        toast({ title: "Gabim gjatë ngarkimit", description: error.message, variant: "destructive" });
        continue;
      }
      const { data: urlData } = supabase.storage.from("patient-attachments").getPublicUrl(filePath);
      const docType = file.type.includes("image") ? "Foto" : file.name.endsWith(".pdf") ? "PDF" : "Dokument";
      newDocs.push({
        id: `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: docType,
        date: new Date().toISOString().split("T")[0],
        url: urlData.publicUrl,
      });
    }

    updatePatient(patient.id, { documents: newDocs });
    setUploading(false);
    toast({ title: `${files.length} dokument(e) u ngarkuan` });
    e.target.value = "";
  };

  const handleDelete = (docId: string) => {
    updatePatient(patient.id, { documents: patient.documents.filter((d) => d.id !== docId) });
    toast({ title: "Dokumenti u fshi" });
  };

  return (
    <>
      <div className="rounded-card bg-card shadow-subtle p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Attachments & Media
              {patient.documents.length > 0 && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">({patient.documents.length})</span>
              )}
            </h3>
          </div>
          <div>
            <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.doc,.docx" className="hidden" onChange={handleFileUpload} />
            <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-3 w-3" /> {uploading ? "Duke ngarkuar..." : "Ngarko File"}
            </Button>
          </div>
        </div>

        {patient.documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Image className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-xs">Nuk ka dokumente. Ngarko foto, radiografi ose dokumente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Photos grid */}
            {photos.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Foto & Radiografi ({photos.length})</p>
                <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-1.5">
                  {photos.map((doc) => (
                    <div
                      key={doc.id}
                      className="relative group rounded-inner overflow-hidden aspect-square bg-muted cursor-pointer border border-border/30"
                      onClick={() => doc.url && setPreviewImage(doc.url)}
                    >
                      <img src={doc.url} alt={doc.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                        <Eye className="h-3.5 w-3.5 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded bg-destructive/80 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents list */}
            {docs.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Dokumente ({docs.length})</p>
                <div className="flex flex-wrap gap-2">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 rounded-inner bg-muted/50 px-2.5 py-1.5 text-xs border border-border/30">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground max-w-[120px] truncate">{doc.name}</span>
                      <span className="text-muted-foreground">{doc.date}</span>
                      {doc.url && (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </a>
                      )}
                      <button onClick={() => handleDelete(doc.id)}>
                        <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-2">
          {previewImage && <img src={previewImage} alt="Preview" className="w-full h-auto rounded-inner" />}
        </DialogContent>
      </Dialog>
    </>
  );
}

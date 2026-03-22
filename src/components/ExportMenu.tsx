import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export function ExportMenu({ onExportPDF, onExportCSV }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Shkarko
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportPDF} className="gap-2 cursor-pointer">
          <FileText className="h-3.5 w-3.5" />
          Shkarko PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportCSV} className="gap-2 cursor-pointer">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Shkarko CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

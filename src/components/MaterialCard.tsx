import { motion } from "framer-motion";
import { FileText, ExternalLink, Clock, Archive, Trash2, Download } from "lucide-react";
import type { Material } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { format, isPast } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { playClickSfx } from "@/hooks/use-sfx";

interface Props {
  material: Material;
  index: number;
  isAdmin?: boolean;
  showDelete?: boolean;
  showEdit?: boolean;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const MaterialCard = ({ material, index, isAdmin, showDelete = true, showEdit = true, onArchive, onDelete }: Props) => {
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? ar : enUS;
  const deadlinePast = material.deadline && isPast(new Date(material.deadline));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`glass-card rounded-xl p-5 group relative overflow-hidden ${material.archived ? "opacity-60" : ""}`}
    >
      <div className="absolute top-0 start-0 w-1 h-full bg-primary rounded-s-xl opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-display font-semibold text-sm truncate">{material.title}</h3>
          </div>

          {material.is_assignment && (
            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary mb-2">
              {t("material.assignment")}
            </span>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {material.is_assignment && !material.deadline && (
              <span className="flex items-center gap-1 text-primary">
                <Clock className="w-3 h-3" />
                {lang === "ar" ? "مفتوح (بدون موعد نهائي)" : "Open-ended"}
              </span>
            )}
            {material.deadline && (
              <span className={`flex items-center gap-1 ${deadlinePast ? "text-destructive" : ""}`}>
                <Clock className="w-3 h-3" />
                {format(new Date(material.deadline), "dd MMM yyyy", { locale })}
                {deadlinePast && ` (${t("material.expired")})`}
              </span>
            )}
            {material.pdf_url && (
              <a href={material.pdf_url} target="_blank" rel="noopener noreferrer" onClick={() => playClickSfx()} className="flex items-center gap-1 text-primary hover:underline">
                <Download className="w-3 h-3" /> {material.pdf_display_name || t("material.downloadPdf")}
              </a>
            )}
            {material.external_link && (
              <a href={material.external_link} target="_blank" rel="noopener noreferrer" onClick={() => playClickSfx()} className="flex items-center gap-1 text-primary hover:underline">
                <ExternalLink className="w-3 h-3" /> {t("material.externalLink")}
              </a>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {showEdit && onArchive && !material.archived && (
              <button onClick={() => onArchive(material.id)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                <Archive className="w-4 h-4" />
              </button>
            )}
            {showDelete && onDelete && (
              <button onClick={() => onDelete(material.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MaterialCard;

import { motion } from "framer-motion";
import { db } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

const LinksPage = () => {
  const { t } = useI18n();
  const { departmentId } = useParams<{ departmentId?: string }>();
  const { data: links = [] } = useQuery({
    queryKey: ["links", departmentId || "all"],
    queryFn: () => db.getLinks(departmentId || null),
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-2">{t("links.title")}</h1>
          <p className="text-muted-foreground mb-8">{t("links.subtitle")}</p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {links.map(link => (
            <motion.a key={link.id} variants={item} href={link.url} target="_blank" rel="noopener noreferrer"
              whileHover={{ x: -4, scale: 1.01 }}
              className="glass-card rounded-xl p-5 flex items-center justify-between gap-4 group block">
              <div>
                <h3 className="font-display font-semibold">{link.title}</h3>
                {link.title_ar && <p className="text-sm text-muted-foreground">{link.title_ar}</p>}
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default LinksPage;

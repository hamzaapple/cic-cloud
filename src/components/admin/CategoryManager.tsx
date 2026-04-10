import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db, type MaterialCategory } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CategoryManager = () => {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [editNameEn, setEditNameEn] = useState("");

  const load = async () => {
    const data = await db.getCategories();
    setCategories(data);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !nameEn) { toast.error(t("cat.fieldsRequired")); return; }
    await db.addCategory({ name_ar: nameAr, name_en: nameEn });
    await load();
    setNameAr(""); setNameEn("");
    toast.success(t("cat.added"));
  };

  const startEdit = (cat: MaterialCategory) => {
    setEditingId(cat.id);
    setEditNameAr(cat.name_ar);
    setEditNameEn(cat.name_en);
  };

  const saveEdit = async (id: string) => {
    await db.updateCategory(id, { name_ar: editNameAr, name_en: editNameEn });
    await load();
    setEditingId(null);
    toast.success(t("cat.updated"));
  };

  const handleDelete = async (id: string) => {
    await db.deleteCategory(id);
    await load();
    toast.success(t("cat.deleted"));
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
        <div className="glass-card rounded-2xl p-6 sticky top-24">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> {t("cat.addCategory")}
          </h2>
          <form onSubmit={handleAdd} className="space-y-3">
            <Input placeholder={t("cat.nameAr")} value={nameAr} onChange={e => setNameAr(e.target.value)} className="bg-secondary/50" />
            <Input placeholder={t("cat.nameEn")} value={nameEn} onChange={e => setNameEn(e.target.value)} className="bg-secondary/50" />
            <Button type="submit" className="w-full">{t("cat.add")}</Button>
          </form>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
        <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5" /> {t("cat.allCategories")}
        </h2>
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">{t("cat.noCategories")}</p>
          ) : (
            categories.map((cat, i) => (
              <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-xl p-5">
                {editingId === cat.id ? (
                  <div className="space-y-2">
                    <Input value={editNameAr} onChange={e => setEditNameAr(e.target.value)} className="bg-secondary/50 text-sm" placeholder={t("cat.nameAr")} />
                    <Input value={editNameEn} onChange={e => setEditNameEn(e.target.value)} className="bg-secondary/50 text-sm" placeholder={t("cat.nameEn")} />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(cat.id)}><Check className="w-3 h-3 me-1" /> {t("schedule.saveEdit")}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="w-3 h-3 me-1" /> {t("mod.cancel")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{lang === "ar" ? cat.name_ar : cat.name_en}</p>
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? cat.name_en : cat.name_ar}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("cat.deleteCategory")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("cat.deleteConfirm")} "{lang === "ar" ? cat.name_ar : cat.name_en}"?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("mod.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("mod.delete")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CategoryManager;

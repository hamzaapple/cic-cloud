// Auth store (localStorage for UI state) + types + Supabase data helpers
import { supabase } from "@/integrations/supabase/client";

export type Permission =
  | "edit_content"
  | "add_courses"
  | "strict_add_only"
  | "add_pdf_existing"
  | "announcements"
  | "add_external_resources"
  | "manage_categories";

export const PERMISSION_LABELS: Record<Permission, string> = {
  edit_content: "التعديل",
  add_courses: "إضافة مواد",
  strict_add_only: "إضافة وعدم حذف أو تعديل",
  add_pdf_existing: "إضافة PDF في مقرر موجود",
  announcements: "إعلان وإشعار",
  add_external_resources: "إضافة مصادر خارجية",
  manage_categories: "إدارة الأقسام الداخلية",
};

export interface Department {
  id: string;
  name_ar: string;
  name_en: string;
  created_at?: string;
}

export interface MaterialCategory {
  id: string;
  name_ar: string;
  name_en: string;
  created_at?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  description_ar?: string;
  color: string;
  department_id?: string | null;
  created_at?: string;
}

export interface Material {
  id: string;
  title: string;
  type: "lecture" | "section" | "resource";
  course_id: string;
  category_id?: string | null;
  pdf_url?: string | null;
  pdf_display_name?: string | null;
  external_link?: string | null;
  submission_link?: string | null;
  deadline?: string | null;
  is_assignment: boolean;
  archived: boolean;
  created_at: string;
}

export interface ImportantLink {
  id: string;
  title: string;
  title_ar?: string | null;
  url: string;
  is_persistent: boolean;
  department_id?: string | null;
  created_at?: string;
}

export interface Moderator {
  id: string;
  username: string;
  password: string;
  display_name: string;
  permissions: Permission[];
  department_id?: string | null;
  created_at: string;
}

export interface ModeratorCourseAccess {
  id: string;
  moderator_id: string;
  course_id: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  target_audience: string;
  link?: string | null;
  sent_by: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  content: string;
  expires_at: string;
  created_by?: string;
  created_at?: string;
}

export type UserRole = "owner" | "moderator" | null;

export interface CurrentUser {
  role: UserRole;
  moderatorId?: string;
  permissions?: Permission[];
  displayName?: string;
  departmentId?: string | null;
}

const COURSE_COLORS = [
  "190 80% 45%", "260 70% 55%", "340 70% 55%", "30 80% 50%",
  "150 60% 45%", "210 70% 50%", "0 70% 55%", "280 60% 50%",
];

// ============ AUTH ============
export const auth = {
  getCurrentUser: (): CurrentUser => {
    const role = localStorage.getItem("lms_role") as UserRole;
    if (role === "owner") return { role: "owner", displayName: "المالك" };
    if (role === "moderator") {
      const modId = localStorage.getItem("lms_mod_id") || "";
      const permsStr = localStorage.getItem("lms_mod_perms") || "[]";
      const displayName = localStorage.getItem("lms_mod_name") || "مشرف";
      const departmentId = localStorage.getItem("lms_mod_dept") || null;
      try {
        const permissions = JSON.parse(permsStr) as Permission[];
        return { role: "moderator", moderatorId: modId, permissions, displayName, departmentId };
      } catch {
        return { role: "moderator", moderatorId: modId, permissions: [], displayName, departmentId };
      }
    }
    return { role: null };
  },
  isLoggedIn: (): boolean => {
    const role = localStorage.getItem("lms_role");
    return role === "owner" || role === "moderator";
  },
  isOwner: (): boolean => localStorage.getItem("lms_role") === "owner",
  hasPermission: (perm: Permission): boolean => {
    const user = auth.getCurrentUser();
    if (user.role === "owner") return true;
    if (user.role === "moderator") return user.permissions?.includes(perm) || false;
    return false;
  },
  login: async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-login', {
        body: { username, password },
      });

      if (error || !data?.role) {
        return { success: false, error: data?.error || "اسم المستخدم أو كلمة المرور غير صحيحة" };
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      localStorage.setItem("lms_role", data.role);
      if (data.role === "moderator") {
        localStorage.setItem("lms_mod_id", data.moderatorId || "");
        localStorage.setItem("lms_mod_perms", JSON.stringify(data.permissions || []));
        localStorage.setItem("lms_mod_name", data.displayName || "مشرف");
        localStorage.setItem("lms_mod_dept", data.departmentId || "");
      } else {
        localStorage.removeItem("lms_mod_id");
        localStorage.removeItem("lms_mod_perms");
        localStorage.removeItem("lms_mod_name");
        localStorage.removeItem("lms_mod_dept");
      }

      return { success: true };
    } catch {
      return { success: false, error: "حدث خطأ في الاتصال" };
    }
  },
  logout: () => {
    localStorage.removeItem("lms_role");
    localStorage.removeItem("lms_mod_id");
    localStorage.removeItem("lms_mod_perms");
    localStorage.removeItem("lms_mod_name");
    localStorage.removeItem("lms_mod_dept");
    supabase.auth.signOut();
  },
};

// ============ DATA API ============
export const db = {
  // Departments
  getDepartments: async (): Promise<Department[]> => {
    const { data } = await supabase.from("departments").select("*").order("created_at");
    return (data || []) as Department[];
  },

  // Material Categories
  getCategories: async (): Promise<MaterialCategory[]> => {
    const { data } = await supabase.from("material_categories").select("*").order("created_at");
    return (data || []) as MaterialCategory[];
  },
  addCategory: async (cat: { name_ar: string; name_en: string }) => {
    const { data, error } = await supabase.from("material_categories").insert(cat).select().single();
    if (error) throw error;
    return data as MaterialCategory;
  },
  updateCategory: async (id: string, updates: Partial<Pick<MaterialCategory, "name_ar" | "name_en">>) => {
    const { error } = await supabase.from("material_categories").update(updates).eq("id", id);
    if (error) throw error;
  },
  deleteCategory: async (id: string) => {
    const { error } = await supabase.from("material_categories").delete().eq("id", id);
    if (error) throw error;
  },

  // Courses
  getCourses: async (): Promise<Course[]> => {
    const { data } = await supabase.from("courses").select("*").order("created_at");
    return (data || []) as Course[];
  },
  getCoursesByDepartment: async (departmentId: string): Promise<Course[]> => {
    const { data } = await supabase.from("courses").select("*").eq("department_id", departmentId).order("created_at");
    return (data || []) as Course[];
  },
  addCourse: async (course: { name: string; code: string; description: string; description_ar?: string; department_id?: string }) => {
    const { data: existing } = await supabase.from("courses").select("id");
    const color = COURSE_COLORS[(existing?.length || 0) % COURSE_COLORS.length];
    const { data, error } = await supabase.from("courses").insert({ ...course, color }).select().single();
    if (error) throw error;
    return data as Course;
  },
  updateCourse: async (id: string, updates: Partial<Pick<Course, "name" | "code" | "description" | "description_ar" | "department_id">>) => {
    const { error } = await supabase.from("courses").update(updates).eq("id", id);
    if (error) throw error;
  },
  deleteCourse: async (id: string) => {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
  },

  // Materials
  getMaterials: async (courseId?: string): Promise<Material[]> => {
    let query = supabase.from("materials").select("*").order("created_at", { ascending: false });
    if (courseId) query = query.eq("course_id", courseId);
    const { data } = await query;
    return (data || []) as Material[];
  },
  getMaterialsByDepartment: async (departmentId: string): Promise<Material[]> => {
    // Get courses for this department first, then get materials
    const courses = await db.getCoursesByDepartment(departmentId);
    if (courses.length === 0) return [];
    const courseIds = courses.map(c => c.id);
    const { data } = await supabase.from("materials").select("*")
      .in("course_id", courseIds)
      .order("created_at", { ascending: false });
    return (data || []) as Material[];
  },
  addMaterial: async (material: {
    title: string;
    type: string;
    course_id: string;
    category_id?: string | null;
    pdf_url?: string | null;
    pdf_display_name?: string | null;
    external_link?: string | null;
    submission_link?: string | null;
    deadline?: string | null;
    is_assignment?: boolean;
  }) => {
    const { data, error } = await supabase.from("materials").insert({
      ...material,
      archived: false,
      is_assignment: material.is_assignment || false,
    }).select().single();
    if (error) throw error;
    return data as Material;
  },
  updateMaterial: async (id: string, updates: {
    title?: string;
    course_id?: string;
    category_id?: string | null;
    pdf_url?: string | null;
    pdf_display_name?: string | null;
    external_link?: string | null;
    submission_link?: string | null;
    deadline?: string | null;
    is_assignment?: boolean;
  }) => {
    const { error } = await supabase.from("materials").update(updates).eq("id", id);
    if (error) throw error;
  },
  archiveMaterial: async (id: string) => {
    const { error } = await supabase.from("materials").update({ archived: true }).eq("id", id);
    if (error) throw error;
  },
  deleteMaterial: async (id: string) => {
    const { error } = await supabase.from("materials").delete().eq("id", id);
    if (error) throw error;
  },

  // Links
  getLinks: async (departmentId?: string | null): Promise<ImportantLink[]> => {
    const { data } = await supabase.from("important_links").select("*").order("created_at");
    const all = (data || []) as ImportantLink[];
    if (!departmentId) return all; // Show all for owner or no filter
    // Show global links (null dept) + department-specific links
    return all.filter(l => !l.department_id || l.department_id === departmentId);
  },
  addLink: async (link: { title: string; title_ar?: string | null; url: string; department_id?: string | null }) => {
    const { data, error } = await supabase.from("important_links").insert(link).select().single();
    if (error) throw error;
    return data as ImportantLink;
  },
  removeLink: async (id: string) => {
    const { error } = await supabase.from("important_links").delete().eq("id", id);
    if (error) throw error;
  },

  // Moderators
  getModerators: async (): Promise<Moderator[]> => {
    const { data } = await supabase.from("moderators").select("*").order("created_at");
    return (data || []).map(m => ({ ...m, permissions: m.permissions as Permission[] })) as Moderator[];
  },
  addModerator: async (mod: { username: string; password: string; display_name: string; permissions: Permission[]; department_id?: string | null }) => {
    const { data, error } = await supabase.functions.invoke('create-moderator-auth', {
      body: mod,
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data.moderator as Moderator;
  },
  deleteModerator: async (id: string) => {
    const { error } = await supabase.from("moderators").delete().eq("id", id);
    if (error) throw error;
  },
  updateModerator: async (id: string, updates: { permissions?: Permission[]; department_id?: string | null }) => {
    const { error } = await supabase.from("moderators").update(updates).eq("id", id);
    if (error) throw error;
  },
  setModeratorCourseAccess: async (moderatorId: string, courseIds: string[]) => {
    // Delete all existing access
    await supabase.from("moderator_course_access").delete().eq("moderator_id", moderatorId);
    // Insert new access
    if (courseIds.length > 0) {
      const rows = courseIds.map(cid => ({ moderator_id: moderatorId, course_id: cid }));
      const { error } = await supabase.from("moderator_course_access").insert(rows);
      if (error) throw error;
    }
  },

  // Moderator Course Access (cross-department)
  getModeratorCourseAccess: async (moderatorId: string): Promise<ModeratorCourseAccess[]> => {
    const { data } = await supabase.from("moderator_course_access").select("*").eq("moderator_id", moderatorId);
    return (data || []) as ModeratorCourseAccess[];
  },
  getAllModeratorCourseAccess: async (): Promise<ModeratorCourseAccess[]> => {
    const { data } = await supabase.from("moderator_course_access").select("*");
    return (data || []) as ModeratorCourseAccess[];
  },
  addModeratorCourseAccess: async (moderatorId: string, courseId: string) => {
    const { error } = await supabase.from("moderator_course_access").insert({ moderator_id: moderatorId, course_id: courseId });
    if (error) throw error;
  },
  removeModeratorCourseAccess: async (id: string) => {
    const { error } = await supabase.from("moderator_course_access").delete().eq("id", id);
    if (error) throw error;
  },

  // Shared Department Courses (cross-department visibility for students)
  getSharedCoursesForDept: async (targetDeptId: string): Promise<string[]> => {
    const { data } = await supabase.from("shared_department_courses").select("course_id").eq("target_department_id", targetDeptId);
    return (data || []).map((r: any) => r.course_id);
  },
  getAllSharedDeptCourses: async (): Promise<{ id: string; course_id: string; target_department_id: string }[]> => {
    const { data } = await supabase.from("shared_department_courses").select("*");
    return (data || []) as any[];
  },
  setSharedCoursesForDept: async (targetDeptId: string, courseIds: string[]) => {
    // Remove existing
    await supabase.from("shared_department_courses").delete().eq("target_department_id", targetDeptId);
    // Insert new
    if (courseIds.length > 0) {
      const rows = courseIds.map(cid => ({ course_id: cid, target_department_id: targetDeptId }));
      const { error } = await supabase.from("shared_department_courses").insert(rows);
      if (error) throw error;
    }
  },

  // Notifications
  getNotifications: async (): Promise<Notification[]> => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    return (data || []) as Notification[];
  },
  addNotification: async (notif: { title: string; message: string; target_audience: string; link?: string | null; sent_by?: string }) => {
    await supabase.auth.refreshSession().catch(() => undefined);
    const { data, error } = await supabase.from("notifications").insert(notif).select().single();
    if (error) throw error;
    
    // Trigger push via Supabase Edge Function (Fire and forget)
    supabase.functions.invoke('send-push', {
      body: { title: notif.title, message: notif.message, target_audience: notif.target_audience },
    }).catch(pushErr => console.warn("Push notification send failed:", pushErr));
    
    return data as Notification;
  },

  // Announcements
  getAnnouncements: async (): Promise<Announcement[]> => {
    const { data } = await supabase.from("announcements").select("*").gt("expires_at", new Date().toISOString());
    return (data || []) as Announcement[];
  },
  addAnnouncement: async (announcement: { content: string; expires_at: string }) => {
    const { error } = await supabase.from("announcements").insert(announcement);
    if (error) throw error;
  },
  deleteAnnouncement: async (id: string) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) throw error;
  },

  // Audit Logs
  addAuditLog: async (action: string, details: string) => {
    const user = auth.getCurrentUser();
    if (!user || user.role !== "moderator") return; // For now owner isn't logged since owner is checking the logs
    
    try {
      await supabase.from("audit_logs").insert({
        admin_id: user.moderatorId,
        admin_name: user.displayName || "Unknown",
        action,
        details
      });
    } catch (e) {
      console.error("Audit log failed", e);
    }
  },

  // Storage
  uploadPdf: async (file: File): Promise<string> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("materials").upload(fileName, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("materials").getPublicUrl(fileName);
    return urlData.publicUrl;
  },
};

// Legacy compatibility
export const store = {
  ...auth,
  isAdmin: () => auth.isLoggedIn(),
};

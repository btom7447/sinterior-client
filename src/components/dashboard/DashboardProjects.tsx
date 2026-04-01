"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import {
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Pause,
  Play,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Project {
  _id: string;
  title: string;
  description?: string;
  budget?: number;
  location?: string;
  status: "planning" | "in_progress" | "completed" | "on_hold";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

const STATUS_CFG = {
  planning: { label: "Planning", icon: Clock, color: "bg-warning/10 text-warning" },
  in_progress: { label: "In Progress", icon: Play, color: "bg-primary/10 text-primary" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-success/10 text-success" },
  on_hold: { label: "On Hold", icon: Pause, color: "bg-muted text-muted-foreground" },
};

const EMPTY_FORM: { title: string; description: string; budget: string; location: string; status: Project["status"] } = { title: "", description: "", budget: "", location: "", status: "planning" };

export default function DashboardProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (filter !== "all") params.set("status", filter);
      const data = await apiGet<{ data: { projects: Project[] }; pagination: Pagination }>(`/projects?${params}`);
      setProjects(data.data?.projects || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load projects"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); };

  const openEdit = (p: Project) => {
    setEditingId(p._id);
    setForm({
      title: p.title,
      description: p.description || "",
      budget: p.budget != null ? String(p.budget) : "",
      location: p.location || "",
      status: p.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = { ...form, budget: form.budget ? Number(form.budget) : undefined };
      if (editingId) {
        await apiPatch(`/projects/${editingId}`, body);
        toast.success("Project updated");
      } else {
        await apiPost("/projects", body);
        toast.success("Project created");
      }
      setShowForm(false);
      fetchProjects(pagination.page);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/projects/${id}`); toast.success("Project deleted"); fetchProjects(pagination.page); }
    catch { toast.error("Failed to delete"); }
  };

  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

  if (loading && !projects.length) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><Skeleton className="h-8 w-36" /><Skeleton className="h-4 w-56 mt-2" /></div><Skeleton className="h-10 w-32 rounded-xl" /></div>
      <div className="flex gap-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}</div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => (
        <div key={i} className="card-elevated p-4 flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/4" /></div>
          <div className="text-right space-y-2"><Skeleton className="h-4 w-16 ml-auto" /><Skeleton className="h-4 w-14 rounded-full ml-auto" /></div>
          <div className="flex gap-1"><Skeleton className="w-7 h-7 rounded-lg" /><Skeleton className="w-7 h-7 rounded-lg" /></div>
        </div>
      ))}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your interior design projects</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "planning", "in_progress", "completed", "on_hold"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "All" : STATUS_CFG[s as keyof typeof STATUS_CFG].label}
          </button>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">{filter !== "all" ? `No ${filter.replace("_", " ")} projects` : "No projects yet"}</p>
          <p className="text-xs text-muted-foreground mt-1">Create a project to organize your interior design work</p>
          <button onClick={openCreate} className="text-xs text-primary hover:underline mt-3">Create your first project</button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const cfg = STATUS_CFG[project.status];
            const Icon = cfg.icon;
            return (
              <div key={project._id} className="card-elevated p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon className="w-5 h-5" strokeWidth={1} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{project.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{project.location || "No location"}</p>
                </div>
                <div className="text-right shrink-0">
                  {project.budget != null && <p className="text-sm font-bold text-foreground">{fmt(project.budget)}</p>}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(project)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><Pencil className="w-4 h-4 text-muted-foreground" strokeWidth={1} /></button>
                  <button onClick={() => handleDelete(project._id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4 text-destructive" strokeWidth={1} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchProjects(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchProjects(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">{editingId ? "Edit Project" : "New Project"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title *</label>
                <input required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Budget</label>
                  <input type="number" min={0} value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Project["status"] })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Location</label>
                <input maxLength={200} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea maxLength={3000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? "Saving..." : editingId ? "Update Project" : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

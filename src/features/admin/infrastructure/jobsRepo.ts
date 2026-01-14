// src/features/admin/infrastructure/jobsRepo.ts
import { createClient } from "@/lib/supabase/server";
import type { ScrapingJob, JobWithSite } from "../domain/types";

export const jobsRepo = {
  /**
   * Get all jobs with optional site info
   */
  async getAllJobs(limit = 50): Promise<JobWithSite[]> {
    const supabase = await createClient();

    const { data: jobs, error } = await supabase
      .from("scraping_jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching jobs:", error);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    if (!jobs || jobs.length === 0) return [];

    // Get site info for each job
    const siteIds = [...new Set(jobs.map((j) => j.site_id))];
    const { data: sites } = await supabase
      .from("sites")
      .select("id, name, url, platform_type")
      .in("id", siteIds);

    const sitesMap = new Map(sites?.map((s) => [s.id, s]) || []);

    return jobs.map((job) => ({
      ...job,
      site: sitesMap.get(job.site_id),
    }));
  },

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<JobWithSite | null> {
    const supabase = await createClient();

    const { data: job, error: jobError } = await supabase
      .from("scraping_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      console.error("Error fetching job:", jobError);
      return null;
    }

    // Get site info
    const { data: site } = await supabase
      .from("sites")
      .select("id, name, url, platform_type")
      .eq("id", job.site_id)
      .single();

    return {
      ...job,
      site: site || undefined,
    };
  },

  /**
   * Get jobs by site
   */
  async getJobsBySite(siteId: string, limit = 20): Promise<ScrapingJob[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("scraping_jobs")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching jobs by site:", error);
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get recent jobs (last 24h)
   */
  async getRecentJobs(): Promise<JobWithSite[]> {
    const supabase = await createClient();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: jobs, error } = await supabase
      .from("scraping_jobs")
      .select("*")
      .gte("created_at", yesterday)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching recent jobs:", error);
      throw new Error(`Failed to fetch recent jobs: ${error.message}`);
    }

    if (!jobs || jobs.length === 0) return [];

    // Get site info
    const siteIds = [...new Set(jobs.map((j) => j.site_id))];
    const { data: sites } = await supabase
      .from("sites")
      .select("id, name, url, platform_type")
      .in("id", siteIds);

    const sitesMap = new Map(sites?.map((s) => [s.id, s]) || []);

    return jobs.map((job) => ({
      ...job,
      site: sitesMap.get(job.site_id),
    }));
  },

  /**
   * Get job statistics
   */
  async getJobStats() {
    const supabase = await createClient();

    const { data: jobs, error } = await supabase
      .from("scraping_jobs")
      .select("status, quality_score, products_saved, errors_count");

    if (error) {
      console.error("Error fetching job stats:", error);
      throw new Error(`Failed to fetch job stats: ${error.message}`);
    }

    if (!jobs) return null;

    const total = jobs.length;
    const completed = jobs.filter((j) => j.status === "completed").length;
    const failed = jobs.filter((j) => j.status === "failed").length;
    const running = jobs.filter((j) => j.status === "running").length;

    const qualityJobs = jobs.filter((j) => j.quality_score !== null);
    const avgQuality =
      (qualityJobs.reduce((sum, j) => sum + (j.quality_score || 0), 0) /
        (qualityJobs.length || 1)) || 0;

    const totalProducts = jobs.reduce((sum, j) => sum + (j.products_saved || 0), 0);
    const totalErrors = jobs.reduce((sum, j) => sum + (j.errors_count || 0), 0);

    return {
      total,
      completed,
      failed,
      running,
      avgQuality: Math.round(avgQuality * 100),
      totalProducts,
      totalErrors,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  },
};

import { useEffect, useMemo, useState } from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/http";

import { Sidebar } from "./SideBar";
import { TopBar } from "./TopBar";
import { FloatingActionButton } from "./FloatingActionButton";

import { EmployerDashboard } from "../Employer/EmployerDashboard";
import { EmployerJobs } from "../Employer/EmployerJobs";
import { EmployerCreateJob } from "../Employer/EmployerCreateJob";
import { EmployerApplicants } from "../Employer/EmployerApplicants";
import { CompanyProfile } from "../Employer/CompanyProfile";
import { InterviewAnalytics } from "../Employer/InterviewAnalytics";

import { CandidateHome } from "../Candidate/CandidateHome";
import { CandidateJobs } from "../Candidate/CandidateJobs";
import { CandidateApplications } from "../Candidate/CandidateApplications";
import { CandidateNotifications } from "../Candidate/CandidateNotifications";
import { InterviewRoom } from "../Interview/InterviewRoom";

import {CandidateApplyForm} from "../Candidate/CandidateApplyForm";

import { CandidatePipeline } from "../hr/CandidatePipeline";
import { DocumentManagement } from "../hr/DocumentManagement";
import { EmployeeReviews } from "../hr/EmployeeReviews";
import { OnboardingWorkflow } from "../hr/OnboardingWorkflow";
import { AIJobDescriptionGenerator } from "../hr/AIJobDescriptionGenerator";

export type Role = "employer" | "candidate";

type MeResponse = { _id: string; name: string; email: string; role: Role };

export const ROUTES = {
  employerDashboard: "/app/employer/dashboard",
  employerJobs: "/app/employer/jobs",
  employerCreateJob: "/app/employer/jobs/create",
  employerApplicants: "/app/employer/applicants",
  employerCompany: "/app/employer/company",
  employerAnalytics: "/app/employer/analytics",

  employerPipeline: "/app/employer/pipeline",
  employerDocuments: "/app/employer/documents",
  employerReviews: "/app/employer/reviews",
  employerOnboarding: "/app/employer/onboarding",
  employerAIJobDescription: "/app/employer/ai-job-description",

  candidateHome: "/app/candidate/home",
  candidateJobs: "/app/candidate/jobs",
  candidateApplications: "/app/candidate/applications",
  candidateNotifications: "/app/candidate/notifications",
  candidateInterview: "/app/candidate/interview",

  candidateApply: "/app/candidate/apply",
} as const;

const useStyles = makeStyles({
  appRoot: { display: "flex", height: "100vh", backgroundColor: "#FFF8F8", overflow: "hidden" },
  mainArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  contentArea: { flex: 1, padding: "24px", boxSizing: "border-box", ...shorthands.overflow("auto") },
});

function startsWithPath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/");
}

function metaForPath(pathname: string) {
  if (startsWithPath(pathname, ROUTES.employerDashboard)) return { title: "Dashboard" };
  if (startsWithPath(pathname, ROUTES.employerCreateJob)) return { title: "Create Job", breadcrumbs: ["Jobs", "Create"] };
  if (startsWithPath(pathname, ROUTES.employerJobs)) return { title: "Jobs", breadcrumbs: ["Jobs"] };
  if (startsWithPath(pathname, ROUTES.employerApplicants)) return { title: "Applicants", breadcrumbs: ["Applicants"] };
  if (startsWithPath(pathname, ROUTES.employerCompany)) return { title: "Company Profile", breadcrumbs: ["Company"] };
  if (startsWithPath(pathname, ROUTES.employerAnalytics)) return { title: "Interview Analytics", breadcrumbs: ["Analytics"] };

  if (startsWithPath(pathname, ROUTES.employerPipeline)) return { title: "Candidate Pipeline", breadcrumbs: ["Pipeline"] };
  if (startsWithPath(pathname, ROUTES.employerDocuments)) return { title: "Documents", breadcrumbs: ["Documents"] };
  if (startsWithPath(pathname, ROUTES.employerReviews)) return { title: "Performance Reviews", breadcrumbs: ["Reviews"] };
  if (startsWithPath(pathname, ROUTES.employerOnboarding)) return { title: "Onboarding", breadcrumbs: ["Onboarding"] };
  if (startsWithPath(pathname, ROUTES.employerAIJobDescription)) return { title: "AI Job Description", breadcrumbs: ["AI JD"] };

  if (startsWithPath(pathname, ROUTES.candidateHome)) return { title: "Home" };
  if (startsWithPath(pathname, ROUTES.candidateJobs)) return { title: "Find Jobs", breadcrumbs: ["Find Jobs"] };
  if (startsWithPath(pathname, ROUTES.candidateApplications)) return { title: "Applications", breadcrumbs: ["Applications"] };
  if (startsWithPath(pathname, ROUTES.candidateNotifications)) return { title: "Notifications", breadcrumbs: ["Notifications"] };
  if (startsWithPath(pathname, ROUTES.candidateInterview)) return { title: "Interview Room", breadcrumbs: ["Interview"] };

  if (startsWithPath(pathname, ROUTES.candidateApply)) return { title: "Apply", breadcrumbs: ["Find Jobs", "Apply"] };

  return { title: "App" };
}

export default function AppLayout() {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api<MeResponse>("/api/auth/me");
        if (!alive) return;
        setMe(data);

        if (location.pathname === "/app" || location.pathname === "/app/") {
          navigate(data.role === "employer" ? ROUTES.employerDashboard : ROUTES.candidateHome, { replace: true });
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
      }
    })();

    return () => {
      alive = false;
    };
  }, [location.pathname, navigate]);

  const role: Role = me?.role ?? ((localStorage.getItem("role") as Role) || "candidate");
  const pageMeta = useMemo(() => metaForPath(location.pathname), [location.pathname]);

  const onNavigate = (to: string, data?: Record<string, unknown>) => {
    if (to.startsWith("/")) return navigate(to);

    if (role === "candidate" && to === "apply") {
      const jobId = typeof data?.jobId === "string" ? data.jobId : "";
      const qs = new URLSearchParams();
      if (jobId) qs.set("jobId", jobId);
      return navigate(`${ROUTES.candidateApply}?${qs.toString()}`);
    }

    if (role === "employer") {
      if (to === "dashboard") return navigate(ROUTES.employerDashboard);
      if (to === "jobs") return navigate(ROUTES.employerJobs);
      if (to === "create-job") return navigate(ROUTES.employerCreateJob);
      if (to === "applicants") return navigate(ROUTES.employerApplicants);
      if (to === "pipeline") return navigate(ROUTES.employerPipeline);
      if (to === "documents") return navigate(ROUTES.employerDocuments);
      if (to === "reviews") return navigate(ROUTES.employerReviews);
      if (to === "onboarding") return navigate(ROUTES.employerOnboarding);
      if (to === "ai") return navigate(ROUTES.employerAIJobDescription);
      if (to === "company") return navigate(ROUTES.employerCompany);
      if (to === "analytics") return navigate(ROUTES.employerAnalytics);
    } else {
      if (to === "home") return navigate(ROUTES.candidateHome);
      if (to === "jobs") return navigate(ROUTES.candidateJobs);
      if (to === "applications") return navigate(ROUTES.candidateApplications);
      if (to === "notifications") return navigate(ROUTES.candidateNotifications);
      if (to === "interview-room") return navigate(ROUTES.candidateInterview);
    }

    navigate(role === "employer" ? ROUTES.employerDashboard : ROUTES.candidateHome);
  };

  const handleFabAction = (action: string) => {
    if (role === "employer" && action === "create-job") navigate(ROUTES.employerCreateJob);
    if (role === "candidate" && action === "apply") navigate(ROUTES.candidateJobs);
  };

  const renderContent = () => {
    const p = location.pathname;

    if (startsWithPath(p, ROUTES.employerDashboard)) return <EmployerDashboard onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.employerCreateJob)) return <EmployerCreateJob onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.employerJobs)) return <EmployerJobs onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.employerApplicants)) return <EmployerApplicants onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.employerCompany)) return <CompanyProfile />;
    if (startsWithPath(p, ROUTES.employerAnalytics)) return <InterviewAnalytics onNavigate={onNavigate} />;

    if (startsWithPath(p, ROUTES.employerPipeline)) return <CandidatePipeline />;
    if (startsWithPath(p, ROUTES.employerDocuments)) return <DocumentManagement />;
    if (startsWithPath(p, ROUTES.employerReviews)) return <EmployeeReviews />;
    if (startsWithPath(p, ROUTES.employerOnboarding)) return <OnboardingWorkflow />;
    if (startsWithPath(p, ROUTES.employerAIJobDescription)) return <AIJobDescriptionGenerator />;

    if (startsWithPath(p, ROUTES.candidateHome)) return <CandidateHome onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.candidateJobs)) return <CandidateJobs onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.candidateApplications)) return <CandidateApplications onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.candidateNotifications)) return <CandidateNotifications />;
    if (startsWithPath(p, ROUTES.candidateApply)) return <CandidateApplyForm onNavigate={onNavigate} />;

    if (startsWithPath(p, ROUTES.candidateInterview)) {
      return <InterviewRoom jobTitle="Interview" company="Company" onComplete={() => navigate(ROUTES.candidateHome)} />;
    }

    return role === "employer" ? <EmployerDashboard onNavigate={onNavigate} /> : <CandidateHome onNavigate={onNavigate} />;
  };

  return (
    <div className={styles.appRoot}>
      <Sidebar userRole={role} currentPage={location.pathname} onNavigate={onNavigate} />

      <div className={styles.mainArea}>
        <TopBar
          title={pageMeta.title}
          role={role}
          breadcrumbs={pageMeta.breadcrumbs}
          onSignOut={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login");
          }}
        />
        <div className={styles.contentArea}>{renderContent()}</div>
      </div>

      <FloatingActionButton userRole={role} onAction={handleFabAction} />
    </div>
  );
}

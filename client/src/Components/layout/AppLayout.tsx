import { useEffect, useMemo, useState } from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import { Sidebar } from "./SideBar";
import { TopBar } from "./TopBar";
import { FloatingActionButton } from "./FloatingActionButton";
import {
  Button,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Text,
  Link,
} from "@fluentui/react-components";
import {
  QuestionCircle24Regular,
  Mail24Regular,
  BookOpen24Regular,
  ChatHelp24Regular,
} from "@fluentui/react-icons";
import { EmployerDashboard } from "../Employer/EmployerDashboard";
import { EmployerJobs } from "../Employer/EmployerJobs";
import { EmployerJobDetails } from "../Employer/EmployerJobDetails";
import { EmployerJobEdit } from "../Employer/EmployerJobEdit";
import { EmployerCreateJob } from "../Employer/EmployerCreateJob";
import { EmployerApplicants } from "../Employer/EmployerApplicants";
import { CompanyProfile } from "../Employer/CompanyProfile";
import { InterviewAnalytics } from "../Employer/InterviewAnalytics";
import { CandidateHome } from "../Candidate/CandidateHome";
import CandidateJobs from "../Candidate/CandidateJobs";
import { CandidateApplications } from "../Candidate/CandidateApplications";
import { CandidateNotifications } from "../Candidate/CandidateNotifications";
import { InterviewRoom } from "../Interview/InterviewRoom";
import { CandidateApplyForm } from "../Candidate/CandidateApplyForm";
import { CandidateInterviewResults } from "../Candidate/CandidateInterviewResults";
import { CandidateInterviewAnalytics } from "../Candidate/CandidateInterviewAnalytics";
import { CandidatePipeline } from "../hr/CandidatePipeline";
import { DocumentManagement } from "../hr/DocumentManagement";
import { EmployeeReviews } from "../hr/EmployeeReviews";
import { OnboardingWorkflow } from "../hr/OnboardingWorkflow";
import { AIJobDescriptionGenerator } from "../hr/AIJobDescriptionGenerator";
import EmployerSettings from "../Employer/EmployerSettings";
import CandidateSettings from "../Candidate/CandidateSettings";
import CandidateCareerGoals from "../Candidate/CandidateCareerGoals";
import CandidateSkillTest from "../Candidate/CandidateSkillTest";

export type Role = "employer" | "candidate";
type MeResponse = {
  _id: string;
  name: string;
  email: string;
  role: Role;
  preferences?: {
    settings?: {
      defaultLanding?: string;
    };
  };
};

export const ROUTES = {
  employerDashboard: "/app/employer/dashboard",
  employerJobs: "/app/employer/jobs",
  employerJobDetails: "/app/employer/jobs/:jobId",
  employerJobEdit: "/app/employer/jobs/:jobId/edit",
  employerCreateJob: "/app/employer/jobs/create",
  employerApplicants: "/app/employer/applicants",
  employerCompany: "/app/employer/company",
  employerAnalytics: "/app/employer/analytics",
  employerPipeline: "/app/employer/pipeline",
  employerDocuments: "/app/employer/documents",
  employerReviews: "/app/employer/reviews",
  employerOnboarding: "/app/employer/onboarding",
  employerAIJobDescription: "/app/employer/ai-job-description",
  employerMyAccount: "/app/employer/account",
  employerProfileSettings: "/app/employer/profile",
  employerPreferences: "/app/employer/preferences",
  candidateHome: "/app/candidate/home",
  candidateJobs: "/app/candidate/jobs",
  candidateApplications: "/app/candidate/applications",
  candidateNotifications: "/app/candidate/notifications",
  candidateInterview: "/app/candidate/interview",
  candidateResults: "/app/candidate/results",
  candidateApply: "/app/candidate/apply",
  candidateAnalytics: "/app/candidate/analytics",
  candidateMyAccount: "/app/candidate/account",
  candidateProfileSettings: "/app/candidate/profile",
  candidatePreferences: "/app/candidate/preferences",
  candidateCareerGoals: "/app/candidate/career-goals",
  candidateSkillTests: "/app/candidate/skill-tests",
  employerSettings: "/app/employer/settings",
  candidateSettings: "/app/candidate/settings",
} as const;

const useStyles = makeStyles({
  appRoot: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#FFF8F8",
    overflow: "hidden",
  },
  mainArea: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  contentArea: {
    flex: 1,
    padding: "24px",
    boxSizing: "border-box",
    ...shorthands.overflow("auto"),
  },
});

function startsWithPath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(base + "/");
}

function getEmployerJobEditIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/app\/employer\/jobs\/([^/]+)\/edit$/);
  if (!m) return null;
  const id = decodeURIComponent(m[1]);
  if (!id || id === "create") return null;
  return id;
}

function getEmployerJobDetailsIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/app\/employer\/jobs\/([^/]+)$/);
  if (!m) return null;
  const id = decodeURIComponent(m[1]);
  if (!id || id === "create") return null;
  return id;
}

type PageMeta = { title: string; breadcrumbs?: string[] };

function metaForPath(pathname: string): PageMeta {
  const editId = getEmployerJobEditIdFromPath(pathname);
  if (editId) return { title: "Edit Job", breadcrumbs: ["Jobs", "Edit"] };

  const detailsId = getEmployerJobDetailsIdFromPath(pathname);
  if (detailsId) return { title: "Job Details", breadcrumbs: ["Jobs", "Details"] };

  if (startsWithPath(pathname, ROUTES.employerMyAccount))
    return { title: "My Account", breadcrumbs: ["Account"] };
  if (startsWithPath(pathname, ROUTES.employerProfileSettings))
    return { title: "Profile Settings", breadcrumbs: ["Account", "Profile"] };
  if (startsWithPath(pathname, ROUTES.employerPreferences))
    return { title: "Preferences", breadcrumbs: ["Account", "Preferences"] };

  if (startsWithPath(pathname, ROUTES.candidateMyAccount))
    return { title: "My Account", breadcrumbs: ["Account"] };
  if (startsWithPath(pathname, ROUTES.candidateProfileSettings))
    return { title: "Profile Settings", breadcrumbs: ["Account", "Profile"] };
  if (startsWithPath(pathname, ROUTES.candidatePreferences))
    return { title: "Preferences", breadcrumbs: ["Account", "Preferences"] };
  if (startsWithPath(pathname, ROUTES.candidateCareerGoals))
    return { title: "Career Goals", breadcrumbs: ["Career Goals"] };
  if (startsWithPath(pathname, ROUTES.candidateSkillTests))
    return { title: "Skill Tests", breadcrumbs: ["Skill Tests"] };

  if (startsWithPath(pathname, ROUTES.employerDashboard)) return { title: "Dashboard" };
  if (startsWithPath(pathname, ROUTES.employerCreateJob))
    return { title: "Create Job", breadcrumbs: ["Jobs", "Create"] };
  if (startsWithPath(pathname, ROUTES.employerJobs))
    return { title: "Jobs", breadcrumbs: ["Jobs"] };
  if (startsWithPath(pathname, ROUTES.employerApplicants))
    return { title: "Applicants", breadcrumbs: ["Applicants"] };
  if (startsWithPath(pathname, ROUTES.employerCompany)) return { title: "Company Profile", breadcrumbs: ["Company"] };
  if (startsWithPath(pathname, ROUTES.employerAnalytics))
    return { title: "Interview Analytics", breadcrumbs: ["Analytics"] };

  if (startsWithPath(pathname, ROUTES.employerPipeline))
    return { title: "Candidate Pipeline", breadcrumbs: ["Pipeline"] };
  if (startsWithPath(pathname, ROUTES.employerDocuments))
    return { title: "Documents", breadcrumbs: ["Documents"] };
  if (startsWithPath(pathname, ROUTES.employerReviews))
    return { title: "Performance Reviews", breadcrumbs: ["Reviews"] };
  if (startsWithPath(pathname, ROUTES.employerOnboarding))
    return { title: "Onboarding", breadcrumbs: ["Onboarding"] };
  if (startsWithPath(pathname, ROUTES.employerAIJobDescription))
    return { title: "AI Job Description", breadcrumbs: ["AI JD"] };

  if (startsWithPath(pathname, ROUTES.candidateHome)) return { title: "Home" };
  if (startsWithPath(pathname, ROUTES.candidateJobs))
    return { title: "Find Jobs", breadcrumbs: ["Find Jobs"] };
  if (startsWithPath(pathname, ROUTES.candidateApplications))
    return { title: "Applications", breadcrumbs: ["Applications"] };
  if (startsWithPath(pathname, ROUTES.candidateNotifications))
    return { title: "Notifications", breadcrumbs: ["Notifications"] };
  if (startsWithPath(pathname, ROUTES.candidateInterview))
    return { title: "Interview Room", breadcrumbs: ["Interview"] };
  if (startsWithPath(pathname, ROUTES.candidateApply))
    return { title: "Apply", breadcrumbs: ["Find Jobs", "Apply"] };
  if (startsWithPath(pathname, ROUTES.candidateResults))
    return { title: "Results", breadcrumbs: ["Results"] };

  if (startsWithPath(pathname, ROUTES.candidateAnalytics))
    return { title: "Interview Analytics", breadcrumbs: ["Analytics"] };

  if (startsWithPath(pathname, ROUTES.employerSettings))
    return { title: "Settings", breadcrumbs: ["Settings"] };
  if (startsWithPath(pathname, ROUTES.candidateSettings))
    return { title: "Settings", breadcrumbs: ["Settings"] };

  return { title: "App" };
}

export default function AppLayout() {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await api<MeResponse>("/api/auth/me");
        if (!alive) return;
        setMe(data);

        const prefs = data.preferences?.settings?.defaultLanding;
        
        if (location.pathname === "/app" || location.pathname === "/app/") {
           if (data.role === "employer") {
              if (prefs === "jobs") navigate(ROUTES.employerJobs, { replace: true });
              else if (prefs === "applicants") navigate(ROUTES.employerApplicants, { replace: true });
              else if (prefs === "company") navigate(ROUTES.employerCompany, { replace: true });
              else if (prefs === "analytics") navigate(ROUTES.employerAnalytics, { replace: true });
              else navigate(ROUTES.employerDashboard, { replace: true });
           } else {
             navigate(ROUTES.candidateHome, { replace: true });
           }
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
    if (to === "/app/settings") {
      return navigate(role === "employer" ? ROUTES.employerSettings : ROUTES.candidateSettings);
    }

    if (to.startsWith("/")) return navigate(to);

    if (role === "candidate" && to === "apply") {
      const jobId = typeof data?.jobId === "string" ? data.jobId : "";
      const qs = new URLSearchParams();
      if (jobId) qs.set("jobId", jobId);
      return navigate(`${ROUTES.candidateApply}?${qs.toString()}`);
    }

    if (role === "candidate" && (to === "interview-room" || to === "interview")) {
      return navigate(ROUTES.candidateInterview, { state: data || {} });
    }

    if (role === "candidate" && to === "results") {
      return navigate(ROUTES.candidateResults, { state: data || {} });
    }

    if (role === "candidate" && to === "analytics") {
      return navigate(ROUTES.candidateAnalytics);
    }
    
    if (role === "candidate" && to === "career-goals") {
      return navigate(ROUTES.candidateCareerGoals);
    }
    
    if (role === "candidate" && to === "skill-tests") {
      return navigate(ROUTES.candidateSkillTests);
    }

    if (role === "employer" && to === "job-details") {
      const jobId = typeof data?.jobId === "string" ? data.jobId : "";
      if (jobId) return navigate(`/app/employer/jobs/${encodeURIComponent(jobId)}`);
      return navigate(ROUTES.employerJobs);
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
      if (to === "analytics") return navigate(ROUTES.employerAnalytics, { state: data || {} });

      if (to === "my-account") return navigate(ROUTES.employerMyAccount);
      if (to === "profile-settings") return navigate(ROUTES.employerProfileSettings);
      if (to === "preferences") return navigate(ROUTES.employerPreferences);
    } else {
      if (to === "home") return navigate(ROUTES.candidateHome);
      if (to === "jobs") return navigate(ROUTES.candidateJobs);
      if (to === "applications") return navigate(ROUTES.candidateApplications);
      if (to === "notifications") return navigate(ROUTES.candidateNotifications);

      if (to === "my-account") return navigate(ROUTES.candidateMyAccount);
      if (to === "profile-settings") return navigate(ROUTES.candidateProfileSettings, { state: data });
      if (to === "preferences") return navigate(ROUTES.candidatePreferences);
    }

    navigate(role === "employer" ? ROUTES.employerDashboard : ROUTES.candidateHome);
  };

  const handleFabAction = (action: string) => {
    if (role === "employer" && action === "create-job") navigate(ROUTES.employerCreateJob);
    if (role === "candidate" && action === "apply") navigate(ROUTES.candidateJobs);
    if (action === "support") setShowSupportDialog(true);
    if (action === "help") setShowHelpDialog(true);
  };

  const renderContent = () => {
    const p = location.pathname;

    const editId = getEmployerJobEditIdFromPath(p);
    if (role === "employer" && editId) return <EmployerJobEdit jobId={editId} />;

    const detailsId = getEmployerJobDetailsIdFromPath(p);
    if (role === "employer" && detailsId) return <EmployerJobDetails jobId={detailsId} />;

    if (startsWithPath(p, ROUTES.employerMyAccount)) return <EmployerSettings defaultTab="account" />;
    if (startsWithPath(p, ROUTES.employerProfileSettings)) return <EmployerSettings defaultTab="profile" />;
    if (startsWithPath(p, ROUTES.employerPreferences)) return <EmployerSettings defaultTab="preferences" />;

    if (startsWithPath(p, ROUTES.employerSettings)) return <EmployerSettings />;
    if (startsWithPath(p, ROUTES.candidateSettings)) return <CandidateSettings onNavigate={onNavigate} />;

    if (startsWithPath(p, ROUTES.candidateMyAccount))
      return <CandidateSettings onNavigate={onNavigate} defaultTab="account" />;
    if (startsWithPath(p, ROUTES.candidateProfileSettings)) return <CandidateSettings onNavigate={onNavigate} defaultTab="profile" />;
    if (startsWithPath(p, ROUTES.candidatePreferences)) return <CandidateSettings onNavigate={onNavigate} defaultTab="preferences" />;

    if (startsWithPath(p, ROUTES.employerDashboard))
      return <EmployerDashboard onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.employerCreateJob))
      return <EmployerCreateJob onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.employerJobs)) return <EmployerJobs />;
    if (startsWithPath(p, ROUTES.employerApplicants))
      return <EmployerApplicants onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.employerCompany)) return <CompanyProfile />;
    if (startsWithPath(p, ROUTES.employerAnalytics))
      return <InterviewAnalytics onNavigate={onNavigate} />;

    if (startsWithPath(p, ROUTES.employerPipeline)) return <CandidatePipeline />;
    if (startsWithPath(p, ROUTES.employerDocuments)) return <DocumentManagement />;
    if (startsWithPath(p, ROUTES.employerReviews)) return <EmployeeReviews />;
    if (startsWithPath(p, ROUTES.employerOnboarding)) return <OnboardingWorkflow />;
    if (startsWithPath(p, ROUTES.employerAIJobDescription)) return <AIJobDescriptionGenerator />;

    if (startsWithPath(p, ROUTES.candidateHome)) return <CandidateHome onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.candidateJobs)) return <CandidateJobs onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.candidateApplications))
      return <CandidateApplications onNavigate={onNavigate} />;
    if (startsWithPath(p, ROUTES.candidateNotifications)) return <CandidateNotifications />;
    if (startsWithPath(p, ROUTES.candidateApply)) return <CandidateApplyForm onNavigate={onNavigate} />;

    if (startsWithPath(p, ROUTES.candidateAnalytics)) return <CandidateInterviewAnalytics />;
    if (startsWithPath(p, ROUTES.candidateCareerGoals)) return <CandidateCareerGoals />;
    if (startsWithPath(p, ROUTES.candidateSkillTests)) return <CandidateSkillTest />;

    if (startsWithPath(p, ROUTES.candidateInterview)) {
      const st = (location.state || {}) as Record<string, unknown>;
      const applicationId = typeof st.applicationId === "string" ? st.applicationId : undefined;
      const jobTitle = typeof st.jobTitle === "string" ? st.jobTitle : "Interview";
      const company = typeof st.company === "string" ? st.company : "Company";
      const logoUrl = typeof st.logoUrl === "string" ? st.logoUrl : undefined;

      return (
        <InterviewRoom
          jobTitle={jobTitle}
          company={company}
          logoUrl={logoUrl}
          applicationId={applicationId}
          onComplete={(payload) => {
            navigate(ROUTES.candidateResults, { state: payload || { applicationId } });
          }}
        />
      );
    }

    if (startsWithPath(p, ROUTES.candidateResults)) return <CandidateInterviewResults />;

    return role === "employer" ? (
      <EmployerDashboard onNavigate={onNavigate} />
    ) : (
      <CandidateHome onNavigate={onNavigate} />
    );
  };

  const topbarRoutes =
    role === "employer"
      ? {
          myAccount: ROUTES.employerMyAccount,
          profileSettings: ROUTES.employerProfileSettings,
          preferences: ROUTES.employerPreferences,
        }
      : {
          myAccount: ROUTES.candidateMyAccount,
          profileSettings: ROUTES.candidateProfileSettings,
          preferences: ROUTES.candidatePreferences,
        };

  return (
    <div className={styles.appRoot}>
      <Sidebar userRole={role} currentPage={location.pathname} onNavigate={onNavigate} />

      <div className={styles.mainArea}>
        <TopBar
          title={pageMeta.title}
          role={role}
          breadcrumbs={pageMeta.breadcrumbs}
          navigateTo={(path) => navigate(path)}
          routes={topbarRoutes}
          onSignOut={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login");
          }}
        />

        <div className={styles.contentArea}>{renderContent()}</div>
      </div>

      <FloatingActionButton userRole={role} onAction={handleFabAction} />

      <Dialog
        open={showSupportDialog}
        onOpenChange={(_, data) => setShowSupportDialog(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle action={<Mail24Regular />}>Customer Support</DialogTitle>
            <DialogContent>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "16px",
                  marginTop: "12px",
                }}
              >
                <Text>
                  Need help with your account or having technical issues? Our
                  support team is here for you 24/7.
                </Text>

                <div
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                >
                  <Text weight="semibold" block>
                    Email Support
                  </Text>
                  <Link href="mailto:support@cogno-hire.com">
                    support@cogno-hire.com
                  </Link>
                  <Text size={200} block style={{ marginTop: "4px" }}>
                    Average response time: &lt; 2 hours
                  </Text>
                </div>

                <div
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: "16px",
                    borderRadius: "8px",
                  }}
                >
                  <Text weight="semibold" block>
                    Live Chat
                  </Text>
                  <Text size={300} block>
                    Chat agents are currently{" "}
                    <span style={{ color: "#16A34A", fontWeight: 600 }}>
                      ONLINE
                    </span>
                  </Text>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setShowSupportDialog(false)}
              >
                Close
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  window.open("https://cogno-hire.com/chat", "_blank");
                  setShowSupportDialog(false);
                }}
              >
                Start Chat
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog
        open={showHelpDialog}
        onOpenChange={(_, data) => setShowHelpDialog(data.open)}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle action={<QuestionCircle24Regular />}>
              Help Center
            </DialogTitle>
            <DialogContent>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "16px",
                  marginTop: "12px",
                }}
              >
                <Text>
                  Explore our resources to get the most out of Cogno-hire.
                </Text>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "12px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      rowGap: "8px",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                    }}
                    onClick={() =>
                      window.open("https://docs.cogno-hire.com", "_blank")
                    }
                  >
                    <BookOpen24Regular style={{ color: "#2563EB" }} />
                    <Text weight="medium">User Guide</Text>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      rowGap: "8px",
                      cursor: "pointer",
                      backgroundColor: "#ffffff",
                    }}
                    onClick={() =>
                      window.open("https://cogno-hire.com/faq", "_blank")
                    }
                  >
                    <ChatHelp24Regular style={{ color: "#7C3AED" }} />
                    <Text weight="medium">FAQs</Text>
                  </div>
                </div>

                <div>
                  <Text weight="semibold" block style={{ marginBottom: "8px" }}>
                    Quick Links
                  </Text>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "20px",
                      display: "flex",
                      flexDirection: "column",
                      rowGap: "4px",
                    }}
                  >
                    <li>
                      <Link href="#">How to create an effective Job post</Link>
                    </li>
                    <li>
                      <Link href="#">Understanding AI interview scores</Link>
                    </li>
                    <li>
                      <Link href="#">Scheduling your first interview</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                onClick={() => setShowHelpDialog(false)}
              >
                Close
              </Button>
              <Button
                appearance="primary"
                onClick={() => {
                  window.open("https://help.cogno-hire.com", "_blank");
                  setShowHelpDialog(false);
                }}
              >
                Go to Help Center
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
}

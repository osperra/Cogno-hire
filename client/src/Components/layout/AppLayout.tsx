import { useState } from "react";
import { makeStyles, shorthands } from "@fluentui/react-components";

import { Sidebar } from "./SideBar";
import { TopBar } from "./TopBar";
import { EmployerDashboard } from "../Employer/EmployerDashboard";
import { EmployerJobs } from "../Employer/EmployerJobs";
import { EmployerCreateJob } from "../Employer/EmployerCreateJob";
import { EmployerApplicants } from "../Employer/EmployerApplicants";
import { CandidatePipeline } from "../hr/CandidatePipeline";
import { DocumentManagement } from "../hr/DocumentManagement";
import { CandidateHome } from "../Candidate/CandidateHome";
import { CandidateJobs } from "../Candidate/CandidateJobs";
import { CandidateApplications } from "../Candidate/CandidateApplications";
import { CandidateNotifications } from "../Candidate/CandidateNotifications";
import { EmployeeReviews } from "../hr/EmployeeReviews";
import { OnboardingWorkflow } from "../hr/OnboardingWorkflow";
import { CompanyProfile } from "../Employer/CompanyProfile";
import { InterviewAnalytics } from "../Employer/InterviewAnalytics";
import { FloatingActionButton } from "./FloatingActionButton";
import { AIJobDescriptionGenerator } from "../hr/AIJobDescriptionGenerator";
import { InterviewRoom } from "../Interview/InterviewRoom";

import { LandingPage } from "../marketing/LandingPage";
import { DesignSystem } from "../ui/DesignSystem";

type Role = "employer" | "candidate";
type ViewMode = "landing" | "design-system" | "app";

type PageMeta = {
  title: string;
  breadcrumbs?: string[];
};

const useStyles = makeStyles({
  appRoot: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#FFF8F8",
    overflow: "hidden",
  },
  mainArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  contentArea: {
    flex: 1,
    padding: "24px",
    boxSizing: "border-box",
    ...shorthands.overflow("auto"),
  },
});

export function AppLayout() {
  const styles = useStyles();

  const [viewMode, setViewMode] = useState<ViewMode>("landing");
  const [role, setRole] = useState<Role>("employer");
  const [selectedPage, setSelectedPage] = useState(
    role === "employer" ? "dashboard" : "home",
  );

  const handleSwitchRole = () => {
    setRole((prev) => {
      const nextRole: Role = prev === "employer" ? "candidate" : "employer";
      setSelectedPage(nextRole === "employer" ? "dashboard" : "home");
      return nextRole;
    });
  };

  const handleEmployerNavigate = (page: string) => {
    setSelectedPage(page);
  };

  const handleCandidateNavigate = (page: string) => {
    setSelectedPage(page);
  };

  const handleFabAction = (action: string) => {
    if (role === "employer") {
      switch (action) {
        case "create-job":
          setSelectedPage("create-job");
          break;
        default:
          console.log("Employer action:", action);
      }
    } else {
      switch (action) {
        case "apply":
          setSelectedPage("jobs");
          break;
        default:
          console.log("Candidate action:", action);
      }
    }
  };

  const getEmployerPageMeta = (page: string): PageMeta => {
    switch (page) {
      case "dashboard":
      case "Dashboard":
        return { title: "Dashboard" };

      case "jobs":
      case "Jobs":
        return { title: "Jobs", breadcrumbs: ["Jobs"] };

      case "applicants":
      case "Applicants":
        return { title: "Applicants", breadcrumbs: ["Applicants"] };

      case "pipeline":
      case "Pipeline":
        return { title: "Candidate Pipeline", breadcrumbs: ["Pipeline"] };

      case "documents":
      case "Documents":
        return { title: "Documents", breadcrumbs: ["Documents"] };

      case "create-job":
        return {
          title: "Create Job",
          breadcrumbs: ["Jobs", "Create Job"],
        };

      case "reviews":
      case "Reviews":
        return {
          title: "Performance Reviews",
          breadcrumbs: ["HR", "Reviews"],
        };

      case "onboarding":
      case "OnboardingWorkflow":
        return {
          title: "Onboarding Workflow",
          breadcrumbs: ["HR", "Onboarding"],
        };

      case "company":
      case "CompanyProfile":
        return {
          title: "Company Profile",
          breadcrumbs: ["Company Profile"],
        };

      case "analytics":
      case "Interview Analytics":
        return {
          title: "Interview Analytics",
          breadcrumbs: ["Applicants", "Interview Analytics"],
        };

      case "AIJobDescriptionGenerator":
        return {
          title: "AI Job Description Generator",
          breadcrumbs: ["HR", "AI Job Description Generator"],
        };

      default:
        return { title: page || "Dashboard" };
    }
  };

  const getCandidatePageMeta = (page: string): PageMeta => {
    switch (page) {
      case "home":
      case "Home":
        return { title: "Home" };

      case "jobs":
      case "Find Jobs":
        return { title: "Find Jobs", breadcrumbs: ["Find Jobs"] };

      case "applications":
      case "Applications":
        return { title: "Applications", breadcrumbs: ["Applications"] };

      case "notifications":
      case "Notifications":
        return { title: "Notifications", breadcrumbs: ["Notifications"] };

      case "interview-room":
      case "Interview Room":
        return {
          title: "Interview Room",
          breadcrumbs: ["Interview Room"],
        };

      default:
        return { title: page || "Home" };
    }
  };

  const pageMeta: PageMeta =
    role === "employer"
      ? getEmployerPageMeta(selectedPage)
      : getCandidatePageMeta(selectedPage);

  const renderEmployerPage = () => {
    switch (selectedPage) {
      case "dashboard":
      case "Dashboard":
        return <EmployerDashboard onNavigate={handleEmployerNavigate} />;

      case "jobs":
      case "Jobs":
        return <EmployerJobs onNavigate={handleEmployerNavigate} />;

      case "applicants":
      case "Applicants":
        return <EmployerApplicants onNavigate={handleEmployerNavigate} />;

      case "pipeline":
      case "Pipeline":
        return <CandidatePipeline />;

      case "documents":
      case "Documents":
        return <DocumentManagement />;

      case "reviews":
      case "Reviews":
        return <EmployeeReviews />;

      case "onboarding":
      case "OnboardingWorkflow":
        return <OnboardingWorkflow />;

      case "AIJobDescriptionGenerator":
        return <AIJobDescriptionGenerator />;

      case "company":
      case "CompanyProfile":
        return <CompanyProfile />;

      case "analytics":
      case "Interview Analytics":
        return (
          <InterviewAnalytics onNavigate={handleEmployerNavigate} />
        );

      case "create-job":
        return <EmployerCreateJob onNavigate={handleEmployerNavigate} />;

      default:
        return <EmployerDashboard onNavigate={handleEmployerNavigate} />;
    }
  };

  const renderCandidatePage = () => {
    switch (selectedPage) {
      case "home":
      case "Home":
        return <CandidateHome onNavigate={handleCandidateNavigate} />;

      case "jobs":
      case "Find Jobs":
        return <CandidateJobs onNavigate={handleCandidateNavigate} />;

      case "applications":
      case "Applications":
        return (
          <CandidateApplications onNavigate={handleCandidateNavigate} />
        );

      case "notifications":
      case "Notifications":
        return <CandidateNotifications />;

      case "interview-room":
      case "Interview Room":
        return (
          <InterviewRoom
            jobTitle="Senior Frontend Developer"
            company="TechCorp"
            onComplete={() => setSelectedPage("home")}
          />
        );

      default:
        return <CandidateHome onNavigate={handleCandidateNavigate} />;
    }
  };


  if (viewMode === "landing") {
    return (
      <LandingPage
        onGetStarted={() => setViewMode("app")}
        onOpenDesignSystem={() => setViewMode("design-system")}
      />
    );
  }

  if (viewMode === "design-system") {
    return (
      <DesignSystem
        onBackToLanding={() => setViewMode("landing")}
        onViewApp={() => setViewMode("app")}
      />
    );
  }


  return (
    <div className={styles.appRoot}>
      <Sidebar
        userRole={role}
        currentPage={selectedPage}
        onNavigate={setSelectedPage}
      />

      <div className={styles.mainArea}>
        <TopBar
          title={pageMeta.title}
          role={role}
          breadcrumbs={pageMeta.breadcrumbs}
          onSwitchRole={handleSwitchRole}
        />

        <div className={styles.contentArea}>
          {role === "employer" ? renderEmployerPage() : renderCandidatePage()}
        </div>
      </div>

      <FloatingActionButton userRole={role} onAction={handleFabAction} />
    </div>
  );
}

export default AppLayout;

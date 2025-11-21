import { useState } from "react";
import { Sidebar } from "./SideBar";
import { TopBar } from "./TopBar";
import { EmployerDashboard } from "../Employer/EmployerDashboard";
import { EmployerJobs } from "../Employer/EmployerJobs";
import { EmployerCreateJob } from "../Employer/EmployerCreateJob";
import { EmployerApplicants } from "../Employer/EmployerApplicants";
import { CandidatePipeline } from "../hr/CandidatePipeline";
import { DocumentManagement } from "../hr/DocumentManagement";
import CandidateDashboard from "../Candidate/CandidateDashboard";
import { EmployeeReviews } from "../hr/EmployeeReviews";
import { OnboardingWorkflow } from "../hr/OnboardingWorkflow";
import { CompanyProfile } from "../Employer/CompanyProfile";
import { InterviewAnalytics } from "../Employer/InterviewAnalytics";
import { FloatingActionButton } from "./FloatingActionButton"; 

type Role = "employer" | "candidate";

type PageMeta = {
  title: string;
  breadcrumbs?: string[];
};

export function AppLayout() {
  const [role, setRole] = useState<Role>("employer");

  const [selectedPage, setSelectedPage] = useState(
    role === "employer" ? "dashboard" : "home"
  );

  const handleSwitchRole = () => {
    setRole((prev) => {
      const nextRole: Role = prev === "employer" ? "candidate" : "employer";
      setSelectedPage(nextRole === "employer" ? "dashboard" : "home");
      return nextRole;
    });
  };

  const handleEmployerNavigate = (
    page: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _data?: Record<string, unknown>
  ) => {
    setSelectedPage(page);
  };

  const handleFabAction = (action: string) => {
    if (role === "employer") {
      switch (action) {
        case "create-job":
          setSelectedPage("create-job");
          break;
        case "support":
          console.log("Employer support clicked");
          break;
        case "help":
          console.log("Employer help clicked");
          break;
        default:
          break;
      }
    } else {
      switch (action) {
        case "apply":
          setSelectedPage("jobs");
          break;
        case "support":
          console.log("Candidate support clicked");
          break;
        case "help":
          console.log("Candidate help clicked");
          break;
        default:
          break;
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

  return (
    <div style={{ display: "flex", height: "100vh", background: "#FFF8F8" }}>
      <Sidebar
        userRole={role}
        currentPage={selectedPage}
        onNavigate={setSelectedPage}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar
          title={pageMeta.title}
          role={role}
          breadcrumbs={pageMeta.breadcrumbs}
          onSwitchRole={handleSwitchRole}
        />

        <div style={{ padding: 24, overflowY: "auto" }}>
          {role === "employer" ? (
            renderEmployerPage()
          ) : (
            <CandidateDashboard currentPage={selectedPage} />
          )}
        </div>
      </div>

=      <FloatingActionButton userRole={role} onAction={handleFabAction} />
    </div>
  );
}

export default AppLayout;

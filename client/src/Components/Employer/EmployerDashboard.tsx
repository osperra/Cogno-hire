import React from "react";
import { AnimatedStats } from "../ui/AnimatedStats";
import { QuickActions } from "../ui/QuickActions";
import { ActivityTimeline } from "../ui/ActivityTimeline";
import { StatusPill } from "../ui/StatusPill";

import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Briefcase20Regular,
  People20Regular,
  Clock20Regular,
  CheckmarkCircle20Regular,
  DismissCircle20Regular,
  MoreVerticalRegular,
  Eye20Regular,
  Edit20Regular,
  Delete20Regular,
} from "@fluentui/react-icons";

interface EmployerDashboardProps {
  onNavigate: (page: string) => void;
}

const mockJobPosts = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    type: "Full-time",
    location: "Remote",
    ctc: "$120k - $150k",
    experience: "5-7 years",
    duration: "45 days",
    difficulty: "Hard",
    responses: 28,
  },
  {
    id: 2,
    title: "Product Designer",
    type: "Full-time",
    location: "San Francisco, CA",
    ctc: "$100k - $130k",
    experience: "3-5 years",
    duration: "30 days",
    difficulty: "Medium",
    responses: 42,
  },
  {
    id: 3,
    title: "Backend Engineer",
    type: "Contract",
    location: "New York, NY",
    ctc: "$90k - $110k",
    experience: "4-6 years",
    duration: "60 days",
    difficulty: "Hard",
    responses: 15,
  },
];

const mockResponses = [
  {
    id: 1,
    candidate: "Sarah Chen",
    email: "sarah.chen@email.com",
    job: "Senior Frontend Developer",
    interviewStatus: "Completed",
    hiringStatus: "Under Review",
    score: 87,
  },
  {
    id: 2,
    candidate: "Michael Rodriguez",
    email: "m.rodriguez@email.com",
    job: "Product Designer",
    interviewStatus: "Pending",
    hiringStatus: "Invited",
    score: null,
  },
  {
    id: 3,
    candidate: "Jennifer Park",
    email: "jennifer.p@email.com",
    job: "Backend Engineer",
    interviewStatus: "Completed",
    hiringStatus: "Shortlisted",
    score: 92,
  },
  {
    id: 4,
    candidate: "David Kim",
    email: "david.kim@email.com",
    job: "Senior Frontend Developer",
    interviewStatus: "In Progress",
    hiringStatus: "Invited",
    score: null,
  },
];

export function EmployerDashboard({ onNavigate }: EmployerDashboardProps) {
  const pageContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    rowGap: "24px",
    minHeight: "100vh",
    boxSizing: "border-box",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "16px",
    paddingBottom: "24px",
    maxWidth: "2000px",
    margin: "0 auto",
  };

  const kpiGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
    gap: 16,
  };

  const kpiGridResponsiveWrapper: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  };

  const largeGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 24,
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: 24,
    borderBottom: "1px solid rgba(2,6,23,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const sectionTitleStyle: React.CSSProperties = {
    margin: 0,
    color: "#0B1220",
    fontSize: 16,
    fontWeight: 500,
  };

  const tableCardStyle: React.CSSProperties = {
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
  };

  const tableHeaderRowStyle: React.CSSProperties = {
    background:
      "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  };

  const iconButtonStyle: React.CSSProperties = {
    height: 32,
    width: 32,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  };

  return (
    <div style={pageContainerStyle}>
      <div style={kpiGridResponsiveWrapper}>
        <div style={kpiGridStyle}>
          <AnimatedStats
            title="Active Job Posts"
            value={12}
            icon={Briefcase20Regular}
            color="primary"
          />
          <AnimatedStats
            title="Total Responses"
            value={156}
            icon={People20Regular}
            trend={{ value: "12% this week", isPositive: true }}
          />
          <AnimatedStats
            title="Pending Reviews"
            value={28}
            icon={Clock20Regular}
            color="warning"
          />
          <AnimatedStats
            title="Hired"
            value={45}
            icon={CheckmarkCircle20Regular}
            color="success"
          />
          <AnimatedStats
            title="Rejected"
            value={83}
            icon={DismissCircle20Regular}
            color="danger"
          />
        </div>
      </div>

      <div style={largeGridStyle}>
        <div>
          <QuickActions userRole="employer" onNavigate={onNavigate} />
        </div>
        <div>
          <ActivityTimeline userRole="employer" />
        </div>
      </div>

      <Card style={tableCardStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Recent Job Posts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("jobs")}
            style={{ fontSize: 13 }}
          >
            View All
          </Button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow style={tableHeaderRowStyle}>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>CTC</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead style={{ width: 48 }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockJobPosts.map((job) => (
                <TableRow
                  key={job.id}
                  style={{
                    cursor: "default",
                    transition: "background-color 0.15s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.backgroundColor = "#F3F4F6";
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.backgroundColor = "transparent";
                  }}
                >
                  <TableCell>
                    <div
                      style={{
                        color: "#0B1220",
                        fontWeight: 500,
                      }}
                    >
                      {job.title}
                    </div>
                  </TableCell>
                  <TableCell style={{ color: "#5B6475" }}>{job.type}</TableCell>
                  <TableCell style={{ color: "#5B6475" }}>
                    {job.location}
                  </TableCell>
                  <TableCell style={{ color: "#5B6475" }}>{job.ctc}</TableCell>
                  <TableCell style={{ color: "#5B6475" }}>
                    {job.experience}
                  </TableCell>
                  <TableCell style={{ color: "#5B6475" }}>
                    {job.duration}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      status={
                        job.difficulty === "Easy"
                          ? "success"
                          : job.difficulty === "Medium"
                          ? "warning"
                          : "danger"
                      }
                      label={job.difficulty}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#0118D8",
                      fontWeight: 500,
                    }}
                  >
                    {job.responses}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" style={iconButtonStyle}>
                          <MoreVerticalRegular
                            style={{ width: 16, height: 16 }}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Eye20Regular
                            style={{ width: 14, height: 14, marginRight: 8 }}
                          />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit20Regular
                            style={{ width: 14, height: 14, marginRight: 8 }}
                          />
                          <span>Edit Job</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Delete20Regular
                            style={{ width: 14, height: 14, marginRight: 8 }}
                          />
                          <span style={{ color: "#DC2626" }}>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card style={tableCardStyle}>
        <div style={sectionHeaderStyle}>
          <h3 style={sectionTitleStyle}>Recent Responses</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("applicants")}
            style={{ fontSize: 13 }}
          >
            View All
          </Button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <Table>
            <TableHeader>
              <TableRow style={tableHeaderRowStyle}>
                <TableHead>Candidate</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Role</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Interview Status</TableHead>
                <TableHead>Hiring Status</TableHead>
                <TableHead style={{ width: 120 }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockResponses.map((response) => (
                <TableRow
                  key={response.id}
                  style={{
                    cursor: "default",
                    transition: "background-color 0.15s ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.backgroundColor = "#F3F4F6";
                  }}
                  onMouseLeave={(e) => {
                    (
                      e.currentTarget as HTMLTableRowElement
                    ).style.backgroundColor = "transparent";
                  }}
                >
                  <TableCell>
                    <div
                      style={{
                        color: "#0B1220",
                        fontWeight: 500,
                      }}
                    >
                      {response.candidate}
                    </div>
                  </TableCell>
                  <TableCell style={{ color: "#5B6475" }}>
                    {response.email}
                  </TableCell>
                  <TableCell style={{ color: "#5B6475" }}>
                    {response.job}
                  </TableCell>
                  <TableCell>
                    {response.score != null ? (
                      <span
                        style={{
                          color: "#0118D8",
                          fontWeight: 500,
                        }}
                      >
                        {response.score}%
                      </span>
                    ) : (
                      <span style={{ color: "#5B6475" }}>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusPill
                      status={
                        response.interviewStatus === "Completed"
                          ? "success"
                          : response.interviewStatus === "In Progress"
                          ? "warning"
                          : "info"
                      }
                      label={response.interviewStatus}
                      size="sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={response.hiringStatus
                        .toLowerCase()
                        .replace(" ", "-")}
                    >
                      <SelectTrigger style={{ width: 160, height: 32 }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Invited">Invited</SelectItem>
                        <SelectItem value="Under Review">
                          Under Review
                        </SelectItem>
                        <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="Hired">Hired</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate("analytics")}
                      style={{
                        paddingInline: 12,
                        paddingBlock: 6,
                        borderRadius: 6,
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      View Analytics
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from "react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { StatusPill } from "../ui/StatusPill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import {
  SearchRegular,
  MoreVerticalRegular,
  ContactCard20Regular,
  Briefcase20Regular,
  DataBarHorizontal20Regular,
} from "@fluentui/react-icons";

interface EmployerApplicantsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

const mockApplicants = [
  {
    id: 1,
    candidate: "Sarah Chen",
    email: "sarah.chen@email.com",
    job: "Senior Frontend Developer",
    appliedDate: "Jan 15, 2025",
    interviewStatus: "Completed",
    score: 87,
    hiringStatus: "Under Review",
  },
  {
    id: 2,
    candidate: "Michael Rodriguez",
    email: "m.rodriguez@email.com",
    job: "Product Designer",
    appliedDate: "Jan 18, 2025",
    interviewStatus: "Pending",
    score: null,
    hiringStatus: "Invited",
  },
  {
    id: 3,
    candidate: "Jennifer Park",
    email: "jennifer.p@email.com",
    job: "Backend Engineer",
    appliedDate: "Jan 12, 2025",
    interviewStatus: "Completed",
    score: 92,
    hiringStatus: "Shortlisted",
  },
  {
    id: 4,
    candidate: "David Kim",
    email: "david.kim@email.com",
    job: "Senior Frontend Developer",
    appliedDate: "Jan 20, 2025",
    interviewStatus: "In Progress",
    score: null,
    hiringStatus: "Invited",
  },
  {
    id: 5,
    candidate: "Emily Watson",
    email: "emily.w@email.com",
    job: "DevOps Engineer",
    appliedDate: "Jan 10, 2025",
    interviewStatus: "Completed",
    score: 78,
    hiringStatus: "Rejected",
  },
  {
    id: 6,
    candidate: "Alex Turner",
    email: "alex.turner@email.com",
    job: "Product Designer",
    appliedDate: "Jan 22, 2025",
    interviewStatus: "Completed",
    score: 95,
    hiringStatus: "Hired",
  },
];

export function EmployerApplicants({ onNavigate }: EmployerApplicantsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("All");

  const filteredApplicants = mockApplicants.filter((applicant) => {
    if (selectedTab === "All") return true;
    return (
      applicant.hiringStatus.toLowerCase().replace(" ", "-") === selectedTab
    );
  });

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

  const filtersRowStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    alignItems: "center",
  };

  const searchWrapperStyle: React.CSSProperties = {
    position: "relative",
    flex: 1,
    minWidth: 260,
  };

  const tabsListStyle: React.CSSProperties = {
    display: "inline-flex",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    border: "1px solid rgba(2,6,23,0.08)",
    padding: 4,
    borderRadius: 9999,
    marginTop: 8,
  };

  const tabsTriggerStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 9999,
    border: "none",
    background: "transparent",
    fontSize: 13,
    cursor: "pointer",
  };

  const tabsContentWrapperStyle: React.CSSProperties = {
    marginTop: 24,
  };

  return (
    <div style={pageContainerStyle}>
      <Card
        style={{
          padding: 16,
          border: "1px solid rgba(2,6,23,0.08)",
        }}
      >
        <div style={filtersRowStyle}>
          <div style={searchWrapperStyle}>
            <SearchRegular
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                color: "#5B6475",
              }}
            />
            <Input
              placeholder="Search by name, email, or job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 32, width: "95%" }}
            />
          </div>

          <Select defaultValue="All Jobs">
            <SelectTrigger style={{ width: 190 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Jobs">All Jobs</SelectItem>
              <SelectItem value="Senior Frontend Developer">
                Senior Frontend Developer
              </SelectItem>
              <SelectItem value="Product Designer">Product Designer</SelectItem>
              <SelectItem value="Backend Engineer">Backend Engineer</SelectItem>
              <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="All Status">
            <SelectTrigger style={{ width: 210 }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Interview Status</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs
        defaultValue="All"
        value={selectedTab}
        onValueChange={setSelectedTab}
      >
        <TabsList style={tabsListStyle}>
          <TabsTrigger value="All" style={tabsTriggerStyle}>
            All ({mockApplicants.length})
          </TabsTrigger>
          <TabsTrigger value="invited" style={tabsTriggerStyle}>
            Invited (
            {mockApplicants.filter((a) => a.hiringStatus === "Invited").length})
          </TabsTrigger>
          <TabsTrigger value="under-review" style={tabsTriggerStyle}>
            Under Review (
            {
              mockApplicants.filter((a) => a.hiringStatus === "Under Review")
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="shortlisted" style={tabsTriggerStyle}>
            Shortlisted (
            {
              mockApplicants.filter((a) => a.hiringStatus === "Shortlisted")
                .length
            }
            )
          </TabsTrigger>
          <TabsTrigger value="hired" style={tabsTriggerStyle}>
            Hired (
            {mockApplicants.filter((a) => a.hiringStatus === "Hired").length})
          </TabsTrigger>
          <TabsTrigger value="rejected" style={tabsTriggerStyle}>
            Rejected (
            {mockApplicants.filter((a) => a.hiringStatus === "Rejected").length}
            )
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} style={tabsContentWrapperStyle}>
          <Card
            style={{
              border: "1px solid rgba(2,6,23,0.08)",
              boxShadow:
                "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <Table>
                <TableHeader>
                  <TableRow
                    style={{
                      background:
                        "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
                    }}
                  >
                    <TableHead>Candidate</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Interview Status</TableHead>
                    <TableHead>Hiring Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredApplicants.map((applicant) => (
                    <TableRow
                      key={applicant.id}
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
                          {applicant.candidate}
                        </div>
                      </TableCell>
                      <TableCell style={{ color: "#5B6475" }}>
                        {applicant.email}
                      </TableCell>
                      <TableCell style={{ color: "#5B6475" }}>
                        {applicant.job}
                      </TableCell>
                      <TableCell style={{ color: "#5B6475" }}>
                        {applicant.appliedDate}
                      </TableCell>
                      <TableCell>
                        {applicant.score !== null &&
                        applicant.score !== undefined ? (
                          <span
                            style={{
                              color: "#0118D8",
                              fontWeight: 500,
                            }}
                          >
                            {applicant.score}%
                          </span>
                        ) : (
                          <span style={{ color: "#5B6475" }}>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusPill
                          status={
                            applicant.interviewStatus === "Completed"
                              ? "success"
                              : applicant.interviewStatus === "In Progress"
                              ? "warning"
                              : "info"
                          }
                          label={applicant.interviewStatus}
                          size="sm"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={applicant.hiringStatus
                            .toLowerCase()
                            .replace(" ", "-")}
                        >
                          <SelectTrigger style={{ width: 160, height: 32 }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="invited">Invited</SelectItem>
                            <SelectItem value="under-review">
                              Under Review
                            </SelectItem>
                            <SelectItem value="shortlisted">
                              Shortlisted
                            </SelectItem>
                            <SelectItem value="hired">Hired</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <button
                              style={{
                                height: 32,
                                width: 32,
                                borderRadius: 6,
                                border: "none",
                                background: "transparent",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.backgroundColor = "#F3F4F6";
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.backgroundColor = "transparent";
                              }}
                            >
                              <MoreVerticalRegular
                                style={{ width: 16, height: 16 }}
                              />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() =>
                                onNavigate("analytics", {
                                  candidateId: applicant.id,
                                })
                              }
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <DataBarHorizontal20Regular
                                  style={{ marginRight: 8 }}
                                />
                                <span>View Analytics</span>
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <ContactCard20Regular
                                  style={{ marginRight: 8 }}
                                />
                                <span>View Candidate</span>
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Briefcase20Regular
                                  style={{ marginRight: 8 }}
                                />
                                <span>View Job</span>
                              </span>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

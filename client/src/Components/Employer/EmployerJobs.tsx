import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
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
import { StatusPill } from "../ui/StatusPill";
import {
  SearchRegular,
  Add20Regular,
  Filter20Regular,
  MoreVerticalRegular,
  Eye20Regular,
  Edit20Regular,
  Delete20Regular,
  Copy20Regular,
} from "@fluentui/react-icons";

interface EmployerJobsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

const mockJobs = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    type: "Full-time",
    location: "Remote",
    ctc: "$120k - $150k",
    experience: "5-7 years",
    duration: "45 days",
    difficulty: "Hard",
    status: "Active",
    responses: 28,
    datePosted: "Jan 15, 2025",
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
    status: "Active",
    responses: 42,
    datePosted: "Jan 20, 2025",
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
    status: "Active",
    responses: 15,
    datePosted: "Jan 12, 2025",
  },
  {
    id: 4,
    title: "DevOps Engineer",
    type: "Full-time",
    location: "Remote",
    ctc: "$110k - $140k",
    experience: "5-8 years",
    duration: "90 days",
    difficulty: "Hard",
    status: "Draft",
    responses: 0,
    datePosted: "Jan 25, 2025",
  },
  {
    id: 5,
    title: "Junior Frontend Developer",
    type: "Full-time",
    location: "Austin, TX",
    ctc: "$70k - $85k",
    experience: "1-2 years",
    duration: "30 days",
    difficulty: "Easy",
    status: "Closed",
    responses: 67,
    datePosted: "Dec 10, 2024",
  },
];

export function EmployerJobs({ onNavigate }: EmployerJobsProps) {
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("All Types");
  const [locationType, setLocationType] = useState("All Locations");

  const toolbarContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  };

  const filtersRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "minmax(260px, 1fr) 160px 160px auto",
    columnGap: 12,
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  };

  const searchWrapperStyle: React.CSSProperties = {
    position: "relative",
    width: "95%",
  };

  const iconButtonStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
  const menuItemInnerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const menuIconStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    flexShrink: 0,
  };

  const menuLabelStyle: React.CSSProperties = {
    lineHeight: 1.2,
    display: "inline-block",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Card style={{ padding: 16, border: "1px solid rgba(2,6,23,0.08)" }}>
        <div style={toolbarContainerStyle}>
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
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 32, width: "100%" }}
              />
            </div>

            <Select value={jobType} onValueChange={setJobType}>
              <SelectTrigger style={{ width: "100%" }}>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Full Time">Full Time</SelectItem>
                <SelectItem value="Contract">Contract</SelectItem>
                <SelectItem value="Part Time">Part Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={locationType} onValueChange={setLocationType}>
              <SelectTrigger style={{ width: "100%" }}>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Locations">All Locations</SelectItem>
                <SelectItem value="Remote">Remote</SelectItem>
                <SelectItem value="On-site">On-site</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" style={iconButtonStyle}>
              <Filter20Regular style={{ width: 16, height: 16 }} />
            </Button>
          </div>

          <Button
            onClick={() => onNavigate("create-job")}
            style={{
              backgroundColor: "#0118D8",
              color: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              whiteSpace: "nowrap",
            }}
          >
            <Add20Regular style={{ width: 16, height: 16 }} />
            <span>Create Job</span>
          </Button>
        </div>
      </Card>

      {selectedJobs.length > 0 && (
        <Card
          style={{
            padding: 16,
            border: "1px solid rgba(2,6,23,0.08)",
            backgroundColor: "#EFF5FF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p style={{ color: "#0118D8", margin: 0 }}>
              {selectedJobs.length} job{selectedJobs.length > 1 ? "s" : ""}{" "}
              selected
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="outline" size="sm">
                Duplicate
              </Button>
              <Button variant="outline" size="sm">
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                style={{
                  color: "#DC2626",
                  borderColor: "#FECACA",
                  backgroundColor: "#FEF2F2",
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Card
        style={{
          border: "1px solid rgba(2,6,23,0.08)",
          boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
          padding: 0,
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
                <TableHead style={{ width: 40 }}>
                  <Checkbox
                    checked={selectedJobs.length === mockJobs.length}
                    onChange={(_, data) => {
                      if (data?.checked) {
                        setSelectedJobs(mockJobs.map((job) => job.id));
                      } else {
                        setSelectedJobs([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>CTC</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead style={{ width: 40 }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockJobs.map((job) => (
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
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onChange={(_, data) => {
                        const isChecked = !!data?.checked;
                        if (isChecked) {
                          setSelectedJobs((prev) =>
                            prev.includes(job.id) ? prev : [...prev, job.id]
                          );
                        } else {
                          setSelectedJobs((prev) =>
                            prev.filter((jobId) => jobId !== job.id)
                          );
                        }
                      }}
                    />
                  </TableCell>
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
                  <TableCell>
                    <StatusPill
                      status={
                        job.status === "Active"
                          ? "success"
                          : job.status === "Draft"
                          ? "warning"
                          : "neutral"
                      }
                      label={job.status}
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
                  <TableCell style={{ color: "#5B6475" }}>
                    {job.datePosted}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          style={{
                            ...iconButtonStyle,
                            borderRadius: 6,
                          }}
                        >
                          <MoreVerticalRegular
                            style={{ width: 16, height: 16 }}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <div style={menuItemInnerStyle}>
                            <Eye20Regular style={menuIconStyle} />
                            <span style={menuLabelStyle}>View Details</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <div style={menuItemInnerStyle}>
                            <Edit20Regular style={menuIconStyle} />
                            <span style={menuLabelStyle}>Edit Job</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <div style={menuItemInnerStyle}>
                            <Copy20Regular style={menuIconStyle} />
                            <span style={menuLabelStyle}>Duplicate</span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <div style={menuItemInnerStyle}>
                            <Delete20Regular
                              style={{ ...menuIconStyle}}
                            />
                            <span
                              style={{ ...menuLabelStyle, color: "#DC2626" }}
                            >
                              Delete
                            </span>
                          </div>
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
    </div>
  );
}

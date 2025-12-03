import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";
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

import { StatusPill } from "../ui/StatusPill";

interface EmployerJobsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

const useStyles = makeStyles({
  root: {
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

    "@media (max-width: 768px)": {
      paddingLeft: "12px",
      paddingRight: "12px",
      paddingTop: "12px",
      paddingBottom: "16px",
      rowGap: "16px",
    },
  },

  cardBase: {
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    backgroundColor: "#FFFFFF",
  },

  toolbarCard: {
    borderRadius: "999px",
    padding: "8px 12px",
    boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
    border: "1px solid rgba(148,163,184,0.35)",
    backgroundColor: "#FFFFFF",
  },

  toolbarRow: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
  },

  toolbarLeft: {
    display: "flex",
    flex: 1,
    flexWrap: "wrap",
    columnGap: "8px",
    rowGap: "8px",
    alignItems: "center",
    minWidth: 0,
  },

  searchWrapper: {
    position: "relative",
    flex: 1,
    minWidth: "260px",
    maxWidth: "100%",
  },

  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "#5B6475",
    fontSize: "16px",
    zIndex: "10",
  },

  searchInput: {
    width: "100%",
    height: "40px",
    paddingLeft: "32px",
    fontSize: "14px",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("9px"),
    ...shorthands.border("1px", "solid", "#E5E7EB"),

    "::placeholder": {
      color: "#9CA3AF",
    },
  },

  filterDropdown: {
    minWidth: "150px",
  },

  filterButton: {
    minWidth: "36px",
    height: "36px",
    padding: 0,
    ...shorthands.borderRadius("10px"),
    ...shorthands.border("1px", "solid", "#E5E7EB"),
    backgroundColor: "#FFFFFF",
    color: "#6B7280",

    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },

  createButton: {
    height: "36px",
    ...shorthands.borderRadius("999px"),
    paddingInline: "16px",
    backgroundColor: "#0F5BFF",
    color: "#FFFFFF",
    border: "none",
    fontWeight: 600,

    ":hover": {
      backgroundColor: "#1B56FD",
      color: "#FFFFFF",
    },
  },

  bulkCard: {
    padding: "12px 16px",
    backgroundColor: "#EFF6FF",
    ...shorthands.border("1px", "solid", "#BFDBFE"),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: "12px",
  },

  bulkActionsRow: {
    display: "flex",
    columnGap: "8px",
  },
  tableCard: {},

  tableWrapper: {
    overflowX: "auto",
    overflowY: "auto",
    maxHeight: "60vh",
  },

  table: {
    width: "100%",
    minWidth: "1100px",
    tableLayout: "fixed",
  },

  tableHeaderCell: {
    fontSize: "0.8rem",
    color: "#4B5563",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  tableCell: {
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  tableHeaderRow: {
    background:
      "linear-gradient(to right, rgba(1,24,216,0.06), rgba(27,86,253,0.06))",
  },

  tableRow: {
    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },

  subtleIconButton: {
    ...shorthands.borderRadius("8px"),
    ...shorthands.padding("4px"),
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    ":hover": {
      backgroundColor: "#F3F4F6",
    },
  },

  dangerOutline: {
    ...shorthands.border("1px", "solid", "#FCA5A5"),
    color: "#DC2626",
    backgroundColor: "transparent",
    ":hover": {
      backgroundColor: "#FEF2F2",
    },
  },
});

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
  const styles = useStyles();
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all-types");
  const [locationFilter, setLocationFilter] = useState("all-locations");

  const toggleSelectAll = () => {
    if (selectedJobs.length === mockJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(mockJobs.map((job) => job.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedJobs((prev) =>
      prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
    );
  };

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        typeFilter === "all-types" ||
        (typeFilter === "full-time" && job.type === "Full-time") ||
        (typeFilter === "contract" && job.type === "Contract") ||
        (typeFilter === "part-time" && job.type === "Part-time");

      const matchesLocation =
        locationFilter === "all-locations" ||
        (locationFilter === "remote" &&
          job.location.toLowerCase().includes("remote")) ||
        (locationFilter === "onsite" &&
          !job.location.toLowerCase().includes("remote")) ||
        (locationFilter === "hybrid" &&
          job.location.toLowerCase().includes("hybrid"));

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [searchQuery, typeFilter, locationFilter]);

  const headerCheckboxValue =
    selectedJobs.length === 0
      ? false
      : selectedJobs.length === mockJobs.length
      ? true
      : ("mixed" as const);

  return (
    <div className={styles.root}>
      <Card className={`${styles.cardBase} ${styles.toolbarCard}`}>
        <div className={styles.toolbarRow}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>
                <SearchRegular />
              </span>
              <Input
                value={searchQuery}
                onChange={(_, data) => setSearchQuery(data.value)}
                placeholder="Search jobs..."
                className={styles.searchInput}
              />
            </div>

            <Dropdown
              defaultValue="All-Types"
              className={styles.filterDropdown}
              onOptionSelect={(_, data) =>
                setTypeFilter((data.optionValue as string) ?? "all-types")
              }
            >
              <Option value="all-types">All Types</Option>
              <Option value="full-time">Full-time</Option>
              <Option value="contract">Contract</Option>
              <Option value="part-time">Part-time</Option>
            </Dropdown>

            <Dropdown
              defaultValue="All-Locations"
              className={styles.filterDropdown}
              onOptionSelect={(_, data) =>
                setLocationFilter(
                  (data.optionValue as string) ?? "all-locations"
                )
              }
            >
              <Option value="all-locations">All Locations</Option>
              <Option value="remote">Remote</Option>
              <Option value="onsite">On-site</Option>
              <Option value="hybrid">Hybrid</Option>
            </Dropdown>

            <Button
              appearance="subtle"
              icon={<Filter20Regular />}
              aria-label="More filters"
              className={styles.filterButton}
            />
          </div>

          <Button
            className={styles.createButton}
            icon={<Add20Regular />}
            onClick={() => onNavigate("create-job")}
          >
            Create Job
          </Button>
        </div>
      </Card>

      {selectedJobs.length > 0 && (
        <Card className={`${styles.cardBase} ${styles.bulkCard}`}>
          <Text style={{ color: "#0118D8" }}>
            {selectedJobs.length} job
            {selectedJobs.length > 1 ? "s" : ""} selected
          </Text>
          <div className={styles.bulkActionsRow}>
            <Button appearance="outline" size="small">
              Duplicate
            </Button>
            <Button appearance="outline" size="small">
              Archive
            </Button>
            <Button
              appearance="outline"
              size="small"
              className={styles.dangerOutline}
            >
              Delete
            </Button>
          </div>
        </Card>
      )}

      <Card className={`${styles.cardBase} ${styles.tableCard}`}>
        <div className={styles.tableWrapper}>
          <Table aria-label="Jobs table " className={styles.table}>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  <Checkbox
                    checked={headerCheckboxValue}
                    onChange={toggleSelectAll}
                    aria-label="Select all jobs"
                  />
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Title
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Type
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Location
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  CTC
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Experience
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Duration
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Difficulty
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Status
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Responses
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Date Posted
                </TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id} className={styles.tableRow}>
                  <TableCell>
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => toggleSelect(job.id)}
                      aria-label={`Select ${job.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Text weight="semibold" style={{ color: "#0B1220" }}>
                      {job.title}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text style={{ color: "#5B6475" }}>{job.type}</Text>
                  </TableCell>
                  <TableCell>
                    <Text style={{ color: "#5B6475" }}>{job.location}</Text>
                  </TableCell>
                  <TableCell>
                    <Text style={{ color: "#5B6475" }}>{job.ctc}</Text>
                  </TableCell>
                  <TableCell>
                    <Text style={{ color: "#5B6475" }}>{job.experience}</Text>
                  </TableCell>
                  <TableCell>
                    <Text style={{ color: "#5B6475" }}>{job.duration}</Text>
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
                  <TableCell>
                    <Text
                      style={{
                        color: tokens.colorBrandForeground1,
                        fontWeight: 500,
                      }}
                    >
                      {job.responses}
                    </Text>
                  </TableCell>
                  <TableCell>
                    <Text style={{ color: "#5B6475" }}>{job.datePosted}</Text>
                  </TableCell>
                  <TableCell>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <button
                          type="button"
                          className={styles.subtleIconButton}
                          aria-label="More actions"
                        >
                          <MoreVerticalRegular />{" "}
                        </button>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem
                            icon={<Eye20Regular />}
                            onClick={() =>
                              onNavigate("job-details", { jobId: job.id })
                            }
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<Edit20Regular />}
                            onClick={() =>
                              onNavigate("edit-job", { jobId: job.id })
                            }
                          >
                            Edit Job
                          </MenuItem>
                          <MenuItem icon={<Copy20Regular />}>
                            Duplicate
                          </MenuItem>
                          <MenuItem
                            icon={<Delete20Regular />}
                            style={{ color: "#DC2626" }}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
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

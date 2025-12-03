import * as React from "react";
import {
  Card,
  Button,
  Input,
  Select,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Search20Regular } from "@fluentui/react-icons";

import { EnhancedJobCard } from "../ui/EnhancedJobCard";
import { useState } from "react";

interface CandidateJobsProps {
  onNavigate: (page: string, data?: Record<string, unknown>) => void;
}

const mockJobs = [
  {
    id: 1,
    company: "Acme Corporation",
    companyLogo: "AC",
    title: "Senior Frontend Developer",
    location: "Remote",
    type: "Full-time",
    ctc: "$120k - $150k",
    experience: "5-7 years",
    postedDate: "2 days ago",
    difficulty: "Hard",
    skills: ["React", "TypeScript", "Node.js"],
    match: 95,
  },
  {
    id: 2,
    company: "TechStart Inc",
    companyLogo: "TS",
    title: "Full Stack Engineer",
    location: "San Francisco, CA",
    type: "Full-time",
    ctc: "$130k - $160k",
    experience: "4-6 years",
    postedDate: "1 week ago",
    difficulty: "Hard",
    skills: ["React", "Python", "AWS"],
    match: 88,
  },
  {
    id: 3,
    company: "Innovation Labs",
    companyLogo: "IL",
    title: "React Developer",
    location: "New York, NY",
    type: "Contract",
    ctc: "$100k - $120k",
    experience: "3-5 years",
    postedDate: "3 days ago",
    difficulty: "Medium",
    skills: ["React", "Redux", "GraphQL"],
    match: 92,
  },
  {
    id: 4,
    company: "Digital Solutions",
    companyLogo: "DS",
    title: "Frontend Developer",
    location: "Remote",
    type: "Full-time",
    ctc: "$90k - $110k",
    experience: "2-4 years",
    postedDate: "5 days ago",
    difficulty: "Medium",
    skills: ["Vue.js", "JavaScript", "CSS"],
    match: 75,
  },
  {
    id: 5,
    company: "CloudTech",
    companyLogo: "CT",
    title: "React Native Developer",
    location: "Austin, TX",
    type: "Full-time",
    ctc: "$110k - $130k",
    experience: "3-5 years",
    postedDate: "1 day ago",
    difficulty: "Medium",
    skills: ["React Native", "TypeScript", "Firebase"],
    match: 85,
  },
  {
    id: 6,
    company: "Enterprise Corp",
    companyLogo: "EC",
    title: "Junior Frontend Developer",
    location: "Remote",
    type: "Full-time",
    ctc: "$70k - $85k",
    experience: "1-2 years",
    postedDate: "1 week ago",
    difficulty: "Easy",
    skills: ["HTML", "CSS", "JavaScript"],
    match: 68,
  },
];

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

  searchCard: {
    padding: tokens.spacingHorizontalL,
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
  },

  searchSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
  },

  searchRow: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalS,
    "@media (min-width: 768px)": {
      display: "grid",
      gridTemplateColumns: "1fr 190px 190px",
      columnGap: tokens.spacingHorizontalM,
      alignItems: "center",
    },
  },

  searchInputWrapper: {
    width: "100%",
    minWidth: 0,
  },

  searchInput: {
    width: "100%",
    borderRadius: "8px",
  },

  dropdown: {
    width: "100%",
    "@media (min-width: 768px)": {
      width: "190px",
      justifySelf: "end",
    },
  },

  filterChipRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
  },

  chipBase: {
    borderRadius: "999px",
    border: "1px solid rgba(2,6,23,0.08)",
    padding: "6px 12px",
    fontSize: tokens.fontSizeBase200,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground1,
    color: "#5B6475",
    transition:
      "border-color 150ms ease, background-color 150ms ease, color 150ms ease",
  },

  chipSelected: {
    backgroundColor: "#0118D8",
    color: "#FFFF",
  },

  resultsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: tokens.spacingHorizontalM,
  },

  resultsText: {
    color: "#5B6475",
  },

  resultsStrong: {
    color: "#0B1220",
    fontWeight: 500,
  },

  jobsList: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
  },

  jobHoverWrapper: {
    position: "relative",
    overflow: "hidden",

    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      height: "3px",
      width: "0%",
      backgroundColor: "#0A31F1",
      opacity: 0,
    },

    ":hover::after": {
      opacity: 1,
      animation: "progressRun 1.4s ease-out infinite",
    },
  },

  "@keyframes progressRun": {
    "0%": { width: "0%", left: "0%" },
    "50%": { width: "60%", left: "20%" },
    "100%": { width: "0%", left: "100%" },
  },

  loadMoreWrapper: {
    textAlign: "center",
    paddingTop: tokens.spacingVerticalL,
  },
  loadMoreButton: {
    ":hover": {
      backgroundColor: "#E9DFC3",
    },
  },
});

export const CandidateJobs: React.FC<CandidateJobsProps> = ({ onNavigate }) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Remote"]);

  const filterChips = [
    { label: "Remote", count: 234 },
    { label: "Full-time", count: 567 },
    { label: "Easy", count: 89 },
    { label: "Medium", count: 245 },
    { label: "Hard", count: 178 },
    { label: "$100k+", count: 312 },
  ];

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const jobsToShow = mockJobs;

  return (
    <div className={styles.root}>
      <Card className={styles.searchCard} appearance="outline">
        <div className={styles.searchSection}>
          <div className={styles.searchRow}>
            <div className={styles.searchInputWrapper}>
              <Input
                className={styles.searchInput}
                contentBefore={
                  <Search20Regular style={{ color: "#5B6475", fontSize: 16 }} />
                }
                placeholder="Search by title, company, or skills..."
                value={searchQuery}
                onChange={(_, data) => setSearchQuery(data.value)}
              />
            </div>

            <Select defaultValue="all-locations" className={styles.dropdown}>
              <option value="all-locations">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </Select>

            <Select defaultValue="relevance" className={styles.dropdown}>
              <option value="relevance">Most Relevant</option>
              <option value="recent">Most Recent</option>
              <option value="match">Best Match</option>
              <option value="salary-high">Highest Salary</option>
            </Select>
          </div>

          <div className={styles.filterChipRow}>
            {filterChips.map((chip) => {
              const selected = selectedFilters.includes(chip.label);
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => toggleFilter(chip.label)}
                  className={
                    selected
                      ? `${styles.chipBase} ${styles.chipSelected}`
                      : styles.chipBase
                  }
                >
                  {chip.label}
                  <span style={{ marginLeft: 4, opacity: 0.7 }}>
                    ({chip.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className={styles.resultsRow}>
        <Text className={styles.resultsText}>
          Showing{" "}
          <span className={styles.resultsStrong}>{jobsToShow.length}</span> jobs
        </Text>
        <Button appearance="subtle" size="small">
          <h4> Save Search  </h4>
        </Button>
      </div>

      <div className={styles.jobsList}>
        {jobsToShow.map((job) => (
          <EnhancedJobCard
            key={job.id}
            company={job.company}
            companyLogo={job.companyLogo}
            title={job.title}
            location={job.location}
            type={job.type}
            ctc={job.ctc}
            experience={job.experience}
            postedDate={job.postedDate}
            difficulty={job.difficulty}
            skills={job.skills}
            match={job.match}
            onApply={() => {
              onNavigate("applications", { jobId: job.id });
            }}
            onViewDetails={() => {
              onNavigate("job-details", { jobId: job.id });
            }}
          />
        ))}
      </div>

      <div className={styles.loadMoreWrapper}>
        <Button
          appearance="outline"
          size="large"
          className={styles.loadMoreButton}
        >
          Load More Jobs
        </Button>
      </div>
    </div>
  );
};

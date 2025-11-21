import { useMemo, useState } from "react";
import {
  Button,
  Card,
  Input,
  Tab,
  TabList,
  type TabValue,
  Table,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableBody,
  TableCell,
  Dropdown,
  Option,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Badge,
  Text,
  makeStyles,
  shorthands,
  tokens,
} from "@fluentui/react-components";

import {
  SearchRegular,
  MoreVerticalRegular,
  DocumentText20Regular,
  DocumentPdf20Regular,
  Image20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Warning20Regular,
  ShieldCheckmark20Regular,
  ArrowDownload20Regular,
  Eye20Regular,
  Delete20Regular,
  CloudArrowUp20Regular,
} from "@fluentui/react-icons";

import { StatusPill } from "../layout/StatusPill";
import type { StatusType } from "../layout/StatusPill";

const mockDocuments = [
  {
    id: 1,
    name: "Resume_JohnDoe.pdf",
    type: "Resume",
    uploadedBy: "John Doe",
    uploadDate: "Jan 15, 2025",
    size: "2.4 MB",
    status: "Verified",
    category: "Application",
  },
  {
    id: 2,
    name: "Bachelor_Degree_Certificate.pdf",
    type: "Education",
    uploadedBy: "John Doe",
    uploadDate: "Jan 15, 2025",
    size: "1.8 MB",
    status: "Verified",
    category: "Education",
  },
  {
    id: 3,
    name: "Previous_Employment_Letter.pdf",
    type: "Experience",
    uploadedBy: "John Doe",
    uploadDate: "Jan 16, 2025",
    size: "856 KB",
    status: "Pending",
    category: "Experience",
  },
  {
    id: 4,
    name: "ID_Proof_Passport.jpg",
    type: "Identification",
    uploadedBy: "John Doe",
    uploadDate: "Jan 16, 2025",
    size: "3.2 MB",
    status: "Verified",
    category: "Identification",
  },
  {
    id: 5,
    name: "Background_Check_Report.pdf",
    type: "Background Check",
    uploadedBy: "HR Team",
    uploadDate: "Jan 18, 2025",
    size: "4.1 MB",
    status: "Completed",
    category: "Verification",
  },
  {
    id: 6,
    name: "Offer_Letter_Signed.pdf",
    type: "Offer Letter",
    uploadedBy: "HR Team",
    uploadDate: "Jan 20, 2025",
    size: "512 KB",
    status: "Signed",
    category: "Onboarding",
  },
];

type DocTab = "all" | "application" | "verification" | "onboarding" | "employee";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: "12px",
    flexWrap: "wrap",
  },

  headerTitleBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "4px",
  },

  headerTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  headerSubtitle: {
    fontSize: "0.85rem",
    color: "#5B6475",
  },

  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": {
      backgroundColor: "#1B56FD",
      color: "#FFFFFF",
    },
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1,minmax(0,1fr))",
    rowGap: "12px",
    columnGap: "12px",

    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4,minmax(0,1fr))",
    },
  },

  statCard: {
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "16px 18px",
    backgroundColor: "#FFFFFF",
  },

  statLabel: {
    fontSize: "0.8rem",
    color: "#5B6475",
    marginBottom: "4px",
  },

  statValue: {
    fontSize: "2rem",
    fontWeight: 600,
    color: "#0B1220",
  },

  statIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  toolbarCard: {
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "10px 16px",
    backgroundColor: "#FFFFFF",
  },

  toolbarRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
    rowGap: "8px",
    flexWrap: "wrap",
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
    color: "#5B6475",
    pointerEvents: "none",
    zIndex:"10"
  },

  searchInput: {
    width: "100%",
    height: "44px",
    paddingLeft: "32px",
    paddingRight: "12px",
    fontSize: "0.9rem",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("9px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.16)"),

    "::placeholder": {
      color: "#9CA3AF",
    },
  },

  filterButton: {
    minWidth: "120px",
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.1)"),
    fontSize: "0.85rem",
  },

  tabsWrapper: {
    display: "inline-flex",
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    backgroundColor: "#FFFFFF",
    padding: "4px 8px",
    alignSelf: "flex-start",
    marginTop: "4px",
  },

  tabList: {
    columnGap: "12px",
    rowGap: "6px",
    flexWrap: "wrap",
  },

  tableCard: {
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    padding: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  tableWrapper: {
    overflowX: "auto", // responsive horizontally
    backgroundColor: "#FFFFFF",
  },

  table: {
    width: "100%",
    minWidth: "980px", // keeps layout; scrolls on smaller screens
  },

  tableHeaderRow: {
    background: "#F5F7FF",
  },

  tableHeaderCell: {
    fontSize: "0.8rem",
    color: "#4B5563",
    fontWeight: 600,
    padding: "12px 20px",
  },

  tableRow: {
    height: "60px",
    backgroundColor: "#FFFFFF",
    ":not(:last-child)": {
      borderBottom: "1px solid #F3F4F6",
    },
    ":hover": {
      backgroundColor: "#F9FAFF",
    },
  },

  tableCell: {
    padding: "12px 20px",
    fontSize: "0.85rem",
    color: "#4B5563",
  },

  docNameCell: {
    padding: "12px 20px",
  },

  docNameRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
  },

  docIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#EEF2FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  docNameText: {
    color: "#0B1220",
    fontSize: "0.9rem",
    fontWeight: 500,
  },

  categoryBadge: {
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "#E9DFC3"),
    backgroundColor: "#E9DFC3",
    color: "#0B1220",
    fontSize: "0.75rem",
  },

  actionButton: {
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

  uploadCard: {
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("2px", "dashed", "rgba(2,6,23,0.12)"),
    padding: "40px 32px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#FFFDFB",
    transitionProperty: "border-color",
    transitionDuration: "150ms",

    ":hover": {
      ...shorthands.border("2px", "dashed", "#0118D8"),
    },
  },

  uploadIconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "999px",
    backgroundColor: "#EEF2FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },

  uploadTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "4px",
  },

  uploadSubtitle: {
    fontSize: "0.85rem",
    color: "#5B6475",
    marginBottom: "12px",
  },

 uploadButton: {
  backgroundColor: "#0118D8",
  color: "#FFFFFF",
  marginTop: "8px",
  display: "inline-flex",
  justifyContent: "center",
  paddingInline: "16px",   
  marginInline: "auto", 
  ":hover": {
    backgroundColor: "#1B56FD",
    color: "#FFFFFF",
  },
},

});

const mapStatusToPill = (status: string): StatusType => {
  switch (status) {
    case "Verified":
    case "Completed":
    case "Signed":
      return "success";
    case "Pending":
      return "warning"; 
    default:
      return "neutral";
  }
};

export function DocumentManagement() {
  const styles = useStyles();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all" as DocTab);

  const filteredDocs = useMemo(() => {
    const lower = search.toLowerCase();

    let docs = mockDocuments;

    if (activeTab !== "all") {
      if (activeTab === "application") {
        docs = docs.filter((d) => d.category === "Application");
      } else if (activeTab === "verification") {
        docs = docs.filter((d) => d.category === "Verification");
      } else if (activeTab === "onboarding") {
        docs = docs.filter((d) => d.category === "Onboarding");
      } else if (activeTab === "employee") {
        docs = [];
      }
    }

    if (!lower.trim()) return docs;

    return docs.filter((d) => {
      const concat =
        `${d.name} ${d.type} ${d.category} ${d.uploadedBy}`.toLowerCase();
      return concat.includes(lower);
    });
  }, [search, activeTab]);

  const totalDocs = 248;
  const verified = 186;
  const pending = 42;
  const requiresAction = 20;

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleBlock}>
          <span className={styles.headerTitle}>Document Management</span>
          <span className={styles.headerSubtitle}>
            Manage candidate documents, certificates, and verification records
          </span>
        </div>

        <Button
          appearance="primary"
          className={styles.primaryButton}
          icon={<CloudArrowUp20Regular />}
        >
          Upload Document
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>Total Documents</div>
              <div className={styles.statValue}>{totalDocs}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#EFF6FF" }}
            >
              <DocumentText20Regular
                style={{ color: "#0118D8", fontSize: 24 }}
              />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>Verified</div>
              <div className={styles.statValue}>{verified}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#ECFDF5" }}
            >
              <CheckmarkCircle20Regular
                style={{ color: "#16A34A", fontSize: 24 }}
              />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>Pending Review</div>
              <div className={styles.statValue}>{pending}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#FFFBEB" }}
            >
              <Clock20Regular style={{ color: "#D97706", fontSize: 24 }} />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div className={styles.statLabel}>Requires Action</div>
              <div className={styles.statValue}>{requiresAction}</div>
            </div>
            <div
              className={styles.statIconBox}
              style={{ backgroundColor: "#FEF2F2" }}
            >
              <Warning20Regular style={{ color: "#DC2626", fontSize: 24 }} />
            </div>
          </div>
        </Card>
      </div>

      <Card className={styles.toolbarCard}>
        <div className={styles.toolbarRow}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <SearchRegular />
            </span>
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(_, data) => setSearch(data.value)}
              className={styles.searchInput}
            />
          </div>

          <Dropdown className={styles.filterButton} defaultValue="all-types">
            <Option value="all-types">All Types</Option>
            <Option value="application">Application</Option>
            <Option value="education">Education</Option>
            <Option value="experience">Experience</Option>
          </Dropdown>

          <Dropdown className={styles.filterButton} defaultValue="all-status">
            <Option value="all-status">All Status</Option>
            <Option value="verified">Verified</Option>
            <Option value="pending">Pending</Option>
            <Option value="completed">Completed</Option>
          </Dropdown>

          <Dropdown className={styles.filterButton} defaultValue="any-date">
            <Option value="any-date">Any Date</Option>
            <Option value="7-days">Last 7 days</Option>
            <Option value="30-days">Last 30 days</Option>
          </Dropdown>
        </div>
      </Card>

      <div className={styles.tabsWrapper}>
        <TabList
          selectedValue={activeTab}
          onTabSelect={(_, data) => setActiveTab(data.value as DocTab)}
          className={styles.tabList}
        >
          <Tab value="all">All Documents (248)</Tab>
          <Tab value="application">Application (89)</Tab>
          <Tab value="verification">Verification (64)</Tab>
          <Tab value="onboarding">Onboarding (45)</Tab>
          <Tab value="employee">Employee Records (50)</Tab>
        </TabList>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <Table
            aria-label="Documents table"
            className={styles.table}
          >
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell className={styles.tableHeaderCell} style={{ width: "30%"}}>
                  Document Name
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Type
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Category
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Uploaded By
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Upload Date
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Size
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>
                  Status
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell} />
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id} className={styles.tableRow}>
                  <TableCell className={styles.docNameCell}>
                    <div className={styles.docNameRow}>
                      <div className={styles.docIconBox}>
                        {doc.name.match(/\.(jpg|jpeg|png)$/i) ? (
                          <Image20Regular style={{ color: "#0118D8" }} />
                        ) : (
                          <DocumentPdf20Regular style={{ color: "#0118D8" }} />
                        )}
                      </div>
                      <div>
                        <div className={styles.docNameText}>{doc.name}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className={styles.tableCell}>{doc.type}</TableCell>

                  <TableCell className={styles.tableCell}>
                    <Badge
                      appearance="outline"
                      className={styles.categoryBadge}
                    >
                      {doc.category}
                    </Badge>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    {doc.uploadedBy}
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    {doc.uploadDate}
                  </TableCell>

                  <TableCell className={styles.tableCell}>{doc.size}</TableCell>

                  <TableCell className={styles.tableCell}>
                    <StatusPill
                      status={mapStatusToPill(doc.status)}
                      label={doc.status}
                      size="sm"
                    />
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <button
                          type="button"
                          className={styles.actionButton}
                          aria-label="More options"
                        >
                          <MoreVerticalRegular />
                        </button>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem icon={<Eye20Regular />}>View</MenuItem>
                          <MenuItem icon={<ArrowDownload20Regular />}>
                            Download
                          </MenuItem>
                          <MenuItem icon={<ShieldCheckmark20Regular />}>
                            Verify
                          </MenuItem>
                          <MenuItem
                            icon={<Delete20Regular />}
                            style={{
                              color: tokens.colorPaletteRedForeground1,
                            }}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}

              {filteredDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className={styles.tableCell}>
                    <Text
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "16px 0",
                        color: "#6B7280",
                      }}
                    >
                      No documents match the current filters.
                    </Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className={styles.uploadCard}>
        <div className={styles.uploadIconCircle}>
          <CloudArrowUp20Regular style={{ color: "#0118D8", fontSize: 28 }} />
        </div>
        <div className={styles.uploadTitle}>
          Drop files here or click to upload
        </div>
        <div className={styles.uploadSubtitle}>
          Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
        </div>
        <Button
        style={{width:"20px"}}
          appearance="primary"
          size="small" 
          className={styles.uploadButton}
          icon={<CloudArrowUp20Regular />}
        >
          Select Files
        </Button>
      </Card>
    </div>
  );
}

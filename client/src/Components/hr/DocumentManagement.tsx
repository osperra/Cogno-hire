import { useEffect, useMemo, useRef, useState } from "react";
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
  Spinner,
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

import { StatusPill, type StatusType } from "../ui/StatusPill";
import { api } from "../../api/http";

type DocTab = "all" | "application" | "verification" | "onboarding" | "employee";
type DocStatus = "PENDING" | "VERIFIED" | "COMPLETED" | "SIGNED";

type DocRow = {
  _id: string;
  name: string;
  type: string;
  category: string;
  status: DocStatus;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;

  uploadedByUserId?: { name?: string; email?: string };
};

type Stats = { total: number; verified: number; pending: number; requiresAction: number };

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
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: "12px",
    flexWrap: "wrap",
  },
  headerTitleBlock: { display: "flex", flexDirection: "column", rowGap: "4px" },
  headerTitle: { fontSize: "1.1rem", fontWeight: 600, color: "#0B1220" },
  headerSubtitle: { fontSize: "0.85rem", color: "#5B6475" },
  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": { backgroundColor: "#1B56FD", color: "#FFFFFF" },
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(1,minmax(0,1fr))",
    rowGap: "12px",
    columnGap: "12px",
    "@media (min-width: 768px)": { gridTemplateColumns: "repeat(4,minmax(0,1fr))" },
  },
  statCard: {
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "16px 18px",
    backgroundColor: "#FFFFFF",
  },
  statLabel: { fontSize: "0.8rem", color: "#5B6475", marginBottom: "4px" },
  statValue: { fontSize: "2rem", fontWeight: 600, color: "#0B1220" },
  statIconBox: { width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" },

  toolbarCard: {
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    padding: "10px 16px",
    backgroundColor: "#FFFFFF",
  },
  toolbarRow: { display: "flex", alignItems: "center", columnGap: "12px", rowGap: "8px", flexWrap: "wrap" },

  searchWrapper: { position: "relative", flex: 1, minWidth: "260px", maxWidth: "100%" },
  searchIcon: { position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#5B6475", pointerEvents: "none", zIndex: 10 },
  searchInput: {
    width: "100%",
    height: "44px",
    paddingLeft: "32px",
    paddingRight: "12px",
    fontSize: "0.9rem",
    backgroundColor: "#FFFFFF",
    ...shorthands.borderRadius("9px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.16)"),
    "::placeholder": { color: "#9CA3AF" },
  },

  filterButton: {
    minWidth: "120px",
    ...shorthands.borderRadius("999px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.1)"),
    fontSize: "0.85rem",
  },

  tabsWrapper: {
    display: "inline-flex",
    gap: "4px",
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    border: "1px solid rgba(2,6,23,0.08)",
    padding: "4px",
    borderRadius: "9999px",
    marginTop: "8px",
  },
  tabList: { columnGap: "12px", rowGap: "6px", flexWrap: "wrap" },

  tableCard: {
    ...shorthands.borderRadius("18px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
    padding: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  tableWrapper: { overflowX: "auto", backgroundColor: "#FFFFFF" },
  table: { width: "100%", minWidth: "980px" },
  tableHeaderRow: { background: "#F5F7FF" },
  tableHeaderCell: { fontSize: "0.8rem", color: "#4B5563", fontWeight: 600, padding: "12px 20px" },
  tableRow: {
    height: "60px",
    backgroundColor: "#FFFFFF",
    ":not(:last-child)": { borderBottom: "1px solid #F3F4F6" },
    ":hover": { backgroundColor: "#F9FAFF" },
  },
  tableCell: { padding: "12px 20px", fontSize: "0.85rem", color: "#4B5563" },

  docNameCell: { padding: "12px 20px" },
  docNameRow: { display: "flex", alignItems: "center", columnGap: "12px" },
  docIconBox: { width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  docNameText: { color: "#0B1220", fontSize: "0.9rem", fontWeight: 500 },

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
    ":hover": { backgroundColor: "#F3F4F6" },
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
    ":hover": { ...shorthands.border("2px", "dashed", "#0118D8") },
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
  uploadTitle: { fontSize: "1rem", fontWeight: 600, color: "#0B1220", marginBottom: "4px" },
  uploadSubtitle: { fontSize: "0.85rem", color: "#5B6475", marginBottom: "12px" },
  uploadButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    marginTop: "8px",
    display: "inline-flex",
    justifyContent: "center",
    paddingInline: "16px",
    marginInline: "auto",
    ":hover": { backgroundColor: "#1B56FD", color: "#FFFFFF" },
  },
});

function bytesToSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "-";
  const kb = 1024;
  const mb = kb * 1024;
  const gb = mb * 1024;
  if (bytes >= gb) return `${(bytes / gb).toFixed(1)} GB`;
  if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MB`;
  if (bytes >= kb) return `${(bytes / kb).toFixed(1)} KB`;
  return `${bytes} B`;
}

function dateText(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "2-digit", year: "numeric" });
}

const mapStatusToPill = (status: DocStatus): StatusType => {
  switch (status) {
    case "VERIFIED":
    case "COMPLETED":
    case "SIGNED":
      return "success";
    case "PENDING":
      return "warning";
    default:
      return "neutral";
  }
};

export function DocumentManagement() {
  const styles = useStyles();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("all" as DocTab);

  const [typeFilter, setTypeFilter] = useState("all-types");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [dateFilter, setDateFilter] = useState("any-date");

  const [docs, setDocs] = useState<DocRow[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, pending: 0, requiresAction: 0 });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => set.add(d.type));
    return ["all-types", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [docs]);

  const tabCounts = useMemo(() => {
    const c = { all: 0, application: 0, verification: 0, onboarding: 0, employee: 0 } as Record<DocTab, number>;
    for (const d of docs) {
      c.all += 1;
      const cat = String(d.category || "").toLowerCase();
      if (cat === "application") c.application += 1;
      else if (cat === "verification") c.verification += 1;
      else if (cat === "onboarding") c.onboarding += 1;
      else if (cat === "employee") c.employee += 1;
    }
    return c;
  }, [docs]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set("tab", String(activeTab));

    const q = search.trim();
    if (q) params.set("q", q);

    if (typeFilter !== "all-types") params.set("type", typeFilter);

    if (statusFilter !== "all-status") {
      const map: Record<string, DocStatus> = {
        pending: "PENDING",
        verified: "VERIFIED",
        completed: "COMPLETED",
        signed: "SIGNED",
      };
      const s = map[statusFilter];
      if (s) params.set("status", s);
    }

    if (dateFilter === "7-days") params.set("days", "7");
    if (dateFilter === "30-days") params.set("days", "30");

    params.set("limit", "500");
    return `/api/documents?${params.toString()}`;
  };

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const [rows, st] = await Promise.all([
        api<DocRow[]>(buildQuery()),
        api<Stats>("/api/documents/stats"),
      ]);
      setDocs(rows ?? []);
      setStats(st ?? { total: 0, verified: 0, pending: 0, requiresAction: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, search, typeFilter, statusFilter, dateFilter]);

  const filteredDocs = useMemo(() => docs, [docs]);

  const openFilePicker = () => fileRef.current?.click();

  const uploadFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      const isImg = ["jpg", "jpeg", "png"].includes(ext);
      const isResume = file.name.toLowerCase().includes("resume") || ext === "pdf";

      fd.append("type", isResume ? "Resume" : isImg ? "Identification" : "Document");
      fd.append("category", isResume ? "Application" : "Verification");
      fd.append("status", "PENDING");

      await api("/api/documents/upload", { method: "POST", body: fd });

      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const viewDoc = (d: DocRow) => window.open(d.fileUrl, "_blank", "noopener,noreferrer");

  const downloadDoc = async (d: DocRow) => {

    const a = document.createElement("a");
    a.href = d.fileUrl;
    a.download = d.name || "document";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const verifyDoc = async (d: DocRow) => {
    setError("");
    try {
      const updated = await api<DocRow>(`/api/documents/${d._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "VERIFIED" }),
      });

      setDocs((prev) => prev.map((x) => (x._id === d._id ? { ...x, status: updated.status } : x)));
      const st = await api<Stats>("/api/documents/stats");
      setStats(st);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verify failed");
    }
  };

  const deleteDoc = async (d: DocRow) => {
    setError("");
    try {
      await api(`/api/documents/${d._id}`, { method: "DELETE" });
      setDocs((prev) => prev.filter((x) => x._id !== d._id));
      const st = await api<Stats>("/api/documents/stats");
      setStats(st);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className={styles.root}>
      <input
        ref={fileRef}
        type="file"
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          void uploadFile(f);
          e.currentTarget.value = "";
        }}
      />

      <div className={styles.headerRow}>
        <div className={styles.headerTitleBlock}>
          <span className={styles.headerTitle}>Document Management</span>
          <span className={styles.headerSubtitle}>
            Manage candidate documents, certificates, and verification records
          </span>
          {error ? (
            <span style={{ color: tokens.colorPaletteRedForeground1, fontSize: 13, marginTop: 6 }}>{error}</span>
          ) : null}
        </div>

        <Button
          appearance="primary"
          className={styles.primaryButton}
          icon={uploading ? <Spinner size="tiny" /> : <CloudArrowUp20Regular />}
          onClick={openFilePicker}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>

      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className={styles.statLabel}>Total Documents</div>
              <div className={styles.statValue}>{loading ? "…" : stats.total}</div>
            </div>
            <div className={styles.statIconBox} style={{ backgroundColor: "#EFF6FF" }}>
              <DocumentText20Regular style={{ color: "#0118D8", fontSize: 24 }} />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className={styles.statLabel}>Verified</div>
              <div className={styles.statValue}>{loading ? "…" : stats.verified}</div>
            </div>
            <div className={styles.statIconBox} style={{ backgroundColor: "#ECFDF5" }}>
              <CheckmarkCircle20Regular style={{ color: "#16A34A", fontSize: 24 }} />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className={styles.statLabel}>Pending Review</div>
              <div className={styles.statValue}>{loading ? "…" : stats.pending}</div>
            </div>
            <div className={styles.statIconBox} style={{ backgroundColor: "#FFFBEB" }}>
              <Clock20Regular style={{ color: "#D97706", fontSize: 24 }} />
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className={styles.statLabel}>Requires Action</div>
              <div className={styles.statValue}>{loading ? "…" : stats.requiresAction}</div>
            </div>
            <div className={styles.statIconBox} style={{ backgroundColor: "#FEF2F2" }}>
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

          <Dropdown
            className={styles.filterButton}
            value={typeFilter}
            selectedOptions={[typeFilter]}
            onOptionSelect={(_, data) => setTypeFilter(String(data.optionValue))}
          >
            {typeOptions.map((t) => (
              <Option key={t} value={t}>
                {t === "all-types" ? "All Types" : t}
              </Option>
            ))}
          </Dropdown>

          <Dropdown
            className={styles.filterButton}
            value={statusFilter}
            selectedOptions={[statusFilter]}
            onOptionSelect={(_, data) => setStatusFilter(String(data.optionValue))}
          >
            <Option value="all-status">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="verified">Verified</Option>
            <Option value="completed">Completed</Option>
            <Option value="signed">Signed</Option>
          </Dropdown>

          <Dropdown
            className={styles.filterButton}
            value={dateFilter}
            selectedOptions={[dateFilter]}
            onOptionSelect={(_, data) => setDateFilter(String(data.optionValue))}
          >
            <Option value="any-date">Any Date</Option>
            <Option value="7-days">Last 7 days</Option>
            <Option value="30-days">Last 30 days</Option>
          </Dropdown>

          <Button appearance="outline" onClick={() => void load()} disabled={loading || uploading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </Card>

      <div className={styles.tabsWrapper}>
        <TabList
          selectedValue={activeTab}
          onTabSelect={(_, data) => setActiveTab(data.value as DocTab)}
          className={styles.tabList}
        >
          <Tab value="all">All Documents ({tabCounts.all})</Tab>
          <Tab value="application">Application ({tabCounts.application})</Tab>
          <Tab value="verification">Verification ({tabCounts.verification})</Tab>
          <Tab value="onboarding">Onboarding ({tabCounts.onboarding})</Tab>
          <Tab value="employee">Employee Records ({tabCounts.employee})</Tab>
        </TabList>
      </div>

      <Card className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <Table aria-label="Documents table" className={styles.table}>
            <TableHeader>
              <TableRow className={styles.tableHeaderRow}>
                <TableHeaderCell className={styles.tableHeaderCell} style={{ width: "30%" }}>
                  Document Name
                </TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>Type</TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>Category</TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>Uploaded By</TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>Upload Date</TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>Size</TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell}>Status</TableHeaderCell>
                <TableHeaderCell className={styles.tableHeaderCell} />
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className={styles.tableCell}>
                    <Text style={{ display: "block", textAlign: "center", padding: "16px 0", color: "#6B7280" }}>
                      Loading documents...
                    </Text>
                  </TableCell>
                </TableRow>
              ) : filteredDocs.map((doc) => (
                <TableRow key={doc._id} className={styles.tableRow}>
                  <TableCell className={styles.docNameCell}>
                    <div className={styles.docNameRow}>
                      <div className={styles.docIconBox}>
                        {doc.mimeType.startsWith("image/") ? (
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
                    <Badge appearance="outline" className={styles.categoryBadge}>
                      {doc.category}
                    </Badge>
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    {doc.uploadedByUserId?.name || doc.uploadedByUserId?.email || "-"}
                  </TableCell>

                  <TableCell className={styles.tableCell}>{dateText(doc.createdAt)}</TableCell>

                  <TableCell className={styles.tableCell}>{bytesToSize(doc.sizeBytes)}</TableCell>

                  <TableCell className={styles.tableCell}>
                    <StatusPill status={mapStatusToPill(doc.status)} label={doc.status} size="sm" />
                  </TableCell>

                  <TableCell className={styles.tableCell}>
                    <Menu>
                      <MenuTrigger disableButtonEnhancement>
                        <button type="button" className={styles.actionButton} aria-label="More options">
                          <MoreVerticalRegular />
                        </button>
                      </MenuTrigger>
                      <MenuPopover>
                        <MenuList>
                          <MenuItem icon={<Eye20Regular />} onClick={() => viewDoc(doc)}>View</MenuItem>
                          <MenuItem icon={<ArrowDownload20Regular />} onClick={() => void downloadDoc(doc)}>
                            Download
                          </MenuItem>
                          <MenuItem
                            icon={<ShieldCheckmark20Regular />}
                            disabled={doc.status !== "PENDING"}
                            onClick={() => void verifyDoc(doc)}
                          >
                            Verify
                          </MenuItem>
                          <MenuItem
                            icon={<Delete20Regular />}
                            style={{ color: tokens.colorPaletteRedForeground1 }}
                            onClick={() => void deleteDoc(doc)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </MenuPopover>
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && filteredDocs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className={styles.tableCell}>
                    <Text style={{ display: "block", textAlign: "center", padding: "16px 0", color: "#6B7280" }}>
                      No documents match the current filters.
                    </Text>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className={styles.uploadCard} onClick={openFilePicker}>
        <div className={styles.uploadIconCircle}>
          {uploading ? <Spinner size="small" /> : <CloudArrowUp20Regular style={{ color: "#0118D8", fontSize: 28 }} />}
        </div>
        <div className={styles.uploadTitle}>Drop files here or click to upload</div>
        <div className={styles.uploadSubtitle}>Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</div>
        <Button
          appearance="primary"
          size="small"
          className={styles.uploadButton}
          icon={<CloudArrowUp20Regular />}
          onClick={(e) => {
            e.stopPropagation();
            openFilePicker();
          }}
          disabled={uploading}
        >
          Select Files
        </Button>
      </Card>
    </div>
  );
}

"use client";

import * as React from "react";
import {
  Card,
  Button,
  Badge,
  Input,
  Textarea,
  Label,
  ProgressBar,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Add16Regular,
  ArrowDownload16Regular,
  Delete16Regular,
  Warning16Regular,
  CheckmarkCircle20Regular,
} from "@fluentui/react-icons";

type DesignSystemProps = {
  onBackToLanding?: () => void;
  onViewApp?: () => void;
};

const useDesignSystemStyles = makeStyles({
  root: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXXXL,
  },
  header: {
    marginBottom: tokens.spacingVerticalXXL,
  },
  pageTitle: {
    margin: 0,
    marginBottom: tokens.spacingVerticalXS,
    color: "#0B1220",
    fontSize: "32px",
    lineHeight: "40px",
    fontWeight: 600,
  },
  pageSubtitle: {
    margin: 0,
    color: "#5B6475",
    fontSize: "18px",
    lineHeight: "26px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalM,
  },
  sectionTitle: {
    margin: 0,
    color: "#0B1220",
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: 600,
    marginBottom: tokens.spacingVerticalM,
  },
  sectionSubtitle: {
    margin: 0,
    color: "#0B1220",
    fontSize: "16px",
    lineHeight: "24px",
    fontWeight: 600,
    marginTop: tokens.spacingVerticalL,
    marginBottom: tokens.spacingVerticalS,
  },
  colorGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: tokens.spacingHorizontalXL,
  },
  colorBlock: {
    marginBottom: tokens.spacingVerticalXS,
  },
  colorSwatchTall: {
    height: "128px",
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow16,
    marginBottom: tokens.spacingVerticalS,
  },
  colorSwatchShort: {
    height: "96px",
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow16,
    marginBottom: tokens.spacingVerticalS,
  },
  colorLabel: {
    color: "#0B1220",
    fontWeight: 500,
  },
  colorCode: {
    color: "#5B6475",
    fontSize: "14px",
  },
  card: {
    padding: tokens.spacingHorizontalXL,
    border: "1px solid rgba(2,6,23,0.08)",
  },
  typeRow: {
    marginBottom: tokens.spacingVerticalL,
  },
  typeTitle: {
    margin: 0,
    color: "#0B1220",
  },
  typeMeta: {
    margin: 0,
    color: "#5B6475",
    fontSize: "14px",
  },
  buttonRow: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: tokens.spacingHorizontalM,
    rowGap: tokens.spacingVerticalS,
  },
  buttonGroupTitle: {
    margin: 0,
    marginBottom: tokens.spacingVerticalS,
    color: "#0B1220",
    fontWeight: 600,
  },
  statusPillRow: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: tokens.spacingHorizontalM,
    rowGap: tokens.spacingVerticalS,
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    columnGap: tokens.spacingHorizontalM,
    rowGap: tokens.spacingVerticalS,
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalL,
    maxWidth: "420px",
  },
  fieldLabel: {
    display: "block",
    marginBottom: tokens.spacingVerticalXS,
  },
  fieldHelper: {
    marginTop: tokens.spacingVerticalXXS,
    color: "#5B6475",
    fontSize: "12px",
  },
  fieldError: {
    marginTop: tokens.spacingVerticalXXS,
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalXXS,
    color: "#EF4444",
    fontSize: "12px",
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: tokens.spacingHorizontalXL,
  },
  baseCard: {
    padding: tokens.spacingHorizontalXL,
    border: "1px solid rgba(2,6,23,0.08)",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
  },
  featureCard: {
    padding: tokens.spacingHorizontalXL,
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundImage: "linear-gradient(to bottom right, #EFF6FF, transparent)",
  },
  featureIconContainer: {
    width: "48px",
    height: "48px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundImage: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacingVerticalM,
  },
  highlightedCard: {
    padding: tokens.spacingHorizontalXL,
    border: "2px solid #0118D8",
    backgroundColor: "rgba(219, 234, 254, 0.3)",
  },
  cardTitle: {
    margin: 0,
    marginBottom: tokens.spacingVerticalXS,
    color: "#0B1220",
  },
  cardBodyText: {
    margin: 0,
    color: "#5B6475",
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalXL,
  },
  wizardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: tokens.spacingHorizontalL,
  },
  wizardStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  wizardCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacingVerticalXS,
    fontSize: "14px",
  },
  wizardLabel: {
    margin: 0,
    color: "#5B6475",
    fontSize: "12px",
  },
  shadowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: tokens.spacingHorizontalXL,
  },
  shadowCard: {
    padding: tokens.spacingHorizontalXL,
    border: "1px solid rgba(2,6,23,0.08)",
  },
  shadowTitle: {
    margin: 0,
    marginBottom: tokens.spacingVerticalXS,
    color: "#0B1220",
  },
  shadowCode: {
    color: "#5B6475",
    fontSize: "12px",
  },
  spacingCard: {
    padding: tokens.spacingHorizontalXL,
    border: "1px solid rgba(2,6,23,0.08)",
  },
  spacingRow: {
    display: "flex",
    alignItems: "center",
    columnGap: tokens.spacingHorizontalM,
  },
  spacingLabel: {
    width: "80px",
    color: "#5B6475",
    fontSize: "14px",
  },
  spacingBar: {
    height: "32px",
    backgroundColor: "#0118D8",
    borderRadius: tokens.borderRadiusMedium,
  },
});

/** header-specific styles to match the screenshot */
const useTopHeaderStyles = makeStyles({
  root: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBlock: "18px",
    paddingInline: "40px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
  },
  left: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
    paddingLeft: "280px"
  },
  logo: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    backgroundImage: "linear-gradient(to bottom right,#0118D8,#1B56FD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "18px",
    boxShadow: "0 10px 24px rgba(37,99,235,0.45)",
    flexShrink: 0,
  },
  title: {
    fontSize: "18px",
    lineHeight: "24px",
    fontWeight: 600,
    color: "#0B1220",
    letterSpacing: "0.01em",
  },
  right: {
    display: "flex",
    alignItems: "center",
    columnGap: "20px",
    paddingRight:"300px"
  },
  backLink: {
    border: "none",
    background: "transparent",
    padding: 0,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    columnGap: "6px",
    fontSize: "14px",
    color: "#6B7280",
    textDecoration: "none",
    transition: "color 0.15s ease",
    ":hover": {
      color: "#111827",
      textDecoration: "underline",
      textDecorationThickness: "1px",
    },
  },
  backArrow: {
    fontSize: "16px",
    lineHeight: 1,
  },
  viewAppButton: {
    backgroundImage: "linear-gradient(to right,#0118D8,#1B56FD)",
    borderRadius: "999px",
    paddingInline: "22px",
    paddingBlock: "10px",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 14px 30px rgba(37,99,235,0.32)",
    border: "none",
    color: "#ffffff",
    minWidth: "112px",
    ":hover": {
      backgroundImage: "linear-gradient(to right,#0113C5,#1B4DED)",
      color: "#ffffff",
    },
  },
});

type StatusType =
  | "success"
  | "pending"
  | "danger"
  | "warning"
  | "info"
  | "neutral";

function StatusPill(props: { status: StatusType; label: string }) {
  const { status, label } = props;

  const colorMap: Record<
    StatusType,
    { background: string; color: string; border?: string }
  > = {
    success: {
      background: "#DCFCE7",
      color: "#166534",
    },
    pending: {
      background: "#E5E7EB",
      color: "#374151",
    },
    danger: {
      background: "#FEE2E2",
      color: "#B91C1C",
    },
    warning: {
      background: "#FEF3C7",
      color: "#92400E",
    },
    info: {
      background: "#DBEAFE",
      color: "#1D4ED8",
    },
    neutral: {
      background: "#F3F4F6",
      color: "#4B5563",
    },
  };

  const style = colorMap[status];

  return (
    <Badge
      shape="rounded"
      appearance="filled"
      style={{
        backgroundColor: style.background,
        color: style.color,
        borderColor: style.border,
        borderWidth: style.border ? 1 : 0,
        borderStyle: style.border ? "solid" : "none",
      }}
    >
      {label}
    </Badge>
  );
}

function TopHeader(props: {
  onBackToLanding?: () => void;
  onViewApp?: () => void;
}) {
  const { onBackToLanding, onViewApp } = props;
  const styles = useTopHeaderStyles();

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <div className={styles.logo}>C</div>
        <span className={styles.title}>Cogno Design System</span>
      </div>

      <div className={styles.right}>
        <button
          type="button"
          onClick={onBackToLanding}
          className={styles.backLink}
        >
          <span className={styles.backArrow}>←</span>
          <span>Back to Landing</span>
        </button>

        <Button
          appearance="primary"
          onClick={onViewApp}
          className={styles.viewAppButton}
        >
          View App
        </Button>
      </div>
    </div>
  );
}

export function DesignSystem({
  onBackToLanding,
  onViewApp,
}: DesignSystemProps): React.JSX.Element {
  const styles = useDesignSystemStyles();
  const spacingValues = [1, 2, 3, 4, 6, 8, 12, 16, 24];

  return (
    <div
      style={{
        backgroundColor: "#FFF8F8",
        minHeight: "100vh",
      }}
    >
      <TopHeader onBackToLanding={onBackToLanding} onViewApp={onViewApp} />

      <div className={styles.root}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Cogno Design System</h1>
          <p className={styles.pageSubtitle}>
            Enterprise-grade component library for AI-powered interview platform
          </p>
        </div>

        {/* ---- sections below unchanged ---- */}
        {/* Color Palette */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Color Palette</h2>

          <div className={styles.colorGrid}>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchTall}
                style={{ backgroundColor: "#0118D8" }}
              />
              <div className={styles.colorLabel}>brand/primary</div>
              <div className={styles.colorCode}>#0118D8</div>
            </div>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchTall}
                style={{ backgroundColor: "#1B56FD" }}
              />
              <div className={styles.colorLabel}>brand/primaryHover</div>
              <div className={styles.colorCode}>#1B56FD</div>
            </div>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchTall}
                style={{ backgroundColor: "#E9DFC3" }}
              />
              <div className={styles.colorLabel}>brand/accent</div>
              <div className={styles.colorCode}>#E9DFC3</div>
            </div>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchTall}
                style={{
                  backgroundColor: "#FFF8F8",
                  border: "1px solid rgba(2,6,23,0.08)",
                }}
              />
              <div className={styles.colorLabel}>surface/base</div>
              <div className={styles.colorCode}>#FFF8F8</div>
            </div>
          </div>

          <h3 className={styles.sectionSubtitle}>Status Colors</h3>
          <div className={styles.colorGrid}>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchShort}
                style={{ backgroundColor: "#16A34A" }}
              />
              <div className={styles.colorLabel}>Success</div>
              <div className={styles.colorCode}>#16A34A</div>
            </div>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchShort}
                style={{ backgroundColor: "#F59E0B" }}
              />
              <div className={styles.colorLabel}>Warning</div>
              <div className={styles.colorCode}>#F59E0B</div>
            </div>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchShort}
                style={{ backgroundColor: "#EF4444" }}
              />
              <div className={styles.colorLabel}>Danger</div>
              <div className={styles.colorCode}>#EF4444</div>
            </div>
            <div className={styles.colorBlock}>
              <div
                className={styles.colorSwatchShort}
                style={{ backgroundColor: "#1B56FD" }}
              />
              <div className={styles.colorLabel}>Info</div>
              <div className={styles.colorCode}>#1B56FD</div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Typography</h2>
          <Card className={styles.card}>
            <div>
              <div className={styles.typeRow}>
                <h1
                  className={styles.typeTitle}
                  style={{
                    fontSize: "36px",
                    lineHeight: "44px",
                    fontWeight: 600,
                  }}
                >
                  Heading 1 - Semibold 36/44
                </h1>
                <p className={styles.typeMeta}>
                  font-size: 36px, line-height: 44px, font-weight: 600
                </p>
              </div>
              <div className={styles.typeRow}>
                <h2
                  className={styles.typeTitle}
                  style={{
                    fontSize: "24px",
                    lineHeight: "32px",
                    fontWeight: 600,
                  }}
                >
                  Heading 2 - Semibold 24/32
                </h2>
                <p className={styles.typeMeta}>
                  font-size: 24px, line-height: 32px, font-weight: 600
                </p>
              </div>
              <div className={styles.typeRow}>
                <h3
                  className={styles.typeTitle}
                  style={{
                    fontSize: "18px",
                    lineHeight: "26px",
                    fontWeight: 500,
                  }}
                >
                  Heading 3 - Medium 18/26
                </h3>
                <p className={styles.typeMeta}>
                  font-size: 18px, line-height: 26px, font-weight: 500
                </p>
              </div>
              <div className={styles.typeRow}>
                <p
                  className={styles.typeTitle}
                  style={{
                    fontSize: "14px",
                    lineHeight: "22px",
                    fontWeight: 400,
                  }}
                >
                  Body - Regular 14/22
                </p>
                <p className={styles.typeMeta}>
                  font-size: 14px, line-height: 22px, font-weight: 400
                </p>
              </div>
              <div className={styles.typeRow}>
                <p
                  className={styles.typeMeta}
                  style={{
                    fontSize: "12px",
                    lineHeight: "18px",
                    fontWeight: 400,
                  }}
                >
                  Caption - Regular 12/18
                </p>
                <p className={styles.typeMeta}>
                  font-size: 12px, line-height: 18px, font-weight: 400
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Buttons */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons</h2>
          <Card className={styles.card}>
            <div>
              <div style={{ marginBottom: tokens.spacingVerticalL }}>
                <h4 className={styles.buttonGroupTitle}>Variants</h4>
                <div className={styles.buttonRow}>
                  <Button
                    style={{
                      backgroundColor: "#0118D8",
                      color: "#FFFFFF",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1B56FD";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#0118D8";
                    }}
                  >
                    Primary Button
                  </Button>
                  <Button appearance="secondary">Secondary Button</Button>
                  <Button appearance="outline">Outline Button</Button>
                  <Button appearance="transparent">Ghost Button</Button>
                  <Button
                    appearance="primary"
                    style={{ backgroundColor: "#EF4444" }}
                  >
                    Destructive
                  </Button>
                </div>
              </div>

              <div style={{ marginBottom: tokens.spacingVerticalL }}>
                <h4 className={styles.buttonGroupTitle}>Sizes</h4>
                <div className={styles.buttonRow}>
                  <Button
                    size="small"
                    style={{ backgroundColor: "#0118D8", color: "#FFFFFF" }}
                  >
                    Small
                  </Button>
                  <Button
                    style={{ backgroundColor: "#0118D8", color: "#FFFFFF" }}
                  >
                    Medium
                  </Button>
                  <Button
                    size="large"
                    style={{ backgroundColor: "#0118D8", color: "#FFFFFF" }}
                  >
                    Large
                  </Button>
                </div>
              </div>

              <div>
                <h4 className={styles.buttonGroupTitle}>With Icons</h4>
                <div className={styles.buttonRow}>
                  <Button
                    icon={<Add16Regular />}
                    style={{ backgroundColor: "#0118D8", color: "#FFFFFF" }}
                  >
                    Create Job
                  </Button>
                  <Button
                    appearance="outline"
                    icon={<ArrowDownload16Regular />}
                  >
                    Download
                  </Button>
                  <Button
                    appearance="primary"
                    icon={<Delete16Regular />}
                    style={{ backgroundColor: "#EF4444" }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Status Pills */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Status Pills</h2>
          <Card className={styles.card}>
            <div className={styles.statusPillRow}>
              <StatusPill status="success" label="Completed" />
              <StatusPill status="pending" label="Pending" />
              <StatusPill status="danger" label="Rejected" />
              <StatusPill status="warning" label="In Review" />
              <StatusPill status="info" label="Invited" />
              <StatusPill status="neutral" label="Draft" />
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges</h2>
          <Card className={styles.card}>
            <div className={styles.badgeRow}>
              <Badge
                appearance="filled"
                style={{
                  backgroundColor: "#0118D8",
                  color: "#FFFFFF",
                  border: "none",
                }}
              >
                Primary
              </Badge>
              <Badge appearance="ghost">Secondary</Badge>
              <Badge appearance="outline">Outline</Badge>
              <Badge
                appearance="filled"
                style={{ backgroundColor: "#FEE2E2", color: "#B91C1C" }}
              >
                Destructive
              </Badge>
              <Badge
                appearance="filled"
                style={{
                  backgroundColor: "#E9DFC3",
                  color: "#0B1220",
                  borderColor: "#E9DFC3",
                }}
              >
                Accent
              </Badge>
            </div>
          </Card>
        </section>

        {/* Form Inputs */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Form Inputs</h2>
          <Card className={styles.card}>
            <div className={styles.formContainer}>
              <div>
                <Label htmlFor="text-input" className={styles.fieldLabel}>
                  Text Input
                </Label>
                <Input id="text-input" placeholder="Enter text..." />
                <p className={styles.fieldHelper}>Helper text goes here</p>
              </div>

              <div>
                <Label htmlFor="text-error" className={styles.fieldLabel}>
                  Input with Error
                </Label>
                <Input
                  id="text-error"
                  placeholder="Enter text..."
                  style={{ borderColor: "#EF4444" }}
                />
                <p className={styles.fieldError}>
                  <Warning16Regular />
                  This field is required
                </p>
              </div>

              <div>
                <Label htmlFor="textarea" className={styles.fieldLabel}>
                  Textarea
                </Label>
                <Textarea
                  id="textarea"
                  placeholder="Enter long text..."
                  rows={4}
                />
              </div>
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cards</h2>
          <div className={styles.cardsGrid}>
            <Card className={styles.baseCard}>
              <h4 className={styles.cardTitle}>Base Card</h4>
              <p className={styles.cardBodyText}>
                Standard card with soft shadow and 8px border radius
              </p>
            </Card>

            <Card className={styles.featureCard}>
              <div className={styles.featureIconContainer}>
                <CheckmarkCircle20Regular primaryFill="#FFFFFF" />
              </div>
              <h4 className={styles.cardTitle}>Feature Card</h4>
              <p className={styles.cardBodyText}>
                Card with gradient background and icon
              </p>
            </Card>

            <Card className={styles.highlightedCard}>
              <h4 className={styles.cardTitle}>Highlighted Card</h4>
              <p className={styles.cardBodyText}>
                Important card with colored border
              </p>
            </Card>
          </div>
        </section>

        {/* Progress & Stepper */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Progress & Stepper</h2>
          <Card className={styles.card}>
            <div className={styles.progressSection}>
              <div>
                <h4 className={styles.buttonGroupTitle}>Progress Bar</h4>
                <ProgressBar value={0.75} thickness="medium" />
              </div>

              <div>
                <h4 className={styles.buttonGroupTitle}>4-Step Wizard</h4>
                <div className={styles.wizardGrid}>
                  {["Basics", "Requirements", "Interview", "Review"].map(
                    (step, index) => {
                      let style: React.CSSProperties;
                      if (index < 2) {
                        style = {
                          backgroundColor: "#0118D8",
                          color: "#FFFFFF",
                        };
                      } else if (index === 2) {
                        style = {
                          border: "2px solid #0118D8",
                          color: "#0118D8",
                          backgroundColor: "#FFFFFF",
                        };
                      } else {
                        style = {
                          backgroundColor: "#F3F4F6",
                          color: "#5B6475",
                        };
                      }

                      return (
                        <div key={step} className={styles.wizardStep}>
                          <div className={styles.wizardCircle} style={style}>
                            {index < 2 ? (
                              <CheckmarkCircle20Regular primaryFill="currentColor" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <p className={styles.wizardLabel}>{step}</p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Shadows & Elevation */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shadows & Elevation</h2>
          <div className={styles.shadowGrid}>
            <Card
              className={styles.shadowCard}
              style={{ boxShadow: "0 1px 0 rgba(2,6,23,0.05)" }}
            >
              <h4 className={styles.shadowTitle}>Level 1</h4>
              <code className={styles.shadowCode}>
                0 1px 0 rgba(2,6,23,0.05)
              </code>
            </Card>

            <Card
              className={styles.shadowCard}
              style={{
                boxShadow:
                  "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
              }}
            >
              <h4 className={styles.shadowTitle}>Level 2</h4>
              <code className={styles.shadowCode}>
                0 1px 0, 0 6px 20px rgba(...)
              </code>
            </Card>

            <Card
              className={styles.shadowCard}
              style={{
                boxShadow:
                  "0 1px 0 rgba(2,6,23,0.08), 0 12px 32px rgba(2,6,23,0.12)",
              }}
            >
              <h4 className={styles.shadowTitle}>Level 3 (Hover)</h4>
              <code className={styles.shadowCode}>
                0 1px 0, 0 12px 32px rgba(...)
              </code>
            </Card>
          </div>
        </section>

        {/* Spacing */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Spacing Scale (8pt)</h2>
          <Card className={styles.spacingCard}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                rowGap: tokens.spacingVerticalS,
              }}
            >
              {spacingValues.map((multiplier) => (
                <div key={multiplier} className={styles.spacingRow}>
                  <div className={styles.spacingLabel}>{multiplier * 8}px</div>
                  <div
                    className={styles.spacingBar}
                    style={{ width: `${multiplier * 8}px` }}
                  />
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

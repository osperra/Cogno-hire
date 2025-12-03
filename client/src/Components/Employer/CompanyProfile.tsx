import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
  Dropdown,
  Option,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";

import {
  CloudArrowUp20Regular,
  Link20Regular,
  Save20Regular,
} from "@fluentui/react-icons";

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

  sectionCard: {
    ...shorthands.borderRadius("16px"),
    ...shorthands.border("1px", "solid", "rgba(2,6,23,0.08)"),
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    padding: "24px",
    backgroundColor: "#FFFFFF",
  },

  sectionTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#0B1220",
    marginBottom: "16px",
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    rowGap: "6px",
  },

  fieldLabel: {
    fontSize: "0.85rem",
    color: "#0B1220",
    fontWeight: 500,
  },

  helperText: {
    fontSize: "0.75rem",
    color: "#5B6475",
    marginTop: "4px",
  },

  sectionBody: {
    display: "flex",
    flexDirection: "column",
    rowGap: "16px",
  },

  logoRow: {
    display: "flex",
    columnGap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  logoDropZone: {
    width: "96px",
    height: "96px",
    ...shorthands.borderRadius("12px"),
    ...shorthands.border("2px", "dashed", "rgba(2,6,23,0.16)"),
    backgroundColor: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  logoInfo: {
    display: "flex",
    flexDirection: "column",
    rowGap: "8px",
    flex: 1,
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    columnGap: "16px",
    rowGap: "12px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
  },

  websiteWrapper: {
    position: "relative",
  },

  websiteIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#5B6475",
    pointerEvents: "none",
  },

  websiteInput: {
    paddingLeft: "32px",
  },

  socialSection: {
    ...shorthands.borderTop("1px", "solid", "rgba(2,6,23,0.08)"),
    paddingTop: "16px",
    marginTop: "8px",
  },

  socialList: {
    display: "flex",
    flexDirection: "column",
    rowGap: "8px",
  },

  textarea: {
    resize: "vertical",
  },

  footerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "8px",
  },

  footerRightButtons: {
    display: "flex",
    columnGap: "8px",
  },

  primaryButton: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
    ":hover": {
      backgroundColor: "#1B56FD",
      color: "#FFFFFF",
    },
  },

  outlineButton: {
  },
});

export function CompanyProfile() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Company Information</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label className={styles.fieldLabel}>Company Logo</Label>
            <div className={styles.logoRow}>
              <div className={styles.logoDropZone}>
                <CloudArrowUp20Regular style={{ fontSize: 22, color: "#5B6475" }} />
              </div>
              <div className={styles.logoInfo}>
                <div style={{ display: "flex", columnGap: "8px" }}>
                  <Button
                    appearance="outline"
                    size="small"
                    icon={<CloudArrowUp20Regular />}
                  >
                    Upload Logo
                  </Button>
                </div>
                <span className={styles.helperText}>
                  Recommended size: 200x200px. Max file size: 2MB. Supports JPG, PNG.
                </span>
              </div>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="company-name" className={styles.fieldLabel}>
              Company Name *
            </Label>
            <Input
              id="company-name"
              placeholder="e.g. Acme Corporation"
              defaultValue="Acme Corporation"
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="tagline" className={styles.fieldLabel}>
              Tagline
            </Label>
            <Input
              id="tagline"
              placeholder="e.g. Building the future of technology"
            />
          </div>

          <div className={styles.twoColumnGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="company-size" className={styles.fieldLabel}>
                Company Size *
              </Label>
              <Dropdown
                id="company-size"
                defaultValue="51-200 employees"
                placeholder="Select size"
              >
                <Option value="1-10">1-10 employees</Option>
                <Option value="11-50">11-50 employees</Option>
                <Option value="51-200">51-200 employees</Option>
                <Option value="201-500">201-500 employees</Option>
                <Option value="501-1000">501-1000 employees</Option>
                <Option value="1000+">1000+ employees</Option>
              </Dropdown>
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="industry" className={styles.fieldLabel}>
                Industry *
              </Label>
              <Dropdown
                id="industry"
                defaultValue="Technology"
                placeholder="Select industry"
              >
                <Option value="technology">Technology</Option>
                <Option value="finance">Finance</Option>
                <Option value="healthcare">Healthcare</Option>
                <Option value="education">Education</Option>
                <Option value="retail">Retail</Option>
                <Option value="manufacturing">Manufacturing</Option>
                <Option value="other">Other</Option>
              </Dropdown>
            </div>
          </div>

          <div className={styles.twoColumnGrid}>
            <div className={styles.fieldGroup}>
              <Label htmlFor="founded" className={styles.fieldLabel}>
                Founded Year
              </Label>
              <Input
                id="founded"
                type="number"
                placeholder="e.g. 2015"
              />
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="headquarters" className={styles.fieldLabel}>
                Headquarters
              </Label>
              <Input
                id="headquarters"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>About Company</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="about" className={styles.fieldLabel}>
              Company Description *
            </Label>
            <Textarea
              id="about"
              placeholder="Tell candidates about your company, mission, values, and culture..."
              rows={8}
              className={styles.textarea}
              defaultValue="Acme Corporation is a leading technology company focused on building innovative solutions that empower businesses worldwide. Founded in 2015, we've grown to a team of over 150 talented individuals passionate about making a difference through technology."
            />
            <span className={styles.helperText}>
              This will be displayed on your company profile and job postings.
            </span>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="mission" className={styles.fieldLabel}>
              Mission Statement
            </Label>
            <Textarea
              id="mission"
              placeholder="What drives your company?"
              rows={3}
              className={styles.textarea}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="values" className={styles.fieldLabel}>
              Company Values
            </Label>
            <Textarea
              id="values"
              placeholder="What are your core values? (e.g. Innovation, Integrity, Collaboration)"
              rows={3}
              className={styles.textarea}
            />
          </div>
        </div>
      </Card>

      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Contact & Social Media</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="website" className={styles.fieldLabel}>
              Website *
            </Label>
            <div className={styles.websiteWrapper}>
              <span className={styles.websiteIcon}>
                <Link20Regular />
              </span>
              <Input
                id="website"
                type="url"
                placeholder="https://www.example.com"
                defaultValue="https://www.acmecorp.com"
                className={styles.websiteInput}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="email" className={styles.fieldLabel}>
              Contact Email *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@company.com"
              defaultValue="careers@acmecorp.com"
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="phone" className={styles.fieldLabel}>
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className={styles.socialSection}>
            <Label className={styles.fieldLabel}>Social Media Links</Label>
            <div className={styles.socialList}>
              <Input
                placeholder="LinkedIn URL"
                defaultValue="https://linkedin.com/company/acmecorp"
              />
              <Input placeholder="Twitter URL" />
              <Input placeholder="GitHub URL" />
              <Input placeholder="Facebook URL" />
            </div>
          </div>
        </div>
      </Card>

      <Card className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Culture & Benefits</h3>

        <div className={styles.sectionBody}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="culture" className={styles.fieldLabel}>
              Company Culture
            </Label>
            <Textarea
              id="culture"
              placeholder="Describe your work environment and culture..."
              rows={4}
              className={styles.textarea}
            />
          </div>

          <div className={styles.fieldGroup}>
            <Label htmlFor="benefits" className={styles.fieldLabel}>
              Employee Benefits & Perks
            </Label>
            <Textarea
              id="benefits"
              placeholder="List benefits like health insurance, remote work, learning budget, etc."
              rows={6}
              className={styles.textarea}
            />
          </div>
        </div>
      </Card>

      <div className={styles.footerRow}>
        <Button appearance="outline" className={styles.outlineButton}>
          Preview Profile
        </Button>
        <div className={styles.footerRightButtons}>
          <Button appearance="outline" className={styles.outlineButton}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            className={styles.primaryButton}
            icon={<Save20Regular />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

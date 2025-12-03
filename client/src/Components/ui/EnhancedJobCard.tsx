import * as React from "react";
import { useState } from "react";
import {
  Card,
  Button,
  Badge,
  Text,
  makeStyles,
  tokens,
  mergeClasses,
} from "@fluentui/react-components";

import {
  Location20Regular,
  Briefcase20Regular,
  Money20Regular,
  Clock20Regular,
  Building20Regular,
  Bookmark20Regular,
  Share20Regular,
} from "@fluentui/react-icons";

interface EnhancedJobCardProps {
  company: string;
  companyLogo: string;
  title: string;
  location: string;
  type: string;
  ctc: string;
  experience: string;
  postedDate: string;
  difficulty: string;
  skills: string[];
  match?: number;
  onApply?: () => void;
  onViewDetails?: () => void;
}

const useStyles = makeStyles({
  card: {
    position: "relative",
    padding: "20px 24px",
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: "hidden",
    transition: "box-shadow 300ms, transform 300ms",
    boxShadow: "0 1px 0 rgba(2,6,23,0.05), 0 6px 20px rgba(2,6,23,0.06)",
    ":hover": {
      boxShadow: "0 1px 0 rgba(2,6,23,0.08), 0 12px 32px rgba(2,6,23,0.12)",
      transform: "translateY(-1px)",
    },
  },

  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "3px",
    width: "0%",
    background: "linear-gradient(90deg, #0118D8, #1B56FD)",
    transition: "width 0.45s ease",
    zIndex: 1,
  },

  topAccentVisible: {
    width: "100%",
  },

  mainRow: {
    display: "flex",
    alignItems: "flex-start",
    columnGap: "16px",
  },

  logoWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: "1.125rem",
    flexShrink: 0,
    transition: "transform 200ms ease, box-shadow 200ms ease",
    boxShadow: "0 10px 25px rgba(15,23,42,0.4)",
  },

  logoWrapperHovered: {
    transform: "rotate(-4deg) translateY(-2px)",
    boxShadow: "0 14px 28px rgba(15,23,42,0.45)",
  },

  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    rowGap: "2px", 
  },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    columnGap: "16px",
  },

  titleAndBadges: {
    flex: 1,
    minWidth: 0,
  },

  titleBadgesRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    columnGap: "8px",
    rowGap: "0px",
    marginBottom: "5px",
  },

  title: {
    color: "#0B1220",
    fontWeight: 600,
    fontSize: tokens.fontSizeBase400,
  },

  company: {
    color: "#5B6475",
    display: "block",
    margin: "2px 0 0 0",
    lineHeight: "1.2",
    fontSize: tokens.fontSizeBase300,
  },

  matchBadge: {
    animation: "pulse 1.5s ease-in-out infinite",
  },

  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 16px",
    marginTop: "12px",
    marginBottom: "4px",
    color: "#5B6475",
    fontSize: tokens.fontSizeBase200,
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    columnGap: "6px",
  },

  skillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "8px",
  },

  skillBadge: {
    backgroundColor: "#E9DFC3",
    color: "#0B1220",
    fontSize: tokens.fontSizeBase200,
  },

  moreSkills: {
    color: "#5B6475",
    fontSize: tokens.fontSizeBase200,
  },

  actionsColumn: {
    display: "flex",
    flexDirection: "column",
    rowGap: "8px",
    marginLeft: "16px",
    alignItems: "flex-end",
    paddingTop: "2px",
  },

  iconButtonsRow: {
    display: "flex",
    columnGap: "8px",
  },

  iconButton: {
    minWidth: "40px",
    height: "40px",
    padding: 0,
    borderRadius: "8px",
  },

  bookmarkActive: {
    backgroundColor: "#0118D8",
    color: "#FFFFFF",
  },

  applyButton: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: 500,
    backgroundColor: "#0118D8",
    border: "none",
    boxShadow: "0 10px 25px rgba(15,23,42,0.25)",
    ":hover": {
      backgroundColor: "#1B56FD",
    },
  },

  detailsButton: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: 500,
  },

  "@keyframes pulse": {
    "0%, 100%": {
      boxShadow: "0 0 0 0 rgba(22,163,74,0.3)",
    },
    "50%": {
      boxShadow: "0 0 0 4px rgba(22,163,74,0)",
    },
  },
});

export const EnhancedJobCard: React.FC<EnhancedJobCardProps> = ({
  company,
  companyLogo,
  title,
  location,
  type,
  ctc,
  experience,
  postedDate,
  difficulty,
  skills,
  match,
  onApply,
  onViewDetails,
}) => {
  const styles = useStyles();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const difficultyColors =
    difficulty === "Easy"
      ? { bg: "#ECFDF5", fg: "#15803D" }
      : difficulty === "Medium"
      ? { bg: "#FFFBEB", fg: "#B45309" }
      : { bg: "#FEF2F2", fg: "#B91C1C" };

  return (
    <Card
      className={styles.card}
      appearance="outline"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={mergeClasses(
          styles.topAccent,
          isHovered && styles.topAccentVisible
        )}
      />

      <div className={styles.mainRow}>
        <div
          className={
            isHovered
              ? mergeClasses(styles.logoWrapper, styles.logoWrapperHovered)
              : styles.logoWrapper
          }
        >
          {companyLogo}
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <div className={styles.titleAndBadges}>
              <div className={styles.titleBadgesRow}>
                <Text as="span" className={styles.title}>
                  {title}
                </Text>

                {match != null && (
                  <Badge
                    appearance="filled"
                    className={styles.matchBadge}
                    style={{
                      backgroundColor: "#ECFDF5",
                      color: "#15803D",
                    }}
                  >
                    {match}% Match
                  </Badge>
                )}

                <Badge
                  appearance="filled"
                  style={{
                    backgroundColor: difficultyColors.bg,
                    color: difficultyColors.fg,
                  }}
                >
                  {difficulty}
                </Badge>
              </div>

              <Text as="p" className={styles.company}>
                {company}
              </Text>

              <div className={styles.metaRow}>
                <div className={styles.metaItem}>
                  <Location20Regular />
                  <span>{location}</span>
                </div>
                <div className={styles.metaItem}>
                  <Briefcase20Regular />
                  <span>{type}</span>
                </div>
                <div className={styles.metaItem}>
                  <Money20Regular />
                  <span>{ctc}</span>
                </div>
                <div className={styles.metaItem}>
                  <Building20Regular />
                  <span>{experience}</span>
                </div>
                <div className={styles.metaItem}>
                  <Clock20Regular />
                  <span>{postedDate}</span>
                </div>
              </div>

              <div className={styles.skillsRow}>
                {skills.slice(0, 4).map((skill) => (
                  <Badge
                    key={skill}
                    appearance="filled"
                    className={styles.skillBadge}
                  >
                    {skill}
                  </Badge>
                ))}
                {skills.length > 4 && (
                  <span className={styles.moreSkills}>
                    +{skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div className={styles.actionsColumn}>
              <div className={styles.iconButtonsRow}>
                <Button
                  appearance={isBookmarked ? "primary" : "outline"}
                  icon={<Bookmark20Regular />}
                  className={`${styles.iconButton} ${
                    isBookmarked ? styles.bookmarkActive : ""
                  }`}
                  onClick={() => setIsBookmarked((prev) => !prev)}
                />
                <Button
                  appearance="outline"
                  icon={<Share20Regular />}
                  className={styles.iconButton}
                />
              </div>

              <Button
                appearance="primary"
                size="small"
                className={styles.applyButton}
                onClick={onApply}
              >
                Apply Now
              </Button>

              <Button
                appearance="outline"
                size="small"
                className={styles.detailsButton}
                onClick={onViewDetails}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

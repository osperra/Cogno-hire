import React, { useMemo } from "react";
import { Card, Text, makeStyles, tokens } from "@fluentui/react-components";
import { Clock20Regular } from "@fluentui/react-icons";

export type IconComponent = React.ComponentType<Record<string, never>>;

export type ActivityItem = {
  icon: IconComponent;
  bg: string;
  color: string;
  title: string;
  description: string;
  time: string;

  timeSort?: number | string;

  __placeholder?: true;
};

interface ActivityTimelineProps {
  userRole: "employer" | "candidate";
  activities?: ActivityItem[];
  loading?: boolean;
}

const useStyles = makeStyles({
  card: {
    padding: "20px 24px",
    borderRadius: "16px",
    boxShadow: "0 18px 45px rgba(15,23,42,0.06)",
    border: "1px solid rgba(226,232,240,0.9)",
    backgroundColor: "#FFFFFF",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    rowGap: "18px",
    marginTop: "18px",
  },
  item: {
    display: "flex",
    columnGap: "14px",
    padding: "6px 4px",
    borderRadius: "12px",
    transition: "background 200ms ease",

    ":hover": {
      backgroundColor: "rgba(248,250,252,0.9)",
    },
    ":hover .iconWrapper": {
      transform: "scale(1.12) ",
    },
  },

  iconBox: {
    width: "44px",
    height: "44px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 6px 14px rgba(15,23,42,0.12)",
    transition: "transform 250ms ease",
  },

  textBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "2px",
  },

  title: {
    color: "#0B1220",
    fontWeight: 600,
    fontSize: tokens.fontSizeBase300,
  },

  description: {
    color: "#6B7280",
    fontSize: tokens.fontSizeBase200,
  },

  time: {
    color: "#9CA3AF",
    fontSize: tokens.fontSizeBase100,
    marginTop: "2px",
  },
});

function makePlaceholder(): ActivityItem {
  return {
    icon: Clock20Regular as unknown as IconComponent,
    bg: "transparent",
    color: "transparent",
    title: "",
    description: "",
    time: "",
    __placeholder: true,
  };
}

function toSortValue(v?: number | string) {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  const styles = useStyles();
  const hasActivities = (activities?.length ?? 0) > 0;

  const stableActivities = useMemo(() => {
    const targetCount = 4;

    if (loading) return Array.from({ length: targetCount }, () => makePlaceholder());

    const base = activities ?? [];

    const hasSort = base.some((x) => x?.timeSort != null);
    const sorted = hasSort
      ? [...base].sort((a, b) => toSortValue(b.timeSort) - toSortValue(a.timeSort))
      : [...base];

    const list = [...sorted];
    while (list.length < targetCount) list.push(makePlaceholder());
    return list.slice(0, targetCount);
  }, [activities, loading]);

  return (
    <Card className={styles.card} appearance="outline">
      <Text
        as="h3"
        size={500}
        weight="semibold"
        style={{ color: "#0B1220", marginBottom: 4 }}
      >
        Recent Activity
      </Text>

      {!loading && !hasActivities && (
        <div style={{ marginTop: 12, padding: "10px 0", color: "#6B7280", fontSize: 13 }}>
          No activity yet. Actions you take (posting jobs, inviting candidates, reviewing applications) will show up here.
        </div>
      )}

      <div className={styles.list} style={{ marginTop: hasActivities ? 18 : 10 }}>
        {stableActivities.map((activity, index) => {
          const Icon = activity.icon;

          if (activity.__placeholder) {
            return (
              <div key={index} className={styles.item} style={{ cursor: "default" }}>
                <div
                  className={styles.iconBox}
                  style={{ backgroundColor: "rgba(2,6,23,0.06)", boxShadow: "none" }}
                />
                <div className={styles.textBlock} style={{ width: "100%" }}>
                  <div style={{ height: 12, width: "55%", borderRadius: 8, background: "rgba(2,6,23,0.08)" }} />
                  <div
                    style={{
                      height: 10,
                      width: "80%",
                      borderRadius: 8,
                      marginTop: 8,
                      background: "rgba(2,6,23,0.06)",
                    }}
                  />
                  <div
                    style={{
                      height: 9,
                      width: "35%",
                      borderRadius: 8,
                      marginTop: 8,
                      background: "rgba(2,6,23,0.05)",
                    }}
                  />
                </div>
              </div>
            );
          }

          return (
            <div key={index} className={styles.item}>
              <div
                className={`${styles.iconBox} iconWrapper`}
                style={{ backgroundColor: activity.bg, color: activity.color }}
              >
                <Icon />
              </div>

              <div className={styles.textBlock}>
                <Text className={styles.title}>{activity.title}</Text>
                <Text className={styles.description}>{activity.description}</Text>
                <Text className={styles.time}>{activity.time}</Text>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

import * as React from "react";
import {
  Card,
  Button,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const useStyles = makeStyles({
  card: {
    padding: "48px",
    textAlign: "center",
    borderRadius: "12px",
    border: "1px solid rgba(2,6,23,0.08)",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  iconWrapper: {
    width: "80px",
    height: "80px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginInline: "auto",
    marginBottom: "24px",
    backgroundImage: "linear-gradient(135deg, #EFF6FF, #F5F3FF)",
    border: "2px solid #E9DFC3",
  },
  icon: {
    fontSize: "40px",
    color: "#0118D8",
  },
  title: {
    color: "#0B1220",
    marginBottom: "8px",
  },
  description: {
    color: "#5B6475",
    marginBottom: "24px",
    maxWidth: "420px",
    marginInline: "auto",
  },
  actionButton: {
    backgroundColor: "#0118D8",
    border: "none",
    ":hover": {
      backgroundColor: "#1B56FD",
    },
  },
});

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const styles = useStyles();

  return (
    <Card className={styles.card} appearance="outline">
      <div className={styles.iconWrapper}>
        <Icon className={styles.icon} />
      </div>

      <Text as="h3" size={500} weight="semibold" className={styles.title}>
        {title}
      </Text>

      <Text as="p" size={300} className={styles.description}>
        {description}
      </Text>

      {actionLabel && onAction && (
        <Button
          appearance="primary"
          onClick={onAction}
          className={styles.actionButton}
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

import * as React from "react";
import {
  makeStyles,
  Tab,
  TabList,
} from "@fluentui/react-components";
import {
  PersonRegular,
  SettingsRegular,
  ShieldLockRegular,
} from "@fluentui/react-icons";
import CandidateProfileSettings from "./CandidateProfileSettings";
import CandidateMyAccount from "./CandidateMyAccount";
import CandidatePreferences from "./CandidatePreferences";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  tabContent: {
    marginTop: "10px",
  },
});


export default function CandidateSettings({
  onNavigate,
  defaultTab = "profile",
}: {
  onNavigate: (page: string) => void;
  defaultTab?: string;
}) {
  const styles = useStyles();
  const [selectedTab, setSelectedTab] = React.useState<string>(defaultTab);

  React.useEffect(() => {
    setSelectedTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className={styles.root}>
      <TabList
        selectedValue={selectedTab}
        onTabSelect={(_, data) => setSelectedTab(data.value as string)}
        size="large"
        appearance="subtle"
      >
        <Tab icon={<PersonRegular />} value="profile">
          Profile
        </Tab>
        <Tab icon={<ShieldLockRegular />} value="account">
          Account
        </Tab>
        <Tab icon={<SettingsRegular />} value="preferences">
          Preferences
        </Tab>
      </TabList>

      <div className={styles.tabContent}>
        {selectedTab === "profile" && (
          <CandidateProfileSettings hideHeader hidePadding />
        )}
        {selectedTab === "account" && (
          <CandidateMyAccount
            onNavigate={onNavigate}
            hideHeader
            hidePadding
          />
        )}
        {selectedTab === "preferences" && (
          <CandidatePreferences hideHeader hidePadding />
        )}
      </div>
    </div>
  );
}

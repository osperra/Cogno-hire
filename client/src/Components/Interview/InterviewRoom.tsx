import * as React from "react";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  Text,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";

import {
  Mic20Regular,
  MicOff20Regular,
  Video20Regular,
  VideoOff20Regular,
  Speaker220Regular,
  SpeakerMute20Regular,
  Chat20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Alert20Regular,
} from "@fluentui/react-icons";

interface InterviewRoomProps {
  jobTitle: string;
  company: string;
  onComplete: () => void;
}

interface Message {
  id: number;
  role: "ai" | "candidate";
  content: string;
  timestamp: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0B1220",
    color: "#F9FAFB",
  },

  // --- Top bar ---
  topBar: {
    backgroundColor: "#1F2937",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    ...shorthands.padding("12px", "16px"),
  },
  topBarInner: {
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: "24px",
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
  },
  logo: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: "20px",
    flexShrink: 0,
  },
  jobTitleBlock: {
    display: "flex",
    flexDirection: "column",
    rowGap: "2px",
  },
  jobCompany: {
    color: "#9CA3AF",
    fontSize: "0.875rem",
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    columnGap: "16px",
  },
  timeBlock: {
    display: "flex",
    alignItems: "center",
    columnGap: "6px",
    color: "#F9FAFB",
    fontSize: "1.125rem",
    fontWeight: 500,
  },
  recordingBadge: {
    backgroundColor: "rgba(34,197,94,0.15)",
    color: "#4ADE80",
    display: "flex",
    alignItems: "center",
    columnGap: "6px",
  },
  recordingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "#22C55E",
    animation: "pulse 1.5s infinite",
  },

  // --- Layout ---
  main: {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  },

  // Left side (video & controls)
  leftPane: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0B1220",
    ...shorthands.padding("24px"),
    rowGap: "16px",
  },
  videoGrid: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "16px",
    rowGap: "16px",
  },
  aiCard: {
    position: "relative",
    backgroundImage:
      "linear-gradient(135deg, rgba(129,140,248,0.35), rgba(59,130,246,0.25))",
    overflow: "hidden",
  },
  aiCardInner: {
    position: "absolute",
    inset: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatar: {
    position: "relative",
    width: "128px",
    height: "128px",
    borderRadius: "999px",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    color: "#FFFFFF",
  },
  aiSpeakingOverlay: {
    position: "absolute",
    inset: "0",
    backgroundImage:
      "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.35))",
    animation: "pulse 1.5s infinite",
  },
  aiBadge: {
    position: "absolute",
    left: "16px",
    bottom: "16px",
    backgroundColor: "rgba(168,85,247,0.2)",
    color: "#E9D5FF",
  },

  candidateCard: {
    position: "relative",
    backgroundColor: "#111827",
    overflow: "hidden",
  },
  candidatePlaceholder: {
    position: "absolute",
    inset: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  candidateBadge: {
    position: "absolute",
    left: "16px",
    bottom: "16px",
    backgroundColor: "rgba(59,130,246,0.2)",
    color: "#BFDBFE",
  },

  // Progress card
  progressCard: {
    backgroundColor: "#1F2937",
    ...shorthands.padding("16px", "20px"),
  },
  progressHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  progressHeaderLeft: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
  },
  progressPercent: {
    color: "#9CA3AF",
    fontSize: "0.875rem",
  },
  progressBar: {
    marginTop: "8px",
    marginBottom: "12px",
    "& .fui-ProgressBar-bar": {
      backgroundColor: "#22C55E",
    },
  },
  progressStepsRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "4px",
  },
  progressStep: {
    flex: 1,
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "#374151",
  },

  // Controls
  controlsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: "16px",
    marginTop: "8px",
  },
  roundControlButton: {
    minWidth: "56px",
    height: "56px",
    borderRadius: "999px",
    padding: 0,
  },

  // Right pane (transcript)
  rightPane: {
    width: "380px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1F2937",
    borderLeft: "1px solid rgba(255,255,255,0.1)",
  },
  rightHeader: {
    ...shorthands.padding("12px", "16px"),
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  rightHeaderInner: {
    display: "flex",
    alignItems: "center",
    columnGap: "8px",
    color: "#FFFFFF",
  },
  transcriptScroll: {
    flex: 1,
    overflowY: "auto",
    ...shorthands.padding("16px"),
  },
  transcriptList: {
    display: "flex",
    flexDirection: "column",
    rowGap: "12px",
  },
  messageRow: {
    display: "flex",
    columnGap: "8px",
    alignItems: "flex-start",
  },
  messageRowCandidate: {
    flexDirection: "row-reverse",
  },
  avatarCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 600,
  },
  avatarAI: {
    backgroundImage: "linear-gradient(135deg, #A855F7, #3B82F6)",
  },
  avatarYou: {
    backgroundImage: "linear-gradient(135deg, #22C55E, #10B981)",
  },
  messageBody: {
    flex: 1,
  },
  messageBodyCandidate: {
    textAlign: "right",
  },
  messageTimestamp: {
    marginBottom: "4px",
    color: "#9CA3AF",
    fontSize: "0.75rem",
  },
  messageBubbleAI: {
    display: "inline-block",
    maxWidth: "100%",
    backgroundColor: "rgba(76,29,149,0.45)",
    color: "#EDE9FE",
    ...shorthands.padding("8px", "12px"),
    borderRadius: "10px",
    fontSize: "0.875rem",
  },
  messageBubbleYou: {
    display: "inline-block",
    maxWidth: "100%",
    backgroundColor: "rgba(6,95,70,0.45)",
    color: "#DCFCE7",
    ...shorthands.padding("8px", "12px"),
    borderRadius: "10px",
    fontSize: "0.875rem",
  },

  typingDotsBubble: {
    display: "inline-block",
    backgroundColor: "rgba(76,29,149,0.45)",
    ...shorthands.padding("8px", "12px"),
    borderRadius: "10px",
  },
  typingDotsRow: {
    display: "flex",
    columnGap: "4px",
  },
  typingDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    backgroundColor: "#C4B5FD",
    animation: "bounce 1.4s infinite",
  },

  tipsBox: {
    ...shorthands.padding("12px", "16px"),
    borderTop: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "rgba(30,64,175,0.25)",
  },
  tipsRow: {
    display: "flex",
    alignItems: "flex-start",
    columnGap: "8px",
  },
  tipsTitle: {
    color: "#BFDBFE",
    fontSize: "0.875rem",
    fontWeight: 500,
    marginBottom: "2px",
  },
  tipsText: {
    color: "rgba(191,219,254,0.75)",
    fontSize: "0.75rem",
  },

  "@keyframes pulse": {
    "0%, 100%": { opacity: 1, transform: "scale(1)" },
    "50%": { opacity: 0.6, transform: "scale(1.1)" },
  },

  "@keyframes bounce": {
    "0%, 80%, 100%": { transform: "scale(0)" },
    "40%": { transform: "scale(1)" },
  },
});

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  jobTitle,
  company,
  onComplete,
}) => {
  const styles = useStyles();

  const [isMicOn, setIsMicOn] = React.useState(true);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [isSoundOn, setIsSoundOn] = React.useState(true);
  const [currentQuestion, setCurrentQuestion] = React.useState(1);
  const [progress, setProgress] = React.useState(15);
  const [isAISpeaking, setIsAISpeaking] = React.useState(false);
  const [transcript, setTranscript] = React.useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content:
        "Hello! Welcome to your interview for the Senior Frontend Developer position at TechCorp. I'm your AI interviewer today. Let's start with a brief introduction - can you tell me about yourself and your experience with React?",
      timestamp: "10:30 AM",
    },
  ]);

  const totalQuestions = 12;
  const timeElapsed = "12:34";

  const mockQuestions = [
    "Tell me about a challenging project you worked on and how you overcame obstacles.",
    "How do you approach performance optimization in React applications?",
    "Describe your experience with state management solutions.",
    "How do you ensure code quality and maintainability in your projects?",
  ];

  const handleAnswer = () => {
    const candidateMessage: Message = {
      id: transcript.length + 1,
      role: "candidate",
      content:
        "I have over 5 years of experience with React. In my current role, I've built several large-scale applications using React 18 with TypeScript. I'm particularly experienced with hooks, performance optimization, and modern state management patterns.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTranscript((prev) => [...prev, candidateMessage]);

    setTimeout(() => {
      setIsAISpeaking(true);
      setTimeout(() => {
        const aiMessage: Message = {
          id: transcript.length + 2,
          role: "ai",
          content: mockQuestions[currentQuestion % mockQuestions.length],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setTranscript((prev) => [...prev, aiMessage]);
        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setProgress((nextQuestion / totalQuestions) * 100);
        setIsAISpeaking(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className={styles.root}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            <div className={styles.logo}>AI</div>
            <div className={styles.jobTitleBlock}>
              <Text weight="semibold">{jobTitle}</Text>
              <span className={styles.jobCompany}>{company}</span>
            </div>
          </div>

          <div className={styles.topBarRight}>
            <div className={styles.timeBlock}>
              <Clock20Regular />
              <span>{timeElapsed}</span>
            </div>
            <Badge className={styles.recordingBadge} appearance="outline">
              <span className={styles.recordingDot} />
              Recording
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={styles.main}>
        {/* LEFT PANE */}
        <div className={styles.leftPane}>
          {/* Video grid */}
          <div className={styles.videoGrid}>
            {/* AI Avatar */}
            <Card className={styles.aiCard} appearance="outline">
              <div className={styles.aiCardInner}>
                {isAISpeaking && (
                  <div className={styles.aiSpeakingOverlay} />
                )}
                <div className={styles.aiAvatar}>✨</div>
              </div>
              <Badge className={styles.aiBadge} appearance="outline">
                AI Interviewer
              </Badge>
            </Card>

            {/* Candidate video */}
            <Card className={styles.candidateCard} appearance="outline">
              <div className={styles.candidatePlaceholder}>
                {isVideoOn ? (
                  <>
                    <Video20Regular
                      style={{ fontSize: 48, color: "#4B5563" }}
                    />
                  </>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <VideoOff20Regular
                      style={{
                        fontSize: 48,
                        color: "#4B5563",
                        marginBottom: 8,
                      }}
                    />
                    <Text style={{ color: "#9CA3AF" }}>Camera Off</Text>
                  </div>
                )}
              </div>
              <Badge className={styles.candidateBadge} appearance="outline">
                You
              </Badge>
            </Card>
          </div>

          {/* Progress */}
          <Card className={styles.progressCard} appearance="outline">
            <div className={styles.progressHeader}>
              <div className={styles.progressHeaderLeft}>
                <CheckmarkCircle20Regular
                  style={{ color: "#4ADE80" }}
                />
                <Text>
                  Question {currentQuestion} of {totalQuestions}
                </Text>
              </div>
              <span className={styles.progressPercent}>
                {Math.round(progress)}% Complete
              </span>
            </div>

            <ProgressBar
              value={progress}
              max={100}
              className={styles.progressBar}
            />

            <div className={styles.progressStepsRow}>
              {Array.from({ length: totalQuestions }).map((_, i) => {
                let background = "#374151";
                if (i < currentQuestion) {
                  background =
                    "linear-gradient(90deg, #22C55E, #10B981)";
                } else if (i === currentQuestion) {
                  background =
                    "linear-gradient(90deg, #0118D8, #1B56FD)";
                }
                return (
                  <div
                    key={i}
                    className={styles.progressStep}
                    style={{ background }}
                  />
                );
              })}
            </div>
          </Card>

          {/* Controls */}
          <div className={styles.controlsRow}>
            <Button
              onClick={() => setIsMicOn((m) => !m)}
              className={styles.roundControlButton}
              appearance={isMicOn ? "secondary" : "primary"}
              style={{
                backgroundColor: isMicOn ? "#374151" : "#EF4444",
                borderColor: "transparent",
              }}
              icon={
                isMicOn ? <Mic20Regular /> : <MicOff20Regular />
              }
            />

            <Button
              onClick={() => setIsVideoOn((v) => !v)}
              className={styles.roundControlButton}
              appearance={isVideoOn ? "secondary" : "primary"}
              style={{
                backgroundColor: isVideoOn ? "#374151" : "#EF4444",
                borderColor: "transparent",
              }}
              icon={
                isVideoOn ? <Video20Regular /> : <VideoOff20Regular />
              }
            />

            <Button
              onClick={() => setIsSoundOn((s) => !s)}
              className={styles.roundControlButton}
              appearance={isSoundOn ? "secondary" : "primary"}
              style={{
                backgroundColor: isSoundOn ? "#374151" : "#EF4444",
                borderColor: "transparent",
              }}
              icon={
                isSoundOn ? (
                  <Speaker220Regular />
                ) : (
                  <SpeakerMute20Regular />
                )
              }
            />

            <Button
              onClick={handleAnswer}
              disabled={isAISpeaking}
              appearance="primary"
              style={{
                paddingInline: 32,
                paddingBlock: 18,
                borderRadius: 999,
                backgroundImage:
                  "linear-gradient(90deg, #0118D8, #1B56FD)",
                border: "none",
              }}
              icon={<Mic20Regular />}
            >
              Answer
            </Button>

            <Button
              onClick={onComplete}
              appearance="outline"
              style={{
                paddingInline: 24,
                paddingBlock: 18,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: "#EF4444",
                color: "#FCA5A5",
              }}
            >
              End Interview
            </Button>
          </div>
        </div>

        {/* RIGHT PANE */}
        <div className={styles.rightPane}>
          <div className={styles.rightHeader}>
            <div className={styles.rightHeaderInner}>
              <Chat20Regular />
              <Text weight="semibold">Live Transcript</Text>
            </div>
          </div>

          <div className={styles.transcriptScroll}>
            <div className={styles.transcriptList}>
              {transcript.map((message) => {
                const isAI = message.role === "ai";
                return (
                  <div
                    key={message.id}
                    className={
                      styles.messageRow +
                      " " +
                      (!isAI ? styles.messageRowCandidate : "")
                    }
                  >
                    <div
                      className={
                        styles.avatarCircle +
                        " " +
                        (isAI ? styles.avatarAI : styles.avatarYou)
                      }
                    >
                      {isAI ? "AI" : "You"}
                    </div>

                    <div
                      className={
                        styles.messageBody +
                        " " +
                        (!isAI ? styles.messageBodyCandidate : "")
                      }
                    >
                      <div className={styles.messageTimestamp}>
                        {message.timestamp}
                      </div>
                      <div
                        className={
                          isAI
                            ? styles.messageBubbleAI
                            : styles.messageBubbleYou
                        }
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isAISpeaking && (
                <div className={styles.messageRow}>
                  <div
                    className={
                      styles.avatarCircle + " " + styles.avatarAI
                    }
                  >
                    AI
                  </div>
                  <div className={styles.messageBody}>
                    <div className={styles.typingDotsBubble}>
                      <div className={styles.typingDotsRow}>
                        <span className={styles.typingDot} />
                        <span
                          className={styles.typingDot}
                          style={{ animationDelay: "0.1s" }}
                        />
                        <span
                          className={styles.typingDot}
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className={styles.tipsBox}>
            <div className={styles.tipsRow}>
              <Alert20Regular
                style={{ color: "#60A5FA", marginTop: 2 }}
              />
              <div>
                <p className={styles.tipsTitle}>Pro Tip</p>
                <p className={styles.tipsText}>
                  Speak clearly and take your time. The AI will wait for
                  you to finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

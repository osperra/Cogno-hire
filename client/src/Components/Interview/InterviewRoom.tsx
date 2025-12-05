import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

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
  Bot24Regular,
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

const BREAKPOINT_LG = 1200;
const BREAKPOINT_MD = 900;
const BREAKPOINT_SM = 600;

export function InterviewRoom({ jobTitle, company, onComplete }: InterviewRoomProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [progress, setProgress] = useState(15);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1400
  );

  const [transcript, setTranscript] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      content:
        "Hello! Welcome to your interview for the Senior Frontend Developer position at TechCorp. I'm your AI interviewer today. Let's start with a brief introduction - can you tell me about yourself and your experience with React?",
      timestamp: "10:30 AM",
    },
  ]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        setTranscript((prev) => {
          const aiMessage: Message = {
            id: prev.length + 1,
            role: "ai",
            content: mockQuestions[currentQuestion % mockQuestions.length],
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          return [...prev, aiMessage];
        });

        const nextQuestion = currentQuestion + 1;
        setCurrentQuestion(nextQuestion);
        setProgress((nextQuestion / totalQuestions) * 100);
        setIsAISpeaking(false);
      }, 2000);
    }, 1000);
  };

  const isStackedLayout = viewportWidth < BREAKPOINT_LG;
  const isSingleVideoColumn = viewportWidth < BREAKPOINT_MD;
  const isCompact = viewportWidth < BREAKPOINT_SM;

  // --- Styles ---

  const rootStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0B1220",
    color: "#F9FAFB",
  };

  const topBarStyle: React.CSSProperties = {
    backgroundColor: "#1F2937",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "12px 16px",
  };

  const topBarInnerStyle: React.CSSProperties = {
    maxWidth: 1120,
    margin: "0 auto",
    display: "flex",
    alignItems: isStackedLayout ? "flex-start" : "center",
    justifyContent: isStackedLayout ? "space-between" : "space-between",
    flexDirection: isStackedLayout ? "column" : "row",
    rowGap: isStackedLayout ? 8 : 0,
    columnGap: 24,
  };

  const topBarLeftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    columnGap: 16,
  };

  const logoStyle: React.CSSProperties = {
    width: isCompact ? 40 : 48,
    height: isCompact ? 40 : 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: isCompact ? 16 : 20,
    flexShrink: 0,
  };

  const jobTitleBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    rowGap: 2,
  };

  const jobTitleTextStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: 16,
  };

  const jobCompanyStyle: React.CSSProperties = {
    color: "#9CA3AF",
    fontSize: 14,
  };

  const topBarRightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    columnGap: 16,
    marginTop: isStackedLayout ? 8 : 0,
  };

  const timeBlockStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    columnGap: 6,
    color: "#F9FAFB",
    fontSize: isCompact ? 14 : 18,
    fontWeight: 500,
  };

  const recordingBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    columnGap: 6,
    backgroundColor: "rgba(34,197,94,0.15)",
    color: "#4ADE80",
    borderColor: "rgba(34,197,94,0.4)",
  };

  const recordingDotStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    borderRadius: "999px",
    backgroundColor: "#22C55E",
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: isStackedLayout ? "column" : "row",
    overflow: "hidden",
  };

  const leftPaneStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#0B1220",
    padding: isCompact ? 16 : 24,
    rowGap: 16,
  };

  const videoGridStyle: React.CSSProperties = {
    flex: 1,
    display: "grid",
    gridTemplateColumns: isSingleVideoColumn ? "1fr" : "1fr 1fr",
    columnGap: 16,
    rowGap: 16,
  };

  const aiCardStyle: React.CSSProperties = {
    position: "relative",
    backgroundImage:
      "linear-gradient(135deg, rgba(129,140,248,0.35), rgba(59,130,246,0.25))",
    overflow: "hidden",
    minHeight: 220,
  };

  const aiCardInnerStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const aiAvatarStyle: React.CSSProperties = {
    position: "relative",
    width: isCompact ? 96 : 128,
    height: isCompact ? 96 : 128,
    borderRadius: "999px",
    backgroundImage: "linear-gradient(135deg, #0118D8, #1B56FD)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
  };

  const aiSpeakingOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.35))",
  };

  const aiBadgeStyle: React.CSSProperties = {
    position: "absolute",
    left: 16,
    bottom: 16,
    backgroundColor: "rgba(168,85,247,0.2)",
    color: "#E9D5FF",
    borderColor: "rgba(168,85,247,0.5)",
  };

  const candidateCardStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: "#111827",
    overflow: "hidden",
    minHeight: 220,
  };

  const candidatePlaceholderStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  };

  const candidateBadgeStyle: React.CSSProperties = {
    position: "absolute",
    left: 16,
    bottom: 16,
    backgroundColor: "rgba(59,130,246,0.2)",
    color: "#BFDBFE",
    borderColor: "rgba(59,130,246,0.5)",
  };

  const progressCardStyle: React.CSSProperties = {
    backgroundColor: "#1F2937",
    padding: 16,
    borderColor: "rgba(255,255,255,0.08)",
  };

  const progressHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  };

  const progressHeaderLeftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    columnGap: 8,
  };

  const progressPercentStyle: React.CSSProperties = {
    color: "#9CA3AF",
    fontSize: 14,
  };

  const progressBarStyle: React.CSSProperties = {
    height: 12,
    borderRadius: 999,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: "#374151",
  };

  const progressStepsRowStyle: React.CSSProperties = {
    display: viewportWidth < 480 ? "none" : "flex",
    alignItems: "center",
    columnGap: 4,
  };

  const progressStepBaseStyle: React.CSSProperties = {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#374151",
  };

  const controlsRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    columnGap: isCompact ? 10 : 16,
    rowGap: isCompact ? 10 : 0,
    flexWrap: viewportWidth < BREAKPOINT_MD ? "wrap" : "nowrap",
    marginTop: 8,
  };

  const roundControlButtonStyle: React.CSSProperties = {
    width: isCompact ? 48 : 56,
    height: isCompact ? 48 : 56,
    borderRadius: "999px",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const answerButtonStyle: React.CSSProperties = {
    paddingInline: 32,
    paddingBlock: isCompact ? 12 : 18,
    borderRadius: 999,
    backgroundImage: "linear-gradient(90deg, #0118D8, #1B56FD)",
    border: "none",
    display: "flex",
    alignItems: "center",
    columnGap: 8,
  };

  const endButtonStyle: React.CSSProperties = {
    paddingInline: 24,
    paddingBlock: isCompact ? 12 : 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#EF4444",
    color: "#FCA5A5",
  };

  const rightPaneStyle: React.CSSProperties = {
    width: isStackedLayout ? "100%" : 380,
    height: isStackedLayout ? 320 : "auto",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1F2937",
    borderLeft: isStackedLayout ? "none" : "1px solid rgba(255,255,255,0.1)",
    borderTop: isStackedLayout ? "1px solid rgba(255,255,255,0.1)" : "none",
  };

  const rightHeaderStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  };

  const rightHeaderInnerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    columnGap: 8,
    color: "#FFFFFF",
  };

  const transcriptScrollStyle: React.CSSProperties = {
    flex: 1,
    padding: isCompact ? 12 : 16,
  };

  const transcriptListStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    rowGap: 12,
  };

  const messageRowStyle: React.CSSProperties = {
    display: "flex",
    columnGap: 8,
    alignItems: "flex-start",
  };

  const avatarCircleBaseStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 600,
  };

  const avatarAIStyle: React.CSSProperties = {
    ...avatarCircleBaseStyle,
    backgroundImage: "linear-gradient(135deg, #A855F7, #3B82F6)",
  };

  const avatarYouStyle: React.CSSProperties = {
    ...avatarCircleBaseStyle,
    backgroundImage: "linear-gradient(135deg, #22C55E, #10B981)",
  };

  const messageBodyBaseStyle: React.CSSProperties = {
    flex: 1,
  };

  const messageTimestampStyle: React.CSSProperties = {
    marginBottom: 4,
    color: "#9CA3AF",
    fontSize: 12,
  };

  const messageBubbleAIStyle: React.CSSProperties = {
    display: "inline-block",
    maxWidth: "100%",
    backgroundColor: "rgba(76,29,149,0.45)",
    color: "#EDE9FE",
    padding: isCompact ? "6px 10px" : "8px 12px",
    borderRadius: 10,
    fontSize: isCompact ? 12 : 14,
  };

  const messageBubbleYouStyle: React.CSSProperties = {
    display: "inline-block",
    maxWidth: "100%",
    backgroundColor: "rgba(6,95,70,0.45)",
    color: "#DCFCE7",
    padding: isCompact ? "6px 10px" : "8px 12px",
    borderRadius: 10,
    fontSize: isCompact ? 12 : 14,
  };

  const tipsBoxStyle: React.CSSProperties = {
    padding: "12px 16px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
    backgroundColor: "rgba(30,64,175,0.25)",
  };

  const tipsRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    columnGap: 8,
  };

  const tipsTitleStyle: React.CSSProperties = {
    color: "#BFDBFE",
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 2,
  };

  const tipsTextStyle: React.CSSProperties = {
    color: "rgba(191,219,254,0.75)",
    fontSize: 12,
  };

  return (
    <div style={rootStyle}>
      {/* Top bar */}
      <div style={topBarStyle}>
        <div style={topBarInnerStyle}>
          <div style={topBarLeftStyle}>
            <div style={logoStyle}>AI</div>
            <div style={jobTitleBlockStyle}>
              <div style={jobTitleTextStyle}>{jobTitle}</div>
              <div style={jobCompanyStyle}>{company}</div>
            </div>
          </div>

          <div style={topBarRightStyle}>
            <div style={timeBlockStyle}>
              <Clock20Regular />
              <span>{timeElapsed}</span>
            </div>
            <Badge style={recordingBadgeStyle}>
              <span style={recordingDotStyle} />
              Recording
            </Badge>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={mainStyle}>
        {/* LEFT PANE */}
        <div style={leftPaneStyle}>
          {/* Video grid */}
          <div style={videoGridStyle}>
            {/* AI Avatar */}
            <Card style={aiCardStyle}>
              <div style={aiCardInnerStyle}>
                {isAISpeaking && <div style={aiSpeakingOverlayStyle} />}
                <div style={aiAvatarStyle}>
                  <Bot24Regular style={{ width: 40, height: 40 }} />
                </div>
              </div>
              <Badge style={aiBadgeStyle}>AI Interviewer</Badge>
            </Card>

            {/* Candidate video */}
            <Card style={candidateCardStyle}>
              <div style={candidatePlaceholderStyle}>
                {isVideoOn ? (
                  <Video20Regular style={{ width: 48, height: 48, color: "#4B5563" }} />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <VideoOff20Regular
                      style={{
                        width: 48,
                        height: 48,
                        color: "#4B5563",
                        marginBottom: 8,
                      }}
                    />
                    <span style={{ color: "#9CA3AF", fontSize: 14 }}>Camera Off</span>
                  </div>
                )}
              </div>
              <Badge style={candidateBadgeStyle}>You</Badge>
            </Card>
          </div>

          {/* Progress */}
          <Card style={progressCardStyle}>
            <div style={progressHeaderStyle}>
              <div style={progressHeaderLeftStyle}>
                <CheckmarkCircle20Regular style={{ color: "#4ADE80" }} />
                <span>
                  Question {currentQuestion} of {totalQuestions}
                </span>
              </div>
              <span style={progressPercentStyle}>{Math.round(progress)}% Complete</span>
            </div>

            <Progress value={progress} style={progressBarStyle} />

            <div style={progressStepsRowStyle}>
              {Array.from({ length: totalQuestions }).map((_, i) => {
                let background = "#374151";
                if (i < currentQuestion) {
                  background = "linear-gradient(90deg, #22C55E, #10B981)";
                } else if (i === currentQuestion) {
                  background = "linear-gradient(90deg, #0118D8, #1B56FD)";
                }
                return (
                  <div
                    key={i}
                    style={{
                      ...progressStepBaseStyle,
                      background,
                    }}
                  />
                );
              })}
            </div>
          </Card>

          {/* Controls */}
          <div style={controlsRowStyle}>
            <Button
              onClick={() => setIsMicOn((m) => !m)}
              style={{
                ...roundControlButtonStyle,
                backgroundColor: isMicOn ? "#374151" : "#EF4444",
                borderColor: "transparent",
              }}
              variant={isMicOn ? "outline" : "default"}
              size="icon"
            >
              {isMicOn ? <Mic20Regular /> : <MicOff20Regular />}
            </Button>

            <Button
              onClick={() => setIsVideoOn((v) => !v)}
              style={{
                ...roundControlButtonStyle,
                backgroundColor: isVideoOn ? "#374151" : "#EF4444",
                borderColor: "transparent",
              }}
              variant={isVideoOn ? "outline" : "default"}
              size="icon"
            >
              {isVideoOn ? <Video20Regular /> : <VideoOff20Regular />}
            </Button>

            <Button
              onClick={() => setIsSoundOn((s) => !s)}
              style={{
                ...roundControlButtonStyle,
                backgroundColor: isSoundOn ? "#374151" : "#EF4444",
                borderColor: "transparent",
              }}
              variant={isSoundOn ? "outline" : "default"}
              size="icon"
            >
              {isSoundOn ? <Speaker220Regular /> : <SpeakerMute20Regular />}
            </Button>

            <Button
              onClick={handleAnswer}
              disabled={isAISpeaking}
              style={answerButtonStyle}
            >
              <Mic20Regular />
              <span>Answer</span>
            </Button>

            <Button onClick={onComplete} variant="outline" style={endButtonStyle}>
              End Interview
            </Button>
          </div>
        </div>

        {/* RIGHT PANE */}
        <div style={rightPaneStyle}>
          <div style={rightHeaderStyle}>
            <div style={rightHeaderInnerStyle}>
              <Chat20Regular />
              <span style={{ fontWeight: 600 }}>Live Transcript</span>
            </div>
          </div>

          <ScrollArea style={transcriptScrollStyle}>
            <div style={transcriptListStyle}>
              {transcript.map((message) => {
                const isAI = message.role === "ai";
                const rowStyle: React.CSSProperties = {
                  ...messageRowStyle,
                  flexDirection: isAI ? "row" : "row-reverse",
                };
                const bodyStyle: React.CSSProperties = {
                  ...messageBodyBaseStyle,
                  textAlign: isAI ? "left" : "right",
                };

                return (
                  <div key={message.id} style={rowStyle}>
                    <div style={isAI ? avatarAIStyle : avatarYouStyle}>
                      {isAI ? "AI" : "You"}
                    </div>
                    <div style={bodyStyle}>
                      <div style={messageTimestampStyle}>{message.timestamp}</div>
                      <div style={isAI ? messageBubbleAIStyle : messageBubbleYouStyle}>
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isAISpeaking && (
                <div style={messageRowStyle}>
                  <div style={avatarAIStyle}>AI</div>
                  <div style={messageBodyBaseStyle}>
                    <div style={messageBubbleAIStyle}>
                      <span>Thinking…</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div style={tipsBoxStyle}>
            <div style={tipsRowStyle}>
              <Alert20Regular style={{ color: "#60A5FA", marginTop: 2 }} />
              <div>
                <p style={tipsTitleStyle}>Pro Tip</p>
                <p style={tipsTextStyle}>
                  Speak clearly and take your time. The AI will wait for you to finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

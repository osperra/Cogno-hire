import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";

import {
  Mic20Regular,
  MicOff20Regular,
  VideoOff20Regular,
  Speaker220Regular,
  SpeakerMute20Regular,
  Chat20Regular,
  CheckmarkCircle20Regular,
  Clock20Regular,
  Alert20Regular,
  Bot24Regular,
  Send20Regular,
} from "@fluentui/react-icons";

interface InterviewRoomProps {
  jobTitle: string;
  company: string;
  onComplete: (analysis?: any) => void;
}

interface Message {
  id: number;
  role: "ai" | "candidate";
  content: string;
  timestamp: string;
}

type ApiError = { message?: string };
type ProviderName = "gemini" | "groq" | "ollama";

type StartInterviewResponse = {
  sessionId: string;
  provider?: ProviderName;
  questionNumber?: number;
  totalQuestions?: number;
  aiMessage: string;
  message?: string;
};

type NextInterviewResponse = {
  sessionId: string;
  provider?: ProviderName;
  questionNumber?: number;
  totalQuestions?: number;
  aiMessage?: string;
  done?: boolean;
  message?: string;
};

type MediaState = {
  micReady: boolean;
  micError?: string;

  speechSupported: boolean;
  speechError?: string;

  listening: boolean;
  interim: string;
};

const BREAKPOINT_LG = 1200;
const BREAKPOINT_MD = 900;
const BREAKPOINT_SM = 600;

const API_BASE = "http://localhost:5000";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function ts() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (isRecord(e) && typeof e["message"] === "string") return String(e["message"]);
  return "Something went wrong";
}

function mediaErrToText(err: unknown) {
  const e = err as { name?: string; message?: string };
  return `${e?.name || "MediaError"}: ${e?.message || "Unknown error"}`;
}

// ---- AUTH (Bearer token) ----
function getAuthToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ---- Web Speech API (no any) ----
type SpeechRecognitionResultAlternativeLike = { transcript: string; confidence: number };
type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionResultAlternativeLike> & { isFinal?: boolean };

type SpeechRecognitionEventLike = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = Event & {
  error?: string;
  message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;

  start: () => void;
  stop: () => void;
  abort: () => void;

  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onaudiostart: ((ev: Event) => void) | null;
  onaudioend: ((ev: Event) => void) | null;

  onerror: ((ev: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
};

type SpeechRecognitionCtorLike = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtorLike | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtorLike;
    webkitSpeechRecognition?: SpeechRecognitionCtorLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function extractSpeechError(ev: unknown): string {
  if (!isRecord(ev)) return "Speech recognition error";
  const err = ev["error"];
  const msg = ev["message"];
  if (typeof err === "string") return err;
  if (typeof msg === "string") return msg;
  return "Speech recognition error";
}

export function InterviewRoom({ jobTitle, company, onComplete }: InterviewRoomProps) {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSoundOn, setIsSoundOn] = useState(true);

  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1400
  );

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(12);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [fetchingNext, setFetchingNext] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [transcript, setTranscript] = useState<Message[]>([]);
  const [answer, setAnswer] = useState("");

  const idRef = useRef(1);
  const timerRef = useRef<number | null>(null);

  const audioStreamRef = useRef<MediaStream | null>(null);
  const srRef = useRef<SpeechRecognitionLike | null>(null);

  const ttsCancelRef = useRef(false);
  const shouldResumeAfterTtsRef = useRef(false);

  const [media, setMedia] = useState<MediaState>({
    micReady: false,
    speechSupported: false,
    listening: false,
    interim: "",
  });

  const progress = useMemo(() => {
    const p = (currentQuestion / totalQuestions) * 100;
    return Math.max(0, Math.min(100, p));
  }, [currentQuestion, totalQuestions]);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    if (timerRef.current) return;

    timerRef.current = window.setInterval(() => setElapsedSec((s) => s + 1), 1000);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const SR = getSpeechRecognitionCtor();
      const speechSupported = !!SR;

      setMedia((prev) => ({
        ...prev,
        speechSupported,
        speechError: speechSupported ? undefined : "Speech recognition not supported (use Chrome/Edge).",
      }));

      try {
        const aStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        if (cancelled) return;

        audioStreamRef.current = aStream;

        const tracks = aStream.getAudioTracks();
        if (!tracks.length) {
          setMedia((prev) => ({ ...prev, micReady: false, micError: "No audio input device found." }));
        } else {
          tracks.forEach((t) => (t.enabled = isMicOn));
          setMedia((prev) => ({ ...prev, micReady: true, micError: undefined }));
        }
      } catch (err) {
        if (cancelled) return;
        setMedia((prev) => ({ ...prev, micReady: false, micError: mediaErrToText(err) }));
      }

      if (SR && !srRef.current) {
        const sr = new SR();
        sr.lang = "en-US";
        sr.continuous = true;
        sr.interimResults = true;
        sr.maxAlternatives = 1;

        sr.onstart = () => setMedia((prev) => ({ ...prev, listening: true, speechError: undefined }));
        sr.onend = () => setMedia((prev) => ({ ...prev, listening: false, interim: "" }));

        sr.onerror = (ev) => {
          const msg = extractSpeechError(ev);
          setMedia((prev) => ({ ...prev, listening: false, speechError: msg }));
        };

        sr.onresult = (ev) => {
          let finalText = "";
          let interimText = "";

          for (let i = 0; i < ev.results.length; i++) {
            const res = ev.results[i];
            const best = res[0];
            const t = (best?.transcript ?? "").trim();
            const isFinal = Boolean(res.isFinal);

            if (!t) continue;

            if (isFinal) finalText += (finalText ? " " : "") + t;
            else interimText += (interimText ? " " : "") + t;
          }

          if (interimText) {
            setMedia((p) => ({ ...p, interim: interimText }));
            setAnswer(interimText);
          }

          if (finalText) {
            setMedia((p) => ({ ...p, interim: "" }));
            setAnswer(finalText);
          }
        };

        srRef.current = sr;
      }
    }

    init();

    return () => {
      cancelled = true;

      try {
        srRef.current?.abort();
      } catch {
        // ignore
      }
      srRef.current = null;

      audioStreamRef.current?.getTracks().forEach((t) => t.stop());
      audioStreamRef.current = null;

      try {
        window.speechSynthesis?.cancel();
      } catch {
        // ignore
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stream = audioStreamRef.current;
    if (!stream) return;

    const tracks = stream.getAudioTracks();
    if (!tracks.length) {
      setMedia((p) => ({ ...p, micReady: false, micError: "No audio track found. Check system input device." }));
      return;
    }

    tracks.forEach((t) => (t.enabled = isMicOn));

    if (!sessionId) return;
    if (!isMicOn) stopListening();
    else startListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicOn, sessionId]);

  function startListening() {
    if (!media.micReady) return;
    if (!media.speechSupported || !srRef.current) return;
    if (aiSpeaking) return;

    try {
      if (!media.listening) srRef.current.start();
    } catch {
      // ignore
    }
  }

  function stopListening() {
    try {
      srRef.current?.stop();
    } catch {
      // ignore
    }
    setMedia((p) => ({ ...p, listening: false, interim: "" }));
  }

  function speakAI(text: string) {
    if (!isSoundOn) {
      setAiSpeaking(false);
      return;
    }
    const clean = text.trim();
    if (!clean) {
      setAiSpeaking(false);
      return;
    }

    if (media.listening) {
      shouldResumeAfterTtsRef.current = true;
      stopListening();
    } else {
      shouldResumeAfterTtsRef.current = false;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }

    ttsCancelRef.current = false;

    const utter = new SpeechSynthesisUtterance(clean);
    utter.rate = 1;
    utter.pitch = 1;

    utter.onstart = () => setAiSpeaking(true);
    utter.onend = () => {
      if (!ttsCancelRef.current) setAiSpeaking(false);
      if (shouldResumeAfterTtsRef.current && isMicOn) {
        shouldResumeAfterTtsRef.current = false;
        setTimeout(() => startListening(), 250);
      }
    };
    utter.onerror = () => {
      setAiSpeaking(false);
      if (shouldResumeAfterTtsRef.current && isMicOn) {
        shouldResumeAfterTtsRef.current = false;
        setTimeout(() => startListening(), 250);
      }
    };

    try {
      window.speechSynthesis.speak(utter);
    } catch {
      setAiSpeaking(false);
      if (shouldResumeAfterTtsRef.current && isMicOn) {
        shouldResumeAfterTtsRef.current = false;
        setTimeout(() => startListening(), 250);
      }
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError("Missing auth token. Please login again.");
        return;
      }

      setFetchingNext(true);

      try {
        const res = await fetch(`${API_BASE}/api/ai/interview/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          credentials: "include",
          body: JSON.stringify({ jobTitle, company, totalQuestions: 12 }),
        });

        const dataUnknown: unknown = await res.json().catch(() => ({}));
        const data = dataUnknown as Partial<StartInterviewResponse> & Partial<ApiError>;

        if (!res.ok) throw new Error(data.message || `${res.status} ${res.statusText}`);
        if (cancelled) return;

        setSessionId(String(data.sessionId));
        setTotalQuestions(data.totalQuestions ?? 12);
        setCurrentQuestion(data.questionNumber ?? 1);

        const aiText = String(data.aiMessage || "").trim();

        setTranscript([{ id: idRef.current++, role: "ai", content: aiText, timestamp: ts() }]);

        if (isMicOn) setTimeout(() => startListening(), 300);

        speakAI(aiText);
      } catch (e: unknown) {
        if (!cancelled) setError(getErrorMessage(e) || "Failed to start interview");
      } finally {
        if (!cancelled) setFetchingNext(false);
      }
    }

    start();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobTitle, company]);

  async function sendAnswer() {
    if (!sessionId) return;

    const token = getAuthToken();
    if (!token) {
      setError("Missing auth token. Please login again.");
      return;
    }

    const text = answer.trim();
    if (!text) return;

    setError(null);

    setTranscript((prev) => [
      ...prev,
      { id: idRef.current++, role: "candidate", content: text, timestamp: ts() },
    ]);
    setAnswer("");
    setMedia((p) => ({ ...p, interim: "" }));

    stopListening();

    setFetchingNext(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/interview/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        credentials: "include",
        body: JSON.stringify({ sessionId, answer: text }),
      });

      const dataUnknown: unknown = await res.json().catch(() => ({}));
      const data = dataUnknown as Partial<NextInterviewResponse> & Partial<ApiError>;

      if (!res.ok) throw new Error(data.message || `${res.status} ${res.statusText}`);

      if (data.done) {
        onComplete();
        return;
      }

      const aiText = String(data.aiMessage || "").trim();
      if (aiText) {
        setTranscript((prev) => [
          ...prev,
          { id: idRef.current++, role: "ai", content: aiText, timestamp: ts() },
        ]);
        speakAI(aiText);
      } else {
        if (isMicOn) setTimeout(() => startListening(), 200);
      }

      setCurrentQuestion(data.questionNumber ?? currentQuestion + 1);
      setTotalQuestions(data.totalQuestions ?? totalQuestions);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Failed to get next question");
      if (isMicOn) setTimeout(() => startListening(), 200);
    } finally {
      setFetchingNext(false);
    }
  }

  async function endInterview() {
    let analysisData = undefined;
    try {
      if (sessionId) {
        const res = await fetch(`${API_BASE}/api/ai/interview/end`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          credentials: "include",
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data && data.analysis) {
          analysisData = data.analysis;
        }
      }
    } catch {
      // ignore
    } finally {
      try {
        ttsCancelRef.current = true;
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      stopListening();
      onComplete(analysisData);
    }
  }

  function toggleListening() {
    if (!media.micReady) {
      setMedia((p) => ({ ...p, speechError: "Microphone not ready." }));
      return;
    }
    if (!media.speechSupported || !srRef.current) {
      setMedia((p) => ({ ...p, speechError: "Speech recognition not supported (use Chrome/Edge)." }));
      return;
    }
    if (!isMicOn) {
      setMedia((p) => ({ ...p, speechError: "Microphone is muted." }));
      return;
    }
    if (!sessionId) {
      setMedia((p) => ({ ...p, speechError: "Interview not started yet." }));
      return;
    }
    if (aiSpeaking || fetchingNext) return;

    if (media.listening) stopListening();
    else startListening();
  }

  const isStackedLayout = viewportWidth < BREAKPOINT_LG;
  const isSingleVideoColumn = viewportWidth < BREAKPOINT_MD;
  const isCompact = viewportWidth < BREAKPOINT_SM;

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
    justifyContent: "space-between",
    flexDirection: isStackedLayout ? "column" : "row",
    rowGap: isStackedLayout ? 8 : 0,
    columnGap: 24,
  };

  const topBarLeftStyle: React.CSSProperties = { display: "flex", alignItems: "center", columnGap: 16 };

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

  const jobTitleBlockStyle: React.CSSProperties = { display: "flex", flexDirection: "column", rowGap: 2 };
  const jobTitleTextStyle: React.CSSProperties = { fontWeight: 600, fontSize: 16 };
  const jobCompanyStyle: React.CSSProperties = { color: "#9CA3AF", fontSize: 14 };

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

  const recordingDotStyle: React.CSSProperties = { width: 8, height: 8, borderRadius: "999px", backgroundColor: "#22C55E" };

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
    backgroundImage: "linear-gradient(135deg, rgba(129,140,248,0.35), rgba(59,130,246,0.25))",
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
    backgroundImage: "linear-gradient(135deg, rgba(59,130,246,0.35), rgba(168,85,247,0.35))",
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
    flexDirection: "column",
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

  const progressHeaderLeftStyle: React.CSSProperties = { display: "flex", alignItems: "center", columnGap: 8 };
  const progressPercentStyle: React.CSSProperties = { color: "#9CA3AF", fontSize: 14 };

  const progressBarStyle: React.CSSProperties = {
    height: 12,
    borderRadius: 999,
    marginTop: 8,
    marginBottom: 12,
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

  const rightHeaderStyle: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" };
  const rightHeaderInnerStyle: React.CSSProperties = { display: "flex", alignItems: "center", columnGap: 8, color: "#FFFFFF" };

  const transcriptScrollStyle: React.CSSProperties = { flex: 1, padding: isCompact ? 12 : 16 };
  const transcriptListStyle: React.CSSProperties = { display: "flex", flexDirection: "column", rowGap: 12 };
  const messageRowStyle: React.CSSProperties = { display: "flex", columnGap: 8, alignItems: "flex-start" };

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

  const avatarAIStyle: React.CSSProperties = { ...avatarCircleBaseStyle, backgroundImage: "linear-gradient(135deg, #A855F7, #3B82F6)" };
  const avatarYouStyle: React.CSSProperties = { ...avatarCircleBaseStyle, backgroundImage: "linear-gradient(135deg, #22C55E, #10B981)" };

  const messageTimestampStyle: React.CSSProperties = { marginBottom: 4, color: "#9CA3AF", fontSize: 12 };

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

  const tipsRowStyle: React.CSSProperties = { display: "flex", alignItems: "flex-start", columnGap: 8 };
  const tipsTitleStyle: React.CSSProperties = { color: "#BFDBFE", fontSize: 14, fontWeight: 500, marginBottom: 2 };
  const tipsTextStyle: React.CSSProperties = { color: "rgba(191,219,254,0.75)", fontSize: 12 };

  const inputWrapStyle: React.CSSProperties = { display: "flex", columnGap: 8, marginTop: 12 };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: "#111827",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "10px 12px",
    color: "#F9FAFB",
    outline: "none",
  };

  const isBusy = fetchingNext || aiSpeaking;

  return (
    <div style={rootStyle}>
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
              <span>{formatTime(elapsedSec)}</span>
            </div>
            <Badge style={recordingBadgeStyle}>
              <span style={recordingDotStyle} />
              Recording
            </Badge>
          </div>
        </div>
      </div>

      <div style={mainStyle}>
        <div style={leftPaneStyle}>
          <div style={videoGridStyle}>
            <Card style={aiCardStyle}>
              <div style={aiCardInnerStyle}>
                {aiSpeaking && <div style={aiSpeakingOverlayStyle} />}
                <div style={aiAvatarStyle}>
                  <Bot24Regular style={{ width: 40, height: 40 }} />
                </div>
              </div>
              <Badge style={aiBadgeStyle}>AI Interviewer</Badge>
            </Card>

            <Card style={candidateCardStyle}>
              <div style={candidatePlaceholderStyle}>
                <VideoOff20Regular style={{ width: 48, height: 48, color: "#4B5563", marginBottom: 8 }} />
                <div style={{ color: "#9CA3AF", fontSize: 14 }}>Camera Disabled</div>
              </div>
              <Badge style={candidateBadgeStyle}>You</Badge>
            </Card>
          </div>

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
          </Card>

          {!media.micReady && (
            <div style={{ color: "#FCA5A5", fontSize: 13 }}>
              Microphone not ready. {media.micError ? `(${media.micError})` : ""}
            </div>
          )}

          {media.speechError && (
            <div style={{ color: "#FCA5A5", fontSize: 13 }}>
              Voice input: {media.speechError}
            </div>
          )}

          {media.listening && media.interim && (
            <div style={{ color: "#BFDBFE", fontSize: 13 }}>Listening: {media.interim}</div>
          )}

          {error && <div style={{ color: "#FCA5A5", fontSize: 13 }}>{error}</div>}

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
              disabled={!media.micReady}
            >
              {isMicOn ? <Mic20Regular /> : <MicOff20Regular />}
            </Button>

            <Button
              onClick={toggleListening}
              style={{
                ...roundControlButtonStyle,
                backgroundColor: media.listening ? "#22C55E" : "#374151",
                borderColor: "transparent",
              }}
              variant="outline"
              size="icon"
              disabled={!media.micReady || !media.speechSupported || !isMicOn || isBusy || !sessionId}
            >
              {media.listening ? <Mic20Regular /> : <MicOff20Regular />}
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

            <Button onClick={endInterview} variant="outline" style={endButtonStyle}>
              End Interview
            </Button>
          </div>

          <div style={inputWrapStyle}>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={
                aiSpeaking
                  ? "AI is speaking…"
                  : fetchingNext
                  ? "Loading next question…"
                  : media.listening
                  ? "Listening…"
                  : "Type your answer…"
              }
              style={inputStyle}
              disabled={!sessionId || aiSpeaking || fetchingNext}
              onKeyDown={(e) => {
                if (e.key === "Enter") void sendAnswer();
              }}
            />
            <Button onClick={() => void sendAnswer()} disabled={!sessionId || isBusy || !answer.trim()}>
              <Send20Regular />
            </Button>
          </div>
        </div>

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
                  display: "flex",
                  columnGap: 8,
                  alignItems: "flex-start",
                  flexDirection: isAI ? "row" : "row-reverse",
                };
                const bodyStyle: React.CSSProperties = { flex: 1, textAlign: isAI ? "left" : "right" };

                return (
                  <div key={message.id} style={rowStyle}>
                    <div style={isAI ? avatarAIStyle : avatarYouStyle}>{isAI ? "AI" : "You"}</div>
                    <div style={bodyStyle}>
                      <div style={messageTimestampStyle}>{message.timestamp}</div>
                      <div style={isAI ? messageBubbleAIStyle : messageBubbleYouStyle}>{message.content}</div>
                    </div>
                  </div>
                );
              })}

              {fetchingNext && (
                <div style={messageRowStyle}>
                  <div style={avatarAIStyle}>AI</div>
                  <div style={{ flex: 1 }}>
                    <div style={messageBubbleAIStyle}>Thinking…</div>
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
                  Voice input uses Web Speech API (Chrome/Edge). Mic permission only (no camera).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

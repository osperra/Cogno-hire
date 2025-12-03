import {
  makeStyles,
  mergeClasses,
  shorthands,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowRight16Regular,
  Sparkle16Regular,
  Flash16Regular,
  Target20Regular,
  DataBarVertical16Regular,
  Clock16Regular,
  Shield16Regular,
  PeopleCommunity16Regular,
  Star16Filled,
  TextQuoteRegular,
} from "@fluentui/react-icons";

import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenDesignSystem: () => void;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
    backgroundColor: "#FFF8F8",
  },

  topNav: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    backgroundColor: "#FFFFFF",
    ...shorthands.padding("12px", "32px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 0 rgba(15,23,42,0.06)",
  },
  topNavInner: {
    width: "100%",
    maxWidth: "1120px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
  },
  logoBadge: {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    backgroundColor: "#0040FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontWeight: 700,
    boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
    fontSize: "0.9rem",
  },
  logoText: {
    fontWeight: 600,
    fontSize: "1.1rem",
    color: "#0B1220",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    columnGap: "24px",
  },
  navLink: {
    fontSize: "0.95rem",
    color: "#0040FF",
    cursor: "pointer",
    textDecoration: "none",
    border: "none",
    backgroundColor: "transparent",
    padding: 0,
    ":hover": {
      backgroundColor: "#a1b7f8ff",
    },
  },
  navButton: {
    backgroundColor: "#0040FF",
    color: "#FFFFFF",
    ...shorthands.padding("8px", "20px"),
    borderRadius: "9999px",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37,99,235,0.45)",
    transform: "translateY(0)",
    transitionProperty: "transform, box-shadow, background-color",
    transitionDuration: tokens.durationFast,
    border: "none",
    ":hover": {
      backgroundColor: "#0033D1",
      boxShadow: "0 14px 35px rgba(37,99,235,0.55)",
      transform: "translateY(-1px)",
    },
  },

  section: {
    position: "relative",
  },
  sectionLight: {
    backgroundColor: "#FFFFFF",
  },
  sectionSoft: {
    backgroundColor: "#FFF8F8",
  },
  container: {
    maxWidth: "1120px",
    marginLeft: "auto",
    marginRight: "auto",
    ...shorthands.padding("96px", "24px"),
  },
  textCenter: {
    textAlign: "center",
  },

  heroSection: {
    position: "relative",
    overflow: "hidden",
  },
  heroGradientOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(to bottom right, #eff6ff, #f5f3ff, transparent)",
    opacity: 0.6,
    pointerEvents: "none",
  },
  heroCircle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "600px",
    height: "600px",
    borderRadius: "9999px",
    backgroundImage: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
    opacity: 0.05,
    filter: "blur(48px)",
    pointerEvents: "none",
  },
  heroInner: {
    position: "relative",
    maxWidth: "960px",
    margin: "0 auto",
    textAlign: "center",
  },
  heroBadge: {
    marginBottom: "24px",
    backgroundImage: "linear-gradient(to right, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    ...shorthands.padding("8px", "16px"),
    borderRadius: tokens.borderRadiusMedium,
    display: "inline-flex",
    alignItems: "center",
    columnGap: "8px",
  },
  heroTitle: {
    color: "#0B1220",
    marginBottom: "24px",
    fontSize: "3.5rem",
    lineHeight: "4rem",
    fontWeight: 600,
  },
  heroTitleGradient: {
    backgroundImage: "linear-gradient(to right, #0118D8, #1B56FD)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
  heroSubtitle: {
    color: "#5B6475",
    marginBottom: "32px",
    maxWidth: "640px",
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "1.25rem",
    lineHeight: "1.875rem",
  },
  heroButtonsRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    columnGap: "16px",
    rowGap: "12px",
    flexWrap: "wrap",
    marginBottom: "48px",
  },
  heroPrimaryButton: {
    fontSize: "1.125rem",
    fontWeight: 600,
    ...shorthands.padding("12px", "32px"),
    borderRadius: "8px",
    border:"none",
    backgroundImage: "linear-gradient(to right, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    boxShadow: "0 10px 30px rgba(1, 24, 216, 0.35)",
    transform: "translateY(0)",
    transitionProperty: "transform, box-shadow, background-image",
    transitionDuration: tokens.durationFast,
    cursor: "pointer",
    ":hover": {
      boxShadow: "0 14px 40px rgba(1, 24, 216, 0.45)",
      transform: "translateY(-1px) scale(1.02)",
      backgroundImage: "linear-gradient(to right, #0110c5, #1B56FD)",
    },
  },
  heroSecondaryButton: {
    fontSize: "1rem",
    fontWeight: 500,
    ...shorthands.padding("12px", "32px"),
    borderRadius: "8px",
    backgroundColor: "#FFFFFF",
    color: "#0118D8",
    cursor: "pointer",
    transitionProperty: "background-color, box-shadow",
    transitionDuration: tokens.durationFast,
    boxShadow: "0 0 0 rgba(0,0,0,0.02)",
    ":hover": {
      backgroundColor: "#eff6ff",
      boxShadow: "0 4px 18px rgba(15,23,42,0.15)",
    },
  },
  heroStatsRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    columnGap: "32px",
    rowGap: "16px",
    flexWrap: "wrap",
  },
  heroStatItem: {
    textAlign: "center",
  },
  heroStatValue: {
    color: "#0118D8",
    fontSize: "2rem",
    fontWeight: 600,
  },
  heroStatLabel: {
    color: "#5B6475",
    marginTop: "4px",
  },
  heroDivider: {
    width: "1px",
    height: "48px",
    backgroundColor: "rgba(2, 6, 23, 0.08)",
  },

  sectionHeaderTitle: {
    color: "#0B1220",
    marginBottom: "8px",
    fontSize: "2rem",
    fontWeight: 600,
  },
  sectionHeaderSubtitle: {
    color: "#5B6475",
    maxWidth: "640px",
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "1.125rem",
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: "24px",
    columnGap: "24px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  featureCard: {
    ...shorthands.padding("32px"),
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
    transitionProperty: "box-shadow, transform",
    transitionDuration: "200ms",
    position: "relative",
    cursor: "pointer",

    ":hover": {
      boxShadow:
        "0 6px 18px rgba(15,23,42,0.14), 0 20px 40px rgba(15,23,42,0.10)",
      transform: "translateY(-2px)",
    },

    ":hover .featureIcon": {
      transform: "rotate(6deg) scale(1.07)",
    },
  },

  featureIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    transition: "transform 250ms cubic-bezier(0.22, 0.61, 0.36, 1)",

    transform: "rotate(0deg)",

    ":hover": {
      transform: "rotate(6deg) scale(1.07)",
    },
  },

  featureTitle: {
    color: "#0B1220",
    marginBottom: "8px",
    fontSize: "1.125rem",
    fontWeight: 600,
  },
  featureDescription: {
    color: "#5B6475",
  },
  featureIconBlue: {
    backgroundImage: "linear-gradient(to bottom right, #3b82f6, #6366f1)",
  },
  featureIconPurple: {
    backgroundImage: "linear-gradient(to bottom right, #8b5cf6, #ec4899)",
  },
  featureIconGreen: {
    backgroundImage: "linear-gradient(to bottom right, #22c55e, #10b981)",
  },
  featureIconOrange: {
    backgroundImage: "linear-gradient(to bottom right, #fb923c, #ef4444)",
  },
  featureIconCyan: {
    backgroundImage: "linear-gradient(to bottom right, #06b6d4, #3b82f6)",
  },
  featureIconViolet: {
    backgroundImage: "linear-gradient(to bottom right, #8b5cf6, #7c3aed)",
  },

  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: "24px",
    columnGap: "24px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    },
  },
  stepItem: {
    position: "relative",
  },
  stepCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "9999px",
    backgroundImage: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "16px",
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  stepTitle: {
    color: "#0B1220",
    marginBottom: "8px",
    fontWeight: 600,
  },
  stepDescription: {
    color: "#5B6475",
  },
  stepConnector: {
    position: "absolute",
    top: "32px",
    left: "60%",
    width: "80%",
    height: "2px",
    backgroundImage: "linear-gradient(to right, #0118D8, transparent)",
    display: "none",
    "@media (min-width: 768px)": {
      display: "block",
    },
  },

  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: "24px",
    columnGap: "24px",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  testimonialCard: {
    ...shorthands.padding("32px"),
    borderRadius: tokens.borderRadiusLarge,
    position: "relative",
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
  },
  testimonialQuoteIcon: {
    position: "absolute",
    top: "32px",
    right: "32px",
    width: "48px",
    height: "48px",
    color: "#E9DFC3",
    opacity: 0.5,
  },
  testimonialStars: {
    display: "flex",
    columnGap: "4px",
    marginBottom: "16px",
  },
  testimonialText: {
    color: "#0B1220",
    marginBottom: "24px",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
  },
  testimonialUserRow: {
    display: "flex",
    alignItems: "center",
    columnGap: "12px",
  },
  testimonialAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "9999px",
    backgroundImage: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
  },
  testimonialUserName: {
    color: "#0B1220",
    fontWeight: 500,
  },
  testimonialUserRole: {
    color: "#5B6475",
    fontSize: "0.875rem",
  },

  ctaSection: {
    position: "relative",
    overflow: "hidden",
    backgroundImage: "linear-gradient(to bottom right, #0118D8, #1B56FD)",
  },
  ctaPatternOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydjItMnptLTItMmgyLTJ6bTAtMmgyLTJ6bS0yLTJoMi0yem0wLTJoMi0yem0tMi0yaDItMnptMC0yaDItMnoiLz48L2c+PC9nPjwvc3ZnPg==")',
    opacity: 0.3,
    pointerEvents: "none",
  },
  ctaInner: {
    position: "relative",
    maxWidth: "768px",
    margin: "0 auto",
    ...shorthands.padding("96px", "24px"),
    textAlign: "center",
  },
  ctaTitle: {
    color: "#FFFFFF",
    marginBottom: "24px",
    fontSize: "3rem",
    lineHeight: "3.5rem",
    fontWeight: 600,
  },
  ctaSubtitle: {
    color: "rgba(255,255,255,0.9)",
    marginBottom: "32px",
    maxWidth: "640px",
    marginLeft: "auto",
    marginRight: "auto",
    fontSize: "1.25rem",
    lineHeight: "1.875rem",
  },
  ctaButtonsRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    columnGap: "16px",
    rowGap: "12px",
    flexWrap: "wrap",
  },
  ctaPrimaryButton: {
    backgroundColor: "#FFFFFF",
    color: "#0118D8",
    ...shorthands.padding("12px", "32px"),
    borderRadius: "8px",
    boxShadow: "0 10px 30px rgba(15,23,42,0.35)",
    fontSize: "1.125rem",
    fontWeight: 600,
    border:"none",
    cursor: "pointer",
    transform: "translateY(0)",
    transitionProperty: "transform, box-shadow",
    transitionDuration: tokens.durationFast,
    ":hover": {
      boxShadow: "0 14px 40px rgba(15,23,42,0.45)",
      transform: "translateY(-1px) scale(1.02)",
    },
  },
  ctaSecondaryButton: {
    backgroundColor: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    ...shorthands.padding("12px", "32px"),
    borderRadius: "8px",
    fontWeight: 500,
    border:"#FFFF",
    cursor: "pointer",
    transitionProperty: "background-color, box-shadow",
    transitionDuration: tokens.durationFast,
    boxShadow: "0 0 0 rgba(0,0,0,0.15)",
    ":hover": {
      backgroundColor: "rgba(255,255,255,0.22)",
      boxShadow: "0 6px 20px rgba(15,23,42,0.35)",
    },
  },
  ctaNote: {
    color: "rgba(255,255,255,0.7)",
    marginTop: "24px",
  },
});

export function LandingPage({
  onGetStarted,
  onOpenDesignSystem,
}: LandingPageProps) {
  const styles = useStyles();

  const features = [
    {
      icon: Flash16Regular,
      title: "AI-Powered Interviews",
      description:
        "Intelligent conversations that adapt to candidate responses in real-time",
      colorClass: styles.featureIconBlue,
    },
    {
      icon: DataBarVertical16Regular,
      title: "Deep Analytics",
      description:
        "Comprehensive insights and scoring to make informed hiring decisions",
      colorClass: styles.featureIconPurple,
    },
    {
      icon: Target20Regular,
      title: "Custom Interviews",
      description:
        "Tailor questions and difficulty levels to match your specific needs",
      colorClass: styles.featureIconGreen,
    },
    {
      icon: Clock16Regular,
      title: "Save Time",
      description:
        "Automate initial screening and focus on top candidates only",
      colorClass: styles.featureIconOrange,
    },
    {
      icon: Shield16Regular,
      title: "Unbiased Evaluation",
      description:
        "Fair, consistent assessment of all candidates without human bias",
      colorClass: styles.featureIconCyan,
    },
    {
      icon: PeopleCommunity16Regular,
      title: "Scalable Solution",
      description:
        "Handle hundreds of interviews simultaneously without quality loss",
      colorClass: styles.featureIconViolet,
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Job",
      description:
        "Set up your position with requirements and interview preferences",
    },
    {
      step: "02",
      title: "AI Interview",
      description: "Candidates take intelligent, conversational interviews",
    },
    {
      step: "03",
      title: "Get Insights",
      description: "Review detailed analytics and candidate scores",
    },
    {
      step: "04",
      title: "Make Decision",
      description: "Hire the best talent with confidence",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Engineering, TechCorp",
      quote:
        "Cogno transformed our hiring process. We've reduced time-to-hire by 60% while improving candidate quality.",
      rating: 5,
    },
    {
      name: "Mike Rodriguez",
      role: "Head of Talent, StartupHub",
      quote:
        "The AI interviews are incredibly natural. Candidates love the experience, and we get deep insights we never had before.",
      rating: 5,
    },
    {
      name: "Jennifer Park",
      role: "HR Director, Innovation Labs",
      quote:
        "Finally, a solution that scales with our growth. We've interviewed 500+ candidates without adding headcount.",
      rating: 5,
    },
  ];

  return (
    <div className={styles.root}>
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          <div className={styles.logoContainer}>
            <div className={styles.logoBadge}>C</div>
            <span className={styles.logoText}>Cogno</span>
          </div>
          <div className={styles.navRight}>
            <button className={styles.navLink} onClick={onOpenDesignSystem}>
              Design System
            </button>
            <button className={styles.navButton} onClick={onGetStarted}>
              Sign In
            </button>
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroGradientOverlay} />
        <div className={styles.heroCircle} />

        <div className={styles.container}>
          <div className={styles.heroInner}>
            <Badge className={styles.heroBadge}>
              <Sparkle16Regular />
              <span>AI-Powered Interview Platform</span>
            </Badge>

            <h1 className={styles.heroTitle}>
              Revolutionize Your
              <br />
              <span className={styles.heroTitleGradient}>Hiring Process</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Cogno uses advanced AI to conduct intelligent interviews, saving
              you time while ensuring the highest quality candidate evaluation.
            </p>

            <div className={styles.heroButtonsRow}>
              <button
                onClick={onGetStarted}
                className={styles.heroPrimaryButton}
              >
                Get Started Free
                <ArrowRight16Regular
                  style={{ marginLeft: 8, verticalAlign: "middle" }}
                />
              </button>
              <button className={styles.heroSecondaryButton}>Watch Demo</button>
            </div>

            <div className={styles.heroStatsRow}>
              <div className={styles.heroStatItem}>
                <div className={styles.heroStatValue}>98%</div>
                <p className={styles.heroStatLabel}>Interview Quality</p>
              </div>
              <div className={styles.heroDivider} />
              <div className={styles.heroStatItem}>
                <div className={styles.heroStatValue}>75%</div>
                <p className={styles.heroStatLabel}>Time Saved</p>
              </div>
              <div className={styles.heroDivider} />
              <div className={styles.heroStatItem}>
                <div className={styles.heroStatValue}>60%</div>
                <p className={styles.heroStatLabel}>Cost Reduction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={mergeClasses(styles.section, styles.sectionLight)}>
        <div className={styles.container}>
          <div className={styles.textCenter}>
            <h2 className={styles.sectionHeaderTitle}>Why Choose Cogno?</h2>
            <p className={styles.sectionHeaderSubtitle}>
              Everything you need to streamline your hiring process and find the
              perfect candidates
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className={styles.featureCard}>
                  <div
                    className={mergeClasses(
                      "featureIcon",
                      styles.featureIcon,
                      feature.colorClass
                    )}
                  >
                    <Icon style={{ fontSize: 24, color: "#FFFFFF" }} />
                  </div>

                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className={mergeClasses(styles.section, styles.sectionSoft)}>
        <div className={styles.container}>
          <div className={styles.textCenter}>
            <h2 className={styles.sectionHeaderTitle}>How It Works</h2>
            <p className={styles.sectionHeaderSubtitle}>
              Get started in minutes with our simple, intuitive process
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((item, index) => (
              <div key={index} className={styles.stepItem}>
                <div className={styles.textCenter}>
                  <div className={styles.stepCircle}>{item.step}</div>
                  <h4 className={styles.stepTitle}>{item.title}</h4>
                  <p className={styles.stepDescription}>{item.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={styles.stepConnector} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={mergeClasses(styles.section, styles.sectionLight)}>
        <div className={styles.container}>
          <div className={styles.textCenter}>
            <h2 className={styles.sectionHeaderTitle}>
              Trusted by Leading Companies
            </h2>
            <p className={styles.sectionHeaderSubtitle}>
              See what our customers have to say about their experience
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <Card key={index} className={styles.testimonialCard}>
                <TextQuoteRegular className={styles.testimonialQuoteIcon} />
                <div>
                  <div className={styles.testimonialStars}>
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star16Filled
                        key={i}
                        style={{ color: "#F59E0B", fontSize: 20 }}
                      />
                    ))}
                  </div>
                  <p className={styles.testimonialText}>
                    “{testimonial.quote}”
                  </p>
                  <div className={styles.testimonialUserRow}>
                    <div className={styles.testimonialAvatar}>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className={styles.testimonialUserName}>
                        {testimonial.name}
                      </div>
                      <div className={styles.testimonialUserRole}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaPatternOverlay} />
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to Transform Your Hiring?</h2>
          <p className={styles.ctaSubtitle}>
            Join thousands of companies using Cogno to find exceptional talent
            faster and more efficiently.
          </p>
          <div className={styles.ctaButtonsRow}>
            <button onClick={onGetStarted} className={styles.ctaPrimaryButton}>
              Get Started Free
            </button>
            <button className={styles.ctaSecondaryButton}>Book a Demo</button>
          </div>
          <p className={styles.ctaNote}>
            No credit card required • Free 14-day trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}

"use client";

import * as React from "react";
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react";
import {
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowLeft16Regular,
  ArrowRight16Regular,
} from "@fluentui/react-icons";

import { Button } from "./button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const useCarouselStyles = makeStyles({
  root: {
    position: "relative",
    width: "100%",
  },
  viewport: {
    overflow: "hidden",
    width: "100%",
  },
  container: {
    display: "flex",
    willChange: "transform",
  },
  containerHorizontal: {
    flexDirection: "row",
  },
  containerVertical: {
    flexDirection: "column",
  },
  slide: {
    minWidth: 0,
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: "100%",
  },
  slideHorizontal: {
    paddingLeft: tokens.spacingHorizontalM,
  },
  slideVertical: {
    paddingTop: tokens.spacingVerticalM,
  },
  prevNextBase: {
    position: "absolute",
    width: "32px",
    height: "32px",
    borderRadius: "9999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  prevHorizontal: {
    top: "50%",
    left: "-48px",
    transform: "translateY(-50%)",
  },
  prevVertical: {
    top: "-48px",
    left: "50%",
    transform: "translateX(-50%) rotate(90deg)",
  },
  nextHorizontal: {
    top: "50%",
    right: "-48px",
    transform: "translateY(-50%)",
  },
  nextVertical: {
    bottom: "-48px",
    left: "50%",
    transform: "translateX(-50%) rotate(90deg)",
  },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
});

function mergeClassNames(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const CarouselContext = React.createContext<CarouselContextProps | null>(
  null,
);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const styles = useCarouselStyles();

  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins,
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((apiInstance: CarouselApi) => {
    if (!apiInstance) return;
    setCanScrollPrev(apiInstance.canScrollPrev());
    setCanScrollNext(apiInstance.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  React.useEffect(() => {
    if (!api || !setApi) return;
    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={mergeClassNames(styles.root, className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const styles = useCarouselStyles();
  const { carouselRef, orientation } = useCarousel();

  return (
    <div
      ref={carouselRef}
      className={styles.viewport}
      data-slot="carousel-content"
    >
      <div
        className={mergeClassNames(
          styles.container,
          orientation === "horizontal"
            ? styles.containerHorizontal
            : styles.containerVertical,
          className,
        )}
        {...props}
      />
    </div>
  );
}

function CarouselItem({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const styles = useCarouselStyles();
  const { orientation } = useCarousel();

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={mergeClassNames(
        styles.slide,
        orientation === "horizontal"
          ? styles.slideHorizontal
          : styles.slideVertical,
        className,
      )}
      {...props}
    />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const styles = useCarouselStyles();
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  const composedClassName = mergeClassNames(
    styles.prevNextBase,
    orientation === "horizontal"
      ? styles.prevHorizontal
      : styles.prevVertical,
    className,
  );

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={composedClassName}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft16Regular />
      <span className={styles.srOnly}>Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const styles = useCarouselStyles();
  const { orientation, scrollNext, canScrollNext } = useCarousel();

  const composedClassName = mergeClassNames(
    styles.prevNextBase,
    orientation === "horizontal"
      ? styles.nextHorizontal
      : styles.nextVertical,
    className,
  );

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={composedClassName}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight16Regular />
      <span className={styles.srOnly}>Next slide</span>
    </Button>
  );
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = React.useState<boolean>(() => {
        if (typeof window === "undefined") {
            return false;
        }
        return window.innerWidth < MOBILE_BREAKPOINT;
    });

    React.useEffect(() => {
        if (typeof window === "undefined") return;

        const query = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
        const mql = window.matchMedia(query);

        const update = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };

        update();

        mql.addEventListener?.("change", update);
        (mql).addListener?.(update);

        return () => {
            mql.removeEventListener?.("change", update);

            (mql).removeListener?.(update);
        };
    }, []);

    return isMobile;
}

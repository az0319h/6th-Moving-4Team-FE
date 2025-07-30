import { useEffect } from "react";

export default function usePreventScroll(active: boolean = true) {
   useEffect(() => {
      if (!active) return;

      const originalOverflow = window.getComputedStyle(document.body).overflow;

      document.body.style.setProperty("overflow", "hidden", "important");

      return () => {
         document.body.style.setProperty("overflow", originalOverflow);
      };
   }, [active]);
}

// ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = ({ contentRef }) => {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetScroll = () => {
      if (contentRef?.current) {
        contentRef.current.scrollTop = 0;
        // console.log("ScrollToTop: contentRef scrollTop set to 0");
      }
    };

    resetScroll();
    const timer = setTimeout(resetScroll, 100);

    return () => clearTimeout(timer);
  }, [location, contentRef]);

  useEffect(() => {
    const handlePopState = () => {
      if (contentRef?.current) {
        contentRef.current.scrollTop = 0;
        console.log("ScrollToTop: popstate - contentRef scrollTop set to 0");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [contentRef]);

  return null;
};

export default ScrollToTop;
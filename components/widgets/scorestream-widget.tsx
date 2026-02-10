"use client";

import { useEffect, useRef } from "react";

interface ScoreStreamWidgetProps {
  widgetType?: string;
  userWidgetId?: string;
  className?: string;
}

export function ScoreStreamWidget({
  widgetType = "horzScoreboard",
  userWidgetId = "68041",
  className = "",
}: ScoreStreamWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple script loads
    if (scriptLoadedRef.current) return;

    const script = document.createElement("script");
    script.src = "https://scorestream.com/apiJsCdn/widgets/embed.js";
    script.async = true;
    script.type = "text/javascript";

    script.onload = () => {
      scriptLoadedRef.current = true;
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      className={`w-full h-[90px] bg-card border-b border-border overflow-hidden ${className}`}
    >
        <div
          ref={containerRef}
          className="scorestream-widget-container w-full h-full"
          data-ss_widget_type={widgetType}
          data-user-widget-id={userWidgetId}
        />
    </div>
  );
}

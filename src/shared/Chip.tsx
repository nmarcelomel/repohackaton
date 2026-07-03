interface ChipProps {
 children: React.ReactNode;
 variant?: "success" | "warning" | "error" | "info" | "neutral";
}

const COLORS: Record<string, { bg: string; text: string }> = {
 success: { bg: "#e9f6ec", text: "#1b7a34" },
 warning: { bg: "#fff9e5", text: "#8a6d00" },
 error: { bg: "#fbebec", text: "#c62828" },
 info: { bg: "#e5f2ff", text: "#0055b3" },
 neutral: { bg: "#f0f0f0", text: "#333" },
};

export function Chip({ children, variant = "neutral" }: ChipProps) {
 const color = COLORS[variant] || COLORS.neutral;
 return (
  <span style={{
   display: "inline-flex",
   alignItems: "center",
   gap: "4px",
   padding: "0.25rem 0.625rem",
   borderRadius: "4px",
   fontSize: "0.75rem",
   fontWeight: 600,
   backgroundColor: color.bg,
   color: color.text,
   lineHeight: 1.4,
   whiteSpace: "nowrap",
  }}>
   {children}
  </span>
 );
}

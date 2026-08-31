import React from "react";

const VARIANTS = {
  primary: "bg-navy-800 text-white hover:bg-navy-700 focus-visible:ring-navy-800",
  secondary: "bg-white text-navy-800 border border-slate-300 hover:bg-slate-50 focus-visible:ring-navy-800",
  success: "bg-pass-600 text-white hover:bg-pass-700 focus-visible:ring-pass-600",
  danger: "bg-fail-600 text-white hover:bg-fail-700 focus-visible:ring-fail-600",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
  warning: "bg-review-600 text-white hover:bg-review-700 focus-visible:ring-review-600",
};

const SIZES = {
  sm: "text-xs px-2.5 py-1.5 gap-1.5",
  md: "text-sm px-3.5 py-2 gap-2",
  lg: "text-sm px-5 py-2.5 gap-2",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  disabled = false,
  type = "button",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {Icon && <Icon size={size === "sm" ? 14 : 16} strokeWidth={2} />}
      {children}
    </button>
  );
}

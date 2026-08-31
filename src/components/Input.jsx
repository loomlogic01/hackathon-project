import React from "react";

export function Input({ label, hint, error, className = "", id, ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-md border px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400
          bg-white transition-colors focus-ring focus-visible:border-navy-700
          ${error ? "border-fail-500" : "border-slate-300"}`}
        {...rest}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-fail-600">{error}</p>}
    </div>
  );
}

export function Select({ label, hint, className = "", id, children, ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={id}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800
          transition-colors focus-ring focus-visible:border-navy-700"
        {...rest}
      >
        {children}
      </select>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export function Textarea({ label, className = "", id, ...rest }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800
          transition-colors focus-ring focus-visible:border-navy-700"
        {...rest}
      />
    </div>
  );
}

export function Checkbox({ label, checked, onChange, id }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-navy-800 focus-ring focus-visible:ring-navy-800"
      />
      {label}
    </label>
  );
}

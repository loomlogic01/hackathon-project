import React, { useRef, useState } from "react";
import { UploadCloud, FileText, CheckCircle2 } from "lucide-react";

export default function FileUpload({ label = "Upload document", accept = ".pdf,.jpg,.png", onFileSelect, hint }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files) {
    if (files && files[0]) {
      setFileName(files[0].name);
      onFileSelect?.(files[0]);
    }
  }

  return (
    <div>
      {label && <p className="block text-sm font-medium text-slate-700 mb-1.5">{label}</p>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-8 flex flex-col items-center justify-center text-center transition-colors
          ${dragging ? "border-navy-700 bg-navy-50/40" : "border-slate-300 bg-slate-50 hover:bg-slate-100"}`}
      >
        {fileName ? (
          <>
            <CheckCircle2 size={22} className="text-pass-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <FileText size={14} /> {fileName}
            </p>
            <p className="text-xs text-slate-500 mt-1">Click to replace file</p>
          </>
        ) : (
          <>
            <UploadCloud size={22} className="text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-600">
              Drag & drop a file, or <span className="text-navy-700 underline">browse</span>
            </p>
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

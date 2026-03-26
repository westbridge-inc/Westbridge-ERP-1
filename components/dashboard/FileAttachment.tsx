"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, FileText, Loader2, AlertCircle } from "lucide-react";
import { uploadFile, type UploadResult } from "@/lib/api/upload";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AttachedFile {
  file_url: string | null;
  file_name: string;
}

interface FileAttachmentProps {
  /** Doctype to attach files to */
  doctype?: string;
  /** Document name to attach files to */
  docname?: string;
  /** Whether uploaded files should be private (default: true) */
  isPrivate?: boolean;
  /** Initially attached files (e.g. from an existing document) */
  initialFiles?: AttachedFile[];
  /** Called when the list of attached files changes */
  onChange?: (files: AttachedFile[]) => void;
  /** Called when a file is successfully uploaded */
  onUpload?: (result: UploadResult) => void;
  /** Called when a file is removed from the list */
  onRemove?: (file: AttachedFile) => void;
  /** Maximum number of files allowed (default: 10) */
  maxFiles?: number;
  /** Accepted file types (default: common document/image types) */
  accept?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FileAttachment({
  doctype,
  docname,
  isPrivate = true,
  initialFiles = [],
  onChange,
  onUpload,
  onRemove,
  maxFiles = 10,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.json,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip",
}: FileAttachmentProps) {
  const [files, setFiles] = useState<AttachedFile[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateFiles = useCallback(
    (next: AttachedFile[]) => {
      setFiles(next);
      onChange?.(next);
    },
    [onChange],
  );

  // ── Upload handler ──────────────────────────────────────────────────────

  const handleUpload = useCallback(
    async (fileList: FileList | File[]) => {
      const filesToUpload = Array.from(fileList);
      if (filesToUpload.length === 0) return;

      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        setError(`Maximum of ${maxFiles} files allowed`);
        return;
      }

      const batch = filesToUpload.slice(0, remaining);
      setError(null);
      setUploading(true);
      setProgress(0);

      const newFiles: AttachedFile[] = [];

      for (let i = 0; i < batch.length; i++) {
        try {
          const result = await uploadFile({
            file: batch[i],
            doctype,
            docname,
            isPrivate,
            onProgress: (p) => {
              // Average progress across all files in the batch
              setProgress(((i + p) / batch.length) * 100);
            },
          });

          newFiles.push({ file_url: result.file_url, file_name: result.file_name });
          onUpload?.(result);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Upload failed";
          setError(`Failed to upload ${batch[i].name}: ${msg}`);
          break;
        }
      }

      if (newFiles.length > 0) {
        updateFiles([...files, ...newFiles]);
      }

      setUploading(false);
      setProgress(0);

      // Reset the file input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [doctype, docname, isPrivate, files, maxFiles, onUpload, updateFiles],
  );

  // ── Remove handler ────────────────────────────────────────────────────

  const handleRemove = useCallback(
    (index: number) => {
      const removed = files[index];
      const next = files.filter((_, i) => i !== index);
      updateFiles(next);
      if (removed) onRemove?.(removed);
    },
    [files, onRemove, updateFiles],
  );

  // ── Drag & drop handlers ──────────────────────────────────────────────

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files.length > 0) {
        void handleUpload(e.dataTransfer.files);
      }
    },
    [handleUpload],
  );

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragActive
            ? "border-primary bg-primary/5 text-primary"
            : "border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Uploading... {Math.round(progress)}%</span>
            <div className="mt-1 h-1.5 w-full max-w-[200px] overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6" />
            <span className="text-sm font-medium">
              {dragActive ? "Drop files here" : "Click or drag files to upload"}
            </span>
            <span className="text-xs text-muted-foreground">
              {files.length}/{maxFiles} files
            </span>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => {
            if (e.target.files) void handleUpload(e.target.files);
          }}
          className="hidden"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attached files list */}
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.file_name}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm"
            >
              <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate" title={f.file_name}>
                {f.file_name}
              </span>
              {f.file_url && (
                <a
                  href={f.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View
                </a>
              )}
              <button
                onClick={() => handleRemove(i)}
                className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Remove file"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

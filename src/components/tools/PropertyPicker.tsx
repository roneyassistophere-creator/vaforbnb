"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Choose, add, rename and delete properties. Shared by the tools that keep
 * data per property. Deleting asks for confirmation on the page itself.
 */
export function PropertyPicker({
  properties,
  activeId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  deleteText,
  label = "Property",
  placeholder = "For example: Flat 2, Leith",
  className,
}: {
  properties: { id: string; name: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  /** Confirmation text, e.g. “Delete “Flat 2” and its 4 bookings from this device?” */
  deleteText: string;
  label?: string;
  placeholder?: string;
  className?: string;
}) {
  const [mode, setMode] = useState<"none" | "add" | "rename" | "delete">("none");
  const [name, setName] = useState("");
  const active = properties.find((p) => p.id === activeId) ?? properties[0];
  const link = "min-h-11 cursor-pointer border-none bg-transparent p-0 text-sm font-bold underline underline-offset-2";

  return (
    <div className={cn("grid gap-2", className)}>
      <label className="grid gap-1.5 text-sm font-bold">
        {label}
        <select
          className="field min-h-12"
          value={active.id}
          onChange={(e) => {
            onSelect(e.target.value);
            setMode("none");
          }}
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      {mode === "none" && (
        <div className="flex flex-wrap gap-x-4">
          <button type="button" onClick={() => (setMode("add"), setName(""))} className={cn(link, "text-ink")}>
            Add another property
          </button>
          <button type="button" onClick={() => (setMode("rename"), setName(active.name))} className={cn(link, "text-ink")}>
            Rename
          </button>
          <button type="button" onClick={() => setMode("delete")} className={cn(link, "text-brand")}>
            Delete property
          </button>
        </div>
      )}

      {(mode === "add" || mode === "rename") && (
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "add") onAdd(name);
            else onRename(name);
            setMode("none");
            setName("");
          }}
        >
          <label className="grid min-w-[200px] flex-1 gap-1.5 text-sm font-bold">
            {mode === "add" ? "New property name" : "Property name"}
            <input autoFocus className="field min-h-11" value={name} maxLength={60} placeholder={placeholder} onChange={(e) => setName(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-ink min-h-11">
            Save
          </button>
          <button type="button" onClick={() => setMode("none")} className="btn btn-outline min-h-11">
            Cancel
          </button>
        </form>
      )}

      {mode === "delete" && (
        <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-coral p-3 text-sm font-bold" role="alert">
          <span className="flex-1">{deleteText}</span>
          <button
            type="button"
            onClick={() => {
              onDelete();
              setMode("none");
            }}
            className="btn btn-coral min-h-11"
          >
            Yes, delete
          </button>
          <button type="button" onClick={() => setMode("none")} className="btn btn-outline min-h-11">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

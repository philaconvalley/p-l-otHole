"use client";

import Link from "next/link";
import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { typeLabel } from "@/lib/format";

const STEPS = [
  { n: 1, label: "Photo" },
  { n: 2, label: "Pin" },
  { n: 3, label: "Name" },
  { n: 4, label: "Submit" },
];

const HAZARD_TYPES = ["Pothole", "Cave-in", "Depression", "Ditch/Trench", "Push-up", "Other"];

interface GpsCoords { lat: number; lng: number; locality?: string }

async function resizeToDataUrl(file: File, maxPx = 1200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export default function ReportPage() {
  const router = useRouter();
  const [activeStep] = useState(2);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [gps, setGps] = useState<GpsCoords | null>(null);
  const [dragging, setDragging] = useState(false);
  const [hazardType, setHazardType] = useState("Pothole");
  const [name, setName]           = useState("");
  const [notes, setNotes]         = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    // Show preview
    const url = URL.createObjectURL(file);
    setPreview(url);

    // Resize + encode for storage
    resizeToDataUrl(file).then(setImageDataUrl).catch(() => setImageDataUrl(null));

    // Extract GPS from EXIF
    try {
      const { default: exifr } = await import("exifr");
      const result = await exifr.gps(file);
      if (result?.latitude && result?.longitude) {
        setGps({ lat: result.latitude, lng: result.longitude });
      } else {
        setGps(null);
      }
    } catch {
      setGps(null);
    }
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  // API type mapping: UI label → schema enum
  const TYPE_MAP: Record<string, string> = {
    "Pothole": "pothole", "Cave-in": "sinkhole", "Depression": "sinkhole",
    "Ditch/Trench": "drainage", "Push-up": "crack", "Other": "debris",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Community name is required"); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/hazards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: notes.trim() || name.trim(),
          type: TYPE_MAP[hazardType] ?? "pothole",
          latitude:  gps?.lat  ?? 39.9526,
          longitude: gps?.lng  ?? -75.1652,
          images: imageDataUrl ? [imageDataUrl] : [],
          cityCode: "PHL",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        router.push(`/hazard/${json.data?.slug ?? ""}`);
      } else if (res.status === 401) {
        setError("Sign in to report a hazard");
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Failed to submit report");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-viewport-minus-nav bg-[#171717]" onSubmit={handleSubmit}>
      {/* Progress bar */}
      <div className="border-b border-[#2a2a2a] bg-[#171717]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                    ${step.n < activeStep  ? "bg-[#F99300] border-[#F99300] text-white" :
                      step.n === activeStep ? "bg-transparent border-[#F99300] text-[#F99300]" :
                                             "bg-transparent border-[#444] text-[#6b7280]"}`}>
                    {step.n < activeStep ? "✓" : step.n}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block
                    ${step.n === activeStep ? "text-[#F99300]" : step.n < activeStep ? "text-[#9ca3af]" : "text-[#4b5563]"}`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 mx-1 ${step.n < activeStep ? "bg-[#F99300]" : "bg-[#333]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Left column ── */}
          <div className="space-y-5">
            {/* Photo upload */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Photo <span className="text-[#F99300]">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onInputChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center
                            cursor-pointer transition-colors overflow-hidden
                            ${dragging
                              ? "border-[#F99300] bg-[#F99300]/5"
                              : preview
                                ? "border-[#444] p-0"
                                : "border-[#444] p-10 gap-3 bg-[#1e1e1e] hover:border-[#F99300]/50 hover:bg-[#222]"}`}
              >
                {preview ? (
                  <div className="relative w-full h-52">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="Upload preview" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity
                                    rounded-xl flex items-center justify-center">
                      <span className="text-sm text-white font-medium">Click to change</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <CameraIcon />
                    <div className="text-center">
                      <p className="text-[#f5f5f5] text-sm font-medium">Drag & drop or click to upload</p>
                      <p className="text-xs text-[#6b7280] mt-1">JPG, PNG — GPS EXIF preferred</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* GPS status */}
            {preview && (
              <div className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 border
                ${gps
                  ? "bg-[#1a2e1a] border-emerald-800/40"
                  : "bg-[#2a1a1a] border-red-900/40"}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${gps ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className={`text-xs font-medium ${gps ? "text-emerald-400" : "text-red-400"}`}>
                  {gps
                    ? `GPS extracted: ${gps.lat.toFixed(4)}°N, ${Math.abs(gps.lng).toFixed(4)}°W`
                    : "No GPS data in photo — pin location manually below"}
                </span>
              </div>
            )}

            {!preview && (
              <div className="flex items-center gap-2.5 bg-[#1a2e1a] border border-emerald-800/40 rounded-lg px-3 py-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-xs text-emerald-400 font-medium">
                  GPS will be extracted from photo EXIF automatically
                </span>
              </div>
            )}

            {/* Mini-map pin */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Map pin</label>
              <div className="relative w-full h-40 bg-[#1a1a1a] rounded-xl map-grid border border-[#333]
                              flex items-center justify-center cursor-crosshair overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                flex flex-col items-center gap-1">
                  <div className="bg-[#222] border border-[#444] rounded px-2 py-0.5 text-xs
                                  text-[#9ca3af] whitespace-nowrap">Drag to adjust</div>
                  <div className="w-3 h-3 rounded-full bg-[#F99300] ring-2 ring-[#F99300]/30" />
                </div>
              </div>
              <p className="text-xs text-[#6b7280] mt-1.5">
                {gps
                  ? `${gps.lat.toFixed(4)}°N, ${Math.abs(gps.lng).toFixed(4)}°W — from photo`
                  : "Pin location manually on the map"}
              </p>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Community name */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Community name <span className="text-[#F99300]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={`e.g. "The Abyss on 5th"`}
                className="w-full"
              />
              <p className="text-xs text-[#6b7280] mt-1.5">Give it a name the neighborhood will remember.</p>
            </div>

            {/* Hazard type */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Hazard type <span className="text-[#F99300]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {HAZARD_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setHazardType(type)}
                    className={`p-3 rounded-lg text-xs font-medium border text-center transition-colors
                      ${hazardType === type
                        ? "bg-[#F99300]/15 border-[#F99300] text-[#F99300]"
                        : "bg-[#222] border-[#333] text-[#9ca3af] hover:border-[#555]"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Notes</label>
              <textarea
                rows={4}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Estimated dimensions, safety risk, nearby landmarks..."
                className="w-full resize-none"
              />
            </div>

            {/* Tips */}
            <div className="bg-[#1e1e1e] border border-[#333] rounded-lg p-4 text-xs text-[#9ca3af] space-y-1.5">
              <p className="font-semibold text-[#f5f5f5] text-sm mb-2">Tips</p>
              <p>Take photo before dropping pin. GPS from photo EXIF will be validated against your pin.</p>
              <p>Community names stick — make it memorable.</p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#2a2a2a]">
          {error && (
            <p className="text-sm text-red-400 mr-auto">{error}</p>
          )}
          <Link href="/" className="px-6 py-2 text-sm font-medium text-[#9ca3af] hover:text-white border border-[#444] rounded-full transition-colors">
            Cancel
          </Link>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2 text-sm font-semibold text-white bg-[#F99300] rounded-full flex items-center gap-2 transition-colors
              ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-[#e07e00]"}`}
          >
            {submitting ? "Submitting…" : <>Submit report <span>→</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

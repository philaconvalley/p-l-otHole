import Link from "next/link";

const STEPS = [
  { n: 1, label: "Photo" },
  { n: 2, label: "Pin" },
  { n: 3, label: "Name" },
  { n: 4, label: "Submit" },
];

const HAZARD_TYPES = ["Pothole", "Cave-in", "Depression", "Ditch/Trench", "Push-up", "Other"];

export default function ReportPage() {
  const activeStep = 2;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717]">
      {/* Progress bar */}
      <div className="border-b border-[#2a2a2a] bg-[#171717]">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step.n} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2
                    ${step.n < activeStep  ? "bg-[#e5521e] border-[#e5521e] text-white" :
                      step.n === activeStep ? "bg-transparent border-[#e5521e] text-[#e5521e]" :
                                             "bg-transparent border-[#444] text-[#6b7280]"}`}>
                    {step.n < activeStep ? "✓" : step.n}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block
                    ${step.n === activeStep ? "text-[#e5521e]" : step.n < activeStep ? "text-[#9ca3af]" : "text-[#4b5563]"}`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-8 mx-1 ${step.n < activeStep ? "bg-[#e5521e]" : "bg-[#333]"}`} />
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
                Photo <span className="text-[#e5521e]">*</span>
              </label>
              <div className="border-2 border-dashed border-[#444] rounded-xl p-10 flex flex-col
                              items-center justify-center gap-3 bg-[#1e1e1e] cursor-pointer
                              hover:border-[#e5521e]/50 hover:bg-[#222] transition-colors">
                <CameraIcon />
                <div className="text-center">
                  <p className="text-[#f5f5f5] text-sm font-medium">Drag & drop or click to upload</p>
                  <p className="text-xs text-[#6b7280] mt-1">JPG, PNG — GPS EXIF required</p>
                </div>
              </div>
            </div>

            {/* GPS extracted */}
            <div className="flex items-center gap-2.5 bg-[#1a2e1a] border border-emerald-800/40 rounded-lg px-3 py-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-xs text-emerald-400 font-medium">
                GPS extracted: 39.9458°N, 75.1734°W — South Philadelphia
              </span>
            </div>

            {/* Mini-map pin */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">Map pin</label>
              <div className="relative w-full h-40 bg-[#1a1a1a] rounded-xl map-grid border border-[#333]
                              flex items-center justify-center cursor-crosshair overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                flex flex-col items-center gap-1">
                  <div className="bg-[#222] border border-[#444] rounded px-2 py-0.5 text-xs
                                  text-[#9ca3af] whitespace-nowrap">Drag to adjust</div>
                  <div className="w-3 h-3 rounded-full bg-[#e5521e] ring-2 ring-[#e5521e]/30" />
                </div>
              </div>
              <p className="text-xs text-[#6b7280] mt-1.5">1200 Arch St, Philadelphia, PA — auto-detected</p>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="space-y-5">
            {/* Community name */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Community name <span className="text-[#e5521e]">*</span>
              </label>
              <input
                type="text"
                placeholder={`e.g. "The Abyss on 5th"`}
                className="w-full"
              />
              <p className="text-xs text-[#6b7280] mt-1.5">Give it a name the neighborhood will remember.</p>
            </div>

            {/* Hazard type */}
            <div>
              <label className="block text-sm text-[#9ca3af] mb-2">
                Hazard type <span className="text-[#e5521e]">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {HAZARD_TYPES.map((type, i) => (
                  <button key={type} className={`p-3 rounded-lg text-xs font-medium border text-center
                    transition-colors ${i === 0
                      ? "bg-[#e5521e]/15 border-[#e5521e] text-[#e5521e]"
                      : "bg-[#222] border-[#333] text-[#9ca3af] hover:border-[#555]"}`}>
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
          <Link href="/" className="px-6 py-2 text-sm font-medium text-[#9ca3af] hover:text-white border border-[#444] rounded-full transition-colors">
            Cancel
          </Link>
          <button className="px-6 py-2 text-sm font-semibold text-white bg-[#e5521e] rounded-full hover:bg-[#cc4418] transition-colors flex items-center gap-2">
            Submit report <span>→</span>
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

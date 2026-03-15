"use client";

const EXPORT_FORMATS = [
  {
    icon: "🗺",
    label: "GeoJSON",
    description: "Machine-readable geographic features. Use with Mapbox, Leaflet, or any GIS tool.",
    ext: ".geojson",
    endpoint: "/api/v1/exports/geojson",
  },
  {
    icon: "📊",
    label: "CSV",
    description: "Spreadsheet-compatible. Includes all hazard fields, coordinates, status, votes.",
    ext: ".csv",
    endpoint: "/api/v1/exports/csv",
  },
  {
    icon: "🏛",
    label: "City-Ready Report (311)",
    description: "Formatted PDF report for submission to Philly 311 or Streets Department.",
    ext: ".pdf",
    endpoint: null,
  },
];

const FILTER_OPTIONS = {
  severity: ["All", "Critical", "High", "Moderate", "Low"],
  status:   ["All open", "Reported", "Acknowledged", "Scheduled", "In progress", "Resolved"],
  district: ["All districts", "South Philly", "North Philly", "West Philly", "Center City", "Kensington", "Fishtown"],
};

export default function ExportPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#171717] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[#f5f5f5]">Export data</h1>
          <p className="text-sm text-[#6b7280] mt-1">Download hazard data for external analysis or official reporting.</p>
        </div>

        {/* Filters */}
        <div className="bg-[#222] border border-[#333] rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-[#f5f5f5]">Filter export</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(FILTER_OPTIONS).map(([key, options]) => (
              <div key={key}>
                <label className="block text-xs text-[#6b7280] uppercase tracking-widest mb-1.5 font-semibold">
                  {key}
                </label>
                <select className="w-full text-sm">
                  {options.map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#6b7280] uppercase tracking-widest mb-1.5 font-semibold">Date from</label>
              <input type="date" className="w-full" />
            </div>
            <div>
              <label className="block text-xs text-[#6b7280] uppercase tracking-widest mb-1.5 font-semibold">Date to</label>
              <input type="date" className="w-full" />
            </div>
          </div>
        </div>

        {/* Format cards */}
        <div className="space-y-3">
          {EXPORT_FORMATS.map(({ icon, label, description, ext, endpoint }) => (
            <div
              key={label}
              className="bg-[#222] border border-[#333] rounded-xl p-5 flex items-center gap-4 hover:border-[#555] transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-[#2a2a2a] flex items-center justify-center text-2xl flex-shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-[#f5f5f5]">{label}</p>
                  {ext && (
                    <span className="text-[10px] font-mono text-[#4b5563] bg-[#2a2a2a] px-1.5 py-0.5 rounded">
                      {ext}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9ca3af] leading-relaxed">{description}</p>
              </div>
              {endpoint ? (
                <a
                  href={endpoint}
                  download
                  className="px-4 py-2 text-xs font-semibold rounded-lg border flex-shrink-0 transition-colors bg-[#e5521e] text-white border-[#e5521e] hover:bg-[#cc4418]"
                >
                  Download
                </a>
              ) : (
                <button disabled className="px-4 py-2 text-xs font-semibold rounded-lg border flex-shrink-0 text-[#6b7280] border-[#333] bg-[#1e1e1e] cursor-not-allowed">
                  Coming soon
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-4 text-xs text-[#6b7280]">
          <span className="font-semibold text-[#9ca3af]">Note: </span>
          Exports are limited to 10,000 records. For bulk data access, contact the city data team or use the API directly at{" "}
          <code className="text-[#e5521e] font-mono">/api/v1/hazards</code>.
        </div>
      </div>
    </div>
  );
}

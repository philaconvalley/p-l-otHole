"use client";

import { useState } from "react";

interface Props {
  open: number;
  critical: number;
  avgDays: number;
}

export function PressureCardButton({ open, critical, avgDays }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied]       = useState(false);

  const cardUrl   = `/api/og/pressure-card?open=${open}&critical=${critical}&avgDays=${avgDays}`;
  const shareText = `Philadelphia has ${open} open road hazards — ${critical} critical, averaging ${avgDays} days without repair. Add your voice 👇 #PlotHole #PhillyRoads`;
  const tweetUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://vabch.org")}`;

  async function copyLink() {
    await navigator.clipboard.writeText(`https://vabch.org`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 text-sm font-semibold text-white bg-[#F99300] rounded-lg hover:bg-[#e07e00] transition-colors"
      >
        Generate pressure card
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#1e1e1e] border border-[#333] rounded-2xl p-6 w-full max-w-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-[#f5f5f5]">Pressure card</p>
                <p className="text-xs text-[#6b7280] mt-0.5">Share to increase civic pressure</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-[#6b7280] hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Card preview */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cardUrl}
              alt="Philadelphia civic pressure card"
              className="w-full rounded-xl border border-[#333] mb-5"
            />

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
              <a
                href={cardUrl}
                download="plothole-pressure-card.png"
                className="py-2.5 text-sm font-medium text-center text-[#f5f5f5] bg-[#222] border border-[#444] rounded-lg hover:border-[#888] transition-colors"
              >
                Download
              </a>
              <button
                onClick={copyLink}
                className="py-2.5 text-sm font-medium text-[#f5f5f5] bg-[#222] border border-[#444] rounded-lg hover:border-[#888] transition-colors"
              >
                {copied ? "Copied ✓" : "Copy link"}
              </button>
              <a
                href={tweetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 text-sm font-semibold text-center text-white bg-[#F99300] rounded-lg hover:bg-[#e07e00] transition-colors"
              >
                Share on X →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

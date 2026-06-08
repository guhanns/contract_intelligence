import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlowDiagram, { VERSIONS } from './FlowDiagram'
import AiMatching from './AiMatching'
import { Sparkles, X, LogIn, RotateCcw } from "lucide-react";
import Layouts from '../Layouts/Layouts'
import './flowdiagram.css'

const STEPS = ['Select Branches', 'Compare', 'Merge']

const Branches = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [selectedIds, setSelectedIds] = useState(new Set(["v1.2", "v2.1"]))
  const [showConfirmPopup, setShowConfirmPopup] = useState(false)

  // Recursive function to gather selected versions in natural tree order
  const getSelectedVersionsData = () => {
    const result = [];
    const recurse = (v) => {
      if (!v) return;
      if (selectedIds.has(v.id)) {
        result.push(v);
      }
      if (v.child) recurse(v.child);
    };
    VERSIONS.forEach(v => recurse(v));
    return result;
  };

  const selectedVersions = getSelectedVersionsData();

  return (
    <Layouts>
      <div className="bp-page">
        {/* Header bar */}
        <div className="bp-header">
          {/* Left: navigation */}
          <div className="bp-header-left">
            <button
              className="bp-back-btn"
              onClick={() => (step > 0 ? setStep((s) => s - 1) : navigate(-1))}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="bp-header-sep" />
            <span className="bp-header-label">Base Document</span>
            <span className="bp-header-title">
              Premier Health Alliance Agreement
            </span>
            <span className="bp-version-chip">v1.0</span>
            <button className="bp-change-link">Change Base Document</button>
          </div>

          {/* Centre: 3-step progress */}
          <div className="bp-progress">
            {STEPS.map((_, i) => (
              <div key={i} className="bp-step">
                <div
                  className={`bp-step-circle ${i < step ? "completed" : i === step ? "active" : "inactive"}`}
                >
                  {i < step && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <polyline
                        points="2,6.5 5,9.5 10,3"
                        stroke="#fff"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {i === step && <div className="bp-step-inner" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`bp-step-line ${i < step ? "done" : ""}`} />
                )}
              </div>
            ))}
          </div>

          {/* Right: actions */}
          <div className="bp-header-right">
            <button className="bp-cancel-btn" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              className="bp-merge-btn"
              onClick={() => {
                if (step === 0) {
                  setShowConfirmPopup(true);
                } else {
                  setStep((s) => Math.min(s + 1, STEPS.length - 1));
                }
              }}
            >
              <Sparkles size={16} />
              {step === 0
                ? "Start Merging"
                : step === 1
                  ? "Continue"
                  : "Finish"}
            </button>
            <button className="bp-close-btn" onClick={() => navigate(-1)}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main canvas / step content */}
        <div className="bp-canvas-wrap">
          {step === 0 && <FlowDiagram selectedIds={selectedIds} setSelectedIds={setSelectedIds} />}
          {step === 1 && <AiMatching />}
          {step === 2 && (
            <div className="bp-step-placeholder">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3d4455"
                strokeWidth="1.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Step 3 — {STEPS[2]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Popup Modal Overlay */}
      {showConfirmPopup && (
        <div className="bp-popup-overlay" onClick={() => setShowConfirmPopup(false)}>
          <div className="bp-popup-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bp-popup-header">
              <div className="bp-popup-header-left">
                <h3 className="bp-popup-title">Confirm Restatement Setup</h3>
              </div>
              <div className="bp-popup-header-right">
                <span className="bp-popup-conflicts-tag">3 Conflicts Found</span>
                <button 
                  className="bp-popup-cancel-btn"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  Cancel
                </button>
                <button 
                  className="bp-popup-merge-btn"
                  onClick={() => {
                    setShowConfirmPopup(false);
                    setStep(1);
                  }}
                >
                  <Sparkles size={15} />
                  Start Merging
                </button>
                <button 
                  className="bp-popup-close-btn"
                  onClick={() => setShowConfirmPopup(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="bp-popup-body">
              <div className="bp-popup-meta-row">
                <span className="bp-popup-meta-label">Base Document:</span>
                <span className="bp-popup-meta-value">Premier Health Alliance Agreement v1.0</span>
              </div>

              <h4 className="bp-popup-section-title">
                {selectedVersions.length} Selected Versions
              </h4>
              <p className="bp-popup-section-desc">
                AI will merge the selected branches into a new restatement document. Detected conflicts will appear in the next step for your review.
              </p>

              {/* Horizontally scrollable container for version columns */}
              <div className="bp-popup-columns-container">
                {selectedVersions.map((v) => (
                  <div key={v.id} className="bp-popup-version-col">
                    {/* Column Header Card */}
                    <div className="bp-popup-col-header">
                      <div 
                        className="bp-checkbox is-checked"
                        onClick={() => {
                          const next = new Set(selectedIds);
                          next.delete(v.id);
                          setSelectedIds(next);
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M5 12l5 5L20 7"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span className="bp-popup-col-title truncate" title={v.title}>
                        {v.title}
                      </span>
                      <span className="bp-popup-col-version-tag">
                        {v.version.toLowerCase()}
                      </span>
                    </div>

                    {/* Column Amendments List */}
                    <div className="bp-popup-col-amendments">
                      {v.amendments && v.amendments.map((amend, idx) => (
                        <div key={idx} className="bp-popup-amend-card">
                          <div className="bp-popup-amend-card-header">
                            <span className="bp-popup-amend-card-label">
                              Amendment {idx + 1}
                            </span>
                            
                            <div className="bp-popup-amend-card-actions">
                              {amend.badge && (
                                <span className={`bp-popup-amend-badge-pill ${amend.badge.toLowerCase()}`}>
                                  {amend.badge}
                                </span>
                              )}
                              
                              {amend.type === "insert" ? (
                                <LogIn size={15} className="bp-popup-amend-card-icon" />
                              ) : (
                                <RotateCcw size={15} className="bp-popup-amend-card-icon" />
                              )}
                            </div>
                          </div>
                          
                          <div className="bp-popup-amend-card-title truncate" title={amend.title}>
                            {amend.title}
                          </div>
                          <div className="bp-popup-amend-card-subtitle truncate" title={amend.subtitle}>
                            {amend.subtitle}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layouts>
  );
}

export default Branches

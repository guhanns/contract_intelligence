import React, { useState } from "react";
import Select, { components } from "react-select";
import {
  Check,
  AlertCircle,
  ArrowLeft,
  X,
  PanelLeft,
  Sparkles,
  FilePlus2,
  RotateCcw,
  Pencil,
  ChevronDown,
} from "lucide-react";
import "./aimatching.css";

const VERSIONS = [
  {
    name: "v1.1",
    progress: "3/5",
    items: [
      {
        title: "Parties",
        desc: "Payments handled swiftly and accurately…",
        status: "ok",
      },
      {
        title: "Payment Terms",
        desc: "Upholding standards for drug safety…",
        status: "ok",
      },
      {
        title: "Delivery Schedule",
        desc: "Pharmacies operating at peak efficiency…",
        status: "ok",
      },
      {
        title: "Warranty Period",
        desc: "Four unique organizations collaborating effectively…",
        status: "warn",
      },
      {
        title: "Confidentiality",
        desc: "Six distinct organizations working together…",
        status: "warn",
      },
    ],
  },
  {
    name: "v1.2",
    progress: "4/5",
    items: [
      {
        title: "Parties",
        desc: "Three key organizations driving progress…",
        status: "ok",
      },
      {
        title: "Payment Terms",
        desc: "Three significant organizations shaping the industry…",
        status: "ok",
      },
      {
        title: "Delivery Schedule",
        desc: "Three primary organizations influencing change…",
        status: "ok",
      },
      {
        title: "Warranty Period",
        desc: "Three critical organizations ensuring success…",
        status: "ok",
      },
      {
        title: "Confidentiality",
        desc: "Three relevant organizations making a difference…",
        status: "warn",
      },
    ],
  },
];

/* ---------- conflicts data ---------- */
const initialConflicts = [
  {
    id: "unit-price",
    title: "Unit Price",
    versions: "v1.1, v1.2",
    options: ["amendment1", "amendment2", "master", "manual"],
    active: "amendment1",
    fields: { master: "$50/Unit", amendment1: "$44/Unit" },
    layout: "double",
  },
  {
    id: "payment-terms",
    title: "Payment Terms",
    versions: "v1.1, v1.2",
    options: ["amendment1", "master", "manual"],
    active: "master",
    fields: { master: "Net 30" },
    layout: "single",
  },
  {
    id: "pricing",
    title: "Pricing",
    versions: "v1.1, v1.2, v1.3, v2.1",
    options: ["amendment-dropdown", "master", "manual"],
    active: "manual",
    fields: {
      master:
        "This Agreement may be renewed for additional three-year terms by mutual written agreement of the parties no less than ninety (90) days prior to the expiration of the then-current term, with any modifications to terms and conditions as agreed upon.",
      manual: "",
    },
    layout: "textarea",
  },
];

const amendmentOptions = [
  { value: "a1", label: "Accept Amendment 1" },
  { value: "a2", label: "Accept Amendment 2" },
  { value: "a3", label: "Accept Amendment 3" },
  { value: "a4", label: "Accept Amendment 4" },
  { value: "a5", label: "Accept Amendment 5" },
];

const selectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "transparent",
    borderColor: state.isFocused ? "#3a4055" : "#2a3043",
    borderRadius: 8,
    minHeight: 38,
    boxShadow: "none",
    cursor: "pointer",
    "&:hover": { borderColor: "#3a4055" },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#cfd3e0",
    fontSize: 13,
    fontWeight: 500,
  }),
  valueContainer: (base) => ({ ...base, padding: "0 10px" }),
  input: (base) => ({ ...base, color: "#e6e9f2" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({ ...base, color: "#8a90a3", padding: 6 }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#171b27",
    border: "1px solid #2a3043",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 4,
    zIndex: 20,
  }),
  menuList: (base) => ({ ...base, padding: 0 }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#222837" : "transparent",
    color: "#e6e9f2",
    fontSize: 13,
    padding: "10px 14px",
    cursor: "pointer",
    "&:active": { backgroundColor: "#2a3043" },
  }),
};

const SelectValue = (props) => (
  <components.SingleValue {...props}>
    <span className="bp-select-value">
      <FilePlus2 size={14} />
      {props.children}
    </span>
  </components.SingleValue>
);
const SelectDropdownIndicator = (props) => (
  <components.DropdownIndicator {...props}>
    <ChevronDown size={16} />
  </components.DropdownIndicator>
);

export default function AiMatching() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conflicts, setConflicts] = useState(initialConflicts);

  const setActive = (id, opt) =>
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: opt } : c)),
    );

  const updateField = (id, key, val) =>
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, fields: { ...c.fields, [key]: val } } : c,
      ),
    );

  return (
    <div className="bp-root">
      {/* ===== top header ===== */}
  

      {/* ===== body ===== */}
      <div className="aim-body">
        <div
          className={`bp-layout ${sidebarOpen ? "is-open" : "is-collapsed"}`}
        >
          {/* ----- sidebar ----- */}
          <aside className="bp-sidebar">
            <div className="bp-sidebar-inner">
              <div className="bp-sidebar-head">
                <span className="bp-sidebar-head-title">
                  <Sparkles size={16} />
                  21 Merged Entities
                </span>
                <button
                  className="bp-iconbtn"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Collapse sidebar"
                >
                  <PanelLeft size={18} />
                </button>
              </div>
              <div className="bp-sidebar-scroll">
                {VERSIONS.map((v) => (
                  <div key={v.name} className="bp-version-block">
                    <div className="bp-version-head">
                      <span className="bp-version-name">
                        Version - {v.name}
                      </span>
                      <span className="bp-progress-pill">{v.progress}</span>
                    </div>
                    <ul className="bp-item-list">
                      {v.items.map((it, i) => (
                        <li key={i} className="bp-item">
                          <span className={`bp-item-icon bp-item-${it.status}`}>
                            {it.status === "ok" ? (
                              <Check size={16} strokeWidth={3} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                          </span>
                          <div className="bp-item-text">
                            <span className="bp-item-title">{it.title}</span>
                            <span className="bp-item-desc">{it.desc}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* collapsed-state toggle */}
            <button
              className="bp-collapsed-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Expand sidebar"
            >
              <PanelLeft size={18} />
            </button>
          </aside>

          {/* ----- main ----- */}
          <main className="bp-main">
            <div className="bp-main-head">
              <h2 className="bp-main-title">
                Conflict Detection &amp; Resolution
              </h2>
              <div className="bp-main-actions">
                <span className="bp-conflict-count">3 Conflicts Found</span>
                <button className="bp-btn bp-btn-ghost">Clear All</button>
                <button className="bp-btn bp-btn-primary">Save Changes</button>
              </div>
            </div>

            {/* one unified container — sections separated by dividers */}
            <div className="bp-conflict-panel">
              {conflicts.map((c, idx) => (
                <section
                  key={c.id}
                  className={`bp-conflict ${idx > 0 ? "has-divider" : ""}`}
                >
                  <header className="bp-conflict-head">
                    <span className="bp-conflict-icon">
                      <AlertCircle size={18} />
                    </span>
                    <h3 className="bp-conflict-title">{c.title}</h3>
                    <span className="bp-conflict-meta">
                      Found in Versions - {c.versions}
                    </span>
                  </header>

                  <div className="bp-action-row">
                    {c.options.map((opt) => {
                      if (opt === "amendment-dropdown") {
                        return (
                          <div
                            key="amendment-dropdown"
                            className={`bp-action-select ${
                              c.active === "amendment-dropdown"
                                ? "is-active"
                                : ""
                            }`}
                            onClick={() =>
                              setActive(c.id, "amendment-dropdown")
                            }
                          >
                            <Select
                              options={amendmentOptions}
                              defaultValue={amendmentOptions[0]}
                              styles={selectStyles}
                              isSearchable={false}
                              components={{
                                SingleValue: SelectValue,
                                DropdownIndicator: SelectDropdownIndicator,
                              }}
                            />
                          </div>
                        );
                      }
                      const label =
                        opt === "amendment1"
                          ? "Accept Amendment 1"
                          : opt === "amendment2"
                            ? "Accept Amendment 2"
                            : opt === "master"
                              ? "Revert to Master"
                              : "Manual Edit";
                      const icon =
                        opt === "master" ? (
                          <RotateCcw size={14} />
                        ) : opt === "manual" ? (
                          <Pencil size={14} />
                        ) : (
                          <FilePlus2 size={14} />
                        );
                      return (
                        <button
                          key={opt}
                          className={`bp-action ${c.active === opt ? "is-active" : ""}`}
                          onClick={() => setActive(c.id, opt)}
                        >
                          {icon}
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* fields */}
                  {c.layout === "double" && (
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label className="bp-field-label">Master</label>
                        <input
                          className="bp-input"
                          value={c.fields.master}
                          onChange={(e) =>
                            updateField(c.id, "master", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="bp-field-label">Amendment 1</label>
                        <input
                          className="bp-input"
                          value={c.fields.amendment1}
                          onChange={(e) =>
                            updateField(c.id, "amendment1", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {c.layout === "single" && (
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="bp-field-label">Master</label>
                        <input
                          className="bp-input"
                          value={c.fields.master}
                          onChange={(e) =>
                            updateField(c.id, "master", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}

                  {c.layout === "textarea" && (
                    <div className="row g-3 align-items-start">
                      <div className="col-12 col-md-6">
                        <label className="bp-field-label">Master</label>
                        <textarea
                          className="bp-input bp-textarea"
                          value={c.fields.master}
                          onChange={(e) =>
                            updateField(c.id, "master", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label className="bp-field-label">Manual</label>
                        <textarea
                          className="bp-input bp-textarea"
                          placeholder="Enter a description..."
                          value={c.fields.manual}
                          onChange={(e) =>
                            updateField(c.id, "manual", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

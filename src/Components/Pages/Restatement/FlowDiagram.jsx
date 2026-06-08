import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Offcanvas, OffcanvasHeader, OffcanvasBody } from "reactstrap";
import "./flowdiagram.css";

const MASTER = { x: 60, y: 40, w: 300, h: 92 };
const VERSION = { w: 360, h: 92 };
const AMENDMENT = { w: 240, h: 85 };

const VERSION_ROW_Y = 240;
const VERSION_FIRST_X = 200;
const COL_GAP = 460;

const TRUNK_Y = 180;
const TRUNK_X_OFFSET = 60;

const AMENDMENT_X_OFFSET = 110;
const GAP_VERSION_TO_AMEND = 40;
const AMENDMENT_Y_GAP = 115;
const VIEW_MORE_H = 30;
const VIEW_MORE_W = 200;

const GAP_AMEND_TO_CHILD = 75;
const CHILD_TURN_GAP = 30;
const CHILD_BRANCH_OFFSET = 40;

const INITIAL_AMENDMENTS_SHOWN = 3;

const COLOR_GREY = "#5A6173";
const COLOR_PINK = "#7F56D9";

export const VERSIONS = [
  {
    id: "v1.1",
    version: "V1.1",
    title: "Premier Health Alliance Agreement v1.1",
    amendments: [
      { title: "Updated Price Calculations", subtitle: "Payments handled swiftly and accurately...", type: "insert" },
      { title: "Term Extension", subtitle: "Upholding standards for drug safety...", type: "update" },
      { title: "Extended Renewal Options", subtitle: "Pharmacies operating at peak efficiency...", badge: "Insert", type: "insert" },
      { title: "Pharmaceutical Pricing Standards", subtitle: "Four unique organizations collaborating effectively...", badge: "Update", type: "update" },
      { title: "Discount and Rebate Guidelines", subtitle: "Six distinct organizations working together...", type: "update" },
      { title: "Revised Payment Schedule", subtitle: "Six prominent organizations making an impact...", type: "update" },
    ],
    child: {
      id: "v1.2",
      version: "V1.2",
      title: "Premier Health Alliance Agreement v1.2",
      defaultSelected: true,
      amendments: [
        { title: "Updated Pricing Structure for Medications", subtitle: "Three key organizations driving progress...", type: "update" },
        { title: "Pharmaceutical Renewal Agreement Details", subtitle: "Three significant organizations shaping the industry...", type: "insert" },
        { title: "Comprehensive Drug Pricing Overview", subtitle: "Four major organizations leading the way...", type: "update" },
        { title: "Term Extension", subtitle: "Three primary organizations influencing change...", type: "insert" },
      ],
      child: {
        id: "v1.3",
        version: "V1.3",
        title: "Premier Health Alliance Agreement v1.3",
        defaultSelected: false,
        amendments: [
          { title: "Coverage Update", subtitle: "New coverage terms..." },
          { title: "Billing Terms", subtitle: "Monthly billing cycle..." },
          { title: "Data Privacy", subtitle: "HIPAA compliance..." },
          { title: "Network Access", subtitle: "Provider network..." },
          { title: "Claims Process", subtitle: "Streamlined claims..." },
          { title: "Appeals", subtitle: "Member appeal rights..." },
          { title: "Coordination", subtitle: "Benefits coordination..." },
          { title: "Prior Auth", subtitle: "Prior authorization..." },
        ],
        child: null,
      },
    },
  },
  {
    id: "v2.0",
    version: "V2.0",
    title: "Premier Health Alliance Agreement v2.0",
    amendments: [
      { title: "Distribution", subtitle: "Benefit Management se..." },
      { title: "Delivery Terms", subtitle: "Confidentiality Obligati..." },
      { title: "Purchase Orders", subtitle: "Electronic prescribing a..." },
    ],
    child: {
      id: "v2.1",
      version: "V2.1",
      title: "Premier Health Alliance Agreement v2.1",
      defaultSelected: true,
      amendments: [
        { title: "Current Drug Pricing Strategies", subtitle: "Three essential organizations supporting growth...", type: "update" },
        { title: "Term Extension", subtitle: "Three critical organizations ensuring success...", type: "insert" },
        { title: "Rebate Agreement Guidelines for Pharma", subtitle: "Three relevant organizations making a difference...", type: "update" },
      ],
      child: {
        id: "v2.2",
        version: "V2.2",
        title: "Premier Health Alliance Agreement v2.2",
        defaultSelected: false,
        amendments: [
          { title: "Extended Terms for Drug Pricing", subtitle: "Three vital organizations enhancing...", type: "insert" },
          { title: "Pharma Payment Agreement", subtitle: "Three notable organizations...", type: "update" },
        ],
        child: null,
      },
    },
  },
  {
    id: "v3.0",
    version: "V3.0",
    title: "Premier Health Alliance Agreement v3.0",
    amendments: [
      { title: "Formula Update", subtitle: "The Compound..." },
      { title: "Mutual Release", subtitle: "Member release of..." },
    ],
    child: null,
  },
];

function smoothStepPathAtY(sx, sy, tx, ty, turnY, r = 12) {
  if (Math.abs(tx - sx) < 1) return `M ${sx} ${sy} L ${tx} ${ty}`;
  const dirX = Math.sign(tx - sx);
  const rr = Math.min(
    r,
    Math.abs(tx - sx) / 2,
    Math.max(0, turnY - sy),
    Math.max(0, ty - turnY),
  );
  return [
    `M ${sx} ${sy}`,
    `L ${sx} ${turnY - rr}`,
    `Q ${sx} ${turnY} ${sx + rr * dirX} ${turnY}`,
    `L ${tx - rr * dirX} ${turnY}`,
    `Q ${tx} ${turnY} ${tx} ${turnY + rr}`,
    `L ${tx} ${ty}`,
  ].join(" ");
}

function rightAnglePathToLeft(sx, sy, tx, ty, r = 10) {
  const midY = ty;
  const dirX = Math.sign(tx - sx);
  const rr = Math.min(r, Math.abs(tx - sx) / 2, Math.abs(midY - sy) / 2);
  return [
    `M ${sx} ${sy}`,
    `L ${sx} ${midY - rr}`,
    `Q ${sx} ${midY} ${sx + rr * dirX} ${midY}`,
    `L ${tx} ${ty}`,
  ].join(" ");
}

function Chip({ kind, label }) {
  return <span className={`bp-chip ${kind}`}>{label}</span>;
}

function Checkbox({ checked, onChange }) {
  return (
    <div
      className={`bp-checkbox${checked ? " is-checked" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12l5 5L20 7"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function CollapseBtn({ collapsed, onClick }) {
  return (
    <div
      className="bp-collapse-btn"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {collapsed ? "+" : "−"}
    </div>
  );
}

function Card({
  x,
  y,
  w,
  kind,
  children,
  selected = false,
  showCollapse = false,
  collapsed = false,
  onToggleCollapse,
  dimmed = false,
  onClick,
  noPan = false,
}) {
  return (
    <div
      className={
        "bp-card" +
        (kind ? ` bp-card--${kind}` : "") +
        (selected ? " is-selected" : "")
      }
      style={{ left: x, top: y, width: w, opacity: dimmed ? 0.2 : 1 }}
      onClick={onClick}
      {...(noPan ? { "data-no-pan": "true" } : {})}
    >
      {children}
      {showCollapse && (
        <CollapseBtn collapsed={collapsed} onClick={onToggleCollapse} />
      )}
    </div>
  );
}

function ControlBtn({ children, onClick, title, active = false }) {
  return (
    <button
      className={`bp-control-btn${active ? " is-active" : ""}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

export default function FlowDiagram({ selectedIds: propsSelectedIds, setSelectedIds: propsSetSelectedIds }) {
  const [localSelectedIds, setLocalSelectedIds] = useState(
    new Set(
      VERSIONS.filter((v) => v.child?.defaultSelected).map((v) => v.child.id),
    ),
  );
  const selectedIds = propsSelectedIds || localSelectedIds;
  const setSelectedIds = propsSetSelectedIds || setLocalSelectedIds;
  const [collapsed, setCollapsed] = useState(new Set());
  const [masterCollapsed, setMasterCollapsed] = useState(false);
  const [expandedAmendments, setExpandedAmendments] = useState(new Set());
  const [eyeFiltered, setEyeFiltered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedAmendmentId, setSelectedAmendmentId] = useState(null);
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const [offcanvasData, setOffcanvasData] = useState(null);

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleCollapse = useCallback((id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleExpandAmendments = useCallback((vId) => {
    setExpandedAmendments((prev) => {
      const next = new Set(prev);
      next.has(vId) ? next.delete(vId) : next.add(vId);
      return next;
    });
  }, []);

  const openAmendment = useCallback((node) => {
    setSelectedAmendmentId(node.id);
    setOffcanvasData(node.data);
    setOffcanvasOpen(true);
  }, []);

  const closeOffcanvas = useCallback(() => {
    setOffcanvasOpen(false);
    setSelectedAmendmentId(null);
  }, []);

  const { nodes, edges, panels, bounds } = useMemo(() => {
    const nodes = [];
    const edges = [];

    function addAmendments(
      vId,
      amendments,
      x,
      vY,
      trunkX,
      trunkY,
      isVSelected,
      versionTitle,
      versionLabel,
    ) {
      const isExpanded = expandedAmendments.has(vId);
      const amendStartY = vY + VERSION.h + GAP_VERSION_TO_AMEND;
      let lastBottom = vY + VERSION.h;
      const dimmed = eyeFiltered && !isVSelected;

      const visible = isExpanded
        ? amendments
        : amendments.slice(0, INITIAL_AMENDMENTS_SHOWN);

      visible.forEach((a, j) => {
        const ax = x + AMENDMENT_X_OFFSET;
        const ay = amendStartY + j * AMENDMENT_Y_GAP;
        nodes.push({
          kind: "amendment",
          id: `${vId}-a${j}`,
          x: ax,
          y: ay,
          w: AMENDMENT.w,
          h: AMENDMENT.h,
          hasChildren: false,
          dimmed,
          data: {
            label: `Amendment ${j + 1}`,
            title: a.title,
            subtitle: a.subtitle,
            versionTitle: versionTitle || "",
            versionLabel: versionLabel || "",
          },
        });
        edges.push({
          id: `${vId}-a${j}-edge`,
          d: rightAnglePathToLeft(trunkX, trunkY, ax, ay + AMENDMENT.h / 2, 10),
          color: COLOR_GREY,
          width: 1.2,
          dimmed,
        });
        lastBottom = ay + AMENDMENT.h;
      });

      if (amendments.length > INITIAL_AMENDMENTS_SHOWN) {
        const vmY = lastBottom + 12;
        const vmX = x + Math.floor((VERSION.w - VIEW_MORE_W) / 2);
        nodes.push({
          kind: "view-more",
          id: `${vId}-view-more`,
          versionId: vId,
          remaining: amendments.length - INITIAL_AMENDMENTS_SHOWN,
          expanded: isExpanded,
          x: vmX,
          y: vmY,
          w: VIEW_MORE_W,
          h: VIEW_MORE_H,
          hasChildren: false,
          dimmed,
        });
        lastBottom = vmY + VIEW_MORE_H;
      }

      return { lastBottom };
    }

    nodes.push({
      kind: "master",
      id: "master",
      x: MASTER.x,
      y: MASTER.y,
      w: MASTER.w,
      h: MASTER.h,
      hasChildren: VERSIONS.length > 0,
      dimmed: false,
      data: {
        title: "Premier Health Alliance Agreement v1.0",
        subtitle: "2 Branches",
      },
    });

    if (!masterCollapsed) {
      const masterTrunkX = MASTER.x + TRUNK_X_OFFSET;
      const masterTrunkY = MASTER.y + MASTER.h;

      VERSIONS.forEach((v, i) => {
        const x = VERSION_FIRST_X + i * COL_GAP;
        const y = VERSION_ROW_Y;
        const vAmendments = v.amendments || [];
        const isVSelected = selectedIds.has(v.id);
        const isVCollapsed = collapsed.has(v.id);
        const vDimmed = eyeFiltered && !isVSelected;

        nodes.push({
          kind: "version",
          id: v.id,
          x,
          y,
          w: VERSION.w,
          h: VERSION.h,
          hasChildren: vAmendments.length > 0,
          dimmed: vDimmed,
          data: {
            version: v.version,
            title: v.title,
            subtitle: `${vAmendments.length} Amendments`,
          },
        });

        edges.push({
          id: `master-${v.id}`,
          d: smoothStepPathAtY(
            masterTrunkX,
            masterTrunkY,
            x + VERSION.w / 2,
            y,
            TRUNK_Y,
            14,
          ),
          color: isVSelected ? COLOR_PINK : COLOR_GREY,
          width: 1.4,
          dimmed: vDimmed,
        });

        const vTrunkX = x + TRUNK_X_OFFSET;
        const vTrunkY = y + VERSION.h;
        let vLastBottom = y + VERSION.h;

        if (!isVCollapsed && vAmendments.length > 0) {
          const { lastBottom } = addAmendments(
            v.id,
            vAmendments,
            x,
            y,
            vTrunkX,
            vTrunkY,
            isVSelected,
            v.title,
            v.version,
          );
          vLastBottom = lastBottom;
        }

        if (v.child) {
          const child = v.child;
          const childAmendments = child.amendments || [];
          const childIsCollapsed = collapsed.has(child.id);
          const isChildSelected = selectedIds.has(child.id);
          const childDimmed = eyeFiltered && !isChildSelected;

          const childY = isVCollapsed
            ? y + VERSION.h + GAP_AMEND_TO_CHILD
            : vLastBottom + GAP_AMEND_TO_CHILD;

          const childTurnY = isVCollapsed
            ? y + VERSION.h + 30
            : vLastBottom + CHILD_TURN_GAP;

          nodes.push({
            kind: "version",
            id: child.id,
            x,
            y: childY,
            w: VERSION.w,
            h: VERSION.h,
            hasChildren: childAmendments.length > 0,
            dimmed: childDimmed,
            data: {
              version: child.version,
              title: child.title,
              subtitle: `${childAmendments.length} Amendments`,
            },
          });

          edges.push({
            id: `${v.id}-${child.id}-edge`,
            d: smoothStepPathAtY(
              x - CHILD_BRANCH_OFFSET,
              TRUNK_Y,
              x + VERSION.w / 2,
              childY,
              childTurnY,
              12,
            ),
            color: isChildSelected ? COLOR_PINK : COLOR_GREY,
            width: 1.4,
            dimmed: childDimmed,
          });

          const childTrunkX = x + TRUNK_X_OFFSET;
          const childTrunkY = childY + VERSION.h;
          let childLastBottom = childY + VERSION.h;

          if (!childIsCollapsed && childAmendments.length > 0) {
            const { lastBottom } = addAmendments(
              child.id,
              childAmendments,
              x,
              childY,
              childTrunkX,
              childTrunkY,
              isChildSelected,
              child.title,
              child.version,
            );
            childLastBottom = lastBottom;
          }

          if (child.child) {
            const gc = child.child;
            const gcAmendments = gc.amendments || [];
            const gcIsCollapsed = collapsed.has(gc.id);
            const isGcSelected = selectedIds.has(gc.id);
            const gcDimmed = eyeFiltered && !isGcSelected;

            const gcY = childIsCollapsed
              ? childY + VERSION.h + GAP_AMEND_TO_CHILD
              : childLastBottom + GAP_AMEND_TO_CHILD;

            const gcTurnY = childIsCollapsed
              ? childY + VERSION.h + 30
              : childLastBottom + CHILD_TURN_GAP;

            nodes.push({
              kind: "version",
              id: gc.id,
              x,
              y: gcY,
              w: VERSION.w,
              h: VERSION.h,
              hasChildren: gcAmendments.length > 0,
              dimmed: gcDimmed,
              data: {
                version: gc.version,
                title: gc.title,
                subtitle: `${gcAmendments.length} Amendments`,
              },
            });

            edges.push({
              id: `${child.id}-${gc.id}-edge`,
              d: smoothStepPathAtY(
                x - CHILD_BRANCH_OFFSET,
                TRUNK_Y,
                x + VERSION.w / 2,
                gcY,
                gcTurnY,
                12,
              ),
              color: isGcSelected ? COLOR_PINK : COLOR_GREY,
              width: 1.4,
              dimmed: gcDimmed,
            });

            if (!gcIsCollapsed && gcAmendments.length > 0) {
              addAmendments(
                gc.id,
                gcAmendments,
                x,
                gcY,
                x + TRUNK_X_OFFSET,
                gcY + VERSION.h,
                isGcSelected,
                gc.title,
                gc.version,
              );
            }
          }
        }
      });
    }

    const panels = [];
    nodes.forEach((n) => {
      if (n.kind !== "version" || !selectedIds.has(n.id)) return;

      const kids = nodes.filter(
        (m) =>
          (m.kind === "amendment" && m.id.startsWith(n.id + "-a")) ||
          (m.kind === "view-more" && m.id === `${n.id}-view-more`),
      );

      let minX = n.x;
      let minY = n.y;
      let maxX = n.x + n.w;
      let maxY = n.y + n.h;

      kids.forEach((k) => {
        minX = Math.min(minX, k.x);
        minY = Math.min(minY, k.y);
        maxX = Math.max(maxX, k.x + k.w);
        maxY = Math.max(maxY, k.y + k.h);
      });

      const padX = 18;
      const padY = 16;
      panels.push({
        id: `panel-${n.id}`,
        x: minX - padX,
        y: minY - padY,
        w: maxX - minX + padX * 2,
        h: maxY - minY + padY * 2,
      });
    });

    let maxX = 0;
    let maxY = 0;
    nodes.forEach((n) => {
      maxX = Math.max(maxX, n.x + n.w);
      maxY = Math.max(maxY, n.y + (n.kind === "amendment" ? 100 : 110));
    });
    panels.forEach((p) => {
      maxX = Math.max(maxX, p.x + p.w);
      maxY = Math.max(maxY, p.y + p.h);
    });

    return { nodes, edges, panels, bounds: { w: maxX + 80, h: maxY + 80 } };
  }, [
    selectedIds,
    collapsed,
    masterCollapsed,
    expandedAmendments,
    eyeFiltered,
  ]);

  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [scale, setScale] = useState(1);
  const containerRef = useRef(null);
  const drag = useRef({ active: false, x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const fit = () => {
      const el = containerRef.current;
      if (!el) return;
      const cw = el.clientWidth;
      const ch = el.clientHeight;
      const pad = 40;
      const s = Math.min(
        (cw - pad * 2) / bounds.w,
        (ch - pad * 2) / bounds.h,
        1,
      );
      setScale(s);
      setTx((cw - bounds.w * s) / 2);
      setTy((ch - bounds.h * s) / 2);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [bounds.w, bounds.h]);

  const onMouseDown = (e) => {
    if (e.target.closest("[data-no-pan]")) return;
    drag.current = { active: true, x: e.clientX, y: e.clientY, tx, ty };
    setIsDragging(true);
  };
  const onMouseMove = (e) => {
    if (!drag.current.active) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x));
    setTy(drag.current.ty + (e.clientY - drag.current.y));
  };
  const onMouseUp = () => {
    drag.current.active = false;
    setIsDragging(false);
  };

  const onWheel = (e) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = -e.deltaY * 0.0015;
    const next = Math.min(2, Math.max(0.25, scale * (1 + delta)));
    const wx = (mx - tx) / scale;
    const wy = (my - ty) / scale;
    setScale(next);
    setTx(mx - wx * next);
    setTy(my - wy * next);
  };

  const zoomBy = (factor) => {
    const el = containerRef.current;
    if (!el) return;
    const cx = el.clientWidth / 2;
    const cy = el.clientHeight / 2;
    const next = Math.min(2, Math.max(0.25, scale * factor));
    const wx = (cx - tx) / scale;
    const wy = (cy - ty) / scale;
    setScale(next);
    setTx(cx - wx * next);
    setTy(cy - wy * next);
  };

  const fitToView = () => {
    const el = containerRef.current;
    if (!el) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const pad = 40;
    const s = Math.min((cw - pad * 2) / bounds.w, (ch - pad * 2) / bounds.h, 1);
    setScale(s);
    setTx((cw - bounds.w * s) / 2);
    setTy((ch - bounds.h * s) / 2);
  };

  const offcanvasHeader = offcanvasData
    ? offcanvasData.versionTitle.replace(/\s+([Vv][\d.]+)$/, " - $1").replace(/ - V/, " - v")
    : "";

  return (
    <>
    <div
      ref={containerRef}
      className={`bp-container${isDragging ? " is-grabbing" : ""}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    >
      <div
        className="bp-world"
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          width: bounds.w,
          height: bounds.h,
        }}
      >
        {panels.map((p) => (
          <div
            key={p.id}
            className="bp-branch-panel"
            style={{ left: p.x, top: p.y, width: p.w, height: p.h }}
          />
        ))}

        <svg className="bp-svg" width={bounds.w} height={bounds.h}>
          <defs>
            <marker
              id="arrow-grey"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#5A6173" />
            </marker>
            <marker
              id="arrow-purple"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#8B5CF6" />
            </marker>
            <marker
              id="arrow-pink"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="8"
              markerHeight="8"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#7F56D9" />
            </marker>
          </defs>
          {edges.map((e) => {
            const marker =
              e.color === COLOR_PINK
                ? "url(#arrow-pink)"
                : e.color === "#8B5CF6"
                  ? "url(#arrow-purple)"
                  : "url(#arrow-grey)";
            return (
              <path
                key={e.id}
                d={e.d}
                fill="none"
                stroke={e.color}
                strokeWidth={e.width}
                markerEnd={marker}
                opacity={e.dimmed ? 0.2 : 1}
              />
            );
          })}
        </svg>

        {nodes.map((n) => {
          if (n.kind === "master") {
            return (
              <Card
                key={n.id}
                x={n.x}
                y={n.y}
                w={n.w}
                kind="master"
                showCollapse={n.hasChildren}
                collapsed={masterCollapsed}
                onToggleCollapse={() => setMasterCollapsed((c) => !c)}
                dimmed={false}
              >
                <div data-no-pan className="bp-stack">
                  <Chip kind="master" label="Master" />
                  <div className="bp-title">{n.data.title}</div>
                  <div className="bp-subtitle">{n.data.subtitle}</div>
                </div>
              </Card>
            );
          }

          if (n.kind === "view-more") {
            return (
              <div
                key={n.id}
                data-no-pan
                className={`bp-view-more${n.expanded ? " is-expanded" : ""}`}
                style={{
                  position: "absolute",
                  left: n.x,
                  top: n.y,
                  width: n.w,
                  opacity: n.dimmed ? 0.2 : 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandAmendments(n.versionId);
                }}
              >
                {n.expanded ? (
                  <>
                    Show Less
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </>
                ) : (
                  <>
                    View {n.remaining} More Amendments
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </>
                )}
              </div>
            );
          }

          if (n.kind === "version") {
            const isSel = selectedIds.has(n.id);
            return (
              <Card
                key={n.id}
                x={n.x}
                y={n.y}
                w={n.w}
                kind="version"
                selected={isSel}
                showCollapse={n.hasChildren}
                collapsed={collapsed.has(n.id)}
                onToggleCollapse={() => toggleCollapse(n.id)}
                dimmed={n.dimmed}
              >
                <div data-no-pan className="bp-row">
                  <Checkbox
                    checked={isSel}
                    onChange={() => toggleSelect(n.id)}
                  />
                  <div className="bp-body">
                    <Chip kind="version" label={n.data.version} />
                    <div className="bp-title truncate">{n.data.title}</div>
                    {n.data.subtitle && (
                      <div className="bp-subtitle">{n.data.subtitle}</div>
                    )}
                  </div>
                </div>
              </Card>
            );
          }

          const isAmendSel = selectedAmendmentId === n.id;
          return (
            <Card
              key={n.id}
              x={n.x}
              y={n.y}
              w={n.w}
              kind="amendment"
              dimmed={n.dimmed}
              selected={isAmendSel}
              onClick={() => openAmendment(n)}
              noPan
            >
              <div className="bp-stack-tight">
                <Chip kind="amendment" label={n.data.label} />
                <div className="bp-title truncate">{n.data.title}</div>
                <div className="bp-subtitle truncate">{n.data.subtitle}</div>
              </div>
            </Card>
          );
        })}
      </div>

      <div data-no-pan className="bp-controls">
        <ControlBtn onClick={fitToView} title="Fit view">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </ControlBtn>
        <ControlBtn onClick={() => zoomBy(1.2)} title="Zoom in">
          ＋
        </ControlBtn>
        <ControlBtn onClick={() => zoomBy(1 / 1.2)} title="Zoom out">
          −
        </ControlBtn>
        <ControlBtn
          onClick={() => setEyeFiltered((f) => !f)}
          title={eyeFiltered ? "Show all branches" : "Show selected only"}
          active={eyeFiltered}
        >
          {eyeFiltered ? (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
              <line x1="3" y1="3" x2="21" y2="21" />
            </svg>
          )}
        </ControlBtn>
      </div>
    </div>

    <Offcanvas
      isOpen={offcanvasOpen}
      toggle={closeOffcanvas}
      direction="end"
      className="bp-amendment-offcanvas"
      backdrop={false}
    >
      <OffcanvasHeader toggle={closeOffcanvas} className="bp-offcanvas-header">
        {offcanvasHeader}
      </OffcanvasHeader>
      <OffcanvasBody className="bp-offcanvas-body">
        {offcanvasData && (
          <div className="bp-offcanvas-doc">
            <h3>3. CONTRACTED PRODUCTS AND PRICING</h3>
            <p>
              <strong>3.1 Contracted Products.</strong> The Contracted Products
              subject to this Agreement are those pharmaceutical products listed
              in Exhibit A hereto, which exhibit is incorporated herein by
              reference. All Contracted Products shall be classified under
              Category Identification Specialty Pharmaceuticals Zero Two and
              shall be effective from the Start Effective Date of August 1,
              2025, through the End Effective Date of July 31, 2028.
            </p>
            <p>
              <strong>3.2 Pricing Model.</strong> The pricing structure
              hereunder shall be based on a Value-Based Pricing model utilizing
              a four-tier structure based on Quarterly Sales Volume. The pricing
              category shall be designated as &quot;Negotiated Price for
              Specialty Pharmaceuticals&quot; and shall reference the Enhanced
              Formulary Price List.
            </p>
            <p>
              <strong>3.3 Tier Discount Structure.</strong> GPO Members shall
              be entitled to discounts from WAC Price based on their assigned
              Tier as follows:
            </p>
            <ul>
              <li>Tier 1: Eight percent (8%) discount from WAC Price</li>
              <li>Tier 2: Twelve percent (12%) discount from WAC Price</li>
              <li>Tier 3: Eighteen percent (18%) discount from WAC Price</li>
              <li>
                Tier 4: Twenty-five percent (25%) discount from WAC Price
              </li>
            </ul>
            <p>
              <strong>3.4 {offcanvasData.title}.</strong> Pursuant to this{" "}
              {offcanvasData.label}, the parties agree to the terms and
              conditions as set forth herein. All obligations arising under this
              amendment shall supersede any conflicting provisions in the
              original Agreement with respect to the subject matter hereof.
            </p>
          </div>
        )}
      </OffcanvasBody>
    </Offcanvas>
    </>
  );
}

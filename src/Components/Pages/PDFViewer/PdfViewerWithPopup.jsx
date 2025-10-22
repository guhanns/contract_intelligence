import React, { useState, useMemo, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import sample from "./Gen Pharma Agreement.pdf";
import { Modal, ModalBody, ModalHeader, Spinner } from "reactstrap";
import request from "../../../api/api";
import './pdfviewerwithpopup.css'
import { useTheme } from "../../../Themecontext";
import { useMsal } from "@azure/msal-react";
import toast from "react-hot-toast";
import { SquarePen } from "lucide-react";
import aiStar from "../../../images/icons/ai_star.svg"
import aiSummary from "../../../images/icons/ai_summary.svg"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewerWithPopup = ({ file, filename,contract,fetchList}) => {
  const { theme, toogleTheme } = useTheme();
  console.log(theme)
  const fileUrl = useMemo(() => file , [file]);
  const containerRef = useRef();

  const [numPages, setNumPages] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const { instance, accounts } = useMsal();
  const [popupPos, setPopupPos] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
   const [selectedPage, setSelectedPage] = useState(null);
  const [comment, setComment] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [isExplain, setIsExplain] = useState(false);
  const [isExplainLoad,setIsExplainLoad] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [extraction, setExtraction] = useState({});
  const [scale, setScale] = useState(1);

  const fetchCommentList =()=>{
      request({
        url:`/icontract/backend/redlining/comments/${contract?.id}`,
        method:"GET",
      }).then((res)=>{
        setHighlights(res.data)
      }).catch((err)=>{
        console.log(err)
      })
    }

  useEffect(()=>{
    if(contract?.id){
      fetchCommentList()
    }
  },[contract?.id])

  // ✅ Handle text selection & position
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    console.log(text)

    if (text && selection.rangeCount > 0) {
      const pageDiv = event.target.closest(".react-pdf__Page");
      if(pageDiv){
        const pageNum = pageDiv.getAttribute("data-page-number");
        setSelectedPage(pageNum);
      }
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const scrollY = containerRef.current.scrollTop;

      setSelectedText(text);
      setPopupPos({
        top: rect.top - containerRect.top + scrollY - 40,
        left: rect.left - containerRect.left + rect.width / 2,
        rect: {
          top: rect.top - containerRect.top + scrollY,
          left: rect.left - containerRect.left,
          width: rect.width,
          height: rect.height,
        },
      });

      setShowCommentBox(false);
    }

    


  };

  // ✅ Save comment & highlight text region
  const handleAddComment = () => {
    if (!comment.trim() || !selectedText) return;

    const newHighlight = {
      selected_text: selectedText,
      rect: popupPos.rect,
      comment,
      commented_by:accounts[0]?.name,
      section:selectedPage,
      action_type:'',
      id: contract?.id,
      color: "rgba(255, 255, 0, 0.2)", // yellow highlight
    };

    request({
      url:'/icontract/backend/redlining/comments',
      method:'POST',
      data:newHighlight
    }).then((res)=>{
        fetchCommentList()
        fetchList()
        toast.success("Comment Added");
        setSelectedText("");
        setComment("");
        setPopupPos(null);
        setShowCommentBox(false);
    }).catch((err)=>{
      console.log(err)
    })
  };

  // ✅ Explain feature
  const handleExplainThis = async () => {
    
    setIsExplainLoad(true)
    if (!selectedText.trim()) return;

    try {
      const res = await request({
        url: "/icontract/backend/clause_extraction",
        method: "GET",
        params: {
          query: selectedText,
          filename,
        },
      });

      if (res.success) {
        setIsExplain(true);
        setIsLoading(false);
        setExtraction(res);
        setIsExplainLoad(false)
      }
    } catch (error) {
      console.error("Explain API error:", error);
    } finally {
      setSelectedText("");
      setPopupPos(null);
    }
  };

  const handleCloseExtraction = () => {
    setIsExplain(false);
    setExtraction({});
    setIsLoading(true);
  };

  const handleMouseDown =()=>{
    setPopupPos(null)
    setSelectedText('')
  }





  return (
    <div
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflowY: "auto",
        background: "#f8f9fa",
        padding: "10px",
      }}
    >
      {/* PDF Document */}
      {fileUrl && (
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <div
              id={`page_${index + 1}`}
              key={index}
              style={{
                position: "relative",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Page pageNumber={index + 1} width={'800'} scale={scale}  />
            </div>
          ))}
        </Document>
      )}

      {/* Render highlights */}
      {highlights.map((h) => (
        <div
          key={h.id}
          title={h.comment}
          style={{
            position: "absolute",
            top: h.rect.top,
            left: h.rect.left,
            width: h.rect.width,
            height: h.rect.height,
            backgroundColor: h.color,
            borderRadius: "3px",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      ))}

      {/* Popup: Add Comment / Explain */}
      {selectedText && popupPos && !showCommentBox && (
        <div
          style={{
            position: "absolute",
            top: popupPos.top + 35,
            left: popupPos.left,
            transform: "translate(-50%, -110%)",
            backgroundColor: "var(--bg)",
            color: "var(--text)",
            borderRadius: "10px",
            padding: "8px 0",
            width: "180px",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleExplainThis}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text)",
              padding: "10px 16px",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
    (e.currentTarget.style.background =
      theme === "Dark" ? "#1e293b" : "#fefefeff") // Dark → slate bg, Light → light gray
  }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ fontSize: "16px" }}>
              <img src={aiStar} style={{ width: "20px", height: "20px" }} />
            </span>
            Explain this {isExplainLoad ? <Spinner size={8}/> : ""}
          </button>

          {isExplainLoad ? (
            ""
          ) : (
            <button
              onClick={() => setShowCommentBox(true)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text)",
                padding: "10px 16px",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                transition: "background 0.2s",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) =>
    (e.currentTarget.style.background =
      theme === "Dark" ? "#1e293b" : "#fefefeff") // Dark → slate bg, Light → light gray
  }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span style={{ fontSize: "16px" }}>
                {" "}
                <SquarePen color="#94969C" />
              </span>{" "}
              Mark with Notes
            </button>
          )}
        </div>
      )}

      {/* Comment Box */}
      {showCommentBox && popupPos && (
       <div
  style={{
    position: "absolute",
    top: popupPos.top,
    left: popupPos.left,
    transform: "translate(-50%, -100%)",
    background: "#111827", // dark gray background
    color: "#fff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
    zIndex: 10,
    padding: "16px",
    width: "280px",
    fontFamily: "Inter, sans-serif",
  }}
  onMouseDown={(e) => e.stopPropagation()}
>
  {/* Header */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
    }}
  >
    <div style={{ fontWeight: "600", fontSize: "14px" }}>
      Mark with Comments
    </div>
    <button
      onClick={() => {
        setSelectedText("");
        setPopupPos(null);
        setShowCommentBox(false);
      }}
      style={{
        background: "transparent",
        border: "none",
        color: "#9ca3af",
        fontSize: "16px",
        cursor: "pointer",
      }}
    >
      ×
    </button>
  </div>

  {/* Textarea */}
  <textarea
    rows={3}
    value={comment}
    placeholder="Type your comment..."
    onChange={(e) => {
      e.stopPropagation();
      setComment(e.target.value);
    }}
    style={{
      width: "100%",
      background: "#1f2937",
      color: "#fff",
      fontSize: "13px",
      padding: "8px",
      border: "1px solid #374151",
      borderRadius: "8px",
      resize: "none",
      outline: "none",
    }}
  />

  {/* Footer Buttons */}
  <div
    style={{
      marginTop: "14px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "8px",
    }}
  >
    <button
      onClick={() => {
        setSelectedText("");
        setPopupPos(null);
        setShowCommentBox(false);
      }}
      style={{
        background: "#1f2937",
        color: "#d1d5db",
        border: "1px solid #374151",
        borderRadius: "8px",
        padding: "6px 12px",
        cursor: "pointer",
        fontSize: "13px",
      }}
    >
      Cancel
    </button>
    <button
      onClick={handleAddComment}
      style={{
        background:
          "linear-gradient(90deg, #ec4899 0%, #8b5cf6 100%)", // pink → purple gradient
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "6px 12px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "13px",
      }}
    >
      Save Comments
    </button>
  </div>
</div>

      )}

      {/* Explain Modal */}
      <Modal
        isOpen={isExplain}
        toggle={handleCloseExtraction}
        centered
        zIndex={4000}
        size="md"
        style={{
          padding:'24px',
        }}
      >
        <ModalHeader toggle={handleCloseExtraction} className="Modal-head-explainthis">
          <img src={aiSummary} style={{width:'40px',height:'40px', marginRight:'8px'}}/>{`AI Summary`}
        </ModalHeader>
        <ModalBody className="Modal-body-explainthis">
          {isLoading ? "Loading..." : extraction?.llm_response}
        </ModalBody>
      </Modal>
      <Modal>
        <ModalHeader></ModalHeader>
      </Modal>
    </div>
  );
};

export default PdfViewerWithPopup;

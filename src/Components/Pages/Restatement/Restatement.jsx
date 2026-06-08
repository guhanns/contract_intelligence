import React, { useState } from "react";
import Layouts from "../Layouts/Layouts";
import { useNavigate } from "react-router-dom";
import "./restatement.css";

const documents = [
  {
    id: 1,
    name: "Health Innovations Partnership Agreement.Docx",
    docType: "GPO",
    customer: "PharmaTech Innovations",
    author: "Raj Kumar",
    generatedDate: "25 Dec 2025, 3:45 PM",
  },
  {
    id: 2,
    name: "Premier Health Alliance Agreement.Docx",
    docType: "IND",
    customer: "MediCore Solutions",
    author: "Arjun Mehta",
    generatedDate: "05 Jan 2025, 8:15 AM",
  },
  {
    id: 3,
    name: "Vitality Pharmaceuticals Contract.Docx",
    docType: "IDN",
    customer: "HealthPlus Pharmaceuticals",
    author: "Ravi Singh",
    generatedDate: "17 Feb 2025, 12:00 PM",
  },
  {
    id: 4,
    name: "CureTech Alliance Agreement.Docx",
    docType: "FSS",
    customer: "BioGenix Therapeutics",
    author: "Vikram Sharma",
    generatedDate: "30 Mar 2025, 6:30 PM",
  },
  {
    id: 5,
    name: "NextGen Health Contract.Docx",
    docType: "PHS",
    customer: "CureLab Pharmaceuticals",
    author: "Karan Joshi",
    generatedDate: "11 Apr 2025, 9:00 AM",
  },
  {
    id: 6,
    name: "PharmaSynergy Agreement.Docx",
    docType: "GPO",
    customer: "WellSpring Health",
    author: "Anil Gupta",
    generatedDate: "22 May 2025, 1:15 PM",
  },
  {
    id: 7,
    name: "MediCore Partnership Document.Docx",
    docType: "IND",
    customer: "NovaPharm Industries",
    author: "Sanjay Patel",
    generatedDate: "22 May 2025, 1:15 PM",
  },
  {
    id: 8,
    name: "BioHealth Alliance Contract.Docx",
    docType: "IDN",
    customer: "VitaPharm Technologies",
    author: "Sanjay Patel",
    generatedDate: "14 Jun 2025, 4:00 PM",
  },
  {
    id: 9,
    name: "HealthBridge Agreement.Docx",
    docType: "FSS",
    customer: "PharmaWave Solutions",
    author: "Deepak Verma",
    generatedDate: "28 Jul 2025, 7:45 AM",
  },
  {
    id: 10,
    name: "CareFirst Alliance Contract.Docx",
    docType: "GPO",
    customer: "CureTech Innovations",
    author: "Rohan Desai",
    generatedDate: "03 Oct 2025, 5:15 AM",
  },
  {
    id: 11,
    name: "PharmaConnect Collaboration Document.Docx",
    docType: "PHS",
    customer: "PharmaWave Solutions",
    author: "Neel Choudhary",
    generatedDate: "09 Aug 2025, 10:30 PM",
  },
  {
    id: 12,
    name: "WellSpring Health Partnership Agreement.Docx",
    docType: "GPO",
    customer: "OptiMed Healthcare",
    author: "Amit Bansal",
    generatedDate: "21 Sep 2025, 2:00 PM",
  },
  {
    id: 13,
    name: "CareFirst Alliance Contract.Docx",
    docType: "GPO",
    customer: "CureTech Innovations",
    author: "Rohan Desai",
    generatedDate: "03 Oct 2025, 5:15 AM",
  },
];

const Restatement = () => {

  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleClear = () => {
    setSelectedId(null);
  };

 

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layouts>
          <div className="restatement-container">
      {/* Top Header */}
      <div className="restatement-header">
        <h2 className="restatement-title">Restatement</h2>
        <div className="restatement-header-actions">
          {selectedId !== null && (
            <>
              <button className="btn-clear" onClick={handleClear}>
                Clear
              </button>
              <button className="btn-show-branches"   onClick={() => navigate("/restatement/branches")}>
                Show Branches
              </button>
            </>
          )}
          <button className="btn-menu" aria-label="More options">
            <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
              <circle cx="2" cy="8" r="1.5" fill="currentColor" />
              <circle cx="2" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sub Header */}
      <div className="restatement-subheader">
        <h3 className="subtitle">Select Base Document</h3>
        <div className="search-wrapper">
          <svg
            className="search-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Type Document Name, Version, Document Type..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <div className="table-inner">
          <table className="restatement-table">
            <thead>
              <tr>
                <th className="col-radio"></th>
                <th>Document Name</th>
                <th>Doc Type</th>
                <th>Customer</th>
                <th>Author</th>
                <th>Generated Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => (
                <tr
                  key={doc.id}
                  className={selectedId === doc.id ? "row-selected" : ""}
                  onClick={() => handleSelect(doc.id)}
                >
                  <td className="col-radio">
                    <label className="radio-wrapper">
                      <input
                        type="radio"
                        name="document"
                        checked={selectedId === doc.id}
                        onChange={() => handleSelect(doc.id)}
                      />
                      <span className="radio-custom"></span>
                    </label>
                  </td>
                  <td className="col-name">{doc.name}</td>
                  <td>{doc.docType}</td>
                  <td>{doc.customer}</td>
                  <td>{doc.author}</td>
                  <td>{doc.generatedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Layouts>

  );
};

export default Restatement;
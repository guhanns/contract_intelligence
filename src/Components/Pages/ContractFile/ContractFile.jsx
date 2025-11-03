import React, { useEffect, useRef, useState } from "react";
import Layouts from "../Layouts/Layouts";
import "./contractfile.css";
import { Col, Row } from "reactstrap";
import uploadLight from "./../../../images/icons/uploadlight.svg";
import uploadImg from "../../../images/icons/upload-ico.svg";
import editImg from "../../../images/icons/edit-02.svg";
import minusImg from "../../../images/icons/minus-circle.svg";
import addFiles from "../../../images/icons/add_files.svg";
import fileImg from "../../../images/icons/file-06.svg";
import fileCheckImg from "../../../images/icons/file-check.svg";
import fileSearchImg from "../../../images/icons/file-search.svg";
import { useLocation, useNavigate } from "react-router-dom";
import request, { NodeURL } from "../../../api/api";
import axios from "axios";
import { useDispatch } from "react-redux";
import { saveContracts } from "../../redux/features/contractSlice";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useTheme } from "../../../Themecontext";
import { useMsal } from "@azure/msal-react";
import TableSkeleton from "../../Skeleton-loading/TableSkeloton";
import upload_doc from "../../../images/upload_icons/upload_doc.svg";
import purpleUpload from './../../../images/upload_icons/upload_doc_light1.svg';
function ContractFile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [contractList, setContractList] = useState([]);
  const { theme, toogleTheme } = useTheme();
  const { accounts } = useMsal();

  const [isExtracting, setIsExtracting] = useState(false);
  const isProcessed = useRef(false);

  // Get current logged-in user from SSO
  const currentUser = accounts.length > 0 ? accounts[0] : null;
  const userName = currentUser
    ? currentUser.name || currentUser.username || "Unknown User"
    : "Anonymous User";

  const getContractList = async () => {
    setIsLoading(true);
    request({
      url: "/icontract/backend/columns/names",
      method: "GET",
    })
      .then((res) => {
        setIsLoading(false);
        setContractList(res.data);
        dispatch(saveContracts(res.data));
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        setIsError(true)
      });
  };

  useEffect(() => {
    getContractList();

    if (
      !isProcessed.current &&
      location?.state?.fromUpload &&
      location?.state?.files?.length > 0
    ) {
      isProcessed.current = true;
      const extractContracts = async () => {
        setIsExtracting(true);

        for (const li of location?.state?.uploadResults) {
          const formData = new FormData();
          formData.append("s3_filename", li?.s3Filename);
          formData.append("author", userName); // Pass actual SSO user to Text Extractor

          try {
            await axios.post(
              `${NodeURL}/icontract/text_extractor/process_contract`,
              formData
            );
          } catch (err) {
            console.error("Extraction failed for:", li?.s3Filename);
            toast.error(`Failed to extract: ${li?.s3Filename}`);
          }
        }

        setIsExtracting(false);
        toast.success("Extraction completed");
        navigate("/list", { replace: true, state: {} });
        getContractList(); // 🔁 refresh list
      };

      setTimeout(() => {
        extractContracts();
      }, 2000);
    }
  }, []);

  const sendtoPreview = (contract, version) => {
    navigate("/list/preview", {
      state: { contractNum: contract, version: version },
    });
  };


   const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    const newFiles = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      type,
      progress: 0,
    }));

   navigate('/list/upload',{state:{file:newFiles}})
  };

  return (
    <Layouts>
      <div className="contract-file-list">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            {contractList?.length > 0 ? (
              <>
                <div className="list-head">
                  <h5>{contractList?.length} Contract Documents</h5>
                  <div className="d-flex align-items-center">
                    <div className="me-4">
                      <Row>
                        {/* <Col lg="4">
                        <div className="total-contract ">
                          <div className="count-round blue">
                            <img src={fileImg} />
                          </div>
                          <div className="count-result">
                            <h5 className="head">Total Contract</h5>
                            <h3 className="result">{contractList?.length}</h3>
                          </div>
                        </div>
                      </Col> */}
                        <Col>
                          <div className="total-contract">
                            <div className="count-round green">
                              <img src={fileCheckImg} />
                            </div>
                            <div className="count-result">
                              <h5 className="head">Ready for Review</h5>
                              <h3 className="result">{contractList?.length}</h3>
                            </div>
                          </div>
                        </Col>
                        <Col>
                          <div className="total-contract ">
                            <div className="count-round orange">
                              <img src={fileSearchImg} />
                            </div>
                            <div className="count-result">
                              <h5 className="head">Processing Contracts</h5>
                              <h3 className="result">
                                {location?.state?.files?.length ?? 0}
                              </h3>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </div>
                    <div>
                      <button
                        className="contract-upld-btn"
                        onClick={() => navigate("/list/upload")}
                      >
                        <img src={theme === "Dark" ? uploadImg : uploadLight} />
                        Upload More Docs
                      </button>
                    </div>
                  </div>
                </div>
                <div className="table-list-contract">
                  <table className="Table-contract-list">
                    <thead>
                      <tr className="table-row">
                        {/* <th scope="col" className="check-box-table">
                        <input type="checkbox" />
                      </th> */}
                        <th scope="col" className="doc-box">
                          Document Name
                        </th>
                        <th scope="col text-center" className="id-box">
                          Document ID
                        </th>
                        <th scope="col text-center" className="type-box">
                          Doc Type
                        </th>
                        <th scope="col text-center" className="ver-box">
                          Ver. Number
                        </th>
                        <th scope="col text-center" className="ver-box">
                          Start Date
                        </th>
                        <th scope="col text-center" className="ver-box">
                          End Date
                        </th>
                        <th scope="col text-center" className="ver-box">
                          Customer
                        </th>
                        <th scope="col text-center" className="ver-box">
                          Author
                        </th>
                        <th scope="col text-center" className="ver-box">
                          Created On
                        </th>
                        <th scope="col text-center" className="status-box">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Show analyzing rows while extracting */}
                      {isExtracting &&
                        location?.state?.files?.length > 0 &&
                        location?.state?.files?.map((li) => (
                          <tr
                            className="contract-result-list"
                            key={li?.file?.name}
                          >
                            <td className="doc-box">{li?.file?.name}</td>
                            <td className="id-box text-center">-</td>
                            <td className="type-box text-center">-</td>
                            <td className="ver-box text-center">-</td>
                            <td className="ver-box text-center">-</td>
                            <td className="ver-box text-center">-</td>
                            <td className="ver-box text-center">-</td>
                            <td className="ver-box text-center">-</td>
                            <td className="ver-box text-center">-</td>
                            <td className="status-box text-center">
                              <span className="analyse">
                                Analyzing Document...
                              </span>
                            </td>
                          </tr>
                        ))}

                      {/* Show contracts list if available */}
                      {contractList?.length > 0 &&
                        contractList.map((doc) => (
                          <tr
                            key={
                              doc?.contract_number +
                              "-" +
                              doc?.document_version_number
                            }
                            onClick={() =>
                              sendtoPreview(
                                doc?.contract_number,
                                doc?.document_version_number
                              )
                            }
                            className="contract-result-list"
                          >
                            <td className="doc-box">{doc?.document_name}</td>
                            <td className="id-box text-center">
                              {doc?.contract_number}
                            </td>
                            <td className="type-box text-center">
                              {doc?.document_type}
                            </td>
                            <td className="ver-box text-center">
                              {doc?.document_version_number}
                            </td>
                            <td className="ver-box text-center">
                              {doc?.start_date}
                            </td>
                            <td className="ver-box text-center">
                              {doc?.end_date}
                            </td>
                            <td className="ver-box text-center">
                              {doc?.owner}
                            </td>
                            <td className="ver-box text-center">
                              {doc?.author}
                            </td>
                            <td className="ver-box text-center">
                              {doc?.created_at &&
                                format(new Date(doc?.created_at), "dd-MM-yyyy")}
                            </td>
                            <td className="status-box text-center">
                              <span className="review">
                                {doc?.document_status === "Active"
                                  ? "Ready for Review"
                                  : ""}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div className="contract-list-err">
                  {
                    isError ? <>
                       <h4>We couldn’t load your contracts</h4>
                        <h6>Please refresh the page or try again later.</h6>
                    </> : <>
                    <h4>No Contract Found</h4>
                  <h6>Try adjusting your filters or upload a new contract.</h6>
                  <div class="upload-box contract-files-upload">
                    <label
                      for="contractUpload"
                      class="upload-area"
                      style={{ height: 50 }}
                    >
                      <img
                        src={theme === "Dark" ? upload_doc : purpleUpload}
                        className="upload-img"
                      />
                      <span class="text-white-50">
                        <u className="dottedbox-upload-content">
                          Upload Contract Documents
                        </u>
                      </span>
                      <input
                        type="file"
                        id="contractUpload"
                        class="d-none upload-input"
                        accept="application/pdf"
                        multiple
                        onChange={(e) => handleFileChange(e, "contract")}
                      />
                    </label>
                  </div>
                    </>
                  }
                  
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layouts>
  );
}

export default ContractFile;

import React, { useEffect, useState } from "react";
import Layouts from "../Layouts/Layouts";
import "./upload.css";
import upload_doc from "../../../images/upload_icons/upload_doc.svg";
import trash from "../../../images/icons/trash-01.svg";
// import uploadImg from "../../../images/icons/upload.svg";
import fileImg from "../../../images/icons/contract-file.svg";
import { useLocation, useNavigate } from "react-router-dom";
import request, { NodeURL } from "../../../api/api";
import toast from "react-hot-toast";
import axios from "axios";
import arrow_narrow_left from "../../../images/icons/arrow-narrow-left.svg";
import purpleUpload from './../../../images/upload_icons/upload_doc_light1.svg';
import { useTheme } from "../../../Themecontext";
import filelight from './../../../images/upload_icons/fileLight.svg'
import filedark from './../../../images/upload_icons/fileDark.svg'
import trashdark from'./../../../images/upload_icons/trashDark.svg'
import trashlight from'./../../../images/upload_icons/trashLight.svg'
import uploadImg from "./../../../images/icons/upload-icon-intelli.svg";
import { useMsal } from "@azure/msal-react";

function Upload() {
  const navigate = useNavigate();
  const location = useLocation()
  const [files, setFiles] = useState([]);
  const [isUpload,setIsUpload] = useState(false)
    const { theme, toogleTheme } = useTheme();
    const { accounts } = useMsal();
 
  // Get current logged-in user from SSO
  const currentUser = accounts.length > 0 ? accounts[0] : null;
  const userName = currentUser ? (currentUser.name || currentUser.username || 'Unknown User') : 'Anonymous User';
  

  const [uploadProgress, setUploadProgress] = useState({
    price: 0,
    contract: 0,
  });

  useEffect(()=>{
    if(location?.state?.file){

      setFiles(location?.state?.file)
      location?.state?.file.forEach((fileObj) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setFiles((prevFiles) =>
          prevFiles.map((f) => (f.id === fileObj.id ? { ...f, progress } : f))
        );
        if (progress >= 100) clearInterval(interval);
      }, 200);
    });
    }
  },[location?.state?.file])

  console.log(files)


  const handleFileChange = (e, type) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    const newFiles = selectedFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      type,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((fileObj) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setFiles((prevFiles) =>
          prevFiles.map((f) => (f.id === fileObj.id ? { ...f, progress } : f))
        );
        if (progress >= 100) clearInterval(interval);
      }, 200);
    });
  };

  const removeFile = (id) => {
  setFiles((prev) => prev.filter((f) => f.id !== id));
};

  // const handleUpload = async() => {
  //   toast.loading("Uploading...", {
  //     duration: Infinity,
  //   });

  //   if (files.length<=0) {
  //     return alert("Please upload file");
  //   }

   

  //   files.forEach(async (li) => {
  //     const formData = new FormData();
  //     formData.append("file", li.file);

  //     await axios.post("http://localhost:8006/icontract/process_contract",formData)
  //     .then((res)=>{
  //       toast.remove();
  //         toast.success("Extraction Completed");
  //     }).catch((err)=>{
  //       console.log(err)
  //     })

  //     await axios
  //       .post(
  //         "http://localhost:8006/icontract/backend/uploadtos3",
  //         formData
  //       )
  //       .then((res) => {
  //         console.log(res);
  //         toast.remove();
  //         toast.success("Upload Completed");
  //         navigate('/list')
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   });


    
  // };

const handleUpload = async () => {
  setIsUpload(true);

  if (files.length <= 0) {
    return alert("Please upload file");
  }

  toast.loading("Uploading...", { duration: Infinity });

  try {
    // Upload all files to S3
    const uploadResults = await Promise.all(
      files.map(async (li) => {
        const formData = new FormData();
        formData.append("file", li.file);
        formData.append("author", userName); // Use actual SSO logged-in user
        const response = await axios.post(`${NodeURL}/icontract/backend/uploadtos3`, formData);
        return {
          originalFile: li,
          s3Filename: response.data.uploaded_filename
        };
      })
    );

    toast.dismiss();
    toast.success("Upload Completed");

    //Navigate immediately after upload
    navigate("/list", { state: { fromUpload: true, files ,uploadResults} });
  } catch (err) {
    console.error("Upload failed:", err);
    toast.dismiss();
    toast.error("Upload failed");
  }
};



  return (
    <Layouts>
      <div className="upload-head-back upload-back">
                  <h5 onClick={() => navigate(-1)} style={{cursor:"pointer"}}>
                    <img src={arrow_narrow_left} />
                    Back
                  </h5>
                </div>
      <div class="container text-center upload-main-box">
        <h2 class="upload-name">Upload Documents</h2>
        <p class="upload-info">
          Your documents should be uploaded as a PDF file (maximum size 100MB).
        </p>
        <>
          <div class="upload-box">
            <label for="contractUpload" class="upload-area" style={{height:50}}>
              <img src={theme==="Dark"? upload_doc :purpleUpload} className="upload-img"/>
              <span class="text-white-50">
                <span className="dottedbox-upload-content">Upload Contract Documents</span>
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
          <div className="upload-list-box">
            {files
              .filter((f) => f.type === "contract")
              .map((fileObj) => (
                <div
                  key={fileObj.id}
                  className=" bg-opacity-10 p-3 rounded mb-3 uploaded-box"
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center uploaded-doc">
                      <div className="me-2">
                        <img src={theme==="Light"? filelight:filedark} className="file-img" />
                      </div>
                      <span className="uploaded-file-name">
                        Contract Document: {fileObj.file.name}
                      </span>
                    </div>
                    <small className={theme==='Dark'?'text-white':'text-dark'}>
                      <i>
                        {fileObj.progress === 100 ? (
                          <div className="trash-round">
                            <img
                              src={theme==="Light"?trashlight:trashdark}
                              className="trash-img"
                              onClick={() => removeFile(fileObj.id)}
                            />
                          </div>
                        ) : (
                          `${fileObj.progress}% uploaded...`
                        )}
                      </i>
                    </small>
                  </div>
                  {fileObj.progress < 100 && (
                    <div className="progress mt-2">
                      <div
                        className="progress-bar bg-gradient"
                        style={{ width: `${fileObj.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </>

        {/* {files.price ? (
           <div class="bg-secondary bg-opacity-10 p-3 rounded mb-3 uploaded-box ">
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <div className="me-2">
                    <img src={fileImg} className="file-img"/>
                    </div>
                  <span class="text-white-50">
                    Pricing Document: {files?.price?.name}
                  </span>
                </div>
                <small class="text-white">
                  <i>
                    {uploadProgress.price === 100 ? (
                      <img src={trash} className="trash-img" onClick={()=>removeFile('price')}/>
                    ) : (
                      `${uploadProgress.price}% uploaded...`
                    )}
                  </i>
                </small>
              </div>
              {uploadProgress.price < 100 && (
                <div class="progress mt-2">
                  <div
                    class="progress-bar bg-gradient"
                    style={{ width: `${uploadProgress.price}%` }}
                  ></div>
                </div>
              )}
            </div>
        ) : (
          <div class="upload-box">
            <label for="priceUpload" class="upload-area">
              <img src={upload_doc} />
              <p class="mt-2 text-white-50">
                <u>Upload your List Price Document</u>
              </p>
              <input
                type="file"
                id="priceUpload"
                class="d-none  upload-input"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, "price")}
              />
            </label>
          </div>
        )} */}

        {/* <div class="upload-box">
            <label for="priceUpload" class="upload-area">
              <img src={upload_doc} />
              <p class="mt-2 text-white-50">
                <u>Upload your List Price Document</u>
              </p>
              <input
                type="file"
                id="priceUpload"
                class="d-none  upload-input"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, "price")}
              />
            </label>
          </div> */}
      </div>
      <div className="text-center">
        {files.length > 0 ? (
          <button class="upload-btn" disabled={isUpload} onClick={() => handleUpload()}>
            <img src={uploadImg} /> Upload
          </button>
        ) : (
          ""
        )}
      </div>

      {/* <div class="container text-center upload-main-box">
         <h2 class="upload-name">Upload Documents</h2>
        <p class="upload-info">
          Your documents should be uploaded as a PDF file (maximum size 100MB).
        </p>

        <div class="d-flex align-items-center justify-content-between bg-secondary bg-opacity-10 p-3 rounded mb-2 uploaded-box ">
          <div class="d-flex align-items-center">
            <i class="bi bi-file-earmark-pdf fs-4 me-2 text-white-50"></i>
            <span class="text-white-50">Contract Document: SM125678.PDF</span>
          </div>
          <img src={trash} />
        </div>

        <div class="bg-secondary bg-opacity-10 p-3 rounded mb-3 uploaded-box ">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-pdf fs-4 me-2 text-white-50"></i>
              <span class="text-white-50">Price Document: SM125598.PDF</span>
            </div>
            <small class="text-white"><i>75% uploaded...</i></small>
          </div>
          <div class="progress mt-2">
            <div
              class="progress-bar bg-gradient"
            ></div>
          </div>
        </div>

        <button class="upload-btn">
          <img src={uploadImg}/> Upload
        </button>
      </div> */}
    </Layouts>
  );
}

export default Upload;

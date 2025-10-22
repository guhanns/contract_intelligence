import React, { useEffect, useRef, useState, version } from "react";
import Layouts from "../Pages/Layouts/Layouts";
import "./preview.css";
import classnames from "classnames";
import loadingImg from "../../images/icons/Group 3.svg";
import lightLoading from "../../images/icons/lightLoading.svg";
import fileImg from "../../images/icons/Excel-default.svg";
import xmlImg from "../../images/icons/file-02.svg";
import arrow_narrow_left from "../../images/icons/arrow-narrow-left.svg";
import left_arrow from "../../images/icons/left-arrow.svg";
import right_arrow from "../../images/icons/right-arrow.svg";
import logo from "../../images/icons/SRM_chat-logo.svg";
import externalLink from "../../images/icons/external-link.svg";
import refreshimg from "../../images/icons/refresh.svg";
import refreshLightimg from "../../images/icons/refresh-light.svg";
import layoutLeft from "../../images/icons/layout-left.svg";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import { truncate } from "lodash";
import DatePicker from "react-datepicker";
import {Calendar, CircleAlert, CircleCheckBig, EllipsisVertical, Pencil, TriangleAlert} from  'lucide-react'

import contractPdf from "./SRM Pharma Contract.pdf";
import pricingPdf from "./Product_Pricing_Table.pdf";

// import demoexcel from "./ContractEntities.xlsx";

import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Button,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
  Row,
  TabContent,
  TabPane,
  Tooltip,
  UncontrolledDropdown,
  UncontrolledTooltip,
} from "reactstrap";
import toast from "react-hot-toast";
import request, { NodeURL } from "../../api/api";
import { useLocation, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../Themecontext";
import chatAi from '../../images/icons/chat_entities.svg';
import { useMsal } from "@azure/msal-react";
import { addMessageByBot, addMessageByUser, clearChat } from "../redux/features/previewChat";
import { format, getTime, isToday, isYesterday } from "date-fns";
import Select from "react-select";
import { colourStyles } from "../Pages/ContractList/ContractListNew";
import PdfViewerWithPopup from "../Pages/PDFViewer/PdfViewerWithPopup";
import closeImg from "../../images/icons/x-comments.svg";
import avatar from "../../images/icons/Avatar-comment.svg";
import dots from "../../images/icons/dots-vertical-comment.svg";
import Avatar from "@mui/material/Avatar";

const docTypeOption = [
    {
        label:'Group (GROUP)',
        value:'GPO'
    },
    {
        label:'Independent Customer Contract (IND)',
        value:'IND'
    },
    {
        label:'IDN Buying Group Contract (IDN)',
        value:'IDN'
    },
    {
        label:'FSS Contract',
        value:'FSS'
    },
    {
        label:'PHS Contract',
        value:'PHS'
    },
    {
        label:'Master Contract (MA)',
        value:'MA'
    },
    {
        label:'Institutional Contract (INST)',
        value:'INST'
    },
    {
        label:'Managed Care Contract (MCO)',
        value:'MCO'
    },
    {
        label:'Medicare (MCARE)',
        value:'MCARE'
    }
]

const pricingOption = [
    {
        label:'Fixed Pricing Method (FIXED)',
        value:'FIXED'
    },
    {
        label:'List Pricing Method (LIST)',
        value:'LIST'
    },
    {
        label:'Discount-Off-List Pricing Method (DOL)',
        value:'DOL'
    },
    {
        label:'Tiered Pricing Method (TIER)',
        value:'TIER'
    },
    {
        label:'Dynamic Discount Off List Pricing Method (DDOL)',
        value:'DDOL'
    },
    {
        label:'Dynamic Tiered Pricing Method (DTIER)',
        value:'DTIER'
    },
    {
        label:'Order Quantity (OOD)',
        value:'OOD'
    },
]

const contractStatus = [
  {
    label:'Implemented',
    value:'Active'
  },
  {
    label:"Expired",
    value:"Expired"
  },
  {
    label:"Terminated",
    value:"Terminated"
  },
  {
    label:"Draft",
    value:"Draft"
  }

]

const adjustOption =[
  {
    label:'Percentage(%)',
    value:'%'
  },
  {
    label:'Dollars($)',
    value:'$'
  }
]

const sourceOption =[
  {
    label:'New',
    value:'New'
  },
  {
    label:'Amendment',
    value:'Amendment'
  }
]

const accordionData = [
  {
    name: "Contract Offer",
    data: Object.entries({
      author: "Admnistrator",
      customer: "39882",
      startDate: "7/1/2025",
      endDate: "6/30/2028",
      "document Id": "SM23457890",
      "document Name": "Premier Health Alliance Agreement",
      "document Type": "GPO",
      "document Status": "Active",
      "document Version Number": "DOC1.0",
      "document Version Creation Date": "5/23/2025",
      owner: "Administrator",
      "program Only": false,
      "source Type": "New",
    }),
  },
  // {
  //   name: "Business Segment",
  //   data: Object.entries({
  //     'import Action': "add Modify",
  //     'business Segment Template Name': "Business Segment",
  //     'section Name': "Business Segment",
  //   }),
  // },
  {
    name: "Product Group",
    data: Object.entries({
      "adjust By": "%",
      "category Pricing": "Pricing",
      "price List Name": "WAC",
      "pricing Method": "Tier",
      "number Of Tiers": 3,
    }),
  },
  {
    name: "Tiered LI",
    data: Object.entries({
      " base Price": "$20,000",
      "product Number": "PR456678",
      "direct Or Indirect": "DIRECT",
      "minimum Order Quantity": 50000,
      "minimum Order Block": true,
      minimumOrderPenalty: "$2,500",
    }),
  },
];

export const loadingStatus = [
  "Analyzing your PDF...",
  "Looking for key data points and patterns…",
  "Extracting contract offer, business segment, product group, Tired LI summary...",
  "Smart AI is reading between the lines…",
  "Ensuring accuracy before showing results…",
  "Ready! Loading your insights…",
];

const sections = [
  {
    title: '1. Introduction and General',
    subsections: [
      '1.1 Purpose and Scope',
      '1.2 Parties to the Agreement',
      '1.3 Key Definitions (Glossary)',
      '1.4 Term, Termination, Renewal'
    ]
  },
  { title: '2. Administrative Services', subsections: [] },
  { title: '3. Claims Processing and Payment', subsections: [] },
  { title: '4. Pharmacy Network Management', subsections: [] },
  { title: '5. Formulary and Drug Utilization Review', subsections: [] },
  { title: '6. Clinical and Specialty Programs', subsections: [] },
  { title: '7. Financial Terms and Payment', subsections: [] },
  { title: '8. Manufacturer Rebates', subsections: [] }
];

export const formatMessageTime = (date) => {
  const now = new Date();
  const messageDate = new Date(date);

  const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  } else if (isToday(messageDate)) {
    return format(messageDate, "'Today', hh:mm a");
  } else if (isYesterday(messageDate)) {
    return format(messageDate, "'Yesterday', hh:mm a");
  } else {
    return format(messageDate, "dd MMM yyyy, hh:mm a");
  }
};

function Preview() {
  const iframeRef = useRef(null);
  const location = useLocation();
  const dispatch = useDispatch()
  const chatEndRef = useRef(null);
  const contractsData = useSelector((state)=>state.contract.contracts)
  const { chatMessages } = useSelector((state) => state.preview);
  const [versionList,setVersionList] = useState([])
  const [versionOpt,setVersionOpt] = useState([])
   const { theme, toogleTheme } = useTheme();
    const { instance, accounts } = useMsal();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSection,setIsSection] = useState(false)
  const [histLoading,setHistLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("1");
  const [accordionOpen, setAccordionOpen] = useState("");
  const [responseData, setResponseData] = useState({});
  const [contractOffer, setContractOffer] = useState([]);
  const [contractOfferWithScore, setContractOfferWithScore] = useState([]);
  const [productGroup, setProductGroup] = useState([]);
  const [tierDataProduct, setTierDataProduct] = useState([]);
  const [sendMessage, setSendMessage] = useState("");
  const [tierSummary,setTierSummary] = useState()
  const [tierSummaryWithScore,setTierSummaryWithScore] = useState()
  const [isChat,setIsChat] = useState(false)
  const [isChanges,setIsChanges] = useState(false)
  const [isViewEntities,setIsViewEntities] = useState(true)
  const [isComments,setIsComments] = useState(false)
  const { files } = location.state || {};
   const [sampleQ,setSampleQ] = useState([])
   const [commentsList,setCommentsList] = useState([])
   const [isTierWarning,setIsTierWarning] = useState(false)
   const [isTierEdit,setIsTierEdit] = useState(false)
   const [editTierData,setEditTierData] = useState({})

  const [contractUrl, setContractUrl] = useState("");
  const [url, setUrl] = useState("");
  const [statusIndex, setStatusIndex] = useState(0);
  const [historyList,setHistoryList] = useState({})
  const [summaryList,setSummaryList] = useState({})
  const [open, setOpen] = useState('0');
  const [isEdit,setIsEdit] = useState(false)
  const [editEntitie,setEditEntitie] =useState({
    key:'',
    value:'',
    comment:''
  })


  const toggleSectionAcc = id => {
    open === id ? setOpen() : setOpen(id);
  };

// Modal Open for edit Entity
  const toggleEditEntity =() =>{
    setIsEdit(!isEdit)
  }

//Which entity we are editing saving the key and value
  const editEntities =(key,value) =>{
    setEditEntitie({
      ...editEntitie,
      key,
      value
    })
    setIsEdit(!isEdit)
  }


  const handleEntities =()=>{
    setIsChat(false)
    setIsChanges(false)
    setIsViewEntities(true)
  }

  const handleChat =()=>{
    setIsChat(true)
    setIsChanges(false)
    setIsViewEntities(false)
  }

  const handleChanges =()=>{
     setIsChat(false)
    setIsChanges(true)
    setIsViewEntities(false)
  }

  const handleViewComments =() =>{
     setIsChat(false)
    setIsChanges(false)
    setIsViewEntities(false)
    setIsComments(true)
  }

  const fetchCommentList =()=>{
    request({
      url:`/icontract/backend/redlining/comments/${contractOffer?.id}`,
      method:"GET",
    }).then((res)=>{
      setCommentsList(res.data)
    }).catch((err)=>{
      console.log(err)
    })
  }

  useEffect(()=>{
    if(contractOffer?.id){
      fetchCommentList()
    }
  },[contractOffer?.id])

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setStatusIndex((prevIndex) => (prevIndex + 1) % loadingStatus.length);
    }, 8000); // 10 seconds

    return () => clearInterval(interval); // cleanup
  }, [isLoading]);

  const toggle = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const toggleAccordion = (id) => {
    if (accordionOpen.includes(id)) {
      setAccordionOpen((prev) => prev.filter((item) => item !== id)); // remove if already open
    } else {
      setAccordionOpen((prev) => [...prev, id]); // add if not open
    }
  };

  // useEffect(() => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     setIsLoading(false);
  //   }, 2000);
  // }, []);

  useEffect(() => {
    if (location?.state?.pricing) {
      setTierData(location?.state?.pricing);
    }
  }, [location]);


  const getVersionList = async(contract_number,version)=>{
   axios
      .get(`${NodeURL}/icontract/backend/contract_versions/${contract_number}`)
      .then((res) => {
        if(res?.data?.success){
          let filteredVersion = res.data?.versions.filter((li)=>{
            return li.document_version_number !== Number(version)
          })
          setVersionList(filteredVersion);
          setVersionOpt(filteredVersion.map((li)=>{
            return {
              lable: `${li.contract_number} - v${li.document_version_number}`,
              value: li
            }
          }))
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }


 
  const fetchContract = async (contract_num,version) => {
    axios
      .get(`${NodeURL}/icontract/backend/AllColumns/${contract_num}/${version}`)
      .then((res) => {
        setIsLoading(false)
        setContractOffer(res?.data?.contracts[0]);
        setContractOfferWithScore(res?.data?.contract_details?.basic_info)
        setTierSummary(res?.data?.contract_details?.tier_structure)
        setTierDataProduct(res?.data?.products)
        setUrl(res?.data?.file_info)
        dispatch(clearChat())
      })
      .catch((err) => {
        console.log(err);
      });
  };

 
  useEffect(() => {
    if (location?.state?.contractNum) {
      fetchContract(location?.state?.contractNum,location?.state?.version);
      getVersionList(location?.state?.contractNum,location?.state?.version)
    }
  }, [location?.state?.contractNum]);


  

//  const handleExport = () => {
    

//     const sheetData = [];

//     // Helper to push a section into sheetData
//     const pushSection = (title, data) => {
//       if (!data || data.length === 0) return;
//       sheetData.push([`=== ${title.toUpperCase()} ===`]); // Title
//       // sheetData.push(Object.keys(data));  
//       console.log(data)             // Header
//       Object.entries(data).forEach((item) => {
//         sheetData.push(Object.values(item));              // Rows
//       });
//       sheetData.push([]); // Empty row after section
//     };

//     // Build data into a single array
//     pushSection("Contracts", contractOffer);
//     pushSection("Tier Structures", tierSummary);
//     pushSection("Products", tierDataProduct);

//     // Convert to worksheet
//     const ws = XLSX.utils.aoa_to_sheet(sheetData);

//     // Create workbook and export
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Combined Data");

//     const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     const blob = new Blob([wbout], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });

//     saveAs(blob, `${url?.file_name}.xlsx`);
//   };

  const handleExport = () => {
  const sheetData = [];

  // Helper to push object or array section into sheetData
  const pushSection = (title, data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) return;

    sheetData.push([`${title.toUpperCase()}`]);

    if (Array.isArray(data)) {
      const headers = Object.keys(data[0] || {});
      sheetData.push(headers);
      data.forEach((item) => {
        sheetData.push(headers.map((key) => item[key]));
      });
    } else if (typeof data === "object") {
      const entries = Object.entries(data);
      // sheetData.push(["Key", "Value"]);
      entries.forEach(([key, value]) => {
        sheetData.push([key, typeof value === "object" ? JSON.stringify(value) : value]);
      });
    }

    sheetData.push([]); // Spacer row
  };

  // Push each section
  pushSection("Contracts", contractOffer);
  pushSection("Tier Structures", tierSummary);
  // pushSection("Products", tierDataProduct);

  // Convert to worksheet
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Create and append workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Combined Data");

  // Write and download
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const filename = url?.file_name?.split('.')[0] || "exported_data";
  saveAs(blob, `${filename}.xlsx`);
};

  const prevContract =()=>{
    
    let currentIndex = contractsData?.findIndex(
      (list) =>
        list.contract_number === location?.state?.contractNum &&
        list.document_version_number === location?.state?.version
    );
    let nextIndex = currentIndex === 0 ? Number(1) : currentIndex - 1;
    if(currentIndex!==0){
      navigate('/list/preview',{state:{contractNum:contractsData[nextIndex]?.contract_number,version:contractsData[nextIndex]?.document_version_number}})
    }
  }


  const nextContract =()=>{
    
    let currentIndex = contractsData?.findIndex((list)=>list.contract_number === location?.state?.contractNum &&
        list.document_version_number === location?.state?.version)
    let nextIndex = currentIndex+1
    if(nextIndex !== contractsData.length){
      navigate('/list/preview',{state:{contractNum:contractsData[nextIndex]?.contract_number,version:contractsData[nextIndex]?.document_version_number}})
    }
  }

  const handleCompare = (value) => {
    navigate("/comparison", {
      state: {
        contract_number: location?.state?.contractNum,
        version:location?.state?.version,
        compareVersion: value?.document_version_number,
        file:value?.file_info?.file_url,
        compareFile:url?.file_url,
        contract_path:value?.document_path
      },
    });
  };

  const handleChangeVerison = (value)=>{
    fetchContract(value?.contract_number,value?.document_version_number)
    setVersionOpt([])
    setVersionList([])
    getVersionList(value?.contract_number,value?.document_version_number)
    navigate('/list/preview',{state:{contractNum:value?.contract_number,version:value?.document_version_number}})
  }


   const chatMessage = (msg) => {
    setIsLoading(true);
    let question = sendMessage 
    if(msg){
      question = msg
    }
   
    if(!question) {
      return toast.error("Please Enter Something!")
    }
    setSendMessage("");
    dispatch(addMessageByUser(question));
    axios.post(`${NodeURL}/icontract/chatbot/chat_document/${url?.file_name}`,{user_query:question}).then((res) => {
        setIsLoading(false);
        
        // setMessages(res?.data?.);
        dispatch(addMessageByBot(res?.data))
      })
      .catch((err) => {
        console.log(err);
        setSendMessage('')
      });
  };


  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]) 



  const fetchChangeHistory = (contract,version) =>{

    if(versionList?.length > 0 ){
      setHistLoading(true)
      request({
      url:`/icontract/backend/change_history/${contract}/${Number(version)-1}/${version}`,
      method:'GET',
    }).then((res)=>{
      setHistLoading(false)
        setHistoryList(res?.change_history)
        setSummaryList(res?.change_summary)
    }).catch((err)=>{
      console.log(err)
    })
    }
  }

  useEffect(()=>{
    if(location?.state?.contractNum && location?.state?.version){
      fetchChangeHistory(location?.state?.contractNum,location?.state?.version)
    }
  },[location,versionList])

  const saveXmlFile = (xmlData) => {
  // If xmlData is already a string, skip stringify
  const xmlString = typeof xmlData === "string" ? xmlData : new XMLSerializer().serializeToString(xmlData);

  const blob = new Blob([xmlString], { type: "application/xml;charset=utf-8" });
  const filename = url?.file_name?.split('.')[0] || "exported_data";
  saveAs(blob, `${filename}.xml`); // download file as contract_data.xml
};


  const downloadAsXml =()=>{
    if(location?.state?.contractNum && location?.state?.version){
      
        request({
      url:'/icontract/backend/export_xml',
      method:'POST',
      data:{
        contract_number:location?.state?.contractNum,
        document_version_number:String(location?.state?.version)
      }
    }).then((res)=>{
      if(res){
        saveXmlFile(res)
      }
    }).catch((err)=>{
      console.log(err)
    })
    }
    
  }

  const toggleSection = () =>{
    setIsSection(!isSection)
  }

  

  const updateContract =()=>{
    const {key,value,comment} = editEntitie
    request({
      url:'/icontract/backend/contracts/update-and-comment',
      method:'POST',
      data:{
        id:contractOffer?.id,
        commented_by:accounts[0]?.name,
        comment:comment,
        [key]:value,
        new_value:value,
        old_value:contractOffer[key]
      }
    }).then((res)=>{
      toast.success("Entities Updated Successfully")
      setIsEdit(!isEdit)
      fetchContract(contractOffer?.contract_number,contractOffer?.document_version_number)
    }).catch((err)=>{
      console.log(err)
      toast.error("Entities not Updated")
    })
  }


  const handleMouseUp = () => {
    const iframe = iframeRef.current;
    const iframeWindow = iframe.contentWindow;
    const selectedText = iframeWindow.getSelection().toString();

    if (selectedText.trim()) {
      console.log("Selected text:", selectedText);

    }
  };


  const handleScrollToPage = (pageNum) => {
    const pageElement = document.getElementById(`page_${pageNum}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const editTierLevel =(data)=>{
    setIsTierWarning(true)
    setEditTierData(data)
  }

  const confirmEditTierLevl =()=>{
    setIsTierEdit(true)
    setIsTierWarning(false)
  }

   const handleEditTierData =()=>{
    const {comment}=editTierData
    console.log(editTierData)
    toast.loading('Updating..')
    request({
      url:'/icontract/backend/contracts/update-and-comment',
      method:'POST',
      data:{
        id:contractOffer?.id,
        commented_by:accounts[0]?.name,
        comment:comment,
        tier_updates:[
          editTierData
        ]
      }
    }).then((res)=>{
      toast.remove()
      toast.success("Tiers Updated Successfully")
      setIsTierEdit(!isTierEdit)
      setEditTierData({})
      fetchContract(contractOffer?.contract_number,contractOffer?.document_version_number)
    }).catch((err)=>{
      console.log(err)
      toast.error("Entities not Updated")
    })
  }

  return (
    <Layouts>
      <style>{`
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        table, th, td {
          border: 1px solid #ccc;
        }
        th, td {
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background: #f5f5f5;
        }
      `}</style>
      <div className="container-fluid position-relative">
        <div className="doc-nav">
          <div className="head-back">
            <h5 onClick={() => navigate(-1)}>
              <img src={arrow_narrow_left} />
              {url?.file_name}{" "}
              {versionList?.length > 0 ? (
                <div className="ms-3">
                  <UncontrolledDropdown onClick={(e) => e.stopPropagation()}>
                    <DropdownToggle caret className="contract-upld-btn version">
                      Version {contractOffer?.document_version_number}
                    </DropdownToggle>
                    <DropdownMenu className="">
                      {versionOpt?.map((contract, idx) => (
                        <DropdownItem
                          key={idx}
                          onClick={() => handleChangeVerison(contract?.value)}
                        >
                          {contract.lable}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </UncontrolledDropdown>
                </div>
              ) : (
                ""
              )}
            </h5>
          </div>
          <div className="next-page">
            {versionList?.length > 0 ? (
              <div>
                <UncontrolledDropdown>
                  <DropdownToggle caret className="contract-upld-btn">
                    Compare Versions
                  </DropdownToggle>
                  <DropdownMenu className="">
                    {versionOpt?.map((contract, idx) => (
                      <DropdownItem
                        key={idx}
                        onClick={() => handleCompare(contract?.value)}
                      >
                        {contract.lable}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            ) : (
              ""
            )}

            {isViewEntities ? (
              <>
                {versionList?.length > 0 && (
                  <button
                    className="view-entities"
                    onClick={() => handleChanges()}
                  >
                    <img
                      src={theme === "Dark" ? refreshimg : refreshLightimg}
                      className="me-2"
                    />
                    Contract Changes
                  </button>
                )}

                <button className="ask-ai" onClick={() => handleChat()}>
                  {" "}
                  <img src={chatAi} style={{ marginRight: "10px" }} />
                  Ask AI
                </button>
              </>
            ) : isChat ? (
              <>
                {versionList?.length > 0 && (
                  <button
                    className="view-entities"
                    onClick={() => handleChanges()}
                  >
                    <img
                      src={theme === "Dark" ? refreshimg : refreshLightimg}
                      className="me-2"
                    />
                    Contract Changes
                  </button>
                )}
                <button
                  className="view-entities"
                  onClick={() => handleEntities()}
                >
                  View Entities
                </button>{" "}
              </>
            ) : isChanges ? (
              <>
                <button
                  className="view-entities"
                  onClick={() => handleEntities()}
                >
                  View Entities
                </button>
                <button className="ask-ai" onClick={() => handleChat()}>
                  {" "}
                  <img src={chatAi} style={{ marginRight: "10px" }} />
                  Ask AI
                </button>
              </>
            ) : isComments ? (
              <>
                {versionList?.length > 0 && (
                  <button
                    className="view-entities"
                    onClick={() => handleChanges()}
                  >
                    <img
                      src={theme === "Dark" ? refreshimg : refreshLightimg}
                      className="me-2"
                    />
                    Contract Changes
                  </button>
                )}
                <button
                  className="view-entities"
                  onClick={() => handleEntities()}
                >
                  View Entities
                </button>
                <button className="ask-ai" onClick={() => handleChat()}>
                  {" "}
                  <img src={chatAi} style={{ marginRight: "10px" }} />
                  Ask AI
                </button>
              </>
            ) : (
              ""
            )}
            <div className="me-3">
              <UncontrolledDropdown>
                <DropdownToggle
                  className=""
                  style={{ background: "transparent", border: "none" }}
                >
                  <EllipsisVertical
                    size={25}
                    color="#85888E"
                    style={{ cursor: "pointer" }}
                  />
                </DropdownToggle>
                <DropdownMenu className="">
                  <DropdownItem onClick={() => handleViewComments()}>
                    View Comments
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </div>

            {/* <div className="next-page-nav">
              <span onClick={() => prevContract()}>
                <img src={left_arrow} />
              </span>
              <span className="count-page">
                <span>
                  {contractsData?.findIndex(
                    (list) =>
                      list.contract_number === location?.state?.contractNum &&
                      list.document_version_number === location?.state?.version
                  ) + 1}
                </span>
                /<span>{contractsData?.length}</span>
              </span>
              <span onClick={() => nextContract()}>
                <img src={right_arrow} />
              </span>
            </div> */}
          </div>
        </div>
        <Row>
          {/* Left Side: File Preview */}
          <Col lg="8" className="left-nav">
            <div className={`pdf-view-url ${isSection ? "pdf-resize" : ""}`}>
              {/* <div
                className="layout-section"
                title="Section"
                onClick={() => toggleSection()}
              >
                <img src={layoutLeft} />
              </div> */}
              {url?.file_url && (
                <PdfViewerWithPopup
                  file={url?.file_url}
                  filename={url?.file_name}
                  contract={contractOffer}
                  fetchList={fetchCommentList}
                  commentList={commentsList}
                />
              )}
              {/* <iframe
                ref={iframeRef}
                src={url?.file_url}
                width={"100%"}
                height={"900px"}
                // style={{ border: "1px solid #ccc" }}
              /> */}
              <div className={`section-list-layout ${isSection ? "" : "hide"}`}>
                <div>
                  <div className="layout-header">
                    <div className="head">Sections</div>
                    <div className="off-btn" onClick={() => toggleSection()}>
                      <img src={layoutLeft} />
                    </div>
                  </div>
                  <div className="section-list-acc">
                    <Accordion
                      open={open}
                      toggle={toggleSectionAcc}
                      className="custom-accordion"
                    >
                      {sections.map((section, idx) => (
                        <AccordionItem key={idx}>
                          <AccordionHeader targetId={`${idx + 1}`}>
                            {truncate(section?.title, { length: "29" })}
                          </AccordionHeader>
                          <AccordionBody accordionId={`${idx + 1}`}>
                            {section.subsections.length > 0 && (
                              <ul className="subsection-list">
                                {section.subsections.map((sub, subIdx) => (
                                  <li key={subIdx}>{sub}</li>
                                ))}
                              </ul>
                            )}
                          </AccordionBody>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Right Side: Contract Entities */}
          <Col
            lg="4"
            className="d-flex flex-column justify-content-between p-0 right-tab"
          >
            <>
              {isChat ? (
                <>
                  <div className="prev-acc-box preview">
                    <h6 className="acc-head">Ask AI Assistant</h6>
                    {chatMessages.length <= 0 ? (
                      <div className="initial-chat p-4 preview">
                        <h1 className="chat-user">
                          Hi, {accounts[0]?.name ?? "User"}!
                        </h1>
                        <h1 className="chat-help">How can I help you?</h1>
                        <div className="initial-question">
                          <div className="row g-2">
                            {sampleQ?.length > 0 &&
                              sampleQ?.map((que) => {
                                return (
                                  <div className="col-4">
                                    <div className="q-box">
                                      <h6>{que}</h6>
                                      <div className="text-end ex-link">
                                        <img
                                          src={externalLink}
                                          onClick={() => chatMessage(que)}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="preview-chat-main-box">
                          {chatMessages?.map((msg) => {
                            return (
                              <>
                                <div className="preview-chat-box">
                                  {msg.role === "user" ? (
                                    <div className="chat-right">
                                      <div className="chat-msg right">
                                        {/* <div className="by">You</div> */}
                                        <div className="msg right">
                                          {msg.message}
                                        </div>
                                      </div>
                                    </div>
                                  ) : msg.role === "bot" ? (
                                    <div className="chat-left">
                                      <div className="logo-round">
                                        <img src={logo} className="srm-bot" />
                                      </div>
                                      <div className="chat-msg ">
                                        <div className="by">SRM Bot</div>
                                        <div className="msg">
                                          <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                          >
                                            {msg?.message?.llm_response}
                                          </ReactMarkdown>
                                          {/* {renderBulletPoints()} */}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    ""
                                  )}
                                </div>
                              </>
                            );
                          })}
                          <>
                            {isLoading ? (
                              <>
                                <div className="chat-left">
                                  <div className="logo-round">
                                    <img src={logo} className="srm-bot" />
                                  </div>
                                  <div className="chat-msg ">
                                    <div className="by">SRM Bot</div>
                                    <div>
                                      <div class="loader">
                                        <li class="ball"></li>
                                        <li class="ball"></li>
                                        <li class="ball"></li>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            ) : (
                              ""
                            )}
                            <div ref={chatEndRef} />
                          </>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="chat-search preview">
                      <input
                        className="chat-search-input preview"
                        value={sendMessage}
                        onChange={(e) => {
                          setSendMessage(e.target.value);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && chatMessage()}
                      />
                      <div>
                        <button
                          className="chat-send-btn"
                          onClick={() => chatMessage()}
                        ></button>
                      </div>
                    </div>
                  </div>
                </>
              ) : isChanges ? (
                <>
                  <div className="prev-acc-box preview">
                    <div className="history-container">
                      {/* Tabs */}
                         <Nav tabs className="history-tabs">
                        <NavItem>
                          <NavLink
                            className={classnames({
                              active: activeTab === "1",
                            })}
                            onClick={() => toggle("1")}
                          >
                            Change History
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            className={classnames({
                              active: activeTab === "2",
                            })}
                            onClick={() => toggle("2")}
                          >
                            Change Summary
                          </NavLink>
                        </NavItem>
                      </Nav>
                      
                     

                      {/* Tab Content */}
                      {histLoading ? (
                        <>
                          <div className="container my-5 p-0 loading-contract">
                            <div className="w-50 m-auto text-center">
                              <img
                                src={
                                  theme === "Dark" ? loadingImg : lightLoading
                                }
                                className="loadingimg"
                              />
                              <h5 className="loading-info">
                                <i>{loadingStatus[statusIndex]}</i>
                              </h5>
                            </div>
                          </div>
                        </>
                      ) : (
                        <TabContent
                          activeTab={activeTab}
                          className="history-content"
                        >
                          <TabPane tabId="1">
                            {/* Timeline */}
                            <div className="timeline">
                              <div className="timeline-date">
                                {historyList?.upload_timestamp && (
                                  <>
                                    {isToday(
                                      new Date(historyList?.upload_timestamp)
                                    )
                                      ? "Today"
                                      : ""}
                                  </>
                                )}
                                ,{" "}
                                {historyList?.upload_timestamp &&
                                  format(
                                    new Date(historyList?.upload_timestamp),
                                    "dd-MMM-yyyy"
                                  )}
                              </div>
                              {historyList?.change_history?.length > 0 && (
                                <>
                                  {historyList?.change_history?.map((chng) => {
                                    return (
                                      <div className="timeline-item">
                                        <div className="timeline-dot" />
                                        <div className="timeline-time">
                                          {historyList?.upload_timestamp &&
                                            format(
                                              new Date(
                                                historyList?.upload_timestamp
                                              ),
                                              "hh:mm a"
                                            )}{" "}
                                          | Edited by {historyList?.modified_by}
                                        </div>
                                        <div className="timeline-card">
                                          <h4>{chng?.type}</h4>
                                          <p
                                            className=""
                                            dangerouslySetInnerHTML={{
                                              __html: chng?.description,
                                            }}
                                          ></p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          </TabPane>

                          <TabPane tabId="2">
                            <div className="summary p-3 ">
                              {historyList?.change_history?.length > 0 && (
                                <div>
                                  <ReactMarkdown>
                                    {summaryList?.llm_generated_histories.replace(
                                      /•/g,
                                      "-"
                                    )}
                                  </ReactMarkdown>
                                </div>
                              )}
                            </div>
                          </TabPane>
                        </TabContent>
                      )}
                    </div>
                  </div>
                </>
              ) : isViewEntities ? (
                <>
                  <div className="prev-acc-box">
                    <h6 className="acc-head">Contract Entities</h6>
                    {isLoading ? (
                      <>
                        <div className="container my-5 p-0 loading-contract">
                          <div className="w-50 m-auto text-center">
                            <img
                              src={theme === "Dark" ? loadingImg : lightLoading}
                              className="loadingimg"
                            />
                            <h5 className="loading-info">
                              <i>{loadingStatus[statusIndex]}</i>
                            </h5>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="preview-acc-box">
                        <Accordion
                          open={accordionOpen}
                          toggle={toggleAccordion}
                          flush
                          className="preview-acc"
                        >
                          <AccordionItem>
                            <AccordionHeader targetId={1}>
                              Contract Offer
                            </AccordionHeader>
                            <AccordionBody accordionId={1}>
                              <ul className="acc-list-data">
                                {/* {Object.entries(contractOffer).map(
                                  ([key, value], index) =>
                                    key !== "id" &&
                                    key !== "created_at" &&
                                    key !== "Updated_at" &&
                                    key !== "adjust_by" &&
                                    key !== "category_pricing" &&
                                    key !== "price_list_name" &&
                                    key !== "pricing_method" ? (
                                      <li
                                        key={index}
                                        className="px-2 contract-offer"
                                      >
                                        <div className="me-2">
                                          <span className="text-capitalize">
                                            {key.replace(/_/g, " ")}:{" "}
                                          </span>
                                          {String(value)}
                                          <span className="ms-2">
                                            <CircleCheckBig
                                              size={18}
                                              color="#17B26A"
                                            />
                                            <CircleAlert
                                              size={18}
                                              color="#F79009"
                                            />
                                            <TriangleAlert
                                              size={18}
                                              color="#F04438"
                                            />
                                          </span>
                                        </div>
                                        <div className=" edit">
                                          <Pencil
                                            size={18}
                                            onClick={() =>
                                              editEntities(key, value)
                                            }
                                          />
                                        </div>
                                      </li>
                                    ) : (
                                      ""
                                    )
                                )} */}
                                {Object.entries(contractOfferWithScore)?.map(
                                  ([key, obj], index) =>
                                    key !== "id" &&
                                    key !== "created_at" &&
                                    key !== "updated_at" &&
                                    key !== "adjust_by" &&
                                    key !== "category_pricing" &&
                                    key !== "price_list_name" &&
                                    key !== "pricing_method" &&
                                    key !== "document_path" &&
                                    key !== "number_of_tiers" ? (
                                      <li
                                        key={index}
                                        className="px-2 contract-offer"
                                      >
                                        <div className="me-2">
                                          <span className="text-capitalize">
                                            {key?.replace(/_/g, " ")}:{" "}
                                          </span>
                                          {key==='program_only'? obj.value===0 ? 'FALSE' :'TRUE' :String(obj?.value)}
                                          {
                                            key !== "owner" &&
                                            key !=="document_status" &&
                                            key !=="author" &&  <span className="ms-2">
                                            {obj?.confidence_category ===
                                              "High" && (
                                              <>
                                                {/* wrap icon in a real DOM element with id */}
                                                <span
                                                  id={`tooltip-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleCheckBig
                                                    size={18}
                                                    color="#17B26A"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#17B26A" }}
                                                  >
                                                    High
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {obj?.confidence_category ===
                                              "Medium" && (
                                              <>
                                                <span
                                                  id={`tooltip-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleAlert
                                                    size={18}
                                                    color="#F79009"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F79009" }}
                                                  >
                                                    Medium
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {obj?.confidence_category ===
                                              "Low" && (
                                              <>
                                                <span
                                                  id={`tooltip-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F04438" }}
                                                  >
                                                    Low
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {obj?.confidence_category ===
                                              null && (
                                              <>
                                                <span
                                                  id={`tooltip-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{
                                                      color: "#F04438",
                                                      fontStyle: "italic",
                                                    }}
                                                  >
                                                    N/A
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}
                                          </span>
                                          }
                                         
                                        </div>

                                        <div className=" edit">
                                          {key !== "author" &&
                                          key !== "document_status" &&
                                          key !== "document_version_number" &&
                                          key !==
                                            "document_version_creation_date" &&
                                          key !== "owner" &&
                                          key !== "source_type" ? (
                                            <Pencil
                                              size={18}
                                              onClick={() =>
                                                editEntities(key, obj?.value)
                                              }
                                            />
                                          ) : (
                                            ""
                                          )}
                                        </div>
                                      </li>
                                    ) : (
                                      ""
                                    )
                                )}
                              </ul>
                            </AccordionBody>
                          </AccordionItem>
                          <AccordionItem>
                            <AccordionHeader targetId={2}>
                              Product Group
                            </AccordionHeader>
                            <AccordionBody accordionId={2}>
                              <ul className="acc-list-data">
                                {/* {Object.entries(contractOffer).map(
                                  ([key, value], index) =>
                                    key === "adjust_by" ||
                                    key === "category_pricing" ||
                                    key === "price_list_name" ||
                                    key === "pricing_method" ||
                                    key === "number_of_tiers" ? (
                                      <li
                                        key={index}
                                        className="px-2 product-group"
                                      >
                                        <div className="me-2">
                                          <span className="text-capitalize">
                                            {key.replace(/_/g, " ")}:
                                          </span>{" "}
                                          {String(value)}
                                          <span className="ms-2">
                                            <CircleCheckBig
                                              size={18}
                                              color="#17B26A"
                                            />
                                            <CircleAlert
                                              size={18}
                                              color="#F79009"
                                            />
                                            <TriangleAlert
                                              size={18}
                                              color="#F04438"
                                            />
                                          </span>
                                        </div>
                                        <div className=" edit">
                                          <Pencil
                                            size={18}
                                            onClick={() =>
                                              editEntities(key, value)
                                            }
                                          />
                                        </div>
                                      </li>
                                    ) : (
                                      ""
                                    )
                                )} */}
                                {Object.entries(contractOfferWithScore).map(
                                  ([key, obj], index) =>
                                    key === "adjust_by" ||
                                    key === "category_pricing" ||
                                    key === "price_list_name" ||
                                    key === "pricing_method" ? (
                                      <li
                                        key={index}
                                        className="px-2 product-group"
                                      >
                                        <div className="me-2">
                                          <span className="text-capitalize">
                                            {key.replace(/_/g, " ")}:
                                          </span>{" "}
                                          {String(obj?.value)}
                                          <span className="ms-2">
                                            {obj?.confidence_category ===
                                              "High" && (
                                              <>
                                                {/* wrap icon in a real DOM element with id */}
                                                <span
                                                  id={`tooltip-product-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleCheckBig
                                                    size={18}
                                                    color="#17B26A"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-product-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#17B26A" }}
                                                  >
                                                    High
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {obj?.confidence_category ===
                                              "Medium" && (
                                              <>
                                                <span
                                                  id={`tooltip-product-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleAlert
                                                    size={18}
                                                    color="#F79009"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-product-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F79009" }}
                                                  >
                                                    Medium
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {obj?.confidence_category ===
                                              "Low" && (
                                              <>
                                                <span
                                                  id={`tooltip-product-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-product-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F04438" }}
                                                  >
                                                    Low
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {obj?.confidence_category ===
                                              null && (
                                              <>
                                                <span
                                                  id={`tooltip-product-${index}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-product-${index}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{
                                                      color: "#F04438",
                                                      fontStyle: "italic",
                                                    }}
                                                  >
                                                    N/A
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}
                                          </span>
                                        </div>
                                        <div className=" edit">
                                          <Pencil
                                            size={18}
                                            onClick={() =>
                                              editEntities(key, obj?.value)
                                            }
                                          />
                                        </div>
                                      </li>
                                    ) : (
                                      ""
                                    )
                                )}
                              </ul>
                            </AccordionBody>
                          </AccordionItem>

                          <AccordionItem>
                            <AccordionHeader
                              targetId={3}
                              className="tiered-head"
                            >
                              Tiered Summary
                            </AccordionHeader>
                            <AccordionBody
                              accordionId={3}
                              className="tiered-body"
                            >
                              <div
                                className=""
                                style={{
                                  color: "var(--text)",
                                  padding: "16px",
                                }}
                              >
                                Number of Tiers :{" "}
                                {contractOfferWithScore?.number_of_tiers?.value}
                                <span className="ms-2">
                                  {contractOfferWithScore?.number_of_tiers
                                    ?.confidence_category === "High" && (
                                    <>
                                      {/* wrap icon in a real DOM element with id */}
                                      <span
                                        id={`tooltip-tier`}
                                        style={{
                                          display: "inline-block",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <CircleCheckBig
                                          size={18}
                                          color="#17B26A"
                                        />
                                      </span>

                                      <UncontrolledTooltip
                                        target={`tooltip-tier`}
                                        placement="top"
                                        style={{
                                          border: "2px",
                                          borderStyle: "solid",
                                          borderColor: "#262A33",
                                          fontSize: "14px",
                                        }}
                                      >
                                        Confidence Score :{" "}
                                        <span style={{ color: "#17B26A" }}>
                                          High
                                        </span>
                                      </UncontrolledTooltip>
                                    </>
                                  )}

                                  {contractOfferWithScore?.number_of_tiers
                                    ?.confidence_category === "Medium" && (
                                    <>
                                      <span
                                        id={`tooltip-tier`}
                                        style={{
                                          display: "inline-block",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <CircleAlert
                                          size={18}
                                          color="#F79009"
                                        />
                                      </span>

                                      <UncontrolledTooltip
                                        target={`tooltip-tier`}
                                        placement="top"
                                        style={{
                                          border: "2px",
                                          borderStyle: "solid",
                                          borderColor: "#262A33",
                                          fontSize: "14px",
                                        }}
                                      >
                                        Confidence Score :{" "}
                                        <span style={{ color: "#F79009" }}>
                                          Medium
                                        </span>
                                      </UncontrolledTooltip>
                                    </>
                                  )}

                                  {contractOfferWithScore?.number_of_tiers
                                    ?.confidence_category === "Low" && (
                                    <>
                                      <span
                                        id={`tooltip-tier`}
                                        style={{
                                          display: "inline-block",
                                          cursor: "pointer",
                                        }}
                                      >
                                        <TriangleAlert
                                          size={18}
                                          color="#F04438"
                                        />
                                      </span>

                                      <UncontrolledTooltip
                                        target={`tooltip-tier`}
                                        placement="top"
                                        style={{
                                          border: "2px",
                                          borderStyle: "solid",
                                          borderColor: "#262A33",
                                          fontSize: "14px",
                                        }}
                                      >
                                        Confidence Score :{" "}
                                        <span style={{ color: "#F04438" }}>
                                          Low
                                        </span>
                                      </UncontrolledTooltip>
                                    </>
                                  )}
                                </span>
                              </div>
                              {tierSummary?.map((list, idx) => {
                                return (
                                  <ul className="acc-list-data tiered">
                                    <li className="hdr pt-3">
                                      <div className="d-flex justify-content-between">
                                        <h6>
                                          Tier Level:
                                          <span className="cnt">
                                            {" "}
                                            0{list?.tier_level}
                                          </span>{" "}

                                        </h6>
                                        <div>
                                          <Pencil
                                            size={18}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => editTierLevel(list)}
                                          />
                                        </div>
                                      </div>
                                    </li>
                                    <li className="hdr">
                                      <div className="d-flex justify-content-between text-start">
                                        <div className="ndc-num ndc-bg">
                                          <span className="tier-span">
                                            Purchase Volume Min
                                          </span>
                                          <h5>{list.volume_min ?? "-"}
                                             <span className="ms-2">
                                            {list?.volume_min_confidence_category ===
                                              "High" && (
                                              <>
                                                {/* wrap icon in a real DOM element with id */}
                                                <span
                                                  id={`tooltip-summary-vmin-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleCheckBig
                                                    size={18}
                                                    color="#17B26A"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmin-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#17B26A" }}
                                                  >
                                                    High
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_min_confidence_category ===
                                              "Medium" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-vmin-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleAlert
                                                    size={18}
                                                    color="#F79009"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmin-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F79009" }}
                                                  >
                                                    Medium
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_min_confidence_category ===
                                              "Low" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-vmin-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmin-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F04438" }}
                                                  >
                                                    Low
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_min_confidence_category ===
                                              null && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-vmin-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmin-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{
                                                      color: "#F04438",
                                                      fontStyle: "italic",
                                                    }}
                                                  >
                                                    N/A
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}
                                          </span></h5>
                                        </div>
                                        <div className="wac-price ndc-bg">
                                          <span className="tier-span">
                                            Purchase Volume Max
                                          </span>
                                          <h5 className="">
                                            {list.volume_max ?? "-"}
                                             <span className="ms-2">
                                            {list?.volume_max_confidence_category ===
                                              "High" && (
                                              <>
                                                {/* wrap icon in a real DOM element with id */}
                                                <span
                                                  id={`tooltip-summary-vmax-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleCheckBig
                                                    size={18}
                                                    color="#17B26A"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmax-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#17B26A" }}
                                                  >
                                                    High
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_max_confidence_category ===
                                              "Medium" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-vmax-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleAlert
                                                    size={18}
                                                    color="#F79009"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmax-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F79009" }}
                                                  >
                                                    Medium
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_max_confidence_category ===
                                              "Low" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-vmax-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmax-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F04438" }}
                                                  >
                                                    Low
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_max_confidence_category ===
                                              null && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-vmax-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-vmax-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{
                                                      color: "#F04438",
                                                      fontStyle: "italic",
                                                    }}
                                                  >
                                                    N/A
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}
                                          </span>
                                          </h5>
                                        </div>
                                      </div>
                                    </li>
                                    <li className="split-li-sum">
                                      <div className="d-flex justify-content-around">
                                        <div className="ndc-num">
                                          <h5>
                                            <span className="tier-span">
                                              Price Discount (%)
                                            </span>{" "}
                                          </h5>
                                          <h5>{list.discount_percentage}%
                                             <span className="ms-2">
                                            {list?.volume_min_confidence_category ===
                                              "High" && (
                                              <>
                                                {/* wrap icon in a real DOM element with id */}
                                                <span
                                                  id={`tooltip-summary-dis-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleCheckBig
                                                    size={18}
                                                    color="#17B26A"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-dis-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#17B26A" }}
                                                  >
                                                    High
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_min_confidence_category ===
                                              "Medium" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-dis-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleAlert
                                                    size={18}
                                                    color="#F79009"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-dis-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F79009" }}
                                                  >
                                                    Medium
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_min_confidence_category ===
                                              "Low" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-dis-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-dis-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F04438" }}
                                                  >
                                                    Low
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.volume_min_confidence_category ===
                                              null && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-dis-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-dis-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{
                                                      color: "#F04438",
                                                      fontStyle: "italic",
                                                    }}
                                                  >
                                                    N/A
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}
                                          </span>
                                          </h5>
                                        </div>
                                        <div className="ndc-num">
                                          <h5>
                                            <span className="tier-span">
                                              Admin Fees(%)
                                            </span>{" "}
                                          </h5>
                                          <h5>{list.admin_fee_percentage}%
                                            <span className="ms-2">
                                            {list?.discount_percentage_confidence_category ===
                                              "High" && (
                                              <>
                                                {/* wrap icon in a real DOM element with id */}
                                                <span
                                                  id={`tooltip-summary-adm-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleCheckBig
                                                    size={18}
                                                    color="#17B26A"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-adm-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#17B26A" }}
                                                  >
                                                    High
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.discount_percentage_confidence_category ===
                                              "Medium" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-adm-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleAlert
                                                    size={18}
                                                    color="#F79009"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-adm-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F79009" }}
                                                  >
                                                    Medium
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.discount_percentage_confidence_category ===
                                              "Low" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-adm-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-adm-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F04438" }}
                                                  >
                                                    Low
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.discount_percentage_confidence_category ===
                                              null && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-adm-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-adm-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{
                                                      color: "#F04438",
                                                      fontStyle: "italic",
                                                    }}
                                                  >
                                                    N/A
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}
                                          </span>
                                          </h5>
                                        </div>
                                        <div className="ndc-num">
                                          <h5>
                                            <span className="tier-span">
                                              Rebate(%)
                                            </span>{" "}
                                          </h5>
                                          <h5>{list.rebate_percentage}%
                                            <span className="ms-2">
                                            {list?.rebate_percentage_confidence_category ===
                                              "High" && (
                                              <>
                                                {/* wrap icon in a real DOM element with id */}
                                                <span
                                                  id={`tooltip-summary-rb-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleCheckBig
                                                    size={18}
                                                    color="#17B26A"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-rb-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#17B26A" }}
                                                  >
                                                    High
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.rebate_percentage_confidence_category ===
                                              "Medium" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-rb-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <CircleAlert
                                                    size={18}
                                                    color="#F79009"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-rb-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F79009" }}
                                                  >
                                                    Medium
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.rebate_percentage_confidence_category ===
                                              "Low" && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-rb-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-rb-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{ color: "#F04438" }}
                                                  >
                                                    Low
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}

                                            {list?.rebate_percentage_confidence_category ===
                                              null && (
                                              <>
                                                <span
                                                  id={`tooltip-summary-rb-${idx}`}
                                                  style={{
                                                    display: "inline-block",
                                                    cursor: "pointer",
                                                  }}
                                                >
                                                  <TriangleAlert
                                                    size={18}
                                                    color="#F04438"
                                                  />
                                                </span>

                                                <UncontrolledTooltip
                                                  target={`tooltip-summary-rb-${idx}`}
                                                  placement="top"
                                                  style={{
                                                    border: "2px",
                                                    borderStyle: "solid",
                                                    borderColor: "#262A33",
                                                    fontSize: "14px",
                                                  }}
                                                >
                                                  Confidence Score :{" "}
                                                  <span
                                                    style={{
                                                      color: "#F04438",
                                                      fontStyle: "italic",
                                                    }}
                                                  >
                                                    N/A
                                                  </span>
                                                </UncontrolledTooltip>
                                              </>
                                            )}
                                          </span>
                                          </h5>
                                        </div>
                                      </div>
                                    </li>
                                  </ul>
                                );
                              })}
                            </AccordionBody>
                          </AccordionItem>

                          <AccordionItem>
                            <AccordionHeader
                              className="tiered-head"
                              targetId={4}
                            >
                              Tiered LI
                            </AccordionHeader>
                            <AccordionBody
                              accordionId={4}
                              className="tiered-body"
                            >
                              {tierDataProduct?.map((list) => {
                                return (
                                  <ul className="acc-list-data tiered">
                                    <li className="hdr pt-3">
                                      <div className="d-flex justify-content-between">
                                        <div className="ndc-num">
                                          <span>NDC Number</span>
                                          <h5>{list?.ndc_number}</h5>
                                        </div>
                                        <div className="wac-price text-end">
                                          <span>WAC Price</span>
                                          <h5 className="text-end">
                                            {list?.wac_price}
                                          </h5>
                                        </div>
                                      </div>
                                    </li>
                                    {list?.tiers?.map((tierData) => {
                                      return (
                                        <li className="split-li">
                                          <div className="d-flex align-items-center justify-content-between tier-split">
                                            <div className="">
                                              <h6>Tier {tierData?.tier}</h6>
                                            </div>
                                            <div className="">
                                              <h6>
                                                <span>Discount:</span>{" "}
                                                {tierData?.discount}
                                              </h6>
                                            </div>
                                            <div>
                                              <h6>
                                                <span>Final Price:</span>{" "}
                                                {tierData?.final_price}
                                              </h6>
                                            </div>
                                          </div>
                                        </li>
                                      );
                                    })}
                                    {/* <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 1</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 10%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $175.5</h6>
                                </div>
                            </div>
                          </li>
                          <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 2</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 15%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $165.8</h6>
                                </div>
                            </div>
                          </li>
                          <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 3</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 20%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $156</h6>
                                </div>
                            </div>
                          </li> */}
                                  </ul>
                                );
                              })}
                              {/* <ul className="acc-list-data tiered">
                          <li className="hdr">
                            <div className="d-flex justify-content-between">
                                <div className="ndc-num">
                                    <span>NDC Number</span>
                                    <h5>65483-1021-30</h5>
                                </div>
                                <div className="wac-price">
                                    <span>WAC Price</span>
                                    <h5 className="text-end">$195</h5>
                                </div>
                            </div>
                          </li>
                          <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 1</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 10%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $175.5</h6>
                                </div>
                            </div>
                          </li>
                          <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 2</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 15%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $165.8</h6>
                                </div>
                            </div>
                          </li>
                          <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 3</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 20%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $156</h6>
                                </div>
                            </div>
                          </li>
                        </ul>
                        <ul className="acc-list-data tiered">
                          <li className="hdr">
                            <div className="d-flex justify-content-between">
                                <div className="ndc-num">
                                    <span>NDC Number</span>
                                    <h5>65483-2041-60</h5>
                                </div>
                                <div className="wac-price">
                                    <span>WAC Price</span>
                                    <h5 className="text-end">$425</h5>
                                </div>
                            </div>
                          </li>
                          {/* <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 1</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 10%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $180</h6>
                                </div>
                            </div>
                          </li>
                          <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 2</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 15%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $170</h6>
                                </div>
                            </div>
                          </li>
                          <li className="split-li">
                            <div className="d-flex align-items-center justify-content-between tier-split">
                                <div className="">
                                    <h6>Tier 3</h6>
                                </div>
                                <div className="">
                                    <h6><span>Discount </span>: 20%</h6>
                                </div>
                                <div>
                                    <h6><span>Final Price</span> : $160</h6>
                                </div>
                            </div>
                          </li> */}
                              {/* </ul> */}
                            </AccordionBody>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    )}
                  </div>

                  {/* Export Buttons */}
                  {isLoading ? (
                    ""
                  ) : (
                    <div className="p-3 d-flex justify-content-evenly  gap-12 export-btn">
                      <button
                        className="exportxl-btn"
                        onClick={() => handleExport()}
                      >
                        <img src={fileImg} /> Export as Excel
                      </button>
                      <Button
                        className="exportxl-btn"
                        onClick={() => downloadAsXml()}
                      >
                        <img src={xmlImg} /> Export as XML
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="Comments-section">
                    <div className="Comments-Top">
                      <div className="Commets-heading">
                        <p className="Comments-title">Comments</p>
                      </div>
                    </div>
                    {commentsList?.length > 0 ?
                      commentsList?.map((list) => {
                        return (
                          <div
                            className="Comment-details"
                            onClick={() => handleScrollToPage(list.section)}
                          >
                            <div>
                              <div className="Comment-body">
                                <div className="Customer-details">
                                  <div className="customer-detail-1">
                                    <div>
                                      <Avatar
                                        className="profile-img"
                                        style={{
                                          backgroundColor: "#8c8c8c",
                                          color: "#1f1f1f",
                                          fontWeight: 550,
                                          marginRight: "10px",
                                        }}
                                      >
                                        {list.commented_by
                                          ?.charAt(0)
                                          ?.toUpperCase()}
                                      </Avatar>
                                    </div>
                                    <div>
                                      <p className="Name-of-cust">
                                        {list.commented_by}
                                      </p>
                                      <p className="Last-seen-cust">
                                        {list?.created_at &&
                                         formatMessageTime(list?.created_at) }
                                      </p>
                                      <div className="cust-comments">
                                        <p>{list.comment}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* <div className="Kebeb-menu">
                                  <img src={dots} />
                                </div> */}
                              </div>
                            </div>
                          </div>
                        );
                      }):
                      <div className="text-center mt-5" style={{color:"var(--text)"}}>
                          No Comments Added
                        </div>}
                  </div>
                </>
              )}
            </>
          </Col>
        </Row>
        <Modal
          isOpen={isEdit}
          centered
          style={{ padding: "24px" }}
          zIndex={4000}
        >
          <ModalHeader
            toggle={toggleEditEntity}
            style={{ padding: "24px", paddingBottom: "10px" }}
          >
            Edit Extracted Entity
          </ModalHeader>
          <ModalBody className="p-0">
            <div class="edit-body">
              <label for="start-date" class="modal-label text-capitalize">
                {editEntitie?.key.replace(/_/g, " ")}
              </label>
              {editEntitie?.key === "channel_partner_type" ? (
                <div>
                  <Select
                    options={docTypeOption}
                    styles={colourStyles}
                    onChange={(e) =>
                      setEditEntitie({ ...editEntitie, value: e.value })
                    }
                  />
                </div>
              ) : editEntitie?.key === "document_status" ? (
                <div>
                  <Select
                    options={contractStatus}
                    styles={colourStyles}
                    onChange={(e) =>
                      setEditEntitie({ ...editEntitie, value: e.value })
                    }
                  />
                </div>
              ) : editEntitie?.key === "source_type" ? (
                <div>
                  <Select
                    options={sourceOption}
                    styles={colourStyles}
                    onChange={(e) =>
                      setEditEntitie({ ...editEntitie, value: e.value })
                    }
                  />
                </div>
              ) : editEntitie?.key === "adjust_by" ? (
                <div>
                  <Select
                    options={adjustOption}
                    styles={colourStyles}
                    onChange={(e) =>
                      setEditEntitie({ ...editEntitie, value: e.value })
                    }
                  />
                </div>
              ) : editEntitie?.key === "pricing_method" ? (
                <div>
                  <Select
                    options={pricingOption}
                    styles={colourStyles}
                    onChange={(e) =>
                      setEditEntitie({ ...editEntitie, value: e.value })
                    }
                  />
                </div>
              ) : editEntitie?.key === "start_date" ||
                editEntitie?.key === "end_date" ? (
                <div style={{ width: "100%" }}>
                  <DatePicker
                    showIcon
                    icon={<Calendar />}
                    closeOnScroll
                    selected={
                      editEntitie?.value &&
                      format(new Date(editEntitie?.value), "yyyy-MM-dd")
                    }
                    onChange={(date) =>
                      setEditEntitie({
                        ...editEntitie,
                        value: format(new Date(date), "yyyy-MM-dd"),
                      })
                    }
                    placeholderText="Select From Date"
                    className="date-input"
                    calendarClassName="custom-calendar edit"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select" // or "scroll" if you want scrolling instead of dropdown
                  />
                </div>
              ) : (
                <div class="input-icon">
                  <input
                    id="start-date"
                    type="text"
                    value={editEntitie?.value}
                    class="modal-input"
                    onChange={(e) =>
                      setEditEntitie({
                        ...editEntitie,
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <label for="reason" class="modal-label">
                Why you are changing this value?
              </label>
              <textarea
                id="reason"
                class="modal-textarea"
                rows="6"
                onChange={(e) =>
                  setEditEntitie({
                    ...editEntitie,
                    comment: e.target.value,
                  })
                }
              ></textarea>
            </div>
            <div class="modal-actions">
              <button class="cancel-btn" onClick={() => toggleEditEntity()}>
                Cancel
              </button>
              <button class="save-btn" onClick={() => updateContract()}>
                Save Changes
              </button>
            </div>
          </ModalBody>
        </Modal>
        <Modal isOpen={isTierWarning} centered zIndex={4000} className="edittierleve">
          <span toggle={() => setIsTierWarning(!isTierWarning)} className="edit-tier-level-title">
            Edit Tier Level?
          </span>
          <div className="edite-tierlevel-body">
            Editing the tier level will recalculate and regenerate the Tiered LI
            section. Would you like to continue?
            <div class="modal-actions">
              <button
                class="cancel-btn"
                onClick={() => setIsTierWarning(!isTierWarning)}
              >
                Cancel
              </button>
              <button class="save-btn" onClick={() => confirmEditTierLevl()}>
                Yes, Confirm
              </button>
            </div>
          </div>
        </Modal>
        <Modal isOpen={isTierEdit} centered zIndex={4000}>
          <ModalHeader toggle={()=>setIsTierEdit(!isTierEdit)}>Edit Tier Level 0{editTierData?.tier_level}</ModalHeader>
          <ModalBody>
            <div className="container">
              <div className="row">
                <div className="col-6 mb-2">
                  <label>Purchase Volume Min</label>
                  <div>
                    <input className="modal-input"
                     value={editTierData?.volume_min}
                      onChange={(e)=>setEditTierData({...editTierData,volume_min:e.target.value})}/>
                  </div>
                </div>
                <div className="col-6 mb-2">
                  <label>Purchase Volume Max</label>
                  <div>
                    <input className="modal-input" 
                     value={editTierData?.volume_max}
                       onChange={(e)=>setEditTierData({...editTierData,volume_max:e.target.value})}
                     />
                  </div>
                </div>
                <div className="col-4">
                  <label>Price Discount (%)</label>
                  <div>
                    <input className="modal-input"
                      value={editTierData?.discount_percentage}
                      onChange={(e)=>setEditTierData({...editTierData,discount_percentage:e.target.value})}
                      />
                  </div>
                </div>
                <div className="col-4">
                  <label>Admin Fees (%)</label>
                  <div>
                    <input className="modal-input" 
                    value={editTierData?.admin_fee_percentage}
                    onChange={(e)=>setEditTierData({...editTierData,admin_fee_percentage:e.target.value})}/>
                  </div>
                </div>
                <div className="col-4">
                  <label>Rebate (%)</label>
                  <div>
                    <input className="modal-input"
                     value={editTierData?.rebate_percentage}
                     onChange={(e)=>setEditTierData({...editTierData,rebate_percentage:e.target.value})}
                     />
                  </div>
                </div>
                <div className="col-12">
                  <label>Comments (optional)</label>
                  <div>
                    <textarea className="modal-input" 
                    onChange={(e)=>setEditTierData({...editTierData,comment:e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div class="modal-actions">
                <button
                  class="cancel-btn"
                  onClick={()=>setIsTierEdit(!isTierEdit)}
                >
                  Cancel
                </button>
                <button class="save-btn" onClick={()=>handleEditTierData()}>
                  Save Changes
                </button>
              </div>
            </div>
          </ModalBody>
        </Modal>
      </div>
    </Layouts>
  );
}

export default Preview;

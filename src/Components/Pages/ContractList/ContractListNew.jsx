import React, { useEffect, useState } from "react";
import Layouts from "../Layouts/Layouts";
import "./contractlist.css";
import maximizelight from'./../../../images/icons/Maxi-L.svg'
import DatePicker from "react-datepicker";
import lightfile from'../../../images/icons/dash-total-light.svg'
import eye from "../../../images/icons/eye.svg";
import maximize from "../../../images/icons/maximize.svg";
import minimize from "../../../images/icons/minimize.svg";
import minimizeDark from "../../../images/icons/minimize-dark.svg";
import eyeCrossImg from "../../../images/icons/eye-off.svg";
import pdfIcon from "../../../images/icons/pdf-grey-i.svg";
import request from "../../../api/api";
import gridSel from './../../../images/icons/Gridwhite-selected.svg'
import gridnotSel from './../../../images/icons/Gridwhite-notselected.svg'
import fileSel from './../../../images/icons/File-white-selected.svg'
import filenotSel from './../../../images/icons/File-white-notselected.svg';
import serachImg from "../../../images/icons/search-sm.svg";
import fileImg from "../../../images/icons/file-06.svg";
import filedarkImg from "../../../images/icons/file-dark.svg";
import filewhiteImg from "../../../images/icons/file-white.svg";
import griddarkImg from "../../../images/icons/grid-dark.svg";
import gridwhiteImg from "../../../images/icons/grid-white.svg";
import alertImg from "../../../images/icons/alert-triangle.svg";
import pdfwhitee from '../../../images/icons/File-white-pdf.svg';
import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Badge, Button, ButtonGroup, Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import Select from "react-select";
import { truncate } from "lodash";
import { format } from "date-fns";
import { useDispatch } from "react-redux";
import { saveContracts } from "../../redux/features/contractSlice";
import { data, useNavigate } from "react-router-dom";
import ContractCard from "../../Skeleton-loading/ContractCard";
import { useTheme } from "../../../Themecontext";
import ContractFilter from "../../Skeleton-loading/ContractFilter"
import ContractDetailsSkeleton from "../../Skeleton-loading/ContractDetailsSkeleton";
import TierStructureSkeloton from "../../Skeleton-loading/TierStructureSkeloton";
import ProductPricingDetails from "../../Skeleton-loading/ProductPricingDetails";
import TierStructureSkeleton from "../../Skeleton-loading/TierStructureSkeloton";
import TotalContracts from "../../Skeleton-loading/TotalContracts";



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

 const pricingData = [
    {
    ndc: "65483-1021-30",
    name: "Cardiolex 10mg",
    size: "30 tablets",
    price: 195,
    tiers: [
      { tier: "Tier 1", discount: 10, final: 175.5, savings: 19.5 },
      { tier: "Tier 2", discount: 15, final: 165.75, savings: 29.25 },
      { tier: "Tier 3", discount: 20, final: 156, savings: 39 },
    ],
  },
  {
    ndc: "65483-1022-30",
    name: "Cardiolex 20mg",
    size: "30 tablets",
    price: 275,
    tiers: [],
  },
  ];

export const colourStyles = {
  container: (styles) => ({
    ...styles,
    width: "95%",
    marginRight: "20px",
    fontSize: "16px",
    color: "var(--text)",
  }),
  control: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: "var(--select-option-bg-color)",
    cursor: "pointer",
    minHeight: "40px",
    borderRadius: "8px",
    borderColor: isFocused ? "var(--select-option-boder-focused)" :  "var(--react-select-border-color)",
    boxShadow: "none",
    ":hover": {
      borderColor: "var(--select-option-border-onhover)",
    },
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "var(--bg-color-select-still)",
    border: "1px solid var(--select-document-type-border)",
    zIndex: 9999,
  }),
  option: (styles, { isFocused }) => ({
    ...styles,
    cursor: "pointer",
    backgroundColor: isFocused ? "var(--select-option-boder-focused)" : "var(--select-option-bg-color)",
    color: "var(--document-type-font-color)",
    ":hover": {
      backgroundColor: "var(--document-type-hover)",
    },
    fontSize: "14px",
  }),
  placeholder: (styles) => ({
    ...styles,
    color: "var(--placeholder-text)",
    fontSize: "14px",
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "var(--text)",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    color: "var(--text)",
    ":hover": {
      color: "var(--placeholder-text)",
    },
  }),
};


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


function ContractListNew() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { theme, toogleTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
  const [contractList, setContractList] = useState([]);
  const [totalCount,setTotalCount] = useState(0)
  const [activeTab, setActiveTab] = useState(1);
  const [accordionOpen, setAccordionOpen] = useState([1,2]);
  const [open, setOpen] = useState([]);
  const [active, setActive] = useState("grid");
  const [priceMaxi,setPriceMaxi] = useState(false)
  const [selectedData,setSelectedData] = useState([])
  const [activeContractTab, setActiveContractTab] = useState(null);
  const [showSelected,setShowSelected] = useState({})
  const [isCustom,setIsCoustom] = useState(false)
  const [gridContractData,setGridContractData]=useState([])
  const [filterOption,setFilterOption] = useState({

  })

  useEffect(() => {
    // Open all accordions initially
    setOpen(pricingData.map((_, idx) => `item-${idx}`));
  }, []);

  const toggle = (id) => {
    if (open.includes(id)) {
      setOpen(open.filter((item) => item !== id));
    } else {
      setOpen([...open, id]);
    }
  };

  const handleHideAll = () => {
  if (open.length > 0) {
    // close all
    setOpen([]);
  } else {
    // open all
    const allIds = showSelected?.products?.map((_, idx) => `item-${idx}`);
    setOpen(allIds);
  }
};
  const [contractOffer,setContractOffer] = useState(
    {
              contract_number: "PPPH18SR01",
              agreement_number: "NP-PHA-2025-C4761",
              pharma_company: "SRM Pharmaceuticals, Inc.",
              channel_partner_name: "Premier Health Alliance, LLC",
              channel_partner_type: "GPO",
              start_date: "2025-07-01",
              end_date: "2025-10-31",
              contract_status: "Active",
              document_path: null,
              author: "Administrator",
              document_name:
                "Premier Health Alliance Agreement with SRM Pharmaceuticals",
              document_type: "GPO",
              document_status: "Active",
              document_version_number: "1",
              document_version_creation_date: "2025-07-01",
              contract_sub_type: "Contract",
              owner: "Administrator",
              program_only: 0,
              source_type: "NEW",
              adjust_by: "%",
              category_pricing: "PRICE",
              price_list_name: "WAC",
              pricing_method: "Tier",
              number_of_tiers: 3,
              created_at: "2025-06-17T09:21:22",
              updated_at: "2025-06-17T09:21:22",
        
  })

  const getContractList = () => {
    request({
      url: "/icontract/backend/columns/names",
      method: "GET",
    })
      .then((res) => {
        setContractList(res.data);
        dispatch(saveContracts(res.data))
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        
      });
  };

  useEffect(() => {
        getContractList();
  }, []);

  console.log(accordionOpen)

   const toggleAccordion = (id) => {
    if (accordionOpen.includes(id)) {
      setAccordionOpen((prev) => prev.filter((item) => item !== id)); // remove if already open
    } else {
      setAccordionOpen((prev) => [...prev, id]); // add if not open
    }
  };

  const addSelectContract = (contract) => {
   setSelectedData((prev) => {
      const exists = prev.find((c) => c.id === contract.id);
      if (exists) {
        const updated = prev.filter((c) => c.id !== contract.id);
        if (activeContractTab === contract.id) {
          setActiveContractTab(updated.length ? updated[0].id : null); // Reset active tab
        }
        return updated;
      } else {
        const updated = [...prev, contract];
        if (!activeContractTab) setActiveContractTab(contract.id); // Set first active
        return updated;
        
      }
    });
  };


  const fetchActiveContractTab =()=>{
    let contract = contractList.find((li)=>li.id===activeContractTab)
    request({
        url:`/icontract/backend/AllColumns/${contract?.contract_number}/${contract?.document_version_number}`,
        method:'GET',
    }).then((res)=>{
        if(res.success){
            setShowSelected(res)
        }
    }).catch((err)=>{
        console.log(err)
    })
  }

  useEffect(()=>{
    if (!activeContractTab) return;
    fetchActiveContractTab()
  },[activeContractTab])


  const handleFilterChange = (e,name)=>{
    if(e.target.checked){
        setFilterOption({...filterOption,[name]:e.target.name})
    }
  }

  const applyGridFilter =()=>{
     setIsLoading(true);
    const params = new URLSearchParams();

  // Loop through filterOption and add only non-empty values
  Object.entries(filterOption).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

    const queryString = params.toString();
    request({
        url:`/icontract/backend/filter_contracts?${queryString}`,
        method:'GET',
    }).then((res)=>{
         setIsLoading(false);
        if(res.success){
            setGridContractData(res.data)
            setTotalCount(res?.total_records)
        }
    }).catch((err)=>{
        console.log(err)
    })
  }

  useEffect(()=>{
    if(active==='grid'){
        applyGridFilter()
    }
  },[active])


  const sendtoPreview =(contract,version)=>{
      navigate('/list/preview',{state:{contractNum:contract,version:version}})
    }

  return (
    <Layouts>
      <div className="contract-list">
        <div className="row">
          <div className="col-12 p-0">
            <div class="contract-head-menu">
              <div className="menu-head-1">
                <div className="menu-head-count">
                  {isLoading ? (
                    <TotalContracts />
                  ) : (
                    <div className="total">
                      <div className="ico">
                        <img src={theme === "Dark" ? fileImg : lightfile} />
                      </div>

                      <div className="d-flex align-items-center">
                        Total Contracts
                        <span className="count">{contractList?.length}</span>
                      </div>
                    </div>
                  )}

                  {/* <div className="expire">
                    <div className="ico orange">
                      <img src={alertImg} />
                    </div>
                    <div className="d-flex align-items-center">
                      Expiring in next 30 days
                      <span className="count">{contractList?.length}</span>
                    </div>
                  </div> */}
                </div>
                <div className="d-flex align-items-center">
                  {active === "grid" ? (
                    ""
                  ) : (
                    <h3 className="me-3 mb-0">
                      {selectedData?.length} Contract Documents Selected
                    </h3>
                  )}

                  <div className="toggle-button-group ms-2">
                    <button
                      className={`toggle-button ${
                        active === "grid" ? "active" : ""
                      }`}
                      onClick={() => setActive("grid")}
                    >
                      <span className="icon">
                        <img
                          src={
                            active === "grid"
                              ? theme === "Dark"
                                ? gridwhiteImg
                                : gridSel
                              : theme === "light"
                              ? griddarkImg
                              : gridnotSel
                          }
                        />
                      </span>
                    </button>
                    <button
                      className={`toggle-button ${
                        active === "doc" ? "active" : ""
                      }`}
                      onClick={() => setActive("doc")}
                    >
                      <span className="icon">
                        <img
                          src={
                            active === "doc"
                              ? theme === "Dark"
                                ? filewhiteImg
                                : fileSel
                              : theme === "light"
                              ? filedarkImg
                              : filenotSel
                          }
                        />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Doc view */}
          {active === "doc" && (
            <>
              <div className="col-3 m-0 pe-0">
                <div class="contract-search-box">
                  <div className="search-box-head">
                    <h3>Contract Documents</h3>
                  </div>
                  {/* <div className="search-box">
                    <img src={serachImg} />
                    <input
                      className="contract-search-inp"
                      placeholder="Search"
                    />
                  </div> */}
                  <div className="contract-list-scroll">
                    {contractList?.length > 0 &&
                      contractList?.map((list, index) => {
                        return (
                          <div
                            className="contract-doc-list"
                            key={index}
                            style={{ cursor: "pointer" }}
                          >
                            <label class="checkbox-container">
                              <input
                                type="checkbox"
                                onChange={() => addSelectContract(list)}
                              />
                              <span class="custom-checkbox"></span>
                            </label>
                            <div className="doc-name-id">
                              <h5 className="name" title={list?.document_name}>
                                {truncate(list?.document_name, { length: 48 })}
                              </h5>
                              <h5 className="id">{list?.contract_number}</h5>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="col-9 ps-0">
                {selectedData?.length > 0 ? (
                  <>
                    <div className="contract-head-menu p-0 pe-2 contract-nav">
                      <div className="menu-head-2">
                        <div className="menu-nav-list">
                          {selectedData?.map((list) => {
                            return (
                              <div
                                className={`${
                                  activeContractTab === list?.id ? "active" : ""
                                }`}
                                onClick={() => setActiveContractTab(list?.id)}
                                title={list.document_name}
                              >
                                {truncate(list.document_name, {
                                  length:
                                    activeContractTab === list?.id ? 40 : 20,
                                })}
                              </div>
                            );
                          })}
                          {/* <div className="active">
                        Premier Health Alliance Agreement
                      </div>
                      <div>Premier Health Alliance Agreement</div>
                      <div>Premier Health Alliance Agreement</div>
                      <div className="last">
                        Premier Health Alliance Agreement
                      </div> */}
                        </div>
                      </div>
                    </div>
                    <div className="row me-0 hide-price">
                      <div className={`col-6 pe-0 ${priceMaxi ? "close" : ""}`}>
                        {isLoading ? (
                          <ContractDetailsSkeleton />
                        ) : (
                          
                            <div class="contract-details-box">
                              <div className="details-head">
                                <h3>Contract Details</h3>
                                <div>{/* <img src={maximize} /> */}</div>
                              </div>
                              <div className="contract-acc-box list-view">
                                <Accordion
                                  open={accordionOpen}
                                  toggle={toggleAccordion}
                                  flush
                                  className="contract-acc"
                                >
                                  <AccordionItem>
                                    <AccordionHeader targetId={1}>
                                      Contract Offer
                                    </AccordionHeader>
                                    <AccordionBody accordionId={1}>
                                      {showSelected?.contracts?.length > 0 && (
                                        <tbody className="acc-list-data">
                                          {Object.entries(
                                            showSelected.contracts[0]
                                          ).map(([key, value], index) =>
                                            key !== "id" &&
                                            key !== "created_at" &&
                                            key !== "updated_at" &&
                                            key !== "adjust_by" &&
                                            key !== "category_pricing" &&
                                            key !== "price_list_name" &&
                                            key !== "pricing_method" ? (
                                              <tr key={index}>
                                                <td>
                                                  <span className="text-capitalize">
                                                    {key.replace(/_/g, " ")}
                                                  </span>
                                                </td>
                                                <td className="ans">
                                                  <span>{String(value)}</span>
                                                </td>
                                              </tr>
                                            ) : (
                                              ""
                                            )
                                          )}
                                        </tbody>
                                      )}
                                    </AccordionBody>
                                  </AccordionItem>
                                  <AccordionItem>
                                    <AccordionHeader targetId={2}>
                                      Product Group
                                    </AccordionHeader>
                                    <AccordionBody accordionId={2}>
                                      {showSelected?.contracts?.length > 0 && (
                                        <tbody className="acc-list-data">
                                          {Object.entries(
                                            showSelected.contracts[0]
                                          ).map(([key, value], index) =>
                                            key === "adjust_by" ||
                                            key === "category_pricing" ||
                                            key === "price_list_name" ||
                                            key === "pricing_method" ? (
                                              <tr key={index}>
                                                <td>
                                                  <span className="text-capitalize">
                                                    {key.replace(/_/g, " ")}
                                                  </span>
                                                </td>
                                                <td className="ans">
                                                  <span>{String(value)}</span>
                                                </td>
                                              </tr>
                                            ) : (
                                              ""
                                            )
                                          )}
                                        </tbody>
                                      )}
                                    </AccordionBody>
                                  </AccordionItem>
                                </Accordion>
                              </div>
                            </div>
                        )}
                      </div>
                      <div className={`col-6 ${priceMaxi ? "close" : ""}`}>
                        {isLoading ? (
                          <TierStructureSkeleton />
                        ) : (
                            <div class="contract-details-box right">
                              <div className="details-head">
                                <h3>Tier Structure</h3>
                                <div>
                                  <img src={maximize} />
                                  {/* {theme==="Light"? <img src={maximizelight}/>:<img src={maximize}/>} */}
                                </div>
                              </div>
                              <div className="contract-acc-box list-view">
                                <table className="tier-table">
                                  <thead>
                                    <th className="sno">Tier</th>
                                    <th>Vol Minimum</th>
                                    <th>Vol Maximum</th>
                                    <th>Discount</th>
                                    <th>Admin Fee</th>
                                    <th>Rebate</th>
                                  </thead>
                                  <tbody>
                                    {showSelected?.tier_structures?.length >
                                      0 &&
                                      showSelected?.tier_structures?.map(
                                        (tier) => {
                                          return (
                                            <tr>
                                              <td className="sno">
                                                {tier?.tier_level}
                                              </td>
                                              <td>
                                                {tier?.volume_min
                                                  ? `$${tier.volume_min}`
                                                  : "No limit"}
                                              </td>
                                              <td>
                                                {tier?.volume_max
                                                  ? `$${tier.volume_max}`
                                                  : "No limit"}
                                              </td>
                                              <td>
                                                {tier?.discount_percentage}%
                                              </td>
                                              <td>
                                                {tier?.admin_fee_percentage}%
                                              </td>
                                              <td>
                                                {tier?.rebate_percentage}%
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                        )}
                      </div>
                      <div className="col-12">
                        {isLoading ? (
                          <ProductPricingDetails />
                        ) : (
                          <div
                            class={`pricing-table-box ${
                              priceMaxi ? "inc" : ""
                            }`}
                          >
                            <div className="details-head">
                              <h3>Product Pricing Table</h3>
                              <div className="opt-btn">
                                <span
                                  onClick={
                                    showSelected?.products?.length > 0 &&
                                    handleHideAll
                                  }
                                >
                                  <img
                                    src={open.length > 0 ? eyeCrossImg : eye}
                                  />
                                  {open.length > 0
                                    ? "Hide All Tier Details"
                                    : "View All Tier Details"}
                                </span>
                                <img
                                  src={
                                    priceMaxi
                                      ? theme === "Dark"
                                        ? minimizeDark
                                        : minimize
                                      : maximize
                                  }
                                  onClick={() => setPriceMaxi(!priceMaxi)}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="product-table-container">
                                <table className="product-tier-table">
                                  <thead>
                                    <tr className="head-sticky">
                                      <th width={"20%"}>NDC Number</th>
                                      <th>Product Number</th>
                                      <th>Size</th>
                                      <th>WAC Price</th>
                                    </tr>
                                  </thead>
                                </table>
                                {showSelected?.products?.length > 0 &&
                                  showSelected?.products?.map((item, index) => (
                                    <Accordion
                                      key={index}
                                      open={open}
                                      toggle={() => toggle(`item-${index}`)}
                                      className="product-accordion"
                                    >
                                      <AccordionItem>
                                        <AccordionHeader
                                          targetId={`item-${index}`}
                                          className="product-header"
                                        >
                                          <div
                                            className="product-header-cell"
                                            style={{ width: "25%" }}
                                          >
                                            {item?.ndc_number}
                                          </div>
                                          <div
                                            className="product-header-cell"
                                            style={{ width: "25%" }}
                                          >
                                            {item?.product_name}
                                          </div>
                                          <div
                                            className="product-header-cell"
                                            style={{ width: "25%" }}
                                          >
                                            {item?.size}
                                          </div>
                                          <div className="product-header-cell">
                                            {item?.wac_price}
                                          </div>
                                        </AccordionHeader>
                                        <AccordionBody
                                          accordionId={`item-${index}`}
                                        >
                                          {item?.tiers?.length > 0 ? (
                                            <table className="product-tier-table">
                                              <thead>
                                                <tr className="price-th">
                                                  <th>Tier</th>
                                                  <th>Discount</th>
                                                  <th>Final Price</th>
                                                  <th>Savings</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {item?.tiers?.map((tier, i) => (
                                                  <tr key={i}>
                                                    <td>{tier?.tier}</td>
                                                    <td>{tier?.discount}</td>
                                                    <td>{tier?.final_price}</td>
                                                    <td className="savings-amount">
                                                      {tier?.savings}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          ) : (
                                            <div className="no-tier-message">
                                              No tier pricing available.
                                            </div>
                                          )}
                                        </AccordionBody>
                                      </AccordionItem>
                                    </Accordion>
                                  ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="no-contract-status">
                    <div className="text-center">
                      No Contract Selected
                      <p>Select two or more contracts to see the overview</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* Grid View */}
          {active === "grid" && (
            <>
              <div className="col-3 m-0 pe-0 position-relative">
                <div class="contract-search-box grid">
                  {isLoading ? (
                    <ContractFilter />
                  ) : (
                    <div className="filter-scroll">
                      <div className="search-box-head grid">
                        <h3>Filters</h3>
                      </div>
                      <h3 className="contract-status-head">Contract Status</h3>
                      <div className="mb-4">
                        <label class="radio-option" htmlFor="implemented">
                          <input
                            type="radio"
                            id="implemented"
                            checked={filterOption?.contract_status === "Active"}
                            name="Active"
                            onChange={(e) =>
                              handleFilterChange(e, "contract_status")
                            }
                          />
                          <span class="custom-radio"></span>
                          Implemented
                        </label>

                        <label class="radio-option">
                          <input
                            type="radio"
                            name="Expired"
                            checked={
                              filterOption?.contract_status === "Expired"
                            }
                            onChange={(e) =>
                              handleFilterChange(e, "contract_status")
                            }
                          />
                          <span class="custom-radio"></span>
                          Expired
                        </label>

                        <label class="radio-option">
                          <input
                            type="radio"
                            name="Terminated"
                            checked={
                              filterOption?.contract_status === "Terminated"
                            }
                            onChange={(e) =>
                              handleFilterChange(e, "contract_status")
                            }
                          />
                          <span class="custom-radio"></span>
                          Terminated After Implementation
                        </label>

                        <label class="radio-option">
                          <input
                            type="radio"
                            name="Draft"
                            checked={filterOption?.contract_status === "Draft"}
                            onChange={(e) =>
                              handleFilterChange(e, "contract_status")
                            }
                          />
                          <span class="custom-radio"></span>
                          In Draft
                        </label>
                      </div>
                      <div className="grid-filter-doc">
                        <h3>Document Type</h3>
                        <div>
                          <Select
                            styles={colourStyles}
                            options={docTypeOption}
                            value={docTypeOption?.filter(
                              (li) => li.value === filterOption?.document_type
                            )}
                            onChange={(e) =>
                              setFilterOption({
                                ...filterOption,
                                document_type: e.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid-date-range">
                        <h3 className="contract-status-head">
                          Effective Date Range
                        </h3>
                        <div className="mb-4">
                          <label class="radio-option">
                            <input
                              type="radio"
                              name="This Year"
                              checked={filterOption.date_range === "This Year"}
                              onChange={(e) =>
                                handleFilterChange(e, "date_range")
                              }
                            />
                            <span class="custom-radio"></span>
                            This Year
                          </label>

                          <label class="radio-option">
                            <input
                              type="radio"
                              name="Previous Year"
                              checked={
                                filterOption.date_range === "Previous Year"
                              }
                              onChange={(e) =>
                                handleFilterChange(e, "date_range")
                              }
                            />
                            <span class="custom-radio"></span>
                            Previous Year
                          </label>

                          <label class="radio-option">
                            <input
                              type="radio"
                              name="Last 2 Years"
                              checked={
                                filterOption.date_range === "Last 2 Years"
                              }
                              onChange={(e) =>
                                handleFilterChange(e, "date_range")
                              }
                            />
                            <span class="custom-radio"></span>
                            Last 2 Years
                          </label>

                          <label class="radio-option">
                            <input
                              type="radio"
                              name="This Month"
                              checked={filterOption.date_range === "This Month"}
                              onChange={(e) =>
                                handleFilterChange(e, "date_range")
                              }
                            />
                            <span class="custom-radio"></span>
                            This Month
                          </label>
                          <label class="radio-option">
                            <input
                              type="radio"
                              name="Last 6 Months"
                              checked={
                                filterOption.date_range === "Last 6 Months"
                              }
                              onChange={(e) =>
                                handleFilterChange(e, "date_range")
                              }
                            />
                            <span class="custom-radio"></span>
                            Last 6 Month
                          </label>
                          <label class="radio-option">
                            <input
                              type="radio"
                              name="Last 12 Months"
                              checked={
                                filterOption.date_range === "Last 12 Months"
                              }
                              onChange={(e) =>
                                handleFilterChange(e, "date_range")
                              }
                            />
                            <span class="custom-radio"></span>
                            Last 12 Month
                          </label>
                          {/* <label class="radio-option">
                          <input
                            type="radio"
                            name="custom"
                            checked={filterOption.date_range === "custom"}
                            onChange={(e) => {
                              handleFilterChange(e, "date_range");
                            }}
                          />
                          <span class="custom-radio"></span>
                          Custom
                        </label> */}
                          {filterOption?.date_range === "custom" && (
                            <div className="date-picker-container">
                              <label>From Date</label>
                              <div className="input-wrapper">
                                <DatePicker
                                  //   selected={filterOption?.date_from && format(new Date(),'dd/MM/yyyy')}
                                  onChange={(date) =>
                                    setFilterOption({
                                      ...filterOption,
                                      date_from: date,
                                    })
                                  }
                                  placeholderText="Select From Date"
                                  className="date-input"
                                  calendarClassName="custom-calendar"
                                />
                              </div>

                              <label>To Date</label>
                              <div className="input-wrapper">
                                {/* <FiCalendar className="calendar-icon" /> */}
                                <DatePicker
                                  // selected={filterOption?.date_to ? format(new Date(),'dd/MM/yyyy'):''}
                                  onChange={(date) =>
                                    setFilterOption({
                                      ...filterOption,
                                      date_to: date,
                                    })
                                  }
                                  placeholderText="Select To Date"
                                  className="date-input"
                                  calendarClassName="custom-calendar"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid-filter-doc">
                        <h3>Pricing Method</h3>
                        <div>
                          <Select
                            styles={colourStyles}
                            options={pricingOption}
                            value={pricingOption?.filter(
                              (li) => li.value === filterOption?.pricing_method
                            )}
                            onChange={(e) =>
                              setFilterOption({
                                ...filterOption,
                                pricing_method: e.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid-adjust-by">
                        <h3>Adjust By</h3>
                        <div className="mb-4">
                          <label class="radio-option">
                            <input
                              type="radio"
                              name="%"
                              checked={filterOption?.adjust_by === "%"}
                              onChange={(e) => {
                                handleFilterChange(e, "adjust_by");
                              }}
                            />
                            <span class="custom-radio"></span>
                            Percentage (%)
                          </label>

                          <label class="radio-option">
                            <input
                              type="radio"
                              name="$"
                              checked={filterOption?.adjust_by === "$"}
                              onChange={(e) => {
                                handleFilterChange(e, "adjust_by");
                              }}
                            />
                            <span class="custom-radio"></span>
                            Dollars ($)
                          </label>
                        </div>
                      </div>
                      <div className="grid-source-type">
                        <h3>Source Type</h3>
                        <label class="radio-option">
                          <input
                            type="radio"
                            name="NEW"
                            checked={filterOption?.source_type === "NEW"}
                            onChange={(e) => {
                              handleFilterChange(e, "source_type");
                            }}
                          />
                          <span class="custom-radio"></span>
                          New
                        </label>

                        <label class="radio-option">
                          <input
                            type="radio"
                            name="AMENDMENT"
                            checked={filterOption?.source_type === "AMENDMENT"}
                            onChange={(e) => {
                              handleFilterChange(e, "source_type");
                            }}
                          />
                          <span class="custom-radio"></span>
                          Amendment
                        </label>
                      </div>
                      <div className="apply-filter-btn grid">
                        <div className="filter-btn">
                          <button
                            className="clr-btn"
                            onClick={() => setFilterOption({})}
                          >
                            Clear
                          </button>
                          <button
                            className="apply-btn"
                            onClick={() => applyGridFilter()}
                          >
                            Apply Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-9 ps-0 contract-card-box">
                {/* <div className="contract-head-menu p-0 pe-2 contract-nav">
                  <div className="menu-head-2">
                    <div className="menu-nav-list">
                      <div className="active">
                        Premier Health Alliance Agreement
                      </div>
                      <div>Premier Health Alliance Agreement</div>
                      <div>Premier Health Alliance Agreement</div>
                      <div className="last">
                        Premier Health Alliance Agreement
                      </div>
                    </div>
                  </div>
                </div> */}
                {isLoading ? (
                  <div className="row">
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                    <div className="col-4 mb-3">
                      <ContractCard />
                    </div>
                  </div>
                ) : (
                  <div className="row grid-card-row">
                    {gridContractData?.length > 0 ? (
                      gridContractData?.map((list) => {
                        return (
                          <div className="col-4 p-0">
                            <div
                              className="grid-card"
                              onClick={() =>
                                sendtoPreview(
                                  list?.contracts[0]?.contract_number,
                                  list?.contracts[0]?.document_version_number
                                )
                              }
                            >
                              <div className="grid-card-head">
                                <img
                                  src={theme === "Dark" ? pdfIcon : pdfwhitee}
                                />
                                <div className="grid-card-data">
                                  <h3>
                                    {truncate(
                                      list?.contracts[0]?.document_name,
                                      {
                                        length: 40,
                                      }
                                    )}
                                  </h3>
                                  <h6>{list?.contracts[0]?.contract_number}</h6>
                                  <div className="doc-version">
                                    <div className="--v">
                                      Version -{" "}
                                      {
                                        list?.contracts[0]
                                          ?.document_version_number
                                      }
                                    </div>
                                    <div className="status text-center">
                                      {list?.contracts[0]?.document_status}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr
                                style={{
                                  borderColor:
                                    theme === "Dark" ? "#eee" : "#333",
                                  height: 2,
                                  borderWidth: 1,
                                  opacity: 0.1,
                                }}
                              />
                              <div className="grid-details">
                                <div>
                                  <span className="type">Type</span>{" "}
                                  <span className="value">
                                    {list?.contracts[0]?.document_type}
                                  </span>
                                </div>
                                <div>
                                  <span className="type">Customer</span>{" "}
                                  <span className="value">
                                    {list?.contracts[0]?.owner}
                                  </span>
                                </div>
                                <div>
                                  <span className="type">Author</span>{" "}
                                  <span className="value">
                                    {list?.contracts[0]?.author}
                                  </span>
                                </div>
                              </div>
                              <hr
                                style={{
                                  borderColor:
                                    theme === "Dark" ? "#eee" : "#333",
                                  height: 2,
                                  borderWidth: 1,
                                  opacity: 0.1,
                                }}
                              />
                              <div className="grid-date">
                                <div
                                  className=""
                                  style={{ paddingRight: "36px" }}
                                >
                                  <div className="start">Start Date</div>
                                  <div className="date">
                                    {list?.contracts[0]?.start_date &&
                                      format(
                                        new Date(
                                          list?.contracts[0]?.start_date
                                        ),
                                        "dd MMM yyyy"
                                      )}
                                  </div>
                                </div>
                                <div>
                                  <div className="start">End Date</div>
                                  <div className="date">
                                    {list?.contracts[0]?.end_date &&
                                      format(
                                        new Date(list?.contracts[0]?.end_date),
                                        "dd MMM yyyy"
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        className={`text-center my-5 ${
                          theme === "Dark" ? "text-white" : "text-dark"
                        }`}
                      >
                        No Results Found
                      </div>
                    )}

                    {/* <div className="col-4 p-0">
                    <div className="grid-card">
                      <div className="grid-card-head">
                        <img src={pdfIcon} />
                        <div className="grid-card-data">
                          <h3>
                            {truncate("Premier Health Alliance Agreem", {
                              length: 25,
                            })}
                          </h3>
                          <h6>SM123456</h6>
                          <div className="doc-version">
                            <div className="--v">Version -DOC1.0</div>
                            <div className="status">Implemented</div>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="grid-details">
                        <div>
                          <span className="type">Type</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                        <div>
                          <span className="type">Customer</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                        <div>
                          <span className="type">Author</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                      </div>
                      <hr />
                      <div className="grid-date">
                        <div className="pe-3">
                          <div className="start">Start date</div>
                          <div className="date">
                            {format(new Date(), "dd MMM yyyy")}
                          </div>
                        </div>
                        <div>
                          <div className="start">Start date</div>
                          <div className="date">
                            {format(new Date(), "dd MMM yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-4 p-0">
                    <div className="grid-card">
                      <div className="grid-card-head">
                        <img src={pdfIcon} />
                        <div className="grid-card-data">
                          <h3>
                            {truncate("Premier Health Alliance Agreem", {
                              length: 25,
                            })}
                          </h3>
                          <h6>SM123456</h6>
                          <div className="doc-version">
                            <div className="--v">Version -DOC1.0</div>
                            <div className="status text-center">Active</div>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="grid-details">
                        <div>
                          <span className="type">Type</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                        <div>
                          <span className="type">Customer</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                        <div>
                          <span className="type">Author</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                      </div>
                      <hr />
                      <div className="grid-date">
                        <div className="pe-3">
                          <div className="start">Start date</div>
                          <div className="date">
                            {format(new Date(), "dd MMM yyyy")}
                          </div>
                        </div>
                        <div>
                          <div className="start">Start date</div>
                          <div className="date">
                            {format(new Date(), "dd MMM yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-4 p-0">
                    <div className="grid-card">
                      <div className="grid-card-head">
                        <img src={pdfIcon} />
                        <div className="grid-card-data">
                          <h3>
                            {truncate("Premier Health Alliance Agreem", {
                              length: 25,
                            })}
                          </h3>
                          <h6>SM123456</h6>
                          <div className="doc-version">
                            <div className="--v">Version -DOC1.0</div>
                            <div className="status text-center">Active</div>
                          </div>
                        </div>
                      </div>
                      <hr />
                      <div className="grid-details">
                        <div>
                          <span className="type">Type</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                        <div>
                          <span className="type">Customer</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                        <div>
                          <span className="type">Author</span>{" "}
                          <span className="value">GPO</span>
                        </div>
                      </div>
                      <hr />
                      <div className="grid-date">
                        <div className="pe-3">
                          <div className="start">Start date</div>
                          <div className="date">
                            {format(new Date(), "dd MMM yyyy")}
                          </div>
                        </div>
                        <div>
                          <div className="start">Start date</div>
                          <div className="date">
                            {format(new Date(), "dd MMM yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div> */}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Layouts>
  );
}

export default ContractListNew;

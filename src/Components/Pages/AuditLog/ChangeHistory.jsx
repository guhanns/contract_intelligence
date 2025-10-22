
import backbtn from "../../../images/icons/arrow-narrow-left-history.svg";
import search from "../../../images/icons/search-history.svg";
import exportimg from "../../../images/icons/export-history.svg";
import "./changehistory.css";
import Layouts from "../Layouts/Layouts";
function ChangeHistory() {
  return (

      <div class="row">
        <div class="col-2 change-history-filter">
          <h3 className="history-filter-title">Filters</h3>

          <div className="sections-history">
            <h3 className="sec-history-title">Sections</h3>
            <div className="all">
              <input type="radio" id="all" name="fav_language" value="All" />
              <label for="all" className="title">
                All
              </label>
            </div>

            <div className="section-one">
              <input
                type="radio"
                id="sec1"
                name="fav_language"
                value="Section 1"
              />
              <label for="sec1" className="title">
                Section 1
              </label>
            </div>

            <div className="section-two">
              <input
                type="radio"
                id="sec2"
                name="fav_language"
                value="Section 2"
              />
              <label for="sec2" className="title">
                Section 2
              </label>
            </div>

            <div className="section-three">
              <input
                type="radio"
                id="sec3"
                name="fav_language"
                value="Section 3"
              />
              <label for="sec3" className="title">
                Section 3
              </label>
            </div>
          </div>

          <div className="sections-history">
            <h3 className="sec-history-title">Users</h3>
            <div className="all">
              <input type="radio" id="all" name="fav_language" value="All" />
              <label for="all" className="title">
                All
              </label>
            </div>

            <div className="section-one">
              <input
                type="radio"
                id="sec1"
                name="fav_language"
                value="Section 1"
              />
              <label for="sec1" className="title">
                User 1
              </label>
            </div>

            <div className="section-two">
              <input
                type="radio"
                id="sec2"
                name="fav_language"
                value="Section 2"
              />
              <label for="sec2" className="title">
                User 2
              </label>
            </div>

            <div className="section-three">
              <input
                type="radio"
                id="sec3"
                name="fav_language"
                value="Section 3"
              />
              <label for="sec3" className="title">
                User 3
              </label>
            </div>
          </div>

          <div className="sections-history">
            <h3 className="sec-history-title">Actions</h3>
            <div className="all">
              <input type="radio" id="all" name="fav_language" value="All" />
              <label for="all" className="title">
                All
              </label>
            </div>

            <div className="section-one">
              <input
                type="radio"
                id="sec1"
                name="fav_language"
                value="Section 1"
              />
              <label for="sec1" className="title">
                Added
              </label>
            </div>

            <div className="section-two">
              <input
                type="radio"
                id="sec2"
                name="fav_language"
                value="Section 2"
              />
              <label for="sec2" className="title">
                Removed
              </label>
            </div>

            <div className="section-three">
              <input
                type="radio"
                id="sec3"
                name="fav_language"
                value="Section 3"
              />
              <label for="sec3" className="title">
                Replaced
              </label>
            </div>
          </div>

          <div className="sections-history">
            <h3 className="sec-history-title">Effective Date Range</h3>
            <div className="all">
              <input type="radio" id="all" name="fav_language" value="All" />
              <label for="all" className="title">
                Today
              </label>
            </div>

            <div className="section-one">
              <input
                type="radio"
                id="sec1"
                name="fav_language"
                value="Section 1"
              />
              <label for="sec1" className="title">
                Tomorrow
              </label>
            </div>

            <div className="section-two">
              <input
                type="radio"
                id="sec2"
                name="fav_language"
                value="Section 2"
              />
              <label for="sec2" className="title">
                Yesterday
              </label>
            </div>
            
          <div className="apply-filter-btn-summary">
            <div className="filter-btn">
              <button className="clr-btn">Clear</button>
              <button className="apply-btn">Apply Filters</button>
            </div>
          </div>
          </div>
        </div>
        <div class="col-10 p-0">
          <div className="export-history-container">
            <div class="search-container">
              <img className="i" src={search} />
              <input type="text" placeholder="Search " />
            </div>

            <div className="export-history-container">
              <img src={exportimg} />
              <span className="title">Export Change History</span>
            </div>
          </div>
          <div className="changes-history-content-sec">
            <h3>Today, 25 Sep 2025</h3>
            <ul className="datas">
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>
              <li><span className="time">10:32 AM</span> Priya Menon removed the Volume Commitment  in the Pricing  section. </li>
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>         
            </ul>
          </div>


          <div className="changes-history-content-sec">
            <h3> 25 Sep 2025</h3>
            <ul className="datas">
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>
              <li><span className="time">10:32 AM</span> Priya Menon removed the Volume Commitment  in the Pricing  section. </li>
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>
              <li><span className="time">10:32 AM</span> Amit Sharma added the  Discount % field in the  in the section.</li>         
            </ul>
          </div>
        </div>
      </div>
  );
}

export default  ChangeHistory;

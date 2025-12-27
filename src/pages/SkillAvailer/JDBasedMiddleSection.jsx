import React from "react";

const JDBasedMiddleSection = () => {
  return (
    <div
      className="col-lg-7 col-sm-12   rounded bg-white  font-5 overflow-y-auto mt-1"
      style={{ height: contentHeight }}
    >
      {RefMyRequirements.skillsInRefined.length > 0 ? (
        <div>
          <div className=" px-1 d-md-flex flex-column ">
            <div className="d-md-flex align-items-center justify-content-between   ">
              <div
                className="d-md-flex align-items-center  "
                style={{ width: "10%" }}
              >
                {/* result for */}
                <div
                  className=" d-flex justify-content-center  align-items-center"
                  style={{
                    width: "100%",
                    backgroundColor: "#577126",
                    height: "30px",
                    borderRadius: "10px",
                  }}
                >
                  <div
                    className="font-6"
                    style={{ display: "flex", color: "white" }}
                  >
                    {SkillBasedResult.noOfResult + " results for"}
                  </div>
                </div>
              </div>
              <div className=" " style={{ width: "70%" }}>
                <div className="mx-1   d-md-flex  flex-wrap">
                  {RefMyRequirements.skillsInRefined.map(
                    (skill, index) =>
                      skill.show && (
                        <span
                          className="mx-1 mt-1 badge ms-1 border-1 "
                          style={{
                            borderStyle: "solid",
                            borderWidth: "1px",
                            borderColor: "var(--primary-color)",
                            backgroundColor: "#F7FFDD",
                            color: "var(--primary-color)",
                            padding: "3px 6px",
                            borderRadius: "7px",
                            alignContent: "center",
                            alignItems: "center",
                            fontSize: "11px",
                          }}
                          id={index}
                        >
                          {skill.label}
                        </span>
                      )
                  )}
                </div>
              </div>
              <div className="d-flex align-items-center ">
                <div className="d-flex">
                  <SecondaryToggleBtn
                    label={
                      view === "card"
                        ? (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "CardView"
                            ) || {}
                          ).mvalue || "nf Card View"
                        : (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Card"
                            ) || {}
                          ).mvalue || "nf Card"
                    }
                    onClick={() => setView("card")}
                    isActive={view === "card"}
                  />
                  <SecondaryToggleBtn
                    label={
                      view === "list"
                        ? (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "ListView"
                            ) || {}
                          ).mvalue || "nf List View"
                        : (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "List"
                            ) || {}
                          ).mvalue || "nf List"
                    }
                    onClick={() => setView("list")}
                    isActive={view === "list"}
                  />
                  <SecondaryToggleBtn
                    label={
                      view === "map"
                        ? (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "MapView"
                            ) || {}
                          ).mvalue || "nf Map View"
                        : (
                            content[selectedLanguage]?.find(
                              (item) => item.elementLabel === "Map"
                            ) || {}
                          ).mvalue || "nf Map"
                    }
                    onClick={() => setView("map")}
                    isActive={view === "map"}
                  />
                </div>
                <div class="btn-group dropend">
                  <button
                    className="border-0 p-0 m-0    bg-white"
                    onClick={() => setExportOptions(!exportOptions)}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Export"
                  >
                    <LiaFileExportSolid style={{ fontSize: "26px" }} />
                  </button>
                </div>
              </div>
            </div>
            {exportOptions && (
              <div className="d-flex flex-row  justify-content-end   mx-3 mt-2">
                <div>
                  <ul
                    class=" show p-0 m-0 "
                    style={{ minWidth: "116px", left: "33px" }}
                  >
                    <div className="btn-group">
                      <button
                        className="btn text-start font-6  ms-1   "
                        type="button"
                        style={{
                          backgroundColor: "#EFF5DC",
                          borderStyle: "solid",
                          borderColor: "var(--primary-color)",
                          color: "var(--primary-color)",
                        }}
                      >
                        Excel
                      </button>
                      <button
                        className="btn text-start font-6    "
                        type="button"
                        style={{
                          backgroundColor: "white",
                          borderStyle: "solid",
                          color: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                        }}
                      >
                        CSV
                      </button>
                      <button
                        className="btn text-start font-6    "
                        type="button"
                        style={{
                          backgroundColor: "white",
                          borderStyle: "solid",
                          color: "var(--primary-color)",
                          borderColor: "var(--primary-color)",
                        }}
                      >
                        PDF
                      </button>
                    </div>
                  </ul>
                </div>
              </div>
            )}
            {/* <div>
                    1, 2, 3, 4, 5, 6, 7, ..... 20
                </div> */}
          </div>

          {/* cards */}
          <div>
            {SkillBasedResult.status === "loading" && <Loader />}

            {view === "card" &&
              SkillBasedResult.status === "success" &&
              SkillBasedResult.noOfResult > 0 &&
              SkillBasedResult.data.map((result) => {
                return (
                  <div key={result.userId}>
                    <UserCardA
                      userDetail={result}
                      SelectedRefSkillFilter={RefMyRequirements.skillsInRefined}
                    />
                  </div>
                );
              })}
            {/* just ignore the error id not found */}
            <div id="map" style={{ height: "0", width: "100%" }}></div>
            {view === "map" && (
              <div
                id="googleMap"
                style={{ width: "100%", height: "77vh" }}
              ></div>
            )}
            {view === "list" &&
              SkillBasedResult.status === "success" &&
              SkillBasedResult.noOfResult > 0 && (
                <>
                  <div className=" d-lg-block font-5">
                    <table className="table table-sm  table-borderless  mt-2  my-0 py-0  table-fixed     ">
                      <tr className=" font-5   ">
                        <th scope="col" style={{ width: "20%" }}>
                          Name
                        </th>
                        <th
                          scope="col"
                          className="bg-body- "
                          style={{ width: "10%" }}
                        >
                          Location
                        </th>
                        <th scope="col" style={{ width: "10%" }}>
                          {" "}
                          About
                        </th>
                        <th scope="col" className="" style={{ width: "26%" }}>
                          Email id
                        </th>
                        <th scope="col" className="" style={{ width: "15%" }}>
                          Phone number
                        </th>
                        <th scope="col" style={{ width: "21%" }}></th>
                      </tr>

                      <div className=" "></div>
                      {/* horizontal line */}
                      <tr
                        className=" p-0 m-0   border-black   "
                        style={{ borderColor: "gray", borderWidth: "1px" }}
                      />
                    </table>
                  </div>

                  {/* Lists */}
                  {SkillBasedResult.data.map((result) => {
                    return (
                      <div key={result.userId}>
                        <ListView userDetail={result} />
                        {/* <UserCardA name="Michael " /> */}
                      </div>
                    );
                  })}
                </>
              )}
            {view === "PremiumService" && (
              <>
                {/* back button */}
                <button
                  className="input-group-text  mt-4   ms-1 primary-green "
                  style={{
                    backgroundColor: "#",
                    color: "var(--primary-color)",
                    borderStyle: "solid",
                    borderColor: "",
                  }}
                  onClick={() => view("list")}
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default JDBasedMiddleSection;

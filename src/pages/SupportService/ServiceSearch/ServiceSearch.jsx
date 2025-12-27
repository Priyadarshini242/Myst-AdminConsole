import React, { useState } from "react";
import "./ServiceSearch.css";
import { useNavigate } from "react-router-dom";
import FeaturedServiceProvider from "../../../components/Supportservices/FeaturedServiceProvider";
import Loader from "../../../components/Loader";
import { useApi } from "../../../context/useApi";

const ServiceSearch = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useApi();
  const [searchQuery, setSearchQuery] = useState("");

  const navigateToTopServices = () => {
    navigate("topservices");
  };

  // Filter data based on the search query
  const filteredData = data
    ? data.data.filter((service) =>
        service.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  const numberOfResults = filteredData.length;

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <>
      <section className="light mt-2">
        <div className="container">
          <div className="d-flex justify-content-between  mb-4">
            <div
              className="text-center d-flex justify-content-center align-items-center px-2 text-white rounded "
              style={{ backgroundColor: "var(--primary-color)" }}
            >
              <div
                className="font-5"
                onClick={navigateToTopServices}
                style={{ cursor: "pointer" }}
              >
                Top Services
              </div>
            </div>
            <div className="main-search-input-wrap">
              <div
                className="main-search-input fl-wrap "
                style={{ position: "relative" }}
              >
                <div className="main-search-input-item rounded shadow-sm">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search Services..."
                    className="p-1 rounded "
                    style={{
                      minWidth: "20rem",
                      border: "2px solid var(--primary-color)",
                    }}
                  />
                </div>
                <button
                  className="main-search-button rounded px-2 fn-bold "
                  style={{
                    position: "absolute",
                    bottom: "0px",
                    top: "0px",
                    right: "0px",
                    fontSize: ".8rem",
                    backgroundColor: "var(--primary-color)",
                    border: "none",
                    color: "white",
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          {searchQuery && (
            <div className="mb-3">
              Showing results for: "{searchQuery}" ({numberOfResults}{" "}
              {numberOfResults === 1 ? "result" : "results"})
            </div>
          )}
          {isLoading ? (
            <Loader />
          ) : (
            <div className="row">
              {numberOfResults > 0 ? (
                filteredData.map((service) => (
                  <div className="col-12" key={service.id}>
                    <FeaturedServiceProvider
                      name={service.serviceName}
                      language={service.serviceLanguage}
                      location={service.serviceLocation}
                      cost={service.serviceCost}
                      currency={service.serviceCostCurrency}
                    />
                  </div>
                ))
              ) : (
                <div className="fw-bold fs-5">No results found</div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ServiceSearch;

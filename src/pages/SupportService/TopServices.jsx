import React from "react";
import { useApi } from "../../context/useApi";
import FeaturedServiceProvider from "../../components/Supportservices/FeaturedServiceProvider";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";

export default function TopServices() {
  const { data, isLoading } = useApi();
  const navigate = useNavigate();
  if (isLoading) {
    return <Loader />;
  }

  return (
    <div>
      <section className="light mt-2">
        <div className="container">
          <div className="row mb-3">
            <div className="col d-flex justify-content-end">
              <a
                className="btn btn-sm px-3 pe-3 "
                onClick={() => {
                  navigate(-1);
                }}
                style={{
                  backgroundColor: "var(--primary-color)",
                  color: "white",
                }}
              >
                Back
              </a>
            </div>
          </div>

          {data?.data.slice(0, 5).map((service) => {
            return (
              <div className="row" key={service.id}>
                <div className="col">
                  <FeaturedServiceProvider
                    name={service.serviceName}
                    language={service.serviceLanguage}
                    location={service.serviceLocation}
                    cost={service.serviceCost}
                    currency={service.serviceCostCurrency}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useEffect, useState } from "react";
import "./supportService.css";
import LocationSuggestionApi from "../../api/locationApi/LocationSuggestionApi";
import CreatableSelect from "react-select/creatable";
import { sessionDecrypt } from "../../config/encrypt/encryptData";
import { LIMITED_SPL_CHARS } from "../../config/constant";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import useContentLabel from "../../hooks/useContentLabel";
import { getCookie } from '../../config/cookieService';


export default function ServiceDashboardLayout() {
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [inputValue, setInputValue] = useState("");
  const contentLabel = useContentLabel();
  const [filterLocation, setFilterLocation] = useState([]);
  const components = { 
    DropdownIndicator: null,
  };

  useEffect(() => {
    LocationSuggestionApi(
      locationInput,
      "city",
       getCookie("countryCode")
    )
      .then((res) => {
        const data = res.data;

        //eslint-disable-next-line
        setFilterLocation(
          data.map((item) => ({
            value: item.city,
            label: item.city,
            latitude: item.cityLatitude,
            longitude: item.cityLongitude,
          }))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, [sessionStorage.getItem("countryCode"), locationInput]);
  return (
    <>
      <div class="container-fluid">
        <br />
        <br />
        <div class="row justify-content-center">
          <div class="col-10">
            <form class="card card-sm">
              <div class="row card-body align-items-center no-gutters">
                <div class="col-auto">
                  <i class="text-body fa-search fas h4"></i>
                </div>

                <div class="col">
                  <input
                    class="form-control form-control-borderless form-control-lg"
                    type="text"
                    placeholder="Search Services or Companies"
                  />
                </div>
                <div className="col-1">
                  <div class="vr vr-blurry" style={{ height: "1.7rem" }}></div>
                </div>

                <div className="col-3">
                  <CreatableSelect
                    placeholder={"Add Location"}
                    options={filterLocation}
                    components={components}
                    inputValue={locationInput}
                    styles={{
                      control: (baseStyles, state) => ({
                        ...baseStyles,
                        width: "10rem",
                        border: "none",
                        fontSize: "1.2rem",
                        outline: "none",
                      }),
                    }}
                    onInputChange={(newValue) => setLocationInput(newValue)}
                    isClearable
                    menuPlacement="auto"
                    menuPosition="fixed"
                    isValidNewOption={() => false}
                    onChange={(newValue) => {
                      console.log(newValue);
                      setSelectedLocations(newValue);
                    }}
                    value={selectedLocations}
                    onKeyDown={(e) => {
                      if (LIMITED_SPL_CHARS.includes(e.key)) {
                        e.preventDefault();
                        showErrorToast(
                          contentLabel(
                            "SpecialCharNotAllowed",
                            "nf Special Characters Not Allowed"
                          )
                        );
                      }
                    }}
                  />
                </div>
                <div class="col-auto">
                  <button
                    class="btn btn-lg btn-primary"
                    type="submit"
                    style={{
                      backgroundColor: "var(--primary-color)",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <Outlet></Outlet>
      </div>
    </>
  );
}

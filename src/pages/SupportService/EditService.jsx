import React from "react";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { FaAngleDoubleRight } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { MdCancel, MdCloudUpload } from "react-icons/md";
import { showErrorToast } from "../../components/ToastNotification/showErrorToast";
import GetAllLangApi from "../../api/content/GetAllLangApi";
import CreatableSelect from "react-select/creatable";

import LocationSuggestionApi from "../../api/locationApi/LocationSuggestionApi";
import { premiumServicePrices } from "../SkillingAgency/SkillingAgencyConstants";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../config/Properties";
import { sessionDecrypt } from "../../config/encrypt/encryptData";
import { LIMITED_SPL_CHARS } from "../../config/constant";
import useContentLabel from "../../hooks/useContentLabel";
import { getCookie } from '../../config/cookieService';


export default function EditService() {
  const contentLabel = useContentLabel();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const data = queryClient.getQueryData(["myservices"]);
  useEffect(() => {
    if (data) {
      const filteredData = data?.data.filter((service) =>
        service.id.includes(id)
      );

      filteredData.map((services) => {
        setServiceName(services.serviceName);
        setDescription(services.serviceDescription);
        let locations = services?.serviceLocation?.split(",").map((loc) => {
          return { label: loc, value: loc };
        });
        setSelectedLocations(locations);
        let languages = services?.serviceLanguage?.split(",").map((lan) => {
          return { label: lan, value: lan };
        });
        setSelectedLanguages(languages);
        setServiceStatus(services.status);
        setPrice(services.serviceCost);
        setCurrencyInput(services.serviceCostCurrency);
      });
    }
  }, []);

  const putServiceData = async (body) => {
    const userid = id;
    const response = await axios.put(
      `${BASE_URL}/skill/api/v1/skills/edit/User Services/${userid}?authToken=${ getCookie("token")}`,
      body
    );

    return response.data;
  };

  const mutation = useMutation({
    mutationKey: ["putmyservices"],
    mutationFn: putServiceData,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["myservices"]);
      navigate(`/support-services/${data.id}`);
    },
  });

  const navigate = useNavigate();
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFileError, setIsFileError] = useState(false);
  const [servicePdf, setServicePdf] = useState(null);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [filterLanguage, setFilterLanguage] = useState([]);
  const [languageInput, setLanguageInput] = useState("");

  useEffect(() => {
    GetAllLangApi().then((res) => {
      const data = res.data;
      setFilterLanguage(
        data.map((item) => ({
          value: item.name,
          label: item.name,
        }))
      );
    });
  }, []);

  const [price, setPrice] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [filterCurrency, setFilterCurrency] = useState([]);

  useEffect(() => {
    setFilterCurrency(
      premiumServicePrices.map((item) => ({
        value: item.currency,
        label: item.currency,
      }))
    );
  }, []);

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");
  const [filterLocation, setFilterLocation] = useState([]);

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

  const [servicestatus, setServiceStatus] = useState("");

  const components = {
    DropdownIndicator: null,
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.name.match(/\.(jpg|jpeg|png|gif)$/)) {
        showErrorToast("Wrong image type");
        return;
      }

      if (file.size < 100000) {
        showErrorToast("image size is too small");
        return;
      }

      if (file.size > 5000000) {
        showErrorToast("image size is too large");
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.name.match(/\.(pdf)$/)) {
        showErrorToast("Wrong file type");
        setIsFileError(true);
        return;
      }

      if (file.size < 100000) {
        showErrorToast("file size is too small");
        setIsFileError(true);
        return;
      }

      if (file.size > 5000000) {
        showErrorToast("file size is too large");
        setIsFileError(true);
        return;
      }

      setServicePdf(file);
      setIsFileError(false);
      return;
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    const body = {
      serviceName: serviceName,
      serviceDescription: description,
      serviceLocation: selectedLocations.map((lan) => lan.value).join(", "),
      serviceLanguage: selectedLanguages.map((lan) => lan.value).join(", "),
      serviceCost: price,
      serviceCostCurrency: currencyInput,
      status: servicestatus,
    };

    mutation.mutate(body);
  }
  return (
    <div className="mb-5 me-5 ms-5 mt-5">
      <div className="d-flex align-items-center justify-content-between">
        <h2
          className="fw-bold"
          style={{
            color: "var(--primary-color)",
          }}
        >
          Edit Service
        </h2>
        <button
          class="btn btn-sm btn-success"
          style={{
            backgroundColor: "var(--primary-color)",
            border: "none",
          }}
          onClick={() => navigate(-1)}
        >
          cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div class="d-flex flex-column gap-3 mt-4">
          <div class="">
            <label
              for="exampleFormControlInput1"
              class="form-label fw-bold mb-0"
            >
              Service Name
            </label>
            <input
              type="text"
              class="form-control"
              id="exampleFormControlInput1"
              placeholder="enter service name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>
          <div class="">
            <label
              for="exampleFormControlTextarea1 "
              class="form-label fw-bold mb-0"
            >
              Description
            </label>
            <textarea
              class="form-control"
              id="exampleFormControlTextarea1"
              rows="3"
              placeholder="enter service description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label for="customFile" class="form-label fw-bold mb-0">
              Choose Image
            </label>
            <input
              type="file"
              class="form-control mb-2"
              id="customFile"
              style={{ display: "none" }}
              onChange={(e) => handleImageChange(e)}
            />
            <div
              style={{
                height: "10rem",
                aspectRatio: "4/5",
                position: "relative",
              }}
            >
              {selectedImage ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "10px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedImage(null);
                    }}
                  >
                    <MdCancel />
                  </div>
                  <img
                    src={selectedImage}
                    style={{
                      objectFit: "cover",
                      height: "100%",
                      width: "100%",
                    }}
                    alt="..."
                    class="img-thumbnail"
                  ></img>
                </>
              ) : (
                <label
                  for="customFile"
                  class="d-flex form-label align-items-center justify-content-center rounded"
                  style={{
                    cursor: "pointer",
                    height: "100%",
                    width: "100%",
                    backgroundColor: "#e5e5e5",
                  }}
                >
                  <MdCloudUpload
                    style={{ cursor: "pointer", fontSize: "25px" }}
                  />
                </label>
              )}
            </div>
            <i className="mt-1" style={{ fontSize: "13px" }}>
              Note: Image should be in [{" "}
              <span className="fw-semibold">jpg,jpeg,png,gif</span> ] format &
              <span className="ml-2">{` 100kb < Image < 5mb`}</span>
            </i>
          </div>
          <div>
            <label for="customFile" class="form-label fw-bold mb-0">
              Attach Course PDF
            </label>
            <input
              type="file"
              class={`form-control mb-0 ${isFileError ? "is-invalid" : ""}`}
              id="customFile"
              onChange={(e) => handleAttachmentChange(e)}
            />

            <i className="mt-1" style={{ fontSize: "13px" }}>
              Note: file should be in [ <span className="fw-semibold">pdf</span>{" "}
              ] format &<span className="ml-2">{` 100kb < File < 5mb`}</span>
            </i>
          </div>
          <div className="d-flex flex-column">
            <div className="d-flex gap-3 mt-2">
              <label for="location" class="form-label fw-bold mb-0">
                Location(s)
              </label>
              <div>
                <input
                  type="checkbox"
                  id="remoteCheckbox"
                  className="mt-2 mx-2"
                  checked={selectedLocations.find((obj) => {
                    return obj.label === "Remote";
                  })}
                  onChange={(e) => {
                    const isChecked = e.target.checked;

                    setSelectedLocations((prevLocation) => {
                      if (isChecked) {
                        const onlineLocation = {
                          label: "Remote",
                          value: "Remote",
                        };
                        return prevLocation.some(
                          (obj) => obj.label === "Remote"
                        )
                          ? prevLocation // Don't add "Online" if it already exists
                          : [...prevLocation, onlineLocation]; // Add "Online" if it doesn't exist
                      } else {
                        return prevLocation.filter(
                          (obj) => obj.label !== "Remote"
                        ); // Remove "Online"
                      }
                    });
                  }}
                />
                <label for="location" class="form-label fw-bold mb-0">
                  Remote
                </label>
              </div>
            </div>
            <div>
              <CreatableSelect
                isMulti
                placeholder={"Add Location"}
                options={filterLocation}
                components={components}
                inputValue={locationInput}
                onInputChange={(newValue) => setLocationInput(newValue)}
                isClearable
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
          </div>
        </div>
        <div className="d-flex flex-column mt-3">
          <label for="location" class="form-label fw-bold mb-0 mt-2">
            Languages(s)
          </label>
        </div>
        <div style={{}}>
          <CreatableSelect
            isMulti
            placeholder={"Add Language"}
            options={filterLanguage}
            components={components}
            isValidNewOption={() => false}
            inputValue={languageInput}
            onInputChange={(newValue) => setLanguageInput(newValue)}
            isClearable
            onChange={(newValue) => {
              console.log(newValue);
              setSelectedLanguages(newValue);
            }}
            value={selectedLanguages}
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
        <div className="m-0 p-0 mt-3">
          <label
            for="exampleFormControlInput1"
            class="form-label m-0 p-0 fw-bold"
          >
            Service Price
          </label>
          <div className="d-flex align-items-end">
            <input
              type="number"
              class="form-control mt-1"
              id="exampleFormControlInput1"
              placeholder="enter service price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <CreatableSelect
              inputValue={currencyInput}
              options={filterCurrency}
              placeholder={"Currency"}
              isValidNewOption={() => false}
              styles={{
                control: (baseStyles, state) => ({
                  ...baseStyles,
                  width: "10rem",
                }),
              }}
              onInputChange={(newValue) => {
                setCurrencyInput(newValue.newValue);
                console.log(newValue.newValue);
              }}
              onChange={(newValue) => {
                setCurrencyInput(newValue.newValue);
              }}
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
        </div>
        <div class="mb-3 mt-3">
          <label
            for="exampleFormControlInput1"
            class="form-label m-0 p-0 fw-bold"
          >
            Service Status
          </label>
          <div class="input-group mt-1">
            <select
              class="form-select form-select-md"
              aria-label=".form-select-lg example"
              value={servicestatus}
              onChange={(e) => setServiceStatus(e.target.value)}
            >
              <option value="Not started" selected>
                {" "}
                Not started
              </option>
              <option value="Active">Active</option>
              <option value="In-Active">In-active</option>
            </select>
          </div>
        </div>
        <div class="d-flex justify-content-between gap-2">
          <div></div>
          <button class="d-flex btn btn-sm btn-success align-items-center justify-content-center gap-2 px-3 send">
            Save <FaAngleDoubleRight />{" "}
          </button>
        </div>
      </form>
    </div>
  );
}

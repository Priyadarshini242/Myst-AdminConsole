import { getCookie } from '../../../config/cookieService';
import React, { useEffect, useState } from "react";
import "./createService.css";
import { FaAngleDoubleRight } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { MdCancel, MdCloudUpload } from "react-icons/md";
import { showErrorToast } from "../../../components/ToastNotification/showErrorToast";
import GetAllLangApi from "../../../api/content/GetAllLangApi";
import CreatableSelect from "react-select/creatable";
import { premiumServicePrices } from "../../SkillingAgency/SkillingAgencyConstants";
import LocationSuggestionApi from "../../../api/locationApi/LocationSuggestionApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../../config/Properties";
import Loader from "../../../components/Loader";
import { useApi } from "../../../context/useApi";
import { sessionDecrypt } from "../../../config/encrypt/encryptData";
import axiosInstance from '../../../api/axiosInstance';

const postServiceData = async (body) => {
  const headers = {
    Authorization: "Bearer " + getCookie("token"),
  };
  const userId =getCookie("userId");
  body.userId = userId;
  const response = await axiosInstance.post(
    `${BASE_URL}/skill/api/v1/skills/create/User Services`,
    body,
    { headers }
  );
  return response.data;
};

const CreateService = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: postServiceData,
    onSuccess: (data) => {
      queryClient.invalidateQueries("myservices");
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
  const { data } = useApi();

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

  async function handleSubmit(e) {
    e.preventDefault();
    const body = {
      userId:getCookie("userId"),
      serviceName: serviceName,
      serviceDescription: description,
      serviceLocation: selectedLocations.map((lan) => lan.value).join(", "),
      serviceLanguage: selectedLanguages.map((lan) => lan.value).join(", "),
      serviceCost: price,
      serviceCostCurrency: currencyInput,
      status: servicestatus,
    };

    // Trigger the mutation
    mutation.mutate(body);
  }
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

  if (mutation.isLoading || mutation.isPending) {
    return <Loader />;
  }

  return (
    <>
      <div className="me-5 ms-5 mb-5 mt-5">
        <div className="d-flex justify-content-between align-items-center ">
          <h2
            className="  fw-bold"
            style={{
              color: "var(--primary-color)",
            }}
          >
            Create Service
          </h2>
          <button
            class="btn btn-success btn-sm  "
            style={{
              backgroundColor: "var(--primary-color)",
              border: "none",
            }}
            onClick={() => navigate(-1)}
          >
            cancel
          </button>
        </div>

        <form>
          <div class=" d-flex gap-3 flex-column mt-4 ">
            <div class="">
              <label
                for="exampleFormControlInput1"
                class="form-label fw-bold mb-0"
              >
                Service Name
              </label>
              <input
                type="text"
                class="form-control "
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
                class=" form-control mb-2"
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
                    class="form-label d-flex justify-content-center align-items-center rounded"
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
              <i className="mt-1 " style={{ fontSize: "13px" }}>
                Note: Image should be in [{" "}
                <span className="fw-semibold">jpg,jpeg,png,gif</span> ] format &
                <span className="ml-2">{` 100kb < Image < 5mb`}</span>
              </i>
            </div>
            <div>
              <label for="customFile" class="form-label fw-bold mb-0">
                Attach Service Brochure
              </label>
              <input
                type="file"
                class={`form-control mb-0 ${isFileError ? "is-invalid" : ""}`}
                id="customFile"
                onChange={(e) => handleAttachmentChange(e)}
              />

              <i className="mt-1 " style={{ fontSize: "13px" }}>
                Note: file should be in [{" "}
                <span className="fw-semibold">pdf</span> ] format &
                <span className="ml-2">{` 100kb < File < 5mb`}</span>
              </i>
            </div>
            <div className="d-flex flex-column  ">
              <div className="d-flex gap-3 mt-2">
                <label for="location" class="form-label fw-bold mb-0">
                  Location(s)
                </label>
                <div>
                  <input
                    type="checkbox"
                    id="remoteCheckbox"
                    className="mx-2 mt-2"
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
            />
          </div>
          <div className="m-0 p-0 mt-3">
            <label
              for="exampleFormControlInput1"
              class="form-label fw-bold m-0 p-0"
            >
              Service Cost
            </label>
            <div className="d-flex  align-items-end">
              <input
                type="number"
                class="form-control mt-1 "
                id="exampleFormControlInput1"
                placeholder="enter service price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <CreatableSelect
                options={filterCurrency}
                placeholder={"Currency"}
                isValidNewOption={() => false}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    width: "10rem",
                  }),
                }}
                onChange={(newValue) => {
                  console.log(newValue);
                  setCurrencyInput(newValue.value);
                  console.log(newValue.value);
                }}
              />
            </div>
          </div>
          <div class="mb-3 mt-3">
            <label
              for="exampleFormControlInput1"
              class="form-label fw-bold m-0 p-0"
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
          <div class=" d-flex justify-content-between gap-2 ">
            <div></div>
            <button
              class="btn btn-success send btn-sm px-3 d-flex justify-content-center align-items-center gap-2 "
              onClick={handleSubmit}
              disabled={mutation.isLoading}
            >
              Create <FaAngleDoubleRight />{" "}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateService;

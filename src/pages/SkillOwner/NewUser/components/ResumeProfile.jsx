import React, { useEffect, useState } from 'react'
import { MdDelete, MdDoneOutline, MdEdit } from 'react-icons/md'
import { icons } from '../../../../constants'
import SuccessBtn from '../../../../components/Buttons/SuccessBtn'
import useContentLabel from '../../../../hooks/useContentLabel'
import { Col, Row } from 'react-bootstrap'
import CustomInput from '../../../../components/atoms/Input/CustomInput'
import BriefDescriptionTextArea from '../../../../components/molecules/Brief Desc Text Area/BriefDescriptionTextArea'
import DialCodeDropdown from '../../../../components/DialCodeDropdown'
import { useSelector } from 'react-redux'
import LocationCitySuggestionViaStateApi from '../../../../api/locationApi/LocationCitySuggestionViaStateApi'
import LocationStateSuggestionViaCountryApi from '../../../../api/locationApi/LocationStateSuggestionViaCountryApi'
import Select from "react-select";
import { getCookie } from '../../../../config/cookieService';

import DatePickerWidget from '../../../../components/molecules/Date/DatePickerWidget'
import { timestampToYYYYMMDD } from '../../../../components/SkillOwner/HelperFunction/timestampToYYYYMMDD'
import { useDispatch } from 'react-redux'
import Dropdown1 from '../../../../components/atoms/Dropdown/Dropdown1'
import { fetchGender } from '../../../../reducer/gender/genderMapSlice'
import { formatDateInputType } from '../../../../components/SkillOwner/HelperFunction/FormatDateInputType'
import RichTextArea from '../../../../components/molecules/Rich Text Editor/RichTextArea'
import { showErrorToast } from '../../../../components/ToastNotification/showErrorToast'
import { convertDateToUTC, timestampToUTCYYYYMMDD } from '../../../../components/helperFunctions/DateUtils'

const ResumeProfile = ({ profileInfo, setProfileInfo, updateResumeDetails }) => {
    const regionalData = useSelector((state) => state.regionalData);
    const contentLabel = useContentLabel()
    const dispatch = useDispatch()
    const [dialCodeSearchTerm, setDialCodeSearchTerm] = useState("");

    const [countryData, setCountryData] = useState([]);
    const [locationApiLoader, setLocationApiLoader] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState(undefined);
    const [selectedCity, setSelectedCity] = useState(undefined);
    const [cityData, setCityData] = useState([]);
    const [stateData, setStateData] = useState([])
    const [selectedState, setSelectedState] = useState([])

    const reactSelectTheme = (theme) => ({
        ...theme,
        colors: {
            ...theme.colors,
            primary25: "#f5f5f5",
            primary: "var(--primary-color)",
            primary50: "#f5f5f5",

        },
    })
    const reactSelectStyle = {
        control: (provided, state) => ({
            ...provided,
            width: "100%",
            border:
                state.isFocused || state.isActive
                    ? "1px solid var(--primary-color)"
                    : "1px solid #ced4da", // Customize bottom border style
            boxShadow: state.isFocused ? "none" : "none", // Remove the default focus box-shadow

        }),
    }
    const customComponents = {
        DropdownIndicator: () => null, // This hides the down arrow
        IndicatorSeparator: () => null, // Optional: This hides the separator line
    };

    /* HANDLE COUNTRY KEY STROKE */
    const handleCountryKeyStoke = (e) => {

        if (e.length > 2) {
            const data = regionalData?.listOfCountries;
            console.log(data);
            //eslint-disable-next-line
            setCountryData(
                data.map((item) => ({
                    ...item,
                    value: item.country,
                    label: item.country,

                    latitude: item.cityLatitude,
                    longitude: item.cityLongitude,
                }))
            );
        } else {
            setCountryData([])
        }
    };

    useEffect(() => {
        if (profileInfo?.userState) {
            setLocationApiLoader(true)
            LocationCitySuggestionViaStateApi(
                profileInfo?.userState,
            )
                .then((res) => {
                    const data = res?.data;
                    console.log(data);

                    //eslint-disable-next-line
                    setCityData(
                        data.map((item) => ({
                            ...item,
                            value: item?.city,
                            label: item?.city,
                            latitude: item?.cityLatitude,
                            longitude: item?.cityLongitude,
                        }))
                    );
                    setLocationApiLoader(false)
                })
                .catch((err) => {
                    console.error(err);
                    setLocationApiLoader(false)
                });
        } else {
            setCityData([])
        }
    }, [profileInfo?.userState])

    useEffect(() => {

        setStateData([])
        if (profileInfo?.userCountry) {
            setLocationApiLoader(true)
            LocationStateSuggestionViaCountryApi(
                profileInfo?.userCountry,
            )
                .then((res) => {
                    const data = res?.data;
                    //eslint-disable-next-line
                    // Use a Set to store unique states
                    const uniqueStates = new Set();

                    // Loop through each city object
                    data.forEach(city => {
                        // Add the state to the Set (Set automatically handles uniqueness)
                        uniqueStates.add(city?.state);
                    });


                    // Convert the Set to an array and return
                    setStateData(Array?.from(uniqueStates)?.map((state) => {
                        return { value: state, label: state }
                    }));
                    // setCityData(
                    //   data.map((item) => ({
                    //     ...item,
                    //     value: item?.city,
                    //     label: item?.city,
                    //     latitude: item?.cityLatitude,
                    //     longitude: item?.cityLongitude,
                    //   }))
                    // );
                    setLocationApiLoader(false)
                })
                .catch((err) => {
                    console.error(err);
                    setLocationApiLoader(false)
                });

        }



    }, [profileInfo?.userCountry])

    const genderMap = useSelector((state) => state.gender);
    useEffect(() => {
        genderMap?.status === "idle" && dispatch(fetchGender());
    }, [genderMap?.status, dispatch]);

    const genderOptions = genderMap?.data?.map((gender) => ({
        value: gender.id,
        label: gender.label,
    }));


    return (
        <div style={{
            position: "relative",
            opacity: profileInfo?.import ? '.5' : '1',
            pointerEvents: profileInfo?.import ? 'none' : ''
        }}>
            <Row  >
                {
                    profileInfo?.import &&
                    <div className="d-flex justify-content-end fw-bold text-primary-color" style={{ top: '1.3rem', right: '2rem' }}>{contentLabel('Imported', 'nf Imported')}</div>
                }
                <Col sm={12} md={6} className='mb-3' >
                    <label htmlFor="first-name" className='form-label  text-start '>   {contentLabel("FirstName", "nf First Name")}<span className="text-danger ms-1">*</span></label>
                    <CustomInput type="Text" class="form-control" id="first-name" value={profileInfo?.firstName} onChange={(e) => {
                        let value = e.target.value;

                        // if (/^[^a-zA-Z]/.test(value)) {
                        //     return showErrorToast(
                        //         contentLabel(
                        //             "FirstLetterShouldBeAlphabet",
                        //             "First Letter Should Be Alphabet"
                        //         )
                        //     ); // Prevent input if the first character is not an alphabet
                        // }
                        // if (value.length > 0) {
                        //     value =
                        //         value.charAt(0).toUpperCase() +
                        //         value.slice(1);
                        // }

                        // if (value.length > 100) {
                        //     return showErrorToast(
                        //         contentLabel(
                        //             "CharacterLimitExceeded",
                        //             `nf Character limit exceeded`
                        //         )
                        //     );
                        // }
                        if (value.length > 0) {
                            value =
                                value.charAt(0).toUpperCase() +
                                value.slice(1);
                        }
                        setProfileInfo({ ...profileInfo, firstName: value })
                    }} />
                </Col>
                <Col sm={12} md={6} className='mb-3'>
                    <label htmlFor="last-name" className='form-label  text-start '>  {contentLabel("LastName", "nf Last Name")}<span className="text-danger ms-1">*</span></label>
                    <CustomInput type="Text" class="form-control" id="last-name" value={profileInfo?.lastName} onChange={(e) => {
                        let value = e.target.value;
                        // if (/^[^a-zA-Z]/.test(value)) {
                        //     return showErrorToast(
                        //         contentLabel(
                        //             "FirstLetterShouldBeAlphabet",
                        //             "First Letter Should Be Alphabet"
                        //         )
                        //     ); // Prevent input if the first character is not an alphabet
                        // }
                        // if (value.length > 0) {
                        //     value =
                        //         value.charAt(0).toUpperCase() +
                        //         value.slice(1);
                        // }

                        // if (value.length > 100) {
                        //     return showErrorToast(
                        //         contentLabel(
                        //             "CharacterLimitExceeded",
                        //             `nf Character limit exceeded`
                        //         )
                        //     );
                        // }
                        if (value.length > 0) {
                            value =
                                value.charAt(0).toUpperCase() +
                                value.slice(1);
                        }
                        setProfileInfo({ ...profileInfo, lastName: value })
                    }} />
                </Col>


                <Col sm={12} md={6} className='mb-1 mt-1'>
                    <label className="form-label ">
                        {contentLabel("Gender", "nf Gender")}
                        {/* <span className="text-danger">*</span> */}
                    </label>
                    <Dropdown1
                        controlId="genderDropdown"
                        value={
                            genderOptions.find(
                                (option) => option.label === profileInfo?.mgender
                            )?.value || ""
                        }
                        onChange={(e) => {
                            const selectedGender = genderOptions.find(
                                (gender) => gender.value === e.target.value
                            );
                            setProfileInfo({ ...profileInfo, mgender: selectedGender?.label })

                        }}
                        // options={genderOptions}
                        options={[
                            {
                                value: "",
                                label: contentLabel("SelectAGender", "nf Select a gender"),
                                disabled: true,
                                style: { color: "#6c757d" },
                            },
                            ...genderOptions,
                        ]}
                        noLabel={true}
                    />
                </Col>



                <Col sm={12} md={6} className='mb-1 mt-1'>
                    <label
                        className="form-label "
                    // style={{ marginTop: ".5rem" }}
                    >
                        {contentLabel("DoB", "nf DoB")}
                        {/* <span className="text-danger">*</span> */}
                    </label>
                    <DatePickerWidget
                        toggleCalendarOnIconClick
                        selected={
                            profileInfo?.dob ? timestampToUTCYYYYMMDD(Number(profileInfo?.dob)) || "" : ""
                        }
                        onChange={(e) => {
                            var someDate = new Date(e);
                            someDate = convertDateToUTC(someDate).getTime();
                            setProfileInfo({ ...profileInfo, dob: someDate })
                        }}
                        dateFormat={formatDateInputType(
                            regionalData.selectedCountry.dateFormat
                        )}
                        placeholderText={getCookie("dateFormat")}
                        maxDate={timestampToUTCYYYYMMDD(Date.now())}
                        className="form-control"
                        id="exampleFormControlInput1"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={100}
                    />
                </Col>


                <Col sm={12} md={6}>
                    <label className="form-label ">
                        {contentLabel("Email", "nf Email")}
                    </label>
                    <CustomInput
                        type="email"
                        class="form-control"
                        id="email"
                        value={profileInfo?.email}
                        onChange={(e) => setProfileInfo({ ...profileInfo, email: e.target.value })}
                    />
                </Col>


                <Col sm={12} md={6} className='mb-3'>
                    <label htmlFor="phone" className='form-label  text-start '>   {contentLabel("Phone", "nf Phone")}</label>
                    {/* <CustomInput type="Text" class="form-control" id="phone" value={profileInfo?.phone} onChange={(e) => setProfileInfo({ ...profileInfo, phone: e.target.value })} /> */}
                    <DialCodeDropdown selectedDialCode={profileInfo?.phone?.split('-')[0] || ''}
                        onDialCodeSelect={(country) => {
                            setProfileInfo({ ...profileInfo, phone: `${country?.dialCode}-${profileInfo?.phone?.split('-')[1] || ''}` })
                            setDialCodeSearchTerm("");
                        }}
                        mobileNumber={profileInfo?.phone?.split('-')[1] || ''}
                        onMobileNumberChange={(e) => {
                            const inputValue = e.target.value.replace(/\D/g, '');
                            const countryCode = profileInfo?.mobileNumber?.split("-")[0] || "";
                            const maxPhoneLength = 15 - countryCode?.length;
                            if (inputValue?.length <= maxPhoneLength) {
                                setProfileInfo({ ...profileInfo, phone: `${profileInfo?.phone?.split('-')[0] || ''}-${inputValue}` })
                            }
                        }}
                    />
                </Col>




                <Col sm={12} md={6} className='mb-3' >
                    <label htmlFor="Address" className='form-label  text-start '>  {contentLabel("Address", "nf Address")}</label>
                    <CustomInput type="Text" class="form-control" id="Address" value={profileInfo?.address} onChange={(e) => setProfileInfo({ ...profileInfo, address: e.target.value })} />
                </Col>

                <Col sm={12} md={6} className='mb-3'>
                    <label htmlFor="country" className='form-label  text-start '> {contentLabel("Country", "nf Country")}</label>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        defaultValue={
                            profileInfo?.userCountry
                                ? {
                                    label: profileInfo?.userCountry,
                                    value: profileInfo?.userCountry,
                                }
                                : ''
                        }
                        value={
                            profileInfo?.userCountry
                                ? {
                                    label: profileInfo?.userCountry,
                                    value: profileInfo?.userCountry,
                                }
                                : ''
                        }
                        placeholder={contentLabel(
                            "EnterAtleastCharacters",
                            "nf Enter At Least 3 Characters"
                        )}
                        isClearable={true}
                        isSearchable={true}
                        name="Country"
                        options={countryData}
                        onInputChange={(e) => handleCountryKeyStoke(e)}
                        onChange={(e) => {
                            setSelectedCountry(e)
                            setProfileInfo({ ...profileInfo, userCountry: e?.country ? e?.country : '', userState: '', city: '', postalCode: '' })
                        }}
                        components={customComponents}
                        noOptionsMessage={() => {
                            if (countryData.length !== 0) {
                                return contentLabel('NoCountries', 'nf No Countries');
                            }
                            return null; // No message if input is 3 characters or fewer
                        }}
                        theme={reactSelectTheme}
                        styles={reactSelectStyle}
                    />


                </Col>

                <Col sm={12} md={6} className='mb-3'>
                    <label htmlFor="country" className='form-label  text-start '>  {contentLabel("State", "nf State")}</label>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        value={
                            {
                                label: profileInfo?.userState,
                                value: profileInfo?.userState,
                            }
                        }
                        isClearable={true}
                        isSearchable={true}
                        name="city"
                        options={stateData}
                        onChange={(e) => {
                            setSelectedState(e)
                            setProfileInfo({ ...profileInfo, userState: e?.value ? e?.value : '', city: '', postalCode: '' })
                        }}
                        noOptionsMessage={() =>
                            locationApiLoader ? `${contentLabel('Loading', 'Loading')}...` : stateData?.length > 0 ? `${contentLabel('No', 'nf No')} ${contentLabel("State", "nf State")}` : null
                        }
                        components={customComponents}
                        theme={reactSelectTheme}
                        styles={reactSelectStyle}
                    />
                </Col>


                <Col sm={12} md={6} className='mb-3'>
                    <label htmlFor="country" className='form-label  text-start '>   {contentLabel("City", "nf City")}</label>
                    <Select
                        className="basic-single"
                        classNamePrefix="select"
                        value={
                            {
                                label: profileInfo?.city,
                                value: profileInfo?.city,
                            }
                        }
                        placeholder={contentLabel(
                            "EnterAtleastCharacters",
                            "nf Enter At Least 3 Characters"
                        )}
                        isClearable={true}
                        isSearchable={true}
                        name="city"
                        options={cityData}
                        onChange={(e) => {
                            setSelectedCity(e)
                            setProfileInfo({ ...profileInfo, city: e?.city ? e?.city : '', postalCode: '' })
                        }}
                        noOptionsMessage={() =>
                            locationApiLoader ? `${contentLabel('Loading', 'Loading')}...` : cityData?.length > 0 ?
                                contentLabel(
                                    "LocationDataMsg",
                                    "nf Please enter your nearest metro city. Our master list is currently restricted to a selection of metro cities"
                                )
                                : null
                        }
                        components={customComponents}
                        theme={reactSelectTheme}
                        styles={reactSelectStyle}

                    />
                </Col>


                <Col sm={12} md={6} className='mb-5'>
                    <label htmlFor="country" className='form-label  text-start '> {contentLabel("PostalCode", "nf Postal Code")}</label>
                    <CustomInput
                        type="text"
                        id="postalCode"
                        value={profileInfo?.postalCode}
                        onChange={(e) => setProfileInfo({ ...profileInfo, postalCode: e.target.value })}
                    />
                </Col>


                {/* SUMMARRY SECTION */}
                <Col sm={12} className='mb-3'>
                    <BriefDescriptionTextArea
                        label={contentLabel("BriefSummary", "nf Brief Summary")}
                        htmlFor={"About"}
                        id={"about"}
                        name={"About"}
                        value={
                            profileInfo?.about
                                ? profileInfo?.about.replace(/<br>/g, "\n")
                                : ""
                        }
                        onChange={(e) => setProfileInfo({ ...profileInfo, about: e.target.value })}
                        isBold={false}
                        limit={500}
                    // tooltipValue={contentLabel(
                    //     "BriefSummaryInfo",
                    //     "nf Brief Summary Info"
                    // )}
                    />
                </Col>

                <Col sm={12} className='mb-3'>
                    <RichTextArea
                        label={contentLabel("DetailedSummary", "nf Detailed Summary")}
                        htmlFor={"bioProfile"}
                        id={"bioProfile"}
                        name={"bioProfile"}
                        value={profileInfo?.bioProfile}
                        onChange={(e) => {
                            let cleanedValue = e;
                            // Remove empty formatting tags ONLY IF there's no actual text
                            if (cleanedValue.replace(/<[^>]+>/g, "").trim() === "") {
                                cleanedValue = "";
                            }
                            setProfileInfo({ ...profileInfo, bioProfile: cleanedValue })
                        }}
                        isBold={false}
                        limit={3000}
                    // tooltipValue={contentLabel(
                    //     "DetailedSummaryInfo",
                    //     "nf Detailed Summary Info"
                    // )}
                    />
                </Col>

            </Row>



        </div>
    )
}

export default ResumeProfile

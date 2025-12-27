import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { sessionEncrypt } from "../../../config/encrypt/encryptData";
import { setDirection } from "../../../reducer/localization/directionSlice";
import { setLanguage } from "../../../reducer/localization/languageSlice";
import { setCookie } from "../../../config/cookieService";

const LanguageComponentSOLogin = ({ userAuthPage, isOwnerSignup }) => {
  const selectedLanguage = useSelector((state) => state.language);
  const langList = useSelector((state) => state.langList);
  const userDetails = useSelector((state) => state.userProfile.data);

  const dispatch = useDispatch();

  const handleLanguageChange = (event) => {
    sessionStorage.setItem("prevLang", sessionEncrypt(selectedLanguage));

    dispatch(setLanguage(event.target.value));
    if (event.target.value === "AR-SA") {
      dispatch(setDirection("rtl"));
    } else {
      dispatch(setDirection("ltr"));
    }
    // while switch language we need to update the userid in localstorage

    const userDetailsArray = Object.values(userDetails);

    const userForSelectedLanguage = userDetailsArray.find(
      (userObject) => userObject && userObject.mlanguage === event.target.value
    );

    if (userForSelectedLanguage) {
      sessionStorage.setItem(
        "userId",
        sessionEncrypt(userForSelectedLanguage.id)
      );
        setCookie("userId", userForSelectedLanguage.id);
    } else {
      console.log("No language found for the selected language.");
    }
  };

  return (
    <div className={`d-block`}>
      <select
        className="so-form-lanugage-dropdown cursor-pointer"
        aria-label="Default select example"
        onChange={handleLanguageChange}
        value={selectedLanguage}
      >
        {langList.AllLanguage.length > 0 &&
          langList.AllLanguage.map((item) => (
            <option
              value={item.code}
              key={item.code}
              className="bg-body-tertiary font-dd    text-black  "
            >
              {selectedLanguage === item.code
                ? item.code
                : ` ${item.mlanguage}`}
            </option>
          ))}
      </select>
    </div>
  );
};

export default LanguageComponentSOLogin;

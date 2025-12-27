import { getCookie } from '../../config/cookieService';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config/Properties";
import { useParams } from "react-router-dom";
import { sessionDecrypt } from "../../config/encrypt/encryptData";

export const EditService2 = () => {
  const { id } = useParams();
  const userId = id;

  const [token, setToken] = useState("");

  useEffect(() => {
    const storedToken = getCookie("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handlePutRequest = () => {
    const url = `${BASE_URL}/skill/api/v1/skills/edit/User Services/${userId}?authToken=${token}`;

    const body = {
      serviceName: "hello",
    };

    axios
      .put(url, body)
      .then((response) => {
        console.log("Responsesadsd:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div>
      <button onClick={handlePutRequest}>Make PUT Request</button>
    </div>
  );
};

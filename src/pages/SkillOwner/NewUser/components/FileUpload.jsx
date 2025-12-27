import axios from "axios";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Base64 } from "./base64";
import SecondaryBtnLoader from "../../../../components/Buttons/SecondaryBtnLoader";
import { showErrorToast } from "../../../../components/ToastNotification/showErrorToast";
import { useNavigate } from "react-router-dom";
import Loader from "../../../../components/Loader";
import EditApi from "../../../../api/editData/EditApi";
import { useSelector } from "react-redux";
import { GetUserForSelectedLanguage } from "../../../../components/SkillOwner/HelperFunction/GetUserForSelectedLanguage";
import { useDispatch } from "react-redux";
import { editExistingUserProfile } from "../../../../reducer/userDetails/UserProfileSlice";
import { sessionEncrypt } from "../../../../config/encrypt/encryptData";
import ActionButton from "../../../../components/atoms/Buttons/ActionButton";
import { Button } from "react-bootstrap";

const FileUpload = () => {
  const [rejected, setrejected] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileupload, setFileupload] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* STORE IMPORTS */
  const { language: selectedLanguage } = useSelector((state) => state);
  const userDetails = useSelector((state) =>
    GetUserForSelectedLanguage(state.userProfile.data, selectedLanguage)
  );

  const uploadFile = async () => {
    try {
      setFileupload(true);
      const resume = files[0];
      if (!resume) return alert("Please select a file.");

      const modifiedDate = new Date(resume.lastModified)
        .toISOString()
        .substring(0, 10);

      const body = await new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = function (event) {
          const base64Text = Base64.encodeArray(event.target.result);
          const data = {
            DocumentAsBase64String: base64Text,
            DocumentLastModified: modifiedDate,
            ConfigString: "OutputFormat.NormalizeRegions = true",
            SkillsSettings: {
              Normalize: true,
              TaxonomyVersion: "V2",
            },
          };
          resolve(data);
        };

        reader.readAsArrayBuffer(resume);
      });

      console.log("body is", body);
      console.log("body is");

      const response = axios.post(
        // "https://rest.resumeparsing.com/v10/parser/resume",
        "https://api.us.textkernel.com/tx/v10/parser/resume",
        JSON.stringify(body),
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            // //prev coder details
            //  "Sovren-AccountId": "39862522",
            //  "Sovren-ServiceKey": "MPHs8q9cL+MrYdBP0a6JOOGv7a3h6vogInGVKG6f",

            // //bala sir's details
            // "Sovren-AccountId": "42117127",
            // "Sovren-ServiceKey": "XhGAMIHEanCoJAebS49pXaUaQiqzkbuMs7eyu1qK",

            //Mahesh sir's details
            "Sovren-AccountId": "31384490",
            "Sovren-ServiceKey": "e7XGNlFpnzTKp2bJC987CB6s+dTH/I/MfR45VvOi",
          },
        }
      );

      const { data } = await response;
      /* SAVE THE DATA INTO USER DETAILS */
      // const payload = {
      //     attachmentFileNames: JSON.stringify(data)
      // }
      // try {
      //     await EditApi('User Details', userDetails?.id, payload);
      //     dispatch(
      //     editExistingUserProfile({
      //         id: userDetails?.id,
      //         updatedData: payload,
      //     })
      //     );
      // } catch (error) {
      //     console.error('ERROR SAVING DATA :', error);
      // }
      console.log(data);
      sessionStorage.setItem(
        "resumeData",
        sessionEncrypt(JSON.stringify(data))
      );
      navigate("/newuser/resumeresults");
      setFileupload(false);
    } catch (error) {
      console.log(error);
      showErrorToast("Something went wrong");
    } finally {
      setFileupload(false);
    }
  };

  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles?.length) {
        setFiles((previousFiles) => [
          //   ...previousFiles,
          ...acceptedFiles.map((file) =>
            Object.assign(file, { preview: URL.createObjectURL(file) })
          ),
        ]);
      }

      console.log(rejectedFiles);
      if (rejectedFiles?.length) {
        setrejected((previousFiles) => [...previousFiles, ...rejectedFiles]);
      }

      console.log(rejected, "use state");
    },
    [setFiles, rejected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": ".pdf",
    },
    // max size 1mb
    maxSize: 1024 * 1000,
  });

  const handleDeleteFile = (name) => {
    setFiles((previousFiles) =>
      previousFiles.filter((file) => file.name !== name)
    );
  };

  return (
    <div className="h-100 w-100 d-flex flex-column justify-content-start align-items-center my-5">
      {/* <h4 className="ms-1 mt-2 ">
        <p>Upload Your Resume</p>
      </h4> */}
      <div
        className=" text-center pt-4  w-50  my-2 bg-body-tertiary mx-1 text-muted d-flex  justify-content-center align-items-center  "
        style={{ borderStyle: "dashed", borderColor: "gray", height: "16rem" }}
      >
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop your Resume or Select your Resume</p>
          )}
        </div>
      </div>

      {files?.length > 0 && (
        <>
          {/* <h6 className="ms-1  text-muted  ">Accepted files:</h6> */}
          <div className="d-flex justify-content-center flex-column align-items-center flex-wrap">
            {files?.length ? (
              files.map((file, index) => (
                <>
                  <div
                    className="m-2 position-relative d-flex gap-2 justify-content-center align-items-center"
                    key={index}
                  >
                    <div className="text-muted font-6">{file.name}</div>

                    <button
                      className="btn p-0 px-1 btn-secondary  btn-sm "
                      onClick={() => handleDeleteFile(file.name)}
                    >
                      X
                    </button>
                  </div>

                  {/* <button className="btn" onClick={()=>uploadFile()}>Submit</button> */}
                  {/* <button className='btn' style={{ border: '2px solid var(--primary-color)', color: 'var(--primary-color)', opacity: '.5' }}  >Submit</button> */}
                  {/* <SecondaryBtnLoader
                    onClick={() => uploadFile()}
                    label={"Submit"}
                    backgroundColor="var(--primary-color)"
                    color="white"
                    loading={fileupload}
                  /> */}
                  {/* <ActionButton
                    label={'Submit'}
                    onClick={() => uploadFile()}
                  /> */}
                  <Button className="btn-primary" onClick={() => uploadFile()}>
                    Submit
                  </Button>
                </>
              ))
            ) : (
              <p className="text-center text-muted  ">No files uploaded</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;

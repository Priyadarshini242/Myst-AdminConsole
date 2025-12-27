import { useEffect, useState } from "react";
import ProgressBar from "../../../components/SkillingAgency/PremiumServices/ProgressBar/ProgressBar";
import CreatableSelect from "react-select/creatable";
import { languages, myLanguages } from "../SkillingAgencyConstants";

const TranslationService = () => {
  const [value, setValue] = useState(0);
  const [success, setSuccess] = useState(false);

  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    setInterval(() => {
      setValue((val) => val + 0.1);
    }, 20);
  }, []);

  return (
    <>
      <div
        class="modal fade modal"
        style={{ marginTop: "50px" }}
        id="translate-note"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Note
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div class="modal-body">
              Please remember it is not 100% accurate , You only get 50% to 60%
              accuracy
              <div className="d-flex justify-content-end">
                <button
                  className="btn py-1 px-2 mt-2"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    fontSize: ".7rem",
                  }}
                  data-bs-toggle="modal"
                  data-bs-target="#translate-note"
                  onClick={() => {
                    setShowProgress(true);
                  }}
                >
                  Convert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column gap-4 p-2">
        <div className="d-flex justify-content-center align-items-center flex-column">
          <h4 className=" m-0 p-0 fw-bold">Translation Service</h4>
          <span className=" p-0 " style={{ fontSize: "15px" }}>
            Choose your desired language and translate
          </span>
        </div>

        <div className="d-flex justify-content-center align-items-center gap-3">
          <span>Translate my</span>

          <div style={{ width: "200px" }}>
            <CreatableSelect isClearable options={myLanguages} />
          </div>
          <span>profile to</span>

          <div style={{ width: "200px" }}>
            <CreatableSelect isClearable options={languages}  onKeyDown={(e) => {
                            if (LIMITED_SPL_CHARS.includes(e.key)) {
                              e.preventDefault();
                              showErrorToast(
                                contentLabel(
                                  "SpecialCharNotAllowed",
                                  "nf Special Characters Not Allowed"
                                )
                              );
                            }
                          }} />
          </div>

          <button
            className="btn py-1 px-2 m-0"
            style={{
              backgroundColor: "var(--primary-color)",
              color: "white",
              fontSize: ".7rem",
            }}
            data-bs-toggle="modal"
            data-bs-target="#translate-note"
          >
            go
          </button>
        </div>
      </div>

      {showProgress && (
        <div className="m-2 mt-4">
          <i className="mt-1 " style={{ fontSize: "13px" }}>
            Note: Please remember it is not 100% accurate , [{" "}
            <span className="fw-semibold">
              You only get 50% to 60% accuracy
            </span>{" "}
            ]
          </i>

          <ProgressBar value={value} onComplete={() => setSuccess(true)} />
          <span className="text-center">
            <span className="fw-bold">Status : </span>
            {success
              ? "Complete! You can switch your Language and see the results"
              : "Processing..."}
          </span>
        </div>
      )}
    </>
  );
};

export default TranslationService;

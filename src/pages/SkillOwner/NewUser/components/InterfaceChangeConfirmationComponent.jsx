import React from "react";

const InterfaceChangeConfirmationComponent = ({
  content,
  selectedLanguage,
  FaTimes,
  SecondaryBtnLoader,
  handleUpdateAccount,
  isSavingAccountDetail,
  setIsAccountDialogOpen,
}) => {
  return (
    <React.Fragment>
      <div
        class="modal"
        tabindex="-1"
        role="dialog"
        style={{ display: "block" }}
      >
        <div class="modal-dialog" role="document" style={{ marginTop: "5rem" }}>
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title fw-bold">
                Now you've successfully onbarded to MyST
              </h6>
              <button
                type="button"
                class="close"
                style={{ border: "none" }}
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => setIsAccountDialogOpen(false)}
              >
                <span aria-hidden="true">
                  <FaTimes />
                </span>
              </button>
            </div>
            <div className="modal-body">
              <p className="fs-6">Want to move to MyST Interface?</p>
            </div>
            <div class="modal-footer border-top-0">
              <SecondaryBtnLoader
                label={
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "OK"
                    ) || {}
                  ).mvalue || "nf OK"
                }
                backgroundColor="var(--primary-color)"
                color="#F8F8E9"
                onClick={handleUpdateAccount}
                loading={isSavingAccountDetail}
              />
              <SecondaryBtnLoader
                label={
                  (
                    content[selectedLanguage]?.find(
                      (item) => item.elementLabel === "Cancel"
                    ) || {}
                  ).mvalue || "nf Cancel"
                }
                backgroundColor="var(--primary-color)"
                color="#F8F8E9"
                data-dismiss="modal"
                onClick={() => setIsAccountDialogOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default InterfaceChangeConfirmationComponent;

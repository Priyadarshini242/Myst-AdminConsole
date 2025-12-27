import React, { useCallback, useEffect, useState } from 'react'
import useContentLabel from '../../../hooks/useContentLabel';
import CustomButton from '../../../components/atoms/Buttons/CustomButton';
import EmploymentForm from '../../../views/profile management/employment data/EmploymentForm';
import { useDispatch, useSelector } from 'react-redux';
import { FetchOrganizationHistory } from '../../../api/fetchAllData/fetchOrganization';
import { DayDifferenceToDynamicView } from '../../../components/SkillOwner/HelperFunction/DayDifferenceToDynamicView';
import { fetchEmpType } from '../../../reducer/emp type/empTypeSlice';
import { FormatDateTimeStampMonthAndDate } from '../../../components/SkillOwner/HelperFunction/FormatDateTimeStampMonthAndDate';
import EmploymentViewSimpleUI from '../../../views/simple ui/views/EmploymentViewSimpleUI';
import UserDetailsViewSimpleUI from './../../../views/simple ui/views/UserDetailsViewSimpleUI';
import SkillsAndOccupationViewSimpleUI from '../../../views/simple ui/views/SkillsAndOccupationViewSimpleUI';
import EducationViewSimpleUI from '../../../views/simple ui/views/EducationViewSimpleUI';
import { current } from '@reduxjs/toolkit';
import ContactDetailsViewSimpleUI from '../../../views/simple ui/views/ContactDetailsViewSimpleUI';
import CreateStepper from '../../../components/Steppers/CreateStepper';
import AchievementViewSimpleUI from '../../../views/simple ui/views/AchievementViewSimpleUI';
import StepperSimpleUi from '../../../components/Steppers/WelcomeUIStepper';
import CertificationsViewSimpleUI from '../../../views/simple ui/views/CertificationsViewSimpleUI';
const SimpleUi = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dispatch = useDispatch();
  const contentLabel = useContentLabel();
  const selectedLanguage = useSelector((state) => state.language);
  const content = useSelector((state) => state.content);

  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false,
    step7: false,
  });

  const stepIdChecker = (e, currentStep) => {
    return e === currentStep;
  }

  const boxStyle = {
    class: 'px-md-4 py-md-2 pt-md-5',
    style: {
      minHeight: "470px",
      maxHeight: "470px", width: "100%", overflowY: "auto", overflowX: "hidden",
      // boxShadow:" rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",

      borderBottom: "1px solid  #a4a4a4",
      borderRadius: "5px"

    }
  };
  const stepper = {

    groups: [

      {
        id: 1,
        title: "Group 1",
        groupFor: [1, 2],
      },
      {
        id: 2,
        title: "Group 2",
        groupFor: [3, 4, 5],
      },
    ],
    steps: [

    ]
  };
  const steperSteps = [
    {
      name: contentLabel("Profile", "nf Profile"),
      number: 1,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Definition",
      Component: () => <div>step1</div>,
    },
    {
      name: contentLabel(
        "Skills",
        "nf Skills"
      ),
      number: 2,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Description",
      Component: () => <div>step2</div>,
    },
    {
      name: contentLabel("Employment", "nf Employment"),
      number: 3,
      link: "/skill-seeker/Opportunities/Create/Candidate-Requirement",
      Component: () => <div>step3</div>,
    },
    {
      name: contentLabel("Education", "nf Education"),
      number: 4,
      link: "/skill-seeker/Opportunities/Create/Screening-Question",
      Component: () => <div>step4</div>,
    },
    {
      name: contentLabel("Certifications", "nf Certifications"),
      number: 5,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Preview",
      Component: () => <div>step5</div>,
    },
    {
      name: contentLabel("Achievements", "nf Achievements"),
      number: 6,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Preview",
      Component: () => <div>step6</div>,
    },
    {
      name: contentLabel("Upload", "nf Upload"),
      number: 7,
      link: "/skill-seeker/Opportunities/Create/Opportunity-Preview",
      Component: () => <div>step5</div>,
    },
  ];

  return (
    <div class="row">
      <div class="col-lg-12">
        <div class={isMobile ? "" : "card"}>
          <div class="card-body">
            {/* Stepper UI */}
            {/* <StepperSimpleUi
              steps={steperSteps}
              activeSteps={steps}
              setActiveSteps={setSteps}
            /> */}
            {/* <div className="px-md-4 py-md-2  d-flex  align-items-end gap-2">
              {stepper.groups.map(grp => grp.groupFor.map((step, index) => {
                return <div id={step} key={step} className="" style={{ width: "25%", color: grp.groupFor.includes(currentStep) ? "#000000" : "#808080", fontWeight: grp.groupFor.includes(currentStep) ? "Bold" : "" }}>
                  {index == 0 && <span>{grp.title}</span>}
                  <div className="w-100" id={step} style={{ height: "2px", backgroundColor: currentStep === step ? "#000000" : "#808080", margin: "8px 0" }}
                  />
                </div>

              }))}

            </div> */}

            {/* step 1 user details */}
            {!steps.step1 && (
              <UserDetailsViewSimpleUI
                styles={boxStyle}
                setCurrentStep={setCurrentStep}
                currentStep={currentStep}
              />
            )}
            {/* step 2 Skills And Occupation View */}
            {/* {
              currentStep === 2 &&
              <ContactDetailsViewSimpleUI styles={boxStyle} setCurrentStep={setCurrentStep} currentStep={currentStep} />
            } */}
            {steps.step1 && !steps.step2 && (
              <SkillsAndOccupationViewSimpleUI
                styles={boxStyle}
                setCurrentStep={setCurrentStep}
                currentStep={currentStep}
              />
            )}
            {/* step 3 Employment view */}
            {steps.step1 && steps.step2 && !steps.step3 && (
              <EmploymentViewSimpleUI
                styles={boxStyle}
                setCurrentStep={setCurrentStep}
                currentStep={currentStep}
              />
            )}
            {steps.step1 && steps.step2 && steps.step3 && !steps.step4 && (
              <EducationViewSimpleUI
                styles={boxStyle}
                setCurrentStep={setCurrentStep}
                currentStep={currentStep}
              />
            )}
            {steps.step1 &&
              steps.step2 &&
              steps.step3 &&
              steps.step4 &&
              steps.step5 &&
              !steps.step6 && (
                // <EducationViewSimpleUI
                //   styles={boxStyle}
                //   setCurrentStep={setCurrentStep}
                //   currentStep={currentStep}
                // />
                <AchievementViewSimpleUI
                  styles={boxStyle}
                  setCurrentStep={setCurrentStep}
                  currentStep={currentStep}
                />
              )}            {/* CERTIFICATION */}
            {
              steps.step1 && steps.step2 && steps.step3 && steps.step4 && !steps.step5 &&
              <CertificationsViewSimpleUI styles={boxStyle} setCurrentStep={setCurrentStep} currentStep={currentStep} />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleUi
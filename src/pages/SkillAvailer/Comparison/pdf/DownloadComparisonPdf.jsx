import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDFOpportunityInformation from './PDFOpportunityInformation';
import { icons } from '../../../../constants';
import SmallLoader from '../../../../components/SkillAvailer/SmallLoader';
import useContentLabel from '../../../../hooks/useContentLabel';
import { useSelector } from 'react-redux';
import { Dropdown as BootstrapDropdown } from 'react-bootstrap';

const DownloadOpportunityPDF = ({ data, skills, candidates = [] }) => {
  const selectedLanguage = useSelector(state => state.language);
  const content = useSelector(state => state.content);
  const contentLabel = useContentLabel();

  const generatePDF = (anonymised = false) => (
    <PDFOpportunityInformation
      data={data}
      skills={skills}
      candidates={candidates}
      anonymised={anonymised}
      icons={{
        InfoOutlinedIcon: <icons.InfoOutlinedIcon />,
        BusinessCenterOutlinedIcon: <icons.BusinessCenterOutlinedIcon />,
        AccessTimeOutlinedIcon: <icons.AccessTimeOutlinedIcon />,
        TbCategory: <icons.TbCategory />,
        BiLinkExternal: <icons.BiLinkExternal />,
        MdOutlineVerifiedUser: <icons.MdOutlineVerifiedUser />,
      }}
      contentLabel={contentLabel}
      content={content}
      selectedLanguage={selectedLanguage}
    />
  );

  return (
    <BootstrapDropdown>
      <BootstrapDropdown.Toggle
        variant="link"
        className="p-0 border-0 d-flex align-items-center gap-2"
        style={{ boxShadow: 'none', color: 'var(--primary-color)' }}
      >
        <icons.HiOutlineDocumentDownload
          style={{ width: '30px', height: '30px', color: 'var(--primary-color)' }}
        />
      </BootstrapDropdown.Toggle>

      <BootstrapDropdown.Menu>
        <BootstrapDropdown.Item as="div" className="custom-seeker-dropdown-item">
          <PDFDownloadLink
            document={generatePDF(false)}
            fileName="opportunity-info.pdf"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {({ loading }) =>
              loading ? (
                <SmallLoader
                  className="d-flex justify-content-center align-items-center"
                  bg="0px"
                  height="1.5rem"
                  width="1.6rem"
                  color="var(--primary-color)"
                />
              ) : (
                contentLabel("NormalReport", "nf Normal Report")
              )
            }
          </PDFDownloadLink>
        </BootstrapDropdown.Item>

        <BootstrapDropdown.Item as="div" className="custom-seeker-dropdown-item">
          <PDFDownloadLink
            document={generatePDF(true)}
            fileName="anonymised-opportunity-info.pdf"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            {({ loading }) =>
              loading ? (
                <SmallLoader
                  className="d-flex justify-content-center align-items-center"
                  bg="0px"
                  height="1.5rem"
                  width="1.6rem"
                  color="var(--primary-color)"
                />
              ) : (
                contentLabel("AnonymiseReport", "nf Anonymise Report")
              )
            }
          </PDFDownloadLink>
        </BootstrapDropdown.Item>
      </BootstrapDropdown.Menu>
    </BootstrapDropdown>
  );
};

export default DownloadOpportunityPDF;

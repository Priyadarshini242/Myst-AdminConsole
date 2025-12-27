// PDFOpportunityInformation.js
import React from 'react';
import {
  Document, Page, Text, View, StyleSheet,
  Image
} from '@react-pdf/renderer';
import { convertDaysToPhase } from '../../../../components/SkillAvailer/helperFunction/conversion';
import s from '../../../../Reports/Templates/Skill Profile Template/Skill Profile Report Components/Styles/ResumeStyles';
import useContentLabel from '../../../../hooks/useContentLabel';
import checkedImg from "../../../../assets/images/checked.png"
import logo from "../../../../assets/images/logo.png"
import headerStyle from '../../../../Reports/Templates/Common Template/Header Template/Styles/ResumeHeaderStyle';
// import { icons } from '../../../../constants';
import { images } from '../../../../constants';
import FooterTemplate from '../../../../Reports/Templates/Common Template/Footer Template/FooterTemplate';
import PDFSkillDeatilsForCandidate from './PDFSkillDeatilsForCandidate';
import { GetAttachment } from '../../../../api/Attachment  API/DownloadAttachmentApi';

const styles = StyleSheet.create({
  title: {  marginBottom: 7, marginLeft: 15 ,  color: "#808080", },
  row: { flexWrap: 'wrap', marginBottom: 2, width: '70%', marginLeft: 15 },
  infoItem: { width: '100%', marginBottom: 2, fontSize: 9 },
  italicNote: { fontStyle: 'italic', opacity: 0.7 },
  skillTitle: {
    flexDirection: "row",           // horizontal layout
    alignItems: "center",           // vertically align items
    justifyContent: "flex-start",   // align items to the left
  },
});


const PDFOpportunityInformation = ({
  data = false, skills = [], candidates = [], icons = {}, contentLabel = false,
  content = false, selectedLanguage = false, anonymised = false
}) => {
  const fontSize = 9
  // const contentLabel = useContentLabel()
  const sortedSkills = [...skills]?.sort((a, b) => {
    if (a.jdType === "Mandatory" && b.jdType !== "Mandatory") return -1;
    if (a.jdType !== "Mandatory" && b.jdType === "Mandatory") return 1;
    return a.skill.localeCompare(b.skill);
  });

  const getLocation = () => {
    if (Array.isArray(data?.jobLocation)) {
      return data.jobLocation.map((loc) => loc.value).join(', ');
    }
    return data?.jobLocation || '';
  };

  console.log(data);
  

  return (
    <Document>
      <Page size="A4" style={s.page}>


        <View
          style={{
            ...s.headingContainer,
            ...s.headingText(fontSize + 10),
          }}
        >
          <Text>
            {contentLabel("SkillsComparisonReport", "nf Skills Comparison Report")}
          </Text>
        </View>

        {/* Divider Line */}
        <View style={[s.headerDivider]} />


        <View style={headerStyle.resumeHeader_header}>

          <Image style={headerStyle.resumeHeader_logo_company}
            src={
              data?.logoExists
                ? (GetAttachment(
                  data?.userId,
                  data?.fileName,
                  data?.fileId
                ) || images.company_image_gray )
                : images.company_image_gray
            }
            // src={images.company_image_gray} 
            />

          <View>
            <Text style={{...styles.title,  ...s.headingText(fontSize + 4)}}>{data?.title}</Text>
            <View style={[s.reportTableRow,
            styles.row
            ]}>
              {data?.jdCompany && (
                <Text style={styles.infoItem}>
                  <svg class="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-i4bv87-MuiSvgIcon-root" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="BusinessCenterOutlinedIcon" style="color: var(--primary-color);"><path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v5c0 .75.4 1.38 1 1.73V19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-3.28c.59-.35 1-.99 1-1.72V9c0-1.1-.9-2-2-2M10 5h4v2h-4zM4 9h16v5h-5v-3H9v3H4zm9 6h-2v-2h2zm6 4H5v-3h4v1h6v-1h4z"></path></svg>
                  {data.jdCompany}</Text>
              )}
              {getLocation() && (
                <Text style={styles.infoItem}>{getLocation()}</Text>
              )}
              {data?.jdType && (
                <Text style={styles.infoItem}>{data.jdType}</Text>
              )}
              {/* {data?.jdCategoryName && (
                <Text style={styles.infoItem}>{data.jdCategoryName}</Text>
              )}
              {data?.jdSubCategoryName && (
                <Text style={styles.infoItem}>
                  {data.jdSubCategoryName}
                </Text>
              )} */}
              {/* {data?.externalSite && (
                <Text style={styles.infoItem}>{data.externalSite}</Text>
              )} */}
              {data?.experienceLevel && (
                <Text style={styles.infoItem}>{data.experienceLevel}</Text>
              )}
            </View>
          </View>

          <Image style={headerStyle.resumeHeader_logo} src={logo} />
        </View>



        {/* Divider Line */}
        <View style={s.headerDivider} />


        <View
          style={{
            ...s.headingContainer,
            ...s.headingText(fontSize + 4),
          }}
        >
          <Text>
            {contentLabel("SkillsRequired", "nf nf Skills Required")}
          </Text>
        </View>



        {/* Skills Table */}
        <View style={s.reportTable}>
          <View style={s.reportTableRowHeader}>
            <Text style={s.reportTableHeaderCompare}>
            {/* {contentLabel("Compare", "Compare")} */}
            </Text>
            <Text style={s.reportTableCellSkill}>{contentLabel("Skills", "nf Skills")}</Text>
            <Text style={s.reportTableCellApplied}>{contentLabel("Experience", "nf Experience")}</Text>
            <Text style={s.reportTableCellAcquired}>{contentLabel("Mandatory", "nf Mandatory")}</Text>
          </View>

          {sortedSkills.map((skill, i) => (
            <View
              key={i}
              style={[
                s.reportTableRow,
                i % 2 === 1 ? s.oddRow : null,
              ]}
            >
              <Text style={s.reportTableHeaderCompare}>{skill?.active ? <Image src={checkedImg} style={{ width: 10, height: 10, marginRight: 5 }} /> : ""}</Text>
              <Text style={s.reportTableCellSkill}>{skill.skill}</Text>
              <Text style={s.reportTableCellApplied}>
                {convertDaysToPhase(skill.yoeMin, skill.yoePhase)} - {convertDaysToPhase(skill.yoeMax, skill.yoePhase)}{" "}{skill.yoePhase}
              </Text>
              <Text style={s.reportTableCellAcquired}>
                {skill.jdType === 'Mandatory' ? contentLabel("Yes", "nf Yes") : ''}
              </Text>
            </View>
          ))}
        </View>

        <FooterTemplate content={content} selectedLanguage={selectedLanguage} />

      </Page>





      <Page size="A4" style={s.page}>
        <View
          style={{
            ...s.headingContainer,
            ...s.headingText(fontSize + 10),
          }}
        >
          <Text>
            {contentLabel("SelectedCandidateDetails", "nf Selected candidate details")}
          </Text>
        </View>

        {/* Divider Line */}
        <View style={[s.headerDivider]} />

        {Object.entries(candidates).map(([skillName, skillData], index) => (
          <>
            {/* Skill Heading */}
            <View
              style={{
                ...s.skillHeadingContainer,
                ...s.headingText(fontSize + 4),
                ...styles.skillTitle,
              }}
            >
              <Text style={{ width: "33%" }}>
                {skillData?.skill?.skill || skillName}
              </Text>
              <Text style={{ width: "33%" }}>
                {convertDaysToPhase(skillData?.skill?.yoeMin, skillData?.skill?.yoePhase)} - {""}
                {convertDaysToPhase(skillData?.skill?.yoeMax, skillData?.skill?.yoePhase)} {""}
                {skillData?.skill?.yoePhase}
              </Text>
              <Text style={{ width: "33%" }}>
                {skillData?.skill?.jdType === "Mandatory"
                  ? contentLabel("Mandatory", "nf Mandatory")
                  : contentLabel("NonMandatory", "nf Non Mandatory")}
              </Text>
            </View>


            {/* Candidate Table */}
            <View style={s.reportTable}>
              <View style={s.reportTableRowHeader}>
                <Text style={{ ...s.boldText,...s.reportTableHeaderId, ...s.headingText(fontSize - 0) ,   }}>{contentLabel("Id", "nf Id")}</Text>
                <Text style={{ ...s.boldText, ...s.reportTableCellSkill, ...s.headingText(fontSize - 0) }}>{contentLabel("CandidateName", "nf Candidate Name")}</Text>
                <Text style={{ ...s.reportTableCellApplied, ...s.headingText(fontSize - 0) }}>{contentLabel("CandidateExperience", "nf Candidate Experience")}</Text>
                <Text style={{ ...s.reportTableCellApplied, ...s.headingText(fontSize - 0) }}>{contentLabel("MatchingStatus", "nf Matching Status")}</Text>
                <Text style={{ ...s.reportTableCellAcquired, ...s.headingText(fontSize - 0) }}>{contentLabel("RankingWithinTheTop5Skill", "nf Ranking within the Top 5 skills")}</Text>
              </View>

              {skillData?.candidates?.map((candidate, i) => (
                <View
                  key={i}
                  style={[s.reportTableRow, i % 2 === 1 ? s.oddRow : null]}
                >
                  <Text style={{ ...s.reportTableCellId, ...s.headingText(fontSize - 0) }}>{candidate?.id || "-"}</Text>
                  <Text style={{ ...s.reportTableCellSkill, ...s.headingText(fontSize - 0) }}>{!anonymised ? (candidate?.name || "-") : contentLabel("Confidential", "Confidential")}</Text>
                  <Text style={{ ...s.reportTableCellApplied, ...s.headingText(fontSize - 0) }}>{candidate?.experience || "-"}</Text>
                  <Text style={{ ...s.reportTableCellApplied, ...s.headingText(fontSize - 0) }}>
                    {/* Convert JSX status to string or fallback */}
                    {typeof candidate?.status === "string" ? candidate?.status : "-"}
                  </Text>
                  <Text style={{ ...s.reportTableCellAcquired, ...s.headingText(fontSize - 0) }}>
                   {Number(candidate?.priority || 0) < 6 ? candidate?.priority : "-"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ))}
      </Page>

    </Document>
  );
};

export default PDFOpportunityInformation;

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import s from "../../../../Reports/Templates/Skill Profile Template/Skill Profile Report Components/Styles/ResumeStyles";

const PDFSkillDeatilsForCandidate = ({ skill, candidates = [], contentLabel }) => {
  return (
    <>
        {/* Skills Table */}
        <View style={s.reportTable}>
          <View style={s.reportTableRowHeader}>
            <Text style={s.reportTableHeaderRank}>{contentLabel("Id", "nf Id")}</Text>
            <Text style={s.reportTableCellSkill}>{contentLabel("CandidateName", "nf Candidate Name")}</Text>
            <Text style={s.reportTableCellApplied}>{contentLabel("CandidateExperience", "nf Candidate Experience")}</Text>
            <Text style={s.reportTableCellAcquired}> {contentLabel("MatchingStatus", "nf Matching Status")}</Text>
            <Text style={s.reportTableCellAcquired}> {contentLabel("RankingWithinTheTop5Skill", "nf Ranking within the Top 5 skills")}</Text>
          </View>

          {candidates.map((candidate, i) => (
            <View
              key={i}
              style={[
                s.reportTableRow,
                i % 2 === 1 ? s.oddRow : null,
              ]}
            >
              <Text style={s.reportTableCellRank}> {candidate?.id}</Text>
              <Text style={s.reportTableCellSkill}>{candidate?.name || "-"}</Text>
              <Text style={s.reportTableCellApplied}>
               {candidate?.experience || "-"}
              </Text>
              <Text style={s.reportTableCellAcquired}>
                {candidate?.status || "-"}
              </Text>
              <Text style={s.reportTableCellAcquired}>
               {candidate?.priority || "-"}
              </Text>
            </View>
          ))}
        </View>
    </>
  );
};

export default PDFSkillDeatilsForCandidate;

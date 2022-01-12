import i18n from '../../../locale/en.json';
import { paths } from '../../paths';
import { formatDate } from '../../utils/date-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { boolToYesNo } from '../../utils/utils';

const editParameter: string = '?edit';

function getSummaryRow(visibleChangeLink: boolean, title?: string, values?: (number | string | string[] | any)[], href?: string) {
  if (visibleChangeLink) {
    return addSummaryRow(title, values, href);
  } else {
    return addSummaryRow(title, values);
  }
}

function buildWitnessesSectionSummaryList(hearingRequirements: HearingRequirements, visibleChangeLink: boolean) {
  const witnessesSectionSummaryList: SummaryList[] = [];
  const witnessesRows: SummaryRow[] = [];

  // Any witness question
  witnessesRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.witnessesSection.hearingWitnesses.title]
    )
  );

  witnessesRows.push(
    getSummaryRow(visibleChangeLink,i18n.common.cya.answerRowTitle,
      [boolToYesNo(hearingRequirements.witnessesOnHearing)],
      paths.submitHearingRequirements.witnesses + editParameter)
  );
  if (hearingRequirements.witnessesOnHearing) {
    buildWitnessNamesList(witnessesRows, hearingRequirements.witnessNames, visibleChangeLink);
  }

  // Hearing outside UK
  witnessesRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.witnessesSection.witnessOutsideUk.title]
    )
  );

  witnessesRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(hearingRequirements.witnessesOutsideUK)],
      paths.submitHearingRequirements.witnessOutsideUK + editParameter)
  );

  witnessesSectionSummaryList.push({
    title: i18n.pages.hearingRequirements.taskList.sections.witnesses,
    summaryRows: witnessesRows
  });
  return witnessesSectionSummaryList;
}

function buildWitnessNamesList(witnessesRows: SummaryRow[], witnessNames: string[], visibleChangeLink: boolean) {
  if (witnessesRows && witnessesRows.length > 1) {
    witnessesRows.push(
      getSummaryRow(visibleChangeLink,
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.witnessesSection.hearingWitnessNames.cya],
        paths.submitHearingRequirements.hearingWitnessNames
      )
    );
    witnessNames.forEach((name: string) => {
      witnessesRows.push(
        addSummaryRow(
          '',
          [name]
        )
      );
    });
  }
}

function buildAccessNeedsSummaryList(hearingRequirements: HearingRequirements, visibleChangeLink: boolean) {
  const accessNeedsSummaryLists: SummaryList[] = [];
  const interpreterRows: SummaryRow[] = [];
  // Interpreter category
  interpreterRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.accessNeedsSection.needInterpreterPage.title]
    )
  );

  interpreterRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(hearingRequirements.isInterpreterServicesNeeded)],
      paths.submitHearingRequirements.hearingInterpreter + editParameter)
  );

  if (hearingRequirements.isInterpreterServicesNeeded) {

    interpreterRows.push(
      getSummaryRow(visibleChangeLink,
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.accessNeedsSection.additionalLanguagePage.title],
        paths.submitHearingRequirements.hearingLanguageDetails
      )
    );

    hearingRequirements.interpreterLanguages.forEach((interpreterLanguage: InterpreterLanguage, i: number) => {
      interpreterRows.push(getSummaryRow(visibleChangeLink,
        i === 0 ? i18n.pages.hearingRequirements.accessNeedsSection.additionalLanguagePage.title : null,
        [`<b>${i18n.pages.hearingRequirements.accessNeedsSection.additionalLanguagePage.language}</b>`,
          Delimiter.BREAK_LINE,
          `<pre>${interpreterLanguage.language}</pre>`,
          Delimiter.BREAK_LINE,
          `<b>${i18n.pages.hearingRequirements.accessNeedsSection.additionalLanguagePage.dialect}</b>`,
          Delimiter.BREAK_LINE,
          `<pre>${interpreterLanguage.languageDialect || ''}</pre>`],
        `${paths.submitHearingRequirements.hearingLanguageDetails}/${editParameter}`
      ));
    });
  }

  accessNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.interpreterTitle,
    summaryRows: interpreterRows
  });

  // Step-free access category
  const stepFreeRows: SummaryRow[] = [];
  stepFreeRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.accessNeedsSection.stepFreeAccessPage.title]
    )
  );

  stepFreeRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(hearingRequirements.isHearingRoomNeeded)],
      paths.submitHearingRequirements.hearingStepFreeAccess + editParameter)
  );

  accessNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.stepFreeTitle,
    summaryRows: stepFreeRows
  });

  // Hearing loop access category
  const hearingLoopRows: SummaryRow[] = [];

  hearingLoopRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.accessNeedsSection.hearingLoopPage.title]
    )
  );

  hearingLoopRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(hearingRequirements.isHearingLoopNeeded)],
      paths.submitHearingRequirements.hearingLoop + editParameter)
  );

  accessNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.hearingLoopTitle,
    summaryRows: hearingLoopRows
  });

  return accessNeedsSummaryLists;
}

function buildOtherNeedsSummaryList(otherNeeds: HearingOtherNeeds, visibleChangeLink: boolean) {
  const accessOtherNeedsSummaryLists: SummaryList[] = [];

  // Multimedia Evidence
  const multimediaEvidenceRows: SummaryRow[] = [];

  multimediaEvidenceRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.otherNeedsSection.multimediaEvidence.question]
    )
  );

  multimediaEvidenceRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(otherNeeds.multimediaEvidence)],
      paths.submitHearingRequirements.otherNeedsMultimediaEvidenceQuestion + editParameter)
  );

  if (otherNeeds.multimediaEvidence) {
    multimediaEvidenceRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.otherNeedsSection.bringEquipment.question]
      )
    );

    multimediaEvidenceRows.push(
      getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
        [boolToYesNo(otherNeeds.bringOwnMultimediaEquipment)],
        paths.submitHearingRequirements.otherNeedsMultimediaEquipmentQuestion + editParameter)
    );

    if (!otherNeeds.bringOwnMultimediaEquipment) {
      multimediaEvidenceRows.push(
        addSummaryRow(
          i18n.common.cya.questionRowTitle,
          [i18n.pages.hearingRequirements.otherNeedsSection.bringEquipmentReason.title]
        )
      );
      multimediaEvidenceRows.push(
        getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
          [`<pre>${otherNeeds.bringOwnMultimediaEquipmentReason}</pre>`],
          paths.submitHearingRequirements.otherNeedsMultimediaEquipmentReason + editParameter)
      );
    }
  }

  accessOtherNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.multimediaEvidenceTitle,
    summaryRows: multimediaEvidenceRows
  });

  // Single Sex Appointment
  const singleSexAppointmentRows: SummaryRow[] = [];

  singleSexAppointmentRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.otherNeedsSection.singleSexHearing.question]
    )
  );

  singleSexAppointmentRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(otherNeeds.singleSexAppointment)],
      paths.submitHearingRequirements.otherNeedsSingleSexHearingQuestion + editParameter)
  );

  if (otherNeeds.singleSexAppointment) {

    singleSexAppointmentRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.otherNeedsSection.singleSexTypeHearing.question]
      )
    );

    singleSexAppointmentRows.push(
      getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
        [otherNeeds.singleSexTypeAppointment],
        paths.submitHearingRequirements.otherNeedsSingleSexTypeHearing + editParameter)
    );
    let title: string = otherNeeds.singleSexTypeAppointment === 'All female' ?
      i18n.pages.hearingRequirements.otherNeedsSection.singleSexHearingAllFemale.title :
      i18n.pages.hearingRequirements.otherNeedsSection.singleSexHearingAllMale.title;

    singleSexAppointmentRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [title]
      )
    );

    let pathSingleSexReason: string = otherNeeds.singleSexTypeAppointment === 'All female' ?
      paths.submitHearingRequirements.otherNeedsAllFemaleHearing + editParameter :
      paths.submitHearingRequirements.otherNeedsAllMaleHearing + editParameter;
    singleSexAppointmentRows.push(
      getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
        [otherNeeds.singleSexAppointmentReason],
        pathSingleSexReason)
    );
  }

  accessOtherNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.singleSexAppointmentTitle,
    summaryRows: singleSexAppointmentRows
  });

  // Private Appointment
  const privateAppointmentRows: SummaryRow[] = [];

  privateAppointmentRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.otherNeedsSection.privateHearing.question]
    )
  );

  privateAppointmentRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(otherNeeds.privateAppointment)],
      paths.submitHearingRequirements.otherNeedsPrivateHearingQuestion + editParameter)
  );

  if (otherNeeds.privateAppointment) {
    privateAppointmentRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.otherNeedsSection.privateHearingReason.title]
      )
    );

    privateAppointmentRows.push(
      getSummaryRow(visibleChangeLink,i18n.common.cya.answerRowTitle,
        [`<pre>${otherNeeds.privateAppointmentReason}</pre>`],
        paths.submitHearingRequirements.otherNeedsPrivateHearingReason + editParameter)
    );
  }

  accessOtherNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.privateAppointmentTitle,
    summaryRows: privateAppointmentRows
  });

  // Health Conditions
  const healthConditionsRows: SummaryRow[] = [];

  healthConditionsRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.otherNeedsSection.healthConditions.question]
    )
  );

  healthConditionsRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(otherNeeds.healthConditions)],
      paths.submitHearingRequirements.otherNeedsHealthConditions + editParameter)
  );

  if (otherNeeds.healthConditions) {
    healthConditionsRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.otherNeedsSection.healthConditionsReason.title]
      )
    );

    healthConditionsRows.push(
      getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
        [`<pre>${otherNeeds.healthConditionsReason}</pre>`],
        paths.submitHearingRequirements.otherNeedsHealthConditionsReason + editParameter)
    );
  }

  accessOtherNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.healthConditionsTitle,
    summaryRows: healthConditionsRows
  });

  // Past Experiences
  const pastExperiencesRows: SummaryRow[] = [];

  pastExperiencesRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.otherNeedsSection.pastExperiences.question]
    )
  );

  pastExperiencesRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(otherNeeds.pastExperiences)],
      paths.submitHearingRequirements.otherNeedsPastExperiences + editParameter)
  );

  if (otherNeeds.pastExperiences) {
    pastExperiencesRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.otherNeedsSection.pastExperiencesReasons.title]
      )
    );

    pastExperiencesRows.push(
      getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
        [`<pre>${otherNeeds.pastExperiencesReason}</pre>`],
        paths.submitHearingRequirements.otherNeedsPastExperiencesReasons + editParameter)
    );
  }

  accessOtherNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.pastExperiencesTitle,
    summaryRows: pastExperiencesRows
  });

  // Anything Else
  const anythingElseRows: SummaryRow[] = [];

  anythingElseRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.hearingRequirements.otherNeedsSection.anythingElse.question]
    )
  );

  anythingElseRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(otherNeeds.anythingElse)],
      paths.submitHearingRequirements.otherNeedsAnythingElse + editParameter)
  );

  if (otherNeeds.anythingElse) {
    anythingElseRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [i18n.pages.hearingRequirements.otherNeedsSection.anythingElseReasons.title]
      )
    );

    anythingElseRows.push(
      getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
        [`<pre>${otherNeeds.anythingElseReason}</pre>`],
        paths.submitHearingRequirements.otherNeedsAnythingElseReasons + editParameter)
    );
  }

  accessOtherNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.anythingElseTitle,
    summaryRows: anythingElseRows
  });

  return accessOtherNeedsSummaryLists;
}

function buildDatesToAvoidSummaryList(datesToAvoid: DatesToAvoid, visibleChangeLink: boolean) {
  const datesToAvoidSummaryLists: SummaryList[] = [];

  // Dates to avoid
  const datesToAvoidRows: SummaryRow[] = [];

  datesToAvoidRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.question]
    )
  );

  datesToAvoidRows.push(
    getSummaryRow(visibleChangeLink, i18n.common.cya.answerRowTitle,
      [boolToYesNo(datesToAvoid.isDateCannotAttend)],
      paths.submitHearingRequirements.datesToAvoidQuestion + editParameter)
  );

  if (datesToAvoid.isDateCannotAttend) {
    datesToAvoid.dates.forEach((dateEntry, i) => {
      datesToAvoidRows.push(getSummaryRow(visibleChangeLink,
        i === 0 ? i18n.pages.cmaRequirementsCYA.rows.datesToAvoidTitle : null,
        [`<b>${i18n.common.cya.date}</b>`,
          Delimiter.BREAK_LINE,
          `<pre>${formatDate(`${dateEntry.date.year}-${dateEntry.date.month}-${dateEntry.date.day}`)}</pre>`,
          Delimiter.BREAK_LINE,
          `<b>${i18n.common.cya.reason}</b>`,
          Delimiter.BREAK_LINE,
          `<pre>${dateEntry.reason || ''}</pre>`],
          `${paths.submitHearingRequirements.hearingDatesToAvoidEnterDate}/${i}${editParameter}`
      ));
    });
  }

  datesToAvoidSummaryLists.push({
    summaryRows: datesToAvoidRows
  });

  return datesToAvoidSummaryLists;
}

export function buildHearingRequirementsSummarySections(hearingRequirements: HearingRequirements, visibleChangeLink: boolean) {
  const hearingRequirementsSummarySections: SummarySection[] = [];

  const witnessesSectionList: SummaryList[] = buildWitnessesSectionSummaryList(hearingRequirements, visibleChangeLink);

  hearingRequirementsSummarySections.push({
    title: `1. ${i18n.pages.hearingRequirements.taskList.sections.witnesses}`,
    summaryLists: witnessesSectionList
  });

  const accessNeedsSummaryLists: SummaryList[] = buildAccessNeedsSummaryList(hearingRequirements, visibleChangeLink);

  hearingRequirementsSummarySections.push({
    title: `2. ${i18n.pages.hearingRequirements.taskList.sections.accessNeeds}`,
    summaryLists: accessNeedsSummaryLists
  });

  if (hearingRequirements.otherNeeds) {
    const otherNeedsSummaryLists: SummaryList[] = buildOtherNeedsSummaryList(hearingRequirements.otherNeeds, visibleChangeLink);

    hearingRequirementsSummarySections.push(
      {
        title: `3. ${i18n.pages.hearingRequirements.taskList.sections.otherNeeds}`,
        summaryLists: otherNeedsSummaryLists
      }
    );
  }

  if (hearingRequirements.datesToAvoid) {
    const datesToAvoidSummaryLists: SummaryList[] = buildDatesToAvoidSummaryList(hearingRequirements.datesToAvoid, visibleChangeLink);

    hearingRequirementsSummarySections.push(
      {
        title: `4. ${i18n.pages.hearingRequirements.taskList.sections.datesToAvoid}`,
        summaryLists: datesToAvoidSummaryLists
      }
    );
  }
  return hearingRequirementsSummarySections;
}

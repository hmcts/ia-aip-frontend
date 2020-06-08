import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { formatDate } from '../../../utils/date-utils';
import { addSummaryRow, Delimiter } from '../../../utils/summary-list';
import { boolToYesNo, nowIsoDate } from '../../../utils/utils';
import { SexType } from '../other-needs/single-sex-type-appointment-question';

const editParameter: string = '?edit';

function buildAccessNeedsSummaryList(accessNeeds: AccessNeeds) {
  const accessNeedsSummaryLists: SummaryList[] = [];
  const interpreterRows: SummaryRow[] = [];
  // Interpreter category
  interpreterRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [ i18n.pages.cmaRequirements.accessNeedsSection.needInterpreterPage.title ]
    )
  );

  interpreterRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(accessNeeds.isInterpreterServicesNeeded) ],
      paths.awaitingCmaRequirements.accessNeedsInterpreter + editParameter)
  );

  if (accessNeeds.isInterpreterServicesNeeded) {
    interpreterRows.push(
      addSummaryRow(i18n.pages.cmaRequirementsCYA.rows.language,
        [ accessNeeds.interpreterLanguage.language ],
        paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage + editParameter)
    );

    if (accessNeeds.interpreterLanguage.languageDialect) {
      interpreterRows.push(
        addSummaryRow(i18n.pages.cmaRequirementsCYA.rows.dialect,
          [ accessNeeds.interpreterLanguage.languageDialect ],
          paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage + editParameter)
      );
    }

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
      [ i18n.pages.cmaRequirements.accessNeedsSection.stepFreeAccessPage.title ]
    )
  );

  stepFreeRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(accessNeeds.isHearingRoomNeeded) ],
      paths.awaitingCmaRequirements.accessNeedsStepFreeAccess + editParameter)
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
      [ i18n.pages.cmaRequirements.accessNeedsSection.hearingLoopPage.title ]
    )
  );

  hearingLoopRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(accessNeeds.isHearingLoopNeeded) ],
      paths.awaitingCmaRequirements.accessNeedsHearingLoop + editParameter)
  );

  accessNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.hearingLoopTitle,
    summaryRows: hearingLoopRows
  });

  return accessNeedsSummaryLists;
}

function buildOtherNeedsSummaryList(otherNeeds: OtherNeeds) {
  const accessOtherNeedsSummaryLists: SummaryList[] = [];

  // Multimedia Evidence
  const multimediaEvidenceRows: SummaryRow[] = [];

  multimediaEvidenceRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [ i18n.pages.cmaRequirements.otherNeedsSection.multimediaEvidence.question ]
    )
  );

  multimediaEvidenceRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(otherNeeds.multimediaEvidence) ],
      paths.awaitingCmaRequirements.otherNeedsMultimediaEvidenceQuestion + editParameter)
  );

  multimediaEvidenceRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [ i18n.pages.cmaRequirements.otherNeedsSection.bringEquipment.question ]
    )
  );

  multimediaEvidenceRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(otherNeeds.bringOwnMultimediaEquipment) ],
      paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentQuestion + editParameter)
  );

  if (!otherNeeds.bringOwnMultimediaEquipment) {
    multimediaEvidenceRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [ i18n.pages.cmaRequirements.otherNeedsSection.bringEquipmentReason.title ]
      )
    );
    multimediaEvidenceRows.push(
      addSummaryRow(i18n.common.cya.answerRowTitle,
        [ `<pre>${otherNeeds.bringOwnMultimediaEquipmentReason}</pre>` ],
        paths.awaitingCmaRequirements.otherNeedsMultimediaEquipmentReason + editParameter)
    );
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
      [ i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointment.question ]
    )
  );

  singleSexAppointmentRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(otherNeeds.singleSexAppointment) ],
      paths.awaitingCmaRequirements.otherNeedsSingleSexAppointment + editParameter)
  );

  if (otherNeeds.singleSexAppointment) {

    singleSexAppointmentRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [ i18n.pages.cmaRequirements.otherNeedsSection.singleSexTypeAppointment.question ]
    )
  );

    singleSexAppointmentRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ otherNeeds.singleSexTypeAppointment ],
      paths.awaitingCmaRequirements.otherNeedsSingleSexTypeAppointment + editParameter)
  );

    if (otherNeeds.singleSexTypeAppointment === SexType.ALL_MALE) {
      singleSexAppointmentRows.push(
        addSummaryRow(
          i18n.common.cya.questionRowTitle,
          [ i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointmentAllMale.title ]
        )
      );

      singleSexAppointmentRows.push(
        addSummaryRow(i18n.common.cya.answerRowTitle,
          [ `<pre>${otherNeeds.singleSexAppointmentReason}</pre>` ],
          paths.awaitingCmaRequirements.otherNeedsAllMaleAppointment + editParameter)
      );
    } else if (otherNeeds.singleSexTypeAppointment === SexType.ALL_FEMALE) {
      singleSexAppointmentRows.push(
        addSummaryRow(
          i18n.common.cya.questionRowTitle,
          [ i18n.pages.cmaRequirements.otherNeedsSection.singleSexAppointmentAllFemale.title ]
        )
      );
      singleSexAppointmentRows.push(
        addSummaryRow(i18n.common.cya.answerRowTitle,
          [ `<pre>${otherNeeds.singleSexAppointmentReason}</pre>` ],
          paths.awaitingCmaRequirements.otherNeedsAllFemaleAppointment + editParameter)
      );
    }
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
      [ i18n.pages.cmaRequirements.otherNeedsSection.privateAppointment.question ]
    )
  );

  privateAppointmentRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(otherNeeds.privateAppointment) ],
      paths.awaitingCmaRequirements.otherNeedsPrivateAppointment + editParameter)
  );

  if (otherNeeds.privateAppointment) {
    privateAppointmentRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [ i18n.pages.cmaRequirements.otherNeedsSection.privateAppointmentReason.title ]
      )
    );

    privateAppointmentRows.push(
      addSummaryRow(i18n.common.cya.answerRowTitle,
        [ `<pre>${otherNeeds.privateAppointmentReason}</pre>` ],
        paths.awaitingCmaRequirements.otherNeedsPrivateAppointmentReason + editParameter)
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
      [ i18n.pages.cmaRequirements.otherNeedsSection.healthConditions.question ]
    )
  );

  healthConditionsRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(otherNeeds.healthConditions) ],
      paths.awaitingCmaRequirements.otherNeedsHealthConditions + editParameter)
  );

  if (otherNeeds.healthConditions) {
    healthConditionsRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [ i18n.pages.cmaRequirements.otherNeedsSection.healthConditionsReason.title ]
      )
    );

    healthConditionsRows.push(
      addSummaryRow(i18n.common.cya.answerRowTitle,
        [ `<pre>${otherNeeds.healthConditionsReason}</pre>` ],
        paths.awaitingCmaRequirements.otherNeedsHealthConditionsReason + editParameter)
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
      [ i18n.pages.cmaRequirements.otherNeedsSection.pastExperiences.question ]
    )
  );

  pastExperiencesRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(otherNeeds.pastExperiences) ],
      paths.awaitingCmaRequirements.otherNeedsPastExperiences + editParameter)
  );

  if (otherNeeds.pastExperiences) {
    pastExperiencesRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [ i18n.pages.cmaRequirements.otherNeedsSection.pastExperiencesReasons.title ]
      )
    );

    pastExperiencesRows.push(
      addSummaryRow(i18n.common.cya.answerRowTitle,
        [ `<pre>${otherNeeds.pastExperiencesReason}</pre>` ],
        paths.awaitingCmaRequirements.otherNeedsPastExperiencesReasons + editParameter)
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
      [ i18n.pages.cmaRequirements.otherNeedsSection.anythingElse.question ]
    )
  );

  anythingElseRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(otherNeeds.anythingElse) ],
      paths.awaitingCmaRequirements.otherNeedsAnythingElse + editParameter)
  );

  if (otherNeeds.anythingElseReason) {
    anythingElseRows.push(
      addSummaryRow(
        i18n.common.cya.questionRowTitle,
        [ i18n.pages.cmaRequirements.otherNeedsSection.anythingElseReasons.title ]
      )
    );

    anythingElseRows.push(
      addSummaryRow(i18n.common.cya.answerRowTitle,
        [ `<pre>${otherNeeds.pastExperiencesReason}</pre>` ],
        paths.awaitingCmaRequirements.otherNeedsAnythingElseReasons + editParameter)
    );
  }

  accessOtherNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.anythingElseTitle,
    summaryRows: anythingElseRows
  });

  return accessOtherNeedsSummaryLists;
}

function buildDatesToAvoidSummaryList(datesToAvoid: DatesToAvoid) {
  const datesToAvoidSummaryLists: SummaryList[] = [];

  // Dates to avoid
  const datesToAvoidRows: SummaryRow[] = [];

  datesToAvoidRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [ i18n.pages.cmaRequirements.datesToAvoidSection.questionPage.question ]
    )
  );

  datesToAvoidRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ boolToYesNo(datesToAvoid.isDateCannotAttend) ],
      paths.awaitingCmaRequirements.datesToAvoidQuestion + editParameter)
  );

  if (datesToAvoid.isDateCannotAttend) {
    datesToAvoid.dates.forEach((dateEntry,i) => {
      datesToAvoidRows.push(addSummaryRow(
        i === 0 ? i18n.pages.cmaRequirementsCYA.rows.datesToAvoidTitle : null,
        [ `<b>${i18n.common.cya.date}</b>`,
          Delimiter.BREAK_LINE,
          `<pre>${formatDate(`${dateEntry.date.year}-${dateEntry.date.month}-${dateEntry.date.day}`)}</pre>`,
          Delimiter.BREAK_LINE,
          `<b>${i18n.common.cya.reason}</b>`,
          Delimiter.BREAK_LINE,
          `<pre>${dateEntry.reason}</pre>` ],
        `${paths.awaitingCmaRequirements.datesToAvoidEnterDate}/${i}${editParameter}`
      ));
    });
  }

  datesToAvoidSummaryLists.push({
    summaryRows: datesToAvoidRows
  });

  return datesToAvoidSummaryLists;
}

function getCheckAndSendPage(req: Request, res: Response, next: NextFunction) {
  try {
    const previousPage: string = paths.awaitingCmaRequirements.taskList;
    const cmaRequirements: CmaRequirements = req.session.appeal.cmaRequirements;

    const cyaSummarySections: SummarySection[] = [];

    if (cmaRequirements.accessNeeds) {

      const accessNeedsSummaryLists: SummaryList[] = buildAccessNeedsSummaryList(cmaRequirements.accessNeeds);

      cyaSummarySections.push(
        {
          title: `1. ${i18n.pages.cmaRequirementsCYA.sections.accessNeeds}`,
          summaryLists: accessNeedsSummaryLists
        }
      );
    }

    if (cmaRequirements.otherNeeds) {
      const otherNeedsSummaryLists: SummaryList[] = buildOtherNeedsSummaryList(cmaRequirements.otherNeeds);

      cyaSummarySections.push(
        {
          title: `2. ${i18n.pages.cmaRequirementsCYA.sections.otherNeeds}`,
          summaryLists: otherNeedsSummaryLists
        }
      );
    }

    if (cmaRequirements.datesToAvoid) {
      const datesToAvoidSummaryLists: SummaryList[] = buildDatesToAvoidSummaryList(cmaRequirements.datesToAvoid);

      cyaSummarySections.push(
        {
          title: `3. ${i18n.pages.cmaRequirementsCYA.sections.datesToAvoid}`,
          summaryLists: datesToAvoidSummaryLists
        }
      );
    }

    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.cmaRequirementsCYA.title,
      formAction: paths.awaitingCmaRequirements.checkAndSend,
      previousPage,
      summarySections: cyaSummarySections
    });
  } catch (e) {
    next(e);
  }
}

function postCheckAndSendPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
      req.session.appeal.clarifyingQuestionsAnswers = [ ...clarifyingQuestions ].map((question => {
        question.value.dateResponded = nowIsoDate();
        return question;
      }));
      const updatedAppeal = await updateAppealService.submitEvent(Events.SUBMIT_CLARIFYING_QUESTION_ANSWERS, req);
      req.session.appeal.appealStatus = updatedAppeal.state;
      res.redirect(paths.clarifyingQuestionsAnswersSubmitted.confirmation);
    } catch (e) {
      next(e);
    }
  };
}

function setupCmaRequirementsCYAController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router = Router();
  router.get(paths.awaitingCmaRequirements.checkAndSend, middleware, getCheckAndSendPage);
  router.post(paths.awaitingCmaRequirements.checkAndSend, middleware, postCheckAndSendPage(updateAppealService));

  return router;
}

export {
  setupCmaRequirementsCYAController,
  getCheckAndSendPage,
  postCheckAndSendPage
};

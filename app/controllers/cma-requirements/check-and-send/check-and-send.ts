import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../../locale/en.json';
import { Events } from '../../../data/events';
import { paths } from '../../../paths';
import UpdateAppealService from '../../../service/update-appeal-service';
import { addSummaryRow } from '../../../utils/summary-list';
import { boolToYesNo, nowIsoDate } from '../../../utils/utils';

const editParameter: string = '?edit';

function buildAccessNeedsSummaryList(accessNeeds: AccessNeeds) {
  const accessNeedsSummaryLists: SummaryList[] = [];
  const interpreterRows: SummaryRow[] = [];
  // Interpreter category
  interpreterRows.push(
    addSummaryRow(
      i18n.common.cya.questionRowTitle,
      [ `<pre>${i18n.pages.cmaRequirements.accessNeedsSection.needInterpreterPage.title}</pre>` ]
    )
  );

  interpreterRows.push(
    addSummaryRow(i18n.common.cya.answerRowTitle,
      [ `<pre>${boolToYesNo(accessNeeds.isInterpreterServicesNeeded)}</pre>` ],
      paths.awaitingCmaRequirements.accessNeedsInterpreter + editParameter)
  );

  if (accessNeeds.isInterpreterServicesNeeded) {
    interpreterRows.push(
      addSummaryRow(i18n.pages.cmaRequirementsCYA.rows.language,
        [ `<pre>${accessNeeds.interpreterLanguage.language}</pre>` ],
        paths.awaitingCmaRequirements.accessNeedsAdditionalLanguage + editParameter)
    );

    if (accessNeeds.interpreterLanguage.languageDialect) {
      interpreterRows.push(
        addSummaryRow(i18n.pages.cmaRequirementsCYA.rows.dialect,
          [ `<pre>${accessNeeds.interpreterLanguage.languageDialect}</pre>` ],
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

  accessNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.stepFreeTitle,
    summaryRows: stepFreeRows
  });

  // Hearing loop access category
  const hearingLoopRows: SummaryRow[] = [];

  accessNeedsSummaryLists.push({
    title: i18n.pages.cmaRequirementsCYA.rows.hearingLoopTitle,
    summaryRows: hearingLoopRows
  });

  return accessNeedsSummaryLists;
}

function buildOtherNeedsSummaryList(otherNeeds: OtherNeeds) {
  const accessOtherNeedsSummaryLists: SummaryList[] = [];
  return accessOtherNeedsSummaryLists;
}

function buildDatesToAvoidSummaryList(datesToAvoid: DateToAvoid[]) {
  const datesToAvoidSummaryLists: SummaryList[] = [];
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

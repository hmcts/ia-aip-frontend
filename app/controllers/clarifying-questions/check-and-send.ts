import { NextFunction, Request, Response, Router } from 'express';
import i18n from '../../../locale/en.json';
import { CQ_NOTHING_ELSE } from '../../data/constants';
import { Events } from '../../data/events';
import { paths } from '../../paths';
import UpdateAppealService from '../../service/update-appeal-service';
import { getNextPage } from '../../utils/save-for-later-utils';
import { addSummaryRow, Delimiter } from '../../utils/summary-list';
import { getConditionalRedirectUrl } from '../../utils/url-utils';
import { nowIsoDate } from '../../utils/utils';

function buildEvidencesList(evidences: Evidence[]): string[] {
  return evidences.map((evidence: Evidence) => {
    return `<a class='govuk-link' target='_blank' rel='noopener noreferrer' href='${paths.common.detailsViewers.document}/${evidence.fileId}'>${evidence.name}</a>`;
  });
}

function getCheckAndSendPage(req: Request, res: Response, next: NextFunction) {
  try {
    const previousPage: string = paths.awaitingClarifyingQuestionsAnswers.questionsList;
    const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
    const anythingElseQuestion: ClarifyingQuestion<Evidence> = clarifyingQuestions.pop();

    const summaryLists: SummaryList[] = clarifyingQuestions.map((question: ClarifyingQuestion<Evidence>, index: number) => {
      const summaryRows: SummaryRow[] = [];
      summaryRows.push(
        addSummaryRow(i18n.common.cya.questionRowTitle, [ `<pre>${question.value.question}</pre>` ])
      );
      summaryRows.push(
        addSummaryRow(
          i18n.common.cya.answerRowTitle,
          [ `<pre>${question.value.answer}</pre>` ],
          paths.awaitingClarifyingQuestionsAnswers.question.replace(':id', `${index + 1}`)
        )
      );
      if (question.value.supportingEvidence && question.value.supportingEvidence.length) {
        const evidencesList = buildEvidencesList(question.value.supportingEvidence);
        summaryRows.push(
          addSummaryRow(
            i18n.common.cya.supportingEvidenceRowTitle,
            evidencesList,
            paths.awaitingClarifyingQuestionsAnswers.supportingEvidenceUploadFile.replace(':id', `${index + 1}`),
            Delimiter.BREAK_LINE
          )
        );
      }
      return {
        title: `${i18n.common.cya.questionRowTitle} ${index + 1}`,
        summaryRows
      };
    });
    if (anythingElseQuestion.value.answer && anythingElseQuestion.value.answer !== CQ_NOTHING_ELSE) {
      const summaryRows: SummaryRow[] = [
        addSummaryRow(i18n.common.cya.answerRowTitle, [ `<pre>${anythingElseQuestion.value.answer}</pre>` ], paths.awaitingClarifyingQuestionsAnswers.anythingElseAnswerPage)
      ];
      if (anythingElseQuestion.value.supportingEvidence && anythingElseQuestion.value.supportingEvidence.length) {
        const evidencesList = buildEvidencesList(anythingElseQuestion.value.supportingEvidence);
        summaryRows.push(
          addSummaryRow(
            i18n.common.cya.supportingEvidenceRowTitle,
            evidencesList,
            '',
            Delimiter.BREAK_LINE
          )
        );
      }
      summaryLists.push({
        title: anythingElseQuestion.value.question,
        summaryRows
      });
    }
    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.clarifyingQuestionsCYA.title,
      formAction: paths.awaitingClarifyingQuestionsAnswers.checkAndSend,
      previousPage,
      summaryLists
    });
  } catch (e) {
    next(e);
  }
}

function postCheckAndSendPage(updateAppealService: UpdateAppealService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body['saveForLater']) {
        return getConditionalRedirectUrl(req, res, paths.common.overview + '?saved');
      }
      const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.draftClarifyingQuestionsAnswers ];
      req.session.appeal.clarifyingQuestionsAnswers = [ ...clarifyingQuestions ].map((question => {
        question.value.dateResponded = nowIsoDate();
        return question;
      }));
      delete req.session.appeal.draftClarifyingQuestionsAnswers;
      const updatedAppeal = await updateAppealService.submitEvent(Events.SUBMIT_CLARIFYING_QUESTION_ANSWERS, req);
      req.session.appeal.appealStatus = updatedAppeal.state;
      return getConditionalRedirectUrl(req, res, getNextPage(req.body, paths.clarifyingQuestionsAnswersSubmitted.confirmation));
    } catch (e) {
      next(e);
    }
  };
}

function getYourAnswersPage(req: Request, res: Response, next: NextFunction) {
  try {
    const previousPage: string = paths.common.overview;
    const clarifyingQuestions: ClarifyingQuestion<Evidence>[] = [ ...req.session.appeal.clarifyingQuestionsAnswers ];
    const anythingElseQuestion: ClarifyingQuestion<Evidence> = clarifyingQuestions.pop();
    const summaryLists: any[] = clarifyingQuestions.map((question: ClarifyingQuestion<Evidence>, index: number) => {
      const summaryRows: SummaryRow[] = [];
      summaryRows.push(
        addSummaryRow(i18n.common.cya.questionRowTitle, [ `<pre>${question.value.question}</pre>` ])
      );
      summaryRows.push(
        addSummaryRow(
          i18n.common.cya.answerRowTitle,
          [ `<pre>${question.value.answer}</pre>` ]
        )
      );
      if (question.value.supportingEvidence && question.value.supportingEvidence.length) {
        const evidencesList = buildEvidencesList(question.value.supportingEvidence);
        summaryRows.push(
          addSummaryRow(
            i18n.common.cya.supportingEvidenceRowTitle,
            evidencesList,
            null,
            Delimiter.BREAK_LINE
          )
        );
      }
      return {
        title: `${i18n.common.cya.questionRowTitle} ${index + 1}`,
        summaryRows
      };
    });
    if (anythingElseQuestion.value.answer && anythingElseQuestion.value.answer !== CQ_NOTHING_ELSE) {
      const summaryRows: SummaryRow[] = [
        addSummaryRow(i18n.common.cya.answerRowTitle, [ `<pre>${anythingElseQuestion.value.answer}</pre>` ])
      ];
      if (anythingElseQuestion.value.supportingEvidence && anythingElseQuestion.value.supportingEvidence.length) {
        const evidencesList = buildEvidencesList(anythingElseQuestion.value.supportingEvidence);
        summaryRows.push(
          addSummaryRow(
            i18n.common.cya.supportingEvidenceRowTitle,
            evidencesList,
            '',
            Delimiter.BREAK_LINE
          )
        );
      }
      summaryLists.push({
        title: anythingElseQuestion.value.question,
        summaryRows
      });
    }
    res.render('templates/check-and-send.njk', {
      pageTitle: i18n.pages.clarifyingQuestionsCYA.title,
      previousPage,
      summaryLists
    });
  } catch (e) {
    next(e);
  }
}

function setupClarifyingQuestionsCheckSendController(middleware: Middleware[], updateAppealService: UpdateAppealService): Router {
  const router: Router = Router();
  router.get(paths.awaitingClarifyingQuestionsAnswers.checkAndSend, middleware, getCheckAndSendPage);
  router.post(paths.awaitingClarifyingQuestionsAnswers.checkAndSend, middleware, postCheckAndSendPage(updateAppealService));
  router.get(paths.common.yourCQanswers, middleware, getYourAnswersPage);
  return router;
}

export {
  buildEvidencesList,
  getCheckAndSendPage,
  getYourAnswersPage,
  postCheckAndSendPage,
  setupClarifyingQuestionsCheckSendController
};

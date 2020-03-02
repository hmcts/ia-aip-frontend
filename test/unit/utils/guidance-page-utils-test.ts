import { Request } from 'express';
import { getGuidancePageText } from '../../../app/utils/guidance-page-utils';
import { expect } from '../../utils/testUtils';

describe('guidance-page-utils', () => {
  it('When I enter caseworker I get the text for caseworker Page', () => {
    const result = getGuidancePageText('caseworker');
    expect(result).to.deep.equal({
      'textAndBullets': [
        {
          'bullets': [
            'works with you and the Home Office to manage an appeal from start to finish',
            'looks at any information you or the Home Office send the Tribunal',
            'tells you or the Home Office what to do at each stage of the appeal and when it needs to be done by',
            'tells you or the Home Office if there is anything you need to know about your appeal. For example, if you or the Home Office withdraws from the appeal',
            'may decide to grant or refuse any applications you or the Home Office make to the Tribunal. For example, if you or the Home Office ask for more time',
            'is not a Judge but does work closely with Judges'
          ],
          'desc': 'If you disagree with a decision a Tribunal Caseworker makes, you have 14 days to ask the Tribunal for a Judge to review the decision.',
          'smallTitle': 'What a Tribunal Caseworker does',
          'title': 'A Tribunal Caseworker:'
        },
        {
          'bullets': [
            'offer legal advice',
            'go to a hearing with you',
            'decide the outcome of your appeal'
          ],
          'smallTitle': 'What a Tribunal Caseworker can’t do',
          'title': 'A Tribunal Caseworker cannot:'
        }
      ],
      'title': 'What is a Tribunal Caseworker?',
      'titleText': 'A Tribunal Caseworker manages asylum and immigration appeals to make sure everything is ready for the Judge who decides your appeal if there is a hearing.'
    });
  });

  it('When I enter homeOfficeDocuments I get the text for homeOfficeDocuments Page', () => {
    const result = getGuidancePageText('homeOfficeDocuments');
    expect(result).to.deep.equal({
      'textAndBullets': [
        {
          'bullets': [
            'Cover letter',
            'Documents about your case'
          ],
          'title': 'The Home Office bundle has two parts:'
        },
        {
          'bullets': [
            'your personal details and any Home Office or other reference numbers',
            'a record of the decision to refuse your claim',
            'your immigration history. For example, the date you arrived in the country, the date you made your claim and any other relevant dates',
            'a list of the documents that are in the bundle and their page numbers. Details of the documents that might be in your bundle are in the next section',
            'the date you decided to appeal'
          ],
          'smallTitle': 'Cover letter',
          'title': 'The cover letter is the first page of your bundle and contains:'
        },
        {
          'bulletsSpacing': [
            "<span  class='govuk-body govuk-!-font-weight-bold'> Visa Application Form:</span>  If you made a Visa application, the application form and any evidence relevant to the decision to refuse you claim will be included in the bundle",
            "<span  class='govuk-body govuk-!-font-weight-bold'> Screening Interview:</span>  If you have claimed asylum, the Screening Interview is the first interview that takes place. The bundle will include a written record of the interview",
            "<span  class='govuk-body govuk-!-font-weight-bold'> Asylum Interview Record:</span>  If you have claimed asylum, the Asylum Interview (also known as the Asylum Substantive Interview) is when the Home Office asks you in detail about your reasons for claiming asylum. The bundle will include a written record of the interview",
            "<span  class='govuk-body govuk-!-font-weight-bold'> Documents submitted by appellant in support of claim:</span>  This is any supporting evidence that you gave to the Home Office as part of your claim. This could be a witness statement, medical records or official documents such as a birth certificate",
            "<span  class='govuk-body govuk-!-font-weight-bold'> Previous refusal:</span>  If you made a previous claim that was refused, any documents related to this claim will be included in the bundle",
            "<span  class='govuk-body govuk-!-font-weight-bold'> Previous appeal:</span>  If you made a previous appeal that was dismissed, any documents related to this appeal may be included in the bundle",
            "<span  class='govuk-body govuk-!-font-weight-bold'> Decision letter:</span>  This is the letter that explains why the Home Office refused your claim. A decision letter is sent to you by post and you should have a copy"
          ],
          'smallTitle': 'Documents about your case',
          'title': 'Your bundle will include some or all of the following documents:'
        },
        {
          'desc': 'Your Home Office bundle is accessible from the Overview page. <a class="govuk-link" href="/appeal-overview">Return to your Overview page</a> and click Home Office documents about your case to access your Home Office bundle. ',
          'smallTitle': 'Where to find your Home Office bundle'
        },
        {
          'desc': "If you need help understanding your Home Office documents, you can call <span  class='govuk-body govuk-!-font-weight-bold'> 0300 123 1711</span>  or email <a class=\"govuk-link\" href=\"mailto:customer.service@justice.gov.uk\">customer.service@justice.gov.uk</a>",
          'smallTitle': 'Contact us for help'
        }
      ],
      'title': 'Understanding your Home Office documents',
      'titleText': 'As part of the appeal process, the Home Office must send the Tribunal all the documents it has about your case. This is called the Home Office bundle.'
    });
  });

  it('When I enter helpWithAppeal I get the text for helpWithAppeal Page', () => {
    const result = getGuidancePageText('helpWithAppeal');
    expect(result).to.deep.equal({
      'textAndBullets': [
        {
          'smallTitle': 'Asylum helplines',
          'textLink': 'https://www.gov.uk/asylum-helplines',
          'title': 'Get advice over the phone on the asylum process, including appealing an asylum decision.'
        },
        {
          'smallTitle': 'Find an immigration adviser',
          'textLink': 'https://www.gov.uk/find-an-immigration-adviser',
          'title': 'Find registered immigration advisers in your area who may be able to help with your appeal.'
        },
        {
          'smallTitle': 'Find a legal aid adviser',
          'text': 'If you do qualify, you can search for a legal adviser with a legal aid contract in England and Wales.',
          'textLink': 'https://find-legal-advice.justice.gov.uk/',
          'title': 'Legal aid can help pay for legal advice. <a class="govuk-link" href="https://www.gov.uk/check-legal-aid">Check if you qualify for legal aid.</a>'
        },
        {
          'link': 'https://www.citizensadvice.org.uk/immigration/get-help/get-immigration-advice/',
          'smallTitle': 'Citizens Advice ',
          'title': 'Get free, confidential help from your local Citizens Advice on a range of immigration issues. Please note that Citizens Advice does not currently offer advice on asylum issues.'
        }
      ],
      'title': 'Get help with your appeal',
      'titleText': 'There are a number of ways to get advice on appealing an asylum or immigration decision.'
    });
  });

  it('When I enter evidenceToSupportAppeal I get the text for evidenceToSupportAppeal Page', () => {
    const result = getGuidancePageText('evidenceToSupportAppeal');
    expect(result).to.deep.equal({
      'textAndBullets': [
        {
          'desc': 'Here are some examples of different kinds of evidence that could support your appeal. ',
          'title': 'Anything you tell the Tribunal is evidence. It is likely to help your case if you can provide further relevant evidence to prove what you say is true. For example, if you tell the Tribunal you are a citizen of a particular country, a copy of your passport is further evidence that this is true.'
        },
        {
          'bullets': [
            'a community leader',
            'a religious leader',
            'a social worker',
            'anybody who knows something relevant about your case'
          ],
          'desc': 'All witnesses must write a witness statement, which is a written version of their oral evidence. The witness statement should include the appeal reference number as well as the witness’ address, date of birth, signature and photo identification',
          'smallTitle': 'Witness statement',
          'title': 'A witness is someone who comes to a hearing to speak on your behalf. This is known as oral evidence. A witness could be:'
        },
        {
          'smallTitle': 'Letter of support',
          'text': 'A letter of support should include the appeal reference number as well as the supporter’s address, date of birth, signature and photo identification.',
          'title': 'A letter of support is usually written by someone who knows you well such as a friend or family member. The letter normally explains how the writer knows you and describes what kind of person they think you are.'
        },
        {
          'bullets': [
            'official country reports (for example, Home Office or US State Department country reports)',
            'country expert reports (for example, from an academic specialising in that country)',
            '<a class="govuk-link" href="https://www.gov.uk/government/collections/country-policy-and-information-notes">UK government country guidance reports</a>',
            'news reports',
            'cases the Tribunal has already heard about your country'
          ],
          'smallTitle': 'Country evidence',
          'title': 'You can use information or reports about a country to support anything you have said about that country in your appeal. Examples include:'
        },
        {
          'bullets': [
            'social media posts',
            'photos/videos of events',
            'news reports',
            'membership information'
          ],
          'smallTitle': 'Evidence of participation in groups ',
          'title': 'There are a number of ways you can show your connection to a particular group or involvement in public demonstrations. Examples include:'
        },
        {
          'bullets': [
            'email, text or Whatsapp messages',
            'school reports',
            "teachers' letters",
            'social worker reports'
          ],
          'smallTitle': 'Relationship evidence ',
          'title': 'You may need evidence to prove your relationship with a child, spouse or other family member. Examples include:'
        },
        {
          'bullets': [
            'prescriptions',
            'letters from your doctor',
            'GP notes',
            'expert reports',
            'other medical reports'
          ],
          'smallTitle': 'Medical evidence',
          'title': 'You may need evidence for any physical or mental health conditions you want to tell the Tribunal about. Examples include:'
        },
        {
          'bullets': [
            'arrest records',
            'police reports',
            'court reports',
            'first instance reports, if your case refers to alleged criminal activity in your home country'
          ],
          'smallTitle': 'Criminal evidence',
          'title': 'You may need evidence to show if you have been arrested or involved in any criminal activity that is relevant to your appeal. This could be from your home country or the UK. Examples include:'
        },
        {
          'bullets': [
            'birth certificates',
            'marriage certificates',
            'passports',
            'identity cards'
          ],
          'smallTitle': ' Official documents',
          'title': 'You may need to provide official documents to prove your nationality or family relationships. Examples include:'
        },
        {
          'bullets': [
            'payslips',
            'bank records',
            'work records',
            'no recourse to public funds/local authority letters'
          ],
          'smallTitle': 'Financial evidence',
          'title': 'You may need to provide evidence to prove your financial situation. Examples include:'
        },
        {
          'bullets': [
            'certificates',
            'evidence of enrollment',
            'reports'
          ],
          'smallTitle': 'Educational evidence',
          'title': 'You may need to provide evidence of any courses you have taken and awards you have received. Examples include:'
        },
        {
          'bullets': [
            'legal precedents',
            'decisions of cases linked to yours (for example, a family member or someone in a similar situation)',
            'decisions of cases from your home country'
          ],
          'smallTitle': 'Legal evidence',
          'title': 'It may be helpful to use legal arguments and documents to support your appeal. Examples include:'
        }
      ],
      'title': 'Evidence to support your appeal',
      'titleText': 'Evidence is any information that supports your appeal.'
    });
  });
});

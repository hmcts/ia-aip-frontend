import exp from 'constants';
import i18n from '../../locale/en.json';
import { paths } from '../paths';

export enum Delimiter {
  SPACE = ' ',
  BREAK_LINE = '<br>'
}

export function addSummaryRow(key?: string, values?: (number | string | string[] | any)[], href?: string, delimiter?: Delimiter, text?: string) {
  const separator = delimiter || '';
  let row: SummaryRow = {
    key: {
      text: key
    },
    value: {
      html: values.filter(v => v !== '' || undefined).join(separator)
    }
  };
  if (href) {
    row.actions = {
      items: [
        {
          href: href,
          text: text || i18n.common.links.change,
          visuallyHiddenText: (href.includes(paths.submitHearingRequirements.hearingDatesToAvoidEnterDate) || href.includes(paths.awaitingCmaRequirements.datesToAvoidEnterDate) || (!key)) ? 'Answer' : key
        }
      ]
    };
  }
  return row;
}

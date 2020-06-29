import exp from 'constants';
import i18n from '../../locale/en.json';

export enum Delimiter {
  SPACE = ' ',
  BREAK_LINE = '<br>'
}

export function addSummaryRow(key?: string, values?: (number | string | string[] | any)[], href?: string, delimiter?: Delimiter, classes: string = '') {
  const separator = delimiter || '';
  let row: SummaryRow = {
    classes: classes,
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
          text: i18n.common.links.change
        }
      ]
    };
  }
  return row;
}

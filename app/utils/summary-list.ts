import i18n from '../../locale/en.json';

export enum Delimiter {
  SPACE = ' ',
  BREAK_LINE = '<br>'
}

export function addSummaryRow(key: string, values: (number | string | string[])[], href: string, delimiter?: Delimiter) {
  delimiter = delimiter ? delimiter : Delimiter.BREAK_LINE;
  const row = {
    key: {
      text: i18n.fields[key]
    },
    value: {
      html: values.filter(v => v !== '' || undefined).join(delimiter)
    },
    actions: {
      items: [
        {
          href: href,
          text: i18n.common.links.change
        }
      ]
    }
  };
  return row;
}

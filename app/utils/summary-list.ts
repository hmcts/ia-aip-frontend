import i18n from '../../locale/en.json';

export enum Delimiter {
  SPACE = ' ',
  BREAK_LINE = '<br>'
}

export function addSummaryRow(key: string, values: (number | string | string[])[], href: string, delimiter?: Delimiter) {
  const separator = delimiter || '';
  const row = {
    key: {
      text: key
    },
    value: {
      html: values.filter(v => v !== '' || undefined).join(separator)
    },
    actions: {
      items: [ href ?
      {
        href: href,
        text: i18n.common.links.change
      } : null
      ]
    }
  };
  return row;
}

export function addSummaryRowNoChange(key: string, values: (number | string | string[] | any)[], delimiter?: Delimiter) {
  const separator = delimiter || '';
  return {
    key: {
      text: key
    },
    value: {
      html: values.filter(v => v !== '' || undefined).join(separator)
    }
  };
}

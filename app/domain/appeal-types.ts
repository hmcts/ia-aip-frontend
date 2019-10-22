import i18n from '../../locale/en.json';

interface IExample {
  id: string;
  name: string;
  description: string;
}

class Example {
  constructor(public data: IExample) {
  }
}

interface IOption {
  id: string;
  name: string;
  description: string;
  example: IExample;
}

class Option {
  constructor(public data: IOption) {
  }
}

function getAppealTypes() {
  const protection = new Option({
    id: 'protection',
    name: i18n.pages.appealType.options.protection.name,
    description: i18n.pages.appealType.options.protection.description,
    example: new Example({
      id: i18n.pages.appealType.options.protection.example.id,
      name: i18n.pages.appealType.options.protection.example.name,
      description: i18n.pages.appealType.options.protection.example.description
    }).data
  });

  const humanRights = new Option({
    id: 'human-rights',
    name: i18n.pages.appealType.options.humanRights.name,
    description: i18n.pages.appealType.options.humanRights.description,
    example: new Example({
      id: i18n.pages.appealType.options.humanRights.example.id,
      name: i18n.pages.appealType.options.humanRights.example.name,
      description: i18n.pages.appealType.options.humanRights.example.description
    }).data
  });

  const eea = new Option({
    id: 'eea',
    name: i18n.pages.appealType.options.eea.name,
    description: i18n.pages.appealType.options.eea.description,
    example: new Example({
      id: i18n.pages.appealType.options.eea.example.id,
      name: i18n.pages.appealType.options.eea.example.name,
      description: i18n.pages.appealType.options.eea.example.description
    }).data
  });

  const revocation = new Option({
    id: 'revocation',
    name: i18n.pages.appealType.options.revocation.name,
    description: i18n.pages.appealType.options.revocation.description,
    example: new Example({
      id: i18n.pages.appealType.options.revocation.example.id,
      name: i18n.pages.appealType.options.revocation.example.name,
      description: i18n.pages.appealType.options.revocation.example.description
    }).data
  });

  const deprivation = new Option(
    {
      id: 'deprivation',
      name: i18n.pages.appealType.options.deprivation.name,
      description: i18n.pages.appealType.options.deprivation.description,
      example: new Example({
        id: i18n.pages.appealType.options.deprivation.example.id,
        name: i18n.pages.appealType.options.deprivation.example.name,
        description: i18n.pages.appealType.options.deprivation.example.description
      }).data
    });
  return [
    protection.data,
    humanRights.data,
    eea.data,
    revocation.data,
    deprivation.data ];

}

export default class AppealTypes {
  constructor() {
    return getAppealTypes();
  }
}

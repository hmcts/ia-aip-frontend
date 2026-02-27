import i18nRaw from '../../locale/en.json';

let i18nTransformed = i18nRaw;

export function transformI18n() {
  i18nTransformed = transformPerspective(i18nRaw);
}

export function getI18n(isNonLegalRep: boolean) {
  return isNonLegalRep ? i18nTransformed : i18nRaw;
}

export function transformPerspective(data) {
  return deepTransform(data);
}

function deepTransform(value, isProgressBar = false) {
  if (typeof value === 'string') {
    return transformString(value, isProgressBar);
  }

  if (Array.isArray(value)) {
    return value.map(v => deepTransform(v, isProgressBar));
  }

  if (value && typeof value === 'object') {
    if (value['yourAppealDetails'] && value['yourAppealArgument'] && value['yourHearingDetails'] && value['yourAppealDecision']) {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, deepTransform(v, true)])
      );
    }
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deepTransform(v, isProgressBar)])
    );
  }

  return value;
}

/**
 * Protect handlebars before processing
 */
function transformString(str, isProgressBar: boolean) {
  if (!str) return str;

  // Removing links that contain paths to non-usable events but keeping the text if needed
  str = removeLink(str, 'paths.makeApplication.judgesReview', false);
  str = removeLink(str, 'paths.common.provideMoreEvidenceForm', false);
  str = removeLink(str, 'paths.ftpa.ftpaApplication', true);
  str = removeLink(str, 'paths.common.payLater', true);

  const handlebarsRegex = /{{[^{}]*}}/g;
  const segments = [];
  let lastIndex = 0;

  str.replaceAll(handlebarsRegex, (match, offset) => {
    if (offset > lastIndex) {
      segments.push({
        type: 'text',
        value: str.slice(lastIndex, offset),
      });
    }

    segments.push({
      type: 'handlebars',
      value: match,
    });

    lastIndex = offset + match.length;
  });

  if (lastIndex < str.length) {
    segments.push({
      type: 'text',
      value: str.slice(lastIndex),
    });
  }

  return segments
    .map(seg =>
      seg.type === 'text'
        ? grammarAwareTransform(seg.value, isProgressBar)
        : seg.value
    )
    .join('');
}

function grammarAwareTransform(text, isProgressBar: boolean) {
  let result = text;

  if (isProgressBar) {
    result = result.replaceAll(/\bYour appeal\b/g, 'Appeal');
    result = result.replaceAll(/\bYour hearing\b/g, 'Hearing');
    return result;
  }
  // Replace structured phrases first
  result = result.replaceAll(/\bDo this next\b/g, 'The appellant must do this next');
  result = result.replaceAll(/\bNothing to do next\b/g, 'The appellant has nothing to do next');
  result = result.replaceAll(/\bYou might not get more time. You\b/g, 'The appellant might not get more time. They');
  result = result.replaceAll(/\bYou have\b/g, 'The appellant has');
  result = result.replaceAll(/\bYou must\b/g, 'The appellant must');
  result = result.replaceAll(/\bYou need to\b/g, 'The appellant needs to');
  result = result.replaceAll(/\bYou now need to\b/g, 'The appellant now needs to');
  result = result.replaceAll(/\bYou still need to\b/g, 'The appellant still needs to');
  result = result.replaceAll(/\bYou will\b/g, 'The appellant will');
  result = result.replaceAll(/\bYou should\b/g, 'The appellant should');
  result = result.replaceAll(/\bYou can\b/g, 'The appellant can');
  result = result.replaceAll(/\bYou chose\b/g, 'The appellant chose');
  result = result.replaceAll(/\bYou disagree\b/g, 'The appellant disagrees');
  result = result.replaceAll(/\bTell us\b/g, 'The appellant needs to tell us');
  result = result.replaceAll(/\b1. Call\b/g, '1. They should call');
  result = result.replaceAll(/\bWhy you need\b/g, 'Why the appellant needs');
  result = result.replaceAll(/\bWhy you think\b/g, 'Why the appellant thinks');

  // Replace common phrases
  result = result.replaceAll(/\bYou must send your\b/g, 'They must send their');
  result = result.replaceAll(/\byou disagree\b/g, 'the appellant disagrees');
  result = result.replaceAll(/\byou have\b/g, 'they have');
  result = result.replaceAll(/\bif you can’t answer fully, you\b/g, 'if they can’t answer fully, they');
  result = result.replaceAll(/\bcontact you to tell you\b/g, 'contact the appellant to tell them');
  result = result.replaceAll(/\bcontact you soon to tell you\b/g, 'contact the appellant soon to tell them');
  result = result.replaceAll(/\bwith you\b/g, 'with them');
  result = result.replaceAll(/\byou do\b/g, 'they do');
  result = result.replaceAll(/\byou believe\b/g, 'they believe');
  result = result.replaceAll(/\blet you know\b/g, 'let them know');
  result = result.replaceAll(/\byou need to\b/g, 'they need to');
  result = result.replaceAll(/\blooking at your answers\b/g, "looking at the appellant's answers");
  result = result.replaceAll(/\band will contact you\b/g, 'and will contact them');
  result = result.replaceAll(/\band tell you\b/g, 'and tell them');
  result = result.replaceAll(/\bto tell you\b/g, 'to tell them');
  result = result.replaceAll(/\bto review your appeal\b/g, 'to review the appellant\'s appeal');
  result = result.replaceAll(/\bhas reviewed your appeal\b/g, 'has reviewed the appellant\'s appeal');
  result = result.replaceAll(/\brefuse your application\b/g, 'refuse the appellant\'s application');
  result = result.replaceAll(/\b, you can\b/g, ', they can');
  result = result.replaceAll(/\byou will need\b/g, 'they will need');
  result = result.replaceAll(/\bwhy you think\b/g, 'why they think');
  result = result.replaceAll(/\bif you can\b/g, 'if they can');
  result = result.replaceAll(/\bIf you still think\b/g, 'If the appellant still thinks');
  result = result.replaceAll(/\breasons you think\b/g, 'reasons the appellant thinks');
  result = result.replaceAll(/\bFirst, tell us\b/g, 'First, they need to tell us');
  result = result.replaceAll(/\bprovided by you\b/g, 'provided by them');
  result = result.replaceAll(/\bhas set a date for your\b/g, 'has set a date for the appellant\'s');
  result = result.replaceAll(/\byou should read it carefully\b/g, 'they should read it carefully');
  result = result.replaceAll(/\bdecide your application\b/g, 'decide the appellant\'s application');
  result = result.replaceAll(/\byou think your\b/g, 'the appellant thinks their');
  result = result.replaceAll(/\byour application\b/g, 'the appellant\'s application');
  result = result.replaceAll(/\byou also have an expedited\b/g, 'they also have an expedited');
  result = result.replaceAll(/\byou still have\b/g, 'they still have');

  result = result.replaceAll(/\bThe appellant must send the appellant's application\b/g, 'They must send their application');
  result = result.replaceAll(/\bthey do not pay the fee\b/g, 'the appellant does not pay the fee');

  // Replace remaining pronouns
  result = result.replaceAll(/\bYour appeal\b/g, "The appellant's appeal");
  result = result.replaceAll(/\bYour\b/g, "The appellant's");
  result = result.replaceAll(/\byour\b/g, 'their');
  result = result.replaceAll(/\byourself\b/g, 'themself');

  result = result.replaceAll(/\bYou\b/g, 'The appellant');
  result = result.replaceAll(/\byou\b/g, 'the appellant');

  return result;
}

function removeLink(text: string, path: string, removeText: boolean) {
  if (text.includes(path)) {
    const linkRegex = new RegExp(`<a href={{\\s*${path}\\s*}}>(.*?)</a>`, 'g');
    if (linkRegex.test(text)) {
      return text.replaceAll(linkRegex, removeText ? '' : '$1');
    }
    const linkRegex2 = new RegExp(`<a href="{{\\s*${path}\\s*}}">(.*?)</a>`, 'g');
    return text.replaceAll(linkRegex2, removeText ? '' : '$1');
  } else {
    return text;
  }
}

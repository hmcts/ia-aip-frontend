export function transformPerspective(data, isNonLegalRep: boolean) {
  return isNonLegalRep ? deepTransform(data) : data;
}

function deepTransform(value) {
  if (typeof value === 'string') {
    return transformString(value);
  }

  if (Array.isArray(value)) {
    return value.map(deepTransform);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deepTransform(v)])
    );
  }

  return value;
}

/**
 * Protect handlebars before processing
 */
function transformString(str) {
  if (!str) return str;

  // Removing links that contain paths to non-usable events but keeping the text if needed
  str = removeLink(str, 'paths.makeApplication.judgesReview', false);
  str = removeLink(str, 'paths.common.provideMoreEvidenceForm', false);
  str = removeLink(str, 'paths.ftpa.ftpaApplication', true);
  str = removeLink(str, 'paths.common.payLater', true);

  const handlebarsRegex = /{{.*?}}/g;
  const segments = [];
  let lastIndex = 0;

  str.replace(handlebarsRegex, (match, offset) => {
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
        ? grammarAwareTransform(seg.value)
        : seg.value
    )
    .join('');
}

function grammarAwareTransform(text) {
  let result = text;

  // Replace structured phrases first
  result = result.replace(/\bYou might not get more time. You\b/g, 'The appellant might not get more time. They');
  result = result.replace(/\bYou have\b/g, 'The appellant has');
  result = result.replace(/\bYou must\b/g, 'The appellant must');
  result = result.replace(/\bYou need to\b/g, 'The appellant needs to');
  result = result.replace(/\bYou now need to\b/g, 'The appellant now needs to');
  result = result.replace(/\bYou still need to\b/g, 'The appellant still needs to');
  result = result.replace(/\bYou will\b/g, 'The appellant will');
  result = result.replace(/\bYou should\b/g, 'The appellant should');
  result = result.replace(/\bYou can\b/g, 'The appellant can');
  result = result.replace(/\bYou chose\b/g, 'The appellant chose');
  result = result.replace(/\bYou disagree\b/g, 'The appellant disagrees');
  result = result.replace(/\bTell us\b/g, 'The appellant needs to tell us');
  result = result.replace(/\b1. Call\b/g, '1. They should call');
  result = result.replace(/\bWhy you need\b/g, 'Why the appellant needs');
  result = result.replace(/\bWhy you think\b/g, 'Why the appellant thinks');

  // Replace common phrases
  result = result.replace(/\bYou must send your\b/g, 'They must send their');
  result = result.replace(/\byou disagree\b/g, 'the appellant disagrees');
  result = result.replace(/\byou have\b/g, 'they have');
  result = result.replace(/\bif you can’t answer fully, you\b/g, 'if they can’t answer fully, they');
  result = result.replace(/\bcontact you to tell you\b/g, 'contact the appellant to tell them');
  result = result.replace(/\bcontact you soon to tell you\b/g, 'contact the appellant soon to tell them');
  result = result.replace(/\bwith you\b/g, 'with them');
  result = result.replace(/\byou do\b/g, 'they do');
  result = result.replace(/\byou believe\b/g, 'they believe');
  result = result.replace(/\blet you know\b/g, 'let them know');
  result = result.replace(/\byou need to\b/g, 'they need to');
  result = result.replace(/\blooking at your answers\b/g, "looking at the appellant's answers");
  result = result.replace(/\band will contact you\b/g, 'and will contact them');
  result = result.replace(/\band tell you\b/g, 'and tell them');
  result = result.replace(/\bto tell you\b/g, 'to tell them');
  result = result.replace(/\bto review your appeal\b/g, 'to review the appellant\'s appeal');
  result = result.replace(/\bhas reviewed your appeal\b/g, 'has reviewed the appellant\'s appeal');
  result = result.replace(/\brefuse your application\b/g, 'refuse the appellant\'s application');
  result = result.replace(/\b, you can\b/g, ', they can');
  result = result.replace(/\byou will need\b/g, 'they will need');
  result = result.replace(/\bwhy you think\b/g, 'why they think');
  result = result.replace(/\bif you can\b/g, 'if they can');
  result = result.replace(/\bIf you still think\b/g, 'If the appellant still thinks');
  result = result.replace(/\breasons you think\b/g, 'reasons the appellant thinks');
  result = result.replace(/\bFirst, tell us\b/g, 'First, they need to tell us');
  result = result.replace(/\bprovided by you\b/g, 'provided by them');
  result = result.replace(/\bhas set a date for your\b/g, 'has set a date for the appellant\'s');
  result = result.replace(/\byou should read it carefully\b/g, 'they should read it carefully');
  result = result.replace(/\bdecide your application\b/g, 'decide the appellant\'s application');
  result = result.replace(/\byou think your\b/g, 'the appellant thinks their');
  result = result.replace(/\byour application\b/g, 'the appellant\'s application');
  result = result.replace(/\byou also have an expedited\b/g, 'they also have an expedited');
  result = result.replace(/\byou still have\b/g, 'they still have');

  result = result.replace(/\bThe appellant must send the appellant's application\b/g, 'They must send their application');
  result = result.replace(/\bthey do not pay the fee\b/g, 'the appellant does not pay the fee');

  // Replace remaining pronouns
  result = result.replace(/\bYour appeal\b/g, "The appellant's appeal");
  result = result.replace(/\bYour\b/g, "The appellant's");
  result = result.replace(/\byour\b/g, 'their');
  result = result.replace(/\byourself\b/g, 'themself');

  result = result.replace(/\bYou\b/g, 'The appellant');
  result = result.replace(/\byou\b/g, 'the appellant');

  return result;
}

function removeLink(text: string, path: string, removeText: boolean) {
  if (text.includes(path)) {
    const linkRegex = new RegExp(`<a href={{\\s*${path}\\s*}}>(.*?)<\/a>`, 'g');
    if (text.match(linkRegex)) {
      return text.replace(linkRegex, removeText ? '' : '$1');
    }
    const linkRegex2 = new RegExp(`<a href=\"{{\\s*${path}\\s*}}\">(.*?)<\/a>`, 'g');
    return text.replace(linkRegex2, removeText ? '' : '$1');
  } else {
    return text;
  }
}

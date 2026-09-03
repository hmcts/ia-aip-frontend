import { Mockttp } from 'mockttp';

export async function setupSignLanguage(server: Mockttp) {
  await server.forGet('/refdata/commondata/lov/categories/SignLanguage').thenCallback(async () => {
    return {
      statusCode: 200,
      json: {
        'list_of_values': [
          {
            'key': 'ase',
            'value_en': 'American Sign Language (ASL)',
            'active_flag': 'Y'
          },
          {
            'key': 'bfi',
            'value_en': 'British Sign Language (BSL)',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-dfr',
            'value_en': 'Deaf Relay',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-dma',
            'value_en': 'Deafblind manual alphabet',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-hos',
            'value_en': 'Hands on signing',
            'active_flag': 'Y'
          },
          {
            'key': 'ils',
            'value_en': 'International Sign (IS)',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-lps',
            'value_en': 'Lipspeaker',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-mkn',
            'value_en': 'Makaton',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-ntr',
            'value_en': 'Notetaker',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-pst',
            'value_en': 'Palantypist / Speech to text',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-sse',
            'value_en': 'Speech Supported English (SSE)',
            'active_flag': 'Y'
          },
          {
            'key': 'sign-vfs',
            'value_en': 'Visual frame signing',
            'active_flag': 'Y'
          }
        ]
      }
    };
  });
}

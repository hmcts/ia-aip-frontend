import { Mockttp } from 'mockttp';

export async function setupInterpreterLanguage(server: Mockttp) {
  await server.forGet('/refdata/commondata/lov/categories/InterpreterLanguage').thenCallback(async () => {
    return {
      statusCode: 200,
      json: {
        'list_of_values': [
          {
            'key': 'ach',
            'value_en': 'Acholi',
            'active_flag': 'Y'
          },
          {
            'key': 'afr',
            'value_en': 'Afrikaans',
            'active_flag': 'Y'
          },
          {
            'key': 'aka',
            'value_en': 'Akan',
            'active_flag': 'Y'
          },
          {
            'key': 'sqi',
            'value_en': 'Albanian',
            'active_flag': 'Y'
          },
          {
            'key': 'arq',
            'value_en': 'Algerian',
            'active_flag': 'Y'
          },
          {
            'key': 'amh',
            'value_en': 'Amharic',
            'active_flag': 'Y'
          },
          {
            'key': 'ara',
            'value_en': 'Arabic',
            'active_flag': 'Y'
          },
          {
            'key': 'ara-ame',
            'value_en': 'Arabic Middle Eastern',
            'active_flag': 'Y'
          },
          {
            'key': 'ara-ana',
            'value_en': 'Arabic North African',
            'active_flag': 'Y'
          },
          {
            'key': 'hye',
            'value_en': 'Armenian',
            'active_flag': 'Y'
          },
          {
            'key': 'aii',
            'value_en': 'Assyrian',
            'active_flag': 'Y'
          },
          {
            'key': 'teo',
            'value_en': 'Ateso',
            'active_flag': 'Y'
          },
          {
            'key': 'aze',
            'value_en': 'Azerbaijani (also North Azerbaijani/Azari)',
            'active_flag': 'Y'
          },
          {
            'key': 'bjs',
            'value_en': 'Bajan (West Indian)',
            'active_flag': 'Y'
          },
          {
            'key': 'bal',
            'value_en': 'Baluchi',
            'active_flag': 'Y'
          },
          {
            'key': 'bam',
            'value_en': 'Bambara',
            'active_flag': 'Y'
          },
          {
            'key': 'bas',
            'value_en': 'Bassa',
            'active_flag': 'Y'
          },
          {
            'key': 'bel',
            'value_en': 'Belarusian',
            'active_flag': 'Y'
          },
          {
            'key': 'bem',
            'value_en': 'Bemba (Zambia)',
            'active_flag': 'Y'
          },
          {
            'key': 'ben',
            'value_en': 'Bengali',
            'active_flag': 'Y'
          },
          {
            'key': 'ben-bsy',
            'value_en': 'Bengali Sylheti',
            'active_flag': 'Y'
          },
          {
            'key': 'bin',
            'value_en': 'Benin/Edo',
            'active_flag': 'Y'
          },
          {
            'key': 'ber',
            'value_en': 'Berber',
            'active_flag': 'Y'
          },
          {
            'key': 'btn',
            'value_en': 'Bhutanese',
            'active_flag': 'Y'
          },
          {
            'key': 'bih',
            'value_en': 'Bihari',
            'active_flag': 'Y'
          },
          {
            'key': 'byn',
            'value_en': 'Bilin',
            'active_flag': 'Y'
          },
          {
            'key': 'bos',
            'value_en': 'Bosnian',
            'active_flag': 'Y'
          },
          {
            'key': 'abr',
            'value_en': 'Brong',
            'active_flag': 'Y'
          },
          {
            'key': 'bul',
            'value_en': 'Bulgarian',
            'active_flag': 'Y'
          },
          {
            'key': 'mya',
            'value_en': 'Burmese',
            'active_flag': 'Y'
          },
          {
            'key': 'yue',
            'value_en': 'Cantonese',
            'active_flag': 'Y'
          },
          {
            'key': 'ceb',
            'value_en': 'Cebuano',
            'active_flag': 'Y'
          },
          {
            'key': 'cld',
            'value_en': 'Chaldean Neo-Aramaic',
            'active_flag': 'Y'
          },
          {
            'key': 'che',
            'value_en': 'Chechen',
            'active_flag': 'Y'
          },
          {
            'key': 'nya',
            'value_en': 'Chichewa',
            'active_flag': 'Y'
          },
          {
            'key': 'ctg',
            'value_en': 'Chittagonian',
            'active_flag': 'Y'
          },
          {
            'key': 'cpe',
            'value_en': 'Creole (English)',
            'active_flag': 'Y'
          },
          {
            'key': 'cpf',
            'value_en': 'Creole (French)',
            'active_flag': 'Y'
          },
          {
            'key': 'cpp',
            'value_en': 'Creole (Portuguese)',
            'active_flag': 'Y'
          },
          {
            'key': 'crp',
            'value_en': 'Creole (Spanish)',
            'active_flag': 'Y'
          },
          {
            'key': 'hrv',
            'value_en': 'Croatian',
            'active_flag': 'Y'
          },
          {
            'key': 'ces',
            'value_en': 'Czech',
            'active_flag': 'Y'
          },
          {
            'key': 'dan',
            'value_en': 'Danish',
            'active_flag': 'Y'
          },
          {
            'key': 'prs',
            'value_en': 'Dari',
            'active_flag': 'Y'
          },
          {
            'key': 'div',
            'value_en': 'Dhivehi',
            'active_flag': 'Y'
          },
          {
            'key': 'din',
            'value_en': 'Dinka',
            'active_flag': 'Y'
          },
          {
            'key': 'dyu',
            'value_en': 'Dioula',
            'active_flag': 'Y'
          },
          {
            'key': 'dua',
            'value_en': 'Duala',
            'active_flag': 'Y'
          },
          {
            'key': 'nld',
            'value_en': 'Dutch',
            'active_flag': 'Y'
          },
          {
            'key': 'efi',
            'value_en': 'Efik',
            'active_flag': 'Y'
          },
          {
            'key': 'eng',
            'value_en': 'English',
            'active_flag': 'Y'
          },
          {
            'key': 'ish',
            'value_en': 'Esan',
            'active_flag': 'Y'
          },
          {
            'key': 'est',
            'value_en': 'Estonian',
            'active_flag': 'Y'
          },
          {
            'key': 'ewe',
            'value_en': 'Ewe',
            'active_flag': 'Y'
          },
          {
            'key': 'ewo',
            'value_en': 'Ewondo',
            'active_flag': 'Y'
          },
          {
            'key': 'fat',
            'value_en': 'Fanti',
            'active_flag': 'Y'
          },
          {
            'key': 'fas',
            'value_en': 'Farsi',
            'active_flag': 'Y'
          },
          {
            'key': 'kur-fey',
            'value_en': 'Feyli',
            'active_flag': 'Y'
          },
          {
            'key': 'fij',
            'value_en': 'Fijian',
            'active_flag': 'Y'
          },
          {
            'key': 'nld-nfl',
            'value_en': 'Flemish',
            'active_flag': 'Y'
          },
          {
            'key': 'fra',
            'value_en': 'French',
            'active_flag': 'Y'
          },
          {
            'key': 'fra-can',
            'value_en': 'French (Canadian)',
            'active_flag': 'Y'
          },
          {
            'key': 'fra-faf',
            'value_en': 'French African',
            'active_flag': 'Y'
          },
          {
            'key': 'fra-far',
            'value_en': 'French Arabic',
            'active_flag': 'Y'
          },
          {
            'key': 'ful',
            'value_en': 'Fula',
            'active_flag': 'Y'
          },
          {
            'key': 'gaa',
            'value_en': 'Ga',
            'active_flag': 'Y'
          },
          {
            'key': 'glg',
            'value_en': 'Galician',
            'active_flag': 'Y'
          },
          {
            'key': 'kat',
            'value_en': 'Georgian',
            'active_flag': 'Y'
          },
          {
            'key': 'deu',
            'value_en': 'German',
            'active_flag': 'Y'
          },
          {
            'key': 'hac',
            'value_en': 'Gorani',
            'active_flag': 'Y'
          },
          {
            'key': 'ell',
            'value_en': 'Greek',
            'active_flag': 'Y'
          },
          {
            'key': 'guj',
            'value_en': 'Gujarati',
            'active_flag': 'Y'
          },
          {
            'key': 'sgw',
            'value_en': 'Gurage',
            'active_flag': 'Y'
          },
          {
            'key': 'hak',
            'value_en': 'Hakka',
            'active_flag': 'Y'
          },
          {
            'key': 'hau',
            'value_en': 'Hausa',
            'active_flag': 'Y'
          },
          {
            'key': 'heb',
            'value_en': 'Hebrew',
            'active_flag': 'Y'
          },
          {
            'key': 'her',
            'value_en': 'Herero',
            'active_flag': 'Y'
          },
          {
            'key': 'hin',
            'value_en': 'Hindi',
            'active_flag': 'Y'
          },
          {
            'key': 'hnd',
            'value_en': 'Hindko',
            'active_flag': 'Y'
          },
          {
            'key': 'zho-hok',
            'value_en': 'Hokkien',
            'active_flag': 'Y'
          },
          {
            'key': 'hun',
            'value_en': 'Hungarian',
            'active_flag': 'Y'
          },
          {
            'key': 'ibb',
            'value_en': 'Ibibio',
            'active_flag': 'Y'
          },
          {
            'key': 'ibo',
            'value_en': 'Igbo (Also Known As Ibo)',
            'active_flag': 'Y'
          },
          {
            'key': 'ilo',
            'value_en': 'Ilocano',
            'active_flag': 'Y'
          },
          {
            'key': 'ind',
            'value_en': 'Indonesian',
            'active_flag': 'Y'
          },
          {
            'key': 'iso',
            'value_en': 'Isoko',
            'active_flag': 'Y'
          },
          {
            'key': 'ita',
            'value_en': 'Italian',
            'active_flag': 'Y'
          },
          {
            'key': 'jam',
            'value_en': 'Jamaican Patois (Jamaican Creole)',
            'active_flag': 'Y'
          },
          {
            'key': 'jpn',
            'value_en': 'Japanese',
            'active_flag': 'Y'
          },
          {
            'key': 'jav',
            'value_en': 'Javanese',
            'active_flag': 'Y'
          },
          {
            'key': 'gjk',
            'value_en': 'Kachi Koli',
            'active_flag': 'Y'
          },
          {
            'key': 'krx',
            'value_en': 'Karon',
            'active_flag': 'Y'
          },
          {
            'key': 'kas',
            'value_en': 'Kashmiri',
            'active_flag': 'Y'
          },
          {
            'key': 'kck',
            'value_en': 'Khalanga',
            'active_flag': 'Y'
          },
          {
            'key': 'khm',
            'value_en': 'Khmer',
            'active_flag': 'Y'
          },
          {
            'key': 'bnt-kic',
            'value_en': 'Kichagga',
            'active_flag': 'Y'
          },
          {
            'key': 'kon',
            'value_en': 'Kikongo',
            'active_flag': 'Y'
          },
          {
            'key': 'kik',
            'value_en': 'Kikuyu',
            'active_flag': 'Y'
          },
          {
            'key': 'kin',
            'value_en': 'Kinyarwanda',
            'active_flag': 'Y'
          },
          {
            'key': 'run',
            'value_en': 'Kirundi',
            'active_flag': 'Y'
          },
          {
            'key': 'swh',
            'value_en': 'Kiswahili',
            'active_flag': 'Y'
          },
          {
            'key': 'knn',
            'value_en': 'Konkani',
            'active_flag': 'Y'
          },
          {
            'key': 'kor',
            'value_en': 'Korean',
            'active_flag': 'Y'
          },
          {
            'key': 'spv',
            'value_en': 'Kosli, Sambalpuri',
            'active_flag': 'Y'
          },
          {
            'key': 'kri',
            'value_en': 'Krio (Sierra Leone)',
            'active_flag': 'Y'
          },
          {
            'key': 'kru',
            'value_en': 'Kru',
            'active_flag': 'Y'
          },
          {
            'key': 'kur-kbr',
            'value_en': 'Kurdish Badini (Bahdini)',
            'active_flag': 'Y'
          },
          {
            'key': 'kur-ksr',
            'value_en': 'Kurdish Sorani',
            'active_flag': 'Y'
          },
          {
            'key': 'kur-kkr',
            'value_en': 'Kurdish kurmanji',
            'active_flag': 'Y'
          },
          {
            'key': 'kfr',
            'value_en': 'Kutchi',
            'active_flag': 'Y'
          },
          {
            'key': 'kir',
            'value_en': 'Kyrgyz',
            'active_flag': 'Y'
          },
          {
            'key': 'laj',
            'value_en': 'Lango',
            'active_flag': 'Y'
          },
          {
            'key': 'lav',
            'value_en': 'Latvian',
            'active_flag': 'Y'
          },
          {
            'key': 'lin',
            'value_en': 'Lingala',
            'active_flag': 'Y'
          },
          {
            'key': 'lit',
            'value_en': 'Lithuanian',
            'active_flag': 'Y'
          },
          {
            'key': 'lub',
            'value_en': 'Luba (Tshiluba)',
            'active_flag': 'Y'
          },
          {
            'key': 'lug',
            'value_en': 'Luganda',
            'active_flag': 'Y'
          },
          {
            'key': 'luo',
            'value_en': 'Luo',
            'active_flag': 'Y'
          },
          {
            'key': 'luo-lah',
            'value_en': 'Luo Acholi',
            'active_flag': 'Y'
          },
          {
            'key': 'luo-lky',
            'value_en': 'Luo Kenyan',
            'active_flag': 'Y'
          },
          {
            'key': 'luo-llg',
            'value_en': 'Luo Lango',
            'active_flag': 'Y'
          },
          {
            'key': 'xog',
            'value_en': 'Lusoga',
            'active_flag': 'Y'
          },
          {
            'key': 'mkd',
            'value_en': 'Macedonian',
            'active_flag': 'Y'
          },
          {
            'key': 'ara-mag',
            'value_en': 'Maghreb',
            'active_flag': 'Y'
          },
          {
            'key': 'msa',
            'value_en': 'Malay',
            'active_flag': 'Y'
          },
          {
            'key': 'mal',
            'value_en': 'Malayalam',
            'active_flag': 'Y'
          },
          {
            'key': 'mku',
            'value_en': 'Malinke',
            'active_flag': 'Y'
          },
          {
            'key': 'mlt',
            'value_en': 'Maltese',
            'active_flag': 'Y'
          },
          {
            'key': 'cmn',
            'value_en': 'Mandarin',
            'active_flag': 'Y'
          },
          {
            'key': 'mnk',
            'value_en': 'Mandinka',
            'active_flag': 'Y'
          },
          {
            'key': 'mar',
            'value_en': 'Marathi',
            'active_flag': 'Y'
          },
          {
            'key': 'myx',
            'value_en': 'Masaaba',
            'active_flag': 'Y'
          },
          {
            'key': 'men',
            'value_en': 'Mende',
            'active_flag': 'Y'
          },
          {
            'key': 'min',
            'value_en': 'Mina',
            'active_flag': 'Y'
          },
          {
            'key': 'ron-fmo',
            'value_en': 'Moldovan',
            'active_flag': 'Y'
          },
          {
            'key': 'mon',
            'value_en': 'Mongolian',
            'active_flag': 'Y'
          },
          {
            'key': 'mkw',
            'value_en': 'Monokutuba',
            'active_flag': 'Y'
          },
          {
            'key': 'cnr',
            'value_en': 'Montenegrin',
            'active_flag': 'Y'
          },
          {
            'key': 'nde',
            'value_en': 'Ndebele',
            'active_flag': 'Y'
          },
          {
            'key': 'nep',
            'value_en': 'Nepali',
            'active_flag': 'Y'
          },
          {
            'key': 'pcm',
            'value_en': 'Nigerian Pidgin',
            'active_flag': 'Y'
          },
          {
            'key': 'hno',
            'value_en': 'Northern Hindko',
            'active_flag': 'Y'
          },
          {
            'key': 'nor',
            'value_en': 'Norwegian',
            'active_flag': 'Y'
          },
          {
            'key': 'nyn',
            'value_en': 'Nyankole',
            'active_flag': 'Y'
          },
          {
            'key': 'nzi',
            'value_en': 'Nzima',
            'active_flag': 'Y'
          },
          {
            'key': 'orm',
            'value_en': 'Oromo',
            'active_flag': 'Y'
          },
          {
            'key': 'bfz',
            'value_en': 'Pahari',
            'active_flag': 'Y'
          },
          {
            'key': 'phr',
            'value_en': 'Pahari-Potwari',
            'active_flag': 'Y'
          },
          {
            'key': 'pam',
            'value_en': 'Pampangan',
            'active_flag': 'Y'
          },
          {
            'key': 'pag',
            'value_en': 'Pangasinan',
            'active_flag': 'Y'
          },
          {
            'key': 'pat',
            'value_en': 'Patois',
            'active_flag': 'Y'
          },
          {
            'key': 'pol',
            'value_en': 'Polish',
            'active_flag': 'Y'
          },
          {
            'key': 'por',
            'value_en': 'Portuguese',
            'active_flag': 'Y'
          },
          {
            'key': 'por-bra',
            'value_en': 'Portuguese (Brazil)',
            'active_flag': 'Y'
          },
          {
            'key': 'pan',
            'value_en': 'Punjabi',
            'active_flag': 'Y'
          },
          {
            'key': 'pan-pji',
            'value_en': 'Punjabi Indian',
            'active_flag': 'Y'
          },
          {
            'key': 'pan-pjp',
            'value_en': 'Punjabi Pakistani',
            'active_flag': 'Y'
          },
          {
            'key': 'pus',
            'value_en': 'Pushtu (Also Known As Pashto)',
            'active_flag': 'Y'
          },
          {
            'key': 'rmm',
            'value_en': 'Roma',
            'active_flag': 'Y'
          },
          {
            'key': 'ron',
            'value_en': 'Romanian',
            'active_flag': 'Y'
          },
          {
            'key': 'rom',
            'value_en': 'Romany',
            'active_flag': 'Y'
          },
          {
            'key': 'cgg',
            'value_en': 'Rukiga',
            'active_flag': 'Y'
          },
          {
            'key': 'nyo',
            'value_en': 'Runyoro',
            'active_flag': 'Y'
          },
          {
            'key': 'rus',
            'value_en': 'Russian',
            'active_flag': 'Y'
          },
          {
            'key': 'skt',
            'value_en': 'Sakata',
            'active_flag': 'Y'
          },
          {
            'key': 'skr',
            'value_en': 'Saraiki (Seraiki)',
            'active_flag': 'Y'
          },
          {
            'key': 'krn',
            'value_en': 'Sarpo',
            'active_flag': 'Y'
          },
          {
            'key': 'srp',
            'value_en': 'Serbian',
            'active_flag': 'Y'
          },
          {
            'key': 'hbs',
            'value_en': 'Serbo-Croatian',
            'active_flag': 'Y'
          },
          {
            'key': 'tsn',
            'value_en': 'Setswana',
            'active_flag': 'Y'
          },
          {
            'key': 'scl',
            'value_en': 'Shina',
            'active_flag': 'Y'
          },
          {
            'key': 'sna',
            'value_en': 'Shona',
            'active_flag': 'Y'
          },
          {
            'key': 'snd',
            'value_en': 'Sindhi',
            'active_flag': 'Y'
          },
          {
            'key': 'sin',
            'value_en': 'Sinhalese',
            'active_flag': 'Y'
          },
          {
            'key': 'slk',
            'value_en': 'Slovak',
            'active_flag': 'Y'
          },
          {
            'key': 'slv',
            'value_en': 'Slovenian',
            'active_flag': 'Y'
          },
          {
            'key': 'som',
            'value_en': 'Somali',
            'active_flag': 'Y'
          },
          {
            'key': 'snk',
            'value_en': 'Soninke',
            'active_flag': 'Y'
          },
          {
            'key': 'spa',
            'value_en': 'Spanish',
            'active_flag': 'Y'
          },
          {
            'key': 'spa-lat',
            'value_en': 'Spanish (Latin America)',
            'active_flag': 'Y'
          },
          {
            'key': 'sus',
            'value_en': 'Susu',
            'active_flag': 'Y'
          },
          {
            'key': 'swa',
            'value_en': 'Swahili',
            'active_flag': 'Y'
          },
          {
            'key': 'swa-sbv',
            'value_en': 'Swahili Bravanese',
            'active_flag': 'Y'
          },
          {
            'key': 'swa-skb',
            'value_en': 'Swahili Kibajuni',
            'active_flag': 'Y'
          },
          {
            'key': 'swe',
            'value_en': 'Swedish',
            'active_flag': 'Y'
          },
          {
            'key': 'syl',
            'value_en': 'Sylheti',
            'active_flag': 'Y'
          },
          {
            'key': 'tgl',
            'value_en': 'Tagalog',
            'active_flag': 'Y'
          },
          {
            'key': 'tai',
            'value_en': 'Taiwanese',
            'active_flag': 'Y'
          },
          {
            'key': 'tgk',
            'value_en': 'Tajik',
            'active_flag': 'Y'
          },
          {
            'key': 'tam',
            'value_en': 'Tamil',
            'active_flag': 'Y'
          },
          {
            'key': 'tel',
            'value_en': 'Telugu',
            'active_flag': 'Y'
          },
          {
            'key': 'tem',
            'value_en': 'Temne',
            'active_flag': 'Y'
          },
          {
            'key': 'tet',
            'value_en': 'Tetum',
            'active_flag': 'Y'
          },
          {
            'key': 'tha',
            'value_en': 'Thai',
            'active_flag': 'Y'
          },
          {
            'key': 'bod',
            'value_en': 'Tibetan',
            'active_flag': 'Y'
          },
          {
            'key': 'tig',
            'value_en': 'Tigre',
            'active_flag': 'Y'
          },
          {
            'key': 'tir',
            'value_en': 'Tigrinya',
            'active_flag': 'Y'
          },
          {
            'key': 'ttj',
            'value_en': 'Tooro',
            'active_flag': 'Y'
          },
          {
            'key': 'don',
            'value_en': 'Toura',
            'active_flag': 'Y'
          },
          {
            'key': 'tur',
            'value_en': 'Turkish',
            'active_flag': 'Y'
          },
          {
            'key': 'tuk',
            'value_en': 'Turkmen',
            'active_flag': 'Y'
          },
          {
            'key': 'twi',
            'value_en': 'Twi',
            'active_flag': 'Y'
          },
          {
            'key': 'uig',
            'value_en': 'Uighur',
            'active_flag': 'Y'
          },
          {
            'key': 'ukr',
            'value_en': 'Ukrainian',
            'active_flag': 'Y'
          },
          {
            'key': 'urd',
            'value_en': 'Urdu',
            'active_flag': 'Y'
          },
          {
            'key': 'urh',
            'value_en': 'Urhobo',
            'active_flag': 'Y'
          },
          {
            'key': 'uzb',
            'value_en': 'Uzbek',
            'active_flag': 'Y'
          },
          {
            'key': 'vie',
            'value_en': 'Vietnamese',
            'active_flag': 'Y'
          },
          {
            'key': 'vsa',
            'value_en': 'Visayan',
            'active_flag': 'Y'
          },
          {
            'key': 'cym',
            'value_en': 'Welsh',
            'active_flag': 'Y'
          },
          {
            'key': 'nld-nwf',
            'value_en': 'West Flemish',
            'active_flag': 'Y'
          },
          {
            'key': 'wol',
            'value_en': 'Wolof',
            'active_flag': 'Y'
          },
          {
            'key': 'xho',
            'value_en': 'Xhosa',
            'active_flag': 'Y'
          },
          {
            'key': 'yid',
            'value_en': 'Yiddish',
            'active_flag': 'Y'
          },
          {
            'key': 'yor',
            'value_en': 'Yoruba',
            'active_flag': 'Y'
          },
          {
            'key': 'zag',
            'value_en': 'Zaghawa',
            'active_flag': 'Y'
          },
          {
            'key': 'zza',
            'value_en': 'Zaza',
            'active_flag': 'Y'
          },
          {
            'key': 'zul',
            'value_en': 'Zulu',
            'active_flag': 'Y'
          }
        ]
      }
    };
  });
}

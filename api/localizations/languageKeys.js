const languageList = [
  { key: "af", name: "Afrikaans" },
  { key: "sq", name: "Albanian" },
  { key: "an", name: "Aragonese" },
  { key: "ar", name: "Arabic (Standard)" },
  { key: "ar-dz", name: "Arabic (Algeria)" },
  { key: "ar-bh", name: "Arabic (Bahrain)" },
  { key: "ar-eg", name: "Arabic (Egypt)" },
  { key: "ar-iq", name: "Arabic (Iraq)" },
  { key: "ar-jo", name: "Arabic (Jordan)" },
  { key: "ar-kw", name: "Arabic (Kuwait)" },
  { key: "ar-lb", name: "Arabic (Lebanon)" },
  { key: "ar-ly", name: "Arabic (Libya)" },
  { key: "ar-ma", name: "Arabic (Morocco)" },
  { key: "ar-om", name: "Arabic (Oman)" },
  { key: "ar-qa", name: "Arabic (Qatar)" },
  { key: "ar-sa", name: "Arabic (Saudi Arabia)" },
  { key: "ar-sy", name: "Arabic (Syria)" },
  { key: "ar-tn", name: "Arabic (Tunisia)" },
  { key: "ar-ae", name: "Arabic (U.A.E.)" },
  { key: "ar-ye", name: "Arabic (Yemen)" },
  { key: "hy", name: "Armenian" },
  { key: "as", name: "Assamese" },
  { key: "ast", name: "Asturian" },
  { key: "az", name: "Azerbaijani" },
  { key: "eu", name: "Basque" },
  { key: "bg", name: "Bulgarian" },
  { key: "be", name: "Belarusian" },
  { key: "bn", name: "Bengali" },
  { key: "bs", name: "Bosnian" },
  { key: "br", name: "Breton" },
  { key: "bg", name: "Bulgarian" },
  { key: "my", name: "Burmese" },
  { key: "ca", name: "Catalan" },
  { key: "ch", name: "Chamorro" },
  { key: "ce", name: "Chechen" },
  { key: "zh", name: "Chinese" },
  { key: "zh-hk", name: "Chinese (Hong Kong)" },
  { key: "zh-cn", name: "Chinese (PRC)" },
  { key: "zh-sg", name: "Chinese (Singapore)" },
  { key: "zh-tw", name: "Chinese (Taiwan)" },
  { key: "cv", name: "Chuvash" },
  { key: "co", name: "Corsican" },
  { key: "cr", name: "Cree" },
  { key: "hr", name: "Croatian" },
  { key: "cs", name: "Czech" },
  { key: "da", name: "Danish" },
  { key: "nl", name: "Dutch (Standard)" },
  { key: "nl-be", name: "Dutch (Belgian)" },
  { key: "en-au", name: "English (Australia)" },
  { key: "en-bz", name: "English (Belize)" },
  { key: "en-ca", name: "English (Canada)" },
  { key: "en-ie", name: "English (Ireland)" },
  { key: "en-jm", name: "English (Jamaica)" },
  { key: "en-nz", name: "English (New Zealand)" },
  { key: "en-ph", name: "English (Philippines)" },
  { key: "en-za", name: "English (South Africa)" },
  { key: "en-tt", name: "English (Trinidad & Tobago)" },
  { key: "en-gb", name: "English (United Kingdom)" },
  { key: "en-us", name: "English (United States)" },
  { key: "en-zw", name: "English (Zimbabwe)" },
  { key: "eo", name: "Esperanto" },
  { key: "et", name: "Estonian" },
  { key: "fo", name: "Faeroese" },
  { key: "fa", name: "Farsi" },
  { key: "fj", name: "Fijian" },
  { key: "fi", name: "Finnish" },
  { key: "fr", name: "French (Standard)" },
  { key: "fr-be", name: "French (Belgium)" },
  { key: "fr-ca", name: "French (Canada)" },
  { key: "fr-fr", name: "French (France)" },
  { key: "fr-lu", name: "French (Luxembourg)" },
  { key: "fr-mc", name: "French (Monaco)" },
  { key: "fr-ch", name: "French (Switzerland)" },
  { key: "fy", name: "Frisian" },
  { key: "fur", name: "Friulian" },
  { key: "gd", name: "Gaelic (Scots)" },
  { key: "gd-ie", name: "Gaelic (Irish)" },
  { key: "gl", name: "Galacian" },
  { key: "ka", name: "Georgian" },
  { key: "de", name: "German (Standard)" },
  { key: "de-at", name: "German (Austria)" },
  { key: "de-de", name: "German (Germany)" },
  { key: "de-li", name: "German (Liechtenstein)" },
  { key: "de-lu", name: "German (Luxembourg)" },
  { key: "de-ch", name: "German (Switzerland)" },
  { key: "el", name: "Greek" },
  { key: "gu", name: "Gujurati" },
  { key: "ht", name: "Haitian" },
  { key: "he", name: "Hebrew" },
  { key: "hi", name: "Hindi" },
  { key: "hu", name: "Hungarian" },
  { key: "is", name: "Icelandic" },
  { key: "id", name: "Indonesian" },
  { key: "iu", name: "Inuktitut" },
  { key: "ga", name: "Irish" },
  { key: "it", name: "Italian (Standard)" },
  { key: "it-ch", name: "Italian (Switzerland)" },
  { key: "ja", name: "Japanese" },
  { key: "kn", name: "Kannada" },
  { key: "ks", name: "Kashmiri" },
  { key: "kk", name: "Kazakh" },
  { key: "km", name: "Khmer" },
  { key: "ky", name: "Kirghiz" },
  { key: "tlh", name: "Klingon" },
  { key: "ko", name: "Korean" },
  { key: "ko-kp", name: "Korean (North Korea)" },
  { key: "ko-kr", name: "Korean (South Korea)" },
  { key: "la", name: "Latin" },
  { key: "lv", name: "Latvian" },
  { key: "lt", name: "Lithuanian" },
  { key: "lb", name: "Luxembourgish" },
  { key: "mk", name: "FYRO Macedonian" },
  { key: "ms", name: "Malay" },
  { key: "ml", name: "Malayalam" },
  { key: "mt", name: "Maltese" },
  { key: "mi", name: "Maori" },
  { key: "mr", name: "Marathi" },
  { key: "mo", name: "Moldavian" },
  { key: "nv", name: "Navajo" },
  { key: "ng", name: "Ndonga" },
  { key: "ne", name: "Nepali" },
  { key: "no", name: "Norwegian" },
  { key: "nb", name: "Norwegian (Bokmal)" },
  { key: "nn", name: "Norwegian (Nynorsk)" },
  { key: "oc", name: "Occitan" },
  { key: "or", name: "Oriya" },
  { key: "om", name: "Oromo" },
  { key: "fa", name: "Persian" },
  { key: "fa-ir", name: "Persian/Iran" },
  { key: "pl", name: "Polish" },
  { key: "pt", name: "Portuguese" },
  { key: "pt-br", name: "Portuguese (Brazil)" },
  { key: "pa", name: "Punjabi" },
  { key: "pa-in", name: "Punjabi (India)" },
  { key: "pa-pk", name: "Punjabi (Pakistan)" },
  { key: "qu", name: "Quechua" },
  { key: "rm", name: "Rhaeto-Romanic" },
  { key: "ro", name: "Romanian" },
  { key: "ro-mo", name: "Romanian (Moldavia)" },
  { key: "ru", name: "Russian" },
  { key: "ru-mo", name: "Russian (Moldavia)" },
  { key: "sz", name: "Sami (Lappish)" },
  { key: "sg", name: "Sango" },
  { key: "sa", name: "Sanskrit" },
  { key: "sc", name: "Sardinian" },
  { key: "gd", name: "Scots Gaelic" },
  { key: "sd", name: "Sindhi" },
  { key: "si", name: "Singhalese" },
  { key: "sr", name: "Serbian" },
  { key: "sk", name: "Slovak" },
  { key: "sl", name: "Slovenian" },
  { key: "so", name: "Somani" },
  { key: "sb", name: "Sorbian" },
  { key: "es", name: "Spanish" },
  { key: "es-ar", name: "Spanish (Argentina)" },
  { key: "es-bo", name: "Spanish (Bolivia)" },
  { key: "es-cl", name: "Spanish (Chile)" },
  { key: "es-co", name: "Spanish (Colombia)" },
  { key: "es-cr", name: "Spanish (Costa Rica)" },
  { key: "es-do", name: "Spanish (Dominican Republic)" },
  { key: "es-ec", name: "Spanish (Ecuador)" },
  { key: "es-sv", name: "Spanish (El Salvador)" },
  { key: "es-gt", name: "Spanish (Guatemala)" },
  { key: "es-hn", name: "Spanish (Honduras)" },
  { key: "es-mx", name: "Spanish (Mexico)" },
  { key: "es-ni", name: "Spanish (Nicaragua)" },
  { key: "es-pa", name: "Spanish (Panama)" },
  { key: "es-py", name: "Spanish (Paraguay)" },
  { key: "es-pe", name: "Spanish (Peru)" },
  { key: "es-pr", name: "Spanish (Puerto Rico)" },
  { key: "es-es", name: "Spanish (Spain)" },
  { key: "es-uy", name: "Spanish (Uruguay)" },
  { key: "es-ve", name: "Spanish (Venezuela)" },
  { key: "sx", name: "Sutu" },
  { key: "sw", name: "Swahili" },
  { key: "sv", name: "Swedish" },
  { key: "sv-fi", name: "Swedish (Finland)" },
  { key: "sv-sv", name: "Swedish (Sweden)" },
  { key: "ta", name: "Tamil" },
  { key: "tt", name: "Tatar" },
  { key: "te", name: "Teluga" },
  { key: "th", name: "Thai" },
  { key: "tig", name: "Tigre" },
  { key: "ts", name: "Tsonga" },
  { key: "tn", name: "Tswana" },
  { key: "tr", name: "Turkish" },
  { key: "tk", name: "Turkmen" },
  { key: "uk", name: "Ukrainian" },
  { key: "hsb", name: "Upper Sorbian" },
  { key: "ur", name: "Urdu" },
  { key: "ve", name: "Venda" },
  { key: "vi", name: "Vietnamese" },
  { key: "vo", name: "Volapuk" },
  { key: "wa", name: "Walloon" },
  { key: "cy", name: "Welsh" },
  { key: "xh", name: "Xhosa" },
  { key: "ji", name: "Yiddish" },
  { key: "zu", name: "Zulu" },
];

module.exports = languageList;

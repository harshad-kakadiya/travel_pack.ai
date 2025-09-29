import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

interface Country {
  code: string;
  label: string;
}

interface CountrySelectorProps {
  selected?: Country;
  onSelect: (country: Country) => void;
}

// Common countries for quick selection
const commonCountries: Country[] = [
  { code: 'US', label: 'United States' },
  { code: 'CA', label: 'Canada' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'JP', label: 'Japan' },
  { code: 'BR', label: 'Brazil' },
];

// All countries (subset for demo)
const allCountries: Country[] = [
  { code: 'AD', label: 'Andorra' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'AF', label: 'Afghanistan' },
  { code: 'AG', label: 'Antigua and Barbuda' },
  { code: 'AI', label: 'Anguilla' },
  { code: 'AL', label: 'Albania' },
  { code: 'AM', label: 'Armenia' },
  { code: 'AO', label: 'Angola' },
  { code: 'AQ', label: 'Antarctica' },
  { code: 'AR', label: 'Argentina' },
  { code: 'AS', label: 'American Samoa' },
  { code: 'AT', label: 'Austria' },
  { code: 'AU', label: 'Australia' },
  { code: 'AW', label: 'Aruba' },
  { code: 'AX', label: 'Åland Islands' },
  { code: 'AZ', label: 'Azerbaijan' },
  { code: 'BA', label: 'Bosnia and Herzegovina' },
  { code: 'BB', label: 'Barbados' },
  { code: 'BD', label: 'Bangladesh' },
  { code: 'BE', label: 'Belgium' },
  { code: 'BF', label: 'Burkina Faso' },
  { code: 'BG', label: 'Bulgaria' },
  { code: 'BH', label: 'Bahrain' },
  { code: 'BI', label: 'Burundi' },
  { code: 'BJ', label: 'Benin' },
  { code: 'BL', label: 'Saint Barthélemy' },
  { code: 'BM', label: 'Bermuda' },
  { code: 'BN', label: 'Brunei Darussalam' },
  { code: 'BO', label: 'Bolivia' },
  { code: 'BQ', label: 'Bonaire, Sint Eustatius and Saba' },
  { code: 'BR', label: 'Brazil' },
  { code: 'BS', label: 'Bahamas' },
  { code: 'BT', label: 'Bhutan' },
  { code: 'BV', label: 'Bouvet Island' },
  { code: 'BW', label: 'Botswana' },
  { code: 'BY', label: 'Belarus' },
  { code: 'BZ', label: 'Belize' },
  { code: 'CA', label: 'Canada' },
  { code: 'CC', label: 'Cocos (Keeling) Islands' },
  { code: 'CD', label: 'Congo, Democratic Republic of the' },
  { code: 'CF', label: 'Central African Republic' },
  { code: 'CG', label: 'Congo' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'CI', label: 'Côte d\'Ivoire' },
  { code: 'CK', label: 'Cook Islands' },
  { code: 'CL', label: 'Chile' },
  { code: 'CM', label: 'Cameroon' },
  { code: 'CN', label: 'China' },
  { code: 'CO', label: 'Colombia' },
  { code: 'CR', label: 'Costa Rica' },
  { code: 'CU', label: 'Cuba' },
  { code: 'CV', label: 'Cabo Verde' },
  { code: 'CW', label: 'Curaçao' },
  { code: 'CX', label: 'Christmas Island' },
  { code: 'CY', label: 'Cyprus' },
  { code: 'CZ', label: 'Czechia' },
  { code: 'DE', label: 'Germany' },
  { code: 'DJ', label: 'Djibouti' },
  { code: 'DK', label: 'Denmark' },
  { code: 'DM', label: 'Dominica' },
  { code: 'DO', label: 'Dominican Republic' },
  { code: 'DZ', label: 'Algeria' },
  { code: 'EC', label: 'Ecuador' },
  { code: 'EE', label: 'Estonia' },
  { code: 'EG', label: 'Egypt' },
  { code: 'EH', label: 'Western Sahara' },
  { code: 'ER', label: 'Eritrea' },
  { code: 'ES', label: 'Spain' },
  { code: 'ET', label: 'Ethiopia' },
  { code: 'FI', label: 'Finland' },
  { code: 'FJ', label: 'Fiji' },
  { code: 'FK', label: 'Falkland Islands (Malvinas)' },
  { code: 'FM', label: 'Micronesia' },
  { code: 'FO', label: 'Faroe Islands' },
  { code: 'FR', label: 'France' },
  { code: 'GA', label: 'Gabon' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'GD', label: 'Grenada' },
  { code: 'GE', label: 'Georgia' },
  { code: 'GF', label: 'French Guiana' },
  { code: 'GG', label: 'Guernsey' },
  { code: 'GH', label: 'Ghana' },
  { code: 'GI', label: 'Gibraltar' },
  { code: 'GL', label: 'Greenland' },
  { code: 'GM', label: 'Gambia' },
  { code: 'GN', label: 'Guinea' },
  { code: 'GP', label: 'Guadeloupe' },
  { code: 'GQ', label: 'Equatorial Guinea' },
  { code: 'GR', label: 'Greece' },
  { code: 'GS', label: 'South Georgia and the South Sandwich Islands' },
  { code: 'GT', label: 'Guatemala' },
  { code: 'GU', label: 'Guam' },
  { code: 'GW', label: 'Guinea-Bissau' },
  { code: 'GY', label: 'Guyana' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'HM', label: 'Heard Island and McDonald Islands' },
  { code: 'HN', label: 'Honduras' },
  { code: 'HR', label: 'Croatia' },
  { code: 'HT', label: 'Haiti' },
  { code: 'HU', label: 'Hungary' },
  { code: 'ID', label: 'Indonesia' },
  { code: 'IE', label: 'Ireland' },
  { code: 'IL', label: 'Israel' },
  { code: 'IM', label: 'Isle of Man' },
  { code: 'IN', label: 'India' },
  { code: 'IO', label: 'British Indian Ocean Territory' },
  { code: 'IQ', label: 'Iraq' },
  { code: 'IR', label: 'Iran' },
  { code: 'IS', label: 'Iceland' },
  { code: 'IT', label: 'Italy' },
  { code: 'JE', label: 'Jersey' },
  { code: 'JM', label: 'Jamaica' },
  { code: 'JO', label: 'Jordan' },
  { code: 'JP', label: 'Japan' },
  { code: 'KE', label: 'Kenya' },
  { code: 'KG', label: 'Kyrgyzstan' },
  { code: 'KH', label: 'Cambodia' },
  { code: 'KI', label: 'Kiribati' },
  { code: 'KM', label: 'Comoros' },
  { code: 'KN', label: 'Saint Kitts and Nevis' },
  { code: 'KP', label: 'Korea, Democratic People\'s Republic of' },
  { code: 'KR', label: 'Korea, Republic of' },
  { code: 'KW', label: 'Kuwait' },
  { code: 'KY', label: 'Cayman Islands' },
  { code: 'KZ', label: 'Kazakhstan' },
  { code: 'LA', label: 'Lao People\'s Democratic Republic' },
  { code: 'LB', label: 'Lebanon' },
  { code: 'LC', label: 'Saint Lucia' },
  { code: 'LI', label: 'Liechtenstein' },
  { code: 'LK', label: 'Sri Lanka' },
  { code: 'LR', label: 'Liberia' },
  { code: 'LS', label: 'Lesotho' },
  { code: 'LT', label: 'Lithuania' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'LV', label: 'Latvia' },
  { code: 'LY', label: 'Libya' },
  { code: 'MA', label: 'Morocco' },
  { code: 'MC', label: 'Monaco' },
  { code: 'MD', label: 'Moldova' },
  { code: 'ME', label: 'Montenegro' },
  { code: 'MF', label: 'Saint Martin (French part)' },
  { code: 'MG', label: 'Madagascar' },
  { code: 'MH', label: 'Marshall Islands' },
  { code: 'MK', label: 'North Macedonia' },
  { code: 'ML', label: 'Mali' },
  { code: 'MM', label: 'Myanmar' },
  { code: 'MN', label: 'Mongolia' },
  { code: 'MO', label: 'Macao' },
  { code: 'MP', label: 'Northern Mariana Islands' },
  { code: 'MQ', label: 'Martinique' },
  { code: 'MR', label: 'Mauritania' },
  { code: 'MS', label: 'Montserrat' },
  { code: 'MT', label: 'Malta' },
  { code: 'MU', label: 'Mauritius' },
  { code: 'MV', label: 'Maldives' },
  { code: 'MW', label: 'Malawi' },
  { code: 'MX', label: 'Mexico' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'MZ', label: 'Mozambique' },
  { code: 'NA', label: 'Namibia' },
  { code: 'NC', label: 'New Caledonia' },
  { code: 'NE', label: 'Niger' },
  { code: 'NF', label: 'Norfolk Island' },
  { code: 'NG', label: 'Nigeria' },
  { code: 'NI', label: 'Nicaragua' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'NO', label: 'Norway' },
  { code: 'NP', label: 'Nepal' },
  { code: 'NR', label: 'Nauru' },
  { code: 'NU', label: 'Niue' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'OM', label: 'Oman' },
  { code: 'PA', label: 'Panama' },
  { code: 'PE', label: 'Peru' },
  { code: 'PF', label: 'French Polynesia' },
  { code: 'PG', label: 'Papua New Guinea' },
  { code: 'PH', label: 'Philippines' },
  { code: 'PK', label: 'Pakistan' },
  { code: 'PL', label: 'Poland' },
  { code: 'PM', label: 'Saint Pierre and Miquelon' },
  { code: 'PN', label: 'Pitcairn' },
  { code: 'PR', label: 'Puerto Rico' },
  { code: 'PS', label: 'Palestine, State of' },
  { code: 'PT', label: 'Portugal' },
  { code: 'PW', label: 'Palau' },
  { code: 'PY', label: 'Paraguay' },
  { code: 'QA', label: 'Qatar' },
  { code: 'RE', label: 'Réunion' },
  { code: 'RO', label: 'Romania' },
  { code: 'RS', label: 'Serbia' },
  { code: 'RU', label: 'Russian Federation' },
  { code: 'RW', label: 'Rwanda' },
  { code: 'SA', label: 'Saudi Arabia' },
  { code: 'SB', label: 'Solomon Islands' },
  { code: 'SC', label: 'Seychelles' },
  { code: 'SD', label: 'Sudan' },
  { code: 'SE', label: 'Sweden' },
  { code: 'SG', label: 'Singapore' },
  { code: 'SH', label: 'Saint Helena, Ascension and Tristan da Cunha' },
  { code: 'SI', label: 'Slovenia' },
  { code: 'SJ', label: 'Svalbard and Jan Mayen' },
  { code: 'SK', label: 'Slovakia' },
  { code: 'SL', label: 'Sierra Leone' },
  { code: 'SM', label: 'San Marino' },
  { code: 'SN', label: 'Senegal' },
  { code: 'SO', label: 'Somalia' },
  { code: 'SR', label: 'Suriname' },
  { code: 'SS', label: 'South Sudan' },
  { code: 'ST', label: 'Sao Tome and Principe' },
  { code: 'SV', label: 'El Salvador' },
  { code: 'SX', label: 'Sint Maarten (Dutch part)' },
  { code: 'SY', label: 'Syrian Arab Republic' },
  { code: 'SZ', label: 'Eswatini' },
  { code: 'TC', label: 'Turks and Caicos Islands' },
  { code: 'TD', label: 'Chad' },
  { code: 'TF', label: 'French Southern Territories' },
  { code: 'TG', label: 'Togo' },
  { code: 'TH', label: 'Thailand' },
  { code: 'TJ', label: 'Tajikistan' },
  { code: 'TK', label: 'Tokelau' },
  { code: 'TL', label: 'Timor-Leste' },
  { code: 'TM', label: 'Turkmenistan' },
  { code: 'TN', label: 'Tunisia' },
  { code: 'TO', label: 'Tonga' },
  { code: 'TR', label: 'Turkey' },
  { code: 'TT', label: 'Trinidad and Tobago' },
  { code: 'TV', label: 'Tuvalu' },
  { code: 'TW', label: 'Taiwan' },
  { code: 'TZ', label: 'Tanzania' },
  { code: 'UA', label: 'Ukraine' },
  { code: 'UG', label: 'Uganda' },
  { code: 'UM', label: 'United States Minor Outlying Islands' },
  { code: 'US', label: 'United States' },
  { code: 'UY', label: 'Uruguay' },
  { code: 'UZ', label: 'Uzbekistan' },
  { code: 'VA', label: 'Holy See (Vatican City State)' },
  { code: 'VC', label: 'Saint Vincent and the Grenadines' },
  { code: 'VE', label: 'Venezuela' },
  { code: 'VG', label: 'Virgin Islands, British' },
  { code: 'VI', label: 'Virgin Islands, U.S.' },
  { code: 'VN', label: 'Viet Nam' },
  { code: 'VU', label: 'Vanuatu' },
  { code: 'WF', label: 'Wallis and Futuna' },
  { code: 'WS', label: 'Samoa' },
  { code: 'YE', label: 'Yemen' },
  { code: 'YT', label: 'Mayotte' },
  { code: 'ZA', label: 'South Africa' },
  { code: 'ZM', label: 'Zambia' },
  { code: 'ZW', label: 'Zimbabwe' }
];

export function CountrySelector({ selected, onSelect }: CountrySelectorProps) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [isEditing, setIsEditing] = useState(!selected);

  const filteredCountries = useMemo(() => {
    const countries = showAll ? allCountries : commonCountries;
    if (!search) return countries;
    
    return countries.filter(country =>
      country.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, showAll]);

  const handleCountrySelect = (country: Country) => {
    onSelect(country);
    setIsEditing(false);
    setSearch('');
    setShowAll(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSearch('');
    setShowAll(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Passport Country *
      </label>
      
      {selected && !isEditing && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div 
            className="cursor-pointer text-blue-900 font-medium hover:text-blue-700 transition-colors"
            onClick={handleEdit}
          >
            {selected.label}
            <span className="text-blue-600 text-sm ml-2">(click to change)</span>
          </div>
        </div>
      )}

      {(!selected || isEditing) && (
        <div className="space-y-4">
          <div className="relative">
            <div className="relative z-50" data-testid="passport-country-trigger">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search countries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            </div>
          </div>

          {!showAll && !search && (
            <div className="relative z-50">
              <p className="text-sm text-gray-600 mb-3">Popular countries:</p>
              <div className="grid grid-cols-2 gap-2">
                {commonCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className="text-left p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">{country.label}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Show all countries
              </button>
            </div>
          )}

          {(showAll || search) && (
            <div role="listbox" aria-label="Passport issuing country" className="relative z-50 max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  role="option" className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{country.label}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="p-3 text-center text-gray-500 text-sm">
                  No countries found matching "{search}"
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
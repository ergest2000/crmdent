export type CountryData = {
  code: string;
  flag: string;
  dialCode: string;
  name: { sq: string; en: string; it: string };
  cities: string[];
};

export const countries: CountryData[] = [
  {
    code: "AL", flag: "🇦🇱", dialCode: "+355",
    name: { sq: "Shqipëri", en: "Albania", it: "Albania" },
    cities: ["Tiranë", "Durrës", "Vlorë", "Shkodër", "Elbasan", "Korçë", "Fier", "Berat", "Lushnjë", "Kavajë", "Pogradec", "Lezhë", "Kukës", "Sarandë", "Gjirokastër", "Peshkopi", "Burrel", "Gramsh", "Librazhd", "Tepelenë"],
  },
  {
    code: "XK", flag: "🇽🇰", dialCode: "+383",
    name: { sq: "Kosovë", en: "Kosovo", it: "Kosovo" },
    cities: ["Prishtinë", "Prizren", "Pejë", "Mitrovicë", "Gjilan", "Ferizaj", "Gjakovë", "Podujevë", "Vushtrri", "Suharekë", "Rahovec", "Drenas", "Lipjan", "Malishevë", "Kamenicë", "Deçan", "Istog", "Klinë", "Skenderaj", "Viti"],
  },
  {
    code: "MK", flag: "🇲🇰", dialCode: "+389",
    name: { sq: "Maqedoni e Veriut", en: "North Macedonia", it: "Macedonia del Nord" },
    cities: ["Shkup", "Tetovë", "Kumanovë", "Gostivar", "Manastir", "Ohër", "Prilep", "Veles", "Shtip", "Strumicë", "Kërçovë", "Strugë"],
  },
  {
    code: "ME", flag: "🇲🇪", dialCode: "+382",
    name: { sq: "Mal i Zi", en: "Montenegro", it: "Montenegro" },
    cities: ["Podgoricë", "Nikshiq", "Ulqin", "Tuz", "Tivar", "Budva", "Kotor", "Herceg Novi", "Plevla"],
  },
  {
    code: "IT", flag: "🇮🇹", dialCode: "+39",
    name: { sq: "Itali", en: "Italy", it: "Italia" },
    cities: ["Roma", "Milano", "Napoli", "Torino", "Firenze", "Bologna", "Bari", "Palermo", "Genova", "Venezia", "Verona", "Padova", "Brescia", "Catania", "Modena", "Parma", "Perugia", "Cagliari", "Trieste", "Reggio Calabria"],
  },
  {
    code: "DE", flag: "🇩🇪", dialCode: "+49",
    name: { sq: "Gjermani", en: "Germany", it: "Germania" },
    cities: ["Berlin", "München", "Hamburg", "Frankfurt", "Köln", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig", "Bremen", "Dresden", "Hannover", "Nürnberg"],
  },
  {
    code: "CH", flag: "🇨🇭", dialCode: "+41",
    name: { sq: "Zvicër", en: "Switzerland", it: "Svizzera" },
    cities: ["Zürich", "Genf", "Basel", "Bern", "Lausanne", "Winterthur", "Luzern", "St. Gallen"],
  },
  {
    code: "AT", flag: "🇦🇹", dialCode: "+43",
    name: { sq: "Austri", en: "Austria", it: "Austria" },
    cities: ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"],
  },
  {
    code: "GR", flag: "🇬🇷", dialCode: "+30",
    name: { sq: "Greqi", en: "Greece", it: "Grecia" },
    cities: ["Athinë", "Selanik", "Patras", "Heraklion", "Larisa", "Volos", "Janinë", "Kavala"],
  },
  {
    code: "TR", flag: "🇹🇷", dialCode: "+90",
    name: { sq: "Turqi", en: "Turkey", it: "Turchia" },
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep"],
  },
  {
    code: "GB", flag: "🇬🇧", dialCode: "+44",
    name: { sq: "Britani e Madhe", en: "United Kingdom", it: "Regno Unito" },
    cities: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Edinburgh", "Bristol"],
  },
  {
    code: "US", flag: "🇺🇸", dialCode: "+1",
    name: { sq: "SHBA", en: "United States", it: "Stati Uniti" },
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  },
];

export const roles = [
  { value: "administrator", label: { sq: "Administrator", en: "Administrator", it: "Amministratore" } },
  { value: "manager", label: { sq: "Menaxher", en: "Manager", it: "Manager" } },
  { value: "dentist", label: { sq: "Dentist", en: "Dentist", it: "Dentista" } },
  { value: "receptionist", label: { sq: "Receptionist", en: "Receptionist", it: "Receptionist" } },
  { value: "staff", label: { sq: "Staff", en: "Staff", it: "Staff" } },
];

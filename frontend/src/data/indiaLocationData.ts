export interface LocationData {
  [state: string]: {
    [district: string]: string[];
  };
}

export const indiaLocations: LocationData = {
  "Andhra Pradesh": {
    "Anantapur": ["Anantapur", "Dharmavaram", "Hindupur", "Kadiri", "Penukonda", "Rayadurg", "Tadipatri"],
    "Chittoor": ["Chittoor", "Madanapalle", "Tirupati", "Punganur", "Palamaner", "Kuppam", "Srikalahasti"],
    "East Godavari": ["Kakinada", "Rajamahendravaram", "Amalapuram", "Ramachandrapuram", "Peddapuram", "Tuni"],
    "Guntur": ["Guntur", "Tenali", "Narasaraopet", "Mangalagiri", "Bapatla", "Vinukonda", "Macherla"],
    "Krishna": ["Vijayawada", "Machilipatnam", "Gudivada", "Nuzvid", "Jaggaiahpet", "Vuyyuru"],
    "Kurnool": ["Kurnool", "Nandyal", "Adoni", "Yemmiganur", "Dhone", "Allagadda"],
    "Nellore": ["Nellore", "Kavali", "Gudur", "Atmakur", "Sullurpeta", "Venkatagiri"],
    "Prakasam": ["Ongole", "Markapur", "Chirala", "Kandukur", "Darsi", "Giddalur"],
    "Srikakulam": ["Srikakulam", "Palasa", "Tekkali", "Narasannapeta", "Amadalavalasa", "Ichapuram"],
    "Visakhapatnam": ["Visakhapatnam", "Anakapalle", "Bheemunipatnam", "Narsipatnam", "Yelamanchili", "Paderu"],
    "Vizianagaram": ["Vizianagaram", "Bobbili", "Parvathipuram", "Rajam", "Nellimarla", "Salur"],
    "West Godavari": ["Eluru", "Bhimavaram", "Tadepalligudem", "Tanuku", "Narasapuram", "Palacole"],
    "YSR Kadapa": ["Kadapa", "Proddatur", "Rajampet", "Jammalamadugu", "Mydukur", "Badvel"]
  },
  "Arunachal Pradesh": {
    "Tawang": ["Tawang", "Lumla", "Jang"],
    "West Kameng": ["Bomdila", "Rupa", "Kalaktang", "Dirang"],
    "East Kameng": ["Seppa", "Chayangtajo", "Pipu"],
    "Papum Pare": ["Itanagar", "Naharlagun", "Doimukh", "Balijan"],
    "Lower Subansiri": ["Ziro", "Yachuli", "Raga"],
    "Upper Subansiri": ["Daporijo", "Dumporijo", "Taliha"],
    "West Siang": ["Aalo", "Likabali", "Basar"],
    "East Siang": ["Pasighat", "Mebo", "Ruksin"],
    "Changlang": ["Changlang", "Nampong", "Miao", "Bordumsa"],
    "Tirap": ["Khonsa", "Deomali", "Lazu"]
  },
  "Assam": {
    "Baksa": ["Mushalpur", "Tamulpur", "Baganpara"],
    "Barpeta": ["Barpeta", "Howly", "Sarthebari", "Mandia", "Bajali"],
    "Cachar": ["Silchar", "Lakhipur", "Katigorah", "Sonai"],
    "Darrang": ["Mangaldoi", "Sipajhar", "Dalgaon", "Kalaigaon"],
    "Dhubri": ["Dhubri", "Bilasipara", "Chapar", "Gauripur"],
    "Dibrugarh": ["Dibrugarh", "Naharkatia", "Tengakhat", "Lahowal"],
    "Goalpara": ["Goalpara", "Lakhipur", "Balijana", "Dudhnoi"],
    "Golaghat": ["Golaghat", "Bokakhat", "Dergaon", "Morangi"],
    "Jorhat": ["Jorhat", "Mariani", "Teok", "Titabor"],
    "Kamrup": ["Guwahati", "Amingaon", "Rangia", "Kamalpur", "Hajo"],
    "Kamrup Metropolitan": ["Guwahati", "Dispur", "Chandrapur", "North Guwahati"],
    "Karbi Anglong": ["Diphu", "Bokajan", "Howraghat"],
    "Karimganj": ["Karimganj", "Badarpur", "Patharkandi", "Ratabari"],
    "Lakhimpur": ["North Lakhimpur", "Dhakuakhana", "Bihpuria"],
    "Nagaon": ["Nagaon", "Hojai", "Lanka", "Kaliabor", "Raha"],
    "Nalbari": ["Nalbari", "Tihu", "Barkhetri", "Mukalmua"],
    "Sivasagar": ["Sivasagar", "Nazira", "Amguri", "Sonari"],
    "Sonitpur": ["Tezpur", "Dhekiajuli", "Rangapara", "Biswanath Chariali"],
    "Tinsukia": ["Tinsukia", "Digboi", "Margherita", "Makum", "Doomdooma"]
  },
  "Bihar": {
    "Araria": ["Araria", "Forbesganj", "Jokihat", "Raniganj"],
    "Aurangabad": ["Aurangabad", "Daudnagar", "Obra", "Rafiganj"],
    "Begusarai": ["Begusarai", "Bachhwara", "Teghra", "Bakhri"],
    "Bhagalpur": ["Bhagalpur", "Naugachhia", "Sultanganj", "Kahalgaon"],
    "Bhojpur": ["Ara", "Jagdishpur", "Shahpur", "Piro"],
    "Darbhanga": ["Darbhanga", "Keotiranway", "Benipur", "Jale"],
    "Gaya": ["Gaya", "Bodh Gaya", "Sherghati", "Tekari", "Belaganj"],
    "Gopalganj": ["Gopalganj", "Hathua", "Phulwaria", "Baikunthpur"],
    "Muzaffarpur": ["Muzaffarpur", "Motipur", "Saraiya", "Kanti"],
    "Nalanda": ["Bihar Sharif", "Rajgir", "Hilsa", "Asthawan"],
    "Patna": ["Patna City", "Danapur", "Bikram", "Maner", "Fatuha", "Masaurhi"],
    "Purnia": ["Purnia", "Baisi", "Banmankhi", "Kasba"],
    "Samastipur": ["Samastipur", "Rosera", "Dalsinghsarai", "Patori"],
    "Saran": ["Chhapra", "Marhaura", "Revelganj", "Amnour"],
    "Vaishali": ["Hajipur", "Mahua", "Lalganj", "Raghopur"]
  },
  "Chhattisgarh": {
    "Bastar": ["Jagdalpur", "Lohandiguda", "Tokapal", "Bakawand"],
    "Bilaspur": ["Bilaspur", "Mungeli", "Takhatpur", "Kota"],
    "Durg": ["Durg", "Bhilai", "Dhamdha", "Patan"],
    "Janjgir-Champa": ["Janjgir", "Champa", "Naila", "Sakti"],
    "Korba": ["Korba", "Katghora", "Pali", "Kartala"],
    "Raigarh": ["Raigarh", "Dharamjaigarh", "Sarangarh", "Tamnar"],
    "Raipur": ["Raipur", "Arang", "Abhanpur", "Tilda"],
    "Rajnandgaon": ["Rajnandgaon", "Dongargarh", "Chhuriya", "Khairagarh"],
    "Surguja": ["Ambikapur", "Surajpur", "Premnagar", "Mainpat"]
  },
  "Goa": {
    "North Goa": ["Panaji", "Mapusa", "Bicholim", "Valpoi", "Pernem", "Ponda"],
    "South Goa": ["Margao", "Vasco da Gama", "Quepem", "Sanguem", "Canacona", "Mormugao"]
  },
  "Gujarat": {
    "Ahmedabad": ["Ahmedabad City", "Daskroi", "Sanand", "Bavla", "Dholka", "Viramgam"],
    "Amreli": ["Amreli", "Rajula", "Babra", "Jafrabad", "Savarkundla"],
    "Anand": ["Anand", "Petlad", "Borsad", "Khambhat", "Umreth"],
    "Banaskantha": ["Palanpur", "Deesa", "Dhanera", "Tharad", "Dantiwada"],
    "Bharuch": ["Bharuch", "Ankleshwar", "Jambusar", "Amod", "Hansot"],
    "Bhavnagar": ["Bhavnagar", "Mahuva", "Talaja", "Sihor", "Palitana"],
    "Gandhinagar": ["Gandhinagar", "Kalol", "Mansa", "Dehgam"],
    "Jamnagar": ["Jamnagar", "Dhrol", "Lalpur", "Kalavad", "Jodia"],
    "Junagadh": ["Junagadh", "Visavadar", "Manavadar", "Vanthali", "Mendarda"],
    "Kutch": ["Bhuj", "Gandhidham", "Mundra", "Anjar", "Mandvi", "Nakhatrana"],
    "Mehsana": ["Mehsana", "Visnagar", "Unjha", "Kheralu", "Vadnagar"],
    "Panchmahal": ["Godhra", "Halol", "Kalol", "Jhalod", "Shahera"],
    "Rajkot": ["Rajkot", "Gondal", "Jetpur", "Dhoraji", "Upleta", "Jasdan"],
    "Surat": ["Surat City", "Olpad", "Bardoli", "Kamrej", "Choryasi", "Mandvi"],
    "Vadodara": ["Vadodara City", "Padra", "Savli", "Dabhoi", "Karjan", "Waghodia"],
    "Valsad": ["Valsad", "Vapi", "Dharampur", "Pardi", "Umargam"]
  },
  "Haryana": {
    "Ambala": ["Ambala City", "Ambala Cantt", "Naraingarh", "Barara", "Saha"],
    "Bhiwani": ["Bhiwani", "Charkhi Dadri", "Loharu", "Tosham", "Siwani"],
    "Faridabad": ["Faridabad", "Ballabgarh", "Tigaon", "Mohna"],
    "Fatehabad": ["Fatehabad", "Tohana", "Ratia", "Jakhal"],
    "Gurugram": ["Gurugram", "Sohna", "Pataudi", "Farukhnagar", "Manesar"],
    "Hisar": ["Hisar", "Hansi", "Barwala", "Uklana", "Adampur"],
    "Jhajjar": ["Jhajjar", "Bahadurgarh", "Beri", "Machhrauli"],
    "Karnal": ["Karnal", "Gharaunda", "Assandh", "Nilokheri", "Indri"],
    "Kurukshetra": ["Kurukshetra", "Thanesar", "Pehowa", "Shahabad", "Ladwa"],
    "Panipat": ["Panipat", "Samalkha", "Israna", "Madlauda"],
    "Rewari": ["Rewari", "Bawal", "Kosli", "Nahar"],
    "Rohtak": ["Rohtak", "Meham", "Kalanaur", "Lakhan Majra"],
    "Sirsa": ["Sirsa", "Dabwali", "Rania", "Ellenabad"],
    "Sonipat": ["Sonipat", "Ganaur", "Gohana", "Kharkhoda"],
    "Yamunanagar": ["Yamunanagar", "Jagadhri", "Chhachhrauli", "Radaur", "Bilaspur"]
  },
  "Himachal Pradesh": {
    "Bilaspur": ["Bilaspur", "Ghumarwin", "Jhandutta", "Naina Devi"],
    "Chamba": ["Chamba", "Dalhousie", "Bharmour", "Tissa"],
    "Hamirpur": ["Hamirpur", "Nadaun", "Sujanpur", "Bhoranj"],
    "Kangra": ["Dharamshala", "Kangra", "Palampur", "Nagrota Bagwan", "Baijnath"],
    "Kullu": ["Kullu", "Manali", "Bhuntar", "Banjar", "Anni"],
    "Mandi": ["Mandi", "Sundernagar", "Jogindernagar", "Sarkaghat"],
    "Shimla": ["Shimla", "Rampur", "Theog", "Rohru", "Jubbal", "Kotkhai"],
    "Sirmaur": ["Nahan", "Paonta Sahib", "Rajgarh", "Shillai"],
    "Solan": ["Solan", "Nalagarh", "Baddi", "Arki", "Kasauli"],
    "Una": ["Una", "Amb", "Bangana", "Gagret"]
  },
  "Jharkhand": {
    "Bokaro": ["Bokaro Steel City", "Chas", "Bermo", "Gomia"],
    "Deoghar": ["Deoghar", "Madhupur", "Margomunda", "Sarath"],
    "Dhanbad": ["Dhanbad", "Jharia", "Katras", "Sindri", "Gobindpur"],
    "Dumka": ["Dumka", "Jamtara", "Saraiyahat", "Masalia"],
    "East Singhbhum": ["Jamshedpur", "Ghatsila", "Potka", "Baharagora"],
    "Giridih": ["Giridih", "Dumri", "Bengabad", "Deori"],
    "Gumla": ["Gumla", "Chainpur", "Bishunpur", "Ghaghra"],
    "Hazaribagh": ["Hazaribagh", "Ichak", "Barkagaon", "Barhi"],
    "Palamu": ["Daltonganj", "Lessliganj", "Panki", "Hussainabad"],
    "Ranchi": ["Ranchi", "Bundu", "Tamar", "Kanke", "Ratu", "Namkum"],
    "West Singhbhum": ["Chaibasa", "Chakradharpur", "Jagannathpur", "Manoharpur"]
  },
  "Karnataka": {
    "Bangalore Urban": ["Bangalore North", "Bangalore South", "Bangalore East", "Anekal"],
    "Bangalore Rural": ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"],
    "Belgaum": ["Belgaum", "Athani", "Bailhongal", "Gokak", "Chikkodi", "Ramdurg"],
    "Bellary": ["Bellary", "Hospet", "Sandur", "Siruguppa", "Kudlagi"],
    "Dakshina Kannada": ["Mangalore", "Bantwal", "Puttur", "Sullia", "Belthangady"],
    "Dharwad": ["Dharwad", "Hubli", "Kundgol", "Navalgund", "Kalghatgi"],
    "Gulbarga": ["Gulbarga", "Aland", "Afzalpur", "Chincholi", "Jevargi", "Sedam"],
    "Hassan": ["Hassan", "Arsikere", "Channarayapatna", "Holenarasipura", "Belur"],
    "Mandya": ["Mandya", "Maddur", "Malavalli", "Srirangapatna", "Nagamangala"],
    "Mysore": ["Mysore", "Nanjangud", "T Narasipura", "Hunsur", "Periyapatna", "Heggadadevankote"],
    "Raichur": ["Raichur", "Manvi", "Sindhanur", "Devadurga", "Lingasugur"],
    "Shimoga": ["Shimoga", "Bhadravathi", "Sagar", "Hosanagar", "Thirthahalli"],
    "Tumkur": ["Tumkur", "Tiptur", "Sira", "Madhugiri", "Gubbi", "Kunigal"],
    "Udupi": ["Udupi", "Kundapura", "Karkala", "Brahmavar"],
    "Uttara Kannada": ["Karwar", "Sirsi", "Kumta", "Honnavar", "Bhatkal", "Dandeli"]
  },
  "Kerala": {
    "Alappuzha": ["Alappuzha", "Cherthala", "Mavelikkara", "Kayamkulam", "Haripad"],
    "Ernakulam": ["Kochi", "Aluva", "Angamaly", "Kothamangalam", "Muvattupuzha", "Perumbavoor"],
    "Idukki": ["Painavu", "Thodupuzha", "Munnar", "Adimali", "Nedumkandam"],
    "Kannur": ["Kannur", "Thalassery", "Payyanur", "Taliparamba", "Iritty"],
    "Kasaragod": ["Kasaragod", "Kanhangad", "Manjeshwar", "Nileshwar"],
    "Kollam": ["Kollam", "Punalur", "Karunagappally", "Kottarakkara", "Kundara"],
    "Kottayam": ["Kottayam", "Changanassery", "Pala", "Vaikom", "Ettumanoor"],
    "Kozhikode": ["Kozhikode", "Vatakara", "Koyilandy", "Perambra", "Koduvally"],
    "Malappuram": ["Malappuram", "Manjeri", "Tirur", "Ponnani", "Perinthalmanna", "Nilambur"],
    "Palakkad": ["Palakkad", "Ottapalam", "Shoranur", "Chittur", "Alathur", "Mannarkkad"],
    "Pathanamthitta": ["Pathanamthitta", "Adoor", "Thiruvalla", "Ranni", "Kozhencherry"],
    "Thiruvananthapuram": ["Thiruvananthapuram", "Neyyattinkara", "Nedumangad", "Attingal", "Varkala"],
    "Thrissur": ["Thrissur", "Chalakudy", "Irinjalakuda", "Kodungallur", "Guruvayur", "Kunnamkulam"],
    "Wayanad": ["Kalpetta", "Sulthan Bathery", "Mananthavady", "Vythiri"]
  },
  "Madhya Pradesh": {
    "Bhopal": ["Bhopal", "Berasia", "Huzur", "Phanda"],
    "Gwalior": ["Gwalior", "Dabra", "Bhitarwar", "Morar"],
    "Indore": ["Indore", "Mhow", "Depalpur", "Sanwer"],
    "Jabalpur": ["Jabalpur", "Sihora", "Patan", "Shahpura", "Kundam"],
    "Rewa": ["Rewa", "Mauganj", "Hanumana", "Teonthar"],
    "Sagar": ["Sagar", "Bina", "Khurai", "Banda", "Rahatgarh"],
    "Satna": ["Satna", "Maihar", "Raghurajnagar", "Amarpatan"],
    "Ujjain": ["Ujjain", "Nagda", "Mahidpur", "Tarana", "Barnagar"]
  },
  "Maharashtra": {
    "Ahmednagar": ["Ahmednagar", "Rahata", "Shrirampur", "Sangamner", "Kopargaon"],
    "Aurangabad": ["Aurangabad", "Khuldabad", "Paithan", "Sillod", "Kannad"],
    "Kolhapur": ["Kolhapur", "Ichalkaranji", "Gadhinglaj", "Kagal", "Hatkanangle"],
    "Mumbai City": ["Colaba", "Dadar", "Byculla", "Andheri", "Borivali"],
    "Mumbai Suburban": ["Bandra", "Kurla", "Andheri", "Malad", "Borivali", "Goregaon"],
    "Nagpur": ["Nagpur", "Kamptee", "Hingna", "Ramtek", "Katol", "Saoner"],
    "Nashik": ["Nashik", "Malegaon", "Sinnar", "Igatpuri", "Trimbakeshwar"],
    "Pune": ["Pune City", "Haveli", "Maval", "Mulshi", "Baramati", "Junnar", "Shirur"],
    "Ratnagiri": ["Ratnagiri", "Chiplun", "Dapoli", "Guhagar", "Khed"],
    "Sangli": ["Sangli", "Miraj", "Tasgaon", "Walwa", "Jath"],
    "Satara": ["Satara", "Karad", "Wai", "Mahabaleshwar", "Phaltan"],
    "Solapur": ["Solapur", "Pandharpur", "Akkalkot", "Barshi", "Karmala"],
    "Thane": ["Thane", "Kalyan", "Bhiwandi", "Ulhasnagar", "Ambernath", "Murbad"]
  },
  "Manipur": {
    "Bishnupur": ["Bishnupur", "Nambol", "Moirang"],
    "Churachandpur": ["Churachandpur", "Henglep", "Singngat"],
    "Imphal East": ["Porompat", "Jiribam", "Keirao"],
    "Imphal West": ["Imphal", "Lamphel", "Nambol"],
    "Thoubal": ["Thoubal", "Kakching", "Lilong"],
    "Ukhrul": ["Ukhrul", "Kamjong", "Phungyar"]
  },
  "Meghalaya": {
    "East Garo Hills": ["Williamnagar", "Samanda", "Rongjeng"],
    "East Khasi Hills": ["Shillong", "Sohra", "Pynursla", "Mawkynrew"],
    "Jaintia Hills": ["Jowai", "Laskein", "Khliehriat", "Amlarem"],
    "Ri Bhoi": ["Nongpoh", "Nongstoin", "Umroi"],
    "South Garo Hills": ["Baghmara", "Chokpot", "Rongara"],
    "West Garo Hills": ["Tura", "Dadenggre", "Selsella"],
    "West Khasi Hills": ["Nongstoin", "Mairang", "Mawkyrwat"]
  },
  "Mizoram": {
    "Aizawl": ["Aizawl", "Darlawn", "Thingsulthliah"],
    "Champhai": ["Champhai", "Khawzawl", "Ngopa"],
    "Kolasib": ["Kolasib", "Bilkhawthlir", "Thingdawl"],
    "Lawngtlai": ["Lawngtlai", "Chawngte", "Sangau"],
    "Lunglei": ["Lunglei", "Hnahthial", "Tlabung"],
    "Mamit": ["Mamit", "West Phaileng", "Zawlnuam"],
    "Saiha": ["Saiha", "Tuipang", "Sangau"],
    "Serchhip": ["Serchhip", "Thenzawl", "East Lungdar"]
  },
  "Nagaland": {
    "Dimapur": ["Dimapur", "Chumukedima", "Niuland", "Kuhuboto"],
    "Kohima": ["Kohima", "Chiephobozou", "Tseminyu", "Jakhama"],
    "Mokokchung": ["Mokokchung", "Tuli", "Changtongya"],
    "Mon": ["Mon", "Tobu", "Tizit"],
    "Tuensang": ["Tuensang", "Shamator", "Noklak"],
    "Wokha": ["Wokha", "Sanis", "Bhandari"],
    "Zunheboto": ["Zunheboto", "Aghunato", "Satakha"]
  },
  "Odisha": {
    "Angul": ["Angul", "Talcher", "Athamallik", "Pallahara"],
    "Balasore": ["Balasore", "Jaleswar", "Soro", "Remuna", "Nilgiri"],
    "Bhubaneswar": ["Bhubaneswar", "Jatni", "Balianta", "Balipatna"],
    "Cuttack": ["Cuttack", "Banki", "Athagarh", "Baramba"],
    "Ganjam": ["Berhampur", "Chhatrapur", "Aska", "Bhanjanagar", "Hinjilicut"],
    "Kalahandi": ["Bhawanipatna", "Dharmagarh", "Junagarh", "Kesinga"],
    "Khordha": ["Bhubaneswar", "Khordha", "Jatni", "Begunia"],
    "Mayurbhanj": ["Baripada", "Rairangpur", "Udala", "Karanjia"],
    "Puri": ["Puri", "Pipili", "Nimapara", "Konark", "Satyabadi"],
    "Sambalpur": ["Sambalpur", "Burla", "Hirakud", "Kuchinda", "Rairakhol"],
    "Sundargarh": ["Rourkela", "Sundargarh", "Rajgangpur", "Bonai"]
  },
  "Punjab": {
    "Amritsar": ["Amritsar", "Ajnala", "Tarn Taran", "Baba Bakala"],
    "Bathinda": ["Bathinda", "Rampura Phul", "Talwandi Sabo", "Maur"],
    "Faridkot": ["Faridkot", "Jaitu", "Kotkapura"],
    "Firozpur": ["Firozpur", "Fazilka", "Abohar", "Jalalabad"],
    "Gurdaspur": ["Gurdaspur", "Batala", "Pathankot", "Dera Baba Nanak"],
    "Hoshiarpur": ["Hoshiarpur", "Dasuya", "Garhshankar", "Mukerian"],
    "Jalandhar": ["Jalandhar", "Nakodar", "Shahkot", "Phillaur", "Kartarpur"],
    "Ludhiana": ["Ludhiana", "Khanna", "Jagraon", "Raikot", "Samrala"],
    "Moga": ["Moga", "Nihal Singh Wala", "Baghapurana"],
    "Mohali": ["Mohali", "Kharar", "Dera Bassi", "Kurali"],
    "Muktsar": ["Muktsar", "Malout", "Gidderbaha", "Bariwala"],
    "Patiala": ["Patiala", "Rajpura", "Nabha", "Samana", "Patran"],
    "Sangrur": ["Sangrur", "Barnala", "Malerkotla", "Dhuri", "Sunam"]
  },
  "Rajasthan": {
    "Ajmer": ["Ajmer", "Beawar", "Kishangarh", "Nasirabad", "Pushkar"],
    "Alwar": ["Alwar", "Bhiwadi", "Behror", "Tijara", "Kishangarh Bas"],
    "Bikaner": ["Bikaner", "Nokha", "Lunkaransar", "Kolayat"],
    "Jaipur": ["Jaipur", "Amber", "Sanganer", "Chaksu", "Chomu", "Shahpura"],
    "Jodhpur": ["Jodhpur", "Bilara", "Phalodi", "Osian", "Shergarh"],
    "Kota": ["Kota", "Ramganj Mandi", "Sangod", "Ladpura"],
    "Sikar": ["Sikar", "Fatehpur", "Laxmangarh", "Neem Ka Thana"],
    "Udaipur": ["Udaipur", "Rajsamand", "Salumber", "Girwa", "Gogunda"]
  },
  "Sikkim": {
    "East Sikkim": ["Gangtok", "Rangpo", "Singtam", "Pakyong"],
    "West Sikkim": ["Geyzing", "Pelling", "Soreng", "Dentam"],
    "North Sikkim": ["Mangan", "Chungthang", "Lachen", "Lachung"],
    "South Sikkim": ["Namchi", "Ravangla", "Jorethang", "Yangang"]
  },
  "Tamil Nadu": {
    "Chennai": ["Chennai North", "Chennai South", "Chennai Central", "Egmore", "T. Nagar", "Mylapore"],
    "Coimbatore": ["Coimbatore North", "Coimbatore South", "Pollachi", "Mettupalayam", "Sulur"],
    "Cuddalore": ["Cuddalore", "Chidambaram", "Virudhachalam", "Panruti"],
    "Erode": ["Erode", "Bhavani", "Gobichettipalayam", "Sathyamangalam"],
    "Kanchipuram": ["Kanchipuram", "Sriperumbudur", "Chengalpattu", "Uthiramerur"],
    "Madurai": ["Madurai North", "Madurai South", "Melur", "Usilampatti", "Thiruparankundram"],
    "Nagapattinam": ["Nagapattinam", "Mayiladuthurai", "Sirkazhi", "Vedaranyam"],
    "Salem": ["Salem", "Attur", "Mettur", "Omalur", "Edappadi"],
    "Thanjavur": ["Thanjavur", "Kumbakonam", "Pattukkottai", "Orathanadu"],
    "Tiruchirappalli": ["Tiruchirappalli", "Srirangam", "Lalgudi", "Musiri", "Manapparai"],
    "Tirunelveli": ["Tirunelveli", "Palayamkottai", "Ambasamudram", "Tenkasi"],
    "Vellore": ["Vellore", "Ambur", "Vaniyambadi", "Gudiyatham", "Ranipet"]
  },
  "Telangana": {
    "Adilabad": ["Adilabad", "Nirmal", "Mancherial", "Bellampalli"],
    "Hyderabad": ["Hyderabad", "Secunderabad", "Begumpet", "Charminar", "Jubilee Hills"],
    "Karimnagar": ["Karimnagar", "Jagtial", "Peddapalli", "Ramagundam"],
    "Khammam": ["Khammam", "Kothagudem", "Bhadrachalam", "Sathupalli"],
    "Mahabubnagar": ["Mahabubnagar", "Jadcherla", "Wanaparthy", "Nagarkurnool"],
    "Medak": ["Sangareddy", "Siddipet", "Medak", "Narayankhed"],
    "Nalgonda": ["Nalgonda", "Suryapet", "Miryalaguda", "Bhongir", "Devarakonda"],
    "Nizamabad": ["Nizamabad", "Bodhan", "Kamareddy", "Armoor"],
    "Rangareddy": ["Shamshabad", "Chevella", "Ibrahimpatnam", "Rajendranagar", "Shadnagar"],
    "Warangal": ["Warangal", "Hanamkonda", "Jangaon", "Mahabubabad"]
  },
  "Tripura": {
    "Dhalai": ["Ambassa", "Kamalpur", "Longtharai Valley"],
    "Gomati": ["Udaipur", "Amarpur", "Karbook"],
    "Khowai": ["Khowai", "Teliamura", "Kalyanpur"],
    "North Tripura": ["Dharmanagar", "Kanchanpur", "Panisagar"],
    "Sepahijala": ["Bishramganj", "Sonamura", "Charilam"],
    "South Tripura": ["Belonia", "Santirbazar", "Sabroom"],
    "Unakoti": ["Kailashahar", "Kumarghat", "Pecharthal"],
    "West Tripura": ["Agartala", "Mohanpur", "Jirania", "Mandwi"]
  },
  "Uttar Pradesh": {
    "Agra": ["Agra", "Firozabad", "Fatehpur Sikri", "Kiraoli", "Etmadpur"],
    "Aligarh": ["Aligarh", "Hathras", "Khair", "Atrauli", "Iglas"],
    "Allahabad": ["Prayagraj", "Phulpur", "Soraon", "Handia", "Karchana"],
    "Azamgarh": ["Azamgarh", "Phulpur", "Lalganj", "Sagri", "Mehnagar"],
    "Bareilly": ["Bareilly", "Aonla", "Nawabganj", "Faridpur"],
    "Gorakhpur": ["Gorakhpur", "Gola", "Sahjanwa", "Khajni", "Campierganj"],
    "Kanpur Nagar": ["Kanpur", "Ghatampur", "Bilhaur", "Derapur"],
    "Lucknow": ["Lucknow", "Mohanlalganj", "Bakshi Ka Talab", "Sarojini Nagar", "Malihabad"],
    "Mathura": ["Mathura", "Vrindavan", "Chhata", "Mant", "Govardhan"],
    "Meerut": ["Meerut", "Sardhana", "Mawana", "Hastinapur", "Parikshitgarh"],
    "Moradabad": ["Moradabad", "Thakurdwara", "Bilari", "Chandausi"],
    "Noida": ["Noida", "Greater Noida", "Dadri", "Jewar"],
    "Varanasi": ["Varanasi", "Pindra", "Rohaniya", "Kashi Vidyapith", "Sevapuri"]
  },
  "Uttarakhand": {
    "Almora": ["Almora", "Ranikhet", "Bhikiyasain", "Dwarahat"],
    "Chamoli": ["Gopeshwar", "Joshimath", "Karnaprayag", "Pokhri"],
    "Dehradun": ["Dehradun", "Mussoorie", "Rishikesh", "Vikasnagar", "Doiwala", "Sahaspur"],
    "Haridwar": ["Haridwar", "Roorkee", "Laksar", "Bhagwanpur", "Narsan"],
    "Nainital": ["Nainital", "Haldwani", "Ramnagar", "Bhimtal", "Lalkuan"],
    "Pauri Garhwal": ["Pauri", "Kotdwar", "Srinagar", "Lansdowne"],
    "Pithoragarh": ["Pithoragarh", "Dharchula", "Gangolihat", "Munsiari"],
    "Rudraprayag": ["Rudraprayag", "Ukhimath", "Augustmuni"],
    "Tehri Garhwal": ["New Tehri", "Chamba", "Narendranagar", "Ghansali"],
    "Udham Singh Nagar": ["Rudrapur", "Kashipur", "Jaspur", "Khatima", "Sitarganj"],
    "Uttarkashi": ["Uttarkashi", "Bhatwari", "Purola", "Mori"]
  },
  "West Bengal": {
    "Bankura": ["Bankura", "Bishnupur", "Sonamukhi", "Khatra"],
    "Bardhaman": ["Bardhaman", "Durgapur", "Asansol", "Memari", "Katwa"],
    "Birbhum": ["Suri", "Bolpur", "Rampurhat", "Nalhati", "Sainthia"],
    "Darjeeling": ["Darjeeling", "Siliguri", "Kurseong", "Kalimpong", "Mirik"],
    "Hooghly": ["Chinsurah", "Chandannagar", "Serampore", "Arambag", "Tarakeswar"],
    "Howrah": ["Howrah", "Uluberia", "Domjur", "Shyampur", "Amta"],
    "Jalpaiguri": ["Jalpaiguri", "Alipurduar", "Mal", "Dhupguri", "Maynaguri"],
    "Kolkata": ["Kolkata North", "Kolkata South", "Kolkata East", "Kolkata West", "Park Street"],
    "Malda": ["Malda", "Old Malda", "English Bazar", "Gazole", "Habibpur"],
    "Medinipur East": ["Tamluk", "Contai", "Haldia", "Mahishadal", "Egra"],
    "Medinipur West": ["Medinipur", "Kharagpur", "Jhargram", "Ghatal", "Chandrakona"],
    "Murshidabad": ["Berhampore", "Lalbag", "Kandi", "Domkal", "Jiaganj"],
    "Nadia": ["Krishnanagar", "Nabadwip", "Ranaghat", "Tehatta", "Kalyani"],
    "North 24 Parganas": ["Barasat", "Barrackpore", "Basirhat", "Dum Dum", "Habra"],
    "South 24 Parganas": ["Alipore", "Baruipur", "Diamond Harbour", "Kakdwip", "Canning"]
  },
  "Andaman and Nicobar Islands": {
    "Nicobar": ["Car Nicobar", "Nancowry", "Great Nicobar"],
    "North and Middle Andaman": ["Mayabunder", "Diglipur", "Rangat"],
    "South Andaman": ["Port Blair", "Ferrargunj", "Wandoor"]
  },
  "Chandigarh": {
    "Chandigarh": ["Sector 1-10", "Sector 11-20", "Sector 21-30", "Sector 31-40", "Sector 41-56", "Manimajra"]
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    "Dadra and Nagar Haveli": ["Silvassa", "Amli", "Naroli"],
    "Daman": ["Daman", "Nani Daman", "Moti Daman"],
    "Diu": ["Diu", "Ghoghla", "Bucharwada"]
  },
  "Delhi": {
    "Central Delhi": ["Connaught Place", "Karol Bagh", "Paharganj", "Daryaganj"],
    "East Delhi": ["Preet Vihar", "Laxmi Nagar", "Mayur Vihar", "Patparganj"],
    "New Delhi": ["Chanakyapuri", "Lodhi Road", "India Gate", "Parliament Street"],
    "North Delhi": ["Civil Lines", "Model Town", "Adarsh Nagar", "Sadar Bazar"],
    "North East Delhi": ["Seelampur", "Jaffrabad", "Yamuna Vihar", "Mustafabad"],
    "North West Delhi": ["Rohini", "Pitampura", "Shalimar Bagh", "Narela"],
    "South Delhi": ["Hauz Khas", "Greater Kailash", "Saket", "Mehrauli"],
    "South East Delhi": ["Defence Colony", "Lajpat Nagar", "Okhla", "Kalkaji"],
    "South West Delhi": ["Dwarka", "Janakpuri", "Vasant Kunj", "Najafgarh"],
    "West Delhi": ["Rajouri Garden", "Tilak Nagar", "Punjabi Bagh", "Patel Nagar"]
  },
  "Jammu and Kashmir": {
    "Anantnag": ["Anantnag", "Pahalgam", "Bijbehera", "Shangus"],
    "Baramulla": ["Baramulla", "Sopore", "Pattan", "Uri", "Gulmarg"],
    "Budgam": ["Budgam", "Chadoora", "Beerwah", "Khansahib"],
    "Jammu": ["Jammu", "Akhnoor", "R.S. Pura", "Bishnah", "Bahu"],
    "Kathua": ["Kathua", "Hiranagar", "Billawar", "Basohli"],
    "Pulwama": ["Pulwama", "Shopian", "Tral", "Awantipora"],
    "Rajouri": ["Rajouri", "Sunderbani", "Nowshera", "Thannamandi"],
    "Srinagar": ["Srinagar", "Hazratbal", "Khanyar", "Nishat", "Harwan"],
    "Udhampur": ["Udhampur", "Ramnagar", "Chenani", "Majalta"]
  },
  "Ladakh": {
    "Kargil": ["Kargil", "Drass", "Zanskar", "Shakar Chiktan"],
    "Leh": ["Leh", "Diskit", "Nyoma", "Khaltse"]
  },
  "Lakshadweep": {
    "Lakshadweep": ["Kavaratti", "Agatti", "Amini", "Minicoy", "Andrott", "Kadmat"]
  },
  "Puducherry": {
    "Karaikal": ["Karaikal", "Nedungadu", "Thirunallar"],
    "Mahe": ["Mahe", "Palloor"],
    "Puducherry": ["Puducherry", "Oulgaret", "Villianur", "Bahour", "Ariyankuppam"],
    "Yanam": ["Yanam"]
  }
};

export const getStates = (): string[] => Object.keys(indiaLocations).sort();

export const getDistricts = (state: string): string[] => {
  if (!state || !indiaLocations[state]) return [];
  return Object.keys(indiaLocations[state]).sort();
};

export const getBlocks = (state: string, district: string): string[] => {
  if (!state || !district || !indiaLocations[state] || !indiaLocations[state][district]) return [];
  return indiaLocations[state][district].sort();
};

const diseaseData = {
  akiec: {
    title: 'Actinic Keratoses (AKIEC)',
    short: 'Precancerous lesions caused by long-term sun exposure.',
    symptoms: [
      'Rough, scaly patches',
      'Red or brown crusty lesions',
      'May itch or feel tender'
    ],
    causes: [
      'Chronic UV radiation exposure',
      'Fair skin',
      'Older age'
    ],
    cautions: [
      'Can progress to squamous cell carcinoma',
      'Regular skin checks are important'
    ],
    treatments: [
      'Cryotherapy',
      'Topical chemotherapy creams',
      'Photodynamic therapy'
    ],
    image: 'https://my.clevelandclinic.org/-/scassets/images/org/health/articles/14148-actinic-keratosis'
  },

  bcc: {
    title: 'Basal Cell Carcinoma (BCC)',
    short: 'The most common type of skin cancer, usually slow-growing.',
    symptoms: [
      'Pearly or waxy bump',
      'Flat flesh-colored lesion',
      'Bleeding or scabbing sore'
    ],
    causes: [
      'Excessive sun exposure',
      'Radiation therapy',
      'Fair skin'
    ],
    cautions: [
      'Rarely spreads but can damage surrounding tissue',
      'Early treatment is important'
    ],
    treatments: [
      'Surgical excision',
      'Mohs surgery',
      'Radiation therapy'
    ],
    image: 'https://uniqskin.gr/_astro/bcc.Pc2ioQh8_Z107YJD.webp'
  },

  bkl: {
    title: 'Benign Keratosis-like Lesions (BKL)',
    short: 'Non-cancerous skin growths including seborrheic keratoses.',
    symptoms: [
      'Waxy or scaly appearance',
      'Brown, black, or tan color',
      'Slightly raised lesions'
    ],
    causes: [
      'Aging',
      'Genetic factors'
    ],
    cautions: [
      'Can resemble melanoma visually',
      'Dermatoscopic examination recommended'
    ],
    treatments: [
      'Usually no treatment needed',
      'Cryotherapy or curettage if irritated'
    ],
    image: 'https://sundoctors.com.au/wp-content/uploads/2022/04/seborrhoeic-keratoses.jpeg'
  },

  df: {
    title: 'Dermatofibroma (DF)',
    short: 'A benign fibrous skin nodule often found on the legs.',
    symptoms: [
      'Firm raised nodule',
      'Brown or reddish color',
      'Dimple sign when pinched'
    ],
    causes: [
      'Minor skin injury',
      'Insect bites'
    ],
    cautions: [
      'Harmless and usually permanent',
      'Surgical removal may leave a scar'
    ],
    treatments: [
      'No treatment required',
      'Surgical removal if painful'
    ],
    image: 'https://fisioderme.com.br/wp-content/uploads/elementor/thumbs/dermatofibroma-em-brasilia-fisioderme-clinica-estetica-asa-sul-candangolandia-brasilia-df-r6mrdq9tcfkp0kelk3s5uh0kvp5r71ponvx16bl2ps.webp'
  },

  mel: {
    title: 'Melanoma (MEL)',
    short: 'A dangerous skin cancer originating from melanocytes.',
    symptoms: [
      'Asymmetrical mole',
      'Irregular borders',
      'Multiple colors',
      'Increasing size'
    ],
    causes: [
      'UV radiation exposure',
      'Genetic predisposition'
    ],
    cautions: [
      'High risk of metastasis',
      'Requires urgent medical attention'
    ],
    treatments: [
      'Surgical excision',
      'Immunotherapy',
      'Targeted therapy'
    ],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYjF93aNnBHREUWGIVo30BLx0EIEzXKRofhg&s'
  },

  nv: {
    title: 'Melanocytic Nevi (NV)',
    short: 'Common benign moles formed by melanocytes.',
    symptoms: [
      'Uniform color',
      'Round or oval shape',
      'Stable size'
    ],
    causes: [
      'Genetic factors',
      'Sun exposure'
    ],
    cautions: [
      'Monitor for ABCDE changes',
      'Most are harmless'
    ],
    treatments: [
      'No treatment necessary',
      'Removal if suspicious'
    ],
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWLtF6lXrLBArc_dXu4EBssydpRP3BNdOQBA&s'
  },

  vasc: {
    title: 'Vascular Lesions (VASC)',
    short: 'Skin lesions caused by abnormal blood vessels.',
    symptoms: [
      'Red or purple spots',
      'May blanch under pressure'
    ],
    causes: [
      'Blood vessel malformations',
      'Congenital conditions'
    ],
    cautions: [
      'Mostly benign',
      'Can resemble melanoma'
    ],
    treatments: [
      'Laser therapy',
      'Observation if asymptomatic'
    ],
    image: 'https://www.mydcsi.com/wp-content/uploads/2025/04/What_Causes_Vascular_Skin_Lesions1-1080x675.png'
  }
};

export default diseaseData;

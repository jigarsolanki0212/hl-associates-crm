import { PrismaClient, ClientStatus, RenewalStatus, RenewalStage } from '@prisma/client';

const prisma = new PrismaClient();

const hlClients = [
  {
    companyName: 'GriportHO',
    logoUrl: 'https://hl-associates.in/images/clients/griportho.webp',
    contactName: 'Rajesh Sharma',
    contactTitle: 'Managing Director',
    email: 'regulatory@griportho.com',
    phone: '+91 98250 11223',
    address: 'Plot 45, GIDC Industrial Estate, Vatva, Ahmedabad, Gujarat 382445',
    taxId: 'GSTIN-24AABCG1234F1Z1',
    industry: 'Orthopedic Implants & Trauma Fixation',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485'],
    fee: 350000,
    expiryMonthsAhead: 8,
  },
  {
    companyName: 'Smit Medimed (SMPL)',
    logoUrl: 'https://hl-associates.in/images/clients/smpl-smit-medimed.webp',
    contactName: 'Kunal Patel',
    contactTitle: 'Head of Quality & RA',
    email: 'compliance@smitmedimed.com',
    phone: '+91 98790 44556',
    address: 'Survey No. 218, NH-8B, Shapar (Veraval), Rajkot, Gujarat 360024',
    taxId: 'GSTIN-24AABCS5678G1Z2',
    industry: 'Orthopedic Spine & Bone Plating Systems',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-CEMDR'],
    fee: 480000,
    expiryMonthsAhead: 14,
  },
  {
    companyName: 'Airox',
    logoUrl: 'https://hl-associates.in/images/clients/airox.webp',
    contactName: 'Sanjay Nitsure',
    contactTitle: 'Chief Executive Officer',
    email: 'info@airoxmed.com',
    phone: '+91 98220 33441',
    address: 'Airox House, MIDC Industrial Area, Mahape, Navi Mumbai, Maharashtra 400710',
    taxId: 'GSTIN-27AABCA9012H1Z3',
    industry: 'Medical Oxygen Generators & Gas Pipelines',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485'],
    fee: 400000,
    expiryMonthsAhead: 1, // Expiring soon
  },
  {
    companyName: 'Aosys',
    logoUrl: 'https://hl-associates.in/images/clients/aosys.webp',
    contactName: 'Vikram Mehta',
    contactTitle: 'Director of Operations',
    email: 'regulatory@aosysmed.com',
    phone: '+91 98980 67890',
    address: 'Aosys Tech Park, Electronic Zone, Gandhinagar, Gujarat 382028',
    taxId: 'GSTIN-24AABCA3456J1Z4',
    industry: 'Spinal Implants & Surgical Systems',
    serviceCodes: ['SRV-CEMDR', 'SRV-ISO13485'],
    fee: 520000,
    expiryMonthsAhead: 11,
  },
  {
    companyName: 'WeHear',
    logoUrl: 'https://hl-associates.in/images/clients/wehear.webp',
    contactName: 'Kanishka Patel',
    contactTitle: 'Founder & Innovation Head',
    email: 'contact@wehear.in',
    phone: '+91 90999 54321',
    address: '801-802, Titanium City Centre, Anandnagar Road, Satellite, Ahmedabad, Gujarat 380015',
    taxId: 'GSTIN-24AABCW7890K1Z5',
    industry: 'Hearing Solutions & Smart Audio Health Devices',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485'],
    fee: 280000,
    expiryMonthsAhead: 10,
  },
  {
    companyName: 'Advin Health Care',
    logoUrl: 'https://hl-associates.in/images/clients/advin-healthcare.webp',
    contactName: 'Jatin Shah',
    contactTitle: 'Executive Director',
    email: 'exports@advinhealthcare.com',
    phone: '+91 98240 66778',
    address: '424-426, Platinum Techno Park, Sector 30A, Vashi, Navi Mumbai 400703',
    taxId: 'GSTIN-27AABCA1234L1Z6',
    industry: 'Hospital Infrastructure & Surgical Turnkey Solutions',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-FSC'],
    fee: 380000,
    expiryMonthsAhead: 6,
  },
  {
    companyName: 'KTEX Nonwovens',
    logoUrl: 'https://hl-associates.in/images/clients/ktex-nonwovens.webp',
    contactName: 'Pankaj Agarwal',
    contactTitle: 'Plant Head',
    email: 'quality@ktexnonwovens.com',
    phone: '+91 98290 88990',
    address: 'Block No. 154, Village Borisana, Kadi-Kalol Highway, Mehsana, Gujarat 382715',
    taxId: 'GSTIN-24AABCK5678M1Z7',
    industry: 'Medical Drapes, Gowns & PPE Nonwoven Fabrics',
    serviceCodes: ['SRV-ISO13485', 'SRV-CDSCO-MFG'],
    fee: 300000,
    expiryMonthsAhead: 1, // Expiring soon (30 days)
  },
  {
    companyName: 'Relife Ortho',
    logoUrl: 'https://hl-associates.in/images/clients/relife-ortho.webp',
    contactName: 'Hitesh Vora',
    contactTitle: 'Technical Director',
    email: 'regulatory@relifeortho.com',
    phone: '+91 98251 22334',
    address: 'Plot 12, Aji Industrial Area, Phase-II, Rajkot, Gujarat 360003',
    taxId: 'GSTIN-24AABCR9012N1Z8',
    industry: 'Total Knee & Hip Arthroplasty Implants',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-CEMDR'],
    fee: 550000,
    expiryMonthsAhead: 18,
  },
  {
    companyName: 'Medicare Hygiene Limited',
    logoUrl: 'https://hl-associates.in/images/clients/medicare-hygiene.webp',
    contactName: 'Bhavesh Chawla',
    contactTitle: 'VP Regulatory Affairs',
    email: 'compliance@medicarehygiene.com',
    phone: '+91 98791 55667',
    address: 'Plot 702/1, GIDC Estate, Ankleshwar, Bharuch, Gujarat 393002',
    taxId: 'GSTIN-24AABCM3456P1Z9',
    industry: 'Sterile Surgical Dressings, Gauze & Absorbent Cotton',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485', 'SRV-FSC'],
    fee: 450000,
    expiryMonthsAhead: 9,
  },
  {
    companyName: 'IDE',
    logoUrl: 'https://hl-associates.in/images/clients/ide.webp',
    contactName: 'Dr. Alok Verma',
    contactTitle: 'Chief Scientific Officer',
    email: 'ra@idemedical.com',
    phone: '+91 98110 77889',
    address: 'B-45, Okhla Industrial Area Phase-II, New Delhi 110020',
    taxId: 'GSTIN-07AABCI7890Q1Z0',
    industry: 'In-Vitro Diagnostics (IVD) & Laboratory Analyzers',
    serviceCodes: ['SRV-CDSCO-IMP', 'SRV-ISO13485'],
    fee: 360000,
    expiryMonthsAhead: 5,
  },
  {
    companyName: 'SafeEndo',
    logoUrl: 'https://hl-associates.in/images/clients/safeendo.webp',
    contactName: 'Dr. Pradeep Joshi',
    contactTitle: 'Managing Partner',
    email: 'regulatory@safeendo.com',
    phone: '+91 98252 33445',
    address: 'A-108, Safal Solitaire, SG Highway, Ahmedabad, Gujarat 380051',
    taxId: 'GSTIN-24AABCS1234R1Z1',
    industry: 'Endodontic Consumables, Sealers & Dental Cements',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485'],
    fee: 320000,
    expiryMonthsAhead: 12,
  },
  {
    companyName: 'Yogeshwar Implants',
    logoUrl: 'https://hl-associates.in/images/clients/yogeshwar-implants.webp',
    contactName: 'Yogesh Prajapati',
    contactTitle: 'Proprietor',
    email: 'admin@yogeshwarimplants.com',
    phone: '+91 98241 44556',
    address: 'Shapar-Veraval Industrial Zone, Plot 56, Rajkot, Gujarat 360024',
    taxId: 'GSTIN-24AABCY5678S1Z2',
    industry: 'Locking Bone Plates & Orthopedic Cannulated Screws',
    serviceCodes: ['SRV-CDSCO-MFG'],
    fee: 250000,
    expiryMonthsAhead: 7,
  },
  {
    companyName: 'SafeOps',
    logoUrl: 'https://hl-associates.in/images/clients/safeops.webp',
    contactName: 'Nitin Desai',
    contactTitle: 'Quality Assurance Manager',
    email: 'qa@safeops.in',
    phone: '+91 98981 66778',
    address: 'SafeOps Building, GIDC Chhatral, Gandhinagar, Gujarat 382729',
    taxId: 'GSTIN-24AABCS9012T1Z3',
    industry: 'Sterile Surgical Gloves & Cleanroom Disposables',
    serviceCodes: ['SRV-ISO13485', 'SRV-CDSCO-MFG'],
    fee: 310000,
    expiryMonthsAhead: 4,
  },
  {
    companyName: 'Steri Techno Fab',
    logoUrl: 'https://hl-associates.in/images/clients/steri-technofab.webp',
    contactName: 'Haresh Patel',
    contactTitle: 'Head of Engineering',
    email: 'haresh@steritechnofab.com',
    phone: '+91 98253 88990',
    address: 'Plot 88, Odhav Industrial Estate, Ahmedabad, Gujarat 382415',
    taxId: 'GSTIN-24AABCS3456U1Z4',
    industry: 'ETO Sterilizers & Autoclave Pressure Vessels',
    serviceCodes: ['SRV-ISO13485'],
    fee: 220000,
    expiryMonthsAhead: 15,
  },
  {
    companyName: 'Centroiid Meditech',
    logoUrl: 'https://hl-associates.in/images/clients/centroiid-meditech.webp',
    contactName: 'Ravi Trivedi',
    contactTitle: 'Operations Director',
    email: 'regulatory@centroiid.com',
    phone: '+91 98792 11223',
    address: 'Survey No. 450, Village Moraiya, Changodar, Ahmedabad 382213',
    taxId: 'GSTIN-24AABCC7890V1Z5',
    industry: 'IV Infusion Sets, Scalp Vein Sets & Blood Lines',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-CEMDR'],
    fee: 460000,
    expiryMonthsAhead: 1, // Expiring soon (25 days)
  },
  {
    companyName: 'Arni Medica',
    logoUrl: 'https://hl-associates.in/images/clients/arni-medica.webp',
    contactName: 'Deepak Sharma',
    contactTitle: 'Regulatory Affairs Specialist',
    email: 'deepak@arnimedica.com',
    phone: '+91 98221 44556',
    address: 'Plot 34, MIDC Bhosari, Pune, Maharashtra 411026',
    taxId: 'GSTIN-27AABCA1234W1Z6',
    industry: 'Anesthesia Breathing Circuits & Suction Catheters',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485'],
    fee: 340000,
    expiryMonthsAhead: 9,
  },
  {
    companyName: 'Salubris Surgical',
    logoUrl: 'https://hl-associates.in/images/clients/salubris-surgical.webp',
    contactName: 'Manish Rawal',
    contactTitle: 'Managing Director',
    email: 'info@salubrissurgical.com',
    phone: '+91 98254 55667',
    address: 'Salubris Towers, GIDC Ranasan, Vijapur, Gujarat 382870',
    taxId: 'GSTIN-24AABCS5678X1Z7',
    industry: 'Absorbable & Non-Absorbable Surgical Sutures',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-FDA510K'],
    fee: 580000,
    expiryMonthsAhead: 13,
  },
  {
    companyName: 'Caremax',
    logoUrl: 'https://hl-associates.in/images/clients/caremax.webp',
    contactName: 'Sunil Nair',
    contactTitle: 'VP - Commercial & RA',
    email: 'sunil@caremaxhealth.com',
    phone: '+91 98480 77889',
    address: 'Caremax Complex, Road No. 36, Jubilee Hills, Hyderabad 500033',
    taxId: 'GSTIN-36AABCC9012Y1Z8',
    industry: 'Patient Multipara Monitors & ECG Recording Systems',
    serviceCodes: ['SRV-CDSCO-IMP', 'SRV-ISO13485'],
    fee: 390000,
    expiryMonthsAhead: 6,
  },
  {
    companyName: 'Zymeck India',
    logoUrl: 'https://hl-associates.in/images/clients/zymeck-india.webp',
    contactName: 'Arvind Varma',
    contactTitle: 'Head of Quality Compliance',
    email: 'regulatory@zymeck.in',
    phone: '+91 98255 88990',
    address: 'Plot 104, Sanand GIDC Phase-II, Ahmedabad, Gujarat 382110',
    taxId: 'GSTIN-24AABCZ3456Z1Z9',
    industry: 'Antiseptic Solutions, Surgical Scrubs & Disinfectants',
    serviceCodes: ['SRV-CDSCO-MFG'],
    fee: 270000,
    expiryMonthsAhead: 16,
  },
  {
    companyName: 'Dispowell Surgicals',
    logoUrl: 'https://hl-associates.in/images/clients/dispowell-surgicals.webp',
    contactName: 'Tarun Kapoor',
    contactTitle: 'Director',
    email: 'tarun@dispowell.com',
    phone: '+91 98100 22334',
    address: 'Sector 24, Plot 18, Faridabad, Haryana 121005',
    taxId: 'GSTIN-06AABCD7890A1Z0',
    industry: 'Hypodermic Syringes, Needles & Scalp Vein Sets',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485', 'SRV-CEMDR'],
    fee: 510000,
    expiryMonthsAhead: 10,
  },
  {
    companyName: 'Plantech Medical Systems',
    logoUrl: 'https://hl-associates.in/images/clients/plantech-medical.webp',
    contactName: 'Sanjay Shah',
    contactTitle: 'Technical Director',
    email: 'regulatory@plantechmedical.com',
    phone: '+91 98242 33445',
    address: 'Survey 112, Sardar Patel Ring Road, Vastral, Ahmedabad 382418',
    taxId: 'GSTIN-24AABCP1234B1Z1',
    industry: 'Modular Operation Theatres & Gas Alarm Panels',
    serviceCodes: ['SRV-ISO13485', 'SRV-CDSCO-MFG'],
    fee: 330000,
    expiryMonthsAhead: 3,
  },
  {
    companyName: 'My Vision Medical',
    logoUrl: 'https://hl-associates.in/images/clients/my-vision-medical.webp',
    contactName: 'Dr. Jayesh Dave',
    contactTitle: 'Chief Medical Officer',
    email: 'compliance@myvisionmed.com',
    phone: '+91 98256 44556',
    address: 'MyVision Park, Near Umiya Circle, Sanand, Gujarat 382110',
    taxId: 'GSTIN-24AABCM5678C1Z2',
    industry: 'Hydrophilic Intraocular Lenses (IOL) & Ophthalmic Blades',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-CEMDR'],
    fee: 490000,
    expiryMonthsAhead: 12,
  },
  {
    companyName: 'MAP Industries',
    logoUrl: 'https://hl-associates.in/images/clients/map-industries.webp',
    contactName: 'Mahendra Patel',
    contactTitle: 'Managing Partner',
    email: 'map@mapindustries.in',
    phone: '+91 98243 55667',
    address: 'Plot 310, Phase 1, GIDC Naroda, Ahmedabad, Gujarat 382330',
    taxId: 'GSTIN-24AABCM9012D1Z3',
    industry: 'Industrial Steam Autoclaves & ETO Sterilization Plants',
    serviceCodes: ['SRV-ISO13485'],
    fee: 240000,
    expiryMonthsAhead: 8,
  },
  {
    companyName: 'Gita Mediquip',
    logoUrl: 'https://hl-associates.in/images/clients/gita-mediquip.webp',
    contactName: 'Chetan Mistry',
    contactTitle: 'General Manager',
    email: 'regulatory@gitamediquip.com',
    phone: '+91 98257 66778',
    address: 'Plot 505/1, GIDC Makarpura, Vadodara, Gujarat 390010',
    taxId: 'GSTIN-24AABCG3456E1Z4',
    industry: 'Motorized ICU Hospital Beds & Patient Transfer Trolleys',
    serviceCodes: ['SRV-ISO13485', 'SRV-CDSCO-MFG'],
    fee: 350000,
    expiryMonthsAhead: 11,
  },
  {
    companyName: 'Sun Sterifaab',
    logoUrl: 'https://hl-associates.in/images/clients/sun-sterifaab.webp',
    contactName: 'Anand Rathod',
    contactTitle: 'Quality & RA Lead',
    email: 'qa@sunsterifaab.com',
    phone: '+91 98793 77889',
    address: 'Sun Park, GIDC Por-Ramangamdi, NH-8, Vadodara 391243',
    taxId: 'GSTIN-24AABCS7890F1Z5',
    industry: 'Tyvek Medical Packaging & Heat Seal Sterilization Reels',
    serviceCodes: ['SRV-ISO13485', 'SRV-FSC'],
    fee: 290000,
    expiryMonthsAhead: 5,
  },
  {
    companyName: 'Medress',
    logoUrl: 'https://hl-associates.in/images/clients/medress.webp',
    contactName: 'Nilesh Vora',
    contactTitle: 'Managing Director',
    email: 'info@medress.in',
    phone: '+91 98258 88990',
    address: 'Medress House, GIDC Lodhika, Metoda, Rajkot, Gujarat 360021',
    taxId: 'GSTIN-24AABCM1234G1Z6',
    industry: 'Hydrocolloid & Alginate Advanced Wound Dressings',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-CEMDR'],
    fee: 470000,
    expiryMonthsAhead: 14,
  },
  {
    companyName: 'Scure',
    logoUrl: 'https://hl-associates.in/images/clients/scure.webp',
    contactName: 'Pranav Shah',
    contactTitle: 'Compliance Officer',
    email: 'regulatory@scuremed.com',
    phone: '+91 98244 99001',
    address: 'Scure Tech Hub, Kathwada GIDC, Ahmedabad 382430',
    taxId: 'GSTIN-24AABCS5678H1Z7',
    industry: 'Safety IV Cannulas & Spinal Needles',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-FDA510K'],
    fee: 560000,
    expiryMonthsAhead: 9,
  },
  {
    companyName: 'a+m',
    logoUrl: 'https://hl-associates.in/images/clients/a-plus-m.webp',
    contactName: 'Amit Patel',
    contactTitle: 'Partner',
    email: 'contact@aplusm.in',
    phone: '+91 98259 11223',
    address: 'Survey 88, Changodar Industrial Estate, Ahmedabad 382213',
    taxId: 'GSTIN-24AABCA9012J1Z8',
    industry: 'Precision Surgical Scissors, Forceps & Titanium Clamps',
    serviceCodes: ['SRV-ISO13485', 'SRV-CDSCO-MFG'],
    fee: 310000,
    expiryMonthsAhead: 7,
  },
  {
    companyName: 'IIM',
    logoUrl: 'https://hl-associates.in/images/clients/iim.webp',
    contactName: 'Prof. Sandeep Roy',
    contactTitle: 'Incubation & MedTech Lead',
    email: 'medtech@iimahd.ernet.in',
    phone: '+91 79 7152 4000',
    address: 'CIIE.CO, IIM Ahmedabad New Campus, Vastrapur, Ahmedabad 380015',
    taxId: 'GSTIN-24AAATI0123K1Z9',
    industry: 'Healthcare AI & Next-Gen Diagnostic Innovations',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485'],
    fee: 420000,
    expiryMonthsAhead: 15,
  },
  {
    companyName: 'Mofatlal',
    logoUrl: 'https://hl-associates.in/images/clients/mofatlal.webp',
    contactName: 'Gaurav Mofatlal',
    contactTitle: 'Director',
    email: 'gaurav@mofatlaltextiles.com',
    phone: '+91 98250 33445',
    address: 'Mofatlal Compound, Rakhial, Ahmedabad, Gujarat 380023',
    taxId: 'GSTIN-24AABCM3456L1Z0',
    industry: 'Antimicrobial Hospital Linens, Scrub Suits & Patient Gowns',
    serviceCodes: ['SRV-ISO13485'],
    fee: 210000,
    expiryMonthsAhead: 18,
  },
  {
    companyName: 'Dusons',
    logoUrl: 'https://hl-associates.in/images/clients/dusons.webp',
    contactName: 'Prakash Duson',
    contactTitle: 'Head of Operations',
    email: 'prakash@dusons.in',
    phone: '+91 98245 44556',
    address: 'Plot 15, Sector 5, Gandhinagar Electronic Estate 382016',
    taxId: 'GSTIN-24AABCD7890M1Z1',
    industry: 'Dental Ultrasonic Scalers & Electrosurgical Units',
    serviceCodes: ['SRV-CDSCO-MFG', 'SRV-ISO13485'],
    fee: 340000,
    expiryMonthsAhead: 4,
  },
  {
    companyName: 'Milestone Preservatives',
    logoUrl: 'https://hl-associates.in/images/clients/milestone-preservatives.webp',
    contactName: 'Dr. Ramesh Kothari',
    contactTitle: 'Technical Director',
    email: 'regulatory@milestonepreservatives.com',
    phone: '+91 98794 55667',
    address: 'Plot 78, GIDC Panoli, Ankleshwar, Gujarat 394116',
    taxId: 'GSTIN-24AABCM1234N1Z2',
    industry: 'Bio-Preservatives, Diagnostic Reagents & Buffer Solutions',
    serviceCodes: ['SRV-ISO13485', 'SRV-CDSCO-MFG'],
    fee: 360000,
    expiryMonthsAhead: 10,
  },
  {
    companyName: 'Manmohan Minerals & Chemicals',
    logoUrl: 'https://hl-associates.in/images/clients/manmohan-minerals.webp',
    contactName: 'Manmohan Gupta',
    contactTitle: 'Managing Director',
    email: 'info@manmohanminerals.com',
    phone: '+91 98251 66778',
    address: 'Industrial Plot 99, GIDC Vapi, Valsad, Gujarat 396195',
    taxId: 'GSTIN-24AABCM5678P1Z3',
    industry: 'Pharma Grade Calcium Carbonate & Excipient Minerals',
    serviceCodes: ['SRV-ISO13485', 'SRV-FSC'],
    fee: 280000,
    expiryMonthsAhead: 12,
  },
];

async function seed() {
  console.log('Seeding HL Associates official client portfolio...');

  const services = await prisma.service.findMany();
  const serviceMap = new Map(services.map((s) => [s.code, s]));

  const users = await prisma.user.findMany({ where: { role: 'SALES' } });
  const salesUserIds = users.length > 0 ? users.map((u) => u.id) : [];

  let clientCounter = 1007;

  for (let i = 0; i < hlClients.length; i++) {
    const item = hlClients[i];
    const clientNumber = `#CL-${clientCounter++}`;

    // Select assigned sales manager round-robin
    const assignedToId = salesUserIds.length > 0 ? salesUserIds[i % salesUserIds.length] : null;

    // Check if client exists by company name
    const existing = await prisma.client.findFirst({
      where: { companyName: item.companyName },
    });

    let clientId = existing?.id;

    if (!existing) {
      const created = await prisma.client.create({
        data: {
          clientNumber,
          companyName: item.companyName,
          logoUrl: item.logoUrl,
          contactName: item.contactName,
          contactTitle: item.contactTitle,
          email: item.email,
          phone: item.phone,
          address: item.address,
          taxId: item.taxId,
          status: ClientStatus.ACTIVE,
          assignedToId,
        },
      });
      clientId = created.id;
      console.log(`Created client: ${item.companyName} (${clientNumber})`);
    } else {
      // Update logo and contact info
      await prisma.client.update({
        where: { id: existing.id },
        data: {
          logoUrl: item.logoUrl,
          contactName: item.contactName,
          contactTitle: item.contactTitle,
          email: item.email,
          phone: item.phone,
          address: item.address,
          taxId: item.taxId,
        },
      });
      console.log(`Updated client: ${item.companyName}`);
    }

    if (!clientId) continue;

    // Add assigned services
    for (const sCode of item.serviceCodes) {
      const srv = serviceMap.get(sCode);
      if (!srv) continue;

      const existingCS = await prisma.clientService.findFirst({
        where: { clientId, serviceId: srv.id },
      });

      if (!existingCS) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6); // Started 6 months ago

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + item.expiryMonthsAhead);

        const isExpiringSoon = item.expiryMonthsAhead <= 1;

        const cs = await prisma.clientService.create({
          data: {
            clientId,
            serviceId: srv.id,
            serviceCodeSnapshot: srv.code,
            serviceNameSnapshot: `${srv.name} (${item.industry.split(' ')[0]})`,
            scopeSnapshot: `Comprehensive regulatory compliance filings for ${item.industry}`,
            certificateNumber: `HLA-${sCode.replace('SRV-', '')}-${Math.floor(100000 + Math.random() * 900000)}`,
            startDate,
            expiryDate,
            fee: item.fee,
            currency: 'INR',
            status: isExpiringSoon ? 'EXPIRING_SOON' : 'ACTIVE',
          },
        });

        // Add renewal scheduled milestone
        const renewalDate = new Date(expiryDate);
        renewalDate.setDate(renewalDate.getDate() - 30); // 30 days before expiry

        await prisma.renewal.create({
          data: {
            clientServiceId: cs.id,
            stage: RenewalStage.THIRTY_DAYS,
            scheduledDate: renewalDate,
            status: isExpiringSoon ? RenewalStatus.REMINDER_SENT : RenewalStatus.PENDING,
            notes: `Annual compliance renewal audit for ${srv.name}.`,
          },
        });
      }
    }
  }

  console.log('✅ Successfully seeded all 33 HL Associates clients and services!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

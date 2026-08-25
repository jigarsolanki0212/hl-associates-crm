import { PrismaClient, RoleName, InquiryStatus, InquirySource, ProformaStatus, ClientStatus, ClientServiceStatus, RenewalStage, RenewalStatus, FollowUpType, FollowUpStatus, AuditAction, AuditEntityType, ValidityUnit } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, subDays, addMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding HL Associates Sales CRM database with realistic dynamic data...');

  // 1. Clean existing records
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.emailEvent.deleteMany();
  await prisma.renewal.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.proformaItem.deleteMany();
  await prisma.proforma.deleteMany();
  await prisma.clientService.deleteMany();
  await prisma.inquiryNote.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.client.deleteMany();
  await prisma.service.deleteMany();
  await prisma.sequenceCounter.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.companySettings.deleteMany();

  // 2. Company Settings
  await prisma.companySettings.create({
    data: {
      id: 'default',
      companyName: 'HL Associates',
      brandTagline: 'Regulatory Compliance & Consulting Services',
      email: 'contact@hlassociates.com',
      phone: '+91 (022) 2842-1933',
      address: '100 Compliance Tower, Nariman Point, Mumbai 400021, India',
      taxId: 'GSTIN-27AABCH1234F1Z5',
      currency: 'INR',
      defaultTaxRate: 18.0,
      companyTimezone: 'Asia/Kolkata',
      isSmtpConfigured: true,
      renewalReminderDays: '60,30,7,0',
    },
  });

  // 3. Seed Users
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hlassociates.com',
      passwordHash,
      fullName: 'Alex Mercer',
      role: RoleName.ADMIN,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const sarahUser = await prisma.user.create({
    data: {
      email: 'sales@hlassociates.com',
      passwordHash,
      fullName: 'Sarah Jenkins',
      role: RoleName.SALES,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const beatriceUser = await prisma.user.create({
    data: {
      email: 'beatrice@hlassociates.com',
      passwordHash,
      fullName: 'Beatrice',
      role: RoleName.SALES,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  });

  const alexanderUser = await prisma.user.create({
    data: {
      email: 'alexander@hlassociates.com',
      passwordHash,
      fullName: 'Alexander',
      role: RoleName.SALES,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const jigarUser = await prisma.user.create({
    data: {
      email: 'jigar@hlassociates.com',
      passwordHash,
      fullName: 'Jigar',
      role: RoleName.SALES,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 4. Seed Services
  const isoService = await prisma.service.create({
    data: {
      code: 'SRV-ISO13485',
      name: 'ISO 13485',
      category: 'Quality Management Systems',
      description: 'Medical devices quality management systems requirements for regulatory purposes.',
      detailedScope: 'Comprehensive QMS audit, documentation preparation, gap analysis, and certification audit support.',
      suggestedPriceMin: 150000,
      suggestedPriceMax: 250000,
      pricingType: 'RANGE',
      defaultDuration: 12,
      durationUnit: ValidityUnit.MONTHS,
      isActive: true,
    },
  });

  const ceService = await prisma.service.create({
    data: {
      code: 'SRV-CEMDR',
      name: 'CE / EU MDR',
      category: 'European Compliance',
      description: 'European Union Medical Device Regulation compliance and technical file preparation.',
      detailedScope: 'MDR 2017/745 technical documentation, Clinical Evaluation Report (CER), Post-Market Surveillance (PMS).',
      suggestedPriceMin: 200000,
      suggestedPriceMax: 450000,
      pricingType: 'RANGE',
      defaultDuration: 24,
      durationUnit: ValidityUnit.MONTHS,
      isActive: true,
    },
  });

  const fdaService = await prisma.service.create({
    data: {
      code: 'SRV-FDA510K',
      name: 'FDA 510(k)',
      category: 'US FDA',
      description: 'Premarket notification for demonstrating device safety and effectiveness.',
      detailedScope: 'Substantial equivalence determination, testing review, FDA eSTAR submission compilation.',
      suggestedPriceMin: null,
      suggestedPriceMax: null,
      pricingType: 'CUSTOM',
      defaultDuration: 12,
      durationUnit: ValidityUnit.MONTHS,
      isActive: false, // Matches switch state in Screenshot 5
    },
  });

  const cdscoMfgService = await prisma.service.create({
    data: {
      code: 'SRV-CDSCO-MFG',
      name: 'CDSCO Manufacturing License',
      category: 'Indian Regulatory',
      description: 'Medical device manufacturing licensing under Medical Device Rules 2017 (MD-5 / MD-9).',
      detailedScope: 'Plant layout evaluation, device master file preparation, state/central licensing liaison.',
      suggestedPriceMin: 180000,
      suggestedPriceMax: 300000,
      pricingType: 'RANGE',
      defaultDuration: 36,
      durationUnit: ValidityUnit.MONTHS,
      isActive: true,
    },
  });

  const cdscoImportService = await prisma.service.create({
    data: {
      code: 'SRV-CDSCO-IMP',
      name: 'CDSCO Import License',
      category: 'Indian Regulatory',
      description: 'Import license registration (MD-15) for overseas medical device manufacturers in India.',
      detailedScope: 'Authorized Indian Agent representation, SUGAM portal filing, predicate comparison.',
      suggestedPriceMin: 150000,
      suggestedPriceMax: 280000,
      pricingType: 'RANGE',
      defaultDuration: 36,
      durationUnit: ValidityUnit.MONTHS,
      isActive: true,
    },
  });

  const fscService = await prisma.service.create({
    data: {
      code: 'SRV-FSC',
      name: 'Free Sale Certificate',
      category: 'Export Compliance',
      description: 'Export facilitation and Free Sale Certificate issuance support from regulatory authorities.',
      suggestedPriceMin: 50000,
      suggestedPriceMax: 90000,
      pricingType: 'RANGE',
      defaultDuration: 12,
      durationUnit: ValidityUnit.MONTHS,
      isActive: true,
    },
  });

  // 5. Sequence Counters
  await prisma.sequenceCounter.createMany({
    data: [
      { id: 'INQUIRY', currentValue: 1042 },
      { id: 'CLIENT', currentValue: 1010 },
      { id: `PROFORMA_${new Date().getFullYear()}`, currentValue: 104 },
    ],
  });

  // 6. Seed Inquiries (Matching Screenshot 2 & 3)
  const inqVanguard = await prisma.inquiry.create({
    data: {
      inquiryNumber: '#INQ-1042',
      companyName: 'Vanguard Holdings Ltd.',
      contactName: 'Sarah Jenkins',
      contactTitle: 'Director',
      email: 'm.chang@vanguardholdings.com',
      phone: '+1 (555) 842-1933',
      source: InquirySource.REFERRAL,
      sourceDetail: 'Direct Referral (via Partners)',
      status: InquiryStatus.NEW,
      serviceId: isoService.id,
      serviceScope: 'Regulatory Compliance Audit (Q3). Client is seeking a comprehensive regulatory compliance audit for their new FinTech subsidiary operating in the EU and UK jurisdictions. The scope needs to cover data localization requirements, KYC/AML frameworks, and initial preparation for the upcoming digital operational resilience act (DORA). They mentioned an urgent timeline due to a pending Series B funding round expected to close in late November.',
      remarks: 'Series B closing soon, needs immediate attention.',
      assignedToId: sarahUser.id,
      createdAt: new Date(),
    },
  });

  const inqApex = await prisma.inquiry.create({
    data: {
      inquiryNumber: '#INQ-1041',
      companyName: 'Apex Global',
      contactName: 'Michael Chang',
      contactTitle: 'VP Quality',
      email: 'michael.chang@apexglobal.com',
      phone: '+1 (555) 234-5678',
      source: InquirySource.WEBSITE,
      sourceDetail: 'Web Form submission',
      status: InquiryStatus.PROFORMA_SENT,
      serviceId: ceService.id,
      serviceScope: 'Tax Compliance Review & EU MDR dossier validation.',
      remarks: 'Proforma proposal sent yesterday. Awaiting board review.',
      assignedToId: beatriceUser.id,
      createdAt: subDays(new Date(), 1),
    },
  });

  const inqMeridian = await prisma.inquiry.create({
    data: {
      inquiryNumber: '#INQ-1040',
      companyName: 'Meridian Corp',
      contactName: 'Elena Rostova',
      contactTitle: 'Head of Regulatory Affairs',
      email: 'elena.rostova@meridiancorp.com',
      phone: '+44 20 7946 0912',
      source: InquirySource.CONFERENCE,
      sourceDetail: 'MedTech Europe Summit 2026',
      status: InquiryStatus.ACCEPTED,
      serviceId: ceService.id,
      serviceScope: 'M&A Due Diligence & Technical dossier gap remediation.',
      remarks: 'Client accepted proposal. Ready to convert to full client.',
      assignedToId: alexanderUser.id,
      createdAt: subDays(new Date(), 4),
    },
  });

  // Seed Inquiry Notes and Activity for #INQ-1042
  await prisma.inquiryNote.create({
    data: {
      inquiryId: inqVanguard.id,
      authorId: sarahUser.id,
      content: 'Spoke with Michael Chang regarding Q3 audit scope. Client requested rush delivery.',
    },
  });

  await prisma.activityLog.createMany({
    data: [
      {
        userId: sarahUser.id,
        action: AuditAction.INQUIRY_CREATED,
        entityType: AuditEntityType.INQUIRY,
        entityId: inqVanguard.id,
        inquiryId: inqVanguard.id,
        description: 'Inquiry Created via Web Form',
        createdAt: subDays(new Date(), 1),
      },
      {
        userId: adminUser.id,
        action: AuditAction.INQUIRY_UPDATED,
        entityType: AuditEntityType.INQUIRY,
        entityId: inqVanguard.id,
        inquiryId: inqVanguard.id,
        description: 'Status set to NEW',
        createdAt: subDays(new Date(), 1),
      },
      {
        userId: sarahUser.id,
        action: AuditAction.INQUIRY_UPDATED,
        entityType: AuditEntityType.INQUIRY,
        entityId: inqVanguard.id,
        inquiryId: inqVanguard.id,
        description: 'Inquiry Assigned to Sarah Jenkins',
        createdAt: new Date(),
      },
    ],
  });

  // 7. Seed Clients and Active Services with Dynamic Relative Expiries
  // Client 1: MedTech Innovations Ltd. (Urgent - Expiring in +12 days)
  const clientMedTech = await prisma.client.create({
    data: {
      clientNumber: '#CL-1001',
      companyName: 'MedTech Innovations Ltd.',
      contactName: 'David Miller',
      contactTitle: 'Managing Director',
      email: 'dmiller@medtechinnovations.com',
      phone: '+91 98200 12345',
      address: 'Plot 42, Electronic City, Bengaluru 560100',
      taxId: 'GSTIN-29AAACM1234F1Z1',
      status: ClientStatus.ACTIVE,
      assignedToId: sarahUser.id,
    },
  });

  const csMedTech = await prisma.clientService.create({
    data: {
      clientId: clientMedTech.id,
      serviceId: isoService.id,
      serviceNameSnapshot: 'ISO 13485 Renewal',
      serviceCodeSnapshot: 'SRV-ISO13485',
      scopeSnapshot: 'Annual QMS recertification audit & surveillance support.',
      certificateNumber: 'CERT-ISO-89421',
      startDate: subDays(new Date(), 353),
      durationValue: 12,
      durationUnit: ValidityUnit.MONTHS,
      expiryDate: addDays(new Date(), 12), // +12 days (Urgent)
      status: ClientServiceStatus.EXPIRING_SOON,
      fee: 220000,
      currency: 'INR',
    },
  });

  await prisma.renewal.create({
    data: {
      clientServiceId: csMedTech.id,
      stage: RenewalStage.THIRTY_DAYS,
      scheduledDate: subDays(new Date(), 18),
      status: RenewalStatus.REMINDER_SENT,
      sentAt: subDays(new Date(), 18),
      notes: '30-day renewal reminder dispatched to dmiller@medtechinnovations.com',
    },
  });

  // Client 2: Global BioPharma Corp (Action Needed - Expiring in +25 days)
  const clientBioPharma = await prisma.client.create({
    data: {
      clientNumber: '#CL-1002',
      companyName: 'Global BioPharma Corp',
      contactName: 'Elena Gilbert',
      contactTitle: 'Quality Head',
      email: 'egilbert@globalbiopharma.com',
      phone: '+44 20 7123 4567',
      address: '25 Silicon Roundabout, London EC1V 1AB',
      status: ClientStatus.ACTIVE,
      assignedToId: beatriceUser.id,
    },
  });

  await prisma.clientService.create({
    data: {
      clientId: clientBioPharma.id,
      serviceId: ceService.id,
      serviceNameSnapshot: 'CE Mark Technical File',
      serviceCodeSnapshot: 'SRV-CEMDR',
      scopeSnapshot: 'MDR Annex II technical documentation maintenance.',
      certificateNumber: 'MDR-CE-2024-991',
      startDate: subDays(new Date(), 340),
      durationValue: 12,
      durationUnit: ValidityUnit.MONTHS,
      expiryDate: addDays(new Date(), 25), // +25 days (Action Needed)
      status: ClientServiceStatus.EXPIRING_SOON,
      fee: 380000,
      currency: 'INR',
    },
  });

  // Client 3: Surgical Systems GmbH (Normal - Expiring in +37 days)
  const clientSurgical = await prisma.client.create({
    data: {
      clientNumber: '#CL-1003',
      companyName: 'Surgical Systems GmbH',
      contactName: 'Hans Gruber',
      contactTitle: 'Chief Compliance Officer',
      email: 'hgruber@surgicalsystems.de',
      phone: '+49 30 9876543',
      address: 'Industriestrasse 14, 70565 Stuttgart, Germany',
      status: ClientStatus.ACTIVE,
      assignedToId: alexanderUser.id,
    },
  });

  await prisma.clientService.create({
    data: {
      clientId: clientSurgical.id,
      serviceId: cdscoMfgService.id,
      serviceNameSnapshot: 'CDSCO Registration',
      serviceCodeSnapshot: 'SRV-CDSCO-MFG',
      scopeSnapshot: 'Form MD-9 Manufacturing License maintenance.',
      certificateNumber: 'CDSCO-MFG-2023-88',
      startDate: subDays(new Date(), 328),
      durationValue: 12,
      durationUnit: ValidityUnit.MONTHS,
      expiryDate: addDays(new Date(), 37), // +37 days (Normal)
      status: ClientServiceStatus.ACTIVE,
      fee: 250000,
      currency: 'INR',
    },
  });

  // Client 4: CardioTech Solutions (Normal - Expiring in +49 days)
  const clientCardioTech = await prisma.client.create({
    data: {
      clientNumber: '#CL-1004',
      companyName: 'CardioTech Solutions',
      contactName: 'Rachel Green',
      contactTitle: 'VP Regulatory Affairs',
      email: 'rgreen@cardiotech.com',
      phone: '+1 (555) 789-0123',
      address: '800 Innovation Way, Boston, MA 02115',
      status: ClientStatus.ACTIVE,
      assignedToId: jigarUser.id,
    },
  });

  await prisma.clientService.create({
    data: {
      clientId: clientCardioTech.id,
      serviceId: fdaService.id,
      serviceNameSnapshot: 'FDA 510(k) Clearance',
      serviceCodeSnapshot: 'SRV-FDA510K',
      scopeSnapshot: 'FDA annual facility registration & device listing review.',
      certificateNumber: 'FDA-K240189',
      startDate: subDays(new Date(), 316),
      durationValue: 12,
      durationUnit: ValidityUnit.MONTHS,
      expiryDate: addDays(new Date(), 49), // +49 days (Normal)
      status: ClientServiceStatus.ACTIVE,
      fee: 450000,
      currency: 'INR',
    },
  });

  // Client 5: Acme Corporation (Matches Screenshot 4)
  const clientAcme = await prisma.client.create({
    data: {
      clientNumber: '#CL-1005',
      companyName: 'Acme Corporation',
      contactName: 'Marcus Thorne',
      contactTitle: 'Chief Executive Officer',
      email: 'mthorne@acmecorp.com',
      phone: '+1 (555) 345-6789',
      status: ClientStatus.ACTIVE,
      assignedToId: jigarUser.id,
    },
  });

  await prisma.clientService.create({
    data: {
      clientId: clientAcme.id,
      serviceId: isoService.id,
      serviceNameSnapshot: 'Compliance Audit Q3',
      serviceCodeSnapshot: 'SRV-ISO13485',
      scopeSnapshot: 'Comprehensive corporate regulatory compliance audit.',
      certificateNumber: 'AUD-Q3-2026',
      startDate: subDays(new Date(), 320),
      durationValue: 12,
      durationUnit: ValidityUnit.MONTHS,
      expiryDate: addDays(new Date(), 45), // +45 days
      status: ClientServiceStatus.ACTIVE,
      fee: 280000,
      currency: 'INR',
    },
  });

  // Expired Client 6: Apex Medical Labs (Expired 5 days ago)
  const clientExpired = await prisma.client.create({
    data: {
      clientNumber: '#CL-1006',
      companyName: 'Apex Medical Labs',
      contactName: 'Vikram Mehta',
      contactTitle: 'Director',
      email: 'vikram@apexmedlab.in',
      phone: '+91 98111 22233',
      status: ClientStatus.ACTIVE,
      assignedToId: sarahUser.id,
    },
  });

  await prisma.clientService.create({
    data: {
      clientId: clientExpired.id,
      serviceId: fscService.id,
      serviceNameSnapshot: 'Free Sale Certificate',
      serviceCodeSnapshot: 'SRV-FSC',
      scopeSnapshot: 'Export Free Sale Certificate validation.',
      startDate: subDays(new Date(), 370),
      durationValue: 12,
      durationUnit: ValidityUnit.MONTHS,
      expiryDate: subDays(new Date(), 5), // -5 days (Expired)
      status: ClientServiceStatus.EXPIRED,
      fee: 75000,
      currency: 'INR',
    },
  });

  // 8. Seed Proformas with Commercial Snapshots
  const proformaApex = await prisma.proforma.create({
    data: {
      proformaNumber: `PI-${new Date().getFullYear()}-0104`,
      inquiryId: inqApex.id,
      clientId: clientAcme.id,
      status: ProformaStatus.SENT,
      issueDate: subDays(new Date(), 1),
      validUntil: addDays(new Date(), 29),
      subtotal: 200000,
      taxRate: 18.0,
      taxAmount: 36000,
      totalAmount: 236000,
      currency: 'INR',
      terms: 'Payment terms: 50% advance, 50% upon regulatory dossier completion.',
      items: {
        create: [
          {
            serviceId: ceService.id,
            serviceNameSnapshot: 'CE / EU MDR Technical File Review',
            serviceCodeSnapshot: 'SRV-CEMDR',
            serviceScopeSnapshot: 'Preparation and gap analysis for MDR Class IIb technical documentation.',
            descriptionSnapshot: 'Complete regulatory dossier validation and notified body compliance checklist.',
            quantity: 1,
            unitPrice: 200000,
            taxRate: 18.0,
            amount: 200000,
          },
        ],
      },
    },
  });

  // 9. Seed Follow-ups
  await prisma.followUp.createMany({
    data: [
      {
        inquiryId: inqVanguard.id,
        assignedToId: sarahUser.id,
        type: FollowUpType.CALL,
        title: 'Call Michael Chang on Q3 Regulatory Scope',
        notes: 'Confirm whether UK MDR or EU MDR is primary priority for funding round.',
        dueDate: new Date(), // Due Today
        status: FollowUpStatus.SCHEDULED,
      },
      {
        inquiryId: inqApex.id,
        assignedToId: beatriceUser.id,
        type: FollowUpType.EMAIL,
        title: 'Follow up on Proforma PI-2026-0104',
        notes: 'Send follow-up note regarding technical committee review.',
        dueDate: subDays(new Date(), 1), // Overdue
        status: FollowUpStatus.SCHEDULED,
      },
      {
        clientId: clientMedTech.id,
        assignedToId: sarahUser.id,
        type: FollowUpType.MEETING,
        title: 'ISO 13485 Renewal Strategy Meeting',
        notes: 'Meeting with David Miller regarding urgent audit date scheduling.',
        dueDate: addDays(new Date(), 2), // Upcoming
        status: FollowUpStatus.SCHEDULED,
      },
    ],
  });

  // 10. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: adminUser.id,
        title: 'Urgent Compliance Renewal',
        message: 'MedTech Innovations Ltd. ISO 13485 Renewal is expiring in 12 days.',
        type: 'URGENT',
        link: `/clients/${clientMedTech.id}`,
      },
      {
        userId: sarahUser.id,
        title: 'New Inquiry Assigned',
        message: 'You have been assigned inquiry #INQ-1042 (Vanguard Holdings Ltd).',
        type: 'INFO',
        link: `/inquiries/${inqVanguard.id}`,
      },
      {
        userId: beatriceUser.id,
        title: 'Proforma Sent',
        message: 'Proforma PI-2026-0104 was delivered to Michael Chang.',
        type: 'SUCCESS',
        link: `/proformas/${proformaApex.id}`,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log(`Admin User: admin@hlassociates.com / Password123!`);
  console.log(`Sales User: sales@hlassociates.com / Password123!`);
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient, DealType, DealStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin and regular users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dacdeals.com' },
    update: {},
    create: {
      email: 'admin@dacdeals.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@dacdeals.com' },
    update: {},
    create: {
      email: 'user@dacdeals.com',
      name: 'Regular User',
      role: UserRole.USER,
    },
  });

  // Create mock deals with realistic data
  const mockDeals = [
    // Technology Deals
    {
      brokerage: 'TechVenture Partners',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@techventure.com',
      linkedinUrl: 'https://linkedin.com/in/sarahchen',
      workPhone: '+1-555-0101',
      dealCaption: 'SaaS Platform Acquisition',
      title: 'CloudSync Pro - Project Management SaaS',
      dealTeaser: 'Fast-growing project management platform with 2,500+ enterprise clients and 40% YoY growth',
      revenue: 12500000,
      ebitda: 3750000,
      ebitdaMargin: 30.0,
      grossRevenue: 13000000,
      askingPrice: 37500000,
      industry: 'Technology',
      dealType: DealType.MANUAL,
      sourceWebsite: 'https://techventure.com',
      companyLocation: 'San Francisco, CA',
      status: DealStatus.AVAILABLE,
      isPublished: true,
      tags: ['SaaS', 'B2B', 'High Growth'],
      chunk_text: 'Leading project management platform serving Fortune 500 companies with advanced collaboration features',
      description: 'CloudSync Pro offers comprehensive project management solutions with AI-powered analytics and seamless integrations.',
    },
    {
      brokerage: 'Innovation Capital',
      firstName: 'Michael',
      lastName: 'Rodriguez',
      email: 'mrodriguez@innovcap.com',
      linkedinUrl: 'https://linkedin.com/in/michaelrodriguez',
      workPhone: '+1-555-0102',
      dealCaption: 'E-commerce Platform Exit',
      title: 'MarketPlace Hub - B2B E-commerce',
      dealTeaser: 'Specialized B2B marketplace connecting manufacturers with retailers, processing $50M+ annually',
      revenue: 8750000,
      ebitda: 2625000,
      ebitdaMargin: 30.0,
      grossRevenue: 9200000,
      askingPrice: 26250000,
      industry: 'Technology',
      dealType: DealType.SCRAPED,
      sourceWebsite: 'https://innovationcapital.com',
      companyLocation: 'Austin, TX',
      status: DealStatus.AVAILABLE,
      isPublished: true,
      tags: ['E-commerce', 'B2B', 'Marketplace'],
      chunk_text: 'Established B2B marketplace with strong network effects and recurring revenue model',
      description: 'MarketPlace Hub facilitates wholesale transactions between manufacturers and retailers with integrated logistics.',
    },
    // Healthcare Deals
    {
      brokerage: 'Healthcare Ventures',
      firstName: 'Dr. Jennifer',
      lastName: 'Walsh',
      email: 'jwalsh@healthventures.com',
      linkedinUrl: 'https://linkedin.com/in/drjenniferwalsh',
      workPhone: '+1-555-0201',
      dealCaption: 'Medical Device Manufacturer',
      title: 'PrecisionMed Devices - Surgical Instruments',
      dealTeaser: 'FDA-approved surgical instrument manufacturer with 20+ patents and growing international presence',
      revenue: 15750000,
      ebitda: 4725000,
      ebitdaMargin: 30.0,
      grossRevenue: 16500000,
      askingPrice: 47250000,
      industry: 'Healthcare',
      dealType: DealType.MANUAL,
      sourceWebsite: 'https://healthcareventures.com',
      companyLocation: 'Boston, MA',
      status: DealStatus.UNDER_CONTRACT,
      isPublished: true,
      tags: ['Medical Devices', 'FDA Approved', 'Patents'],
      chunk_text: 'Leading manufacturer of precision surgical instruments with strong IP portfolio',
      description: 'PrecisionMed develops and manufactures high-quality surgical instruments used in minimally invasive procedures.',
    },
    {
      brokerage: 'MedTech Advisors',
      firstName: 'Robert',
      lastName: 'Kim',
      email: 'rkim@medtechadvisors.com',
      workPhone: '+1-555-0202',
      dealCaption: 'Telehealth Platform',
      title: 'VirtualCare Connect - Telemedicine',
      dealTeaser: 'HIPAA-compliant telehealth platform serving 150+ healthcare providers with 500K+ patient interactions',
      revenue: 6250000,
      ebitda: 1875000,
      ebitdaMargin: 30.0,
      grossRevenue: 6875000,
      askingPrice: 18750000,
      industry: 'Healthcare',
      dealType: DealType.AI_INFERRED,
      sourceWebsite: 'https://medtechadvisors.com',
      companyLocation: 'Seattle, WA',
      status: DealStatus.AVAILABLE,
      isPublished: false,
      isReviewed: true,
      tags: ['Telehealth', 'HIPAA', 'SaaS'],
      chunk_text: 'Comprehensive telemedicine platform with integrated EMR and billing systems',
      description: 'VirtualCare Connect enables remote patient consultations with advanced diagnostic tools and secure communications.',
    },
    // Manufacturing Deals
    {
      brokerage: 'Industrial Partners',
      firstName: 'David',
      lastName: 'Thompson',
      email: 'dthompson@industrialpartners.com',
      linkedinUrl: 'https://linkedin.com/in/davidthompson',
      workPhone: '+1-555-0301',
      dealCaption: 'Auto Parts Manufacturing',
      title: 'Precision Auto Components - OEM Supplier',
      dealTeaser: 'Tier-1 automotive supplier with long-term contracts and advanced manufacturing capabilities',
      revenue: 28500000,
      ebitda: 5700000,
      ebitdaMargin: 20.0,
      grossRevenue: 29750000,
      askingPrice: 57000000,
      industry: 'Manufacturing',
      dealType: DealType.MANUAL,
      sourceWebsite: 'https://industrialpartners.com',
      companyLocation: 'Detroit, MI',
      status: DealStatus.AVAILABLE,
      isPublished: true,
      tags: ['Automotive', 'OEM', 'Manufacturing'],
      chunk_text: 'Established Tier-1 automotive supplier with ISO certifications and lean manufacturing processes',
      description: 'Precision Auto Components manufactures critical engine and transmission components for major auto manufacturers.',
    },
    {
      brokerage: 'Manufacturing Solutions',
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'landerson@mfgsolutions.com',
      workPhone: '+1-555-0302',
      dealCaption: 'Food Processing Equipment',
      title: 'FoodTech Systems - Processing Equipment',
      dealTeaser: 'Specialized food processing equipment manufacturer with global customer base and recurring service revenue',
      revenue: 18750000,
      ebitda: 3750000,
      ebitdaMargin: 20.0,
      grossRevenue: 19500000,
      askingPrice: 37500000,
      industry: 'Manufacturing',
      dealType: DealType.SCRAPED,
      sourceWebsite: 'https://manufacturingsolutions.com',
      companyLocation: 'Milwaukee, WI',
      status: DealStatus.AVAILABLE,
      isPublished: true,
      seen: true,
      tags: ['Food Processing', 'Equipment', 'Global'],
      chunk_text: 'Leading provider of automated food processing equipment with strong aftermarket services',
      description: 'FoodTech Systems designs and manufactures automated processing equipment for the global food industry.',
    },
    // Financial Services
    {
      brokerage: 'FinTech Capital',
      firstName: 'Amanda',
      lastName: 'Foster',
      email: 'afoster@fintechcap.com',
      linkedinUrl: 'https://linkedin.com/in/amandafoster',
      workPhone: '+1-555-0401',
      dealCaption: 'Payment Processing Platform',
      title: 'SecurePay Solutions - Payment Gateway',
      dealTeaser: 'PCI-compliant payment processing platform handling $200M+ annual transaction volume',
      revenue: 7500000,
      ebitda: 2625000,
      ebitdaMargin: 35.0,
      grossRevenue: 7875000,
      askingPrice: 26250000,
      industry: 'Financial Services',
      dealType: DealType.MANUAL,
      sourceWebsite: 'https://fintechcapital.com',
      companyLocation: 'New York, NY',
      status: DealStatus.SOLD,
      isPublished: true,
      tags: ['FinTech', 'Payments', 'PCI Compliant'],
      chunk_text: 'Secure payment processing platform with advanced fraud detection and multi-currency support',
      description: 'SecurePay Solutions provides comprehensive payment processing services for e-commerce and retail businesses.',
    },
    {
      brokerage: 'Investment Advisors',
      firstName: 'Charles',
      lastName: 'Wright',
      email: 'cwright@investadvisors.com',
      workPhone: '+1-555-0402',
      dealCaption: 'Wealth Management Firm',
      title: 'Premier Wealth Advisors - RIA',
      dealTeaser: 'Independent RIA managing $500M+ AUM with high-net-worth client focus and comprehensive services',
      revenue: 5625000,
      ebitda: 1687500,
      ebitdaMargin: 30.0,
      grossRevenue: 6000000,
      askingPrice: 16875000,
      industry: 'Financial Services',
      dealType: DealType.AI_INFERRED,
      sourceWebsite: 'https://investmentadvisors.com',
      companyLocation: 'Charlotte, NC',
      status: DealStatus.AVAILABLE,
      isPublished: false,
      isReviewed: false,
      tags: ['Wealth Management', 'RIA', 'High Net Worth'],
      chunk_text: 'Established wealth management firm with strong client relationships and fee-based revenue model',
      description: 'Premier Wealth Advisors provides comprehensive financial planning and investment management services.',
    },
    // Small Business Services
    {
      brokerage: 'Business Brokers Inc',
      firstName: 'Mark',
      lastName: 'Johnson',
      email: 'mjohnson@bizbrokers.com',
      linkedinUrl: 'https://linkedin.com/in/markjohnson',
      workPhone: '+1-555-0501',
      dealCaption: 'Marketing Agency',
      title: 'Digital Growth Marketing - Full Service Agency',
      dealTeaser: 'Award-winning digital marketing agency with 50+ clients and specialized industry expertise',
      revenue: 3750000,
      ebitda: 1125000,
      ebitdaMargin: 30.0,
      grossRevenue: 4125000,
      askingPrice: 11250000,
      industry: 'Professional Services',
      dealType: DealType.MANUAL,
      sourceWebsite: 'https://businessbrokers.com',
      companyLocation: 'Denver, CO',
      status: DealStatus.AVAILABLE,
      isPublished: true,
      seen: true,
      tags: ['Marketing', 'Digital', 'Agency'],
      chunk_text: 'Full-service digital marketing agency with proven track record and recurring client relationships',
      description: 'Digital Growth Marketing specializes in comprehensive digital marketing strategies for mid-market companies.',
    },
    {
      brokerage: 'Service Business Partners',
      firstName: 'Rachel',
      lastName: 'Davis',
      email: 'rdavis@servicepartners.com',
      workPhone: '+1-555-0502',
      dealCaption: 'IT Services Firm',
      title: 'TechSupport Pro - Managed IT Services',
      dealTeaser: 'Managed IT services provider with 200+ SMB clients and strong recurring revenue base',
      revenue: 4500000,
      ebitda: 1350000,
      ebitdaMargin: 30.0,
      grossRevenue: 4750000,
      askingPrice: 13500000,
      industry: 'Technology',
      dealType: DealType.SCRAPED,
      sourceWebsite: 'https://servicepartners.com',
      companyLocation: 'Atlanta, GA',
      status: DealStatus.AVAILABLE,
      isPublished: true,
      tags: ['IT Services', 'Managed Services', 'SMB'],
      chunk_text: 'Comprehensive managed IT services with 24/7 support and cybersecurity expertise',
      description: 'TechSupport Pro provides complete IT infrastructure management and cybersecurity services for small to medium businesses.',
    },
    // Additional varied deals for testing filters
    {
      brokerage: 'Energy Transition Partners',
      firstName: 'Thomas',
      lastName: 'Green',
      email: 'tgreen@energytransition.com',
      linkedinUrl: 'https://linkedin.com/in/thomasgreen',
      workPhone: '+1-555-0601',
      dealCaption: 'Solar Installation Company',
      title: 'SolarMax Installations - Renewable Energy',
      dealTeaser: 'Residential and commercial solar installation company with 1,000+ completed projects',
      revenue: 8250000,
      ebitda: 1237500,
      ebitdaMargin: 15.0,
      grossRevenue: 8750000,
      askingPrice: 12375000,
      industry: 'Energy',
      dealType: DealType.MANUAL,
      sourceWebsite: 'https://energytransition.com',
      companyLocation: 'Phoenix, AZ',
      status: DealStatus.AVAILABLE,
      isPublished: true,
      tags: ['Solar', 'Renewable Energy', 'Installation'],
      chunk_text: 'Leading solar installation company with certified technicians and warranty programs',
      description: 'SolarMax provides turnkey solar installation services for residential and commercial properties.',
    },
    {
      brokerage: 'Logistics Advisors',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'mgarcia@logisticsadvisors.com',
      workPhone: '+1-555-0701',
      dealCaption: 'Freight Brokerage',
      title: 'FreightConnect - Transportation Services',
      dealTeaser: 'Asset-light freight brokerage with nationwide carrier network and technology platform',
      revenue: 12750000,
      ebitda: 1912500,
      ebitdaMargin: 15.0,
      grossRevenue: 13500000,
      askingPrice: 19125000,
      industry: 'Logistics',
      dealType: DealType.AI_INFERRED,
      sourceWebsite: 'https://logisticsadvisors.com',
      companyLocation: 'Chicago, IL',
      status: DealStatus.AVAILABLE,
      isPublished: false,
      isReviewed: true,
      tags: ['Freight', 'Logistics', 'Transportation'],
      chunk_text: 'Technology-enabled freight brokerage with strong carrier relationships and logistics expertise',
      description: 'FreightConnect matches shippers with qualified carriers using proprietary technology platform.',
    }
  ];

  // Create deals
  console.log('Creating deals...');
  const createdDeals = [];
  
  for (const dealData of mockDeals) {
    const deal = await prisma.deal.create({
      data: {
        ...dealData,
        userId: Math.random() > 0.5 ? adminUser.id : regularUser.id,
      },
    });
    createdDeals.push(deal);
    console.log(`Created deal: ${deal.title}`);
  }

  // Create some sample rollups
  console.log('Creating sample rollups...');
  
  // Technology rollup
  const techDeals = createdDeals.filter(deal => deal.industry === 'Technology').slice(0, 3);
  const techRollup = await prisma.rollup.create({
    data: {
      name: 'Technology Acquisition Portfolio',
      description: 'High-growth technology companies with strong SaaS metrics and recurring revenue models',
      summary: 'This rollup focuses on scalable technology businesses with proven product-market fit and strong growth trajectories. Combined revenue of $25M+ with healthy margins.',
      deals: {
        connect: techDeals.map(deal => ({ id: deal.id })),
      },
      users: {
        connect: [{ id: adminUser.id }],
      },
    },
  });

  // Healthcare rollup  
  const healthcareDeals = createdDeals.filter(deal => deal.industry === 'Healthcare');
  const healthcareRollup = await prisma.rollup.create({
    data: {
      name: 'Healthcare Innovation Rollup',
      description: 'Healthcare technology and medical device companies positioned for growth in digital health',
      summary: 'Strategic rollup of healthcare companies leveraging technology to improve patient outcomes and operational efficiency. Strong regulatory compliance and IP protection.',
      deals: {
        connect: healthcareDeals.map(deal => ({ id: deal.id })),
      },
      users: {
        connect: [{ id: adminUser.id }, { id: regularUser.id }],
      },
    },
  });

  // Manufacturing rollup
  const mfgDeals = createdDeals.filter(deal => deal.industry === 'Manufacturing');
  const mfgRollup = await prisma.rollup.create({
    data: {
      name: 'Industrial Manufacturing Consolidation',
      description: 'Established manufacturing companies with strong customer relationships and operational excellence',
      summary: 'Platform for consolidating complementary manufacturing businesses with opportunities for operational synergies and cross-selling. Combined revenue exceeding $47M.',
      deals: {
        connect: mfgDeals.map(deal => ({ id: deal.id })),
      },
      users: {
        connect: [{ id: regularUser.id }],
      },
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`📊 Created ${createdDeals.length} deals and 3 rollups`);
  console.log('👥 Created admin and regular user accounts');
  console.log('\nTest Accounts:');
  console.log('Admin: admin@dacdeals.com');
  console.log('User: user@dacdeals.com');
  console.log('\nDeal Statistics:');
  console.log(`Technology: ${createdDeals.filter(d => d.industry === 'Technology').length} deals`);
  console.log(`Healthcare: ${createdDeals.filter(d => d.industry === 'Healthcare').length} deals`);
  console.log(`Manufacturing: ${createdDeals.filter(d => d.industry === 'Manufacturing').length} deals`);
  console.log(`Financial Services: ${createdDeals.filter(d => d.industry === 'Financial Services').length} deals`);
  console.log(`Professional Services: ${createdDeals.filter(d => d.industry === 'Professional Services').length} deals`);
  console.log(`Energy: ${createdDeals.filter(d => d.industry === 'Energy').length} deals`);
  console.log(`Logistics: ${createdDeals.filter(d => d.industry === 'Logistics').length} deals`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
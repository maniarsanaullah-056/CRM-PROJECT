// ── Vantage CRM demo dataset ────────────────────────────────────────────────
// Dates are generated relative to "now" so charts and overdue states always
// look alive. Passwords are stored in plain text because this is a frontend-
// only demonstration — see the security note on the login page and README.
const HOUR = 3600_000
const DAY = 86400_000

const ago = (days, hours = 0) => new Date(Date.now() - days * DAY - hours * HOUR).toISOString()
const ahead = (days) => new Date(Date.now() + days * DAY).toISOString()
const monthsAgo = (m, day) => {
  const d = new Date()
  d.setMonth(d.getMonth() - m)
  d.setDate(day || 15)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}
const thisMonth = (day) => {
  const d = new Date()
  d.setDate(day)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

export const DEMO_ACCOUNTS = [
  { label: 'Owner Demo', email: 'owner@crm.com', password: 'Owner123!', role: 'Owner / Administrator' },
  { label: 'John (Sales)', email: 'john@crm.com', password: 'User123!', role: 'Team User' },
  { label: 'Sara (Accounts)', email: 'sara@crm.com', password: 'User123!', role: 'Team User' },
]

export const buildSeed = () => {
  const users = [
    { id: 'u-owner', name: 'Alex Morgan', email: 'owner@crm.com', password: 'Owner123!', role: 'owner', title: 'Founder & CEO', phone: '+1 (415) 555-0100', status: 'active', color: 'purple', joinedAt: ago(430), createdAt: ago(430) },
    { id: 'u-john', name: 'John Carter', email: 'john@crm.com', password: 'User123!', role: 'user', title: 'Senior Sales Executive', phone: '+1 (415) 555-0101', status: 'active', color: 'blue', joinedAt: ago(300), createdAt: ago(300) },
    { id: 'u-sara', name: 'Sara Malik', email: 'sara@crm.com', password: 'User123!', role: 'user', title: 'Account Manager', phone: '+1 (415) 555-0102', status: 'active', color: 'green', joinedAt: ago(260), createdAt: ago(260) },
    { id: 'u-david', name: 'David Lee', email: 'david@crm.com', password: 'User123!', role: 'user', title: 'Business Development Executive', phone: '+1 (415) 555-0103', status: 'active', color: 'orange', joinedAt: ago(180), createdAt: ago(180) },
    { id: 'u-priya', name: 'Priya Sharma', email: 'priya@crm.com', password: 'User123!', role: 'user', title: 'Sales Development Rep', phone: '+1 (415) 555-0104', status: 'inactive', color: 'red', joinedAt: ago(150), createdAt: ago(150) },
  ]

  const customers = [
    { id: 'c-01', name: 'Marcus Whitfield', email: 'marcus@northwind.com', phone: '+1 (206) 555-0181', company: 'Northwind Traders', location: 'Seattle, WA', assignedTo: 'u-john', status: 'active', createdBy: 'u-owner', createdAt: ago(148) },
    { id: 'c-02', name: 'Elena Rodriguez', email: 'elena@heliosenergy.com', phone: '+1 (512) 555-0142', company: 'Helios Energy', location: 'Austin, TX', assignedTo: 'u-sara', status: 'active', createdBy: 'u-john', createdAt: ago(132) },
    { id: 'c-03', name: 'Tom Alvarez', email: 'tom@bluepeak.io', phone: '+1 (303) 555-0117', company: 'BluePeak Solutions', location: 'Denver, CO', assignedTo: 'u-john', status: 'active', createdBy: 'u-john', createdAt: ago(121) },
    { id: 'c-04', name: 'Dr. Priya Raman', email: 'priya.raman@quantumlabs.com', phone: '+1 (650) 555-0134', company: 'Quantum Labs', location: 'Palo Alto, CA', assignedTo: 'u-david', status: 'active', createdBy: 'u-owner', createdAt: ago(104) },
    { id: 'c-05', name: 'Sofia Bennett', email: 'sofia@silverline.co', phone: '+1 (312) 555-0176', company: 'Silverline Logistics', location: 'Chicago, IL', assignedTo: 'u-sara', status: 'inactive', createdBy: 'u-sara', createdAt: ago(97) },
    { id: 'c-06', name: 'James Okafor', email: 'james@aurora-retail.com', phone: '+1 (404) 555-0128', company: 'Aurora Retail Group', location: 'Atlanta, GA', assignedTo: 'u-john', status: 'active', createdBy: 'u-john', createdAt: ago(84) },
    { id: 'c-07', name: 'Nina Kowalski', email: 'nina@nimbusfintech.com', phone: '+1 (646) 555-0190', company: 'Nimbus Fintech', location: 'New York, NY', assignedTo: 'u-david', status: 'active', createdBy: 'u-owner', createdAt: ago(73) },
    { id: 'c-08', name: 'Oliver Grant', email: 'oliver@cedarandco.com', phone: '+44 20 7946 0810', company: 'Cedar & Co', location: 'London, UK', assignedTo: 'u-sara', status: 'active', createdBy: 'u-sara', createdAt: ago(61) },
    { id: 'c-09', name: 'Rachel Kim', email: 'rachel@everlinehealth.com', phone: '+1 (858) 555-0163', company: 'Everline Health', location: 'San Diego, CA', assignedTo: 'u-john', status: 'inactive', createdBy: 'u-owner', createdAt: ago(52) },
    { id: 'c-10', name: 'Daniel Mensah', email: 'daniel@harborfinch.com', phone: '+1 (617) 555-0147', company: 'Harbor & Finch', location: 'Boston, MA', assignedTo: 'u-david', status: 'active', createdBy: 'u-david', createdAt: ago(38) },
    { id: 'c-11', name: 'Laura Chen', email: 'laura@lumenanalytics.com', phone: '+1 (206) 555-0119', company: 'Lumen Analytics', location: 'Seattle, WA', assignedTo: 'u-sara', status: 'active', createdBy: 'u-sara', createdAt: ago(24) },
    { id: 'c-12', name: 'Viktor Petrov', email: 'viktor@vertexmfg.com', phone: '+1 (216) 555-0158', company: 'Vertex Manufacturing', location: 'Cleveland, OH', assignedTo: 'u-john', status: 'active', createdBy: 'u-john', createdAt: ago(15) },
    { id: 'c-13', name: 'Aisha Rahman', email: 'aisha@orionmedia.tv', phone: '+971 4 555 0132', company: 'Orion Media', location: 'Dubai, UAE', assignedTo: 'u-david', status: 'active', createdBy: 'u-owner', createdAt: ago(9) },
    { id: 'c-14', name: 'Ben Holloway', email: 'ben@pinnaclerealty.com', phone: '+1 (702) 555-0171', company: 'Pinnacle Realty', location: 'Las Vegas, NV', assignedTo: 'u-sara', status: 'inactive', createdBy: 'u-sara', createdAt: ago(4) },
  ]

  const leads = [
    { id: 'l-01', name: 'Gregory Mason', email: 'greg@masonbuild.com', phone: '+1 (801) 555-0123', company: 'Mason Build Co', source: 'Website', status: 'new', value: 8500, assignedTo: 'u-john', createdBy: 'u-owner', createdAt: ago(2, 5) },
    { id: 'l-02', name: 'Isabella Duarte', email: 'isabella@duarteinteriors.com', phone: '+1 (786) 555-0184', company: 'Duarte Interiors', source: 'LinkedIn', status: 'contacted', value: 12000, assignedTo: 'u-sara', createdBy: 'u-sara', createdAt: ago(3, 8) },
    { id: 'l-03', name: 'Nathan Cole', email: 'nathan@colelogistics.com', phone: '+1 (901) 555-0167', company: 'Cole Logistics', source: 'Referral', status: 'qualified', value: 34000, assignedTo: 'u-john', createdBy: 'u-owner', createdAt: ago(4, 3) },
    { id: 'l-04', name: 'Mia Tanaka', email: 'mia@tanakafoods.com', phone: '+1 (808) 555-0152', company: 'Tanaka Foods', source: 'Email Campaign', status: 'new', value: 6800, assignedTo: 'u-david', createdBy: 'u-owner', createdAt: ago(5, 6) },
    { id: 'l-05', name: 'Samuel Adeyemi', email: 'sam@adeyemifin.com', phone: '+1 (212) 555-0139', company: 'Adeyemi Financial', source: 'Trade Show', status: 'contacted', value: 27500, assignedTo: 'u-david', createdBy: 'u-david', createdAt: ago(6, 2) },
    { id: 'l-06', name: 'Chloe Dubois', email: 'chloe@duboisfashion.fr', phone: '+33 1 42 68 53 00', company: 'Dubois Fashion', source: 'Website', status: 'qualified', value: 41000, assignedTo: 'u-sara', createdBy: 'u-sara', createdAt: ago(7, 9) },
    { id: 'l-07', name: 'Ethan Wright', email: 'ethan@wrightsecurity.com', phone: '+1 (410) 555-0111', company: 'Wright Security', source: 'Cold Call', status: 'converted', value: 52000, assignedTo: 'u-john', createdBy: 'u-john', createdAt: ago(9, 4) },
    { id: 'l-08', name: 'Olivia Sandström', email: 'olivia@nordwindab.se', phone: '+46 8 555 012 44', company: 'Nordwind AB', source: 'LinkedIn', status: 'lost', value: 15000, assignedTo: 'u-sara', createdBy: 'u-owner', createdAt: ago(11, 7) },
    { id: 'l-09', name: 'Liam O’Connor', email: 'liam@oconnorprint.ie', phone: '+353 1 555 0178', company: 'O’Connor Print', source: 'Referral', status: 'new', value: 9400, assignedTo: 'u-john', createdBy: 'u-john', createdAt: ago(13, 5) },
    { id: 'l-10', name: 'Ava Novak', email: 'ava@novakclinic.com', phone: '+1 (773) 555-0141', company: 'Novak Clinic', source: 'Website', status: 'contacted', value: 18750, assignedTo: 'u-david', createdBy: 'u-owner', createdAt: ago(14, 8) },
    { id: 'l-11', name: 'Lucas Meyer', email: 'lucas@meyerauto.de', phone: '+49 30 555 0186', company: 'Meyer Automotive', source: 'Trade Show', status: 'qualified', value: 63000, assignedTo: 'u-john', createdBy: 'u-owner', createdAt: ago(16, 2) },
    { id: 'l-12', name: 'Emma Rossi', email: 'emma@rossidesign.it', phone: '+39 02 555 0134', company: 'Rossi Design', source: 'Email Campaign', status: 'converted', value: 29500, assignedTo: 'u-sara', createdBy: 'u-sara', createdAt: ago(19, 6) },
    { id: 'l-13', name: 'Noah Fischer', email: 'noah@fischerlogistik.ch', phone: '+41 44 555 0112', company: 'Fischer Logistik', source: 'Cold Call', status: 'lost', value: 21000, assignedTo: 'u-david', createdBy: 'u-david', createdAt: ago(22, 3) },
    { id: 'l-14', name: 'Harper Quinn', email: 'harper@quinnpr.com', phone: '+1 (917) 555-0196', company: 'Quinn PR', source: 'LinkedIn', status: 'new', value: 11500, assignedTo: 'u-sara', createdBy: 'u-owner', createdAt: ago(1, 3) },
    { id: 'l-15', name: 'Mason Brooks', email: 'mason@brookssupply.com', phone: '+1 (615) 555-0175', company: 'Brooks Supply', source: 'Website', status: 'contacted', value: 15800, assignedTo: 'u-john', createdBy: 'u-john', createdAt: ago(25, 5) },
    { id: 'l-16', name: 'Zoe Laurent', email: 'zoe@laurentbakery.com', phone: '+1 (504) 555-0129', company: 'Laurent Bakery', source: 'Referral', status: 'qualified', value: 13200, assignedTo: 'u-david', createdBy: 'u-sara', createdAt: ago(28, 7) },
  ]

  const deals = [
    { id: 'd-01', title: 'Helios Energy — Platform Renewal', customerName: 'Helios Energy', value: 52000, stage: 'won', assignedTo: 'u-sara', expectedClose: monthsAgo(5, 12), createdBy: 'u-owner', createdAt: ago(160) },
    { id: 'd-02', title: 'Northwind Traders — Expansion Deal', customerName: 'Northwind Traders', value: 38000, stage: 'won', assignedTo: 'u-john', expectedClose: monthsAgo(4, 9), createdBy: 'u-john', createdAt: ago(140) },
    { id: 'd-03', title: 'BluePeak Solutions — Annual Contract', customerName: 'BluePeak Solutions', value: 61500, stage: 'won', assignedTo: 'u-john', expectedClose: monthsAgo(4, 21), createdBy: 'u-john', createdAt: ago(125) },
    { id: 'd-04', title: 'Nimbus Fintech — Enterprise Suite', customerName: 'Nimbus Fintech', value: 84000, stage: 'won', assignedTo: 'u-david', expectedClose: monthsAgo(3, 15), createdBy: 'u-owner', createdAt: ago(105) },
    { id: 'd-05', title: 'Cedar & Co — Onboarding Package', customerName: 'Cedar & Co', value: 47500, stage: 'won', assignedTo: 'u-sara', expectedClose: monthsAgo(2, 18), createdBy: 'u-sara', createdAt: ago(80) },
    { id: 'd-06', title: 'Everline Health — Pilot Program', customerName: 'Everline Health', value: 72000, stage: 'won', assignedTo: 'u-john', expectedClose: monthsAgo(1, 11), createdBy: 'u-john', createdAt: ago(66) },
    { id: 'd-07', title: 'Lumen Analytics — Growth Plan', customerName: 'Lumen Analytics', value: 96000, stage: 'won', assignedTo: 'u-sara', expectedClose: thisMonth(6), createdBy: 'u-owner', createdAt: ago(48) },
    { id: 'd-08', title: 'Quantum Labs — Research License', customerName: 'Quantum Labs', value: 58000, stage: 'negotiation', assignedTo: 'u-david', expectedClose: ahead(9), createdBy: 'u-owner', createdAt: ago(30) },
    { id: 'd-09', title: 'Silverline Logistics — Fleet CRM', customerName: 'Silverline Logistics', value: 124000, stage: 'negotiation', assignedTo: 'u-sara', expectedClose: ahead(14), createdBy: 'u-sara', createdAt: ago(26) },
    { id: 'd-10', title: 'Aurora Retail Group — Q4 Rollout', customerName: 'Aurora Retail Group', value: 35000, stage: 'proposal', assignedTo: 'u-john', expectedClose: ahead(6), createdBy: 'u-john', createdAt: ago(18) },
    { id: 'd-11', title: 'Harbor & Finch — Advisory Setup', customerName: 'Harbor & Finch', value: 24000, stage: 'proposal', assignedTo: 'u-david', expectedClose: ahead(11), createdBy: 'u-david', createdAt: ago(12) },
    { id: 'd-12', title: 'Vertex Manufacturing — Pilot', customerName: 'Vertex Manufacturing', value: 18500, stage: 'contacted', assignedTo: 'u-john', expectedClose: ahead(20), createdBy: 'u-john', createdAt: ago(7) },
    { id: 'd-13', title: 'Orion Media — Starter Workspace', customerName: 'Orion Media', value: 9800, stage: 'new', assignedTo: 'u-david', expectedClose: ahead(27), createdBy: 'u-owner', createdAt: ago(2) },
    { id: 'd-14', title: 'Pinnacle Realty — Listing CRM', customerName: 'Pinnacle Realty', value: 15000, stage: 'lost', assignedTo: 'u-sara', expectedClose: monthsAgo(1, 25), createdBy: 'u-sara', createdAt: ago(55) },
    { id: 'd-15', title: 'Mason Build Co — Tooling Deal', customerName: 'Mason Build Co', value: 27500, stage: 'lost', assignedTo: 'u-john', expectedClose: monthsAgo(2, 8), createdBy: 'u-john', createdAt: ago(75) },
  ]

  const tasks = [
    { id: 't-01', title: 'Send Q4 pricing proposal to Quantum Labs', description: 'Include enterprise tier breakdown and onboarding timeline.', priority: 'high', status: 'in-progress', assignedTo: 'u-david', assignedBy: 'u-owner', dueDate: ahead(1), createdAt: ago(4), completedAt: null },
    { id: 't-02', title: 'Follow up with Silverline Logistics CFO', description: 'Contract negotiation — confirm SLA clause before signature.', priority: 'high', status: 'pending', assignedTo: 'u-sara', assignedBy: 'u-owner', dueDate: ahead(2), createdAt: ago(5), completedAt: null },
    { id: 't-03', title: 'Prepare demo environment for Orion Media', description: 'Spin up sandbox workspace with media-industry sample data.', priority: 'medium', status: 'pending', assignedTo: 'u-david', assignedBy: 'u-owner', dueDate: ahead(3), createdAt: ago(2), completedAt: null },
    { id: 't-04', title: 'Quarterly business review — Northwind Traders', description: 'Agenda: adoption metrics, renewal timing, upsell paths.', priority: 'medium', status: 'pending', assignedTo: 'u-john', assignedBy: 'u-owner', dueDate: ahead(4), createdAt: ago(6), completedAt: null },
    { id: 't-05', title: 'Audit inactive customer list', description: 'Flag accounts with no activity in 60+ days for outreach campaign.', priority: 'low', status: 'pending', assignedTo: 'u-sara', assignedBy: 'u-owner', dueDate: ahead(6), createdAt: ago(3), completedAt: null },
    { id: 't-06', title: 'Upload signed Helios Energy MSA to Drive', description: 'Countersigned copy received this morning.', priority: 'medium', status: 'completed', assignedTo: 'u-sara', assignedBy: 'u-owner', dueDate: ago(1), createdAt: ago(8), completedAt: ago(0, 7) },
    { id: 't-07', title: 'Re-engage Pinnacle Realty lost deal', description: 'Personal check-in call; budget postponed to next quarter.', priority: 'medium', status: 'in-progress', assignedTo: 'u-sara', assignedBy: 'u-owner', dueDate: ahead(2), createdAt: ago(7), completedAt: null },
    { id: 't-08', title: 'Log discovery call — Mason Build Co', description: 'Pain points: manual quote tracking, no mobile access.', priority: 'high', status: 'completed', assignedTo: 'u-john', assignedBy: 'u-owner', dueDate: ago(2), createdAt: ago(9), completedAt: ago(2, 3) },
    { id: 't-09', title: 'Update lead source attribution report', description: 'Fix mislabeled trade-show leads from October.', priority: 'low', status: 'pending', assignedTo: 'u-john', assignedBy: 'u-owner', dueDate: ago(3), createdAt: ago(10), completedAt: null },
    { id: 't-10', title: 'Draft case study — Vertex Manufacturing pilot', description: 'Two-page brief for marketing site, pending customer approval.', priority: 'medium', status: 'in-progress', assignedTo: 'u-john', assignedBy: 'u-owner', dueDate: ahead(5), createdAt: ago(5), completedAt: null },
    { id: 't-11', title: 'Onboard Lumen Analytics workspace', description: 'Import 2,300 contacts, configure SSO, run admin training.', priority: 'high', status: 'completed', assignedTo: 'u-sara', assignedBy: 'u-owner', dueDate: ago(4), createdAt: ago(12), completedAt: ago(3, 6) },
    { id: 't-12', title: 'Renewal reminder — Helios Energy (90-day)', description: 'Auto-generated renewal task for February cycle.', priority: 'low', status: 'completed', assignedTo: 'u-sara', assignedBy: 'u-owner', dueDate: ago(6), createdAt: ago(14), completedAt: ago(5, 2) },
    { id: 't-13', title: 'Chase Aurora Retail signature', description: 'Proposal v3 sent Tuesday — legal redlines pending.', priority: 'high', status: 'pending', assignedTo: 'u-john', assignedBy: 'u-owner', dueDate: ago(1), createdAt: ago(8), completedAt: null },
    { id: 't-14', title: 'CRM hygiene — dedupe company records', description: 'Meridian/Meridian Group duplicates in Chicago cluster.', priority: 'low', status: 'pending', assignedTo: 'u-david', assignedBy: 'u-owner', dueDate: ago(5), createdAt: ago(16), completedAt: null },
    { id: 't-15', title: 'Weekly pipeline review notes', description: 'Summary for leadership Monday — include slipped deals.', priority: 'medium', status: 'completed', assignedTo: 'u-john', assignedBy: 'u-owner', dueDate: ago(3), createdAt: ago(11), completedAt: ago(4, 8) },
    { id: 't-16', title: 'LinkedIn outreach — 20 fintech prospects', description: 'Target: CFOs at Series B-D fintechs, US East.', priority: 'medium', status: 'completed', assignedTo: 'u-david', assignedBy: 'u-owner', dueDate: ago(2), createdAt: ago(13), completedAt: ago(1, 4) },
    { id: 't-17', title: 'Demo follow-up — Adeyemi Financial', description: 'Send security whitepaper and SOC 2 summary.', priority: 'medium', status: 'completed', assignedTo: 'u-david', assignedBy: 'u-owner', dueDate: ago(7), createdAt: ago(15), completedAt: ago(6, 9) },
    { id: 't-18', title: 'Prepare board revenue snapshot', description: 'Won revenue MTD, pipeline coverage, churn watchlist.', priority: 'high', status: 'in-progress', assignedTo: 'u-john', assignedBy: 'u-owner', dueDate: ahead(7), createdAt: ago(1), completedAt: null },
  ]

  const activities = [
    { id: 'a-01', userId: 'u-john', userName: 'John Carter', action: 'lead.status', description: 'Moved lead Nathan Cole to Qualified', record: 'Cole Logistics', timestamp: ago(0, 2) },
    { id: 'a-02', userId: 'u-sara', userName: 'Sara Malik', action: 'task.completed', description: 'Completed task “Upload signed Helios Energy MSA to Drive”', record: 't-06', timestamp: ago(0, 7) },
    { id: 'a-03', userId: 'u-owner', userName: 'Alex Morgan', action: 'login', description: 'Signed in to Vantage CRM', record: null, timestamp: ago(0, 4) },
    { id: 'a-04', userId: 'u-david', userName: 'David Lee', action: 'deal.stage', description: 'Moved deal “Quantum Labs — Research License” to Negotiation', record: 'd-08', timestamp: ago(1, 3) },
    { id: 'a-05', userId: 'u-john', userName: 'John Carter', action: 'deal.stage', description: 'Moved deal “Aurora Retail Group — Q4 Rollout” to Proposal', record: 'd-10', timestamp: ago(1, 6) },
    { id: 'a-06', userId: 'u-sara', userName: 'Sara Malik', action: 'customer.updated', description: 'Updated customer details for Laura Chen', record: 'Lumen Analytics', timestamp: ago(2, 1) },
    { id: 'a-07', userId: 'u-david', userName: 'David Lee', action: 'task.completed', description: 'Completed task “LinkedIn outreach — 20 fintech prospects”', record: 't-16', timestamp: ago(1, 4) },
    { id: 'a-08', userId: 'u-owner', userName: 'Alex Morgan', action: 'task.created', description: 'Assigned “Send Q4 pricing proposal to Quantum Labs” to David Lee', record: 't-01', timestamp: ago(4, 6) },
    { id: 'a-09', userId: 'u-john', userName: 'John Carter', action: 'task.completed', description: 'Completed task “Log discovery call — Mason Build Co”', record: 't-08', timestamp: ago(2, 3) },
    { id: 'a-10', userId: 'u-sara', userName: 'Sara Malik', action: 'deal.stage', description: 'Moved deal “Lumen Analytics — Growth Plan” to Won', record: 'd-07', timestamp: ago(6, 2) },
    { id: 'a-11', userId: 'u-john', userName: 'John Carter', action: 'proposal', description: 'Sent proposal v3 to Aurora Retail Group', record: 'd-10', timestamp: ago(3, 5) },
    { id: 'a-12', userId: 'u-owner', userName: 'Alex Morgan', action: 'customer.created', description: 'Created customer Aisha Rahman (Orion Media)', record: 'c-13', timestamp: ago(9, 4) },
    { id: 'a-13', userId: 'u-david', userName: 'David Lee', action: 'lead.created', description: 'Added lead Mia Tanaka (Tanaka Foods)', record: 'l-04', timestamp: ago(5, 6) },
    { id: 'a-14', userId: 'u-sara', userName: 'Sara Malik', action: 'login', description: 'Signed in to Vantage CRM', record: null, timestamp: ago(0, 8) },
    { id: 'a-15', userId: 'u-david', userName: 'David Lee', action: 'task.completed', description: 'Completed task “Demo follow-up — Adeyemi Financial”', record: 't-17', timestamp: ago(6, 9) },
    { id: 'a-16', userId: 'u-owner', userName: 'Alex Morgan', action: 'team.updated', description: 'Deactivated account for Priya Sharma', record: 'u-priya', timestamp: ago(12, 5) },
    { id: 'a-17', userId: 'u-john', userName: 'John Carter', action: 'task.completed', description: 'Completed task “Weekly pipeline review notes”', record: 't-15', timestamp: ago(4, 8) },
    { id: 'a-18', userId: 'u-sara', userName: 'Sara Malik', action: 'deal.created', description: 'Created deal “Cedar & Co — Onboarding Package”', record: 'd-05', timestamp: ago(80, 3) },
    { id: 'a-19', userId: 'u-owner', userName: 'Alex Morgan', action: 'settings.updated', description: 'Updated company profile settings', record: null, timestamp: ago(15, 2) },
    { id: 'a-20', userId: 'u-john', userName: 'John Carter', action: 'lead.created', description: 'Added lead Gregory Mason (Mason Build Co)', record: 'l-01', timestamp: ago(2, 5) },
    { id: 'a-21', userId: 'u-david', userName: 'David Lee', action: 'customer.updated', description: 'Updated contact info for Daniel Mensah', record: 'c-10', timestamp: ago(4, 7) },
    { id: 'a-22', userId: 'u-sara', userName: 'Sara Malik', action: 'task.created', description: 'Created task “Audit inactive customer list”', record: 't-05', timestamp: ago(3, 4) },
    { id: 'a-23', userId: 'u-john', userName: 'John Carter', action: 'login', description: 'Signed in to Vantage CRM', record: null, timestamp: ago(0, 6) },
    { id: 'a-24', userId: 'u-owner', userName: 'Alex Morgan', action: 'deal.created', description: 'Created deal “Orion Media — Starter Workspace”', record: 'd-13', timestamp: ago(2, 2) },
    { id: 'a-25', userId: 'u-david', userName: 'David Lee', action: 'login', description: 'Signed in to Vantage CRM', record: null, timestamp: ago(0, 9) },
    { id: 'a-26', userId: 'u-sara', userName: 'Sara Malik', action: 'task.completed', description: 'Completed task “Renewal reminder — Helios Energy (90-day)”', record: 't-12', timestamp: ago(5, 2) },
    { id: 'a-27', userId: 'u-john', userName: 'John Carter', action: 'deal.stage', description: 'Moved deal “BluePeak Solutions — Annual Contract” to Won', record: 'd-03', timestamp: ago(125, 3) },
    { id: 'a-28', userId: 'u-owner', userName: 'Alex Morgan', action: 'profile.updated', description: 'Updated personal profile settings', record: null, timestamp: ago(20, 5) },
  ]

  const settings = {
    company: {
      name: 'Vantage CRM',
      email: 'hello@vantagecrm.io',
      phone: '+1 (415) 555-0108',
      website: 'www.vantagecrm.io',
      industry: 'Technology — SaaS',
      address: '548 Market Street, Suite 91224, San Francisco, CA 94104',
    },
    appearance: { theme: 'porcelain', accent: 'auto', density: 'comfortable' },
    notifications: {
      emailDigest: true,
      taskReminders: true,
      dealUpdates: true,
      teamMentions: true,
      weeklyReport: false,
    },
  }

  return { users, customers, leads, deals, tasks, activities, settings }
}

export interface QuoteTemplate {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    prompt: string;
    estimatedItems: number;
    color: string;
}

export const quoteTemplates: QuoteTemplate[] = [
    {
        id: 'ac-maintenance-villa',
        title: 'AC Maintenance - Villa',
        description: 'Annual maintenance for 5-bedroom villa',
        category: 'HVAC',
        icon: 'Wind',
        color: 'blue',
        estimatedItems: 7,
        prompt: `Generate a detailed quotation for annual AC maintenance service for a 5-bedroom villa in Dubai.

Include the following line items with realistic AED pricing:
- Inspection and cleaning of 6 split AC units (3-ton capacity each)
- Gas top-up for 2 units
- Filter replacement for all units
- Condenser coil cleaning
- Thermostat calibration
- Emergency call-out warranty (3 months)
- Labor charges

Provide prices in AED. Include 5% VAT. Target total: AED 2,500-3,500.`,
    },
    {
        id: 'apartment-renovation-2br',
        title: 'Apartment Renovation',
        description: 'Full interior upgrade for 2BR flat',
        category: 'Construction',
        icon: 'Hammer',
        color: 'amber',
        estimatedItems: 8,
        prompt: `Create a comprehensive quotation for renovating a 2-bedroom apartment (1,200 sq ft) in Sharjah.

Include these work items with AED pricing:
- Full apartment painting (walls and ceilings)
- Kitchen cabinet replacement with granite countertop
- 2 bathroom renovations (tiles, fixtures, sanitary ware)
- Flooring replacement with porcelain tiles
- Electrical rewiring and new LED fixtures
- Gypsum false ceiling in living room
- Removal and disposal of old materials
- Labor and project management (3 weeks)

Price in AED with 5% VAT. Total budget range: AED 45,000-65,000.`,
    },
    {
        id: 'office-it-setup',
        title: 'Office IT Setup',
        description: 'Complete tech infrastructure for 10-person team',
        category: 'Technology',
        icon: 'Monitor',
        color: 'green',
        estimatedItems: 8,
        prompt: `Generate a quotation for complete IT setup for a new 10-person office in Dubai Media City.

Line items required (AED pricing):
- 10x Dell desktop workstations (i5, 16GB RAM, 512GB SSD)
- 10x 24-inch monitors
- Network setup: router, switch, Cat6 cabling
- HP LaserJet printer/scanner
- Microsoft 365 Business licenses (annual, 10 users)
- Kaspersky Total Security (annual, 10 devices)
- Installation, configuration, and training
- 6-month technical support package

Itemize in AED including 5% VAT. Target: AED 35,000-50,000.`,
    },
    {
        id: 'villa-deep-cleaning',
        title: 'Villa Deep Cleaning',
        description: 'Pre-move-in cleaning for 4BR villa',
        category: 'Facilities',
        icon: 'Sparkles',
        color: 'purple',
        estimatedItems: 9,
        prompt: `Create a detailed quote for deep cleaning service for a 4-bedroom villa (3,500 sq ft) in Arabian Ranches before move-in.

Include these services with AED pricing:
- Deep cleaning of all 4 bedrooms and living areas
- Kitchen deep clean (cabinets, appliances, exhaust)
- 5 bathrooms sanitization and descaling
- Window cleaning (interior and exterior)
- Balcony and outdoor area pressure washing
- Marble floor polishing (2,000 sq ft)
- Carpet steam cleaning (1,500 sq ft)
- Post-construction dust removal
- Cleaning materials and equipment

Price in AED. Add 5% VAT. Total estimate: AED 2,000-3,000.`,
    },
];

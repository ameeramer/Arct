import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/storage';
import { createUserProfile } from '../services/users';
import { auth } from '../services/firebase';

const allRolesData = [
  // אדריכלות ועיצוב
  'Architect | אדריכל',
  'Landscape Architect | אדריכל נוף',
  'Interior Designer | מעצב פנים',
  'Urban Planner | מתכנן ערים',
  'Architectural Drafter | שרטט אדריכלי',
  'Architectural Visualizer | מדמה אדריכלי',
  'Parametric Designer | מעצב פרמטרי',
  'BIM Manager | מנהל BIM',
  'Architectural Model Maker | בונה מודלים אדריכליים',
  'Sustainable Design Specialist | מומחה לתכנון בר-קיימא',
  'Heritage Conservation Architect | אדריכל שימור מורשת',
  'Facade Designer | מעצב חזיתות',
  'Exhibition Designer | מעצב תערוכות',
  'Retail Space Designer | מעצב חללי מסחר',
  'Healthcare Facility Designer | מעצב מתקני בריאות',

  // תכנון ונוף
  'Gardener | גנן',
  'Irrigation Designer | מתכנן השקיה',
  'Agronomist | אגרונום',
  'Arborist | מומחה עצים',
  'Ornamental Gardener | גנן נוי',
  'Landscape Designer | מעצב נוף',
  'Permaculture Designer | מעצב פרמקלצ׳ר',
  'Ecological Restoration Specialist | מומחה לשיקום אקולוגי',
  'Botanical Garden Curator | אוצר גן בוטני',
  'Urban Forester | יערן עירוני',
  'Horticulturist | גנן מקצועי',
  'Turf Management Specialist | מומחה לניהול דשא',
  'Vertical Garden Designer | מעצב גינות אנכיות',
  'Aquatic Plants Specialist | מומחה לצמחי מים',
  'Xeriscaping Expert | מומחה לגינון חסכוני במים',
  'Topiary Artist | אמן גיזום צמחים',

  // בנייה ושיפוץ
  'Renovation Contractor | קבלן שיפוצים',
  'Structural Engineer | מהנדס בניין',
  'Construction Supervisor | מפקח בניה',
  'Tiler | רצף',
  'Plasterer | טייח',
  'Plumber | אינסטלטור',
  'Electrician | חשמלאי',
  'Carpenters | נגרים',
  'Masonry Worker | בנאי',
  'Roofer | גגן',
  'Flooring Installer | מתקין רצפות',
  'Drywall Installer | מתקין גבס',
  'Painter | צבע',
  'Insulation Installer | מתקין בידוד',
  'Glazier | זגג',
  'Demolition Specialist | מומחה הריסה',
  'Concrete Finisher | גמר בטון',
  'Scaffolding Specialist | מומחה פיגומים',
  'Waterproofing Expert | מומחה איטום',
  'Stucco Applicator | מיישם טיח חיצוני',
  'Hardwood Floor Refinisher | משפץ רצפות עץ',
  'Cabinet Maker | נגר ארונות',
  'Countertop Installer | מתקין משטחי עבודה',
  'Fence Installer | מתקין גדרות',

  // משפטים ועריכת דין
  'Lawyer | עורך דין',
  'Mediator | מגשר',
  'Arbitrator | בורר',
  'Legal Consultant | יועץ משפטי',
  'Paralegal | עוזר משפטי',
  'Notary Public | נוטריון',
  'Title Examiner | בודק זכויות',
  'Permit Expediter | מזרז היתרים',
  'Building Code Consultant | יועץ תקנות בנייה',

  // פיננסים וכלכלה
  'Real Estate Appraiser | שמאי מקרקעין',
  'Mortgage Broker | יועץ משכנתאות',
  'Financial Advisor | יועץ פיננסי',
  'Real Estate Investment Advisor | יועץ השקעות נדל"ן',
  'Property Tax Consultant | יועץ מס נדל"ן',
  'Insurance Agent | סוכן ביטוח',
  'Escrow Officer | פקיד נאמנות',
  'Loan Officer | פקיד הלוואות',
  'Real Estate Analyst | אנליסט נדל"ן',
  'Property Manager | מנהל נכסים',
  'Asset Manager | מנהל נכסים',
  'Investment Portfolio Manager | מנהל תיקי השקעות',
  'Cost Estimator | מעריך עלויות',
  'Budget Analyst | אנליסט תקציב',
  'Financial Controller | בקר כספים',
  'Accountant | רואה חשבון',
  'Bookkeeper | מנהל חשבונות',
  'Tax Advisor | יועץ מס',

  // מדידה וייעוץ
  'Certified Surveyor | מודד מוסמך',
  'Accessibility Consultant | יועץ נגישות',
  'Property Appraiser | שמאי מקרקעין',
  'Lighting Consultant | יועץ תאורה',
  'Drainage & Soil Consultant | יועץ קרקע וניקוז',
  'Acoustical Consultant | יועץ אקוסטיקה',
  'Energy Efficiency Consultant | יועץ יעילות אנרגטית',
  'Building Code Consultant | יועץ תקני בנייה',
  'Fire Safety Consultant | יועץ בטיחות אש',
  'Environmental Impact Assessor | מעריך השפעה סביבתית',
  'Geotechnical Engineer | מהנדס גיאוטכני',
  'Indoor Air Quality Specialist | מומחה לאיכות אוויר פנים',
  'Thermal Imaging Specialist | מומחה הדמיה תרמית',
  'Building Envelope Consultant | יועץ מעטפת בניין',
  'Historic Preservation Consultant | יועץ שימור היסטורי',

  // רפואה ובריאות
  'Physician | רופא',
  'Nurse | אח/ות',
  'Physical Therapist | פיזיותרפיסט',
  'Occupational Therapist | מרפא בעיסוק',
  'Ergonomics Consultant | יועץ ארגונומיה',
  'Environmental Health Specialist | מומחה בריאות סביבתית',
  'Indoor Air Quality Specialist | מומחה איכות אוויר פנים',
  'Mold Inspector | בודק עובש',
  'Radon Inspector | בודק רדון',
  'Lead Inspector | בודק עופרת',
  'Asbestos Inspector | בודק אסבסט',
  'Allergy Specialist | מומחה אלרגיות',
  'Respiratory Therapist | מטפל נשימתי',
  'Wellness Coach | מאמן בריאות',
  'Holistic Health Practitioner | מטפל בריאות הוליסטי',
  'Naturopathic Doctor | רופא נטורופתי',
  'Acupuncturist | מדקר',
  'Massage Therapist | מעסה',

  // חינוך והדרכה
  'Teacher | מורה',
  'Professor | פרופסור',
  'Tutor | מורה פרטי',
  'Educational Consultant | יועץ חינוכי',
  'Curriculum Developer | מפתח תכניות לימודים',
  'Instructional Designer | מעצב הדרכה',
  'Training Specialist | מומחה הדרכה',
  'Workshop Facilitator | מנחה סדנאות',
  'Environmental Educator | מחנך סביבתי',
  'Sustainability Educator | מחנך לקיימות',
  'Museum Educator | מחנך במוזיאון',
  'Outdoor Education Specialist | מומחה חינוך חוץ',
  'Adult Education Instructor | מדריך חינוך מבוגרים',
  'Special Education Teacher | מורה לחינוך מיוחד',
  'Career Counselor | יועץ קריירה',
  'Life Coach | מאמן אישי',
  'Professional Development Coach | מאמן התפתחות מקצועית',

  // טכנולוגיה ומחשבים
  'Software Developer | מפתח תוכנה',
  'Web Developer | מפתח אתרים',
  'Mobile App Developer | מפתח אפליקציות',
  'UX/UI Designer | מעצב חווית משתמש',
  'IT Consultant | יועץ טכנולוגיות מידע',
  'Network Administrator | מנהל רשת',
  'Cybersecurity Specialist | מומחה אבטחת מידע',
  'Database Administrator | מנהל מסדי נתונים',
  'Systems Analyst | אנליסט מערכות',
  'Cloud Solutions Architect | ארכיטקט פתרונות ענן',
  'DevOps Engineer | מהנדס דבאופס',
  'Data Scientist | מדען נתונים',
  'Machine Learning Engineer | מהנדס למידת מכונה',
  'Blockchain Developer | מפתח בלוקצ׳יין',
  'IoT Specialist | מומחה אינטרנט של הדברים',
  'Smart Home Technology Specialist | מומחה טכנולוגיית בית חכם',
  'Virtual Reality Developer | מפתח מציאות מדומה',
  'Augmented Reality Developer | מפתח מציאות רבודה',

  // מערכות ותשתיות
  'Water Systems Consultant | יועץ מערכות מים',
  'HVAC Consultant | יועץ מיזוג אוויר',
  'Deck & Pergola Installer | מתקין דקים ופרגולות',
  'Synthetic Grass Installer | מתקין דשא סינטטי',
  'Smart Home Installer | מתקין מערכות חכמות',
  'Solar Panel Installer | מתקין פאנלים סולאריים',
  'Home Automation Specialist | מומחה אוטומציית ביתית',
  'Security Systems Installer | מתקין מערכות אבטחה',
  'Rainwater Harvesting Specialist | מומחה לאיסוף מי גשמים',
  'Greywater Systems Designer | מתכנן מערכות מים אפורים',
  'EV Charging Station Installer | מתקין עמדות טעינה לרכב חשמלי',
  'Telecommunications Installer | מתקין תקשורת',
  'Fiber Optic Specialist | מומחה סיבים אופטיים',
  'Home Theater Installer | מתקין קולנוע ביתי',
  'Backup Generator Installer | מתקין גנרטורים',
  'Radiant Floor Heating Installer | מתקין חימום רצפתי',
  'Pool & Spa Technician | טכנאי בריכות וספא',
  'Outdoor Lighting Installer | מתקין תאורת חוץ',
  'Intercom Systems Specialist | מומחה מערכות אינטרקום',

  // תקשורת ומדיה
  'Journalist | עיתונאי',
  'Public Relations Specialist | מומחה יחסי ציבור',
  'Marketing Specialist | מומחה שיווק',
  'Content Creator | יוצר תוכן',
  'Social Media Manager | מנהל מדיה חברתית',
  'Copywriter | קופירייטר',
  'Technical Writer | כותב טכני',
  'Blogger | בלוגר',
  'Podcaster | פודקאסטר',
  'Videographer | צלם וידאו',
  'Photographer | צלם',
  'Graphic Designer | מעצב גרפי',
  'Brand Strategist | אסטרטג מיתוג',
  'Digital Marketing Specialist | מומחה שיווק דיגיטלי',
  'SEO Specialist | מומחה קידום אתרים',
  'Email Marketing Specialist | מומחה שיווק באימייל',
  'Advertising Specialist | מומחה פרסום',
  'Market Researcher | חוקר שוק',

  // ניהול וליווי
  'Project Manager | מנהל פרויקט',
  'Ecological Consultant | יועץ אקולוגי',
  'Environmental Artist | אומן סביבתי',
  'Customer Experience Specialist | מומחה שירות לקוחות',
  'Construction Cost Estimator | מעריך עלויות בנייה',
  'Real Estate Developer | יזם נדל"ן',
  'Building Inspector | מפקח בניינים',
  'Facilities Manager | מנהל מתקנים',
  'Sustainability Coordinator | רכז קיימות',
  'Construction Scheduler | מתזמן בנייה',
  'Quality Control Inspector | מפקח בקרת איכות',
  'Procurement Specialist | מומחה רכש',
  // אדריכלות ועיצוב
  'Architect | אדריכל',
  'Landscape Architect | אדריכל נוף',
  'Interior Designer | מעצב פנים',
  'Urban Planner | מתכנן ערים',
  'Architectural Drafter | שרטט אדריכלי',
  'Architectural Visualizer | מדמה אדריכלי',
  'Parametric Designer | מעצב פרמטרי',
  'BIM Manager | מנהל BIM',
  'Architectural Model Maker | בונה מודלים אדריכליים',
  'Sustainable Design Specialist | מומחה לתכנון בר-קיימא',
  'Heritage Conservation Architect | אדריכל שימור מורשת',
  'Facade Designer | מעצב חזיתות',
  'Exhibition Designer | מעצב תערוכות',
  'Retail Space Designer | מעצב חללי מסחר',
  'Healthcare Facility Designer | מעצב מתקני בריאות',

  // תכנון ונוף
  'Gardener | גנן',
  'Irrigation Designer | מתכנן השקיה',
  'Agronomist | אגרונום',
  'Arborist | מומחה עצים',
  'Ornamental Gardener | גנן נוי',
  'Landscape Designer | מעצב נוף',
  'Permaculture Designer | מעצב פרמקלצ׳ר',
  'Ecological Restoration Specialist | מומחה לשיקום אקולוגי',
  'Botanical Garden Curator | אוצר גן בוטני',
  'Urban Forester | יערן עירוני',
  'Horticulturist | גנן מקצועי',
  'Turf Management Specialist | מומחה לניהול דשא',
  'Vertical Garden Designer | מעצב גינות אנכיות',
  'Aquatic Plants Specialist | מומחה לצמחי מים',
  'Xeriscaping Expert | מומחה לגינון חסכוני במים',
  'Topiary Artist | אמן גיזום צמחים',

  // בנייה ושיפוץ
  'Renovation Contractor | קבלן שיפוצים',
  'Structural Engineer | מהנדס בניין',
  'Construction Supervisor | מפקח בניה',
  'Tiler | רצף',
  'Plasterer | טייח',
  'Plumber | אינסטלטור',
  'Electrician | חשמלאי',
  'Carpenters | נגרים',
  'Masonry Worker | בנאי',
  'Roofer | גגן',
  'Flooring Installer | מתקין רצפות',
  'Drywall Installer | מתקין גבס',
  'Painter | צבע',
  'Insulation Installer | מתקין בידוד',
  'Glazier | זגג',
  'Demolition Specialist | מומחה הריסה',
  'Concrete Finisher | גמר בטון',
  'Scaffolding Specialist | מומחה פיגומים',
  'Waterproofing Expert | מומחה איטום',
  'Stucco Applicator | מיישם טיח חיצוני',
  'Hardwood Floor Refinisher | משפץ רצפות עץ',
  'Cabinet Maker | נגר ארונות',
  'Countertop Installer | מתקין משטחי עבודה',
  'Fence Installer | מתקין גדרות',

  // מדידה וייעוץ
  'Certified Surveyor | מודד מוסמך',
  'Accessibility Consultant | יועץ נגישות',
  'Property Appraiser | שמאי מקרקעין',
  'Lighting Consultant | יועץ תאורה',
  'Drainage & Soil Consultant | יועץ קרקע וניקוז',
  'Acoustical Consultant | יועץ אקוסטיקה',
  'Energy Efficiency Consultant | יועץ יעילות אנרגטית',
  'Building Code Consultant | יועץ תקני בנייה',
  'Fire Safety Consultant | יועץ בטיחות אש',
  'Environmental Impact Assessor | מעריך השפעה סביבתית',
  'Geotechnical Engineer | מהנדס גיאוטכני',
  'Indoor Air Quality Specialist | מומחה לאיכות אוויר פנים',
  'Thermal Imaging Specialist | מומחה הדמיה תרמית',
  'Building Envelope Consultant | יועץ מעטפת בניין',
  'Historic Preservation Consultant | יועץ שימור היסטורי',

  // מערכות ותשתיות
  'Water Systems Consultant | יועץ מערכות מים',
  'HVAC Consultant | יועץ מיזוג אוויר',
  'Deck & Pergola Installer | מתקין דקים ופרגולות',
  'Synthetic Grass Installer | מתקין דשא סינטטי',
  'Smart Home Installer | מתקין מערכות חכמות',
  'Solar Panel Installer | מתקין פאנלים סולאריים',
  'Home Automation Specialist | מומחה אוטומציית ביתית',
  'Security Systems Installer | מתקין מערכות אבטחה',
  'Rainwater Harvesting Specialist | מומחה לאיסוף מי גשמים',
  'Greywater Systems Designer | מתכנן מערכות מים אפורים',
  'EV Charging Station Installer | מתקין עמדות טעינה לרכב חשמלי',
  'Telecommunications Installer | מתקין תקשורת',
  'Fiber Optic Specialist | מומחה סיבים אופטיים',
  'Home Theater Installer | מתקין קולנוע ביתי',
  'Backup Generator Installer | מתקין גנרטורים',
  'Radiant Floor Heating Installer | מתקין חימום רצפתי',
  'Pool & Spa Technician | טכנאי בריכות וספא',
  'Outdoor Lighting Installer | מתקין תאורת חוץ',
  'Intercom Systems Specialist | מומחה מערכות אינטרקום',

  // תקשורת ומדיה
  'Journalist | עיתונאי',
  'Public Relations Specialist | מומחה יחסי ציבור',
  'Marketing Specialist | מומחה שיווק',
  'Content Creator | יוצר תוכן',
  'Social Media Manager | מנהל מדיה חברתית',
  'Copywriter | קופירייטר',
  'Technical Writer | כותב טכני',
  'Blogger | בלוגר',
  'Podcaster | פודקאסטר',
  'Videographer | צלם וידאו',
  'Photographer | צלם',
  'Graphic Designer | מעצב גרפי',
  'Brand Strategist | אסטרטג מיתוג',
  'Digital Marketing Specialist | מומחה שיווק דיגיטלי',
  'SEO Specialist | מומחה קידום אתרים',
  'Email Marketing Specialist | מומחה שיווק באימייל',
  'Advertising Specialist | מומחה פרסום',
  'Market Researcher | חוקר שוק',

  // ניהול וליווי
  'Project Manager | מנהל פרויקט',
  'Ecological Consultant | יועץ אקולוגי',
  'Environmental Artist | אומן סביבתי',
  'Customer Experience Specialist | מומחה שירות לקוחות',
  'Construction Cost Estimator | מעריך עלויות בנייה',
  'Real Estate Developer | יזם נדל"ן',
  'Building Inspector | מפקח בניינים',
  'Facilities Manager | מנהל מתקנים',
  'Sustainability Coordinator | רכז קיימות',
  'Construction Scheduler | מתזמן בנייה',
  'Quality Control Inspector | מפקח בקרת איכות',
  'Procurement Specialist | מומחה רכש',
  'Contract Administrator | מנהל חוזים',
  'Risk Assessment Specialist | מומחה הערכת סיכונים',
  'Relocation Consultant | יועץ העתקת מגורים',
  'Home Staging Consultant | יועץ עיצוב לקראת מכירה',
  'Move-in Coordinator | רכז כניסה לבית',

  // עיצוב וגימור
  'Textile Designer | מעצב טקסטיל',
  'Furniture Designer | מעצב רהיטים',
  'Lighting Designer | מעצב תאורה',
  'Color Consultant | יועץ צבע',
  'Art Consultant | יועץ אמנות',
  'Custom Furniture Maker | יצרן רהיטים מותאמים אישית',
  'Upholsterer | רפד',
  'Wallpaper Installer | מתקין טפטים',
  'Decorative Painter | צייר דקורטיבי',
  'Mosaic Artist | אמן פסיפס',
  'Glass Artist | אמן זכוכית',
  'Metalwork Artist | אמן עבודות מתכת',
  'Ceramic Tile Artist | אמן אריחי קרמיקה',
  'Mural Painter | צייר קירות',
  'Faux Finish Specialist | מומחה גימור מדומה',
  'Antique Restoration Specialist | מומחה לשחזור עתיקות',
  'Custom Cabinetry Designer | מעצב ארונות מותאמים אישית',

  // תחזוקה ושירות
  'Handyman | איש תחזוקה',
  'Chimney Sweep | מנקה ארובות',
  'Gutter Cleaner | מנקה מרזבים',
  'Pressure Washing Specialist | מומחה שטיפה בלחץ',
  'Appliance Repair Technician | טכנאי תיקון מכשירי חשמל',
  'Locksmith | מנעולן',
  'Pest Control Specialist | מומחה הדברה',
  'Window Cleaner | מנקה חלונות',
  'Septic System Specialist | מומחה מערכות ספיגה',
  'HVAC Maintenance Technician | טכנאי תחזוקת מיזוג אוויר',
  'Lawn Care Specialist | מומחה טיפול בדשא',
  'Pool Maintenance Technician | טכנאי תחזוקת בריכות',
  'Home Inspector | בודק בתים',
  'Mold Remediation Specialist | מומחה לטיפול בעובש',
  'Asbestos Removal Specialist | מומחה להסרת אסבסט',
  'Lead Abatement Specialist | מומחה לטיפול בעופרת',

  // תכנון ותשתיות
  'Civil Engineer | מהנדס אזרחי',
  'Mechanical Engineer | מהנדס מכונות',
  'Electrical Engineer | מהנדס חשמל',
  'Environmental Engineer | מהנדס סביבה',
  'Traffic Engineer | מהנדס תנועה',
  'Water Resources Engineer | מהנדס משאבי מים',
  'Transportation Planner | מתכנן תחבורה',
  'GIS Specialist | מומחה מערכות מידע גיאוגרפיות',
  'CAD Technician | טכנאי תיב"ם',
  'Renewable Energy Consultant | יועץ אנרגיה מתחדשת',
  'Building Automation Engineer | מהנדס אוטומציית בניינים',
  'Telecommunications Engineer | מהנדס תקשורת',
  'Waste Management Specialist | מומחה ניהול פסולת',
  'Stormwater Management Specialist | מומחה ניהול מי נגר',

  // מקצועות נוספים
  'Real Estate Agent | סוכן נדל"ן',
  'Real Estate Photographer | צלם נדל"ן',
  'Drone Operator | מפעיל רחפן',
  '3D Scanning Specialist | מומחה סריקה תלת-ממדית',
  'Virtual Tour Creator | יוצר סיורים וירטואליים',
  'Home Organizer | מארגן בתים',
  'Feng Shui Consultant | יועץ פנג שואי',
  'Vastu Consultant | יועץ ואסטו',
  'Biophilic Design Specialist | מומחה עיצוב ביופילי',
  'Universal Design Specialist | מומחה עיצוב אוניברסלי',
  'Tiny House Designer | מעצב בתים זעירים',
  'Container Home Specialist | מומחה בתי מכולות',
  'Passive House Consultant | יועץ בית פסיבי',
  'Net Zero Energy Consultant | יועץ אנרגיה מאוזנת',
  'Smart City Planner | מתכנן ערים חכמות',
  'Disaster Resilience Specialist | מומחה חוסן לאסונות',
  'Climate Adaptation Specialist | מומחה הסתגלות לשינויי אקלים'
];

//remove duplicates
const allRoles = [...new Set(allRolesData)];

// Translation data
const translations = {
  he: {
    title: "השלם את הפרופיל שלך",
    subtitle: "בואו נגדיר את הפרופיל המקצועי שלך",
    steps: ["מידע בסיסי", "תפקידים", "גלריה", "על עצמי", "תמונה"],
    fullName: "שם מלא",
    phoneNumber: "מספר טלפון",
    phoneFormat: "פורמט: 05X ולאחריו 7 ספרות",
    experience: "שנות ותק",
    experienceQuestion: "כמה שנים אתה עובד בתחום שלך?",
    workRegions: "אזורי עבודה",
    searchRegions: "חפש או בחר אזורי עבודה",
    customLocation: "הוסף \"{term}\" כמיקום מותאם אישית",
    loadingRegions: "טוען אזורים...",
    regionsHelp: "חפש מיקומים או בחר מהרשימה. לחץ Enter להוספת מיקום מותאם אישית.",
    roles: "תפקידים",
    searchRoles: "חפש או הקלד תפקיד",
    customRole: "הוסף \"{term}\" כתפקיד מותאם אישית",
    rolesHelp: "חפש תפקידים, לחץ על הצעות, או הוסף תפקיד מותאם אישית",
    gallery: "גלריית עבודות (אופציונלי)",
    uploadGallery: "העלה תמונות לגלריה",
    dragDrop: "או גרור ושחרר",
    imageFormat: "PNG, JPG, GIF עד 10MB (מקסימום 5 תמונות)",
    galleryHelp: "העלה עד 5 תמונות המציגות את העבודה שלך. זה יעזור ללקוחות להבין את הסגנון והאיכות שלך.",
    aboutMe: "על עצמי",
    aboutMePlaceholder: "ספר ללקוחות פוטנציאליים על עצמך, הניסיון שלך, ומה הופך את השירותים שלך לייחודיים...",
    aboutMeHelp: "שתף את המומחיות, ההתמחויות והגישה שלך לעבודה",
    profileImage: "תמונת פרופיל (אופציונלי)",
    uploadProfile: "העלה תמונת פרופיל",
    profileHelp: "אם לא תעלה תמונה, ייעשה שימוש באווטאר ברירת מחדל.",
    back: "חזור",
    next: "הבא",
    complete: "סיים",
    processing: "מעבד...",
    requiredFields: "אנא מלא את כל השדות הנדרשים.",
    invalidPrefix: "אנא הזן קידומת טלפון ישראלית תקפה (05x או 07x)",
    invalidNumber: "אנא הזן מספר טלפון תקף בן 7 ספרות",
    enterName: "אנא הזן את שמך",
    enterPhone: "אנא הזן את מספר הטלפון שלך",
    selectRole: "אנא בחר לפחות תפקיד אחד"
  },
  ar: {
    title: "أكمل ملفك الشخصي",
    subtitle: "دعنا نعد ملفك المهني",
    steps: ["معلومات أساسية", "الأدوار", "معرض", "عني", "صورة"],
    fullName: "الاسم الكامل",
    phoneNumber: "رقم الهاتف",
    phoneFormat: "التنسيق: 05X متبوعًا بـ 7 أرقام",
    experience: "سنوات الخبرة",
    experienceQuestion: "كم سنة عملت في مجالك؟",
    workRegions: "مناطق العمل",
    searchRegions: "ابحث أو اختر مناطق العمل",
    customLocation: "أضف \"{term}\" كموقع مخصص",
    loadingRegions: "جاري تحميل المناطق...",
    regionsHelp: "ابحث عن المواقع أو اختر من القائمة. اضغط Enter لإضافة موقع مخصص.",
    roles: "الأدوار",
    searchRoles: "ابحث أو اكتب دورًا",
    customRole: "أضف \"{term}\" كدور مخصص",
    rolesHelp: "ابحث عن الأدوار، انقر على الاقتراحات، أو أضف دورًا مخصصًا",
    gallery: "معرض الأعمال (اختياري)",
    uploadGallery: "تحميل صور المعرض",
    dragDrop: "أو اسحب وأفلت",
    imageFormat: "PNG، JPG، GIF حتى 10 ميجابايت (بحد أقصى 5 صور)",
    galleryHelp: "قم بتحميل ما يصل إلى 5 صور تعرض عملك. سيساعد ذلك العملاء على فهم أسلوبك وجودتك.",
    aboutMe: "عني",
    aboutMePlaceholder: "أخبر العملاء المحتملين عن نفسك وخبرتك وما يجعل خدماتك فريدة...",
    aboutMeHelp: "شارك خبرتك وتخصصاتك ونهجك في العمل",
    profileImage: "صورة الملف الشخصي (اختياري)",
    uploadProfile: "تحميل صورة الملف الشخصي",
    profileHelp: "إذا لم تقم بتحميل صورة، سيتم استخدام الصورة الرمزية الافتراضية.",
    back: "رجوع",
    next: "التالي",
    complete: "إكمال",
    processing: "جاري المعالجة...",
    requiredFields: "يرجى ملء جميع الحقول المطلوبة.",
    invalidPrefix: "الرجاء إدخال بادئة هاتف إسرائيلية صالحة (05x أو 07x)",
    invalidNumber: "الرجاء إدخال رقم هاتف صالح مكون من 7 أرقام",
    enterName: "الرجاء إدخال اسمك",
    enterPhone: "الرجاء إدخال رقم هاتفك",
    selectRole: "الرجاء تحديد دور واحد على الأقل"
  },
  en: {
    title: "Complete Your Profile",
    subtitle: "Let's set up your professional profile",
    steps: ["Basic Info", "Roles", "Gallery", "About Me", "Photo"],
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    phoneFormat: "Format: 05X followed by 7 digits",
    experience: "Years of Experience",
    experienceQuestion: "How many years have you been working in your field?",
    workRegions: "Work Regions",
    searchRegions: "Search or select work regions",
    customLocation: "Add \"{term}\" as custom location",
    loadingRegions: "Loading regions...",
    regionsHelp: "Search for locations or select from the list. Press Enter to add a custom location.",
    roles: "Your Roles",
    searchRoles: "Search or type a role...",
    customRole: "Add \"{term}\" as a custom role",
    rolesHelp: "Search for roles, click on suggestions, or add your own custom role",
    gallery: "Work Gallery (Optional)",
    uploadGallery: "Upload gallery images",
    dragDrop: "or drag and drop",
    imageFormat: "PNG, JPG, GIF up to 10MB (max 5 images)",
    galleryHelp: "Upload up to 5 images showcasing your work. This will help clients understand your style and quality.",
    aboutMe: "About Me",
    aboutMePlaceholder: "Tell potential clients about yourself, your experience, and what makes your services unique...",
    aboutMeHelp: "Share your expertise, specialties, and approach to your work",
    profileImage: "Profile Image (Optional)",
    uploadProfile: "Upload a profile image",
    profileHelp: "If you don't upload an image, a default avatar will be used.",
    back: "Back",
    next: "Next",
    complete: "Complete",
    processing: "Processing...",
    requiredFields: "Please fill all required fields.",
    invalidPrefix: "Please enter a valid Israeli phone prefix (05x or 07x)",
    invalidNumber: "Please enter a valid 7-digit phone number",
    enterName: "Please enter your name",
    enterPhone: "Please enter your phone number",
    selectRole: "Please select at least one role"
  }
};

export default function CompleteSignupPage() {
  // Add language state
  const [language, setLanguage] = useState<'he' | 'ar' | 'en'>('he');
  
  // Get translations based on selected language
  const t = translations[language];
  
  const [name, setName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | ''>('');
  const [roles, setRoles] = useState<string[]>([]);
  const [roleInput, setRoleInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [workRegions, setWorkRegions] = useState<string[]>([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [regionSearchTerm, setRegionSearchTerm] = useState('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState('');
  const [israelRegionsData, setIsraelRegionsData] = useState<{[key: string]: string[]}>({});
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);
  const navigate = useNavigate();
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch regions from data.gov.il API
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoadingRegions(true);
        const response = await fetch('https://data.gov.il/api/action/datastore_search?resource_id=1bf27e56-364c-4b61-8b6b-efa9933da677', {
          method: 'GET'
        });

        const data = await response.json();
        if (data.success && data.result.records) {
          // Group cities by region (MACHOZ)
          const regions: {[key: string]: string[]} = {};
          
          data.result.records.forEach((record: any) => {
            console.log(record);
            const region = record.MACHOZ;
            const city = record.HEBREW_NAME;
            
            if (region && city) {
              if (!regions[region]) {
                regions[region] = [];
              }
              
              // Only add the city if it's not already in the array
              if (!regions[region].includes(city)) {
                regions[region].push(city);
              }
            }
          });
          
          // Sort cities alphabetically within each region
          Object.keys(regions).forEach(region => {
            regions[region].sort();
          });
          
          setIsraelRegionsData(regions);
        }
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        setIsLoadingRegions(false);
      }
    };
    
    fetchRegions();
  }, []);

  useEffect(() => {
    // Create preview URL for selected image
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  // Add new useEffect for gallery previews
  useEffect(() => {
    // Create preview URLs for gallery images
    const previews: string[] = [];
    
    galleryFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === galleryFiles.length) {
          setGalleryPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // If no files, clear previews
    if (galleryFiles.length === 0) {
      setGalleryPreviews([]);
    }
  }, [galleryFiles]);

  const handleSubmit = async () => {
    if (!name || roles.length === 0 || !phonePrefix || !phoneNumber || yearsOfExperience === '' || workRegions.length === 0 || auth.currentUser === null) {
      setError(t.requiredFields);
      return;
    }

    // Validate phone number
    const prefixRegex = /^05\d$|^07\d$/;
    const numberRegex = /^\d{7}$/;
    
    if (!prefixRegex.test(phonePrefix)) {
      setError(t.invalidPrefix);
      return;
    }
    
    if (!numberRegex.test(phoneNumber)) {
      setError(t.invalidNumber);
      return;
    }

    try {
      setIsLoading(true);
      
      // Use default avatar if no file is uploaded
      let imageUrl = "https://firebasestorage.googleapis.com/v0/b/arct-7af54.firebasestorage.app/o/images%2Favatars%2Favatar_grey.png?alt=media&token=66a7955f-94cb-403f-9026-1866eccbf177";
      
      // Only upload image if a file was selected
      if (file) {
        imageUrl = await uploadImage(file, `avatars/${auth.currentUser.uid}`);
      }
      
      // Upload gallery images if any
      const galleryUrls: string[] = [];
      if (galleryFiles.length > 0) {
        for (let i = 0; i < galleryFiles.length; i++) {
          const galleryUrl = await uploadImage(
            galleryFiles[i], 
            `gallery/${auth.currentUser.uid}/${i}`
          );
          galleryUrls.push(galleryUrl);
        }
      }
      
      const fullPhoneNumber = `${phonePrefix}-${phoneNumber}`;
      
      await createUserProfile({
        id: auth.currentUser.uid,
        name,
        avatar: imageUrl,
        roles,
        phoneNumber: fullPhoneNumber,
        yearsOfExperience: Number(yearsOfExperience),
        workRegions,
        galleryUrls: galleryUrls.length > 0 ? galleryUrls : undefined,
        aboutMe: aboutMe.trim() ? aboutMe : undefined,
        projects: [],
      });
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    // Convert FileList to array and limit to 5 files
    const filesArray = Array.from(selectedFiles);
    const newFiles = [...galleryFiles];
    
    // Add new files up to the limit of 5
    for (let i = 0; i < filesArray.length; i++) {
      if (newFiles.length < 5) {
        newFiles.push(filesArray[i]);
      } else {
        break;
      }
    }
    
    setGalleryFiles(newFiles);
  };

  const nextStep = () => {
    if (step === 1) {
      if (!name) {
        setError(t.enterName);
        return;
      }
      
      if (!phonePrefix || !phoneNumber) {
        setError(t.enterPhone);
        return;
      }
      
      // Validate phone prefix
      const prefixRegex = /^05\d$|^07\d$/;
      if (!prefixRegex.test(phonePrefix)) {
        setError(t.invalidPrefix);
        return;
      }
      
      // Validate phone number
      const numberRegex = /^\d{7}$/;
      if (!numberRegex.test(phoneNumber)) {
        setError(t.invalidNumber);
        return;
      }
    }
    
    if (step === 2 && roles.length === 0) {
      setError(t.selectRole);
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const addWorkRegion = (region: string) => {
    if (!workRegions.includes(region) && region.trim() !== '') {
      setWorkRegions([...workRegions, region]);
    }
    setShowRegionDropdown(false);
  };

  const removeWorkRegion = (region: string) => {
    setWorkRegions(workRegions.filter(r => r !== region));
  };

  // Function to filter regions and cities based on search term
  const getFilteredRegions = () => {
    if (!regionSearchTerm.trim()) {
      return israelRegionsData;
    }
    
    const searchLower = regionSearchTerm.toLowerCase();
    const filteredRegions: Record<string, string[]> = {};
    
    Object.entries(israelRegionsData).forEach(([region, cities]) => {
      // Check if region name matches
      const regionMatches = region.toLowerCase().includes(searchLower);
      
      // Filter cities that match search term
      const matchingCities = cities.filter(city => 
        city.toLowerCase().includes(searchLower)
      );
      
      // Include region if either the region name matches or it has matching cities
      if (regionMatches || matchingCities.length > 0) {
        filteredRegions[region] = regionMatches ? cities : matchingCities;
      }
    });
    
    return filteredRegions;
  };

  const addCustomRegion = () => {
    if (regionSearchTerm.trim() && !workRegions.includes(regionSearchTerm.trim())) {
      setWorkRegions([...workRegions, regionSearchTerm.trim()]);
      setRegionSearchTerm('');
      setShowRegionDropdown(false);
    }
  };

  const removeGalleryFile = (index: number) => {
    const newFiles = [...galleryFiles];
    newFiles.splice(index, 1);
    setGalleryFiles(newFiles);
    
    const newPreviews = [...galleryPreviews];
    newPreviews.splice(index, 1);
    setGalleryPreviews(newPreviews);
  };

  // Add click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target as Node)) {
        setShowRegionDropdown(false);
      }
    }
    
    // Add event listener when dropdown is shown
    if (showRegionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRegionDropdown]);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center"
      dir={language === 'en' ? 'ltr' : 'rtl'}
    >
      {/* Language selector */}
      <div className="absolute top-16 right-4 flex space-x-2">
        <button 
          onClick={() => setLanguage('he')} 
          className={`px-3 py-1 rounded-md ${language === 'he' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          עברית
        </button>
        <button 
          onClick={() => setLanguage('ar')} 
          className={`px-3 py-1 rounded-md ${language === 'ar' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          العربية
        </button>
        <button 
          onClick={() => setLanguage('en')} 
          className={`px-3 py-1 rounded-md ${language === 'en' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
        >
          English
        </button>
      </div>
      
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="mb-8">
          <h2 className="text-center text-2xl font-bold text-gray-800">{t.title}</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= item
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {item}
                </div>
                <div className="text-xs mt-1 text-gray-500">
                  {t.steps[item-1]}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 w-full bg-gray-200 rounded">
            <div
              className="h-full bg-indigo-600 rounded transition-all duration-300"
              style={{ width: `${((step - 1) / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t.fullName}
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder={t.fullName}
                required
                dir={language === 'en' ? 'ltr' : 'rtl'}
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t.phoneNumber}
              </label>
              <div className="flex space-x-2" style={{ direction: 'ltr' }}>
                <div className="w-1/3">
                  <input
                    id="phone-prefix"
                    type="text"
                    value={phonePrefix}
                    onChange={(e) => {
                      // Allow only numbers and limit to 3 characters
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 3);
                      setPhonePrefix(value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="050"
                    required
                    dir="ltr"
                  />
                </div>
                <div className="w-2/3">
                  <input
                    id="phone-number"
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Allow only numbers and limit to 7 characters
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 7);
                      setPhoneNumber(value);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="0000000"
                    required
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t.phoneFormat}
              </div>
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                {t.experience}
              </label>
              <div className="relative">
                <input
                  id="experience"
                  type="number"
                  min="0"
                  max="70"
                  value={yearsOfExperience}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setYearsOfExperience('');
                    } else {
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 70) {
                        setYearsOfExperience(numValue);
                      }
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="0"
                  required
                  dir="ltr"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {t.experienceQuestion}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.workRegions}
              </label>
              <div className="w-full border border-gray-300 px-4 py-3 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
                <div className="flex flex-wrap gap-2 mb-2">
                  {workRegions.map((region, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 transition hover:bg-indigo-200"
                    >
                      {region}
                      <button
                        onClick={() => removeWorkRegion(region)}
                        className="text-indigo-500 hover:text-indigo-700 font-bold transition"
                        title="Remove region"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative" ref={regionDropdownRef}>
                  <div className="w-full py-1 flex items-center justify-between">
                    <input
                      type="text"
                      className="w-full focus:outline-none"
                      placeholder={t.searchRegions}
                      value={regionSearchTerm}
                      onChange={(e) => {
                        setRegionSearchTerm(e.target.value);
                        setShowRegionDropdown(true);
                      }}
                      onClick={() => setShowRegionDropdown(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomRegion();
                        }
                      }}
                      dir={language === 'en' ? 'ltr' : 'rtl'}
                    />
                    {regionSearchTerm && (
                      <button
                        onClick={() => setRegionSearchTerm('')}
                        className="text-gray-400 hover:text-gray-600 transition"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {showRegionDropdown && (
                    <div className="pb-40 absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {isLoadingRegions ? (
                        <div className="py-2 px-3 text-gray-500">
                          {t.loadingRegions}
                        </div>
                      ) : Object.keys(getFilteredRegions()).length === 0 ? (
                        <div 
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50"
                          onClick={addCustomRegion}
                        >
                          {t.customLocation.replace('{term}', regionSearchTerm)}
                        </div>
                      ) : (
                        Object.entries(getFilteredRegions()).map(([region, cities]) => (
                          <div key={region}>
                            <div 
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 font-medium text-gray-900 hover:bg-indigo-50"
                              onClick={() => {
                                addWorkRegion(region);
                                setRegionSearchTerm('');
                              }}
                            >
                              {region}
                            </div>
                            {cities.map((city, idx) => (
                              <div 
                                key={idx}
                                className="cursor-pointer select-none relative py-2 pl-8 pr-9 text-gray-700 hover:bg-indigo-50"
                                onClick={() => {
                                  addWorkRegion(`${region} - ${city}`);
                                  setRegionSearchTerm('');
                                }}
                              >
                                {city}
                              </div>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t.regionsHelp}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.roles}</label>
              <div className="w-full border border-gray-300 px-4 py-3 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition">
                <div className="flex flex-wrap gap-2 mb-2">
                  {roles.map((r, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full flex items-center gap-2 transition hover:bg-indigo-200"
                    >
                      {r}
                      <button
                        onClick={() => setRoles(roles.filter(role => role !== r))}
                        className="text-indigo-500 hover:text-indigo-700 font-bold transition"
                        title="Remove role"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full focus:outline-none"
                    placeholder={t.searchRoles}
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && roleInput.trim()) {
                        e.preventDefault();
                        const matched = allRoles.find(role =>
                          role.toLowerCase() === roleInput.trim().toLowerCase()
                        );
                        const roleToAdd = matched || roleInput.trim();
                        if (!roles.includes(roleToAdd)) {
                          setRoles([...roles, roleToAdd]);
                        }
                        setRoleInput('');
                      }
                    }}
                    dir={language === 'en' ? 'ltr' : 'rtl'}
                  />
                  
                  {roleInput.trim() !== '' && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {allRoles
                        .filter(role => 
                          role.toLowerCase().includes(roleInput.toLowerCase())
                        )
                        .map((role, idx) => (
                          <div
                            key={idx}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                              roles.includes(role) ? 'text-gray-400' : 'text-gray-900'
                            }`}
                            onClick={() => {
                              if (!roles.includes(role)) {
                                setRoles([...roles, role]);
                                setRoleInput('');
                              }
                            }}
                          >
                            <span className="block truncate">
                              {role}
                            </span>
                            {roles.includes(role) && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                        ))}
                      {allRoles.filter(role => 
                        role.toLowerCase().includes(roleInput.toLowerCase())
                      ).length === 0 && (
                        <div className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50"
                          onClick={() => {
                            if (!roles.includes(roleInput.trim()) && roleInput.trim() !== '') {
                              setRoles([...roles, roleInput.trim()]);
                              setRoleInput('');
                            }
                          }}
                        >
                          <span className="block truncate font-medium">
                            {t.customRole.replace('{term}', roleInput)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-500">
                {t.rolesHelp}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.gallery}
              </label>
              <div className="mt-1 flex flex-col space-y-4">
                {/* Gallery preview */}
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={preview} 
                          alt={`Gallery image ${index + 1}`} 
                          className="h-32 w-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryFile(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload button */}
                {galleryFiles.length < 5 && (
                  <div 
                    className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition"
                    onClick={() => document.getElementById('gallery-upload')?.click()}
                  >
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="gallery-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                          <span>{t.uploadGallery}</span>
                          <input
                            id="gallery-upload"
                            name="gallery-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleGalleryFileSelect}
                          />
                        </label>
                        <p className="pl-1">{t.dragDrop}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {t.imageFormat}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t.galleryHelp}
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="about-me" className="block text-sm font-medium text-gray-700 mb-1">
                {t.aboutMe}
              </label>
              <textarea
                id="about-me"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                placeholder={t.aboutMePlaceholder}
                dir={language === 'en' ? 'ltr' : 'rtl'}
              ></textarea>
              <p className="mt-2 text-sm text-gray-500">
                {t.aboutMeHelp}
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.profileImage}
              </label>
              <div className="mt-1 flex flex-col items-center space-y-4">
                {previewUrl ? (
                  <div className="relative group">
                    <img 
                      src={previewUrl} 
                      alt="Profile preview" 
                      className="h-40 w-40 object-cover rounded-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex justify-center items-center h-40 w-40 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
                    onClick={() => document.getElementById('profile-upload')?.click()}
                  >
                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                
                <div className="flex items-center justify-center">
                  <label
                    htmlFor="profile-upload"
                    className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {t.uploadProfile}
                    <input
                      id="profile-upload"
                      name="profile-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500 text-center">
                {t.profileHelp}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              {t.back}
            </button>
          ) : (
            <div></div>
          )}
          <button
            type="button"
            onClick={step === 5 ? handleSubmit : nextStep}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            disabled={isLoading}
          >
            {isLoading ? t.processing : step === 5 ? t.complete : t.next}
          </button>
        </div>
      </div>
    </div>
  );
}

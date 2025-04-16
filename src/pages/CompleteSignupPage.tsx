import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/storage';
import { createUserProfile } from '../services/users';
import { auth } from '../services/firebase';

const israelRegions = {
  'כללי': [
    'כל הישובים'
  ],
  'צפון': [
    'חיפה', 'נהריה', 'עכו', 'קריות', 'כרמיאל', 'טבריה', 'צפת', 'קרית שמונה', 
    'נצרת', 'עפולה', 'בית שאן', 'מגדל העמק', 'יקנעם', 'זכרון יעקב', 'טירת הכרמל'
  ],
  'שרון': [
    'נתניה', 'הרצליה', 'רעננה', 'כפר סבא', 'הוד השרון', 'רמת השרון', 'חדרה', 'פרדס חנה-כרכור',
    'אור עקיבא', 'באקה אל-גרביה', 'טייבה', 'טירה', 'קלנסווה'
  ],
  'מרכז': [
    'תל אביב', 'רמת גן', 'גבעתיים', 'בני ברק', 'פתח תקווה', 'ראש העין', 'אלעד',
    'חולון', 'בת ים', 'ראשון לציון', 'רחובות', 'נס ציונה', 'יבנה', 'אשדוד', 'אשקלון',
    'קרית גת', 'גדרה', 'יהוד', 'אור יהודה', 'רמלה', 'לוד', 'מודיעין', 'שוהם'
  ],
  'ירושלים והסביבה': [
    'ירושלים', 'מעלה אדומים', 'בית שמש', 'מבשרת ציון', 'גבעת זאב', 'אפרת', 'ביתר עילית'
  ],
  'יהודה ושומרון': [
    'אריאל', 'מעלה אדומים', 'אפרת', 'ביתר עילית', 'קרני שומרון', 'אלפי מנשה', 'אורנית',
    'קדומים', 'בית אל', 'עלי', 'שילה', 'עפרה'
  ],
  'דרום': [
    'באר שבע', 'אשדוד', 'אשקלון', 'קרית גת', 'נתיבות', 'אופקים', 'שדרות', 'דימונה',
    'ירוחם', 'ערד', 'מצפה רמון', 'אילת'
  ],
  'שפלה': [
    'רחובות', 'נס ציונה', 'יבנה', 'גדרה', 'קרית מלאכי', 'קרית עקרון', 'מזכרת בתיה'
  ],
  'אילת והערבה': [
    'אילת', 'יטבתה', 'חצבה', 'ספיר', 'עין יהב', 'פארן'
  ]
};

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

export default function CompleteSignupPage() {
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
  const navigate = useNavigate();

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
      setError('Please fill all required fields.');
      return;
    }

    // Validate phone number
    const prefixRegex = /^05\d$|^07\d$/;
    const numberRegex = /^\d{7}$/;
    
    if (!prefixRegex.test(phonePrefix)) {
      setError('Please enter a valid Israeli phone prefix (05x or 07x)');
      return;
    }
    
    if (!numberRegex.test(phoneNumber)) {
      setError('Please enter a valid 7-digit phone number');
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
        setError('Please enter your name');
        return;
      }
      
      if (!phonePrefix || !phoneNumber) {
        setError('Please enter your phone number');
        return;
      }
      
      // Validate phone prefix
      const prefixRegex = /^05\d$|^07\d$/;
      if (!prefixRegex.test(phonePrefix)) {
        setError('Please enter a valid Israeli phone prefix (05x or 07x)');
        return;
      }
      
      // Validate phone number
      const numberRegex = /^\d{7}$/;
      if (!numberRegex.test(phoneNumber)) {
        setError('Please enter a valid 7-digit phone number');
        return;
      }
    }
    
    if (step === 2 && roles.length === 0) {
      setError('Please select at least one role');
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
      return israelRegions;
    }
    
    const searchLower = regionSearchTerm.toLowerCase();
    const filteredRegions: Record<string, string[]> = {};
    
    Object.entries(israelRegions).forEach(([region, cities]) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="mb-8">
          <h2 className="text-center text-2xl font-bold text-gray-800">Complete Your Profile</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's set up your professional profile
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
                  {item === 1 
                    ? 'Basic Info' 
                    : item === 2 
                    ? 'Roles' 
                    : item === 3 
                    ? 'Gallery' 
                    : item === 4
                    ? 'About Me'
                    : 'Photo'}
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
                Full Name / שם מלא
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Enter your full name / הכנס שם מלא"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number / מספר טלפון
              </label>
              <div className="flex space-x-2">
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
                    placeholder="000"
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
                Format: 05X followed by 7 digits
              </div>
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience / שנות ותק
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
                  placeholder="Enter years of experience / הכנס שנות ותק"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  How many years have you been working in your field?
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Regions / אזורי עבודה
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
                <div className="relative">
                  <div className="w-full py-1 flex items-center justify-between">
                    <input
                      type="text"
                      className="w-full focus:outline-none"
                      placeholder="חפש או בחר אזורי עבודה"
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
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                      {Object.keys(getFilteredRegions()).length === 0 ? (
                        <div 
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-indigo-50"
                          onClick={addCustomRegion}
                        >
                          Add "{regionSearchTerm}" as custom location
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
                Search for locations or select from the list. Press Enter to add a custom location.
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Roles / תפקידים</label>
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
                    placeholder="Search or type a role... / חפש או הקלד תפקיד"
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
                            Add "{roleInput}" as a custom role
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 text-sm text-gray-500">
                Search for roles, click on suggestions, or add your own custom role
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Gallery / גלריית עבודות (אופציונלי)
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
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="gallery-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                        >
                          <span>Upload gallery images</span>
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
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB (max 5 images)
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Upload up to 5 images showcasing your work. This will help clients understand your style and quality.
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-6">
              <label htmlFor="about-me" className="block text-sm font-medium text-gray-700 mb-1">
                About Me / על עצמי
              </label>
              <textarea
                id="about-me"
                rows={6}
                value={aboutMe}
                onChange={(e) => setAboutMe(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Tell potential clients about yourself, your experience, and what makes your services unique..."
                dir="auto"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Share your expertise, specialties, and approach to your work</span>
                <span>{aboutMe.length}/500</span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="profile-image" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image (Optional) / תמונת פרופיל (אופציונלי)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-indigo-500 transition" onClick={() => document.getElementById('profile-upload')?.click()}>
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="relative group">
                      <img src={previewUrl} alt="Profile preview" className="mx-auto h-32 w-32 rounded-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('profile-upload')?.click();
                          }}
                          className="bg-indigo-500 text-white rounded-full p-2 mx-1"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            setPreviewUrl(null);
                          }}
                          className="bg-red-500 text-white rounded-full p-2 mx-1"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="profile-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          <span>Upload a profile image</span>
                          <input id="profile-upload" name="profile-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileSelect} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                If you don't upload an image, a default avatar will be used.
              </p>
            </div>
            
            {/* ... existing gallery upload code ... */}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              Back / חזור
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 5 ? (
            <button
              onClick={nextStep}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              Next / הבא
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Complete / סיים'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

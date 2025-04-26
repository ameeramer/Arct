import { auth } from './firebase';

// סוגי בקרה שונים שניתן להשתמש בהם
export type ControlType = 'sketch' | 'structure' | 'style' | 'style-transfer';

// פרמטרים בסיסיים לכל סוגי הבקשות
interface BaseStabilityParams {
  prompt: string;
  negative_prompt?: string;
  seed?: number;
  output_format?: 'png' | 'jpeg' | 'webp';
}

// פרמטרים ספציפיים לבקרת סקיצה ומבנה
interface ControlParams extends BaseStabilityParams {
  control_strength?: number; // 0-1, default 0.7
  style_preset?: string;
}

// פרמטרים ספציפיים לבקרת סגנון
interface StyleParams extends BaseStabilityParams {
  aspect_ratio?: string; // default '1:1'
  fidelity?: number; // 0-1, default 0.5
  style_preset?: string;
}

// פרמטרים ספציפיים להעברת סגנון
interface StyleTransferParams {
  prompt?: string;
  negative_prompt?: string;
  style_strength?: number; // 0-1, default 1
  composition_fidelity?: number; // 0-1, default 0.9
  change_strength?: number; // 0.1-1, default 0.9
  seed?: number;
  output_format?: 'png' | 'jpeg' | 'webp';
}

/**
 * מבצע בקשה ל-Stability AI API עם בקרת סקיצה או מבנה
 * @param controlType סוג הבקרה (sketch או structure)
 * @param imageFile קובץ התמונה המקורי
 * @param params פרמטרים נוספים לבקשה
 * @returns הבטחה שמחזירה את התמונה שנוצרה כ-Blob
 */
export async function generateControlledImage(
  controlType: 'sketch' | 'structure',
  imageFile: File,
  params: ControlParams
): Promise<Blob> {
  // בדיקת תקינות הפרמטרים
  if (!params.prompt) {
    throw new Error('Prompt is required');
  }

  // יצירת FormData לבקשה
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('prompt', params.prompt);

  // הוספת פרמטרים אופציונליים
  if (params.control_strength !== undefined) {
    formData.append('control_strength', params.control_strength.toString());
  }
  if (params.negative_prompt) {
    formData.append('negative_prompt', params.negative_prompt);
  }
  if (params.seed !== undefined) {
    formData.append('seed', params.seed.toString());
  }
  if (params.output_format) {
    formData.append('output_format', params.output_format);
  }
  if (params.style_preset) {
    formData.append('style_preset', params.style_preset);
  }

  // קבלת מפתח API מהסביבה או מהגדרות המשתמש
  const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('Stability API key is not configured');
  }

  // שליחת הבקשה ל-API
  const response = await fetch(
    `https://api.stability.ai/v2beta/stable-image/control/${controlType}`,
    {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'accept': 'image/*',
        'stability-client-id': 'arct-app',
        'stability-client-user-id': auth.currentUser?.uid || 'guest',
      },
      body: formData,
    }
  );

  // בדיקת תקינות התשובה
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Stability API error: ${JSON.stringify(errorData)}`);
  }

  // החזרת התמונה כ-Blob
  return await response.blob();
}

/**
 * מבצע בקשה ל-Stability AI API עם בקרת סגנון
 * @param imageFile קובץ התמונה המקורי
 * @param params פרמטרים נוספים לבקשה
 * @returns הבטחה שמחזירה את התמונה שנוצרה כ-Blob
 */
export async function generateStyledImage(
  imageFile: File,
  params: StyleParams
): Promise<Blob> {
  // בדיקת תקינות הפרמטרים
  if (!params.prompt) {
    throw new Error('Prompt is required');
  }

  // יצירת FormData לבקשה
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('prompt', params.prompt);

  // הוספת פרמטרים אופציונליים
  if (params.negative_prompt) {
    formData.append('negative_prompt', params.negative_prompt);
  }
  if (params.aspect_ratio) {
    formData.append('aspect_ratio', params.aspect_ratio);
  }
  if (params.fidelity !== undefined) {
    formData.append('fidelity', params.fidelity.toString());
  }
  if (params.seed !== undefined) {
    formData.append('seed', params.seed.toString());
  }
  if (params.output_format) {
    formData.append('output_format', params.output_format);
  }
  if (params.style_preset) {
    formData.append('style_preset', params.style_preset);
  }

  // קבלת מפתח API מהסביבה או מהגדרות המשתמש
  const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('Stability API key is not configured');
  }

  // שליחת הבקשה ל-API
  const response = await fetch(
    'https://api.stability.ai/v2beta/stable-image/control/style',
    {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'accept': 'image/*',
        'stability-client-id': 'arct-app',
        'stability-client-user-id': auth.currentUser?.uid || 'guest',
      },
      body: formData,
    }
  );

  // בדיקת תקינות התשובה
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Stability API error: ${JSON.stringify(errorData)}`);
  }

  // החזרת התמונה כ-Blob
  return await response.blob();
}

/**
 * מבצע בקשה ל-Stability AI API עם העברת סגנון
 * @param initImageFile קובץ התמונה המקורי
 * @param styleImageFile קובץ התמונה עם הסגנון הרצוי
 * @param params פרמטרים נוספים לבקשה
 * @returns הבטחה שמחזירה את התמונה שנוצרה כ-Blob
 */
export async function generateStyleTransferImage(
  initImageFile: File,
  styleImageFile: File,
  params: StyleTransferParams = {}
): Promise<Blob> {
  // יצירת FormData לבקשה
  const formData = new FormData();
  formData.append('init_image', initImageFile);
  formData.append('style_image', styleImageFile);

  // הוספת פרמטרים אופציונליים
  if (params.prompt) {
    formData.append('prompt', params.prompt);
  }
  if (params.negative_prompt) {
    formData.append('negative_prompt', params.negative_prompt);
  }
  if (params.style_strength !== undefined) {
    formData.append('style_strength', params.style_strength.toString());
  }
  if (params.composition_fidelity !== undefined) {
    formData.append('composition_fidelity', params.composition_fidelity.toString());
  }
  if (params.change_strength !== undefined) {
    formData.append('change_strength', params.change_strength.toString());
  }
  if (params.seed !== undefined) {
    formData.append('seed', params.seed.toString());
  }
  if (params.output_format) {
    formData.append('output_format', params.output_format);
  }

  // קבלת מפתח API מהסביבה או מהגדרות המשתמש
  const apiKey = import.meta.env.VITE_STABILITY_API_KEY;
  if (!apiKey) {
    throw new Error('Stability API key is not configured');
  }

  // שליחת הבקשה ל-API
  const response = await fetch(
    'https://api.stability.ai/v2beta/stable-image/control/style-transfer',
    {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'accept': 'image/*',
        'stability-client-id': 'arct-app',
        'stability-client-user-id': auth.currentUser?.uid || 'guest',
      },
      body: formData,
    }
  );

  // בדיקת תקינות התשובה
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Stability API error: ${JSON.stringify(errorData)}`);
  }

  // החזרת התמונה כ-Blob
  return await response.blob();
}

/**
 * מעבד תמונה שנוצרה ע"י Stability AI ושומר אותה בפרויקט
 * @param blob ה-Blob של התמונה שנוצרה
 * @param projectId מזהה הפרויקט
 * @param designId מזהה העיצוב (אופציונלי)
 * @returns הבטחה שמחזירה את כתובת ה-URL של התמונה השמורה
 */
export async function processAndSaveGeneratedImage(
  blob: Blob,
  projectId: string,
  designId?: string
): Promise<string> {
  // יצירת קובץ מה-Blob
  const filename = `design-${Date.now()}.${blob.type.split('/')[1] || 'png'}`;
  const file = new File([blob], filename, { type: blob.type });
  
  // העלאת התמונה לאחסון
  const { uploadImage } = await import('./storage');
  const url = await uploadImage(file, filename);
  
  // עדכון הפרויקט עם התמונה החדשה
  const { getProject, updateProject } = await import('./projects');
  const project = await getProject(projectId);
  
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }
  
  // הוספת העיצוב החדש לפרויקט
  const newDesign = {
    id: designId || `design-${Date.now()}`,
    url,
    type: 'ai' as const
  };
  
  const updatedDesigns = [...(project.designs || []), newDesign];
  await updateProject({ ...project, designs: updatedDesigns });
  
  return url;
} 
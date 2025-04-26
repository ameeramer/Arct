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
 * מבצע שינוי גודל לתמונה כדי לעמוד בדרישות ה-API של Stability
 * @param file קובץ התמונה המקורי
 * @returns הבטחה שמחזירה את קובץ התמונה בגודל המתאים
 */
export async function resizeImageForStability(file: File): Promise<File> {
  // בדיקה אם הקובץ כבר קטן מ-9MB (משאירים מרווח לפרמטרים אחרים בבקשה)
  if (file.size < 9 * 1024 * 1024) {
    // בדיקה נוספת של מימדי התמונה
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const { width, height } = img;
        const totalPixels = width * height;
        
        // בדיקה אם התמונה כבר בגודל מתאים
        if (totalPixels <= 9437184 && width >= 64 && height >= 64) {
          // בדיקת יחס גובה-רוחב (חייב להיות בין 1:2.5 ל-2.5:1)
          const aspectRatio = width / height;
          if (aspectRatio >= 0.4 && aspectRatio <= 2.5) {
            resolve(file);
            return;
          }
        }
        
        // המשך לשינוי גודל...
        compressAndResizeImage(img, file, resolve, reject);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  } else {
    // הקובץ גדול מדי, חייבים לדחוס אותו
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        compressAndResizeImage(img, file, resolve, reject, true);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }
}

/**
 * פונקציית עזר לדחיסה ושינוי גודל של תמונה
 */
function compressAndResizeImage(
  img: HTMLImageElement, 
  file: File, 
  resolve: (file: File) => void, 
  reject: (error: Error) => void,
  forceCompress: boolean = false
) {
  const { width, height } = img;
  const totalPixels = width * height;
  
  // חישוב הגודל החדש
  let newWidth = width;
  let newHeight = height;
  
  // טיפול בתמונות גדולות מדי
  if (totalPixels > 9437184 || forceCompress) {
    // אם צריך דחיסה חזקה, נקטין יותר
    const targetPixels = forceCompress ? 4000000 : 9000000;
    const scale = Math.sqrt(targetPixels / totalPixels);
    newWidth = Math.floor(width * scale);
    newHeight = Math.floor(height * scale);
  }
  
  // טיפול ביחס גובה-רוחב
  const aspectRatio = newWidth / newHeight;
  if (aspectRatio < 0.4) {
    // תמונה צרה מדי
    newWidth = Math.ceil(newHeight * 0.4);
  } else if (aspectRatio > 2.5) {
    // תמונה רחבה מדי
    newHeight = Math.ceil(newWidth / 2.5);
  }
  
  // וידוא שהתמונה לא קטנה מדי
  if (newWidth < 64) {
    newWidth = 64;
    newHeight = Math.min(Math.ceil(newWidth / 0.4), 160);
  }
  if (newHeight < 64) {
    newHeight = 64;
    newWidth = Math.min(Math.ceil(newHeight * 2.5), 160);
  }
  
  // יצירת קנבס לשינוי גודל התמונה
  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    reject(new Error('Failed to get canvas context'));
    return;
  }
  
  // ציור התמונה בגודל החדש
  ctx.drawImage(img, 0, 0, newWidth, newHeight);
  
  // המרת הקנבס לקובץ עם דחיסה
  const quality = forceCompress ? 0.7 : 0.9; // דחיסה חזקה יותר אם הקובץ גדול מאוד
  
  canvas.toBlob(
    (blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      
      // בדיקה אם הקובץ עדיין גדול מדי
      if (blob.size > 9 * 1024 * 1024) {
        // ניסיון נוסף עם דחיסה חזקה יותר
        canvas.toBlob(
          (compressedBlob) => {
            if (!compressedBlob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            
            const newFile = new File([compressedBlob], file.name, { 
              type: 'image/jpeg', 
              lastModified: file.lastModified 
            });
            
            resolve(newFile);
          },
          'image/jpeg',
          0.5  // דחיסה חזקה מאוד
        );
      } else {
        // הקובץ בגודל מתאים
        const newFile = new File([blob], file.name, { 
          type: forceCompress ? 'image/jpeg' : 'image/png', 
          lastModified: file.lastModified 
        });
        
        resolve(newFile);
      }
    },
    forceCompress ? 'image/jpeg' : 'image/png',
    quality
  );
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

  // שינוי גודל התמונה אם צריך
  const resizedImage = await resizeImageForStability(imageFile);

  // יצירת FormData לבקשה
  const formData = new FormData();
  formData.append('image', resizedImage);
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

  // שינוי גודל התמונה אם צריך
  const resizedImage = await resizeImageForStability(imageFile);

  // יצירת FormData לבקשה
  const formData = new FormData();
  formData.append('image', resizedImage);
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
  // שינוי גודל התמונות אם צריך
  const resizedInitImage = await resizeImageForStability(initImageFile);
  const resizedStyleImage = await resizeImageForStability(styleImageFile);

  // יצירת FormData לבקשה
  const formData = new FormData();
  formData.append('init_image', resizedInitImage);
  formData.append('style_image', resizedStyleImage);

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
import { auth } from './firebase';

// סוגי פעולות תמונה
export type ImageAction = 'generate' | 'edit';

// פרמטרים בסיסיים לכל סוגי הבקשות
interface BaseImageParams {
  prompt: string;
  size?: '1024x1024' | '1536x1024' | '1024x1536' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  format?: 'png' | 'jpeg' | 'webp';
  output_compression?: number; // 0-100 for jpeg and webp
  background?: 'transparent' | 'opaque' | 'auto';
  moderation?: 'auto' | 'low';
  n?: number; // מספר התמונות לייצר (ברירת מחדל: 1)
}

// פרמטרים ספציפיים לעריכת תמונה
interface EditImageParams extends BaseImageParams {
  // אין פרמטרים נוספים ספציפיים לעריכה
}

/**
 * שינוי גודל תמונה לפי דרישות OpenAI
 * @param file קובץ התמונה
 * @returns קובץ תמונה בגודל מתאים
 */
async function resizeImageForOpenAI(file: File): Promise<File> {
  // בדיקה אם התמונה כבר בגודל מתאים
  const img = new Image();
  const imgPromise = new Promise<HTMLImageElement>((resolve) => {
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(file);
  });
  
  const loadedImg = await imgPromise;
  
  // אם התמונה כבר בגודל מתאים, החזר אותה כמו שהיא
  if (loadedImg.width <= 1024 && loadedImg.height <= 1024) {
    return file;
  }
  
  // שינוי גודל התמונה
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // חישוב הגודל החדש תוך שמירה על יחס הצדדים
  let newWidth = loadedImg.width;
  let newHeight = loadedImg.height;
  
  if (newWidth > newHeight) {
    if (newWidth > 1024) {
      newHeight = Math.round((newHeight * 1024) / newWidth);
      newWidth = 1024;
    }
  } else {
    if (newHeight > 1024) {
      newWidth = Math.round((newWidth * 1024) / newHeight);
      newHeight = 1024;
    }
  }
  
  canvas.width = newWidth;
  canvas.height = newHeight;
  
  // ציור התמונה על הקנבס
  ctx.drawImage(loadedImg, 0, 0, newWidth, newHeight);
  
  // המרת הקנבס לבלוב
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to convert canvas to blob');
      }
      
      const newFile = new File([blob], file.name, {
        type: 'image/png',
        lastModified: Date.now()
      });
      
      resolve(newFile);
    }, 'image/png');
  });
}

/**
 * יצירת תמונה חדשה באמצעות OpenAI
 * @param prompt תיאור התמונה הרצויה
 * @param params פרמטרים נוספים
 * @returns הבטחה שמחזירה Blob של התמונה שנוצרה
 */
export async function generateImage(
  prompt: string,
  params: Partial<BaseImageParams> = {}
): Promise<Blob> {
  // בדיקת תקינות הפרמטרים
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  // קבלת טוקן הזדהות
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in');
  }

  // יצירת הבקשה
  const requestData: {
    model: string;
    prompt: string;
    size: string;
    quality: string;
    response_format: string;
    n: number;
    format?: string;
    output_compression?: number;
    background?: string;
    moderation?: string;
  } = {
    model: "gpt-image-1",
    prompt,
    size: params.size || "1024x1024",
    quality: params.quality || "auto",
    response_format: "b64_json",
    n: params.n || 1
  };

  // הוספת פרמטרים אופציונליים
  if (params.format) {
    requestData["format"] = params.format;
  }
  
  if (params.output_compression && (params.format === 'jpeg' || params.format === 'webp')) {
    requestData["output_compression"] = params.output_compression;
  }
  
  if (params.background) {
    requestData["background"] = params.background;
  }
  
  if (params.moderation) {
    requestData["moderation"] = params.moderation;
  }

  const idToken = import.meta.env.VITE_OPENAI_API_KEY;

  try {
    // שליחת הבקשה לשרת שלנו (שיעביר אותה ל-OpenAI)
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      // קריאת התגובה כטקסט תחילה
      const responseText = await response.text();
      let errorMessage = 'Failed to generate image';
      
      // ניסיון לפרסר את הטקסט כ-JSON
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (jsonError) {
          // אם לא ניתן לפרסר כ-JSON, נשתמש בטקסט הגולמי
          errorMessage = responseText;
        }
      }
      
      throw new Error(errorMessage);
    }

    // קריאת התגובה כטקסט
    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty response from server');
    }

    // פרסור התגובה כ-JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid response format from server');
    }
    
    // בדיקה שהתגובה מכילה את הנתונים הנדרשים
    if (!data.data || !data.data[0]) {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected response structure from server');
    }
    
    // טיפול בתגובה - בדיקה אם התגובה היא URL או base64
    if (data.data[0].url) {
      // אם התגובה היא URL, נוריד את התמונה
      try {
        const imageResponse = await fetch(data.data[0].url);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image from URL');
        }
        return await imageResponse.blob();
      } catch (error) {
        console.error('Error fetching image from URL:', error);
        throw new Error('Failed to fetch generated image');
      }
    } else if (data.data[0].b64_json) {
      // אם התגובה היא base64, נמיר אותה ל-Blob
      const base64Data = data.data[0].b64_json;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: `image/${params.format || 'png'}` });
    } else {
      // אם אין לנו לא URL ולא base64, יש בעיה
      console.error('Response data does not contain url or b64_json:', data);
      throw new Error('Response does not contain a valid image format');
    }
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

/**
 * עריכת תמונה קיימת באמצעות OpenAI
 * @param imageFile קובץ התמונה לעריכה
 * @param prompt תיאור השינויים הרצויים
 * @param params פרמטרים נוספים
 * @returns הבטחה שמחזירה Blob של התמונה שנוצרה
 */
export async function editImage(
  imageFile: File | File[],
  prompt: string,
  params: Partial<EditImageParams> = {}
): Promise<Blob> {
  // בדיקת תקינות הפרמטרים
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  // קבלת טוקן הזדהות
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in');
  }
  const idToken = import.meta.env.VITE_OPENAI_API_KEY;

  // שינוי גודל התמונות אם צריך
  let processedImages: File[] = [];
  
  if (Array.isArray(imageFile)) {
    // מערך של תמונות
    for (const img of imageFile) {
      const resizedImg = await resizeImageForOpenAI(img);
      processedImages.push(resizedImg);
    }
  } else {
    // תמונה בודדת
    const resizedImg = await resizeImageForOpenAI(imageFile);
    processedImages.push(resizedImg);
  }

  try {
    // יצירת FormData לבקשה
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    
    // הוספת התמונות
    processedImages.forEach(img => {
      formData.append('image[]', img);
    });
    
    // הוספת פרמטרים אופציונליים
    if (params.size) {
      formData.append('size', params.size);
    }
    
    if (params.quality) {
      formData.append('quality', params.quality);
    }
  
    
    if (params.output_compression && (params.format === 'jpeg' || params.format === 'webp')) {
      formData.append('output_compression', params.output_compression.toString());
    }
    
    if (params.background) {
      formData.append('background', params.background);
    }
    
    if (params.moderation) {
      formData.append('moderation', params.moderation);
    }
    
    if (params.n) {
      formData.append('n', params.n.toString());
    }

    // שליחת הבקשה לשרת
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData
    });

    if (!response.ok) {
      // קריאת התגובה כטקסט תחילה
      const responseText = await response.text();
      let errorMessage = 'Failed to edit image';
      
      // ניסיון לפרסר את הטקסט כ-JSON
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (jsonError) {
          // אם לא ניתן לפרסר כ-JSON, נשתמש בטקסט הגולמי
          errorMessage = responseText;
        }
      }
      
      throw new Error(errorMessage);
    }

    // קריאת התגובה כטקסט
    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty response from server');
    }

    // פרסור התגובה כ-JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid response format from server');
    }
    
    // בדיקה שהתגובה מכילה את הנתונים הנדרשים
    if (!data.data || !data.data[0]) {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected response structure from server');
    }
    
    // טיפול בתגובה - בדיקה אם התגובה היא URL או base64
    if (data.data[0].url) {
      // אם התגובה היא URL, נוריד את התמונה
      try {
        const imageResponse = await fetch(data.data[0].url);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image from URL');
        }
        return await imageResponse.blob();
      } catch (error) {
        console.error('Error fetching image from URL:', error);
        throw new Error('Failed to fetch edited image');
      }
    } else if (data.data[0].b64_json) {
      // אם התגובה היא base64, נמיר אותה ל-Blob
      const base64Data = data.data[0].b64_json;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: `image/${params.format || 'png'}` });
    } else {
      // אם אין לנו לא URL ולא base64, יש בעיה
      console.error('Response data does not contain url or b64_json:', data);
      throw new Error('Response does not contain a valid image format');
    }
  } catch (error) {
    console.error('Error editing image:', error);
    throw error;
  }
}

/**
 * יצירת תמונה חדשה בהשראת תמונה אחרת עם שמירת המבנה של תמונה נתונה
 * @param structureImage התמונה שהמבנה שלה יישמר
 * @param inspirationImage תמונת ההשראה לסגנון
 * @param prompt תיאור נוסף לתמונה המבוקשת
 * @param params פרמטרים נוספים
 * @returns הבטחה שמחזירה Blob של התמונה שנוצרה
 */
export async function createImageWithInspirationAndStructure(
  structureImage: File,
  inspirationImage: File,
  prompt: string,
  params: Partial<BaseImageParams> = {}
): Promise<Blob> {
  // בדיקת תקינות הפרמטרים
  if (!structureImage || !inspirationImage) {
    throw new Error('Both structure and inspiration images are required');
  }

  if (!prompt) {
    prompt = `I want to design the area/structure of the first image inspired by the second image. 
    Beware that this is an architectural/landscape architectural design so you cant add natural elements like mountains etc, only design it like an architect/landscape architect. 
    Also, keep the structure of the first image, for example, if there are structures in the image, keep it's structure as we are not going to destroy the structures and build new ones. generate edited image.`;
  }

  // הוספת הוראות ספציפיות לפרומפט
  const enhancedPrompt = `I want to design the area/structure of the first image inspired by the second image. 
    Beware that this is an architectural/landscape architectural design so you cant add natural elements like mountains etc, only design it like an architect/landscape architect. 
    Also, keep the structure of the first image, for example, if there are structures in the image, keep it's structure as we are not going to destroy the structures and build new ones. generate edited image.
Additional details: ${prompt}`;

  // קבלת טוקן הזדהות
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in');
  }
  const idToken = import.meta.env.VITE_OPENAI_API_KEY;

  // שינוי גודל התמונות אם צריך
  const processedStructureImage = await resizeImageForOpenAI(structureImage);
  const processedInspirationImage = await resizeImageForOpenAI(inspirationImage);

  try {
    // יצירת FormData לבקשה - נשתמש בממשק images/edits
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', enhancedPrompt);
    
    // הוספת התמונות כמערך - שים לב לתחביר המיוחד image[]
    formData.append('image[]', processedStructureImage);
    formData.append('image[]', processedInspirationImage);
    
    // הוספת פרמטרים אופציונליים
    if (params.size) {
      formData.append('size', params.size);
    }
    
    if (params.quality) {
      formData.append('quality', params.quality);
    }
    
    if (params.format) {
      formData.append('format', params.format);
    }
    
    if (params.output_compression && (params.format === 'jpeg' || params.format === 'webp')) {
      formData.append('output_compression', params.output_compression.toString());
    }
    
    if (params.background) {
      formData.append('background', params.background);
    }
    
    if (params.n) {
      formData.append('n', params.n.toString());
    }

    // שליחת הבקשה לשרת
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`
      },
      body: formData
    });

    if (!response.ok) {
      // קריאת התגובה כטקסט תחילה
      const responseText = await response.text();
      let errorMessage = 'Failed to create image with inspiration and structure';
      
      // ניסיון לפרסר את הטקסט כ-JSON
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch (jsonError) {
          // אם לא ניתן לפרסר כ-JSON, נשתמש בטקסט הגולמי
          errorMessage = responseText;
        }
      }
      
      throw new Error(errorMessage);
    }

    // קריאת התגובה כטקסט
    const responseText = await response.text();
    if (!responseText) {
      throw new Error('Empty response from server');
    }

    // פרסור התגובה כ-JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Invalid JSON response:', responseText);
      throw new Error('Invalid response format from server');
    }
    
    // בדיקה שהתגובה מכילה את הנתונים הנדרשים
    if (!data.data || !data.data[0]) {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected response structure from server');
    }
    
    // טיפול בתגובה - בדיקה אם התגובה היא URL או base64
    if (data.data[0].url) {
      // אם התגובה היא URL, נוריד את התמונה
      try {
        const imageResponse = await fetch(data.data[0].url);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image from URL');
        }
        return await imageResponse.blob();
      } catch (error) {
        console.error('Error fetching image from URL:', error);
        throw new Error('Failed to fetch generated image');
      }
    } else if (data.data[0].b64_json) {
      // אם התגובה היא base64, נמיר אותה ל-Blob
      const base64Data = data.data[0].b64_json;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      return new Blob(byteArrays, { type: `image/${params.format || 'png'}` });
    } else {
      // אם אין לנו לא URL ולא base64, יש בעיה
      console.error('Response data does not contain url or b64_json:', data);
      throw new Error('Response does not contain a valid image format');
    }
  } catch (error) {
    console.error('Error creating image with inspiration and structure:', error);
    throw error;
  }
}
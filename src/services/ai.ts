import { auth, storage } from './firebase';
import { generateImage as openaiGenerateImage, editImage as openaiEditImage, createImageWithInspirationAndStructure } from './openai';
import { ref, getDownloadURL } from 'firebase/storage';

// Types for chat messages
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | ChatContent[];
}

// Types for multi-modal content
export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

export type ChatContent = TextContent | ImageContent;

// Parameters for chat
interface ChatParams {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

// Types for agent decisions
export type AgentAction = 'chat' | 'generate_image' | 'edit_image' | 'chat_with_image_ref' | 'create_with_dual_images';
export type AgentDecision = {
  action: AgentAction;
  prompt?: string;
  imageReference?: string;
  imageReferenceIndex?: number;
  secondImageReference?: string;
  secondImageReferenceIndex?: number;
  explanation?: string;
};

// Function to chat with GPT-4o
export async function chatWithGPT4o(
  messages: ChatMessage[],
  params: ChatParams = {}
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in');
  }

  const idToken = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Default system message if not provided
  const systemMessage: ChatMessage = {
    role: 'system',
    content: params.systemPrompt || 'You are a helpful assistant.'
  };
  
  // Clean up messages for compatibility with API
  const cleanMessages = cleanupMessagesForAPI(messages);
  
  // Prepare the messages array, adding the system message if not already included
  const hasSystemMessage = cleanMessages.some(msg => msg.role === 'system');
  const finalMessages = hasSystemMessage ? cleanMessages : [systemMessage, ...cleanMessages];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: finalMessages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1000
      })
    });

    if (!response.ok) {
      const responseText = await response.text();
      let errorMessage = 'Failed to generate response';
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (jsonError) {
        errorMessage = responseText;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData.choices[0].message.content;
  } catch (error) {
    console.error('Error in chatWithGPT4o:', error);
    throw error;
  }
}

// Function to clean up messages for API compatibility
function cleanupMessagesForAPI(messages: ChatMessage[]): ChatMessage[] {
  // Create a copy to avoid modifying the original array
  return messages.map(msg => {
    // For assistant messages, ensure content is string only (no images)
    if (msg.role === 'assistant' && Array.isArray(msg.content)) {
      // Extract only text content from the array
      const textContents = msg.content
        .filter(item => item.type === 'text')
        .map(item => (item as TextContent).text)
        .join('\n');
      
      return {
        role: 'assistant',
        content: textContents
      };
    }
    
    return msg;
  });
}

// Function to convert image to base64 data URL for sending in the chat
export async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Agent decides what action to take based on the conversation using GPT
export async function agentDecideAction(
  messages: ChatMessage[],
  currentInput: string,
  hasUploadedImage: boolean = false,
  hasDualImages: boolean = false
): Promise<AgentDecision> {
  // Check if there are any images in recent messages (last 5)
  const recentImagesIndices: number[] = [];
  
  // Check all messages for images, not just recent ones
  messages.forEach((msg, index) => {
    if (Array.isArray(msg.content)) {
      const hasImage = msg.content.some(item => item.type === 'image_url');
      if (hasImage) {
        recentImagesIndices.push(index);
      }
    }
  });
  
  // Get the latest image index
  const hasRecentImages = recentImagesIndices.length > 0;
  const latestImageIndex = hasRecentImages ? 
    Math.max(...recentImagesIndices) : -1;
  
  // Use GPT to decide what action to take
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be logged in');
  }

  const idToken = import.meta.env.VITE_OPENAI_API_KEY;
  
  // Create a system message with instructions for the agent
  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are an AI assistant that analyzes user input to determine the appropriate action to take.
Based on the user's message, decide what action I should take from the following options:
1. "chat" - regular conversation, just respond with text
2. "generate_image" - user wants me to create an image
3. "edit_image" - user wants me to edit a previously shared image
4. "chat_with_image_ref" - user is referring to a previous image but not asking for edits
5. "create_with_dual_images" - user wants to create an image using two images: one for structure and one for style/inspiration

ONLY return a JSON object with these fields:
{
  "action": "chat" | "generate_image" | "edit_image" | "chat_with_image_ref" | "create_with_dual_images",
  "imageReferenceIndex": number | null, (position of the referenced structure image in the conversation if applicable)
  "secondImageReferenceIndex": number | null, (position of the referenced inspiration image if using dual images)
  "explanation": "brief explanation of your decision"
}

Additional context:
- The conversation has ${messages.length} messages so far
- There ${hasRecentImages ? 'are' : 'are no'} images in the conversation
${hasRecentImages ? `- The latest image is at position ${latestImageIndex}` : ''}
${hasRecentImages && messages[latestImageIndex].role === 'assistant' ? '- The latest image was generated by the assistant (not uploaded by user)' : ''}
${hasRecentImages && messages[latestImageIndex].role === 'user' ? '- The latest image was uploaded by the user' : ''}
- The user's input is in Hebrew or English
${hasUploadedImage ? '- The user has just uploaded a new image with this message' : ''}
${hasDualImages ? '- The user has just uploaded two images with this message' : ''}

If the user has just uploaded a new image:
- If they're asking to describe/analyze the image: use "chat_with_image_ref"
- If they're asking to edit or modify the uploaded image: use "edit_image"
- If they're just sharing an image with minimal text: use "chat_with_image_ref"

If the user has uploaded two images:
- If they mention style transfer, inspiration, or applying the style of one image to another: use "create_with_dual_images"
- In this case, assume the first image is the structure image and the second is the inspiration/style image

When deciding if the user is referring to an image:
- If they use phrases like "add to it", "modify it", "the image", etc., they are likely referring to the latest image
- Pay special attention to the latest image in the conversation (assistant-generated or user-uploaded)
- If the user says something like "add trees" after an image was shown, they probably want to edit that image
- If the user asks a question about the image or general questions about the image or what to do with it, use "chat_with_image_ref"`
  };

  // Send a request to GPT to decide what action to take
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          systemMessage,
          { role: 'user', content: currentInput }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      // Fallback to chat if there's an error
      console.error('Error getting agent decision, falling back to chat');
      return { action: 'chat' };
    }

    const responseData = await response.json();
    const decisionText = responseData.choices[0].message.content;
    
    try {
      const decision: {
        action: AgentAction;
        imageReferenceIndex?: number;
        secondImageReferenceIndex?: number;
        explanation: string;
      } = JSON.parse(decisionText);
      
      console.log('Agent decision:', decision);
      
      // Extract the image reference if applicable
      let imageReference = '';
      let secondImageReference = '';
      
      // Handle case where we need to look at latest image regardless of what agent decided
      let imageReferenceIndex = decision.imageReferenceIndex === null ? undefined : decision.imageReferenceIndex;
      
      // If the agent didn't specify an image index but we're editing or referring to an image, 
      // use the latest image
      if ((decision.action === 'edit_image' || decision.action === 'chat_with_image_ref') && 
          imageReferenceIndex === undefined && 
          latestImageIndex >= 0) {
        imageReferenceIndex = latestImageIndex;
      }
      
      if (imageReferenceIndex !== undefined && 
          imageReferenceIndex >= 0 && 
          imageReferenceIndex < messages.length) {
        
        const msg = messages[imageReferenceIndex];
        if (Array.isArray(msg.content)) {
          const imageContent = msg.content.find(item => item.type === 'image_url') as ImageContent;
          if (imageContent) {
            imageReference = imageContent.image_url.url;
          }
        }
      }
      
      // Handle the second image reference for dual image creation
      let secondImageReferenceIndex = decision.secondImageReferenceIndex === null ? undefined : decision.secondImageReferenceIndex;
      
      if (secondImageReferenceIndex !== undefined && 
          secondImageReferenceIndex >= 0 && 
          secondImageReferenceIndex < messages.length) {
        
        const msg = messages[secondImageReferenceIndex];
        if (Array.isArray(msg.content)) {
          const imageContent = msg.content.find(item => item.type === 'image_url') as ImageContent;
          if (imageContent) {
            secondImageReference = imageContent.image_url.url;
          }
        }
      }
      
      return {
        action: decision.action,
        prompt: currentInput,
        imageReference,
        imageReferenceIndex,
        secondImageReference,
        secondImageReferenceIndex,
        explanation: decision.explanation
      };
    } catch (error) {
      console.error('Error parsing agent decision:', error);
      // Fallback to chat if there's an error
      return { action: 'chat', explanation: 'Error parsing agent decision' };
    }
  } catch (error) {
    console.error('Error in agentDecideAction:', error);
    // Fallback to chat if there's an error
    return { action: 'chat', explanation: 'Error calling agent' };
  }
}

// Store in-memory cache of images
const imageCache = new Map<string, Blob>();

// Function to safely fetch an image and handle CORS issues
async function safeImageFetch(url: string): Promise<Blob> {
  // Check cache first
  if (imageCache.has(url)) {
    return imageCache.get(url)!;
  }
  
  // Check if this is a data URL
  if (url.startsWith('data:')) {
    try {
      // Extract the data part from data URL
      const matches = url.match(/^data:(.+);base64,(.*)$/);
      if (matches && matches.length === 3) {
        const contentType = matches[1];
        const base64Data = matches[2];
        const binaryString = window.atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: contentType });
        imageCache.set(url, blob);
        return blob;
      }
    } catch (error) {
      console.error('Error processing data URL:', error);
    }
  }
  
  // Check if this is a Firebase Storage URL
  if (url.includes('firebasestorage.googleapis.com')) {
    console.log('Detected Firebase Storage URL, using Firebase Storage API');
    
    try {
      // Extract path from URL
      const pathStart = url.indexOf('/o/') + 3;
      const pathEnd = url.indexOf('?');
      
      if (pathStart > 2 && pathEnd > pathStart) {
        let path = url.substring(pathStart, pathEnd);
        // Decode the URL-encoded path
        path = decodeURIComponent(path);
        
        console.log('Accessing Firebase Storage path:', path);
        
        // Use our helper function to download the image
        const storageRef = ref(storage, path);
        const downloadURL = await getDownloadURL(storageRef);
        const response = await fetch(downloadURL, { mode: 'no-cors' });
        const blob = await response.blob();
        imageCache.set(url, blob); // Cache with original URL
        return blob;
      }
      
      throw new Error('Could not extract valid path from Firebase Storage URL');
    } catch (firebaseError) {
      console.error('Firebase Storage access error:', firebaseError);
      
      // Create a replacement message image
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#f7f7f7');
        gradient.addColorStop(1, '#e0e0e0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a message explaining the issue
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('לא ניתן לגשת לתמונה', canvas.width/2, canvas.height/2 - 40);
        
        ctx.font = '18px Arial';
        ctx.fillText('שגיאה בגישה למאגר התמונות', canvas.width/2, canvas.height/2);
        ctx.fillText('אנא העלה את התמונה מחדש', canvas.width/2, canvas.height/2 + 30);
        
        // Add a border
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      }
      
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            imageCache.set(url, blob);
            resolve(blob);
          } else {
            throw new Error('Failed to create placeholder image');
          }
        }, 'image/png');
      });
    }
  }
  
  // For non-Firebase URLs, try direct fetch
  try {
    // Try direct fetch first
    const response = await fetch(url, { 
      mode: 'cors',
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      const blob = await response.blob();
      imageCache.set(url, blob);
      return blob;
    }
    
    // If direct fetch failed, try with no-cors mode
    console.log('Trying to fetch with no-cors mode');
    try {
      // Create a placeholder image since we can't access the content with no-cors
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '20px Arial';
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.fillText('התמונה לא נגישה עקב הגבלות אבטחה', canvas.width/2, canvas.height/2);
      }
      
      return new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            imageCache.set(url, blob);
            resolve(blob);
          } else {
            throw new Error('Failed to create placeholder image');
          }
        }, 'image/png');
      });
    } catch (noCorsError) {
      console.error('Error with no-cors fetch:', noCorsError);
    }
    
    // If all above methods failed, create a simple error image
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('Error loading image', canvas.width/2, canvas.height/2);
    }
    
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('Failed to create placeholder image');
        }
      });
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    
    // Create a simple placeholder image as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('Error loading image', canvas.width/2, canvas.height/2);
    }
    
    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          throw new Error('Failed to create placeholder image');
        }
      });
    });
  }
}

// Process user input with the AI agent
export async function processWithAgent(
  messages: ChatMessage[],
  userInput: string,
  uploadedImage?: File | null,
  secondUploadedImage?: File | null
): Promise<{ responseText: string; imageBlob?: Blob }> {
  // Get agent decision based on context
  const decision = await agentDecideAction(
    messages, 
    userInput, 
    !!uploadedImage, 
    !!uploadedImage && !!secondUploadedImage
  );
  
  console.log('Agent decision with context:', decision);
  
  // If there are two uploaded images for dual image creation
  if (uploadedImage && secondUploadedImage) {
    // Convert to base64 for the API
    const base64Image1 = await imageToBase64(uploadedImage);
    const base64Image2 = await imageToBase64(secondUploadedImage);
    
    // Add to user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: [
        { type: 'text', text: userInput || 'Here are two images - one for structure and one for inspiration:' } as ChatContent,
        { type: 'image_url', image_url: { url: base64Image1 } } as ChatContent,
        { type: 'image_url', image_url: { url: base64Image2 } } as ChatContent
      ]
    };
    
    // Check the agent's decision
    if (decision.action === 'create_with_dual_images') {
      try {
        // Create a new image using both structure and inspiration
        const newImageBlob = await createImageWithInspirationAndStructure(
          uploadedImage,
          secondUploadedImage,
          userInput
        );
        
        const responseText = `הנה התמונה החדשה שיצרתי בהשראת התמונות שהעלית ולפי בקשתך: "${userInput}"`;
        
        return { responseText, imageBlob: newImageBlob };
      } catch (error) {
        console.error('Error creating image with dual images:', error);
        // Fallback to chat if creation fails
        const apiMessages = [...messages, userMessage];
        const responseText = await chatWithGPT4o(apiMessages);
        return { responseText };
      }
    } else {
      // For chat or other actions with the uploaded images
      const apiMessages = [...messages, userMessage];
      const responseText = await chatWithGPT4o(apiMessages);
      return { responseText };
    }
  } else if (uploadedImage) {
    // Single image upload - existing logic
    // Convert to base64 for the API
    const base64Image = await imageToBase64(uploadedImage);
    
    // Add to user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: [
        { type: 'text', text: userInput || 'Here is an image:' } as ChatContent,
        { type: 'image_url', image_url: { url: base64Image } } as ChatContent
      ]
    };
    
    // Check the agent's decision
    if (decision.action === 'edit_image') {
      try {
        // Edit the uploaded image directly
        const editedBlob = await openaiEditImage(uploadedImage, userInput);
        const responseText = `הנה התמונה המעודכנת לפי בקשתך: "${userInput}"`;
        
        return { responseText, imageBlob: editedBlob };
      } catch (error) {
        console.error('Error editing uploaded image:', error);
        // Fallback to chat if editing fails
        const apiMessages = [...messages, userMessage];
        const responseText = await chatWithGPT4o(apiMessages);
        return { responseText };
      }
    } else {
      // For chat or other actions with the uploaded image
      const apiMessages = [...messages, userMessage];
      const responseText = await chatWithGPT4o(apiMessages);
      return { responseText };
    }
  } else {
    // No uploaded image, process based on agent decision
    
    // Add user's text message
    const userMessage: ChatMessage = {
      role: 'user',
      content: userInput
    };
    
    const updatedMessages = [...messages, userMessage];
    
    switch (decision.action) {
      case 'create_with_dual_images': {
        if (!decision.imageReference || !decision.secondImageReference) {
          // Fallback to regular chat if no image references
          const responseText = await chatWithGPT4o(updatedMessages);
          return { responseText };
        }
        
        // Skip blob URLs as they can't be processed by OpenAI
        if (decision.imageReference.startsWith('blob:') || decision.secondImageReference.startsWith('blob:')) {
          const responseText = `אני מצטער, לא ניתן לעבד את התמונות הללו. תמונות צריכות להיות בפורמט של data URL ולא blob URL.`;
          return { responseText };
        }
        
        // Use our safe image fetcher to avoid CORS issues
        try {
          const structureBlob = await safeImageFetch(decision.imageReference);
          const inspirationBlob = await safeImageFetch(decision.secondImageReference);
          
          const structureFile = new File([structureBlob], 'structure-image.png', { type: structureBlob.type || 'image/png' });
          const inspirationFile = new File([inspirationBlob], 'inspiration-image.png', { type: inspirationBlob.type || 'image/png' });
          
          // Create new image with structure and inspiration
          try {
            const newImageBlob = await createImageWithInspirationAndStructure(
              structureFile,
              inspirationFile,
              userInput
            );
            
            const responseText = `הנה התמונה החדשה שיצרתי בהשראת התמונות שביקשת: "${userInput}"`;
            
            return { responseText, imageBlob: newImageBlob };
          } catch (createError) {
            console.error('Error creating image with dual images:', createError);
            const responseText = `אני מצטער, לא הצלחתי ליצור תמונה חדשה כפי שביקשת. 
האם תוכל לנסות שוב עם תמונות אחרות או לשנות את הבקשה?`;
            return { responseText };
          }
        } catch (error) {
          console.error('Error fetching reference images:', error);
          const responseText = `אני מצטער, לא הצלחתי לגשת לתמונות המקוריות. ${error instanceof Error ? error.message : ''}
האם תוכל להעלות אותן שוב?`;
          return { responseText };
        }
      }
      
      case 'chat':
      default: {
        // Regular chat response
        const responseText = await chatWithGPT4o(updatedMessages);
        return { responseText };
      }
    }
  }
}

// Legacy function to support old code
export async function generateImageWithContext(
  chatMessages: ChatMessage[],
  imagePrompt: string,
  imageParams: any = {}
): Promise<{ chatResponse: string; imageBlob: Blob }> {
  // Send the conversation to GPT-4o for a text response
  const chatResponse = await chatWithGPT4o(chatMessages);
  
  // Generate the image using the existing OpenAI service
  const imageBlob = await openaiGenerateImage(imagePrompt, imageParams);
  
  return {
    chatResponse,
    imageBlob
  };
} 

import { supabase } from "@/integrations/supabase/client";
import { v4 as uuid } from 'uuid';

export type FileType = 'image' | 'audio';

export async function uploadFile(file: File, fileType: FileType): Promise<string | null> {
  try {
    if (!file) {
      console.error('No file provided for upload');
      return null;
    }
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuid()}.${fileExt}`;
    const filePath = `${fileType}/${fileName}`;
    
    console.log(`Uploading file to ${filePath}`);
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('complaint-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    console.log('File uploaded successfully:', data);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('complaint-attachments')
      .getPublicUrl(filePath);
    
    console.log('Public URL generated:', publicUrl);
    
    return publicUrl;
  } catch (error) {
    console.error('File upload error:', error);
    return null;
  }
}

export async function getFileUrl(path: string): Promise<string> {
  const { data: { publicUrl } } = supabase.storage
    .from('complaint-attachments')
    .getPublicUrl(path);
  
  return publicUrl;
}

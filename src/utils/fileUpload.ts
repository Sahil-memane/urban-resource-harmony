
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
    
    console.log(`Uploading file to ${filePath}`, { fileType, fileSize: file.size, fileName: file.name });
    
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
    
    console.log('File uploaded successfully:', data?.path);
    
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

// Add a function to check if the bucket exists and create it if necessary
export async function ensureStorageBucketExists(): Promise<boolean> {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'complaint-attachments');
    
    if (!bucketExists) {
      console.log('Creating complaint-attachments bucket...');
      const { data, error } = await supabase.storage.createBucket('complaint-attachments', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        console.error('Error creating storage bucket:', error);
        return false;
      }
      
      console.log('Storage bucket created successfully');
    } else {
      console.log('complaint-attachments bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to ensure storage bucket exists:', error);
    return false;
  }
}

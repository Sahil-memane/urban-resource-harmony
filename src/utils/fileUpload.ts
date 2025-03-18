
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export const uploadFile = async (file: File, type: 'image' | 'audio'): Promise<string | null> => {
  try {
    console.log(`Uploading ${type} file: ${file.name}`);
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${type}/${fileName}`;
    
    // Check if bucket exists and create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'complaint-attachments');
    
    if (!bucketExists) {
      console.log('Bucket does not exist, creating it');
      const { error } = await supabase.storage.createBucket('complaint-attachments', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        console.error('Error creating bucket:', error);
        throw error;
      }
    }
    
    // Upload file
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
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('complaint-attachments')
      .getPublicUrl(filePath);
    
    console.log('File uploaded successfully. Public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('File upload failed:', error);
    return null;
  }
};

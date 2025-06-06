import { supabase } from '../utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const uploadImage = async (imageFile) => {
  const fileExt = imageFile.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(fileName, imageFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error('Image upload failed: ' + error.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(fileName);

  return publicUrlData?.publicUrl || '';
};

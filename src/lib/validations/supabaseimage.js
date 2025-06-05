import { supabase } from '@/lib/validations/supabaseClient';

export async function uploadImage(file) {
  const fileBuffer = await file.arrayBuffer();
  const fileName = `${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(fileName, new Uint8Array(fileBuffer), {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Supabase upload error: ${uploadError.message}`);
  }

  const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
  if (!urlData?.publicUrl) throw new Error('Failed to get public URL');

  return urlData.publicUrl; // Return public URL to store in DB
}

export async function deleteImage(imageUrl) {
  // Extract the file path from the URL
  // e.g. https://your-supabase-url/storage/v1/object/public/blog-images/123_filename.jpg
  // extract "123_filename.jpg"
  const url = new URL(imageUrl);
  const pathnameParts = url.pathname.split('/');
  const fileName = pathnameParts[pathnameParts.length - 1];

  const { error } = await supabase.storage.from('blog-images').remove([fileName]);
  if (error) {
    console.error('Error deleting image from Supabase:', error);
    throw new Error(`Supabase delete error: ${error.message}`);
  }
}

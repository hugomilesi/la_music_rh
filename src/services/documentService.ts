import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentUpload } from '@/types/document';

export class DocumentService {
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Connection test failed:', error);
        return false;
      }
      
      console.log('Connection test successful');
      return true;
    } catch (error) {
      console.error('Connection test error:', error);
      return false;
    }
  }

  static async uploadTestDocument(file: File, employeeId: string, documentType: string) {
    try {
      console.log('Starting test upload...', { fileName: file.name, employeeId, documentType });
      
      // Generate file path
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `test/${documentType}/${timestamp}_${sanitizedFileName}`;
      
      console.log('Upload path:', filePath);
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('File uploaded successfully:', uploadData);
      
      // Insert into database
      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          employee_id: employeeId,
          document_name: documentType,
          document_type: documentType,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          status: 'válido',
          uploaded_by: 'Test User'
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('documents').remove([uploadData.path]);
        throw dbError;
      }
      
      console.log('Document record created:', docData);
      return docData;
    } catch (error) {
      console.error('Test upload failed:', error);
      throw error;
    }
  }

  static async testDownload(filePath: string) {
    try {
      console.log('Testing download for:', filePath);
      
      const { data, error } = await supabase.storage
        .from('documents')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Download test error:', error);
        throw error;
      }
      
      console.log('Download URL created:', data.signedUrl);
      return data.signedUrl;
    } catch (error) {
      console.error('Download test failed:', error);
      throw error;
    }
  }

  static async listStorageFiles() {
    try {
      const { data, error } = await supabase.storage
        .from('documents')
        .list('', {
          limit: 10,
          offset: 0
        });
      
      if (error) {
        console.error('List files error:', error);
        throw error;
      }
      
      console.log('Storage files:', data);
      return data;
    } catch (error) {
      console.error('List files failed:', error);
      throw error;
    }
  }
}
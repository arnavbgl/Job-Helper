import supabaseClient, { supabaseUrl } from "@/utils/supabase";

// Fetch Companies
export async function getCompanies(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase.from("companies").select("*");

  if (error) {
    console.error("Error fetching Companies:", error);
    return null;
  }

  return data;
}

// Add Company
export async function addNewCompany(token, _, companyData) {
  const supabase = await supabaseClient(token);

  // Validate file
  if (!companyData.logo) {
    throw new Error("No logo file provided");
  }

  // Check file size (max 5MB)
  if (companyData.logo.size > 5 * 1024 * 1024) {
    throw new Error("File size too large. Maximum 5MB allowed");
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(companyData.logo.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed");
  }

  const random = Math.floor(Math.random() * 90000);
  // Clean filename - remove spaces and special characters
  const cleanName = companyData.name.replace(/[^a-zA-Z0-9]/g, '-');
  const fileName = `logo-${random}-${cleanName}`;

  console.log('Uploading file:', {
    fileName,
    fileSize: companyData.logo.size,
    fileType: companyData.logo.type,
    bucketName: 'company-logo'
  });

  const { data: uploadData, error: storageError } = await supabase.storage
    .from("company-logo")
    .upload(fileName, companyData.logo, {
      cacheControl: '3600',
      upsert: false
    });

  if (storageError) {
    console.error('Storage Error Details:', storageError);
    throw new Error(`Error uploading Company Logo: ${storageError.message}`);
  }

  console.log('Upload successful:', uploadData);

  const logo_url = `${supabaseUrl}/storage/v1/object/public/company-logo/${fileName}`;

  const { data, error } = await supabase
    .from("companies")
    .insert([
      {
        name: companyData.name,
        logo_url: logo_url,
      },
    ])
    .select();

  if (error) {
    console.error('Database Error:', error);
    throw new Error("Error submitting Company to database");
  }

  return data;
}

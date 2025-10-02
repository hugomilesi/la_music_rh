# Database Schema Map - LA Music RH

## Project Information
- **Project Name**: LA Music RH
- **Project ID**: jrphwjkgepmgdgiqebyr
- **Last Updated**: 2025-01-26

## Benefits System Tables

### benefits
Main benefits table containing all benefit information.
- `id` (uuid) - Primary key
- `name` (varchar) - Benefit name
- `description` (text) - Benefit description
- `benefit_type_id` (uuid) - Foreign key to benefit_types
- `cost` (decimal) - Total cost
- `employer_contribution` (decimal) - Employer contribution amount
- `employee_contribution` (decimal) - Employee contribution amount
- `coverage_details` (text) - Coverage details
- `provider` (varchar) - Benefit provider
- `is_active` (boolean) - Active status
- `effective_date` (date) - Effective date
- `expiration_date` (date) - Expiration date
- `eligibility_rules` (text) - Eligibility rules
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Update timestamp

### benefit_types
Types/categories of benefits.
- Contains benefit type definitions with colors and names

### employee_benefits
Employee enrollments in benefits.
- Links employees to benefits with enrollment details
- Includes dependent information
- Tracks enrollment status and dates

### benefit_performance_goals
Performance goals associated with benefits.
- `id` (uuid) - Primary key
- `benefit_id` (uuid) - Foreign key to benefits
- `title` (varchar) - Goal title
- `description` (text) - Goal description
- `target_value` (decimal) - Target value
- `current_value` (decimal) - Current progress
- `unit` (varchar) - Unit of measurement
- `status` (varchar) - Goal status
- `weight` (decimal) - Goal weight/importance
- `deadline` (date) - Goal deadline
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Update timestamp

### benefit_documents
Document management for benefits.
- `id` (uuid) - Primary key
- `benefit_id` (uuid) - Foreign key to benefits
- `employee_benefit_id` (uuid) - Foreign key to employee_benefits (nullable)
- `name` (varchar) - Document name
- `file_path` (text) - File storage path
- `file_type` (varchar) - File type/extension
- `file_size` (integer) - File size in bytes
- `status` (varchar) - Document status
- `uploaded_by` (uuid) - User who uploaded
- `created_at` (timestamp) - Upload timestamp
- `updated_at` (timestamp) - Update timestamp

### benefit_renewal_settings
Renewal configuration for benefits.
- Stores renewal periods and settings for automatic renewals

## Document System Tables

### documents
General document storage table.

### required_documents
Required documents configuration.

### user_required_documents
User-specific required documents tracking.

## Features Implemented

### ✅ Completed Features
1. **Benefits Management**
   - CRUD operations for benefits
   - Benefit types and categories
   - Employee enrollment system
   - Dependent management

2. **Performance Goals System**
   - Goal creation and management
   - Progress tracking
   - Status management
   - Weight-based importance

3. **Document Management System**
   - File upload to Supabase Storage
   - Document metadata storage
   - Document type categorization
   - File size and type validation
   - Document download and deletion

4. **Renewal Management**
   - Automatic renewal detection
   - Renewal approval workflow
   - Extension capabilities

### 🔄 Integration Status
- Frontend components fully integrated
- Backend services implemented
- Database schema complete
- File storage configured

## Storage Configuration
- **Storage Bucket**: benefit-documents
- **File Types Supported**: PDF, DOC, DOCX, JPG, PNG
- **Max File Size**: 10MB
- **Access**: Authenticated users only

## Security
- Row Level Security (RLS) policies implemented
- File access through signed URLs
- User-based access control
- Audit trail through timestamps and user tracking
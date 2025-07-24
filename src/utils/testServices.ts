import { documentService } from '@/services/documentService';
import { benefitDocumentService } from '@/services/benefitDocumentService';
import { benefitsService } from '@/services/benefitsService';
import { evaluationService } from '@/services/evaluationService';
import { incidentService } from '@/services/incidentService';
import { employeeService } from '@/services/employeeService';

/**
 * Utility functions to test all services and identify any remaining issues
 */
export const testServices = {
  async testDocumentService() {
    console.log('🧪 Testing Document Service...');
    try {
      // Test connection
      const connectionOk = await documentService.testConnection();
      console.log('✅ Document service connection:', connectionOk);
      
      // Test getting all documents
      const allDocs = await documentService.getAllDocuments();
      console.log('✅ Retrieved documents:', allDocs.length);
      
      return { success: true, documentsCount: allDocs.length };
    } catch (error) {
      console.error('❌ Document service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  async testBenefitDocumentService() {
    console.log('🧪 Testing Benefit Document Service...');
    try {
      // Test getting documents for a non-existent benefit (should return empty array)
      const docs = await benefitDocumentService.getDocumentsByBenefitId('00000000-0000-0000-0000-000000000000');
      console.log('✅ Benefit document service working, returned:', docs.length, 'documents');
      
      return { success: true, documentsCount: docs.length };
    } catch (error) {
      console.error('❌ Benefit document service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  async testBenefitsService() {
    console.log('🧪 Testing Benefits Service...');
    try {
      // Test getting all benefits
      const benefits = await benefitsService.getBenefits();
      console.log('✅ Retrieved benefits:', benefits.length);
      
      // Test getting employee benefits
      const employeeBenefits = await benefitsService.getEmployeeBenefits();
      console.log('✅ Retrieved employee benefits:', employeeBenefits.length);
      
      // Test getting stats
      const stats = await benefitsService.getStats();
      console.log('✅ Retrieved benefit stats:', stats);
      
      return { 
        success: true, 
        benefitsCount: benefits.length, 
        employeeBenefitsCount: employeeBenefits.length,
        stats 
      };
    } catch (error) {
      console.error('❌ Benefits service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  async testEvaluationService() {
    console.log('🧪 Testing Evaluation Service...');
    try {
      // Test getting all evaluations
      const evaluations = await evaluationService.getEvaluations();
      console.log('✅ Retrieved evaluations:', evaluations.length);
      
      return { success: true, evaluationsCount: evaluations.length };
    } catch (error) {
      console.error('❌ Evaluation service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  async testIncidentService() {
    console.log('🧪 Testing Incident Service...');
    try {
      // Test getting all incidents
      const incidents = await incidentService.getIncidents();
      console.log('✅ Retrieved incidents:', incidents.length);
      
      return { success: true, incidentsCount: incidents.length };
    } catch (error) {
      console.error('❌ Incident service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  async testEmployeeService() {
    console.log('🧪 Testing Employee Service...');
    try {
      // Test getting all employees (now filtered by auth.users)
      const employees = await employeeService.getEmployees();
      console.log('✅ Retrieved employees with accounts:', employees.length);
      
      return { success: true, employeesCount: employees.length };
    } catch (error) {
      console.error('❌ Employee service test failed:', error);
      return { success: false, error: error.message };
    }
  },

  async runAllTests() {
    console.log('🚀 Running all service tests...');
    
    const results = {
      documentService: await this.testDocumentService(),
      benefitDocumentService: await this.testBenefitDocumentService(),
      benefitsService: await this.testBenefitsService(),
      evaluationService: await this.testEvaluationService(),
      incidentService: await this.testIncidentService(),
      employeeService: await this.testEmployeeService()
    };
    
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📊 Test Results: ${successCount}/${totalTests} services working correctly`);
    
    // Log any failures
    Object.entries(results).forEach(([service, result]) => {
      if (!result.success) {
        console.error(`❌ ${service} failed:`, result.error);
      }
    });
    
    return {
      summary: `${successCount}/${totalTests} services working`,
      results,
      allPassed: successCount === totalTests
    };
  }
};

// Export for use in console or components
if (typeof window !== 'undefined') {
  (window as any).testServices = testServices;
  console.log('🔧 Test services available in console as window.testServices');
}
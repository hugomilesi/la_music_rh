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

    try {
      // Test connection
      const connectionOk = await documentService.testConnection();

      
      // Test getting all documents
      const allDocs = await documentService.getAllDocuments();

      
      return { success: true, documentsCount: allDocs.length };
    } catch (error) {

      return { success: false, error: error.message };
    }
  },

  async testBenefitDocumentService() {

    try {
      // Test getting documents for a non-existent benefit (should return empty array)
      const docs = await benefitDocumentService.getDocumentsByBenefitId('00000000-0000-0000-0000-000000000000');

      
      return { success: true, documentsCount: docs.length };
    } catch (error) {

      return { success: false, error: error.message };
    }
  },

  async testBenefitsService() {

    try {
      // Test getting all benefits
      const benefits = await benefitsService.getBenefits();

      
      // Test getting employee benefits
      const employeeBenefits = await benefitsService.getEmployeeBenefits();

      
      // Test getting stats
      const stats = await benefitsService.getStats();

      
      return { 
        success: true, 
        benefitsCount: benefits.length, 
        employeeBenefitsCount: employeeBenefits.length,
        stats 
      };
    } catch (error) {

      return { success: false, error: error.message };
    }
  },

  async testEvaluationService() {

    try {
      // Test getting all evaluations
      const evaluations = await evaluationService.getEvaluations();

      
      return { success: true, evaluationsCount: evaluations.length };
    } catch (error) {

      return { success: false, error: error.message };
    }
  },

  async testIncidentService() {

    try {
      // Test getting all incidents
      const incidents = await incidentService.getIncidents();

      
      return { success: true, incidentsCount: incidents.length };
    } catch (error) {

      return { success: false, error: error.message };
    }
  },

  async testEmployeeService() {

    try {
      // Test getting all employees (now filtered by auth.users)
      const employees = await employeeService.getEmployees();

      
      return { success: true, employeesCount: employees.length };
    } catch (error) {

      return { success: false, error: error.message };
    }
  },

  async runAllTests() {

    
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
    

    
    // Log any failures
    Object.entries(results).forEach(([service, result]) => {
      if (!result.success) {

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

}

import { employeeService } from '@/services/employeeService';
import { evaluationService } from '@/services/evaluationService';
import { vacationService } from '@/services/vacationService';
import { scheduleService } from '@/services/scheduleService';

export const integrationTests = {
  async testEmployeeService() {
    // Employee Service Integration Test logging disabled
    try {
      const employees = await employeeService.getEmployees();
      // console.log(`✅ Employee Service: Loaded ${employees.length} employees`);
      
      // Test data structure
      if (employees.length > 0) {
        const firstEmployee = employees[0];
        const requiredFields = ['id', 'name', 'email', 'position', 'department', 'status', 'units'];
        const missingFields = requiredFields.filter(field => !(field in firstEmployee));
        
        if (missingFields.length === 0) {
          // Employee data structure validation logging disabled
        } else {
          // Log desabilitado: Employee Service: Missing fields
        }
        
        // Test status type
        if (firstEmployee.status === 'active' || firstEmployee.status === 'inactive') {
          // Employee service methods validation logging disabled
        } else {
          // Log desabilitado: Employee Service: Invalid status type
        }
      }
      
      return true;
    } catch (error) {
      // Employee Service Test failed logging disabled
      return false;
    }
  },

  async testEvaluationService() {
    // Evaluation Service Integration Test logging disabled
    try {
      const evaluations = await evaluationService.getEvaluations();
      // console.log(`✅ Evaluation Service: Loaded ${evaluations.length} evaluations`);
      
      // Test data structure
      if (evaluations.length > 0) {
        const firstEvaluation = evaluations[0];
        const requiredFields = ['id', 'employeeId', 'employee', 'type', 'status'];
        const missingFields = requiredFields.filter(field => !(field in firstEvaluation));
        
        if (missingFields.length === 0) {
          // Evaluation data structure validation logging disabled
        } else {
          // Log desabilitado: Evaluation Service: Missing fields
        }
      }
      
      return true;
    } catch (error) {
      // Evaluation Service Test failed logging disabled
      return false;
    }
  },

  async testVacationService() {
    // Vacation Service Integration Test logging disabled
    try {
      const vacationRequests = await vacationService.getVacationRequests();
      // console.log(`✅ Vacation Service: Loaded ${vacationRequests.length} vacation requests`);
      
      const vacationBalances = await vacationService.getVacationBalances();
      // console.log(`✅ Vacation Service: Loaded ${vacationBalances.length} vacation balances`);
      
      return true;
    } catch (error) {
      // Vacation Service Test failed logging disabled
      return false;
    }
  },

  async testScheduleService() {
    // Schedule Service Integration Test logging disabled
    try {
      const scheduleEvents = await scheduleService.getScheduleEvents();
      // console.log(`✅ Schedule Service: Loaded ${scheduleEvents.length} schedule events`);
      
      // Test data structure
      if (scheduleEvents.length > 0) {
        const firstEvent = scheduleEvents[0];
        const requiredFields = ['id', 'title', 'employeeId', 'employee', 'unit', 'date', 'startTime', 'endTime', 'type'];
        const missingFields = requiredFields.filter(field => !(field in firstEvent));
        
        if (missingFields.length === 0) {
          // Schedule data structure validation logging disabled
        } else {
          // Log desabilitado: Schedule Service: Missing fields
        }

        // Test event type validation
        const validTypes = ['plantao', 'avaliacao', 'reuniao', 'folga', 'outro'];
        if (validTypes.includes(firstEvent.type)) {
          // Schedule event type validation logging disabled
        } else {
          // Log desabilitado: Schedule Service: Invalid event type
        }

        // Test unit validation
        const validUnits = ['uti_neonatal', 'uti_pediatrica', 'emergencia_pediatrica', 'internacao', 'ambulatorio'];
        if (validUnits.includes(firstEvent.unit)) {
          // Schedule unit validation logging disabled
        } else {
          // Log desabilitado: Schedule Service: Invalid unit
        }

        // Test time format validation
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (timeRegex.test(firstEvent.startTime) && timeRegex.test(firstEvent.endTime)) {
          // Schedule time format validation logging disabled
        } else {
          // Log desabilitado: Schedule Service: Invalid time format
        }
      }
      
      return true;
    } catch (error) {
      // Schedule Service Test failed logging disabled
      return false;
    }
  },

  async runAllTests() {
    // console.log('🚀 Starting Integration Tests...');
    const results = await Promise.all([
      this.testEmployeeService(),
      this.testEvaluationService(),
      this.testVacationService(),
      this.testScheduleService()
    ]);
    
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    // console.log(`📊 Integration Tests Complete: ${passedTests}/${totalTests} passed`);
  
  // if (passedTests === totalTests) {
  //   console.log('✅ All integration tests passed!');
  // } else {
  //   console.log('❌ Some integration tests failed. Check logs above.');
  // }
    
    return passedTests === totalTests;
  }
};

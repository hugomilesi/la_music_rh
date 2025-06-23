
import { employeeService } from '@/services/employeeService';
import { evaluationService } from '@/services/evaluationService';
import { vacationService } from '@/services/vacationService';
import { scheduleService } from '@/services/scheduleService';

export const integrationTests = {
  async testEmployeeService() {
    console.log('🧪 Testing Employee Service...');
    try {
      const employees = await employeeService.getEmployees();
      console.log(`✅ Employee Service: Loaded ${employees.length} employees`);
      
      // Test data structure
      if (employees.length > 0) {
        const firstEmployee = employees[0];
        const requiredFields = ['id', 'name', 'email', 'position', 'department', 'status', 'units'];
        const missingFields = requiredFields.filter(field => !(field in firstEmployee));
        
        if (missingFields.length === 0) {
          console.log('✅ Employee Service: Data structure is valid');
        } else {
          console.error('❌ Employee Service: Missing fields:', missingFields);
        }
        
        // Test status type
        if (firstEmployee.status === 'active' || firstEmployee.status === 'inactive') {
          console.log('✅ Employee Service: Status type is valid');
        } else {
          console.error('❌ Employee Service: Invalid status type:', firstEmployee.status);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Employee Service test failed:', error);
      return false;
    }
  },

  async testEvaluationService() {
    console.log('🧪 Testing Evaluation Service...');
    try {
      const evaluations = await evaluationService.getEvaluations();
      console.log(`✅ Evaluation Service: Loaded ${evaluations.length} evaluations`);
      
      // Test data structure
      if (evaluations.length > 0) {
        const firstEvaluation = evaluations[0];
        const requiredFields = ['id', 'employeeId', 'employee', 'type', 'status'];
        const missingFields = requiredFields.filter(field => !(field in firstEvaluation));
        
        if (missingFields.length === 0) {
          console.log('✅ Evaluation Service: Data structure is valid');
        } else {
          console.error('❌ Evaluation Service: Missing fields:', missingFields);
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Evaluation Service test failed:', error);
      return false;
    }
  },

  async testVacationService() {
    console.log('🧪 Testing Vacation Service...');
    try {
      const vacationRequests = await vacationService.getVacationRequests();
      console.log(`✅ Vacation Service: Loaded ${vacationRequests.length} vacation requests`);
      
      const vacationBalances = await vacationService.getVacationBalances();
      console.log(`✅ Vacation Service: Loaded ${vacationBalances.length} vacation balances`);
      
      return true;
    } catch (error) {
      console.error('❌ Vacation Service test failed:', error);
      return false;
    }
  },

  async testScheduleService() {
    console.log('🧪 Testing Schedule Service...');
    try {
      const scheduleEvents = await scheduleService.getScheduleEvents();
      console.log(`✅ Schedule Service: Loaded ${scheduleEvents.length} schedule events`);
      
      // Test data structure
      if (scheduleEvents.length > 0) {
        const firstEvent = scheduleEvents[0];
        const requiredFields = ['id', 'title', 'employeeId', 'employee', 'unit', 'date', 'startTime', 'endTime', 'type'];
        const missingFields = requiredFields.filter(field => !(field in firstEvent));
        
        if (missingFields.length === 0) {
          console.log('✅ Schedule Service: Data structure is valid');
        } else {
          console.error('❌ Schedule Service: Missing fields:', missingFields);
        }

        // Test event type validation
        const validTypes = ['plantao', 'avaliacao', 'reuniao', 'folga', 'outro'];
        if (validTypes.includes(firstEvent.type)) {
          console.log('✅ Schedule Service: Event type is valid');
        } else {
          console.error('❌ Schedule Service: Invalid event type:', firstEvent.type);
        }

        // Test unit validation
        const validUnits = ['uti_neonatal', 'uti_pediatrica', 'emergencia_pediatrica', 'internacao', 'ambulatorio'];
        if (validUnits.includes(firstEvent.unit)) {
          console.log('✅ Schedule Service: Unit type is valid');
        } else {
          console.error('❌ Schedule Service: Invalid unit:', firstEvent.unit);
        }

        // Test time format validation
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (timeRegex.test(firstEvent.startTime) && timeRegex.test(firstEvent.endTime)) {
          console.log('✅ Schedule Service: Time format is valid');
        } else {
          console.error('❌ Schedule Service: Invalid time format');
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Schedule Service test failed:', error);
      return false;
    }
  },

  async runAllTests() {
    console.log('🚀 Starting Integration Tests...');
    const results = await Promise.all([
      this.testEmployeeService(),
      this.testEvaluationService(),
      this.testVacationService(),
      this.testScheduleService()
    ]);
    
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    console.log(`📊 Integration Tests Complete: ${passedTests}/${totalTests} passed`);
    
    if (passedTests === totalTests) {
      console.log('✅ All integration tests passed!');
    } else {
      console.log('❌ Some integration tests failed. Check logs above.');
    }
    
    return passedTests === totalTests;
  }
};

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Run tests after a short delay to allow context initialization
  setTimeout(() => {
    integrationTests.runAllTests();
  }, 3000);
}

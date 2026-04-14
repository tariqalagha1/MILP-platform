/**
 * MILP Platform API Functionality Test Suite
 * Run with: npx tsx scripts/api-test.ts
 * 
 * Tests all endpoints with API key authentication
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_KEY = process.env.MILP_API_KEY || 'test-api-key-demo';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retries: 2,
};

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name: string, passed: boolean, details?: string) {
  const icon = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  log(`  ${icon} ${name}`, color);
  if (details) {
    log(`    ${colors.dim}${details}${colors.reset}`);
  }
}

interface TestResult {
  endpoint: string;
  method: string;
  passed: boolean;
  status?: number;
  message?: string;
  duration?: number;
}

const results: TestResult[] = [];

// HTTP helper with API key
async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  expectStatus: number | number[] = 200
): Promise<{ passed: boolean; data?: any; status: number; message: string }> {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TEST_CONFIG.timeout),
    });

    const duration = Date.now() - startTime;
    const expectedStatuses = Array.isArray(expectStatus) ? expectStatus : [expectStatus];
    const passed = expectedStatuses.includes(response.status);
    
    let data: any = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return {
      passed,
      status: response.status,
      data,
      message: passed 
        ? `Status ${response.status} (${duration}ms)`
        : `Expected ${expectedStatuses.join('/')}, got ${response.status}`,
    };
  } catch (error) {
    return {
      passed: false,
      status: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Test suites
async function testHealthEndpoints() {
  log('\n📡 Health & Readiness Endpoints', colors.cyan);
  
  // Health check
  let result = await apiRequest('/api/health');
  logTest('GET /api/health', result.passed, result.message);
  results.push({ endpoint: '/api/health', method: 'GET', passed: result.passed, status: result.status });

  // Readiness check
  result = await apiRequest('/api/readiness');
  logTest('GET /api/readiness', result.passed, result.message);
  results.push({ endpoint: '/api/readiness', method: 'GET', passed: result.passed, status: result.status });
}

async function testAuthEndpoints() {
  log('\n🔐 Authentication Endpoints', colors.cyan);

  // Login
  let result = await apiRequest('/api/v1/auth/login', 'POST', {
    email: 'demo@clinic.sa',
    password: 'demo123',
  });
  logTest('POST /api/v1/auth/login', result.passed, result.message);
  results.push({ endpoint: '/api/v1/auth/login', method: 'POST', passed: result.passed });

  // Register
  result = await apiRequest('/api/v1/auth/register', 'POST', {
    name: 'Test User',
    email: 'test@clinic.sa',
    password: 'test123',
    organizationName: 'Test Clinic',
  }, [200, 201, 400]); // Accept 200, 201, or 400 (validation)
  logTest('POST /api/v1/auth/register', result.passed, result.message);
  results.push({ endpoint: '/api/v1/auth/register', method: 'POST', passed: result.passed });

  // Get current user
  result = await apiRequest('/api/v1/auth/me', 'GET', undefined, [200, 401]); // Accept 200 or 401 (unauthenticated)
  logTest('GET /api/v1/auth/me', result.passed, result.message);
  results.push({ endpoint: '/api/v1/auth/me', method: 'GET', passed: result.passed });

  // Refresh token
  result = await apiRequest('/api/v1/auth/refresh', 'POST', undefined, [200, 400, 401]);
  logTest('POST /api/v1/auth/refresh', result.passed, result.message);
  results.push({ endpoint: '/api/v1/auth/refresh', method: 'POST', passed: result.passed });

  // Logout
  result = await apiRequest('/api/v1/auth/logout', 'POST');
  logTest('POST /api/v1/auth/logout', result.passed, result.message);
  results.push({ endpoint: '/api/v1/auth/logout', method: 'POST', passed: result.passed });
}

async function testSettingsEndpoints() {
  log('\n⚙️  Settings Endpoints', colors.cyan);

  // Get settings
  let result = await apiRequest('/api/settings');
  logTest('GET /api/settings', result.passed, result.message);
  results.push({ endpoint: '/api/settings', method: 'GET', passed: result.passed });

  if (result.passed && result.data?.settings) {
    log(`    Organization: ${result.data.settings.orgName}`, colors.dim);
    log(`    Currency: ${result.data.settings.currency}`, colors.dim);
  }

  // Update settings (AI configuration)
  result = await apiRequest('/api/settings', 'PATCH', {
    orgName: 'Test Clinic - API Verified',
    aiEnabled: true,
    aiBehaviorLevel: 'observer',
    aiLanguage: 'ar',
    aiTone: 'professional',
    aiPatientCount: '750',
    aiClaimsPerMonth: '300',
    aiInsurers: ['Tawuniya', 'Bupa Arabia'],
  });
  logTest('PATCH /api/settings (AI config)', result.passed, result.message);
  results.push({ endpoint: '/api/settings', method: 'PATCH', passed: result.passed });
}

async function testClaimsEndpoints() {
  log('\n📋 Claims Intelligence Endpoints', colors.cyan);

  // Get claims stats
  let result = await apiRequest('/api/claims/stats');
  logTest('GET /api/claims/stats', result.passed, result.message);
  results.push({ endpoint: '/api/claims/stats', method: 'GET', passed: result.passed });

  if (result.passed && result.data) {
    log(`    Total Claims: ${result.data.totalClaims || 'N/A'}`, colors.dim);
    log(`    Rejection Rate: ${result.data.rejectionRate || 'N/A'}%`, colors.dim);
  }

  // Get claims list
  result = await apiRequest('/api/claims?limit=10');
  logTest('GET /api/claims', result.passed, result.message);
  results.push({ endpoint: '/api/claims', method: 'GET', passed: result.passed });

  // Create claim
  result = await apiRequest('/api/claims', 'POST', {
    claimNumber: `CLM-TEST-${Date.now()}`,
    amount: 1500,
    status: 'SUBMITTED',
    branchId: 'test-branch',
    patientId: 'test-patient',
  }, [200, 201]); // Accept 200 or 201 Created
  logTest('POST /api/claims', result.passed, result.message);
  results.push({ endpoint: '/api/claims', method: 'POST', passed: result.passed });
}

async function testPatientsEndpoints() {
  log('\n👥 Patient Follow-up Endpoints', colors.cyan);

  // Get patient stats
  let result = await apiRequest('/api/patients/stats');
  logTest('GET /api/patients/stats', result.passed, result.message);
  results.push({ endpoint: '/api/patients/stats', method: 'GET', passed: result.passed });

  if (result.passed && result.data) {
    log(`    Total Patients: ${result.data.totalPatients || 'N/A'}`, colors.dim);
    log(`    Overdue: ${result.data.overdueCount || 'N/A'}`, colors.dim);
  }

  // Get patients list
  result = await apiRequest('/api/patients?limit=10');
  logTest('GET /api/patients', result.passed, result.message);
  results.push({ endpoint: '/api/patients', method: 'GET', passed: result.passed });

  // Create patient
  result = await apiRequest('/api/patients', 'POST', {
    externalId: `PAT-TEST-${Date.now()}`,
    noShowCount: 0,
    branchId: 'test-branch',
  }, [200, 201]); // Accept 200 or 201 Created
  logTest('POST /api/patients', result.passed, result.message);
  results.push({ endpoint: '/api/patients', method: 'POST', passed: result.passed });
}

async function testAppointmentsEndpoints() {
  log('\n📅 Appointments Endpoints', colors.cyan);

  // Get appointments
  let result = await apiRequest('/api/appointments?limit=10');
  logTest('GET /api/appointments', result.passed, result.message);
  results.push({ endpoint: '/api/appointments', method: 'GET', passed: result.passed });

  // Create appointment
  result = await apiRequest('/api/appointments', 'POST', {
    patientId: 'test-patient',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'SCHEDULED',
    value: 500,
    branchId: 'test-branch',
  }, [200, 201]); // Accept 200 or 201 Created
  logTest('POST /api/appointments', result.passed, result.message);
  results.push({ endpoint: '/api/appointments', method: 'POST', passed: result.passed });
}

async function testDashboardEndpoints() {
  log('\n📊 Dashboard Endpoints', colors.cyan);

  // Get dashboard data
  const result = await apiRequest('/api/dashboard');
  logTest('GET /api/dashboard', result.passed, result.message);
  results.push({ endpoint: '/api/dashboard', method: 'GET', passed: result.passed });

  if (result.passed && result.data) {
    log(`    Revenue Recovered: ${result.data.revenueRecovered || 'N/A'}`, colors.dim);
    log(`    Active Claims: ${result.data.activeClaims || 'N/A'}`, colors.dim);
  }
}

async function testReportsEndpoints() {
  log('\n📈 Reports Endpoints', colors.cyan);

  // Get reports
  const result = await apiRequest('/api/reports?period=30');
  logTest('GET /api/reports', result.passed, result.message);
  results.push({ endpoint: '/api/reports', method: 'GET', passed: result.passed });
}

async function testBackupEndpoints() {
  log('\n💾 Backup & Restore Endpoints', colors.cyan);

  // Get backups list
  let result = await apiRequest('/api/v1/backup');
  logTest('GET /api/v1/backup', result.passed, result.message);
  results.push({ endpoint: '/api/v1/backup', method: 'GET', passed: result.passed });

  // Create backup
  result = await apiRequest('/api/v1/backup', 'POST', {
    description: 'API Test Backup',
  });
  logTest('POST /api/v1/backup', result.passed, result.message);
  results.push({ endpoint: '/api/v1/backup', method: 'POST', passed: result.passed });
}

async function testSeedEndpoint() {
  log('\n🌱 Seed Data Endpoint', colors.cyan);

  const result = await apiRequest('/api/seed', 'POST');
  logTest('POST /api/seed', result.passed, result.message);
  results.push({ endpoint: '/api/seed', method: 'POST', passed: result.passed });
}

async function testConfigValidation() {
  log('\n🔍 Configuration Validation', colors.cyan);

  const result = await apiRequest('/api/config/validate', 'GET', undefined, [200, 503]); // Accept 200 or 503 (services not configured)
  logTest('GET /api/config/validate', result.passed, result.message);
  results.push({ endpoint: '/api/config/validate', method: 'GET', passed: result.passed });

  if (result.passed && result.data) {
    log(`    Clerk: ${result.data.clerk ? '✓' : '✗'}`, colors.dim);
    log(`    Database: ${result.data.database ? '✓' : '✗'}`, colors.dim);
    log(`    Redis: ${result.data.redis ? '✓' : '✗'}`, colors.dim);
  }
}

// Page accessibility tests
async function testPageRoutes() {
  log('\n🌐 Page Routes (HTTP 200)', colors.cyan);

  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/sign-in', name: 'Sign In' },
    { path: '/sign-up', name: 'Sign Up' },
    { path: '/dashboard/overview', name: 'Dashboard Overview' },
    { path: '/dashboard/claims', name: 'Claims' },
    { path: '/dashboard/follow-up', name: 'Follow-up' },
    { path: '/dashboard/reports', name: 'Reports' },
    { path: '/dashboard/settings', name: 'Settings' },
    { path: '/dashboard/getting-started', name: 'Getting Started' },
    { path: '/dashboard/backup', name: 'Backup' },
    { path: '/dashboard/roi-calculator', name: 'ROI Calculator' },
  ];

  for (const page of pages) {
    const result = await apiRequest(page.path);
    logTest(`GET ${page.path} (${page.name})`, result.passed, result.message);
    results.push({ endpoint: page.path, method: 'GET', passed: result.passed, status: result.status });
  }
}

// AI Configuration Feature Test
async function testAIConfigurationFeature() {
  log('\n🤖 AI Configuration Feature Test', colors.cyan);

  // Test 1: Enable AI
  let result = await apiRequest('/api/settings', 'PATCH', {
    aiEnabled: true,
  });
  logTest('Enable AI Assistant', result.passed, result.message);
  results.push({ endpoint: '/api/settings (AI:enable)', method: 'PATCH', passed: result.passed });

  // Test 2: Set behavior level
  result = await apiRequest('/api/settings', 'PATCH', {
    aiBehaviorLevel: 'supervisor',
  });
  logTest('Set AI behavior to Supervisor', result.passed, result.message);
  results.push({ endpoint: '/api/settings (AI:behavior)', method: 'PATCH', passed: result.passed });

  // Test 3: Configure permissions
  result = await apiRequest('/api/settings', 'PATCH', {
    aiCanGenerateReports: true,
    aiCanSendAlerts: true,
    aiCanModifyData: false,
    aiCanMessagePatients: false,
  });
  logTest('Configure AI permissions', result.passed, result.message);
  results.push({ endpoint: '/api/settings (AI:permissions)', method: 'PATCH', passed: result.passed });

  // Test 4: Add AI task
  result = await apiRequest('/api/settings', 'PATCH', {
    aiTasks: [{
      id: Date.now().toString(),
      name: 'API Test Task',
      frequency: 'daily',
      time: '09:00',
      action: 'Test action from API',
      deliveryChannels: ['telegram'],
      enabled: true,
    }],
  });
  logTest('Add AI task', result.passed, result.message);
  results.push({ endpoint: '/api/settings (AI:task)', method: 'PATCH', passed: result.passed });

  // Test 5: Add AI alert
  result = await apiRequest('/api/settings', 'PATCH', {
    aiAlerts: [{
      id: Date.now().toString(),
      name: 'API Test Alert',
      category: 'claims',
      condition: 'rejection_rate_above',
      threshold: 15,
      thresholdUnit: '%',
      severity: 'high',
      deliveryTo: 'admin@clinic.sa',
      enabled: true,
    }],
  });
  logTest('Add AI alert', result.passed, result.message);
  results.push({ endpoint: '/api/settings (AI:alert)', method: 'PATCH', passed: result.passed });

  // Test 6: Verify persistence
  result = await apiRequest('/api/settings');
  const aiEnabled = result.data?.settings?.aiEnabled;
  const behaviorLevel = result.data?.settings?.aiBehaviorLevel;
  const tasksCount = result.data?.settings?.aiTasks?.length || 0;
  const alertsCount = result.data?.settings?.aiAlerts?.length || 0;
  
  const persistenceOk = aiEnabled && behaviorLevel === 'supervisor';
  logTest('Verify AI settings persistence', persistenceOk, 
    `enabled=${aiEnabled}, behavior=${behaviorLevel}, tasks=${tasksCount}, alerts=${alertsCount}`);
  results.push({ endpoint: '/api/settings (AI:verify)', method: 'GET', passed: persistenceOk });
}

// Print summary
function printSummary() {
  log('\n' + '═'.repeat(60), colors.blue);
  log('TEST SUMMARY', colors.blue);
  log('═'.repeat(60), colors.blue);

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  const percentage = ((passed / total) * 100).toFixed(1);
  
  log(`\n  Total Tests:    ${total}`);
  log(`  ${colors.green}Passed:         ${passed}${colors.reset}`);
  log(`  ${colors.red}Failed:         ${failed}${colors.reset}`);
  log(`  ${percentage >= '80.0' ? colors.green : colors.yellow}Success Rate:   ${percentage}%${colors.reset}`);

  if (failed > 0) {
    log('\n❌ Failed Tests:', colors.red);
    results
      .filter(r => !r.passed)
      .forEach(r => {
        log(`  • ${r.method} ${r.endpoint} - ${r.message || 'Failed'}`, colors.red);
      });
  }

  log('\n' + '═'.repeat(60), colors.blue);
  
  if (percentage === '100.0') {
    log('🎉 ALL TESTS PASSED!', colors.green);
  } else if (percentage >= '80.0') {
    log('✅ MOSTLY PASSING - Minor issues detected', colors.yellow);
  } else {
    log('⚠️  SIGNIFICANT FAILURES - Review required', colors.red);
  }
  log('═'.repeat(60) + '\n', colors.blue);

  return { total, passed, failed, percentage };
}

// Main test runner
async function runAllTests() {
  log('\n' + '═'.repeat(60), colors.cyan);
  log('MILP Healthcare Revenue Intelligence Platform', colors.cyan);
  log('API Functionality Test Suite', colors.cyan);
  log('═'.repeat(60), colors.cyan);
  log(`\nBase URL: ${BASE_URL}`, colors.dim);
  log(`API Key: ${API_KEY.substring(0, 8)}...${colors.reset}`, colors.dim);
  log(`Started: ${new Date().toISOString()}`, colors.dim);

  const startTime = Date.now();

  try {
    await testHealthEndpoints();
    await testAuthEndpoints();
    await testSettingsEndpoints();
    await testClaimsEndpoints();
    await testPatientsEndpoints();
    await testAppointmentsEndpoints();
    await testDashboardEndpoints();
    await testReportsEndpoints();
    await testBackupEndpoints();
    await testSeedEndpoint();
    await testConfigValidation();
    await testPageRoutes();
    await testAIConfigurationFeature();
  } catch (error) {
    log(`\n❌ Test suite error: ${error}`, colors.red);
  }

  const duration = Date.now() - startTime;
  log(`\n⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`, colors.dim);

  const summary = printSummary();
  
  // Exit with appropriate code
  process.exit(summary.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(console.error);

import { NextRequest, NextResponse } from 'next/server';

// In-memory settings store (persists across requests during a session)
// In production with a real DB, this would be a database record per organization
let settingsStore: Record<string, any> = {
  orgName: 'Al Noor Medical Center',
  orgEmail: 'admin@alnoor-clinic.sa',
  orgPhone: '+966 12 345 6789',
  country: 'SA',
  currency: 'SAR',
  timezone: 'Asia/Riyadh',
  smsEnabled: true,
  emailEnabled: true,
  reminderHours: '24',
  followUpDays: '7',
  twilioEnabled: false,
  twilioSid: '',
  twilioToken: '',
  sendgridEnabled: false,
  sendgridKey: '',
  // AI Configuration
  aiEnabled: false,
  aiBehaviorLevel: 'on-call',
  aiLanguage: 'ar',
  aiTone: 'professional',
  aiPatientCount: '500',
  aiClaimsPerMonth: '200',
  aiInsurers: ['Tawuniya', 'Bupa Arabia', 'Medgulf'],
  aiTasks: [],
  aiAlerts: [],
  aiPermissions: [],
  aiCanGenerateReports: true,
  aiCanSendAlerts: true,
  aiCanSuggestActions: true,
  aiCanModifyData: false,
  aiCanMessagePatients: false,
  aiCanContactInsurers: false,
  aiCanAccessInsurerPortals: true,
  aiCanAccessRegulatorySites: true,
  aiCanAccessSocialMedia: false,
  aiCanAccessGeneralInternet: false,
};

// GET /api/settings - Retrieve current settings
export async function GET() {
  try {
    // Mask sensitive fields before returning
    const safeSettings = {
      ...settingsStore,
      twilioToken: settingsStore.twilioToken ? '••••••••' : '',
      sendgridKey: settingsStore.sendgridKey ? '••••••••' : '',
    };

    return NextResponse.json({
      success: true,
      settings: safeSettings,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Update settings
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate fields
    const allowedFields = [
      'orgName', 'orgEmail', 'orgPhone', 'country', 'currency', 'timezone',
      'smsEnabled', 'emailEnabled', 'reminderHours', 'followUpDays',
      'twilioEnabled', 'twilioSid', 'twilioToken',
      'sendgridEnabled', 'sendgridKey',
      // AI Configuration fields
      'aiEnabled', 'aiBehaviorLevel', 'aiLanguage', 'aiTone',
      'aiPatientCount', 'aiClaimsPerMonth', 'aiInsurers',
      'aiTasks', 'aiAlerts', 'aiPermissions',
      'aiCanGenerateReports', 'aiCanSendAlerts', 'aiCanSuggestActions',
      'aiCanModifyData', 'aiCanMessagePatients', 'aiCanContactInsurers',
      'aiCanAccessInsurerPortals', 'aiCanAccessRegulatorySites',
      'aiCanAccessSocialMedia', 'aiCanAccessGeneralInternet',
    ];

    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Merge updates
    settingsStore = { ...settingsStore, ...updates };

    // Return safe version (mask secrets)
    const safeSettings = {
      ...settingsStore,
      twilioToken: settingsStore.twilioToken ? '••••••••' : '',
      sendgridKey: settingsStore.sendgridKey ? '••••••••' : '',
    };

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings: safeSettings,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

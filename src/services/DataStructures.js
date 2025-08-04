// FamilyConnect MVP User Data Structure
// Updated: August 2025 - Ready for 3-person family testing

const userData = {
    // === CORE IDENTITY ===
    userId: "firebase-generated-uuid-abc123", // ✅ Let Firebase generate, NOT external provider ID
    email: "dad@gmail.com",
    username: "Eric Braithwaite", // ✅ Single field works better with OAuth (Google/Apple/Facebook)
    profilePicture: "https://lh3.googleusercontent.com/a/profile123", // Optional, from OAuth providers
    dateOfBirth: "1990-01-01", // Required for COPPA compliance
    
    // === PERMISSIONS & COMPLIANCE ===
    role: "adult", // "adult" | "child" - for app permissions & COPPA compliance
    timezone: "America/New_York", // ✅ Critical for calendar apps!
    
    // === GROUP MEMBERSHIPS ===
    groupIds: ["family-braithwaite-123"], // Array allows multiple families/teams/groups
    
    // === CALENDAR ACCESS ===
    calendars: [
      {
        calendarId: "cal-family-456",
        name: "Braithwaite Family",
        calendarAddress: "https://calendar.google.com/calendar/ical/family%40gmail.com/private-abc123/basic.ics",
        calendarType: "google", // "google" | "ical" | "outlook" etc
        permissions: "owner", // "owner" | "admin" | "editor" | "viewer"
        color: "#FF5733",
        description: "Main family calendar with kids activities"
      },
      {
        calendarId: "cal-work-789",
        name: "Eric's Work Calendar", 
        calendarAddress: "https://calendar.google.com/calendar/ical/eric.work%40company.com/private-def456/basic.ics",
        calendarType: "google",
        permissions: "owner",
        color: "#33FF57",
        description: "Work meetings and deadlines"
      }
    ],
    
    // === CALENDAR SUBSCRIPTIONS (READ-ONLY) ===
    subscriptions: [
      {
        subscriptionId: "sub-teamsnap-101",
        name: "Lions Soccer Team",
        subscriptionAddress: "https://go.teamsnap.com/ical/12345/abcdef",
        subscriptionType: "ical",
        color: "#3357FF",
        description: "Billy's soccer team schedule and events"
      },
      {
        subscriptionId: "sub-school-202", 
        name: "Roosevelt Elementary",
        subscriptionAddress: "https://www.rooseveltelementary.edu/calendar/feed.ics",
        subscriptionType: "ical", 
        color: "#FF33A1",
        description: "School calendar with holidays and events"
      }
    ],
    
    // === METADATA ===
    createdAt: "2025-08-01T10:30:00Z",
    updatedAt: "2025-08-01T10:30:00Z",
    isActive: true, // For soft deletes
    
    // === AUTHENTICATION TRACKING ===
    authProviders: ["google"], // Track linked accounts: ["google", "apple", "facebook"]
  }
  
  // === POST-MVP ADDITIONS (Not needed for 3-person testing) ===
  /*
  FUTURE FIELDS TO ADD:
  
  // Contact Info  
  phoneNumber: "+1234567890", // User-entered, not from OAuth
  
  // Notifications (Major feature addition)
  notificationTokens: ["fcm-token-1", "fcm-token-2"],
  preferences: {
    notifications: {
      newAssignments: true,
      assignmentClaimed: true, 
      assignmentCompleted: false,
      dailyDigest: true
    },
    defaultView: "week", // "day" | "week" | "month"
    theme: "light" // "light" | "dark" | "auto"
  },
  
  // Location Features (Maybe never needed?)
  address: {
    city: "Springfield",
    state: "IL", 
    zipCode: "62701",
    country: "USA"
  }, // For location-based features - probably unnecessary
  
  // Audit Trail Enhancement
  updatedBy: "userId-who-made-change", // For tracking parent vs child updates
  */
  
  // === NOTES FOR DEVELOPMENT ===
  /*
  ✅ MVP DECISIONS MADE:
  - Use Firebase-generated userIds (not OAuth provider IDs)
  - Single fullName field (better OAuth compatibility)  
  - Skip notifications for MVP (add complexity later)
  - Adult/child roles for permissions
  - Per-calendar permissions (owner/admin/editor/viewer)
  - Skip DOB for MVP (add for COPPA compliance later)
  
  🎯 MVP FOCUS: 
  Just need basic user creation, group membership, and calendar linking
  for 3-person family testing!
  */



  // FamilyConnect MVP Group Data Structure
// Updated: August 2025 - Ready for 3-person family testing

const groupData = {
    // === CORE IDENTITY ===
    groupId: "firebase-generated-uuid-group123", // ✅ Let Firebase generate
    groupName: "The Braithwaites", // Family name, team name, etc.
    
    // === MEMBERSHIP ===
    members: [
      {
        userId: "user-dad-123",
        role: "admin", // "admin" | "member" | "child"
        joinedAt: "2025-08-01T10:30:00Z",
        status: "active" // "active" | "pending" | "inactive" | "removed"
      },
      {
        userId: "user-mom-456", 
        role: "admin", // Parents can both be admins
        joinedAt: "2025-08-01T10:30:00Z",
        status: "active"
      },
      {
        userId: "user-billy-789",
        role: "child", // Limited permissions
        joinedAt: "2025-08-01T11:00:00Z", 
        status: "active"
      }
    ],
    
    // === SHARED CALENDARS (The Core Feature!) ===
    sharedCalendars: [
      {
        calendarId: "cal-family-456",
        name: "Braithwaite Family",
        calendarAddress: "https://calendar.google.com/calendar/ical/family%40gmail.com/private-abc123/basic.ics",
        calendarType: "google", // "google" | "ical" | "outlook" | "apple"
        color: "#FF5733",
        description: "Main family calendar with kids activities",
        ownerUserId: "user-dad-123", // Who imported/manages this calendar
        permissions: {
          "user-dad-123": "owner",   // Can edit calendar settings, delete
          "user-mom-456": "editor",  // Can create/edit events
          "user-billy-789": "viewer" // Can see events, claim assignments
        }
      },
      {
        calendarId: "sub-teamsnap-101",
        name: "Lions Soccer Team", 
        calendarAddress: "https://go.teamsnap.com/ical/12345/abcdef",
        calendarType: "ical",
        color: "#3357FF",
        description: "Billy's soccer team schedule and events",
        ownerUserId: "user-dad-123",
        permissions: {
          "user-dad-123": "owner",   // Dad manages team calendar
          "user-billy-789": "viewer" // Billy can see his own games
          // Note: Mom not included - doesn't need every practice detail
        }
      },
      {
        calendarId: "sub-school-202",
        name: "Roosevelt Elementary",
        calendarAddress: "https://www.rooseveltelementary.edu/calendar/feed.ics", 
        calendarType: "ical",
        color: "#FF33A1",
        description: "School calendar with holidays and events",
        ownerUserId: "user-mom-456", // Mom imported school calendar
        permissions: {
          "user-dad-123": "viewer",  // Dad can see school events
          "user-mom-456": "owner",   // Mom manages school calendar
          "user-billy-789": "viewer" // Billy can see school events
        }
      }
    ],
    
    // === INVITE SYSTEM ===
    inviteCode: "BRAITHWAITE2025", // 6-12 char code for joining group
    
    // === GROUP SETTINGS ===
    settings: {
      autoArchiveCompletedAssignments: true, // Hide completed assignments after 30 days
      requireApprovalForNewMembers: false    // Anyone with invite code can join
    },
    
    // === METADATA ===
    createdBy: "user-dad-123",
    createdAt: "2025-08-01T10:30:00Z",
    updatedAt: "2025-08-01T10:30:00Z",
    isActive: true // For soft deletes
  }
  
  // === POST-MVP ADDITIONS (Not needed for 3-person testing) ===
  /*
  FUTURE FEATURES TO ADD:
  
  // Group Types & Categories
  type: "family", // "family" | "team" | "friends" | "organization" | "work"
  category: "sports", // For team types: "sports" | "school" | "hobby" | "work"
  
  // Advanced Member Management
  members: [{
    invitedBy: "user-456", // Track who invited them
    inviteExpires: "2025-09-01T00:00:00Z", // Pending invites expire
    lastActive: "2025-08-01T15:30:00Z", // Track engagement
    nickname: "Dad", // Display name within this group
  }],
  
  // Calendar Sync & Automation  
  sharedCalendars: [{
    syncFrequency: "hourly", // How often to refresh external calendars
    lastSynced: "2025-08-01T15:00:00Z",
    syncStatus: "success", // "success" | "error" | "pending"
    autoCreateAssignments: true, // Auto-create assignments for certain event types
    assignmentRules: [
      {
        eventPattern: "pickup|dropoff",
        assignmentType: "transport", 
        visibleToRoles: ["admin", "member"]
      }
    ]
  }],
  
  // Advanced Group Settings
  settings: {
    maxMembers: 10, // Freemium limits
    allowGuestInvites: false, // Temporary access for babysitters, etc.
    requireApprovalForAssignments: false, // Admin must approve before visible
    allowMembersToInviteOthers: true,
    timezoneOverride: null, // Force group timezone vs individual timezones
    defaultAssignmentVisibility: "all_members", // "all_members" | "adults_only" | "custom"
    notificationSettings: {
      newMemberJoined: true,
      memberLeftGroup: true,
      calendarAdded: true,
      groupSettingsChanged: true
    }
  },
  
  // Billing & Subscription (Future)
  subscription: {
    planType: "freemium", // "freemium" | "family" | "team" | "enterprise" 
    maxCalendars: 3,
    maxMembers: 5,
    billingUserId: "user-dad-123", // Who pays
    expiresAt: "2025-12-01T00:00:00Z"
  },
  
  // Audit Trail
  updatedBy: "user-456", // Who made the last change
  changeHistory: [
    {
      userId: "user-dad-123",
      action: "member_added",
      targetUserId: "user-billy-789", 
      timestamp: "2025-08-01T11:00:00Z"
    }
  ]
  */
  
  // === NOTES FOR DEVELOPMENT ===
  /*
  ✅ MVP DECISIONS MADE:
  - Groups own shared calendars with granular permissions
  - Simple member roles: admin | member | child
  - One invite code per group (not per member)
  - Calendar permissions separate from group roles (flexibility!)
  - Skip complex settings for MVP (keep it simple)
  
  🎯 MVP FOCUS:
  Just need basic group creation, member management, and calendar sharing
  for 3-person family testing!
  
  📊 ROLE PERMISSIONS (MVP):
  - ADMIN: Can add/remove members, manage calendars, create assignments
  - MEMBER: Can create assignments, claim assignments, view shared calendars  
  - CHILD: Can claim assignments (if allowed), view shared calendars
  
  🔐 CALENDAR PERMISSIONS (Independent of group role):
  - OWNER: Full control - edit calendar settings, manage permissions, delete
  - EDITOR: Can create/edit/delete events, create assignments from events
  - VIEWER: Can see events, claim assignments, no editing
  */




  // FamilyConnect MVP Calendar Data Structure
// Updated: August 2025 - SIMPLIFIED for 3-person family testing

const calendarDoc = {
    // === CORE IDENTITY ===
    calendarId: "braithwaite-family-cal-123", // ✅ Unique ID we generate
    name: "Braithwaite Family Calendar",
    description: "Our main family calendar",
    
    // === SOURCE INFORMATION ===
    source: {
      type: "google", // "ical" | "google" (keep it simple for MVP)
      address: "https://calendar.google.com/calendar/ical/family%40gmail.com/private-abc123/basic.ics",
      provider: "google" // "google" | "ical" (manual entry comes later)
    },
    
    // === DISPLAY SETTINGS ===
    defaultColor: "#FF5733", // Hex color for calendar display
    
    // === SIMPLE EVENT STORAGE (MVP - No Subcollections Yet!) ===
    // Store events directly in document for simplicity - optimize later
    events: {
      "event-billy-soccer-aug5": {
        title: "Billy's Soccer Game",
        description: "vs. Eagles at City Park",
        location: "City Park Field 2",
        startTime: "2025-08-05T16:00:00Z",
        endTime: "2025-08-05T18:00:00Z",
        isAllDay: false
      },
      "event-family-dinner-aug6": {
        title: "Family Dinner", 
        description: "Grandma's birthday dinner",
        location: "Grandma's House",
        startTime: "2025-08-06T18:00:00Z",
        endTime: "2025-08-06T20:00:00Z", 
        isAllDay: false
      }
    },
    
    // === BASIC SYNC (MVP - Manual Refresh) ===
    sync: {
      lastSyncedAt: "2025-08-01T10:00:00Z", // When we last checked for updates
      syncStatus: "success", // "success" | "error"
      dateRange: {
        startDate: "2024-02-01T00:00:00Z" // Always 6 months ago (or first event if more recent)
        // endDate: REMOVED for MVP - just let calendars sync forever, figure out lifecycle later
      }
    },
    
    // === SIMPLE SUBSCRIBER TRACKING ===
    subscribingGroups: ["braithwaite-family"], // Just one family for MVP
    
    // === BASIC OWNERSHIP ===
    createdBy: "user-dad-123", // Who imported this calendar
    
    // === METADATA ===
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-08-01T10:00:00Z",
    isActive: true
  }
  
  // === MVP NOTES ===
  /*
  🎯 MVP SIMPLIFICATIONS MADE:
  - Events stored directly in calendar document (no subcollections)
  - No checksum optimization (add later when you have scale)
  - No complex sync management (manual refresh button)
  - No timezone complexity (use user's device timezone)
  - No subscriber count tracking (only 1 family)
  - No ownership complexity (just track who imported)
  - No recurring event support (add later)
  - Smart date range: 6 months back + optional end date
  
  📅 DATE RANGE STRATEGY (MVP SIMPLIFIED):
  - startDate: FIXED date - 6 months ago from calendar creation OR first event date (whichever is more recent)
  - startDate NEVER changes - always sync from this original date forward
  - endDate: REMOVED for MVP - let all calendars sync forever
  - Keep ALL events from startDate forward (don't delete old events!)
  - Figure out calendar lifecycle management later (post-MVP)
  
  🎯 MVP LOGIC:
  import startDate = Math.max(sixMonthsAgo, firstEventDate)
  // This date is SET ONCE and never changes
  
  ✅ SYNC BEHAVIOR:
  Month 1: Sync from startDate to future ✅
  Month 6: Sync from SAME startDate to future ✅ (keeps all history)
  Month 12: Sync from SAME startDate to future ✅ (keeps all assignment history)
  
  🚀 FUTURE POSSIBILITIES (Post-MVP):
  - Smart end date detection by calendar type
  - User-controlled calendar lifecycle 
  - Social event creation with custom date ranges
  - Automatic season detection and management
  
  EXAMPLES:
  Family Calendar: { startDate: "2024-02-01" } → always syncs from Feb 2024 forward
  Soccer Calendar: { startDate: "2024-08-01" } → always syncs from Aug 2024 forward  
  Custom Event: { startDate: "event-created-date" } → always syncs from creation forward
  
  ✅ WHAT THIS MVP STRUCTURE GIVES YOU:
  - Import calendar from Google Calendar or iCal URL
  - Store events in simple object format
  - Display events in your app
  - Create assignments from events (next collection!)
  - Basic sync tracking
  
  🚀 NEXT STEPS AFTER MVP WORKS:
  1. Move events to subcollections (when you hit document size limits)
  2. Add checksum optimization (when you have multiple families)
  3. Add scheduled sync (when you want automatic updates)
  4. Add complex ownership tracking (when you have coaches/teams)
  
  Keep it simple, get it working, then optimize! 
  This structure will easily migrate to the complex version later.
  */
  
  // === POST-MVP ADDITIONS (Not needed for 3-person testing) ===
  /*
  FUTURE CALENDAR FEATURES TO ADD:
  
  // Advanced Source Management
  source: {
    type: "google",
    address: "primary", // Google Calendar ID
    provider: "google",
    authRequired: true, // Private calendar requiring OAuth
    refreshToken: "encrypted-token", // For private calendar access
    lastAuthRefresh: "2025-08-01T10:00:00Z"
  },
  
  // Advanced Display & Categorization
  category: "sports", // "sports" | "school" | "work" | "family" | "other"
  tags: ["soccer", "youth-sports", "middleschool"], // For filtering/search
  defaultReminders: [
    { method: "popup", minutes: 15 },
    { method: "email", minutes: 60 }
  ],
  
  // Advanced Change Detection
  eventIndex: {
    "event-id": {
      lastModified: "...",
      checksum: "...",
      title: "...",
      startTime: "...",
      changeHistory: [
        {
          field: "startTime",
          oldValue: "16:00",
          newValue: "17:00", 
          changedAt: "2025-08-01T10:00:00Z"
        }
      ]
    }
  },
  
  // Advanced Sync Features
  sync: {
    lastSyncedAt: "...",
    syncStatus: "success",
    syncFrequency: "hourly",
    totalEvents: 47,
    errorMessage: null,
    etag: "abc123xyz", // For Google Calendar sync optimization
    syncAttempts: 0, // Failed attempts counter
    webhookUrl: "https://ourapp.com/webhook/cal123", // For push notifications
    syncStrategy: "incremental", // "full" | "incremental" | "webhook"
    conflictResolution: "source_wins" // How to handle conflicts
  },
  
  // Advanced Subscriber Management
  subscriberCount: 47,
  subscribingGroups: ["group1", "group2", ...],
  accessControl: {
    isPublic: true, // Can anyone discover this calendar?
    requiresApproval: false, // Must admin approve new subscribers?
    maxSubscribers: 100, // Limit for performance
    allowedDomains: ["@school.edu"], // Email domain restrictions
    adminUsers: ["user-coach-123"] // Who can manage this calendar
  },
  
  // Business Logic & Analytics
  usage: {
    totalViews: 1247,
    lastViewedAt: "2025-08-01T15:30:00Z",
    popularEvents: ["event-championship"], // Most viewed/claimed events
    peakUsageHours: [15, 16, 17], // When most people view this calendar
  },
  
  // Advanced Event Features (in subcollection)
  eventSubcollection: {
    eventId: "event-game-aug5",
    
    // Rich Event Data
    attendees: [
      {
        email: "player1@email.com",
        status: "attending",
        type: "required"
      }
    ],
    attachments: [
      {
        fileUrl: "https://teamsnap.com/roster.pdf",
        fileName: "Team Roster",
        mimeType: "application/pdf"
      }
    ],
    
    // Advanced Recurrence
    isRecurring: true,
    recurrenceRule: "FREQ=WEEKLY;BYDAY=TU,TH", // Full RRULE support
    recurringEventId: "event-practices-fall2025", // Parent recurring event
    originalStartTime: "2025-08-05T16:00:00Z", // For modified instances
    
    // Conference/Meeting Info
    conferenceData: {
      type: "zoom",
      joinUrl: "https://zoom.us/j/123456789",
      phoneNumber: "+1-555-123-4567",
      accessCode: "123456"
    },
    
    // Custom Fields from Source
    customFields: {
      "teamsnap_uniform_color": "blue",
      "weather_dependent": true,
      "equipment_needed": ["cleats", "shin_guards"]
    }
  }
  */
  
  // === NOTES FOR DEVELOPMENT ===
  /*
  ✅ MVP DECISIONS MADE:
  - Store events in subcollections (unlimited size, better queries)
  - Use eventIndex for lightning-fast change detection via checksums
  - Track ALL subscribing groups (no arbitrary limits)
  - Separate createdBy (who imported) vs actualOwner (real owner)
  - Simple sync strategy (hourly polling, basic error handling)
  
  🎯 MVP FOCUS:
  - Basic calendar import (iCal URLs, public Google Calendars)
  - Efficient sync with change detection
  - Multi-group subscription tracking
  - Event storage in subcollections
  
  🔍 CHECKSUM MAGIC:
  The eventIndex with checksums is the secret sauce! Instead of reading 50+ event 
  documents every sync, we read just 1 calendar document, compare checksums, and 
  only update events that actually changed. This saves 95% on Firestore reads!
  
  💡 SYNC FLOW:
  1. Read calendar document (1 read)
  2. Fetch external calendar (TeamSnap iCal)
  3. Compare checksums in eventIndex
  4. Only update changed events (minimal writes)
  5. Update eventIndex with new checksums
  
  🚀 SCALABILITY:
  This structure scales beautifully:
  - 1 TeamSnap calendar → 50 families use it
  - Coach updates 1 event → We update 1 Firebase document
  - All 50 families see changes instantly via real-time listeners
  - Minimal cost, maximum efficiency!
  */





  // FamilyConnect MVP Assignment Data Structure
// Updated: August 2025 - Option 3: Group + Calendar approach

// Collection: group_assignments/{groupId}_{calendarId}
const assignmentDoc = {
    // === CORE IDENTITY ===
    documentId: "braithwaite-family_teamsnap-soccer-2025", // Firebase document ID
    groupId: "braithwaite-family",
    calendarId: "teamsnap-soccer-2025",
    
    // === ASSIGNMENT STORAGE ===
    // Key = eventId, Value = assignment details
    assignments: {
      "event-soccer-game-aug5": {
        // === EVENT LINK ===
        eventId: "event-soccer-game-aug5", // Links to calendar event
        eventTitle: "vs. Eagles", // Copy for quick reference (avoid extra reads)
        eventStartTime: "2025-08-05T16:00:00Z", // Copy for sorting/filtering
        eventEndTime: "2025-08-05T18:00:00Z",
        
        // === ASSIGNMENT DETAILS ===
        type: "pickup", // "pickup" | "dropoff" | "transport" | "attend" | "handle" | "bring"
        description: "Who's picking up Billy after the game?",
        notes: "Game might run late, be flexible with timing",
        
        // === STATUS & CLAIMS ===
        status: "claimed", // "available" | "claimed" | "completed" | "cancelled"
        claimedBy: "user-dad-123", // Who claimed this assignment
        claimedAt: "2025-08-01T15:30:00Z", // When it was claimed
        completedAt: null, // When marked complete
        
        // === VISIBILITY & ACCESS ===
        visibleTo: ["user-dad-123", "user-mom-456"], // Who can see/claim this
        // Note: user-billy-789 not included - parents-only assignment
        
        // === METADATA ===
        createdBy: "user-mom-456", // Who created this assignment
        createdAt: "2025-08-01T10:00:00Z",
        updatedAt: "2025-08-01T15:30:00Z"
      },
      
      "event-soccer-practice-aug7": {
        eventId: "event-soccer-practice-aug7",
        eventTitle: "Weekly Practice",
        eventStartTime: "2025-08-07T16:00:00Z",
        eventEndTime: "2025-08-07T17:30:00Z",
        
        type: "dropoff",
        description: "Drop Billy off at practice",
        notes: null,
        
        status: "available", // Still needs someone to claim it
        claimedBy: null,
        claimedAt: null,
        completedAt: null,
        
        visibleTo: ["user-dad-123", "user-mom-456", "user-billy-789"], // Kid can claim this one
        
        createdBy: "user-dad-123",
        createdAt: "2025-08-02T08:00:00Z",
        updatedAt: "2025-08-02T08:00:00Z"
      },
      
      "event-family-dinner-aug6": {
        eventId: "event-family-dinner-aug6", 
        eventTitle: "Grandma's Birthday Dinner",
        eventStartTime: "2025-08-06T18:00:00Z",
        eventEndTime: "2025-08-06T20:00:00Z",
        
        type: "bring",
        description: "Bring dessert to Grandma's party",
        notes: "She loves chocolate cake!",
        
        status: "completed", // Already handled
        claimedBy: "user-mom-456",
        claimedAt: "2025-08-01T12:00:00Z",
        completedAt: "2025-08-06T17:45:00Z", // Marked done right before event
        
        visibleTo: ["user-dad-123", "user-mom-456", "user-billy-789"], // Whole family
        
        createdBy: "user-mom-456",
        createdAt: "2025-08-01T11:30:00Z", 
        updatedAt: "2025-08-06T17:45:00Z"
      }
    },
    
    // === DOCUMENT METADATA ===
    totalAssignments: 3, // Quick count for UI
    lastActivityAt: "2025-08-06T17:45:00Z", // Most recent assignment activity
    createdAt: "2025-08-01T10:00:00Z",
    updatedAt: "2025-08-06T17:45:00Z",
    isActive: true
  }
  
  // === MVP CREATION FLOW ===
  /*
  🎯 MVP ASSIGNMENT CREATION (Manual):
  1. User views calendar events in app
  2. Taps on event (e.g., "Billy's Soccer Game") 
  3. Taps "Create Assignment" button
  4. Selects type: pickup | dropoff | transport | attend | handle | bring
  5. Adds description: "Who's picking up Billy after the game?"
  6. Optionally adds notes: "Game might run late"
  7. Selects who can see/claim it: [Dad, Mom] or [Dad, Mom, Billy]
  8. Saves → Assignment created in group_assignments/{groupId}_{calendarId}
  
  📱 NO AUTOMATION FOR MVP:
  - No automatic assignment creation
  - No AI suggestions  
  - No recurring assignment templates
  - Just simple manual creation from calendar events
  */
  // === ASSIGNMENT TYPES EXPLAINED ===
  /*
  🎯 ASSIGNMENT TYPES (MVP - Keep Simple):
  - pickup: Get someone from an event/location
  - dropoff: Take someone to an event/location  
  - transport: Handle round-trip transportation
  - attend: Go to the event yourself
  - handle: Take care of something event-related
  - bring: Bring something to the event
  
  📱 UI EXAMPLES:
  "Who's picking up Billy after soccer?" (pickup)
  "Who's dropping off Billy at practice?" (dropoff)  
  "Who's driving Billy to/from the game?" (transport)
  "Who's attending the parent meeting?" (attend)
  "Who's handling team snack signup?" (handle)
  "Who's bringing drinks to the BBQ?" (bring)
  */
  
  // === MVP NOTES ===
  /*
  ✅ MVP DECISIONS MADE:
  - One document per group+calendar combination  
  - Store event details in assignment (avoid extra reads)
  - Simple assignment types (6 basic types)
  - Manual assignment creation from calendar events (no automation)
  - Flexible visibility per assignment (choose who can see/claim)
  - Track full assignment lifecycle (created → claimed → completed)
  - NO cross-group sharing for MVP (figure out later based on usage)
  
  🎯 MVP QUERIES YOU'LL NEED:
  - Get all assignments for a group: `group_assignments/{groupId}_{calendarId}`
  - Get assignments for specific calendar: Filter by calendarId
  - Get user's claimed assignments: Filter by claimedBy field
  - Get available assignments: Filter by status === "available"
  
  🔄 MVP OPERATIONS:
  - Create assignment: Add to assignments object
  - Claim assignment: Update status, claimedBy, claimedAt  
  - Complete assignment: Update completedAt
  - Update assignment: Modify description, notes, etc.
  
  🚀 REAL-TIME UPDATES:
  - Listen to document changes: assignments/{groupId}_{calendarId}
  - When Dad claims pickup, Mom sees it instantly
  - When assignment completed, family gets notified
  
  💾 DOCUMENT SIZE:
  - ~50 assignments per calendar = ~100KB per document
  - Well under 1MB Firebase limit
  - Fast queries and updates
  */
  
  // === POST-MVP ADDITIONS (Not needed for 3-person testing) ===
  /*
  FUTURE ASSIGNMENT FEATURES:
  
  // Advanced Assignment Types
  type: "carpool", // Coordinate with other families
  type: "volunteer", // Sign up for team volunteer slots
  type: "equipment", // Manage team equipment
  type: "coordinate", // Multi-family coordination
  
  // Assignment Comments/Discussion
  assignments: {
    "event-id": {
      // ... existing fields ...
      
      comments: [
        {
          commentId: "comment-123",
          userId: "user-mom-456",
          text: "Game might be cancelled due to rain",
          createdAt: "2025-08-05T10:00:00Z"
        }
      ],
      lastCommentAt: "2025-08-05T10:00:00Z"
    }
  },
  
  // Assignment Reminders
  assignments: {
    "event-id": {
      reminders: [
        {
          type: "notification", // "notification" | "email" | "sms"
          timeBeforeEvent: 60, // minutes
          enabled: true
        }
      ]
    }
  },
  
  // Advanced Visibility & Permissions
  assignments: {
    "event-id": {
      visibilityRules: {
        byRole: ["admin", "parent"], // Only admins and parents
        byAge: { min: 16 }, // Only 16+ year olds
        custom: ["user-dad-123"] // Specific users only
      },
      
      restrictClaiming: {
        requireApproval: true, // Admin must approve claims
        allowedClaimers: ["user-dad-123", "user-mom-456"]
      }
    }
  },
  
  // Assignment Dependencies
  assignments: {
    "event-id": {
      dependencies: ["other-assignment-id"], // Must complete these first
      blocks: ["future-assignment-id"] // This blocks other assignments
    }
  },
  
  // Assignment Sharing Across Groups
  assignments: {
    "event-id": {
      sharedWith: [
        {
          groupId: "smith-family",
          permission: "view", // "view" | "claim" | "edit"
          message: "Want to carpool to the game?"
        }
      ]
    }
  }
  */
// src/services/CalendarService.js
// FOCUSED: Calendar import, sync, and management

import firestore from '@react-native-firebase/firestore';
import { DateTime } from 'luxon';
import { requestAdditionalScopes, getGoogleAccessToken } from './AuthService';
import { UserService } from './UserService';

export class CalendarService {
  
  static async importGoogleCalendar(userId) {
    try {
      console.log('Starting Google Calendar import for user:', userId);
      
      // Step 1: Request calendar permissions
      await requestAdditionalScopes(['https://www.googleapis.com/auth/calendar.readonly']);
      
      // Step 2: Get access token
      const accessToken = await getGoogleAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get Google access token');
      }
      
      // Step 3: Fetch user's primary calendar events
      const events = await this.fetchGoogleCalendarEvents(accessToken);
      console.log(`Fetched ${events.length} events from Google Calendar`);
      
      if (events.length === 0) {
        return {
          success: true,
          eventCount: 0,
          message: 'No events found in your Google Calendar'
        };
      }
      
      // Step 4: Create calendar document in Firebase
      const calendarId = `google-primary-${userId}`;
      const calendarDoc = await this.createCalendarDocument(calendarId, userId, events);
      
      // Step 5: Add calendar to user's personal calendars
      const calendarRef = {
        calendarId: calendarId,
        name: "My Google Calendar",
        permissions: "owner",
        color: "#4285F4" // Google blue
      };
      
      await UserService.addCalendarToUser(userId, calendarRef);
      
      console.log('Google Calendar import completed successfully');
      return {
        success: true,
        eventCount: events.length,
        calendarId: calendarId
      };
      
    } catch (error) {
      console.error('Error importing Google Calendar:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static async fetchGoogleCalendarEvents(accessToken) {
    try {
      // Calculate date range (6 months ago to 1 year future)
      const sixMonthsAgo = DateTime.now().minus({ months: 6 }).toISO();
      const oneYearFuture = DateTime.now().plus({ years: 1 }).toISO();
      
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
        `timeMin=${encodeURIComponent(sixMonthsAgo)}&` +
        `timeMax=${encodeURIComponent(oneYearFuture)}&` +
        `singleEvents=true&` +
        `orderBy=startTime&` +
        `maxResults=250`; // Reasonable limit for MVP
      
      console.log('Fetching Google Calendar events from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Calendar API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log(`Google Calendar API returned ${data.items?.length || 0} events`);
      
      // Transform Google Calendar events to our format
      const transformedEvents = (data.items || []).map(this.transformGoogleEvent);
      
      return transformedEvents;
      
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  }
  
  static transformGoogleEvent(googleEvent) {
    return {
      eventId: `google-${googleEvent.id}`,
      externalEventId: googleEvent.id,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description || '',
      location: googleEvent.location || '',
      startTime: googleEvent.start?.dateTime || googleEvent.start?.date,
      endTime: googleEvent.end?.dateTime || googleEvent.end?.date,
      isAllDay: !googleEvent.start?.dateTime, // If no dateTime, it's all-day
      status: googleEvent.status || 'confirmed',
      url: googleEvent.htmlLink || '',
      lastModified: googleEvent.updated || DateTime.now().toISO()
    };
  }
  
  static async createCalendarDocument(calendarId, userId, events) {
    try {
      // Convert events array to object with eventId as key
      const eventsObject = {};
      events.forEach(event => {
        eventsObject[event.eventId] = event;
      });
      
      const calendarDoc = {
        calendarId: calendarId,
        name: "My Google Calendar",
        description: "Imported from Google Calendar",
        
        source: {
          type: "google",
          address: "primary",
          provider: "google"
        },
        
        defaultColor: "#4285F4",
        
        events: eventsObject,
        
        sync: {
          lastSyncedAt: DateTime.now().toISO(),
          syncStatus: "success",
          dateRange: {
            startDate: DateTime.now().minus({ months: 6 }).toISO()
          }
        },
        
        subscribingGroups: [], // No groups yet - personal calendar only
        createdBy: userId,
        createdAt: DateTime.now().toISO(),
        updatedAt: DateTime.now().toISO(),
        isActive: true
      };
      
      // Save to Firestore
      const calendarRef = firestore().collection('calendars').doc(calendarId);
      await calendarRef.set(calendarDoc);
      
      console.log('Calendar document created:', calendarId);
      return calendarDoc;
      
    } catch (error) {
      console.error('Error creating calendar document:', error);
      throw error;
    }
  }
  
  static async syncCalendar(calendarId) {
    try {
      console.log('Syncing calendar:', calendarId);
      
      // Get calendar document
      const calendarRef = firestore().collection('calendars').doc(calendarId);
      const calendarDoc = await calendarRef.get();
      
      if (!calendarDoc.exists) {
        throw new Error(`Calendar ${calendarId} not found`);
      }
      
      const calendar = calendarDoc.data();
      
      // Only sync Google calendars for now
      if (calendar.source.type !== 'google') {
        throw new Error('Only Google Calendar sync is supported currently');
      }
      
      // Get fresh access token
      const accessToken = await getGoogleAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get Google access token for sync');
      }
      
      // Fetch latest events
      const latestEvents = await this.fetchGoogleCalendarEvents(accessToken);
      
      // Convert to events object
      const eventsObject = {};
      latestEvents.forEach(event => {
        eventsObject[event.eventId] = event;
      });
      
      // Update calendar document
      await calendarRef.update({
        events: eventsObject,
        'sync.lastSyncedAt': DateTime.now().toISO(),
        'sync.syncStatus': 'success',
        updatedAt: DateTime.now().toISO()
      });
      
      console.log(`Calendar ${calendarId} synced successfully with ${latestEvents.length} events`);
      return {
        success: true,
        eventCount: latestEvents.length
      };
      
    } catch (error) {
      console.error('Error syncing calendar:', error);
      
      // Update sync status to error
      try {
        const calendarRef = firestore().collection('calendars').doc(calendarId);
        await calendarRef.update({
          'sync.lastSyncedAt': DateTime.now().toISO(),
          'sync.syncStatus': 'error',
          'sync.errorMessage': error.message,
          updatedAt: DateTime.now().toISO()
        });
      } catch (updateError) {
        console.error('Failed to update sync error status:', updateError);
      }
      
      throw error;
    }
  }
  
  static async getCalendar(calendarId) {
    try {
      const calendarRef = firestore().collection('calendars').doc(calendarId);
      const calendarDoc = await calendarRef.get();
      
      if (calendarDoc.exists) {
        return calendarDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting calendar:', error);
      throw error;
    }
  }
  
  static async getUserCalendars(userId) {
    try {
      const user = await UserService.getCurrentUser();
      if (!user || !user.calendars) {
        return [];
      }
      
      // Get all calendar documents for user's calendars
      const calendarPromises = user.calendars.map(async (calendarRef) => {
        const calendar = await this.getCalendar(calendarRef.calendarId);
        return {
          ...calendar,
          userPermissions: calendarRef.permissions,
          userColor: calendarRef.color
        };
      });
      
      const calendars = await Promise.all(calendarPromises);
      return calendars.filter(cal => cal !== null);
      
    } catch (error) {
      console.error('Error getting user calendars:', error);
      throw error;
    }
  }
  
  static async deleteCalendar(calendarId, userId) {
    try {
      // Remove from user's calendars
      await UserService.removeCalendarFromUser(userId, calendarId);
      
      // Get calendar to check if user is the only subscriber
      const calendar = await this.getCalendar(calendarId);
      if (calendar && calendar.subscribingGroups.length === 0) {
        // No groups using this calendar, safe to delete
        const calendarRef = firestore().collection('calendars').doc(calendarId);
        await calendarRef.update({ isActive: false }); // Soft delete
      }
      
      console.log('Calendar removed from user:', calendarId);
      
    } catch (error) {
      console.error('Error deleting calendar:', error);
      throw error;
    }
  }
}

// Export individual functions for convenience
export const {
  importGoogleCalendar,
  fetchGoogleCalendarEvents,
  syncCalendar,
  getCalendar,
  getUserCalendars,
  deleteCalendar
} = CalendarService;
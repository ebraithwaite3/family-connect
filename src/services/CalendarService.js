// src/services/CalendarService.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin'; // ADD THIS LINE

export const getCalendarEvents = async () => {
  try {
    const tokens = await GoogleSignin.getTokens();
    console.log('Access token:', tokens.accessToken);
    
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' +
      new URLSearchParams({
        timeMin: new Date().toISOString(),
        maxResults: '10',
        singleEvents: 'true',
        orderBy: 'startTime',
      }),
      {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    console.log('Calendar events:', data.items);
    return data.items || [];
  } catch (error) {
    console.error('Calendar API error:', error);
    throw error;
  }
};
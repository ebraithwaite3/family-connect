// src/services/IcalService.ts
export const getIcalEvents = async (icalUrl: string) => {
    try {
      console.log('Fetching iCal from:', icalUrl);
  
      const response = await fetch(icalUrl);
      const icalData = await response.text();
      console.log('iCal data received, length:', icalData.length);
  
      // Debug: Show first 500 characters
      console.log('First 500 chars:', icalData.substring(0, 500));
  
      const events = [];
      const lines = icalData.split('\n');
      let currentEvent = null;
      let eventCount = 0;
  
      for (const line of lines) {
        const trimmedLine = line.trim();
  
        if (trimmedLine === 'BEGIN:VEVENT') {
          currentEvent = {};
          eventCount++;
          // console.log('Found VEVENT #', eventCount);
        } else if (trimmedLine === 'END:VEVENT' && currentEvent) {
          // console.log('Processing event:', currentEvent.summary, currentEvent.start);
          
          // Use a more reliable check to ensure dates were parsed
          if (currentEvent.start && currentEvent.end) {
            const eventStartDate = new Date(currentEvent.start);
            const now = new Date();
            // console.log('Event date:', eventStartDate, 'Now:', now, 'Is future:', eventStartDate > now);
  
            // We'll filter for future events or events happening today
            const isFutureEvent = eventStartDate > now;
            const isToday = eventStartDate.toDateString() === now.toDateString();
            
            if (isFutureEvent || isToday) {
              events.push({
                id: currentEvent.uid || Math.random().toString(),
                summary: currentEvent.summary || 'No Title',
                start: {
                  dateTime: currentEvent.start,
                  date: new Date(currentEvent.start).toISOString().split('T')[0]
                },
                end: {
                  dateTime: currentEvent.end,
                  date: new Date(currentEvent.end).toISOString().split('T')[0]
                },
                location: currentEvent.location,
                description: currentEvent.description,
                source: 'ical'
              });
            }
          }
          currentEvent = null;
        } else if (currentEvent) {
          // Handle multiline properties
          const match = trimmedLine.match(/^([^:]+):(.*)/);
          if (match) {
            const key = match[1].split(';')[0]; // Handle parameters like DTSTART;VALUE=DATE
            const value = match[2];
  
            switch (key) {
              case 'SUMMARY':
                currentEvent.summary = value;
                break;
              case 'UID':
                currentEvent.uid = value;
                break;
              case 'LOCATION':
                currentEvent.location = value;
                break;
              case 'DESCRIPTION':
                currentEvent.description = value;
                break;
              case 'DTSTART':
                currentEvent.start = parseIcalDate(value);
                break;
              case 'DTEND':
                currentEvent.end = parseIcalDate(value);
                break;
              // Add other properties you care about
              default:
                break;
            }
          }
        }
      }
  
      console.log('Total VEVENT blocks found:', eventCount);
      console.log('Future events found:', events.length);
  
      events.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
      return events.slice(0, 10);
    } catch (error) {
      console.error('iCal parsing error:', error);
      throw error;
    }
  };
  
  const parseIcalDate = (dateStr: string): string | null => {
    // TeamSnap often uses a local time format without a Z
    const dateWithTimezoneMatch = dateStr.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
    if (dateWithTimezoneMatch) {
      // Format: YYYYMMDDTHHMMSS or YYYYMMDDTHHMMSSZ
      const [_, year, month, day, hour, minute, second] = dateWithTimezoneMatch;
      // Construct a valid ISO 8601 string. We assume local time if no 'Z' is present
      const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;
      return new Date(isoString).toISOString();
    }
    
    const allDayMatch = dateStr.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (allDayMatch) {
      // Format: YYYYMMDD for all-day events
      const [_, year, month, day] = allDayMatch;
      // For all-day events, it's safe to return an ISO string at midnight UTC
      const isoString = `${year}-${month}-${day}T00:00:00Z`;
      return isoString;
    }
    
    // Return null or throw an error for unhandled formats
    console.log('Unknown date format:', dateStr);
    return null;
  };
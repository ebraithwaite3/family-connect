// src/App.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getIcalEvents } from './services/IcalService';
import { signInWithGoogle, signOut } from './services/AuthService'; 
import { getCalendarEvents } from './services/CalendarService'; // Add this import

GoogleSignin.configure({
  webClientId: '930380993136-7s41s52qsravho7ot8jtimgaf00jp3bk.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar.readonly'],
});

const App = () => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [events, setEvents] = useState([]); // Add events state
  const [loadingEvents, setLoadingEvents] = useState(false); // Add loading state

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  // Add function to load calendar events
  const loadCalendarEvents = async () => {
    setLoadingEvents(true);
    try {
      const calendarEvents = await getCalendarEvents();
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Welcome to FamilyConnect</Text>
        <Button
          title="Sign in with Google"
          onPress={signInWithGoogle}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.text}>Welcome, {user.displayName}!</Text>
        
        <Button
          title="Load Calendar Events"
          onPress={loadCalendarEvents}
        />

        <Button
          title="Load iCal Events (Test)"
          onPress={async () => {
            setLoadingEvents(true);
            try {
              // Test with a sample iCal URL - replace with actual TeamSnap URL
              const icalEvents = await getIcalEvents('https://ical-cdn.teamsnap.com/team_schedule/caaa93e6-e6ec-4d25-93eb-053bbade163a.ics');
              setEvents(icalEvents);
            } catch (error) {
              console.error('Failed to load iCal events:', error);
            } finally {
              setLoadingEvents(false);
            }
          }}
        />
        
        <Button
          title="Sign Out"
          onPress={signOut}
        />

        {loadingEvents && <ActivityIndicator size="large" color="#0000ff" />}
        
        {events.length > 0 && (
          <View style={styles.eventsContainer}>
            <Text style={styles.eventsTitle}>Your Calendar Events:</Text>
            {events.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <Text style={styles.eventTitle}>{event.summary || 'No Title'}</Text>
                <Text style={styles.eventTime}>
                  {event.start?.dateTime || event.start?.date || 'No time'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  eventsContainer: {
    marginTop: 20,
    width: '100%',
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventItem: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
});

export default App;
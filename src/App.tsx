// src/App.tsx - Updated with Theme Provider
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Theme
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Services
import { signInWithGoogle, signOut, onAuthStateChanged } from './services/AuthService'; 
import { UserService } from './services/UserService';
import { CalendarService } from './services/CalendarService';

// Screens
import DOBCollectionScreen from './screens/DOBCollectionScreen';
import CalendarImportScreen from './screens/CalendarImportScreen';

// Components
import Header from './components/Header';

GoogleSignin.configure({
  webClientId: '930380993136-7s41s52qsravho7ot8jtimgaf00jp3bk.apps.googleusercontent.com',
  offlineAccess: true,
  scopes: ['profile', 'email'], // Just basic scopes for now
});

type AuthStatus = 'loading' | 'signedOut' | 'needsDOB' | 'needsCalendarImport' | 'complete';

// Main App Component (wrapped with theme)
const AppContent = () => {
  const { isDarkMode, theme } = useTheme();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const subscriber = onAuthStateChanged(handleAuthStateChanged);
    return subscriber;
  }, []);

  const handleAuthStateChanged = async (firebaseUser) => {
    try {
      if (firebaseUser) {
        // User is signed in, get full user data from Firestore
        const userData = await UserService.getCurrentUser();
        if (userData) {
          setUser(userData);
          if (!userData.dateOfBirth) {
            setAuthStatus('needsDOB');
          } else if (!userData.hasCompletedOnboarding && userData.authProviders.includes('google')) {
            // Google users who haven't completed onboarding should see calendar import
            setAuthStatus('needsCalendarImport');
          } else {
            setAuthStatus('complete');
          }
        } else {
          // Firebase user exists but no Firestore doc - shouldn't happen
          setAuthStatus('signedOut');
        }
      } else {
        // User is signed out
        setUser(null);
        setAuthStatus('signedOut');
      }
    } catch (error) {
      console.error('Error in handleAuthStateChanged:', error);
      setAuthStatus('signedOut');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthStatus('loading');
      const result = await signInWithGoogle();
      
      if (result.status === 'needsDOB') {
        setUser(result.user);
        setAuthStatus('needsDOB');
      } else if (result.status === 'complete') {
        setUser(result.user);
        // Check if Google user needs calendar import
        if (!result.user.hasCompletedOnboarding && result.user.authProviders.includes('google')) {
          setAuthStatus('needsCalendarImport');
        } else {
          setAuthStatus('complete');
        }
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      setAuthStatus('signedOut');
    }
  };

  const handleDOBComplete = (updatedUser) => {
    setUser(updatedUser);
    // After DOB completion, check if Google user needs calendar import
    if (updatedUser.authProviders.includes('google')) {
      setAuthStatus('needsCalendarImport');
    } else {
      setAuthStatus('complete');
    }
  };

  const handleCalendarImportComplete = (updatedUser) => {
    setUser(updatedUser);
    setAuthStatus('complete');
  };

  const loadUserCalendars = async () => {
    setLoadingEvents(true);
    try {
      const calendars = await CalendarService.getUserCalendars(user.userId);
      console.log('User calendars:', calendars);
      
      // Flatten all events from all calendars
      const allEvents = calendars.flatMap(cal => Object.values(cal.events || {}));
      console.log('All events:', allEvents);
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load user calendars:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const syncUserCalendars = async () => {
    setLoadingEvents(true);
    try {
      const user = await UserService.getCurrentUser();
      if (!user.calendars || user.calendars.length === 0) {
        console.log('No calendars to sync');
        return;
      }

      // Sync all user's calendars
      for (const calendarRef of user.calendars) {
        try {
          await CalendarService.syncCalendar(calendarRef.calendarId);
          console.log('Synced calendar:', calendarRef.name);
        } catch (error) {
          console.error('Failed to sync calendar:', calendarRef.name, error);
        }
      }

      // Reload events after sync
      await loadUserCalendars();
    } catch (error) {
      console.error('Failed to sync calendars:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Create themed styles
  const styles = StyleSheet.create({
    scrollContainer: {
      flex: 1,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: 'center',
      marginBottom: 30,
      lineHeight: 22,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.text.secondary,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 10,
    },
    userInfo: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 20,
      lineHeight: 18,
    },
    buttonGroup: {
      gap: 10,
      marginBottom: 20,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 20,
    },
    eventsContainer: {
      marginTop: 20,
    },
    eventsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text.primary,
      marginBottom: 10,
    },
    eventItem: {
      backgroundColor: theme.surface,
      padding: 15,
      marginBottom: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow.color,
      shadowOffset: theme.shadow.offset,
      shadowOpacity: theme.shadow.opacity,
      shadowRadius: theme.shadow.radius,
      elevation: theme.shadow.elevation,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 5,
    },
    eventTime: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 3,
    },
    eventLocation: {
      fontSize: 14,
      color: theme.text.tertiary,
      fontStyle: 'italic',
      marginBottom: 3,
    },
    eventDescription: {
      fontSize: 12,
      color: theme.text.tertiary,
      fontStyle: 'italic',
    },
    noCalendarsContainer: {
      alignItems: 'center',
      padding: 40,
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme.border,
    },
    noCalendarsText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.secondary,
      marginBottom: 5,
    },
    noCalendarsSubtext: {
      fontSize: 14,
      color: theme.text.tertiary,
      textAlign: 'center',
    },
  });

  // Loading state
  if (authStatus === 'loading') {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // DOB collection screen
  if (authStatus === 'needsDOB' && user) {
    return (
      <>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
        <DOBCollectionScreen 
          user={user} 
          onComplete={handleDOBComplete}
        />
      </>
    );
  }

  // Calendar import screen (Google users only)
  if (authStatus === 'needsCalendarImport' && user) {
    return (
      <>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
        <CalendarImportScreen 
          user={user} 
          onComplete={handleCalendarImportComplete}
        />
      </>
    );
  }

  // Sign-in screen
  if (authStatus === 'signedOut') {
    return (
      <View style={styles.centerContainer}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
        <Text style={styles.title}>Welcome to FamilyConnect</Text>
        <Text style={styles.subtitle}>
          Coordinate your family's calendar and activities with ease
        </Text>
        <Button
          title="Sign in with Google"
          onPress={handleGoogleSignIn}
          color={theme.primary}
        />
      </View>
    );
  }

  // Main app (user is fully authenticated)
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      {/* Header */}
      <Header 
        user={user}
        onProfilePress={() => console.log('Profile pressed')}
      />
      
      {/* Main Content */}
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.welcomeText}>Welcome back, {user?.fullName}!</Text>
          <Text style={styles.userInfo}>
            Email: {user?.email}
            {user?.dateOfBirth && `\nBorn: ${user.dateOfBirth}`}
            {user?.timezone && `\nTimezone: ${user.timezone}`}
            {user?.groupIds?.length > 0 && `\nGroups: ${user.groupIds.length}`}
            {user?.calendars?.length > 0 && `\nCalendars: ${user.calendars.length}`}
          </Text>
          
          <View style={styles.buttonGroup}>
            <Button
              title="Load My Calendars"
              onPress={loadUserCalendars}
              color={theme.primary}
            />
            
            <Button
              title="Sync Calendars"
              onPress={syncUserCalendars}
              color={theme.primary}
            />
            
            <Button
              title="Sign Out"
              onPress={signOut}
              color={theme.error}
            />
          </View>

          {loadingEvents && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ color: theme.text.primary }}>Loading events...</Text>
            </View>
          )}
          
          {events.length > 0 && (
            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>Your Calendar Events ({events.length})</Text>
              {events.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{event.title || 'No Title'}</Text>
                  <Text style={styles.eventTime}>
                    {event.startTime || 'No time'}
                  </Text>
                  {event.location && (
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  )}
                  {event.description && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {events.length === 0 && !loadingEvents && user?.calendars?.length === 0 && (
            <View style={styles.noCalendarsContainer}>
              <Text style={styles.noCalendarsText}>No calendars imported yet</Text>
              <Text style={styles.noCalendarsSubtext}>
                You can import your Google Calendar from Settings
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

// Root App Component
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
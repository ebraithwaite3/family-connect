// src/screens/CalendarImportScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { UserService } from '../services/UserService';
import { CalendarService } from '../services/CalendarService';

const CalendarImportScreen = ({ user, onComplete }) => {
  const [loading, setLoading] = useState(false);

  const handleImportCalendar = async () => {
    try {
      setLoading(true);
      console.log('Starting calendar import for user:', user.userId);
      
      // Add this debug line:
      console.log('About to call CalendarService.importGoogleCalendar');
      
      const importResult = await CalendarService.importGoogleCalendar(user.userId);
      
      console.log('Import result:', importResult);
      
      if (importResult.success) {
        Alert.alert(
          'Success!',
          `Imported ${importResult.eventCount} events from your Google Calendar.`,
          [{ text: 'Great!', onPress: completeOnboarding }]
        );
      } else {
        throw new Error(importResult.error || 'Failed to import calendar');
      }
      
    } catch (error) {
      console.error('Calendar import error:', error);
      
      if (error.message.includes('permission') || error.message.includes('scope')) {
        Alert.alert(
          'Permission Required',
          'We need permission to access your Google Calendar. You can try again later from Settings.',
          [
            { text: 'Skip for Now', onPress: completeOnboarding },
            { text: 'Try Again', onPress: handleImportCalendar }
          ]
        );
      } else {
        Alert.alert(
          'Import Failed',
          'We couldn\'t import your calendar right now. You can add it later from Settings.',
          [{ text: 'Continue', onPress: completeOnboarding }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkipImport = () => {
    Alert.alert(
      'Skip Calendar Import?',
      'You can always import your Google Calendar later from Settings.',
      [
        { text: 'Go Back', style: 'cancel' },
        { text: 'Skip', onPress: completeOnboarding }
      ]
    );
  };

  const completeOnboarding = async () => {
    try {
      // Mark onboarding as complete
      const updatedUser = await UserService.updateUser(user.userId, { 
        hasCompletedOnboarding: true 
      });
      onComplete(updatedUser);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still proceed to main app even if this fails
      onComplete({ ...user, hasCompletedOnboarding: true });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to FamilyConnect!</Text>
        <Text style={styles.subtitle}>
          Hi {user.fullName}, you're all set up!
        </Text>
        
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>📅 Import Your Google Calendar</Text>
          <Text style={styles.description}>
            Since you signed in with Google, we can import your Google Calendar 
            to get you started with your existing events.
          </Text>
          
          <Text style={styles.benefits}>
            This helps us:
            {'\n'}• Show your existing appointments
            {'\n'}• Create family assignments from your events  
            {'\n'}• Keep everything synchronized
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Importing your calendar...</Text>
            </View>
          ) : (
            <>
              <Button
                title="Import My Google Calendar" 
                onPress={handleImportCalendar}
                disabled={loading}
              />
              
              <View style={styles.skipButton}>
                <Button
                  title="Skip for Now"
                  onPress={handleSkipImport}
                  color="#666"
                  disabled={loading}
                />
              </View>
            </>
          )}
        </View>
        
        <Text style={styles.privacyNote}>
          We only read your calendar events. We never modify or delete anything 
          in your Google Calendar.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  calendarSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 15,
  },
  benefits: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  skipButton: {
    marginTop: 15,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  privacyNote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16,
    paddingHorizontal: 10,
  },
});

export default CalendarImportScreen;
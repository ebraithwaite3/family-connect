// src/services/UserService.js  
// FOCUSED: User data management, profiles, and Firestore operations

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { DateTime } from 'luxon';

// User structure for reference
// {
//   userId: string,
//   email: string,
//   fullName: string,
//   profilePicture?: string,
//   dateOfBirth?: string, // ISO date string (YYYY-MM-DD)
//   role: 'adult' | 'child',
//   timezone: string, // IANA timezone (America/New_York)
//   groupIds: [],
//   calendars: [],
//   subscriptions: [],
//   createdAt: string, // ISO timestamp
//   updatedAt: string, // ISO timestamp
//   isActive: boolean,
//   authProviders: []
// }

export class UserService {
  
  static async handleUserAuthentication(firebaseUser) {
    try {
      const userRef = firestore().collection('users').doc(firebaseUser.uid);
      const userDoc = await userRef.get();
      
      console.log('User document exists:', userDoc.exists);
      console.log('User document data:', userDoc.data());
      
      if (userDoc.exists && userDoc.data()) {
        // Existing user - check if they have complete profile
        const userData = userDoc.data();
        console.log('Existing user found:', userData);
        
        if (!userData.dateOfBirth) {
          // User exists but needs to complete DOB
          return { status: 'needsDOB', user: userData };
        } else {
          // Complete existing user
          return { status: 'complete', user: userData };
        }
      } else {
        // New user - create basic profile
        console.log('Creating new user for:', firebaseUser.uid);
        const newUser = await this.createNewUser(firebaseUser);
        return { status: 'needsDOB', user: newUser };
      }
    } catch (error) {
      console.error('Error handling user authentication:', error);
      throw error;
    }
  }

  static async createNewUser(firebaseUser) {
    try {
      console.log('Creating user for Firebase user:', firebaseUser.uid, firebaseUser.email);
      
      // Get user's timezone using Luxon
      const timezone = DateTime.local().zoneName;
      const now = DateTime.now().toISO();
      
      const newUser = {
        userId: firebaseUser.uid,
        email: firebaseUser.email || '',
        fullName: firebaseUser.displayName || '',
        profilePicture: firebaseUser.photoURL || undefined,
        // dateOfBirth: undefined, // Will be set later
        role: 'adult', // Default to adult
        timezone: timezone,
        groupIds: [],
        calendars: [],
        subscriptions: [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
        authProviders: ['google'] // Track how they signed up
      };
      
      console.log('About to save new user:', newUser);
      
      const userRef = firestore().collection('users').doc(firebaseUser.uid);
      await userRef.set(newUser);
      
      // Verify it was saved
      const verifyDoc = await userRef.get();
      console.log('Verification - document exists:', verifyDoc.exists);
      console.log('Verification - document data:', verifyDoc.data());
      
      console.log('New user created in Firestore successfully');
      return newUser;
    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const firebaseUser = auth().currentUser;  // ✅ Fixed: use auth() not just auth
      if (!firebaseUser) return null;
      
      const userRef = firestore().collection('users').doc(firebaseUser.uid);
      const userDoc = await userRef.get();
      
      if (userDoc.exists && userDoc.data()) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }

  static async updateUser(userId, updates) {
    try {
      const userRef = firestore().collection('users').doc(userId);
      const now = DateTime.now().toISO();
      
      await userRef.update({
        ...updates,
        updatedAt: now
      });
      
      console.log('User updated successfully:', updates);
      
      // Return updated user data
      const updatedDoc = await userRef.get();
      return updatedDoc.data();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async updateDateOfBirth(userId, dateOfBirth) {
    try {
      const updatedUser = await this.updateUser(userId, { dateOfBirth });
      console.log('DOB updated successfully:', dateOfBirth);
      return updatedUser;
    } catch (error) {
      console.error('Error updating DOB:', error);
      throw error;
    }
  }

  static async addToUserArray(userId, fieldName, item) {
    try {
      const userRef = firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      const user = userDoc.data();
      
      const currentArray = user[fieldName] || [];
      const updatedArray = [...currentArray, item];
      
      return await this.updateUser(userId, { [fieldName]: updatedArray });
    } catch (error) {
      console.error(`Error adding to user ${fieldName}:`, error);
      throw error;
    }
  }

  static async removeFromUserArray(userId, fieldName, itemOrId, matchField = null) {
    try {
      const userRef = firestore().collection('users').doc(userId);
      const userDoc = await userRef.get();
      const user = userDoc.data();
      
      const currentArray = user[fieldName] || [];
      
      let updatedArray;
      if (matchField) {
        // Remove by matching a field (e.g., remove calendar by calendarId)
        updatedArray = currentArray.filter(item => item[matchField] !== itemOrId);
      } else {
        // Remove by direct value match (e.g., remove groupId from groupIds array)
        updatedArray = currentArray.filter(item => item !== itemOrId);
      }
      
      return await this.updateUser(userId, { [fieldName]: updatedArray });
    } catch (error) {
      console.error(`Error removing from user ${fieldName}:`, error);
      throw error;
    }
  }

  // Convenience methods that use the generic functions
  static async addCalendarToUser(userId, calendar) {
    return await this.addToUserArray(userId, 'calendars', calendar);
  }

  static async removeCalendarFromUser(userId, calendarId) {
    return await this.removeFromUserArray(userId, 'calendars', calendarId, 'calendarId');
  }

  static async addGroupToUser(userId, groupId) {
    return await this.addToUserArray(userId, 'groupIds', groupId);
  }

  static async removeGroupFromUser(userId, groupId) {
    return await this.removeFromUserArray(userId, 'groupIds', groupId);
  }

  static async addSubscriptionToUser(userId, subscription) {
    return await this.addToUserArray(userId, 'subscriptions', subscription);
  }

  static async removeSubscriptionFromUser(userId, subscriptionId) {
    return await this.removeFromUserArray(userId, 'subscriptions', subscriptionId, 'subscriptionId');
  }

  static async updateUserPreferences(userId, preferences) {
    try {
      return await this.updateUser(userId, { preferences });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  static async deactivateUser(userId) {
    try {
      return await this.updateUser(userId, { isActive: false });
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  }
}

// Also export individual functions for convenience
export const {
  handleUserAuthentication,
  createNewUser,
  getCurrentUser,
  updateUser,
  updateDateOfBirth,
  addToUserArray,
  removeFromUserArray,
  addCalendarToUser,
  removeCalendarFromUser,
  addGroupToUser,
  removeGroupFromUser,
  addSubscriptionToUser,
  removeSubscriptionFromUser,
  updateUserPreferences,
  deactivateUser
} = UserService;
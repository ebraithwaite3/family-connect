// src/services/AuthService.js
// FOCUSED: Only handles authentication flows, not user data management

import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { UserService } from './UserService';

export const signInWithGoogle = async () => {
  try {
    // Sign out first to force fresh authentication
    await GoogleSignin.signOut();
    
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    const response = await GoogleSignin.signIn();
    console.log('Google Sign-in response:', response);
    
    if (response && response.data) {
      const { data } = response;
      
      const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      
      if (!userCredential?.user) {
        throw new Error('Failed to retrieve user from Firebase Auth');
      }
      
      const firebaseUser = userCredential.user;
      console.log('Firebase authentication successful for:', firebaseUser.uid);
      
      // Delegate user document handling to UserService
      const userStatus = await UserService.handleUserAuthentication(firebaseUser);
      return userStatus;
      
    } else {
      throw new Error('Google Sign-in failed - no data returned');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const signInWithApple = async () => {
  // TODO: Future Apple Sign-In implementation
  throw new Error('Apple Sign-In not implemented yet');
};

export const signInWithFacebook = async () => {
  // TODO: Future Facebook Sign-In implementation  
  throw new Error('Facebook Sign-In not implemented yet');
};

export const signInWithEmailPassword = async (email, password) => {
  // TODO: Future email/password sign-in
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const userStatus = await UserService.handleUserAuthentication(userCredential.user);
    return userStatus;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
};

export const createAccountWithEmailPassword = async (email, password) => {
  // TODO: Future email/password registration
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const userStatus = await UserService.handleUserAuthentication(userCredential.user);
    return userStatus;
  } catch (error) {
    console.error('Account creation error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentFirebaseUser = () => {
  return auth().currentUser;
};

export const onAuthStateChanged = (callback) => {
  return auth().onAuthStateChanged(callback);
};

// Request additional OAuth scopes (for calendar access later)
export const requestAdditionalScopes = async (scopes) => {
  try {
    console.log('Requesting additional scopes:', scopes);
    
    // Sign out and sign back in with new scopes
    await GoogleSignin.signOut();
    
    // Reconfigure with additional scopes
    GoogleSignin.configure({
      webClientId: '930380993136-7s41s52qsravho7ot8jtimgaf00jp3bk.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: ['profile', 'email', ...scopes],
    });
    
    // Sign in again with new scopes
    const response = await GoogleSignin.signIn();
    console.log('Re-authenticated with calendar scopes');
    
    return response;
  } catch (error) {
    console.error('Failed to request additional scopes:', error);
    throw error;
  }
};

export const getGoogleAccessToken = async () => {
  try {
    const tokens = await GoogleSignin.getTokens();
    return tokens.accessToken;
  } catch (error) {
    console.error('Failed to get Google access token:', error);
    throw error;
  }
};
// src/services/AuthService.ts
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes, isSuccessResponse } from '@react-native-google-signin/google-signin';

export const signInWithGoogle = async () => {
  try {
    // Sign out first to force fresh authentication with new scopes
    await GoogleSignin.signOut();
    
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    const response = await GoogleSignin.signIn();
    console.log('Full response:', response);
    
    if (isSuccessResponse(response)) {
      const { data } = response;
      console.log('idToken received:', data.idToken);
      
      const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
      await auth().signInWithCredential(googleCredential);
    }
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Sign in cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Sign in is in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Play services not available or outdated');
    } else {
      console.log('Sign-in error:', error);
    }
  }
};

export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
    console.log('User signed out!');
  } catch (error) {
    console.log('Sign out error:', error);
  }
};
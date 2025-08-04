import { getAuth, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from '@react-native-firebase/firestore';

const auth = getAuth();
const db = getFirestore();

export const signInWithGoogle = async () => {
  try {
    // Sign out first to force fresh authentication with new scopes
    await GoogleSignin.signOut();
    
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    const response = await GoogleSignin.signIn();
    console.log('Google Sign-in response:', response);
    
    if (isSuccessResponse(response)) {
      const { data } = response;
      console.log('idToken received:', data.idToken);
      
      const googleCredential = GoogleAuthProvider.credential(data.idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      
      // Check if userCredential and user are valid
      if (!userCredential || !userCredential.user) {
        console.error('No user found in userCredential:', userCredential);
        throw new Error('Failed to retrieve user from Firebase Auth');
      }
      
      const user = userCredential.user;
      console.log('Firebase user:', user);
      await createOrUpdateUserInFirestore(user);
    } else {
      console.error('Google Sign-in response was not successful:', response);
      throw new Error('Google Sign-in failed');
    }
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Sign-in cancelled');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Sign-in is in progress');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log('Play services not available or outdated');
    } else {
      console.error('Sign-in error:', error, error.message);
    }
    throw error; // Rethrow to allow caller to handle
  }
};

const createOrUpdateUserInFirestore = async (user, retries = 2) => {
  try {
    // Ensure user is not undefined
    if (!user || !user.uid) {
      console.error('Invalid user object:', user);
      throw new Error('Invalid user object provided to Firestore');
    }
    
    const userRef = doc(collection(db, 'users'), user.uid);
    
    // Check if the user document exists
    console.log('Checking user document for UID:', user.uid);
    const userDoc = await getDoc(userRef);
    
    // Handle case where exists might be a function or invalid
    let docExists = userDoc.exists();
    if (typeof docExists === 'function') {
      console.warn('userDoc.exists is a function, treating as non-existent:', docExists);
      docExists = false;
    } else if (typeof docExists !== 'boolean') {
      console.warn('userDoc.exists is not a boolean:', docExists);
      docExists = false;
    }
    console.log('User document exists:', docExists, 'Document data:', userDoc.data(), 'Raw userDoc:', userDoc);
    
    // Attempt to set the document
    console.log('Attempting to create/update user document for UID:', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || '',
      email: user.email || '',
      photoURL: user.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('User document successfully created or updated in Firestore');
    
    // Verify the document was created
    const verifyDoc = await getDoc(userRef);
    let verifyExists = verifyDoc.exists();
    if (typeof verifyExists === 'function') {
      console.warn('verifyDoc.exists is a function:', verifyExists);
      verifyExists = !!verifyDoc.data(); // Trust data presence over exists
    }
    console.log('Verification - User document exists:', verifyExists, 'Document data:', verifyDoc.data());
    if (!verifyExists && !verifyDoc.data()) {
      throw new Error('Failed to verify document creation');
    }
    
  } catch (error) {
    console.error('Error creating/updating user in Firestore:', error);
    if (retries > 0) {
      console.log(`Retrying document creation/update (${retries} attempts left)`);
      return createOrUpdateUserInFirestore(user, retries - 1);
    }
    throw error; // Rethrow after retries are exhausted
  }
};

export const signOut = async () => {
  try {
    await GoogleSignin.signOut();
    await auth.signOut();
    console.log('User signed out!');
  } catch (error) {
    console.log('Sign out error:', error);
    throw error;
  }
};
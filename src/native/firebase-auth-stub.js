// Used in Android test builds made before Google sign-in is configured
// (no google-services.json yet). Phone sign-in still works.
export const FirebaseAuthentication = {
  async signInWithGoogle() {
    throw Object.assign(new Error("Google sign-in isn't set up in this test version yet — please use phone number sign-in for now."), { code: "auth/native-not-configured" });
  },
  async signOut() {}
};

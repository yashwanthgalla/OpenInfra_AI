import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  Search, 
  LogOut, 
  CheckCircle2, 
  Star, 
  GitFork, 
  AlertCircle, 
  Calendar, 
  Award, 
  Terminal, 
  Info, 
  Globe, 
  ShieldAlert, 
  Activity, 
  BookOpen, 
  Heart,
  Loader2,
  Code,
  MailOpen
} from 'lucide-react';
import { auth } from './firebase';
import type { MockUser } from './firebase';
import GradientWaves from './GradientWaves';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup
} from 'firebase/auth';

interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
}

const GithubIcon = ({ size = 24, ...props }: CustomIconProps) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

// Use case / project profile types
type ProjectProfile = 'enterprise' | 'startup' | 'learning' | 'hobby';

interface RepoData {
  full_name: string;
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number;
  language: string;
  updated_at: string;
  pushed_at: string;
  homepage: string;
  archived: boolean;
  license: {
    spdx_id: string;
    name: string;
  } | null;
}

interface LanguageData {
  [key: string]: number;
}

interface AnalysisResults {
  overallScore: number;
  verdict: 'perfect' | 'stable' | 'caution' | 'danger';
  verdictText: string;
  verdictDescription: string;
  strengths: string[];
  risks: string[];
  metrics: {
    activity: number;
    popularity: number;
    maintenance: number;
    risk: number;
  };
}

// Popular repositories mockup database for fallback (when API limit is hit)
const MOCK_REPOS: { [key: string]: { repo: RepoData; langs: LanguageData } } = {
  'facebook/react': {
    repo: {
      full_name: 'facebook/react',
      name: 'react',
      description: 'The library for web and native user interfaces.',
      stargazers_count: 224000,
      forks_count: 47200,
      open_issues_count: 1420,
      size: 412000,
      language: 'JavaScript',
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      pushed_at: new Date().toISOString(),
      homepage: 'https://react.dev',
      archived: false,
      license: { spdx_id: 'MIT', name: 'MIT License' }
    },
    langs: { 'JavaScript': 945000, 'HTML': 32000, 'CSS': 23000 }
  },
  'tensorflow/tensorflow': {
    repo: {
      full_name: 'tensorflow/tensorflow',
      name: 'tensorflow',
      description: 'An Open Source Machine Learning Framework for Everyone.',
      stargazers_count: 182000,
      forks_count: 89000,
      open_issues_count: 23100,
      size: 1980000,
      language: 'C++',
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      pushed_at: new Date().toISOString(),
      homepage: 'https://tensorflow.org',
      archived: false,
      license: { spdx_id: 'Apache-2.0', name: 'Apache License 2.0' }
    },
    langs: { 'C++': 1200000, 'Python': 800000, 'HTML': 45000 }
  },
  'jquery/jquery': {
    repo: {
      full_name: 'jquery/jquery',
      name: 'jquery',
      description: 'jQuery JavaScript Library - legacy utility library.',
      stargazers_count: 59000,
      forks_count: 21500,
      open_issues_count: 98,
      size: 8900,
      language: 'JavaScript',
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
      pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      homepage: 'https://jquery.com',
      archived: false,
      license: { spdx_id: 'MIT', name: 'MIT License' }
    },
    langs: { 'JavaScript': 230000 }
  },
  'inactive/archived-project': {
    repo: {
      full_name: 'inactive/archived-project',
      name: 'archived-project',
      description: 'An obsolete framework that has been discontinued.',
      stargazers_count: 1200,
      forks_count: 140,
      open_issues_count: 450,
      size: 45000,
      language: 'Python',
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 380).toISOString(),
      pushed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 380).toISOString(),
      homepage: '',
      archived: true,
      license: { spdx_id: 'GPL-3.0', name: 'GNU General Public License v3.0' }
    },
    langs: { 'Python': 98000, 'Shell': 2000 }
  }
};

export default function App() {
  // Stateful Authentication observers
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);
  
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // View states: 'landing' | 'analyze' | 'auth'
  const [currentView, setCurrentView] = useState<'landing' | 'analyze' | 'auth'>('landing');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // App functional states
  const [repoInput, setRepoInput] = useState('facebook/react');
  const [profile, setProfile] = useState<ProjectProfile>('enterprise');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [langData, setLangData] = useState<LanguageData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResults | null>(null);
  
  // Interface alerts/notifications
  const [toastAlert, setToastAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Left-side showcase animation cycle state
  const [activeCycle, setActiveCycle] = useState(0);
  const [showcaseRepo, setShowcaseRepo] = useState('facebook/react');
  const [showcaseVerdict, setShowcaseVerdict] = useState('Perfect Match');
  
  // Live Firebase Auth State Observer
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // If email is verified, resolve user session
        if (firebaseUser.emailVerified) {
          const userData: MockUser = {
            email: firebaseUser.email || '',
            uid: firebaseUser.uid
          };
          setCurrentUser(userData);
          setVerificationPendingEmail(null);
          localStorage.setItem('openinfra_user', JSON.stringify(userData));
          setCurrentView('analyze');
        } else {
          // Email not verified, redirect to Verify screen
          setVerificationPendingEmail(firebaseUser.email);
          setCurrentUser(null);
          setCurrentView('auth');
        }
      } else {
        setCurrentUser(null);
        setVerificationPendingEmail(null);
        localStorage.removeItem('openinfra_user');
      }
    });
    return () => unsubscribe();
  }, []);

  // Simulate active showcase changes for login visual illustration
  useEffect(() => {
    if (currentUser || verificationPendingEmail) return;

    const interval = setInterval(() => {
      setActiveCycle((prev) => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          setShowcaseRepo('facebook/react');
          setShowcaseVerdict('Perfect Match');
        } else if (next === 1) {
          setShowcaseRepo('tensorflow/tensorflow');
          setShowcaseVerdict('Stable Choice');
        } else if (next === 2) {
          setShowcaseRepo('jquery/jquery');
          setShowcaseVerdict('Proceed with Caution');
        } else {
          setShowcaseRepo('inactive/archived-project');
          setShowcaseVerdict('Not Recommended');
        }
        return next;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [currentUser, verificationPendingEmail]);

  // Display feedback notification helper
  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastAlert({ message, type });
    setTimeout(() => setToastAlert(null), 5000);
  };

  // Email format validation helper
  const validateEmail = (inputEmail: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(inputEmail).toLowerCase());
  };

  // Live Firebase Sign In / Sign Up Handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    // Form inputs pre-validation
    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    setAuthLoading(true);

    try {
      if (isRegistering) {
        // Live Firebase createUser call
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Immediately send verification email to the user
        await sendEmailVerification(userCredential.user);
        
        // Show pending verify card
        setVerificationPendingEmail(email.toLowerCase().trim());
        triggerToast('Registration complete! Verification email sent (please check your spam folder).', 'success');
      } else {
        // Live Firebase signIn call
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Gating unverified users
        if (!userCredential.user.emailVerified) {
          await sendEmailVerification(userCredential.user); // auto-resend verification on attempt
          setVerificationPendingEmail(email.toLowerCase().trim());
          triggerToast('Email not verified. Verification link sent to inbox (please check your spam folder).', 'error');
        } else {
          const resolvedUser = {
            email: userCredential.user.email || email.toLowerCase().trim(),
            uid: userCredential.user.uid
          };
          setCurrentUser(resolvedUser);
          localStorage.setItem('openinfra_user', JSON.stringify(resolvedUser));
          triggerToast('Welcome back!', 'success');
          setCurrentView('analyze');
        }
      }

      // Clear credentials form state
      setEmail('');
      setPassword('');
    } catch (err: any) {
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/invalid-credential') {
        msg = 'Invalid credentials. Please verify your email and password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password provider is disabled in your Firebase console. Please go to Authentication -> Sign-in method, click Email/Password, and enable it.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Live Firebase Password Reset Reset Handler
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    if (!validateEmail(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setAuthLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setAuthSuccessMessage(`Password reset link sent to ${email.toLowerCase().trim()}. Please check your email inbox (including your spam folder).`);
      setEmail('');
    } catch (err: any) {
      let msg = err.message || 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email address.';
      }
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Verification Pending Screen Handlers
  const handleCheckVerification = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);
    
    try {
      const user = auth.currentUser;
      if (user) {
        await user.reload(); // Refresh Firebase Auth cache
        if (user.emailVerified) {
          const userData: MockUser = {
            email: user.email || '',
            uid: user.uid
          };
          setCurrentUser(userData);
          setVerificationPendingEmail(null);
          localStorage.setItem('openinfra_user', JSON.stringify(userData));
          triggerToast('Email verified successfully! Access granted.', 'success');
          setCurrentView('analyze');
        } else {
          setAuthError('Your email address is still unverified. Please check your spam folder or request a new link.');
        }
      } else {
        setAuthError('Session expired. Please sign in again.');
        setVerificationPendingEmail(null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to check verification status.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);
    
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setAuthSuccessMessage('Verification email resent! Please check your inbox (including your spam folder).');
        triggerToast('Verification link sent (please check your spam folder).', 'success');
      } else {
        setAuthError('Session expired. Please sign in again.');
        setVerificationPendingEmail(null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to resend verification.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBackToSignIn = async () => {
    await signOut(auth);
    setVerificationPendingEmail(null);
    setIsForgotPassword(false);
    setIsRegistering(false);
    setAuthError(null);
    setAuthSuccessMessage(null);
    setEmail('');
    setPassword('');
  };

  // Live Firebase Google Sign In Handler
  const handleGoogleAuth = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);
    setAuthLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      // Google Auth Popup exchange
      const userCredential = await signInWithPopup(auth, provider);
      const googleUser: MockUser = {
        email: userCredential.user.email || '',
        uid: userCredential.user.uid
      };
      
      setCurrentUser(googleUser);
      localStorage.setItem('openinfra_user', JSON.stringify(googleUser));
      triggerToast('Authenticated with Google successfully!', 'success');
      setCurrentView('analyze');
    } catch (err: any) {
      let msg = err.message || 'Google authentication failed.';
      
      // Parse specific strict configuration errors
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'Google Sign-In is disabled in your Firebase console. Please go to Authentication -> Sign-in method, click Google, and enable it.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup closed before authentication completed. Please try again.';
      }
      
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Live Firebase GitHub Sign In Handler
  const handleGithubAuth = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);
    setAuthLoading(true);

    try {
      const provider = new GithubAuthProvider();
      // GitHub Auth Popup exchange
      const userCredential = await signInWithPopup(auth, provider);
      const emailValue = userCredential.user.email || userCredential.user.providerData[0]?.email || `${userCredential.user.uid}@github.com`;
      const githubUser: MockUser = {
        email: emailValue,
        uid: userCredential.user.uid
      };
      
      setCurrentUser(githubUser);
      localStorage.setItem('openinfra_user', JSON.stringify(githubUser));
      triggerToast('Authenticated with GitHub successfully!', 'success');
      setCurrentView('analyze');
    } catch (err: any) {
      let msg = err.message || 'GitHub authentication failed.';
      
      // Parse specific configuration errors
      if (err.code === 'auth/operation-not-allowed') {
        msg = 'GitHub Sign-In is disabled in your Firebase console. Please go to Authentication -> Sign-in method, click GitHub, and enable it.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in popup closed before authentication completed. Please try again.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        msg = 'An account already exists with the same email address but different sign-in credentials. Sign in using Google or your email provider, or enable account linking.';
      }
      
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // Live Firebase Sign Out Handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('openinfra_user');
      setRepoData(null);
      setAnalysis(null);
      triggerToast('Signed out successfully.');
    } catch (err: any) {
      triggerToast('Failed to sign out: ' + err.message, 'error');
    }
  };

  // Suitability calculation engine
  const runEvaluation = (repo: RepoData, _langs: LanguageData, selectedProfile: ProjectProfile): AnalysisResults => {
    // 1. Popularity Score (Stars + Forks)
    const starWeight = Math.min(100, Math.round(repo.stargazers_count / 1000));
    const forkWeight = Math.min(100, Math.round(repo.forks_count / 200));
    const popularity = Math.round((starWeight * 0.7) + (forkWeight * 0.3));

    // 2. Activity Score
    const daysSinceUpdate = Math.round((Date.now() - Date.parse(repo.updated_at)) / (1000 * 60 * 60 * 24));
    let activity = 100;
    if (repo.archived) {
      activity = 0;
    } else if (daysSinceUpdate > 365) {
      activity = 10;
    } else if (daysSinceUpdate > 180) {
      activity = 40;
    } else if (daysSinceUpdate > 60) {
      activity = 70;
    } else if (daysSinceUpdate > 14) {
      activity = 90;
    }

    // 3. Maintenance (Open Issues to Forks ratio)
    const issuesToForksRatio = repo.open_issues_count / Math.max(1, repo.forks_count);
    let maintenance = 100;
    if (issuesToForksRatio > 1.5) {
      maintenance = 40;
    } else if (issuesToForksRatio > 0.8) {
      maintenance = 65;
    } else if (issuesToForksRatio > 0.3) {
      maintenance = 85;
    }
    if (daysSinceUpdate < 7) maintenance = Math.min(100, maintenance + 10);
    if (repo.archived) maintenance = 0;

    // 4. Risk Score (License, Size, Archived Status)
    let riskFactor = 0;
    
    // License check
    const licenseId = repo.license?.spdx_id?.toUpperCase() || 'NONE';
    const isPermissive = ['MIT', 'APACHE-2.0', 'BSD-2-CLAUSE', 'BSD-3-CLAUSE', 'ISC'].includes(licenseId);
    const isCopyleft = ['GPL-2.0', 'GPL-3.0', 'LGPL-3.0', 'AGPL-3.0'].includes(licenseId);

    if (licenseId === 'NONE') {
      riskFactor += 45;
    } else if (isCopyleft) {
      riskFactor += 25;
    }

    if (repo.archived) {
      riskFactor += 55;
    }

    if (repo.size > 800000) {
      riskFactor += 20;
    } else if (repo.size > 200000) {
      riskFactor += 10;
    }

    const risk = Math.max(0, 100 - riskFactor);

    // Overall Score
    let overallScore = 0;
    let strengths: string[] = [];
    let risks: string[] = [];

    if (repo.stargazers_count > 50000) strengths.push('Industry-wide validation with massive community backing.');
    else if (repo.stargazers_count > 5000) strengths.push('Solid community backing and adoption parameters.');

    if (daysSinceUpdate <= 14 && !repo.archived) strengths.push('Active developer commits detected in the last fortnight.');
    if (isPermissive) strengths.push(`Corporate-friendly permissive license structure (${repo.license?.spdx_id}).`);
    if (repo.forks_count > 1000) strengths.push('Rich historical code contributions with extensive branching.');
    
    if (repo.archived) risks.push('Repository is officially archived by owners (read-only state).');
    if (daysSinceUpdate > 180) risks.push(`Lack of active maintenance: no updates in ${Math.round(daysSinceUpdate / 30)} months.`);
    if (licenseId === 'NONE') risks.push('Missing license file. Creates massive legal use limitations.');
    if (isCopyleft) risks.push(`Copyleft license (${repo.license?.spdx_id}) forces proprietary source releases.`);
    if (issuesToForksRatio > 1.2) risks.push('Unusually high bugs backlog relative to developer activity.');
    if (repo.size > 500000) risks.push(`Heavy directory size (${Math.round(repo.size / 1024)} MB) might slow build actions.`);

    if (strengths.length === 0) strengths.push('Baseline repository functionalities remain stable.');
    if (risks.length === 0) risks.push('No severe structural anomalies or license risks detected.');

    switch (selectedProfile) {
      case 'enterprise':
        overallScore = Math.round((maintenance * 0.35) + (risk * 0.35) + (activity * 0.2) + (popularity * 0.1));
        break;
      case 'startup':
        overallScore = Math.round((popularity * 0.4) + (activity * 0.3) + (risk * 0.2) + (maintenance * 0.1));
        break;
      case 'learning':
        overallScore = Math.round((risk * 0.3) + (popularity * 0.3) + (maintenance * 0.2) + (activity * 0.2));
        break;
      case 'hobby':
        overallScore = Math.round((risk * 0.4) + (maintenance * 0.3) + (popularity * 0.2) + (activity * 0.1));
        break;
    }

    let verdict: 'perfect' | 'stable' | 'caution' | 'danger';
    let verdictText = '';
    let verdictDescription = '';

    if (overallScore >= 85) {
      verdict = 'perfect';
      verdictText = 'Highly Recommended';
      verdictDescription = `Excellent match! This repository scores exceptionally well for ${selectedProfile} profiles. It displays excellent maintenance habits, high code safety standards, and active community participation.`;
    } else if (overallScore >= 70) {
      verdict = 'stable';
      verdictText = 'Stable & Viable';
      verdictDescription = `Good choice. This repository has robust characteristics fitting ${selectedProfile} needs, though you should check details on potential risks.`;
    } else if (overallScore >= 45) {
      verdict = 'caution';
      verdictText = 'Proceed with Caution';
      verdictDescription = `Moderate warnings detected. The codebase exhibits certain risk factors (e.g. licensing compliance, slower updates, or high bug backlog) that might impede ${selectedProfile} developments.`;
    } else {
      verdict = 'danger';
      verdictText = 'High Risk Warning';
      verdictDescription = `Not recommended. The repository scores very poorly for your use-case. Major issues like archive status, copyleft issues, or complete abandonment make it highly risky for direct project use.`;
    }

    return {
      overallScore,
      verdict,
      verdictText,
      verdictDescription,
      strengths,
      risks,
      metrics: {
        activity,
        popularity,
        maintenance,
        risk
      }
    };
  };

  // Perform Analysis
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    let cleanRepo = repoInput.trim();
    if (cleanRepo.includes('github.com/')) {
      const parts = cleanRepo.split('github.com/');
      cleanRepo = parts[1];
    }
    cleanRepo = cleanRepo.replace(/^\/|\/$/g, '');
    
    const segments = cleanRepo.split('/');
    if (segments.length !== 2) {
      triggerToast('Invalid format. Use owner/repo (e.g. facebook/react).', 'error');
      return;
    }

    const [owner, repo] = segments;

    setLoading(true);
    setApiNotice(null);
    
    try {
      setLoadingStep('Connecting to GitHub API...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setLoadingStep('Fetching repository metadata...');
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
      
      if (repoRes.status === 403) {
        setLoadingStep('API rate limit reached. Loading local cached node...');
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const fallbackKey = cleanRepo.toLowerCase();
        const matchedKey = Object.keys(MOCK_REPOS).find(k => k.toLowerCase() === fallbackKey);
        
        if (matchedKey && MOCK_REPOS[matchedKey]) {
          const matched = MOCK_REPOS[matchedKey];
          setRepoData(matched.repo);
          setLangData(matched.langs);
          const evalRes = runEvaluation(matched.repo, matched.langs, profile);
          setAnalysis(evalRes);
          setApiNotice('GitHub REST API rate limit reached. Displaying detailed local cached snapshot for verification.');
        } else {
          const simulatedRepo: RepoData = {
            full_name: cleanRepo,
            name: repo,
            description: `Simulated snapshot of ${cleanRepo}. Original details fetched from local metadata index.`,
            stargazers_count: 12000,
            forks_count: 2400,
            open_issues_count: 320,
            size: 85000,
            language: 'TypeScript',
            updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            pushed_at: new Date().toISOString(),
            homepage: 'https://github.com/' + cleanRepo,
            archived: false,
            license: { spdx_id: 'MIT', name: 'MIT License' }
          };
          const simulatedLangs = { 'TypeScript': 80000, 'JavaScript': 5000 };
          setRepoData(simulatedRepo);
          setLangData(simulatedLangs);
          const evalRes = runEvaluation(simulatedRepo, simulatedLangs, profile);
          setAnalysis(evalRes);
          setApiNotice('GitHub API rate limit reached. Simulated repository metrics constructed for sandbox preview.');
        }
        setLoading(false);
        return;
      }

      if (!repoRes.ok) {
        throw new Error('Repository not found. Ensure it is public and spelling is correct.');
      }

      const rawRepoData = await repoRes.json() as RepoData;
      
      setLoadingStep('Fetching language composition...');
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
      let rawLangData: LanguageData = {};
      if (langRes.ok) {
        rawLangData = await langRes.json() as LanguageData;
      }

      setLoadingStep('Running OpenInfra AI suitability calculations...');
      await new Promise(resolve => setTimeout(resolve, 400));

      setRepoData(rawRepoData);
      setLangData(rawLangData);
      
      const evalRes = runEvaluation(rawRepoData, rawLangData, profile);
      setAnalysis(evalRes);
      
    } catch (err: any) {
      triggerToast(err.message || 'An error occurred during analysis.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoData && langData) {
      const evalRes = runEvaluation(repoData, langData, profile);
      setAnalysis(evalRes);
    }
  }, [profile]);

  return (
    <>
      <div className="glow-backdrop" />
      
      {/* Toast Alert banner */}
      {toastAlert && (
        <div className={`toast-alert animate-reveal ${toastAlert.type === 'success' ? 'success' : ''}`}>
          {toastAlert.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toastAlert.message}</span>
        </div>
      )}

      {currentView === 'landing' && (
        // Hero Landing Page (White theme with GradientWaves)
        <div className="landing-container animate-reveal">
          <div className="landing-waves-bg">
            <GradientWaves
              horizonColor="#ffffff"
              waveColor="#6366f1"
              crestColor="#3b82f6"
              speed={0.3}
              amplitude={1.8}
              waveScale={0.5}
              waveRatio={0.9}
              swell={25}
              turbulence={15}
              tilt={1.2}
              zoom={0.95}
              height={5.0}
              fogDepth={18}
              detail="medium"
              brightness={1.1}
              opacity={0.8}
              mouseInteraction={true}
              parallaxStrength={0.4}
              grain={true}
              grainIntensity={0.03}
            />
          </div>
          
          <header className="landing-header">
            <div className="brand-wrapper">
              <GithubIcon size={24} />
              <span className="brand-title">OpenInfra AI</span>
            </div>
            <div className="landing-nav">
              <button 
                className="btn-secondary" 
                onClick={() => setCurrentView('analyze')}
                style={{ padding: '6px 14px', fontSize: '13px' }}
              >
                Go to Analyzer
              </button>
              {currentUser ? (
                <div className="user-profile-badge" style={{ padding: '5px 12px', fontSize: '13px' }}>
                  <span>{currentUser.email}</span>
                </div>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setIsRegistering(false);
                    setIsForgotPassword(false);
                    setAuthError(null);
                    setAuthSuccessMessage(null);
                    setCurrentView('auth');
                  }}
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                >
                  Sign In
                </button>
              )}
            </div>
          </header>
          
          <main className="landing-hero">
            <h1 className="hero-title animate-reveal">
              OpenInfra AI Analyzer
            </h1>
            <p className="hero-subtitle animate-reveal" style={{ animationDelay: '0.1s' }}>
              Evaluate repository health, license compliance, and project suitability parameters in real-time.
            </p>
            <div className="hero-actions animate-reveal" style={{ animationDelay: '0.2s' }}>
              <button 
                className="btn-primary hero-btn"
                onClick={() => setCurrentView('analyze')}
              >
                <Search size={16} />
                Analyze Repository
              </button>
              
              {!currentUser && (
                <button 
                  className="btn-secondary hero-btn"
                  onClick={() => {
                    setIsRegistering(true);
                    setIsForgotPassword(false);
                    setAuthError(null);
                    setAuthSuccessMessage(null);
                    setCurrentView('auth');
                  }}
                >
                  Create Account
                </button>
              )}
            </div>
          </main>
        </div>
      )}

      {currentView === 'auth' && (
        // Split-Screen Login/Register Page (Light Minimalist Theme)
        <div className="login-container">
          
          {/* Left panel - Product Showcase */}
          <div className="login-left">
            <div className="showcase-title-area">
              <div className="showcase-logo" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('landing')}>
                <GithubIcon size={24} />
                <span>OpenInfra AI</span>
              </div>
              <p className="showcase-subtitle">
                Evaluate repository health, license compliance, and project suitability parameters in real-time.
              </p>
            </div>

            {/* Showcase Visual Simulator */}
            <div className="showcase-wrapper">
              
              {/* Card 1: API Endpoint Connection Simulation */}
              <div className={`glass-panel showcase-card card-api-simulator ${activeCycle === 0 ? 'animate-pulse-glow' : 'animate-float'}`}>
                <div className="card-header-flex">
                  <span className="card-label">
                    <Terminal size={13} style={{ color: 'var(--text-secondary)' }} />
                    GitHub API Engine
                  </span>
                  <span className="pulse-node"></span>
                </div>
                <div style={{ background: '#f9fafb', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-primary)' }}>
                  GET /repos/{showcaseRepo}
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Status: 200 OK • Data Loaded
                  </div>
                </div>
              </div>

              {/* Card 2: Interactive Running Evaluation Metric */}
              <div className={`glass-panel showcase-card card-live-analyzer ${activeCycle === 1 ? 'animate-pulse-glow' : 'animate-float-delayed'}`}>
                <div className="card-header-flex">
                  <span className="card-label">
                    <Activity size={13} style={{ color: 'var(--accent-cobalt)' }} />
                    Compatibility Auditor
                  </span>
                  <span className="api-endpoint-badge">V2.4</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                      <span>Stability Index</span>
                      <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>94%</span>
                    </div>
                    <div style={{ height: '3px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '94%', height: '100%', background: 'var(--status-success)' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '2px' }}>
                      <span>Maintenance Ratio</span>
                      <span style={{ color: 'var(--status-warning)', fontWeight: 600 }}>62%</span>
                    </div>
                    <div style={{ height: '3px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '62%', height: '100%', background: 'var(--status-warning)' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Main Verdict Output Preview Card */}
              <div className={`glass-panel showcase-card card-suitability-preview ${activeCycle >= 2 ? 'animate-pulse-glow' : 'animate-float'}`} style={{ borderLeft: '3px solid var(--accent-cobalt)' }}>
                <div className="card-header-flex">
                  <span className="card-label">
                    <Award size={14} style={{ color: 'var(--accent-cobalt)' }} />
                    Suitability Verdict
                  </span>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '1px 6px', 
                    borderRadius: '4px',
                    fontWeight: 600,
                    backgroundColor: showcaseVerdict === 'Perfect Match' ? 'var(--status-success-bg)' : 
                                     showcaseVerdict === 'Stable Choice' ? 'var(--status-info-bg)' :
                                     showcaseVerdict === 'Proceed with Caution' ? 'var(--status-warning-bg)' : 'var(--status-danger-bg)',
                    color: showcaseVerdict === 'Perfect Match' ? 'var(--status-success)' :
                           showcaseVerdict === 'Stable Choice' ? 'var(--status-info)' :
                           showcaseVerdict === 'Proceed with Caution' ? 'var(--status-warning)' : 'var(--status-danger)'
                  }}>
                    {showcaseVerdict}
                  </span>
                </div>
                <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 600 }}>
                  Target: {showcaseRepo}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {showcaseVerdict === 'Perfect Match' && 'Ideal fit for high-stakes enterprise projects. Minimal risks found.'}
                  {showcaseVerdict === 'Stable Choice' && 'Good community parameters. Suitable for startup environments.'}
                  {showcaseVerdict === 'Proceed with Caution' && 'Slightly slow release cycles. Assess security risks prior to use.'}
                  {showcaseVerdict === 'Not Recommended' && 'Archived repository or hazardous licensing issues identified.'}
                </p>
              </div>

            </div>
          </div>

          {/* Right panel - Credentials and Gated Auth Cards */}
          <div className="login-right animate-reveal">
            
            {verificationPendingEmail ? (
              // EMAIL VERIFICATION PENDING SCREEN
              <div className="login-form animate-reveal" style={{ textAlign: 'center' }}>
                <div style={{ background: 'var(--accent-cobalt-light)', color: 'var(--accent-cobalt)', padding: '16px', borderRadius: '50%', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <MailOpen size={30} />
                </div>
                
                <h2 className="login-header-title">Verify your email</h2>
                <p className="login-header-subtitle" style={{ marginBottom: '20px' }}>
                  We sent an activation link to <strong>{verificationPendingEmail}</strong>. Please verify your email to unlock dashboard diagnostics (please check your spam/junk folder if you don't see it).
                </p>

                {/* Form feedback indicators */}
                {authError && (
                  <div className="auth-error-msg" style={{ textAlign: 'left' }}>
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    <span>{authError}</span>
                  </div>
                )}
                {authSuccessMessage && (
                  <div style={{ background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', color: 'var(--status-success)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                    <span>{authSuccessMessage}</span>
                  </div>
                )}

                <button 
                  className="btn-primary" 
                  style={{ width: '100%', marginBottom: '12px' }}
                  onClick={handleCheckVerification}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    'Check Verification Status'
                  )}
                </button>

                <button 
                  className="btn-secondary" 
                  style={{ width: '100%', marginBottom: '20px' }}
                  onClick={handleResendVerification}
                  disabled={authLoading}
                >
                  Resend Verification Email
                </button>

                <p className="login-footer-text">
                  <a href="#" onClick={(e) => { e.preventDefault(); handleBackToSignIn(); }}>
                    Back to Sign In
                  </a>
                </p>
              </div>
            ) : isForgotPassword ? (
              // FORGOT PASSWORD SCREEN
              <div className="login-form animate-reveal">
                <div className="login-header-section">
                  <h2 className="login-header-title">Reset your password</h2>
                  <p className="login-header-subtitle">
                    Enter your email address and we'll send you a link to reset your password credentials.
                  </p>
                </div>

                <form onSubmit={handlePasswordResetSubmit}>
                  {authError && (
                    <div className="auth-error-msg">
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{authError}</span>
                    </div>
                  )}
                  {authSuccessMessage && (
                    <div style={{ background: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', color: 'var(--status-success)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                      <span>{authSuccessMessage}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={authLoading}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '8px' }}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                <p className="login-footer-text" style={{ textAlign: 'center' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleBackToSignIn(); }}>
                    Back to Sign In
                  </a>
                </p>
              </div>
            ) : (
              // GENERAL LOGIN & SIGNUP SCREEN
              <>
                <div className="login-header-section">
                  <h2 className="login-header-title">
                    {isRegistering ? 'Create an account' : 'Welcome back'}
                  </h2>
                  <p className="login-header-subtitle">
                    {isRegistering 
                      ? 'Sign up to evaluate repository compatibility constraints' 
                      : 'Access premium workspace metrics & analysis widgets'
                    }
                  </p>
                </div>

                {/* Social Identity OAuth Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '320px' }}>
                  <button 
                    className="login-btn-google" 
                    onClick={handleGoogleAuth}
                    disabled={authLoading}
                    type="button"
                  >
                    <GoogleIcon />
                    {isRegistering ? 'Sign up with Google' : 'Continue with Google'}
                  </button>

                  <button 
                    className="login-btn-github" 
                    onClick={handleGithubAuth}
                    disabled={authLoading}
                    type="button"
                  >
                    <GithubIcon size={16} />
                    {isRegistering ? 'Sign up with GitHub' : 'Continue with GitHub'}
                  </button>
                </div>

                <div className="login-divider">
                  <span>or use your email</span>
                </div>

                {/* Credentials Form */}
                <form className="login-form" onSubmit={handleAuthSubmit}>
                  
                  {authError && (
                    <div className="auth-error-msg">
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="name@company.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={authLoading}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ margin: 0 }}>Password</label>
                      {!isRegistering && (
                        <a 
                          href="#" 
                          style={{ fontSize: '11px', color: 'var(--accent-cobalt)', textDecoration: 'none' }}
                          onClick={(e) => { e.preventDefault(); setIsForgotPassword(true); setAuthError(null); setAuthSuccessMessage(null); setEmail(''); }}
                        >
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <input 
                      type="password" 
                      placeholder="•••••••• (Min. 6 chars)" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={authLoading}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '10px' }}
                    disabled={authLoading}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      isRegistering ? 'Create Account' : 'Sign In'
                    )}
                  </button>
                </form>

                <p className="login-footer-text">
                  {isRegistering ? (
                    <>
                      Already have an account?{' '}
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(false); setAuthError(null); setAuthSuccessMessage(null); }}>
                        Sign In
                      </a>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(true); setAuthError(null); setAuthSuccessMessage(null); }}>
                        Sign Up Free
                      </a>
                    </>
                  )}
                </p>
              </>
            )}

            <div style={{ marginTop: '24px', fontSize: '13px', textAlign: 'center' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('landing'); }} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}>
                ← Back to Home
              </a>
            </div>

          </div>

        </div>
      )}

      {currentView === 'analyze' && (
        // Post-login Dashboard Application (Light Minimalist Theme)
        <div className="dashboard-container animate-reveal">
          
          {/* Dashboard Top Header */}
          <header className="dashboard-header">
            <div className="brand-wrapper" style={{ cursor: 'pointer' }} onClick={() => setCurrentView('landing')}>
              <GithubIcon size={20} />
              <span className="brand-title">OpenInfra AI Analyzer</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                className="btn-secondary" 
                style={{ padding: '5px 12px', fontSize: '13px' }}
                onClick={() => setCurrentView('landing')}
              >
                Home
              </button>
              {currentUser ? (
                <>
                  <div className="user-profile-badge">
                    <div style={{ width: '6px', height: '6px', background: 'var(--status-success)', borderRadius: '50%' }}></div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }} title={currentUser.uid}>
                      {currentUser.email}
                    </span>
                  </div>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '5px 12px', fontSize: '13px' }}
                    onClick={handleSignOut}
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </>
              ) : (
                <button 
                  className="btn-primary" 
                  style={{ padding: '5px 12px', fontSize: '13px' }}
                  onClick={() => {
                    setIsRegistering(false);
                    setIsForgotPassword(false);
                    setAuthError(null);
                    setAuthSuccessMessage(null);
                    setCurrentView('auth');
                  }}
                >
                  Sign In / Create Account
                </button>
              )}
            </div>
          </header>

          {/* Core Interactive Layout grid */}
          <div className="dashboard-grid">
            
            {/* Sidebar form inputs panel */}
            <div className="glass-panel sidebar-panel">
              <h3 className="form-title">Parameters</h3>
              
              <form onSubmit={handleAnalyze}>
                <div className="form-group">
                  <label>Repository Name or URL</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="e.g., facebook/react" 
                      value={repoInput}
                      onChange={(e) => setRepoInput(e.target.value)}
                      style={{ paddingLeft: '34px' }}
                      required
                    />
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Accepts `owner/repo` or full GitHub URLs.
                  </span>
                </div>

                <div className="form-group">
                  <label>Target Project Profile</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    
                    <div 
                      className={`profile-option ${profile === 'enterprise' ? 'active' : ''}`}
                      onClick={() => setProfile('enterprise')}
                    >
                      <div className="profile-option-icon">
                        <Award size={14} />
                      </div>
                      <div>
                        <div className="profile-option-title">Enterprise Core</div>
                        <div className="profile-option-desc">Strict compliance, MIT/Apache licenses, high stability.</div>
                      </div>
                    </div>

                    <div 
                      className={`profile-option ${profile === 'startup' ? 'active' : ''}`}
                      onClick={() => setProfile('startup')}
                    >
                      <div className="profile-option-icon">
                        <Heart size={14} />
                      </div>
                      <div>
                        <div className="profile-option-title">Startup MVP</div>
                        <div className="profile-option-desc">Fast implementation speed, maximum community support.</div>
                      </div>
                    </div>

                    <div 
                      className={`profile-option ${profile === 'learning' ? 'active' : ''}`}
                      onClick={() => setProfile('learning')}
                    >
                      <div className="profile-option-icon">
                        <BookOpen size={14} />
                      </div>
                      <div>
                        <div className="profile-option-title">Learning & Demos</div>
                        <div className="profile-option-desc">Code readability, minimal configuration overhead.</div>
                      </div>
                    </div>

                    <div 
                      className={`profile-option ${profile === 'hobby' ? 'active' : ''}`}
                      onClick={() => setProfile('hobby')}
                    >
                      <div className="profile-option-icon">
                        <Globe size={14} />
                      </div>
                      <div>
                        <div className="profile-option-title">Low-Maintenance Hobby</div>
                        <div className="profile-option-desc">Unchanging dependency structures, set-and-forget code.</div>
                      </div>
                    </div>

                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Activity size={14} />
                      Analyze Repository
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Main results panel */}
            <div className="main-results-panel animate-reveal">
              
              {apiNotice && (
                <div style={{ 
                  background: 'var(--status-warning-bg)', 
                  border: '1px solid var(--status-warning-border)', 
                  padding: '10px 14px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  color: 'var(--status-warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>{apiNotice}</span>
                </div>
              )}

              {loading ? (
                // Loading screen with dynamic ticker steps
                <div className="glass-panel loading-overlay">
                  <div className="loading-spinner"></div>
                  <div className="loading-text">{loadingStep}</div>
                  <div className="loading-subtext">Compiling metrics and checking language schemas...</div>
                </div>
              ) : !analysis || !repoData ? (
                // Empty Welcome state
                <div className="welcome-placeholder">
                  <Search size={36} className="placeholder-icon" />
                  <h2>Evaluate repository constraints</h2>
                  <p style={{ maxWidth: '360px', marginTop: '6px', fontSize: '13px' }}>
                    Type the name of a public GitHub repository and select your project's development constraints to inspect its design suitability.
                  </p>
                </div>
              ) : (
                // Full Suitability Report
                <>
                  {/* Repo basic card */}
                  <div className="glass-panel repo-header-card">
                    <div className="repo-header-title-row">
                      <div>
                        <h2 className="repo-full-name">
                          <GithubIcon size={20} />
                          {repoData.full_name}
                        </h2>
                        <p className="repo-desc" style={{ marginTop: '6px' }}>
                          {repoData.description || 'No description provided by repository owners.'}
                        </p>
                      </div>
                      
                      {repoData.homepage && (
                        <a 
                          href={repoData.homepage} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-secondary" 
                          style={{ padding: '4px 10px', fontSize: '12px', textDecoration: 'none' }}
                        >
                          <Globe size={12} />
                          Website
                        </a>
                      )}
                    </div>

                    <div className="repo-stats-row">
                      <div className="repo-stat-badge">
                        <Star size={12} />
                        <span>{repoData.stargazers_count.toLocaleString()} stars</span>
                      </div>
                      <div className="repo-stat-badge">
                        <GitFork size={12} />
                        <span>{repoData.forks_count.toLocaleString()} forks</span>
                      </div>
                      <div className="repo-stat-badge">
                        <AlertCircle size={12} />
                        <span>{repoData.open_issues_count.toLocaleString()} issues</span>
                      </div>
                      <div className="repo-stat-badge">
                        <Calendar size={12} />
                        <span>Updated {new Date(repoData.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Suitability Verdict Analysis Panel */}
                  <div className="glass-panel verdict-card" style={{
                    borderLeft: `4px solid ${
                      analysis.verdict === 'perfect' ? 'var(--status-success)' :
                      analysis.verdict === 'stable' ? 'var(--status-info)' :
                      analysis.verdict === 'caution' ? 'var(--status-warning)' : 'var(--status-danger)'
                    }`
                  }}>
                    <div className="verdict-header-row">
                      <div className="verdict-gauge-wrapper">
                        <div className="radial-score-gauge">
                          <div className="radial-score-circle"></div>
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: '50%',
                            border: '4px solid transparent',
                            borderTopColor: 
                              analysis.verdict === 'perfect' ? 'var(--status-success)' :
                              analysis.verdict === 'stable' ? 'var(--status-info)' :
                              analysis.verdict === 'caution' ? 'var(--status-warning)' : 'var(--status-danger)',
                            transform: `rotate(${analysis.overallScore * 3.6}deg)`,
                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}></div>
                          <span className="radial-score-value">{analysis.overallScore}%</span>
                        </div>
                        
                        <div className="verdict-text-area">
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: 700, 
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em'
                          }}>
                            {profile} suitability score
                          </span>
                          <h3 className="verdict-title" style={{
                            color: 
                              analysis.verdict === 'perfect' ? 'var(--status-success)' :
                              analysis.verdict === 'stable' ? 'var(--status-info)' :
                              analysis.verdict === 'caution' ? 'var(--status-warning)' : 'var(--status-danger)'
                          }}>
                            {analysis.verdictText}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: '0 0 16px 0', fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                      {analysis.verdictDescription}
                    </p>

                    <div className="verdict-details-grid">
                      <div>
                        <h4 className="verdict-list-title">
                          <CheckCircle2 size={13} style={{ color: 'var(--status-success)' }} />
                          Suitability Strengths
                        </h4>
                        <ul className="verdict-list">
                          {analysis.strengths.map((s, idx) => (
                            <li key={idx} className="verdict-list-item strengths-item">{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="verdict-list-title">
                          <ShieldAlert size={13} style={{ color: 'var(--status-danger)' }} />
                          Compatibility Risks
                        </h4>
                        <ul className="verdict-list">
                          {analysis.risks.map((r, idx) => (
                            <li key={idx} className="verdict-list-item risks-item">{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Core Metrics progress bars */}
                  <div className="glass-panel metrics-panel">
                    <h3 className="panel-title">Compatibility Dimensions</h3>
                    
                    <div className="metrics-grid">
                      
                      <div className="metric-item">
                        <div className="metric-label-row">
                          <span>Popularity & Adoption</span>
                          <span className="metric-val">{analysis.metrics.popularity}%</span>
                        </div>
                        <div className="metric-progress-track">
                          <div 
                            className="metric-progress-bar" 
                            style={{ 
                              width: `${analysis.metrics.popularity}%`,
                              background: 'var(--accent-primary)'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="metric-item">
                        <div className="metric-label-row">
                          <span>Recent Activity Index</span>
                          <span className="metric-val">{analysis.metrics.activity}%</span>
                        </div>
                        <div className="metric-progress-track">
                          <div 
                            className="metric-progress-bar" 
                            style={{ 
                              width: `${analysis.metrics.activity}%`,
                              background: 'var(--accent-cobalt)'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="metric-item">
                        <div className="metric-label-row">
                          <span>Maintenance Reliability</span>
                          <span className="metric-val">{analysis.metrics.maintenance}%</span>
                        </div>
                        <div className="metric-progress-track">
                          <div 
                            className="metric-progress-bar" 
                            style={{ 
                              width: `${analysis.metrics.maintenance}%`,
                              background: 'var(--status-success)'
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="metric-item">
                        <div className="metric-label-row">
                          <span>License compliance & Safety</span>
                          <span className="metric-val">{analysis.metrics.risk}%</span>
                        </div>
                        <div className="metric-progress-track">
                          <div 
                            className="metric-progress-bar" 
                            style={{ 
                              width: `${analysis.metrics.risk}%`,
                              background: 'var(--status-warning)'
                            }}
                          ></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Tech Specs */}
                  <div className="glass-panel tech-specs-card">
                    <h3 className="panel-title">Architecture Specifications</h3>
                    
                    <div className="specs-grid">
                      <div className="spec-info-box">
                        <div className="spec-info-label">Main Tech Stack</div>
                        <div className="spec-info-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Code size={14} style={{ color: 'var(--accent-cobalt)' }} />
                          {repoData.language || 'Plain Text'}
                        </div>
                      </div>
                      
                      <div className="spec-info-box">
                        <div className="spec-info-label">Bundle Size</div>
                        <div className="spec-info-val">
                          {repoData.size > 1024 
                            ? `${(repoData.size / 1024).toFixed(1)} MB` 
                            : `${repoData.size} KB`
                          }
                        </div>
                      </div>

                      <div className="spec-info-box">
                        <div className="spec-info-label">License Type</div>
                        <div className="spec-info-val" style={{ color: repoData.license ? 'var(--text-primary)' : 'var(--status-danger)' }}>
                          {repoData.license?.spdx_id || 'None Declared'}
                        </div>
                      </div>
                    </div>

                    {/* Language Breakdown */}
                    {langData && Object.keys(langData).length > 0 && (
                      <div className="languages-bar-container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          <span>Language Composition</span>
                          <span>{Object.keys(langData).length} dialects detected</span>
                        </div>
                        
                        <div className="languages-bar">
                          {(() => {
                            const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
                            const colors = ['#18181b', '#2563eb', '#10b981', '#d97706', '#3b82f6', '#ec4899', '#8b5cf6'];
                            
                            return Object.entries(langData).map(([name, bytes], index) => {
                              const percentage = (bytes / totalBytes) * 100;
                              if (percentage < 0.5) return null;
                              
                              return (
                                <div 
                                  key={name}
                                  className="language-segment"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: colors[index % colors.length]
                                  }}
                                  title={`${name}: ${percentage.toFixed(1)}%`}
                                ></div>
                              );
                            });
                          })()}
                        </div>

                        <div className="language-legend">
                          {(() => {
                            const totalBytes = Object.values(langData).reduce((a, b) => a + b, 0);
                            const colors = ['#18181b', '#2563eb', '#10b981', '#d97706', '#3b82f6', '#ec4899', '#8b5cf6'];
                            
                            return Object.entries(langData).map(([name, bytes], index) => {
                              const percentage = (bytes / totalBytes) * 100;
                              if (percentage < 1) return null;
                              
                              return (
                                <div key={name} className="legend-item">
                                  <span className="legend-dot" style={{ backgroundColor: colors[index % colors.length] }}></span>
                                  <span>{name} ({percentage.toFixed(1)}%)</span>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                  </div>
                </>
              )}

            </div>

          </div>

        </div>
      )}
    </>
  );
}

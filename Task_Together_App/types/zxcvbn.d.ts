declare module 'zxcvbn' {
  interface ZxcvbnResult {
    score: number;
    feedback: {
      warning: string;
      suggestions: string[];
    };
  }

  function zxcvbn(password: string): ZxcvbnResult;
  export default zxcvbn;
} 
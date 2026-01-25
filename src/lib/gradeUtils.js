/**
 * Grade calculation utilities for GPA system
 * Uses standard 4.0 scale grading system
 */

// Grade scale configuration
const GRADE_SCALE = [
  { min: 90, max: 100, letter: 'A+', gpa: 4.0 },
  { min: 85, max: 89.99, letter: 'A', gpa: 4.0 },
  { min: 80, max: 84.99, letter: 'A-', gpa: 3.7 },
  { min: 75, max: 79.99, letter: 'B+', gpa: 3.3 },
  { min: 70, max: 74.99, letter: 'B', gpa: 3.0 },
  { min: 65, max: 69.99, letter: 'B-', gpa: 2.7 },
  { min: 60, max: 64.99, letter: 'C+', gpa: 2.3 },
  { min: 55, max: 59.99, letter: 'C', gpa: 2.0 },
  { min: 50, max: 54.99, letter: 'C-', gpa: 1.7 },
  { min: 45, max: 49.99, letter: 'D+', gpa: 1.3 },
  { min: 40, max: 44.99, letter: 'D', gpa: 1.0 },
  { min: 0, max: 39.99, letter: 'F', gpa: 0.0 },
];

/**
 * Calculate percentage from marks
 * @param {number} marks - Obtained marks
 * @param {number} totalMarks - Total marks
 * @returns {number} Percentage rounded to 2 decimal places
 */
export function calculatePercentage(marks, totalMarks) {
  if (totalMarks === 0) return 0;
  return Math.round((marks / totalMarks) * 100 * 100) / 100;
}

/**
 * Get letter grade from percentage
 * @param {number} percentage - Percentage value
 * @returns {string} Letter grade
 */
export function getLetterGrade(percentage) {
  const grade = GRADE_SCALE.find(g => percentage >= g.min && percentage <= g.max);
  return grade ? grade.letter : 'F';
}

/**
 * Get GPA from percentage
 * @param {number} percentage - Percentage value
 * @returns {number} GPA on 4.0 scale
 */
export function getGPA(percentage) {
  const grade = GRADE_SCALE.find(g => percentage >= g.min && percentage <= g.max);
  return grade ? grade.gpa : 0.0;
}

/**
 * Calculate all grade details from marks
 * @param {number} marks - Obtained marks
 * @param {number} totalMarks - Total marks
 * @returns {object} Object containing percentage, letterGrade, and gpa
 */
export function calculateGradeDetails(marks, totalMarks = 100) {
  const percentage = calculatePercentage(marks, totalMarks);
  const letterGrade = getLetterGrade(percentage);
  const gpa = getGPA(percentage);

  return {
    percentage,
    letterGrade,
    gpa,
  };
}

/**
 * Calculate CGPA from grades with credit hours weighting
 * @param {Array} grades - Array of grade objects with gpa and creditHours
 * @returns {object} Object containing cgpa, totalCredits, totalQualityPoints
 */
export function calculateCGPA(grades) {
  if (!grades || grades.length === 0) {
    return {
      cgpa: 0,
      totalCredits: 0,
      totalQualityPoints: 0,
    };
  }

  let totalQualityPoints = 0;
  let totalCredits = 0;

  for (const grade of grades) {
    const creditHours = grade.enrollment?.subject?.creditHours || grade.creditHours || 3;
    const gpa = grade.gpa || 0;

    totalQualityPoints += gpa * creditHours;
    totalCredits += creditHours;
  }

  const cgpa = totalCredits > 0 ? Math.round((totalQualityPoints / totalCredits) * 100) / 100 : 0;

  return {
    cgpa,
    totalCredits,
    totalQualityPoints: Math.round(totalQualityPoints * 100) / 100,
  };
}

/**
 * Calculate semester GPA
 * @param {Array} grades - Array of grade objects for a specific semester
 * @returns {object} Semester GPA details
 */
export function calculateSemesterGPA(grades) {
  return calculateCGPA(grades);
}

/**
 * Get grade classification based on CGPA
 * @param {number} cgpa - Cumulative GPA
 * @returns {string} Classification (Distinction, First Class, etc.)
 */
export function getGradeClassification(cgpa) {
  if (cgpa >= 3.7) return 'Distinction';
  if (cgpa >= 3.3) return 'First Class';
  if (cgpa >= 3.0) return 'Second Class Upper';
  if (cgpa >= 2.5) return 'Second Class Lower';
  if (cgpa >= 2.0) return 'Third Class';
  if (cgpa >= 1.0) return 'Pass';
  return 'Fail';
}

/**
 * Check if grade is passing
 * @param {number} gpa - Grade point
 * @returns {boolean} True if passing (GPA >= 1.0)
 */
export function isPassing(gpa) {
  return gpa >= 1.0;
}

/**
 * Format GPA for display
 * @param {number} gpa - GPA value
 * @returns {string} Formatted GPA string
 */
export function formatGPA(gpa) {
  return gpa.toFixed(2);
}

/**
 * Get grade color class for UI display
 * @param {string} letterGrade - Letter grade
 * @returns {string} Tailwind CSS color class
 */
export function getGradeColorClass(letterGrade) {
  if (!letterGrade) return 'text-gray-400';

  if (letterGrade.startsWith('A')) return 'text-green-400';
  if (letterGrade.startsWith('B')) return 'text-blue-400';
  if (letterGrade.startsWith('C')) return 'text-yellow-400';
  if (letterGrade.startsWith('D')) return 'text-orange-400';
  return 'text-red-400';
}

/**
 * Get grade background color class for UI display
 * @param {string} letterGrade - Letter grade
 * @returns {string} Tailwind CSS background color class
 */
export function getGradeBgClass(letterGrade) {
  if (!letterGrade) return 'bg-gray-700';

  if (letterGrade.startsWith('A')) return 'bg-green-900/30';
  if (letterGrade.startsWith('B')) return 'bg-blue-900/30';
  if (letterGrade.startsWith('C')) return 'bg-yellow-900/30';
  if (letterGrade.startsWith('D')) return 'bg-orange-900/30';
  return 'bg-red-900/30';
}

export { GRADE_SCALE };

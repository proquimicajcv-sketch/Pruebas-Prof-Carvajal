export type StandardAcademicLevel = 7 | 8 | 9 | 10;
export type AcademicLevel = StandardAcademicLevel | '10-bio' | '10-quim-isa';

export type ExamSectionId =
  | 'selection'
  | 'matching'
  | 'completes'
  | 'development'
  | 'bonus';

export type BiologyModuleId = 'mod1' | 'mod2' | 'mod3';

export type IsabellaSectionId =
  | 'selection'
  | 'matching1'
  | 'matching2'
  | 'completes'
  | 'development'
  | 'bonus';

export interface SelectionQuestion {
  q: string;
  options: string[];
  correct: number;
}

export interface MatchingItem {
  concept: string;
  options: string[];
  correctIndex: number;
}

export interface CompleteItem {
  prompt: string;
  answer: string;
}

export interface DevelopmentQuestion {
  q: string;
  value: number;
}

export interface DevelopmentSection {
  text: string;
  questions: DevelopmentQuestion[];
}

export interface BonusQuestion {
  q: string;
  value: number;
}

export interface LevelExamConfig {
  level: 7 | 8 | 9 | 10;
  title: string;
  shortLabel: string;
  themeColor: string;
  accentBgClass: string;
  accentTextClass: string;
  selection: SelectionQuestion[];
  matching: MatchingItem[];
  completes: CompleteItem[];
  development: DevelopmentSection;
  bonus: BonusQuestion;
}

export interface BiologySubQuestion {
  id: string;
  label: 'a' | 'b' | 'c';
  prompt: string;
  value: number;
}

export interface BiologyQuestion {
  number: number;
  title: string;
  subquestions: BiologySubQuestion[];
}

export interface BiologyModule {
  id: BiologyModuleId;
  tabLabel: string;
  title: string;
  subtitle: string;
  imagePath: string;
  imageAlt: string;
  imageCaption: string;
  questions: BiologyQuestion[];
}

export interface BiologyExamConfig {
  level: '10-bio';
  title: string;
  subtitle: string;
  themeColor: string;
  unlockAtIso: string;
  modules: BiologyModule[];
}

export interface IsabellaCompleteItem {
  prompt: string;
  answer: string;
  acceptableAnswers: string[];
}

export interface IsabellaExamImage {
  path: string;
  alt: string;
  caption: string;
}

export interface IsabellaExamConfig {
  level: '10-quim-isa';
  title: string;
  subtitle: string;
  themeColor: string;
  images: {
    optics: IsabellaExamImage;
    renewable: IsabellaExamImage;
    comparison: IsabellaExamImage;
  };
  selection: SelectionQuestion[];
  matching1: MatchingItem[];
  matching2: MatchingItem[];
  completes: IsabellaCompleteItem[];
  development: {
    context: string;
    question: string;
    hint: string;
    value: number;
  };
  bonus: {
    question: string;
    hint: string;
    value: number;
  };
}

export interface StudentSession {
  email: string;
  name: string;
  level: AcademicLevel;
}

export interface UserAnswers {
  selection: Record<number, number>;
  matching: Record<number, number | ''>;
  matching2?: Record<number, number | ''>;
  completes: Record<number, string>;
  development: Record<number, string>;
  bonus: string;
  biology?: Record<string, string>;
}

export type SectionSubmittedMap = Record<ExamSectionId, boolean>;
export type BiologySubmittedMap = Record<BiologyModuleId, boolean>;
export type IsabellaSubmittedMap = Record<IsabellaSectionId, boolean>;

export interface InfractionEvent {
  timestamp: string;
  reason: string;
}

export interface ExamGradeBreakdown {
  selection: number;
  selectionTotal: number;
  matching: number;
  matchingTotal: number;
  matching2?: number;
  matching2Total?: number;
  completes: number;
  completesTotal: number;
  development: number;
  developmentTotal: number;
  developmentDetails: number[];
  bonus: number;
  bonusTotal: number;
  biologyEarned?: number;
  biologyTotal?: number;
  biologyDetails?: Record<string, number>;
  baseEarned: number;
  baseTotal: number;
  totalEarnedWithBonus: number;
  finalPercentage: number;
}

export interface StoredSubmission {
  id: string;
  student: StudentSession;
  submittedAt: string;
  answers: UserAnswers;
  infractions: InfractionEvent[];
  lockedOut: boolean;
  objectiveScore: {
    selection: number;
    selectionTotal: number;
    matching: number;
    matchingTotal: number;
    completes: number;
    completesTotal: number;
    totalEarned: number;
    totalPossible: number;
  };
  gradeBreakdown?: ExamGradeBreakdown;
}

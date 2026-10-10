import type { MaterialType, Tier, JobStatus } from "../api/types";

export type ActivePage = "create" | "creations";

export type ContentKind = "image" | "worksheet" | "flashcards" | "poster";

export interface ContentKindOption {
  kind: ContentKind;
  materialType: MaterialType;
  title: string;
  badge: string;
  description: string;
  defaultTier: Tier;
  defaultSteps: number;
}

export interface SampleCreation {
  id: string;
  title: string;
  kind: ContentKind;
  materialType: MaterialType;
  status: JobStatus;
  tier: Tier;
  steps: number;
  createdAt: string;
  pageCount: number;
  neurons: number;
  baselineNeurons: number;
  costUsd: number;
  baselineCostUsd: number;
  savingPercent: number;
  reused: boolean;
  previewDescription: string;
}

export interface SessionCreation {
  planId: string;
  title: string;
  kind: ContentKind;
  materialType: MaterialType;
  tier: Tier;
  steps: number;
  createdAt: string;
  pageCount: number;
  status: "complete" | "partial" | "failed" | "processing";
  jobs: import("../api/types").Job[];
  estimate: import("../api/types").ResourceEstimate;
  pdfDownloadUrl?: string | null;
}

export interface ImageFormValues {
  prompt: string;
  size: "Square (1:1)" | "Portrait (2:3)" | "Landscape (3:2)" | "A4 Portrait" | "A4 Landscape";
  style: "color" | "outline" | "auto";
  count: number;
}

export interface WorksheetFormValues {
  topic: string;
  activityType: "Colouring" | "Tracing" | "Matching" | "Fill in the blanks" | "Quiz";
  pageCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  paperSize: "A4" | "Letter";
}

export interface FlashcardsFormValues {
  topic: string;
  category: "Animals" | "Fruits & Vegetables" | "Numbers & Counting" | "Alphabet & Phonics" | "General Vocabulary" | "Custom";
  cardCount: number;
  layout: "Picture + word" | "Word only" | "Picture only";
  language: string;
  learnerLevel: "Early Years" | "Primary" | "Intermediate";
}

export interface PosterFormValues {
  topic: string;
  title: string;
  keyPoints: string;
  size: "A3" | "A4" | "Custom";
  orientation: "Portrait" | "Landscape";
  visualStyle: "Educational illustration" | "Minimal / Clean infographic" | "Colourful & Vibrant";
}

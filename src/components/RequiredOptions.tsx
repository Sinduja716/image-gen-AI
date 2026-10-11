import React, { useState, useEffect } from 'react';
import type { OutputCategory, AgeGroup } from '../types';
import { ArrowLeft, BookOpen, Image as ImageIcon, Layout, Layers } from 'lucide-react';

interface RequiredOptionsProps {
  prompt: string;
  initialCategory?: OutputCategory;
  initialAgeGroup?: AgeGroup;
  initialQuantity: number;
  onBack: () => void;
  onSubmit: (category: OutputCategory, ageGroup: AgeGroup, quantity: number) => void;
}

const CATEGORIES: { label: OutputCategory; desc: string; icon: React.ReactNode }[] = [
  { label: 'Posters', desc: 'Educational posters, visual summaries, and classroom displays.', icon: <Layout size={24} /> },
  { label: 'Flashcards', desc: 'Learning and revision cards.', icon: <Layers size={24} /> },
  { label: 'Worksheets', desc: 'Educational exercises and printable learning pages.', icon: <BookOpen size={24} /> },
  { label: 'Images', desc: 'General educational illustrations and learning visuals.', icon: <ImageIcon size={24} /> },
];

const DEFAULT_DIMENSIONS: Record<OutputCategory, { width: number, height: number, preset: string, aspectRatio: string }> = {
  Posters: { width: 2480, height: 3508, preset: 'A4 Portrait', aspectRatio: '1:1.414' },
  Flashcards: { width: 1200, height: 1600, preset: '3:4 Portrait', aspectRatio: '3:4' },
  Worksheets: { width: 2480, height: 3508, preset: 'A4 Portrait', aspectRatio: '1:1.414' },
  Images: { width: 1536, height: 1024, preset: '3:2 Landscape', aspectRatio: '3:2' }
};

const AGE_GROUPS: AgeGroup[] = [
  '3-5',
  '6-8',
  '9-11',
  '12-14',
  '15-18'
];

export function RequiredOptions({
  prompt,
  initialCategory,
  initialAgeGroup,
  initialQuantity,
  onBack,
  onSubmit
}: RequiredOptionsProps) {
  const [category, setCategory] = useState<OutputCategory | undefined>(initialCategory);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | undefined>(initialAgeGroup);
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  useEffect(() => {
    if (category) {
      if (category === 'Flashcards' && quantity === 1 && !initialCategory) {
        setQuantity(6);
      }
    }
  }, [category]);

  const getQuantityLabel = () => {
    switch (category) {
      case 'Posters': return 'Number of posters';
      case 'Flashcards': return 'Number of flashcards';
      case 'Worksheets': return 'Number of worksheet pages';
      case 'Images': return 'Number of images';
      default: return 'Quantity';
    }
  };

  const handleDecrease = () => setQuantity(q => Math.max(1, q - 1));
  const handleIncrease = () => setQuantity(q => Math.min(20, q + 1));

  const isValid = category && ageGroup && quantity > 0;

  return (
    <div className="workspace animate-fade-in">
      <div className="container">
        
        <div className="compact-summary">
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Your Request</span>
            <p>"{prompt}"</p>
          </div>
          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }} onClick={onBack}>
            Edit
          </button>
        </div>

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>Configure Details</h2>

        <div className="form-group">
          <label className="form-label">1. Output Category *</label>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <div 
                key={cat.label} 
                className={`category-card ${category === cat.label ? 'selected' : ''}`}
                onClick={() => setCategory(cat.label)}
              >
                <div className="category-icon">{cat.icon}</div>
                <div className="category-title">{cat.label}</div>
                <p className="category-desc">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">2. Target Age Group *</label>
          <select 
            className="select-input" 
            value={ageGroup || ''} 
            onChange={e => setAgeGroup(e.target.value as AgeGroup)}
            required
          >
            <option value="" disabled>Select an age group...</option>
            {AGE_GROUPS.map(age => (
              <option key={age} value={age}>{age}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">3. {getQuantityLabel()} *</label>
          <div className="stepper">
            <button className="stepper-btn" onClick={handleDecrease} disabled={quantity <= 1}>-</button>
            <div className="stepper-value">{quantity}</div>
            <button className="stepper-btn" onClick={handleIncrease} disabled={quantity >= 20}>+</button>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Set the required {getQuantityLabel().toLowerCase()}.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={18} />
            Back
          </button>
          <button 
            className="btn btn-primary" 
            disabled={!isValid}
            onClick={() => {
              if (category && ageGroup) {
                onSubmit(category, ageGroup, quantity);
              }
            }}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

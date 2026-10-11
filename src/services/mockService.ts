import type { CreationSession, ImageResult, GlobalMetrics, SessionMetrics, UserPreferences } from '../types';

// Mock database
let sessions: CreationSession[] = [];
let savedImages: { id: string; url: string; title: string; category: string; date: string }[] = [];
let preferences: UserPreferences = {
  theme: 'System',
  density: 'Comfortable',
  defaultOrientation: 'Portrait',
  defaultQuantity: 1,
  showCostEstimates: true,
  defaultDownloadFormat: 'JPG',
  defaultExportSize: 'A4'
};

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  async getSessions(): Promise<CreationSession[]> {
    await delay(300);
    return [...sessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async saveSession(session: CreationSession): Promise<void> {
    const idx = sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    
    // Also save completed images to library
    session.images.forEach(img => {
      if (img.status === 'Completed' && img.url) {
        if (!savedImages.find(s => s.id === img.id)) {
          savedImages.push({
            id: img.id,
            url: img.url,
            title: session.prompt,
            category: session.category || '',
            date: session.timestamp,
          });
        }
      }
    });
  },

  async deleteSession(id: string): Promise<void> {
    await delay(300);
    sessions = sessions.filter(s => s.id !== id);
  },

  async renameSession(id: string, newTitle: string): Promise<void> {
    await delay(300);
    const s = sessions.find(s => s.id === id);
    if (s) {
      s.title = newTitle;
    }
  },

  async processImages(
    sessionId: string,
    prompt: string,
    quantity: number,
    onProgress: (images: ImageResult[]) => void
  ): Promise<SessionMetrics> {
    let images: ImageResult[] = Array(quantity).fill(null).map((_, i) => ({
      id: `${sessionId}-img-${i}`,
      status: 'Ready',
      isRetrieved: false
    }));

    onProgress([...images]);

    let reusedCount = 0;
    let generatedCount = 0;

    for (let i = 0; i < quantity; i++) {
      // 1. Checking library
      images[i].status = 'Checking';
      onProgress([...images]);
      await delay(800);

      // Deterministic logic: if prompt contains "dog", we mock finding an existing image
      const isDog = prompt.toLowerCase().includes('dog');
      // If it's the 3rd image, we mock a failure just to show mixed status
      const willFail = i === 2;

      if (isDog && !willFail) {
        images[i].status = 'Found';
        images[i].isRetrieved = true;
        images[i].url = `https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80`;
        onProgress([...images]);
        await delay(500);
        images[i].status = 'Completed';
        reusedCount++;
      } else {
        // Not found, generating
        images[i].status = 'Generating';
        onProgress([...images]);
        await delay(1500);

        if (willFail) {
          images[i].status = 'Failed';
          images[i].errorMessage = 'Failed to generate image. Please try again.';
        } else {
          images[i].status = 'Completed';
          images[i].url = `https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80`;
          generatedCount++;
        }
      }
      onProgress([...images]);
    }

    return {
      requested: quantity,
      reused: reusedCount,
      generated: generatedCount,
      resourceUsage: `${(generatedCount * 0.15).toFixed(2)} kWh`,
      estimatedCost: `$${(generatedCount * 0.05).toFixed(2)}`,
      savings: `$${(reusedCount * 0.05).toFixed(2)}`,
    };
  },

  async getGlobalMetrics(): Promise<GlobalMetrics> {
    await delay(300);
    
    let totalReq = 0, totalGen = 0, totalReuse = 0;
    sessions.forEach(s => {
      if (s.metrics) {
        totalReq += s.metrics.requested;
        totalGen += s.metrics.generated;
        totalReuse += s.metrics.reused;
      }
    });

    const cost = totalGen * 0.05;
    const costSaved = totalReuse * 0.05;
    const resSaved = totalReuse * 0.15;
    
    const percentage = totalReq > 0 ? ((totalReuse / totalReq) * 100).toFixed(0) : '0';

    return {
      totalRequested: totalReq,
      totalGenerated: totalGen,
      totalReused: totalReuse,
      totalResourceUsage: `${(totalGen * 0.15).toFixed(2)} kWh`,
      totalCost: `$${cost.toFixed(2)}`,
      totalResourceSaved: `${resSaved.toFixed(2)} kWh`,
      totalCostSaved: `$${costSaved.toFixed(2)}`,
      savingsPercentage: `${percentage}%`
    };
  },

  async getSavedImages() {
    await delay(400);
    return [...savedImages];
  },

  async getPreferences(): Promise<UserPreferences> {
    await delay(200);
    return { ...preferences };
  },

  async savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    await delay(300);
    preferences = { ...preferences, ...prefs };
  },

  async clearAllSessions(): Promise<void> {
    await delay(400);
    sessions = [];
  },

  async clearSavedImages(): Promise<void> {
    await delay(400);
    savedImages = [];
  }
};

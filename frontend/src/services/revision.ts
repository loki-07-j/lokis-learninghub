import api from './api';

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type RevisionRating = 'HARD' | 'MEDIUM' | 'EASY';

export interface RevisionCard {
  id: string;
  deck_id: string;
  question: string;
  answer: string;
  tip: string | null;
  tags: string[] | null;
  difficulty: DifficultyLevel;
  sort_order: number;
  user_rating?: RevisionRating | null;
}

export interface RevisionDeck {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  is_published: boolean;
  _count?: { cards: number };
}

export interface RevisionDeckWithCards extends RevisionDeck {
  cards: RevisionCard[];
}

export interface DeckProgress {
  total: number;
  reviewed: number;
  breakdown: { EASY: number; MEDIUM: number; HARD: number };
}

// ── User API ──────────────────────────────────────────────────────────────────
export const revisionService = {
  getDecks: async (params?: { category?: string }): Promise<RevisionDeck[]> => {
    const { data } = await api.get('/revision', { params });
    return data.decks;
  },

  getDeckCards: async (deckId: string): Promise<RevisionDeckWithCards> => {
    const { data } = await api.get(`/revision/${deckId}`);
    return data.deck;
  },

  getDeckProgress: async (deckId: string): Promise<DeckProgress> => {
    const { data } = await api.get(`/revision/${deckId}/progress`);
    return data;
  },

  rateCard: async (cardId: string, rating: RevisionRating): Promise<void> => {
    await api.post(`/revision/cards/${cardId}/rate`, { rating });
  },
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminRevisionService = {
  getAll: async (): Promise<(RevisionDeck & { _count: { cards: number } })[]> => {
    const { data } = await api.get('/revision/admin');
    return data.decks;
  },

  getOne: async (deckId: string): Promise<RevisionDeckWithCards> => {
    const { data } = await api.get(`/revision/admin/${deckId}`);
    return data.deck;
  },

  create: async (payload: { title: string; description?: string; category: string }): Promise<RevisionDeck> => {
    const { data } = await api.post('/revision/admin', payload);
    return data.deck;
  },

  update: async (deckId: string, payload: Partial<RevisionDeck>): Promise<RevisionDeck> => {
    const { data } = await api.put(`/revision/admin/${deckId}`, payload);
    return data.deck;
  },

  delete: async (deckId: string): Promise<void> => {
    await api.delete(`/revision/admin/${deckId}`);
  },

  addCard: async (deckId: string, payload: {
    question: string; answer: string; tip?: string;
    tags?: string[]; difficulty?: DifficultyLevel; sort_order?: number;
  }): Promise<RevisionCard> => {
    const { data } = await api.post(`/revision/admin/${deckId}/cards`, payload);
    return data.card;
  },

  updateCard: async (cardId: string, payload: Partial<RevisionCard>): Promise<RevisionCard> => {
    const { data } = await api.put(`/revision/admin/cards/${cardId}`, payload);
    return data.card;
  },

  deleteCard: async (cardId: string): Promise<void> => {
    await api.delete(`/revision/admin/cards/${cardId}`);
  },

  importDeck: async (deckData: object): Promise<RevisionDeck> => {
    const { data } = await api.post('/revision/admin/import', { deck: deckData });
    return data.deck;
  },

  exportDeck: async (deckId: string): Promise<object> => {
    const { data } = await api.get(`/revision/admin/${deckId}`);
    return data.deck;
  },
};

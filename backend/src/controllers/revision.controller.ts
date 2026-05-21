import { Request, Response } from 'express';
import prisma from '../utils/prisma';

// ── ADMIN: list all decks ─────────────────────────────────────────────────────
export const adminGetDecks = async (_req: Request, res: Response) => {
  try {
    const decks = await prisma.revisionDeck.findMany({
      include: { _count: { select: { cards: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json({ decks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
};

// ── ADMIN: get deck with cards ────────────────────────────────────────────────
export const adminGetDeck = async (req: Request, res: Response) => {
  try {
    const deck = await prisma.revisionDeck.findUnique({
      where: { id: req.params.deckId as string },
      include: { cards: { orderBy: { sort_order: 'asc' } } },
    });
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json({ deck });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
};

// ── ADMIN: create deck ────────────────────────────────────────────────────────
export const adminCreateDeck = async (req: Request, res: Response) => {
  const { title, description, category } = req.body;
  const userId = (req as any).userId;
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
    const deck = await prisma.revisionDeck.create({
      data: { title, slug, description, category, created_by: userId },
    });
    res.status(201).json({ deck });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create deck' });
  }
};

// ── ADMIN: update deck ────────────────────────────────────────────────────────
export const adminUpdateDeck = async (req: Request, res: Response) => {
  const { title, description, category, is_published } = req.body;
  try {
    const deck = await prisma.revisionDeck.update({
      where: { id: req.params.deckId as string },
      data: { title, description, category, is_published },
    });
    res.json({ deck });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update deck' });
  }
};

// ── ADMIN: delete deck ────────────────────────────────────────────────────────
export const adminDeleteDeck = async (req: Request, res: Response) => {
  try {
    await prisma.revisionDeck.delete({ where: { id: req.params.deckId as string } });
    res.json({ message: 'Deck deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete deck' });
  }
};

// ── ADMIN: add card ───────────────────────────────────────────────────────────
export const adminAddCard = async (req: Request, res: Response) => {
  const { question, answer, tip, tags, difficulty, sort_order } = req.body;
  try {
    const card = await prisma.revisionCard.create({
      data: { deck_id: req.params.deckId as string, question, answer, tip, tags, difficulty, sort_order: sort_order ?? 0 },
    });
    res.status(201).json({ card });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add card' });
  }
};

// ── ADMIN: update card ────────────────────────────────────────────────────────
export const adminUpdateCard = async (req: Request, res: Response) => {
  const { question, answer, tip, tags, difficulty, sort_order } = req.body;
  try {
    const card = await prisma.revisionCard.update({
      where: { id: req.params.cardId as string },
      data: { question, answer, tip, tags, difficulty, sort_order },
    });
    res.json({ card });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update card' });
  }
};

// ── ADMIN: delete card ────────────────────────────────────────────────────────
export const adminDeleteCard = async (req: Request, res: Response) => {
  try {
    await prisma.revisionCard.delete({ where: { id: req.params.cardId as string } });
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete card' });
  }
};

// ── ADMIN: import deck from JSON ──────────────────────────────────────────────
export const adminImportDeck = async (req: Request, res: Response) => {
  const { deck: deckData } = req.body;
  const userId = (req as any).userId;
  try {
    const slug = deckData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
    const created = await prisma.revisionDeck.create({
      data: {
        title: deckData.title, slug, description: deckData.description,
        category: deckData.category || 'General', created_by: userId,
        cards: {
          create: (deckData.cards || []).map((c: any, i: number) => ({
            question: c.question, answer: c.answer, tip: c.tip,
            tags: c.tags, difficulty: c.difficulty || 'BEGINNER', sort_order: i,
          })),
        },
      },
      include: { cards: true },
    });
    res.status(201).json({ deck: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import deck' });
  }
};

// ── USER: list published decks ────────────────────────────────────────────────
export const getPublishedDecks = async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const where: any = { is_published: true };
    if (category) where.category = category;
    const decks = await prisma.revisionDeck.findMany({
      where,
      select: { id: true, title: true, slug: true, description: true, category: true,
        is_published: true, _count: { select: { cards: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json({ decks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
};

// ── USER: get deck cards (with user progress overlay) ─────────────────────────
export const getDeckCards = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const deck = await prisma.revisionDeck.findFirst({
      where: { id: req.params.deckId as string, is_published: true },
      include: { cards: { orderBy: { sort_order: 'asc' } } },
    });
    if (!deck) return res.status(404).json({ error: 'Deck not found' });

    const progress = await prisma.userRevisionProgress.findMany({
      where: { user_id: userId, card_id: { in: deck.cards.map(c => c.id) } },
    });
    const progressMap = Object.fromEntries(progress.map(p => [p.card_id, p.rating]));

    const cards = deck.cards.map(c => ({ ...c, user_rating: progressMap[c.id] ?? null }));
    res.json({ deck: { ...deck, cards } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
};

// ── USER: rate a card (spaced repetition) ────────────────────────────────────
export const rateCard = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { rating } = req.body;
  try {
    const progress = await prisma.userRevisionProgress.upsert({
      where: { user_id_card_id: { user_id: userId, card_id: req.params.cardId as string } },
      update: { rating, reviewed_at: new Date() },
      create: { user_id: userId, card_id: req.params.cardId as string, rating },
    });
    res.json({ progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rate card' });
  }
};

// ── USER: get my deck progress summary ────────────────────────────────────────
export const getMyDeckProgress = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  try {
    const deckId = req.params.deckId as string;
    const deck = await prisma.revisionDeck.findFirst({
      where: { id: deckId, is_published: true },
      include: { _count: { select: { cards: true } } },
    });
    if (!deck) return res.status(404).json({ error: 'Deck not found' });

    const progress = await prisma.userRevisionProgress.findMany({
      where: { user_id: userId, card: { deck_id: deckId } },
    });
    const breakdown = { EASY: 0, MEDIUM: 0, HARD: 0 };
    progress.forEach(p => { breakdown[p.rating]++; });

    res.json({ total: deck._count.cards, reviewed: progress.length, breakdown });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
};

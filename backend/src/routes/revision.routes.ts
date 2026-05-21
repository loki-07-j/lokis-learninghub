import { Router } from 'express';
import * as revisionController from '../controllers/revision.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/rbac.middleware';

const router = Router();

// ── ADMIN routes ──────────────────────────────────────────────────────────────
router.get('/admin',                   authMiddleware, checkPermission('practice.manage'), revisionController.adminGetDecks);
router.post('/admin',                  authMiddleware, checkPermission('practice.manage'), revisionController.adminCreateDeck);
router.post('/admin/import',           authMiddleware, checkPermission('practice.manage'), revisionController.adminImportDeck);
router.get('/admin/:deckId',           authMiddleware, checkPermission('practice.manage'), revisionController.adminGetDeck);
router.put('/admin/:deckId',           authMiddleware, checkPermission('practice.manage'), revisionController.adminUpdateDeck);
router.delete('/admin/:deckId',        authMiddleware, checkPermission('practice.manage'), revisionController.adminDeleteDeck);
router.post('/admin/:deckId/cards',    authMiddleware, checkPermission('practice.manage'), revisionController.adminAddCard);
router.put('/admin/cards/:cardId',     authMiddleware, checkPermission('practice.manage'), revisionController.adminUpdateCard);
router.delete('/admin/cards/:cardId',  authMiddleware, checkPermission('practice.manage'), revisionController.adminDeleteCard);

// ── USER routes ───────────────────────────────────────────────────────────────
router.get('/',                        authMiddleware, revisionController.getPublishedDecks);
router.get('/:deckId',                 authMiddleware, revisionController.getDeckCards);
router.get('/:deckId/progress',        authMiddleware, revisionController.getMyDeckProgress);
router.post('/cards/:cardId/rate',     authMiddleware, revisionController.rateCard);

export default router;

import { Router } from 'express';
import { userController, dreamController, profileController } from '../controllers';
import authRoutes from './auth';

const router = Router();

router.use('/auth', authRoutes);

router.post('/users', userController.createOrUpdateUser);
router.get('/users/:userId', userController.getUser);

router.post('/dreams', dreamController.createDream);
router.get('/dreams/:userId', dreamController.getDreams);
router.get('/dream/detail/:dreamId', dreamController.getDream);
router.delete('/dreams/:dreamId', dreamController.deleteDream);

router.get('/profile/:userId', profileController.getProfile);
router.post('/profile/:userId/refresh', profileController.refreshProfile);
router.get('/profile/:userId/trends', profileController.getEmotionalTrends);

export default router;

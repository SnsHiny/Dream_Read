import { Router } from 'express';
import { sendSmsVerifyCode, checkSmsVerifyCode } from '../utils/aliyunSms';
import { saveBizId, getBizId, getMemoryStore, generateId } from '../utils/memoryStore';
import { mapUserFromDb } from '../controllers/index';
import { query } from '../utils/db';

const router = Router();
const memoryStore = getMemoryStore();

router.post('/send-code', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ success: false, error: '请输入手机号' });
  }

  try {
    // 调用阿里云号码认证服务发送验证码（由阿里云生成验证码）
    const bizId = await sendSmsVerifyCode(phoneNumber);
    
    // 存储 bizId 用于后续校验
    saveBizId(phoneNumber, bizId);
    
    res.json({ success: true, message: '验证码已发送' });
  } catch (error: any) {
    console.error('Send SMS error:', error);
    res.status(500).json({ success: false, error: error.message || '发送验证码失败' });
  }
});

router.post('/login', async (req, res) => {
  const { phoneNumber, code } = req.body;
  
  if (!phoneNumber || !code) {
    return res.status(400).json({ success: false, error: '请输入手机号和验证码' });
  }

  // 获取之前发送请求返回的 bizId
  const bizId = getBizId(phoneNumber);
  
  // 如果没有 bizId，说明验证码可能已过期或者未发送
  if (!bizId) {
    return res.status(400).json({ success: false, error: '验证码已过期或未发送，请重新获取' });
  }

  // 调用阿里云接口校验验证码
  const isValid = await checkSmsVerifyCode(phoneNumber, code, bizId);
  
  if (!isValid) {
     return res.status(400).json({ success: false, error: '验证码无效' });
  }

  try {
    let user;
    let userId;
    
    try {
      const result = await query<any>(
        'select * from users where phone_number = $1 limit 1',
        [phoneNumber]
      );
      user = result.rows[0];
    } catch (supabaseError) {
      console.warn('DB fetch failed, checking memory store', supabaseError);
    }

    // If not found in Supabase, check memory store
    if (!user) {
      user = Array.from(memoryStore.users.values()).find((u: any) => u.phoneNumber === phoneNumber || u.phone_number === phoneNumber);
    }

    if (!user) {
      // Create new user
      userId = generateId();
      const newUser = {
        id: userId,
        phone_number: phoneNumber, // Use snake_case for DB
        created_at: new Date().toISOString(),
        nickname: '', 
      };
      
      try {
        const created = await query<any>(
          'insert into users (id, phone_number, nickname, created_at, updated_at) values ($1, $2, $3, now(), now()) returning *',
          [userId, phoneNumber, '']
        );
        user = created.rows[0];
      } catch (supabaseError) {
        console.warn('DB create failed, using memory store', supabaseError);
        // Fallback to memory store
        user = {
          ...newUser,
          phoneNumber: phoneNumber, // Add camelCase alias
          _id: userId,
          createdAt: new Date(),
        };
        memoryStore.users.set(userId, user);
      }
    } else {
        // User exists, ensure memory store is synced (optional but good for consistency)
        memoryStore.users.set(user.id || user._id, user);
    }

    // Normalize user object for frontend (camelCase)
    const frontendUser = mapUserFromDb(user) || {
      ...user,
      id: user.id || user._id,
      phoneNumber: user.phone_number || user.phoneNumber,
      createdAt: user.created_at || user.createdAt,
      updatedAt: user.updated_at || user.updatedAt,
    };

    res.json({ success: true, user: frontendUser });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

export default router;

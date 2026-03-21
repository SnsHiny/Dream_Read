-- 2. 创建用户表 (users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE,
  nickname TEXT,
  gender TEXT,
  age INTEGER,
  occupation TEXT,
  family_environment TEXT,
  personal_goals TEXT,
  psychological_status TEXT,
  sleep_quality TEXT,
  stress_level TEXT,
  recent_mood TEXT,
  dream_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 创建梦境表 (dreams)
CREATE TABLE dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  input_type TEXT DEFAULT 'text',
  mood TEXT,
  tags JSONB,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建用户画像表 (profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  dream_themes JSONB,
  emotional_trends JSONB,
  profile_summary TEXT,
  archetype_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. 开启 Row Level Security (推荐，但后端使用 Service Role Key 会自动绕过)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. 创建简单的策略 (允许所有操作，仅供开发测试，生产环境请配置更严格的策略)
CREATE POLICY "Allow all for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for dreams" ON dreams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);

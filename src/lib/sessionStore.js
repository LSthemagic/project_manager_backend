import { pool } from '../config/database.js';

/**
 * Store de sessões persistente usando PostgreSQL
 * Resolve o problema de perda de sessões no Render quando o servidor reinicia
 */
export class PostgreSQLSessionStore {
  constructor() {
    this.initTables();
  }

  async initTables() {
    try {
      // Criar tabela de sessões se não existir
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(255) PRIMARY KEY,
          data TEXT NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);

      // Migrar colunas JSONB para TEXT se necessário
      try {
        await pool.query(`
          ALTER TABLE sessions
          ALTER COLUMN data TYPE TEXT USING data::TEXT
        `);
      } catch (migrationError) {
        // Ignore error if column is already TEXT type
        console.log('Session data column already TEXT or migration not needed');
      }

      // Criar índice para expiração
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)
      `);

      console.log('Session store tables initialized');

      // Limpar sessões expiradas e corrompidas ao inicializar
      this.cleanExpiredSessions();
      this.cleanCorruptedSessions();

      // Configurar limpeza automática a cada hora
      setInterval(() => {
        this.cleanExpiredSessions();
      }, 1000 * 60 * 60); // 1 hora

    } catch (error) {
      console.error('Error initializing session store:', error);
    }
  }

  async set(sessionId, sessionData, callback) {
    try {
      const expiresAt = new Date(Date.now() + (1000 * 60 * 60 * 24 * 30)); // 30 dias

      // Garantir que sessionData seja uma string JSON válida
      let dataToStore;
      try {
        // Se já for uma string, tentar fazer parse para validar
        if (typeof sessionData === 'string') {
          JSON.parse(sessionData); // Valida se é JSON válido
          dataToStore = sessionData;
        } else {
          // Se for objeto, converter para JSON
          dataToStore = JSON.stringify(sessionData);
        }
      } catch (parseError) {
        // Se não for JSON válido, criar um objeto válido
        console.warn('Invalid session data, creating fallback:', sessionData);
        dataToStore = JSON.stringify({
          fallback: true,
          originalType: typeof sessionData,
          timestamp: Date.now()
        });
      }

      await pool.query(`
        INSERT INTO sessions (id, data, expires_at, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          data = EXCLUDED.data,
          expires_at = EXCLUDED.expires_at,
          updated_at = NOW()
      `, [sessionId, dataToStore, expiresAt]);

      callback && callback();
    } catch (error) {
      console.error('Error saving session:', error);
      callback && callback(error);
    }
  }

  async get(sessionId, callback) {
    try {
      const result = await pool.query(`
        SELECT data, expires_at
        FROM sessions
        WHERE id = $1 AND expires_at > NOW()
      `, [sessionId]);

      if (result.rows.length === 0) {
        return callback && callback();
      }

      const session = result.rows[0];

      // Melhor tratamento de erro para parsing JSON
      let sessionData;
      try {
        // Verificar se os dados são válidos
        const rawData = session.data;

        // Se for string vazia ou nula, retornar vazio
        if (!rawData || rawData.trim() === '') {
          await this.destroy(sessionId);
          return callback && callback();
        }

        // Se começar com "[object Object]", é sessão corrompida
        if (typeof rawData === 'string' && rawData.startsWith('[object Object]')) {
          console.warn('Found corrupted session data starting with "[object Object]", removing:', sessionId);
          await this.destroy(sessionId);
          return callback && callback();
        }

        // Se data já for um objeto válido, usar diretamente
        if (typeof rawData === 'object' && rawData !== null) {
          sessionData = rawData;
        } else {
          // Se for string, fazer parse
          sessionData = JSON.parse(rawData);
        }
      } catch (parseError) {
        console.error('Error parsing session data:', {
          sessionId,
          rawData: session.data,
          dataType: typeof session.data,
          parseError: parseError.message
        });

        // Remover sessão corrompida
        await this.destroy(sessionId);
        return callback && callback();
      }

      callback && callback(null, sessionData);
    } catch (error) {
      console.error('Error retrieving session:', error);
      callback && callback(error);
    }
  }

  async destroy(sessionId, callback) {
    try {
      await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
      callback && callback();
    } catch (error) {
      console.error('Error destroying session:', error);
      callback && callback(error);
    }
  }

  async cleanExpiredSessions() {
    try {
      const result = await pool.query('DELETE FROM sessions WHERE expires_at <= NOW()');
      if (result.rowCount > 0) {
        console.log(`Cleaned ${result.rowCount} expired sessions`);
      }
    } catch (error) {
      console.error('Error cleaning expired sessions:', error);
    }
  }

  async cleanCorruptedSessions() {
    try {
      // Limpar sessões com dados corrompidos (começam com "[object Object]")
      const result = await pool.query(`
        DELETE FROM sessions
        WHERE data LIKE '[object Object]%'
           OR data = ''
           OR data IS NULL
           OR data = 'undefined'
           OR data = 'null'
      `);

      if (result.rowCount > 0) {
        console.log(`Cleaned ${result.rowCount} corrupted sessions`);
      }
    } catch (error) {
      console.error('Error cleaning corrupted sessions:', error);
    }
  }

  async getAllActiveSessions() {
    try {
      const result = await pool.query(`
        SELECT id, data, expires_at, created_at, updated_at
        FROM sessions
        WHERE expires_at > NOW()
        ORDER BY updated_at DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  async getSessionCount() {
    try {
      const result = await pool.query('SELECT COUNT(*) as count FROM sessions WHERE expires_at > NOW()');
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting session count:', error);
      return 0;
    }
  }
}
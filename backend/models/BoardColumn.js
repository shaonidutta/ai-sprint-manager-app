const database = require('../config/database');
const logger = require('../config/logger');

class BoardColumn {
  constructor(data = {}) {
    this.id = data.id;
    this.board_id = data.board_id;
    this.name = data.name;
    this.status_mapping = data.status_mapping;
    this.position = data.position;
    this.wip_limit = data.wip_limit;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Static methods for database operations
  static async findByBoardId(boardId) {
    try {
      const query = `
        SELECT * FROM board_columns 
        WHERE board_id = ? AND is_active = true 
        ORDER BY position ASC
      `;
      
      const rows = await database.query(query, [boardId]);
      return rows.map(row => new BoardColumn(row));
    } catch (error) {
      logger.error('Error finding board columns:', error);
      throw error;
    }
  }

  static async create(columnData) {
    try {
      const query = `
        INSERT INTO board_columns (
          board_id, name, status_mapping, position, wip_limit, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const values = [
        columnData.board_id,
        columnData.name,
        columnData.status_mapping,
        columnData.position,
        columnData.wip_limit || null
      ];
      
      const result = await database.query(query, values);
      return await BoardColumn.findById(result.insertId);
    } catch (error) {
      logger.error('Error creating board column:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = 'SELECT * FROM board_columns WHERE id = ? AND is_active = true';
      const rows = await database.query(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new BoardColumn(rows[0]);
    } catch (error) {
      logger.error('Error finding board column by ID:', error);
      throw error;
    }
  }

  static async createDefaultColumns(boardId) {
    try {
      const defaultColumns = [
        { name: 'To Do', status_mapping: 'To Do', position: 1 },
        { name: 'In Progress', status_mapping: 'In Progress', position: 2 },
        { name: 'Done', status_mapping: 'Done', position: 3 },
        { name: 'Blocked', status_mapping: 'Blocked', position: 4 }
      ];

      const createdColumns = [];
      for (const columnData of defaultColumns) {
        const column = await BoardColumn.create({
          board_id: boardId,
          ...columnData
        });
        createdColumns.push(column);
      }

      return createdColumns;
    } catch (error) {
      logger.error('Error creating default columns:', error);
      throw error;
    }
  }

  static async updatePositions(boardId, columnPositions) {
    try {
      const connection = await database.getConnection();
      await connection.beginTransaction();

      try {
        for (const { id, position } of columnPositions) {
          await connection.query(
            'UPDATE board_columns SET position = ?, updated_at = NOW() WHERE id = ? AND board_id = ?',
            [position, id, boardId]
          );
        }

        await connection.commit();
        return true;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      logger.error('Error updating column positions:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      if (this.id) {
        const query = `
          UPDATE board_columns SET 
            name = ?, status_mapping = ?, position = ?, 
            wip_limit = ?, is_active = ?, updated_at = NOW()
          WHERE id = ?
        `;
        
        const values = [
          this.name, this.status_mapping, this.position,
          this.wip_limit, this.is_active, this.id
        ];
        
        await database.query(query, values);
        return this;
      } else {
        throw new Error('Cannot save column without ID. Use BoardColumn.create() for new columns.');
      }
    } catch (error) {
      logger.error('Error saving board column:', error);
      throw error;
    }
  }

  async delete() {
    try {
      // Soft delete
      this.is_active = false;
      await this.save();
      return true;
    } catch (error) {
      logger.error('Error deleting board column:', error);
      throw error;
    }
  }

  async getIssueCount() {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM issues 
        WHERE board_id = ? AND status = ? AND deleted_at IS NULL
      `;
      
      const rows = await database.query(query, [this.board_id, this.status_mapping]);
      return rows[0].count;
    } catch (error) {
      logger.error('Error getting issue count for column:', error);
      throw error;
    }
  }

  async isWipLimitExceeded() {
    if (!this.wip_limit) {
      return false;
    }

    const currentCount = await this.getIssueCount();
    return currentCount >= this.wip_limit;
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      board_id: this.board_id,
      name: this.name,
      status_mapping: this.status_mapping,
      position: this.position,
      wip_limit: this.wip_limit,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = BoardColumn;

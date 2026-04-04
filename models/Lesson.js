const pool = require('../config/database');

class Lesson {
  static async create({ courseId, title, content, videoUrl, durationMinutes, orderIndex }) {
    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, content, video_url, duration_minutes, order_index) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [courseId, title, content, videoUrl, durationMinutes || 0, orderIndex || 0]
    );
    return result.rows[0];
  }

  static async findByCourse(courseId) {
    const result = await pool.query(
      `SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC`,
      [courseId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByCourseAndLesson(courseId, lessonId) {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE id = $1 AND course_id = $2',
      [lessonId, courseId]
    );
    return result.rows[0];
  }
}

module.exports = Lesson;

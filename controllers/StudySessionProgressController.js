const { StudySession, StudySessionProgress } = require('../models/StudySession');
const { successResponse, errorResponse } = require('../utils/response');

class StudySessionProgressController {
  static async getOrCreateProgress(userId, sessionId) {
    let progress = await StudySessionProgress.findOne({ user: userId, studySession: sessionId });
    
    if (!progress) {
      progress = new StudySessionProgress({
        user: userId,
        studySession: sessionId,
        progress: 0,
        lastPosition: 0,
        completed: false
      });
      await progress.save();
    }
    
    return progress;
  }

  static async updateProgress(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { progress, lastPosition } = req.body;
      const userId = req.user.id;

      const cleanProgress = typeof progress === 'number' && !isNaN(progress) ? Math.min(100, Math.max(0, Math.round(progress))) : 0;
      const cleanLastPosition = typeof lastPosition === 'number' && !isNaN(lastPosition) ? Math.round(lastPosition) : 0;

      console.log(`Saving progress for session ${sessionId}: progress=${cleanProgress}, lastPosition=${cleanLastPosition}`);

      let progressDoc = await StudySessionProgress.findOne({ user: userId, studySession: sessionId });
      
      if (!progressDoc) {
        progressDoc = new StudySessionProgress({
          user: userId,
          studySession: sessionId,
          progress: cleanProgress,
          lastPosition: cleanLastPosition,
          completed: cleanProgress >= 100
        });
      } else {
        progressDoc.progress = cleanProgress;
        progressDoc.lastPosition = cleanLastPosition;
        progressDoc.completed = cleanProgress >= 100;
      }
      
      await progressDoc.save();

      if (progressDoc.completed) {
        const session = await StudySession.findById(sessionId);
        if (session && !session.completedStudents.includes(userId)) {
          session.completedStudents.push(userId);
          await session.save();
        }
      }

      return successResponse(res, { progress: progressDoc }, 'Progress updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getProgress(req, res, next) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const progress = await StudySessionProgress.findOne({ user: userId, studySession: sessionId });
      
      if (!progress) {
        return successResponse(res, { progress: { progress: 0, lastPosition: 0, completed: false } }, 'No progress yet');
      }

      return successResponse(res, { progress }, 'Progress retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getMySessionProgress(req, res, next) {
    try {
      const userId = req.user.id;

      const progressList = await StudySessionProgress.find({ user: userId })
        .populate('studySession')
        .sort({ updatedAt: -1 });

      console.log('Found progress list:', progressList.length);

      const progressMap = {};
      progressList.forEach(p => {
        if (p.studySession) {
          const sessionId = p.studySession._id.toString();
          const cleanProgress = {
            progress: typeof p.progress === 'number' && !isNaN(p.progress) ? p.progress : 0,
            lastPosition: typeof p.lastPosition === 'number' && !isNaN(p.lastPosition) ? p.lastPosition : 0,
            completed: p.completed === true,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt
          };
          progressMap[sessionId] = cleanProgress;
        }
      });

      console.log('Progress map:', JSON.stringify(progressMap, null, 2));

      return successResponse(res, { progressMap }, 'Progress retrieved successfully');
    } catch (error) {
      console.error('Error in getMySessionProgress:', error);
      next(error);
    }
  }
}

module.exports = StudySessionProgressController;
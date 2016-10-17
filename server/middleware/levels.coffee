wrap = require 'co-express'
errors = require '../commons/errors'
Level = require '../models/Level'
LevelSession = require '../models/LevelSession'
CourseInstance = require '../models/CourseInstance'
Classroom = require '../models/Classroom'
Course = require '../models/Course'
database = require '../commons/database'

module.exports =
  upsertSession: wrap (req, res) ->
    level = yield database.getDocFromHandle(req, Level)
    if not level
      throw new errors.NotFound('Level not found.')
      
    sessionQuery =
      level:
        original: level.get('original').toString()
        majorVersion: level.get('version').major
      creator: req.user.id

    if req.query.team?
      sessionQuery.team = req.query.team
      
    if req.query.courseInstance
      courseInstance = yield CourseInstance.findById(req.query.courseInstance)
      if not courseInstance
        throw new errors.NotFound('Course Instance not found.')
      if not _.find(courseInstance.get('members'), (memberID) -> memberID.equals(req.user._id))
        throw new errors.Forbidden('You must be a member of the Course Instance.')
      classroom = yield Classroom.findById(courseInstance.get('classroomID'))
      if not classroom
        throw new errors.NotFound('Classroom not found.')
      language = classroom.get('aceConfig.language')
      if language
        sessionQuery.codeLanguage = language

    session = yield LevelSession.findOne(sessionQuery)
    if session
      return res.send(session.toObject({req: req}))
      
    attrs = sessionQuery
    _.extend(attrs, {
      state:
        complete: false
        scripts:
          currentScript: null # will not save empty objects
      permissions: [
        {target: req.user.id, access: 'owner'}
        {target: 'public', access: 'write'}
      ]
      codeLanguage: req.user.get('aceConfig')?.language ? 'python'
    })

    if level.get('type') in ['course', 'course-ladder'] or req.query.course?
      
      # Find the course and classroom that has assigned this level, verify access
      # Handle either being given the courseInstance, or having to deduce it
      if courseInstance and classroom
        courseInstances = [courseInstance]
        classrooms = [classroom]
      else
        courseInstances = yield CourseInstance.find({members: req.user._id})
        classroomIDs = (courseInstance.get('classroomID') for courseInstance in courseInstances)
        classroomIDs = _.filter _.uniq classroomIDs, false, (objectID='') -> objectID.toString()
        classrooms = yield Classroom.find({ _id: { $in: classroomIDs }})

      classroomWithLevel = null
      courseID = null
      classroomMap = {}
      classroomMap[classroom.id] = classroom for classroom in classrooms
      levelOriginal = level.get('original')
      for courseInstance in courseInstances
        classroomID = courseInstance.get('classroomID')
        continue unless classroomID
        classroom = classroomMap[classroomID.toString()]
        continue unless classroom
        courseID = courseInstance.get('courseID')
        classroomCourse = _.find(classroom.get('courses'), (c) -> c._id.equals(courseID))
        for courseLevel in classroomCourse.levels
          if courseLevel.original.equals(levelOriginal)
            classroomWithLevel = classroom
            break
        break if classroomWithLevel
      
      unless classroomWithLevel
        throw new errors.PaymentRequired('You must be in a course which includes this level to play it')
      
      course = yield Course.findById(courseID).select('free')
      unless course.get('free') or req.user.isEnrolled()
        throw new errors.PaymentRequired('You must be enrolled to access this content')
        
      lang = classroomWithLevel.get('aceConfig')?.language
      attrs.codeLanguage = lang if lang
      
    else
      requiresSubscription = level.get('requiresSubscription') or (req.user.isOnPremiumServer() and level.get('campaign') and not (level.slug in ['dungeons-of-kithgard', 'gems-in-the-deep', 'shadow-guard', 'forgetful-gemsmith', 'signs-and-portents', 'true-names']))
      canPlayAnyway = req.user.isPremium() or level.get 'adventurer'
      if requiresSubscription and not canPlayAnyway
        throw new errors.PaymentRequired('This level requires a subscription to play')
        
    session = new LevelSession(attrs)
    yield session.save()
    res.status(201).send(session.toObject({req: req}))

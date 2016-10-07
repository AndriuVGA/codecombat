_ = require 'lodash'
moment = require 'moment'

makeTasksResult = (total_results) ->
  return {
    total_results
    has_more: false
    data: []
  }

makeActivityResult = ({ auto1 }) ->
  activities = []
  if auto1
    activity = {
      to: ['teacher1@example.com']
      _type: 'Email'
      template_id: 'template_auto1' # TODO: Be less magical. (This is in createTeacherEmailTemplatesAuto1)
      date_created: moment().subtract(4, 'days').toDate()
    }
    if _.isObject(auto1)
      _.assign(activity, auto1)
    activities.push activity
  return {
    has_more: false
    data: activities
  }

makeLead = () ->
  return {
    id: 'lead_1'
    status_label: 'Auto Attempt 1'
  }

module.exports = {
  makeTasksResult
  makeActivityResult
  makeLead
}

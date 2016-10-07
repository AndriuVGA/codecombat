request = require 'request'
moment = require 'moment'
followupCloseIoLeads = require '../../../scripts/sales/followupCloseIoLeads'
factories = require './closeFactories'

describe '/scripts/sales/followupCloseIoLeads', ->
  beforeEach ->
    spyOn(request, 'getAsync')
    spyOn(request, 'putAsync')
    spyOn(request, 'postAsync')
    @contacts = {
      withEmails: { emails: [
        {
          type: 'office'
          email: 'Firstname.Lastname@example.com'
        }
        {
          type: 'office'
          email: 'firstname.middle.lastname@example.com'
        }
      ]}
      withPhones: { phones: [
        {
          phone: '+15551234567',
          phone_formatted: '+1 555-123-4567',
          type: 'office'
        }
        {
          phone: '+15551112222',
          phone_formatted: '+1 555-111-2222',
          type: 'office'
        }
      ]}
      withoutEmailOrPhone: {}
    }

  describe 'contactHasEmailAddress', ->
    it 'returns true if the contact has any email addresses', ->
      expect(followupCloseIoLeads.contactHasEmailAddress(factories.makeContact({withEmails: true}))).toBe(true)

    it 'returns false if the contact has no email addresses', ->
      expect(followupCloseIoLeads.contactHasEmailAddress(factories.makeContact())).toBe(false)

  describe 'contactHasPhoneNumbers', ->
    it 'returns true if the contact has any phone numbers', ->
      expect(followupCloseIoLeads.contactHasPhoneNumbers(factories.makeContact({withPhones: true}))).toBe(true)

    it 'returns false if the contact has no phone numbers', ->
      expect(followupCloseIoLeads.contactHasPhoneNumbers(factories.makeContact())).toBe(false)

  describe 'lowercaseEmailsForContact', ->
    it 'returns a list of email addresses all in lower case', ->
      correctResult = ['firstname.lastname@example.com', 'firstname.middle.lastname@example.com']
      expect(followupCloseIoLeads.lowercaseEmailsForContact(@contacts.withEmails)).toEqual(correctResult)

  describe 'general network requests', ->
    describe 'getJsonUrl', ->
      it 'calls request.getAsync with url and json: true', ->
        url = 'http://example.com/model/id'
        followupCloseIoLeads.getJsonUrl(url)
        expect(request.getAsync.calls.argsFor(0)).toEqual([{
          url: url,
          json: true
        }])

    describe 'postJsonUrl', ->

    describe 'putJsonUrl', ->

  describe 'Close.io API requests', ->
    beforeEach ->
      spyOn(followupCloseIoLeads, 'getJsonUrl')
      spyOn(followupCloseIoLeads, 'postJsonUrl')
      spyOn(followupCloseIoLeads, 'putJsonUrl')

    describe 'getSomeLeads', ->

    describe 'getEmailActivityForLead', ->

    describe 'getActivityForLead', ->

    describe 'postEmailActivity', ->

    describe 'postTask', ->

    describe 'sendMail', ->

    describe 'updateLeadStatus', ->

    describe 'shouldSendNextAutoEmail', ->
      it 'TODO'

    describe 'createSendFollowupMailFn', ->
      beforeEach ->
        spyOn(followupCloseIoLeads, 'sendMail')
        spyOn(followupCloseIoLeads, 'getTasksForLead').and.returnValue(factories.makeTasksResult(0))

      describe 'when we have sent an auto1 email', ->
        beforeEach ->
          spyOn(followupCloseIoLeads, 'isTemplateAuto1').and.returnValue(true)

        describe 'more than 3 days ago', ->
          beforeEach ->
            spyOn(followupCloseIoLeads, 'getActivityForLead').and.returnValue(factories.makeActivityResult({ auto1: true }))
            spyOn(followupCloseIoLeads, 'getRandomEmailTemplateAuto2').and.returnValue('template_auto2')
            spyOn(followupCloseIoLeads, 'updateLeadStatus')
            # spyOn(followupCloseIoLeads, '')

          describe "and they haven't responded to the first auto-email", ->
            it "sends a followup auto-email", (done) ->
              userApiKeyMap = {close_user_1: 'close_io_mail_key'}
              lead = factories.makeLead({ auto1: true })
              contactEmails = ['teacher1@example.com', 'teacher1.fullname@example.com']
              followupCloseIoLeads.createSendFollowupMailFn(userApiKeyMap, moment().subtract(3, 'days').toDate(), lead, contactEmails)( =>
                expect(followupCloseIoLeads.sendMail).toHaveBeenCalled()
                expect(followupCloseIoLeads.updateLeadStatus).toHaveBeenCalled()
                done()
              )

        describe 'in the last 3 days', ->
          beforeEach ->
            spyOn(followupCloseIoLeads, 'getActivityForLead').and.returnValue(factories.makeActivityResult({ auto1: { date_created: new Date() } }))
            spyOn(followupCloseIoLeads, 'getRandomEmailTemplateAuto2')
            spyOn(followupCloseIoLeads, 'updateLeadStatus').and.callFake

          it "doesn't send a followup email or update the lead's status", (done) ->
            userApiKeyMap = {close_user_1: 'close_io_mail_key'}
            lead = factories.makeLead({ auto1: true })
            contactEmails = ['teacher1@example.com', 'teacher1.fullname@example.com']
            followupCloseIoLeads.createSendFollowupMailFn(userApiKeyMap, moment().subtract(3, 'days'), lead, contactEmails)( =>
              expect(followupCloseIoLeads.sendMail).not.toHaveBeenCalled()
              expect(followupCloseIoLeads.updateLeadStatus).not.toHaveBeenCalled()
              done()
            )





    describe 'sendSecondFollowupMails', ->

    describe 'createAddCallTaskFn', ->

    describe 'addCallTasks', ->

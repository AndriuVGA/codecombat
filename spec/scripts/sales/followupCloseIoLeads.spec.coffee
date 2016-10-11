request = require 'request'
moment = require 'moment'
followupCloseIoLeads = require '../../../scripts/sales/followupCloseIoLeads'
factories = require './closeFactories'

describe '/scripts/sales/followupCloseIoLeads', ->
  beforeEach ->
    spyOn(request, 'getAsync')
    spyOn(request, 'putAsync')
    spyOn(request, 'postAsync')
    spyOn(followupCloseIoLeads, 'log')

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
      contactEmails = ['Firstname.Lastname@example.com', 'firstname.middle.lastname@example.com']
      lowercaseContactEmails = ['firstname.lastname@example.com', 'firstname.middle.lastname@example.com']
      expect(followupCloseIoLeads.lowercaseEmailsForContact(factories.makeContact({withEmails: contactEmails}))).toEqual(lowercaseContactEmails)

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
      beforeEach ->
        @lead = {id: 'lead_1'}
        @contact = factories.makeContact({ withEmails: 2 })

      describe "we haven't even sent them a first email", ->
        beforeEach ->
          spyOn(followupCloseIoLeads, 'getActivityForLead').and.returnValue(factories.makeActivityResult())

        it 'TODO', ->
          expect(followupCloseIoLeads.shouldSendNextAutoEmail(@lead, @contact)).toBe(false)

      describe "they haven't sent us any email", ->
        beforeEach ->
          spyOn(followupCloseIoLeads, 'getActivityForLead').and.returnValue(factories.makeActivityResult({ auto1: {to: [@contact.emails[0].email]}, they_replied: false }))

        it 'TODO', ->
          expect(followupCloseIoLeads.shouldSendNextAutoEmail(@lead, @contact)).toBe(true)

      describe "they have sent us an email", ->
        beforeEach ->
          spyOn(followupCloseIoLeads, 'getActivityForLead').and.returnValue(factories.makeActivityResult({ auto1: {to: [@contact.emails[0].email]}, they_replied: {to: ['sales_1@codecombat.com'], sender: "Some User <#{@contact.emails[0].email}>"} }))

        it 'TODO', ->
          expect(followupCloseIoLeads.shouldSendNextAutoEmail(@lead, @contact)).toBe(false)

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

          describe "and they haven't responded to the first auto-email", ->
            it "sends a followup auto-email", (done) ->
              userApiKeyMap = {close_user_1: 'close_io_mail_key_1'}
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
      beforeEach ->
        apiKeyMap = {
          'close_io_mail_key_1': 'close_user_1'
          'close_io_mail_key_2': 'close_user_2'
        }
        spyOn(followupCloseIoLeads, 'getUserIdByApiKey').and.callFake((key) -> apiKeyMap[key])
        spyOn(followupCloseIoLeads, 'getSomeLeads').and.returnValue(factories.makeLeadsResult())
        spyOn(followupCloseIoLeads, 'shouldSendNextAutoEmail').and.returnValue(true)
        spyOn(followupCloseIoLeads, 'createSendFollowupMailFn').and.returnValue((done)->done())
        spyOn(followupCloseIoLeads, 'closeIoMailApiKeys').and.returnValue(['close_io_mail_key_1', 'close_io_mail_key_2'])


      it 'sends emails', (done) ->
        followupCloseIoLeads.sendSecondFollowupMails ->
          expect(followupCloseIoLeads.createSendFollowupMailFn).toHaveBeenCalled()
          done()

    describe 'createAddCallTaskFn', ->
      beforeEach ->
        spyOn(followupCloseIoLeads, 'sendMail')
        spyOn(followupCloseIoLeads, 'getTasksForLead').and.returnValue(factories.makeTasksResult(0))
        spyOn(followupCloseIoLeads, 'getActivityForLead').and.returnValue(factories.makeActivityResult({ auto1: true }))
        spyOn(followupCloseIoLeads, 'isTemplateAuto2').and.returnValue(true)
        spyOn(followupCloseIoLeads, 'postTask')

      fit 'creates a call task', (done) ->
        userApiKeyMap = {close_user_1: 'close_io_mail_key_1'}
        lead = factories.makeLead({ auto2: true })
        contactEmails = ['teacher1@example.com', 'teacher1.fullname@example.com']
        followupCloseIoLeads.createAddCallTaskFn(userApiKeyMap, moment().subtract(3, 'days'), lead, contactEmails)( =>
          expect(followupCloseIoLeads.postTask).toHaveBeenCalled()
          console.log followupCloseIoLeads.postTask.mostRecentCall
          done()
        )

    describe 'addCallTasks', ->

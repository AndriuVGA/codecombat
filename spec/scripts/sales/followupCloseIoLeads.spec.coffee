request = require '../request'
followupCloseIoLeads = require '../../../scripts/sales/followupCloseIoLeads'

describe '/scripts/sales/followupCloseIoLeads', ->

 describe "contactHasEmailAddress", ->
   beforeEach ->
     contacts = {
       withEmails: { emails: ['firstname.lastname@example.com', 'firstname.middle.lastname@example.com'] }
       withPhones: {}
       withoutEmailOrPhone: {}
     }


   it 'returns true if the contact has any email addresses', utils.wrap (done) ->
     expect(followupCloseIoLeads.contactHasEmailAddress(contact)).toBe(true)
     user = yield User.findById(@user.id)
     expect(user.get('email')).toBe('an@email.com')
     expect(user.get('name')).toBeUndefined()
     expect(user.get('points')).toBe(100) # make sure properties aren't removed
     done()

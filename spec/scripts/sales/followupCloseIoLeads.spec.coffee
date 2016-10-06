request = require '../../server/request'
followupCloseIoLeads = require '../../../scripts/sales/followupCloseIoLeads'

describe '/scripts/sales/followupCloseIoLeads', ->
  beforeEach ->
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
      expect(followupCloseIoLeads.contactHasEmailAddress(@contacts.withEmails)).toBe(true)

    it 'returns false if the contact has no email addresses', ->
      expect(followupCloseIoLeads.contactHasEmailAddress(@contacts.withoutEmailOrPhone)).toBe(false)

  describe 'contactHasPhoneNumbers', ->
    it 'returns true if the contact has any phone numbers', ->
      expect(followupCloseIoLeads.contactHasPhoneNumbers(@contacts.withPhones)).toBe(true)

    it 'returns false if the contact has no phone numbers', ->
      expect(followupCloseIoLeads.contactHasPhoneNumbers(@contacts.withoutEmailOrPhone)).toBe(false)

  describe 'lowercaseEmailsForContact', ->
    it 'returns a list of email addresses all in lower case', ->
      correctResult = ['firstname.lastname@example.com', 'firstname.middle.lastname@example.com']
      expect(followupCloseIoLeads.lowercaseEmailsForContact(@contacts.withEmails)).toEqual(correctResult)

// Follow up on Close.io leads

'use strict';
const wrap = require('co').wrap;
const async = require('async');
const request = require('request');
const Promise = require('bluebird');
Promise.promisifyAll(request);

const runAsScript = (process.argv.length === 7);
if (!runAsScript) {
  log("Usage: node <script> <Close.io general API key> <Close.io mail API key1> <Close.io mail API key2> <Close.io mail API key3>");
}

// TODO: Assumes 1:1 contact:email relationship (Close.io supports multiple emails for a single contact)
// TODO: Duplicate lead lookups when checking per-email (e.g. existing tasks)
// TODO: 2nd follow up email activity does not handle paged activity results
// TODO: sendMail copied from updateCloseIoLeads.js
// TODO: template values copied from updateCloseIoLeads.js
// TODO: status change is not related to specific lead contacts, e.g. lead_7fQAZKtX7tPYe352JpaUULVaVA99Ppq4HlsHXrRkpA9
// TODO: update status after adding a call task

const createTeacherEmailTemplatesAuto1 = ['tmpl_i5bQ2dOlMdZTvZil21bhTx44JYoojPbFkciJ0F560mn', 'tmpl_CEZ9PuE1y4PRvlYiKB5kRbZAQcTIucxDvSeqvtQW57G'];
const demoRequestEmailTemplatesAuto1 = [
  'tmpl_s7BZiydyCHOMMeXAcqRZzqn0fOtk0yOFlXSZ412MSGm', // (Auto1) Demo Request Long
  'tmpl_cGb6m4ssDvqjvYd8UaG6cacvtSXkZY3vj9b9lSmdQrf', // (Auto1) Demo Request Short
  'tmpl_2hV6OdOXtsObLQK9qlRdpf0C9QKbER06T17ksGYOoUE', // (Auto1) Demo Request With Questions
  'tmpl_Q0tweZ5H4xs2E489KwdYj3HET9PpzkQ7jgDQb9hOMTR', // (Auto1) Demo Request Without Questions
];
const createTeacherInternationalEmailTemplateAuto1 = 'tmpl_8vsXwcr6dWefMnAEfPEcdHaxqSfUKUY8UKq6WfReGqG';
const demoRequestInternationalEmailTemplateAuto1 = 'tmpl_nnH1p3II7G7NJYiPOIHphuj4XUaDptrZk1mGQb2d9Xa';
const createTeacherEmailTemplatesAuto2 = ['tmpl_pGPtKa07ioISupdSc1MAzNC57K40XoA4k0PI1igi8Ec', 'tmpl_AYAcviU8NQGLbMGKSp3EmcBLha0gQw4cHSOR55Fmoha'];
const demoRequestEmailTemplatesAuto2 = [
  'tmpl_dmnK7IVpkyYfPYAl1rChhm9lClH5lJ9pQAZoPr7cvLt', // (Auto2) Demo Request Long
  'tmpl_HJ5zebh1SqC1QydDto05VPUMu4F7i5M35Llq7bzgfTw', // (Auto2) Demo Request Short
  'tmpl_oMH8Gqsh3dPl17FsBrz8dIF14sfTiySASDkmzyRlpWg', // (Auto2) Demo Request With Questions
  'tmpl_JuuQsQhWNpDMYmN9rwD5Kk7oBELVZI4fMmJNUQC7A8j', // (Auto2) Demo Request Without Questions
];
const createTeacherInternationalEmailTemplatesAuto2 = ['tmpl_a6Syzzy6ri9MErfXQySM5UfaF5iNIv1VCArYowAEICT', 'tmpl_jOqWLgT0G19Eqs7qZaAeNwtiull7UrSX4ZuvkYRM2gC'];
const demoRequestInternationalEmailTemplatesAuto2 = ['tmpl_wz4SnDZMjNmAhp3MIuZaSMmjJTy5IW75Rcy3MYGb6Ti', 'tmpl_5oJ0YQMZFqNi3DgW7hplD6JS2zHqkB4Gt7Fj1u19Nks'];

if(runAsScript){
  const scriptStartTime = new Date();
  const closeIoApiKey = process.argv[2];
  const closeIoMailApiKeys = [process.argv[3], process.argv[4], process.argv[5], process.argv[6]]; // Automatic mails sent as API owners
}
const earliestDate = new Date();
earliestDate.setUTCDate(earliestDate.getUTCDate() - 10);

// ** Main program

if (runAsScript){
  async.series([
    sendSecondFollowupMails,
    addCallTasks
  // TODO: Cancel call tasks
  ],
  (err, results) => {
    if (err) console.error(err);
    log("Script runtime: " + (new Date() - scriptStartTime));
  });
}

// ** Utilities

function getRandomEmailTemplateAuto2(template) {
  if (createTeacherEmailTemplatesAuto1.indexOf(template) >= 0) {
    return getRandomEmailTemplate(createTeacherEmailTemplatesAuto2);
  }
  if (demoRequestEmailTemplatesAuto1.indexOf(template) >= 0) {
    return getRandomEmailTemplate(demoRequestEmailTemplatesAuto2);
  }
  if (createTeacherInternationalEmailTemplateAuto1 == template) {
    return getRandomEmailTemplate(createTeacherInternationalEmailTemplatesAuto2);
  }
  if (demoRequestInternationalEmailTemplateAuto1 === template) {
    return getRandomEmailTemplate(demoRequestInternationalEmailTemplatesAuto2);
  }
  return null;
}

function getRandomEmailTemplate(templates) {
  if (templates.length < 0) return null;
  return templates[Math.floor(Math.random() * templates.length)];
}

function isSameEmailTemplateType(template1, template2) {
  if (createTeacherEmailTemplatesAuto1.indexOf(template1) >= 0 && createTeacherEmailTemplatesAuto1.indexOf(template2) >= 0) {
    return true;
  }
  if (demoRequestEmailTemplatesAuto1.indexOf(template1) >= 0 && demoRequestEmailTemplatesAuto1.indexOf(template2) >= 0) {
    return true;
  }
  return false;
}

function isTemplateAuto1(template) {
  if (createTeacherEmailTemplatesAuto1.indexOf(template) >= 0) return true;
  if (demoRequestEmailTemplatesAuto1.indexOf(template) >= 0) return true;
  if (createTeacherInternationalEmailTemplateAuto1 == template) return true;
  if (demoRequestInternationalEmailTemplateAuto1 === template) return true;
  return false;
}

function isTemplateAuto2(template) {
  if (createTeacherEmailTemplatesAuto2.indexOf(template) >= 0) return true;
  if (demoRequestEmailTemplatesAuto2.indexOf(template) >= 0) return true;
  if (createTeacherInternationalEmailTemplatesAuto2.indexOf(template) >= 0) return true;
  if (demoRequestInternationalEmailTemplatesAuto2.indexOf(template) >= 0) return true;
  return false;
}

function log(str) {
  console.log(new Date().toISOString() + " " + str);
}

function contactHasEmailAddress(contact) {
  return Boolean(contact.emails && contact.emails.length > 0);
}

function contactHasPhoneNumbers(contact) {
  return Boolean(contact.phones && contact.phones.length > 0);
}

function lowercaseEmailsForContact(contact) {
  if (contactHasEmailAddress(contact)) {
    return contact.emails.map((e) => {return e.email.toLowerCase();});
  } else {
    return [];
  }
}

// ** Close.io network requests

const getJsonUrl = wrap(function*(url){
  const response = yield request.getAsync({url:url, json: true});
  return response.body;
})

const postJsonUrl = wrap(function*(options){
  const response = yield request.postAsync(options);
  if (response.body.errors || response.body['field-errors']) {
    throw(`ERROR: Close.io API returned an error.`);
  }
  return response.body;
})

const putJsonUrl = wrap(function*(options){
  const response = yield request.putAsync(options);
  if (response.body.errors || response.body['field-errors']) {
    throw(`ERROR: Close.io API returned an error.`);
  }
  return response.body;
})

function getSomeLeads (options) {
  const getParams = '?' + Object.keys(options).map((key) => {
    return `${key}=${encodeURIComponent(options[key])}`;
  }).join('&')
  const url = `https://${closeIoApiKey}:X@app.close.io/api/v1/lead/${getParams}`;
  return getJsonUrlAsync(url);
}

function getTasksForLead(lead) {
  const lead_id = lead.id || lead;
  const url = `https://${closeIoApiKey}:X@app.close.io/api/v1/task/?lead_id=${lead.id}`;
  return getJsonUrl(url);
}

function getEmailActivityForLead(lead) {
  const lead_id = lead.id || lead;
  const url = `https://${closeIoApiKey}:X@app.close.io/api/v1/activity/email/?lead_id=${lead.id}`;
  const activity = getJsonUrl(url);
  if (!activity) {
    throw(`ERROR: ${lead.id} has no activity!`); // TODO: sanity check
  } else if (activity.has_more) {
    throw(`ERROR: ${lead.id} has more activities than returned!`); // TODO: sanity check
  } else {
    return activity;
  }
}

function getActivityForLead(lead) {
  const lead_id = lead.id || lead;
  const url = `https://${closeIoApiKey}:X@app.close.io/api/v1/activity/?lead_id=${lead.id}`;
  const activity = getJsonUrl(url);
  if (activity.has_more) {
    throw(`ERROR: ${lead.id} has more activities than returned! Returning nothing instead.`);
  } else {
    return activity;
  }
}

function postEmailActivity(postData) {
  const options = {
    uri: `https://${emailApiKey}:X@app.close.io/api/v1/activity/email/`,
    json: postData
  };
  return postJsonUrl(options);
}

function postTask(postData) {
  const options = {
    uri: `https://${closeIoApiKey}:X@app.close.io/api/v1/task/`,
    json: postData
  };
  return postJsonUrl(options);
}

// ** Close.io logic

function sendMail(toEmail, leadId, contactId, template, emailApiKey, delayMinutes) {
  // console.log('DEBUG: sendMail', toEmail, leadId, contactId, template, emailApiKey, delayMinutes);

  // Check for previously sent email
  const data = getEmailActivityForLead(leadId)
  if (!data) { return };
  for (const emailData of data.data) {
    if (!isSameEmailTemplateType(emailData.template_id, template)) continue;
    for (const email of emailData.to) {
      if (email.toLowerCase() === toEmail.toLowerCase()) {
        console.log("ERROR: sending duplicate email:", toEmail, leadId, contactId, template, emailData.contact_id);
        return; //TODO: Do this checking outside of here instead of pretending we sent an email
      }
    }
  }

  // Send mail
  const dateScheduled = new Date();
  dateScheduled.setUTCMinutes(dateScheduled.getUTCMinutes() + delayMinutes);
  const postData = {
    to: [toEmail],
    contact_id: contactId,
    lead_id: leadId,
    template_id: template,
    status: 'scheduled',
    date_scheduled: dateScheduled
  };
  try {
    return postEmailActivity(postData);
  } catch (error) {
    throw(`Send email POST error for ${toEmail} ${leadId} ${contactId}`);
  }
}

function updateLeadStatus(lead, status) {
  // console.log(`DEBUG: updateLeadStatus ${lead.id} ${status}`);
  const putData = {status: status};
  const options = {
    uri: `https://${closeIoApiKey}:X@app.close.io/api/v1/lead/${lead.id}/`,
    json: putData
  };
  try {
    return putJsonUrl(options);
  } catch (error) {
    throw(`Update existing lead status PUT error for ${lead.id}`);
  }
}

function shouldSendNextAutoEmail(lead, contact) {
  const activity = getActivityForLead(lead);
  if(!activity) {
    console.log(`No activities found for lead ${lead.id} — will not try to sent more auto-emails.`);
    return false;
  }
  activity.data.sort((a,b) => { return new Date(a.date_updated) < new Date(b.date_updated) });
  const emails = activity.filter((act) => { return act._type === 'Email' });
  const emailAddresses = lowercaseEmailsForContact(contact);
  const they_have_replied = emails.some((emailData) => {
    return emailAddresses.some((emailAddress) => {
      return emailData.sender.match(new RegExp(emailAddress, 'i'));
    });
  });
  // TODO: Stop auto-emails if we send them an email or call them.
  // const we_have_sent_manually = emails.some(function(email){ return ??? });
  return !they_have_replied // && !we_have_sent_manually
}

function createSendFollowupMailFn(userApiKeyMap, latestDate, lead, contactEmails) {
  // Find first auto mail
  // Find activity since first auto mail
  // Send send auto mail of same template type (create or demo) from same user who sent first email
  // Update status to Auto Attempt 2 or New US Schools Auto Attempt 2
  return (done) => {
    // console.log("DEBUG: sendFollowupMail", lead.id);

    // Skip leads with tasks
    const tasks = module.exports.getTasksForLead(lead);
  
    if (!tasks || tasks.total_results > 0) { return done() }

    // Find all lead activities
    const activities = module.exports.getActivityForLead(lead);//TODO: use better variable names
    const auto1Emails = activities.data.filter((activity) => {
      return activity._type === 'Email'
             && contactEmails.indexOf(activity.to[0].toLowerCase()) >= 0
             && module.exports.isTemplateAuto1(activity.template_id);
    })
    if (auto1Emails.length > 1) {
      console.log(`ERROR: ${lead.id} sent multiple auto1 emails!?`);
      return done();
    }
    const firstMailActivity = auto1Emails[0];

    if (!firstMailActivity) {
      console.log(`ERROR: No first auto mail sent for ${lead.id}`);
      return done();
    }
    if (new Date(firstMailActivity.date_created) > latestDate) {
      // console.log(`First auto mail too recent ${firstMailActivity.date_created} ${lead.id}`);
      return done();
    }

    // Find activity since first auto mail, that's not email to a different contact's email
    const recentActivity = activities.data.find((activity) => {
      return activity.id !== firstMailActivity.id
             && activity._type === 'Email'
             && contactEmails.indexOf(activity.to[0].toLowerCase()) < 0
             && new Date(activity.date_created) >= new Date(firstMailActivity.date_created)
    })

    if (!recentActivity) {
      let template = module.exports.getRandomEmailTemplateAuto2(firstMailActivity.template_id);
      if (!template) {
        console.log(`ERROR: no auto2 template selected for ${lead.id} ${firstMailActivity.template_id}`);
        return done();
      }
      // console.log(`TODO: ${firstMailActivity.to[0]} ${lead.id} ${firstMailActivity.contact_id} ${template} ${userApiKeyMap[firstMailActivity.user_id]}`);
      module.exports.sendMail(firstMailActivity.to[0], lead.id, firstMailActivity.contact_id, template, userApiKeyMap[firstMailActivity.user_id], 0);

      // TODO: some sort of callback problem that stops the series here

      // TODO: manage this status mapping better
      const statusMap = {
        "Auto Attempt 1": "Auto Attempt 2",
        "New US Schools Auto Attempt 1": "New US Schools Auto Attempt 2",
        "Inbound AU Auto Attempt 1": "Inbound AU Auto Attempt 2",
        "Inbound Canada Auto Attempt 1": "Inbound Canada Auto Attempt 2",
        "Inbound NZ Auto Attempt 1": "Inbound NZ Auto Attempt 2",
        "Inbound UK Auto Attempt 1": "Inbound UK Auto Attempt 1 2",
      }
      const newStatus = statusMap[lead.status_label]
      if (newStatus) {
        return done(module.exports.updateLeadStatus(lead, newStatus));
      }
      else {
        console.log(`ERROR: unknown lead status ${lead.id} ${lead.status_label}`)
        return done();
      }
    }
    else {
      // console.log(`Found recent activity after auto1 mail for ${lead.id}`);
      // console.log(firstMailActivity.template_id, recentActivity);
      return done();
    }
  };
}

function sendSecondFollowupMails(done) {
  // Find all leads with auto 1 status, created since earliestDate
  // console.log("DEBUG: sendSecondFollowupMails");
  const userApiKeyMap = {};
  let createGetUserFn = (apiKey) => {
    return (done) => {
      const url = `https://${apiKey}:X@app.close.io/api/v1/me/`;
      request.get(url, (error, response, body) => {
        if (error) return done();
        const results = JSON.parse(body);
        userApiKeyMap[results.id] = apiKey;
        return done();
      });
    };
  }
  const tasks = [];
  for (const apiKey of closeIoMailApiKeys) {
    tasks.push(createGetUserFn(apiKey));
  }
  async.parallel(tasks, (err, results) => {
    if (err) console.log(err);
    const latestDate = new Date();
    latestDate.setUTCDate(latestDate.getUTCDate() - 3);
    // TODO: manage this status list better
    const query = `date_created > ${earliestDate.toISOString().substring(0, 19)} (lead_status:"Auto Attempt 1" or lead_status:"New US Schools Auto Attempt 1" or lead_status:"Inbound Canada Auto Attempt 1" or lead_status:"Inbound AU Auto Attempt 1" or lead_status:"Inbound NZ Auto Attempt 1" or lead_status:"Inbound UK Auto Attempt 1")`;
    const limit = 100;
    const nextPage = (skip) => {
      let has_more = false;
      getSomeLeads({ _skip: skip, _limit: limit, query: query }, (results) => {
        if (skip === 0) {
          console.log(`sendSecondFollowupMails total num leads ${results.total_results} has_more=${results.has_more}`);
        }
        has_more = results.has_more;
        const tasks = [];
        for (const lead of results.data) {
          // console.log(`DEBUG: ${lead.id}\t${lead.status_label}\t${lead.name}`);
          // if (lead.id !== 'lead_W9qq3oZHIAhUCHZkfj4MRcjQoBbgckV6r9HurMszye5') continue;
          for (const contact of (lead.contacts || [])) {
            if (contactHasEmailAddress(contact)) {
              if (shouldSendNextAutoEmail(lead, contact)) {
                const contactEmails = lowercaseEmailsForContact(contact);
                tasks.push(createSendFollowupMailFn(userApiKeyMap, latestDate, lead, contactEmails));
              }
              else {
                console.log(`Not sending auto-email to lead ${lead.id} contact ${contact.id}`);
              }
            }
            else {
              console.log(`ERROR: lead ${lead.id} contact ${contact.id} has no email`);
            }
          }
        }
        async.series(tasks, (err, results) => {
          if (err) return done(err);
          if (has_more) {
            return nextPage(skip + limit);
          }
          return done(err);
        });
      });
    };
    nextPage(0);
  });
}

function createAddCallTaskFn(userApiKeyMap, latestDate, lead, email) {
  // Check for activity since second auto mail and status update
  // Add call task
  const auto1Statuses = ["Auto Attempt 1", "New US Schools Auto Attempt 1", "Inbound Canada Auto Attempt 1", "Inbound AU Auto Attempt 1", "Inbound NZ Auto Attempt 1", "Inbound UK Auto Attempt 1"];
  const auto2Statuses = ["Auto Attempt 2", "New US Schools Auto Attempt 2", "Inbound Canada Auto Attempt 2", "Inbound AU Auto Attempt 2", "Inbound NZ Auto Attempt 2", "Inbound UK Auto Attempt 2"];
  return (done) => {
    // console.log("DEBUG: addCallTask", lead.id);

    // Skip leads with tasks
    const tasks = module.exports.getTasksForLead(lead);
    if (!tasks || tasks.total_results > 0) { return done(); }

    // Find all lead activities
    const results = getActivityForLead(lead);
    if (!results) { return done() };
    // Find second auto mail and status change
    let secondMailActivity;
    let statusUpdateActivity;
    for (const activity of results.data) {
      if (activity._type === 'Email' && activity.to[0] === email) {
        if (isTemplateAuto2(activity.template_id)) {
          if (secondMailActivity) {
              console.log(`ERROR: ${lead.id} sent multiple auto2 emails!?`);
              return done();
          }
          secondMailActivity = activity;
        }
      }
      else if (activity._type === 'LeadStatusChange' && auto1Statuses.indexOf(activity.old_status_label) >= 0
        && auto2Statuses.indexOf(activity.new_status_label) >= 0) {
          statusUpdateActivity = activity;
      }
    }

    if (!secondMailActivity) {
      // console.log(`DEBUG: No auto2 mail sent for ${lead.id} ${email}`);
      return done();
    }
    if (!statusUpdateActivity) {
      console.log(`ERROR: No status update for ${lead.id} ${email}`);
      return done();
    }
    if (new Date(secondMailActivity.date_created) > latestDate) {
      // console.log(`DEBUG: Second auto mail too recent ${secondMailActivity.date_created} ${lead.id}`);
      return done();
    }

    // Find activity since second auto mail and status update
    // Skip email to a different contact's email
    // Skip note about different contact
    let recentActivity;
    for (const activity of results.data) {
      if (activity.id === secondMailActivity.id) continue;
      if (activity.id === statusUpdateActivity.id) continue;
      if (new Date(secondMailActivity.date_created) > new Date(activity.date_created)) continue;
      if (new Date(statusUpdateActivity.date_created) > new Date(activity.date_created)) continue;
      if (activity._type === 'Note' && activity.note
        && activity.note.indexOf('demo_email') >= 0 && activity.note.indexOf(email) < 0) {
        // console.log(`DEBUG: Skipping ${lead.id} ${email} auto import note for different contact`);
        // console.log(activity.note);
        continue;
      }
      recentActivity = activity;
      break;
    }

    // Create call task
    if (!recentActivity) {
      console.log(`DEBUG: adding call task for ${lead.id} ${email}`);
      const postData = {
        _type: "lead",
        lead_id: lead.id,
        assigned_to: secondMailActivity.user_id,
        text: `Call ${email}`,
        is_complete: false
      };
      
      try {
        postTask(postData);
      } catch (error) {
        throw(`Create call task POST error for ${email} ${lead.id}`);
      }
    }
    else {
      // console.log(`DEBUG: Found recent activity after auto2 mail for ${lead.id} ${email}`);
      // console.log(recentActivity);
      return done();
    }
  }
}

function addCallTasks(done) {
  // Find all leads with auto 2 status, created since earliestDate
  // TODO: Very similar function to sendSecondFollowupMails
  // console.log("DEBUG: addCallTasks");
  const userApiKeyMap = {};
  let createGetUserFn = (apiKey) => {
    return (done) => {
      const url = `https://${apiKey}:X@app.close.io/api/v1/me/`;
      getJsonUrl(url, (results) => {
        if (!results) { return done() };
        userApiKeyMap[results.id] = apiKey;
        done()
      })
    };
  }
  const tasks = [];
  for (const apiKey of closeIoMailApiKeys) {
    tasks.push(createGetUserFn(apiKey));
  }
  async.parallel(tasks, (err, results) => {
    if (err) console.log(err);
    const latestDate = new Date();
    latestDate.setUTCDate(latestDate.getUTCDate() - 3);
    const query = `date_created > ${earliestDate.toISOString().substring(0, 19)} (lead_status:"Auto Attempt 2" or lead_status:"New US Schools Auto Attempt 2" or lead_status:"Inbound Canada Auto Attempt 2" or lead_status:"Inbound AU Auto Attempt 2" or lead_status:"Inbound NZ Auto Attempt 2" or lead_status:"Inbound UK Auto Attempt 2")`;
    const limit = 100;
    const nextPage = (skip) => {
      let has_more = false;
      getSomeLeads({ _skip: skip, _limit: limit, query: query }, (results) => {
        if (!results || !results.data) { return done() }
        if (skip === 0) {
          console.log(`addCallTasks total num leads ${results.total_results} has_more=${results.has_more}`);
        }
        has_more = results.has_more;
        const tasks = [];
        for (const lead of results.data) {
          // console.log(`${lead.id}\t${lead.status_label}\t${lead.name}`);
          // if (lead.id !== 'lead_foo') continue;
          for (const contact of (lead.contacts || [])) {
            if (contactHasEmailAddress(contact)) {
              if (contactHasPhoneNumbers(contact)) {
                tasks.push(createAddCallTaskFn(userApiKeyMap, latestDate, lead, contact.emails[0].email.toLowerCase()));
              }
            }
            else {
              console.log(`ERROR: lead ${lead.id} contact ${contact.id} has no email`);
            }
          }
          // if (tasks.length > 1) break;
        }
        async.series(tasks, (err, results) => {
          if (err) return done(err);
          if (has_more) {
            return nextPage(skip + limit);
          }
          return done(err);
        });
      });
    };
    nextPage(0);
  });
}

if(module) {module.exports = {
  getRandomEmailTemplateAuto2: getRandomEmailTemplateAuto2,
  getRandomEmailTemplate: getRandomEmailTemplate,
  isSameEmailTemplateType: isSameEmailTemplateType,
  isTemplateAuto1: isTemplateAuto1,
  isTemplateAuto2: isTemplateAuto2,
  log: log,
  contactHasEmailAddress: contactHasEmailAddress,
  contactHasPhoneNumbers: contactHasPhoneNumbers,
  lowercaseEmailsForContact: lowercaseEmailsForContact,
  getJsonUrl: getJsonUrl,
  postJsonUrl: postJsonUrl,
  putJsonUrl: putJsonUrl,
  getSomeLeads: getSomeLeads,
  getTasksForLead: getTasksForLead,
  getEmailActivityForLead: getEmailActivityForLead,
  getActivityForLead: getActivityForLead,
  postEmailActivity: postEmailActivity,
  postTask: postTask,
  sendMail: sendMail,
  updateLeadStatus: updateLeadStatus,
  shouldSendNextAutoEmail: shouldSendNextAutoEmail,
  createSendFollowupMailFn: createSendFollowupMailFn,
  sendSecondFollowupMails: sendSecondFollowupMails,
  createAddCallTaskFn: createAddCallTaskFn,
  addCallTasks: addCallTasks,
};}

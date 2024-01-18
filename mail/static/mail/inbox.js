document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    // ... do something else with email ...
    document.querySelector('#email-view').innerHTML = `
      <strong>From:</strong> ${email.sender}
      <br />
      <strong>To:</strong> ${email.recipients}
      <br />
      <strong>Subject:</strong> ${email.subject}
      <br />
      <strong>Timestamp:</strong> ${email.timestamp}
      <br />
      <button class="btn btn-sm btn-outline-primary" id="inbox">Reply</button>
      <br />
      <hr>
      ${email.body}
      <br />

    
    `;

    // read/unread
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })

    // archived/unarchived

    const button = document.createElement('button');
    button.className = email.archived ? 'btn btn-sm btn-outline-primary' : 'btn btn-sm btn-outline-danger';
    button.innerHTML = email.archived ? "Unarchive" : "Archive"
    button.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: !email.archived
        })
      })
    .then(() => { load_mailbox('archive') })
  });
    document.querySelector('#email-view').append(button);

    const btReply = document.createElement('button');
    btReply.className = 'btn btn-sm btn-outline-info';
    btReply.innerHTML = "Reply"
    btReply.addEventListener('click', () => {
      compose_email();

      document.querySelector('#compose-recipients').value = email.sender;
      let subject = email.subject;
      if(subject.split(' ',1)[0] != "Re:"){
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;
      document.querySelector('#compose-body').value = `On ${email.timestamp}, ${email.sender} wrote:
      ${email.body}`;

  });
    document.querySelector('#email-view').append(btReply);
});
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...
      emails.forEach(email => {
        const element = document.createElement('div');
        element.className = "list-group-item";
        element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="margin-right: 10px;">
                <strong>${email.sender}</strong>
            </div>
            ${email.subject}
            <div style="text-align: right;">
                ${email.timestamp}
            </div>
        </div>
    `;
    
    // change color
    element.style.backgroundColor = email.read ? 'gray' : 'white';

        element.addEventListener('click', function() {
          view_email(email.id);
        });
      document.querySelector('#emails-view').append(element);
      })


  });
}

function send_email(event) {
  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      load_mailbox('sent');
      console.log(result);
  });
  
}


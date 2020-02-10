/* moment */
document.addEventListener('DOMContentLoaded', function () {
  const currentDate = document.querySelector('.dateToday')
  currentDate.innerHTML = moment().format('dddd, MMM Do') // current day
  const container = document.querySelector('#container')
  const linkUrl = 'http://localhost:3000/notes' // link to json file
  const noteForm = document.querySelector('#note-form')
  let allNotes = []

  fetch(`${linkUrl}`) // fetch data from this link and make it readable in jsonfile
    .then(response => response.json())
    .then(data => data.forEach(function (note) {
      allNotes = data
      // add new html field for created notes
      container.innerHTML += ` 
      <div class="newNote" id=note-${note.id}>
        <h4>${note.title}</h4>
        <p>${note.description}</p>
        <button data-id=${note.id} id="edit-${note.id}" data-action="edit">Edit</button>
        <button data-id=${note.id} id="delete-${note.id}" data-action="delete">Delete</button>
      </div>
      <div id=edit-note-${note.id}>
      </div>`
    })) // end of note fetch

  noteForm.addEventListener('submit', (e) => { // event listener for adding new note  on submit form
    event.preventDefault() // prefent auto refresh of the page

    const titleInput = noteForm.querySelector('#title').value // input value
    const descInput = noteForm.querySelector('#description').value

    fetch(`${linkUrl}`, { // store new data to json file
      method: 'POST',
      body: JSON.stringify({
        title: titleInput,
        description: descInput,
        created: moment().format('MMM Do YY') // get current time using moment.js
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.json()) // post new note to our local data
      .then(note => {
        allNotes.push(note)
        container.innerHTML += `
        <div id=note-${note.id}>
          <h4>${note.title}</h4>
          <p>${note.description}</p>
          <button data-id=${note.id} id="edit-${note.id}" data-action="edit">Edit</button>
          <button data-id=${note.id} id="delete-${note.id}" data-action="delete">Delete</button>
        </div>
        <div id=edit-note-${note.id}>
        </div>`
      })
  }) // end of eventListener for adding a note

  container.addEventListener('click', (e) => { // onclick event listener if action = edit
    if (e.target.dataset.action === 'edit') {
      const editButton = document.querySelector(`#edit-${e.target.dataset.id}`)
      editButton.disabled = true

      const data = allNotes.find((note) => {
        return note.id == e.target.dataset.id
      })

      const editForm = container.querySelector(`#edit-note-${e.target.dataset.id}`) // edit form
      editForm.innerHTML = `
        <form class='form' id='edit-note' action='index.html' method='post'>
          <form id="note-form">
            <input class="edit-form" required id="edit-title" value="${data.title}">
            <input class="edit-form" required id="edit-description" value="${data.description}">
            <input type="submit" value="Edit note">
        </form>`

      editForm.addEventListener('submit', (e) => { // event Listener on editForm click
        event.preventDefault()

        const titleInput = document.querySelector('#edit-title').value
        const descInput = document.querySelector('#edit-description').value
        const editedNote = document.querySelector(`#note-${data.id}`)

        fetch(`${linkUrl}/${data.id}`, { // fetch url
          method: 'PUT',
          body: JSON.stringify({
            title: titleInput,
            description: descInput
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(response => response.json())
          .then(note => {
            editedNote.innerHTML = `
            <div id=note-${note.id}>
              <h4>${note.title}</h4>
              <p>${note.description}</p>
              <button data-id=${note.id} id="edit-${note.id}" data-action="edit">Edit</button>
              <button data-id=${note.id} id="delete-${note.id}" data-action="delete">Delete</button>
            </div>
            <div id=edit-note-${note.id}>
            </div>`
          })
      })
    } else if (e.target.dataset.action === 'delete') { // delete if action = delete
      document.querySelector(`#note-${e.target.dataset.id}`).remove()
      fetch(`${linkUrl}/${e.target.dataset.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(response => response.json())
    }
  })
})

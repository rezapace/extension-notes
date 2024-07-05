document.addEventListener('DOMContentLoaded', function() {
    const notesList = document.getElementById('notesList');
    const newNote = document.getElementById('newNote');
    const saveNote = document.getElementById('saveNote');

    // Load existing notes
    chrome.storage.sync.get(['notes'], function(result) {
        const notes = result.notes || [];
        notes.forEach(function(note) {
            addNoteToList(note);
        });
    });

    // Save new note
    function saveNewNote() {
        const noteText = newNote.value.trim();
        if (noteText) {
            chrome.storage.sync.get(['notes'], function(result) {
                const notes = result.notes || [];
                notes.unshift(noteText);  // Add new note to the beginning
                chrome.storage.sync.set({notes: notes}, function() {
                    addNoteToList(noteText, true);
                    newNote.value = '';
                });
            });
        }
    }

    saveNote.addEventListener('click', saveNewNote);

    newNote.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            saveNewNote();
        }
    });

    // Function to add a note to the list
    function addNoteToList(noteText, isNew = false) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';

        const noteContent = document.createElement('span');
        noteContent.textContent = noteText;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.innerHTML = '&times;';
        deleteButton.addEventListener('click', function(event) {
            event.stopPropagation();
            chrome.storage.sync.get(['notes'], function(result) {
                let notes = result.notes || [];
                notes = notes.filter(note => note !== noteText);
                chrome.storage.sync.set({notes: notes}, function() {
                    noteElement.remove();
                });
            });
        });

        noteElement.appendChild(noteContent);
        noteElement.appendChild(deleteButton);

        noteElement.addEventListener('click', function() {
            navigator.clipboard.writeText(noteText).then(function() {
                noteElement.style.backgroundColor = '#1f6feb';
                setTimeout(function() {
                    noteElement.style.backgroundColor = '';
                }, 200);
            }).catch(function(err) {
                console.error('Could not copy text: ', err);
            });
        });

        if (isNew) {
            noteElement.style.opacity = '0';
            noteElement.style.transform = 'translateY(-20px)';
        }

        if (isNew) {
            notesList.insertBefore(noteElement, notesList.firstChild);
            setTimeout(() => {
                noteElement.style.opacity = '1';
                noteElement.style.transform = 'translateY(0)';
            }, 10);
        } else {
            notesList.appendChild(noteElement);
        }
    }

    // Add transition styles for new notes
    const style = document.createElement('style');
    style.textContent = `
        .note {
            transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease;
        }
    `;
    document.head.appendChild(style);
});

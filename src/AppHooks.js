import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import React, { useEffect, useState } from 'react';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import {
    onCreateNote,
    onDeleteNote,
    onUpdateNote
} from './graphql/subscriptions';

const App = () => {
    const [id, setId] = useState('');
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        getNotes();
        const createNoteListener = API.graphql(
            graphqlOperation(onCreateNote)
        ).subscribe({
            next: noteData => {
                const newNote = noteData.value.data.onCreateNote;
                setNotes(prevNotes => {
                    const oldNotes = prevNotes.filter(
                        note => note.id !== newNote.id
                    );
                    const updatedNotes = [...oldNotes, newNote];
                    return updatedNotes;
                });
                setNote('');
            }
        });
        const deleteNoteListener = API.graphql(
            graphqlOperation(onDeleteNote)
        ).subscribe({
            next: noteData => {
                const deletedNote = noteData.value.data.onDeleteNote;
                setNotes(prevNotes => {
                    const updatedNotes = prevNotes.filter(
                        note => note.id !== deletedNote.id
                    );
                    return updatedNotes;
                });
            }
        });

        const updateNoteListener = API.graphql(
            graphqlOperation(onUpdateNote)
        ).subscribe({
            next: noteData => {
                const updatedNote = noteData.value.data.onUpdateNote;
                setNotes(prevNotes => {
                    const index = prevNotes.findIndex(note => note.id === updatedNote.id);
                    const updatedNotes = [
                        ...prevNotes.slice(0, index),
                        updatedNote,
                        ...prevNotes.slice(index + 1)
                    ];
                    return updatedNotes;
                });
                setNote('');
                setId('');
            }
        });

        return () => {
            createNoteListener.unsubscribe();
            deleteNoteListener.unsubscribe();
            updateNoteListener.unsubscribe();
        };
    }, []);

    const getNotes = async () => {
        const result = await API.graphql(graphqlOperation(listNotes));
        setNotes(result.data.listNotes.items);
    };

    const handleSetNote = ({ note, id }) => {
        setNote(note);
        setId(id);
    };

    const hasExistingNote = () => {
        if (id) {
            const isNote = notes.findIndex(note => note.id === id) > -1;
            return isNote;
        }
        return false;
    };

    const handleChangeNote = e => {
        setNote(e.target.value);
    };

    const handleAddNote = async e => {
        e.preventDefault();
        if (hasExistingNote()) {
            handleUpdateNote();
        } else {
            const input = { note };
            await API.graphql(graphqlOperation(createNote, { input }));
        }
    };

    const handleUpdateNote = async () => {
        const input = { id, note };
        await API.graphql(graphqlOperation(updateNote, { input }));
    };

    const handleDeleteNote = async noteId => {
        const input = { id: noteId };
        await API.graphql(graphqlOperation(deleteNote, { input }));
    };

    return (
        <div className="flex flex-column items-center justify-center pa3 bg-light-blue">
            <h1 className="code f2-l">Amplify Todo</h1>
            <form onSubmit={handleAddNote} className="mb3">
                <input
                    type="text"
                    className="pa2 f4"
                    placeholder="Write your note"
                    onChange={handleChangeNote}
                    value={note}
                />
                <button type="submit" className="pa2 f4">
                    {id ? 'Update' : 'Add'}
                </button>
            </form>

            {/* notes list */}
            <div>
                {notes.map(item => {
                    return (
                        <div key={item.id} className="flex items-center">
                            <li
                                onClick={() => handleSetNote(item)}
                                className="list pa1 f3"
                            >
                                {item.note}
                            </li>
                            <button
                                onClick={() => handleDeleteNote(item.id)}
                                className="bg-transparent bn f4"
                            >
                                <span>&times;</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default withAuthenticator(App, { includeGreetings: true });

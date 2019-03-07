import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import React, { Component } from 'react';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import { onCreateNote } from './graphql/subscriptions'

class App extends Component {
    state = {
        id: '',
        note: '',
        notes: []
    };

    componentDidMount = async () => {
        const result = await API.graphql(graphqlOperation(listNotes));
        this.setState({ notes: result.data.listNotes.items });
    };

    handleSetNote = ({ note, id }) => this.setState({ note, id });

    hasExistingNote = () => {
        const { id, notes } = this.state;
        if (id) {
            const isNote = notes.findIndex(note => note.id === id) > -1;
            return isNote;
        }
        return false;
    };

    handleChangeNote = e => {
        this.setState({ note: e.target.value });
    };

    handleAddNote = async e => {
        const { note, notes } = this.state;
        e.preventDefault();
        if (this.hasExistingNote()) {
            this.handleUpdateNote();
        } else {
            const input = { note };
            const result = await API.graphql(
                graphqlOperation(createNote, { input })
            );
            const newNote = result.data.createNote;
            const updatedNotes = [newNote, ...notes];
            this.setState({ notes: updatedNotes, note: '' });
        }
    };

    handleUpdateNote = async () => {
        const { id, note, notes } = this.state;
        const input = { id, note };
        const result = await API.graphql(
            graphqlOperation(updateNote, { input })
        );
        const updatedNote = result.data.updateNote;
        const index = notes.findIndex(note => note.id === id);
        const updatedNotes = [
            ...notes.slice(0, index),
            updatedNote,
            ...notes.slice(index + 1)
        ];
        this.setState({ notes: updatedNotes, note: '', id: '' });
    };

    handleDeleteNote = async noteId => {
        const { notes } = this.state;
        const input = { id: noteId };
        const result = await API.graphql(
            graphqlOperation(deleteNote, { input })
        );
        const deletedNoteId = result.data.deleteNote.id;
        const updatedNotes = notes.filter(note => note.id !== deletedNoteId);
        this.setState({ notes: updatedNotes });
    };

    render() {
        const { id, note, notes } = this.state;
        return (
            <div className="flex flex-column items-center justify-center pa3 bg-light-blue">
                <h1 className="code f2-l">Amplify Todo</h1>
                <form onSubmit={this.handleAddNote} className="mb3">
                    <input
                        type="text"
                        className="pa2 f4"
                        placeholder="Write your note"
                        onChange={this.handleChangeNote}
                        value={note}
                    />
                    <button type="submit" className="pa2 f4">
                        { id ? 'Update' : 'Add'}
                    </button>
                </form>

                {/* notes list */}
                <div>
                    {notes.map(item => {
                        return (
                            <div key={item.id} className="flex items-center">
                                <li
                                    onClick={() => this.handleSetNote(item)}
                                    className="list pa1 f3"
                                >
                                    {item.note}
                                </li>
                                <button
                                    onClick={() =>
                                        this.handleDeleteNote(item.id)
                                    }
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
    }
}

export default withAuthenticator(App, { includeGreetings: true });

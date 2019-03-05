import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import React, { Component } from 'react';
import { createNote, deleteNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

class App extends Component {
    state = {
        note: '',
        notes: []
    };

    componentDidMount = async () => {
        const result = await API.graphql(graphqlOperation(listNotes));
        this.setState({ notes: result.data.listNotes.items });
    };

    handleChangeNote = e => {
        this.setState({ note: e.target.value });
    };

    handleAddNote = async e => {
        const { note, notes } = this.state;
        e.preventDefault();
        const input = { note };
        const result = await API.graphql(
            graphqlOperation(createNote, { input })
        );
        const newNote = result.data.createNote;
        const updatedNotes = [newNote, ...notes];
        this.setState({ notes: updatedNotes, note: '' });
    };

    handleDeleteNote = async noteId => {
        const { notes } = this.state;
        const input = { id: noteId };
        const result = await API.graphql(
            graphqlOperation(deleteNote, { input })
        );
        const deletedNoteId = result.data.deleteNote.id;
        const updatedNotes = notes.filter(note => note.id !== deletedNoteId.id);
        this.setState({ notes: updatedNotes });
    };

    render() {
        const { note, notes } = this.state;
        return (
            <div className="flex flex-column items-center justify-center pa3 bg-light-blue">
                <h1 className="code f2-l">Amplify Notetaker</h1>
                <form onSubmit={this.handleAddNote} className="mb3">
                    <input
                        type="text"
                        className="pa2 f4"
                        placeholder="Write your note"
                        onChange={this.handleChangeNote}
                        value={note}
                    />
                    <button type="submit" className="pa2 f4">
                        Add Note
                    </button>
                </form>

                {/* notes list */}
                <div>
                    {notes.map(item => {
                        return (
                            <div key={item.id} className="flex items-center">
                                <li className="list pa1 f3">{item.note}</li>
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
                {this.state.note}
            </div>
        );
    }
}

export default withAuthenticator(App, { includeGreetings: true });

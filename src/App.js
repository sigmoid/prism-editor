import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import DialogueEditor from './Components/DialogueEditor';
import MapEditor from './Components/MapEditor';

const App = () =>
{
  const [currentView, setCurrentView] = useState();

  const renderCurrentView = () => {
    if (currentView === "dialogue")
      return <DialogueEditor></DialogueEditor>
    if (currentView === "map")
      return <MapEditor></MapEditor>
  }
  return (
    <div className="App">
      <header className="App-header">
        <header>
          <button className="btn btn-primary m-2" onClick={() => setCurrentView('map')}>Map Editor</button>
          <button className="btn btn-primary m-2" onClick={() => setCurrentView('dialogue')}>Dialogue Editor</button>
          <hr/>
        </header>
        {renderCurrentView()}
      </header>
    </div>
  );
}

export default App;
